const logger = require('../utils/logger');
const ApiError = require('../utils/api-error');
const config = require('../config/env.config');
function errorHandler(err, req, res, _next) {
  const log = req.log || logger;

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    err = ApiError.badRequest('Invalid JSON in request body');
  }

  if (err.code === 'ER_DUP_ENTRY') {
    err = ApiError.conflict('Duplicate entry — resource already exists');
  }

  if (err.code && err.code.startsWith('ER_')) {
    const original = err;
    err = ApiError.internal('Database error');
    err.cause = original;
  }

  const statusCode = err.statusCode || 500;
  const isOperational = err instanceof ApiError && err.isOperational;

  const message =
    isOperational || config.nodeEnv !== 'production'
      ? err.message || 'Internal server error'
      : 'Internal server error';

  if (!isOperational) {
    log.error(
      {
        err,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        statusCode,
        ...(err.cause ? { cause: err.cause.message } : {}),
      },
      'Unhandled exception — %s %s → %d',
      req.method,
      req.originalUrl,
      statusCode,
    );
  } else {
    log.warn(
      {
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        statusCode,
      },
      'Operational error — %s %s → %d: %s',
      req.method,
      req.originalUrl,
      statusCode,
      message,
    );
  }

  if (res.headersSent) {
    return;
  }

  const response = {
    success: false,
    message,
    statusCode,
  };

  if (config.nodeEnv !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
