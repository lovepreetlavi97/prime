import subscriptionsRepository from './subscriptions.repository.js';
import AppError from '../../utils/appError.js';
import { sendPushNotification } from '../../services/firebase.service.js';

class SubscriptionsService {
  async listPackages(isAdmin = false) {
    if (isAdmin) return await subscriptionsRepository.getAdminPackages();
    return await subscriptionsRepository.getAllPackages();
  }

  async createPackage(packageData) {
    return await subscriptionsRepository.createPackage(packageData);
  }

  async buyPackage(userId, packageId, paymentData = {}) {
    const pkg = await subscriptionsRepository.findPackageById(packageId);
    if (!pkg || !pkg.isActive) {
      throw new AppError('Package not found or inactive', 404);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + pkg.durationInDays);

    const subscriptionData = {
      plan: pkg.name,
      startDate,
      endDate,
      isActive: true
    };

    // 1. Create entry in Subscription table (history/tracking)
    await subscriptionsRepository.createSubscription({
      userId,
      packageId: pkg._id,
      planName: pkg.name,
      amount: pkg.price,
      durationInDays: pkg.durationInDays,
      startDate,
      endDate,
      status: 'ACTIVE',
      ...paymentData
    });

    // 2. Update current subscription in User document
    const updatedUser = await subscriptionsRepository.updateUserSubscription(userId, subscriptionData);

    // 3. Dispatch push notification if token is available
    if (updatedUser && updatedUser.fcmToken) {
      try {
        await sendPushNotification(updatedUser.fcmToken, {
          title: 'Subscription Upgraded! 🚀',
          body: `Welcome to LVPrimeX ${pkg.name}. Your active access is unlocked until ${endDate.toLocaleDateString('en-IN')}.`,
          data: {
            type: 'SUBSCRIPTION_UPGRADE',
            plan: pkg.name,
            endDate: endDate.toISOString()
          }
        });
      } catch (err) {
        console.error('Failed to send push notification during package purchase:', err.message);
      }
    }

    return updatedUser;
  }

  async deletePackage(id) {
    return await subscriptionsRepository.deletePackage(id);
  }

  async updatePackage(id, data) {
    return await subscriptionsRepository.updatePackage(id, data);
  }

  async getUserSubscriptions(userId) {
    return await subscriptionsRepository.getUserSubscriptions(userId);
  }
}

export default new SubscriptionsService();
