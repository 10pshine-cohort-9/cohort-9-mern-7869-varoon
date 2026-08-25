/**
 * Wraps an async Express route handler so that rejected promises
 * and thrown errors are automatically forwarded to next().
 *
 * Eliminates the need for try/catch in every controller method.
 *
 * @param {Function} fn - Async route handler (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
