'use strict';

/**
 * Global error handler middleware.
 * Must be mounted LAST: app.use(errorHandler)
 *
 * All errors should be forwarded via next(err).
 * Errors may include: err.status, err.code, err.message
 *
 * Response shape:
 *   { error: string, code: string, details?: any }
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Log in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err.stack || err.message || err);
  }

  // Express body-parser / JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON'
    });
  }

  // express-validator errors forwarded as { status: 422, errors: [...] }
  if (err.status === 422 && err.errors) {
    return res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      code: 'FILE_TOO_LARGE'
    });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file field',
      code: 'UNEXPECTED_FILE'
    });
  }

  // JWT errors (should normally be caught in auth middleware, but just in case)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }

  // Application-level errors thrown with new Error() + err.status
  const status  = err.status  || err.statusCode || 500;
  const code    = err.code    || (status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');
  const message = err.message || 'An unexpected error occurred';

  res.status(status).json({
    error: message,
    code
  });
}

/**
 * notFoundHandler — 404 catch-all middleware.
 * Mount BEFORE errorHandler and AFTER all routes.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'NOT_FOUND'
  });
}

/**
 * createError — helper to create a structured error.
 * @param {number} status  HTTP status code
 * @param {string} message Human-readable message
 * @param {string} code    Machine-readable code
 */
function createError(status, message, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code || 'ERROR';
  return err;
}

module.exports = { errorHandler, notFoundHandler, createError };
