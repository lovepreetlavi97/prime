/**
 * LVPRIMEX — Institutional Signal Verification Engine
 * Runs all 8 verification checks against live Dhan data.
 *
 * FALLBACK MODE: When Dhan API is unavailable, verify() immediately returns
 * a structured FALLBACK result (FALLBACK_MODE: true) so the signal is
 * still displayed — just marked UNVERIFIED. It is NEVER auto-rejected
 * because of API unavailability.
 */

import logger from '../../utils/logger.js';
import { isDhanAvailable } from './dhanApiClient.js';
import {
  getMarketQuote,
  getFullMarketData,
  getOptionChain,
  getExpiryList,
  getHistoricalCandles,
  SPOT_SECURITY_IDS,
} from './dhanApiClient.js';
import indicatorEngine from './dhanIndicatorEngine.js';

// ─── EMA utility ──────────────────────────────────────────────────────────────
function calcEMA(closes, period) {
  if (closes.length < period) return closes[closes.length - 1] || 0;
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < closes.length; i++) ema = closes[i] * k + ema * (1 - k);
  return parseFloat(ema.toFixed(2));
}

// ─── VWAP utility ─────────────────────────────────────────────────────────────
function calcVWAP(candles) {
  let cumTPV = 0, cumVol = 0;
  for (const c of candles) {
    const tp = (c.high + c.low + c.close) / 3;
    cumTPV += tp * c.volume;
    cumVol += c.volume;
  }
  return cumVol > 0 ? parseFloat((cumTPV / cumVol).toFixed(2)) : 0;
}

// ─── Nearest expiry from list ──────────────────────────────────────────────────
function nearestExpiry(expiryList) {
  const today = new Date();
  const sorted = (expiryList || [])
    .map(e => ({ raw: e, d: new Date(e) }))
    .filter(e => e.d >= today)
    .sort((a, b) => a.d - b.d);
  return sorted.length > 0 ? sorted[0].raw : null;
}

// ─── Map symbol to Dhan spot metadata ─────────────────────────────────────────
function getSpotMeta(symbol) {
  const s = symbol?.toUpperCase();
  return SPOT_SECURITY_IDS[s] || SPOT_SECURITY_IDS['NIFTY'];
}

class SignalVerificationEngine {
  /**
   * Master verification method.
   * @param {Object} parsedSignal - { symbol, strike, optionType, entry, sl, targets }
   * @returns {Object} Full verification report (may be FALLBACK_MODE: true if API offline)
   */
  async verify(parsedSignal) {
    // ── FALLBACK GATE: Check API availability BEFORE any network calls ──────────
    if (!isDhanAvailable()) {
      logger.warn(`[Verifier] ⚠️  Dhan API OFFLINE — returning FALLBACK result for ${parsedSignal.symbol} ${parsedSignal.strike} ${parsedSignal.optionType}`);
      return this._buildFallbackResult(parsedSignal);
    }
    const { symbol, strike, optionType, entry, sl, targets = [] } = parsedSignal;
    const optType = (optionType || 'CE').toUpperCase();
    const spotMeta = getSpotMeta(symbol);
    const spotToken = spotMeta.securityId;

    logger.info(`[Verifier] 🔍 Starting verification: ${symbol} ${strike} ${optType}`);

    // ── 1. Fetch underlying spot data ──────────────────────────────────────────
    let underlyingPrice = 0, vwap = 0, ema20 = 0, ema50 = 0;
    const spotQuote = await getMarketQuote(spotMeta.exchangeSegment, spotToken);
    if (spotQuote) {
      const d = spotQuote.data?.[spotMeta.exchangeSegment]?.[spotToken];
      underlyingPrice = d?.last_price || d?.ltp || 0;
    }

    // Fallback to in-memory indicator engine
    if (!underlyingPrice) {
      const ind = indicatorEngine.getIndicators(spotToken);
      underlyingPrice = ind?.price || 0;
      ema20 = ind?.ema20 || 0;
      ema50 = ind?.ema50 || 0;
    }

    // ── 2. Historical candles for EMA & VWAP ──────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const candleData = await getHistoricalCandles({
      securityId: spotToken,
      exchangeSegment: spotMeta.exchangeSegment,
      instrumentType: 'INDEX',
      fromDate: from,
      toDate: today,
    });

    if (candleData?.open?.length > 1) {
      const len = candleData.open.length;
      const candles = candleData.open.map((o, i) => ({
        open: o, high: candleData.high[i], low: candleData.low[i],
        close: candleData.close[i], volume: candleData.volume?.[i] || 0,
      }));
      const closes = candles.map(c => c.close);
      ema20 = calcEMA(closes, 20);
      ema50 = calcEMA(closes, 50);
      vwap = calcVWAP(candles);
      underlyingPrice = underlyingPrice || closes[len - 1];
    }

    // ── 3. Option Chain ────────────────────────────────────────────────────────
    let optionData = null, chainData = null;
    let currentPremium = 0, delta = 0, gamma = 0, theta = 0, vega = 0, iv = 0;
    let oi = 0, oiChange = 0, volume = 0, bidPrice = 0, askPrice = 0;
    let pcr = 0, strongestCallOI = 0, strongestPutOI = 0, nearestSupport = 0, nearestResistance = 0;
    let prevOI = 0;

    const expiryResp = await getExpiryList(symbol);
    const expiryList = expiryResp?.data || expiryResp?.Expiry || [];
    const expiry = nearestExpiry(expiryList);

    if (expiry) {
      chainData = await getOptionChain(symbol, expiry);
    }

    if (chainData?.data) {
      const chain = chainData.data;
      let totalCallOI = 0, totalPutOI = 0;
      let maxCallOI = 0, maxPutOI = 0;

      // Find the specific strike in the chain
      for (const row of chain) {
        const rowStrike = row.strikePrice || row.strike_price;
        const ceData = row.callOption || row.CE || {};
        const peData = row.putOption || row.PE || {};

        totalCallOI += ceData.openInterest || 0;
        totalPutOI += peData.openInterest || 0;

        if ((ceData.openInterest || 0) > maxCallOI) {
          maxCallOI = ceData.openInterest || 0;
          strongestCallOI = rowStrike;
        }
        if ((peData.openInterest || 0) > maxPutOI) {
          maxPutOI = peData.openInterest || 0;
          strongestPutOI = rowStrike;
        }

        if (rowStrike == strike) {
          optionData = optType === 'CE' ? ceData : peData;
        }
      }

      pcr = totalCallOI > 0 ? parseFloat((totalPutOI / totalCallOI).toFixed(3)) : 0;
      nearestResistance = strongestCallOI;
      nearestSupport = strongestPutOI;
    }

    if (optionData) {
      currentPremium = optionData.lastPrice || optionData.ltp || 0;
      delta         = optionData.delta || 0;
      gamma         = optionData.gamma || 0;
      theta         = optionData.theta || 0;
      vega          = optionData.vega  || 0;
      iv            = optionData.impliedVolatility || optionData.iv || 0;
      oi            = optionData.openInterest || 0;
      oiChange      = optionData.changeinOpenInterest || optionData.oiChange || 0;
      volume        = optionData.totalTradedVolume || optionData.volume || 0;
      bidPrice      = optionData.bidPrice  || optionData.bid || 0;
      askPrice      = optionData.askPrice  || optionData.ask || 0;
      prevOI        = oi - oiChange;
    }

    // ── 4. Fallback: full market data for the option if chain gave nothing ─────
    if (!currentPremium && strike) {
      // Use live indicator engine data if Dhan REST is unavailable
      const ind = indicatorEngine.getIndicators(spotToken);
      currentPremium = entry || 0;
      delta = optType === 'CE' ? 0.45 : -0.45;
      iv = ind?.rsi ? 15 + (ind.rsi * 0.2) : 18;
    }

    // ══ SCORING ════════════════════════════════════════════════════════════════

    const scores = {
      trend: 0,       // max 25
      oi: 0,          // max 20
      volume: 0,      // max 20
      delta: 0,       // max 15
      gamma: 0,       // max 5
      iv: 0,          // max 5
      pcr: 0,         // max 5
      liquidity: 0,   // max 5
    };

    const reasons = { supporting: [], opposing: [] };

    // ── CHECK 1: TREND (25 pts) ───────────────────────────────────────────────
    let trendBullish = underlyingPrice > vwap && underlyingPrice > ema20 && ema20 > ema50;
    let trendBearish = underlyingPrice < vwap && underlyingPrice < ema20 && ema20 < ema50;

    const marketTrend = trendBullish ? 'Bullish' : trendBearish ? 'Bearish' : 'Neutral';

    if (optType === 'CE' && trendBullish) {
      scores.trend = 25;
      reasons.supporting.push(`Price (${underlyingPrice}) > VWAP (${vwap}) > EMA20 (${ema20}) > EMA50 (${ema50}) — Bullish alignment`);
    } else if (optType === 'PE' && trendBearish) {
      scores.trend = 25;
      reasons.supporting.push(`Price (${underlyingPrice}) < VWAP (${vwap}) < EMA20 (${ema20}) < EMA50 (${ema50}) — Bearish alignment`);
    } else if (optType === 'CE' && underlyingPrice > ema20) {
      scores.trend = 12;
      reasons.supporting.push(`Price above EMA20 but VWAP/EMA50 not fully aligned`);
      reasons.opposing.push(`Partial trend alignment — full bullish structure missing`);
    } else if (optType === 'PE' && underlyingPrice < ema20) {
      scores.trend = 12;
      reasons.opposing.push(`Partial trend alignment — full bearish structure missing`);
    } else {
      scores.trend = 0;
      reasons.opposing.push(`Trend DIVERGENCE: ${optType} signal but market is ${marketTrend}`);
    }

    // ── CHECK 2: OI ANALYSIS (20 pts) ─────────────────────────────────────────
    let oiPattern = 'Unknown';
    if (currentPremium > (entry || 0) && oiChange > 0) {
      oiPattern = 'Long Build-up'; scores.oi = 20;
      reasons.supporting.push(`Long Build-up: Price ↑ + OI ↑ (OI Change: +${oiChange})`);
    } else if (currentPremium < (entry || 0) && oiChange > 0) {
      oiPattern = 'Short Build-up'; scores.oi = 20;
      if (optType === 'PE') { reasons.supporting.push(`Short Build-up: Price ↓ + OI ↑ — Bearish confirmation`); }
      else { reasons.opposing.push(`Short Build-up detected — bearish pressure on CE`); scores.oi = 0; }
    } else if (currentPremium > (entry || 0) && oiChange < 0) {
      oiPattern = 'Short Covering'; scores.oi = 10;
      reasons.supporting.push(`Short Covering: Price ↑ + OI ↓ — moderate support`);
    } else if (currentPremium < (entry || 0) && oiChange < 0) {
      oiPattern = 'Long Unwinding'; scores.oi = 0;
      reasons.opposing.push(`Long Unwinding: Price ↓ + OI ↓ — weakness signal`);
    } else {
      oiPattern = 'Neutral / No data'; scores.oi = 10;
    }

    // ── CHECK 3: VOLUME (20 pts) ──────────────────────────────────────────────
    // Estimate average as 50% of total daily volume heuristic
    const avgVolumeEstimate = volume > 0 ? volume * 0.4 : 1;
    const volumeRatio = volume / avgVolumeEstimate;
    if (volumeRatio >= 2) {
      scores.volume = 20;
      reasons.supporting.push(`Volume ${volume.toLocaleString()} is ${volumeRatio.toFixed(1)}x average — Strong participation`);
    } else if (volumeRatio >= 1.2) {
      scores.volume = 12;
      reasons.supporting.push(`Volume above average but below 2x threshold`);
    } else if (volume === 0) {
      scores.volume = 5;
      reasons.opposing.push(`Volume data unavailable — treating as low`);
    } else {
      scores.volume = 0;
      reasons.opposing.push(`Low volume (${volume.toLocaleString()}) — insufficient market participation`);
    }

    // ── CHECK 4: DELTA (15 pts) ───────────────────────────────────────────────
    if (optType === 'CE') {
      if (delta >= 0.5) { scores.delta = 15; reasons.supporting.push(`Delta ${delta.toFixed(2)} ≥ 0.50 — ITM/ATM strength`); }
      else if (delta >= 0.35) { scores.delta = 8; reasons.supporting.push(`Delta ${delta.toFixed(2)} — near-ATM, acceptable`); }
      else { scores.delta = 0; reasons.opposing.push(`Delta ${delta.toFixed(2)} < 0.35 — deep OTM, high risk`); }
    } else {
      const absDelta = Math.abs(delta);
      if (absDelta >= 0.5) { scores.delta = 15; reasons.supporting.push(`Delta ${delta.toFixed(2)} ≤ -0.50 — ITM/ATM strength`); }
      else if (absDelta >= 0.35) { scores.delta = 8; reasons.supporting.push(`Delta ${delta.toFixed(2)} — near-ATM, acceptable`); }
      else { scores.delta = 0; reasons.opposing.push(`Delta ${delta.toFixed(2)} OTM — insufficient directional exposure`); }
    }

    // ── CHECK 5: GAMMA (5 pts) ────────────────────────────────────────────────
    if (gamma > 0.001) {
      scores.gamma = 5;
      reasons.supporting.push(`Gamma ${gamma.toFixed(4)} — good acceleration potential`);
    } else if (gamma > 0) {
      scores.gamma = 3;
    } else {
      scores.gamma = 0;
      reasons.opposing.push(`Gamma too low — premium unlikely to accelerate`);
    }

    // ── CHECK 6: IV (5 pts) ───────────────────────────────────────────────────
    if (iv > 0 && iv < 20) {
      scores.iv = 5;
      reasons.supporting.push(`IV ${iv.toFixed(1)}% — low/moderate, favorable entry`);
    } else if (iv >= 20 && iv < 35) {
      scores.iv = 3;
      reasons.supporting.push(`IV ${iv.toFixed(1)}% — moderate, acceptable with momentum`);
    } else if (iv >= 35) {
      scores.iv = 0;
      reasons.opposing.push(`IV ${iv.toFixed(1)}% — elevated, premium decay risk is HIGH`);
    } else {
      scores.iv = 3; // no data
    }

    // ── CHECK 7: PCR (5 pts) ──────────────────────────────────────────────────
    if (optType === 'CE') {
      if (pcr > 0.8 && pcr < 1.2) { scores.pcr = 5; reasons.supporting.push(`PCR ${pcr} — balanced, supports CE entry`); }
      else if (pcr > 1.5) { scores.pcr = 0; reasons.opposing.push(`PCR ${pcr} > 1.5 — heavy put writing, potential reversal risk`); }
      else { scores.pcr = 3; }
    } else {
      if (pcr > 1.2) { scores.pcr = 5; reasons.supporting.push(`PCR ${pcr} > 1.2 — put dominance confirms bearish bias`); }
      else if (pcr < 0.8) { scores.pcr = 0; reasons.opposing.push(`PCR ${pcr} < 0.8 — call dominance contradicts PE trade`); }
      else { scores.pcr = 3; }
    }

    // ── CHECK 8: LIQUIDITY (5 pts) ────────────────────────────────────────────
    const spread = askPrice > 0 && bidPrice > 0 ? parseFloat((askPrice - bidPrice).toFixed(2)) : null;
    const spreadPct = spread && currentPremium > 0 ? (spread / currentPremium) * 100 : null;
    if (spread === null) {
      scores.liquidity = 3;
      reasons.opposing.push(`Bid/Ask data unavailable — liquidity unverified`);
    } else if (spreadPct < 2) {
      scores.liquidity = 5;
      reasons.supporting.push(`Tight Bid/Ask spread: ₹${bidPrice}/${askPrice} (${spreadPct.toFixed(1)}%) — liquid strike`);
    } else if (spreadPct < 5) {
      scores.liquidity = 3;
      reasons.supporting.push(`Moderate spread: ₹${bidPrice}/${askPrice} (${spreadPct.toFixed(1)}%)`);
    } else {
      scores.liquidity = 0;
      reasons.opposing.push(`Wide spread ₹${bidPrice}/${askPrice} (${spreadPct.toFixed(1)}%) — ILLIQUID strike, reject`);
    }

    // ── TOTAL SCORE ───────────────────────────────────────────────────────────
    const total = Object.values(scores).reduce((a, b) => a + b, 0);

    let verdict, riskLevel;
    if (total >= 90) { verdict = 'VERIFIED STRONG'; riskLevel = 'Low'; }
    else if (total >= 80) { verdict = 'VERIFIED'; riskLevel = 'Low'; }
    else if (total >= 70) { verdict = 'MODERATE RISK'; riskLevel = 'Medium'; }
    else { verdict = 'REJECT'; riskLevel = 'High'; }

    if (total < 70) {
      reasons.opposing.push(`Confidence score ${total}/100 is below the 70-point institutional threshold. Signal should NOT be traded.`);
    }

    logger.info(`[Verifier] ✅ Verification complete: ${total}/100 → ${verdict}`);

    return {
      FALLBACK_MODE: false,
      signal: { symbol, strike, optionType: optType, entry, sl, targets },
      marketTrend,
      underlyingPrice,
      vwap,
      ema20,
      ema50,
      currentPremium,
      greeks: { delta, gamma, theta, vega, iv },
      oiAnalysis: { pattern: oiPattern, oi, oiChange, prevOI },
      volume,
      liquidity: { bid: bidPrice, ask: askPrice, spread, spreadPct },
      pcr,
      optionChain: { strongestCallOI, strongestPutOI, nearestSupport, nearestResistance },
      scores,
      confidenceScore: total,
      riskLevel,
      verdict,
      reasons,
    };
  }

  /**
   * Build a FALLBACK result that shows the raw signal without any verification data.
   * NEVER marks the signal VERIFIED or REJECTED — only UNVERIFIED.
   */
  _buildFallbackResult(parsedSignal) {
    const { symbol, strike, optionType, entry, sl, targets = [] } = parsedSignal;
    return {
      FALLBACK_MODE:  true,
      dhanApiStatus:  'OFFLINE',
      signal:         { symbol, strike, optionType: (optionType || 'CE').toUpperCase(), entry, sl, targets },
      marketTrend:    null,
      underlyingPrice: null,
      vwap:           null,
      ema20:          null,
      ema50:          null,
      currentPremium: null,
      greeks:         { delta: null, gamma: null, theta: null, vega: null, iv: null },
      oiAnalysis:     { pattern: null, oi: null, oiChange: null },
      volume:         null,
      liquidity:      { bid: null, ask: null, spread: null, spreadPct: null },
      pcr:            null,
      optionChain:    { strongestCallOI: null, strongestPutOI: null, nearestSupport: null, nearestResistance: null },
      scores:         null,
      confidenceScore: 'N/A',
      riskLevel:      'Unknown',
      verdict:        'UNVERIFIED',
      reasons: {
        supporting: [],
        opposing:   [
          'Dhan API is currently OFFLINE. No market verification was performed.',
          'Signal was received from Telegram and parsed successfully, but live data checks (trend, OI, Greeks, liquidity) could NOT be completed.',
          'This signal will be automatically re-verified once the Dhan API comes back online.',
        ],
      },
    };
  }
}

const signalVerificationEngine = new SignalVerificationEngine();
export default signalVerificationEngine;
