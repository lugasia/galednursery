require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
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
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'];
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error(`Error converting image to base64: ${imageUrl}`, error.message);
    return null;
  }
}

// Main function to update all plants
async function updatePlantsWithBase64Images() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_DB);
    console.log('Connected to MongoDB Atlas');

    // Get all plants
    const plants = await Plant.find({});
    console.log(`Found ${plants.length} plants to update`);

    let successCount = 0;
    let errorCount = 0;

    // Process each plant
    for (let i = 0; i < plants.length; i++) {
      const plant = plants[i];
      console.log(`Processing plant ${i+1}/${plants.length}: ${plant.name}`);

      try {
        // Convert image to base64
        const imageBase64 = await convertImageToBase64(plant.image);
        
        // Update the plant document
        const result = await Plant.updateOne(
          { _id: plant._id },
          { 
            $set: { imageBase64: imageBase64 || '' },
            $unset: { image: "", __v: "" }
          }
        );

        if (result.modifiedCount > 0) {
          successCount++;
          console.log(`Successfully updated plant: ${plant.name}`);
        } else {
          console.log(`No changes made to plant: ${plant.name}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error updating plant ${plant.name}:`, error.message);
      }
    }

    console.log('\nUpdate Summary:');
    console.log(`Total plants: ${plants.length}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    // Disconnect from MongoDB
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB Atlas');
  } catch (error) {
    console.error('Error in updatePlantsWithBase64Images:', error);
  }
}

// Run the update function
updatePlantsWithBase64Images()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
