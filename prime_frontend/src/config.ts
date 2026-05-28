/**
 * DYNAMIC CONFIGURATION SYSTEM
 * Ensures the app works on localhost, 127.0.0.1, and local network IPs (192.168.x.x)
 */

export const getBaseUrl = () => {
    // Priority 1: Check if we are running in a local browser environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
        
        if (isLocal) {
            return `http://${hostname}:4000`;
        }
    }

    // Priority 2: In production, use the environment variables
    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
        return process.env.NEXT_PUBLIC_SOCKET_URL;
    }

    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '');
    }

    return 'http://localhost:4000';
};

export const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
        if (isLocal) return `http://${hostname}:4000/api/v1`;
    }
    return process.env.NEXT_PUBLIC_API_URL || `${getBaseUrl()}/api/v1`;
};
export const API_URL = getApiUrl();
export const SOCKET_URL = getBaseUrl();

export const SOCKET_CONFIG = {
    path: '/socket.io',
    transports: ['websocket', 'polling'], // Allow fallback for mobile browsers
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 100,
};
