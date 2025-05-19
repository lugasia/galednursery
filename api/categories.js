const express = require('express');
const router = express.Router();
const { fetchDataFromGitHub } = require('../utils/githubData');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    res.json(data.categories || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET category by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    const category = (data.categories || []).find(cat => cat.id == req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new category
router.post('/', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 