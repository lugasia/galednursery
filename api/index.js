// Serverless function for Vercel deployment
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const plantRoutes = require('./plants');
const categoryRoutes = require('./categories');
const updateDataRouter = require('./updateData');
const authRoutes = require('./auth');
const orderRoutes = require('./orders');

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
      auth: '/api/auth',
      orders: '/api/orders'
    }
  });
});

// Debug router info
console.log('Router types:');
console.log('plantRoutes:', typeof plantRoutes, plantRoutes && !!plantRoutes.stack);
console.log('categoryRoutes:', typeof categoryRoutes, categoryRoutes && !!categoryRoutes.stack);
console.log('authRoutes:', typeof authRoutes, authRoutes && !!authRoutes.stack);
console.log('orderRoutes:', typeof orderRoutes, orderRoutes && !!orderRoutes.stack);
console.log('updateDataRouter:', typeof updateDataRouter, updateDataRouter && !!updateDataRouter.stack);

// Routes - make sure all routers are properly defined
if (plantRoutes && (typeof plantRoutes === 'function' || plantRoutes.handle || plantRoutes.stack)) {
  app.use('/api/plants', plantRoutes);
} else {
  console.error('plantRoutes is not a valid router:', plantRoutes);
  app.use('/api/plants', (req, res) => res.status(500).json({ error: 'Router not properly configured' }));
}

if (categoryRoutes && (typeof categoryRoutes === 'function' || categoryRoutes.handle || categoryRoutes.stack)) {
  app.use('/api/categories', categoryRoutes);
} else {
  console.error('categoryRoutes is not a valid router:', categoryRoutes);
  app.use('/api/categories', (req, res) => res.status(500).json({ error: 'Router not properly configured' }));
}

if (authRoutes && (typeof authRoutes === 'function' || authRoutes.handle || authRoutes.stack)) {
  app.use('/api/auth', authRoutes);
} else {
  console.error('authRoutes is not a valid router:', authRoutes);
  app.use('/api/auth', (req, res) => res.status(500).json({ error: 'Router not properly configured' }));
}

if (orderRoutes && (typeof orderRoutes === 'function' || orderRoutes.handle || orderRoutes.stack)) {
  app.use('/api/orders', orderRoutes);
} else {
  console.error('orderRoutes is not a valid router:', orderRoutes);
  app.use('/api/orders', (req, res) => res.status(500).json({ error: 'Router not properly configured' }));
}

if (updateDataRouter && (typeof updateDataRouter === 'function' || updateDataRouter.handle || updateDataRouter.stack)) {
  app.use('/api', updateDataRouter);
} else {
  console.error('updateDataRouter is not a valid router:', updateDataRouter);
  // Don't add a fallback for root API routes to avoid conflicts
}

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
