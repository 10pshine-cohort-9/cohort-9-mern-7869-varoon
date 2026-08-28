const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const config = require('./config/env.config');
const logger = require('./utils/logger');
const { testConnection } = require('./config/db.config');

async function start() {
  try {
    await testConnection();

    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    app.set('io', io);

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        socket.user = decoded;
        next();
      } catch {
        next(new Error('Invalid or expired token'));
      }
    });

    io.on('connection', (socket) => {
      const userId = socket.user.id;
      const userRoom = `user:${userId}`;

      socket.join(userRoom);
      logger.debug({ userId, socketId: socket.id }, 'Socket connected');

      socket.on('disconnect', () => {
        logger.debug({ userId, socketId: socket.id }, 'Socket disconnected');
      });
    });

    httpServer.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      io.close();
      httpServer.close(() => {
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
