const express = require('express');
const router = express.Router();
const { fetchDataFromGitHub, saveDataToGitHub } = require('../utils/githubData');
const auth = require('./middleware/auth');

// Get all orders (protected)
router.get('/', auth, async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    res.json(data.orders || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new order (public)
router.post('/', async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    const newOrder = {
      id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    data.orders = data.orders || [];
    data.orders.push(newOrder);
    await saveDataToGitHub(data);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 