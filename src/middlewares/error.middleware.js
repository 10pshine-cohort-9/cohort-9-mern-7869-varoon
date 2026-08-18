const logger = require('../utils/logger');
const ApiError = require('../utils/api-error');

/**
 * Global error-handling middleware.
 * Must have 4 parameters so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Default to 500 if no statusCode is set
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log the full error for non-operational (unexpected) errors
  if (!(err instanceof ApiError) || !err.isOperational) {
    logger.error({ err }, 'Unhandled error');
  } else {
    logger.warn({ statusCode, message }, 'Operational error');
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
}

module.exports = errorHandler;
