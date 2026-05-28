import priceWebSocket from '../../services/priceWebSocket.js';
import socketService from '../../loaders/socket.js';
import { routeCache } from '../../middlewares/cacheMiddleware.js';

// ⚡ Static instrument list - no need to recreate on every request
const INSTRUMENTS = [
  { name: 'NIFTY 50', token: '26000', exchange: 'NSE' },
  { name: 'NIFTY BANK', token: '26001', exchange: 'NSE' },
  { name: 'SENSEX', token: '1', exchange: 'BSE' },
  { name: 'INDIA VIX', token: '260105', exchange: 'NSE' },
  { name: 'USD-INR', token: '999999', exchange: 'BSE' }
];

const marketDataRoutes = async (fastify, options) => {
  
  // Get all current prices — cached for 2 seconds (high-frequency endpoint)
  fastify.get('/prices', { preHandler: [routeCache(2)] }, async (request, reply) => {
    try {
      const prices = priceWebSocket.getAllPrices();
      const status = priceWebSocket.getConnectionStatus();
      
      return {
        success: true,
        data: { prices, connection: status, timestamp: new Date().toISOString() }
      };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to fetch prices', message: error.message };
    }
  });

  // Broadcast prices from external bot to frontend via Socket.io
  fastify.post('/broadcast', async (request, reply) => {
    try {
      const priceData = request.body;
      
      // Store in priceWebSocket for /prices endpoint
      if (priceData.instrument && priceData.price !== undefined) {
        priceWebSocket.prices[priceData.instrument] = priceData.price;
      }
      
      // Emit to all connected frontend clients via Socket.io
      const io = socketService.getIO();
      if (io) {
        io.emit('price_update', priceData);
        io.to(`price_${priceData.instrument}`).emit('instrument_update', priceData);
      }
      
      return { success: true, message: 'Price broadcasted', data: priceData };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to broadcast price', message: error.message };
    }
  });

  // Get specific instrument price — short cache to reduce DB overhead
  fastify.get('/prices/:instrument', { preHandler: [routeCache(2)] }, async (request, reply) => {
    try {
      const { instrument } = request.params;
      const prices = priceWebSocket.getAllPrices();
      
      if (!prices[instrument]) {
        reply.code(404);
        return { success: false, error: 'Instrument not found', availableInstruments: Object.keys(prices) };
      }
      
      return { success: true, data: { instrument, ...prices[instrument] } };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to fetch price', message: error.message };
    }
  });

  // Get connection status — cached for 5 seconds
  fastify.get('/status', { preHandler: [routeCache(5)] }, async (request, reply) => {
    try {
      const status = priceWebSocket.getConnectionStatus();
      return { success: true, data: status };
    } catch (error) {
      reply.code(500);
      return { success: false, error: 'Failed to get status', message: error.message };
    }
  });

  // ⚡ Get available instruments — static data, cache for 10 minutes
  fastify.get('/instruments', { preHandler: [routeCache(600)] }, async (request, reply) => {
    return { success: true, data: INSTRUMENTS };
  });

};

export default marketDataRoutes;
