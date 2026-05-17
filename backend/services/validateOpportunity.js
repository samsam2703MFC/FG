'use strict';

const { v4: uuidv4 } = require('uuid');
const { createJourney } = require('./createJourney');

function addBusinessDays(date, days) {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

function createError(status, message, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

function validateOpportunity({ oppId, candidateId, validatedBy, collections }) {
  const { ONBOARDING_OPPORTUNITIES, CANDIDATE_LEADS, ONBOARDING_RECORDS, CRM_TASKS, AUDIT_LOG, ONBOARDING_JOURNEYS } = collections;

  const opp = ONBOARDING_OPPORTUNITIES.find(o => o.id === oppId);
  if (!opp) throw createError(404, `Opportunity '${oppId}' not found`, 'NOT_FOUND');

  if (opp.status === 'closed-won') {
    throw createError(409, `Opportunity '${oppId}' is already closed`, 'ALREADY_CLOSED');
  }

  const winner = CANDIDATE_LEADS.find(l => l.id === candidateId && l.opportunity === oppId);
  if (!winner) {
    throw createError(404, `Candidate lead '${candidateId}' not found for opportunity '${oppId}'`, 'CANDIDATE_NOT_FOUND');
  }

  const losers = CANDIDATE_LEADS.filter(l => l.opportunity === oppId && l.id !== candidateId);

  const now = new Date();

  const onboardingId = uuidv4();
  const onboardingRecord = {
    id: onboardingId,
    opportunityId: oppId,
    opportunityName: opp.name,
    opportunityCity: opp.city || opp.location || null,
    candidateId,
    candidateName: winner.candidate.name,
    candidateEmail: winner.candidate.email || null,
    candidatePhone: winner.candidate.phone || null,
    brand: opp.brand,
    targetOpenDate: opp.targetOpenDate || null,
    stage: 'préparation contrat',
    currentStepCode: 's6',
    validatedBy,
    createdAt: now.toISOString(),
    status: 'active'
  };
  ONBOARDING_RECORDS.push(onboardingRecord);

  // Create full franchise journey for this candidate
  if (ONBOARDING_JOURNEYS) {
    const journey = createJourney(onboardingId);
    ONBOARDING_JOURNEYS[onboardingId] = journey;
  }

  const crmTasks = losers.map(l => ({
    id: uuidv4(),
    type: 'Rappel — opportunité clôturée',
    candidateId: l.id,
    candidateName: l.candidate.name,
    opportunityId: oppId,
    assignedTo: l.assignedTo?.name || validatedBy,
    status: 'pending',
    dueAt: addBusinessDays(now, 3).toISOString(),
    createdAt: now.toISOString(),
    note: `L'opportunité ${opp.name} a été attribuée à ${winner.candidate.name}.`
  }));
  crmTasks.forEach(t => CRM_TASKS.push(t));

  opp.status = 'closed-won';
  opp.validatedCandidateId = candidateId;
  opp.validatedBy = validatedBy;
  opp.validatedAt = now.toISOString();

  AUDIT_LOG.push({
    id: uuidv4(),
    action: 'opportunity.validate',
    entityType: 'opportunity',
    entityId: oppId,
    performedBy: validatedBy,
    at: now.toISOString(),
    data: {
      candidateId,
      candidateName: winner.candidate.name,
      losersCount: losers.length,
      crmTasksCreated: crmTasks.length
    }
  });

  return {
    onboardingRecord,
    crmTasksCreated: crmTasks.length,
    opportunity: {
      id: opp.id,
      status: opp.status,
      validatedCandidateId: opp.validatedCandidateId,
      validatedAt: opp.validatedAt
    }
  };
}

module.exports = { validateOpportunity };
