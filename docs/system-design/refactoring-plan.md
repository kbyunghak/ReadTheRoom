# ReadTheRoom Refactoring Plan

## Execution Status

- Step 0: Completed
- Step 1: Completed
- Step 2: Completed
- Step 3: Completed
- Step 4: Completed
- Step 5: Completed
- Step 6: Completed
- Step 7: Completed

The first refactoring pass intentionally preserves the existing navigation model and game behavior.
Further extraction of the large feedback, roadmap, and status-card render blocks should be handled in separate visual-regression commits.

## Second Pass - Remaining Work

This pass focuses on reducing the size and edit cost of `GameScreen` without
changing scenario content or runtime behavior.

1. Audit the current structure and record regression gates.
2. Extract the feedback modal and keep result behavior unchanged.
3. Unify the scenario data source between JSON and TypeScript.
   - Deferred until the code-organization pass is complete.
   - Do not change scenario IDs, content, normalization, or runtime source in
     this pass.
4. Extract the front/back status card.
5. Extract the scenario description and choice panel.
6. Extract the roadmap modal and run the full regression gate.

### Second-pass gates

- Run the focused unit tests after each extraction.
- Run `npx tsc --noEmit` and lint after each extraction.
- Run the complete `npm test` suite at the final gate.
- Preserve automatic feedback opening, selected-choice locking, summary
  behavior, roadmap rewind behavior, and status-card flipping.

## Goal

Reduce the cost and regression risk of UI and scenario changes without changing current game behavior.
Refactoring is performed in small steps, and every step must pass its own test gate before the next step starts.

## Working Rules

- Do not combine behavior changes with structural refactoring.
- Keep each commit limited to one purpose.
- Run `npm test`, `npx tsc --noEmit`, and `npm run lint` at every gate.
- Preserve current JSON compatibility until the scenario data migration is explicitly approved.
- Prefer pure functions, feature modules, hooks, and reducers over class hierarchies.
- Do not extract a shared component until at least two real callers need the same behavior.

## Step 0 - Establish The Safety Net

### Work

- Add characterization tests for every supported scenario input format.
- Record normalization defaults for feedback, stat changes, branch tags, phase flags, and start IDs.
- Test the production scenario registry separately after the duplicate normalizer is removed.
- Keep the current UI and runtime behavior unchanged.

### Test Gate

- Legacy, phase-based V2, flat V2, and Day bucket formats normalize correctly.
- Placeholder Day buckets do not crash normalization.
- Missing choice feedback falls back to the choice text.
- Missing stat values are normalized to all six stat keys.
- SUMMARY and ENDING flags are derived consistently.

### Exit Criteria

- Existing tests and the new normalization tests pass.
- No source file used by the app has changed behavior.

## Step 1 - Unify Scenario Types And Normalization

### Work

- Make `utils/scenarioBundle.ts` the temporary canonical normalizer.
- Remove the duplicated types and normalization implementation from `utils/scenarioRegistry.ts`.
- Make the registry import `createScenarioBundle` and shared scenario types.
- Move canonical scenario types to `domain/scenario/types.ts` when import migration is safe.

### Test Gate

- Every character bundle has the same start node and node count before and after the change.
- Ken Day buckets preserve phase order, IDs, metadata, choices, and SUMMARY behavior.
- Registry integration tests use the same implementation as production.

### Exit Criteria

- Only one `createScenarioBundle` implementation exists.
- Production and tests import the same normalizer.

## Step 2 - Centralize Stats And Display Metadata

### Work

- Create one canonical `GameStats`, `StatChanges`, and `StatKey` definition.
- Move stat labels, colors, icons, display scales, and maximum values to `domain/stats/config.ts`.
- Move character stat display conversion out of `CharacterSelectScreen`.
- Keep condition-summary copy separate from generic stat metadata.

### Test Gate

- Stat application and clamp rules remain unchanged.
- Funds keep their current scale.
- Character card and detail display values remain unchanged.
- Result cards only expose changed stat values.

### Exit Criteria

- Screens do not define their own copies of stat keys, colors, or display scaling.

## Step 3 - Split Leaf UI From GameScreen

### Work

Extract presentational components without moving game state:

- `GameHeader`
- `StatusCard`
- `ScenarioPanel`
- `ChoiceList`
- `FeedbackModal`
- `RoadmapModal`

The parent passes explicit props and callbacks. Extracted components must not access persistence or scenario registries directly.

### Test Gate

- Choice selection, feedback reopen, and continue callbacks remain equivalent.
- SUMMARY nodes do not render choices.
- Roadmap completed/current/locked states remain equivalent.
- Status card front/back data remains equivalent.

### Exit Criteria

- `GameScreen` primarily coordinates state and layout.
- Each extracted component has one clear responsibility.

## Step 4 - Extract The Game Session State Machine

### Work

- Introduce a pure reducer or transition function.
- Define explicit actions such as:
  - `CHOOSE`
  - `CLOSE_FEEDBACK`
  - `CONTINUE`
  - `CONTINUE_SUMMARY`
  - `RESTART`
  - `REWIND`
- Keep persistence and audio as effects outside the reducer.
- Centralize missing-node and ending fallback decisions.

### Test Gate

- A choice applies stats once and locks the selected choice.
- Closing feedback preserves the selected choice.
- Continuing moves to the expected next scenario.
- Missing next nodes resolve to the expected fallback instead of `undefined`.
- Failed stats take priority over next-node navigation.
- SUMMARY stat changes are applied once.
- Rewind restores the expected scenario and state.

### Exit Criteria

- Story transitions can be tested without rendering React Native UI.
- `GameScreen` no longer implements transition rules inline.

## Step 5 - Consolidate Assets, Localization, And Theme

### Work

- Create a single asset registry for backgrounds, characters, events, and audio.
- Derive preload lists from the registry instead of maintaining a second list.
- Create one language type and one localized-text resolver.
- Move screen copy into namespaced locale dictionaries.
- Introduce game design tokens for colors, spacing, radius, typography, and elevation.

### Test Gate

- Every referenced asset key exists in its registry.
- Preload lists contain every registry asset once.
- Korean and English fallback behavior remains unchanged.
- Display titles remain free of internal labels.

### Exit Criteria

- Adding an asset, language label, or stat color requires one source change.

## Step 6 - Refactor Character Screens

### Work

- Extract `CharacterCard`, `CharacterStatRow`, and shared action buttons.
- Move stat formatting into the character domain module.
- Keep Character Select and Character Detail as feature-level screens.
- Preserve Ken, Amy, and Sora beta ordering.

### Test Gate

- Beta character order remains Ken, Amy, Sora.
- Start actions still bypass Details when invoked from Character Select.
- Details actions still start the selected character.
- Card and Details stat values match.

### Exit Criteria

- Character screens share domain formatting and focused UI primitives.

## Step 7 - Navigation And Repository Cleanup

### Work

- Move the manual screen flow into routes or a small `useAppFlow` reducer.
- Remove unused Expo template routes and components after verifying imports.
- Remove unused locale and constants files.
- Decide the source-of-truth policy for JSON versus TypeScript scenario data.

### Test Gate

- New game, saved game, character change, back navigation, and reload flows work.
- No removed route is referenced.
- Build, tests, typecheck, and lint pass from a clean checkout.

### Exit Criteria

- The repository tree reflects actual product features.
- Scenario data has one documented runtime source of truth.

## Recommended Commit Sequence

1. `test: add scenario normalization characterization coverage`
2. `refactor: unify scenario bundle normalization`
3. `refactor: centralize stat types and metadata`
4. `refactor: extract game screen presentation components`
5. `refactor: extract game session reducer`
6. `refactor: centralize assets localization and theme`
7. `refactor: simplify character feature components`
8. `chore: remove unused template and migration files`

## Manual Device Checks

Run these after Steps 3, 4, 6, and 7:

- Small Android phone
- Large Android phone
- Tablet or wide web viewport
- Choice selection and automatic feedback modal
- Feedback close and reopen
- SUMMARY continue
- Roadmap open, scroll, rewind, and close
- Status card flip
- App reload with saved progress
