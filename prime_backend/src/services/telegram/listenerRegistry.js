/**
 * Listener Registry
 * Ensures that Telegram event handlers are registered exactly once
 * and can be restored safely after a reconnect.
 */
class ListenerRegistry {
  constructor() {
    this.handlers = new Set();
  }

  /**
   * Register a new message handler
   * @param {TelegramClient} client 
   * @param {Function} handler 
   */
  register(client, handler) {
    // Remove any existing handlers to prevent duplicates
    client.removeEventHandler(handler);
    
    // Add the fresh handler
    client.addEventHandler(handler);
    this.handlers.add(handler);
    
    console.log('[Telegram] Listener Registered Successfully');
  }

  /**
   * Remove all handlers (useful before reconnect)
   * @param {TelegramClient} client 
   */
  clearAll(client) {
    for (const handler of this.handlers) {
      client.removeEventHandler(handler);
    }
    this.handlers.clear();
    console.log('[Telegram] Listener Registry Cleared');
  }
}

export default new ListenerRegistry();
