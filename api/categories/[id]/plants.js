import dbConnect from '../../../utils/dbConnect';
import Plant from '../../../models/Plant';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  if (req.method === 'GET') {
    try {
      const plants = await Plant.find({ category: id, isActive: true }).sort({ name: 1 });
      res.status(200).json(plants);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 