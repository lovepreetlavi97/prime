import mongoose from 'mongoose';

const contactSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'RESOLVED'],
    default: 'PENDING'
  },
  reply: { type: String, default: '' },
}, { timestamps: true });

// 🔥 SCALING INDEXES
contactSubmissionSchema.index({ status: 1 });
contactSubmissionSchema.index({ email: 1 });

const ContactSubmission = mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', contactSubmissionSchema);
export default ContactSubmission;
