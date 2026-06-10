import type { Scenario } from '../../utils/scenarioRegistry.ts';
import {
  choiceWithNegativeChanges,
  choiceWithPositiveChanges,
  choiceWithZeroChanges,
} from './choices.ts';

export const defaultScenarioNode: Scenario = {
  id: 1,
  type: 'NORMAL',
  day: 1,
  episode: 2,
  title: {
    ko: 'Immigration Desk, Sharp Questions',
    en: 'Immigration Desk, Sharp Questions',
  },
  situation: {
    ko: 'Immigration Desk, Sharp Questions',
    en: 'Immigration Desk, Sharp Questions',
  },
  backgroundKey: 'airport',
  description: {
    ko: 'The officer asks about the purpose and length of stay.',
    en: 'The officer asks about the purpose and length of stay.',
  },
  choices: [choiceWithPositiveChanges, choiceWithNegativeChanges, choiceWithZeroChanges],
};

export const tipScenarioNode: Scenario = {
  ...defaultScenarioNode,
  id: 2,
  title: {
    ko: 'Checking the lost baggage form',
    en: 'Checking the lost baggage form',
  },
  situation: {
    ko: 'Checking the lost baggage form',
    en: 'Checking the lost baggage form',
  },
  tip: {
    ko: 'Cash over $10,000 must be declared when entering Canada.',
    en: 'Cash over $10,000 must be declared when entering Canada.',
  },
};

export const summaryScenarioNode: Scenario = {
  id: 1001,
  type: 'SUMMARY',
  day: 1,
  episode: 1001,
  title: {
    ko: 'Day 1 Summary',
    en: 'Day 1 Summary',
  },
  situation: {
    ko: 'Day 1 Summary',
    en: 'Day 1 Summary',
  },
  description: {
    ko: 'Summarize the first day.',
    en: 'Summarize the first day.',
  },
  isPhaseEnd: true,
  backgroundKey: 'city_night',
  statChanges: {
    funds: 0,
    mental: 10,
    english: 0,
    insight: 5,
    stamina: 20,
    relation: 0,
  },
  nextScenarioId: 2,
  choices: [],
};

export const endingScenarioNode: Scenario = {
  id: 9001,
  type: 'ENDING',
  day: 1,
  episode: 9001,
  title: {
    ko: 'Day 1 Failure',
    en: 'Day 1 Failure',
  },
  situation: {
    ko: 'Day 1 Failure',
    en: 'Day 1 Failure',
  },
  description: {
    ko: 'The first day tension was too high.',
    en: 'The first day tension was too high.',
  },
  isEnding: true,
  backgroundKey: 'partyroom_lonely',
  choices: [],
};

export const episodeOneScenarioNode: Scenario = {
  ...defaultScenarioNode,
  id: 11,
  day: 1,
  episode: 1,
  title: {
    ko: 'Inside the Plane, Landing',
    en: 'Inside the Plane, Landing',
  },
  situation: {
    ko: 'Inside the Plane, Landing',
    en: 'Inside the Plane, Landing',
  },
  backgroundKey: 'arrival',
  description: {
    ko: 'Ken begins to feel the reality of arriving in a new world.',
    en: 'Ken begins to feel the reality of arriving in a new world.',
  },
};

export const dayBucketScenarioFixture = {
  Day1: {
    '1': {
      id: 1,
      type: 'NORMAL',
      day: 1,
      episode: 1,
      title: {
        ko: 'Inside the Plane, Landing',
        en: 'Inside the Plane, Landing',
      },
      backgroundKey: 'arrival',
      description: {
        ko: 'The plane has arrived in Vancouver.',
        en: 'The plane has arrived in Vancouver.',
      },
      choices: [
        {
          type: 'GROWTH',
          text: {
            ko: 'Look around.',
            en: 'Look around.',
          },
          feedback: {
            ko: 'The new culture feels fascinating.',
            en: 'The new culture feels fascinating.',
          },
          statChanges: {
            funds: 0,
            mental: 0,
            english: 5,
            insight: 10,
            stamina: 0,
            relation: 0,
          },
          nextScenarioId: 2,
        },
      ],
    },
    '1001': {
      id: 1001,
      type: 'SUMMARY',
      day: 1,
      episode: 1001,
      title: {
        ko: 'Day 1 Summary',
        en: 'Day 1 Summary',
      },
      backgroundKey: 'city_night',
      description: {
        ko: 'Summarize the first day.',
        en: 'Summarize the first day.',
      },
      statChanges: {
        funds: 0,
        mental: 10,
        english: 0,
        insight: 5,
        stamina: 20,
        relation: 0,
      },
      nextScenarioId: 2,
      choices: [],
    },
  },
};
