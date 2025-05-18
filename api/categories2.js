const express = require('express');
const router = express.Router();
const data = require('../data.json');

// Get all categories
router.get('/', (req, res) => {
  res.json(data.categories || []);
});

// Get category by ID
router.get('/:id', (req, res) => {
  const category = (data.categories || []).find(c => c._id == req.params.id);
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

module.exports = router; 