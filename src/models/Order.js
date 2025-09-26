import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: Number
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['Received', 'Preparing', 'Ready', 'Completed'], default: 'Received' },
  pickupTime: { type: Date, required: true },
  orderDate: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);