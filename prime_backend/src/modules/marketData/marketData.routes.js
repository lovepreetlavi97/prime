import priceWebSocket from '../../services/priceWebSocket.js';
import socketService from '../../loaders/socket.js';

const marketDataRoutes = async (fastify, options) => {
  
  // Get all current prices from Angel One API
  fastify.get('/prices', async (request, reply) => {
    try {
      // Only use real prices from Angel One WebSocket
      let prices = priceWebSocket.getAllPrices();
      
      // DEBUG: Log what we have
      console.log('📊 Current prices in WebSocket:', prices);
      
      const status = priceWebSocket.getConnectionStatus();
      
      return {
        success: true,
        data: {
          prices,
          connection: status,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch prices',
        message: error.message
      };
    }
  });

  // Broadcast prices from newBot to frontend via Socket.io
  fastify.post('/broadcast', async (request, reply) => {
    try {
      const priceData = request.body;
      
      console.log('📡 Broadcast received:', priceData.instrument, priceData.price);
      
      // Store in priceWebSocket for /prices endpoint
      if (priceData.instrument && priceData.price !== undefined) {
        priceWebSocket.prices[priceData.instrument] = priceData.price;
      }
      
      // Emit to all connected frontend clients via Socket.io
      const io = socketService.getIO();
      if (io) {
        // Broadcast to all clients
        io.emit('price_update', priceData);
        
        // Also emit to specific instrument room
        const room = `price_${priceData.instrument}`;
        io.to(room).emit('instrument_update', priceData);
      }
      
      return {
        success: true,
        message: 'Price broadcasted',
        data: priceData
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to broadcast price',
        message: error.message
      };
    }
  });

  // Get specific instrument price
  fastify.get('/prices/:instrument', async (request, reply) => {
    try {
      const { instrument } = request.params;
      const prices = priceWebSocket.getAllPrices();
      
      if (!prices[instrument]) {
        reply.code(404);
        return {
          success: false,
          error: 'Instrument not found',
          availableInstruments: Object.keys(prices)
        };
      }
      
      return {
        success: true,
        data: {
          instrument,
          ...prices[instrument]
        }
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch price',
        message: error.message
      };
    }
  });

  // Get connection status
  fastify.get('/status', async (request, reply) => {
    try {
      const status = priceWebSocket.getConnectionStatus();
      
      return {
        success: true,
        data: status
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to get status',
        message: error.message
      };
    }
  });

  // Get available instruments
  fastify.get('/instruments', async (request, reply) => {
    try {
      const instruments = [
        { name: 'NIFTY 50', token: '26000', exchange: 'NSE' },
        { name: 'NIFTY BANK', token: '26001', exchange: 'NSE' },
        { name: 'SENSEX', token: '1', exchange: 'BSE' },
        { name: 'INDIA VIX', token: '260105', exchange: 'NSE' },
        { name: 'USD-INR', token: '999999', exchange: 'BSE' }
      ];
      
      return {
        success: true,
        data: instruments
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch instruments',
        message: error.message
      };
    }
  });

};

export default marketDataRoutes;
