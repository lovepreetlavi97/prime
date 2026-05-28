import WebSocket from "ws";
import dotenv from "dotenv";
import { SwingStrategy } from "./swingStrategy.js";
import { TraderService } from "./traderService.js";

dotenv.config();

const { SMARTAPI_KEY } = process.env;

// // 🧠 Initialize Trader and Strategy
// const trader = new TraderService({
//   startingBalance: 100000,  // ₹1 lakh paper money
//   riskPercent: 0.5,         // risk 0.5% per trade
// });

// const strategy = new SwingStrategy({
//   trader,
//   shortPeriod: 9,
//   longPeriod: 21,
//   rsiPeriod: 14,
//   atrPeriod: 14,
//   atrMultiplier: 3,
// });

// 🌐 WebSocket Connect Function
export async function connectWebSocket(feedToken, jwt, clientCode, wsUrl) {
  const fullUrl = `${wsUrl}?clientCode=${clientCode}&feedToken=${feedToken}&apiKey=${SMARTAPI_KEY}`;
  console.log("🌐 Connecting to Angel One WebSocket:", fullUrl);

  const ws = new WebSocket(fullUrl);

  ws.on("open", () => {
    console.log("✅ WebSocket connected. Subscribing to NIFTY 50...");

    const payload = {
      action: 1,
      params: {
        mode: 1, // LTP (Last Traded Price)
        tokenList: [
          {
            exchangeType: 1, // NSE
            tokens: ["26000"], // NIFTY 50
          },
        ],
      },
    };

    ws.send(JSON.stringify(payload));
    console.log("📡 Subscribed to NIFTY LTP feed...");
  });

  ws.on("message", (data) => {
    try {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");

      // Read token ID
      const tokenStr = buffer.toString("ascii", 2, 7).replace(/\0/g, "");
      if (tokenStr !== "26000") return;

      // Parse LTP (Little Endian integer)
      const ltpRaw = buffer.readInt32LE(43);
      const ltp = ltpRaw / 100;

      console.log(`📈 NIFTY 50 | ₹${ltp.toFixed(2)} ⏱️ ${new Date().toLocaleTimeString()}`);

      // 🚀 Feed live tick to strategy
      strategy.onTick(ltp, { token: tokenStr, timestamp: new Date().toISOString() });

    } catch (err) {
      console.error("⚠️ Parse error:", err.message);
    }
  });

  ws.on("error", (err) => console.error("❌ WebSocket Error:", err.message));
  ws.on("close", (code, reason) =>
    console.log(`⚠️ WebSocket closed. Code: ${code}, Reason: ${reason}`)
  );

  // 💓 Keepalive ping
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 0 }));
    }
  }, 30 * 1000);
}
