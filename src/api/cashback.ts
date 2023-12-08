import * as fs from 'fs';
import express from 'express';
import { ethers } from 'ethers';
import MessageResponse from '../interfaces/MessageResponse';
import ErrorResponse from '../interfaces/ErrorResponse';


require('dotenv').config();


// Paste your ABI here
// Load the ABI JSON file
const abiJson = fs.readFileSync('./Loyalty.json', 'utf8');
const abi = JSON.parse(abiJson);


const router = express.Router();

const contractAddress = process.env.LOYALTY_CONTRACT_ADDRESS as string; // Replace with the deployed contract address
const privateKey = process.env.PRIVATE_KEY as string; // Replace with the private key of the account interacting with the contract
const url = process.env.URL as string;
// const explorerURL = process.env.EXPLORER_URL;



// Connect to the Ethereum network using Infura
const provider = new ethers.JsonRpcProvider(url);

// Create a wallet instance
const wallet = new ethers.Wallet(privateKey, provider);

// Connect to the contract
const contract = new ethers.Contract(contractAddress, abi, wallet);


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
  // Retrieve data from the request body
  const { user_data } = req.body;

    // For now, just send back a success response with loyalty points
    const loyaltyPoints = 100;
    res.json({
      loyalty_points: loyaltyPoints,
      message: 'ok',
    });
});



//announceLoyaltyPoints(address user,bytes32 receiptId,uint256 points,uint64 credentialId)

// Define the endpoint to announce loyalty points
router.get<{ loyaltyPoints: string, user: string, credentialId: string, receiptId: string }, MessageResponse & { transaction_id: string, success: boolean } | ErrorResponse>('/announce-loyalty-points/:loyaltyPoints/:user/:credentialId/:receiptId', async (req, res) => {
  try {
    const { loyaltyPoints, user, credentialId, receiptId } = req.params;


    // Convert receipt_id to bytes32 hash
    const receiptUtf8Bytes = ethers.toUtf8Bytes(receiptId);
    const receiptBytes = ethers.keccak256(receiptUtf8Bytes);


    console.log('trying to announce');
    // Submit data to the smart contract
    const result = await contract
      .announceLoyaltyPoints(user, receiptBytes, parseInt(loyaltyPoints), parseInt(credentialId));

    // Log the transaction ID
    console.log('Transaction ID:', result.hash);

    res.json({ success: true, transaction_id: result.hash, message: 'ok' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error submitting data to the blockchain', stack: 'Blockchain' });
  }
});

export default router;

