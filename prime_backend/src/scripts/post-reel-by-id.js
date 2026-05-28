import 'dotenv/config'; // Hoisted and runs before other imports
import mongoose from 'mongoose';
import Signal from '../models/Signal.js';
import instagramService from '../services/instagram.service.js';
import videoService from '../services/video.service.js';
import s3Service from '../services/s3.service.js';
import logger from '../utils/logger.js';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

async function fetchWithCurl(url, outputPath) {
  return new Promise((resolve, reject) => {
    exec(`curl -L "${url}" -o "${outputPath}"`, (error) => {
      if (error) reject(error);
      else resolve(outputPath);
    });
  });
}

async function run() {
  const signalId = process.argv[2];
  if (!signalId) {
    console.error('Usage: node post-reel-by-id.js <signalId>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const signal = await Signal.findById(signalId);
    if (!signal) throw new Error('Signal not found');

    const baseUrl = "http://127.0.0.1:3000/api/og-image";
    const targetsStr = signal.targets.join(',');
    const growth = (((signal.currentPrice - signal.entry) / signal.entry) * 100).toFixed(2);

    const cardUrl = `${baseUrl}?type=card&symbol=${signal.symbol}&strike=${signal.strike}&optionType=${signal.optionType}&currentPrice=${signal.currentPrice}&entry=${signal.entry}&sl=${signal.sl}&targets=${targetsStr}&growth=${growth}`;
    const chartUrl = `${baseUrl}?type=chart&symbol=${signal.symbol}&strike=${signal.strike}&optionType=${signal.optionType}&currentPrice=${signal.currentPrice}&entry=${signal.entry}&sl=${signal.sl}&targets=${targetsStr}&growth=${growth}`;

    const tempDir = path.join(process.cwd(), 'temp_reel');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const cardPath = path.join(tempDir, 'card.png');
    const chartPath = path.join(tempDir, 'chart.png');
    const audioPath = path.join(process.cwd(), 'assets/music/exciting_beat.mp3');
    const videoPath = path.join(tempDir, 'reel.mp4');

    logger.info('📸 STEP 1: Fetching images for Reel...');
    await fetchWithCurl(cardUrl, cardPath);
    await fetchWithCurl(chartUrl, chartPath);

    logger.info('🎬 STEP 2: Creating Video Reel...');
    await videoService.createReel(cardPath, chartPath, audioPath, videoPath);

    logger.info('☁️ STEP 3: Uploading Reel to S3...');
    const videoBuffer = fs.readFileSync(videoPath);
    const s3Url = await s3Service.uploadFile(videoBuffer, `${signal.symbol}_reel.mp4`, 'video/mp4', 'reels');
    logger.info(`✅ Reel uploaded to S3 (Signed URL): ${s3Url}`);

    logger.info('🚀 STEP 4: Publishing Reel to Instagram...');
    const caption = `🚀 Institutional Performance: ${signal.symbol} ${signal.strike} ${signal.optionType}\n\n💎 Peak Achievement: ₹${signal.currentPrice}\n📈 Growth: +${growth}%\n\nJoin the LV Prime Elite. #Trading #NIFTY #LVPrime #LuxuryTrading`;
    await instagramService.postReel(s3Url, caption);

    logger.info('✅ Reel Successfully Published!');
    process.exit(0);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

run();
