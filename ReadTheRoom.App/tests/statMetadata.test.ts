import assert from 'node:assert/strict';
import { STAT_METADATA } from '../domain/stats/config.ts';
import { buildDisplayStats } from '../domain/stats/display.ts';
import { buildCoreCharacterStats } from '../domain/stats/display.ts';
import { STAT_KEYS } from '../domain/stats/types.ts';

const run = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

run('stat metadata defines every canonical stat exactly once', () => {
  assert.deepEqual(Object.keys(STAT_METADATA), [...STAT_KEYS]);
});

run('character display stats preserve funds and scale bounded stats by ten', () => {
  const displayStats = buildDisplayStats({
    funds: 500,
    mental: 50,
    english: 25,
    insight: 45,
    stamina: 60,
    relation: 40,
  });
  const values = Object.fromEntries(
    displayStats.map((stat) => [stat.key, stat.value]),
  );

  assert.deepEqual(values, {
    funds: 500,
    mental: 500,
    english: 250,
    insight: 450,
    stamina: 600,
    relation: 400,
  });
});

run('character display stats clamp values to the configured range', () => {
  const displayStats = buildDisplayStats({
    funds: 1500,
    mental: -10,
    english: 110,
    insight: 45,
    stamina: 60,
    relation: 40,
  });
  const values = Object.fromEntries(
    displayStats.map((stat) => [stat.key, stat.value]),
  );

  assert.equal(values.funds, 1000);
  assert.equal(values.mental, 0);
  assert.equal(values.english, 1000);
});

run('character cards expose only funds, english, and stamina', () => {
  const stats = buildCoreCharacterStats({
    funds: 500,
    mental: 50,
    english: 25,
    insight: 45,
    stamina: 60,
    relation: 40,
  });

  assert.deepEqual(
    stats.map((stat) => stat.key),
    ['funds', 'english', 'stamina'],
  );
});
