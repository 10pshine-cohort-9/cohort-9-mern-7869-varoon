const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pino = require('pino-http');
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

// ─── HTTP request logging ──────────────────────────────────────
app.use(pino({ logger }));

// ─── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API routes ────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notes', notesRoutes);

// ─── 404 catch-all ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;
