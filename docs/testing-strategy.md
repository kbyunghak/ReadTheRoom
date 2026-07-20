# Testing Strategy

ReadTheRoom uses release-first testing. The immediate goal is not full coverage. The goal is to catch issues that can break progression, corrupt save data, or display broken user-facing strings.

For release validation, see [Release Checklist](release-checklist.md).

## Current Test Model

Tests are lightweight Node-based TypeScript files executed through `npm test`.

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
- Mojibake guard checks.

## Current Command

```bash
cd ReadTheRoom.App
npm test
```

Additional checks:

```bash
npm run lint
npm run check:encoding
npx tsc --noEmit
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

### 1. Replace The Long Test Chain

The current `npm test` script explicitly chains every test file. This works, but it is hard to maintain.

Recommended next step:

```text
ReadTheRoom.App/scripts/run-tests.mjs
```

The runner should:

- Discover `tests/**/*.test.ts`.
- Sort files for stable output.
- Run each test with `node --experimental-strip-types`.
- Stop with a non-zero exit code on failure.
- Print a clear summary.
- Fail clearly when no test files are found.

### 2. Add CI

GitHub Actions should run:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm test
```

The workflow must set `working-directory: ReadTheRoom.App`.

### 3. Add UI Integration Tests

Later, introduce React Native Testing Library for:

- Character select to game start.
- Choice to feedback modal to next scenario.
- Save and resume flow.

Mocks will be needed for:

- AsyncStorage.
- Expo Router.
- Animation modules.
- Asset loading.

## Testing Principles

- Prefer behavior assertions over snapshots.
- Keep scenario and stat fixtures explicit.
- Use `ko` and `en` values deliberately in localization tests.
- Add regression tests before closing repeated bugs.
- Do not let UI polish work weaken release-blocking logic tests.
