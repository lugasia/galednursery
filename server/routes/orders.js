const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Plant = require('../models/Plant');
const auth = require('../middleware/auth');

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { status, customerName, customerPhone, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (customerName) {
      filter.customerName = { $regex: customerName, $options: 'i' };
    }
    
    if (customerPhone) {
      filter.customerPhone = { $regex: customerPhone, $options: 'i' };
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.plant',
        select: 'name image'
      });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order by ID (admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.plant',
        select: 'name image category',
        populate: {
          path: 'category',
          select: 'name'
        }
      });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new order (public)
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, items } = req.body;
    
    if (!customerName || !customerPhone || !items || !items.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate items
    const orderItems = [];
    
    for (const item of items) {
      const plant = await Plant.findById(item.plant);
      
      if (!plant) {
        return res.status(400).json({ message: `Plant with ID ${item.plant} not found` });
      }
      
      if (plant.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${plant.name}. Available: ${plant.stock}, Requested: ${item.quantity}`
        });
      }
      
      // All products are free now
      orderItems.push({
        plant: item.plant,
        quantity: item.quantity,
        price: 0
      });
      
      // Increment popularity and immediately reduce stock
      await Plant.findByIdAndUpdate(
        plant._id,
        { 
          $inc: { 
            popularity: item.quantity,
            stock: -item.quantity // Reduce stock immediately
          } 
        }
      );
      
      console.log(`Reduced stock for ${plant.name} by ${item.quantity} units`);
    }
    
    // Generate order number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Find the latest order to determine the next number
    const latestOrder = await Order.findOne(
      { orderNumber: { $regex: `^ORD-${year}${month}${day}-` } },
      {},
      { sort: { 'orderNumber': -1 } }
    );
    
    let orderNum = 1;
    
    if (latestOrder && latestOrder.orderNumber) {
      const lastNumStr = latestOrder.orderNumber.split('-').pop();
      const lastNum = parseInt(lastNumStr);
      if (!isNaN(lastNum)) {
        orderNum = lastNum + 1;
      }
    }
    
    // Format: ORD-YYYYMMDD-XXX (where XXX is a sequential number)
    const orderNumber = `ORD-${year}${month}${day}-${String(orderNum).padStart(3, '0')}`;
    
    const order = new Order({
      orderNumber,
      customerName,
      customerPhone,
      items: orderItems,
      totalAmount: 0, // All products are free
      status: 'pending'
    });
    
    const savedOrder = await order.save();
    
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update order status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'approved', 'shipped', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Prevent invalid status transitions
    if (order.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ message: 'Cannot change status of a cancelled order' });
    }
    
    if (order.status === 'completed' && status !== 'completed') {
      return res.status(400).json({ message: 'Cannot change status of a completed order' });
    }
    
    // Update the order status
    // The inventory management is handled by the Order model middleware
    order.status = status;
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get order statistics (admin only)
router.get('/admin/statistics', auth, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const approvedOrders = await Order.countDocuments({ status: 'approved' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    // Get monthly order counts for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get popular plants (most ordered)
    const popularPlants = await Plant.find()
      .sort({ popularity: -1 })
      .limit(5)
      .select('name popularity');
    
    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      monthlyOrders,
      popularPlants
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
