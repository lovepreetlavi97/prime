/**
 * Health Monitor
 * Analyzes MTProto errors to determine if a reconnect is safe 
 * or if the session is critically compromised.
 */
class HealthMonitor {
  isCritical(error) {
    const msg = error.message?.toUpperCase() || "";
    
    // Critical errors that require manual intervention or session reset
    if (
      msg.includes('AUTH_KEY_UNREGISTERED') || 
      msg.includes('AUTH_KEY_DUPLICATED') ||
      msg.includes('SESSION_REVOKED') ||
      msg.includes('SESSION_EXPIRED') ||
      msg.includes('USER_DEACTIVATED')
    ) {
      return true;
    }

    return false;
  }

  isTransient(error) {
    const msg = error.message?.toUpperCase() || "";
    
    // Normal / Expected disconnects (Media DC, Network timeout, etc)
    if (
      msg.includes('CONNECTION_CLOSED') ||
      msg.includes('TIMEOUT') ||
      msg.includes('FLOOD_WAIT') ||
      msg.includes('DISCONNECT')
    ) {
      return true;
    }

    return false;
  }

  logStatus(isConnected) {
    if (isConnected) {
      console.log('[Telegram] Status: HEALTHY (Connected)');
    } else {
      console.warn('[Telegram] Status: DEGRADED (Disconnected)');
    }
  }
}

export default new HealthMonitor();
