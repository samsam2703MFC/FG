'use strict';

/**
 * Onboarding Routes — /api/onboarding
 *
 * GET  /api/onboarding/:id               — get onboarding record + full journey
 * POST /api/onboarding/:id/steps/:stepId/advance  — advance step to DONE, activate next
 * POST /api/onboarding/:id/items/:itemId/toggle   — toggle item done state
 * POST /api/onboarding/:id/items/:itemId/upload   — mark document uploaded
 * POST /api/onboarding/:id/notes                  — add a note to the journey
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { ONBOARDING_RECORDS, ONBOARDING_JOURNEYS } = require('../data/seed');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function findRecord(id) {
  return ONBOARDING_RECORDS.find(r => r.id === id) || null;
}

function findJourney(id) {
  return ONBOARDING_JOURNEYS[id] || null;
}

function findItem(journey, itemId) {
  for (const step of journey.steps) {
    for (const section of step.sections) {
      const item = section.items.find(i => i.id === itemId);
      if (item) return { item, section, step };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// GET /api/onboarding/:id
// ---------------------------------------------------------------------------
router.get('/:id', authenticate, authorize('admin', 'consultant'), (req, res, next) => {
  const record = findRecord(req.params.id);
  if (!record) return next(createError(404, `Onboarding record '${req.params.id}' not found`, 'NOT_FOUND'));

  const journey = findJourney(req.params.id);

  // Compute total progress across all steps
  let totalRequired = 0, totalDone = 0;
  if (journey) {
    for (const step of journey.steps) {
      for (const section of step.sections) {
        for (const item of section.items) {
          if (item.required) {
            totalRequired++;
            if (item.done || item.uploaded) totalDone++;
          }
        }
      }
    }
  }

  res.json({
    data: {
      record,
      journey: journey ? journey.steps : [],
      progress: { totalRequired, totalDone, pct: totalRequired > 0 ? Math.round((totalDone / totalRequired) * 100) : 0 }
    }
  });
});

// ---------------------------------------------------------------------------
// POST /api/onboarding/:id/items/:itemId/toggle
// ---------------------------------------------------------------------------
router.post('/:id/items/:itemId/toggle', authenticate, authorize('admin', 'consultant'), (req, res, next) => {
  const record = findRecord(req.params.id);
  if (!record) return next(createError(404, 'Onboarding record not found', 'NOT_FOUND'));

  const journey = findJourney(req.params.id);
  if (!journey) return next(createError(404, 'Journey not found', 'JOURNEY_NOT_FOUND'));

  const found = findItem(journey, req.params.itemId);
  if (!found) return next(createError(404, 'Item not found', 'ITEM_NOT_FOUND'));

  found.item.done = !found.item.done;

  res.json({ data: { id: found.item.id, done: found.item.done } });
});

// ---------------------------------------------------------------------------
// POST /api/onboarding/:id/items/:itemId/upload
// ---------------------------------------------------------------------------
router.post('/:id/items/:itemId/upload', authenticate, authorize('admin', 'consultant'), (req, res, next) => {
  const record = findRecord(req.params.id);
  if (!record) return next(createError(404, 'Onboarding record not found', 'NOT_FOUND'));

  const journey = findJourney(req.params.id);
  if (!journey) return next(createError(404, 'Journey not found', 'JOURNEY_NOT_FOUND'));

  const found = findItem(journey, req.params.itemId);
  if (!found) return next(createError(404, 'Item not found', 'ITEM_NOT_FOUND'));

  found.item.uploaded = true;
  found.item.done = true;

  res.json({ data: { id: found.item.id, uploaded: true, done: true } });
});

// ---------------------------------------------------------------------------
// POST /api/onboarding/:id/steps/:stepId/advance
// Marks step as DONE, advances to next step (sets it ACTIVE)
// ---------------------------------------------------------------------------
router.post('/:id/steps/:stepId/advance', authenticate, authorize('admin', 'consultant'), (req, res, next) => {
  const record = findRecord(req.params.id);
  if (!record) return next(createError(404, 'Onboarding record not found', 'NOT_FOUND'));

  const journey = findJourney(req.params.id);
  if (!journey) return next(createError(404, 'Journey not found', 'JOURNEY_NOT_FOUND'));

  const stepIdx = journey.steps.findIndex(s => s.id === req.params.stepId);
  if (stepIdx === -1) return next(createError(404, 'Step not found', 'STEP_NOT_FOUND'));

  const step = journey.steps[stepIdx];

  // Verify all required items are done
  for (const section of step.sections) {
    for (const item of section.items) {
      if (item.required && !item.done && !item.uploaded) {
        return res.status(422).json({
          error: `Item "${item.label}" is required and not completed`,
          code: 'INCOMPLETE_STEP'
        });
      }
    }
  }

  step.status = 'DONE';

  const next_step = journey.steps[stepIdx + 1];
  if (next_step && next_step.status === 'PENDING') {
    next_step.status = 'ACTIVE';
    record.currentStepCode = next_step.code;
  }

  res.json({
    data: {
      stepId: step.id,
      stepStatus: 'DONE',
      nextStepId: next_step ? next_step.id : null,
      nextStepCode: next_step ? next_step.code : null
    }
  });
});

// ---------------------------------------------------------------------------
// POST /api/onboarding/:id/items/:itemId/notes
// ---------------------------------------------------------------------------
router.post(
  '/:id/items/:itemId/notes',
  authenticate,
  authorize('admin', 'consultant'),
  [body('content').isString().isLength({ min: 1, max: 2000 })],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() });
    }

    const record = findRecord(req.params.id);
    if (!record) return next(createError(404, 'Onboarding record not found', 'NOT_FOUND'));

    const journey = findJourney(req.params.id);
    if (!journey) return next(createError(404, 'Journey not found', 'JOURNEY_NOT_FOUND'));

    const found = findItem(journey, req.params.itemId);
    if (!found) return next(createError(404, 'Item not found', 'ITEM_NOT_FOUND'));

    const note = {
      id: uuidv4(),
      authorName: req.user.name || req.user.email,
      authorInitials: (req.user.name || req.user.email).split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      content: req.body.content,
      createdAt: new Date().toISOString()
    };

    found.item.actionNotes.push(note);

    res.status(201).json({ data: note });
  }
);

module.exports = router;
