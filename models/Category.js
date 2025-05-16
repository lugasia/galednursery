import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: String
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema); 