const logger = require('../utils/logger');
const ApiError = require('../utils/api-error');
const config = require('../config/env.config');

/**
 * Global exception-handling middleware.
 *
 * - Catches all thrown/async errors forwarded by controllers (via next(err) or asyncHandler).
 * - Normalises every error into the consistent JSON envelope: { success, message, statusCode }.
 * - Logs every exception through Pino with the full stack trace.
 * - Hides internal details in production for non-operational errors.
 *
 * Must have exactly 4 parameters so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // ─── Use the pino-http child logger (request-scoped) when available ──
  const log = req.log || logger;

  // ─── Normalise known error types into ApiError ──────────────────────

  // JSON syntax errors (malformed request body)
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    err = ApiError.badRequest('Invalid JSON in request body');
  }

  // MySQL duplicate-entry errors (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY') {
    err = ApiError.conflict('Duplicate entry — resource already exists');
  }

  // MySQL connection / query errors
  if (err.code && err.code.startsWith('ER_')) {
    const original = err;
    err = ApiError.internal('Database error');
    err.cause = original;
  }

  // ─── Derive status code and message ─────────────────────────────────
  const statusCode = err.statusCode || 500;
  const isOperational = err instanceof ApiError && err.isOperational;

  // In production, never leak internal details for unexpected errors
  const message =
    isOperational || config.nodeEnv !== 'production'
      ? err.message || 'Internal server error'
      : 'Internal server error';

  // ─── Log with full stack trace ──────────────────────────────────────
  // Every exception is logged — operational errors at warn, unexpected at error.
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

  // ─── Respond with consistent JSON envelope ──────────────────────────
  // Prevent double-response if headers are already sent
  if (res.headersSent) {
    return;
  }

  const response = {
    success: false,
    message,
    statusCode,
  };

  // Include stack trace in dev mode for easier debugging
  if (config.nodeEnv !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
