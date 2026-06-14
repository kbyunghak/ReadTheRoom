import type { CharacterStat } from '../../locales/types';
import { STAT_METADATA } from './config.ts';
import { STAT_KEYS, type GameStats } from './types.ts';

export const CORE_CHARACTER_STAT_KEYS = [
  'funds',
  'english',
  'stamina',
] as const;

const normalizeStat = (
  value: number,
  sourceMax: number,
  displayMax: number,
) =>
  Math.round(
    (Math.max(0, Math.min(value, sourceMax)) / sourceMax) * displayMax,
  );

export const buildDisplayStats = (
  startingStats: GameStats,
): CharacterStat[] =>
  STAT_KEYS.map((key) => {
    const meta = STAT_METADATA[key];
    return {
      key,
      label: meta.label,
      value: normalizeStat(
        startingStats[key],
        meta.sourceMax,
        meta.displayMax,
      ),
      max: meta.displayMax,
      color: meta.characterColor,
    };
  });

export const buildCoreCharacterStats = (startingStats: GameStats) =>
  buildDisplayStats(startingStats).filter((stat) =>
    CORE_CHARACTER_STAT_KEYS.includes(
      stat.key as (typeof CORE_CHARACTER_STAT_KEYS)[number],
    ),
  );
