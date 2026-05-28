import indicatorEngine from "../src/services/dhan/dhanIndicatorEngine.js";
import strategyEngine from "../src/services/dhan/dhanStrategyEngine.js";
import signalMatcher from "../src/services/dhan/dhanSignalMatcher.js";
import logger from "../src/utils/logger.js";

async function verifyDhanPipeline() {
  console.log("🏁 Starting Dhan Scalper and Matcher Pipeline Verification...\n");

  // 1. Simulate ticks for NIFTY spot Index (Token 13) to build a bullish trend
  // We feed a series of increasing prices to build historical candles
  const niftyToken = "13";
  let basePrice = 23000.0;

  console.log("📈 Step 1: Feeding 30 ticks of NIFTY (Token 13) to establish indicators...");
  for (let i = 0; i < 30; i++) {
    // Increment price to simulate bullish movement
    basePrice += 15.0;
    
    // Simulate multiple ticks within a minute to close out candles
    indicatorEngine.processTick(niftyToken, basePrice);
    
    // Fast-forward candle closes by modifying timestamps in our in-memory engine
    if (indicatorEngine.currentCandles[niftyToken]) {
      // Simulate candle close by shifting active candle timestamp backwards
      indicatorEngine.currentCandles[niftyToken].timestamp -= 65000;
    }
  }

  // Finalize the last candle
  indicatorEngine.processTick(niftyToken, basePrice + 10);

  // Retrieve calculated indicators
  const indicators = indicatorEngine.getIndicators(niftyToken);
  console.log("📊 Computed NIFTY Indicators:", JSON.stringify(indicators, null, 2));

  // Determine market bias
  const bias = strategyEngine.getMarketBias(niftyToken);
  console.log(`🧭 NIFTY Market Bias Determined: ${bias}`);

  // 2. Mock a parsed Telegram Signal matching Nifty Bullish trend (CE BUY)
  console.log("\n📡 Step 2: Simulating Telegram CE BUY Signal Matching...");
  const mockBullishSignal = {
    symbol: "NIFTY",
    optionType: "CE",
    strike: 23200,
    entry: 120,
    sl: 90,
    targets: [150, 180]
  };

  const matchResultBullish = signalMatcher.matchAndSecure(mockBullishSignal, "BUY NIFTY 23200 CE AT 120 SL 90 TGT 150 180");
  console.log("✅ Match Output (ALIGNED):", JSON.stringify(matchResultBullish, null, 2));

  // 3. Mock a parsed Telegram Signal contradicting Nifty Bullish trend (PE BUY)
  console.log("\n📡 Step 3: Simulating Telegram PE BUY Signal Matching (Divergence)...");
  const mockBearishSignal = {
    symbol: "NIFTY",
    optionType: "PE",
    strike: 23200,
    entry: 100,
    sl: 80,
    targets: [130, 160]
  };

  const matchResultBearish = signalMatcher.matchAndSecure(mockBearishSignal, "BUY NIFTY 23200 PE AT 100 SL 80 TGT 130 160");
  console.log("✅ Match Output (DIVERGENT):", JSON.stringify(matchResultBearish, null, 2));

  console.log("\n🎉 Dhan Scalper and Matcher Pipeline Verification Completed!");
}

verifyDhanPipeline().catch(console.error);
