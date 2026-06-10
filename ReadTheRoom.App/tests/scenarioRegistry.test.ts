import assert from 'node:assert/strict';
import { createScenarioBundle } from '../utils/scenarioBundle.ts';
import { dayBucketScenarioFixture } from './fixtures/index.ts';

const scenarioInput = dayBucketScenarioFixture as unknown as Parameters<typeof createScenarioBundle>[0];

const run = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

run('createScenarioBundle flattens Day bucket data into a scenario map', () => {
  const bundle = createScenarioBundle(scenarioInput);

  assert.equal(bundle.version, 'day-bucket-v1');
  assert.equal(bundle.startScenarioId, 1);
  assert.deepEqual(bundle.phases.map((phase: { phaseId: string }) => phase.phaseId), ['Day1']);
  assert.ok(bundle.scenarios['1']);
  assert.ok(bundle.scenarios['1001']);
});

run('createScenarioBundle uses Day bucket node ids in sorted order', () => {
  const bundle = createScenarioBundle(scenarioInput);

  assert.deepEqual(bundle.phases[0]?.nodeIds, [1, 1001]);
});

run('SUMMARY nodes from Day bucket data are normalized as phase end nodes', () => {
  const bundle = createScenarioBundle(scenarioInput);
  const summaryNode = bundle.scenarios['1001'];

  assert.ok(summaryNode);
  assert.equal(summaryNode.type, 'SUMMARY');
  assert.equal(summaryNode.isPhaseEnd, true);
  assert.deepEqual(summaryNode.choices, []);
  assert.equal(summaryNode.nextScenarioId, 2);
  assert.deepEqual(summaryNode.statChanges, {
    funds: 0,
    mental: 10,
    english: 0,
    insight: 5,
    stamina: 20,
    relation: 0,
  });
});

run('Day bucket nodes use title as the fallback situation value', () => {
  const bundle = createScenarioBundle(scenarioInput);
  const firstNode = bundle.scenarios['1'];

  assert.deepEqual(firstNode?.situation, {
    ko: 'Inside the Plane, Landing',
    en: 'Inside the Plane, Landing',
  });
});
