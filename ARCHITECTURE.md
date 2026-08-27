# Architecture

This document describes the folder structure, data flow, and key architectural decisions for the Notes App.

## Folder Structure

```
cohort-9-mern-7869-varoon/
├── .env                          # Backend environment variables
├── .env.example                  # Template for .env
├── schema.sql                    # MySQL table definitions
├── sonar-project.properties      # SonarQube analysis configuration
├── package.json                  # Backend dependencies & scripts
│
├── src/                          # ── Backend (Express / Node.js) ──
│   ├── app.js                    # Express app setup (middleware, routes)
│   ├── server.js                 # HTTP + Socket.IO server bootstrap
│   ├── config/
│   │   ├── env.config.js         # Centralised env config (frozen object)
│   │   └── db.config.js          # MySQL connection pool (mysql2)
│   ├── controllers/
│   │   ├── auth.controller.js    # Signup, login, logout handlers
│   │   └── notes.controller.js   # CRUD + search handlers + Socket.IO events
│   ├── services/
│   │   ├── auth.service.js       # Auth business logic (hashing, JWT)
│   │   └── notes.service.js      # Notes business logic (ownership checks)
│   ├── models/
│   │   ├── user.model.js         # User DB queries
│   │   └── note.model.js         # Note DB queries (CRUD, search)
│   ├── routes/
│   │   ├── auth.routes.js        # POST /api/auth/{signup,login,logout}
│   │   └── notes.routes.js       # CRUD + search routes with validation
│   ├── middlewares/
│   │   ├── auth.middleware.js     # JWT verification middleware
│   │   ├── validate.middleware.js # Joi request body validation
│   │   └── error.middleware.js    # Global error handler
│   ├── utils/
│   │   ├── logger.js             # Pino logger + child logger factory
│   │   ├── api-error.js          # Custom ApiError class with static factories
│   │   └── async-handler.js      # Async route wrapper (catches promise rejections)
│   └── tests/                    # Mocha + Chai + Sinon backend tests
│       ├── setup.js
│       ├── auth.service.test.js
│       ├── auth.controller.test.js
│       ├── notes.service.test.js
│       └── notes.controller.test.js
│
└── client/                       # ── Frontend (React 19 + Vite) ──
    ├── .env                      # VITE_API_BASE_URL
    ├── index.html                # SPA entry point
    ├── vite.config.js            # Vite + Vitest configuration
    ├── package.json              # Frontend dependencies & scripts
    └── src/
        ├── main.jsx              # React root render
        ├── App.jsx               # BrowserRouter + AuthProvider + AppRouter
        ├── App.css               # Global styles + design tokens
        ├── api/
        │   ├── axios.js          # Axios instance with JWT interceptor
        │   ├── auth.js           # Auth API functions (signup, login, logout)
        │   └── notes.js          # Notes API functions (CRUD, search, import)
        ├── context/
        │   ├── AuthContext.jsx   # Auth state, login/signup/logout actions
        │   └── SocketContext.jsx # Socket.IO connection + note event listener
        ├── components/
        │   └── ProtectedRoute.jsx # Auth guard (redirects to /login)
        ├── pages/
        │   ├── LoginPage.jsx     # Login form with validation
        │   ├── SignupPage.jsx    # Signup form with validation
        │   ├── DashboardPage.jsx # Note listing, search, delete, export/import
        │   └── NoteEditorPage.jsx # Rich text create/edit with react-quill-new
        ├── routes/
        │   └── AppRouter.jsx     # Route definitions
        └── tests/                # Vitest + React Testing Library tests
            ├── setup.js
            ├── LoginPage.test.jsx
            ├── SignupPage.test.jsx
            ├── ProtectedRoute.test.jsx
            ├── NoteEditorPage.test.jsx
            └── DashboardPage.test.jsx
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│                                                          │
│  Pages ──▶ API Layer (axios) ──▶ HTTP ──▶ Express API    │
│                                                          │
│  SocketContext ◀── WebSocket ◀── Socket.IO Server        │
└─────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
   localStorage                  MySQL Database
   (token, user)                 (users, notes)
```

### Request Lifecycle

1. **React component** calls an API function (e.g., `createNoteApi`)
2. **Axios interceptor** attaches `Authorization: Bearer <token>` header
3. **Express router** matches the route, runs middleware chain:
   - `authenticate` — verifies JWT, attaches `req.user`
   - `validate(schema)` — validates request body via Joi
4. **Controller** orchestrates the request, calls the service layer
5. **Service** enforces business rules (ownership checks), calls the model
6. **Model** executes raw SQL against the MySQL connection pool
7. **Response** flows back: model → service → controller → JSON response
8. **Socket.IO** (optional): after create/update/delete, the controller emits an event to the user's private room (`user:<id>`)

### Authentication Flow

1. **Signup/Login** → server returns JWT + user object
2. Client stores both in `localStorage` and `AuthContext`
3. Protected routes check `isAuthenticated` via `useAuth()`
4. Axios interceptor auto-attaches token to every API request
5. **Logout** → calls API, clears localStorage and context state

### Real-Time Updates (Socket.IO)

1. On dashboard mount, `SocketProvider` connects to the server with the JWT token
2. Server's Socket.IO handshake middleware verifies the token
3. Socket joins room `user:<id>` so events are scoped per user
4. When a note is created/updated/deleted via REST API, the controller emits to the user's room
5. The `SocketProvider` listens for these events and updates the note list in real time

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Vitest over Jest** | Already configured with Vite; API-compatible with Jest |
| **react-quill-new** | Maintained fork of react-quill for React 18/19 support |
| **Socket.IO per-user rooms** | Isolates events so users only see their own note changes |
| **Axios interceptor** | Centralised JWT attachment eliminates per-call boilerplate |
| **Joi validation** | Catches invalid data at the middleware layer before it reaches controllers |
| **Frozen config** | `Object.freeze()` prevents accidental mutation of env config |
| **ApiError class** | Typed operational errors vs unexpected errors for proper logging |
