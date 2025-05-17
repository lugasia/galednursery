const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/updateData
router.post('/', async (req, res) => {
  const { data, commitMessage } = req.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO; // e.g. 'username/repo'
  const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH || 'data.json';

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return res.status(500).json({ error: 'GitHub token or repo not configured.' });
  }

  try {
    // Get the current file SHA
    const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
    const getResp = await axios.get(getUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });
    const sha = getResp.data.sha;

    // Prepare the update
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const updateResp = await axios.put(getUrl, {
      message: commitMessage || 'Update data.json from API',
      content,
      sha,
    }, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });

    return res.json({ success: true, commit: updateResp.data.commit.sha });
  } catch (err) {
    return res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router; 