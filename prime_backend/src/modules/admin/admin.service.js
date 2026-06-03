import Signal from '../../models/Signal.js';
import User from '../../models/User.js';
// import Transaction from '../../models/Transaction.js'; // To be added later

class AdminService {
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeSignals, signalsToday, totalUsers] = await Promise.all([
      Signal.countDocuments({ status: 'ACTIVE' }),
      Signal.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ role: 'USER' }),
    ]);

    // Calculate actual active subscription revenue dynamically from active users
    const premiumUsers = await User.find({
      role: 'USER',
      'subscription.isActive': true,
      'subscription.plan': { $in: ['pro', 'elite'] }
    }).select('subscription.plan').lean();

    let revenue = 0;
    premiumUsers.forEach(u => {
      if (u.subscription.plan === 'pro') revenue += 1999;
      else if (u.subscription.plan === 'elite') revenue += 4999;
    });

    return {
      activeSignals,
      signalsToday,
      totalUsers,
      revenue
    };
  }

  async getLiveFeed() {
    return await Signal.find()
      .select('symbol strike optionType entry sl targets currentPrice status createdAt aiRationale confidenceScore rating source')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
  }
  
  async getAllUsers() {
    return await User.find()
      .select('phone name role subscription isVerified isBanned createdAt')
      .sort({ createdAt: -1 })
      .limit(100) // 🔥 Scaling safeguard
      .lean();
  }

  async updateUser(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  async toggleBanUser(id) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    user.isBanned = !user.isBanned;
    await user.save();
    return user;
  }

  async dispatchNotification({ type, title, body, target }) {
    // 1. Filter users based on target
    let query = { fcmToken: { $ne: null, $exists: true } };
    if (target === 'Free Tier') {
      query['subscription.plan'] = 'free';
    } else if (target === 'Pro Tier') {
      query['subscription.plan'] = 'pro';
      query['subscription.isActive'] = true;
    } else if (target === 'Elite Tier') {
      query['subscription.plan'] = 'elite';
      query['subscription.isActive'] = true;
    }

    const users = await User.find(query, 'fcmToken').lean();
    const tokens = users.map(u => u.fcmToken).filter(Boolean);

    console.log(`[Admin Notification] Target: ${target}, Found ${tokens.length} users with FCM tokens.`);

    // 2. Send push notifications via FCM Admin SDK
    if (tokens.length > 0) {
      try {
        const admin = (await import('firebase-admin')).default;
        // Check if there are active Firebase apps
        const firebaseApp = admin.apps[0];
        if (firebaseApp) {
          const messaging = admin.messaging(firebaseApp);
          const batchSize = 500;
          for (let i = 0; i < tokens.length; i += batchSize) {
            const batchTokens = tokens.slice(i, i + batchSize);
            const message = {
              tokens: batchTokens,
              notification: { title, body },
              data: { 
                type: type || 'SYSTEM_ALERT',
                screen: 'notifications'
              }
            };
            const response = await messaging.sendEachForMulticast(message);
            console.log(`✅ [FCM] Broadcast batch sent: ${response.successCount} success, ${response.failureCount} failed.`);
          }
        } else {
          console.warn('⚠️ [FCM] Firebase App not initialized, skipping FCM multicast.');
        }
      } catch (err) {
        console.error('❌ [FCM] Error sending multicast notification:', err.message);
      }
    }

    // 3. Broadcast via WebSockets for real-time foreground updates
    try {
      const socketService = (await import('../../loaders/socket.js')).default;
      await socketService.emitGlobal('notification_broadcast', {
        type,
        title,
        body,
        target,
        timestamp: new Date().toISOString()
      });
      console.log('✅ [WebSocket] Broadcasted notification to connected users.');
    } catch (err) {
      console.error('❌ [WebSocket] Failed to emit notification broadcast:', err.message);
    }

    return {
      type,
      title,
      body,
      target,
      status: 'DELIVERED',
      time: 'Just now'
    };
  }
}

export default new AdminService();
