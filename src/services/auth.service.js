const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/env.config');
const userModel = require('../models/user.model');
const ApiError = require('../utils/api-error');
const { createChildLogger } = require('../utils/logger');

const log = createChildLogger('auth-service');

/**
 * Generate a signed JWT for the given user.
 * @param {Object} user - { id, name, email }
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );
}

/**
 * Register a new user.
 * @param {string} name
 * @param {string} email
 * @param {string} password - Plain-text password
 * @returns {Promise<{user: Object, token: string}>}
 * @throws {ApiError} 409 if email already exists
 */
async function register(name, email, password) {
  // Check for duplicate email
  const existing = await userModel.findByEmail(email);
  if (existing) {
    log.warn({ email }, 'Registration failed — email already exists');
    throw ApiError.conflict('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);

  // Create user
  const user = await userModel.createUser(name, email, passwordHash);
  log.info({ email, userId: user.id }, 'User registered successfully');

  // Generate JWT
  const token = generateToken(user);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
}

/**
 * Authenticate a user with email and password.
 * @param {string} email
 * @param {string} password - Plain-text password
 * @returns {Promise<{user: Object, token: string}>}
 * @throws {ApiError} 401 if credentials are invalid
 */
async function login(email, password) {
  // Find user by email (includes password_hash)
  const user = await userModel.findByEmail(email);
  if (!user) {
    log.warn({ email }, 'Login failed — user not found');
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    log.warn({ email }, 'Login failed — invalid password');
    throw ApiError.unauthorized('Invalid email or password');
  }

  log.info({ email, userId: user.id }, 'User logged in successfully');

  const token = generateToken(user);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
}

/**
 * Handle logout (stateless JWT — server-side logging only).
 * In a stateless JWT approach the client discards the token;
 * this method exists to log the event.
 * @param {number} userId
 */
function logout(userId) {
  log.info({ userId }, 'User logged out');
}

module.exports = { register, login, logout, generateToken };
