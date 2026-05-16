'use strict';

/**
 * Brand Routes — /api/brands
 *
 * GET    /api/brands                  — list all brands
 * POST   /api/brands                  — create brand (admin)
 * GET    /api/brands/share-classes    — list share class definitions
 * GET    /api/brands/:id              — single brand
 * PUT    /api/brands/:id              — update brand (admin)
 * DELETE /api/brands/:id              — archive brand (admin)
 * GET    /api/brands/:id/full         — all 8 sections joined (admin)
 * GET    /api/brands/:id/presentation — CMS presentation
 * GET    /api/brands/:id/shops        — brand shops
 * GET    /api/brands/:id/opportunities
 * GET    /api/brands/:id/team
 * GET    /api/brands/:id/documents
 * GET    /api/brands/:id/portfolio
 */

const express = require('express');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  BRANDS,
  BRAND_PRESENTATION,
  BRAND_PORTFOLIOS,
  FG_OPPORTUNITIES,
  FG_DOCS,
  SHOPS,
  SHARE_CLASSES,
  BRANDS_FULL,
  ONBOARDING_OPPORTUNITIES,
} = require('../data/seed');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// In-memory mutable store for new brands created via the API
const brandsStore     = [...BRANDS];
const brandFullStore  = [...BRANDS_FULL];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function findBrand(id) {
  return brandsStore.find(b => b.id === id) || null;
}
function findBrandFull(id) {
  return brandFullStore.find(b => b.id === id) || null;
}
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---------------------------------------------------------------------------
// GET /api/brands/share-classes  — must be before /:id
// ---------------------------------------------------------------------------
router.get('/share-classes', (req, res) => {
  res.json({ data: SHARE_CLASSES, meta: { total: SHARE_CLASSES.length } });
});

// ---------------------------------------------------------------------------
// GET /api/brands
// ---------------------------------------------------------------------------
router.get('/', optionalAuth, (req, res) => {
  const { status } = req.query;
  let data = brandsStore;
  if (status) {
    const full = brandFullStore.filter(b => b.status === status).map(b => b.id);
    data = data.filter(b => full.includes(b.id));
  }
  res.json({ data, meta: { total: data.length } });
});

// ---------------------------------------------------------------------------
// POST /api/brands  — create brand (admin only)
// ---------------------------------------------------------------------------
router.post('/', authenticate, authorize('admin'), (req, res, next) => {
  const body = req.body || {};
  if (!body.name) return next(createError(400, 'name is required', 'VALIDATION_ERROR'));

  const id = body.slug || slugify(body.name);
  if (brandsStore.find(b => b.id === id)) {
    return next(createError(409, `Brand with slug '${id}' already exists`, 'DUPLICATE_SLUG'));
  }

  const now = new Date().toISOString();

  // Minimal BRANDS entry (UI-compatible)
  const brand = {
    id,
    name:        body.name,
    tagline:     typeof body.tagline === 'object' ? (body.tagline.fr || body.tagline.en || '') : (body.tagline || ''),
    kind:        body.kind || body['operations.storeFormat'] || '',
    city:        body.city || '',
    headquarters: body.headquarters || '',
    founded:     body.yearFounded || new Date().getFullYear(),
    established: '0 magasins',
    logoSrc:     body['visual.logos.main'] || '',
    logoMark:    (body.name || '?')[0].toUpperCase(),
    theme:       id,
    tokens: body.tokens || {
      primary:     body['visual.palette.primary.hex'] || '#333333',
      secondary:   body['visual.palette.secondary.hex'] || '#F5F5F5',
      ink:         '#1c1a17',
      bg:          '#FAFAFA',
      surface:     '#FFFFFF',
      accent:      body['visual.palette.primary.hex'] || '#333333',
      fontDisplay: '"DM Sans", system-ui, sans-serif',
      fontUi:      '"DM Sans", system-ui, sans-serif',
      fontAccent:  '"DM Sans", system-ui, sans-serif',
    },
    kpiLabels: body.kpiLabels || { ca: 'CA', profit: 'Profit net', cust: 'Clients/jour', basket: 'Panier moyen' },
    copy: body.copy || { ecoNoun: 'magasin', ecoNounPlural: 'magasins', verdict: 'En cours' },
  };

  // Full extended record
  const brandFull = {
    id,
    name:           body.name,
    legalName:      body.legalName || body.name,
    slug:           id,
    status:         body.status || 'in-development',
    yearFounded:    body.yearFounded || new Date().getFullYear(),
    countryOfOrigin: body.countryOfOrigin || 'BE',
    tagline:        body.tagline    || { fr: '', nl: '', en: '', pl: '' },
    story:          body.story      || { fr: '', nl: '', en: '', pl: '' },
    visual:         body.visual     || { logos: {}, palette: {}, typography: {} },
    positioning:    body.positioning || {},
    operations:     body.operations  || {},
    financials:     body.financials  || {},
    legal:          body.legal       || {},
    network:        body.network     || {},
    meta: {
      createdBy:    req.user.email,
      createdAt:    now,
      updatedAt:    now,
      brandManager: body.brandManager || req.user.email,
      internalNotes: body.internalNotes || '',
      draftSavedAt: body.isDraft ? now : null,
      publishedAt:  body.isDraft ? null : now,
    },
    tokens: brand.tokens,
  };

  brandsStore.push(brand);
  brandFullStore.push(brandFull);

  res.status(201).json({ data: brandFull, message: 'Brand created.' });
});

// ---------------------------------------------------------------------------
// GET /api/brands/:id
// ---------------------------------------------------------------------------
router.get('/:id', optionalAuth, (req, res, next) => {
  const brand = findBrand(req.params.id);
  if (!brand) return next(createError(404, `Brand '${req.params.id}' not found`, 'BRAND_NOT_FOUND'));

  // Attach portfolio summary if available
  const portfolio = BRAND_PORTFOLIOS[brand.id];
  const summary = portfolio ? portfolio.summary : null;

  res.json({
    data: { ...brand, portfolioSummary: summary }
  });
});

// ---------------------------------------------------------------------------
// GET /api/brands/:id/presentation
// ---------------------------------------------------------------------------
router.get('/:id/presentation', optionalAuth, (req, res, next) => {
  const brand = findBrand(req.params.id);
  if (!brand) return next(createError(404, `Brand '${req.params.id}' not found`, 'BRAND_NOT_FOUND'));

  const presentation = BRAND_PRESENTATION[brand.id];
  if (!presentation) return next(createError(404, 'Presentation not available for this brand', 'PRESENTATION_NOT_FOUND'));

  res.json({ data: { brand, presentation } });
});

// ---------------------------------------------------------------------------
// GET /api/brands/:id/shops
// ---------------------------------------------------------------------------
router.get('/:id/shops', authenticate, (req, res, next) => {
  const brand = findBrand(req.params.id);
  if (!brand) return next(createError(404, `Brand '${req.params.id}' not found`, 'BRAND_NOT_FOUND'));

  // Merge top-level SHOPS and portfolio shops, deduplicate by id
  const allShops = SHOPS.filter(s => s.brand === brand.id);
  const portfolio = BRAND_PORTFOLIOS[brand.id];
  if (portfolio) {
    portfolio.shops.forEach(ps => {
      if (!allShops.find(s => s.id === ps.id)) allShops.push(ps);
    });
  }

  res.json({
    data: allShops,
    meta: { total: allShops.length, brand: brand.id }
  });
});

// ---------------------------------------------------------------------------
// GET /api/brands/:id/opportunities
// ---------------------------------------------------------------------------
router.get('/:id/opportunities', optionalAuth, (req, res, next) => {
  const brand = findBrand(req.params.id);
  if (!brand) return next(createError(404, `Brand '${req.params.id}' not found`, 'BRAND_NOT_FOUND'));

  const opps = FG_OPPORTUNITIES.filter(o => o.brand === brand.id);

  res.json({
    data: opps,
    meta: { total: opps.length, brand: brand.id }
  });
});

// ---------------------------------------------------------------------------
// GET /api/brands/:id/team
// ---------------------------------------------------------------------------
router.get('/:id/team', optionalAuth, (req, res, next) => {
  const brand = findBrand(req.params.id);
  if (!brand) return next(createError(404, `Brand '${req.params.id}' not found`, 'BRAND_NOT_FOUND'));

  const presentation = BRAND_PRESENTATION[brand.id];
  const team = presentation ? presentation.team : [];

  res.json({
    data: team,
    meta: { total: team.length, brand: brand.id }
  });
});

// ---------------------------------------------------------------------------
// GET /api/brands/:id/documents
// ---------------------------------------------------------------------------
router.get('/:id/documents', authenticate, (req, res, next) => {
  const brand = findBrand(req.params.id);
  if (!brand) return next(createError(404, `Brand '${req.params.id}' not found`, 'BRAND_NOT_FOUND'));

  const docs = FG_DOCS.filter(d => d.brand === brand.id);

  res.json({
    data: docs,
    meta: { total: docs.length, brand: brand.id }
  });
});

// ---------------------------------------------------------------------------
// GET /api/brands/:id/portfolio
// ---------------------------------------------------------------------------
router.get('/:id/portfolio', authenticate, (req, res, next) => {
  const brand = findBrand(req.params.id);
  if (!brand) return next(createError(404, `Brand '${req.params.id}' not found`, 'BRAND_NOT_FOUND'));

  const portfolio = BRAND_PORTFOLIOS[brand.id];
  if (!portfolio) {
    return res.json({ data: null, meta: { brand: brand.id } });
  }

  res.json({ data: portfolio, meta: { brand: brand.id } });
});

// ---------------------------------------------------------------------------
// GET /api/brands/:id/full  — all 8 sections (admin only)
// ---------------------------------------------------------------------------
router.get('/:id/full', authenticate, authorize('admin', 'consultant'), (req, res, next) => {
  const brandFull = findBrandFull(req.params.id);
  if (!brandFull) return next(createError(404, `Brand '${req.params.id}' not found`, 'BRAND_NOT_FOUND'));
  res.json({ data: brandFull });
});

// ---------------------------------------------------------------------------
// PUT /api/brands/:id  — update brand (admin only)
// ---------------------------------------------------------------------------
router.put('/:id', authenticate, authorize('admin'), (req, res, next) => {
  const brand     = findBrand(req.params.id);
  const brandFull = findBrandFull(req.params.id);
  if (!brand || !brandFull) return next(createError(404, `Brand '${req.params.id}' not found`, 'BRAND_NOT_FOUND'));

  const body = req.body || {};
  const now  = new Date().toISOString();

  // Patch minimal brand entry (UI-facing fields only)
  if (body.name)        brand.name    = body.name;
  if (body.tagline)     brand.tagline = typeof body.tagline === 'object' ? (body.tagline.fr || body.tagline.en || '') : body.tagline;
  if (body.kind        !== undefined) brand.kind         = body.kind;
  if (body.city        !== undefined) brand.city         = body.city;
  if (body.headquarters!== undefined) brand.headquarters = body.headquarters;
  if (body.yearFounded !== undefined) brand.founded      = body.yearFounded;
  if (body.tokens)      Object.assign(brand.tokens, body.tokens);
  if (body.logoSrc     !== undefined) brand.logoSrc      = body.logoSrc;

  // Patch full record — merge each top-level section if provided
  const sections = ['tagline','story','visual','positioning','operations','financials','legal','network'];
  sections.forEach(s => {
    if (body[s] !== undefined) {
      brandFull[s] = typeof body[s] === 'object' && !Array.isArray(body[s])
        ? Object.assign({}, brandFull[s], body[s])
        : body[s];
    }
  });
  if (body.name)        brandFull.name       = body.name;
  if (body.legalName)   brandFull.legalName  = body.legalName;
  if (body.status)      brandFull.status     = body.status;
  if (body.yearFounded) brandFull.yearFounded= body.yearFounded;
  if (body.tokens)      Object.assign(brandFull.tokens, body.tokens);

  brandFull.meta.updatedAt = now;
  if (body.internalNotes !== undefined) brandFull.meta.internalNotes = body.internalNotes;
  if (body.brandManager  !== undefined) brandFull.meta.brandManager  = body.brandManager;
  if (body.isDraft === false && !brandFull.meta.publishedAt) brandFull.meta.publishedAt = now;
  if (body.isDraft === true)  brandFull.meta.draftSavedAt = now;

  res.json({ data: brandFull, message: 'Brand updated.' });
});

// ---------------------------------------------------------------------------
// DELETE /api/brands/:id  — archive brand (admin only)
// ---------------------------------------------------------------------------
router.delete('/:id', authenticate, authorize('admin'), (req, res, next) => {
  const brandFull = findBrandFull(req.params.id);
  if (!brandFull) return next(createError(404, `Brand '${req.params.id}' not found`, 'BRAND_NOT_FOUND'));

  brandFull.status = 'archived';
  brandFull.meta.updatedAt = new Date().toISOString();

  res.json({ data: { id: req.params.id, status: 'archived' }, message: 'Brand archived.' });
});

module.exports = router;
