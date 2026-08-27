const jwt = require('jsonwebtoken');
const config = require('../config/env.config');
const ApiError = require('../utils/api-error');
const { createChildLogger } = require('../utils/logger');

const log = createChildLogger('auth-middleware');

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.log.warn('Auth failed — no token provided');
      throw ApiError.unauthorized('Access denied. No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      req.log.warn('Auth failed — empty token');
      throw ApiError.unauthorized('Access denied. No token provided');
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    req.user = decoded;

    req.log.debug({ userId: decoded.id }, 'Token verified');

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      req.log.warn('Auth failed — token expired');
      return next(ApiError.unauthorized('Token expired. Please log in again'));
    }

    if (err instanceof jwt.JsonWebTokenError) {
      req.log.warn({ err }, 'Auth failed — invalid token');
      return next(ApiError.unauthorized('Invalid token'));
    }

    if (err instanceof ApiError) {
      return next(err);
    }

    req.log.error({ err }, 'Auth middleware — unexpected error');
    next(ApiError.internal('Authentication error'));
  }
}

module.exports = { authenticate };
