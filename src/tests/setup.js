/**
 * Mocha root hooks — runs before/after the entire test suite.
 * Configure shared setup (e.g., test DB connections) here.
 */

const { expect } = require('chai');

// Re-export expect for convenience in test files
module.exports = { expect };

// ─── Smoke test ────────────────────────────────────────────────
describe('Test setup', function () {
  it('should run a basic smoke test', function () {
    expect(true).to.equal(true);
  });
});
