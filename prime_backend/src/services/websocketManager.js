import { connectWebSocket, getStrategyState, getTraderService } from './angelOneWebSocket.js';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async initialize(feedToken, jwt, clientCode, wsUrl = 'wss://smartapisocket.angelbroking.com/websocket') {
    try {
      this.ws = await connectWebSocket(feedToken, jwt, clientCode, wsUrl);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      console.log('🎯 WebSocket Manager initialized successfully');
      return this.ws;
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error.message);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  getStrategyData() {
    return getStrategyState();
  }

  getTraderData() {
    const trader = getTraderService();
    return {
      currentBalance: trader.getCurrentBalance(),
      openPositions: trader.getOpenPositions(),
      tradeHistory: trader.getTradeHistory()
    };
  }

  async disconnect() {
    if (this.ws) {
      this.ws.close();
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected');
    }
  }
}

export default new WebSocketManager();
