import Package from '../../models/Package.js';
import User from '../../models/User.js';
import Subscription from '../../models/Subscription.js';

class SubscriptionsRepository {
  // Package management (Admin)
  async getAllPackages() {
    return await Package.find({ isActive: true }).sort({ price: 1 });
  }

  async getAdminPackages() {
    return await Package.find().sort({ createdAt: -1 });
  }

  async findPackageById(id) {
    return await Package.findById(id);
  }

  async createPackage(data) {
    return await Package.create(data);
  }

  async updatePackage(id, data) {
    return await Package.findByIdAndUpdate(id, data, { new: true });
  }

  async deletePackage(id) {
    return await Package.findByIdAndDelete(id);
  }

  // User Subscription logic
  async createSubscription(data) {
    return await Subscription.create(data);
  }

  async getUserSubscriptions(userId) {
    return await Subscription.find({ userId }).sort({ createdAt: -1 });
  }

  async updateUserSubscription(userId, subscriptionData) {
    return await User.findByIdAndUpdate(
      userId,
      { subscription: subscriptionData },
      { new: true }
    );
  }
}

export default new SubscriptionsRepository();
