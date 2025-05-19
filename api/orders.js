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
      const orderItems = req.body.items || [];
      const updatedPlants = [...(data.plants || [])];
      const updatedOrderItems = [];

      for (const item of orderItems) {
        const plant = updatedPlants.find(p => p._id === item.plant);
        if (!plant) {
          return res.status(400).json({ message: `Plant not found: ${item.plant}` });
        }
        if (plant.stock < item.quantity) {
          return res.status(400).json({ message: `Not enough stock for ${plant.name}` });
        }
        plant.stock -= item.quantity;
        // Add category info to order item
        updatedOrderItems.push({
          ...item,
          category: plant.category || null
        });
      }

      // Save updated plants and new order
      data.plants = updatedPlants;
      data.orders = data.orders || [];
      const newOrder = {
        id: Date.now().toString(),
        ...req.body,
        items: updatedOrderItems,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      data.orders.push(newOrder);
      await saveDataToGitHub(data);
      res.status(201).json(newOrder);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'Order id required' });
      const data = await fetchDataFromGitHub();
      const orderIndex = (data.orders || []).findIndex(o => o.id === id);
      if (orderIndex === -1) return res.status(404).json({ message: 'Order not found' });
      const order = data.orders[orderIndex];
      // Restore stock for each item in the order
      for (const item of order.items) {
        const plant = (data.plants || []).find(p => p._id === (item.plant._id || item.plant));
        if (plant) {
          plant.stock += item.quantity;
        }
      }
      // Remove the order
      data.orders.splice(orderIndex, 1);
      await saveDataToGitHub(data);
      res.status(200).json({ message: 'Order deleted and stock restored' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}; 