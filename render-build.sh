#!/bin/bash
# This script is used by Render to build and prepare the application

# Install dependencies for the server
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install dependencies for the client and build it
echo "Installing client dependencies and building..."
cd client
npm install
npm run build
cd ..

echo "Build process completed successfully!"
