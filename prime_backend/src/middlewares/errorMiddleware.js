import logger from '../utils/logger.js';

const errorMiddleware = (error, request, reply) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error(error);
    reply.status(error.statusCode).send({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error: error,
    });
  } else {
    // Production: Don't leak error details
    if (error.isOperational) {
      reply.status(error.statusCode).send({
        status: error.status,
        message: error.message,
      });
    } else {
      logger.error('ERROR 💥', error);
      reply.status(500).send({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
};

export default errorMiddleware;
