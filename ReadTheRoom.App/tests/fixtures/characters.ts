import type { GameStats } from '../../utils/gameStats.ts';

type CharacterFixture = {
  id: string;
  name: {
    ko: string;
    en: string;
  };
  baseStats: GameStats;
  cardImage: string;
};

export const defaultCharacterKen: CharacterFixture = {
  id: 'ken',
  name: {
    ko: 'Ken',
    en: 'Ken',
  },
  baseStats: {
    funds: 500,
    mental: 50,
    english: 25,
    insight: 45,
    stamina: 60,
    relation: 40,
  },
  cardImage: 'ken_card',
};

export const defaultCharacterJina: CharacterFixture = {
  id: 'jina',
  name: {
    ko: 'Jina',
    en: 'Jina',
  },
  baseStats: {
    funds: 500,
    mental: 55,
    english: 30,
    insight: 50,
    stamina: 55,
    relation: 45,
  },
  cardImage: 'jina_card',
};

export const defaultCharacterAmy: CharacterFixture = {
  id: 'amy',
  name: {
    ko: 'Amy',
    en: 'Amy',
  },
  baseStats: {
    funds: 450,
    mental: 60,
    english: 40,
    insight: 45,
    stamina: 55,
    relation: 55,
  },
  cardImage: 'amy_card',
};
