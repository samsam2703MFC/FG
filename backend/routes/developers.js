'use strict';

/**
 * Developers (Real Estate) Routes — /api/developers
 *
 * GET    /api/developers      — list all real estate developers
 * GET    /api/developers/:id  — single developer with submitted locations
 * POST   /api/developers      — submit a new developer + location(s)
 * PUT    /api/developers/:id  — update developer profile or location status
 *
 * Also:
 * GET    /api/developers/:id/locations — list locations from this developer
 * POST   /api/developers/:id/locations — add a new location to existing developer
 * PUT    /api/developers/:id/locations/:locId — update a location
 *
 * Query params for GET /:
 *   region — filter by region
 *   status — filter by developer status ('active', 'pending', 'inactive')
 *   page, limit
 *
 * Example:
 *   POST /api/developers
 *   Body: {
 *     "name": "My Real Estate Co",
 *     "contactName": "Jean Dupont",
 *     "email": "j.dupont@example.com",
 *     "phone": "+32 477 123456",
 *     "type": "Propriétaire individuel",
 *     "regions": ["bxl"],
 *     "location": { "address": "Rue X 10, 1000 Bruxelles", "surface": "80 m²", "type": "Cellule commerciale", "availability": "2026-09-01", "rent": 2500 }
 *   }
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { DEVELOPERS, REGIONS } = require('../data/seed');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function paginateArray(arr, page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return { items: arr.slice(start, start + limit), total: arr.length, page, limit, pages: Math.ceil(arr.length / limit) };
}

// ---------------------------------------------------------------------------
// GET /api/developers
// ---------------------------------------------------------------------------
router.get('/', authenticate, authorize('admin'), (req, res) => {
  const { region, status, page = 1, limit = 20 } = req.query;
  let results = [...DEVELOPERS];

  if (region) results = results.filter(d => d.regions && d.regions.includes(region));
  if (status) results = results.filter(d => d.status === status);

  const p = paginateArray(results, parseInt(page, 10) || 1, parseInt(limit, 10) || 20);

  res.json({
    data: p.items,
    meta: { total: p.total, page: p.page, limit: p.limit, pages: p.pages }
  });
});

// ---------------------------------------------------------------------------
// GET /api/developers/:id
// ---------------------------------------------------------------------------
router.get('/:id', authenticate, authorize('admin'), (req, res, next) => {
  const developer = DEVELOPERS.find(d => d.id === req.params.id);
  if (!developer) return next(createError(404, `Developer '${req.params.id}' not found`, 'DEVELOPER_NOT_FOUND'));

  res.json({ data: developer });
});

// ---------------------------------------------------------------------------
// POST /api/developers (public submission from landing page)
// ---------------------------------------------------------------------------
router.post(
  '/',
  optionalAuth,
  [
    body('name').isLength({ min: 2, max: 200 }).withMessage('Company/developer name required'),
    body('contactName').isLength({ min: 2, max: 100 }).withMessage('Contact name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').optional().isString(),
    body('type').optional().isString(),
    body('regions').optional().isArray(),
    body('location').optional().isObject()
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const locations = [];
      if (req.body.location) {
        locations.push({
          id:           uuidv4(),
          address:      req.body.location.address      || '',
          surface:      req.body.location.surface      || null,
          type:         req.body.location.type         || null,
          availability: req.body.location.availability || null,
          rent:         req.body.location.rent         || null,
          notes:        req.body.location.notes        || null,
          status:       'pending-review'
        });
      }

      const developer = {
        id:           uuidv4(),
        name:         req.body.name,
        contactName:  req.body.contactName,
        email:        req.body.email,
        phone:        req.body.phone    || null,
        type:         req.body.type     || 'Non précisé',
        regions:      req.body.regions  || [],
        submittedAt:  new Date().toISOString(),
        status:       'pending',
        locations,
        notes:        req.body.notes    || null
      };

      DEVELOPERS.push(developer);

      res.status(201).json({
        data: developer,
        meta: { message: 'Your submission has been received. Our development team will contact you within 48h.' }
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/developers/:id
// ---------------------------------------------------------------------------
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [
    body('status').optional().isIn(['active', 'pending', 'inactive', 'rejected']),
    body('name').optional().isLength({ min: 2, max: 200 }),
    body('contactName').optional().isLength({ min: 2, max: 100 })
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const idx = DEVELOPERS.findIndex(d => d.id === req.params.id);
      if (idx === -1) return next(createError(404, `Developer '${req.params.id}' not found`, 'DEVELOPER_NOT_FOUND'));

      const updatable = ['name', 'contactName', 'email', 'phone', 'type', 'regions', 'status', 'notes'];
      updatable.forEach(field => {
        if (req.body[field] !== undefined) DEVELOPERS[idx][field] = req.body[field];
      });

      DEVELOPERS[idx].updatedAt = new Date().toISOString();

      res.json({ data: DEVELOPERS[idx] });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// DELETE /api/developers/:id  (soft-archive)
// ---------------------------------------------------------------------------
router.delete('/:id', authenticate, authorize('admin'), (req, res, next) => {
  const idx = DEVELOPERS.findIndex(d => d.id === req.params.id);
  if (idx === -1) return next(createError(404, `Developer '${req.params.id}' not found`, 'DEVELOPER_NOT_FOUND'));

  DEVELOPERS[idx].status = 'archived';
  DEVELOPERS[idx].archivedAt = new Date().toISOString();

  res.json({ data: { id: DEVELOPERS[idx].id, status: 'archived' } });
});

// ---------------------------------------------------------------------------
// GET /api/developers/:id/locations
// ---------------------------------------------------------------------------
router.get('/:id/locations', authenticate, authorize('admin'), (req, res, next) => {
  const developer = DEVELOPERS.find(d => d.id === req.params.id);
  if (!developer) return next(createError(404, `Developer '${req.params.id}' not found`, 'DEVELOPER_NOT_FOUND'));

  const { status } = req.query;
  let locations = developer.locations || [];
  if (status) locations = locations.filter(l => l.status === status);

  res.json({
    data: locations,
    meta: { total: locations.length, developerId: req.params.id }
  });
});

// ---------------------------------------------------------------------------
// POST /api/developers/:id/locations
// ---------------------------------------------------------------------------
router.post(
  '/:id/locations',
  authenticate,
  authorize('admin'),
  [
    body('address').isLength({ min: 5 }).withMessage('Address required'),
    body('surface').optional().isString(),
    body('type').optional().isString(),
    body('availability').optional().isString(),
    body('rent').optional().isNumeric()
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const idx = DEVELOPERS.findIndex(d => d.id === req.params.id);
      if (idx === -1) return next(createError(404, `Developer '${req.params.id}' not found`, 'DEVELOPER_NOT_FOUND'));

      const location = {
        id:           uuidv4(),
        address:      req.body.address,
        surface:      req.body.surface      || null,
        type:         req.body.type         || null,
        availability: req.body.availability || null,
        rent:         req.body.rent         || null,
        notes:        req.body.notes        || null,
        status:       req.body.status       || 'available',
        createdAt:    new Date().toISOString()
      };

      DEVELOPERS[idx].locations = [...(DEVELOPERS[idx].locations || []), location];

      res.status(201).json({ data: location });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/developers/:id/locations/:locId
// ---------------------------------------------------------------------------
router.put(
  '/:id/locations/:locId',
  authenticate,
  authorize('admin'),
  (req, res, next) => {
    const devIdx = DEVELOPERS.findIndex(d => d.id === req.params.id);
    if (devIdx === -1) return next(createError(404, `Developer '${req.params.id}' not found`, 'DEVELOPER_NOT_FOUND'));

    const locIdx = (DEVELOPERS[devIdx].locations || []).findIndex(l => l.id === req.params.locId);
    if (locIdx === -1) return next(createError(404, `Location '${req.params.locId}' not found`, 'LOCATION_NOT_FOUND'));

    const updatable = ['address', 'surface', 'type', 'availability', 'rent', 'notes', 'status'];
    updatable.forEach(field => {
      if (req.body[field] !== undefined) DEVELOPERS[devIdx].locations[locIdx][field] = req.body[field];
    });

    DEVELOPERS[devIdx].locations[locIdx].updatedAt = new Date().toISOString();

    res.json({ data: DEVELOPERS[devIdx].locations[locIdx] });
  }
);

module.exports = router;
