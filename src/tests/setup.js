/**
 * Mocha root hooks — shared setup/teardown for the entire test suite.
 *
 * - Restores all sinon stubs after every test so tests don't leak state.
 * - Re-exports `expect` and `sinon` for convenience.
 */
const sinon = require('sinon');
const { expect } = require('chai');

// Restore all stubs/spies/mocks after each test
afterEach(() => {
  sinon.restore();
});

module.exports = { expect, sinon };
