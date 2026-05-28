import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export default async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 100,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });
    logger.info('✌️ Distributed DB Pool Initialized and Connected!');
  } catch (error) {
    logger.error('🔥 Error connecting to DB', error);
    process.exit(1);
  }
};
