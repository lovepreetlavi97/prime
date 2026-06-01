import { getMe, updateProfile, updateFcmToken } from './users.controller.js';
import authenticate from '../../middlewares/authMiddleware.js';

export default async function (fastify) {
  fastify.get('/me', { preHandler: [authenticate] }, getMe);
  fastify.post('/update', { preHandler: [authenticate] }, updateProfile);
  fastify.post('/fcm-token', { preHandler: [authenticate] }, updateFcmToken);
}
