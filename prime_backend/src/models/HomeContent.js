import mongoose from 'mongoose';

const homeContentSchema = new mongoose.Schema({
  hero: {
    headline: { type: String, required: true },
    subtext: { type: String, required: true },
    cta: { type: String, required: true }
  },
  waitingState: [String],
  anticipation: { type: String, required: true },
  lastSignal: { type: String, required: true },
  trust: { type: String, required: true },
  guidance: [String],
  upgrade: {
    headline: { type: String, required: true },
    subtext: { type: String, required: true },
    cta: { type: String, required: true }
  },
  locked: { type: String, required: true },
  microLines: [String]
}, { timestamps: true });

// Prevent model overwrite error during hot reloads
const HomeContent = mongoose.models.HomeContent || mongoose.model('HomeContent', homeContentSchema);

export default HomeContent;
