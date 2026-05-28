import subscriptionsController from './subscriptions.controller.js';
import authenticate from '../../middlewares/authMiddleware.js';
import { routeCache } from '../../middlewares/cacheMiddleware.js';

export default async function (fastify, opts) {
  // Public routes cached for 5 minutes (300s)
  fastify.get('/packages', { preHandler: [routeCache(300)] }, subscriptionsController.getPackages);

  // User Protected routes
  fastify.post('/create-order', { preHandler: [authenticate] }, subscriptionsController.createOrder);
  fastify.post('/verify-payment', { preHandler: [authenticate] }, subscriptionsController.verifyPayment);
  fastify.get('/history', { preHandler: [authenticate] }, subscriptionsController.getUserSubscriptions);
}
