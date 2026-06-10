import { CHARACTERS } from './characters';

export const en = {
  characterSelect: {
    subtitle: 'Choose your story',
    title: 'Select Character',
    description:
      'Each character has a different starting point and set of choices.',
    languageToggle: '한국어',
    comingSoon: 'Coming Soon',
    recommended: 'Recommended',
    playAs: (name: string) => `Start as ${name}`,
    guideTitle: 'Selection Guide',
    guideDescription:
      'Your selected character changes the story flow and the events you can experience.',
    settingsHint: 'You can change your character later in settings.',
  },
  characterDetail: {
    back: 'Back',
    overview: 'Overview',
    stats: 'Stats',
    specialEffect: 'Special Effect',
    balanceNote: 'Balance Note',
    unlockNote: 'Unlock Condition',
    tier: 'Tier',
    goBack: 'Go Back',
    playAs: (name: string) => `Play as ${name}`,
    inService: 'In Service',
    unavailableTitle: 'This character is not available yet',
    unavailableDescription:
      'Only Ken and Amy are currently available. Other characters will open gradually.',
    ok: 'OK',
    continueSave: 'Continue Save',
    savedRunTitle: (name: string) => `A saved run for ${name} was found`,
    currentSituation: (title: string) =>
      `Current situation: ${title}\nDo you want to continue?`,
    startOver: 'Start Over',
    continue: 'Continue',
    cancel: 'Cancel',
    inProgress: 'In progress',
  },
  characters: Object.fromEntries(
    CHARACTERS.map((character) => [
      character.id,
      {
        name: character.name.en,
        jobTitle: character.jobTitle.en,
        description: character.description.en,
        trait: character.trait.en,
        specialEffect: character.specialEffect.en,
        balanceNote: character.balanceNote?.en ?? null,
        unlockNote: character.unlockNote?.en ?? null,
      },
    ]),
  ),
} as const;
