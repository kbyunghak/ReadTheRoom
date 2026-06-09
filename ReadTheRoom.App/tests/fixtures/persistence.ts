import type { SavedGameSession, PersistenceStorage } from '../../utils/gamePersistence.ts';

export const createMemoryStorage = (): PersistenceStorage => {
  const store = new Map<string, string>();

  return {
    getItem: async (key) => store.get(key) ?? null,
    setItem: async (key, value) => {
      store.set(key, value);
    },
    removeItem: async (key) => {
      store.delete(key);
    },
  };
};

export const defaultSavedSession = (
  overrides: Partial<SavedGameSession> = {},
): SavedGameSession => ({
  characterId: 'ken',
  lang: 'ko',
  currentScenarioId: 7,
  stats: {
    funds: 455,
    mental: 60,
    english: 50,
    insight: 45,
    stamina: 50,
    relation: 48,
  },
  playHistory: [
    {
      situationTitle: {
        ko: 'Arrival and immigration',
        en: 'Arrival and immigration',
      },
      choice: {
        text: {
          ko: "I'm here to study.",
          en: "I'm here to study.",
        },
        feedback: {
          ko: 'You got the point across.',
          en: 'You got the point across.',
        },
        statChanges: {
          funds: 0,
          mental: 0,
          english: 10,
          insight: 10,
          stamina: -5,
          relation: 0,
        },
        nextScenarioId: 2,
      },
    },
  ],
  currentSituationChoices: [],
  checkpoints: {
    1: {
      scenarioId: 1,
      stats: {
        funds: 500,
        mental: 50,
        english: 25,
        insight: 45,
        stamina: 60,
        relation: 40,
      },
      playHistory: [],
    },
    7: {
      scenarioId: 7,
      stats: {
        funds: 455,
        mental: 60,
        english: 50,
        insight: 45,
        stamina: 50,
        relation: 48,
      },
      playHistory: [],
    },
  },
  updatedAt: '2026-04-14T12:00:00.000Z',
  ...overrides,
});
