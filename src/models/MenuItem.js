import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  date: { type: Date, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);