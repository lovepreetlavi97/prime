/**
 * LVPRIMEX — Dhan REST API Client
 * Handles all HTTP requests to the Dhan Market Data API.
 * Docs: https://dhanhq.co/docs/v2/
 *
 * Includes built-in availability tracking and auto-recovery polling.
 * When Dhan is unavailable, isDhanAvailable() returns false so callers
 * can switch to FALLBACK mode instead of silently failing.
 */

import logger from '../../utils/logger.js';

// ─── API Health Tracker ───────────────────────────────────────────────────────
class DhanApiHealth {
  constructor() {
    this._available     = false;   // Starts as unknown/offline until first probe succeeds
    this._lastProbe     = 0;
    this._probeInterval = null;
    this._recoveryCallbacks = [];  // Called when API comes back online
    this._isMockEnv     = false;

    // Detect mock credentials immediately
    const clientId   = process.env.DHAN_CLIENT_ID;
    const token      = process.env.DHAN_ACCESS_TOKEN;
    this._isMockEnv  = !clientId || !token
      || clientId === 'mock_client_id'
      || token    === 'mock_access_token';

    if (this._isMockEnv) {
      logger.warn('[DhanHealth] ⚠️  Mock credentials detected — Dhan API will stay OFFLINE.');
    } else {
      // Start probe cycle once module loads
      this._startProbing();
    }
  }

  /** Register a one-time callback that fires when API comes back online */
  onRecovery(fn) {
    this._recoveryCallbacks.push(fn);
  }

  isDhanAvailable() {
    return !this._isMockEnv && this._available;
  }

  /** Perform a lightweight health probe against the Dhan API */
  async probe() {
    if (this._isMockEnv) return false;
    try {
      const res = await fetch(`${DHAN_BASE_URL}/marketfeed/quote`, {
        method:  'POST',
        headers: buildHeaders(),
        body:    JSON.stringify({ NSE_IDX: ['13'] }),
        signal:  AbortSignal.timeout(6000),
      });
      const wasDown = !this._available;
      this._available = res.ok || res.status === 400; // 400 = bad payload but API is UP
      this._lastProbe = Date.now();

      if (wasDown && this._available) {
        logger.info('[DhanHealth] ✅ Dhan API back ONLINE — triggering recovery callbacks');
        const cbs = this._recoveryCallbacks.splice(0);
        cbs.forEach(fn => { try { fn(); } catch (_) {} });
      }
    } catch (_) {
      this._available = false;
      this._lastProbe = Date.now();
    }
    return this._available;
  }

  _startProbing() {
    // Probe immediately, then every 60s while down / every 300s while up
    this.probe();
    this._probeInterval = setInterval(() => {
      const interval = this._available ? 300_000 : 60_000;
      if (Date.now() - this._lastProbe >= interval) this.probe();
    }, 15_000);
  }
}

const dhanHealth = new DhanApiHealth();
export { dhanHealth };
export const isDhanAvailable    = () => dhanHealth.isDhanAvailable();
export const onDhanRecovery     = (fn) => dhanHealth.onRecovery(fn);

const DHAN_BASE_URL = 'https://api.dhan.co/v2';

// Underlying spot price lookup security IDs (Dhan NSE_IDX tokens)
export const SPOT_SECURITY_IDS = {
  NIFTY: { securityId: '13', exchangeSegment: 'NSE_IDX' },
  BANKNIFTY: { securityId: '25', exchangeSegment: 'NSE_IDX' },
  FINNIFTY: { securityId: '27', exchangeSegment: 'NSE_IDX' },
  SENSEX: { securityId: '1', exchangeSegment: 'BSE_IDX' },
  MIDCPNIFTY: { securityId: '442', exchangeSegment: 'NSE_IDX' },
};

function buildHeaders() {
  return {
    'Content-Type': 'application/json',
    'access-token': process.env.DHAN_ACCESS_TOKEN,
    'client-id': process.env.DHAN_CLIENT_ID,
    'Accept': 'application/json',
  };
}

async function dhanFetch(path, options = {}) {
  const url = `${DHAN_BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...buildHeaders(),
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      logger.warn(`[DhanAPI] ❌ ${options.method || 'GET'} ${path} → ${res.status}: ${errText.slice(0, 200)}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    logger.error(`[DhanAPI] 💥 Request failed: ${err.message}`);
    return null;
  }
}

// ─── Market Quote (LTP + OHLCV) ───────────────────────────────────────────────
export async function getMarketQuote(exchangeSegment, securityId) {
  return dhanFetch('/marketfeed/quote', {
    method: 'POST',
    body: JSON.stringify({
      NSE_IDX: exchangeSegment === 'NSE_IDX' ? [securityId] : undefined,
      BSE_IDX: exchangeSegment === 'BSE_IDX' ? [securityId] : undefined,
      NSE_FNO: exchangeSegment === 'NSE_FNO' ? [securityId] : undefined,
    }),
  });
}

// ─── Full Market Data (Quote + Depth) ─────────────────────────────────────────
export async function getFullMarketData(exchangeSegment, securityId) {
  const body = {};
  body[exchangeSegment] = [securityId];
  return dhanFetch('/marketfeed/full', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ─── Historical Candles (Daily/Intraday) ──────────────────────────────────────
export async function getHistoricalCandles({ securityId, exchangeSegment, instrumentType, expiryCode, fromDate, toDate }) {
  return dhanFetch('/charts/historical', {
    method: 'POST',
    body: JSON.stringify({
      securityId,
      exchangeSegment,
      instrument: instrumentType || 'INDEX',
      expiryCode: expiryCode || 0,
      oi: false,
      fromDate,
      toDate,
    }),
  });
}

// ─── Option Chain ──────────────────────────────────────────────────────────────
export async function getOptionChain(underlyingSymbol, expiryDate) {
  return dhanFetch('/optionchain', {
    method: 'POST',
    body: JSON.stringify({
      UnderlyingScrip: underlyingSymbol.toUpperCase() === 'BANKNIFTY' ? 25 : 13,
      UnderlyingSeg: 'IDX_I',
      Expiry: expiryDate, // Format: "YYYY-MM-DD"
    }),
  });
}

// ─── Option Chain Expiry List ──────────────────────────────────────────────────
export async function getExpiryList(underlyingSymbol) {
  const scrip = underlyingSymbol.toUpperCase() === 'BANKNIFTY' ? 25 : 13;
  return dhanFetch(`/optionchain/expirylist?UnderlyingScrip=${scrip}&UnderlyingSeg=IDX_I`);
}

// ─── Greeks & IV (Option Quote) ───────────────────────────────────────────────
export async function getOptionGreeks(securityId) {
  return dhanFetch('/optionchain/optiongreeks', {
    method: 'POST',
    body: JSON.stringify({ SecurityId: [securityId] }),
  });
}
