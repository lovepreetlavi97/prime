# 🏛️ PrimeTradeSignals: Luxury Signal Card Logic Guide

This document explains the backend logic, UI conditions, and terminology used in the `LuxurySignalCard` component.

---

## 🧠 1. CORE EXECUTION LOGIC
The card determines its state by comparing the **Entry Price** with the **Live Market Price** (or the historical **High Price**).

| Metric | Logic / Formula | Purpose |
| :--- | :--- | :--- |
| **Entry Price** | `signal.entry` | The trigger level for the trade. |
| **Current Price** | `signal.currentPrice` | Real-time price from WebSocket. |
| **Highest Reached** | `signal.highPrice` | Peak performance of the signal. |
| **Profit % (ROI)** | `((High - Entry) / Entry) * 100` | Shows the maximum return delivered. |
| **Progress %** | `((High - Entry) / (FinalTarget - Entry)) * 100` | Visualizes journey toward profit goals. |

---

## 🚦 2. DYNAMIC STATUS INDICATORS
The card automatically changes its text and colors based on market movement.

### **Entry Conditions**
*   **⏳ WAIT FOR ENTRY**: 
    *   *Condition*: `Current Price < Entry Price`
    *   *Action*: Displays an amber warning. Tells the user NOT to buy yet.
*   **🟢 TRADE ACTIVE — BUY NOW**: 
    *   *Condition*: `Current Price >= Entry Price`
    *   *Action*: Displays a blinking green success message. Signals the user to enter the trade.

### **Exit Conditions**
*   **🎯 TARGET HIT**: 
    *   *Condition*: `Status == 'TARGET_HIT'`
    *   *Action*: Turns the status badge green and locks in the achievement.
*   **🛑 STOP LOSS**: 
    *   *Condition*: `Status == 'SL_HIT'`
    *   *Action*: Turns the status badge red and signals a safety exit.

---

## 📋 3. TERMINOLOGY MAPPING
Technical jargon has been replaced with "Beginner-Friendly" copy:

*   **"BUY ABOVE ₹{price}"**: Explicit instruction on the action badge.
*   **"Profit Targets"**: Formerly 'Target Matrix'.
*   **"Progress"**: Formerly 'Success Track'.
*   **"Stop Loss"**: Simplified from 'Safety Exit'.
*   **"Trade Type"**: Simplified from 'Setup'.
*   **"Current Market Value"**: Simplified from 'Current Price'.

---

## 🎯 4. PROFIT POTENTIAL
At the bottom of every card, the system automatically calculates the **Maximum Upside**:
*   **Formula**: `((Target 3 - Entry) / Entry) * 100`
*   **Display**: *"Up to +80% possible move 📈"*

---

## 💬 6. STATUS MESSAGE BEHAVIOR
The card's primary appearance (colors, icons, and badges) changes based on the `status` field sent by the backend.

| Backend Status | UI Badge | Theme Color | Meaning |
| :--- | :--- | :--- | :--- |
| `PROFIT`, `CLOSED_PROFIT` | **PROFIT** | 🟢 Green | Trade closed with gains. |
| `TARGET_HIT` | **SUCCESS** | 🟢 Green | A specific profit goal was reached. |
| `SL_HIT`, `CLOSED_LOSS` | **LOSS** | 🔴 Red | Stop Loss triggered, trade exited. |
| `EXIT_ALERT` | **EXIT** | 🔴 Pink | Manual exit recommended by AI. |
| `CLOSED` | **ENDED** | ⚪ Gray | Market session ended or trade expired. |
| `(Default)` | **LIVE** | 🔵 Blue | Trade is active and monitoring market. |

---

## 🔒 7. PREMIUM ACCESS LOGIC
*   **Free Users**: See `₹****` for prices and a blurred backdrop overlay.
*   **Pro/Elite Users**: See full live calculations and target tracking.

---

*Last Updated: May 5, 2026*
