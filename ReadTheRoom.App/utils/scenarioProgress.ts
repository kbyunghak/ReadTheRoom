export type ProgressScenario = {
  id: number;
  type?: string;
  week?: number;
  day?: number;
  mainEpisode?: number;
};

const resolveWeek = (scenario: ProgressScenario) => scenario.week ?? 1;
const resolveDay = (scenario: ProgressScenario) => scenario.day ?? 1;
const padProgressNumber = (value: number) => String(value).padStart(2, '0');

export const getMainEpisodeCount = (
  scenarios: Iterable<ProgressScenario>,
  currentScenario: ProgressScenario,
) => {
  const week = resolveWeek(currentScenario);
  const day = resolveDay(currentScenario);

  return Array.from(scenarios).filter(
    (scenario) =>
      scenario.type === 'NORMAL' &&
      typeof scenario.mainEpisode === 'number' &&
      resolveWeek(scenario) === week &&
      resolveDay(scenario) === day,
  ).length;
};

export const getScenarioHeaderMeta = (
  scenario: ProgressScenario,
  mainEpisodeCount: number,
) => {
  const prefix = `W${resolveWeek(scenario)} · D${resolveDay(scenario)}`;

  if (scenario.type === 'SUMMARY') {
    return `${prefix} Complete`;
  }

  if (scenario.type === 'NORMAL' && typeof scenario.mainEpisode !== 'number') {
    return `${prefix} · Special Event`;
  }

  if (typeof scenario.mainEpisode === 'number') {
    return `${prefix} · EP ${padProgressNumber(scenario.mainEpisode)}/${padProgressNumber(mainEpisodeCount)}`;
  }

  return prefix;
};

export const isRoadmapMainScenario = (scenario: ProgressScenario) =>
  scenario.type === 'NORMAL' && typeof scenario.mainEpisode === 'number';

export const getRoadmapProgressLabel = (scenario: ProgressScenario) => {
  if (typeof scenario.mainEpisode !== 'number') {
    throw new Error(`Scenario ${scenario.id} does not have a mainEpisode`);
  }

  return `DAY ${padProgressNumber(resolveDay(scenario))} · EP ${padProgressNumber(scenario.mainEpisode)}`;
};
