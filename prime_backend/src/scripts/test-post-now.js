import 'dotenv/config';
import connectDB from '../loaders/mongoose.js';
import dailyAchievementService from '../services/dailyAchievement.service.js';
import logger from '../utils/logger.js';

async function testPostNow() {
  try {
    logger.info('🚀 Triggering Daily Achievement Post (TEST)...');
    await connectDB();
    await dailyAchievementService.postDailyTopSignal();
    logger.info('✅ Test Trigger Complete!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Test Trigger Failed:', error);
    process.exit(1);
  }
}

testPostNow();
