const mysql = require('mysql2/promise');
const config = require('./env.config');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  connectionLimit: config.db.connectionLimit,
  waitForConnections: true,
  queueLimit: 0,
});

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    logger.info('✅ Database connection established successfully');
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection };
