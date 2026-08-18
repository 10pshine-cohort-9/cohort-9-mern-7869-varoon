const authService = require('../services/auth.service');
const ApiError = require('../utils/api-error');
const asyncHandler = require('../utils/async-handler');
const { createChildLogger } = require('../utils/logger');

const log = createChildLogger('auth-controller');

/**
 * POST /api/auth/signup
 * Body: { name, email, password }
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // ─── Input validation ────────────────────────────────────────
  if (!name || !email || !password) {
    req.log.warn({ email }, 'Signup failed — missing fields');
    throw ApiError.badRequest('Name, email, and password are required');
  }

  if (typeof name !== 'string' || name.trim().length < 2) {
    throw ApiError.badRequest('Name must be at least 2 characters');
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw ApiError.badRequest('Invalid email format');
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters');
  }

  req.log.info({ email }, 'Signup attempt');

  const result = await authService.register(name.trim(), email.toLowerCase().trim(), password);

  req.log.info({ email: result.user.email, userId: result.user.id }, 'User signup successful');

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: result.user,
      token: result.token,
    },
  });
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // ─── Input validation ────────────────────────────────────────
  if (!email || !password) {
    req.log.warn('Login failed — missing credentials');
    throw ApiError.badRequest('Email and password are required');
  }

  req.log.info({ email }, 'Login attempt');

  const result = await authService.login(email.toLowerCase().trim(), password);

  req.log.info({ email: result.user.email, userId: result.user.id }, 'Login successful');

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      token: result.token,
    },
  });
});

/**
 * POST /api/auth/logout
 * Stateless JWT — the client discards the token.
 * This endpoint logs the event and returns a success response.
 */
const logout = asyncHandler(async (req, res) => {
  // req.user is attached by the auth middleware
  const userId = req.user && req.user.id;

  authService.logout(userId);

  req.log.info({ userId }, 'Logout successful');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = { signup, login, logout };
