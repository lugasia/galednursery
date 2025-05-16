require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Plant = require('../models/Plant');

// Connect to MongoDB Atlas
const ATLAS_DB = process.env.MONGODB_URI;

// Default image path
const DEFAULT_IMAGE_PATH = path.join(__dirname, '../uploads/default-plant.jpg');

// Function to get base64 from local default image
async function getDefaultImageBase64() {
  try {
    // Check if default image exists
    if (fs.existsSync(DEFAULT_IMAGE_PATH)) {
      const imageBuffer = fs.readFileSync(DEFAULT_IMAGE_PATH);
      return `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    } else {
      // Create a simple default image if file doesn't exist
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAABlBMVEX///8AAABVwtN+AAAB9UlEQVR4nO3VsU0EQRQF0RnJIQHkYJwTcgIkQAaEQCQQAjmYBAiBEIiAEBwC9iQk/qnqfYm3Pc10z/S0bdvzU7M9bXvZ9nzXrM/bXrd93jXrz7bPbV93zfq77Xfb712zHrZ9bHu9a9bjtq9tb3fNetz2ve3jrlkP2z62vd4162Hb17a3u2Y9bvve9nHXrIdt79te75r1uO1r29tds/5s+9v2fdesh23v217umvW47XPb+12zHrZ9bHu9a9bjtq9tb3fNetj2ue39rlkP2963vdw163Hb17a3u2Y9bvvZ9nHXrIdt79te7pr1uO1r29tds/5u+9v2fdesh23v217umvW47XPb+12zHrZ9bHu9a9bjtq9tb3fNetj2ue39rlkP2963vdw163Hb17a3u2Y9bvvd9nHXrIdt79te7pr1uO1r29tds/5t+9v2fdesh23v217umvW47XPb+12zHrZ9bHu9a9bjtq9tb3fNetj2ue39rlkP2963vdw163Hb17a3u2Y9bvvb9nHXrIdt79te7pr1uO1r29tds/5v+9v2fdesh23v217umvW47XPb+12zHrZ9bHu9a9bjtq9tb3fNetj2ue39rlkP2963vdw163Hb17a3u2Y9bvvf9nHXrIdt79te7pr1uO1r29tdsx62fW57v2vWw7aPba93zXrc9rXt7a5Z/wFe8gk/YfnmDwAAAABJRU5ErkJggg==';
    }
  } catch (error) {
    console.error('Error reading default image:', error);
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAABlBMVEX///8AAABVwtN+AAAB9UlEQVR4nO3VsU0EQRQF0RnJIQHkYJwTcgIkQAaEQCQQAjmYBAiBEIiAEBwC9iQk/qnqfYm3Pc10z/S0bdvzU7M9bXvZ9nzXrM/bXrd93jXrz7bPbV93zfq77Xfb712zHrZ9bHu9a9bjtq9tb3fNetz2ve3jrlkP2z62vd4162Hb17a3u2Y9bvve9nHXrIdt79te75r1uO1r29tds/5s+9v2fdesh23v217umvW47XPb+12zHrZ9bHu9a9bjtq9tb3fNetj2ue39rlkP2963vdw163Hb17a3u2Y9bvvZ9nHXrIdt79te7pr1uO1r29tds/5u+9v2fdesh23v217umvW47XPb+12zHrZ9bHu9a9bjtq9tb3fNetj2ue39rlkP2963vdw163Hb17a3u2Y9bvvd9nHXrIdt79te7pr1uO1r29tds/5t+9v2fdesh23v217umvW47XPb+12zHrZ9bHu9a9bjtq9tb3fNetj2ue39rlkP2963vdw163Hb17a3u2Y9bvvb9nHXrIdt79te7pr1uO1r29tds/5v+9v2fdesh23v217umvW47XPb+12zHrZ9bHu9a9bjtq9tb3fNetj2ue39rlkP2963vdw163Hb17a3u2Y9bvvf9nHXrIdt79te7pr1uO1r29tdsx62fW57v2vWw7aPba93zXrc9rXt7a5Z/wFe8gk/YfnmDwAAAABJRU5ErkJggg==';
  }
}

// Function to convert image URL to base64
async function convertImageToBase64(imageUrl) {
  try {
    // Handle empty or invalid URLs
    if (!imageUrl || imageUrl === '' || imageUrl === 'undefined' || imageUrl === 'default-plant.jpg') {
      return await getDefaultImageBase64();
    }

    // For URLs that are valid, fetch the image
    console.log(`Fetching image from: ${imageUrl}`);
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'];
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error(`Error converting image to base64: ${imageUrl}`, error.message);
    // Return default image on error
    return await getDefaultImageBase64();
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
            $set: { imageBase64: imageBase64 },
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
