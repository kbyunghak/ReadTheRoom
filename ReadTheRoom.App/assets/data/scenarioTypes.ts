export type LocaleText = {
  ko: string;
  en: string;
};

export type StatChanges = {
  funds: number;
  mental: number;
  english: number;
  insight: number;
  stamina: number;
  relation: number;
};

export type ChoiceType = 'GROWTH' | 'STABLE' | 'REALIST';

export type ScenarioType = 'NORMAL' | 'SUMMARY';

export type ScenarioChoice = {
  type: ChoiceType;
  text: LocaleText;
  feedback: LocaleText;
  statChanges: StatChanges;
  nextScenarioId: number;
};

export type BaseScenarioNode = {
  id: number;
  type: ScenarioType;
  week: number;
  day: number;
  title: LocaleText;
  backgroundKey: string;
  description: LocaleText;
  tip?: LocaleText;
};

export type NormalScenarioNode = BaseScenarioNode & {
  type: 'NORMAL';
  mainEpisode?: number;
  choices: [ScenarioChoice, ScenarioChoice, ScenarioChoice];
};

export type SummaryScenarioNode = BaseScenarioNode & {
  type: 'SUMMARY';
  statChanges: StatChanges;
  nextScenarioId?: number;
  choices?: [];
};

export type ScenarioNode = NormalScenarioNode | SummaryScenarioNode;

export type DayMeta = {
  week: number;
  day: number;
  title: LocaleText;
  mainEpisodeCount: number;
  roadmapGroupTitle?: LocaleText;
};

export type CharacterScenarioPack = {
  characterId: string;
  startScenarioId: number;
  nodes: ScenarioNode[];
};
