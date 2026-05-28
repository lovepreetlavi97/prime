import crypto from 'crypto';
import { unpack } from 'msgpackr';

/**
 * 🛠️ CANONICAL REALTIME NORMALIZER
 * Unifies disparate signal structures into a single consistent contract.
 */
export const normalizeRealtimeEvent = (message) => {
  try {
    let raw;
    if (Buffer.isBuffer(message)) {
      raw = unpack(message);
    } else {
      raw = typeof message === 'string' ? JSON.parse(message) : message;
    }
    
    // 1. Canonical Mapping (Type/Signal -> Event/Data)
    const event = raw.event || raw.type || raw.action || 'unknown';
    const data = raw.data || raw.signal || raw.payload || raw.body || {};
    const room = raw.room || null;

    // 2. Consistent Event ID Generation (Crucial for Parity)
    // If no explicit ID exists, we hash the payload content to ensure 
    // both Old Flow and New Gateway generate the EXACT same ID.
    const explicitId = data._id || data.id || raw.id;
    const eventId = explicitId ? String(explicitId) : 
      crypto.createHash('md5').update(JSON.stringify({ event, data })).digest('hex');

    return {
      event,
      data,
      room,
      eventId,
      timestamp: raw.timestamp || Date.now(),
      isNormalized: true,
      originalSchema: {
        keys: Object.keys(raw),
        hasEvent: !!raw.event,
        hasType: !!raw.type,
        hasData: !!raw.data,
        hasSignal: !!raw.signal
      }
    };
  } catch (err) {
    return {
      event: 'malformed',
      data: {},
      isNormalized: false,
      error: err.message
    };
  }
};

/**
 * 🛡️ EVENT CONTRACT VALIDATOR
 */
export const validateEventContract = (normalized) => {
  const missing = [];
  if (normalized.event === 'unknown') missing.push('event/type');
  if (Object.keys(normalized.data).length === 0) missing.push('data/signal');
  
  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
};
