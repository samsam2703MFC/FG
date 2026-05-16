'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fg-dev-secret-change-in-production';

/**
 * authenticate — JWT Bearer token middleware.
 * Reads Authorization: Bearer <token>, verifies it, attaches req.user.
 *
 * req.user = { id, email, role, name, investorId?, consultantId? }
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
}

/**
 * authorize — role-based access control middleware factory.
 * Usage: router.get('/admin-route', authenticate, authorize('admin'), handler)
 *
 * @param {...string} roles — allowed roles (e.g. 'admin', 'consultant', 'investor')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required roles: ${roles.join(', ')}`,
        code: 'FORBIDDEN'
      });
    }
    next();
  };
}

/**
 * optionalAuth — attaches req.user if a valid token is present but does NOT
 * reject the request when no token is provided. Useful for public routes that
 * return richer data to authenticated users.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (_) {
    // ignore invalid tokens for optional routes
  }
  next();
}

/**
 * generateToken — creates a signed JWT for a user.
 * @param {object} user — user object from USERS array
 * @returns {string} signed JWT
 */
function generateToken(user) {
  const payload = {
    id:            user.id,
    email:         user.email,
    role:          user.role,
    name:          user.name,
    investorId:    user.investorId    || null,
    consultantId:  user.consultantId  || null
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

module.exports = { authenticate, authorize, optionalAuth, generateToken };
