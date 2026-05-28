import Signal from '../models/Signal.js';
import aiSummaryService from '../services/aiSummary.service.js';
import logger from '../utils/logger.js';

/**
 * Daily Report Job
 * Calculates performance and generates AI commentary.
 */
export const runDailyReport = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const signals = await Signal.find({
            createdAt: { $gte: today }
        });

        if (signals.length === 0) {
            logger.info('📊 No signals found for today. Skipping report.');
            return;
        }

        const closed = signals.filter(s => s.status.startsWith('CLOSED') || s.status === 'SL_HIT');
        const wins = closed.filter(s => s.status === 'CLOSED_PROFIT').length;
        const losses = closed.filter(s => s.status === 'SL_HIT').length;
        const accuracy = closed.length > 0 ? (wins / closed.length) * 100 : 0;

        const results = {
            total: signals.length,
            win: wins,
            loss: losses,
            accuracy: accuracy.toFixed(1)
        };

        const commentary = await aiSummaryService.generateDailyReport(results);

        logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        logger.info(`📊 DAILY PERFORMANCE REPORT`);
        logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        logger.info(`✅ Total Signals: ${results.total}`);
        logger.info(`🏆 Wins:          ${results.win}`);
        logger.info(`❌ Losses:        ${results.loss}`);
        logger.info(`🎯 Accuracy:      ${results.accuracy}%`);
        logger.info(`📝 AI summary:    ${commentary}`);
        logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

        return { results, commentary };
    } catch (err) {
        logger.error('❌ Daily Report Job Failed:', err.message);
    }
};
