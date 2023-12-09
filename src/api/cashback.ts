import * as fs from 'fs';
import express from 'express';
import { verify } from '../verify';
import { ethers } from 'ethers';
import type { ZeroKnowledgeProofResponse } from '@0xpolygonid/js-sdk';
import MessageResponse from '../interfaces/MessageResponse';
import ErrorResponse from '../interfaces/ErrorResponse';
import { decrypt, Ecies } from "eccrypto";

require('dotenv').config();

type PassedEcies = {
  iv: string;
  ephemPublicKey: string;
  ciphertext: string;
  mac: string;
};


// Paste your ABI here
// Load the ABI JSON file
const abiJson = fs.readFileSync('./Loyalty.json', 'utf8');
const abi = JSON.parse(abiJson);


const router = express.Router();

const contractAddress = process.env.LOYALTY_CONTRACT_ADDRESS as string; // Replace with the deployed contract address
const privateKey = process.env.PRIVATE_KEY as string; // Replace with the private key of the account interacting with the contract
const ethUrl = process.env.ETH_URL as string;
const polygonUrl = process.env.POLYGON_URL as string;
// const explorerURL = process.env.EXPLORER_URL;

const acc = new ethers.Wallet(process.env.PRIVATE_KEY!);
const privateKeyBuffer = Buffer.from(acc.signingKey.privateKey.substring(2), "hex");

// Connect to the Ethereum network using Infura
const ethProvider = new ethers.JsonRpcProvider(ethUrl);
const polygonProvider = new ethers.JsonRpcProvider(polygonUrl);

// Create a wallet instance
const ethWallet = new ethers.Wallet(privateKey, ethProvider);
const polygonWallet = new ethers.Wallet(privateKey, polygonProvider);

// Connect to the contract
const contract = new ethers.Contract(contractAddress, abi, ethWallet);


// Mock loyalty points data (replace with actual logic to fetch points for product IDs)
const loyaltyPointsMapping = new Map<string, number>([
  ['product_id_1', 100],
  ['product_id_2', 150],
  // Add more product IDs and their respective loyalty points
]);

// Define GET endpoint for fetching loyalty points
router.get('/shop/price/:product_id', (req, res) => {
  const productId = req.params.product_id;

  // Check if the product ID exists in the loyalty points data
  if (loyaltyPointsMapping.get(productId)) {
    res.json({ loyalty_point: loyaltyPointsMapping.get(productId) });
  } else {
    res.status(404).json({ error: 'Product ID not found' });
  }
});

// Define the endpoint to receive user data
router.post<{}, MessageResponse & { loyalty_points: number }>('/receive-user-data', async (req, res) => {
  console.log(`Received the user data`, req.body);
  // Retrieve data from the request body
  let { user_data: cipherText } = req.body;

  if ( typeof cipherText !== "string" ) {
    return res.status(500);
  }

  const passedCipher = JSON.parse(cipherText) as PassedEcies;
  console.log(passedCipher.ciphertext);

  let cipherToDecrypt: Ecies = {
    mac: Buffer.from(passedCipher.mac.substring(2), "hex"),
    ciphertext: Buffer.from(passedCipher.ciphertext.substring(2), "hex"),
    ephemPublicKey: Buffer.from(passedCipher.ephemPublicKey.substring(2), "hex"),
    iv: Buffer.from(passedCipher.iv.substring(2), "hex"),
  }

  let user_data: any = await decrypt(privateKeyBuffer, cipherToDecrypt);
  user_data = JSON.parse(user_data.toString());

  // Perform operations with the received data (logic to process user data)
  if (await verify(user_data as ZeroKnowledgeProofResponse)) {
    // For now, just send back a success response with loyalty points
    const loyaltyPoints = 100;
    res.json({
      loyalty_points: loyaltyPoints,
      message: 'ok',
    });
  } else {
    res.status(500);
  }
});



//announceLoyaltyPoints(address user,bytes32 receiptId,uint256 points,uint64 credentialId)

// Define the endpoint to announce loyalty points
router.get<{ loyaltyPoints: string, user: string, credentialId: string, receiptId: string }, MessageResponse & { transaction_id: string, success: boolean } | ErrorResponse>('/announce-loyalty-points/:loyaltyPoints/:user/:credentialId/:receiptId', async (req, res) => {
  try {
    const { loyaltyPoints, user, credentialId, receiptId } = req.params;

    const receiptIdStr = receiptId.length > 32 ? receiptId.substring(0, 32) : receiptId;
    // Convert receipt_id to bytes32 hash
    const receiptUtf8Bytes = ethers.toUtf8Bytes(receiptIdStr);
    const receiptBytes = ethers.zeroPadBytes(ethers.hexlify(receiptUtf8Bytes), 32);


    // Send coins to user if balance === 0
    const ethUserBalance = parseFloat(ethers.formatEther(await ethProvider.getBalance(user)));
    const polygonUserBalance = parseFloat(ethers.formatEther(await polygonProvider.getBalance(user)));

    if (ethUserBalance === 0) {
      await ethWallet.sendTransaction({
        to: user,
        value: ethers.parseEther('0.001'),
      });
    }

    if (polygonUserBalance === 0) {
      await polygonWallet.sendTransaction({
        to: user,
        value: ethers.parseEther('0.001'),
      });
    }

    console.log('trying to announce');
    // Submit data to the smart contract
    const result = await contract
      .announceLoyaltyPoints(user, receiptBytes, parseInt(loyaltyPoints), parseInt(credentialId), acc.signingKey.compressedPublicKey);

    // Log the transaction ID
    console.log('Transaction ID:', result.hash);

    res.json({ success: true, transaction_id: result.hash, message: 'ok' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error submitting data to the blockchain', stack: 'Blockchain' });
  }
});

export default router;

