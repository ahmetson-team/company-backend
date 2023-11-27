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
const infuraApiKey = 'https://sepolia.infura.io/v3/6dc016e17bbb4530958e787999eed7c9'; // Replace with your Infura API key

async function listenToClickEvents() {
    try {
        const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/6dc016e17bbb4530958e787999eed7c9`);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        console.log('Listening for Click events... Press Ctrl + C to stop.');

        // Continuously listen for new 'Click' events
        contract.on('Click', async(owner, clickCounts, event) => {
            try {
                console.log(`New Click Event - Owner: ${owner}, Click Counts: ${clickCounts}`);

                // Fetch transaction details using log's getTransactionReceipt method
                const receipt = await event.getTransactionReceipt();
                if (receipt) {
                    console.log('Transaction Details:', receipt);
                } else {
                    console.log('Transaction details not available for the event');
                }
            } catch (error) {
                console.error('Error fetching transaction details:', error);
            }
        });


        // Sleep for 10 seconds before fetching blockchain again
        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1); // Exit the process on error
    }
}

// Start listening to events
listenToClickEvents().catch(console.error);