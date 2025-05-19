const fetch = require('node-fetch');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'lugasia/galednursery';
const FILE_PATH = 'data.json';
const BRANCH = 'main';

async function fetchDataFromGitHub() {
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${FILE_PATH}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch data.json from GitHub');
  return await response.json();
}

async function saveDataToGitHub(newData) {
  // 1. Get the current file SHA
  const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` }
  });
  const fileData = await getRes.json();

  // 2. Update the file
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update data.json',
      content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
      sha: fileData.sha,
      branch: BRANCH
    })
  });

  if (!res.ok) throw new Error('Failed to update data.json on GitHub');
  return await res.json();
}

module.exports = { fetchDataFromGitHub, saveDataToGitHub }; 