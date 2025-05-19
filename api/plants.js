const express = require('express');
const router = express.Router();
const { fetchDataFromGitHub, saveDataToGitHub } = require('../utils/githubData');
const auth = require('./middleware/auth');

console.log('[api/plants.js] Initializing simplified plants router...');

// Get all plants
router.get('/', (req, res) => {
  console.log('[api/plants.js] GET / request received by simplified router');
  res.json({ message: 'Simplified plants GET endpoint A-OK!' });
});

// Get plant by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    const plant = (data.plants || []).find(plant => plant.id == req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get plants by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    const plants = (data.plants || []).filter(plant => plant.category == req.params.categoryId);
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get low stock plants
router.get('/admin/low-stock', auth, async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    const lowStock = (data.plants || []).filter(p => p.stock > 0 && p.stock < 5);
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching low stock plants' });
  }
});

// Get popular plants
router.get('/admin/popular', auth, async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    const popular = (data.plants || [])
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 10);
    res.json(popular);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching popular plants' });
  }
});

// POST create new plant
router.post('/', auth, async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    const newPlant = { id: Date.now().toString(), ...req.body };
    data.plants = data.plants || [];
    data.plants.push(newPlant);
    await saveDataToGitHub(data);
    res.status(201).json(newPlant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update plant
router.put('/:id', auth, async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    const idx = (data.plants || []).findIndex(plant => plant.id == req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Plant not found' });
    data.plants[idx] = { ...data.plants[idx], ...req.body };
    await saveDataToGitHub(data);
    res.json(data.plants[idx]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update plant stock
router.patch('/:id/stock', auth, async (req, res) => {
  try {
    if (typeof req.body.stock === 'undefined') return res.status(400).json({ message: 'Stock value is required' });
    const data = await fetchDataFromGitHub();
    const idx = (data.plants || []).findIndex(plant => plant.id == req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Plant not found' });
    data.plants[idx].stock = req.body.stock;
    await saveDataToGitHub(data);
    res.json(data.plants[idx]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE plant
router.delete('/:id', auth, async (req, res) => {
  try {
    const data = await fetchDataFromGitHub();
    const idx = (data.plants || []).findIndex(plant => plant.id == req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Plant not found' });
    data.plants.splice(idx, 1);
    await saveDataToGitHub(data);
    res.json({ message: 'Plant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

console.log('[api/plants.js] Simplified plants router created, typeof:', typeof router, 'has stack:', !!(router && router.stack));

module.exports = router; 