const jwt = require('jsonwebtoken');

/**
 * Simple JWT authentication middleware for Vercel serverless functions
 * Only verifies the token and sets req.user without database lookups
 */
module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Set user info from token without database lookup
    req.user = decoded;
    
    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
}; 