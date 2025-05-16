import dbConnect from '../../utils/dbConnect';
import Order from '../../models/Order';
import Plant from '../../models/Plant';
import authenticate from '../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      authenticate(req, res);
      const { status, customerName, customerPhone, startDate, endDate } = req.query;
      const filter = {};
      if (status && status !== 'all') filter.status = status;
      if (customerName) filter.customerName = { $regex: customerName, $options: 'i' };
      if (customerPhone) filter.customerPhone = { $regex: customerPhone, $options: 'i' };
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }
      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .populate({ path: 'items.plant', select: 'name image' });
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { customerName, customerPhone, items } = req.body;
      if (!customerName || !customerPhone || !items || !items.length) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const orderItems = [];
      for (const item of items) {
        const plant = await Plant.findById(item.plant);
        if (!plant) return res.status(400).json({ message: `Plant with ID ${item.plant} not found` });
        if (plant.stock < item.quantity) {
          return res.status(400).json({ message: `Not enough stock for ${plant.name}. Available: ${plant.stock}, Requested: ${item.quantity}` });
        }
        orderItems.push({ plant: item.plant, quantity: item.quantity, price: 0 });
        await Plant.findByIdAndUpdate(plant._id, { $inc: { popularity: item.quantity, stock: -item.quantity } });
      }
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const latestOrder = await Order.findOne(
        { orderNumber: { $regex: `^ORD-${year}${month}${day}-` } },
        {},
        { sort: { 'orderNumber': -1 } }
      );
      let orderNum = 1;
      if (latestOrder && latestOrder.orderNumber) {
        const lastNumStr = latestOrder.orderNumber.split('-').pop();
        const lastNum = parseInt(lastNumStr);
        if (!isNaN(lastNum)) orderNum = lastNum + 1;
      }
      const orderNumber = `ORD-${year}${month}${day}-${String(orderNum).padStart(3, '0')}`;
      const order = new Order({
        orderNumber,
        customerName,
        customerPhone,
        items: orderItems,
        totalAmount: 0,
        status: 'pending'
      });
      const savedOrder = await order.save();
      res.status(201).json(savedOrder);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 