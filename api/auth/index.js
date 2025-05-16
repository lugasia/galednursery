import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';
import authenticate from '../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      const user = authenticate(req, res);
      if (user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
      const users = await User.find().select('-password');
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 