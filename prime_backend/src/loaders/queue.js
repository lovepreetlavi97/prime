import { Queue, Worker } from 'bullmq';
import { cache, queue, pub } from './redis.js';
import { extractTextFromImage } from '../services/ocr.service.js';
import { parseSignal } from '../services/parser.service.js';
import signalsService from '../modules/signals/signals.service.js';
import Signal from '../models/Signal.js';
import socketService from './socket.js';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';
import signalMatcher from '../services/dhan/dhanSignalMatcher.js';

// Keep track of last seen symbol/strike/optionType per channel source for fallback context
const sourceContextCache = new Map();

// 🔥 PROD QUEUES
export const ingestionQueue = new Queue('ingestion-queue', { 
  connection: queue,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  }
});

/**
 * PRODUCTION WORKER
 * Implements "Exactly Once" processing logic where possible.
 */
export const startWorkers = () => {
  const worker = new Worker('ingestion-queue', async (job) => {
    const { type, data } = job.data;
    
    if (type === 'PROCESS_SIGNAL') {
      const { rawText, source, msgId, replyToMsgId, mediaBuffer } = data;
      
      // 1. Deduplication (Redis Lock)
      const lockKey = `signal:lock:${msgId}`;
      const isProcessing = await cache.set(lockKey, '1', 'NX', 'EX', 60);
      if (!isProcessing) return; // Signal already being processed

      // 🔥 RESTORE FULL HISTORICAL UPDATE LOGIC
      const normalizedText = (rawText || '').toUpperCase().trim();
      const text = rawText.toLowerCase();
      
      const isProfitBooking = ['profit', 'book kro', 'booked', 'target hit', 'book full', 'book partially', 'target done', 'tgt hit'].some(k => text.includes(k));
      const isExit = ['exit', 'exit kro', 'close now', 'square off', 'closing', 'close at', 'cmp exit', 'exit here'].some(k => text.includes(k));
      const isSLHit = ['sl hit', 'stop loss', 'loss booked', 'sl done', 'hit sl'].some(k => text.includes(k));
      const isStatusUpdate = isProfitBooking || isExit || isSLHit || text.includes('close');
      
      const parsedContext = parseSignal(rawText);
      
      // 🔥 TRADING INTENT CLASSIFICATION LAYER (DEDICATED)
      let detectedIntent = 'NONE';
      const textForIntent = text.toLowerCase().trim();
      
      const intentKeywords = {
        BOOK_PROFIT: ['book profit', 'book kro', 'partial book', 'secure profit', 'booked', 'tgt done', 'profit book'],
        EXIT: ['exit', 'exit kro', 'close trade', 'square off', 'close now', 'exit now', 'exit guyz'],
        FAST_BUY: ['buy fast', 'fast buy', 'quick entry', 'entry fast', 'hero zero', 'rapid buy', 'quick buy'],
        SCALPING: ['scalp', 'scalping', 'quick scalp']
      };

      for (const [intent, keywords] of Object.entries(intentKeywords)) {
        if (keywords.some(k => textForIntent.includes(k))) {
          detectedIntent = intent;
          break;
        }
      }


      const numbers = text.match(/\d+(?:\.\d+)?/g);
      const hasPrices = numbers && numbers.length > 0;

      if ((isStatusUpdate || hasPrices || replyToMsgId || detectedIntent !== 'NONE') && !mediaBuffer) {
        let signalToUpdate = null;
        
        // 1. Try Reply-To Lookup
        if (replyToMsgId) {
          signalToUpdate = await Signal.findOne({ telegramMessageId: replyToMsgId }).sort({ createdAt: -1 });
        }
        
        // 2. Fallback: Context Lookup (Symbol)
        if (!signalToUpdate && parsedContext.symbol) {
          signalToUpdate = await Signal.findOne({ 
             symbol: parsedContext.symbol, 
             status: { $in: ['ACTIVE', 'TARGET_HIT', 'PROFIT'] } 
          }).sort({ createdAt: -1 });
        }
        
        // 3. Fallback: Latest active from source
        if (!signalToUpdate) {
          signalToUpdate = await Signal.findOne({ 
            source, 
            status: { $in: ['ACTIVE', 'TARGET_HIT', 'PROFIT'] } 
          }).sort({ createdAt: -1 });
        }

        if (signalToUpdate) {
          // 🔥 DEDICATED TRADING ALERT EMISSION (ISOALTED)
          if (detectedIntent !== 'NONE') {
            const alertPayload = {
              intent: detectedIntent,
              priority: detectedIntent === 'FAST_BUY' ? 'HIGH' : 'NORMAL',
              signalId: signalToUpdate._id,
              timestamp: Date.now(),
              rawMessage: rawText
            };

            socketService.emitGlobal('trading_alert', alertPayload);
            
            logger.info({
              msgType: 'TRADING_INTENT_CLASSIFICATION',
              ...alertPayload
            }, `🔔 Trading Alert Emitted: ${detectedIntent}`);
            
            // Optionally update intent on the model for historical reference
            await Signal.findByIdAndUpdate(signalToUpdate._id, { intent: detectedIntent });
          }

          // --- STATUS UPDATER (Canonical State Flow) ---
          if (isStatusUpdate) {
            let newStatus = 'CLOSED';
            if (isProfitBooking) newStatus = 'CLOSED_PROFIT';
            else if (isSLHit) newStatus = 'SL_HIT';
            else if (isExit) newStatus = 'EXIT_ALERT';

            const updated = await signalsService.closeSignal(signalToUpdate._id, newStatus);
            if (updated) {
               socketService.emitGlobal('update_signal', updated);
            }
            logger.info(`🚨 Status Updated: ${newStatus} for ${signalToUpdate.symbol} [Intent: ${detectedIntent}]`);
            return;
          }


          // --- PRICE UPDATER ---
          if (hasPrices) {
            const prices = numbers.map(n => parseFloat(n)).filter(n => n > (signalToUpdate.entry * 0.5) && n < 5000);
            if (prices.length > 0) {
              const newPrice = prices[prices.length - 1];
              const maxTarget = Math.max(...(signalToUpdate.targets || [0]));
              
              // 🔥 Auto-Target Expansion
              if (newPrice > maxTarget && newPrice < 5000) {
                 await signalsService.addTarget(signalToUpdate._id, newPrice);
              }
              
              const updated = await signalsService.updateSignalPrice(signalToUpdate._id, newPrice, true);
              if (updated) {
                socketService.emitGlobal('update_signal', { ...updated.toObject(), intent: detectedIntent });
              }
              logger.info(`📈 Price Update: ${newPrice} for ${signalToUpdate.symbol}`);
              return;
            }
          }

        }
      }

      let finalData = parseSignal(rawText);
      
      try {
        if (mediaBuffer) {
          const buffer = Buffer.from(mediaBuffer, 'base64');
          
          if (buffer.length > 50000) {
            logger.info(`[Worker] 🖼️ Processing Media Signal (${buffer.length} bytes)`);
            const ocrText = await extractTextFromImage(buffer);
            const ocrData = parseSignal(ocrText);
            
            // 🔥 SMART MERGE: Only overwrite if OCR found a better value
            Object.keys(ocrData).forEach(key => {
              if (ocrData[key] !== null && ocrData[key] !== undefined && 
                  (Array.isArray(ocrData[key]) ? ocrData[key].length > 0 : true) &&
                  ocrData[key] !== 'NONE' && ocrData[key] !== 0) {
                finalData[key] = ocrData[key];
              }
            });
          } else {
            logger.info(`[Worker] ⏭️ Skipping tiny media asset (${buffer.length} bytes)`);
          }
        }

        // Context Cache Logic: If symbol exists, update cache. Otherwise, fallback to cached symbol.
        if (finalData.symbol) {
          sourceContextCache.set(source, {
            symbol: finalData.symbol,
            strike: finalData.strike,
            optionType: finalData.optionType,
            timestamp: Date.now()
          });
        } else {
          const cached = sourceContextCache.get(source);
          if (cached && (Date.now() - cached.timestamp < 10 * 60 * 1000)) { // 10 minutes window
            finalData.symbol = cached.symbol;
            if (!finalData.strike) finalData.strike = cached.strike;
            if (finalData.optionType === 'NONE' || !finalData.optionType) {
              finalData.optionType = cached.optionType;
              finalData.type = cached.optionType === 'CE' ? 'BUY' : 'SELL';
            }
            logger.info(`[Worker] 🔄 Context recovered for missing symbol from cache: ${finalData.symbol}`);
          } else {
            // Ultimate fallback to NIFTY CE if no cached context is available
            finalData.symbol = 'NIFTY';
            finalData.optionType = 'CE';
            finalData.type = 'BUY';
            logger.info(`[Worker] 🔄 No context cache found, defaulting missing symbol to NIFTY`);
          }
        }

        // 2. Validation: Ensure we have enough data to create a valid signal
        if (!finalData.symbol || !finalData.entry || !finalData.sl) {
          logger.warn(`[Worker] ⏭️ Skipping invalid signal: Missing ${[!finalData.symbol && 'Symbol', !finalData.entry && 'Entry', !finalData.sl && 'SL'].filter(Boolean).join(', ')}`);
          return;
        }

        // Match with Dhan Live technical Indicators & Scalper bias
        const matchingResults = signalMatcher.matchAndSecure(finalData, rawText);
        const enrichedData = {
          ...finalData,
          ...matchingResults
        };

        // 3. Persist to DB
        const saved = await signalsService.createSignal(rawText, source, {
          ...enrichedData,
          telegramMessageId: String(msgId)
        });


        // 🔥 RESTORE IMAGE UPLOAD FUNCTIONALITY
        if (mediaBuffer) {
          const buffer = Buffer.from(mediaBuffer, 'base64');
          const fileName = `signal_${saved._id}.jpg`;
          const uploadDir = path.join(process.cwd(), 'uploads');
          
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, buffer);
          
          await Signal.findByIdAndUpdate(saved._id, { 
            imageUrl: `/api/v1/signals/image/${fileName}` 
          });
          
          logger.info(`📸 [WORKER] Image Persisted: ${fileName}`);
        }

        logger.info(`🚀 [WORKER] Signal Processed: ${saved.symbol}`);

      } catch (err) {
        logger.error(`[Worker] Failed to process signal: ${err.message}`);
        throw err; // Trigger BullMQ retry
      }
    }
  }, { 
    connection: queue,
    concurrency: 4 // 🔥 Scale horizontally based on CPU
  });
};
