import type { GameStats, StatChanges } from '../domain/stats/types';

export type { GameStats, StatChanges } from '../domain/stats/types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const applyStatChanges = (currentStats: GameStats, statChanges: Partial<StatChanges>): GameStats => {
  return {
    funds: Math.max(0, currentStats.funds + (statChanges.funds || 0)),
    mental: clamp(currentStats.mental + (statChanges.mental || 0), 0, 100),
    english: clamp(currentStats.english + (statChanges.english || 0), 0, 100),
    insight: clamp(currentStats.insight + (statChanges.insight || 0), 0, 100),
    stamina: clamp(currentStats.stamina + (statChanges.stamina || 0), 0, 100),
    relation: clamp(currentStats.relation + (statChanges.relation || 0), 0, 100),
  };
};

export const isGameOverFromStats = (stats: GameStats) => {
  return (
    stats.mental <= 0 ||
    stats.stamina <= 0 ||
    stats.funds <= 0 ||
    stats.english <= 0 ||
    stats.insight <= 0
  );
};
