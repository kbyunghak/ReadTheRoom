import type { GameStats } from './gameStats';

export type ConditionLevel = 'risk' | 'warning' | 'stable';

export type StatusDetailTone = {
  funds: string;
  mental: string;
  relation: string;
  english: string;
  stamina: string;
  insight: string;
};

export type ConditionSummary = {
  title: string;
  tone: string;
  description: string;
  color: string;
  icon: string;
};

type ConditionSummaryOptions = {
  episode?: number;
  lang: 'ko' | 'en';
  stats: GameStats;
};

const isKoreanLang = (lang: 'ko' | 'en') => lang === 'ko';

const getStandardTone = (value: number, lang: 'ko' | 'en') => {
  if (value <= 20) return isKoreanLang(lang) ? '위험' : 'Risk';
  if (value <= 40) return isKoreanLang(lang) ? '주의' : 'Care';
  return isKoreanLang(lang) ? '안정' : 'Stable';
};

const getFundsTone = (value: number, lang: 'ko' | 'en') => {
  if (value <= 100) return isKoreanLang(lang) ? '위험' : 'Risk';
  if (value <= 300) return isKoreanLang(lang) ? '주의' : 'Care';
  return isKoreanLang(lang) ? '안정' : 'Stable';
};

const evaluateFunds = (value: number): ConditionLevel => {
  if (value <= 100) return 'risk';
  if (value <= 300) return 'warning';
  return 'stable';
};

const evaluateCore = (value: number): ConditionLevel => {
  if (value <= 20) return 'risk';
  if (value <= 40) return 'warning';
  return 'stable';
};

export const getStatusDetailTone = (stats: GameStats, lang: 'ko' | 'en'): StatusDetailTone => ({
  funds: getFundsTone(stats.funds, lang),
  mental: getStandardTone(stats.mental, lang),
  relation: getStandardTone(stats.relation, lang),
  english: getStandardTone(stats.english, lang),
  stamina: getStandardTone(stats.stamina, lang),
  insight: getStandardTone(stats.insight, lang),
});

export const getConditionSummary = ({
  episode,
  lang,
  stats,
}: ConditionSummaryOptions): ConditionSummary => {
  const isKorean = isKoreanLang(lang);

  if (episode === 1) {
    if (stats.mental <= 40 || stats.insight <= 40 || stats.stamina <= 40) {
      return {
        title: isKorean ? '초긴장' : 'Super Nervous',
        tone: isKorean ? '초긴장' : 'Super Nervous',
        description: isKorean
          ? '드디어 시작이군요. 심호흡 한 번 하세요.'
          : 'It is finally starting. Take one deep breath.',
        color: '#F0D44E',
        icon: 'emoticon-excited-outline',
      };
    }

    return {
      title: isKorean ? '설레임' : 'Full of Excitement',
      tone: isKorean ? '설레임' : 'Full of Excitement',
      description: isKorean
        ? '공항 도착. 벌써 설레이네요.'
        : 'You made it to the airport. It already feels exciting.',
      color: '#4F8DFF',
      icon: 'airplane-takeoff',
    };
  }

  const frontStats = {
    funds: evaluateFunds(stats.funds),
    mental: evaluateCore(stats.mental),
    insight: evaluateCore(stats.insight),
    stamina: evaluateCore(stats.stamina),
  };

  const riskKeys = (Object.keys(frontStats) as Array<keyof typeof frontStats>).filter(
    (key) => frontStats[key] === 'risk',
  );

  const statCopy = {
    funds: {
      risk: {
        tone: isKorean ? '통장 한파' : 'Cash Freeze',
        description: isKorean ? '작은 지출도 부담되는 상태예요.' : 'Even small expenses feel heavy.',
        color: '#F0D44E',
        icon: 'currency-usd',
      },
      warning: {
        tone: isKorean ? '지갑 조심' : 'Watch Your Wallet',
        description: isKorean ? '돈 쓸 때 한 번 더 고민하게 돼요.' : 'You pause before every spend.',
        color: '#F0D44E',
        icon: 'wallet-outline',
      },
    },
    mental: {
      risk: {
        tone: isKorean ? '멘붕 직전' : 'Near Burnout',
        description: isKorean ? '작은 일에도 쉽게 흔들려요.' : 'Small things can throw you off.',
        color: '#4F8DFF',
        icon: 'brain',
      },
      warning: {
        tone: isKorean ? '흔들림' : 'Shaken',
        description: isKorean ? '긴장 때문에 선택이 조심스러워져요.' : 'Tension makes every choice feel careful.',
        color: '#4F8DFF',
        icon: 'brain',
      },
    },
    insight: {
      risk: {
        tone: isKorean ? '신호 놓침' : 'Missing Signals',
        description: isKorean ? '분위기와 힌트를 놓치기 쉬워요.' : 'It is easy to miss the mood and clues.',
        color: '#F0BE63',
        icon: 'eye-outline',
      },
      warning: {
        tone: isKorean ? '관찰 필요' : 'Observe More',
        description: isKorean ? '상황을 조금 더 살펴봐야 해요.' : 'This moment needs more observation.',
        color: '#F0BE63',
        icon: 'eye-outline',
      },
    },
    stamina: {
      risk: {
        tone: isKorean ? '방전 임박' : 'Low Battery',
        description: isKorean ? '기력이 빠르게 떨어져요.' : 'Your energy is dropping fast.',
        color: '#4CC26A',
        icon: 'battery-high',
      },
      warning: {
        tone: isKorean ? '숨 고르는 중' : 'Catching Breath',
        description: isKorean ? '무리하면 금방 지칠 수 있어요.' : 'Push too hard and you will tire fast.',
        color: '#4CC26A',
        icon: 'battery-high',
      },
    },
  } as const;

  if (riskKeys.length >= 3) {
    return {
      title: isKorean ? '생존 경보' : 'Survival Alert',
      tone: isKorean ? '생존 경보' : 'Survival Alert',
      description: isKorean
        ? '지금은 무리보다 회복이 필요한 순간이에요.'
        : 'Recovery matters more than pushing right now.',
      color: '#FF8A5B',
      icon: 'alert-octagram',
    };
  }

  if (riskKeys.length >= 2 && riskKeys.includes('funds')) {
    return {
      title: isKorean ? '생존 압박' : 'Survival Pressure',
      tone: isKorean ? '생존 압박' : 'Survival Pressure',
      description: isKorean
        ? '선택 하나하나가 부담되는 상태예요.'
        : 'Every choice feels heavier right now.',
      color: '#F0D44E',
      icon: 'cash-alert',
    };
  }

  if (riskKeys.length >= 2) {
    return {
      title: isKorean ? '비상 모드' : 'Emergency Mode',
      tone: isKorean ? '비상 모드' : 'Emergency Mode',
      description: isKorean
        ? '여러 상태가 동시에 흔들리고 있어요.'
        : 'Several core states are slipping at once.',
      color: '#F26F97',
      icon: 'alert-decagram',
    };
  }

  if (riskKeys.length === 1) {
    const key = riskKeys[0];
    const copy = statCopy[key].risk;
    return {
      title: copy.tone,
      ...copy,
    };
  }

  const warningPriority: Array<'mental' | 'insight' | 'stamina' | 'funds'> = [
    'mental',
    'insight',
    'stamina',
    'funds',
  ];
  const warningKey = warningPriority.find((key) => frontStats[key] === 'warning');

  if (warningKey) {
    const copy = statCopy[warningKey].warning;
    return {
      title: copy.tone,
      ...copy,
    };
  }

  return {
    title: isKorean ? '완벽 적응' : 'Fully Settled',
    tone: isKorean ? '완벽 적응' : 'Fully Settled',
    description: isKorean
      ? '지금 흐름을 꽤 잘 타고 있어요.'
      : 'You are riding the flow really well.',
    color: '#4CC26A',
    icon: 'check-decagram',
  };
};
