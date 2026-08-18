const { createChildLogger } = require('../utils/logger');

const log = createChildLogger('auth-service');

// TODO: Implement auth service
// Methods to implement:
// - register(name, email, password) → hash password, create user, return JWT
// - login(email, password)          → verify credentials, return JWT
// - logout(userId)                  → invalidate token / clear session

/**
 * Placeholder — call log.info/warn/error in each method:
 *
 *   register:  log.info({ email }, 'User registered successfully')
 *              log.warn({ email }, 'Registration failed — email already exists')
 *              log.error({ err, email }, 'Registration error')
 *
 *   login:     log.info({ email }, 'User logged in successfully')
 *              log.warn({ email }, 'Login failed — invalid credentials')
 *              log.error({ err, email }, 'Login error')
 *
 *   logout:    log.info({ userId }, 'User logged out')
 */
module.exports = {
  // TODO: register
  // TODO: login
  // TODO: logout

  // Exported for use by controller layer (call these in your implementations)
  _log: log,
};
