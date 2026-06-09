export type AppLanguage = 'en' | 'ko';

export const uiText = {
  en: {
    characterSelect: {
      subtitle: 'Choose your story',
      title: 'Select Character',
      hint: 'Tap a card to view details',
      languageToggle: '한국어',
      comingSoon: 'Coming Soon',
    },
    characterDetail: {
      back: 'Back',
      stats: 'Stats',
      goBack: 'Go Back',
      playAs: (name: string) => `Play as ${name}`,
      inService: 'In Service',
      unavailableTitle: 'This character is not available yet',
      unavailableDescription:
        'Only Ken and Amy are currently available. Other characters will open gradually.',
      ok: 'OK',
      continueSave: 'Continue Save',
      savedRunTitle: (name: string) => `A saved run for ${name} was found`,
      currentSituation: (title: string) => `Current situation: ${title}\nDo you want to continue?`,
      startOver: 'Start Over',
      continue: 'Continue',
      cancel: 'Cancel',
      inProgress: 'In progress',
    },
  },
  ko: {
    characterSelect: {
      subtitle: '당신의 이야기를 골라보세요',
      title: '캐릭터 선택',
      hint: '카드를 눌러 상세 정보를 확인하세요',
      languageToggle: 'English',
      comingSoon: '곧 추가 예정',
    },
    characterDetail: {
      back: '뒤로',
      stats: '스탯',
      goBack: '다른 캐릭터 보기',
      playAs: (name: string) => `${name}로 시작하기`,
      inService: '서비스 중',
      unavailableTitle: '아직 이용할 수 없는 캐릭터예요',
      unavailableDescription:
        '현재는 켄과 에이미만 서비스 중입니다. 다른 캐릭터는 순차적으로 오픈될 예정입니다.',
      ok: '확인',
      continueSave: '이어하기',
      savedRunTitle: (name: string) => `${name}의 진행 기록이 있어요`,
      currentSituation: (title: string) => `현재 상황: ${title}\n이어서 하시겠습니까?`,
      startOver: '처음부터 시작',
      continue: '이어서 하기',
      cancel: '취소',
      inProgress: '진행 중인 이야기',
    },
  },
} as const;
