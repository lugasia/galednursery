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

// Routes
app.use('/api/plants', plantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', updateDataRouter); // This will handle both /api/updateData and /api/auth/login

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
  // Log incoming requests
  console.log(`API Request: ${req.method} ${req.url}`);
  console.log('Environment:', process.env.NODE_ENV);
  
  // Handle the request with our Express app
  return app(req, res);
};
