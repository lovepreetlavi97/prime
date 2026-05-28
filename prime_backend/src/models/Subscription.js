import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  packageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Package', 
    required: true 
  },
  planName: { type: String, required: true },
  amount: { type: Number, required: true }, // Amount in INR
  currency: { type: String, default: 'INR' },
  durationInDays: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'], 
    default: 'ACTIVE' 
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
}, { timestamps: true });

// 🔥 SCALING INDEXES
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ razorpayOrderId: 1 }, { sparse: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
