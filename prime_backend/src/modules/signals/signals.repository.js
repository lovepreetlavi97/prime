import Signal from '../../models/Signal.js';

class SignalsRepository {
  async findAll(limit = 50, todayOnly = false, status = null) {
    const query = {};
    if (todayOnly) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: twentyFourHoursAgo };
    }
    if (status) {
      query.status = status;
    }
    // 🔥 Optimized: lean() reduces object hydration overhead
    // 🔥 Optimized: select() prevents fetching heavy rawText/updates fields
    return await Signal.find(query)
      .select('symbol market type entry sl targets currentPrice status createdAt aiScore rating expiryDate strike optionType highPrice isLocked')
      .sort({ _id: -1 })
      .limit(limit)
      .lean();
  }

  async findById(id) {
    return await Signal.findById(id);
  }

  async create(signalData) {
    return await Signal.create(signalData);
  }

  async update(id, updateData) {
    return await Signal.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
  }

  async delete(id) {
    return await Signal.findByIdAndDelete(id);
  }
}

export default new SignalsRepository();
