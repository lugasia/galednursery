const mongoose = require('mongoose');
const Plant = require('./Plant');

const OrderItemSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    default: 0 // Price is now optional since products are free
  }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    default: 0 // Total amount is now optional since products are free
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'shipped', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  inventoryProcessed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Find the latest order to determine the next number
    const latestOrder = await this.constructor.findOne(
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
    this.orderNumber = `ORD-${year}${month}${day}-${String(orderNum).padStart(3, '0')}`;
  }
  next();
});

// Update inventory when order status changes
OrderSchema.pre('save', async function(next) {
  // Check if this is a new document or if the status has changed
  const isNewOrder = this.isNew;
  const statusChanged = this.isModified('status');
  
  // Only process if the status has changed (not for new orders since inventory is already reduced at creation)
  if (!statusChanged && !isNewOrder) {
    return next();
  }
  
  try {
    // Get the previous status if this is an existing document
    let previousStatus = 'pending';
    if (!isNewOrder && statusChanged) {
      const oldDoc = await this.constructor.findById(this._id);
      if (oldDoc) {
        previousStatus = oldDoc.status;
      }
    }
    
    console.log(`Order ${this.orderNumber} status change: ${previousStatus} -> ${this.status}`);
    
    // If order is being cancelled - restore inventory
    if (this.status === 'cancelled') {
      console.log(`Restoring inventory for cancelled order ${this.orderNumber}`);
      for (const item of this.items) {
        const plant = await Plant.findById(item.plant);
        if (plant) {
          console.log(`Increasing stock for ${plant.name} by ${item.quantity}`);
          plant.stock += item.quantity;
          await plant.save();
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Error updating inventory:', error);
    next(error);
  }
});

module.exports = mongoose.model('Order', OrderSchema);
