import * as controller from './homeContent.controller.js';
import { routeCache } from '../../middlewares/cacheMiddleware.js';

export default async function (fastify, opts) {
  // Public route cached for 60 seconds
  fastify.get('/', { preHandler: [routeCache(60)] }, controller.getHomeContent);
  
  // Admin-only (should ideally have auth middleware)
  fastify.put('/', controller.updateHomeContent);
  
  // Recovery/Seeding
  fastify.post('/seed', controller.seedHomeContent);
}
