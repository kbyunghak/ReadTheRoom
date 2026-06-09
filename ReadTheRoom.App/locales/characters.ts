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
    jobTitle: { ko: '국제결혼한 새댁', en: 'Newlywed in an International Marriage' },
    image: require('../assets/characters/jina.png'),
    cardImage: require('../assets/characters/jina_card.png'),
    description: {
      ko: [
        '사회생활 만렙처럼 보이지만, 임신과 정착 스트레스가 겹치며 가장 먼저 흔들릴 수 있는 캐릭터입니다.',
        '겉으로는 침착해 보여도 관계 안에서 감정 압박이 커질수록 빠르게 무너질 수 있습니다.',
        '집 안의 분위기와 관계 균형이 플레이 핵심인 관계 중심형 캐릭터입니다.',
      ],
      en: [
        'She looks socially polished, but pregnancy and settlement stress make her the easiest to shake.',
        'She appears calm on the outside, yet emotional pressure inside relationships can break her quickly.',
        'She is a relationship-centered character whose gameplay revolves around managing family tension and stability.',
      ],
    },
    startingStats: { funds: 500, mental: 70, english: 75, insight: 80, stamina: 55, relation: 70 },
    trait: { ko: '관계 중심의 시한폭탄', en: 'A relationship-driven ticking time bomb' },
    specialEffect: {
      ko: '[임산부의 한계] 체력이 30 이하로 떨어지는 순간, 모든 멘탈 감소폭이 2배가 됩니다.',
      en: '[Physical Limit] Once stamina falls to 30 or below, all mental losses are doubled.',
    },
    balanceNote: {
      ko: '체력 소모 1.5배 가중치가 적용됩니다.',
      en: 'Stamina consumption is weighted at 1.5x.',
    },
  },
  {
    id: 'ken',
    tier: 1,
    name: { ko: '켄', en: 'Ken' },
    age: { ko: '20세 (남)', en: '20 (M)' },
    jobTitle: { ko: '유학생', en: 'International Student' },
    image: require('../assets/characters/ken.png'),
    cardImage: require('../assets/characters/ken_card.png'),
    description: {
      ko: [
        '맨땅에 헤딩하듯 밴쿠버에 도착한 20세 유학생입니다.',
        '무시와 거절, 낯선 규칙을 체력으로 버티며 성장하는 전형적인 성장 엔진입니다.',
        '초반은 약하지만 실수를 통해 가장 빠르게 배우는 캐릭터입니다.',
      ],
      en: [
        'A 20-year-old student thrown into Vancouver with almost no footing.',
        'He survives rejection, confusion, and unfamiliar rules through raw endurance and steady growth.',
        'He starts weak, but he learns the fastest through mistakes.',
      ],
    },
    startingStats: { funds: 500, mental: 50, english: 25, insight: 45, stamina: 60, relation: 40 },
    trait: { ko: '고통 성장형 유학생', en: 'A pain-for-growth international student' },
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
    image: require('../assets/characters/amy.png'),
    cardImage: require('../assets/characters/amy_card.png'),
    description: {
      ko: [
        '낯선 곳에도 빠르게 섞여드는 워홀러이자 바리스타입니다.',
        '적응력과 상황 판단력은 뛰어나지만, 사람들과 관계를 유지하기 위해 자본과 에너지를 계속 태웁니다.',
        '눈치와 영어는 강하지만 장기전으로 가면 소모가 큰 유지형 캐릭터입니다.',
      ],
      en: [
        'A working holiday traveler and barista who blends into new spaces quickly.',
        'She adapts fast and reads situations well, but maintaining connections constantly burns money and energy.',
        'Strong in English and social reading, yet costly to sustain over the long run.',
      ],
    },
    startingStats: { funds: 350, mental: 65, english: 70, insight: 85, stamina: 50, relation: 55 },
    trait: { ko: '유지형 소모 인싸', en: 'A social butterfly built on steady depletion' },
    specialEffect: {
      ko: '[사교의 대가] 관계 수치가 70 이상이면 눈치 기반 이벤트에서 추가 자금을 획득할 수 있습니다.',
      en: '[Price of Social Ease] If relation stays above 70, insight-based events can grant extra funds.',
    },
    balanceNote: {
      ko: '관계 수치를 높게 유지할수록 보상이 생기지만 유지 비용도 큽니다.',
      en: 'High relation unlocks rewards, but keeping it high is expensive.',
    },
  },
  {
    id: 'jun',
    tier: 2,
    name: { ko: '준', en: 'Jun' },
    age: { ko: '50세 (남)', en: '50 (M)' },
    jobTitle: { ko: '물류센터 직원', en: 'Warehouse Worker' },
    image: require('../assets/characters/jun.png'),
    cardImage: require('../assets/characters/jun_card.png'),
    description: {
      ko: [
        '물류센터를 버티는 생계형 가장으로, 처음엔 누구보다 단단해 보입니다.',
        '하지만 쉬지 못한 피로가 누적될수록 멘탈과 체력이 함께 무너지기 시작합니다.',
        '한 번은 버텨도 연속 행동이 길어질수록 붕괴가 빨라지는 탱크형 캐릭터입니다.',
      ],
      en: [
        'A warehouse worker and provider who looks tougher than anyone else at first.',
        'But once he cannot rest, fatigue starts breaking both his stamina and mental state together.',
        'He can absorb hardship, yet repeated action without rest causes a fast collapse.',
      ],
    },
    startingStats: { funds: 500, mental: 65, english: 40, insight: 65, stamina: 85, relation: 45 },
    trait: { ko: '누적 붕괴형 탱크', en: 'A tank that collapses through accumulated fatigue' },
    specialEffect: {
      ko: '[누적 피로] 휴식 없이 연속 2회 이상 행동하면 매턴 멘탈 -2, 체력 -2가 추가됩니다.',
      en: '[Accumulated Fatigue] Acting two or more turns in a row without rest adds Mental -2 and Stamina -2 each turn.',
    },
  },
  {
    id: 'sora',
    tier: 2,
    name: { ko: '소라', en: 'Sora' },
    age: { ko: '36세 (여)', en: '36 (F)' },
    jobTitle: { ko: '유학맘', en: 'Study Abroad Mom' },
    image: require('../assets/characters/sora.png'),
    cardImage: require('../assets/characters/sora_card.png'),
    description: {
      ko: [
        '아이를 지키는 것이 전부인 보호자형 캐릭터입니다.',
        '체력은 약하지만 학교와 관계, 위험 신호를 읽는 눈치는 날카롭습니다.',
        '관계 상태가 무너지면 회복 루프까지 막혀버리는 감정 리스크형 캐릭터입니다.',
      ],
      en: [
        'A guardian-type character whose entire world revolves around protecting her child.',
        'Her stamina is low, but her awareness of school life, relationships, and danger signs is sharp.',
        'If her relationships fall apart, even her recovery loop begins to break down.',
      ],
    },
    startingStats: { funds: 500, mental: 50, english: 45, insight: 80, stamina: 40, relation: 55 },
    trait: { ko: '감정 리스크 보호자', en: 'A protector carrying emotional risk' },
    specialEffect: {
      ko: '[모성애] 관계 수치가 멘탈 회복량에 직접 영향을 줍니다. 관계가 높으면 휴식 효율이 크게 오르고, 낮으면 휴식이 막힙니다.',
      en: '[Maternal Instinct] Relation directly affects mental recovery. High relation boosts rest, while low relation can block recovery.',
    },
  },
  {
    id: 'yoon',
    tier: 3,
    name: { ko: '윤', en: 'Yoon' },
    age: { ko: '68세 (여)', en: '68 (F)' },
    jobTitle: { ko: '부모 초청 이민 할머니', en: 'Family-Sponsored Grandmother' },
    image: require('../assets/characters/yoon.png'),
    cardImage: require('../assets/characters/yoon_card.png'),
    description: {
      ko: [
        '직접 움직이는 힘은 약하지만, 사람의 기류와 권력 지형을 읽는 데는 누구보다 강합니다.',
        '딸과 사위 사이, 가족 안의 미묘한 균형을 파악하며 간접적으로 상황을 움직입니다.',
        '실행력 대신 관계의 흐름을 증폭시키는 전략 퍼즐형 캐릭터입니다.',
      ],
      en: [
        'She lacks direct force, but no one reads tension, hierarchy, and emotional currents better.',
        'She understands the subtle balance between family members and influences situations indirectly.',
        'Rather than acting with force, she solves problems by amplifying the flow of relationships.',
      ],
    },
    startingStats: { funds: 450, mental: 60, english: 20, insight: 95, stamina: 30, relation: 50 },
    trait: { ko: '지혜 기반의 전략 퍼즐', en: 'A strategy puzzle built on wisdom' },
    specialEffect: {
      ko: '[간접 영향력] 모든 관계 변화량에 20% 보너스가 적용됩니다. 증가와 감소 모두 포함됩니다.',
      en: '[Indirect Influence] All relation changes receive a 20% modifier, both gains and losses.',
    },
    unlockNote: {
      ko: '지나 스토리를 클리어하면 해금됩니다.',
      en: 'Unlocked after clearing Jina’s story.',
    },
  },
];
