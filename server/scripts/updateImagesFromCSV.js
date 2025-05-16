require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const csv = require('csv-parser');
const Plant = require('../models/Plant');

// Connect to MongoDB Atlas
const ATLAS_DB = process.env.MONGODB_URI;

// Function to convert image URL to base64
async function convertImageToBase64(imageUrl) {
  try {
    // Handle empty or invalid URLs
    if (!imageUrl || imageUrl === '' || imageUrl === 'undefined') {
      console.log('Empty or invalid image URL, using placeholder');
      return null;
    }

    console.log(`Fetching image from: ${imageUrl}`);
    const response = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      timeout: 10000, // 10 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const contentType = response.headers['content-type'];
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error(`Error converting image to base64: ${imageUrl}`, error.message);
    return null;
  }
}

// Function to read CSV and update plants
async function updatePlantsFromCSV() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_DB);
    console.log('Connected to MongoDB Atlas');

    const csvPath = path.join(__dirname, '../data/plants.csv');
    const plants = [];
    
    // Read the CSV file
    console.log(`Reading CSV file from ${csvPath}`);
    
    // Create a promise to read the CSV
    const readCSVPromise = new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });

    // Wait for CSV to be read
    const csvData = await readCSVPromise;
    console.log(`Read ${csvData.length} plants from CSV`);

    let successCount = 0;
    let errorCount = 0;

    // Process each plant
    for (let i = 0; i < csvData.length; i++) {
      const plantData = csvData[i];
      const plantName = plantData.Name;
      
      if (!plantName) {
        console.log(`Skipping row ${i+1} - no plant name found`);
        continue;
      }

      console.log(`Processing plant ${i+1}/${csvData.length}: ${plantName}`);
      
      try {
        // Find the plant in MongoDB
        const plant = await Plant.findOne({ name: plantName });
        
        if (!plant) {
          console.log(`Plant not found in database: ${plantName}`);
          continue;
        }

        // Get image URL from CSV - check both columns
        let imageUrl = plantData['תמונה'] || plantData.Thumbnail;
        
        if (!imageUrl) {
          console.log(`No image URL found for plant: ${plantName}`);
          continue;
        }

        // Convert image to base64
        const imageBase64 = await convertImageToBase64(imageUrl);
        
        if (!imageBase64) {
          console.log(`Could not convert image for plant: ${plantName}`);
          continue;
        }

        // Update the plant document
        const result = await Plant.updateOne(
          { _id: plant._id },
          { 
            $set: { imageBase64: imageBase64 },
            $unset: { image: "", __v: "" }
          }
        );

        if (result.modifiedCount > 0) {
          successCount++;
          console.log(`Successfully updated plant: ${plantName}`);
        } else {
          console.log(`No changes made to plant: ${plantName}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error updating plant ${plantName}:`, error.message);
      }
    }

    console.log('\nUpdate Summary:');
    console.log(`Total plants processed: ${csvData.length}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    // Disconnect from MongoDB
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB Atlas');
  } catch (error) {
    console.error('Error in updatePlantsFromCSV:', error);
  }
}

// Run the update function
updatePlantsFromCSV()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
