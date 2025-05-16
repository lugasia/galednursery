const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Plant = require('../models/Plant');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for icon uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/categories';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `category-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|svg|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
});

// Create new category (admin only)
router.post('/', auth, upload.single('icon'), async (req, res) => {
  try {
    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: req.body.name,
      isActive: true
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    const categoryData = {
      name: req.body.name
    };
    
    if (req.file) {
      categoryData.icon = req.file.path;
    }
    
    const category = new Category(categoryData);
    const savedCategory = await category.save();
    
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update category (admin only)
router.put('/:id', auth, upload.single('icon'), async (req, res) => {
  try {
    // Check if another category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: req.body.name,
      _id: { $ne: req.params.id },
      isActive: true
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Another category with this name already exists' });
    }
    
    const categoryData = {
      name: req.body.name
    };
    
    if (req.file) {
      categoryData.icon = req.file.path;
      
      // Delete old icon if exists
      const oldCategory = await Category.findById(req.params.id);
      if (oldCategory && oldCategory.icon && oldCategory.icon !== 'default-category.png') {
        fs.unlink(oldCategory.icon, (err) => {
          if (err) console.error('Failed to delete old icon:', err);
        });
      }
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      categoryData,
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete category (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if any plants are using this category
    const plantCount = await Plant.countDocuments({ 
      category: req.params.id,
      isActive: true
    });
    
    if (plantCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that has plants. Please reassign or delete the plants first.',
        plantCount
      });
    }
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Soft delete - just mark as inactive
    category.isActive = false;
    await category.save();
    
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
