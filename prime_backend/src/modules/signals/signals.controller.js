import signalsService from './signals.service.js';
import fs from 'fs';
import path from 'path';

class SignalsController {
  async getSignals(request, reply) {
    const { all } = request.query;
    const user = request.user;
    const now = new Date();
    const isPro = user?.role === 'ADMIN' || (
      user?.subscription?.plan && 
      user?.subscription?.plan !== 'free' && 
      user?.subscription?.isActive && 
      (!user?.subscription?.endDate || new Date(user.subscription.endDate) > now)
    );

    let query = { todayOnly: all !== 'true' };
    if (all !== 'true') {
      // Home page: Only show non-closed signals
      query.status = { $in: ['ACTIVE', 'PROFIT', 'TARGET_HIT'] };
    }

    const signals = await signalsService.getAllSignals(query.todayOnly, query.status);

    if (!isPro) {
      // Mask data for Active signals, but reveal Closed signals for social proof
      return signals.map(s => {
        const signalObj = s.toObject ? s.toObject() : s;
        const isClosed = signalObj.status.startsWith('CLOSED') || 
                         ['SL_HIT', 'EXIT_ALERT', 'TARGET_HIT', 'PROFIT'].includes(signalObj.status);

        if (!isClosed) {
          return {
            ...signalObj,
            entry: 0,
            targets: [0],
            sl: 0,
            currentPrice: 0,
            isLocked: true
          };
        }
        return signalObj;
      });
    }

    return signals;
  }

  async testSignal(request, reply) {
    const { text, source } = request.body;
    const signal = await signalsService.createSignal(text, source);
    return { status: 'ok', data: signal };
  }

  async createSignal(request, reply) {
    const signal = await signalsService.createManualSignal(request.body);
    return { status: 'ok', data: signal };
  }

  async deleteSignal(request, reply) {
    const { id } = request.params;
    await signalsService.deleteSignal(id);
    return { status: 'ok' };
  }

  async getImage(request, reply) {
    const { filename } = request.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    if (fs.existsSync(filePath)) {
      const stream = fs.createReadStream(filePath);
      reply
        .header('Cache-Control', 'public, max-age=86400') // Cache for 24 hours
        .type('image/jpeg')
        .send(stream);
    } else {
      reply.status(404).send({ error: 'Image not found' });
    }
  }

  async getStats(request, reply) {
    const stats = await signalsService.getOverallStats();
    return stats;
  }
}

export default new SignalsController();
