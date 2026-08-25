const { pool } = require('../config/db.config');

async function create(userId, title, content) {
  const [result] = await pool.execute(
    'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
    [userId, title, content],
  );
  return {
    id: result.insertId,
    user_id: userId,
    title,
    content,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

async function findAllByUser(userId) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, title, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
    [userId],
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, title, content, created_at, updated_at FROM notes WHERE id = ?',
    [id],
  );
  return rows[0] || null;
}

async function update(id, title, content) {
  await pool.execute(
    'UPDATE notes SET title = ?, content = ? WHERE id = ?',
    [title, content, id],
  );
  const [rows] = await pool.execute(
    'SELECT id, user_id, title, content, created_at, updated_at FROM notes WHERE id = ?',
    [id],
  );
  return rows[0] || null;
}

async function remove(id) {
  const [result] = await pool.execute(
    'DELETE FROM notes WHERE id = ?',
    [id],
  );
  return result.affectedRows > 0;
}

async function search(userId, query, fromDate, toDate) {
  let sql = 'SELECT id, user_id, title, content, created_at, updated_at FROM notes WHERE user_id = ?';
  const params = [userId];

  if (query) {
    sql += ' AND (title LIKE ? OR content LIKE ?)';
    const likeQuery = `%${query}%`;
    params.push(likeQuery, likeQuery);
  }

  if (fromDate) {
    sql += ' AND created_at >= ?';
    params.push(fromDate);
  }

  if (toDate) {
    sql += ' AND created_at <= ?';
    params.push(toDate);
  }

  sql += ' ORDER BY updated_at DESC';

  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { create, findAllByUser, findById, update, remove, search };
