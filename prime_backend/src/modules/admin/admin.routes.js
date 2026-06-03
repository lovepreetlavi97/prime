import adminController from './admin.controller.js';
import subscriptionsController from '../subscriptions/subscriptions.controller.js';

export default async function (fastify, opts) {
  fastify.log.info('🛡️ Admin Routes Registered');
  fastify.get('/stats', adminController.getStats);
  fastify.get('/feed', adminController.getLiveFeed);
  fastify.get('/users', adminController.getUsers);
  fastify.put('/users/:id', adminController.updateUser);
  fastify.delete('/users/:id', adminController.deleteUser);
  fastify.post('/users/:id/ban', adminController.toggleBanUser);

  // Package Management (Admin)
  fastify.get('/packages', subscriptionsController.getPackagesAdmin);
  fastify.post('/packages', subscriptionsController.createPackage);
  fastify.put('/packages/:id', subscriptionsController.updatePackage);
  fastify.delete('/packages/:id', subscriptionsController.deletePackage);
  
  // Instagram Automation
  fastify.post('/instagram/post-top-signal', adminController.postTopSignalToInstagram);

  // Push Notifications Dispatch
  fastify.post('/dispatch-notification', adminController.dispatchNotification);
}
