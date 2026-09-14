import { isGameOverFromStats, type GameStats } from '../../utils/gameStats.ts';
import { shouldShowSituationSummary } from '../../utils/questProgress.ts';
import {
  FINAL_CLEAR_SCENARIO_ID,
  type Scenario,
  type ScenarioChoice,
} from '../../utils/scenarioBundle.ts';

export type ChoiceContinuation =
  | { type: 'failure' }
  | { type: 'ending' }
  | { type: 'missing'; nextScenarioId: number }
  | { type: 'advance'; nextScenarioId: number }
  | { type: 'summary'; nextScenarioId: number | null };

export type SummaryMode = 'legacy-generated' | 'json-node';

export const resolveChoiceContinuation = ({
  stats,
  scenario,
  choice,
  nextScenarioExists,
  summaryMode = 'legacy-generated',
}: {
  stats: GameStats;
  scenario: Scenario;
  choice: ScenarioChoice;
  nextScenarioExists: boolean;
  summaryMode?: SummaryMode;
}): ChoiceContinuation => {
  if (isGameOverFromStats(stats)) {
    return { type: 'failure' };
  }

  if (scenario.isEnding) {
    return { type: 'ending' };
  }

  if (!nextScenarioExists) {
    return { type: 'missing', nextScenarioId: choice.nextScenarioId };
  }

  const shouldTriggerSummary =
    summaryMode === 'legacy-generated' &&
    (scenario.isPhaseEnd ?? shouldShowSituationSummary(scenario.id));

  if (shouldTriggerSummary) {
    return {
      type: 'summary',
      nextScenarioId: nextScenarioExists ? choice.nextScenarioId : null,
    };
  }

  return { type: 'advance', nextScenarioId: choice.nextScenarioId };
};

export type SummaryContinuation =
  | { type: 'in_progress'; nextScenarioId: number }
  | { type: 'final_clear' }
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

  if (nextScenarioId === FINAL_CLEAR_SCENARIO_ID) {
    return { type: 'final_clear' };
  }

  if (nextScenarioId === undefined) {
    return { type: 'ending' };
  }

  if (!nextScenarioExists) {
    return { type: 'in_progress', nextScenarioId };
  }

  return { type: 'advance', nextScenarioId };
};

export type SurvivedFinishAction = 'exit_app' | 'character_select';

export const resolveSurvivedFinishAction = (
  platform: string,
): SurvivedFinishAction =>
  platform === 'android' ? 'exit_app' : 'character_select';
