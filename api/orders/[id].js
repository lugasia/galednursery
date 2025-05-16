import dbConnect from '../../utils/dbConnect';
import Order from '../../models/Order';
import authenticate from '../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  if (req.method === 'GET') {
    try {
      authenticate(req, res);
      const order = await Order.findById(id)
        .populate({
          path: 'items.plant',
          select: 'name image category',
          populate: { path: 'category', select: 'name' }
        });
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.status(200).json(order);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'PATCH') {
    try {
      authenticate(req, res);
      const { status } = req.body;
      if (!status || !['pending', 'approved', 'shipped', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      if (order.status === 'cancelled' && status !== 'cancelled') {
        return res.status(400).json({ message: 'Cannot change status of a cancelled order' });
      }
      if (order.status === 'completed' && status !== 'completed') {
        return res.status(400).json({ message: 'Cannot change status of a completed order' });
      }
      order.status = status;
      const updatedOrder = await order.save();
      res.status(200).json(updatedOrder);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res.status(405).end();
  }
} 