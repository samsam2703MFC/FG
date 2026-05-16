'use strict';

/**
 * Landing Routes — /api/landing
 *
 * GET  /api/landing            — full landing page content (hero, pillars, whoAreYou,
 *                                portals, currentOpportunities, ecosystemTeaser, join, finalCta)
 * GET  /api/landing/hero       — hero section only
 * GET  /api/landing/pillars    — key metrics pillars
 * GET  /api/landing/opportunities — current opportunities with live data
 *
 * These are public routes — no authentication required.
 *
 * Example:
 *   GET /api/landing
 *   GET /api/landing/opportunities
 */

const express = require('express');
const { LANDING, ONBOARDING_OPPORTUNITIES, BRANDS } = require('../data/seed');

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/landing
// ---------------------------------------------------------------------------
router.get('/', (req, res) => {
  res.json({ data: LANDING });
});

// ---------------------------------------------------------------------------
// GET /api/landing/hero
// ---------------------------------------------------------------------------
router.get('/hero', (req, res) => {
  res.json({ data: LANDING.hero });
});

// ---------------------------------------------------------------------------
// GET /api/landing/pillars
// ---------------------------------------------------------------------------
router.get('/pillars', (req, res) => {
  res.json({ data: LANDING.pillars, meta: { total: LANDING.pillars.length } });
});

// ---------------------------------------------------------------------------
// GET /api/landing/who
// ---------------------------------------------------------------------------
router.get('/who', (req, res) => {
  res.json({ data: LANDING.whoAreYou });
});

// ---------------------------------------------------------------------------
// GET /api/landing/portals
// ---------------------------------------------------------------------------
router.get('/portals', (req, res) => {
  res.json({ data: LANDING.portals, meta: { total: LANDING.portals.length } });
});

// ---------------------------------------------------------------------------
// GET /api/landing/opportunities
// Routes current opportunities with live raise data from ONBOARDING_OPPORTUNITIES
// ---------------------------------------------------------------------------
router.get('/opportunities', (req, res) => {
  // Return the highlighted opportunities with their badges
  const badges = LANDING.currentOpportunities.badges;
  const opps = ONBOARDING_OPPORTUNITIES
    .filter(o => badges[o.id])
    .map(o => ({
      ...o,
      badge: badges[o.id],
      brandDetail: BRANDS.find(b => b.id === o.brand) || null
    }));

  res.json({
    data: {
      title:  LANDING.currentOpportunities.title,
      sub:    LANDING.currentOpportunities.sub,
      items:  opps
    },
    meta: { total: opps.length }
  });
});

// ---------------------------------------------------------------------------
// GET /api/landing/ecosystem
// ---------------------------------------------------------------------------
router.get('/ecosystem', (req, res) => {
  res.json({ data: LANDING.ecosystemTeaser });
});

// ---------------------------------------------------------------------------
// GET /api/landing/join
// ---------------------------------------------------------------------------
router.get('/join', (req, res) => {
  res.json({ data: LANDING.join });
});

// ---------------------------------------------------------------------------
// GET /api/landing/onboarding
// ---------------------------------------------------------------------------
router.get('/onboarding', (req, res) => {
  res.json({ data: LANDING.investorOnboarding });
});

module.exports = router;
