import { isGameOverFromStats, type GameStats } from '../../utils/gameStats.ts';
import { shouldShowSituationSummary } from '../../utils/questProgress.ts';
import type {
  Scenario,
  ScenarioChoice,
} from '../../utils/scenarioBundle.ts';

export type ChoiceContinuation =
  | { type: 'failure' }
  | { type: 'ending' }
  | { type: 'advance'; nextScenarioId: number }
  | { type: 'summary'; nextScenarioId: number | null };

export const resolveChoiceContinuation = ({
  stats,
  scenario,
  choice,
  nextScenarioExists,
}: {
  stats: GameStats;
  scenario: Scenario;
  choice: ScenarioChoice;
  nextScenarioExists: boolean;
}): ChoiceContinuation => {
  if (isGameOverFromStats(stats)) {
    return { type: 'failure' };
  }

  if (scenario.isEnding) {
    return { type: 'ending' };
  }

  const shouldTriggerSummary =
    scenario.isPhaseEnd ?? shouldShowSituationSummary(scenario.id);

  if (shouldTriggerSummary) {
    return {
      type: 'summary',
      nextScenarioId: nextScenarioExists ? choice.nextScenarioId : null,
    };
  }

  return { type: 'advance', nextScenarioId: choice.nextScenarioId };
};

export type SummaryContinuation =
  | { type: 'missing'; nextScenarioId: number }
  | { type: 'advance'; nextScenarioId: number }
  | { type: 'ending' };

export const resolveSummaryContinuation = ({
  scenario,
  nextScenarioExists,
}: {
  scenario: Scenario;
  nextScenarioExists: boolean;
}): SummaryContinuation => {
  const nextScenarioId = scenario.nextScenarioId;

  if (nextScenarioId === undefined) {
    return { type: 'ending' };
  }

  if (!nextScenarioExists) {
    return { type: 'missing', nextScenarioId };
  }

  return { type: 'advance', nextScenarioId };
};
