import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';
import authenticate from '../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'POST') {
    try {
      const user = authenticate(req, res);
      if (user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
      const { username, password, name, role } = req.body;
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
      const newUser = new User({ username, password, name, role: role || 'manager' });
      await newUser.save();
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser._id,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role
        }
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 