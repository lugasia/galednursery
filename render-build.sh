#!/bin/bash
# This script is used by Render to build and prepare the application

# Copy the render-specific package.json to the root
echo "Copying render-package.json to package.json..."
cp render-package.json package.json

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install dependencies for the server
echo "Installing server dependencies..."
cd server
npm install --force
cd ..

# Install dependencies for the client and build it
echo "Installing client dependencies and building..."
cd client
npm install --force
npm run build
cd ..

echo "Build process completed successfully!"
