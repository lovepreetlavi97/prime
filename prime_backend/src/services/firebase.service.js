import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

let firebaseApp = null;
let messaging = null;

try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.resolve(process.cwd(), 'firebase-service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    messaging = admin.messaging(firebaseApp);
    logger.info('✅ [Firebase] Admin initialized successfully');
  } else {
    logger.warn('⚠️ [Firebase] firebase-service-account.json not found in root. Push notifications will be logged to console in dev mode.');
  }
} catch (e) {
  logger.error(`❌ [Firebase] Failed to initialize Firebase Admin: ${e.message}`);
}

export const sendPushNotification = async (token, payload) => {
  if (!token) {
    logger.warn('[Firebase] Cannot send push notification: FCM token is null or undefined');
    return;
  }
  
  if (!messaging) {
    logger.info(`[Firebase Mock] Would send push to token "${token}": ${JSON.stringify(payload)}`);
    return;
  }

  try {
    const response = await messaging.send({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
    logger.info(`✅ [Firebase] Push notification sent successfully. MessageId: ${response}`);
  } catch (err) {
    logger.error(`❌ [Firebase] Error sending push notification: ${err.message}`);
  }
};

export const sendPushNotificationToAllUsers = async (payload) => {
  try {
    const User = (await import('../models/User.js')).default;
    const users = await User.find({ fcmToken: { $ne: null, $exists: true } }, 'fcmToken').lean();
    const tokens = users.map(u => u.fcmToken).filter(Boolean);

    if (tokens.length === 0) {
      logger.info('[Firebase] No users with FCM tokens found.');
      return;
    }

    logger.info(`[Firebase] Sending push notification to ${tokens.length} users...`);

    if (!messaging) {
      logger.info(`[Firebase Mock Multicast] Would send to ${tokens.length} tokens: ${JSON.stringify(payload)}`);
      return;
    }

    // Firebase sendEachForMulticast accepts up to 500 tokens per batch
    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batchTokens = tokens.slice(i, i + batchSize);
      const message = {
        tokens: batchTokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
      };
      
      const response = await messaging.sendEachForMulticast(message);
      logger.info(`✅ [Firebase] Multicast batch sent: ${response.successCount} success, ${response.failureCount} failed.`);
    }
  } catch (err) {
    logger.error(`❌ [Firebase] Error sending multicast notification: ${err.message}`);
  }
};
