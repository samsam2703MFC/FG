'use strict';

/**
 * Auth Routes — /api/auth
 *
 * POST   /api/auth/login   — email + password → JWT + user profile
 * POST   /api/auth/logout  — invalidate session (client-side; stateless JWT)
 * GET    /api/auth/me      — current authenticated user profile
 * PUT    /api/auth/me      — update current user profile
 *
 * Example request — Login:
 *   POST /api/auth/login
 *   { "email": "claire.vermeulen@example.com", "password": "password" }
 *
 * Example response — Login:
 *   { "data": { "token": "eyJ...", "user": { "id": "user-001", "role": "investor", ... } } }
 *
 * Demo credentials (all share the same password "password"):
 *   claire.vermeulen@example.com  — investor
 *   marc.dubois@example.com       — investor
 *   admin@fg.be                   — admin
 *   sophie.renard@fg.be           — consultant
 *   karim.boulahia@fg.be          — consultant
 */

const express   = require('express');
const bcrypt    = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { authenticate, generateToken } = require('../middleware/auth');
const { USERS, INVESTORS, CONSULTANTS } = require('../data/seed');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function publicProfile(user) {
  const { passwordHash, ...safe } = user; // eslint-disable-line no-unused-vars
  return safe;
}

function enrichedProfile(user) {
  const base = publicProfile(user);
  if (user.role === 'investor' && user.investorId) {
    const inv = INVESTORS.find(i => i.id === user.investorId);
    return { ...base, investor: inv ? { ...inv, passwordHash: undefined } : null };
  }
  if (user.role === 'consultant' && user.consultantId) {
    const cons = CONSULTANTS.find(c => c.id === user.consultantId);
    return { ...base, consultant: cons || null };
  }
  return base;
}

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 1 }).withMessage('Password required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const { email, password } = req.body;

      const user = USERS.find(u => u.email === email && u.active);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
      }

      const token   = generateToken(user);
      const profile = enrichedProfile(user);

      res.json({ data: { token, user: profile } });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
router.post('/logout', authenticate, (req, res) => {
  // JWT is stateless — the client discards the token.
  // In production, add token to a denylist (Redis).
  res.json({ data: { message: 'Logged out successfully' } });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
router.get('/me', authenticate, (req, res, next) => {
  try {
    const user = USERS.find(u => u.id === req.user.id);
    if (!user) return next(createError(404, 'User not found', 'USER_NOT_FOUND'));
    res.json({ data: enrichedProfile(user) });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/auth/me
// ---------------------------------------------------------------------------
router.put(
  '/me',
  authenticate,
  [
    body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 chars'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required')
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
      }

      const userIdx = USERS.findIndex(u => u.id === req.user.id);
      if (userIdx === -1) return next(createError(404, 'User not found', 'USER_NOT_FOUND'));

      const allowed = ['name', 'phone'];
      allowed.forEach(field => {
        if (req.body[field] !== undefined) {
          USERS[userIdx][field] = req.body[field];
        }
      });

      // Also update email if not already taken
      if (req.body.email && req.body.email !== USERS[userIdx].email) {
        const taken = USERS.find(u => u.email === req.body.email && u.id !== req.user.id);
        if (taken) {
          return res.status(409).json({ error: 'Email already in use', code: 'EMAIL_CONFLICT' });
        }
        USERS[userIdx].email = req.body.email;
      }

      res.json({ data: publicProfile(USERS[userIdx]) });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
