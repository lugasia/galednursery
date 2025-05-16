import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username, isActive: true });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      // You may need to implement comparePassword as a method or do bcrypt compare here
      const isMatch = password === user.password; // Replace with bcrypt compare in production
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );
      res.status(200).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 