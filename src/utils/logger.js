const pino = require('pino');
const config = require('../config/env.config');

const logger = pino({
  level: config.logLevel,
  transport:
    config.nodeEnv !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined,
});

function createChildLogger(component) {
  return logger.child({ component });
}

module.exports = logger;
module.exports.createChildLogger = createChildLogger;
