import axios from 'axios';

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    if (isLocal) {
      return `http://${hostname}:4000`;
    }
  }
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
};

export const getApiUrl = () => {
  return `${getBaseUrl()}/api/v1`;
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle session expirations
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Using client side routing redirection or window reload
      if (window.location.hash !== '#/login' && window.location.pathname !== '/login') {
        window.location.href = '/#/login';
      }
    }
  }
  return Promise.reject(error);
});

export default api;
