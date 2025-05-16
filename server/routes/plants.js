const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/plants';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `plant-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get all plants (public)
router.get('/', async (req, res) => {
  try {
    const plants = await Plant.find({ isActive: true })
      .populate('category', 'name icon')
      .sort({ name: 1 });
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single plant by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id)
      .populate('category', 'name icon');
    
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    
    res.json(plant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new plant (admin only)
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

// Update plant (admin only)
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
    
    // Update imageBase64 if provided
    if (req.body.imageBase64) {
      plantData.imageBase64 = req.body.imageBase64;
    }
    
    const updatedPlant = await Plant.findByIdAndUpdate(
      req.params.id,
      plantData,
      { new: true, runValidators: true }
    );
    
    if (!updatedPlant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    
    res.json(updatedPlant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update stock only (admin only)
router.patch('/:id/stock', auth, async (req, res) => {
  try {
    if (!req.body.stock && req.body.stock !== 0) {
      return res.status(400).json({ message: 'Stock value is required' });
    }
    
    const updatedPlant = await Plant.findByIdAndUpdate(
      req.params.id,
      { stock: req.body.stock },
      { new: true, runValidators: true }
    );
    
    if (!updatedPlant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    
    res.json(updatedPlant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete plant (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    
    // Soft delete - just mark as inactive
    plant.isActive = false;
    await plant.save();
    
    res.json({ message: 'Plant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get plants with low stock (admin only)
router.get('/admin/low-stock', auth, async (req, res) => {
  try {
    const lowStockThreshold = 5;
    const plants = await Plant.find({ stock: { $lt: lowStockThreshold }, isActive: true })
      .populate('category', 'name')
      .sort({ stock: 1 });
    
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get popular plants
router.get('/admin/popular', auth, async (req, res) => {
  try {
    const plants = await Plant.find({ isActive: true })
      .sort({ popularity: -1 })
      .limit(10)
      .populate('category', 'name');
    
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
