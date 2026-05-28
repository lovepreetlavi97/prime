import * as controller from './homeContent.controller.js';
// Pre-handler for admin routes could be added here if needed

export default async function (fastify, opts) {
  // Public route
  fastify.get('/', controller.getHomeContent);
  
  // Admin-only (should ideally have auth middleware)
  fastify.put('/', controller.updateHomeContent);
  
  // Recovery/Seeding
  fastify.post('/seed', controller.seedHomeContent);
}
