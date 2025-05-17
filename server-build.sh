#!/bin/bash
# This script is specifically for the server deployment on Vercel

# Print current directory for debugging
echo "Current directory: $(pwd)"
echo "Listing directory contents:"
ls -la

# Install root dependencies
echo "Installing root dependencies..."
npm install --force

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install --force
cd ..

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  echo "NODE_ENV=production" > .env
  echo "PORT=5001" >> .env
  echo "MONGODB_URI=mongodb+srv://amir:UwZ3SotJuiqUpZ7J@cluster0.iqbyvcl.mongodb.net/galednursery?retryWrites=true&w=majority&appName=Cluster0" >> .env
  echo "JWT_SECRET=kibbutz_gilad_nursery_secret_key_2025" >> .env
  echo "CLIENT_URL=https://galednursery.vercel.app" >> .env
fi

echo "Server build process completed!"
