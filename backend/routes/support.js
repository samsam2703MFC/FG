'use strict';

/**
 * Support Routes — /api/support
 *
 * GET    /api/support/tickets                  — list tickets (current user's tickets; admin sees all)
 * POST   /api/support/tickets                  — create new ticket
 * GET    /api/support/tickets/:id              — single ticket
 * PUT    /api/support/tickets/:id              — update ticket (status, priority, assignment)
 * GET    /api/support/tickets/:id/messages     — ticket messages
 * POST   /api/support/tickets/:id/messages     — add message to ticket
 * GET    /api/support/categories               — list support categories
 * GET    /api/support/priorities               — list priority levels
 *
 * Query params for GET /tickets:
 *   status   — filter by ticket status ('open', 'resolved', 'awaiting-investor', 'closed')
 *   category — filter by category id
 *   brand    — filter by brand
 *   priority — filter by priority
 *   origin   — filter by origin ('admin' or 'investor')
 *   page, limit
 *
 * Example:
 *   GET /api/support/tickets?status=open&category=document
 *   POST /api/support/tickets
 *   Body: { "subject": "Question about repayment", "category": "repayment", "priority": "normal", "body": "..." }
 *   POST /api/support/tickets/t-001/messages
 *   Body: { "body": "Here is my reply..." }
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  SUPPORT_TICKETS,
  SUPPORT_CATEGORIES,
  SUPPORT_PRIORITIES
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

function canAccessTicket(req, ticket) {
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'investor' && ticket.investorId === req.user.investorId) return true;
  return false;
}

// ---------------------------------------------------------------------------
// GET /api/support/categories
// ---------------------------------------------------------------------------
router.get('/categories', (req, res) => {
  res.json({ data: SUPPORT_CATEGORIES, meta: { total: SUPPORT_CATEGORIES.length } });
});

// ---------------------------------------------------------------------------
// GET /api/support/priorities
// ---------------------------------------------------------------------------
router.get('/priorities', (req, res) => {
  res.json({ data: SUPPORT_PRIORITIES, meta: { total: SUPPORT_PRIORITIES.length } });
});

// ---------------------------------------------------------------------------
// GET /api/support/tickets
// ---------------------------------------------------------------------------
router.get('/tickets', (req, res) => {
  const { status, category, brand, priority, origin, page = 1, limit = 20 } = req.query;
  const pageNum  = parseInt(page, 10)  || 1;
  const limitNum = parseInt(limit, 10) || 20;

  let results = [...SUPPORT_TICKETS];

  // Non-admin users only see their own tickets
  if (req.user.role !== 'admin') {
    results = results.filter(t => t.investorId === req.user.investorId);
  }

  if (status)   results = results.filter(t => t.status   === status);
  if (category) results = results.filter(t => t.category === category);
  if (brand)    results = results.filter(t => t.brand    === brand);
  if (priority) results = results.filter(t => t.priority === priority);
  if (origin)   results = results.filter(t => t.origin   === origin);

  // Strip message bodies from list view for performance
  const stripped = results.map(({ messages, ...t }) => ({
    ...t,
    messageCount: messages ? messages.length : 0,
    lastMessage:  messages && messages.length ? messages[messages.length - 1] : null
  }));

  const p = paginateArray(stripped, pageNum, limitNum);

  res.json({
    data: p.items,
    meta: { total: p.total, page: p.page, limit: p.limit, pages: p.pages }
  });
});

// ---------------------------------------------------------------------------
// POST /api/support/tickets
// ---------------------------------------------------------------------------
router.post(
  '/tickets',
  [
    body('subject').isLength({ min: 3, max: 200 }).withMessage('Subject must be 3–200 chars'),
    body('category').isString().withMessage('Category required'),
    body('body').isLength({ min: 10, max: 5000 }).withMessage('Message body must be 10–5000 chars'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('brand').optional().isString(),
    body('project').optional().isString()
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const categoryExists = SUPPORT_CATEGORIES.find(c => c.id === req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ error: `Unknown category: ${req.body.category}`, code: 'INVALID_CATEGORY' });
      }

      const ticket = {
        id:          uuidv4(),
        investorId:  req.user.investorId || null,
        category:    req.body.category,
        subject:     req.body.subject,
        priority:    req.body.priority || 'normal',
        status:      'open',
        brand:       req.body.brand   || null,
        project:     req.body.project || null,
        assignedTo:  null,
        origin:      req.user.role === 'investor' ? 'investor' : 'admin',
        createdAt:   new Date().toISOString(),
        updatedAt:   new Date().toISOString(),
        messages: [
          {
            id:          uuidv4(),
            author:      req.user.role,
            name:        req.user.name,
            body:        req.body.body,
            time:        new Date().toISOString(),
            attachments: [],
            unread:      false
          }
        ]
      };

      SUPPORT_TICKETS.push(ticket);

      res.status(201).json({ data: ticket });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/support/tickets/:id
// ---------------------------------------------------------------------------
router.get('/tickets/:id', (req, res, next) => {
  const ticket = SUPPORT_TICKETS.find(t => t.id === req.params.id);
  if (!ticket) return next(createError(404, `Ticket '${req.params.id}' not found`, 'TICKET_NOT_FOUND'));

  if (!canAccessTicket(req, ticket)) {
    return next(createError(403, 'Access denied', 'FORBIDDEN'));
  }

  res.json({ data: ticket });
});

// ---------------------------------------------------------------------------
// PUT /api/support/tickets/:id
// ---------------------------------------------------------------------------
router.put(
  '/tickets/:id',
  [
    body('status').optional().isIn(['open', 'resolved', 'awaiting-investor', 'closed', 'in-progress']),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('assignedTo').optional().isString()
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const idx = SUPPORT_TICKETS.findIndex(t => t.id === req.params.id);
      if (idx === -1) return next(createError(404, `Ticket '${req.params.id}' not found`, 'TICKET_NOT_FOUND'));

      if (!canAccessTicket(req, SUPPORT_TICKETS[idx])) {
        return next(createError(403, 'Access denied', 'FORBIDDEN'));
      }

      // Investors can only close their own tickets; admins can do anything
      const allowedFields = req.user.role === 'admin'
        ? ['status', 'priority', 'assignedTo', 'brand', 'project']
        : ['status'];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) SUPPORT_TICKETS[idx][field] = req.body[field];
      });

      SUPPORT_TICKETS[idx].updatedAt = new Date().toISOString();

      res.json({ data: SUPPORT_TICKETS[idx] });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/support/tickets/:id/messages
// ---------------------------------------------------------------------------
router.get('/tickets/:id/messages', (req, res, next) => {
  const ticket = SUPPORT_TICKETS.find(t => t.id === req.params.id);
  if (!ticket) return next(createError(404, `Ticket '${req.params.id}' not found`, 'TICKET_NOT_FOUND'));

  if (!canAccessTicket(req, ticket)) {
    return next(createError(403, 'Access denied', 'FORBIDDEN'));
  }

  res.json({
    data: ticket.messages || [],
    meta: { total: (ticket.messages || []).length, ticketId: req.params.id }
  });
});

// ---------------------------------------------------------------------------
// POST /api/support/tickets/:id/messages
// ---------------------------------------------------------------------------
router.post(
  '/tickets/:id/messages',
  [body('body').isLength({ min: 1, max: 5000 }).withMessage('Message body required')],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const idx = SUPPORT_TICKETS.findIndex(t => t.id === req.params.id);
      if (idx === -1) return next(createError(404, `Ticket '${req.params.id}' not found`, 'TICKET_NOT_FOUND'));

      if (!canAccessTicket(req, SUPPORT_TICKETS[idx])) {
        return next(createError(403, 'Access denied', 'FORBIDDEN'));
      }

      const message = {
        id:          uuidv4(),
        author:      req.user.role,
        name:        req.user.name,
        body:        req.body.body,
        time:        new Date().toISOString(),
        attachments: req.body.attachments || [],
        unread:      true
      };

      SUPPORT_TICKETS[idx].messages = [...(SUPPORT_TICKETS[idx].messages || []), message];
      SUPPORT_TICKETS[idx].updatedAt = new Date().toISOString();

      // Auto-reopen resolved tickets when investor replies
      if (SUPPORT_TICKETS[idx].status === 'resolved' && req.user.role === 'investor') {
        SUPPORT_TICKETS[idx].status = 'open';
      }
      // Set to awaiting-investor when admin replies
      if (req.user.role === 'admin') {
        SUPPORT_TICKETS[idx].status = 'awaiting-investor';
      }

      res.status(201).json({ data: message });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
