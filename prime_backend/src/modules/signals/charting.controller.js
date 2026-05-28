import chartingService from '../../services/charting.service.js';
import Signal from '../../models/Signal.js';

class ChartingController {
  async getChartData(request, reply) {
    const { signalId } = request.params;
    
    try {
      const signal = await Signal.findById(signalId);
      if (!signal) {
        return reply.status(404).send({ message: 'Signal not found' });
      }

      const chartData = await chartingService.getSignalChartData(signal);
      reply.send(chartData);
    } catch (err) {
      reply.status(500).send({ message: err.message });
    }
  }
}

export default new ChartingController();
