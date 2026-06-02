/**
 * LVPRIMEX — Signal Verification Controller
 *
 * POST /api/signals/verify  → Full institutional analysis of a Telegram signal
 *
 * Two response modes:
 *  • VERIFIED / VERIFIED STRONG / MODERATE RISK / REJECT  ← Dhan API online
 *  • ⚠️ FALLBACK MODE (UNVERIFIED)                        ← Dhan API offline
 *
 * In FALLBACK mode the signal is still displayed and a one-time re-verification
 * is automatically triggered via dhanHealth.onRecovery() once the API returns.
 */

import signalMatcher from '../../services/dhan/dhanSignalMatcher.js';
import { onDhanRecovery, isDhanAvailable } from '../../services/dhan/dhanApiClient.js';
import { parseSignal } from '../../services/parser.service.js';
import logger from '../../utils/logger.js';

// ─── In-process pending verification queue ────────────────────────────────────
// Stores signals that arrived while Dhan was offline so they can be re-verified
// automatically once the API comes back. Uses Map keyed by a unique signal ref.
const pendingVerifications = new Map();

function schedulePendingRetry(key, parsedSignal, onResult) {
  pendingVerifications.set(key, { parsedSignal, onResult, scheduledAt: Date.now() });
  logger.info(`[VerifyCtrl] 📋 Signal queued for auto-reverification when API recovers: ${key}`);

  onDhanRecovery(async () => {
    const entry = pendingVerifications.get(key);
    if (!entry) return;
    pendingVerifications.delete(key);

    logger.info(`[VerifyCtrl] 🔄 Dhan API recovered — re-verifying ${key}`);
    try {
      const result = await signalMatcher.verifySignal(entry.parsedSignal);
      if (result && !result.FALLBACK_MODE) {
        entry.onResult(result);   // Caller-supplied callback (e.g. emit socket event)
        logger.info(`[VerifyCtrl] ✅ Auto re-verification complete for ${key}: ${result.verdict} (${result.confidenceScore}/100)`);
      } else {
        // Still offline after recovery callback — re-queue
        logger.warn(`[VerifyCtrl] ⚠️ Re-verification for ${key} still in FALLBACK mode. Re-queuing.`);
        schedulePendingRetry(key, entry.parsedSignal, entry.onResult);
      }
    } catch (err) {
      logger.error(`[VerifyCtrl] ❌ Auto re-verification failed for ${key}: ${err.message}`);
    }
  });
}

// ─── Format helpers ───────────────────────────────────────────────────────────
function formatSignalLine(signal) {
  const parts = [signal.symbol, signal.strike, signal.optionType].filter(Boolean).join(' ');
  const entry   = signal.entry   ? `Entry: ₹${signal.entry}`     : '';
  const targets = signal.targets?.length ? `Target: ${signal.targets.join('/')}` : '';
  const sl      = signal.sl      ? `SL: ₹${signal.sl}`          : '';
  return [parts, entry, targets, sl].filter(Boolean).join(' | ');
}

function formatFallbackResponse(result) {
  const signalLine = formatSignalLine(result.signal);
  const displayString = `⚠️ LVPRIMEX FALLBACK MODE\n\nSignal:\n${signalLine}\n\nStatus:\nUNVERIFIED\n\nReason:\nMarket data currently unavailable.\n\nDhan API Status:\nOffline\n\nConfidence Score:\nN/A\n\nAI Verdict:\nThis signal was received from Telegram but could not be verified using live market data. Trade with caution until verification becomes available.\n\nWhen market data returns:\nAutomatically re-run verification and update the signal status.`;
  return {
    status:        'FALLBACK',
    display:       displayString,
    signal:        signalLine,
    verificationStatus: 'UNVERIFIED',
    reason:        'Market data currently unavailable.',
    dhanApiStatus: 'Offline',
    confidenceScore: 'N/A',
    riskLevel:     'Unknown',
    aiVerdict:     'This signal was received from Telegram but could not be verified using live market data. Trade with caution until verification becomes available.',
    autoRetry:     'Automatic re-verification scheduled. Signal status will be updated once Dhan API comes back online.',
    parsedSignal:  result.signal,
    receivedAt:    new Date().toISOString(),
  };
}

function formatVerifiedResponse(result) {
  const { signal, marketTrend, underlyingPrice, vwap, ema20, ema50,
          currentPremium, greeks, oiAnalysis, volume, liquidity,
          pcr, optionChain, scores, confidenceScore, riskLevel, verdict, reasons } = result;

  const spreadStr = liquidity?.spread != null
    ? `₹${liquidity.bid} / ₹${liquidity.ask} (Spread: ₹${liquidity.spread}, ${liquidity.spreadPct?.toFixed(1)}%)`
    : 'Data unavailable';

  return {
    status: 'VERIFIED',
    signal: formatSignalLine(signal),
    marketTrend,
    spotData:       { underlyingPrice, vwap, ema20, ema50 },
    currentPremium,
    greeks: {
      delta: greeks.delta,
      gamma: greeks.gamma,
      theta: greeks.theta,
      vega:  greeks.vega,
      iv:    greeks.iv != null ? `${greeks.iv.toFixed(1)}%` : 'N/A',
    },
    oiAnalysis: {
      pattern:  oiAnalysis.pattern,
      oi:       oiAnalysis.oi,
      oiChange: oiAnalysis.oiChange,
    },
    volume,
    liquidity:    spreadStr,
    pcr,
    optionChain: {
      strongestCallOI:   optionChain.strongestCallOI,
      strongestPutOI:    optionChain.strongestPutOI,
      nearestSupport:    optionChain.nearestSupport,
      nearestResistance: optionChain.nearestResistance,
    },
    scores,
    confidenceScore: `${confidenceScore}/100`,
    riskLevel,
    verdict,
    dhanApiStatus:  'ONLINE',
    aiReasoning: {
      supporting: reasons.supporting,
      opposing:   reasons.opposing,
    },
  };
}

// ─── Controller ───────────────────────────────────────────────────────────────
class SignalVerificationController {
  /**
   * POST /api/signals/verify
   * Body: { text: "...raw telegram..." }
   *    OR { symbol, strike, optionType, entry, sl, targets }
   */
  async verifySignal(request, reply) {
    try {
      // 1. Parse input
      let parsedSignal;
      if (request.body?.text) {
        parsedSignal = parseSignal(request.body.text);
      } else {
        parsedSignal = {
          symbol:     request.body.symbol,
          strike:     parseFloat(request.body.strike),
          optionType: request.body.optionType,
          entry:      parseFloat(request.body.entry),
          sl:         parseFloat(request.body.sl),
          targets:    (request.body.targets || []).map(Number),
        };
      }

      if (!parsedSignal.symbol || !parsedSignal.entry) {
        return reply.status(400).send({
          status:  'error',
          message: 'Could not extract symbol or entry from the signal. Please check the message format.',
        });
      }

      // 2. Run verification (may return FALLBACK immediately if Dhan is offline)
      const result = await signalMatcher.verifySignal(parsedSignal);

      if (!result) {
        return reply.status(500).send({
          status:  'error',
          message: 'Verification engine returned no result. Check server logs.',
        });
      }

      // 3. FALLBACK path ──────────────────────────────────────────────────────
      if (result.FALLBACK_MODE) {
        const signalKey = `${parsedSignal.symbol}_${parsedSignal.strike}_${parsedSignal.optionType}_${Date.now()}`;

        // Schedule automatic re-verification and emit via socket when ready
        schedulePendingRetry(signalKey, parsedSignal, (verifiedResult) => {
          // Import socket lazily to avoid circular deps at module load time
          import('../../loaders/socket.js').then(({ default: socketService }) => {
            socketService.emitGlobal('signal_reverified', {
              key:    signalKey,
              report: formatVerifiedResponse(verifiedResult),
            });
          }).catch(() => {});
        });

        const response = formatFallbackResponse(result);
        logger.info(`[VerifyCtrl] ⚠️  FALLBACK response sent for ${parsedSignal.symbol} ${parsedSignal.strike} ${parsedSignal.optionType}`);
        return reply.status(200).send({ status: 'ok', data: response });
      }

      // 4. VERIFIED path ──────────────────────────────────────────────────────
      const response = formatVerifiedResponse(result);
      logger.info(`[VerifyCtrl] ✅ VERIFIED response: ${result.verdict} (${result.confidenceScore}/100)`);
      return reply.status(200).send({ status: 'ok', data: response });

    } catch (err) {
      request.log?.error(err);
      logger.error(`[VerifyCtrl] ❌ Unexpected error: ${err.message}`);
      return reply.status(500).send({ status: 'error', message: err.message });
    }
  }

  /**
   * GET /api/signals/verify/status
   * Returns current Dhan API health + count of pending re-verifications.
   */
  async getVerificationStatus(request, reply) {
    return reply.send({
      status: 'ok',
      data: {
        dhanApiStatus:       isDhanAvailable() ? 'ONLINE' : 'OFFLINE',
        pendingReverifications: pendingVerifications.size,
        pendingKeys:         Array.from(pendingVerifications.keys()),
      },
    });
  }
}

export default new SignalVerificationController();
