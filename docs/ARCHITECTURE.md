# Franchise Generation — System Architecture

Technical overview of the Franchise Generation platform: how the components fit together, how data flows, and the design decisions that drive the structure.

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Component Map](#component-map)
3. [System Architecture Diagram](#system-architecture-diagram)
4. [Frontend](#frontend)
5. [API Layer](#api-layer)
6. [Database](#database)
7. [Authentication](#authentication)
8. [File Storage](#file-storage)
9. [CDN and Edge](#cdn-and-edge)
10. [Notification Pipeline](#notification-pipeline)
11. [Key Design Decisions](#key-design-decisions)
12. [Security Posture](#security-posture)
13. [Scaling Considerations](#scaling-considerations)

---

## Platform Overview

Franchise Generation is a multi-portal web platform that connects four distinct user groups within a franchise ecosystem:

| Portal | Users | Primary function |
|--------|-------|-----------------|
| **Investor** | Individual and institutional investors | Track investments, receive repayments, review brand performance, sign documents |
| **Candidate** | Future franchise operators | Browse opportunities, apply, track onboarding pipeline |
| **Consultant** | FG internal consultants | Manage candidate leads, coordinate with brands |
| **Brand** | Franchise brand owners | Manage network visibility, team, and presentation |
| **Developer** | Real estate developers | Submit commercial locations for brand consideration |
| **Admin / Backoffice** | FG staff | Full cross-portal management and compliance |

All six portals share a single API and database. Each portal sees a filtered view of the same underlying data, scoped by the authenticated user's role and relationships.

---

## Component Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                       FRANCHISE GENERATION                          │
├─────────────────┬──────────────────┬───────────────────────────────┤
│    FRONTEND     │    API LAYER     │    DATA & SERVICES             │
│  (Static HTML)  │  (Node/Express)  │                               │
├─────────────────┼──────────────────┼───────────────────────────────┤
│ Investor portal │ /api/v1/auth     │ PostgreSQL 15                  │
│ Candidate portal│ /api/v1/brands   │   (via Prisma ORM)             │
│ Consultant portal│/api/v1/investors│                               │
│ Brand portal    │ /api/v1/candidates│ Cloudflare R2                 │
│ Developer portal│ /api/v1/leads   │   (file/document storage)      │
│ Admin backoffice│ /api/v1/support  │                               │
│ Public landing  │ /api/v1/...     │ Email/SMS providers            │
│                 │                  │   (repayment notifications)    │
└─────────────────┴──────────────────┴───────────────────────────────┘
```

---

## System Architecture Diagram

```
                                                    ┌─────────────────┐
                         ┌─────────────────────┐   │  Cloudflare R2  │
User's browser ──HTTPS──▶│     Cloudflare CDN  │   │  (Document &    │
                         │  (Edge / WAF / TLS) │   │   file storage) │
                         └────────┬────────────┘   └────────▲────────┘
                                  │                          │ signed URLs
                    ┌─────────────┼──────────────────┐       │
                    │             │                   │       │
                    ▼             ▼                   ▼       │
           ┌──────────────┐ ┌──────────┐    ┌──────────────────────┐
           │  GitHub Pages│ │  Vercel  │    │  Railway / Render    │
           │  (Frontend)  │ │(Serverless│    │  (Express server)    │
           │              │ │  /api/*) │    │                      │
           │  Static HTML │ │          │    │  backend/server.js   │
           │  CSS / JS    │ │  Node.js │    │  routes/             │
           │  img/        │ │  funcs   │    │  middleware/         │
           └──────────────┘ └────┬─────┘    └──────────┬───────────┘
                                 │                      │
                                 └──────────┬───────────┘
                                            │
                                            │ Prisma ORM
                                            ▼
                                  ┌──────────────────┐
                                  │   PostgreSQL 15   │
                                  │                  │
                                  │  users           │
                                  │  brands          │
                                  │  investors       │
                                  │  investments     │
                                  │  candidates      │
                                  │  candidate_leads │
                                  │  shops           │
                                  │  shop_kpi        │
                                  │  support_tickets │
                                  │  documents       │
                                  │  notifications   │
                                  │  ...             │
                                  └──────────────────┘

                                     ┌──────────────┐
                                     │ Email / SMS  │
                                     │  providers   │
                                     │ (SMTP/SG/    │
                                     │  Twilio)     │
                                     └──────────────┘
                                            ▲
                                            │
                                    Scheduled jobs
                                    (repayments, KPI
                                     reports, expiry
                                     notifications)
```

---

## Frontend

**Technology:** Static HTML5, CSS3 (custom design system in `fg.css`), vanilla JavaScript with JSX-style component patterns.

**Hosting:** GitHub Pages — serves files directly from the repository root (or a subfolder). No build step required. Files are:
- `index.html` — public landing page
- `login.html` — portal selector and login
- `investor.html` — investor portal shell
- `candidate.html` — candidate portal shell
- `consultant.html` — consultant portal
- `backoffice.html` — admin portal
- `fg.css` — unified design system
- `project/fg-data.js` — mock API layer (replaced by real API calls in production)

**Brand-agnostic rendering:** The UI reads CSS custom properties (variables) injected by the API's `tokens` field on the brand object. Switching brands changes the visual theme without any code changes.

**API communication:**
- Development: `fg-data.js` mock layer exposes `window.FG_DATA` with static data.
- Production: Fetch calls to `/api/v1/*` endpoints. The mock layer is removed.

**No framework dependency:** The frontend uses no React, Vue, or Angular. Components are rendered using template literals and DOM manipulation. This keeps bundle size zero and avoids build toolchain complexity.

---

## API Layer

**Technology:** Node.js 18+ with Express.js

**Structure:**
```
backend/
  server.js           — Express app entry point
  middleware/
    auth.js           — JWT verification middleware
    errorHandler.js   — Centralized error formatting
    rateLimiter.js    — express-rate-limit configuration
  routes/
    auth.js           — /api/v1/auth/*
    brands.js         — /api/v1/brands/*
    investors.js      — /api/v1/investors/*
    candidates.js     — /api/v1/candidates/*
    leads.js          — /api/v1/leads/*
    consultants.js    — /api/v1/consultants/*
    developers.js     — /api/v1/developers/*
    opportunities.js  — /api/v1/opportunities/*
    support.js        — /api/v1/support/*
    documents.js      — /api/v1/documents/*
    notifications.js  — /api/v1/notifications/*
    regions.js        — /api/v1/regions
    landing.js        — /api/v1/landing
    backoffice.js     — /api/v1/backoffice/*
  data/
    seed.js           — Database seed script
```

**Key middleware chain (in order):**
1. `helmet()` — security headers
2. `cors()` — CORS enforcement
3. `morgan()` — request logging
4. `express.json()` — request body parsing
5. `rateLimiter` — IP-based rate limiting
6. Route handlers
7. `errorHandler` — catches all unhandled errors, formats as `ErrorResponse`

**Error handling contract:**
All errors are caught by the centralized handler and returned in the format:
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "details": [{ "field": "...", "message": "..." }]
}
```
In production (`NODE_ENV=production`), stack traces are never included in responses.

**Input validation:**
All request bodies and query parameters are validated using `express-validator`. Validation errors return `400 Bad Request` with field-level detail.

**Swagger UI:**
The Express server serves the OpenAPI spec and Swagger UI at `/api-docs` via `swagger-ui-express` + `yamljs`. The spec file is `docs/openapi.yaml`.

---

## Database

**Technology:** PostgreSQL 15 with Prisma ORM

**Schema design principles:**
- Every brand-scoped entity (shop, opportunity, investment, document, team member) carries a `brand_id` foreign key — enabling efficient brand-isolation queries.
- Soft links via `owner_id` + `owner_type` are used for the documents vault (polymorphic association to both investors and candidates).
- The landing page content is stored as `JSONB` in the `landings` table — allowing CMS-style updates without schema migrations.
- All monetary values are stored as `DECIMAL(12,2)` (EUR, no sub-cent precision).
- All timestamps are stored as `TIMESTAMPTZ` (UTC). Display formatting is done on the client.

**Prisma ORM:**
- Type-safe query builder with auto-generated TypeScript types.
- `prisma migrate dev` for development migrations.
- `prisma migrate deploy` for production deployments (applied before server start in CI/CD).
- `prisma studio` for visual database inspection.

**Connection pooling:**
- Full Express server (Railway/Render): Prisma manages a connection pool internally. Default pool size: `min=2, max=10`. Tune via `DATABASE_URL` parameters.
- Serverless (Vercel): Use Prisma Accelerate or PgBouncer with `?pgbouncer=true&connection_limit=1` appended to `DATABASE_URL`.

---

## Authentication

**Technology:** JWT (JSON Web Tokens) via `jsonwebtoken`

**Flow:**
```
Client                         Server
  │                              │
  │  POST /api/v1/auth/login     │
  │  { email, password }         │
  │─────────────────────────────▶│
  │                              │  1. Look up user by email
  │                              │  2. bcrypt.compare(password, hash)
  │                              │  3. Sign JWT with user id + role
  │  200 { token, expiresIn }    │
  │◀─────────────────────────────│
  │                              │
  │  GET /api/v1/me              │
  │  Authorization: Bearer <tok> │
  │─────────────────────────────▶│
  │                              │  4. Verify JWT signature
  │                              │  5. Load user from DB
  │  200 { user profile }        │
  │◀─────────────────────────────│
```

**Token structure (JWT payload):**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "role": "investor",
  "name": "Claire Vermeulen",
  "iat": 1716000000,
  "exp": 1716086400
}
```

**Security:**
- Passwords hashed with bcrypt (cost factor 12).
- JWT signed with `HS256` using a 64-character random secret stored in env vars.
- Token expiry: 24 hours (configurable via `JWT_EXPIRES_IN`).
- Logout: token is added to an in-memory (Redis-backed in production) blocklist until expiry.
- All protected routes verify the token before any database access.

**Role-based access control:**
The `auth` middleware exposes `req.user` after verification. Route handlers check `req.user.role` against an allow list:

```javascript
// Example: restrict to admin and consultant
if (!['admin', 'consultant'].includes(req.user.role)) {
  return res.status(403).json({ error: 'FORBIDDEN', message: '...' });
}
```

**Self-access guard:**
Investors and candidates can only access their own records. The middleware validates `req.params.id` against the profile ID derived from `req.user.sub`:

```javascript
// Investor accessing their own profile
if (req.user.role === 'investor' && req.params.id !== investorId) {
  return res.status(403).json({ error: 'FORBIDDEN' });
}
```

---

## File Storage

**Technology:** Cloudflare R2 (S3-compatible object storage)

**Rationale:** R2 has no egress fees, is S3-compatible (same SDK), integrates with Cloudflare CDN, and supports signed URLs with configurable expiry.

**Storage structure:**
```
fg-documents/
  investors/
    {investor_id}/
      kyc/
        {document_id}-{filename}
      contracts/
        {document_id}-{filename}
      schedules/
        ...
  candidates/
    {candidate_id}/
      cv/
      motivation/
  brands/
    {brand_id}/
      presentation/
      decks/
```

**Access pattern:**
1. Client requests a document via `GET /api/v1/documents/{id}`.
2. The API validates the user owns or is permitted to access this document.
3. The API generates a **signed URL** (expiry: 15 minutes) using the R2/S3 SDK.
4. The signed URL is returned in the response.
5. The client downloads directly from the CDN using the signed URL.
6. The API server never streams the file content — all file traffic goes directly to R2.

**Upload flow:**
1. Client `POST /api/v1/documents` with `multipart/form-data`.
2. API uses `multer` to receive the file in memory (max 10 MB).
3. API uploads to R2 using `@aws-sdk/client-s3`.
4. API stores metadata (filename, url, size, type, status) in the `documents` table.
5. A `201` response with the document metadata (including the signed URL) is returned.

**Alternative:** AWS S3 is a drop-in replacement. Change `STORAGE_PROVIDER=s3` and provide `AWS_*` env vars. The SDK and signed URL logic are identical.

---

## CDN and Edge

**Technology:** Cloudflare (free to Business tier)

**Roles Cloudflare plays in this architecture:**

| Feature | Purpose |
|---------|---------|
| DNS proxy | Routes traffic; hides origin server IPs |
| TLS termination | Provides HTTPS for all domains, auto-renews certs |
| CDN | Caches static frontend assets at edge PoPs globally |
| WAF | Blocks common attacks (SQLi, XSS, bad bots) at the edge |
| Rate limiting | L7 rate limiting as a second layer beyond Express |
| R2 CDN | Serves document downloads from the nearest PoP |
| Cache rules | Frontend HTML (short TTL), CSS/JS/images (long TTL with content hash) |
| Page rules | Force HTTPS, redirect www → apex or vice versa |

**Cache strategy:**

| Asset type | Cache TTL | Cloudflare cache rule |
|------------|-----------|----------------------|
| `*.html` | 60 seconds | Cache, short TTL (dynamic content) |
| `*.css`, `*.js` | 1 year | Cache with `Cache-Control: immutable` |
| `img/*` | 30 days | Cache, purge on deploy |
| API responses | No cache | `Cache-Control: no-store` set by Express |
| Document downloads | No cache | Signed URLs expire in 15 min |

---

## Notification Pipeline

Notifications are generated by three mechanisms:

**1. Event-driven (real-time):**
- User expresses interest → notification to the assigned consultant.
- New support message → notification to the counterparty.
- Document status changes (signed, expired) → notification to document owner.
These are written to the `notifications` table synchronously within the API request.

**2. Scheduled jobs (cron):**
- Monthly payment processing → generates `payment` notifications for each investor with a due installment.
- Monthly KPI report availability → generates `report` notifications.
- Document expiry warnings → checks `documents.expires_at` and generates `doc` notifications 30 days and 7 days before expiry.

Scheduled jobs run via:
- **Railway:** Railway Cron Jobs (configured in the dashboard).
- **Render:** Render Cron Jobs.
- **Vercel:** Vercel Cron (configured in `vercel.json`).

**3. Push delivery:**
- After writing to `notifications` table, the job calls the email/SMS provider.
- Delivery is conditional on the user's `investor_preferences` (channel + event_type + enabled).
- Email: SMTP / SendGrid / Resend.
- SMS: Twilio (critical alerts only, e.g. document signature required).

---

## Key Design Decisions

**1. Brand-agnostic UI:**
The frontend has zero brand-specific code. All brand identity — colors, fonts, copy, KPI labels, logo — is served by the API as part of the brand object. Adding a new brand requires only a new database row plus assets; no code deployment.

**2. Denormalized `brand_id` on `candidate_leads`:**
The `candidate_leads` table carries a `brand_id` column even though it's derivable via `opportunity → brand_id`. This is intentional — it allows single-table queries for the consultant dashboard (filter leads by brand) without a join, at the cost of one extra foreign key constraint.

**3. JSONB for landing page content:**
The `landings` table stores the entire page content tree as a `JSONB` document rather than normalizing it across multiple tables. The landing page has deeply nested, irregularly structured content (tiles, pillars, CTAs, badges) that changes in shape as the platform evolves. JSONB avoids constant schema migrations for CMS updates while retaining query ability via GIN index.

**4. Signed URLs for documents (no proxying):**
The API never proxies file downloads. It generates short-lived signed URLs and returns them to the client, which downloads directly from the CDN. This keeps API latency predictable and avoids streaming large files through the application tier.

**5. No real-time WebSocket layer:**
The current architecture uses polling (on page load / refresh) for notifications and ticket updates. Adding WebSocket support (via Socket.io or Ably) is a future consideration once user concurrency justifies the cost.

**6. Static frontend with no framework:**
The decision to use vanilla HTML/JS (rather than React, Next.js, or Vue) keeps the developer onboarding cost low, eliminates build toolchain complexity, and makes GitHub Pages hosting trivial. The tradeoff is more verbose DOM manipulation code and no component hot-reloading in development.

---

## Security Posture

| Control | Implementation |
|---------|---------------|
| Transport security | TLS 1.2+ enforced at Cloudflare edge; HTTP → HTTPS redirect |
| Authentication | JWT HS256, bcrypt password hashing (cost 12), token blocklist on logout |
| Authorization | Role-based + self-access guards on every protected route |
| Input validation | express-validator on all request bodies and query params |
| Output encoding | Helmet.js sets `X-Content-Type-Options: nosniff`, prevents MIME sniffing |
| CORS | Allowlist-only; origins configurable via `CORS_ORIGIN` env var |
| Rate limiting | 100 req / 15 min per IP at Express layer; additional L7 limiting at Cloudflare |
| SQL injection | Eliminated by Prisma ORM parameterized queries; no raw SQL |
| File upload | Multer size limit (10 MB), MIME type validation before R2 upload |
| Error messages | Stack traces suppressed in production; only error code + message returned |
| Secrets management | All secrets in env vars; `.env` never committed; use Vercel/Railway secrets store |
| KYC/AML documents | Stored in private R2 bucket; accessible only via time-limited signed URLs |
| Audit trail | `lead_history` for pipeline changes; `audit_log` table recommended for financial records |

---

## Scaling Considerations

**Current scale:** Small network (4 brands, ~180 investors, ~50 candidates). The architecture is intentionally simple.

**Growth path:**

| Milestone | Recommended change |
|-----------|-------------------|
| 500+ concurrent users | Add Redis for JWT blocklist and session caching |
| 1,000+ investors | Add read replica for heavy analytics queries (backoffice, reports) |
| 10,000+ documents | Move document metadata queries to a dedicated search index (e.g. Meilisearch or Typesense) |
| Real-time notifications | Add WebSocket layer (Socket.io or Ably) for live notification badges |
| Multi-country | Add `country` column to brands/shops; add i18n table for translated labels |
| High-frequency KPI ingestion | Replace manual `shop_kpi` inserts with a streaming pipeline (Kafka + TimescaleDB) |

**Stateless API design:**
All state lives in PostgreSQL. The Express server is completely stateless — any number of server instances can run in parallel behind a load balancer. Railway and Render support horizontal scaling via replica configuration.

**Database bottleneck:**
PostgreSQL is the only stateful service. The recommended scaling path is:
1. Add indexes (see `DATABASE.md` index recommendations).
2. Add a read replica for reporting queries.
3. Introduce PgBouncer connection pooling.
4. Only consider sharding if the single-node write throughput is saturated (unlikely for this use case).
