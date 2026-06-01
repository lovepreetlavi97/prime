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
      .select('symbol strike optionType entry status createdAt')
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
}

export default new AdminService();
