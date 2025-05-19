const express = require('express');
const router = express.Router();
const { fetchDataFromGitHub, saveDataToGitHub } = require('../utils/githubData');

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
    const data = await fetchDataFromGitHub();
    const newCategory = { id: Date.now().toString(), ...req.body };
    data.categories = data.categories || [];
    data.categories.push(newCategory);
    await saveDataToGitHub(data);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    const idx = (data.categories || []).findIndex(cat => cat.id == req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Category not found' });
    data.categories[idx] = { ...data.categories[idx], ...req.body };
    await saveDataToGitHub(data);
    res.json(data.categories[idx]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    const idx = (data.categories || []).findIndex(cat => cat.id == req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Category not found' });
    data.categories.splice(idx, 1);
    await saveDataToGitHub(data);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 