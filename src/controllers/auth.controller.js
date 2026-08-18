const { createChildLogger } = require('../utils/logger');

const log = createChildLogger('auth-controller');

// TODO: Implement auth controller
// Handlers to implement:
// - register(req, res, next)
// - login(req, res, next)

/**
 * Logging guidance for each handler:
 *
 *   register:
 *     - On entry:   req.log.info({ email: req.body.email }, 'Registration attempt')
 *     - On success: req.log.info({ email, userId }, 'User signup successful')
 *     - On failure: req.log.warn({ email }, 'Signup failed — duplicate email')
 *     - On error:   req.log.error({ err }, 'Signup error')
 *
 *   login:
 *     - On entry:   req.log.info({ email: req.body.email }, 'Login attempt')
 *     - On success: req.log.info({ email, userId }, 'Login successful')
 *     - On failure: req.log.warn({ email }, 'Login failed — invalid credentials')
 *     - On error:   req.log.error({ err }, 'Login error')
 */
module.exports = {
  // TODO: register
  // TODO: login
};
