const express = require('express');
const app = express();

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

// Start the server on port 3001 (or any desired port)
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});