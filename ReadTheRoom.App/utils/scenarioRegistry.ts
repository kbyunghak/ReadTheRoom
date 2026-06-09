import scenariosData from '../assets/data/scenarios.json';
import scenariosAmyData from '../assets/data/scenarios_amy.json';
import scenariosJinaData from '../assets/data/scenarios_jina.json';
import scenariosKenData from '../assets/data/scenarios_ken.json';
import scenariosSoraData from '../assets/data/scenarios_sora.json';
import scenariosYoonData from '../assets/data/scenarios_yoon.json';

export type LocalizedText = { en: string; ko: string };

export type ScenarioStatChanges = {
  funds: number;
  mental: number;
  english: number;
  insight: number;
  stamina: number;
  relation?: number;
};

export type ScenarioChoiceType = 'GROWTH' | 'STABLE' | 'REALIST';

export type ScenarioChoice = {
  type?: ScenarioChoiceType;
  text: LocalizedText;
  feedback: LocalizedText;
  statChanges: ScenarioStatChanges;
  branchTags?: string[];
  nextScenarioId: number;
};

export type Scenario = {
  id: number;
  type?: string;
  day?: number;
  episode?: number;
  title?: LocalizedText;
  tip?: LocalizedText;
  situation?: string | LocalizedText;
  situationEN?: string;
  phase?: string;
  isPhaseSummary?: boolean;
  isPhaseEnd?: boolean;
  isEnding?: boolean;
  backgroundKey?: string;
  quest?: string;
  description: LocalizedText;
  choices: ScenarioChoice[];
};

export type ScenarioPhase = {
  phaseId: string;
  title: LocalizedText;
  nodeIds: number[];
};

export type ScenarioBundle = {
  version: string;
  startScenarioId: number;
  scenarios: Record<string, Scenario>;
  phases: ScenarioPhase[];
};

type LegacyScenarioCollection = Record<string, Scenario>;

type ScenarioNodeV2 = Scenario & {
  situation: LocalizedText;
  isPhaseEnd: boolean;
  isEnding: boolean;
};

type ScenarioPhaseV2 = {
  phaseId: string;
  title: LocalizedText;
  nodes: ScenarioNodeV2[];
};

type ScenarioFileV2 = {
  version: string;
  startScenarioId: number;
  phases: ScenarioPhaseV2[];
};

type ScenarioNodeFlatV2 = Omit<Scenario, 'description' | 'choices'> & {
  description: LocalizedText;
  choices: Array<
    Partial<ScenarioChoice> & {
      text: LocalizedText;
      nextScenarioId: number;
    }
  >;
};

type ScenarioFileFlatV2 = {
  version: string;
  character?: string;
  startScenarioId?: number;
  nodes: ScenarioNodeFlatV2[];
};

type ScenarioNodeDayV2 = Omit<Scenario, 'description' | 'choices'> & {
  day: number;
  episode: number;
  title: LocalizedText;
  description: LocalizedText;
  choices: Array<
    Partial<ScenarioChoice> & {
      text: LocalizedText;
      nextScenarioId: number;
    }
  >;
};

type ScenarioFileDayV2 = Record<string, Record<string, ScenarioNodeDayV2>>;

const isScenarioFileV2 = (value: unknown): value is ScenarioFileV2 => {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'version' in value &&
      'startScenarioId' in value &&
      'phases' in value &&
      Array.isArray((value as ScenarioFileV2).phases),
  );
};

const isScenarioFileFlatV2 = (value: unknown): value is ScenarioFileFlatV2 => {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'version' in value &&
      'nodes' in value &&
      Array.isArray((value as ScenarioFileFlatV2).nodes),
  );
};

const isScenarioFileDayV2 = (value: unknown): value is ScenarioFileDayV2 => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key) => /^Day\d+$/.test(key));
};

const buildFallbackQuest = (scenarioId: number) => {
  const phaseNumber = Math.max(1, Math.floor((scenarioId - 1) / 10) + 1);
  const stepNumber = ((scenarioId - 1) % 10) + 1;
  return `${phaseNumber}-${stepNumber}`;
};

const DEFAULT_STAT_CHANGES: ScenarioStatChanges = {
  funds: 0,
  mental: 0,
  english: 0,
  insight: 0,
  stamina: 0,
  relation: 0,
};

const buildFallbackFeedback = (text: LocalizedText): LocalizedText => ({
  ko: text.ko,
  en: text.en,
});

const normalizeChoice = (
  choice: Partial<ScenarioChoice> & {
    text: LocalizedText;
    nextScenarioId: number;
  },
): ScenarioChoice => ({
  type: choice.type,
  text: choice.text,
  feedback: choice.feedback ?? buildFallbackFeedback(choice.text),
  statChanges: {
    ...DEFAULT_STAT_CHANGES,
    ...(choice.statChanges ?? {}),
  },
  branchTags: choice.branchTags ?? [],
  nextScenarioId: choice.nextScenarioId,
});

const normalizeScenarioNode = (
  node: ScenarioNodeV2 | ScenarioNodeFlatV2,
  phaseId?: string,
): Scenario => ({
  ...node,
  title: node.title,
  tip: node.tip,
  situation:
    typeof node.situation === 'object' && node.situation
      ? node.situation
      : node.title ?? node.situation,
  phase: phaseId ?? node.phase,
  quest: node.quest ?? buildFallbackQuest(node.id),
  isPhaseEnd: node.isPhaseEnd ?? false,
  isEnding: node.isEnding ?? false,
  choices: Array.isArray(node.choices) ? node.choices.map(normalizeChoice) : [],
});

const normalizeLegacyScenarioData = (data: LegacyScenarioCollection): ScenarioBundle => {
  const scenarioEntries = Object.entries(data).sort(([, left], [, right]) => left.id - right.id);

  return {
    version: '1.0',
    startScenarioId: scenarioEntries[0]?.[1]?.id ?? 1,
    scenarios: data,
    phases: [
      {
        phaseId: 'legacy',
        title: { ko: '기존 시나리오', en: 'Legacy Scenarios' },
        nodeIds: scenarioEntries.map(([, scenario]) => scenario.id),
      },
    ],
  };
};

const normalizeScenarioData = (data: ScenarioFileV2): ScenarioBundle => {
  const scenarios: Record<string, Scenario> = {};
  const phases: ScenarioPhase[] = data.phases.map((phase) => {
    const nodeIds = phase.nodes.map((node) => {
      scenarios[String(node.id)] = normalizeScenarioNode(node, phase.phaseId);
      return node.id;
    });

    return {
      phaseId: phase.phaseId,
      title: phase.title,
      nodeIds,
    };
  });

  return {
    version: data.version,
    startScenarioId: data.startScenarioId,
    scenarios,
    phases,
  };
};

const normalizeFlatScenarioData = (data: ScenarioFileFlatV2): ScenarioBundle => {
  const scenarios: Record<string, Scenario> = {};
  const nodeIds = data.nodes.map((node) => {
    scenarios[String(node.id)] = normalizeScenarioNode(node);
    return node.id;
  });

  return {
    version: data.version,
    startScenarioId: data.startScenarioId ?? data.nodes[0]?.id ?? 1,
    scenarios,
    phases: [
      {
        phaseId: 'flat',
        title: { ko: 'Flat Scenarios', en: 'Flat Scenarios' },
        nodeIds,
      },
    ],
  };
};

const buildDayPhaseTitle = (dayNumber: number): LocalizedText => ({
  ko: `${dayNumber}일차`,
  en: `Day ${dayNumber}`,
});

const normalizeDayScenarioData = (data: ScenarioFileDayV2): ScenarioBundle => {
  const scenarios: Record<string, Scenario> = {};
  const phases: ScenarioPhase[] = [];
  let startScenarioId = Number.POSITIVE_INFINITY;

  const sortedDays = Object.entries(data).sort(([left], [right]) => {
    const leftNum = Number(left.replace('Day', ''));
    const rightNum = Number(right.replace('Day', ''));
    return leftNum - rightNum;
  });

  for (const [dayKey, dayNodes] of sortedDays) {
    const dayNumber = Number(dayKey.replace('Day', ''));
    const sortedNodeEntries = Object.entries(dayNodes).sort(
      ([, left], [, right]) => left.id - right.id,
    );

    const nodeIds = sortedNodeEntries.map(([, node]) => {
      scenarios[String(node.id)] = normalizeScenarioNode(
        {
          ...node,
          situation: node.title,
          phase: dayKey,
          isPhaseEnd: node.type === 'SUMMARY' ? true : (node.isPhaseEnd ?? false),
          isEnding: node.type === 'ENDING' ? true : (node.isEnding ?? false),
        },
        dayKey,
      );
      startScenarioId = Math.min(startScenarioId, node.id);
      return node.id;
    });

    phases.push({
      phaseId: dayKey,
      title: buildDayPhaseTitle(dayNumber),
      nodeIds,
    });
  }

  return {
    version: 'day-bucket-v1',
    startScenarioId: Number.isFinite(startScenarioId) ? startScenarioId : 1,
    scenarios,
    phases,
  };
};

export const createScenarioBundle = (
  data: LegacyScenarioCollection | ScenarioFileV2 | ScenarioFileFlatV2 | ScenarioFileDayV2,
): ScenarioBundle => {
  if (isScenarioFileV2(data)) {
    return normalizeScenarioData(data);
  }

  if (isScenarioFileFlatV2(data)) {
    return normalizeFlatScenarioData(data);
  }

  if (isScenarioFileDayV2(data)) {
    return normalizeDayScenarioData(data);
  }

  return normalizeLegacyScenarioData(data);
};

export const DEFAULT_SCENARIO_BUNDLE = createScenarioBundle(
  scenariosData as unknown as LegacyScenarioCollection,
);

export const CHARACTER_SCENARIO_BUNDLES: Record<string, ScenarioBundle> = {
  amy: createScenarioBundle(scenariosAmyData as unknown as LegacyScenarioCollection),
  jina: createScenarioBundle(scenariosJinaData as unknown as ScenarioFileV2),
  ken: createScenarioBundle(scenariosKenData as unknown as ScenarioFileDayV2),
  sora: createScenarioBundle(scenariosSoraData as unknown as LegacyScenarioCollection),
  yoon: createScenarioBundle(scenariosYoonData as unknown as LegacyScenarioCollection),
};

export const DEFAULT_SCENARIOS = DEFAULT_SCENARIO_BUNDLE.scenarios;

export const CHARACTER_SCENARIOS: Record<string, Record<string, Scenario>> = Object.fromEntries(
  Object.entries(CHARACTER_SCENARIO_BUNDLES).map(([characterId, bundle]) => [
    characterId,
    bundle.scenarios,
  ]),
);

export const getScenarioBundle = (characterId?: string | null) => {
  if (characterId && CHARACTER_SCENARIO_BUNDLES[characterId]) {
    return CHARACTER_SCENARIO_BUNDLES[characterId];
  }

  return DEFAULT_SCENARIO_BUNDLE;
};

export const hasScenarioForCharacter = (characterId: string) => {
  return Boolean(CHARACTER_SCENARIO_BUNDLES[characterId]);
};
