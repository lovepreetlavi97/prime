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
