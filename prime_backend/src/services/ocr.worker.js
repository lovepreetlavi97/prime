import { parentPort, workerData } from 'worker_threads';
import Tesseract from 'tesseract.js';

/**
 * OCR Worker
 * Runs in a separate thread to prevent blocking the event loop.
 */
async function processImage(imageBuffer) {
  try {
    // 🔥 SKIP NOISE IMAGES (Stickers, tiny icons, emojis)
    // 2x36 images etc. are noise and crash Tesseract logs.
    if (!imageBuffer || imageBuffer.length < 50000) {
      return parentPort.postMessage({ success: true, text: "" });
    }

    // 🔥 HARD-SILENCE NATIVE LOGS (Leptonica writes directly to stderr)
    const originalStderrWrite = process.stderr.write;
    process.stderr.write = () => {};

    try {
      const { data: { text } } = await Tesseract.recognize(
        imageBuffer,
        'eng',
        { 
          logger: () => {} 
        }
      );
      process.stderr.write = originalStderrWrite;
      parentPort.postMessage({ success: true, text });
    } catch (e) {
      process.stderr.write = originalStderrWrite;
      parentPort.postMessage({ success: true, text: "" });
    }
  } catch (error) {
    parentPort.postMessage({ success: true, text: "" }); // Never fail, just skip
  }
}

processImage(workerData.imageBuffer);
