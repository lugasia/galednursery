const express = require('express');
const axios = require('axios');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Simple test route
router.get('/test', (req, res) => res.json({ ok: true }));

// GET /api/auth/login
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Fetch admin credentials from GitHub
    const response = await axios.get('https://raw.githubusercontent.com/lugasia/galednursery/main/admin.json');
    const data = response.data;
    
    // Check if admin credentials exist
    if (!data.admin || !data.admin.username || !data.admin.password) {
      return res.status(500).json({ message: 'Admin credentials not configured' });
    }
    
    // Verify credentials
    if (username === data.admin.username && password === data.admin.password) {
      // Generate JWT token
      const token = jwt.sign(
        { id: 'admin', role: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      return res.json({
        token,
        user: {
          id: 'admin',
          name: 'מנהל המערכת',
          role: 'admin'
        }
      });
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

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