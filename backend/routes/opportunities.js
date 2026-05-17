'use strict';

/**
 * Opportunities Routes — /api/opportunities
 *
 * GET  /api/opportunities                         — list all (filterable by brand/region/status/type)
 * GET  /api/opportunities/validation-statuses     — OPP_VALIDATION_STATUSES reference list
 * GET  /api/opportunities/:id                     — single opportunity
 * POST /api/opportunities/:id/interest            — express interest (creates a lead)
 * GET  /api/opportunities/:id/candidates          — list associated candidate leads
 * GET  /api/opportunities/:id/interests           — list investor interests for an opportunity
 * POST /api/opportunities/:id/validate            — validate candidate & close opportunity (admin, consultant)
 *
 * Query params for GET /:
 *   brand    — filter by brand id (e.g. ?brand=atelier)
 *   region   — filter by region id (e.g. ?region=bxl)
 *   status   — filter by status string
 *   type     — 'onboarding' | 'financing' | 'all' (default: 'all')
 *   page     — page number (default: 1)
 *   limit    — items per page (default: 20)
 *
 * Example:
 *   GET /api/opportunities?brand=atelier&type=onboarding
 *   POST /api/opportunities/op-bxl-cookies/interest
 *   Body: { "amount": 5000, "message": "Interested in this opportunity" }
 *   POST /api/opportunities/op-bxl-cookies/validate
 *   Body: { "candidateId": "lead-001" }
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const {
  ONBOARDING_OPPORTUNITIES,
  FG_OPPORTUNITIES,
  CANDIDATE_LEADS,
  INVESTOR_INTERESTS,
  OPP_VALIDATION_STATUSES,
  BRANDS,
  REGIONS,
  ONBOARDING_RECORDS,
  CRM_TASKS,
  AUDIT_LOG,
  ONBOARDING_JOURNEYS
} = require('../data/seed');
const { createError } = require('../middleware/errorHandler');
const { validateOpportunity } = require('../services/validateOpportunity');

const router = express.Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function paginateArray(arr, page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return {
    items: arr.slice(start, start + limit),
    total: arr.length,
    page,
    limit,
    pages: Math.ceil(arr.length / limit)
  };
}

function findOpportunity(id) {
  const onboarding = ONBOARDING_OPPORTUNITIES.find(o => o.id === id);
  if (onboarding) return { ...onboarding, opportunityType: 'onboarding' };
  const financing = FG_OPPORTUNITIES.find(o => o.id === id);
  if (financing) return { ...financing, opportunityType: 'financing' };
  return null;
}

// ---------------------------------------------------------------------------
// GET /api/opportunities/validation-statuses
// ---------------------------------------------------------------------------
router.get('/validation-statuses', (req, res) => {
  res.json({ data: OPP_VALIDATION_STATUSES, meta: { total: OPP_VALIDATION_STATUSES.length } });
});

// ---------------------------------------------------------------------------
// GET /api/opportunities
// ---------------------------------------------------------------------------
router.get('/', optionalAuth, (req, res) => {
  const { brand, region, status, type = 'all', page = 1, limit = 20 } = req.query;
  const pageNum  = parseInt(page, 10)  || 1;
  const limitNum = parseInt(limit, 10) || 20;

  let onboarding = type !== 'financing' ? [...ONBOARDING_OPPORTUNITIES] : [];
  let financing  = type !== 'onboarding' ? [...FG_OPPORTUNITIES]         : [];

  if (brand) {
    onboarding = onboarding.filter(o => o.brand === brand);
    financing  = financing.filter(o => o.brand === brand);
  }
  if (region) {
    onboarding = onboarding.filter(o => o.region === region);
    // FG_OPPORTUNITIES don't have region; skip filter for them
  }
  if (status) {
    onboarding = onboarding.filter(o => o.status && o.status.toLowerCase().includes(status.toLowerCase()));
    financing  = financing.filter(o => o.status && o.status.toLowerCase().includes(status.toLowerCase()));
  }

  const tagged = [
    ...onboarding.map(o => ({ ...o, opportunityType: 'onboarding' })),
    ...financing.map(o  => ({ ...o, opportunityType: 'financing' }))
  ];

  const paginated = paginateArray(tagged, pageNum, limitNum);

  res.json({
    data: paginated.items,
    meta: {
      total: paginated.total,
      page:  paginated.page,
      limit: paginated.limit,
      pages: paginated.pages,
      filters: { brand: brand || null, region: region || null, status: status || null, type }
    }
  });
});

// ---------------------------------------------------------------------------
// GET /api/opportunities/:id
// ---------------------------------------------------------------------------
router.get('/:id', optionalAuth, (req, res, next) => {
  const opp = findOpportunity(req.params.id);
  if (!opp) return next(createError(404, `Opportunity '${req.params.id}' not found`, 'OPPORTUNITY_NOT_FOUND'));

  // Attach brand detail
  const brand = BRANDS.find(b => b.id === opp.brand) || null;

  res.json({ data: { ...opp, brandDetail: brand } });
});

// ---------------------------------------------------------------------------
// POST /api/opportunities
// ---------------------------------------------------------------------------
router.post(
  '/',
  authenticate,
  authorize('admin', 'consultant'),
  [
    body('brand').isString().withMessage('brand is required'),
    body('name').isLength({ min: 2, max: 200 }).withMessage('name is required'),
    body('city').isLength({ min: 2, max: 100 }).withMessage('city is required'),
    body('region').optional().isString(),
    body('format').optional().isString(),
    body('opening').optional().isString(),
    body('status').optional().isIn(['En recherche candidat', 'Pré-lancement', 'Closing imminent', 'Co-investissement ouvert']),
    body('budget').optional().isNumeric(),
    body('ticketMin').optional().isNumeric(),
    body('ticketMax').optional().isNumeric(),
    body('roiTarget').optional().isNumeric(),
    body('developerId').optional().isString(),
    body('locationId').optional().isString()
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const brand = BRANDS.find(b => b.id === req.body.brand);
      if (!brand) return next(createError(404, `Brand '${req.body.brand}' not found`, 'BRAND_NOT_FOUND'));

      const opp = {
        id:           uuidv4(),
        brand:        req.body.brand,
        name:         req.body.name,
        city:         req.body.city,
        region:       req.body.region     || null,
        format:       req.body.format     || 'Boutique',
        opening:      req.body.opening    || null,
        status:       req.body.status     || 'En recherche candidat',
        budget:       req.body.budget     ? Number(req.body.budget)    : null,
        ticketMin:    req.body.ticketMin  ? Number(req.body.ticketMin) : null,
        ticketMax:    req.body.ticketMax  ? Number(req.body.ticketMax) : null,
        roiTarget:    req.body.roiTarget  ? Number(req.body.roiTarget) : null,
        developerId:  req.body.developerId  || null,
        locationId:   req.body.locationId   || null,
        targetOpenDate: req.body.opening   || null,
        createdAt:    new Date().toISOString(),
        createdBy:    req.user.email
      };

      ONBOARDING_OPPORTUNITIES.push(opp);

      res.status(201).json({ data: opp });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/opportunities/:id/interest
// ---------------------------------------------------------------------------
router.post(
  '/:id/interest',
  authenticate,
  [
    body('amount').optional().isNumeric().withMessage('Amount must be numeric'),
    body('message').optional().isString().isLength({ max: 1000 })
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const opp = findOpportunity(req.params.id);
      if (!opp) return next(createError(404, `Opportunity '${req.params.id}' not found`, 'OPPORTUNITY_NOT_FOUND'));

      const { amount, message } = req.body;
      const interest = {
        id:             uuidv4(),
        opportunityId:  opp.id,
        opportunityType: opp.opportunityType,
        userId:         req.user.id,
        investorId:     req.user.investorId || null,
        amount:         amount || null,
        message:        message || null,
        status:         'pending',
        createdAt:      new Date().toISOString()
      };

      INVESTOR_INTERESTS.push(interest);

      res.status(201).json({
        data: interest,
        meta: { message: 'Interest registered. Our team will contact you shortly.' }
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/opportunities/:id/candidates
// ---------------------------------------------------------------------------
router.get('/:id/candidates', authenticate, authorize('admin', 'consultant'), (req, res, next) => {
  const opp = findOpportunity(req.params.id);
  if (!opp) return next(createError(404, `Opportunity '${req.params.id}' not found`, 'OPPORTUNITY_NOT_FOUND'));

  const leads = CANDIDATE_LEADS.filter(l => l.opportunity === req.params.id);

  res.json({
    data: leads,
    meta: { total: leads.length, opportunityId: req.params.id }
  });
});

// ---------------------------------------------------------------------------
// GET /api/opportunities/:id/interests
// ---------------------------------------------------------------------------
router.get('/:id/interests', authenticate, authorize('admin', 'consultant'), (req, res, next) => {
  const opp = findOpportunity(req.params.id);
  if (!opp) return next(createError(404, `Opportunity '${req.params.id}' not found`, 'OPPORTUNITY_NOT_FOUND'));

  const interests = INVESTOR_INTERESTS.filter(i => i.opportunityId === req.params.id);

  res.json({
    data: interests,
    meta: { total: interests.length, opportunityId: req.params.id }
  });
});

// ---------------------------------------------------------------------------
// POST /api/opportunities/:id/validate
// ---------------------------------------------------------------------------
router.post(
  '/:id/validate',
  authenticate,
  authorize('admin', 'consultant'),
  (req, res, next) => {
    try {
      const { candidateId } = req.body;
      if (!candidateId || typeof candidateId !== 'string') {
        return res.status(422).json({
          error: 'candidateId is required and must be a string',
          code: 'VALIDATION_ERROR'
        });
      }

      const result = validateOpportunity({
        oppId: req.params.id,
        candidateId,
        validatedBy: req.user.email,
        collections: { ONBOARDING_OPPORTUNITIES, CANDIDATE_LEADS, ONBOARDING_RECORDS, CRM_TASKS, AUDIT_LOG, ONBOARDING_JOURNEYS }
      });

      res.status(200).json({
        data: result,
        message: 'Opportunity closed. Onboarding started.'
      });
    } catch (err) {
      if (err.code === 'ALREADY_CLOSED') return next(createError(409, err.message, err.code));
      if (err.code === 'NOT_FOUND' || err.code === 'CANDIDATE_NOT_FOUND') return next(createError(404, err.message, err.code));
      next(err);
    }
  }
);

module.exports = router;
