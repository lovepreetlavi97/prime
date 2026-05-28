import { unpack, pack } from 'msgpackr';

/**
 * ⚡ MARKET DATA WORKER
 * Offloads buffer parsing and initial logic from the main event loop.
 */
export default ({ buffer, indexMap }) => {
  try {
    const data = Buffer.from(buffer);
    // Parsing Angel One Binary Format (Highly optimized Buffer operations)
    const tokenStr = data.toString("ascii", 2, 12).replace(/\0/g, "").trim();
    const ltp = data.readInt32LE(43) / 100;

    const indexName = indexMap[tokenStr];
    
    return {
      token: tokenStr,
      price: ltp,
      instrument: indexName,
      timestamp: Date.now()
    };
  } catch (err) {
    console.error(`[Worker] Parsing Error: ${err.message}`, err);
    return null;
  }
};
