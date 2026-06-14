export const STAT_KEYS = [
  'funds',
  'mental',
  'english',
  'insight',
  'stamina',
  'relation',
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export type GameStats = Record<StatKey, number>;

export type StatChanges = Omit<GameStats, 'relation'> & {
  relation?: number;
};
