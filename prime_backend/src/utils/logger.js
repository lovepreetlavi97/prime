import pino from 'pino';

// 🔥 SILENCE: Possible EventEmitter memory leak warning
process.stdout.setMaxListeners(20);
process.stderr.setMaxListeners(20);

const isProduction = process.env.NODE_ENV === 'production';

/**
 * HIGH-PERFORMANCE LOGGER
 * Optimized for low-latency trading environments.
 * Disables pretty-printing in production to prevent event-loop blocking.
 */
const logger = pino({
  level: isProduction ? 'info' : 'debug',
  ...(isProduction ? {} : {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  })
});

/**
 * LOG SAMPLING & PERFORMANCE UTILS
 */
export const shouldLog = (type, probability = 10) => {
  return Math.random() * 100 < probability;
};

export const startTimer = () => process.hrtime();

export const endTimer = (start) => {
  const diff = process.hrtime(start);
  return (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
};

export default logger;
