import dbConnect from '../../utils/dbConnect';
import Plant from '../../models/Plant';
import authenticate from '../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      const plants = await Plant.find({ isActive: true })
        .populate('category', 'name icon')
        .sort({ name: 1 });
      res.status(200).json(plants);
    } catch (err) {
      res.status(500).json({ message: err.message });
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
      res.status(201).json(savedPlant);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 