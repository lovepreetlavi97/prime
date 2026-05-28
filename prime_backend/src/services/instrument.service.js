import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import logger from '../utils/logger.js';

const INSTRUMENT_URL = 'https://images.dhan.co/api-data/api-scrip-master.csv';
const CACHE_PATH = path.join(process.cwd(), 'uploads', 'instruments.json');

class InstrumentService {
  constructor() {
    this.instruments = [];
    this.indexedInstruments = new Map(); // O(1) Lookup Cache
    this.lastUpdated = null;
  }

  /**
   * Loads instruments from cache or downloads if missing/stale
   */
  async init() {
    try {
      if (await fs.exists(CACHE_PATH)) {
        const stats = await fs.stat(CACHE_PATH);
        const ageInHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

        if (ageInHours < 24) {
          logger.info('📦 Loading Dhan instruments from cache...');
          this.instruments = await fs.readJson(CACHE_PATH);
          this.buildIndex();
          return;
        }
      }

      await this.refreshCache();
    } catch (err) {
      logger.error('❌ Failed to initialize Dhan InstrumentService:', err.message);
      // Fallback in case of network failures or ECONNRESET
      if (await fs.exists(CACHE_PATH)) {
        logger.info('📦 Fallback: Loading stale Dhan instruments cache...');
        this.instruments = await fs.readJson(CACHE_PATH);
        this.buildIndex();
      }
    }
  }

  buildIndex() {
    logger.info('🏗️ Building Dhan Instrument Index...');
    this.indexedInstruments.clear();
    this.instruments.forEach(inst => {
      // Index by Name + Strike + OptionType
      const strike = parseFloat(inst.strike);
      const key = `${inst.name}_${strike}_${inst.optionType}`.toUpperCase();
      
      if (!this.indexedInstruments.has(key)) {
        this.indexedInstruments.set(key, []);
      }
      this.indexedInstruments.get(key).push(inst);
    });
    logger.info(`✅ Index Built: ${this.indexedInstruments.size} unique keys.`);
  }

  async refreshCache() {
    try {
      logger.info('📡 Downloading fresh instrument list from DhanHQ...');
      const response = await axios.get(INSTRUMENT_URL, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      // Parse CSV line by line
      const lines = response.data.split('\n');
      if (lines.length < 2) throw new Error('Empty CSV downloaded');

      const parsed = [];
      const headers = lines[0].split(',').map(h => h.trim());
      
      const tokenIdx = headers.indexOf('SEM_SMST_SECURITY_ID');
      const symbolIdx = headers.indexOf('SEM_TRADING_SYMBOL');
      const nameIdx = headers.indexOf('SM_SYMBOL_NAME');
      const strikeIdx = headers.indexOf('SEM_STRIKE_PRICE');
      const optTypeIdx = headers.indexOf('SEM_OPTION_TYPE');
      const expiryIdx = headers.indexOf('SEM_EXPIRY_DATE');
      const exchIdx = headers.indexOf('SEM_EXM_EXCH_ID');
      const segmentIdx = headers.indexOf('SEM_SEGMENT');
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const cols = line.split(',');
        if (cols.length < headers.length) continue;
        
        const exch = cols[exchIdx]?.trim();
        const segment = cols[segmentIdx]?.trim();
        let exchSeg = 'NSE_EQ';
        
        if (exch === 'NSE') {
          exchSeg = segment === 'D' ? 'NSE_FNO' : 'NSE_EQ';
        } else if (exch === 'BSE') {
          exchSeg = segment === 'D' ? 'BSE_FNO' : 'BSE_EQ';
        }
        
        parsed.push({
          token: cols[tokenIdx]?.trim(),
          symbol: cols[symbolIdx]?.trim(),
          name: cols[nameIdx]?.trim(),
          strike: parseFloat(cols[strikeIdx]?.trim() || '0'),
          optionType: cols[optTypeIdx]?.trim(),
          expiry: cols[expiryIdx]?.trim(),
          exch_seg: exchSeg
        });
      }
      
      this.instruments = parsed;
      await fs.ensureDir(path.dirname(CACHE_PATH));
      await fs.writeJson(CACHE_PATH, this.instruments);
      this.buildIndex();
      logger.info(`✅ Cached ${this.instruments.length} Dhan instruments locally.`);
    } catch (err) {
      logger.error('❌ Failed to refresh instrument cache:', err.message);
      throw err;
    }
  }

  /**
   * Find a specific instrument token - OPTIMIZED O(1)
   */
  findToken(symbol, strike, optionType) {
    if (!this.instruments.length) return null;

    const nameMatch = (symbol.toUpperCase() === 'SENSEX') ? 'BSX' : 
                     (symbol.toUpperCase() === 'NIFTY') ? 'NIFTY' : symbol.toUpperCase();
    const typeMatch = optionType.toUpperCase();
    
    // Try direct lookup with multiple strike representations
    const keys = [
      `${nameMatch}_${strike}_${typeMatch}`,
      `${nameMatch}_${strike * 100}_${typeMatch}`,
      `${nameMatch}_${strike * 1000}_${typeMatch}`
    ];

    for (const key of keys) {
      const matches = this.indexedInstruments.get(key);
      if (matches && matches.length > 0) {
        // Sort by nearest expiry
        const best = matches.sort((a, b) => this.parseExpiry(a.expiry) - this.parseExpiry(b.expiry))[0];
        logger.info(`✅ Dhan Indexed Token Found: ${best.token} for ${best.symbol}`);
        return best;
      }
    }

    logger.warn(`❌ No indexed Dhan match for ${symbol} strike ${strike} ${optionType}`);
    return null;
  }

  /**
   * Find the underlying index token (NIFTY/BANKNIFTY)
   * @param {string} symbol - NIFTY / BANKNIFTY
   */
  findUnderlyingToken(symbol) {
    const nameMatch = symbol.toUpperCase();
    if (nameMatch === 'NIFTY') return { token: '13', exch_seg: 'NSE_IDX', symbol: 'NIFTY' };
    if (nameMatch === 'BANKNIFTY') return { token: '25', exch_seg: 'NSE_IDX', symbol: 'BANKNIFTY' };
    if (nameMatch === 'FINNIFTY') return { token: '27', exch_seg: 'NSE_IDX', symbol: 'FINNIFTY' };
    if (nameMatch === 'SENSEX') return { token: '99926000', exch_seg: 'BSE_IDX', symbol: 'SENSEX' };
    return { token: '13', exch_seg: 'NSE_IDX', symbol: 'NIFTY' }; // Default to NIFTY
  }

  parseExpiry(expiryStr) {
    if (!expiryStr) return Infinity;
    try {
      // Dhan usually gives "YYYY-MM-DD HH:MM:SS" or similar
      return new Date(expiryStr).getTime();
    } catch (e) {
      return Infinity;
    }
  }
}

const instrumentService = new InstrumentService();
export default instrumentService;
