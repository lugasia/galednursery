const express = require('express');
const router = express.Router();

// Get all orders
router.get('/', (req, res) => {
  try {
    const orders = req.data.orders || [];
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Create new order
router.post('/', (req, res) => {
  try {
    const newOrder = {
      id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Add to data
    if (!req.data.orders) req.data.orders = [];
    req.data.orders.push(newOrder);
    
    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

module.exports = router; 