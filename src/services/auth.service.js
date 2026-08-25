const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/env.config');
const userModel = require('../models/user.model');
const ApiError = require('../utils/api-error');
const { createChildLogger } = require('../utils/logger');

const log = createChildLogger('auth-service');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );
}

async function register(name, email, password) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    log.warn({ email }, 'Registration failed — email already exists');
    throw ApiError.conflict('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);

  const user = await userModel.createUser(name, email, passwordHash);
  log.info({ email, userId: user.id }, 'User registered successfully');

  const token = generateToken(user);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
}

async function login(email, password) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    log.warn({ email }, 'Login failed — user not found');
    throw ApiError.unauthorized('Invalid email or password');
  }

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

function logout(userId) {
  log.info({ userId }, 'User logged out');
}

module.exports = { register, login, logout, generateToken };
