// Serverless function for Vercel deployment
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const plantRoutes = require('./plants');
const categoryRoutes = require('./categories2');
// Removed orders and auth routes

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

// Connect to MongoDB
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }
  
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not set in environment variables');
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    // Log connection attempt (without credentials)
    const sanitizedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('Attempting to connect to MongoDB:', sanitizedUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    isConnected = true;
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('Could not connect to MongoDB:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    throw err;
  }
};

// Routes
app.use('/api/plants', plantRoutes);
app.use('/api/categories', categoryRoutes);
// Removed orders and auth routes

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
  console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
  
  // Connect to database
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message,
      code: error.code
    });
  }
  
  // Handle the request with our Express app
  return app(req, res);
};
