import assert from 'node:assert/strict';
import { applyStatChanges, isGameOverFromStats, type GameStats, type StatChanges } from '../utils/gameStats.ts';
import { shouldShowSituationSummary } from '../utils/questProgress.ts';

const run = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

run('applyStatChanges updates funds and bounded stats correctly', () => {
  const currentStats: GameStats = {
    funds: 500,
    mental: 50,
    english: 30,
    insight: 50,
    stamina: 60,
    relation: 40,
  };

  const statChanges: StatChanges = {
    funds: -45,
    mental: 10,
    english: 20,
    insight: -5,
    stamina: -10,
    relation: 15,
  };

  assert.deepEqual(applyStatChanges(currentStats, statChanges), {
    funds: 455,
    mental: 60,
    english: 50,
    insight: 45,
    stamina: 50,
    relation: 55,
  });
});

run('applyStatChanges clamps non-fund stats between 0 and 100', () => {
  const currentStats: GameStats = {
    funds: 40,
    mental: 95,
    english: 5,
    insight: 98,
    stamina: 3,
    relation: 2,
  };

  const statChanges: StatChanges = {
    funds: 0,
    mental: 20,
    english: -20,
    insight: 10,
    stamina: -10,
    relation: -10,
  };

  assert.deepEqual(applyStatChanges(currentStats, statChanges), {
    funds: 40,
    mental: 100,
    english: 0,
    insight: 100,
    stamina: 0,
    relation: 0,
  });
});

run('applyStatChanges does not allow funds to go below zero', () => {
  const currentStats: GameStats = {
    funds: 15,
    mental: 60,
    english: 40,
    insight: 45,
    stamina: 70,
    relation: 55,
  };

  const statChanges: StatChanges = {
    funds: -120,
    mental: 0,
    english: 0,
    insight: 0,
    stamina: 0,
    relation: 0,
  };

  assert.equal(applyStatChanges(currentStats, statChanges).funds, 0);
});

run('isGameOverFromStats returns true when one of the critical survival stats reaches zero', () => {
  assert.equal(
    isGameOverFromStats({
      funds: 250,
      mental: 0,
      english: 45,
      insight: 65,
      stamina: 70,
      relation: 35,
    }),
    true,
  );

  assert.equal(
    isGameOverFromStats({
      funds: 250,
      mental: 10,
      english: 45,
      insight: 65,
      stamina: 70,
      relation: 0,
    }),
    false,
  );
});

run('shouldShowSituationSummary stays false before the fifth scenario', () => {
  assert.equal(shouldShowSituationSummary(1), false);
  assert.equal(shouldShowSituationSummary(4), false);
});

run('shouldShowSituationSummary becomes true at every fifth scenario', () => {
  assert.equal(shouldShowSituationSummary(5), true);
  assert.equal(shouldShowSituationSummary(10), true);
});

run('shouldShowSituationSummary becomes true at the end even without a next scenario', () => {
  assert.equal(shouldShowSituationSummary(15), true);
});
