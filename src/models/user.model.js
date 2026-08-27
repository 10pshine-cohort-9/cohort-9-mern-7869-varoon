const { pool } = require('../config/db.config');

async function createUser(name, email, passwordHash) {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash],
  );
  return { id: result.insertId, name, email, created_at: new Date() };
}

async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = ?',
    [email],
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?',
    [id],
  );
  return rows[0] || null;
}

module.exports = { createUser, findByEmail, findById };
