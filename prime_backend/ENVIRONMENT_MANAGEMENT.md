# Dual-Environment Management Guide (Local vs. Live)

This guide explains how to manage your Trading Signal Engine when working on a local machine while the production server is also running.

## 1. Telegram Session Management

### The Problem
Telegram uses a **String Session** that is tied to your API ID and IP location. If you use the same session string on your **Local Server** and your **Live Server** simultaneously:
1. Telegram detects a duplicate auth key usage.
2. It throws the `AUTH_KEY_DUPLICATED` error.
3. One or both sessions may be invalidated.

### Recommended Strategy
| Approach | Recommendation | How to Implement |
| :--- | :--- | :--- |
| **Option A: Separate Keys (Best)** | Use a different Telegram API ID/Hash for Local development. | Create a new App on [my.telegram.org](https://my.telegram.org) specifically for development. |
| **Option B: Disable Locally** | Turn off Telegram integration when working on UI/Frontend logic. | Set `TELEGRAM_API_ID=` (leave empty) in your local `.env` file. |
| **Option C: Separate DBs** | Use a local MongoDB for development instead of the live cluster. | Change `MONGODB_URI` in local `.env` to `mongodb://localhost:27017/prime`. |

> [!IMPORTANT]
> If your Local and Live servers share the same **MongoDB Database**, they will overwrite each other's `telegram_session` keys. **Always use a separate database for local testing.**

---

## 2. Angel One WebSocket Feed

### The Problem
Angel One SmartAPI typically allows **only one active WebSocket connection** per Client Code/API Key.
- If you start your local server, it might kick the live server off the feed.
- This causes the `watchdog` to trigger on the live server, leading to a "reconnection war."

### Recommended Strategy
- **Use Mock Data**: For local frontend development, use the `mockPriceService` or just let the local server fail to connect while you focus on UI.
- **Separate API Keys**: Create a second "App" in the Angel One SmartAPI portal. Use `API_KEY_DEV` for local and `API_KEY_PROD` for live.

---

## 3. Environment Configuration (`.env`) Checklist

Ensure your local `.env` is distinct from the live one:

```bash
# LOCAL .env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/prime_dev  # Use local DB!
TELEGRAM_API_ID=...                              # Different ID if possible
TELEGRAM_SESSION=                                # Leave empty to force fresh local login
```

## 4. Handling "Locked" Sessions
If you see the message `⚠️ WARNING: Telegram session was locked`, it means the previous process didn't close properly.
- **Locally**: You can safely ignore this; the new code handles PID-based unlocking.
- **Live**: If this happens, ensure no other instance of the backend is running on the server.
