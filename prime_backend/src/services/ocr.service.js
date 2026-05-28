import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * OCR Service - Worker Thread Implementation
 * Prevents CPU contention and event loop blocking.
 */
export const extractTextFromImage = (imageBuffer) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'ocr.worker.js'), {
      workerData: { imageBuffer }
    });

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error('OCR Timeout after 30s'));
    }, 30000);

    worker.on('message', (result) => {
      clearTimeout(timeout);
      if (result.success) resolve(result.text);
      else reject(new Error(result.error));
    });

    worker.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
    
    worker.on('exit', (code) => {
      clearTimeout(timeout);
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};
