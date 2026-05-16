'use strict';

// Run with: node --test backend/tests/validate-opportunity.test.js

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateOpportunity } = require('../services/validateOpportunity');

function makeCollections(overrides = {}) {
  return {
    ONBOARDING_OPPORTUNITIES: [
      {
        id: 'op-test-1',
        brand: 'atelier',
        name: "L'Atelier Test",
        status: 'En recherche candidat'
      },
      {
        id: 'op-test-2',
        brand: 'couq',
        name: 'Couq Test',
        status: 'En recherche candidat'
      }
    ],
    CANDIDATE_LEADS: [
      {
        id: 'lead-a',
        opportunity: 'op-test-1',
        candidate: { name: 'Alice Martin', email: 'alice@example.com' },
        assignedTo: { name: 'Sophie Renard', role: 'Consultante' }
      },
      {
        id: 'lead-b',
        opportunity: 'op-test-1',
        candidate: { name: 'Bob Dupont', email: 'bob@example.com' },
        assignedTo: { name: 'Karim Boulahia', role: 'Consultant' }
      },
      {
        id: 'lead-c',
        opportunity: 'op-test-1',
        candidate: { name: 'Clara Petit', email: 'clara@example.com' },
        assignedTo: null
      },
      {
        id: 'lead-solo',
        opportunity: 'op-test-2',
        candidate: { name: 'Denis Leroy', email: 'denis@example.com' },
        assignedTo: { name: 'Lara Wauters', role: 'Consultante' }
      }
    ],
    ONBOARDING_RECORDS: [],
    CRM_TASKS: [],
    AUDIT_LOG: [],
    ...overrides
  };
}

test('happy path — closes opp, creates onboarding record, N-1 CRM tasks, audit entry', () => {
  const collections = makeCollections();

  const result = validateOpportunity({
    oppId: 'op-test-1',
    candidateId: 'lead-a',
    validatedBy: 'admin@fg.be',
    collections
  });

  // Return shape
  assert.ok(result.onboardingRecord);
  assert.equal(result.crmTasksCreated, 2);
  assert.equal(result.opportunity.id, 'op-test-1');
  assert.equal(result.opportunity.status, 'closed-won');
  assert.equal(result.opportunity.validatedCandidateId, 'lead-a');
  assert.ok(result.opportunity.validatedAt);

  // Onboarding record shape
  const rec = result.onboardingRecord;
  assert.ok(rec.id);
  assert.equal(rec.opportunityId, 'op-test-1');
  assert.equal(rec.candidateId, 'lead-a');
  assert.equal(rec.candidateName, 'Alice Martin');
  assert.equal(rec.brand, 'atelier');
  assert.equal(rec.stage, 'préparation contrat');
  assert.equal(rec.validatedBy, 'admin@fg.be');
  assert.equal(rec.status, 'active');

  // Persisted to collections
  assert.equal(collections.ONBOARDING_RECORDS.length, 1);
  assert.equal(collections.CRM_TASKS.length, 2);
  assert.equal(collections.AUDIT_LOG.length, 1);

  // CRM tasks reference losers
  const loserIds = collections.CRM_TASKS.map(t => t.candidateId);
  assert.ok(loserIds.includes('lead-b'));
  assert.ok(loserIds.includes('lead-c'));

  // CRM task shape
  const task = collections.CRM_TASKS[0];
  assert.equal(task.type, 'Rappel — opportunité clôturée');
  assert.equal(task.opportunityId, 'op-test-1');
  assert.equal(task.status, 'pending');
  assert.ok(task.dueAt);
  assert.ok(task.note.includes("L'Atelier Test"));
  assert.ok(task.note.includes('Alice Martin'));

  // Audit log entry
  const entry = collections.AUDIT_LOG[0];
  assert.equal(entry.action, 'opportunity.validate');
  assert.equal(entry.entityType, 'opportunity');
  assert.equal(entry.entityId, 'op-test-1');
  assert.equal(entry.performedBy, 'admin@fg.be');
  assert.equal(entry.data.candidateId, 'lead-a');
  assert.equal(entry.data.losersCount, 2);
  assert.equal(entry.data.crmTasksCreated, 2);

  // Opportunity mutated in-place
  const opp = collections.ONBOARDING_OPPORTUNITIES.find(o => o.id === 'op-test-1');
  assert.equal(opp.status, 'closed-won');
  assert.equal(opp.validatedCandidateId, 'lead-a');
  assert.equal(opp.validatedBy, 'admin@fg.be');
});

test('already-closed — throws ALREADY_CLOSED (409)', () => {
  const collections = makeCollections({
    ONBOARDING_OPPORTUNITIES: [
      { id: 'op-test-1', brand: 'atelier', name: "L'Atelier Test", status: 'closed-won' }
    ]
  });

  assert.throws(
    () => validateOpportunity({ oppId: 'op-test-1', candidateId: 'lead-a', validatedBy: 'admin@fg.be', collections }),
    err => {
      assert.equal(err.code, 'ALREADY_CLOSED');
      assert.equal(err.status, 409);
      return true;
    }
  );
});

test('opportunity not found — throws NOT_FOUND (404)', () => {
  const collections = makeCollections();

  assert.throws(
    () => validateOpportunity({ oppId: 'op-does-not-exist', candidateId: 'lead-a', validatedBy: 'admin@fg.be', collections }),
    err => {
      assert.equal(err.code, 'NOT_FOUND');
      assert.equal(err.status, 404);
      return true;
    }
  );
});

test('candidate not found for opportunity — throws CANDIDATE_NOT_FOUND (404)', () => {
  const collections = makeCollections();

  assert.throws(
    () => validateOpportunity({ oppId: 'op-test-1', candidateId: 'lead-solo', validatedBy: 'admin@fg.be', collections }),
    err => {
      assert.equal(err.code, 'CANDIDATE_NOT_FOUND');
      assert.equal(err.status, 404);
      return true;
    }
  );
});

test('idempotent — second call on closed opp throws 409, state unchanged', () => {
  const collections = makeCollections();

  validateOpportunity({ oppId: 'op-test-1', candidateId: 'lead-a', validatedBy: 'admin@fg.be', collections });

  const recordsAfterFirst = collections.ONBOARDING_RECORDS.length;
  const tasksAfterFirst   = collections.CRM_TASKS.length;
  const auditAfterFirst   = collections.AUDIT_LOG.length;

  assert.throws(
    () => validateOpportunity({ oppId: 'op-test-1', candidateId: 'lead-a', validatedBy: 'admin@fg.be', collections }),
    err => {
      assert.equal(err.code, 'ALREADY_CLOSED');
      assert.equal(err.status, 409);
      return true;
    }
  );

  assert.equal(collections.ONBOARDING_RECORDS.length, recordsAfterFirst);
  assert.equal(collections.CRM_TASKS.length, tasksAfterFirst);
  assert.equal(collections.AUDIT_LOG.length, auditAfterFirst);
});

test('solo winner — 0 CRM tasks when winner is the only candidate', () => {
  const collections = makeCollections();

  const result = validateOpportunity({
    oppId: 'op-test-2',
    candidateId: 'lead-solo',
    validatedBy: 'consultant@fg.be',
    collections
  });

  assert.equal(result.crmTasksCreated, 0);
  assert.equal(collections.CRM_TASKS.length, 0);
  assert.equal(collections.ONBOARDING_RECORDS.length, 1);
  assert.equal(collections.AUDIT_LOG[0].data.losersCount, 0);
  assert.equal(collections.AUDIT_LOG[0].data.crmTasksCreated, 0);
});
