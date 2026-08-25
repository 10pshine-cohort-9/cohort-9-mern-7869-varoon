# Notes App — Backend API

A RESTful backend for a Notes application built with **Node.js**, **Express**, **MySQL**, and **JWT authentication**.

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Runtime        | Node.js, Express                    |
| Database       | MySQL 8 + mysql2 (promise pool)     |
| Auth           | JWT (jsonwebtoken) + bcrypt         |
| Logging        | Pino + pino-http + pino-pretty      |
| Security       | Helmet, CORS                        |
| Testing        | Mocha, Chai, Sinon, Supertest       |
| Dev Tooling    | Nodemon, ESLint                     |

## Project Structure

```
├── .env.example          # Environment template (copy to .env)
├── schema.sql            # MySQL table definitions
├── package.json
└── src/
    ├── app.js            # Express app configuration
    ├── server.js         # Entry point (DB check → listen)
    ├── config/
    │   ├── env.config.js # Centralised env config (frozen)
    │   └── db.config.js  # MySQL connection pool
    ├── controllers/
    │   ├── auth.controller.js
    │   └── notes.controller.js
    ├── services/
    │   ├── auth.service.js
    │   └── notes.service.js
    ├── models/
    │   ├── user.model.js
    │   └── note.model.js
    ├── routes/
    │   ├── auth.routes.js
    │   └── notes.routes.js
    ├── middlewares/
    │   ├── auth.middleware.js   # JWT verification
    │   └── error.middleware.js  # Global error handler
    ├── utils/
    │   ├── logger.js           # Pino logger instance
    │   ├── api-error.js        # Custom ApiError class
    │   └── async-handler.js    # Async route wrapper
    └── tests/
        ├── setup.js                 # Mocha root hooks + sinon cleanup
        ├── auth.service.test.js     # Auth service unit tests
        └── auth.controller.test.js  # Auth controller HTTP tests
```

## Prerequisites

- **Node.js** ≥ 18
- **MySQL** ≥ 8.0
- **npm** ≥ 9

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/varoonkumar1/cohort-9-mern-7869-varoon.git
cd cohort-9-mern-7869-varoon
npm install
```

### 2. Configure environment

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=notes_app
DB_CONNECTION_LIMIT=10

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=10
```

### 3. Create the database

Run the schema file against your MySQL server:

```bash
mysql -u root -p < schema.sql
```

This creates the `notes_app` database with `users` and `notes` tables.

### 4. Start the server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

The server will:
1. Test the database connection
2. Start listening on the configured `PORT` (default: 3000)
3. Log `🚀 Server running on port 3000 [development]`

## Environment Variables

| Variable              | Description                            | Default         |
|-----------------------|----------------------------------------|-----------------|
| `PORT`                | HTTP server port                       | `3000`          |
| `NODE_ENV`            | Environment (`development`/`production`) | `development` |
| `LOG_LEVEL`           | Pino log level                         | `debug` (dev), `info` (prod) |
| `DB_HOST`             | MySQL host                             | `localhost`     |
| `DB_PORT`             | MySQL port                             | `3306`          |
| `DB_USER`             | MySQL username                         | `root`          |
| `DB_PASSWORD`         | MySQL password                         | *(empty)*       |
| `DB_NAME`             | MySQL database name                    | `notes_app`     |
| `DB_CONNECTION_LIMIT` | Max pool connections                   | `10`            |
| `JWT_SECRET`          | Secret key for signing JWTs            | `change-me`     |
| `JWT_EXPIRES_IN`      | Token expiry duration                  | `7d`            |
| `BCRYPT_SALT_ROUNDS`  | bcrypt cost factor                     | `10`            |

## API Endpoints

### Authentication

| Method | Endpoint             | Auth? | Description              |
|--------|----------------------|-------|--------------------------|
| POST   | `/api/auth/signup`   | No    | Register a new user      |
| POST   | `/api/auth/login`    | No    | Login and get JWT        |
| POST   | `/api/auth/logout`   | Yes   | Log the logout event     |

### Notes (coming soon)

| Method | Endpoint             | Auth? | Description              |
|--------|----------------------|-------|--------------------------|
| POST   | `/api/v1/notes`      | Yes   | Create a note            |
| GET    | `/api/v1/notes`      | Yes   | Get all user's notes     |
| GET    | `/api/v1/notes/:id`  | Yes   | Get a single note        |
| PUT    | `/api/v1/notes/:id`  | Yes   | Update a note            |
| DELETE | `/api/v1/notes/:id`  | Yes   | Delete a note            |

### Health Check

```
GET /health → { "status": "ok", "timestamp": "..." }
```

### Request / Response Examples

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Varoon", "email": "varoon@example.com", "password": "secret123"}'
```
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": 1, "name": "Varoon", "email": "varoon@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "varoon@example.com", "password": "secret123"}'
```
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "Varoon", "email": "varoon@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error response (all errors):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

### Using the JWT

For protected endpoints, include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Running Tests

Tests use **Mocha** + **Chai** with **Sinon** for mocking DB calls and **Supertest** for HTTP-level testing. No running database is required.

```bash
npm test
```

Test coverage:

| Suite               | Tests | What's covered                                                |
|---------------------|-------|---------------------------------------------------------------|
| Auth Service        | 9     | register (success, duplicate), login (success, not found, wrong pw), generateToken, logout |
| Auth Controller     | 14    | signup (success, validation × 4, duplicate), login (success, validation, not found, wrong pw), logout (valid/no/invalid/expired token), error envelope |
| **Total**           | **23**| **All passing ✅**                                            |

## Scripts

| Script       | Command         | Description                              |
|--------------|-----------------|------------------------------------------|
| `npm run dev`| `nodemon src/server.js` | Start with auto-reload            |
| `npm start`  | `node src/server.js`    | Start in production mode           |
| `npm test`   | `mocha src/tests/**/*.js` | Run the full test suite          |

## Error Handling

All errors return a consistent JSON envelope:

```json
{ "success": false, "message": "...", "statusCode": 400 }
```

- **Operational errors** (bad input, auth failures) → logged at `warn` level
- **Unexpected errors** (bugs, DB failures) → logged at `error` level with full stack trace
- In production, internal error details are hidden from the client
- In development, the `stack` property is included in error responses

## Logging

Powered by **Pino** with automatic HTTP request/response logging via **pino-http**:

- Every request logs: method, path, status code, response time
- Pretty-printed in development, structured JSON in production
- Component-tagged child loggers for auth, notes, middleware layers
- Configurable via `LOG_LEVEL` environment variable

## License

ISC
