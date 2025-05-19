const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
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
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}; 