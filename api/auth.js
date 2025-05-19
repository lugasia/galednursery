const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/auth/login') {
    try {
      const { username, password } = req.body;
      // Replace with your actual admin credentials check
      if (username === 'admin' && password === 'admin') {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'GET' && req.url === '/api/auth/me') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.status(200).json({ username: decoded.username });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}; 