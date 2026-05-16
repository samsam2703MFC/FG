'use strict';

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');
const YAML    = require('yamljs');
const swaggerUi = require('swagger-ui-express');

require('dotenv').config();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('combined'));

// ── Swagger docs ──────────────────────────────────────────────
const swaggerDoc = YAML.load(path.join(__dirname, '..', 'docs', 'openapi.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/brands',       require('./routes/brands'));
app.use('/api/opportunities',require('./routes/opportunities'));
app.use('/api/investors',    require('./routes/investors'));
app.use('/api/candidates',   require('./routes/candidates'));

// ── Health ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ── Error handler ─────────────────────────────────────────────
app.use(require('./middleware/errorHandler'));

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`FG API listening on :${PORT}`);
  console.log(`Docs → http://localhost:${PORT}/api/docs`);
});

module.exports = app;
