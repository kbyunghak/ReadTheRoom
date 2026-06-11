import type {
  LocalizedText,
  ScenarioChoice,
  ScenarioStatChanges,
} from './scenarioRegistry';

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
  resultTone: 'good' | 'mid' | 'bad';
  resultLabel: string;
  resultSummary: string;
  changedStats: ResultStatEntry[];
  tipText: string | null;
};

const RESULT_STAT_ORDER: ResultStatKey[] = [
  'funds',
  'mental',
  'english',
  'insight',
  'stamina',
  'relation',
];

export const splitChoiceText = (text: string): ResultChoiceTextParts => {
  const trimmed = text.trim();
  const match = trimmed.match(/^(\([^)]+\)|\[[^\]]+\])\s*(.+)$/);

  if (!match) {
    return { cue: null, body: trimmed };
  }

  return { cue: match[1], body: match[2] };
};

export const stripChoiceCue = (cue: string | null) => {
  if (!cue) return null;
  return cue
    .replace(/^[([]\s*/, '')
    .replace(/\s*[)\]]$/, '')
    .trim();
};

export const buildSelectedChoiceText = (text: string) => {
  const choiceCopy = splitChoiceText(text);
  const cueText = stripChoiceCue(choiceCopy.cue);
  return cueText ? `${cueText} ${choiceCopy.body}` : choiceCopy.body;
};

export const getChangedStatEntries = (
  statChanges: ScenarioStatChanges,
): ResultStatEntry[] =>
  RESULT_STAT_ORDER.map((statKey) => ({
    statKey,
    value: statChanges[statKey] ?? 0,
  })).filter((entry) => entry.value !== 0);

export const getLocalizedTip = (
  tip: LocalizedText | undefined,
  lang: ResultCardLanguage,
) => tip?.[lang] ?? null;

export const getResultTone = (
  statChanges: ScenarioStatChanges,
): ResultCardData['resultTone'] => {
  const total = Object.values(statChanges).reduce(
    (sum, value) => sum + (value ?? 0),
    0,
  );
  if (total > 0) return 'good';
  if (total < 0) return 'bad';
  return 'mid';
};

const RESULT_COPY = {
  ko: {
    good: {
      label: '성공',
      summary: '상황을 잘 풀어냈어요. 좋은 흐름을 이어가고 있습니다.',
    },
    mid: {
      label: '부분 성공',
      summary: '의도는 전달됐지만 조금 아쉬움이 남았어요.',
    },
    bad: {
      label: '실패',
      summary: '상황이 어려워졌지만 다음 선택에서 다시 만회할 수 있어요.',
    },
  },
  en: {
    good: {
      label: 'Success',
      summary:
        'You handled the situation well and kept the momentum going.',
    },
    mid: {
      label: 'Partial Success',
      summary: 'Your intent came through, but there is still room to improve.',
    },
    bad: {
      label: 'Failed',
      summary:
        'The situation became harder, but the next choice is another chance.',
    },
  },
} as const;

export const buildResultCardData = (
  choice: ScenarioChoice,
  lang: ResultCardLanguage,
  tip?: LocalizedText,
): ResultCardData => {
  const resultTone = getResultTone(choice.statChanges);
  const resultCopy = RESULT_COPY[lang][resultTone];

  return {
    selectedText: buildSelectedChoiceText(choice.text[lang]),
    feedbackText: choice.feedback[lang],
    resultTone,
    resultLabel: resultCopy.label,
    resultSummary: resultCopy.summary,
    changedStats: getChangedStatEntries(choice.statChanges),
    tipText: getLocalizedTip(tip, lang),
  };
};
