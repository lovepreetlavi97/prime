import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../src/models/User.js';
import { sendPushNotification } from '../src/services/firebase.service.js';

async function main() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find the latest user who has an FCM token
  const user = await User.findOne({ fcmToken: { $exists: true, $ne: null } }).sort({ updatedAt: -1 });
  
  if (!user) {
    console.error('❌ No user with a registered FCM token was found in the database.');
    process.exit(1);
  }

  console.log(`Found user "${user.name}" with FCM token: ${user.fcmToken}`);

  const payload = {
    title: 'Test Notification 🚀',
    body: 'This is a test notification from the LVX Terminal backend!',
    data: {
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
      screen: 'notifications',
      type: 'test'
    }
  };

  console.log('Sending push notification...');
  await sendPushNotification(user.fcmToken, payload);
  
  console.log('Done!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
