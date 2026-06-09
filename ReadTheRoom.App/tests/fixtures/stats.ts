import type { GameStats } from '../../utils/gameStats.ts';

export const stableStats: GameStats = {
  funds: 520,
  mental: 72,
  english: 55,
  insight: 61,
  stamina: 68,
  relation: 54,
};

export const warningMentalStats: GameStats = {
  funds: 520,
  mental: 35,
  english: 55,
  insight: 61,
  stamina: 68,
  relation: 54,
};

export const warningInsightStats: GameStats = {
  funds: 520,
  mental: 72,
  english: 55,
  insight: 32,
  stamina: 68,
  relation: 54,
};

export const warningStaminaStats: GameStats = {
  funds: 520,
  mental: 72,
  english: 55,
  insight: 61,
  stamina: 34,
  relation: 54,
};

export const warningFundsStats: GameStats = {
  funds: 240,
  mental: 72,
  english: 55,
  insight: 61,
  stamina: 68,
  relation: 54,
};

export const riskMentalStats: GameStats = {
  funds: 520,
  mental: 18,
  english: 55,
  insight: 61,
  stamina: 68,
  relation: 54,
};

export const riskInsightStats: GameStats = {
  funds: 520,
  mental: 72,
  english: 55,
  insight: 15,
  stamina: 68,
  relation: 54,
};

export const riskStaminaStats: GameStats = {
  funds: 520,
  mental: 72,
  english: 55,
  insight: 61,
  stamina: 16,
  relation: 54,
};

export const fundsRiskStats: GameStats = {
  funds: 95,
  mental: 72,
  english: 55,
  insight: 61,
  stamina: 68,
  relation: 54,
};

export const multiRiskWithFundsStats: GameStats = {
  funds: 88,
  mental: 18,
  english: 55,
  insight: 61,
  stamina: 17,
  relation: 54,
};

export const multiRiskWithoutFundsStats: GameStats = {
  funds: 420,
  mental: 18,
  english: 55,
  insight: 19,
  stamina: 17,
  relation: 54,
};

export const episodeOneStartStats: GameStats = {
  funds: 500,
  mental: 45,
  english: 25,
  insight: 45,
  stamina: 60,
  relation: 40,
};

export const lowConfidenceEpisodeOneStats: GameStats = {
  funds: 500,
  mental: 35,
  english: 25,
  insight: 45,
  stamina: 60,
  relation: 40,
};
