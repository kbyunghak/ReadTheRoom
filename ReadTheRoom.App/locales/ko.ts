import { CHARACTERS } from './characters';

export const ko = {
  characterSelect: {
    subtitle: '당신의 이야기를 골라보세요',
    title: '캐릭터 선택',
    description: '각 캐릭터마다 다른 시작점과 선택지가 있어요.',
    languageToggle: 'English',
    comingSoon: '곧 추가 예정',
    recommended: '추천',
    playAs: (name: string) => `${name}로 시작하기`,
    guideTitle: '선택 가이드',
    guideDescription:
      '선택한 캐릭터에 따라 스토리 전개와 경험할 수 있는 이벤트가 달라집니다.',
    settingsHint: '언제든지 설정에서 캐릭터를 변경할 수 있어요.',
  },
  characterDetail: {
    back: '뒤로',
    overview: '캐릭터 소개',
    stats: '스탯',
    specialEffect: '특수 효과',
    balanceNote: '밸런스 메모',
    unlockNote: '해금 조건',
    tier: '티어',
    goBack: '다른 캐릭터 보기',
    playAs: (name: string) => `${name}로 시작하기`,
    inService: '서비스 중',
    unavailableTitle: '아직 이용할 수 없는 캐릭터예요',
    unavailableDescription:
      '현재는 켄과 에이미만 서비스 중입니다. 다른 캐릭터는 순차적으로 오픈될 예정입니다.',
    ok: '확인',
    continueSave: '이어서 하기',
    savedRunTitle: (name: string) => `${name}의 진행 기록이 있어요`,
    currentSituation: (title: string) =>
      `현재 상황: ${title}\n이어서 하시겠습니까?`,
    startOver: '처음부터 시작',
    continue: '이어서 하기',
    cancel: '취소',
    inProgress: '진행 중인 이야기',
  },
  characters: Object.fromEntries(
    CHARACTERS.map((character) => [
      character.id,
      {
        name: character.name.ko,
        jobTitle: character.jobTitle.ko,
        description: character.description.ko,
        trait: character.trait.ko,
        specialEffect: character.specialEffect.ko,
        balanceNote: character.balanceNote?.ko ?? null,
        unlockNote: character.unlockNote?.ko ?? null,
      },
    ]),
  ),
} as const;
