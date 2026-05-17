'use strict';

const { v4: uuidv4 } = require('uuid');
const { JOURNEY_TEMPLATE } = require('../data/journeyTemplate');

// Steps 1-5 are pre-validated (candidate passed the selection process)
const DONE_STEP_CODES  = new Set(['s1', 's2', 's3', 's4', 's5']);
const ACTIVE_STEP_CODE = 's6';

function deepCloneTemplate() {
  return JOURNEY_TEMPLATE.map(stepTpl => {
    const isActive = stepTpl.code === ACTIVE_STEP_CODE;
    const isDone   = DONE_STEP_CODES.has(stepTpl.code);

    const sections = stepTpl.sections.map(secTpl => {
      const items = (secTpl.items || []).map(itemTpl => ({
        id:         uuidv4(),
        code:       itemTpl.code,
        code2:      itemTpl.code2 || null,
        label:      itemTpl.label,
        required:   itemTpl.required !== false,
        done:       isDone,  // all items done for completed steps
        uploaded:   isDone && (secTpl.type === 'DOCUMENTS' || secTpl.type === 'PAYMENT'),
        meta:       itemTpl.meta   || null,
        hint:       itemTpl.hint   || null,
        actionType: itemTpl.actionType || null,
        fileName:   itemTpl.fileName   || null,
        icon:       itemTpl.icon       || null,
        actionNotes: [],
      }));

      return {
        id:           uuidv4(),
        code:         secTpl.code,
        ordinal:      secTpl.ordinal,
        type:         secTpl.type,
        title:        secTpl.title,
        paymentAmount: secTpl.paymentAmount || null,
        paymentRef:   secTpl.paymentRef    || null,
        paymentLabel: secTpl.paymentLabel  || null,
        gateName:     secTpl.gateName      || null,
        gateDesc:     secTpl.gateDesc      || null,
        items,
      };
    });

    return {
      id:          uuidv4(),
      code:        stepTpl.code,
      ordinal:     stepTpl.ordinal,
      category:    stepTpl.category,
      title:       stepTpl.title,
      description: stepTpl.description,
      weekOffset:  stepTpl.weekOffset,
      weekStartNum: stepTpl.weekStartNum,
      weekEndNum:  stepTpl.weekEndNum,
      budgetCents:          stepTpl.budgetCents          || 0,
      budgetBrandCents:     stepTpl.budgetBrandCents     || 0,
      budgetCandidateCents: stepTpl.budgetCandidateCents || 0,
      phaseColor:  stepTpl.phaseColor || null,
      status:      isDone ? 'DONE' : isActive ? 'ACTIVE' : 'PENDING',
      sections,
    };
  });
}

function createJourney(onboardingId) {
  const steps = deepCloneTemplate();
  return { onboardingId, steps, createdAt: new Date().toISOString() };
}

module.exports = { createJourney };
