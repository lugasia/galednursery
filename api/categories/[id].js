import dbConnect from '../../utils/dbConnect';
import Category from '../../models/Category';
import Plant from '../../models/Plant';
import authenticate from '../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  if (req.method === 'GET') {
    try {
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ message: 'Category not found' });
      res.status(200).json(category);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'PUT') {
    try {
      authenticate(req, res);
      const { name, iconBase64 } = req.body;
      const existingCategory = await Category.findOne({ name, _id: { $ne: id }, isActive: true });
      if (existingCategory) return res.status(400).json({ message: 'Another category with this name already exists' });
      const categoryData = { name };
      if (iconBase64) categoryData.icon = iconBase64;
      const updatedCategory = await Category.findByIdAndUpdate(id, categoryData, { new: true, runValidators: true });
      if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
      res.status(200).json(updatedCategory);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      authenticate(req, res);
      const plantCount = await Plant.countDocuments({ category: id, isActive: true });
      if (plantCount > 0) {
        return res.status(400).json({ message: 'Cannot delete category that has plants. Please reassign or delete the plants first.', plantCount });
      }
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ message: 'Category not found' });
      category.isActive = false;
      await category.save();
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 