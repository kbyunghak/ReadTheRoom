import scenariosData from '../assets/data/scenarios.json';
import scenariosAmyData from '../assets/data/scenarios_amy.json';
import scenariosJinaData from '../assets/data/scenarios_jina.json';
import scenariosKenData from '../assets/data/scenarios_ken.json';
import scenariosSoraData from '../assets/data/scenarios_sora.json';
import scenariosYoonData from '../assets/data/scenarios_yoon.json';
import {
  createScenarioBundle,
  type Scenario,
  type ScenarioBundle,
} from './scenarioBundle';

export type {
  LegacyScenarioCollection,
  LocalizedText,
  Scenario,
  ScenarioBundle,
  ScenarioChoice,
  ScenarioChoiceType,
  ScenarioPhase,
  ScenarioStatChanges,
} from './scenarioBundle';

type ScenarioInput = Parameters<typeof createScenarioBundle>[0];

const createBundle = (data: unknown) =>
  createScenarioBundle(data as ScenarioInput);

export const DEFAULT_SCENARIO_BUNDLE = createBundle(scenariosData);

export const CHARACTER_SCENARIO_BUNDLES: Record<string, ScenarioBundle> = {
  amy: createBundle(scenariosAmyData),
  jina: createBundle(scenariosJinaData),
  ken: createBundle(scenariosKenData),
  sora: createBundle(scenariosSoraData),
  yoon: createBundle(scenariosYoonData),
};

export const DEFAULT_SCENARIOS = DEFAULT_SCENARIO_BUNDLE.scenarios;

export const CHARACTER_SCENARIOS: Record<string, Record<string, Scenario>> =
  Object.fromEntries(
    Object.entries(CHARACTER_SCENARIO_BUNDLES).map(
      ([characterId, bundle]) => [characterId, bundle.scenarios],
    ),
  );

export const getScenarioBundle = (characterId?: string | null) => {
  if (characterId && CHARACTER_SCENARIO_BUNDLES[characterId]) {
    return CHARACTER_SCENARIO_BUNDLES[characterId];
  }

  return DEFAULT_SCENARIO_BUNDLE;
};

export const hasScenarioForCharacter = (characterId: string) =>
  Boolean(CHARACTER_SCENARIO_BUNDLES[characterId]);
