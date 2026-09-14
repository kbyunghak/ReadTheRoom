import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  resolveChoiceContinuation,
  resolveSurvivedFinishAction,
  resolveSummaryContinuation,
} from '../domain/game/transitions.ts';
import type {
  Scenario,
  ScenarioChoice,
} from '../utils/scenarioBundle.ts';
import { FINAL_CLEAR_SCENARIO_ID } from '../utils/scenarioBundle.ts';

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

test('failed stats take priority over normal navigation', () => {
  const result = resolveChoiceContinuation({
    stats: { ...stableStats, mental: 0 },
    scenario,
    choice,
    nextScenarioExists: true,
  });

  assert.deepEqual(result, { type: 'failure' });
});

test('ending scenarios finish without navigating to their choice target', () => {
  const result = resolveChoiceContinuation({
    stats: stableStats,
    scenario: { ...scenario, isEnding: true },
    choice,
    nextScenarioExists: true,
  });

  assert.deepEqual(result, { type: 'ending' });
});

test('normal scenarios advance to the selected choice target', () => {
  const result = resolveChoiceContinuation({
    stats: stableStats,
    scenario,
    choice,
    nextScenarioExists: true,
  });

  assert.deepEqual(result, { type: 'advance', nextScenarioId: 2 });
});

test('phase-end scenarios open a summary with an available next node', () => {
  const result = resolveChoiceContinuation({
    stats: stableStats,
    scenario: { ...scenario, isPhaseEnd: true },
    choice,
    nextScenarioExists: true,
  });

  assert.deepEqual(result, { type: 'summary', nextScenarioId: 2 });
});

test('JSON-summary mode advances to the registered SUMMARY node without creating a legacy summary', () => {
  const result = resolveChoiceContinuation({
    stats: stableStats,
    scenario: { ...scenario, isPhaseEnd: true },
    choice,
    nextScenarioExists: true,
    summaryMode: 'json-node',
  });

  assert.deepEqual(result, { type: 'advance', nextScenarioId: 2 });
});

test('normal scenarios never hide a missing target behind a summary', () => {
  const result = resolveChoiceContinuation({
    stats: stableStats,
    scenario: { ...scenario, isPhaseEnd: true },
    choice,
    nextScenarioExists: false,
  });

  assert.deepEqual(result, { type: 'missing', nextScenarioId: 2 });
});

test('summary nodes distinguish advance, future content, final clear, and ending', () => {
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
    { type: 'in_progress', nextScenarioId: 2 },
  );
  assert.deepEqual(
    resolveSummaryContinuation({
      scenario: { ...summary, nextScenarioId: FINAL_CLEAR_SCENARIO_ID },
      nextScenarioExists: false,
    }),
    { type: 'final_clear' },
  );
  assert.deepEqual(
    resolveSummaryContinuation({
      scenario: { ...summary, nextScenarioId: undefined },
      nextScenarioExists: false,
    }),
    { type: 'ending' },
  );
});

test('survived ending exits only on Android and uses character selection elsewhere', () => {
  assert.equal(resolveSurvivedFinishAction('android'), 'exit_app');
  assert.equal(resolveSurvivedFinishAction('ios'), 'character_select');
  assert.equal(resolveSurvivedFinishAction('web'), 'character_select');
});
