import axios from 'axios';
import instrumentService from './instrument.service.js';
import priceWebSocket from './priceWebSocket.js';
import { loginToAngelOne } from './angelOneLoginService.js';
import logger from '../utils/logger.js';

class ChartingService {
  /**
   * Main entry point to get real-time chart data for a signal
   */
  async getSignalChartData(signal) {
    try {
      // 1. Initialize Instruments if needed
      await instrumentService.init();

      // 2. Find Token
      const instrument = instrumentService.findToken(signal.symbol, signal.strike, signal.optionType);
      if (!instrument) {
        throw new Error(`Token not found for ${signal.symbol} ${signal.strike} ${signal.optionType}`);
      }

      logger.info(`🎯 Signal mapped to token: ${instrument.token} (${instrument.symbol})`);

      // 3. Subscribe to Live Updates
      priceWebSocket.addTokens([{
        exchangeType: parseInt(instrument.exch_seg === 'NFO' ? 2 : 1), // NFO=2, NSE=1
        tokens: [instrument.token],
        name: `${signal.symbol}_${signal.strike}_${signal.optionType}`
      }]);

      // 4. Fetch Historical Candle Data (1 min interval for last 2 hours)
      const historicalData = await this.getHistoricalCandles(instrument);

      return {
        instrument,
        historicalData,
        socketName: `${signal.symbol}_${signal.strike}_${signal.optionType}`
      };
    } catch (err) {
      logger.error('❌ ChartingService Error:', err.message);
      throw err;
    }
  }

  async getHistoricalCandles(instrument) {
    try {
      const loginData = await loginToAngelOne();
      const url = 'https://apiconnect.angelbroking.com/rest/intelligent/admin/v1/charts/candle';
      
      const toDate = new Date();
      const fromDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

      const formatDate = (date) => {
        return date.toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 16);
      };

      const body = {
        exchange: instrument.exch_seg,
        symboltoken: instrument.token,
        interval: "ONE_MINUTE",
        fromdate: formatDate(fromDate),
        todate: formatDate(toDate)
      };

      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-UserType": "USER",
        "X-SourceID": "WEB",
        "X-ClientLocalIP": "127.0.0.1",
        "X-ClientPublicIP": "127.0.0.1",
        "X-MACAddress": "00:00:00:00:00:00",
        "X-PrivateKey": process.env.SMARTAPI_KEY,
        "Authorization": `Bearer ${loginData.jwt}`
      };

      const res = await axios.post(url, body, { headers });
      
      if (res.data?.status === true) {
        // Angel format: [[timestamp, open, high, low, close, volume], ...]
        // Convert to { time, value } for line chart
        return res.data.data.map(candle => ({
          time: new Date(candle[0]).getTime() / 1000,
          value: candle[4]
        }));
      }
      
      return [];
    } catch (err) {
      logger.error('❌ Failed to fetch historical candles:', err.message);
      return [];
    }
  }
}

export default new ChartingService();
