import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'tests/gameStats.test.ts',
      'tests/statMetadata.test.ts',
      'tests/gameTransitions.test.ts',
      'tests/scenarioRegistry.test.ts',
      'tests/scenarioNormalization.test.ts',
      'tests/scenarioProgress.test.ts',
      'tests/scenarioDisplay.test.ts',
      'tests/conditionSummary.test.ts',
      'tests/resultCard.test.ts',
    ],
  },
});
