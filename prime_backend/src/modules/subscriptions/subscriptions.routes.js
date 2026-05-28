import subscriptionsController from './subscriptions.controller.js';
import authenticate from '../../middlewares/authMiddleware.js';

export default async function (fastify, opts) {
  // Public routes
  fastify.get('/packages', subscriptionsController.getPackages);

  // User Protected routes
  fastify.post('/create-order', { preHandler: [authenticate] }, subscriptionsController.createOrder);
  fastify.post('/verify-payment', { preHandler: [authenticate] }, subscriptionsController.verifyPayment);
  fastify.get('/history', { preHandler: [authenticate] }, subscriptionsController.getUserSubscriptions);
}
