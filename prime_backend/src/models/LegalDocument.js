import mongoose from 'mongoose';

const legalDocumentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    enum: ['privacy_policy', 'terms_and_conditions', 'about_us', 'faq', 'support']
  },
  title: { type: String, required: true },
  content: { type: String, required: true }, // Can support Markdown/HTML
}, { timestamps: true });

const LegalDocument = mongoose.models.LegalDocument || mongoose.model('LegalDocument', legalDocumentSchema);

export default LegalDocument;
