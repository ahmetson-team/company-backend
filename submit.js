const { ethers } = require('ethers');

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
    // ... (Paste your ABI here)
];

const contractAddress = '0x4eF0ec70773C387028a54F902e06ab5Bd2262b03'; // Replace with the deployed contract address
const privateKey = '0x045dc7f4f349789ea1efe32613a2c1f690bdcec40cd73ad826fe464e1bc8b9e3'; // Replace with the private key of the account interacting with the contract
const infuraApiKey = 'https://sepolia.infura.io/v3/6dc016e17bbb4530958e787999eed7c9'; // Replace with your Infura API key

// Connect to the Ethereum network using Infura
const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/6dc016e17bbb4530958e787999eed7c9`);

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
        console.log(`View the transaction on Etherscan: https://rinkeby.etherscan.io/tx/${tx.hash}`);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

// Call the function to interact with the contract
interactWithContract();