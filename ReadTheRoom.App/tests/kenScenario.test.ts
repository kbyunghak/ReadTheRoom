import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

type StatKey = 'funds' | 'mental' | 'english' | 'insight' | 'stamina' | 'relation';

type StatChanges = Record<StatKey, number>;

type Choice = {
  statChanges: StatChanges;
  nextScenarioId: number;
};

type ScenarioNode = {
  id: number;
  type: 'NORMAL' | 'SUMMARY' | 'ENDING';
  week?: number;
  day: number;
  episode: number;
  mainEpisode?: number;
  statChanges?: StatChanges;
  nextScenarioId?: number;
  choices?: Choice[];
};

type DayScenarioFile = Record<string, Record<string, ScenarioNode>>;

const scenarioPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../assets/data/scenarios_ken.json',
);
const data = JSON.parse(fs.readFileSync(scenarioPath, 'utf8')) as DayScenarioFile;
const entries = Object.entries(data).flatMap(([dayKey, nodes]) =>
  Object.entries(nodes).map(([objectKey, node]) => ({ dayKey, objectKey, node })),
);
const nodes = entries.map(({ node }) => node);
const nodesById = new Map(nodes.map((node) => [node.id, node]));
const fullStatKeys: StatKey[] = ['funds', 'mental', 'english', 'insight', 'stamina', 'relation'];

const assertFullStatChanges = (statChanges: StatChanges | undefined) => {
  assert.ok(statChanges);
  assert.deepEqual(Object.keys(statChanges).sort(), [...fullStatKeys].sort());
  for (const key of fullStatKeys) {
    assert.equal(typeof statChanges[key], 'number');
  }
};

test('Ken scenario ids are globally unique', () => {
  assert.equal(new Set(nodes.map((node) => node.id)).size, nodes.length);
});

test('Ken object keys always match node ids', () => {
  for (const { objectKey, node } of entries) {
    assert.equal(Number(objectKey), node.id);
  }
});

test('Ken main NORMAL ids are continuous from 1', () => {
  const mainIds = nodes
    .filter((node) => node.type === 'NORMAL' && node.id < 9000)
    .map((node) => node.id)
    .sort((left, right) => left - right);

  assert.deepEqual(mainIds, Array.from({ length: mainIds.length }, (_, index) => index + 1));
});

test('Ken Day 2 main ids continue after Day 1', () => {
  const mainIdsForDay = (day: number) =>
    nodes
      .filter((node) => node.type === 'NORMAL' && node.id < 9000 && node.day === day)
      .map((node) => node.id)
      .sort((left, right) => left - right);

  const day1Ids = mainIdsForDay(1);
  const day2Ids = mainIdsForDay(2);
  assert.equal(day2Ids[0], day1Ids.at(-1)! + 1);
});

test('Ken SUMMARY ids are continuous from 1001', () => {
  const summaryIds = nodes
    .filter((node) => node.type === 'SUMMARY')
    .map((node) => node.id)
    .sort((left, right) => left - right);

  assert.deepEqual(summaryIds, Array.from({ length: summaryIds.length }, (_, index) => 1001 + index));
});

test('Ken exception ids are continuous from 9001', () => {
  const exceptionIds = nodes
    .filter((node) => node.id >= 9000)
    .map((node) => node.id)
    .sort((left, right) => left - right);

  assert.deepEqual(exceptionIds, Array.from({ length: exceptionIds.length }, (_, index) => 9001 + index));
});

test('Ken NORMAL nodes have exactly three complete choices', () => {
  for (const node of nodes.filter((candidate) => candidate.type === 'NORMAL')) {
    assert.equal(node.choices?.length, 3, `NORMAL node ${node.id} must have three choices`);
    for (const choice of node.choices ?? []) {
      assert.equal(typeof choice.nextScenarioId, 'number');
      assertFullStatChanges(choice.statChanges);
    }
  }
});

test('Ken SUMMARY nodes have no choices and complete optional stat changes', () => {
  for (const node of nodes.filter((candidate) => candidate.type === 'SUMMARY')) {
    assert.equal(node.choices?.length ?? 0, 0, `SUMMARY node ${node.id} must not have choices`);
    if (node.statChanges) {
      assertFullStatChanges(node.statChanges);
    }
  }
});

test('Ken choice and SUMMARY links reference existing nodes', () => {
  for (const node of nodes) {
    for (const choice of node.choices ?? []) {
      assert.ok(nodesById.has(choice.nextScenarioId), `${node.id} links to missing ${choice.nextScenarioId}`);
    }
    if (node.type === 'SUMMARY' && node.nextScenarioId !== undefined) {
      assert.ok(nodesById.has(node.nextScenarioId), `${node.id} links to missing ${node.nextScenarioId}`);
    }
  }
});

test('Ken first-choice smoke flow reaches every main node without loops', () => {
  const visited = new Set<number>();
  const flow: number[] = [];
  let currentId: number | undefined = 1;

  while (currentId !== undefined) {
    assert.ok(!visited.has(currentId), `Flow loop detected at ${currentId}`);
    const node = nodesById.get(currentId);
    assert.ok(node, `Flow reached missing node ${currentId}`);

    visited.add(currentId);
    flow.push(currentId);
    currentId =
      node.type === 'SUMMARY'
        ? node.nextScenarioId
        : node.choices?.[0]?.nextScenarioId;
  }

  const mainIds = nodes
    .filter((node) => node.type === 'NORMAL' && node.id < 9000)
    .map((node) => node.id);
  assert.ok(mainIds.every((id) => visited.has(id)));
  assert.deepEqual(flow, [
    ...Array.from({ length: 19 }, (_, index) => index + 1),
    1001,
    ...Array.from({ length: 10 }, (_, index) => index + 20),
    1002,
  ]);
});

test('Ken Day 1 summary continues to the first Day 2 node', () => {
  assert.equal(nodesById.get(1001)?.nextScenarioId, 20);
  assert.equal(nodesById.get(20)?.day, 2);
});

test('Ken exception branch is reachable and returns to the main flow', () => {
  const branchSource = nodesById.get(22);
  const exceptionNode = nodesById.get(9001);

  assert.ok(branchSource?.choices?.some((choice) => choice.nextScenarioId === 9001));
  assert.ok(exceptionNode);
  assert.ok(exceptionNode.choices?.every((choice) => choice.nextScenarioId === 23));
});

test('Ken nodes preserve week and episode metadata', () => {
  assert.ok(nodes.every((node) => node.week === 1));
  assert.ok(nodes.every((node) => typeof node.episode === 'number'));
});

test('Ken Day 1 and Day 2 main episode counts match the UI sequence', () => {
  const mainEpisodesForDay = (day: number) =>
    nodes
      .filter(
        (node) =>
          node.day === day &&
          node.type === 'NORMAL' &&
          typeof node.mainEpisode === 'number',
      )
      .map((node) => node.mainEpisode)
      .sort((left, right) => left! - right!);

  assert.deepEqual(mainEpisodesForDay(1), Array.from({ length: 19 }, (_, index) => index + 1));
  assert.deepEqual(mainEpisodesForDay(2), Array.from({ length: 10 }, (_, index) => index + 1));
});

test('Ken special and SUMMARY nodes do not have main episodes', () => {
  assert.equal(nodesById.get(9001)?.mainEpisode, undefined);
  assert.equal(nodesById.get(1001)?.mainEpisode, undefined);
  assert.equal(nodesById.get(1002)?.mainEpisode, undefined);
});
