'use strict';

/**
 * Regions Routes — /api/regions
 *
 * GET  /api/regions      — list all regions
 * GET  /api/regions/:id  — single region detail + opportunities in that region
 *
 * Example:
 *   GET /api/regions
 *   GET /api/regions/bxl
 */

const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { REGIONS, ONBOARDING_OPPORTUNITIES, SHOPS } = require('../data/seed');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/regions
// ---------------------------------------------------------------------------
router.get('/', optionalAuth, (req, res) => {
  res.json({
    data: REGIONS,
    meta: { total: REGIONS.length }
  });
});

// ---------------------------------------------------------------------------
// GET /api/regions/:id
// ---------------------------------------------------------------------------
router.get('/:id', optionalAuth, (req, res, next) => {
  const region = REGIONS.find(r => r.id === req.params.id);
  if (!region) return next(createError(404, `Region '${req.params.id}' not found`, 'REGION_NOT_FOUND'));

  const opportunities = ONBOARDING_OPPORTUNITIES.filter(o => o.region === region.id);
  const shops         = SHOPS.filter(s => s.region === region.id);

  res.json({
    data: {
      ...region,
      opportunityCount: opportunities.length,
      shopCount:        shops.length,
      opportunities,
      shops
    }
  });
});

module.exports = router;
