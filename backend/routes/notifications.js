'use strict';

/**
 * Notifications Routes — /api/notifications
 *
 * GET    /api/notifications          — list notifications for current user
 * PUT    /api/notifications/:id/read — mark single notification as read
 * PUT    /api/notifications/read-all — mark all user notifications as read
 * DELETE /api/notifications/:id      — delete a notification
 *
 * Query params for GET /:
 *   kind   — filter by kind ('payment', 'opp', 'report', 'doc')
 *   brand  — filter by brand
 *   unread — 'true' | 'false' — filter by read status
 *   page, limit
 *
 * Example:
 *   GET /api/notifications?unread=true
 *   PUT /api/notifications/n1/read
 *   PUT /api/notifications/read-all
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const { NOTIFICATIONS } = require('../data/seed');
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

function getNotificationsForUser(userId, investorId) {
  // In production this would be filtered by userId/investorId from DB.
  // For the mock, all investors share the same notification feed.
  if (investorId) {
    return NOTIFICATIONS.filter(n => n.investorId === investorId || !n.investorId);
  }
  return NOTIFICATIONS;
}

// ---------------------------------------------------------------------------
// GET /api/notifications
// ---------------------------------------------------------------------------
router.get('/', (req, res) => {
  const { kind, brand, unread, page = 1, limit = 20 } = req.query;
  const pageNum  = parseInt(page, 10)  || 1;
  const limitNum = parseInt(limit, 10) || 20;

  let results = getNotificationsForUser(req.user.id, req.user.investorId);

  if (kind)   results = results.filter(n => n.kind  === kind);
  if (brand)  results = results.filter(n => n.brand === brand);
  if (unread !== undefined) {
    const isUnread = unread === 'true';
    results = results.filter(n => n.read === !isUnread);
  }

  // Sort by createdAt desc
  results = [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const p = paginateArray(results, pageNum, limitNum);
  const unreadCount = getNotificationsForUser(req.user.id, req.user.investorId).filter(n => !n.read).length;

  res.json({
    data: p.items,
    meta: {
      total:        p.total,
      page:         p.page,
      limit:        p.limit,
      pages:        p.pages,
      unreadCount
    }
  });
});

// ---------------------------------------------------------------------------
// PUT /api/notifications/read-all
// NOTE: This route must come BEFORE /:id/read to avoid 'read-all' being
//       interpreted as an id.
// ---------------------------------------------------------------------------
router.put('/read-all', (req, res) => {
  const userNotifs = getNotificationsForUser(req.user.id, req.user.investorId);
  let marked = 0;

  userNotifs.forEach(n => {
    if (!n.read) {
      const idx = NOTIFICATIONS.findIndex(notif => notif.id === n.id);
      if (idx !== -1) {
        NOTIFICATIONS[idx].read = true;
        NOTIFICATIONS[idx].readAt = new Date().toISOString();
        marked++;
      }
    }
  });

  res.json({
    data: { marked },
    meta: { message: `${marked} notification(s) marked as read` }
  });
});

// ---------------------------------------------------------------------------
// PUT /api/notifications/:id/read
// ---------------------------------------------------------------------------
router.put('/:id/read', (req, res, next) => {
  const idx = NOTIFICATIONS.findIndex(n => n.id === req.params.id);
  if (idx === -1) return next(createError(404, `Notification '${req.params.id}' not found`, 'NOTIFICATION_NOT_FOUND'));

  NOTIFICATIONS[idx].read  = true;
  NOTIFICATIONS[idx].readAt = new Date().toISOString();

  res.json({ data: { id: req.params.id, read: true, readAt: NOTIFICATIONS[idx].readAt } });
});

// ---------------------------------------------------------------------------
// DELETE /api/notifications/:id
// ---------------------------------------------------------------------------
router.delete('/:id', (req, res, next) => {
  const idx = NOTIFICATIONS.findIndex(n => n.id === req.params.id);
  if (idx === -1) return next(createError(404, `Notification '${req.params.id}' not found`, 'NOTIFICATION_NOT_FOUND'));

  NOTIFICATIONS.splice(idx, 1);

  res.json({
    data: { id: req.params.id },
    meta: { message: 'Notification deleted' }
  });
});

module.exports = router;
