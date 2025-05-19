const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.status(200).json({ 
        success: true,
        user: { 
          username: decoded.username,
          role: 'admin'
        }
      });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}; 