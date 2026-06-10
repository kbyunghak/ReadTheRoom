import type { DayMeta, ScenarioNode } from '../../scenarioTypes';

export const kenWeek1Day1Meta: DayMeta = {
  week: 1,
  day: 1,
  title: {
    ko: '밴쿠버 도착 첫날',
    en: 'First Day in Vancouver',
  },
  // Sample only: this file currently contains 2 main episodes.
  // When the full current Ken Day1 is moved from JSON, set this to the actual main episode count.
  mainEpisodeCount: 2,
  roadmapGroupTitle: {
    ko: 'VISA / VISAS · PAGE 1',
    en: 'VISA / VISAS · PAGE 1',
  },
};

export const kenWeek1Day1Scenarios: ScenarioNode[] = [
  {
    id: 1,
    type: 'NORMAL',
    week: 1,
    day: 1,
    mainEpisode: 1,
    title: {
      ko: '비행기 안, 착륙의 환호',
      en: 'Inside the Plane, The Landing Cheers',
    },
    backgroundKey: 'plane_landing',
    description: {
      ko: '12시간의 비행 끝에 비행기가 밴쿠버 공항에 부드럽게 내려앉습니다. 그 순간, 주변 승객들이 약속이라도 한 듯 박수를 치고 환호합니다. 켄은 멍하니 주변을 둘러봅니다.',
      en: 'After a 12-hour flight, the plane lands smoothly at Vancouver Airport. Suddenly, passengers around Ken start clapping and cheering. Ken looks around, confused.',
    },
    tip: {
      ko: '오늘의 생존 지식: 북미 항공편에서는 안전한 착륙 후 박수를 치는 승객들이 종종 있습니다.',
      en: 'Survival Tip: On some North American flights, passengers may clap after a safe landing.',
    },
    choices: [
      {
        type: 'GROWTH',
        text: {
          ko: '신기한 듯 주변 사람들을 따라 박수를 친다.',
          en: 'Clap along with everyone, still confused.',
        },
        feedback: {
          ko: '켄도 어색하게 박수를 칩니다. 이유는 모르겠지만, 일단 캐나다식 분위기에 탑승했습니다.',
          en: 'Ken claps awkwardly. He does not know why, but at least he joined the Canadian mood.',
        },
        statChanges: {
          funds: 0,
          mental: 10,
          english: 0,
          insight: 15,
          stamina: 0,
          relation: 5,
        },
        nextScenarioId: 2,
      },
      {
        type: 'STABLE',
        text: {
          ko: '조용히 미소만 지으며 상황을 관찰한다.',
          en: 'Smile quietly and observe the situation.',
        },
        feedback: {
          ko: '켄은 조용히 분위기를 읽습니다. 첫 문화 충격을 무사히 넘겼습니다.',
          en: 'Ken quietly reads the room. First culture shock survived.',
        },
        statChanges: {
          funds: 0,
          mental: 5,
          english: 0,
          insight: 10,
          stamina: 0,
          relation: 0,
        },
        nextScenarioId: 2,
      },
      {
        type: 'REALIST',
        text: {
          ko: '혹시 비상 상황인가 싶어 창밖과 승무원을 번갈아 본다.',
          en: 'Check the window and flight attendant, wondering if something is wrong.',
        },
        feedback: {
          ko: '아무 일도 없습니다. 켄은 착륙보다 박수 문화가 더 무섭다는 걸 배웠습니다.',
          en: 'Nothing is wrong. Ken learns that applause culture is scarier than landing.',
        },
        statChanges: {
          funds: 0,
          mental: -5,
          english: 0,
          insight: 5,
          stamina: 0,
          relation: 0,
        },
        nextScenarioId: 2,
      },
    ],
  },
  {
    id: 2,
    type: 'NORMAL',
    week: 1,
    day: 1,
    mainEpisode: 2,
    title: {
      ko: '공항 심사대, 첫 영어 보스전',
      en: 'Immigration Desk, The First English Boss Fight',
    },
    backgroundKey: 'airport',
    description: {
      ko: '입국 심사 줄이 점점 짧아집니다. 켄의 차례가 오자 무표정한 심사관이 묻습니다. “Purpose of visit and duration of stay?” 켄의 머릿속 문장들이 동시에 뛰쳐나오려다 서로 부딪힙니다.',
      en: 'The immigration line gets shorter. When Ken steps forward, the officer asks, “Purpose of visit and duration of stay?” All the sentences Ken prepared rush into his head at once and crash into each other.',
    },
    tip: {
      ko: '오늘의 생존 지식: 입국 심사에서는 짧고 정확한 답변이 가장 안전합니다.',
      en: 'Survival Tip: At immigration, short and clear answers are usually safest.',
    },
    choices: [
      {
        type: 'GROWTH',
        text: {
          ko: '짧게 말한다. “Study. Four years. UBC.”',
          en: 'Answer shortly: “Study. Four years. UBC.”',
        },
        feedback: {
          ko: '문법은 완벽하지 않지만 핵심은 정확했습니다. 심사관이 도장을 찍습니다.',
          en: 'The grammar was not perfect, but the point was clear. The officer stamps the passport.',
        },
        statChanges: {
          funds: 0,
          mental: 10,
          english: 15,
          insight: 15,
          stamina: -5,
          relation: 0,
        },
        nextScenarioId: 1001,
      },
      {
        type: 'STABLE',
        text: {
          ko: '입학 허가서부터 조심스럽게 내민다.',
          en: 'Carefully hand over the admission letter first.',
        },
        feedback: {
          ko: '서류는 도움이 됐지만, 심사관은 다시 묻습니다. “말로 대답해 주세요.”',
          en: 'The document helps, but the officer asks again. “Please answer verbally.”',
        },
        statChanges: {
          funds: 0,
          mental: -25,
          english: -5,
          insight: 0,
          stamina: -10,
          relation: 0,
        },
        nextScenarioId: 9001,
      },
      {
        type: 'REALIST',
        text: {
          ko: '핸드폰 번역기를 켜려고 주머니에 손을 넣는다.',
          en: 'Reach for the phone to open a translator.',
        },
        feedback: {
          ko: '심사관의 눈썹이 올라갑니다. 켄은 공항에서 휴대폰을 꺼내는 타이밍도 생존 기술이라는 걸 깨닫습니다.',
          en: 'The officer raises an eyebrow. Ken realizes that even knowing when to pull out a phone is a survival skill at the airport.',
        },
        statChanges: {
          funds: 0,
          mental: -40,
          english: 0,
          insight: -20,
          stamina: -10,
          relation: 0,
        },
        nextScenarioId: 9001,
      },
    ],
  },
  {
    id: 9001,
    type: 'NORMAL',
    week: 1,
    day: 1,
    title: {
      ko: '정밀 심사실의 차가운 의자',
      en: 'The Cold Chair in Secondary Inspection',
    },
    backgroundKey: 'airport_office',
    description: {
      ko: '켄은 작은 방으로 안내됩니다. 의자는 차갑고, 벽시계 소리는 이상하게 크게 들립니다.',
      en: 'Ken is led into a small room. The chair is cold, and the wall clock sounds strangely loud.',
    },
    tip: {
      ko: '오늘의 생존 지식: 정밀 심사로 가더라도 침착하게 목적, 학교, 체류 기간을 짧게 말하면 됩니다.',
      en: 'Survival Tip: Even in secondary inspection, stay calm and briefly explain your purpose, school, and stay duration.',
    },
    choices: [
      {
        type: 'GROWTH',
        text: {
          ko: '떨리지만 다시 짧게 대답한다.',
          en: 'Answer again, short and shaky.',
        },
        feedback: {
          ko: '켄의 목소리는 작았지만 대답은 맞았습니다. 심사관은 한숨을 쉬고 통과시켜 줍니다.',
          en: 'Ken’s voice is small, but the answer is correct. The officer sighs and lets him through.',
        },
        statChanges: {
          funds: 0,
          mental: -10,
          english: 10,
          insight: 20,
          stamina: -20,
          relation: 0,
        },
        nextScenarioId: 1001,
      },
      {
        type: 'STABLE',
        text: {
          ko: '준비한 서류를 차례대로 보여준다.',
          en: 'Show the prepared documents one by one.',
        },
        feedback: {
          ko: '서류는 켄보다 영어를 잘했습니다. 결국 입국은 통과했습니다.',
          en: 'The documents spoke better English than Ken. He gets through in the end.',
        },
        statChanges: {
          funds: 0,
          mental: -15,
          english: 5,
          insight: 15,
          stamina: -15,
          relation: 0,
        },
        nextScenarioId: 1001,
      },
      {
        type: 'REALIST',
        text: {
          ko: '모르는 단어는 그냥 못 알아듣겠다고 말한다.',
          en: 'Say honestly when you do not understand a word.',
        },
        feedback: {
          ko: '의외로 통했습니다. 켄은 완벽한 영어보다 솔직한 확인이 더 강할 때가 있다는 걸 배웠습니다.',
          en: 'Surprisingly, it works. Ken learns that honest clarification can be stronger than perfect English.',
        },
        statChanges: {
          funds: 0,
          mental: 0,
          english: 10,
          insight: 25,
          stamina: -10,
          relation: 0,
        },
        nextScenarioId: 1001,
      },
    ],
  },
  {
    id: 1001,
    type: 'SUMMARY',
    week: 1,
    day: 1,
    title: {
      ko: 'Day 1 샘플 회고',
      en: 'Day 1 Sample Reflection',
    },
    backgroundKey: 'dorm_room_night',
    description: {
      ko: '이 파일은 TS 구조 확인용 샘플입니다. 실제 Day1 전체 이전 때는 현재 Ken JSON의 모든 Day1 노드를 그대로 옮겨야 합니다.',
      en: 'This file is a TypeScript structure sample. When migrating the full Day1, move all current Ken JSON Day1 nodes without changing their IDs or content.',
    },
    statChanges: {
      funds: 0,
      mental: 0,
      english: 0,
      insight: 0,
      stamina: 0,
      relation: 0,
    },
    nextScenarioId: 20,
    choices: [],
  },
];
