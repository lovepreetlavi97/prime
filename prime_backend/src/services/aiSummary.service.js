import logger from '../utils/logger.js';

/**
 * AI Summary Service
 * Generates user-friendly explanations and summaries.
 * Uses rule-based templates for zero cost, can be upgraded to LLM.
 */
class AiSummaryService {
  /**
   * Generate explanation for a signal score
   */
  async generateSignalExplanation(signal, scoringData) {
    const { trend, rsi, momentum, rating } = scoringData;
    
    const trendText = trend === 'UP' ? 'Strong Uptrend' : trend === 'DOWN' ? 'Bearish Downtrend' : 'Range-bound Market';
    const momentumText = momentum === 'HIGH' ? 'Fast Moving Market' : 'Steady Momentum';
    const strengthText = rsi > 60 ? 'Bullish Strength' : rsi < 40 ? 'Bearish Pressure' : 'Balanced Market';

    // Simple AI-like logic for user-friendly text
    let rationale = '';
    if (rating === 'PREMIUM') {
      rationale = `This setup is highly favorable because the ${trendText} aligns perfectly with ${momentumText}. Combined with ${strengthText}, the probability of hitting targets is high.`;
    } else if (rating === 'STRONG') {
      rationale = `Solid opportunity detected. ${trendText} is supporting the move, and ${momentumText} indicates active buyer/seller participation.`;
    } else if (rating === 'MEDIUM') {
      rationale = `Moderate setup. While ${trendText} is present, ${momentumText} is average. Proceed with standard caution.`;
    } else {
      rationale = `Weak setup detected. Market condition is currently ${trendText} with ${momentumText}. High volatility or trend misalignment might be present.`;
    }

    return rationale;
  }

  /**
   * Generate daily report summary
   */
  async generateDailyReport(results) {
    const { total, win, loss, accuracy } = results;
    
    // This could call an actual LLM if API key exists
    return `Today's performance was ${accuracy}% with ${win} successful trades out of ${total}. The market exhibited strong trending behavior in the second half.`;
  }
}

export default new AiSummaryService();
