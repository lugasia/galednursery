import dbConnect from '../../utils/dbConnect';
import Category from '../../models/Category';
import authenticate from '../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      const categories = await Category.find({ isActive: true }).sort({ name: 1 });
      res.status(200).json(categories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'POST') {
    try {
      authenticate(req, res);
      const { name, iconBase64 } = req.body;
      const existingCategory = await Category.findOne({ name, isActive: true });
      if (existingCategory) return res.status(400).json({ message: 'Category with this name already exists' });
      const categoryData = { name };
      if (iconBase64) categoryData.icon = iconBase64;
      const category = new Category(categoryData);
      const savedCategory = await category.save();
      res.status(201).json(savedCategory);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 