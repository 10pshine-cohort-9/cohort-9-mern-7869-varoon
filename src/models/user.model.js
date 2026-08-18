const { pool } = require('../config/db.config');

/**
 * Create a new user.
 * @param {string} name
 * @param {string} email
 * @param {string} passwordHash - Already hashed password
 * @returns {Promise<{id: number, name: string, email: string, created_at: Date}>}
 */
async function createUser(name, email, passwordHash) {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash],
  );
  return { id: result.insertId, name, email, created_at: new Date() };
}

/**
 * Find a user by email address.
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = ?',
    [email],
  );
  return rows[0] || null;
}

/**
 * Find a user by ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?',
    [id],
  );
  return rows[0] || null;
}

module.exports = { createUser, findByEmail, findById };
