/**
 * Signal Parser Service
 * Extracts structured trading data from raw text using regex.
 */

export const parseSignal = (text) => {
  const signal = {
    symbol: null, 
    type: 'BUY',
    optionType: 'NONE',
    strike: null,
    entry: null,
    sl: null,
    targets: [],
    currentPrice: null,
    percentageChange: null,
    expiryDate: null,
    market: 'NSE'
  };

  const normalizedText = text.toUpperCase();

  // 1. Detect Symbol (SENSEX or NIFTY)
  const symbolMatch = normalizedText.match(/(SENSEX|NIFTY|BANKNIFTY|FINNIFTY)/i);
  if (symbolMatch) signal.symbol = symbolMatch[0];

  // 2. Detect Option Type (CE/PE) and Strike
  // Matches: 22950 PE, 22950PE, 22950 - PE, etc. (3 to 6 digits)
  const optMatch = normalizedText.match(/(\d{3,6})\s*[\-:\s]*\s*(CE|PE)/i);
  if (optMatch) {
    signal.strike = parseFloat(optMatch[1]);
    signal.optionType = optMatch[2].toUpperCase();
    signal.type = signal.optionType === 'CE' ? 'BUY' : 'SELL';
  } else {
    // Check for CE/PE independently if not combined
    if (normalizedText.match(/\bCE\b/i)) {
      signal.optionType = 'CE';
      signal.type = 'BUY';
    } else if (normalizedText.match(/\bPE\b/i)) {
      signal.optionType = 'PE';
      signal.type = 'SELL';
    }
    
    // Independent Strike Detection (Look for 5-digit numbers as fallback)
    const strikeMatch = normalizedText.match(/\b\d{5}\b/);
    if (strikeMatch && !signal.strike) signal.strike = parseFloat(strikeMatch[0]);
  }

  // 4. Pattern: ABOVE / @ / AT ... (More permissive)
  const entryMatch = normalizedText.match(/(?:ABOVE|@|AT)[\D\s]*(\d+(?:\.\d+)?)/i);
  if (entryMatch) {
    const val = parseFloat(entryMatch[1]);
    // Safety: Entry prices are rarely above 5000 for options, whereas strikes are 10000+
    if (val < 10000) signal.entry = val;
  }


  // 5. Pattern: SL :- ...
  const slMatch = normalizedText.match(/SL[\D\s]*(\d+(?:\.\d+)?)/i);
  if (slMatch) {
    const val = parseFloat(slMatch[1]);
    if (val < 10000) signal.sl = val;
  }

  // 6. Pattern: TARGET :- ...
  const targetLineMatch = normalizedText.match(/TARGET[\D\s]*([^\n\r]+)/i);
  if (targetLineMatch) {
    // Split by "/" and clean each target
    const targets = targetLineMatch[1]
      .split('/')
      .map(t => t.replace(/[+]/g, '').trim())
      .filter(t => !isNaN(parseFloat(t)));
    signal.targets = targets.map(t => parseFloat(t));
  }

  // 6. OCR Patterns (Current Price, Percentage, Expiry)
  const cmpMatch = normalizedText.match(/(?:CURRENT PRICE|CMP)\s*(\d+(?:\.\d+)?)/i);
  if (cmpMatch) signal.currentPrice = parseFloat(cmpMatch[1]);

  const percentMatch = normalizedText.match(/([+-]\s*\d+(?:\.\d+)?%)/i);
  if (percentMatch) signal.percentageChange = percentMatch[0].replace(/\s/g, '');

  // Extract date/month for expiry
  const dateMatch = normalizedText.match(/(\d{1,2}\s*[A-Z]{3})/i);
  if (dateMatch) signal.expiryDate = dateMatch[0];

  return signal;
};
