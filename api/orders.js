const { fetchDataFromGitHub } = require('../utils/githubData');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const data = await fetchDataFromGitHub();
      res.status(200).json(data.orders || []);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}; 