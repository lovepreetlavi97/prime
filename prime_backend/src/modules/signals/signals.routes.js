import signalsController from './signals.controller.js';
import chartingController from './charting.controller.js';
import optionalAuth from '../../middlewares/optionalAuth.js';

export default async function (fastify, opts) {
  fastify.get('/', { preHandler: [optionalAuth] }, signalsController.getSignals);
  fastify.get('/stats', { preHandler: [optionalAuth] }, signalsController.getStats);
  fastify.post('/', signalsController.createSignal);
  fastify.get('/:id', signalsController.deleteSignal);
  fastify.post('/test', signalsController.testSignal);
  fastify.get('/image/:filename', signalsController.getImage);
  
  // New Charting Route
  fastify.get('/:signalId/chart', chartingController.getChartData);
}
