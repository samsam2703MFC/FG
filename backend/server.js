'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');
const fs      = require('fs');

// ---- Swagger (optional — gracefully skipped if yaml file absent) ----
let swaggerUi, swaggerDocument;
try {
  swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  const swaggerPath = path.join(__dirname, 'swagger.yaml');
  if (fs.existsSync(swaggerPath)) {
    swaggerDocument = YAML.load(swaggerPath);
  }
} catch (_) {
  // swagger-ui-express or yamljs not installed — /api-docs will be unavailable
}

// ---- Routes ----
const authRouter          = require('./routes/auth');
const brandsRouter        = require('./routes/brands');
const opportunitiesRouter = require('./routes/opportunities');
const candidatesRouter    = require('./routes/candidates');
const investorsRouter     = require('./routes/investors');
const leadsRouter         = require('./routes/leads');
const supportRouter       = require('./routes/support');
const documentsRouter     = require('./routes/documents');
const notificationsRouter = require('./routes/notifications');
const regionsRouter       = require('./routes/regions');
const landingRouter       = require('./routes/landing');
const consultantsRouter   = require('./routes/consultants');
const developersRouter    = require('./routes/developers');
const backofficeRouter    = require('./routes/backoffice');
const shopsRouter         = require('./routes/shops');
const onboardingRouter    = require('./routes/onboarding');

// ---- Error handlers ----
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// ============================================================================
// App setup
// ============================================================================
const app  = express();
const PORT = process.env.PORT || 3001;

// ---- Security headers ----
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

// ---- CORS ----
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (corsOrigins.includes(origin) || corsOrigins.includes('*')) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ---- Request logging ----
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// ---- Body parsers ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- Static uploads ----
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOAD_DIR));

// ---- Health check ----
app.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    service: 'franchise-generation-api',
    env:     process.env.NODE_ENV || 'development',
    uptime:  Math.round(process.uptime()),
    ts:      new Date().toISOString()
  });
});

// ---- Swagger UI ----
if (swaggerUi && swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Franchise Generation API',
    swaggerOptions:  { persistAuthorization: true }
  }));
}

// ---- API index ----
app.get('/api', (req, res) => {
  res.json({
    name:    'Franchise Generation API',
    version: '1.0.0',
    docs:    '/api-docs',
    health:  '/health',
    routes: [
      'POST   /api/auth/login',
      'GET    /api/auth/me',
      'PUT    /api/auth/me',
      'GET    /api/brands',
      'POST   /api/brands',
      'GET    /api/brands/share-classes',
      'GET    /api/brands/:id',
      'PUT    /api/brands/:id',
      'DELETE /api/brands/:id',
      'GET    /api/brands/:id/full',
      'GET    /api/brands/:id/presentation',
      'GET    /api/brands/:id/shops',
      'GET    /api/brands/:id/opportunities',
      'GET    /api/brands/:id/team',
      'GET    /api/brands/:id/documents',
      'GET    /api/opportunities',
      'GET    /api/opportunities/:id',
      'POST   /api/opportunities/:id/interest',
      'GET    /api/opportunities/:id/candidates',
      'GET    /api/candidates',
      'POST   /api/candidates',
      'GET    /api/candidates/:id',
      'PUT    /api/candidates/:id',
      'GET    /api/candidates/:id/leads',
      'GET    /api/investors',
      'GET    /api/investors/:id',
      'PUT    /api/investors/:id',
      'GET    /api/investors/:id/portfolio',
      'GET    /api/investors/:id/documents',
      'GET    /api/investors/:id/repayments',
      'POST   /api/investors/:id/interest',
      'GET    /api/investors/:id/opportunities',
      'GET    /api/investors/:id/contracts',
      'GET    /api/investors/:id/communications',
      'POST   /api/investors/:id/notes',
      'GET    /api/leads',
      'GET    /api/leads/steps',
      'GET    /api/leads/:id',
      'PUT    /api/leads/:id',
      'DELETE /api/leads/:id',
      'GET    /api/support/tickets',
      'POST   /api/support/tickets',
      'GET    /api/support/tickets/:id',
      'PUT    /api/support/tickets/:id',
      'GET    /api/support/tickets/:id/messages',
      'POST   /api/support/tickets/:id/messages',
      'GET    /api/support/categories',
      'GET    /api/support/priorities',
      'GET    /api/documents',
      'POST   /api/documents',
      'GET    /api/documents/:id',
      'PUT    /api/documents/:id',
      'DELETE /api/documents/:id',
      'GET    /api/documents/types',
      'GET    /api/notifications',
      'PUT    /api/notifications/read-all',
      'PUT    /api/notifications/:id/read',
      'DELETE /api/notifications/:id',
      'GET    /api/regions',
      'GET    /api/regions/:id',
      'GET    /api/landing',
      'GET    /api/landing/opportunities',
      'GET    /api/consultants',
      'GET    /api/consultants/:id',
      'GET    /api/consultants/:id/leads',
      'GET    /api/consultants/:id/schedule',
      'GET    /api/developers',
      'POST   /api/developers',
      'GET    /api/developers/:id',
      'PUT    /api/developers/:id',
      'GET    /api/auth/me/preferences',
      'PUT    /api/auth/me/preferences',
      'GET    /api/shops',
      'GET    /api/shops/:id',
      'GET    /api/shops/:id/reports',
      'GET    /api/shops/:id/kpi',
      'GET    /api/opportunities/validation-statuses',
      'GET    /api/opportunities/:id/interests',
      'GET    /api/leads/concept-types',
      'GET    /api/leads/new-brand',
      'POST   /api/leads/new-brand',
      'GET    /api/backoffice/dashboard',
      'GET    /api/backoffice/stats',
      'GET    /api/backoffice/benchmarks',
      'GET    /api/backoffice/repayments'
    ]
  });
});

// ============================================================================
// Route mounts
// ============================================================================
app.use('/api/auth',          authRouter);
app.use('/api/brands',        brandsRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/candidates',    candidatesRouter);
app.use('/api/investors',     investorsRouter);
app.use('/api/leads',         leadsRouter);
app.use('/api/support',       supportRouter);
app.use('/api/documents',     documentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/regions',       regionsRouter);
app.use('/api/landing',       landingRouter);
app.use('/api/consultants',   consultantsRouter);
app.use('/api/developers',    developersRouter);
app.use('/api/backoffice',    backofficeRouter);
app.use('/api/shops',        shopsRouter);
app.use('/api/onboarding',   onboardingRouter);

// ============================================================================
// 404 + error handler (must be last)
// ============================================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================================
// Start server
// ============================================================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('\nFranchise Generation API');
    console.log('========================');
    console.log(`Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server      : http://localhost:${PORT}`);
    console.log(`API info    : http://localhost:${PORT}/api`);
    console.log(`Health      : http://localhost:${PORT}/health`);
    if (swaggerDocument) {
      console.log(`Swagger     : http://localhost:${PORT}/api-docs`);
    }
    console.log('\nDemo credentials (password: "password"):');
    console.log('  investor   → claire.vermeulen@example.com');
    console.log('  admin      → admin@fg.be');
    console.log('  consultant → sophie.renard@fg.be');
    console.log('');
  });
}

module.exports = app;
