require('dotenv').config();
const mongoose = require('mongoose');
const Plant = require('../models/Plant');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');

// Connection URLs
const LOCAL_DB = 'mongodb://localhost:27017/plant-nursery';
const ATLAS_DB = process.env.MONGODB_URI;

// Function to export data from local DB
async function exportFromLocalDB() {
  try {
    console.log('Connecting to local database...');
    await mongoose.connect(LOCAL_DB);
    console.log('Connected to local database');

    // Fetch all data
    const plants = await Plant.find({});
    const categories = await Category.find({});
    const orders = await Order.find({});
    const users = await User.find({});

    console.log(`Found ${plants.length} plants, ${categories.length} categories, ${orders.length} orders, and ${users.length} users in local database`);

    // Disconnect from local DB
    await mongoose.connection.close();
    console.log('Disconnected from local database');

    return { plants, categories, orders, users };
  } catch (error) {
    console.error('Error exporting from local database:', error);
    throw error;
  }
}

// Function to import data to Atlas DB
async function importToAtlasDB(data) {
  try {
    console.log('Connecting to Atlas database...');
    await mongoose.connect(ATLAS_DB);
    console.log('Connected to Atlas database');

    // Clear existing data
    await Plant.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data in Atlas database');

    // Import data
    if (data.categories.length > 0) {
      await Category.insertMany(data.categories.map(doc => doc.toObject()));
      console.log(`Imported ${data.categories.length} categories`);
    }

    if (data.plants.length > 0) {
      await Plant.insertMany(data.plants.map(doc => doc.toObject()));
      console.log(`Imported ${data.plants.length} plants`);
    }

    if (data.orders.length > 0) {
      await Order.insertMany(data.orders.map(doc => doc.toObject()));
      console.log(`Imported ${data.orders.length} orders`);
    }

    if (data.users.length > 0) {
      await User.insertMany(data.users.map(doc => doc.toObject()));
      console.log(`Imported ${data.users.length} users`);
    }

    console.log('Data migration completed successfully');
    await mongoose.connection.close();
    console.log('Disconnected from Atlas database');
  } catch (error) {
    console.error('Error importing to Atlas database:', error);
    throw error;
  }
}

// Main migration function
async function migrateData() {
  try {
    console.log('Starting data migration...');
    const data = await exportFromLocalDB();
    await importToAtlasDB(data);
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateData();
