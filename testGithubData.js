require('dotenv').config();
const { fetchDataFromGitHub, saveDataToGitHub } = require('./utils/githubData');

async function testGitHubConnection() {
  try {
    console.log('Testing GitHub connection...');
    console.log('Environment variables:', {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? 'Present' : 'Missing',
      GITHUB_REPO: process.env.GITHUB_REPO || 'lugasia/galednursery',
      FILE_PATH: process.env.GITHUB_FILE_PATH || 'data.json',
      BRANCH: process.env.GITHUB_BRANCH || 'main'
    });

    // Test fetching data
    console.log('\nTesting fetchDataFromGitHub...');
    const data = await fetchDataFromGitHub();
    console.log('Successfully fetched data:', data);

    // Test saving data
    console.log('\nTesting saveDataToGitHub...');
    const testData = {
      ...data,
      test: {
        timestamp: new Date().toISOString(),
        message: 'Test update'
      }
    };
    const saveResult = await saveDataToGitHub(testData);
    console.log('Successfully saved data:', saveResult);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGitHubConnection(); 