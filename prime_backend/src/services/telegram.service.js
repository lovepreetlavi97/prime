import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';
import SystemConfig from '../models/SystemConfig.js';
import logger from '../utils/logger.js';

// Modular Enterprise Components
import listenerRegistry from './telegram/listenerRegistry.js';
import healthMonitor from './telegram/healthMonitor.js';
import reconnectManager from './telegram/reconnectManager.js';

let clientInstance = null;
let isInitializing = false;
let targetChatIds = new Set(); 
let heartbeatTimer = null;
let lastSyncTime = null;
let syncOnMessageCallback = null;

// --- ENTITY CACHE ---
const entityCache = new Map(); // peerId -> { title, timestamp }

export const getTelegramStatus = () => {
  return {
    connected: !!clientInstance?.connected,
    isInitializing,
    channels: Array.from(targetChatIds),
    lastSync: lastSyncTime
  };
};

/**
 * ENTERPRISE TELEGRAM SERVICE
 */
export const initTelegramListener = async (onNewMessage) => {
  if (isInitializing) return;
  
  // 🔥 CRITICAL: Prevent old heartbeats from triggering re-init
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  if (clientInstance?.connected) {
    try {
      await clientInstance.getMe();
      return;
    } catch (e) {
      console.warn('[Telegram] Heartbeat failed, restarting...');
    }
  }

  isInitializing = true;
  syncOnMessageCallback = onNewMessage;

  const apiId = parseInt(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const env = process.env.NODE_ENV || 'development';
  const sessionKey = env === 'production' ? 'PROD_TELEGRAM_SESSION' : 'LOCAL_TELEGRAM_SESSION';

  const startConnection = async () => {
    try {
      logger.info(`[Telegram] Initializing Secure Multi-Channel Pipeline...`);

      const config = await SystemConfig.findOne({ key: sessionKey });
      let sessionStr = config?.value || "";

      if (process.env.TELEGRAM_SESSION?.toUpperCase() === "LOGIN") sessionStr = "";

      if (clientInstance) {
        try {
          listenerRegistry.clearAll(clientInstance);
          await clientInstance.disconnect();
        } catch (e) {}
      }

      clientInstance = new TelegramClient(new StringSession(sessionStr), apiId, apiHash, {
        connectionRetries: 5,
        autoReconnect: true,
        timeout: 15000,
        deviceModel: `PrimeMulti-${env}`,
        systemVersion: "Enterprise-2.0",
      });

      // 🔥 QUIET MODE: Suppress version and connection info
      clientInstance.setLogLevel("warn");

      await clientInstance.start({
        phoneNumber: async () => await input.text(`📱 Phone: `),
        password: async () => await input.text(`🔐 Password: `),
        phoneCode: async () => await input.text(`💬 OTP: `),
        onError: (err) => {
           logger.error(`[Telegram] Client Start Error: ${err.message}`);
        }
      });

      const savedSession = clientInstance.session.save();
      await SystemConfig.findOneAndUpdate(
        { key: sessionKey },
        { value: savedSession, updatedAt: new Date(), isLocked: true },
        { upsert: true }
      );

      logger.info(`[Telegram] ✅ Secure Pipeline Established`);
      
      reconnectManager.reset();
      healthMonitor.logStatus(true);

      // 🔥 Sync and Pipeline setup
      await establishPipeline(onNewMessage);
      
      // 🔥 Only release lock after EVERYTHING is ready
      isInitializing = false;

    } catch (error) {
      await handleFailure(error);
    }
  };

  const handleFailure = async (error) => {
    isInitializing = false;
    logger.error(`[Telegram] ❌ Pipeline Failure: ${error.message}`);
    
    if (healthMonitor.isCritical(error)) {
      logger.error('[Telegram] 🛑 Critical Session Error. Clearing session...');
      await SystemConfig.deleteOne({ key: sessionKey });
      return; 
    }

    if (reconnectManager.canRetry()) {
      await reconnectManager.wait();
      await startConnection();
    }
  };

  const establishPipeline = async (onNewMessage) => {
    try {
      const dialogs = await clientInstance.getDialogs({});
      targetChatIds.clear();

      const matches = dialogs.filter(d => {
        const title = d.title?.toUpperCase() || '';
        return (title.includes('TR') && title.includes('PREMIUM')) || title.includes('PRIME');
      });

      if (matches.length > 0) {
        matches.forEach(m => {
          targetChatIds.add(m.id?.toString());
          entityCache.set(m.id?.toString(), { title: m.title, timestamp: Date.now() });
          logger.info(`[Telegram] 📡 Listening to: ${m.title} (ID: ${m.id})`);
        });
        
        const unifiedHandler = async (event) => {
          const message = event.message || event.update?.message; 
          if (!message) return;

          try {
            let peerIdStr = "";
            const peerId = message.peerId || message.toId; 
            if (peerId?.channelId) peerIdStr = peerId.channelId.toString();
            else if (peerId?.chatId) peerIdStr = peerId.chatId.toString();
            else if (message.chatId) peerIdStr = message.chatId.toString();

            if (!peerIdStr) return;
            
            const cleanPeer = peerIdStr.replace('-100', '');
            const isTarget = Array.from(targetChatIds).some(id => id.replace('-100', '') === cleanPeer);

            if (isTarget) {
               // --- MEMORY-SAFE SOURCE RESOLUTION ---
               let resolvedTitle = "Matched Channel";
               const cached = entityCache.get(peerIdStr);
               if (cached && (Date.now() - cached.timestamp < 3600000)) {
                 resolvedTitle = cached.title;
               } else {
                 try {
                   // 🔥 LRU Prevention: Clear cache if too large
                   if (entityCache.size > 1000) entityCache.clear();
                   
                   const entity = await clientInstance.getEntity(peerIdStr);
                   resolvedTitle = entity.title || "Matched Channel";
                   entityCache.set(peerIdStr, { title: resolvedTitle, timestamp: Date.now() });
                 } catch (e) {}
               }

               const snippet = (message.message || "").substring(0, 100).replace(/\n/g, " ");
               console.log(`[Telegram-Inbound] 📩 From ${resolvedTitle}: "${snippet}"`);
               await processIncoming(message, resolvedTitle);
            }
          } catch (e) {}
        };

        listenerRegistry.register(clientInstance, unifiedHandler);

        const performHardSync = async () => {
          logger.info(`[Telegram-Watchdog] 🔄 performing GAP-SYNC for ${matches.length} channels...`);
          lastSyncTime = new Date();
          for (const target of matches) {
            try {
              // Limit sync to last 5 messages to avoid timeouts
              const messages = await clientInstance.getMessages(target.entity, { limit: 5 });
              for (const msg of [...messages].reverse()) {
                // Only download media for VERY recent messages (within 1 hour)
                const isRecent = (Date.now() / 1000) - msg.date < 3600;
                let mediaBuffer = (msg.media && isRecent) ? await clientInstance.downloadMedia(msg.media, {}) : null;
                await onNewMessage({ ...msg, mediaBuffer, source: target.title || 'Telegram' });
              }
            } catch (e) {
              logger.warn(`[Telegram-Sync] Skip channel ${target.title}: ${e.message}`);
            }
          }
        };

        await performHardSync();

        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(async () => {
          if (!clientInstance?.connected) {
            logger.error('[Telegram] ⚠️ Watchdog: Connection lost. Re-initializing...');
            clearInterval(heartbeatTimer);
            isInitializing = false;
            await initTelegramListener(onNewMessage);
            return;
          }
          try { 
            await clientInstance.getMe();
            // Proactive Sync every 5 mins or on probability
            if (Math.random() > 0.8) await performHardSync();
          } catch (e) {
            logger.error('[Telegram] ⚠️ Heartbeat failed. Restarting...');
            clearInterval(heartbeatTimer);
            isInitializing = false;
            await initTelegramListener(onNewMessage);
          }
        }, 60000); 

      } else {
        logger.warn('[Telegram] ⚠️ No matching channels found');
      }

    } catch (err) {
      logger.error(`[Telegram] Pipeline Error: ${err.message}`);
      // 🔥 If we lose connection during initial pipeline setup, throw to trigger handleFailure
      if (err.message.includes('disconnected') || err.message.includes('socket')) {
        throw err; 
      }
    }
  };

  async function processIncoming(message, sourceTitle) {
    try {
      if (message.media) {
        const buffer = await clientInstance.downloadMedia(message.media, {});
        await syncOnMessageCallback({ ...message, mediaBuffer: buffer, source: sourceTitle });
      } else {
        await syncOnMessageCallback({ ...message, source: sourceTitle });
      }
    } catch (e) { logger.error(`[Telegram] Msg Error: ${e.message}`); }
  }

  const shutdown = async () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (clientInstance) await clientInstance.disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await startConnection();
};
