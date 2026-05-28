import aiService from './ai.service.js';

class AiController {
  async getMarketSentiment(request, reply) {
    try {
      const { market } = request.query; // 'nifty' or 'banknifty'
      
      const sentiment = await aiService.getMarketSentiment(market || 'nifty');
      reply.code(200).send({ success: true, data: sentiment });
    } catch (error) {
      request.log.error('Error fetching market sentiment:', error);
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
}

export default new AiController();
