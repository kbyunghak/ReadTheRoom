import assert from 'node:assert/strict';
import {
  getMainEpisodeCount,
  getRoadmapProgressLabel,
  getScenarioHeaderMeta,
  isRoadmapMainScenario,
  type ProgressScenario,
} from '../utils/scenarioProgress.ts';

const run = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const scenarios: ProgressScenario[] = [
  { id: 1, type: 'NORMAL', week: 1, day: 1, mainEpisode: 1 },
  { id: 2, type: 'NORMAL', week: 1, day: 1, mainEpisode: 2 },
  { id: 20, type: 'NORMAL', week: 1, day: 2, mainEpisode: 1 },
  { id: 9001, type: 'NORMAL', week: 1, day: 2 },
  { id: 1001, type: 'SUMMARY', week: 1, day: 1 },
  { id: 1002, type: 'SUMMARY', week: 1, day: 2 },
];

run('main episode count only includes numbered NORMAL nodes for the same day', () => {
  assert.equal(getMainEpisodeCount(scenarios, scenarios[0]), 2);
  assert.equal(getMainEpisodeCount(scenarios, scenarios[2]), 1);
});

run('header metadata shows numbered episode progress', () => {
  assert.equal(getScenarioHeaderMeta(scenarios[1], 19), 'W1 · D1 · EP 02/19');
});

run('header metadata identifies Special Event nodes', () => {
  assert.equal(getScenarioHeaderMeta(scenarios[3], 10), 'W1 · D2 · Special Event');
});

run('header metadata identifies completed days', () => {
  assert.equal(getScenarioHeaderMeta(scenarios[4], 19), 'W1 · D1 Complete');
});

run('roadmap only includes NORMAL nodes with mainEpisode', () => {
  assert.deepEqual(
    scenarios.filter(isRoadmapMainScenario).map((scenario) => scenario.id),
    [1, 2, 20],
  );
});

run('roadmap progress uses day and mainEpisode instead of scenario id', () => {
  assert.equal(getRoadmapProgressLabel(scenarios[2]), 'DAY 02 · EP 01');
});
