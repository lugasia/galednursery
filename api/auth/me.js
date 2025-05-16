import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';
import authenticate from '../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      const userData = authenticate(req, res);
      const user = await User.findById(userData.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 