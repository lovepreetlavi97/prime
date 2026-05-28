import { getBootstrapData, getSystemHealth } from './system.controller.js';
import * as cmsController from './cms.controller.js';

export default async function (fastify, opts) {
  fastify.get('/bootstrap', {
    preHandler: [fastify.authenticateOptional] 
  }, getBootstrapData);

  fastify.get('/monitor', getSystemHealth);

  // CMS Legal Documents
  fastify.get('/legal/:type', cmsController.getLegalDocument);
  fastify.put('/legal/:type', cmsController.updateLegalDocument);

  // Contact Us Submissions
  fastify.post('/contact', cmsController.createContactSubmission);
  fastify.get('/contact', cmsController.getContactSubmissions);
  fastify.put('/contact/:id/resolve', cmsController.resolveContactSubmission);
}

