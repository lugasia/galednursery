const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // Handle login
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      // Replace with your actual admin credentials check
      if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ 
          success: true,
          token,
          user: { username: 'admin', role: 'admin' }
        });
      } else {
        res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } 
  // Handle /me endpoint
  else if (req.method === 'GET') {
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