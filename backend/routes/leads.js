'use strict';

/**
 * Leads Routes — /api/leads
 *
 * GET    /api/leads/steps          — list all pipeline steps
 * GET    /api/leads/concept-types  — CONCEPT_TYPES reference list
 * GET    /api/leads/new-brand      — NEW_BRAND_LEADS (admin/consultant only)
 * POST   /api/leads/new-brand      — submit a new brand concept lead
 * GET    /api/leads                — list (filterable by brand/region/consultant/status/priority)
 * GET    /api/leads/:id            — single lead with full history and messages
 * PUT    /api/leads/:id            — update status, notes, assignment, nextAction
 * DELETE /api/leads/:id            — soft-delete (set status to 'archived')
 *
 * Query params for GET /:
 *   brand      — filter by opportunity brand
 *   region     — filter by candidate region
 *   consultant — filter by assigned consultant name
 *   status     — filter by lead status ('active', 'archived', 'closed')
 *   step       — filter by currentStep
 *   priority   — filter by priority ('high', 'normal', 'low')
 *   search     — search by candidate name or email
 *   page, limit
 *
 * Example:
 *   GET /api/leads?priority=high&step=committee
 *   PUT /api/leads/lead-001
 *   Body: { "currentStep": "financing-precheck", "notes": "Updated notes", "nextAction": "..." }
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  CANDIDATE_LEADS,
  LEAD_STEPS,
  ONBOARDING_OPPORTUNITIES,
  CONCEPT_TYPES,
  NEW_BRAND_LEADS
} = require('../data/seed');
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
// GET /api/leads/steps
// ---------------------------------------------------------------------------
router.get('/steps', (req, res) => {
  res.json({ data: LEAD_STEPS, meta: { total: LEAD_STEPS.length } });
});

// ---------------------------------------------------------------------------
// GET /api/leads/concept-types
// ---------------------------------------------------------------------------
router.get('/concept-types', (req, res) => {
  res.json({ data: CONCEPT_TYPES, meta: { total: CONCEPT_TYPES.length } });
});

// ---------------------------------------------------------------------------
// GET /api/leads/new-brand
// ---------------------------------------------------------------------------
router.get('/new-brand', authorize('admin', 'consultant'), (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const pageNum  = parseInt(page, 10)  || 1;
  const limitNum = parseInt(limit, 10) || 20;

  let results = [...NEW_BRAND_LEADS];

  if (status) {
    results = results.filter(l => l.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(l =>
      (l.projectName || '').toLowerCase().includes(q) ||
      (l.candidate && (l.candidate.name || '').toLowerCase().includes(q))
    );
  }

  const p = paginateArray(results, pageNum, limitNum);

  res.json({
    data: p.items,
    meta: { total: p.total, page: p.page, limit: p.limit, pages: p.pages }
  });
});

// ---------------------------------------------------------------------------
// POST /api/leads/new-brand
// ---------------------------------------------------------------------------
router.post(
  '/new-brand',
  [
    body('projectName').isString().isLength({ min: 2, max: 200 }).withMessage('Project name required'),
    body('conceptType').isString().withMessage('Concept type required'),
    body('candidate').isObject().withMessage('Candidate info required'),
    body('candidate.name').isString().isLength({ min: 2 }).withMessage('Candidate name required'),
    body('candidate.email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('description').optional().isString().isLength({ max: 2000 }),
    body('location').optional().isString(),
    body('budget').optional().isNumeric()
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const lead = {
        id:          `nbl-${uuidv4().slice(0, 8)}`,
        candidate:   req.body.candidate,
        projectName: req.body.projectName,
        conceptType: req.body.conceptType,
        location:    req.body.location    || null,
        budget:      req.body.budget      || null,
        description: req.body.description || null,
        inspirations: req.body.inspirations || null,
        attachments: [],
        status:      'to-analyse',
        assignedTo:  null,
        createdAt:   new Date().toISOString()
      };

      NEW_BRAND_LEADS.push(lead);

      res.status(201).json({ data: lead });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/leads
// ---------------------------------------------------------------------------
router.get('/', authorize('admin', 'consultant'), (req, res) => {
  const { brand, region, consultant, status, step, priority, search, page = 1, limit = 20 } = req.query;
  const pageNum  = parseInt(page, 10)  || 1;
  const limitNum = parseInt(limit, 10) || 20;

  let results = [...CANDIDATE_LEADS];

  // Consultants can only see their own leads
  if (req.user.role === 'consultant') {
    results = results.filter(l =>
      l.assignedTo && l.assignedTo.name === req.user.name
    );
  }

  if (brand) {
    results = results.filter(l => {
      const opp = ONBOARDING_OPPORTUNITIES.find(o => o.id === l.opportunity);
      return opp && opp.brand === brand;
    });
  }
  if (region) {
    results = results.filter(l => l.candidate && l.candidate.region === region);
  }
  if (consultant) {
    results = results.filter(l => l.assignedTo && l.assignedTo.name.toLowerCase().includes(consultant.toLowerCase()));
  }
  if (status) {
    results = results.filter(l => l.status === status);
  }
  if (step) {
    results = results.filter(l => l.currentStep === step);
  }
  if (priority) {
    results = results.filter(l => l.priority === priority);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(l =>
      (l.candidate.name  || '').toLowerCase().includes(q) ||
      (l.candidate.email || '').toLowerCase().includes(q)
    );
  }

  const p = paginateArray(results, pageNum, limitNum);

  res.json({
    data: p.items,
    meta: { total: p.total, page: p.page, limit: p.limit, pages: p.pages }
  });
});

// ---------------------------------------------------------------------------
// GET /api/leads/:id
// ---------------------------------------------------------------------------
router.get('/:id', authorize('admin', 'consultant'), (req, res, next) => {
  const lead = CANDIDATE_LEADS.find(l => l.id === req.params.id);
  if (!lead) return next(createError(404, `Lead '${req.params.id}' not found`, 'LEAD_NOT_FOUND'));

  // Consultants can only access their own leads
  if (req.user.role === 'consultant' && lead.assignedTo && lead.assignedTo.name !== req.user.name) {
    return next(createError(403, 'Access denied', 'FORBIDDEN'));
  }

  // Attach opportunity detail
  const opp = ONBOARDING_OPPORTUNITIES.find(o => o.id === lead.opportunity);

  res.json({ data: { ...lead, opportunityDetail: opp || null } });
});

// ---------------------------------------------------------------------------
// PUT /api/leads/:id
// ---------------------------------------------------------------------------
router.put(
  '/:id',
  authorize('admin', 'consultant'),
  [
    body('currentStep').optional().isString(),
    body('notes').optional().isString().isLength({ max: 2000 }),
    body('nextAction').optional().isString().isLength({ max: 500 }),
    body('priority').optional().isIn(['high', 'normal', 'low']).withMessage("Priority must be 'high', 'normal', or 'low'"),
    body('status').optional().isIn(['active', 'archived', 'closed', 'won', 'lost']),
    body('assignedTo').optional().isObject()
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const idx = CANDIDATE_LEADS.findIndex(l => l.id === req.params.id);
      if (idx === -1) return next(createError(404, `Lead '${req.params.id}' not found`, 'LEAD_NOT_FOUND'));

      const lead = CANDIDATE_LEADS[idx];

      // Consultants can only update their own leads
      if (req.user.role === 'consultant' && lead.assignedTo && lead.assignedTo.name !== req.user.name) {
        return next(createError(403, 'Access denied', 'FORBIDDEN'));
      }

      const updatable = ['notes', 'nextAction', 'priority', 'status', 'assignedTo', 'requestedDocuments'];
      updatable.forEach(field => {
        if (req.body[field] !== undefined) CANDIDATE_LEADS[idx][field] = req.body[field];
      });

      // Step change: record in history
      if (req.body.currentStep && req.body.currentStep !== lead.currentStep) {
        CANDIDATE_LEADS[idx].currentStep = req.body.currentStep;
        CANDIDATE_LEADS[idx].history = [
          ...(CANDIDATE_LEADS[idx].history || []),
          { step: req.body.currentStep, at: new Date().toISOString().split('T')[0], by: req.user.name }
        ];
      }

      CANDIDATE_LEADS[idx].lastUpdate = new Date().toISOString();

      res.json({ data: CANDIDATE_LEADS[idx] });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// DELETE /api/leads/:id
// ---------------------------------------------------------------------------
router.delete('/:id', authorize('admin'), (req, res, next) => {
  const idx = CANDIDATE_LEADS.findIndex(l => l.id === req.params.id);
  if (idx === -1) return next(createError(404, `Lead '${req.params.id}' not found`, 'LEAD_NOT_FOUND'));

  // Soft delete — set status to archived
  CANDIDATE_LEADS[idx].status    = 'archived';
  CANDIDATE_LEADS[idx].archivedAt = new Date().toISOString();
  CANDIDATE_LEADS[idx].archivedBy = req.user.name;

  res.json({
    data: { id: req.params.id, status: 'archived' },
    meta: { message: 'Lead archived successfully' }
  });
});

// ---------------------------------------------------------------------------
// POST /api/leads/:id/messages
// ---------------------------------------------------------------------------
router.post(
  '/:id/messages',
  authorize('admin', 'consultant'),
  [body('body').isString().isLength({ min: 1, max: 2000 }).withMessage('Message body required')],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const idx = CANDIDATE_LEADS.findIndex(l => l.id === req.params.id);
      if (idx === -1) return next(createError(404, `Lead '${req.params.id}' not found`, 'LEAD_NOT_FOUND'));

      const message = {
        id:   require('uuid').v4(),
        from: req.user.role,
        name: req.user.name,
        body: req.body.body,
        time: new Date().toISOString()
      };

      CANDIDATE_LEADS[idx].messages = [...(CANDIDATE_LEADS[idx].messages || []), message];
      CANDIDATE_LEADS[idx].lastUpdate = new Date().toISOString();

      res.status(201).json({ data: message });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
