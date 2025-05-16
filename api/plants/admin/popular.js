import dbConnect from '../../../utils/dbConnect';
import Plant from '../../../models/Plant';
import authenticate from '../../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      authenticate(req, res);
      const plants = await Plant.find({ isActive: true })
        .sort({ popularity: -1 })
        .limit(10)
        .populate('category', 'name');
      res.status(200).json(plants);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 