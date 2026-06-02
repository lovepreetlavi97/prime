import signalsController from './signals.controller.js';
import chartingController from './charting.controller.js';
import signalVerificationController from './signalVerification.controller.js';
import optionalAuth from '../../middlewares/optionalAuth.js';
import { routeCache } from '../../middlewares/cacheMiddleware.js';

export default async function (fastify, opts) {
  fastify.get('/', { preHandler: [optionalAuth, routeCache(15)] }, signalsController.getSignals);
  fastify.get('/stats', { preHandler: [optionalAuth, routeCache(30)] }, signalsController.getStats);
  fastify.post('/', signalsController.createSignal);
  fastify.get('/:id', signalsController.deleteSignal);
  fastify.post('/test', signalsController.testSignal);
  fastify.get('/image/:filename', signalsController.getImage);

  // 🧠 LVPRIMEX Institutional Signal Verification
  // POST /api/signals/verify  — body: { text } or { symbol, strike, optionType, entry, sl, targets }
  fastify.post('/verify', signalVerificationController.verifySignal);
  // GET /api/signals/verify/status — Dhan API health + pending reverification count
  fastify.get('/verify/status', signalVerificationController.getVerificationStatus);

  // New Charting Route
  fastify.get('/:signalId/chart', chartingController.getChartData);
}
