import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  height: String,
  watering: String,
  light: String,
  uses: String,
  description: String,
  stock: { type: Number, default: 0 },
  imageBase64: String,
  isActive: { type: Boolean, default: true },
  popularity: { type: Number, default: 0 }
});

export default mongoose.models.Plant || mongoose.model('Plant', plantSchema); 