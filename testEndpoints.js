require('dotenv').config();
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5001/api';

async function testEndpoints() {
  try {
    console.log('Testing API endpoints...\n');

    // Test categories endpoint
    console.log('Testing GET /categories...');
    const categoriesResponse = await fetch(`${BASE_URL}/categories`);
    const categories = await categoriesResponse.json();
    console.log('Categories response:', categoriesResponse.status);
    console.log('Number of categories:', categories.length);
    console.log('First category:', categories[0], '\n');

    // Test plants endpoint
    console.log('Testing GET /plants...');
    const plantsResponse = await fetch(`${BASE_URL}/plants`);
    const plants = await plantsResponse.json();
    console.log('Plants response:', plantsResponse.status);
    console.log('Number of plants:', plants.length);
    console.log('First plant:', plants[0], '\n');

    // Test plants by category
    if (categories.length > 0) {
      const categoryId = categories[0].id;
      console.log(`Testing GET /plants/category/${categoryId}...`);
      const plantsByCategoryResponse = await fetch(`${BASE_URL}/plants/category/${categoryId}`);
      const plantsByCategory = await plantsByCategoryResponse.json();
      console.log('Plants by category response:', plantsByCategoryResponse.status);
      console.log('Number of plants in category:', plantsByCategory.length, '\n');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEndpoints(); 