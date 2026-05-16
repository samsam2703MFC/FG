'use strict';

/**
 * Brand Routes — /api/brands
 *
 * GET  /api/brands                    — list all brands
 * GET  /api/brands/:id                — single brand with tokens & KPI labels
 * GET  /api/brands/:id/presentation   — full brand presentation (CMS content)
 * GET  /api/brands/:id/shops          — shops for this brand
 * GET  /api/brands/:id/opportunities  — financing opportunities for this brand
 * GET  /api/brands/:id/team           — brand team members
 * GET  /api/brands/:id/documents      — brand-level investor documents
 *
 * Example:
 *   GET /api/brands/atelier
 *   GET /api/brands/atelier/presentation
 *   GET /api/brands/atelier/shops
 */

const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  BRANDS,
  BRAND_PRESENTATION,
  BRAND_PORTFOLIOS,
  FG_OPPORTUNITIES,
  FG_DOCS,
  SHOPS
} = require('../data/seed');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function findBrand(id) {
  return BRANDS.find(b => b.id === id) || null;
}

// ---------------------------------------------------------------------------
// GET /api/brands
// ---------------------------------------------------------------------------
router.get('/', optionalAuth, (req, res) => {
  res.json({
    data: BRANDS,
    meta: { total: BRANDS.length }
  });
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

module.exports = router;
