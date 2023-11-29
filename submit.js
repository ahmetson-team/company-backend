const { ethers } = require('ethers');
require('dotenv').config();


// Paste your ABI here
const abi = [{
        "anonymous": false,
        "inputs": [{
                "indexed": false,
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_clickCounts",
                "type": "uint256"
            }
        ],
        "name": "Click",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "click",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "clickCounts",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    }
];


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

// Function to interact with the contract
async function interactWithContract() {
    try {
        const tx = await contract.click();
        await tx.wait();

        console.log('Transaction Hash:', tx.hash);
        console.log(`View the transaction on Etherscan: ${explorerURL}${tx.hash}`);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}


// Call the function to interact with the contract
interactWithContract();