import type { ImageSourcePropType } from 'react-native';
import type { GameStats, StatKey } from '../domain/stats/types';

export type AppLanguage = 'en' | 'ko';

export type LocalizedText = {
  ko: string;
  en: string;
};

export type StartingStats = GameStats;
export type { StatKey };

export type CharacterStat = {
  key: StatKey;
  label: LocalizedText;
  value: number;
  max: number;
  color: string;
};

export type Character = {
  id: string;
  tier: 1 | 2 | 3;
  name: LocalizedText;
  age: LocalizedText;
  jobTitle: LocalizedText;
  image: ImageSourcePropType;
  cardImage: ImageSourcePropType;
  description: {
    ko: string[];
    en: string[];
  };
  startingStats: StartingStats;
  trait: LocalizedText;
  specialEffect: LocalizedText;
  balanceNote?: LocalizedText;
  unlockNote?: LocalizedText;
};
