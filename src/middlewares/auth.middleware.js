const { createChildLogger } = require('../utils/logger');

const log = createChildLogger('auth-middleware');

// TODO: Implement JWT verification middleware
// - Extract token from Authorization header (Bearer scheme)
// - Verify token using jsonwebtoken
// - Attach decoded payload to req.user
// - Call next() or pass ApiError.unauthorized() to next

/**
 * Logging guidance:
 *
 *   - Missing token:  req.log.warn('Auth failed — no token provided')
 *   - Invalid token:  req.log.warn({ err }, 'Auth failed — invalid token')
 *   - Expired token:  req.log.warn('Auth failed — token expired')
 *   - Success:        req.log.debug({ userId: decoded.id }, 'Token verified')
 */
module.exports = {
  // TODO: authenticate
};
