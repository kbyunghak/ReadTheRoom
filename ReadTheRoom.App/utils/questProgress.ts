export const shouldShowSituationSummary = (currentScenarioId?: number | null) => {
  if (!currentScenarioId) return false;
  return currentScenarioId % 5 === 0;
};
