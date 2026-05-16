'use strict';

/**
 * Candidates Routes — /api/candidates
 *
 * GET    /api/candidates              — list (filterable by brand/region/status)
 * GET    /api/candidates/:id          — single candidate profile
 * POST   /api/candidates             — create new candidate
 * PUT    /api/candidates/:id          — update candidate
 * GET    /api/candidates/:id/leads    — candidate's opportunity leads
 * POST   /api/candidates/:id/leads    — add a lead to candidate
 * GET    /api/candidates/:id/documents — candidate's documents
 * PUT    /api/candidates/:id/status   — update general status
 *
 * Query params for GET /:
 *   brand    — filter by brand preference
 *   region   — filter by preferred region
 *   status   — filter by generalStatus
 *   search   — search by name or email
 *   page, limit
 *
 * Example:
 *   GET /api/candidates?region=bxl&brand=cookies
 *   POST /api/candidates
 *   Body: { "firstName": "Jean", "lastName": "Dupont", "email": "j.dupont@example.com", ... }
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { CANDIDATES, CANDIDATE_LEADS } = require('../data/seed');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// All candidate routes require authentication
router.use(authenticate);

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

// ---------------------------------------------------------------------------
// GET /api/candidates
// ---------------------------------------------------------------------------
router.get('/', authorize('admin', 'consultant'), (req, res) => {
  const { brand, region, status, search, page = 1, limit = 20 } = req.query;
  const pageNum  = parseInt(page, 10)  || 1;
  const limitNum = parseInt(limit, 10) || 20;

  let results = [...CANDIDATES];

  if (brand) {
    results = results.filter(c => c.brandPreference && c.brandPreference.includes(brand));
  }
  if (region) {
    results = results.filter(c => c.preferredRegion === region);
  }
  if (status) {
    results = results.filter(c => c.generalStatus && c.generalStatus.toLowerCase().includes(status.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }

  const paginated = paginateArray(results, pageNum, limitNum);

  res.json({
    data: paginated.items,
    meta: { total: paginated.total, page: paginated.page, limit: paginated.limit, pages: paginated.pages }
  });
});

// ---------------------------------------------------------------------------
// GET /api/candidates/:id
// ---------------------------------------------------------------------------
router.get('/:id', authorize('admin', 'consultant'), (req, res, next) => {
  const candidate = CANDIDATES.find(c => c.id === req.params.id);
  if (!candidate) return next(createError(404, `Candidate '${req.params.id}' not found`, 'CANDIDATE_NOT_FOUND'));

  // Attach associated leads
  const leads = CANDIDATE_LEADS.filter(l => l.candidate.email === candidate.email);

  res.json({ data: { ...candidate, leads } });
});

// ---------------------------------------------------------------------------
// POST /api/candidates
// ---------------------------------------------------------------------------
router.post(
  '/',
  authorize('admin', 'consultant'),
  [
    body('firstName').isLength({ min: 1, max: 100 }).withMessage('First name required'),
    body('lastName').isLength({ min: 1, max: 100 }).withMessage('Last name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone'),
    body('budget').optional().isNumeric().withMessage('Budget must be numeric'),
    body('preferredRegion').optional().isString(),
    body('brandPreference').optional().isArray()
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const existing = CANDIDATES.find(c => c.email === req.body.email);
      if (existing) {
        return res.status(409).json({ error: 'Candidate with this email already exists', code: 'CANDIDATE_EXISTS' });
      }

      const candidate = {
        id:                uuidv4(),
        firstName:         req.body.firstName,
        lastName:          req.body.lastName,
        email:             req.body.email,
        phone:             req.body.phone             || null,
        address:           req.body.address           || null,
        preferredRegion:   req.body.preferredRegion   || null,
        language:          req.body.language          || null,
        experience:        req.body.experience        || null,
        currentSituation:  req.body.currentSituation  || null,
        motivation:        req.body.motivation        || null,
        budget:            req.body.budget            || null,
        financingCapacity: req.body.financingCapacity || null,
        brandPreference:   req.body.brandPreference   || [],
        locationPreference: req.body.locationPreference || null,
        internalNotes:     req.body.internalNotes     || null,
        generalStatus:     req.body.generalStatus     || 'À analyser',
        createdAt:         new Date().toISOString(),
        opportunities:     []
      };

      CANDIDATES.push(candidate);

      res.status(201).json({ data: candidate });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/candidates/:id
// ---------------------------------------------------------------------------
router.put(
  '/:id',
  authorize('admin', 'consultant'),
  [
    body('firstName').optional().isLength({ min: 1, max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('budget').optional().isNumeric(),
    body('brandPreference').optional().isArray()
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const idx = CANDIDATES.findIndex(c => c.id === req.params.id);
      if (idx === -1) return next(createError(404, `Candidate '${req.params.id}' not found`, 'CANDIDATE_NOT_FOUND'));

      const updatable = [
        'firstName', 'lastName', 'phone', 'address', 'preferredRegion', 'language',
        'experience', 'currentSituation', 'motivation', 'budget', 'financingCapacity',
        'brandPreference', 'locationPreference', 'internalNotes', 'generalStatus'
      ];
      updatable.forEach(field => {
        if (req.body[field] !== undefined) CANDIDATES[idx][field] = req.body[field];
      });

      CANDIDATES[idx].updatedAt = new Date().toISOString();

      res.json({ data: CANDIDATES[idx] });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/candidates/:id/leads
// ---------------------------------------------------------------------------
router.get('/:id/leads', authorize('admin', 'consultant'), (req, res, next) => {
  const candidate = CANDIDATES.find(c => c.id === req.params.id);
  if (!candidate) return next(createError(404, `Candidate '${req.params.id}' not found`, 'CANDIDATE_NOT_FOUND'));

  const leads = CANDIDATE_LEADS.filter(l => l.candidate.email === candidate.email);

  res.json({
    data: leads,
    meta: { total: leads.length, candidateId: req.params.id }
  });
});

// ---------------------------------------------------------------------------
// POST /api/candidates/:id/leads
// ---------------------------------------------------------------------------
router.post(
  '/:id/leads',
  authorize('admin', 'consultant'),
  [
    body('opportunityId').isString().withMessage('opportunityId required'),
    body('brand').isString().withMessage('brand required')
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const candidate = CANDIDATES.find(c => c.id === req.params.id);
      if (!candidate) return next(createError(404, `Candidate '${req.params.id}' not found`, 'CANDIDATE_NOT_FOUND'));

      const lead = {
        id: uuidv4(),
        candidate: {
          name:  `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.email,
          phone: candidate.phone || null,
          region: candidate.preferredRegion || null,
          capital: candidate.budget ? `€${candidate.budget}` : null
        },
        opportunity:  req.body.opportunityId,
        currentStep:  'interested',
        assignedTo:   req.body.assignedTo || null,
        priority:     req.body.priority   || 'normal',
        source:       req.body.source     || 'Manual',
        createdAt:    new Date().toISOString(),
        lastUpdate:   new Date().toISOString(),
        notes:        req.body.notes      || '',
        nextAction:   req.body.nextAction || null,
        requestedDocuments: [],
        appointments: [],
        messages:     [],
        history: [{ step: 'interested', at: new Date().toISOString().split('T')[0], by: req.user.name }],
        status: 'active'
      };

      CANDIDATE_LEADS.push(lead);

      res.status(201).json({ data: lead });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/candidates/:id/documents
// ---------------------------------------------------------------------------
router.get('/:id/documents', authorize('admin', 'consultant'), (req, res, next) => {
  const candidate = CANDIDATES.find(c => c.id === req.params.id);
  if (!candidate) return next(createError(404, `Candidate '${req.params.id}' not found`, 'CANDIDATE_NOT_FOUND'));

  // Collect all documents from all opportunities
  const docs = [];
  candidate.opportunities.forEach(opp => {
    (opp.documents || []).forEach(docName => {
      docs.push({ name: docName, opportunityId: opp.opportunityId, brand: opp.brand });
    });
  });

  res.json({
    data: docs,
    meta: { total: docs.length, candidateId: req.params.id }
  });
});

// ---------------------------------------------------------------------------
// PUT /api/candidates/:id/status
// ---------------------------------------------------------------------------
router.put(
  '/:id/status',
  authorize('admin', 'consultant'),
  [body('status').isString().withMessage('status required')],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const idx = CANDIDATES.findIndex(c => c.id === req.params.id);
      if (idx === -1) return next(createError(404, `Candidate '${req.params.id}' not found`, 'CANDIDATE_NOT_FOUND'));

      CANDIDATES[idx].generalStatus = req.body.status;
      CANDIDATES[idx].updatedAt     = new Date().toISOString();

      res.json({
        data: { id: CANDIDATES[idx].id, generalStatus: CANDIDATES[idx].generalStatus, updatedAt: CANDIDATES[idx].updatedAt }
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
