import { sendOtp, verifyOtp, logoutAllDevices, adminLogin } from './auth.controller.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

export default async function (fastify) {
  fastify.post('/send-otp', {
    schema: {
      body: {
        type: 'object',
        required: ['phone'],
        properties: {
          phone: { type: 'string', minLength: 10 }
        }
      }
    }
  }, sendOtp);

  fastify.post('/verify-otp', {
    schema: {
      body: {
        type: 'object',
        required: ['phone', 'otp'],
        properties: {
          phone: { type: 'string' },
          otp: { type: 'string', minLength: 4, maxLength: 6 }
        }
      }
    }
  }, verifyOtp);

  fastify.post('/admin-login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', minLength: 5 },
          password: { type: 'string', minLength: 4 }
        }
      }
    }
  }, adminLogin);

  fastify.post('/logout-all', {
    preHandler: [authMiddleware]
  }, logoutAllDevices);
}


