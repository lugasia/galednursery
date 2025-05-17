// Serverless function for Vercel deployment
require('dotenv').config({ path: './server/.env.vercel' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const dbConnect = require('../server/utils/dbConnect');

// Import routes
const plantRoutes = require('../server/routes/plants');
const categoryRoutes = require('../server/routes/categories');
const orderRoutes = require('../server/routes/orders');
const authRoutes = require('../server/routes/auth');

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/plants', plantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Serverless function handler
module.exports = async (req, res) => {
  // Log incoming requests
  console.log(`API Request: ${req.method} ${req.url}`);
  
  // Connect to database
  try {
    await dbConnect();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
  
  // Handle the request with our Express app
  return app(req, res);
};
