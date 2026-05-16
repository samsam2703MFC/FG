'use strict';

/**
 * Documents Routes — /api/documents
 *
 * GET    /api/documents         — list (filterable by type/brand/status)
 * POST   /api/documents         — upload document (returns mock URL)
 * GET    /api/documents/:id     — single document metadata
 * PUT    /api/documents/:id     — update document metadata (status, title, etc.)
 * DELETE /api/documents/:id     — soft-delete document
 * GET    /api/documents/types   — list document types
 *
 * Query params for GET /:
 *   type    — document type id (e.g. 'kyc', 'contract', 'tax')
 *   brand   — brand id filter
 *   status  — status filter ('validated', 'pending', 'expired', 'missing', 'signed', 'review')
 *   project — project id filter
 *   page, limit
 *
 * Example upload request:
 *   POST /api/documents
 *   Content-Type: multipart/form-data
 *   Fields: type, brand (optional), title, project (optional)
 *   File: file (the document)
 *
 * Example response:
 *   { "data": { "id": "...", "url": "/uploads/...", "status": "pending", ... } }
 */

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { FG_DOCS, DOC_TYPES } = require('../data/seed');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Multer config (disk storage for demo; use S3/GCS in production)
// ---------------------------------------------------------------------------
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed. Accepted: ${allowed.join(', ')}`));
    }
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function paginateArray(arr, page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return { items: arr.slice(start, start + limit), total: arr.length, page, limit, pages: Math.ceil(arr.length / limit) };
}

// ---------------------------------------------------------------------------
// GET /api/documents/types
// ---------------------------------------------------------------------------
router.get('/types', (req, res) => {
  res.json({ data: DOC_TYPES, meta: { total: DOC_TYPES.length } });
});

// ---------------------------------------------------------------------------
// GET /api/documents
// ---------------------------------------------------------------------------
router.get('/', (req, res) => {
  const { type, brand, status, project, page = 1, limit = 20 } = req.query;
  const pageNum  = parseInt(page, 10)  || 1;
  const limitNum = parseInt(limit, 10) || 20;

  let docs = [...FG_DOCS];

  if (type)    docs = docs.filter(d => d.type    === type);
  if (brand)   docs = docs.filter(d => d.brand   === brand);
  if (status)  docs = docs.filter(d => d.status  === status);
  if (project) docs = docs.filter(d => d.project === project);

  const p = paginateArray(docs, pageNum, limitNum);

  res.json({
    data: p.items,
    meta: {
      total:   p.total,
      page:    p.page,
      limit:   p.limit,
      pages:   p.pages,
      filters: { type: type || null, brand: brand || null, status: status || null, project: project || null }
    }
  });
});

// ---------------------------------------------------------------------------
// GET /api/documents/:id
// ---------------------------------------------------------------------------
router.get('/:id', (req, res, next) => {
  const doc = FG_DOCS.find(d => d.id === req.params.id);
  if (!doc) return next(createError(404, `Document '${req.params.id}' not found`, 'DOCUMENT_NOT_FOUND'));
  res.json({ data: doc });
});

// ---------------------------------------------------------------------------
// POST /api/documents (upload)
// ---------------------------------------------------------------------------
router.post(
  '/',
  (req, res, next) => {
    // Handle multer errors gracefully
    upload.single('file')(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  [
    body('type').isString().withMessage('type required'),
    body('title').isLength({ min: 2, max: 200 }).withMessage('title must be 2–200 chars'),
    body('brand').optional().isString(),
    body('project').optional().isString()
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const typeExists = DOC_TYPES.find(t => t.id === req.body.type);
      if (!typeExists) {
        return res.status(400).json({ error: `Unknown document type: ${req.body.type}`, code: 'INVALID_DOC_TYPE' });
      }

      const fileInfo = req.file
        ? { url: `/uploads/${req.file.filename}`, size: `${(req.file.size / 1024).toFixed(0)} KB` }
        : { url: null, size: null };

      const doc = {
        id:        uuidv4(),
        type:      req.body.type,
        brand:     req.body.brand   || null,
        project:   req.body.project || null,
        title:     req.body.title,
        sub:       req.body.sub     || null,
        date:      new Date().toISOString().split('T')[0],
        expiry:    req.body.expiry  || null,
        status:    'pending',
        size:      fileInfo.size,
        url:       fileInfo.url,
        uploadedBy: req.user.id,
        createdAt: new Date().toISOString()
      };

      FG_DOCS.push(doc);

      res.status(201).json({ data: doc });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/documents/:id
// ---------------------------------------------------------------------------
router.put(
  '/:id',
  authorize('admin'),
  [
    body('status').optional().isIn(['validated', 'pending', 'expired', 'missing', 'signed', 'review']),
    body('title').optional().isLength({ min: 2, max: 200 }),
    body('expiry').optional().isString()
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const idx = FG_DOCS.findIndex(d => d.id === req.params.id);
      if (idx === -1) return next(createError(404, `Document '${req.params.id}' not found`, 'DOCUMENT_NOT_FOUND'));

      const updatable = ['status', 'title', 'sub', 'expiry', 'brand', 'project'];
      updatable.forEach(field => {
        if (req.body[field] !== undefined) FG_DOCS[idx][field] = req.body[field];
      });

      FG_DOCS[idx].updatedAt = new Date().toISOString();

      res.json({ data: FG_DOCS[idx] });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// DELETE /api/documents/:id
// ---------------------------------------------------------------------------
router.delete('/:id', authorize('admin'), (req, res, next) => {
  const idx = FG_DOCS.findIndex(d => d.id === req.params.id);
  if (idx === -1) return next(createError(404, `Document '${req.params.id}' not found`, 'DOCUMENT_NOT_FOUND'));

  FG_DOCS[idx].status    = 'deleted';
  FG_DOCS[idx].deletedAt = new Date().toISOString();
  FG_DOCS[idx].deletedBy = req.user.id;

  res.json({
    data: { id: req.params.id, status: 'deleted' },
    meta: { message: 'Document marked as deleted' }
  });
});

module.exports = router;
