const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../app');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const config = require('../config/env.config');

describe('Auth Controller (HTTP)', function () {
  // ─────────────────────────────────────────────────────────────
  // POST /api/auth/signup
  // ─────────────────────────────────────────────────────────────
  describe('POST /api/auth/signup', function () {
    it('should register a user and return 201 with token', async function () {
      sinon.stub(userModel, 'findByEmail').resolves(null);
      sinon.stub(userModel, 'createUser').resolves({
        id: 1, name: 'Varoon', email: 'varoon@example.com', created_at: new Date(),
      });
      sinon.stub(bcrypt, 'hash').resolves('$2b$10$hashedpassword');

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Varoon', email: 'varoon@example.com', password: 'password123' })
        .expect(201);

      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('User registered successfully');
      expect(res.body.data).to.have.property('user');
      expect(res.body.data).to.have.property('token');
      expect(res.body.data.user.email).to.equal('varoon@example.com');

      // Verify returned token is valid
      const decoded = jwt.verify(res.body.data.token, config.jwt.secret);
      expect(decoded).to.have.property('id', 1);
    });

    it('should return 400 when required fields are missing', async function () {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com' }) // missing name and password
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.statusCode).to.equal(400);
      expect(res.body.message).to.include('required');
    });

    it('should return 400 for invalid email format', async function () {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Test', email: 'not-an-email', password: 'password123' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('email');
    });

    it('should return 400 for password shorter than 6 characters', async function () {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Test', email: 'test@example.com', password: '123' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('6 characters');
    });

    it('should return 400 for name shorter than 2 characters', async function () {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'A', email: 'test@example.com', password: 'password123' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('2 characters');
    });

    it('should return 409 when email already exists', async function () {
      sinon.stub(userModel, 'findByEmail').resolves({
        id: 99, name: 'Existing', email: 'dup@example.com', password_hash: 'xxx',
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'New User', email: 'dup@example.com', password: 'password123' })
        .expect(409);

      expect(res.body.success).to.be.false;
      expect(res.body.statusCode).to.equal(409);
      expect(res.body.message).to.include('already registered');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // POST /api/auth/login
  // ─────────────────────────────────────────────────────────────
  describe('POST /api/auth/login', function () {
    it('should login and return 200 with token', async function () {
      sinon.stub(userModel, 'findByEmail').resolves({
        id: 1, name: 'Varoon', email: 'varoon@example.com',
        password_hash: '$2b$10$hashedpassword',
      });
      sinon.stub(bcrypt, 'compare').resolves(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'varoon@example.com', password: 'password123' })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Login successful');
      expect(res.body.data).to.have.property('token');
      expect(res.body.data.user.id).to.equal(1);
    });

    it('should return 400 when email or password is missing', async function () {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' }) // missing password
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('required');
    });

    it('should return 401 for non-existent email', async function () {
      sinon.stub(userModel, 'findByEmail').resolves(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' })
        .expect(401);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('Invalid');
    });

    it('should return 401 for wrong password', async function () {
      sinon.stub(userModel, 'findByEmail').resolves({
        id: 1, name: 'Varoon', email: 'varoon@example.com',
        password_hash: '$2b$10$hashedpassword',
      });
      sinon.stub(bcrypt, 'compare').resolves(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'varoon@example.com', password: 'wrongpassword' })
        .expect(401);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('Invalid');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // POST /api/auth/logout
  // ─────────────────────────────────────────────────────────────
  describe('POST /api/auth/logout', function () {
    it('should return 200 with a valid token', async function () {
      const token = jwt.sign({ id: 1, name: 'Test', email: 'test@example.com' }, config.jwt.secret, { expiresIn: '1h' });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.message).to.include('Logged out');
    });

    it('should return 401 without a token', async function () {
      const res = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('No token');
    });

    it('should return 401 with an invalid token', async function () {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('Invalid token');
    });

    it('should return 401 with an expired token', async function () {
      // Sign a token that expired 1 hour ago
      const token = jwt.sign(
        { id: 1, name: 'Test', email: 'test@example.com' },
        config.jwt.secret,
        { expiresIn: '-1h' },
      );

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('expired');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Error response format
  // ─────────────────────────────────────────────────────────────
  describe('Error response envelope', function () {
    it('should return { success, message, statusCode } on any error', async function () {
      const res = await request(app)
        .get('/api/auth/nonexistent-route')
        .expect(404);

      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message');
      expect(res.body).to.have.property('statusCode', 404);
    });
  });
});
