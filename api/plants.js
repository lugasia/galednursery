import dbConnect from '../utils/dbConnect';
import Plant from '../models/Plant';
import authenticate from '../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  const url = req.url || '';

  // /api/plants/admin/low-stock
  if (url.includes('admin/low-stock')) {
    if (req.method === 'GET') {
      try {
        authenticate(req, res);
        const lowStockThreshold = 5;
        const plants = await Plant.find({ stock: { $lt: lowStockThreshold }, isActive: true })
          .populate('category', 'name')
          .sort({ stock: 1 });
        return res.status(200).json(plants);
      } catch (err) {
        return res.status(500).json({ message: err.message });
      }
    } else {
      return res.status(405).end();
    }
  }

  // /api/plants/admin/popular
  if (url.includes('admin/popular')) {
    if (req.method === 'GET') {
      try {
        authenticate(req, res);
        const plants = await Plant.find({ isActive: true })
          .sort({ popularity: -1 })
          .limit(10)
          .populate('category', 'name');
        return res.status(200).json(plants);
      } catch (err) {
        return res.status(500).json({ message: err.message });
      }
    } else {
      return res.status(405).end();
    }
  }

  // /api/plants/[id] and /api/plants/[id]/stock
  if (id) {
    if (req.method === 'GET') {
      try {
        const plant = await Plant.findById(id).populate('category', 'name icon');
        if (!plant) return res.status(404).json({ message: 'Plant not found' });
        return res.status(200).json(plant);
      } catch (err) {
        return res.status(500).json({ message: err.message });
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
        return res.status(200).json(updatedPlant);
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    } else if (req.method === 'PATCH') {
      try {
        authenticate(req, res);
        if (url.endsWith('/stock')) {
          if (typeof req.body.stock === 'undefined') return res.status(400).json({ message: 'Stock value is required' });
          const updatedPlant = await Plant.findByIdAndUpdate(id, { stock: req.body.stock }, { new: true, runValidators: true });
          if (!updatedPlant) return res.status(404).json({ message: 'Plant not found' });
          return res.status(200).json(updatedPlant);
        } else {
          return res.status(405).end();
        }
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    } else if (req.method === 'DELETE') {
      try {
        authenticate(req, res);
        const plant = await Plant.findById(id);
        if (!plant) return res.status(404).json({ message: 'Plant not found' });
        plant.isActive = false;
        await plant.save();
        return res.status(200).json({ message: 'Plant deleted successfully' });
      } catch (err) {
        return res.status(500).json({ message: err.message });
      }
    } else {
      return res.status(405).end();
    }
  }

  // /api/plants (GET, POST)
  if (req.method === 'GET') {
    try {
      const plants = await Plant.find({ isActive: true })
        .populate('category', 'name icon')
        .sort({ name: 1 });
      return res.status(200).json(plants);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'POST') {
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
        stock: req.body.stock,
        imageBase64: req.body.imageBase64 || ''
      };
      const plant = new Plant(plantData);
      const savedPlant = await plant.save();
      return res.status(201).json(savedPlant);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  } else {
    return res.status(405).end();
  }
} 