import type { Scenario } from './scenarioRegistry';

export type ScenarioDisplayLanguage = 'en' | 'ko';

const INTERNAL_TITLE_SUFFIXES = {
  ko: [/\s*\(예외\)\s*$/u],
  en: [/\s*\(Exception\)\s*$/iu],
} as const;

const resolveRawTitle = (scenario: Scenario, lang: ScenarioDisplayLanguage) => {
  if (scenario.title) {
    return scenario.title[lang];
  }

  if (typeof scenario.situation === 'object' && scenario.situation) {
    return scenario.situation[lang];
  }

  if (lang === 'ko') {
    return scenario.situation || scenario.situationEN || '';
  }

  return scenario.situationEN || scenario.situation || '';
};

const removeInternalTitleSuffix = (title: string, lang: ScenarioDisplayLanguage) =>
  INTERNAL_TITLE_SUFFIXES[lang].reduce((displayTitle, suffix) => displayTitle.replace(suffix, ''), title).trim();

export const getScenarioDisplayTitle = (
  scenario: Scenario,
  lang: ScenarioDisplayLanguage,
) => {
  const day = scenario.day ?? 1;

  if (scenario.type === 'SUMMARY') {
    return lang === 'ko' ? `Day ${day} 종료` : `Day ${day} Complete`;
  }

  return removeInternalTitleSuffix(resolveRawTitle(scenario, lang), lang);
};

export const getScenarioHeaderTitle = (
  scenario: Scenario,
  lang: ScenarioDisplayLanguage,
) => {
  const day = scenario.day ?? 1;

  if (scenario.type === 'SUMMARY') {
    return lang === 'ko' ? `[Day ${day}] 종료` : `[Day ${day}] Complete`;
  }

  if (scenario.type === 'NORMAL' && typeof scenario.mainEpisode !== 'number') {
    const specialTitle = getScenarioDisplayTitle(scenario, lang);
    return specialTitle
      ? `[Day ${day}] ${specialTitle}`
      : lang === 'ko'
        ? `[Day ${day}] 특별 이벤트`
        : `[Day ${day}] Special Event`;
  }

  const episode = scenario.mainEpisode ?? scenario.episode;
  const displayTitle = getScenarioDisplayTitle(scenario, lang);
  if (typeof episode === 'number') {
    return `[Day ${day}] EP ${String(episode).padStart(2, '0')}: ${displayTitle}`;
  }

  return `[Day ${day}] ${displayTitle}`;
};
