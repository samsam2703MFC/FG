'use strict';

/**
 * Investor Routes — /api/investors
 *
 * GET  /api/investors                         — list all investors (admin only)
 * GET  /api/investors/:id                     — single investor profile
 * GET  /api/investors/:id/portfolio           — full portfolio (all brands)
 * GET  /api/investors/:id/portfolio/:brandId  — single-brand portfolio
 * GET  /api/investors/:id/documents           — all investor documents
 * GET  /api/investors/:id/repayments          — repayment history & schedule
 * POST /api/investors/:id/interest            — express interest in an opportunity
 *
 * Query params for GET /investors:
 *   page, limit
 *
 * Example:
 *   GET /api/investors/inv-001/portfolio
 *   GET /api/investors/inv-001/repayments?brand=atelier
 *   POST /api/investors/inv-001/interest
 *   Body: { "opportunityId": "atelier-gent", "amount": 10000 }
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  INVESTORS,
  BRAND_PORTFOLIOS,
  FG_DOCS,
  REPAYMENTS,
  INVESTOR_INTERESTS,
  FG_OPPORTUNITIES
} = require('../data/seed');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

router.use(authenticate);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function canAccessInvestor(req, investorId) {
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'investor' && req.user.investorId === investorId) return true;
  return false;
}

function paginateArray(arr, page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return { items: arr.slice(start, start + limit), total: arr.length, page, limit, pages: Math.ceil(arr.length / limit) };
}

// ---------------------------------------------------------------------------
// GET /api/investors
// ---------------------------------------------------------------------------
router.get('/', authorize('admin'), (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const p = paginateArray(INVESTORS, parseInt(page, 10) || 1, parseInt(limit, 10) || 20);

  const safe = p.items.map(({ passwordHash, ...inv }) => inv); // eslint-disable-line no-unused-vars
  res.json({ data: safe, meta: { total: p.total, page: p.page, limit: p.limit, pages: p.pages } });
});

// ---------------------------------------------------------------------------
// GET /api/investors/:id
// ---------------------------------------------------------------------------
router.get('/:id', (req, res, next) => {
  if (!canAccessInvestor(req, req.params.id)) {
    return next(createError(403, 'Access denied', 'FORBIDDEN'));
  }

  const investor = INVESTORS.find(i => i.id === req.params.id);
  if (!investor) return next(createError(404, `Investor '${req.params.id}' not found`, 'INVESTOR_NOT_FOUND'));

  const { passwordHash, ...safe } = investor; // eslint-disable-line no-unused-vars
  res.json({ data: safe });
});

// ---------------------------------------------------------------------------
// GET /api/investors/:id/portfolio
// ---------------------------------------------------------------------------
router.get('/:id/portfolio', (req, res, next) => {
  if (!canAccessInvestor(req, req.params.id)) {
    return next(createError(403, 'Access denied', 'FORBIDDEN'));
  }

  const investor = INVESTORS.find(i => i.id === req.params.id);
  if (!investor) return next(createError(404, `Investor '${req.params.id}' not found`, 'INVESTOR_NOT_FOUND'));

  // Return portfolios for all brands the investor is in
  const portfolios = {};
  investor.brands.forEach(brandId => {
    if (BRAND_PORTFOLIOS[brandId]) {
      portfolios[brandId] = BRAND_PORTFOLIOS[brandId];
    }
  });

  const aggregated = {
    totalInvested:  investor.totalInvested,
    totalRepaid:    investor.totalRepaid,
    valuation:      Object.values(BRAND_PORTFOLIOS)
      .filter((_, i) => investor.brands[i])
      .reduce((sum, p) => sum + (p.summary.valuation || 0), 0),
    brands: portfolios
  };

  res.json({ data: aggregated, meta: { investorId: req.params.id } });
});

// ---------------------------------------------------------------------------
// GET /api/investors/:id/portfolio/:brandId
// ---------------------------------------------------------------------------
router.get('/:id/portfolio/:brandId', (req, res, next) => {
  if (!canAccessInvestor(req, req.params.id)) {
    return next(createError(403, 'Access denied', 'FORBIDDEN'));
  }

  const investor = INVESTORS.find(i => i.id === req.params.id);
  if (!investor) return next(createError(404, `Investor '${req.params.id}' not found`, 'INVESTOR_NOT_FOUND'));

  const portfolio = BRAND_PORTFOLIOS[req.params.brandId];
  if (!portfolio) {
    return res.status(404).json({ error: `No portfolio for brand '${req.params.brandId}'`, code: 'PORTFOLIO_NOT_FOUND' });
  }

  res.json({ data: portfolio, meta: { investorId: req.params.id, brand: req.params.brandId } });
});

// ---------------------------------------------------------------------------
// GET /api/investors/:id/documents
// ---------------------------------------------------------------------------
router.get('/:id/documents', (req, res, next) => {
  if (!canAccessInvestor(req, req.params.id)) {
    return next(createError(403, 'Access denied', 'FORBIDDEN'));
  }

  const investor = INVESTORS.find(i => i.id === req.params.id);
  if (!investor) return next(createError(404, `Investor '${req.params.id}' not found`, 'INVESTOR_NOT_FOUND'));

  const { type, brand, status } = req.query;
  let docs = [...FG_DOCS];

  if (type)   docs = docs.filter(d => d.type   === type);
  if (brand)  docs = docs.filter(d => d.brand  === brand);
  if (status) docs = docs.filter(d => d.status === status);

  res.json({
    data: docs,
    meta: { total: docs.length, investorId: req.params.id, filters: { type: type || null, brand: brand || null, status: status || null } }
  });
});

// ---------------------------------------------------------------------------
// GET /api/investors/:id/repayments
// ---------------------------------------------------------------------------
router.get('/:id/repayments', (req, res, next) => {
  if (!canAccessInvestor(req, req.params.id)) {
    return next(createError(403, 'Access denied', 'FORBIDDEN'));
  }

  const investor = INVESTORS.find(i => i.id === req.params.id);
  if (!investor) return next(createError(404, `Investor '${req.params.id}' not found`, 'INVESTOR_NOT_FOUND'));

  const { brand, status, page = 1, limit = 20 } = req.query;
  let reps = REPAYMENTS.filter(r => r.investorId === req.params.id);

  if (brand)  reps = reps.filter(r => r.brand  === brand);
  if (status) reps = reps.filter(r => r.status === status);

  const p = paginateArray(reps, parseInt(page, 10) || 1, parseInt(limit, 10) || 20);

  const totalPaid      = reps.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0);
  const totalScheduled = reps.filter(r => r.status === 'scheduled').reduce((s, r) => s + r.amount, 0);

  res.json({
    data: p.items,
    meta: {
      total:          p.total,
      page:           p.page,
      limit:          p.limit,
      pages:          p.pages,
      totalPaid,
      totalScheduled,
      investorId:     req.params.id
    }
  });
});

// ---------------------------------------------------------------------------
// POST /api/investors/:id/interest
// ---------------------------------------------------------------------------
router.post(
  '/:id/interest',
  [
    body('opportunityId').isString().withMessage('opportunityId required'),
    body('amount').optional().isNumeric().withMessage('Amount must be numeric'),
    body('message').optional().isString().isLength({ max: 1000 })
  ],
  (req, res, next) => {
    try {
      if (!canAccessInvestor(req, req.params.id)) {
        return next(createError(403, 'Access denied', 'FORBIDDEN'));
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const investor = INVESTORS.find(i => i.id === req.params.id);
      if (!investor) return next(createError(404, `Investor '${req.params.id}' not found`, 'INVESTOR_NOT_FOUND'));

      const opp = FG_OPPORTUNITIES.find(o => o.id === req.body.opportunityId);
      if (!opp) return next(createError(404, `Opportunity '${req.body.opportunityId}' not found`, 'OPPORTUNITY_NOT_FOUND'));

      // Check ticket minimum
      if (req.body.amount && req.body.amount < opp.ticketMin) {
        return res.status(400).json({
          error: `Minimum ticket for this opportunity is €${opp.ticketMin}`,
          code: 'BELOW_MIN_TICKET'
        });
      }

      const interest = {
        id:            uuidv4(),
        investorId:    req.params.id,
        opportunityId: req.body.opportunityId,
        amount:        req.body.amount  || null,
        message:       req.body.message || null,
        status:        'pending',
        createdAt:     new Date().toISOString()
      };

      INVESTOR_INTERESTS.push(interest);

      res.status(201).json({
        data: interest,
        meta: { message: 'Interest registered. Our investor relations team will contact you within 24h.' }
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
