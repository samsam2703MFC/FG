'use strict';

/**
 * Consultants Routes — /api/consultants
 *
 * GET  /api/consultants           — list all consultants
 * GET  /api/consultants/:id       — single consultant profile
 * GET  /api/consultants/:id/leads — consultant's active leads
 * GET  /api/consultants/:id/schedule — consultant's upcoming schedule
 *
 * Query params for GET /:
 *   region — filter by region
 *   brand  — filter by brand expertise
 *   page, limit
 *
 * Example:
 *   GET /api/consultants
 *   GET /api/consultants/cons-001/leads
 *   GET /api/consultants/cons-001/schedule
 */

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { CONSULTANTS, CANDIDATE_LEADS } = require('../data/seed');
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
// GET /api/consultants
// ---------------------------------------------------------------------------
router.get('/', authorize('admin', 'consultant'), (req, res) => {
  const { region, brand, page = 1, limit = 20 } = req.query;
  const pageNum  = parseInt(page, 10)  || 1;
  const limitNum = parseInt(limit, 10) || 20;

  let results = [...CONSULTANTS];

  if (region) results = results.filter(c => c.region === region);
  if (brand)  results = results.filter(c => c.brands && c.brands.includes(brand));

  const p = paginateArray(results, pageNum, limitNum);

  res.json({
    data: p.items,
    meta: { total: p.total, page: p.page, limit: p.limit, pages: p.pages }
  });
});

// ---------------------------------------------------------------------------
// GET /api/consultants/:id
// ---------------------------------------------------------------------------
router.get('/:id', authorize('admin', 'consultant'), (req, res, next) => {
  // Consultants can only access their own profile
  if (req.user.role === 'consultant' && req.user.consultantId !== req.params.id) {
    return next(createError(403, 'Access denied', 'FORBIDDEN'));
  }

  const consultant = CONSULTANTS.find(c => c.id === req.params.id);
  if (!consultant) return next(createError(404, `Consultant '${req.params.id}' not found`, 'CONSULTANT_NOT_FOUND'));

  res.json({ data: consultant });
});

// ---------------------------------------------------------------------------
// GET /api/consultants/:id/leads
// ---------------------------------------------------------------------------
router.get('/:id/leads', authorize('admin', 'consultant'), (req, res, next) => {
  if (req.user.role === 'consultant' && req.user.consultantId !== req.params.id) {
    return next(createError(403, 'Access denied', 'FORBIDDEN'));
  }

  const consultant = CONSULTANTS.find(c => c.id === req.params.id);
  if (!consultant) return next(createError(404, `Consultant '${req.params.id}' not found`, 'CONSULTANT_NOT_FOUND'));

  const { status, priority, page = 1, limit = 20 } = req.query;
  let leads = CANDIDATE_LEADS.filter(l =>
    l.assignedTo && l.assignedTo.name === consultant.name
  );

  if (status)   leads = leads.filter(l => l.status   === status);
  if (priority) leads = leads.filter(l => l.priority === priority);

  const p = paginateArray(leads, parseInt(page, 10) || 1, parseInt(limit, 10) || 20);

  res.json({
    data: p.items,
    meta: {
      total:         p.total,
      page:          p.page,
      limit:         p.limit,
      pages:         p.pages,
      consultantId:  req.params.id,
      consultantName: consultant.name
    }
  });
});

// ---------------------------------------------------------------------------
// GET /api/consultants/:id/schedule
// ---------------------------------------------------------------------------
router.get('/:id/schedule', authorize('admin', 'consultant'), (req, res, next) => {
  if (req.user.role === 'consultant' && req.user.consultantId !== req.params.id) {
    return next(createError(403, 'Access denied', 'FORBIDDEN'));
  }

  const consultant = CONSULTANTS.find(c => c.id === req.params.id);
  if (!consultant) return next(createError(404, `Consultant '${req.params.id}' not found`, 'CONSULTANT_NOT_FOUND'));

  const schedule = consultant.schedule || [];

  // Sort by date asc
  const sorted = [...schedule].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  res.json({
    data: sorted,
    meta: { total: sorted.length, consultantId: req.params.id }
  });
});

module.exports = router;
