import assert from 'node:assert/strict';
import {
  resolveChoiceContinuation,
  resolveSummaryContinuation,
} from '../domain/game/transitions.ts';
import type {
  Scenario,
  ScenarioChoice,
} from '../utils/scenarioBundle.ts';

const run = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const stableStats = {
  funds: 500,
  mental: 50,
  english: 25,
  insight: 45,
  stamina: 60,
  relation: 40,
};

const choice: ScenarioChoice = {
  text: { ko: '계속한다', en: 'Continue' },
  feedback: { ko: '진행했다', en: 'Continued' },
  statChanges: {
    funds: 0,
    mental: 0,
    english: 0,
    insight: 0,
    stamina: 0,
    relation: 0,
  },
  nextScenarioId: 2,
};

const scenario: Scenario = {
  id: 1,
  type: 'NORMAL',
  description: { ko: '장면', en: 'Scene' },
  choices: [choice],
};

run('failed stats take priority over normal navigation', () => {
  const result = resolveChoiceContinuation({
    stats: { ...stableStats, mental: 0 },
    scenario,
    choice,
    nextScenarioExists: true,
  });

  assert.deepEqual(result, { type: 'failure' });
});

run('ending scenarios finish without navigating to their choice target', () => {
  const result = resolveChoiceContinuation({
    stats: stableStats,
    scenario: { ...scenario, isEnding: true },
    choice,
    nextScenarioExists: true,
  });

  assert.deepEqual(result, { type: 'ending' });
});

run('normal scenarios advance to the selected choice target', () => {
  const result = resolveChoiceContinuation({
    stats: stableStats,
    scenario,
    choice,
    nextScenarioExists: true,
  });

  assert.deepEqual(result, { type: 'advance', nextScenarioId: 2 });
});

run('phase-end scenarios open a summary with an available next node', () => {
  const result = resolveChoiceContinuation({
    stats: stableStats,
    scenario: { ...scenario, isPhaseEnd: true },
    choice,
    nextScenarioExists: true,
  });

  assert.deepEqual(result, { type: 'summary', nextScenarioId: 2 });
});

run('phase-end scenarios keep a null target when the next node is missing', () => {
  const result = resolveChoiceContinuation({
    stats: stableStats,
    scenario: { ...scenario, isPhaseEnd: true },
    choice,
    nextScenarioExists: false,
  });

  assert.deepEqual(result, { type: 'summary', nextScenarioId: null });
});

run('summary nodes distinguish advance, missing target, and ending', () => {
  const summary = {
    ...scenario,
    id: 1001,
    type: 'SUMMARY',
    nextScenarioId: 2,
    choices: [],
  };

  assert.deepEqual(
    resolveSummaryContinuation({
      scenario: summary,
      nextScenarioExists: true,
    }),
    { type: 'advance', nextScenarioId: 2 },
  );
  assert.deepEqual(
    resolveSummaryContinuation({
      scenario: summary,
      nextScenarioExists: false,
    }),
    { type: 'missing', nextScenarioId: 2 },
  );
  assert.deepEqual(
    resolveSummaryContinuation({
      scenario: { ...summary, nextScenarioId: undefined },
      nextScenarioExists: false,
    }),
    { type: 'ending' },
  );
});
