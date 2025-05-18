const express = require('express');
const router = express.Router();
const data = require('../data.json');
const auth = require('./middleware/auth');

// Get all plants
router.get('/', (req, res) => {
  try {
    res.json(data.plants || []);
  } catch (err) {
    console.error('Error fetching plants:', err);
    res.status(500).json({ message: 'Error fetching plants' });
  }
});

// Get plant by ID
router.get('/:id', (req, res) => {
  try {
    const plant = (data.plants || []).find(p => p._id == req.params.id);
    if (plant) {
      res.json(plant);
    } else {
      res.status(404).json({ message: 'Plant not found' });
    }
  } catch (err) {
    console.error('Error fetching plant:', err);
    res.status(500).json({ message: 'Error fetching plant' });
  }
});

// Get low stock plants
router.get('/admin/low-stock', auth, (req, res) => {
  try {
    const lowStock = (data.plants || []).filter(p => p.stock > 0 && p.stock < 5);
    res.json(lowStock);
  } catch (err) {
    console.error('Error fetching low stock plants:', err);
    res.status(500).json({ message: 'Error fetching low stock plants' });
  }
});

// Get popular plants
router.get('/admin/popular', auth, (req, res) => {
  try {
    const popular = (data.plants || [])
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 10);
    res.json(popular);
  } catch (err) {
    console.error('Error fetching popular plants:', err);
    res.status(500).json({ message: 'Error fetching popular plants' });
  }
});

// PUT /api/plants/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const plantData = {
      name: req.body.name,
      category: req.body.category,
      height: req.body.height,
      watering: req.body.watering,
      light: req.body.light,
      uses: req.body.uses,
      description: req.body.description,
      stock: req.body.stock
    };
    if (req.body.imageBase64) plantData.imageBase64 = req.body.imageBase64;
    const updatedPlant = await Plant.findByIdAndUpdate(req.params.id, plantData, { new: true, runValidators: true });
    if (!updatedPlant) return res.status(404).json({ message: 'Plant not found' });
    res.status(200).json(updatedPlant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/plants/:id/stock
router.patch('/:id/stock', auth, async (req, res) => {
  try {
    if (typeof req.body.stock === 'undefined') return res.status(400).json({ message: 'Stock value is required' });
    const updatedPlant = await Plant.findByIdAndUpdate(req.params.id, { stock: req.body.stock }, { new: true, runValidators: true });
    if (!updatedPlant) return res.status(404).json({ message: 'Plant not found' });
    res.status(200).json(updatedPlant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/plants/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    plant.isActive = false;
    await plant.save();
    res.status(200).json({ message: 'Plant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/plants
router.post('/', auth, async (req, res) => {
  try {
    const plantData = {
      name: req.body.name,
      category: req.body.category,
      height: req.body.height,
      watering: req.body.watering,
      light: req.body.light,
      uses: req.body.uses,
      description: req.body.description,
      stock: req.body.stock,
      imageBase64: req.body.imageBase64 || ''
    };
    const plant = new Plant(plantData);
    const savedPlant = await plant.save();
    res.status(201).json(savedPlant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 