import signalsRepository from '../modules/signals/signals.repository.js';
import instagramService from './instagram.service.js';
import s3Service from './s3.service.js';
import logger from '../utils/logger.js';
import axios from 'axios';

class DailyAchievementService {
  /**
   * Find the signal with the highest percentage growth today and post it to Instagram
   */
  async postDailyTopSignal() {
    try {
      logger.info('🔍 Finding Today\'s Top Performing Signal...');
      
      const signals = await signalsRepository.findAll(100, true); // Get today's signals
      
      if (signals.length === 0) {
        logger.info('📭 No signals found today. Skipping Instagram post.');
        return;
      }

      // Calculate growth and find the winner
      const winners = signals
        .filter(s => s.status.includes('PROFIT') || s.currentPrice > s.entry)
        .map(s => {
          const profit = s.currentPrice - s.entry;
          const growth = (profit / s.entry) * 100;
          return { ...s._doc, growth };
        })
        .sort((a, b) => b.growth - a.growth);

      if (winners.length === 0) {
        logger.info('📉 No profitable signals found today. Skipping Instagram post.');
        return;
      }

      const topSignal = winners[0];
      logger.info(`🏆 Top Signal of the Day: ${topSignal.symbol} with ${topSignal.growth.toFixed(2)}% Growth!`);

      let buffer1, buffer2;
      try {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        // Calculate dynamic properties
        const profitAmt = topSignal.currentPrice - topSignal.entry;
        const current = topSignal.currentPrice;
        const targets = topSignal.targets || [];
        const hitTargetsCount = targets.filter(t => current >= t && t !== 0).length || 0;
        
        // Construct query parameters
        const params = new URLSearchParams({
          symbol: topSignal.symbol || '',
          strike: topSignal.strike || '',
          optionType: topSignal.optionType || '',
          currentPrice: current.toFixed(2),
          entry: topSignal.entry.toString(),
          sl: topSignal.sl.toString(),
          targets: targets.join(','),
          profitAmt: profitAmt.toFixed(2),
          growth: topSignal.growth.toFixed(2),
          targetHitCount: hitTargetsCount.toString(),
          confidenceScore: (topSignal.confidenceScore || 65).toString(),
          rating: topSignal.rating || 'Medium',
          trend: topSignal.trend || 'Neutral',
          momentum: topSignal.momentum || 'Medium'
        });

        const cardUrl = `${baseUrl}/api/og-image?type=card&${params.toString()}`;
        const chartUrl = `${baseUrl}/api/og-image?type=chart&${params.toString()}`;
        
        logger.info(`📸 STEP 1: Fetching images via curl...`);
        
        const { execSync } = await import('child_process');
        
        // Fetch card
        buffer1 = execSync(`curl -s "${cardUrl}"`, { maxBuffer: 10 * 1024 * 1024 });
        await new Promise(r => setTimeout(r, 2000));
        
        // Fetch chart
        buffer2 = execSync(`curl -s "${chartUrl}"`, { maxBuffer: 10 * 1024 * 1024 });

        logger.info('✅ Both template images fetched via curl.');
      } catch (imgError) {
        logger.warn(`⚠️ Image fetch failed (${imgError.message}), trying fallback...`);
      }

      let finalUrls = [];
      if (buffer1 && buffer2) {
        logger.info('☁️ STEP 2: Uploading images to S3...');
        const [url1, url2] = await Promise.all([
          s3Service.uploadImage(buffer1, `${topSignal.symbol}_card_${Date.now()}.png`),
          s3Service.uploadImage(buffer2, `${topSignal.symbol}_chart_${Date.now()}.png`)
        ]);
        finalUrls = [url1, url2];
      } else if (buffer1) {
        const url1 = await s3Service.uploadImage(buffer1, `${topSignal.symbol}_card_${Date.now()}.png`);
        finalUrls = [url1];
      }

      // 📝 STEP 3: Generate Caption
      logger.info('📝 STEP 3: Generating caption...');
      const profit = (topSignal.currentPrice - topSignal.entry).toFixed(2);
      const growth = topSignal.growth.toFixed(2);
      const caption = `
🏆 TOP SIGNAL ACHIEVEMENT: ${topSignal.symbol} 🏆

Our AI-powered signal just delivered massive results! 💎
✅ Entry: ₹${topSignal.entry}
✅ High Reached: ₹${topSignal.currentPrice}
📈 Total Profit: ₹${profit} per unit
🔥 Growth: +${growth}%

Swipe left to see the performance chart! 📊 ⬅️

Precision analysis. Maximum profit. This is the power of Prime Trading Terminal. ⚡

Join our premium community to get these signals in real-time. (Link in Bio) 🔗

#Trading #Nifty50 #StockMarketIndia #OptionTrading #Profit #StockMarket #IntradayTrading #TradingSignals #WealthManagement #Investment
      `.trim();

      logger.info('🚀 STEP 4: Posting carousel to Instagram...');
      if (finalUrls.length > 1) {
        await instagramService.postCarousel(finalUrls, caption);
      } else if (finalUrls.length === 1) {
        await instagramService.postImage(finalUrls[0], caption);
      }
      
      logger.info('✅ Instagram Achievement Carousel Posted!');

    } catch (error) {
      logger.error('❌ Daily Achievement Posting Failed:', error.message);
    }
  }
}

export default new DailyAchievementService();
