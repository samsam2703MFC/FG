'use strict';

/**
 * Backoffice Routes — /api/backoffice
 *
 * GET  /api/backoffice/dashboard — aggregate KPIs: counts, pipeline stats, network growth
 * GET  /api/backoffice/stats     — detailed time-series stats for charts
 *
 * Admin-only. All routes require the 'admin' role.
 *
 * Example:
 *   GET /api/backoffice/dashboard
 *
 * Response includes:
 *   - Network summary (brands, shops, investors, total invested)
 *   - Lead pipeline breakdown by step
 *   - Open opportunities summary
 *   - Document compliance stats
 *   - Support ticket stats
 *   - Brand-level KPI snapshots
 */

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  BRANDS,
  SHOPS,
  INVESTORS,
  CANDIDATES,
  CANDIDATE_LEADS,
  LEAD_STEPS,
  FG_OPPORTUNITIES,
  ONBOARDING_OPPORTUNITIES,
  FG_DOCS,
  SUPPORT_TICKETS,
  NOTIFICATIONS,
  CONSULTANTS,
  DEVELOPERS,
  BRAND_PORTFOLIOS,
  REPAYMENTS
} = require('../data/seed');

const router = express.Router();

router.use(authenticate, authorize('admin'));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function countBy(arr, key) {
  return arr.reduce((acc, item) => {
    const val = item[key] || 'unknown';
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

// ---------------------------------------------------------------------------
// GET /api/backoffice/dashboard
// ---------------------------------------------------------------------------
router.get('/dashboard', (req, res) => {
  // ---- Network Overview ----
  const totalInvested = INVESTORS.reduce((s, i) => s + (i.totalInvested || 0), 0);
  const totalRepaid   = INVESTORS.reduce((s, i) => s + (i.totalRepaid   || 0), 0);

  const networkOverview = {
    brandsCount:     BRANDS.length,
    shopsCount:      SHOPS.length,
    investorsCount:  INVESTORS.length,
    candidatesCount: CANDIDATES.length,
    leadsCount:      CANDIDATE_LEADS.length,
    consultantsCount: CONSULTANTS.length,
    developersCount: DEVELOPERS.length,
    totalInvested,
    totalRepaid,
    totalOutstanding: totalInvested - totalRepaid
  };

  // ---- Lead Pipeline ----
  const activeLeads = CANDIDATE_LEADS.filter(l => l.status !== 'archived');
  const pipelineByStep = LEAD_STEPS.map(step => ({
    step:  step.id,
    label: step.label,
    count: activeLeads.filter(l => l.currentStep === step.id).length
  }));

  const pipelineByPriority = countBy(activeLeads, 'priority');

  const pipelineStats = {
    total:       activeLeads.length,
    byStep:      pipelineByStep,
    byPriority:  pipelineByPriority,
    highPriority: activeLeads.filter(l => l.priority === 'high').length,
    awaitingContact: activeLeads.filter(l =>
      l.currentStep === 'interested' || l.currentStep === 'consultant-review'
    ).length,
    inCommittee: activeLeads.filter(l => l.currentStep === 'committee').length
  };

  // ---- Opportunities ----
  const openOpps = FG_OPPORTUNITIES.filter(o => o.status === 'open');
  const totalTarget = openOpps.reduce((s, o) => s + (o.target || 0), 0);
  const totalRaised = openOpps.reduce((s, o) => s + (o.raised || 0), 0);

  const opportunitiesStats = {
    openFinancingRounds:     openOpps.length,
    openOnboardingOpps:      ONBOARDING_OPPORTUNITIES.filter(o => o.status !== 'closed').length,
    totalTargetAcrossRounds: totalTarget,
    totalRaisedAcrossRounds: totalRaised,
    fillRatePct: totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0,
    closingSoon: openOpps.filter(o => o.closingDays && o.closingDays <= 14).length
  };

  // ---- Documents ----
  const docsByStatus = countBy(FG_DOCS, 'status');
  const documentStats = {
    total:       FG_DOCS.length,
    byStatus:    docsByStatus,
    pending:     docsByStatus['pending']  || 0,
    expired:     docsByStatus['expired']  || 0,
    missing:     docsByStatus['missing']  || 0,
    needsAction: (docsByStatus['pending'] || 0) + (docsByStatus['expired'] || 0) + (docsByStatus['missing'] || 0)
  };

  // ---- Support ----
  const ticketsByStatus = countBy(SUPPORT_TICKETS, 'status');
  const supportStats = {
    total:           SUPPORT_TICKETS.length,
    byStatus:        ticketsByStatus,
    open:            ticketsByStatus['open'] || 0,
    awaitingInvestor: ticketsByStatus['awaiting-investor'] || 0,
    resolved:        ticketsByStatus['resolved'] || 0
  };

  // ---- Brand Snapshots ----
  const brandSnapshots = BRANDS.map(brand => {
    const portfolio = BRAND_PORTFOLIOS[brand.id];
    const brandShops = SHOPS.filter(s => s.brand === brand.id);
    const brandOpps  = FG_OPPORTUNITIES.filter(o => o.brand === brand.id);
    return {
      id:           brand.id,
      name:         brand.name,
      shopCount:    brandShops.length,
      openOpps:     brandOpps.filter(o => o.status === 'open').length,
      summary:      portfolio ? portfolio.summary : null
    };
  });

  // ---- Repayments ----
  const paidThisMonth = REPAYMENTS
    .filter(r => r.status === 'paid' && r.date.startsWith('2026-05'))
    .reduce((s, r) => s + r.amount, 0);

  const repaymentStats = {
    paidThisMonth,
    scheduledNext30Days: REPAYMENTS.filter(r => r.status === 'scheduled').reduce((s, r) => s + r.amount, 0)
  };

  // ---- Unread Notifications ----
  const unreadNotifs = NOTIFICATIONS.filter(n => !n.read).length;

  res.json({
    data: {
      networkOverview,
      pipelineStats,
      opportunitiesStats,
      documentStats,
      supportStats,
      repaymentStats,
      brandSnapshots,
      unreadNotifications: unreadNotifs,
      generatedAt: new Date().toISOString()
    }
  });
});

// ---------------------------------------------------------------------------
// GET /api/backoffice/stats
// ---------------------------------------------------------------------------
router.get('/stats', (req, res) => {
  // Time-series data for charts (mock monthly data points)
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  // Candidates added per month (mock trend)
  const candidatesTimeline = months.map((m, i) => ({
    month: m,
    new:   [0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0][i] || 0,
    total: [0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3][i] || 0
  }));

  // Lead conversion rates
  const closedLeads = CANDIDATE_LEADS.filter(l => l.status === 'closed' || l.currentStep === 'contract-prep').length;
  const conversionRate = CANDIDATE_LEADS.length > 0
    ? Math.round((closedLeads / CANDIDATE_LEADS.length) * 100)
    : 0;

  // Portfolio performance per brand
  const portfolioPerf = Object.entries(BRAND_PORTFOLIOS).map(([brandId, portfolio]) => ({
    brand:       brandId,
    roiTarget:   portfolio.summary.roiTarget,
    roiCurrent:  portfolio.summary.roiCurrent,
    invested:    portfolio.summary.invested,
    repaid:      portfolio.summary.repaid,
    networkSize: portfolio.summary.networkSize,
    ca12m:       portfolio.ca12m,
    budget12m:   portfolio.budget12m
  }));

  // Support ticket resolution time (mock)
  const avgResolutionHours = 36;

  res.json({
    data: {
      candidatesTimeline,
      leadConversionRate: conversionRate,
      portfolioPerformance: portfolioPerf,
      support: {
        avgResolutionHours,
        totalTickets:    SUPPORT_TICKETS.length,
        openTickets:     SUPPORT_TICKETS.filter(t => t.status === 'open').length,
        resolvedTickets: SUPPORT_TICKETS.filter(t => t.status === 'resolved').length
      },
      network: {
        totalBrands:     BRANDS.length,
        totalShops:      SHOPS.length,
        totalInvestors:  INVESTORS.length,
        totalCandidates: CANDIDATES.length,
        totalLeads:      CANDIDATE_LEADS.length
      },
      generatedAt: new Date().toISOString()
    }
  });
});

module.exports = router;
