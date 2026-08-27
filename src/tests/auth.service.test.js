const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../models/user.model');
const authService = require('../services/auth.service');
const config = require('../config/env.config');

describe('Auth Service', function () {
  describe('register()', function () {
    it('should register a new user and return user + JWT', async function () {
      const fakeUser = { id: 1, name: 'Varoon', email: 'varoon@example.com', created_at: new Date() };

      sinon.stub(userModel, 'findByEmail').resolves(null);
      sinon.stub(userModel, 'createUser').resolves(fakeUser);
      sinon.stub(bcrypt, 'hash').resolves('$2b$10$hashedpassword');

      const result = await authService.register('Varoon', 'varoon@example.com', 'password123');

      expect(result).to.have.property('user');
      expect(result).to.have.property('token');
      expect(result.user).to.deep.include({ id: 1, name: 'Varoon', email: 'varoon@example.com' });

      const decoded = jwt.verify(result.token, config.jwt.secret);
      expect(decoded).to.have.property('id', 1);
      expect(decoded).to.have.property('email', 'varoon@example.com');

      expect(userModel.findByEmail.calledOnceWith('varoon@example.com')).to.be.true;
      expect(bcrypt.hash.calledOnce).to.be.true;
      expect(userModel.createUser.calledOnce).to.be.true;
    });

    it('should throw 409 if email already exists', async function () {
      const existingUser = { id: 99, name: 'Existing', email: 'dup@example.com', password_hash: 'xxx' };
      sinon.stub(userModel, 'findByEmail').resolves(existingUser);

      try {
        await authService.register('New User', 'dup@example.com', 'password123');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(409);
        expect(err.message).to.equal('Email already registered');
      }
    });

    it('should hash the password with configured salt rounds', async function () {
      sinon.stub(userModel, 'findByEmail').resolves(null);
      sinon.stub(userModel, 'createUser').resolves({ id: 2, name: 'Test', email: 'test@example.com' });
      const hashStub = sinon.stub(bcrypt, 'hash').resolves('$2b$10$hashed');

      await authService.register('Test', 'test@example.com', 'mypassword');

      expect(hashStub.calledOnceWith('mypassword', config.bcrypt.saltRounds)).to.be.true;
    });
  });

  describe('login()', function () {
    it('should return user + JWT for valid credentials', async function () {
      const storedUser = {
        id: 1, name: 'Varoon', email: 'varoon@example.com',
        password_hash: '$2b$10$hashedpassword',
      };

      sinon.stub(userModel, 'findByEmail').resolves(storedUser);
      sinon.stub(bcrypt, 'compare').resolves(true);

      const result = await authService.login('varoon@example.com', 'password123');

      expect(result).to.have.property('user');
      expect(result).to.have.property('token');
      expect(result.user).to.deep.include({ id: 1, name: 'Varoon', email: 'varoon@example.com' });

      const decoded = jwt.verify(result.token, config.jwt.secret);
      expect(decoded).to.have.property('id', 1);
    });

    it('should throw 401 if email is not found', async function () {
      sinon.stub(userModel, 'findByEmail').resolves(null);

      try {
        await authService.login('nonexistent@example.com', 'password123');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(401);
        expect(err.message).to.equal('Invalid email or password');
      }
    });

    it('should throw 401 if password does not match', async function () {
      const storedUser = {
        id: 1, name: 'Varoon', email: 'varoon@example.com',
        password_hash: '$2b$10$hashedpassword',
      };

      sinon.stub(userModel, 'findByEmail').resolves(storedUser);
      sinon.stub(bcrypt, 'compare').resolves(false);

      try {
        await authService.login('varoon@example.com', 'wrongpassword');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(401);
        expect(err.message).to.equal('Invalid email or password');
      }
    });
  });

  describe('generateToken()', function () {
    it('should return a valid JWT containing user data', function () {
      const user = { id: 5, name: 'Test', email: 'test@example.com' };
      const token = authService.generateToken(user);

      expect(token).to.be.a('string');

      const decoded = jwt.verify(token, config.jwt.secret);
      expect(decoded).to.have.property('id', 5);
      expect(decoded).to.have.property('name', 'Test');
      expect(decoded).to.have.property('email', 'test@example.com');
      expect(decoded).to.have.property('exp');
    });
  });

  describe('logout()', function () {
    it('should not throw (stateless — just logs)', function () {
      expect(() => authService.logout(1)).to.not.throw();
    });
  });
});
