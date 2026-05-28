import { io, Socket } from 'socket.io-client';
import { getBaseUrl } from './api';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;
    let userId = 'mock-admin-id';
    
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userId = userObj.id || userObj._id || userId;
      } catch (e) {
        // ignore
      }
    }

    socket = io(getBaseUrl(), {
      transports: ['websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: {
        token,
        userId,
        tier: 'elite', // Ensure admin joins elite signals room
      },
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
