# Testing Strategy

ReadTheRoom uses release-first testing. The goal is to catch issues that can break progression, corrupt save data, or display broken user-facing strings before they reach a release candidate.

For release validation, see [Release Checklist](release-checklist.md).

## Current Test Model

Tests are Vitest-based TypeScript tests executed through `npm test`.

The current test suite covers:

- Stat calculation.
- Stat metadata.
- Game transitions.
- Persistence.
- Scenario normalization.
- Scenario registry behavior.
- Ken scenario integrity.
- Scenario progress display.
- Scenario title display.
- Condition summaries.
- Result card data.
- Localization key consistency.
- Mojibake guard checks.
- Coverage reporting for tested logic.

## Current Command

```bash
cd ReadTheRoom.App
npm test
```

Additional checks:

```bash
npm run check:encoding
npm run check:localization
npm run typecheck
npm run lint
npm run test:coverage
```

## Test Priorities

### P1: Release Blockers

- Scenario loading and normalization.
- Invalid or missing `nextScenarioId` handling.
- Choice to feedback to next scenario transitions.
- Summary and ending transitions.
- Save/resume/clear behavior.
- Character-specific save isolation.
- Stat failure detection.
- Mojibake guard for UI source files.

### P2: Strongly Recommended

- Character select and detail flow.
- StoryMap completed/current/locked state behavior.
- Feedback modal display behavior.
- Tip rendering by language.
- Summary screen behavior.
- Ending screen behavior.

### P3: Later

- Animation timing.
- Device-specific responsive layout.
- Audio playback.
- Visual snapshot testing.
- Full end-to-end app automation.

## Recommended Next Improvements

### 1. Add UI Integration Tests

Introduce React Native Testing Library for:

- Character select to game start.
- Choice to feedback modal to next scenario.
- Save and resume flow.

Mocks will be needed for:

- AsyncStorage.
- Expo Router.
- Animation modules.
- Asset loading.

### 2. Expand Meaningful Branch Coverage

Prefer user-impacting branches over arbitrary percentage chasing:

- Missing or invalid scenario links.
- Persistence failure and recovery paths.
- Optional localization fields.
- Default or fallback display values.

### 3. Release Workflow Validation

Later, add build-oriented release validation after the Expo release path is finalized.

## Testing Principles

- Prefer behavior assertions over snapshots.
- Keep scenario and stat fixtures explicit.
- Use `ko` and `en` values deliberately in localization tests.
- Add regression tests before closing repeated bugs.
- Do not let UI polish work weaken release-blocking logic tests.
