import { createScenarioBundle, FINAL_CLEAR_SCENARIO_ID, type LocalizedText, type Scenario, type ScenarioBundle, type ScenarioStatChanges } from './scenarioBundle';

// New summaries have a separate namespace; existing legacy IDs are untouched.
export const SUMMARY_ID_BASE = 1_000;
export const getStageNumber = (episode: number) => Math.floor((episode - 1) / 10) + 1;
export const getStageLabel = (stage: number) => `Stage ${stage}`;
export const getSummaryId = (stage: number) => SUMMARY_ID_BASE + stage;

const fail = (message: string): never => { throw new Error(`Invalid scenario chunks: ${message}`); };
const record = (value: unknown, path: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail(`${path} must be an object`);
  return value as Record<string, unknown>;
};
const localized = (value: unknown, path: string): LocalizedText => {
  const text = record(value, path);
  if (typeof text.ko !== 'string' || typeof text.en !== 'string') return fail(`${path} requires ko/en strings`);
  return { ko: text.ko, en: text.en };
};
const positiveId = (value: unknown, path: string): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) return fail(`${path} must be a positive integer`);
  return value;
};
const stats = (value: unknown, path: string): ScenarioStatChanges => {
  const result: ScenarioStatChanges = { funds: 0, mental: 0, english: 0, insight: 0, stamina: 0, relation: 0 };
  for (const [key, amount] of Object.entries(record(value ?? {}, path))) {
    if (!Object.hasOwn(result, key) || typeof amount !== 'number' || !Number.isFinite(amount)) return fail(`${path}.${key} is not a valid stat change`);
    result[key as keyof ScenarioStatChanges] = amount;
  }
  return result;
};

export function loadChunkedScenarioData(chunks: readonly unknown[]): ScenarioBundle {
  const scenarios: Record<string, Scenario> = {};
  for (const [index, chunk] of chunks.entries()) {
    for (const [key, value] of Object.entries(record(chunk, `chunk ${index}`))) {
      const id = positiveId(Number(key), key);
      if (String(id) !== key) fail(`non-canonical ID ${key}`);
      if (Object.hasOwn(scenarios, key)) fail(`duplicate ID ${key}`);
      const node = record(value, key);
      for (const field of ['id', 'episode', 'day', 'week', 'mainEpisode', 'stage']) {
        if (Object.hasOwn(node, field)) fail(`${key}.${field} must not be stored in chunks`);
      }
      if (node.type !== 'NORMAL' && node.type !== 'SUMMARY') fail(`${key}.type must be NORMAL or SUMMARY`);
      const summary = node.type === 'SUMMARY';
      if (summary ? id <= SUMMARY_ID_BASE : id >= SUMMARY_ID_BASE) fail(`${key} is outside its ID namespace`);
      const stage = summary ? id - SUMMARY_ID_BASE : getStageNumber(id);
      if (summary && stage > Math.ceil((SUMMARY_ID_BASE - 1) / 10)) fail(`${key} has an invalid summary stage`);
      if (!Array.isArray(node.choices) || (summary ? node.choices.length !== 0 : node.choices.length === 0)) fail(`${key}.choices must be ${summary ? 'empty' : 'nonempty'}`);
      if (typeof node.backgroundKey !== 'string' || !node.backgroundKey) fail(`${key}.backgroundKey is required`);
      const choices = (node.choices as unknown[]).map((raw, choiceIndex) => {
        const path = `${key}.choices[${choiceIndex}]`;
        const choice = record(raw, path);
        if (choice.type !== undefined && !['GROWTH', 'STABLE', 'REALIST'].includes(String(choice.type))) fail(`${path}.type is invalid`);
        return {
          type: choice.type as 'GROWTH' | 'STABLE' | 'REALIST' | undefined,
          text: localized(choice.text, `${path}.text`),
          feedback: localized(choice.feedback, `${path}.feedback`),
          statChanges: stats(choice.statChanges, `${path}.statChanges`),
          nextScenarioId: positiveId(choice.nextScenarioId, `${path}.nextScenarioId`),
        };
      });
      if (!summary && node.nextScenarioId !== undefined) fail(`${key}: NORMAL navigation belongs to choices`);
      const title = localized(node.title, `${key}.title`);
      scenarios[key] = {
        id, type: node.type as string, stageNumber: stage,
        episodeNumber: summary ? undefined : id,
        phase: `stage-${stage}`, title, situation: title,
        description: localized(node.description, `${key}.description`),
        tip: node.tip === undefined ? undefined : localized(node.tip, `${key}.tip`),
        backgroundKey: node.backgroundKey as string,
        choices, isPhaseEnd: summary,
        statChanges: summary ? stats(node.statChanges, `${key}.statChanges`) : undefined,
        nextScenarioId: node.nextScenarioId === undefined ? undefined : positiveId(node.nextScenarioId, `${key}.nextScenarioId`),
      };
    }
  }
  const episodes = Object.values(scenarios).filter(node => node.type === 'NORMAL').sort((a, b) => a.id - b.id);
  if (!episodes.length) fail('at least one NORMAL episode is required');
  const stages = [...new Set(episodes.map(node => node.stageNumber!))].sort((a, b) => a - b);
  for (const node of Object.values(scenarios)) {
    for (const target of node.choices.map(choice => choice.nextScenarioId)) {
      if (!scenarios[String(target)]) fail(`${node.id} references missing ID ${target}`);
    }
    if (node.type === 'NORMAL' && node.id % 10 === 0 && node.choices.some(choice => choice.nextScenarioId !== getSummaryId(node.stageNumber!))) fail(`episode ${node.id} must lead to its SUMMARY`);
    if (node.type === 'SUMMARY' && !stages.includes(node.stageNumber!)) fail(`orphan SUMMARY ${node.id}`);
  }
  for (const stage of stages) {
    for (let id = (stage - 1) * 10 + 1; id <= stage * 10; id++) {
      if (scenarios[String(id)]?.type !== 'NORMAL') fail(`stage ${stage} is missing episode ${id}`);
    }
    const summary = scenarios[String(getSummaryId(stage))];
    if (summary?.type !== 'SUMMARY') fail(`stage ${stage} requires SUMMARY ${getSummaryId(stage)}`);
    const next = stage * 10 + 1;
    if (
      summary.nextScenarioId !== undefined &&
      summary.nextScenarioId !== FINAL_CLEAR_SCENARIO_ID &&
      summary.nextScenarioId !== next
    ) {
      fail(`SUMMARY ${summary.id} must lead to ${next}, use ${FINAL_CLEAR_SCENARIO_ID} for final clear, or omit nextScenarioId`);
    }
  }
  return {
    version: 'episode-chunks-v1', startScenarioId: episodes[0].id, scenarios,
    phases: stages.map(stage => ({
      phaseId: `stage-${stage}`, title: { ko: getStageLabel(stage), en: getStageLabel(stage) },
      nodeIds: [...episodes.filter(node => node.stageNumber === stage).map(node => node.id), getSummaryId(stage)],
    })),
  };
}

export function loadCharacterScenarios(chunks: readonly unknown[], legacy: unknown): ScenarioBundle {
  return chunks.length ? loadChunkedScenarioData(chunks) : createScenarioBundle(legacy as Parameters<typeof createScenarioBundle>[0]);
}

export const getChunkedRoadmapGroups = (bundle: ScenarioBundle) => bundle.phases.map(phase => {
  const stage = bundle.scenarios[String(phase.nodeIds[0])].stageNumber!;
  return { week: stage, dayStart: (stage - 1) * 10 + 1, dayEnd: stage * 10, label: getStageLabel(stage) };
});
