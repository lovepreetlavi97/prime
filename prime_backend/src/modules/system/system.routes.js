import { getBootstrapData, getSystemHealth } from './system.controller.js';

export default async function (fastify, opts) {
  fastify.get('/bootstrap', {
    preHandler: [fastify.authenticateOptional] 
  }, getBootstrapData);

  fastify.get('/monitor', getSystemHealth);
}

