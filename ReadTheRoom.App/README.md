# ReadTheRoom.App

This is the active Expo application for ReadTheRoom.

ReadTheRoom.App contains the mobile game runtime, character selection, story screen, scenario data loading, save/resume logic, and release-focused tests.

## Requirements

- Node.js 22, matching the GitHub Actions CI workflow.
- npm, using `npm ci` for repeatable installs.
- Expo Go for quick device testing, or a local Android/iOS development environment.

## Install

```bash
npm ci
```

## Run

```bash
npm start
```

Platform shortcuts:

```bash
npm run android
npm run ios
npm run web
```

## Test And Validate

```bash
npm test
npm run test:coverage
npm run check:encoding
npm run check:localization
npm run typecheck
npm run lint
```

`npm test` runs the Vitest suite. The tests focus on scenario normalization, Ken scenario integrity, game transitions, persistence, result card data, condition summaries, localization consistency, and mojibake guards.

`npm run test:coverage` generates a local `coverage/` report. The output is ignored by Git.

## Quality Gates

The local validation commands mirror CI:

```bash
npm run check:encoding
npm run check:localization
npm run typecheck
npm run lint
npm test
```

Use these before opening a pull request or preparing a release candidate.

## App Structure

```text
app/                  Expo Router entry points and tab screens
components/           Reusable screen-level and UI components
domain/               Framework-light domain rules
features/             Feature-specific UI modules
shared/               Shared registries and reusable infrastructure
utils/                Scenario, display, persistence, and result helpers
assets/data/          Runtime scenario JSON and scenario type definitions
assets/images/        Character, background, event, and UI images
tests/                Vitest release-first test suite
vitest.config.ts      Vitest and coverage configuration
```

## Runtime Data

The active release path currently loads scenario JSON through `utils/scenarioRegistry.ts`.

Character scenario data is loaded from:

```text
assets/data/scenarios_amy.json
assets/data/scenarios_jina.json
assets/data/scenarios_ken.json
assets/data/scenarios_sora.json
assets/data/scenarios_yoon.json
```

Ken is the most actively validated scenario pack. The beta character select screen currently exposes Ken, Amy, and Sora.

## Related Documentation

- [Project README](../README.md)
- [Architecture](../docs/architecture.md)
- [Game Flow](../docs/game-flow.md)
- [Scenario Format](../docs/scenario-format.md)
- [Testing Strategy](../docs/testing-strategy.md)
- [Encoding Policy](../docs/encoding-policy.md)
- [Contributing](../docs/contributing.md)
- [Release Checklist](../docs/release-checklist.md)
