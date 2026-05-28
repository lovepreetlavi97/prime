import 'dotenv/config';
import connectDB from '../loaders/mongoose.js';
import Signal from '../models/Signal.js';
import logger from '../utils/logger.js';
import instagramService from '../services/instagram.service.js';
import s3Service from '../services/s3.service.js';
import axios from 'axios';

async function postSignalById(signalId) {
  try {
    await connectDB();
    
    const signal = await Signal.findById(signalId);
    if (!signal) {
      console.error('Signal not found');
      process.exit(1);
    }

    console.log(`🚀 Posting Luxury Carousel for: ${signal.symbol} (${signalId})`);

    // Calculate growth and profit
    const profitAmt = signal.currentPrice - signal.entry;
    const growth = ((profitAmt / signal.entry) * 100).toFixed(2);
    const targets = signal.targets || [];
    const hitTargetsCount = targets.filter(t => signal.currentPrice >= t && t !== 0).length || 0;

    const baseUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';
    const params = new URLSearchParams({
      symbol: signal.symbol || '',
      strike: signal.strike || '',
      optionType: signal.optionType || '',
      currentPrice: signal.currentPrice.toFixed(2),
      entry: signal.entry.toString(),
      sl: signal.sl.toString(),
      targets: targets.join(','),
      profitAmt: profitAmt.toFixed(2),
      growth: growth,
      targetHitCount: hitTargetsCount.toString(),
      confidenceScore: (signal.confidenceScore || 65).toString(),
      rating: signal.rating || 'Medium',
      trend: signal.trend || 'Neutral',
      momentum: signal.momentum || 'Medium'
    });

    const cardUrl = `${baseUrl}/api/og-image?type=card&${params.toString()}`;
    const chartUrl = `${baseUrl}/api/og-image?type=chart&${params.toString()}`;
    
    console.log(`📸 STEP 1: Fetching Luxury images...`);
    async function fetchWithCurl(url) {
      const { execSync } = await import('child_process');
      console.log(`📡 Fetching via curl: ${url.split('type=')[1].split('&')[0]}...`);
      // Use curl to fetch the image as a buffer
      const buffer = execSync(`curl -s "${url}"`, { maxBuffer: 10 * 1024 * 1024 });
      if (!buffer || buffer.length < 1000) throw new Error('Curl returned empty or invalid buffer');
      return buffer;
    }

    const buffer1 = await fetchWithCurl(cardUrl);
    await new Promise(r => setTimeout(r, 2000));
    const buffer2 = await fetchWithCurl(chartUrl);

    console.log('✅ Both luxury images fetched via curl.');

    console.log('☁️ STEP 2: Uploading to S3...');
    const [url1, url2] = await Promise.all([
      s3Service.uploadImage(buffer1, `${signal.symbol}_luxury_card_${Date.now()}.png`),
      s3Service.uploadImage(buffer2, `${signal.symbol}_luxury_chart_${Date.now()}.png`)
    ]);
    console.log(`✅ Uploaded to S3:\n1. ${url1}\n2. ${url2}`);

    console.log('📝 STEP 3: Generating caption...');
    const caption = `
🏆 TOP SIGNAL ACHIEVEMENT: ${signal.symbol} 🏆

Our AI-powered signal just delivered massive results! 💎
✅ Entry: ₹${signal.entry}
✅ High Reached: ₹${signal.currentPrice}
📈 Total Profit: ₹${profitAmt.toFixed(2)} per unit
🔥 Growth: +${growth}%

Swipe left to see the performance chart! 📊 ⬅️

Precision analysis. Maximum profit. This is the power of Prime Trading Terminal. ⚡

Join our premium community to get these signals in real-time. (Link in Bio) 🔗

#Trading #Nifty50 #StockMarketIndia #OptionTrading #Profit #StockMarket #IntradayTrading #TradingSignals #WealthManagement #Investment
    `.trim();

    console.log('🚀 STEP 4: Posting Carousel to Instagram...');
    await instagramService.postCarousel([url1, url2], caption);
    console.log('✅ Luxury Instagram Carousel Posted!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Posting Failed:', error);
    process.exit(1);
  }
}

const signalId = process.argv[2];
if (!signalId) {
  console.error('Please provide a signal ID');
  process.exit(1);
}

postSignalById(signalId);
