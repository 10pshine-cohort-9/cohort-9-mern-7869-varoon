const pino = require('pino');
const config = require('../config/env.config');

const logger = pino({
  level: config.logLevel,
  transport:
    config.nodeEnv !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined,
});

/**
 * Creates a child logger tagged with a component name.
 * Usage: const log = createChildLogger('auth');
 *        log.info({ email }, 'User signed up');
 *
 * @param {string} component - Logical component name (e.g. 'auth', 'notes', 'db')
 * @returns {import('pino').Logger}
 */
function createChildLogger(component) {
  return logger.child({ component });
}

module.exports = logger;
module.exports.createChildLogger = createChildLogger;
