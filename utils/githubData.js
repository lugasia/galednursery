const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO || 'lugasia/galednursery';
const FILE_PATH = process.env.GITHUB_FILE_PATH || 'data.json';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

async function fetchDataFromGitHub() {
  try {
    const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${FILE_PATH}`;
    console.log('Fetching from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3.raw'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub fetch error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch data.json from GitHub: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in fetchDataFromGitHub:', error);
    throw error;
  }
}

async function saveDataToGitHub(newData) {
  try {
    // 1. Get the current file SHA
    const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      headers: { 
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!getRes.ok) {
      const errorText = await getRes.text();
      console.error('GitHub get file error:', {
        status: getRes.status,
        statusText: getRes.statusText,
        error: errorText
      });
      throw new Error(`Failed to get file info from GitHub: ${getRes.status} ${getRes.statusText}`);
    }
    
    const fileData = await getRes.json();

    // 2. Update the file
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update data.json',
        content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
        sha: fileData.sha,
        branch: BRANCH
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('GitHub update error:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText
      });
      throw new Error(`Failed to update data.json on GitHub: ${res.status} ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error in saveDataToGitHub:', error);
    throw error;
  }
}

module.exports = { fetchDataFromGitHub, saveDataToGitHub }; 