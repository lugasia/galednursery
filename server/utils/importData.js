require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const csv = require('csv-parser');
const Plant = require('../models/Plant');
const Category = require('../models/Category');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plant-nursery')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

// Function to create categories
const createCategories = async (categoriesSet) => {
  console.log('Creating categories...');
  const categories = {};
  
  for (const categoryName of categoriesSet) {
    try {
      // Check if category already exists
      let category = await Category.findOne({ name: categoryName });
      
      if (!category) {
        // Create new category
        category = new Category({
          name: categoryName,
          icon: 'default-category.png'
        });
        await category.save();
        console.log(`Created category: ${categoryName}`);
      }
      
      categories[categoryName] = category._id;
    } catch (err) {
      console.error(`Error creating category ${categoryName}:`, err);
    }
  }
  
  return categories;
};

// Function to import plants
const importPlants = async () => {
  const results = [];
  const categoriesSet = new Set();
  
  // Read CSV file
  fs.createReadStream(path.join(__dirname, '../data/plants.csv'))
    .pipe(csv())
    .on('data', (data) => {
      if (data.Name && data.Category) {
        results.push(data);
        categoriesSet.add(data.Category);
      }
    })
    .on('end', async () => {
      try {
        // Create categories
        const categories = await createCategories(categoriesSet);
        
        // Delete existing plants
        await Plant.deleteMany({});
        console.log('Deleted existing plants');
        
        // Create plants
        for (const plant of results) {
          try {
            if (!plant.Name || !plant.Category) continue;
            
            const newPlant = new Plant({
              name: plant.Name,
              category: categories[plant.Category],
              height: plant.גובה || '',
              watering: plant.השקיה || '',
              light: plant.Tag || '',
              uses: plant.שימושים || '',
              description: plant.Description || '',
              imageBase64: '', // יעודכן בהמשך על ידי סקריפט updateImagesFromCSV.js
              stock: parseInt(plant.Stock) || 0
            });
            
            await newPlant.save();
            console.log(`Imported plant: ${plant.Name}`);
          } catch (err) {
            console.error(`Error importing plant ${plant.Name}:`, err);
          }
        }
        
        console.log('Data import completed');
        process.exit(0);
      } catch (err) {
        console.error('Error during import:', err);
        process.exit(1);
      }
    });
};

// Run import
importPlants();
