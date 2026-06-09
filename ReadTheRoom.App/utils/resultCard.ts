import type { LocalizedText, ScenarioChoice, ScenarioStatChanges } from './scenarioRegistry';

export type ResultCardLanguage = 'en' | 'ko';

export type ResultStatKey = keyof ScenarioStatChanges;

export type ResultChoiceTextParts = {
  cue: string | null;
  body: string;
};

export type ResultStatEntry = {
  statKey: ResultStatKey;
  value: number;
};

export type ResultCardData = {
  selectedText: string;
  feedbackText: string;
  changedStats: ResultStatEntry[];
  tipText: string | null;
};

const RESULT_STAT_ORDER: ResultStatKey[] = ['funds', 'mental', 'english', 'insight', 'stamina', 'relation'];

export const splitChoiceText = (text: string): ResultChoiceTextParts => {
  const trimmed = text.trim();
  const match = trimmed.match(/^(\([^)]+\)|\[[^\]]+\])\s*(.+)$/);

  if (!match) {
    return {
      cue: null,
      body: trimmed,
    };
  }

  return {
    cue: match[1],
    body: match[2],
  };
};

export const stripChoiceCue = (cue: string | null) => {
  if (!cue) return null;
  return cue.replace(/^[([]\s*/, '').replace(/\s*[)\]]$/, '').trim();
};

export const buildSelectedChoiceText = (text: string) => {
  const choiceCopy = splitChoiceText(text);
  const cueText = stripChoiceCue(choiceCopy.cue);
  return cueText ? `${cueText} ${choiceCopy.body}` : choiceCopy.body;
};

export const getChangedStatEntries = (statChanges: ScenarioStatChanges): ResultStatEntry[] =>
  RESULT_STAT_ORDER
    .map((statKey) => ({
      statKey,
      value: statChanges[statKey] ?? 0,
    }))
    .filter((entry) => entry.value !== 0);

export const getLocalizedTip = (tip: LocalizedText | undefined, lang: ResultCardLanguage) => tip?.[lang] ?? null;

export const buildResultCardData = (
  choice: ScenarioChoice,
  lang: ResultCardLanguage,
  tip?: LocalizedText,
): ResultCardData => ({
  selectedText: buildSelectedChoiceText(choice.text[lang]),
  feedbackText: choice.feedback[lang],
  changedStats: getChangedStatEntries(choice.statChanges),
  tipText: getLocalizedTip(tip, lang),
});
