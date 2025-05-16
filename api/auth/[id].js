import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';
import authenticate from '../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  const userData = authenticate(req, res);
  if (req.method === 'PUT') {
    try {
      const { name, password } = req.body;
      if (userData.id !== id && userData.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      const updateData = { name };
      if (password) {
        updateData.password = password; // In production, hash the password
      }
      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
      if (!updatedUser) return res.status(404).json({ message: 'User not found' });
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      if (userData.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
      if (userData.id === id) return res.status(400).json({ message: 'Cannot delete your own account' });
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.isActive = false;
      await user.save();
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 