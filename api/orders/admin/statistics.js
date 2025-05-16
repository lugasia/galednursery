import dbConnect from '../../../utils/dbConnect';
import Order from '../../../models/Order';
import Plant from '../../../models/Plant';
import authenticate from '../../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      authenticate(req, res);
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({ status: 'pending' });
      const completedOrders = await Order.countDocuments({ status: 'completed' });
      const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const monthlyOrders = await Order.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);
      const popularPlants = await Plant.find().sort({ popularity: -1 }).limit(5).select('name popularity');
      res.status(200).json({
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
  } else {
    res.status(405).end();
  }
} 