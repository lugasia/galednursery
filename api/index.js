// Serverless function for Vercel deployment
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const plantRoutes = require('./plants');
const categoryRoutes = require('./categories2');
const updateDataRouter = require('./updateData');

// Create Express app
const app = express();

// Middleware
app.use(cors({ 
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Galed Nursery API',
    version: '1.0.0',
    endpoints: {
      plants: '/api/plants',
      categories: '/api/categories',
      auth: '/api/auth'
    }
  });
});

// Routes
app.use('/api/plants', plantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', updateDataRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack
  });
  
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Serverless function handler
module.exports = async (req, res) => {
  try {
    // Log incoming requests
    console.log(`API Request: ${req.method} ${req.url}`);
    console.log('Environment:', process.env.NODE_ENV);
    
    // Handle the request with our Express app
    return app(req, res);
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

if (require.main === module) {
  app.listen(5001, () => {
    console.log('Server is running on port 5001');
  });
}
