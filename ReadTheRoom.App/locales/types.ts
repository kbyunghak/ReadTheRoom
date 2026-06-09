import type { ImageSourcePropType } from 'react-native';

export type AppLanguage = 'en' | 'ko';

export type LocalizedText = {
  ko: string;
  en: string;
};

export type StartingStats = {
  funds: number;
  mental: number;
  english: number;
  insight: number;
  stamina: number;
  relation: number;
};

export type StatKey = keyof StartingStats;

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
