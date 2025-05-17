#!/bin/bash
# This script is specifically for the server deployment

# Print current directory for debugging
echo "Current directory: $(pwd)"
echo "Listing directory contents:"
ls -la

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

echo "Server build process completed!"
