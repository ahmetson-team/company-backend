const express = require('express');
const { ethers } = require('ethers');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');


require('dotenv').config();


// Paste your ABI here
// Load the ABI JSON file
const abiJson = fs.readFileSync('./Loyalty.json', 'utf8');
const abi = JSON.parse(abiJson);


const contractAddress = process.env.CONTRACT_ADDRESS; // Replace with the deployed contract address
const privateKey = process.env.PRIVATE_KEY; // Replace with the private key of the account interacting with the contract
const url = process.env.URL;
const explorerURL = process.env.EXPLORER_URL;



// Connect to the Ethereum network using Infura
const provider = new ethers.JsonRpcProvider(url);

// Create a wallet instance
const wallet = new ethers.Wallet(privateKey, provider);

// Connect to the contract
const contract = new ethers.Contract(contractAddress, abi, wallet);


// Parse incoming JSON requests
app.use(bodyParser.json());


// Mock loyalty points data (replace with actual logic to fetch points for product IDs)
const loyaltyPoints = {
    'product_id_1': 100,
    'product_id_2': 150,
    // Add more product IDs and their respective loyalty points
};

// Define GET endpoint for fetching loyalty points
app.get('/shop/price/:product_id', (req, res) => {
    const productId = req.params.product_id;

    // Check if the product ID exists in the loyalty points data
    if (loyaltyPoints[productId]) {
        res.json({ loyalty_point: loyaltyPoints[productId] });
    } else {
        res.status(404).json({ error: 'Product ID not found' });
    }
});

// Define the endpoint to receive user data
app.post('/receive-user-data', (req, res) => {
    // Retrieve data from the request body
    const { user_address, receipt_id, credential_id, user_data } = req.body;

    // Perform operations with the received data (logic to process user data)
    // For now, just send back a success response with loyalty points
    const loyaltyPoints = 100;
    res.json({ loyalty_points: loyaltyPoints });
});



//announceLoyaltyPoints(address user,bytes32 receiptId,uint256 points,uint64 credentialId)

// Define the endpoint to announce loyalty points
app.get('/announce-loyalty-points/:loyalty_points/:user/:credential_id/:receipt_id', async(req, res) => {
    try {
        const { loyalty_points, user, credential_id, receipt_id } = req.params;


        // Convert receipt_id to bytes32 hash
        const receiptUtf8Bytes = ethers.toUtf8Bytes(receipt_id);
        const receiptBytes = ethers.keccak256(receiptUtf8Bytes);


        console.log('trying to announce');
        // Submit data to the smart contract
        const result = await contract
            .announceLoyaltyPoints(user, receiptBytes, parseInt(loyalty_points), parseInt(credential_id))

        // Log the transaction ID
        console.log('Transaction ID:', result.hash);

        res.json({ success: true, transaction_id: result.hash });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error submitting data to the blockchain' });
    }
});


// Start the server on port 3001 (or any desired port)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});