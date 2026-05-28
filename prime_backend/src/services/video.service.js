import { exec } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';

class VideoService {
  /**
   * Generates a Reel (MP4) from two images and background music using a raw FFmpeg command.
   */
  async createReel(image1Path, image2Path, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
      logger.info('🎬 Generating Reel using raw FFmpeg command...');

      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Delete existing output if any
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      const ffmpegPath = ffmpegStatic;
      const cmd = `"${ffmpegPath}" -i "${image1Path}" -i "${image2Path}" -i "${audioPath}" ` +
                  `-filter_complex "[0:v]loop=loop=120:size=1:start=0,scale=1080:1080,setsar=1,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black[v0];` +
                  `[1:v]loop=loop=120:size=1:start=0,scale=1080:1080,setsar=1,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black[v1];` +
                  `[v0][v1]concat=n=2:v=1:a=0[v]" ` +
                  `-map "[v]" -map 2:a -c:v libx264 -pix_fmt yuv420p -r 30 -shortest "${outputPath}"`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          logger.error('❌ FFmpeg Raw Error: ' + error.message);
          logger.error(stderr);
          reject(error);
          return;
        }
        logger.info('✅ Reel generated successfully via raw command: ' + outputPath);
        resolve(outputPath);
      });
    });
  }
}

export default new VideoService();
