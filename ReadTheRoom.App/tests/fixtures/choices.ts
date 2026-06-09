import type { ScenarioChoice } from '../../utils/scenarioRegistry.ts';

export const choiceWithPositiveChanges: ScenarioChoice = {
  type: 'GROWTH',
  text: {
    ko: 'Check the lost form one more time.',
    en: 'Check the lost baggage form one more time.',
  },
  feedback: {
    ko: 'The officer appreciates the careful attitude and stamps the form.',
    en: 'The officer appreciates the careful attitude and stamps the form.',
  },
  statChanges: {
    funds: 0,
    mental: 5,
    english: 10,
    insight: 15,
    stamina: 0,
    relation: 0,
  },
  nextScenarioId: 2,
};

export const choiceWithNegativeChanges: ScenarioChoice = {
  type: 'REALIST',
  text: {
    ko: 'Stall for time with a hesitant answer.',
    en: 'Stall for time with a hesitant answer.',
  },
  feedback: {
    ko: 'The English response was weak and the confidence dropped further.',
    en: 'The English response was weak and the confidence dropped further.',
  },
  statChanges: {
    funds: 0,
    mental: -10,
    english: -5,
    insight: -10,
    stamina: -5,
    relation: 0,
  },
  nextScenarioId: 3,
};

export const choiceWithZeroChanges: ScenarioChoice = {
  type: 'STABLE',
  text: {
    ko: 'Take a breath and answer again.',
    en: 'Take a breath and answer again.',
  },
  feedback: {
    ko: 'Nothing changed much, but the flow stayed stable.',
    en: 'Nothing changed much, but the flow stayed stable.',
  },
  statChanges: {
    funds: 0,
    mental: 0,
    english: 0,
    insight: 0,
    stamina: 0,
    relation: 0,
  },
  nextScenarioId: 4,
};
