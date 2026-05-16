# Franchise Generation — Deployment Guide

Complete guide for deploying the Franchise Generation platform in local development and across cloud environments.

---

## Table of Contents

1. [Architecture Summary](#architecture-summary)
2. [Local Development Setup](#local-development-setup)
3. [Environment Variables Reference](#environment-variables-reference)
4. [Database Setup (PostgreSQL + Prisma)](#database-setup-postgresql--prisma)
5. [GitHub Pages Deployment (Frontend)](#github-pages-deployment-frontend)
6. [Vercel Deployment (Serverless API)](#vercel-deployment-serverless-api)
7. [Railway / Render Deployment (Full Server)](#railway--render-deployment-full-server)
8. [SSL / HTTPS Notes](#ssl--https-notes)
9. [Post-Deploy Checklist](#post-deploy-checklist)

---

## Architecture Summary

| Layer | Technology | Deployment target |
|-------|-----------|-------------------|
| Frontend | Static HTML + vanilla JS/JSX | GitHub Pages |
| API (serverless) | Node.js serverless functions | Vercel (`/api/`) |
| API (full server) | Express.js | Railway or Render (`/backend/`) |
| Database | PostgreSQL 15 | Railway, Render, or Supabase |
| File storage | Cloudflare R2 or AWS S3 | CDN-backed |
| CDN / Edge | Cloudflare | Proxied domain |

---

## Local Development Setup

### Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Node.js | 18.x LTS | Use `nvm` to manage versions |
| npm | 9.x | Bundled with Node.js |
| PostgreSQL | 15.x | Local install or Docker |
| Git | 2.x | |

### 1. Clone the repository

```bash
git clone https://github.com/your-org/franchise-generation.git
cd franchise-generation
```

### 2. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend** (no build step — static files served directly):
```bash
# No npm install needed for frontend
# Open index.html directly or use a local server
npx serve .
# or
python3 -m http.server 8080
```

### 3. Set up environment variables

```bash
cd backend
cp .env.example .env
# Edit .env with your local values (see Environment Variables section below)
```

### 4. Start PostgreSQL

**Option A — Local install:**
```bash
# macOS (Homebrew)
brew services start postgresql@15

# Ubuntu/Debian
sudo systemctl start postgresql

# Create the database
psql -U postgres -c "CREATE DATABASE franchise_generation;"
psql -U postgres -c "CREATE USER fg_user WITH PASSWORD 'localdevpassword';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE franchise_generation TO fg_user;"
```

**Option B — Docker Compose:**
```yaml
# docker-compose.yml (place in project root)
version: '3.9'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: franchise_generation
      POSTGRES_USER: fg_user
      POSTGRES_PASSWORD: localdevpassword
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  pg_data:
```

```bash
docker compose up -d
```

### 5. Run Prisma migrations and seed data

```bash
cd backend
npx prisma migrate dev
node data/seed.js
```

### 6. Start the backend server

```bash
cd backend
npm run dev
# Server starts at http://localhost:3000
# API available at http://localhost:3000/api/v1
# Swagger UI at http://localhost:3000/api-docs
```

### 7. Open the frontend

```bash
# From the project root
npx serve . -l 8080
# Open http://localhost:8080
```

The frontend HTML files use relative paths and will call the API at the `VITE_API_BASE` or hardcoded `http://localhost:3000/api/v1` in development.

---

## Environment Variables Reference

Create a `.env` file in `/backend/` based on the following template.

```env
# ──────────────────────────────────────────────────────────────────────────
# APPLICATION
# ──────────────────────────────────────────────────────────────────────────
NODE_ENV=development
# Options: development | production | test
# Controls logging verbosity, error detail, and CORS policy

PORT=3000
# Port the Express server listens on

API_BASE_PATH=/api/v1
# API route prefix

# ──────────────────────────────────────────────────────────────────────────
# DATABASE
# ──────────────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://fg_user:localdevpassword@localhost:5432/franchise_generation
# Full Prisma connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# ──────────────────────────────────────────────────────────────────────────
# AUTHENTICATION
# ──────────────────────────────────────────────────────────────────────────
JWT_SECRET=CHANGE_ME_TO_A_64_CHAR_RANDOM_STRING_IN_PRODUCTION
# Used to sign and verify JWT tokens.
# Generate a secure value: openssl rand -base64 48

JWT_EXPIRES_IN=24h
# Token lifetime. Use short values in production (e.g. 1h or 2h).
# Refresh token flow recommended for longer sessions.

# ──────────────────────────────────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:8080
# Comma-separated list of allowed origins
# In production: https://franchisegeneration.be,https://www.franchisegeneration.be

# ──────────────────────────────────────────────────────────────────────────
# FILE STORAGE (Cloudflare R2 or AWS S3-compatible)
# ──────────────────────────────────────────────────────────────────────────
STORAGE_PROVIDER=r2
# Options: r2 | s3 | local
# Use "local" for development (files saved to /tmp/fg-uploads)

R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=fg-documents
R2_PUBLIC_URL=https://documents.franchisegeneration.be
# Public CDN URL for the R2 bucket (custom domain via Cloudflare)

# AWS S3 (alternative to R2)
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_REGION=eu-west-1
# S3_BUCKET_NAME=fg-documents

# ──────────────────────────────────────────────────────────────────────────
# EMAIL
# ──────────────────────────────────────────────────────────────────────────
EMAIL_PROVIDER=smtp
# Options: smtp | sendgrid | resend

SMTP_HOST=smtp.mailhog.local
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@franchisegeneration.be

# SendGrid (alternative)
# SENDGRID_API_KEY=SG.xxx

# Resend (alternative)
# RESEND_API_KEY=re_xxx

# ──────────────────────────────────────────────────────────────────────────
# SMS (optional — for critical alerts)
# ──────────────────────────────────────────────────────────────────────────
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_FROM_NUMBER=+32...

# ──────────────────────────────────────────────────────────────────────────
# LOGGING
# ──────────────────────────────────────────────────────────────────────────
LOG_LEVEL=debug
# Options: debug | info | warn | error
# Use "info" or "warn" in production

# ──────────────────────────────────────────────────────────────────────────
# SECURITY
# ──────────────────────────────────────────────────────────────────────────
BCRYPT_ROUNDS=12
# bcrypt cost factor. 12 is production-appropriate.

RATE_LIMIT_WINDOW_MS=900000
# Rate limit window in ms (default: 15 minutes)

RATE_LIMIT_MAX=100
# Maximum requests per window per IP
```

**Never commit `.env` to version control.** Add it to `.gitignore`.

---

## Database Setup (PostgreSQL + Prisma)

### Initial setup

```bash
cd backend

# Apply all pending migrations (creates tables)
npx prisma migrate deploy

# Generate the Prisma client
npx prisma generate

# Seed with sample/reference data
node data/seed.js

# Explore the database (opens Prisma Studio in the browser)
npx prisma studio
```

### Migration workflow (development)

```bash
# 1. Edit schema.prisma

# 2. Create and apply a new migration
npx prisma migrate dev --name add_new_column

# 3. Prisma will:
#    - Generate a SQL migration file in prisma/migrations/
#    - Apply it to your local database
#    - Regenerate the Prisma client
```

### Migration workflow (production)

In CI/CD, run migrations before starting the server:

```bash
# Deployment step (CI/CD pipeline)
cd backend
npx prisma migrate deploy
node server.js
```

`prisma migrate deploy` is safe for production — it never auto-creates migrations, only applies existing ones.

### Resetting the database (development only)

```bash
# WARNING: This drops and recreates all tables and re-seeds
npx prisma migrate reset
```

---

## GitHub Pages Deployment (Frontend)

The frontend is a set of static HTML, CSS, and JavaScript files. No build step is required.

### Setup

1. In your GitHub repository, go to **Settings → Pages**.
2. Set source to **Deploy from a branch**.
3. Select branch `main` (or `gh-pages`) and folder `/` (root) or `/docs` if you prefer.
4. Click **Save**.

GitHub will serve the static files at `https://your-org.github.io/franchise-generation/`.

### Custom domain

1. Add a `CNAME` file to the repository root:
   ```
   www.franchisegeneration.be
   ```
2. In your DNS provider (recommended: Cloudflare), add:
   ```
   CNAME  www   your-org.github.io
   ```
3. Enable **Enforce HTTPS** in GitHub Pages settings.

### GitHub Actions automated deploy

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]
    paths-ignore:
      - 'backend/**'
      - 'docs/**'

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'   # Upload from repo root; adjust to subfolder if needed

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### API URL for production frontend

In your JavaScript files, set the API base URL based on the environment:

```javascript
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api/v1'
  : 'https://api.franchisegeneration.be/api/v1';
```

---

## Vercel Deployment (Serverless API)

Use this option to deploy the API as serverless functions inside a `/api/` directory at the project root (not to be confused with the Express app in `/backend/`).

### Prerequisites

- Vercel CLI: `npm install -g vercel`
- Vercel account (free tier sufficient for development)

### Project structure for Vercel

```
/api/
  auth/
    login.js         → POST /api/auth/login
    logout.js        → POST /api/auth/logout
  brands/
    index.js         → GET /api/brands
    [id].js          → GET /api/brands/:id
    [id]/
      presentation.js → GET /api/brands/:id/presentation
      shops.js        → GET /api/brands/:id/shops
  opportunities/
    index.js         → GET /api/opportunities
    [id].js          → GET /api/opportunities/:id
  ...
```

### Configuration

Create `vercel.json` in the project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@fg-database-url",
    "JWT_SECRET": "@fg-jwt-secret",
    "NODE_ENV": "production"
  }
}
```

### Set environment variables in Vercel

```bash
# Via CLI
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add CORS_ORIGIN production

# Or via Vercel dashboard → Project → Settings → Environment Variables
```

### Deploy

```bash
# First-time setup
vercel

# Production deploy
vercel --prod

# Preview deploy (creates a unique URL per push)
# Happens automatically on GitHub integration
```

### Database connection (Vercel + PostgreSQL)

Vercel serverless functions are stateless and short-lived. Use connection pooling:

1. **Recommended:** Use Prisma Data Proxy or [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate) for connection pooling in serverless environments.
2. **Alternative:** Use [PgBouncer](https://www.pgbouncer.org/) in front of your PostgreSQL instance.
3. Append `?pgbouncer=true&connection_limit=1` to your `DATABASE_URL` when using PgBouncer.

```env
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true&connection_limit=1"
```

---

## Railway / Render Deployment (Full Server)

Use this option to deploy the full Express server from `/backend/`. This is the recommended production approach for sustained workloads, as it maintains persistent connections and supports long-running tasks (batch payment jobs, etc.).

### Option A — Railway

Railway provides managed PostgreSQL and can deploy directly from a GitHub repository.

#### 1. Create a new Railway project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize in the backend directory
cd backend
railway init
```

#### 2. Add a PostgreSQL service

In the Railway dashboard:
1. Click **+ New** → **Database** → **PostgreSQL**.
2. Railway automatically sets `DATABASE_URL` in the environment.

Or via CLI:
```bash
railway add --plugin postgresql
```

#### 3. Configure environment variables

```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_64_char_secret
railway variables set CORS_ORIGIN=https://www.franchisegeneration.be
railway variables set PORT=3000
# Add remaining variables from the reference above
```

#### 4. Deploy

```bash
# Deploy from backend directory
railway up

# Or link to GitHub for automated deploys on push
railway link
```

#### 5. Run migrations on deploy

Add a start command in `backend/package.json`:
```json
{
  "scripts": {
    "start": "npx prisma migrate deploy && node server.js",
    "dev": "nodemon server.js"
  }
}
```

Railway runs `npm start` by default.

#### 6. Custom domain

In Railway dashboard → **Settings** → **Domains** → **Add Custom Domain**.
Point your DNS CNAME to the Railway-provided subdomain.

---

### Option B — Render

#### 1. Create a new Web Service

1. Go to [render.com](https://render.com) and click **New → Web Service**.
2. Connect your GitHub repository.
3. Set:
   - **Root directory:** `backend`
   - **Build command:** `npm install && npx prisma generate`
   - **Start command:** `npx prisma migrate deploy && node server.js`
   - **Environment:** `Node`

#### 2. Add a PostgreSQL database

1. Click **New → PostgreSQL**.
2. Note the **Internal Database URL** — use it as `DATABASE_URL` in the web service environment.

#### 3. Set environment variables

In the Render dashboard → Web Service → **Environment**:

```
NODE_ENV=production
JWT_SECRET=your_64_char_secret
CORS_ORIGIN=https://www.franchisegeneration.be
DATABASE_URL=<from Render PostgreSQL internal URL>
PORT=10000   # Render assigns PORT automatically; this is the default
```

#### 4. Automatic deploys

Render automatically redeploys when you push to the connected branch (typically `main`).

#### 5. Health check

Configure Render to check the health endpoint:
- **Health check path:** `/api/v1/health` (add this endpoint to your Express app)

```javascript
// backend/routes/health.js
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

---

## SSL / HTTPS Notes

**GitHub Pages:** HTTPS is enforced automatically for `github.io` subdomains. For custom domains, enable **Enforce HTTPS** in the repository settings after the custom domain is verified.

**Vercel:** All deployments (including preview URLs) use HTTPS automatically. No configuration required.

**Railway:** HTTPS is provided automatically for all Railway-generated domains (`*.up.railway.app`). For custom domains, Railway provisions Let's Encrypt certificates automatically after you add the CNAME record.

**Render:** HTTPS is provided automatically for all Render-generated domains (`*.onrender.com`). For custom domains, Render provisions Let's Encrypt certificates automatically.

**Cloudflare (recommended):**
For all deployment targets, it is strongly recommended to proxy the domain through Cloudflare:

1. Add your domain to Cloudflare.
2. Set DNS records pointing to the deployment target.
3. Enable **Proxy** (orange cloud) on the CNAME/A record.
4. In Cloudflare SSL/TLS settings, set mode to **Full (strict)**.
5. Enable **Always Use HTTPS** and **HSTS**.

Benefits: DDoS protection, global CDN for static assets, free TLS, and the ability to purge the CDN cache on deploy.

**Express security headers:**
The backend uses [Helmet.js](https://helmetjs.github.io/) which sets secure HTTP headers automatically:

```javascript
// backend/server.js (already configured via package.json dependency)
const helmet = require('helmet');
app.use(helmet());
```

Ensure these response headers are present in production:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy` (configure CSP carefully for each portal)

---

## Post-Deploy Checklist

Run through this checklist after every production deployment:

- [ ] `GET /api/v1/health` returns `200 OK`
- [ ] `POST /api/v1/auth/login` returns a valid JWT with correct user data
- [ ] `GET /api/v1/brands` returns all four brands
- [ ] `GET /api/v1/regions` returns all five regions
- [ ] `GET /api/v1/landing` returns landing page content
- [ ] A protected endpoint (e.g. `GET /api/v1/me`) returns `401` without a token
- [ ] The same protected endpoint returns `200` with a valid token
- [ ] File upload endpoint reachable and returns a signed URL
- [ ] Prisma migrations applied: `npx prisma migrate status` shows all applied
- [ ] Environment variables verified — no `.env.example` defaults leaking
- [ ] HTTPS enforced — no mixed-content warnings in the browser console
- [ ] CORS: API requests from the frontend domain succeed, requests from unknown origins return `403`
- [ ] Rate limiting active: more than 100 requests in 15 minutes from the same IP returns `429`
- [ ] Error responses do not include stack traces or internal file paths
