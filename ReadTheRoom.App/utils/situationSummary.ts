import type { LocalizedText, ScenarioChoice } from './scenarioRegistry';

export type SummaryVariant = 'good' | 'mid' | 'bad';

export type SituationSummary = {
  variant: SummaryVariant;
  expression: LocalizedText;
  englishDelta: number;
  adaptationDelta: number;
  title: {
    ko: string;
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
};

const getScore = (choices: ScenarioChoice[]) => {
  return choices.reduce((total, choice) => {
    const { funds, mental, english, insight, stamina } = choice.statChanges;
    return total + english + insight + mental + Math.round(stamina * 0.5) + Math.round(funds / 20);
  }, 0);
};

const getVariant = (score: number): SummaryVariant => {
  if (score >= 35) return 'good';
  if (score >= 5) return 'mid';
  return 'bad';
};

export const buildSituationSummary = ({
  situationTitle,
  expression,
  choices,
}: {
  situationTitle: LocalizedText;
  expression: LocalizedText;
  choices: ScenarioChoice[];
}): SituationSummary => {
  const englishDelta = choices.reduce((sum, choice) => sum + choice.statChanges.english, 0);
  const adaptationDelta = Math.round(
    choices.reduce((sum, choice) => sum + choice.statChanges.insight + choice.statChanges.mental, 0) / 2
  );
  const variant = getVariant(getScore(choices));

  const content = {
    good: {
      title: {
        ko: '완벽한 현지화!',
        en: 'Smooth and Natural!',
      },
      description: {
        ko: `${situationTitle.ko} 상황을 꽤 자연스럽게 넘겼어요.`,
        en: `You handled ${situationTitle.en} naturally.`,
      },
    },
    mid: {
      title: {
        ko: '나쁘지 않아요',
        en: 'Not Bad at All',
      },
      description: {
        ko: `${situationTitle.ko} 상황은 무난하게 지나갔어요.`,
        en: `${situationTitle.en} went fairly well.`,
      },
    },
    bad: {
      title: {
        ko: '어색한 침묵...',
        en: 'An Awkward Miss...',
      },
      description: {
        ko: `${situationTitle.ko} 상황에서 긴장감이 드러났어요.`,
        en: `The tension showed in ${situationTitle.en}.`,
      },
    },
  } as const;

  return {
    variant,
    expression,
    englishDelta,
    adaptationDelta,
    title: content[variant].title,
    description: content[variant].description,
  };
};
