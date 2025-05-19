const { fetchDataFromGitHub, saveDataToGitHub } = require('../utils/githubData');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const data = await fetchDataFromGitHub();
      res.status(200).json(data.orders || []);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'POST') {
    try {
      const data = await fetchDataFromGitHub();
      const newOrder = {
        id: Date.now().toString(),
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      data.orders = data.orders || [];
      data.orders.push(newOrder);
      await saveDataToGitHub(data);
      res.status(201).json(newOrder);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}; 