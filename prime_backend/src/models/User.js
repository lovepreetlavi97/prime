import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String },

  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
  isVerified: { type: Boolean, default: false },
  subscription: {
    plan: { type: String, default: 'free' },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  telegramId: { type: String },
  isBanned: { type: Boolean, default: false },
  tokenVersion: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
