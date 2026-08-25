const app = require('./app');
const config = require('./config/env.config');
const logger = require('./utils/logger');
const { testConnection } = require('./config/db.config');

async function start() {
  try {
    // Verify database connectivity before accepting requests
    await testConnection();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
    });

    // ─── Graceful shutdown ───────────────────────────────────────
    const shutdown = (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();
