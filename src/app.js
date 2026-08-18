const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/error.middleware');
const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.routes');

const app = express();

// ─── Security & parsing ────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── HTTP request / response logging ───────────────────────────
// Logs method, path, statusCode, and responseTime (ms) for every
// request that completes. Attaches a child logger to req.log so
// downstream handlers can log with request context automatically.
app.use(
  pinoHttp({
    logger,
    // Custom log message: "GET /api/v1/notes 200 — 12ms"
    customSuccessMessage(req, res) {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage(req, res) {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    // Choose log level based on status code
    customLogLevel(_req, res, err) {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    // Include only the fields we care about in the serialised object
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          headers: {
            host: req.headers.host,
            'user-agent': req.headers['user-agent'],
          },
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ─── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/v1/notes', notesRoutes);

// ─── 404 catch-all ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;
