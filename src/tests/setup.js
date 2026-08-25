const sinon = require('sinon');
const { expect } = require('chai');

afterEach(() => {
  sinon.restore();
});

module.exports = { expect, sinon };
