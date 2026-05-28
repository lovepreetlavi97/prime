import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export default async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('✌️ DB loaded and connected!');
  } catch (error) {
    logger.error('🔥 Error connecting to DB', error);
    process.exit(1);
  }
};
