import aiController from './ai.controller.js';

export default async function aiRoutes(fastify, options) {
  // Public or auth route? Let's make market sentiment optionally auth
  fastify.addHook('preValidation', fastify.authenticateOptional);

  fastify.get('/sentiment', aiController.getMarketSentiment);
}
