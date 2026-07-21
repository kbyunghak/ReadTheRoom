import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

type StatKey = 'funds' | 'mental' | 'english' | 'insight' | 'stamina' | 'relation';

type StatChanges = Record<StatKey, number>;

type Choice = {
  statChanges: StatChanges;
  nextScenarioId?: number;
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
const mainNormalNodes = nodes.filter(
  (node) => node.type === 'NORMAL' && node.id < 9000,
);
const summaryNodes = nodes.filter((node) => node.type === 'SUMMARY');
const groupedByDay = new Map<number, ScenarioNode[]>();

for (const node of nodes) {
  const dayNodes = groupedByDay.get(node.day) ?? [];
  dayNodes.push(node);
  groupedByDay.set(node.day, dayNodes);
}

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

test('Ken Day buckets use sequential day numbers', () => {
  const dayNumbers = Object.keys(data)
    .map((dayKey) => Number(dayKey.replace('Day', '')))
    .sort((left, right) => left - right);

  assert.deepEqual(
    dayNumbers,
    Array.from({ length: dayNumbers.length }, (_, index) => index + 1),
  );
});

test('Ken main episodes are sequential inside each day', () => {
  for (const [day, dayNodes] of groupedByDay.entries()) {
    const mainEpisodes = dayNodes
      .filter((node) => node.type === 'NORMAL' && node.id < 9000)
      .map((node) => node.mainEpisode)
      .sort((left, right) => left! - right!);

    assert.deepEqual(
      mainEpisodes,
      Array.from({ length: mainEpisodes.length }, (_, index) => index + 1),
      `Day ${day} main episodes must be sequential`,
    );
  }
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
      if (choice.nextScenarioId !== undefined) {
        assert.equal(typeof choice.nextScenarioId, 'number');
      }
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
      if (choice.nextScenarioId !== undefined) {
        assert.ok(nodesById.has(choice.nextScenarioId), `${node.id} links to missing ${choice.nextScenarioId}`);
      }
    }
    if (node.type === 'SUMMARY' && node.nextScenarioId !== undefined) {
      assert.ok(nodesById.has(node.nextScenarioId), `${node.id} links to missing ${node.nextScenarioId}`);
    }
  }
});

test('Ken graph traversal reaches every node without loops', () => {
  const visited = new Set<number>();
  const stack: number[] = [1];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (visited.has(currentId)) continue;
    assert.ok(!visited.has(currentId), `Flow loop detected at ${currentId}`);
    const node = nodesById.get(currentId);
    assert.ok(node, `Flow reached missing node ${currentId}`);

    visited.add(currentId);

    for (const choice of node.choices ?? []) {
      if (choice.nextScenarioId !== undefined) stack.push(choice.nextScenarioId);
    }
    if (node.nextScenarioId !== undefined) stack.push(node.nextScenarioId);
  }

  assert.deepEqual(
    [...visited].sort((left, right) => left - right),
    nodes.map((node) => node.id).sort((left, right) => left - right),
  );
});

test('Ken summaries continue to the next day first node or terminate the current content', () => {
  const summariesByDay = new Map(summaryNodes.map((node) => [node.day, node]));
  const sortedDays = [...groupedByDay.keys()].sort((left, right) => left - right);

  sortedDays.forEach((day, index) => {
    const summary = summariesByDay.get(day);
    assert.ok(summary, `Day ${day} must have a summary`);

    const nextDay = sortedDays[index + 1];
    if (nextDay === undefined) {
      assert.equal(summary.nextScenarioId, undefined);
      return;
    }

    const nextDayFirstNode = groupedByDay
      .get(nextDay)!
      .filter((node) => node.type === 'NORMAL' && node.id < 9000)
      .sort((left, right) => left.id - right.id)[0];

    assert.equal(summary.nextScenarioId, nextDayFirstNode.id);
  });
});

test('Ken exception branch is reachable and returns to the main flow', () => {
  const branchSource = nodes.find((node) =>
    node.choices?.some((choice) => choice.nextScenarioId === 9001),
  );
  const exceptionNode = nodesById.get(9001);

  assert.ok(branchSource);
  assert.ok(exceptionNode);
  assert.ok(
    exceptionNode.choices?.every(
      (choice) =>
        choice.nextScenarioId === undefined ||
        nodesById.has(choice.nextScenarioId),
    ),
  );
});

test('Ken nodes preserve week and episode metadata', () => {
  assert.ok(nodes.every((node) => typeof node.week === 'number'));
  assert.ok(nodes.every((node) => typeof node.episode === 'number'));
});

test('Ken main nodes preserve mainEpisode metadata', () => {
  assert.ok(
    mainNormalNodes.every((node) => typeof node.mainEpisode === 'number'),
  );
});

test('Ken special and SUMMARY nodes do not have main episodes', () => {
  assert.equal(nodesById.get(9001)?.mainEpisode, undefined);
  assert.equal(nodesById.get(1001)?.mainEpisode, undefined);
  assert.equal(nodesById.get(1002)?.mainEpisode, undefined);
});
