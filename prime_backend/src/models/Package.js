import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  durationInDays: { type: Number, required: true },
  features: [{ type: String }],
  badge: { type: String, default: 'PREMIUM' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);
export default Package;
