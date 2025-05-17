const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Category = require('../api/models/Category');
const Plant = require('../api/models/Plant');

const MONGODB_URI = 'mongodb+srv://amir:UwZ3SotJuiqUpZ7J@cluster0.iqbyvcl.mongodb.net/galednursery?retryWrites=true&w=majority&appName=Cluster0';

async function exportData() {
  await mongoose.connect(MONGODB_URI);

  const categories = await Category.find().lean();
  const plants = await Plant.find().lean();

  const data = { categories, plants };

  const outPath = path.join(__dirname, '../data.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log('Exported data to data.json');
  process.exit();
}

exportData(); 