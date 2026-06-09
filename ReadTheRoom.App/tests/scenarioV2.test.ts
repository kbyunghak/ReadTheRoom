import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shouldShowSituationSummary } from '../utils/questProgress.ts';

type LocalizedText = { ko: string; en: string };

type ScenarioChoiceType = 'GROWTH' | 'STABLE' | 'REALIST';

type ScenarioStatChanges = {
  funds?: number;
  mental?: number;
  english?: number;
  insight?: number;
  stamina?: number;
  relation?: number;
};

type ScenarioChoiceV2 = {
  type: ScenarioChoiceType;
  text: LocalizedText;
  feedback?: LocalizedText;
  statChanges?: ScenarioStatChanges;
  branchTags?: string[];
  nextScenarioId: number;
};

type ScenarioNodeV2 = {
  id: number;
  type?: string;
  backgroundKey: string;
  situation: LocalizedText;
  description: LocalizedText;
  isPhaseEnd?: boolean;
  isEnding?: boolean;
  choices: ScenarioChoiceV2[];
};

type ScenarioFileV2 =
  | {
      character: string;
      version: string;
      startScenarioId?: number;
      nodes: ScenarioNodeV2[];
    }
  | {
      character: string;
      version: string;
      startScenarioId: number;
      phases: {
        phaseId: string;
        title: LocalizedText;
        nodes: ScenarioNodeV2[];
      }[];
    };

const run = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const loadJinaScenario = (): ScenarioFileV2 => {
  const scenarioPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../assets/data/scenarios_jina.json',
  );

  return JSON.parse(fs.readFileSync(scenarioPath, 'utf8')) as ScenarioFileV2;
};

const flattenNodes = (data: ScenarioFileV2) =>
  'phases' in data ? data.phases.flatMap((phase) => phase.nodes) : data.nodes;

const FULL_STAT_KEYS = ['funds', 'mental', 'english', 'insight', 'stamina', 'relation'] as const;

run('jina scenario file follows the v2 top-level schema', () => {
  const data = loadJinaScenario();

  assert.equal(data.character, 'Jina');
  assert.match(data.version, /^2\./);
  assert.ok(Array.isArray(flattenNodes(data)));
  assert.ok(flattenNodes(data).length > 0);
});

run('jina nodes include required localized text and valid choice structure', () => {
  const data = loadJinaScenario();
  const nodes = flattenNodes(data);

  for (const node of nodes) {
    assert.equal(typeof node.situation.ko, 'string');
    assert.equal(typeof node.situation.en, 'string');
    assert.equal(typeof node.description.ko, 'string');
    assert.equal(typeof node.description.en, 'string');
    assert.ok(Array.isArray(node.choices));
    assert.ok(node.choices.length > 0);

    for (const choice of node.choices) {
      assert.ok(['GROWTH', 'STABLE', 'REALIST'].includes(choice.type));
      assert.equal(typeof choice.text.ko, 'string');
      assert.equal(typeof choice.text.en, 'string');
      assert.equal(typeof choice.nextScenarioId, 'number');

      if (choice.feedback) {
        assert.equal(typeof choice.feedback.ko, 'string');
        assert.equal(typeof choice.feedback.en, 'string');
      }

      if (choice.branchTags) {
        assert.ok(Array.isArray(choice.branchTags));
      }

      if (choice.statChanges) {
        for (const statKey of FULL_STAT_KEYS) {
          if (statKey in choice.statChanges) {
            assert.equal(typeof choice.statChanges[statKey], 'number');
          }
        }
      }
    }
  }
});

run('jina test flow reaches node 10 then hands off to node 11', () => {
  const data = loadJinaScenario();
  const nodes = flattenNodes(data);

  const node10 = nodes.find((node) => node.id === 10);
  const node11 = nodes.find((node) => node.id === 11);

  assert.ok(node10);
  assert.ok(node11);
  assert.equal(node10?.choices.length, 3);
  assert.ok(node10?.choices.every((choice) => choice.nextScenarioId === 11));
});

run('summary trigger logic can be driven by explicit phase end markers or fallback rules', () => {
  const explicitFlow = [
    { id: 1, isPhaseEnd: false },
    { id: 2, isPhaseEnd: false },
    { id: 10, isPhaseEnd: true },
  ];

  const explicitTriggeredAt = explicitFlow
    .filter((node) => node.isPhaseEnd ?? shouldShowSituationSummary(node.id))
    .map((node) => node.id);

  assert.deepEqual(explicitTriggeredAt, [10]);

  const fallbackFlow = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    isPhaseEnd: undefined,
  }));

  const fallbackTriggeredAt = fallbackFlow
    .filter((node) => node.isPhaseEnd ?? shouldShowSituationSummary(node.id))
    .map((node) => node.id);

  assert.deepEqual(fallbackTriggeredAt, [5]);
});

run('day-bucket summary nodes can omit choices without breaking normalization assumptions', () => {
  const scenarioPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../assets/data/scenarios_ken.json',
  );

  const data = JSON.parse(fs.readFileSync(scenarioPath, 'utf8')) as Record<string, Record<string, unknown>>;
  const dayNodes = Object.values(data)
    .filter((value) => value && typeof value === 'object' && !Array.isArray(value))
    .flatMap((bucket) => Object.values(bucket as Record<string, unknown>)) as Array<{
      id: number;
      type?: string;
      choices?: unknown[];
    }>;

  const summaryNodes = dayNodes.filter((node) => node.type === 'SUMMARY');
  assert.ok(summaryNodes.length > 0);
  assert.ok(summaryNodes.every((node) => node.choices === undefined || Array.isArray(node.choices)));
});
