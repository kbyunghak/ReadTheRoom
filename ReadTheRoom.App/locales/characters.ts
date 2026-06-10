import type { Character } from './types';

export type {
  AppLanguage,
  Character,
  CharacterStat,
  LocalizedText,
  StartingStats,
  StatKey,
} from './types';

export const CHARACTERS: Character[] = [
  {
    id: 'jina',
    tier: 1,
    name: { ko: '지나', en: 'Jina' },
    age: { ko: '32세 (여)', en: '32 (F)' },
    jobTitle: {
      ko: '국제결혼한 새댁',
      en: 'Newlywed in an International Marriage',
    },
    image: require('../assets/images/characters/jina.png'),
    cardImage: require('../assets/images/characters/jina_card.png'),
    description: {
      ko: [
        '국제결혼 후 밴쿠버에서 새로운 생활을 시작한 새댁입니다.',
        '영어와 눈치는 좋은 편이지만, 가족 관계와 정착 스트레스가 겹치면 쉽게 지칠 수 있습니다.',
        '집 안의 분위기, 배우자와의 대화, 자신의 회복 사이에서 균형을 잡는 것이 핵심인 관계 중심형 캐릭터입니다.',
      ],
      en: [
        'A newlywed who has started a new life in Vancouver after an international marriage.',
        'She has strong English and social awareness, but family pressure and settlement stress can wear her down.',
        'Her story focuses on balancing home atmosphere, communication with her partner, and her own recovery.',
      ],
    },
    startingStats: {
      funds: 500,
      mental: 70,
      english: 75,
      insight: 80,
      stamina: 55,
      relation: 70,
    },
    trait: {
      ko: '관계 균형형 새출발 캐릭터',
      en: 'A relationship-balancing new-start character',
    },
    specialEffect: {
      ko: '[몸의 신호] 체력이 30 이하로 떨어지면 멘탈 감소폭이 증가합니다.',
      en: '[Body Signal] When stamina drops to 30 or below, mental losses increase.',
    },
    balanceNote: {
      ko: '관계와 멘탈은 안정적이지만, 체력 관리가 중요합니다.',
      en: 'Her relation and mental stats are stable, but stamina management is important.',
    },
  },
  {
    id: 'ken',
    tier: 1,
    name: { ko: '켄', en: 'Ken' },
    age: { ko: '20세 (남)', en: '20 (M)' },
    jobTitle: { ko: '유학생', en: 'International Student' },
    image: require('../assets/images/characters/ken.png'),
    cardImage: require('../assets/images/characters/ken_card.png'),
    description: {
      ko: [
        '밴쿠버에 막 도착한 20세 유학생입니다.',
        '낯선 규칙, 어색한 영어, 예상치 못한 거절을 겪으며 조금씩 적응해갑니다.',
        '처음엔 서툴지만 직접 부딪히고 움직이며 가장 빠르게 성장하는 캐릭터입니다.',
      ],
      en: [
        'A 20-year-old international student newly arrived in Vancouver.',
        'He faces unfamiliar rules, awkward English moments, and unexpected rejection as he slowly adapts.',
        'He starts off inexperienced, but grows the fastest by learning through real situations.',
      ],
    },
    startingStats: {
      funds: 500,
      mental: 50,
      english: 25,
      insight: 45,
      stamina: 60,
      relation: 40,
    },
    trait: { ko: '초보 성장형 유학생', en: 'Beginner Growth Student' },
    specialEffect: {
      ko: '[젊은 패기] 성장형 선택에서 획득하는 영어와 눈치 수치에 20% 보너스를 받습니다.',
      en: '[Young Drive] Gains 20% bonus English and Insight from growth-oriented choices.',
    },
    balanceNote: {
      ko: '초반 수치는 낮지만 성장 효율이 가장 높습니다.',
      en: 'Low starting values, but the strongest growth efficiency.',
    },
  },
  {
    id: 'amy',
    tier: 1,
    name: { ko: '에이미', en: 'Amy' },
    age: { ko: '26세 (여)', en: '26 (F)' },
    jobTitle: { ko: '워홀러 겸 바리스타', en: 'Working Holiday Barista' },
    image: require('../assets/images/characters/amy.png'),
    cardImage: require('../assets/images/characters/amy_card.png'),
    description: {
      ko: [
        '카페에서 일하며 새로운 도시의 일상과 관계를 빠르게 익혀가는 워홀러입니다.',
        '영어와 눈치는 강하지만, 사람들과의 관계를 유지하려면 자금과 에너지를 꾸준히 써야 합니다.',
        '초반 적응은 빠르지만 장기전에서는 돈, 체력, 관계의 균형 관리가 중요한 캐릭터입니다.',
      ],
      en: [
        'A working holiday barista learning the rhythm of work, daily life, and relationships in a new city.',
        'She is strong in English and social awareness, but keeping relationships requires steady money and energy.',
        'She adapts quickly early on, but long-term success depends on balancing money, stamina, and relationships.',
      ],
    },
    startingStats: {
      funds: 350,
      mental: 65,
      english: 70,
      insight: 85,
      stamina: 50,
      relation: 55,
    },
    trait: {
      ko: '빠른 적응형 워홀러',
      en: 'Fast-Adapting Working Holiday Traveler',
    },
    specialEffect: {
      ko: '[사교 감각] 관계 수치가 70 이상이면 눈치 기반 이벤트에서 추가 자금을 획득할 수 있습니다.',
      en: '[Social Sense] If relation stays above 70, insight-based events can grant extra funds.',
    },
    balanceNote: {
      ko: '관계를 잘 유지하면 보상이 생기지만, 자금과 체력 관리가 중요합니다.',
      en: 'Strong relationships can unlock rewards, but money and stamina must be managed carefully.',
    },
  },
  {
    id: 'jun',
    tier: 2,
    name: { ko: '준', en: 'Jun' },
    age: { ko: '50세 (남)', en: '50 (M)' },
    jobTitle: { ko: '물류센터 직원', en: 'Warehouse Worker' },
    image: require('../assets/images/characters/jun.png'),
    cardImage: require('../assets/images/characters/jun_card.png'),
    description: {
      ko: [
        '물류센터에서 일하며 가족과 생계를 책임지는 캐릭터입니다.',
        '처음에는 누구보다 단단하게 버티지만, 휴식 없이 움직이면 피로가 빠르게 쌓입니다.',
        '강한 체력으로 어려운 상황을 견디되, 무리하지 않는 판단이 중요한 버티기형 캐릭터입니다.',
      ],
      en: [
        'A warehouse worker who carries responsibility for his family and livelihood.',
        'He can endure more than most at first, but fatigue builds quickly without rest.',
        'He is a resilient character who can push through hardship, but careful pacing is essential.',
      ],
    },
    startingStats: {
      funds: 500,
      mental: 65,
      english: 40,
      insight: 65,
      stamina: 85,
      relation: 45,
    },
    trait: {
      ko: '체력 기반의 버티기형 캐릭터',
      en: 'A stamina-based endurance character',
    },
    specialEffect: {
      ko: '[누적 피로] 휴식 없이 연속 2회 이상 행동하면 매턴 멘탈 -2, 체력 -2가 추가됩니다.',
      en: '[Accumulated Fatigue] Acting two or more turns in a row without rest adds Mental -2 and Stamina -2 each turn.',
    },
    balanceNote: {
      ko: '체력은 높지만, 연속 행동이 길어질수록 손실이 커집니다.',
      en: 'High stamina, but repeated actions without rest increase losses.',
    },
  },
  {
    id: 'sora',
    tier: 2,
    name: { ko: '소라', en: 'Sora' },
    age: { ko: '36세 (여)', en: '36 (F)' },
    jobTitle: { ko: '유학맘', en: 'Study Abroad Mom' },
    image: require('../assets/images/characters/sora.png'),
    cardImage: require('../assets/images/characters/sora_card.png'),
    description: {
      ko: [
        '아이와 함께 새로운 환경에 적응해가는 보호자형 캐릭터입니다.',
        '체력은 낮지만 학교, 관계, 위험 신호를 읽는 눈치가 뛰어납니다.',
        '아이를 지키는 선택과 자신의 회복 사이에서 균형을 잡아야 하는 캐릭터입니다.',
      ],
      en: [
        'A guardian-type character adapting to a new environment with her child.',
        'Her stamina is low, but she is highly aware of school life, relationships, and warning signs.',
        'Her story is about balancing protection, relationships, and her own recovery.',
      ],
    },
    startingStats: {
      funds: 500,
      mental: 50,
      english: 45,
      insight: 80,
      stamina: 40,
      relation: 55,
    },
    trait: {
      ko: '관계와 회복을 중시하는 보호자',
      en: 'A guardian focused on relationships and recovery',
    },
    specialEffect: {
      ko: '[보호자의 감각] 관계 수치가 높을수록 휴식과 멘탈 회복 효율이 증가합니다.',
      en: '[Guardian Sense] Higher relation improves rest and mental recovery efficiency.',
    },
    balanceNote: {
      ko: '눈치는 높지만 체력이 낮아, 무리하지 않는 선택이 중요합니다.',
      en: 'High insight, but low stamina. Careful pacing is important.',
    },
  },
  {
    id: 'yoon',
    tier: 3,
    name: { ko: '윤', en: 'Yoon' },
    age: { ko: '68세 (여)', en: '68 (F)' },
    jobTitle: {
      ko: '부모 초청 이민 할머니',
      en: 'Family-Sponsored Grandmother',
    },
    image: require('../assets/images/characters/yoon.png'),
    cardImage: require('../assets/images/characters/yoon_card.png'),
    description: {
      ko: [
        '직접 움직이는 힘은 약하지만, 사람의 기류와 관계의 흐름을 읽는 데 강한 캐릭터입니다.',
        '딸과 사위 사이, 가족 안의 미묘한 균형을 파악하며 상황을 간접적으로 움직입니다.',
        '실행력보다 지혜와 관찰력을 활용하는 전략 퍼즐형 캐릭터입니다.',
      ],
      en: [
        'She lacks direct force, but she is strong at reading emotional currents and relationship dynamics.',
        'She understands the subtle balance between family members and influences situations indirectly.',
        'She is a strategy-puzzle character who relies more on wisdom and observation than direct action.',
      ],
    },
    startingStats: {
      funds: 450,
      mental: 60,
      english: 20,
      insight: 95,
      stamina: 30,
      relation: 50,
    },
    trait: {
      ko: '지혜 기반의 전략 퍼즐',
      en: 'A strategy puzzle built on wisdom',
    },
    specialEffect: {
      ko: '[간접 영향력] 모든 관계 변화량에 20% 보너스가 적용됩니다. 증가와 감소 모두 포함됩니다.',
      en: '[Indirect Influence] All relation changes receive a 20% modifier, both gains and losses.',
    },
    balanceNote: {
      ko: '직접 행동 능력은 낮지만, 관계와 눈치를 활용한 선택에서 강합니다.',
      en: 'Low direct action ability, but strong in choices involving relationships and insight.',
    },
    unlockNote: {
      ko: '지나 스토리를 클리어하면 해금됩니다.',
      en: 'Unlocked after clearing Jina’s story.',
    },
  },
];

const BETA_CHARACTER_IDS = ['ken', 'amy', 'sora'] as const;

export const BETA_CHARACTERS: Character[] = BETA_CHARACTER_IDS.map((id) => {
  const character = CHARACTERS.find((candidate) => candidate.id === id);

  if (!character) {
    throw new Error(`Missing beta character definition: ${id}`);
  }

  return character;
});
