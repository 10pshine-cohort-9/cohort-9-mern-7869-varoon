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

  // Use the pino-http child logger attached to the request when available,
  // fall back to the root logger otherwise.
  const log = req.log || logger;

  // Log the full error for non-operational (unexpected) errors
  if (!(err instanceof ApiError) || !err.isOperational) {
    log.error(
      { err, method: req.method, url: req.originalUrl, statusCode },
      'Unhandled error — %s %s',
      req.method,
      req.originalUrl,
    );
  } else {
    log.warn(
      { statusCode, method: req.method, url: req.originalUrl },
      'Operational error — %s %s: %s',
      req.method,
      req.originalUrl,
      message,
    );
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
}

module.exports = errorHandler;
