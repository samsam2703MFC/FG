# Franchise Generation — Backend API

Express/Node.js REST API for the Franchise Generation platform. Runs entirely in-memory using seed data — drop in a PostgreSQL adapter when ready.

## Quick Start

```bash
cd backend
cp .env.example .env          # configure environment
npm install
npm run dev                    # hot-reload dev server (nodemon)
```

Server starts on `http://localhost:3001`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Production server |
| `npm run dev` | Development server with nodemon hot-reload |
| `npm run seed` | Print seed data summary |

## Demo Credentials

All demo users share the password **`password`**.

| Email | Role |
|-------|------|
| `claire.vermeulen@example.com` | investor |
| `marc.dubois@example.com` | investor |
| `admin@fg.be` | admin |
| `sophie.renard@fg.be` | consultant |
| `karim.boulahia@fg.be` | consultant |

### Login example

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"claire.vermeulen@example.com","password":"password"}'
```

Use the returned `token` as `Authorization: Bearer <token>` on protected routes.

## API Overview

| Prefix | Description |
|--------|-------------|
| `GET /health` | Health check |
| `GET /api` | Route index |
| `/api/auth` | Login, logout, profile |
| `/api/brands` | Brand catalog + presentation |
| `/api/opportunities` | Onboarding + financing opportunities |
| `/api/candidates` | Candidate management |
| `/api/investors` | Investor profiles + portfolios |
| `/api/leads` | Lead pipeline (consultant view) |
| `/api/support` | Support tickets + messages |
| `/api/documents` | Document library + upload |
| `/api/notifications` | Notification feed |
| `/api/regions` | Geographic regions |
| `/api/landing` | Public landing page content |
| `/api/consultants` | Consultant profiles + schedules |
| `/api/developers` | Real estate developer submissions |
| `/api/backoffice` | Admin dashboard KPIs |

## Response Format

All list endpoints return:

```json
{
  "data": [...],
  "meta": { "total": 10, "page": 1, "limit": 20, "pages": 1 }
}
```

Single resource endpoints return:

```json
{ "data": { ... } }
```

Errors return:

```json
{ "error": "Human-readable message", "code": "MACHINE_CODE" }
```

## Authentication

JWT Bearer token authentication. Roles: `investor`, `admin`, `consultant`.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `JWT_SECRET` | dev secret | **Change in production** |
| `NODE_ENV` | `development` | Environment |
| `CORS_ORIGIN` | localhost variants | Allowed CORS origins (comma-separated) |
| `UPLOAD_DIR` | `./uploads` | File upload directory |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |

## Architecture

```
backend/
├── server.js           # Express app entry point
├── data/
│   └── seed.js         # In-memory data store (replaces DB for mock)
├── middleware/
│   ├── auth.js         # JWT authenticate + authorize + generateToken
│   └── errorHandler.js # Global error handler + createError helper
└── routes/
    ├── auth.js         # POST /login, GET /me, PUT /me
    ├── brands.js       # Brand catalog + sub-resources
    ├── opportunities.js # Onboarding + financing opportunities
    ├── candidates.js   # Candidate CRUD + leads
    ├── investors.js    # Investor profiles + portfolio
    ├── leads.js        # Lead pipeline management
    ├── support.js      # Helpdesk tickets + messages
    ├── documents.js    # Document library + upload
    ├── notifications.js # Notification feed
    ├── regions.js      # Geographic regions
    ├── landing.js      # Public landing page content
    ├── consultants.js  # Consultant profiles
    ├── developers.js   # Real estate developer submissions
    └── backoffice.js   # Admin dashboard KPIs
```

## Replacing the In-Memory Store

All routes import from `data/seed.js`. To wire up PostgreSQL:

1. Install `pg` or `prisma`
2. Replace the array exports in `data/seed.js` with async DB query functions
3. Update route handlers to `await` those queries

The route logic stays the same — only the data layer changes.
