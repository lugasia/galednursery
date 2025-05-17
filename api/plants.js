const express = require('express');
const router = express.Router();
const Plant = require('./models/Plant');
const auth = require('./middleware/auth');

// GET /api/plants/admin/low-stock
router.get('/admin/low-stock', auth, async (req, res) => {
  try {
    const lowStockThreshold = 5;
    const plants = await Plant.find({ stock: { $lt: lowStockThreshold }, isActive: true })
      .populate('category', 'name')
      .sort({ stock: 1 });
    res.status(200).json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/plants/admin/popular
router.get('/admin/popular', auth, async (req, res) => {
  try {
    const plants = await Plant.find({ isActive: true })
      .sort({ popularity: -1 })
      .limit(10)
      .populate('category', 'name');
    res.status(200).json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/plants/:id
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id).populate('category', 'name icon');
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    res.status(200).json(plant);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

// GET /api/plants
router.get('/', async (req, res) => {
  try {
    const plants = await Plant.find({ isActive: true })
      .populate('category', 'name icon')
      .sort({ name: 1 });
    res.status(200).json(plants);
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