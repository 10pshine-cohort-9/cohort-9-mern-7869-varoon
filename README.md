# Notes App

A full-stack Notes application with **rich text editing**, **real-time updates**, and **JWT authentication**.

Built with **Node.js / Express / MySQL** (backend) and **React 19 / Vite** (frontend).

## Tech Stack

| Layer          | Technology                                     |
|----------------|------------------------------------------------|
| Frontend       | React 19, Vite, react-quill-new, Socket.IO Client |
| Backend        | Node.js, Express, Socket.IO                    |
| Database       | MySQL 8 + mysql2 (promise pool)                |
| Auth           | JWT (jsonwebtoken) + bcrypt                    |
| Validation     | Joi                                            |
| Logging        | Pino + pino-http + pino-pretty                 |
| Security       | Helmet, CORS                                   |
| Backend Tests  | Mocha, Chai, Sinon, Supertest                  |
| Frontend Tests | Vitest, React Testing Library, user-event      |

## Features

- **Authentication**: Signup, login, logout with JWT tokens
- **Rich Text Notes**: Create and edit notes with a full-featured WYSIWYG editor (bold, italic, headings, lists, code blocks, links, images)
- **Dashboard**: View all notes in a responsive card grid
- **Search**: Debounced search bar filters notes by title and content
- **Delete**: Delete notes with a confirmation prompt
- **Real-Time Updates**: Socket.IO pushes note changes to all connected tabs
- **Export/Import**: Download all notes as JSON, or import from a JSON file

## Prerequisites

- **Node.js** ≥ 18
- **MySQL** ≥ 8.0
- **npm** ≥ 9

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/varoonkumar1/cohort-9-mern-7869-varoon.git
cd cohort-9-mern-7869-varoon

# Backend dependencies
npm install

# Frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure environment

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

The frontend `.env` is at `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Create the database

```bash
mysql -u root -p < schema.sql
```

This creates the `notes_app` database with `users` and `notes` tables.

### 4. Start the servers

```bash
# Backend (auto-restart on file changes)
npm run dev

# Frontend (in a separate terminal)
cd client
npm run dev
```

- Backend runs on `http://localhost:3000`
- Frontend runs on `http://localhost:5173` (default Vite port)

## Environment Variables

### Backend (.env)

| Variable              | Description                                      | Default         |
|-----------------------|--------------------------------------------------|-----------------|
| `PORT`                | HTTP server port                                 | `3000`          |
| `NODE_ENV`            | Environment (`development` / `production`)       | `development`   |
| `LOG_LEVEL`           | Pino log level                                   | `debug`         |
| `DB_HOST`             | MySQL host                                       | `localhost`     |
| `DB_PORT`             | MySQL port                                       | `3306`          |
| `DB_USER`             | MySQL username                                   | `root`          |
| `DB_PASSWORD`         | MySQL password                                   | *(empty)*       |
| `DB_NAME`             | MySQL database name                              | `notes_app`     |
| `DB_CONNECTION_LIMIT` | Max pool connections                             | `10`            |
| `JWT_SECRET`          | Secret key for signing JWTs                      | `change-me`     |
| `JWT_EXPIRES_IN`      | Token expiry duration                            | `7d`            |
| `BCRYPT_SALT_ROUNDS`  | bcrypt cost factor                               | `10`            |

### Frontend (client/.env)

| Variable              | Description                  | Default                   |
|-----------------------|------------------------------|---------------------------|
| `VITE_API_BASE_URL`   | Backend API base URL         | `http://localhost:3000`   |

## API Endpoints

### Authentication

| Method | Endpoint             | Auth? | Description              |
|--------|----------------------|-------|--------------------------|
| POST   | `/api/auth/signup`   | No    | Register a new user      |
| POST   | `/api/auth/login`    | No    | Login and get JWT        |
| POST   | `/api/auth/logout`   | Yes   | Log the logout event     |

### Notes

| Method | Endpoint               | Auth? | Description                  |
|--------|------------------------|-------|------------------------------|
| POST   | `/api/notes`           | Yes   | Create a note                |
| GET    | `/api/notes`           | Yes   | Get all user's notes         |
| GET    | `/api/notes/search`    | Yes   | Search notes by query/dates  |
| GET    | `/api/notes/:id`       | Yes   | Get a single note            |
| PUT    | `/api/notes/:id`       | Yes   | Update a note                |
| DELETE | `/api/notes/:id`       | Yes   | Delete a note                |

### Health Check

```
GET /health → { "status": "ok", "timestamp": "..." }
```

## Running Tests

### Backend Tests (Mocha)

Tests use **Mocha** + **Chai** with **Sinon** for mocking DB calls and **Supertest** for HTTP-level testing. No running database is required.

```bash
npm test
```

### Frontend Tests (Vitest)

Tests use **Vitest** + **React Testing Library** + **user-event**. The test environment is jsdom.

```bash
cd client
npm test
```

### Test Coverage

To generate coverage reports (for SonarQube or review):

```bash
# Backend coverage
npx c8 --reporter=lcov npm test

# Frontend coverage
cd client
npx vitest run --coverage
```

## SonarQube Integration

A `sonar-project.properties` file is included at the project root.

### Running a Local SonarQube Scan

1. **Install SonarQube** locally or use Docker:
   ```bash
   docker run -d --name sonarqube -p 9000:9000 sonarqube:community
   ```

2. **Install SonarScanner** CLI:
   ```bash
   npm install -g sonarqube-scanner
   ```

3. **Generate coverage reports** (optional, for coverage metrics):
   ```bash
   npx c8 --reporter=lcov npm test
   cd client && npx vitest run --coverage && cd ..
   ```

4. **Run the scan**:
   ```bash
   sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.login=YOUR_TOKEN
   ```

5. **View results** at `http://localhost:9000/dashboard?id=notes-app`

## Scripts

### Backend (root)

| Script       | Command                        | Description                    |
|--------------|--------------------------------|--------------------------------|
| `npm run dev`| `nodemon src/server.js`        | Start with auto-reload         |
| `npm start`  | `node src/server.js`           | Start in production mode       |
| `npm test`   | `mocha src/tests/**/*.js`      | Run backend test suite         |

### Frontend (client/)

| Script              | Command          | Description                    |
|---------------------|------------------|--------------------------------|
| `npm run dev`       | `vite`           | Start dev server               |
| `npm run build`     | `vite build`     | Production build               |
| `npm run preview`   | `vite preview`   | Preview production build       |
| `npm test`          | `vitest run`     | Run frontend test suite        |
| `npm run lint`      | `oxlint`         | Run linter                     |

## Error Handling

All errors return a consistent JSON envelope:

```json
{ "success": false, "message": "...", "statusCode": 400 }
```

- **Operational errors** (bad input, auth failures) → logged at `warn` level
- **Unexpected errors** (bugs, DB failures) → logged at `error` level with full stack trace
- In production, internal error details are hidden from the client
- In development, the `stack` property is included in error responses

## Real-Time Updates

The app uses **Socket.IO** for real-time note synchronization:

- When a note is created, updated, or deleted via the REST API, the server emits an event to the user's private Socket.IO room
- All connected tabs/clients for that user receive the update and refresh the dashboard automatically
- Socket authentication uses the same JWT token as the REST API

## License

ISC
