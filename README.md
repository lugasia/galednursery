# Plant Nursery Management System - Kibbutz Gilad

A complete system for managing plant inventory and customer orders for the Kibbutz Gilad nursery.

## Features

### Customer Interface
- Browse plants with detailed information
- Filter by categories
- Shopping cart functionality
- Order placement via WhatsApp

### Admin Interface
- Dashboard with key metrics
- Order management
- Plant inventory management
- Category management
- Settings

## Technology Stack
- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd client && npm install
   cd ../server && npm install
   ```
3. Set up environment variables (see .env.example files)
4. Start the development servers:
   ```
   # Start backend
   cd server && npm run dev
   
   # Start frontend in a new terminal
   cd client && npm start
   ```

## Project Structure
- `/client` - React frontend application
- `/server` - Node.js backend API
- `/docs` - Documentation and resources

Trigger new Vercel deployment.
