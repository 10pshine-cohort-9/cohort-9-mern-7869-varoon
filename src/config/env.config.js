const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  db: Object.freeze({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'notes_app',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  }),

  jwt: Object.freeze({
    secret: process.env.JWT_SECRET || 'change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  }),

  bcrypt: Object.freeze({
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  }),
});

module.exports = config;
