import dbConnect from '../../utils/dbConnect';
import Plant from '../../models/Plant';
import authenticate from '../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  if (req.method === 'GET') {
    try {
      const plant = await Plant.findById(id).populate('category', 'name icon');
      if (!plant) return res.status(404).json({ message: 'Plant not found' });
      res.status(200).json(plant);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'PUT') {
    try {
      authenticate(req, res);
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
      const updatedPlant = await Plant.findByIdAndUpdate(id, plantData, { new: true, runValidators: true });
      if (!updatedPlant) return res.status(404).json({ message: 'Plant not found' });
      res.status(200).json(updatedPlant);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else if (req.method === 'PATCH') {
    try {
      authenticate(req, res);
      if (req.url.endsWith('/stock')) {
        if (typeof req.body.stock === 'undefined') return res.status(400).json({ message: 'Stock value is required' });
        const updatedPlant = await Plant.findByIdAndUpdate(id, { stock: req.body.stock }, { new: true, runValidators: true });
        if (!updatedPlant) return res.status(404).json({ message: 'Plant not found' });
        res.status(200).json(updatedPlant);
      } else {
        res.status(405).end();
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      authenticate(req, res);
      const plant = await Plant.findById(id);
      if (!plant) return res.status(404).json({ message: 'Plant not found' });
      plant.isActive = false;
      await plant.save();
      res.status(200).json({ message: 'Plant deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 