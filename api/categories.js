const express = require('express');
const router = express.Router();
const Category = require('./models/Category');
const Plant = require('./models/Plant');
const auth = require('./middleware/auth');

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching categories...');
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    console.log(`Found ${categories.length} categories`);
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ 
      message: 'Error fetching categories',
      error: err.message 
    });
  }
});

// Get single category by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (err) {
    console.error('Error fetching category:', err);
    res.status(500).json({ 
      message: 'Error fetching category',
      error: err.message 
    });
  }
});

// Get plants by category (public)
router.get('/:id/plants', async (req, res) => {
  try {
    const plants = await Plant.find({ 
      category: req.params.id,
      isActive: true
    }).sort({ name: 1 });
    
    res.json(plants);
  } catch (err) {
    console.error('Error fetching plants by category:', err);
    res.status(500).json({ 
      message: 'Error fetching plants by category',
      error: err.message 
    });
  }
});

module.exports = router; 