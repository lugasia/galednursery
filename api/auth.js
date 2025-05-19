const express = require('express');
const router = express.Router();

// Login route
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check credentials (this should be replaced with proper authentication)
    if (username === 'admin' && password === 'admin123') {
      res.json({ 
        success: true,
        user: { username: 'admin', role: 'admin' }
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Login failed'
    });
  }
});

module.exports = router; 