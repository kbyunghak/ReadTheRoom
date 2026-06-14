import assert from 'node:assert/strict';
import { createScenarioBundle } from '../utils/scenarioBundle.ts';

type ScenarioInput = Parameters<typeof createScenarioBundle>[0];

const run = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const localized = (value: string) => ({ ko: value, en: value });

const partialChoice = {
  type: 'GROWTH' as const,
  text: localized('Ask for help.'),
  statChanges: {
    english: 5,
  },
  nextScenarioId: 2,
};

run('legacy collections preserve their nodes and use the lowest sorted id as the start', () => {
  const input = {
    '5': {
      id: 5,
      description: localized('Fifth node'),
      choices: [],
    },
    '2': {
      id: 2,
      description: localized('Second node'),
      choices: [],
    },
  } as unknown as ScenarioInput;

  const bundle = createScenarioBundle(input);

  assert.equal(bundle.version, '1.0');
  assert.equal(bundle.startScenarioId, 2);
  assert.deepEqual(bundle.phases[0]?.nodeIds, [2, 5]);
  assert.equal(bundle.scenarios['5']?.description.en, 'Fifth node');
});

run('phase V2 data preserves phase metadata and normalizes choice defaults', () => {
  const input = {
    version: '2.0',
    startScenarioId: 10,
    phases: [
      {
        phaseId: 'arrival',
        title: localized('Arrival'),
        nodes: [
          {
            id: 10,
            situation: localized('At the airport'),
            description: localized('The journey begins.'),
            isPhaseEnd: false,
            isEnding: false,
            choices: [partialChoice],
          },
        ],
      },
    ],
  } as unknown as ScenarioInput;

  const bundle = createScenarioBundle(input);
  const node = bundle.scenarios['10'];
  const choice = node?.choices[0];

  assert.equal(bundle.version, '2.0');
  assert.equal(bundle.startScenarioId, 10);
  assert.equal(node?.phase, 'arrival');
  assert.deepEqual(node?.situation, localized('At the airport'));
  assert.deepEqual(choice?.feedback, localized('Ask for help.'));
  assert.deepEqual(choice?.branchTags, []);
  assert.deepEqual(choice?.statChanges, {
    funds: 0,
    mental: 0,
    english: 5,
    insight: 0,
    stamina: 0,
    relation: 0,
  });
});

run('flat V2 data falls back to its first node and title-based situation', () => {
  const input = {
    version: '2.1',
    character: 'Test',
    nodes: [
      {
        id: 21,
        title: localized('Flat title'),
        description: localized('Flat description'),
        choices: [partialChoice],
      },
    ],
  } as unknown as ScenarioInput;

  const bundle = createScenarioBundle(input);
  const node = bundle.scenarios['21'];

  assert.equal(bundle.startScenarioId, 21);
  assert.equal(bundle.phases[0]?.phaseId, 'flat');
  assert.deepEqual(node?.situation, localized('Flat title'));
  assert.equal(node?.quest, '3-1');
});

run('Day bucket data sorts days and nodes while deriving SUMMARY and ENDING flags', () => {
  const input = {
    Day2: {
      '9001': {
        id: 9001,
        type: 'ENDING',
        day: 2,
        episode: 2,
        title: localized('Ending'),
        description: localized('Ending description'),
      },
      '20': {
        id: 20,
        type: 'NORMAL',
        day: 2,
        episode: 1,
        title: localized('Day 2'),
        description: localized('Day 2 description'),
        choices: [partialChoice],
      },
    },
    Day1: {
      '1001': {
        id: 1001,
        type: 'SUMMARY',
        day: 1,
        episode: 2,
        title: localized('Summary'),
        description: localized('Summary description'),
      },
      '1': {
        id: 1,
        type: 'NORMAL',
        day: 1,
        episode: 1,
        title: localized('Day 1'),
        description: localized('Day 1 description'),
        choices: [partialChoice],
      },
    },
  } as unknown as ScenarioInput;

  const bundle = createScenarioBundle(input);

  assert.equal(bundle.startScenarioId, 1);
  assert.deepEqual(
    bundle.phases.map((phase) => phase.phaseId),
    ['Day1', 'Day2'],
  );
  assert.deepEqual(bundle.phases[0]?.nodeIds, [1, 1001]);
  assert.deepEqual(bundle.phases[1]?.nodeIds, [20, 9001]);
  assert.equal(bundle.scenarios['1001']?.isPhaseEnd, true);
  assert.equal(bundle.scenarios['1001']?.choices.length, 0);
  assert.equal(bundle.scenarios['9001']?.isEnding, true);
  assert.equal(bundle.scenarios['9001']?.choices.length, 0);
});

run('placeholder Day buckets remain valid and do not change the first implemented node', () => {
  const input = {
    Day1: {
      '1': {
        id: 1,
        type: 'NORMAL',
        day: 1,
        episode: 1,
        title: localized('Implemented'),
        description: localized('Implemented description'),
        choices: [partialChoice],
      },
    },
    Day2: {},
  } as unknown as ScenarioInput;

  const bundle = createScenarioBundle(input);

  assert.equal(bundle.startScenarioId, 1);
  assert.deepEqual(bundle.phases[1]?.nodeIds, []);
  assert.ok(bundle.scenarios['1']);
});

run('normalization does not mutate the original partial choice', () => {
  const inputChoice = {
    ...partialChoice,
    statChanges: { english: 5 },
  };
  const input = {
    version: '2.1',
    nodes: [
      {
        id: 1,
        title: localized('Immutable'),
        description: localized('Immutable input'),
        choices: [inputChoice],
      },
    ],
  } as unknown as ScenarioInput;

  createScenarioBundle(input);

  assert.deepEqual(inputChoice.statChanges, { english: 5 });
  assert.equal('feedback' in inputChoice, false);
  assert.equal('branchTags' in inputChoice, false);
});
