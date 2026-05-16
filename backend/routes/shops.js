'use strict';

/**
 * Shops Routes — /api/shops
 *
 * GET  /api/shops            — flat list, filterable by ?brandId=, ?region=, ?status=
 * GET  /api/shops/:id        — single shop detail
 * GET  /api/shops/:id/reports — monthly reports for a shop
 * GET  /api/shops/:id/kpi    — KPI snapshot for a shop
 *
 * Query params for GET /:
 *   brandId — filter by brand id
 *   region  — filter by region id
 *   status  — filter by shop status ('open', 'closed', 'coming-soon')
 *   page, limit
 */

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { SHOPS, SHOP_REPORTS } = require('../data/seed');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

router.use(authenticate);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function paginateArray(arr, page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return { items: arr.slice(start, start + limit), total: arr.length, page, limit, pages: Math.ceil(arr.length / limit) };
}

// ---------------------------------------------------------------------------
// GET /api/shops
// ---------------------------------------------------------------------------
router.get('/', (req, res) => {
  const { brandId, region, status, page = 1, limit = 20 } = req.query;
  const pageNum  = parseInt(page, 10)  || 1;
  const limitNum = parseInt(limit, 10) || 20;

  let results = [...SHOPS];

  if (brandId) results = results.filter(s => s.brand === brandId);
  if (region)  results = results.filter(s => s.region === region);
  if (status)  results = results.filter(s => s.status === status);

  const p = paginateArray(results, pageNum, limitNum);

  res.json({
    data: p.items,
    meta: { total: p.total, page: p.page, limit: p.limit, pages: p.pages, filters: { brandId: brandId || null, region: region || null, status: status || null } }
  });
});

// ---------------------------------------------------------------------------
// GET /api/shops/:id
// ---------------------------------------------------------------------------
router.get('/:id', (req, res, next) => {
  const shop = SHOPS.find(s => s.id === req.params.id);
  if (!shop) return next(createError(404, `Shop '${req.params.id}' not found`, 'SHOP_NOT_FOUND'));
  res.json({ data: shop });
});

// ---------------------------------------------------------------------------
// GET /api/shops/:id/reports
// ---------------------------------------------------------------------------
router.get('/:id/reports', authorize('admin', 'consultant'), (req, res, next) => {
  const shop = SHOPS.find(s => s.id === req.params.id);
  if (!shop) return next(createError(404, `Shop '${req.params.id}' not found`, 'SHOP_NOT_FOUND'));

  const { month, page = 1, limit = 20 } = req.query;
  const pageNum  = parseInt(page, 10)  || 1;
  const limitNum = parseInt(limit, 10) || 20;

  let reports = SHOP_REPORTS.filter(r => r.shopId === req.params.id);
  if (month) reports = reports.filter(r => r.month === month);
  reports = reports.sort((a, b) => b.month.localeCompare(a.month));

  const p = paginateArray(reports, pageNum, limitNum);

  res.json({
    data: p.items,
    meta: { total: p.total, page: p.page, limit: p.limit, pages: p.pages, shopId: req.params.id }
  });
});

// ---------------------------------------------------------------------------
// GET /api/shops/:id/kpi
// ---------------------------------------------------------------------------
router.get('/:id/kpi', (req, res, next) => {
  const shop = SHOPS.find(s => s.id === req.params.id);
  if (!shop) return next(createError(404, `Shop '${req.params.id}' not found`, 'SHOP_NOT_FOUND'));

  const latestReport = SHOP_REPORTS
    .filter(r => r.shopId === req.params.id)
    .sort((a, b) => b.month.localeCompare(a.month))[0] || null;

  res.json({
    data: {
      shopId:      shop.id,
      brand:       shop.brand,
      kpiSnapshot: shop.kpiSnapshot || null,
      latestReport: latestReport ? { month: latestReport.month, ca: latestReport.ca, vsBudget: latestReport.vsBudget, profit: latestReport.profit } : null,
      invested:    shop.invested,
      repaid:      shop.repaid,
      roiTarget:   shop.roiTarget,
      roiCurrent:  shop.roiCurrent,
      health:      shop.health
    }
  });
});

module.exports = router;
