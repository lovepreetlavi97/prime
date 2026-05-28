# ⚙️ PrimeTradeSignals: Backend Signal Architecture

This document outlines the end-to-end lifecycle of a trading signal, from Telegram ingestion to real-time frontend delivery.

---

## 1. 📥 SIGNAL INGESTION (TELEGRAM)
Signals enter the system via a **Telegram Webhook**. 
- **Source**: Premium Telegram Channels.
- **Workflow**: 
    1. Telegram bot receives a message.
    2. Message is sent to the `/webhook/telegram` endpoint in the backend.
    3. The backend uses an **AI Engine (ChatGPT)** to parse the raw text into structured data (Symbol, Strike, Entry, SL, Targets).

---

## 2. 🤖 AI PARSING & VALIDATION
The `telegram.controller.js` sends the raw message to the `AI Service`.
- **Logic**: The AI identifies if the message is a new trade, a target update, or a close alert.
- **Output**: A JSON object that matches the `Signal` database model.
- **Manual Overide**: Signals can also be created manually via the **Admin Panel**.

---

## 3. 📊 REAL-TIME PRICE TRACKING
Once a signal is `ACTIVE`, the `Price Tracker Service` takes over.
- **Mechanism**:
    1. **Cache**: Signals are loaded into an in-memory `activeSignalsCache` for ultra-fast processing.
    2. **Ticker Feed**: The backend connects to the **Angel One API** (via `angelOne.service.js`) to get live price ticks.
    3. **Condition Matching**: Every 1 second, the service compares the live price against:
        - **Stop Loss**: If `Price <= SL`, status changes to `SL_HIT`.
        - **Targets**: If `Price >= Target`, status changes to `TARGET_HIT`.
        - **High Price**: Continuously updates `highPrice` to track peak performance.

---

## 4. 🔄 SYNCHRONIZATION & EMISSION
To ensure the system is both fast and reliable:
- **DB Sync**: Every 10 seconds, the in-memory changes (prices/statuses) are batched and saved to **MongoDB** (`syncToDatabase`).
- **Live Emission**: The moment a price or status changes in memory, it is emitted via **Socket.io** (`io.emit('update_signal', signal)`).
- **Frontend Receipt**: The React frontend (via `useSignalStore`) listens for these emissions and updates the UI instantly without a page refresh.

---

## 5. 🏁 SIGNAL CLOSURE
A signal is removed from the active tracker loop when:
- It hits **Stop Loss**.
- The admin manually closes it.
- An **Exit Alert** is received via Telegram.
- The market session ends.

---

## 🏗️ TECHNOLOGY STACK
- **Runtime**: Node.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Broker API**: Angel One SmartAPI
- **AI**: OpenAI GPT-4 (for parsing)

---

*Last Updated: May 5, 2026*
