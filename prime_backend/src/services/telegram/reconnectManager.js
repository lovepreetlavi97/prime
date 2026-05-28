/**
 * Reconnect Manager
 * Implements tiered exponential backoff to prevent reconnect storms
 * and respect Telegram's flood protection.
 */
class ReconnectManager {
  constructor() {
    this.attempts = 0;
    this.maxAttempts = 20;
    this.baseDelay = 5000; // 5s
    this.isReconnecting = false;
  }

  getDelay() {
    // Tiered retry strategy: 5s, 10s, 20s, 40s... capped at 60s
    this.attempts++;
    const delay = Math.min(this.baseDelay * Math.pow(2, this.attempts - 1), 60000);
    return delay;
  }

  reset() {
    this.attempts = 0;
    this.isReconnecting = false;
    console.log('[Telegram] Reconnect Manager Reset');
  }

  async wait() {
    const delay = this.getDelay();
    console.log(`[Telegram] Reconnecting in ${delay / 1000}s... (Attempt ${this.attempts})`);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  canRetry() {
    return this.attempts < this.maxAttempts;
  }
}

export default new ReconnectManager();
