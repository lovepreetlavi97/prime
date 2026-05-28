import { initTelegramListener } from '../../services/telegram.service.js';
import { extractTextFromImage } from '../../services/ocr.service.js';
import { parseSignal } from '../../services/parser.service.js';
import signalsService from '../signals/signals.service.js';
import Signal from '../../models/Signal.js';
import logger from '../../utils/logger.js';
import chartingService from '../../services/charting.service.js';
import indicatorService from '../../services/indicator.service.js';
import scoreEngineService from '../../services/scoreEngine.service.js';
import aiSummaryService from '../../services/aiSummary.service.js';
import instrumentService from '../../services/instrument.service.js';
import fs from 'fs';
import path from 'path';
import { ingestionQueue } from '../../loaders/queue.js';

/**
 * Telegram Listener Module
 */
export const startTelegramIntegration = async () => {
  if (!process.env.TELEGRAM_API_ID || !process.env.TELEGRAM_API_HASH) {
    logger.warn('⚠️ Telegram API credentials missing.');
    return;
  }

  try {
    const enrichAndSaveSignal = async (rawText, source, baseData, msgId, mediaBuffer = null) => {
      try {
        const saved = await signalsService.createSignal(rawText, source, { 
          ...baseData, 
          telegramMessageId: String(msgId) 
        });
        
        if (mediaBuffer) {
          const fileName = `signal_${saved._id}.jpg`;
          const filePath = path.join(process.cwd(), 'uploads', fileName);
          fs.writeFileSync(filePath, mediaBuffer);
          await Signal.findByIdAndUpdate(saved._id, { imageUrl: `/api/v1/signals/image/${fileName}` });
        }

        logger.info(`🚀 SIGNAL CREATED: ${saved.symbol} (ID: ${saved._id})`);

        // Enrichment can stay in background
        (async () => {
          try {
            const underlying = instrumentService.findUnderlyingToken(saved.symbol || 'NIFTY');
            const candles = await chartingService.getHistoricalCandles(underlying);
            const indicators = indicatorService.calculateIndicators(candles || []);
            const scoring = scoreEngineService.generateScore(indicators, saved, rawText);
            const rationale = await aiSummaryService.generateSignalExplanation(saved, scoring);
            await Signal.findByIdAndUpdate(saved._id, { ...scoring, aiRationale: rationale });
          } catch (e) {}
        })();

        return saved;
      } catch (err) {
        logger.error('❌ enrichAndSaveSignal Failed', err);
      }
    };

    await initTelegramListener(async (message) => {
      const rawText = message.message || '';
      const source = message.source || 'TELEGRAM';
      const msgId = String(message.id);
      
      // 🔥 PRODUCTION SCALING: Immediately push to queue and free up listener
      // Allow shorter messages (>= 2 chars) to catch price updates like "40", "99"
      if (message.mediaBuffer || (rawText && rawText.trim().length >= 2)) {
        const replyToMsgId = message.replyTo?.replyToMsgId || null;
        
        await ingestionQueue.add('PROCESS_SIGNAL', {
          type: 'PROCESS_SIGNAL',
          data: {
            rawText,
            source,
            msgId,
            replyToMsgId: replyToMsgId ? String(replyToMsgId) : null,
            mediaBuffer: message.mediaBuffer ? message.mediaBuffer.toString('base64') : null
          }
        }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 }
        });
        
        logger.info(`[Telegram] ⚡ Signal offloaded to Ingestion Queue: ${msgId} (ReplyTo: ${replyToMsgId || 'None'})`);
      }
    });

  } catch (err) {
    logger.error(`🔥 Telegram Integration Failed: ${err.message}`, err);
  }
};
