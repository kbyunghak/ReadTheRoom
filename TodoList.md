# ReadTheRoom Test Planning Todo

This document tracks the test-planning process before writing actual test code.
Right now, the goal is to finish the planning structure first, then write tests later.

## Release-First Test Goal

The immediate goal is not full test coverage.
The immediate goal is to protect the release by catching critical logic and progression issues before shipping.

That means:

- prioritize fast, high-signal unit tests
- focus on logic and state transitions before UI polish
- cover the areas most likely to break progression or corrupt player state
- keep the first pass small enough to finish before release

### Release-first principle

If a test does not materially reduce release risk, it can wait until after release.

---

## Release-First Minimum Test Scope

These are the minimum high-priority test areas to complete before release.

### 1. Scenario loader

Reason:
- if scenario parsing breaks, the game cannot progress reliably

Must cover:
- Day bucket flattening
- `startScenarioId` resolution
- `SUMMARY` interpretation
- `ENDING` interpretation
- invalid `nextScenarioId` detection

### 2. Front status / condition logic

Reason:
- current UI relies on representative condition state
- bad condition logic creates misleading feedback and broken progression tone

Must cover:
- front-side representative state calculation
- exclusion of English and relation from front-side condition logic
- episode 1 override behavior
- composite danger states:
  - `생존 경보`
  - `생존 압박`
  - `비상 모드`
- warning priority:
  - mental > insight > stamina > funds
- fully stable state:
  - `완벽 적응`

### 3. Result card logic

Reason:
- post-choice feedback is now a major progression checkpoint
- if result rendering is wrong, users lose trust in the game flow

Must cover:
- choosing an option opens the result view
- choices disappear after selection
- selected choice content is shown
- feedback content is shown
- only changed stats are displayed
- zero-value stat changes are hidden
- tip is shown only when present
- tip follows the current language mode
- pressing next advances progression

### 4. Save / continue / reset

Reason:
- broken persistence is a release blocker
- continue flow is one of the highest-risk areas for user frustration

Must cover:
- current scenario and stats are saved
- continue data is restored
- checkpoint behavior is preserved
- continue after failure resets to intended starting state

---

## Release-First Execution Plan

### Phase 1. Fixture preparation

Goal:
- create only the minimum fixtures needed for release-blocking tests

Needed:
- one normal scenario fixture
- one SUMMARY fixture
- one ENDING fixture
- stable stats fixture
- warning stats fixture
- risk stats fixture
- continue/save fixture

Output:
- shared fixture helpers under `ReadTheRoom.App/tests/fixtures`

### Phase 2. Loader tests

Target:
- scenario loader / registry logic

Output:
- protect JSON interpretation and progression graph correctness

### Phase 3. Condition logic tests

Target:
- representative status logic used by the front card

Output:
- protect status card front-state meaning and episode 1 override

### Phase 4. Result flow tests

Target:
- post-choice result behavior

Output:
- protect choice -> result -> next flow

### Phase 5. Persistence tests

Target:
- save / continue / reset

Output:
- protect long-session continuity and failure recovery

### Phase 6. Release gate

Before release, confirm:
- all release-first tests pass
- `npm test` runs cleanly
- no newly added failing test is deferred silently

---

## Release-First Recommendation

Write tests in this exact order:

1. scenario loader
2. front status logic
3. result card flow
4. save / continue / reset

Stop after these if release timing is tight.
Everything else can be added in the post-release expansion phase.

## Current Release-First Progress

### Completed

- Phase 1 fixture structure created under `ReadTheRoom.App/tests/fixtures`
- Phase 2 scenario loader test file added:
  - `ReadTheRoom.App/tests/scenarioRegistry.test.ts`
- Phase 3 condition logic extracted to:
  - `ReadTheRoom.App/utils/conditionSummary.ts`
- Phase 3 condition logic test file added:
  - `ReadTheRoom.App/tests/conditionSummary.test.ts`
- Phase 5 persistence tests refreshed to use shared fixtures and cover:
  - character save isolation
  - relation normalization on restore
  - checkpoint preservation on restore
- `package.json` test script updated to include the new release-first tests

### Verified so far

- `npx tsc --noEmit` passes after fixture and release-first logic test additions
- `npm test` passes for the current release-first suite:
  - `tests/gameStats.test.ts`
  - `tests/gamePersistence.test.ts`
  - `tests/scenarioV2.test.ts`
  - `tests/scenarioRegistry.test.ts`
  - `tests/conditionSummary.test.ts`

### Important limitation

- Current test setup is a lightweight Node-based unit test flow.
- It is good for logic and data validation.
- It is not yet a full React Native screen-rendering test environment.
- That means release-first coverage should continue to focus on:
  - loader logic
  - condition logic
  - persistence logic
  - extractable result-flow helpers

### Current release-first blocker notes

- `scenarioRegistry.test.ts` must continue importing the pure normalization module, not the asset-loading runtime registry module.
- Result-card testing should avoid direct RN rendering unless a dedicated renderer/test setup is introduced later.
- Current `MODULE_TYPELESS_PACKAGE_JSON` warnings are not release blockers for this test pass, but should be cleaned later if the Node-based test setup grows.

### Follow-up caution

- If later we want to test rendered UI behavior directly, we will need a dedicated RN test renderer setup.
- That work should not block the current release-first safety pass.

## Ground Rules

- Do not write test code yet.
- First organize test targets, user flows, and test case names.
- After all test work is complete, proceed with later UI polish and refactoring.

---

## Step 1. Feature Buckets

### Buckets

1. Start Flow
   - Splash
   - Warning
   - index entry

2. Character Selection / Detail
   - CharacterSelectScreen
   - CharacterDetailScreen

3. Main Gameplay
   - GameScreen overall flow

4. Status Card
   - Front/back condition card inside GameScreen

5. Result Overlay
   - Post-choice feedback/result card inside GameScreen

6. Summary Screen
   - SituationSummaryScene

7. Ending Screen
   - EndingScene

8. Scenario Loading / Interpretation
   - scenario registry / scenarioV2 related logic

9. Persistence / Continue
   - gamePersistence related logic

10. Stat Calculation / Condition Logic
   - gameStats and front condition calculation logic

### Step 1 Evaluation

- The app is now divided into manageable functional areas.
- `GameScreen` is too large to test as one block, so splitting it later is the right call.
- `Status Card` and `Result Overlay` should be treated as separate test groups even though they live in the same file.

---

## Step 2. User Action Breakdown

### Start Flow

- Open app for the first time
- Press start
- Confirm warning
- Move to character select
- Choose continue when available

### Character Selection / Detail

- View character list
- Tap a character card
- View character detail
- Go back
- Start the game with selected character

### Main Gameplay

- View current scene
- Read status card
- Read situation description
- Choose option 1/2/3
- Check result
- Press next
- Move to summary or ending

### Status Card

- Check front summary
- Tap the card
- Flip the card
- Read 6 detailed stats
- Reset to front when scenario changes

### Result Overlay

- Result card appears after choice
- Read selected choice content
- Read feedback
- Check changed stats
- Read tip if present
- Press next

### Summary Screen

- View summary
- Check result tone
- Press continue

### Ending Screen

- View success/failure ending
- Press retry
- Press continue
- Press exit/back

### Scenario Loader / Interpretation

- Read JSON
- Flatten Day buckets
- Resolve startScenarioId
- Interpret SUMMARY / ENDING
- Validate nextScenarioId

### Persistence / Continue

- Save current play state
- Save checkpoint
- Restore continue state
- Restore reset state after failure continue

### Stat Calculation / Condition Logic

- Apply stat changes
- Determine failure state
- Determine front condition state

### Step 2 Evaluation

- The system is now described in terms of user actions, not just screens.
- This makes Step 3 test titles much easier to write.
- The `GameScreen` flow is best treated as: view scene -> choose -> review result -> move next.

---

## Step 3. Test Case Name Inventory

### A. Start Flow

- Splash screen renders the start button
- Pressing the start button opens the warning screen
- Confirming the warning moves to character selection
- Continue branch UI appears when a saved session exists
- Main BGM is triggered on first entry

### B. Character Selection / Detail

- Character selection screen renders playable characters
- Characters without scenarios are shown as locked or inactive
- Tapping a character card opens the detail screen
- Character detail screen renders the selected character info
- Pressing start on character detail begins the game for that character
- Back action on character detail returns to previous screen

### C. Main Gameplay

- Current scenario title and description are rendered
- Header title renders in `DayN. Title` format
- Background image is selected from scenario backgroundKey
- Current character overlay is rendered
- Choices 1/2/3 are visible before selection
- Choosing an option opens the result card
- Choices disappear after the result card opens
- Pressing next moves to the next scenario
- Reaching a SUMMARY node opens the summary screen
- Reaching an ENDING or terminal state opens the ending screen

### D. Status Card

- Front status card renders only the representative state and description
- English and relation are excluded from front-side condition calculation
- Episode 1 override takes priority over normal condition logic
- Three or more risk stats show `생존 경보`
- Two or more risk stats including funds show `생존 압박`
- Two or more risk stats without funds show `비상 모드`
- A single risk stat shows its own representative state
- Warning-only states use priority order to pick one representative state
- Fully stable stats show `완벽 적응`
- Tapping the card flips the card state
- Back side renders all 6 stats
- Scenario change resets the card to the front side

### E. Result Overlay

- Result card renders the `선택 및 피드백` title
- Result card renders the selected choice content
- Result card renders the feedback content
- Result card renders only changed stats
- Result card hides zero-value stat changes
- Tip card appears only when tip data exists
- Tip displays only the currently selected language
- Pressing next closes the result view and advances progression

### F. Summary Screen

- Summary screen renders when SUMMARY data is provided
- Summary screen shows the correct good/mid/bad tone
- Continue on summary moves to next node or phase

### G. Ending Screen

- Success ending renders success messaging
- Failure ending renders failure messaging
- Continue after failure restores a reset continuation state
- Retry returns to the starting point

### H. Scenario Loader / Interpretation

- Day bucket structure is flattened into a scenario map
- startScenarioId is resolved correctly
- SUMMARY nodes allow missing choices
- type field is interpreted as SUMMARY / ENDING behavior
- Invalid nextScenarioId can be detected

### I. Persistence / Continue

- Current scenario and stats are saved
- Checkpoints are saved
- Continue data is restored
- Continue after failure resets to starting stats

### J. Stat Calculation / Condition Logic

- All 6 stat changes are applied correctly
- Failure state is detected at threshold boundaries
- Representative condition logic returns the correct front-side state

### Step 3 Evaluation

- Test case names are now detailed enough to become real test titles.
- The next step is to prioritize and split them into files.
- `GameScreen`, `Status Card`, and `Result Overlay` contain the most cases and need file-level separation.

---

## Step 4. Priority Assignment

### P1. Must-have first

- Choosing an option opens the result card
- Choices disappear after the result card opens
- Result card renders only changed stats
- Result card hides zero-value stat changes
- Pressing next moves to the next scenario
- Reaching a SUMMARY node opens the summary screen
- Reaching an ENDING or terminal state opens the ending screen
- Front status card calculates the representative state correctly
- English and relation are excluded from front-side condition calculation
- Episode 1 override takes priority
- Three or more risk stats show `생존 경보`
- Two or more risk stats including funds show `생존 압박`
- Two or more risk stats without funds show `비상 모드`
- Day bucket structure is flattened correctly
- SUMMARY nodes allow missing choices
- Continue data is restored
- Continue after failure resets starting stats

### P2. Strongly recommended next

- Splash screen renders the start button
- Pressing the start button opens the warning screen
- Confirming the warning moves to character selection
- Character selection screen renders playable characters
- Tapping a character card opens detail
- Starting from character detail begins the game
- Tapping the status card flips the card
- Back side renders all 6 stats
- Scenario change resets status card to front
- Tip card appears only when tip exists
- Tip language follows current language mode
- Summary screen renders correctly
- Summary tone good/mid/bad is correct
- Success/failure ending text renders correctly

### P3. Nice-to-have later

- Main BGM is triggered on first entry
- Continue branch UI appears when save exists
- Background image matches backgroundKey
- Character overlay renders correctly
- Header remains stable on narrow screens
- All 3 choices remain visible on smaller screens
- Status card does not cover the face on different screen sizes
- Explore tab basic render

### Step 4 Evaluation

- Priorities now separate core gameplay protection from polish and device-variance checks.
- P1 is correctly centered on `GameScreen`, status logic, scenario loader, and continue flow.
- P3 safely holds layout/device-related tests that can wait.

---

## Step 5. Test File Split

### Recommended file structure

- `tests/gameScreen.result.test.ts`
  - Result card
  - Post-choice result flow

- `tests/gameScreen.statusCard.test.ts`
  - Front/back status card
  - Representative state logic
  - Flip behavior

- `tests/gameScreen.flow.test.ts`
  - Scene rendering
  - Choice flow
  - SUMMARY / ENDING transitions

- `tests/scenarioRegistry.test.ts`
  - Day bucket flattening
  - startScenarioId
  - SUMMARY / ENDING interpretation
  - nextScenarioId validation

- `tests/gamePersistence.test.ts`
  - Save
  - Continue
  - Reset after failure

- `tests/summaryScene.test.ts`
  - SituationSummaryScene rendering
  - good/mid/bad display

- `tests/endingScene.test.ts`
  - EndingScene success/failure rendering
  - retry / continue behavior

- `tests/startFlow.test.ts`
  - Splash
  - Warning
  - index entry flow

- `tests/characterFlow.test.ts`
  - CharacterSelectScreen
  - CharacterDetailScreen

### Step 5 Evaluation

- File-level separation makes failures easier to trace.
- Splitting `GameScreen` into `result / statusCard / flow` is essential for maintainability.
- Existing files such as `gamePersistence.test.ts`, `gameStats.test.ts`, and `scenarioV2.test.ts` may be extended or renamed later for clarity.

---

## Step 6. Draft Test Specification Table

### `tests/gameScreen.result.test.ts`

- Choosing an option opens the result card
- Choices disappear after the result card opens
- Selected choice content is rendered
- Feedback content is rendered
- Only changed stats are shown
- Zero stat changes are hidden
- Tip card appears only when tip exists
- Tip shows only the active language
- Pressing next advances progression

### `tests/gameScreen.statusCard.test.ts`

- Front card shows representative state and description only
- English and relation are excluded from front calculation
- Episode 1 override is applied first
- Three or more risks show `생존 경보`
- Two or more risks with funds show `생존 압박`
- Two or more risks without funds show `비상 모드`
- One risk stat shows its own representative state
- Warning-only states use the correct priority order
- Fully stable states show `완벽 적응`
- Card flips on tap
- Back side shows all 6 stats
- Scenario change resets card to front

### `tests/gameScreen.flow.test.ts`

- Current title and description render
- Header renders `DayN. Title`
- Choices are visible before selection
- SUMMARY transition works
- ENDING transition works

### `tests/scenarioRegistry.test.ts`

- Day bucket structure is flattened
- startScenarioId resolves correctly
- SUMMARY nodes allow omitted choices
- type field maps to SUMMARY / ENDING meaning
- invalid nextScenarioId can be detected

### `tests/gamePersistence.test.ts`

- Current scenario and stats are saved
- Checkpoints are saved
- Continue data is restored
- Failure continue resets to starting stats

### `tests/summaryScene.test.ts`

- Summary scene renders
- good/mid/bad tone renders correctly
- Continue action advances correctly

### `tests/endingScene.test.ts`

- Success ending text renders
- Failure ending text renders
- Failure continue restores reset state
- Retry returns to the beginning

### `tests/startFlow.test.ts`

- Splash renders start button
- Start moves to warning
- Warning moves to character selection

### `tests/characterFlow.test.ts`

- Character list renders
- Character card opens detail
- Character detail renders selected info
- Start from detail begins the game

### Step 6 Evaluation

- The plan is now detailed enough to start implementation without guessing.
- The spec is structured by file and ready to be turned into actual tests.
- `GameScreen` still has the highest complexity, so strict file responsibility will matter.

---

## Step 7. P1 Writing Order

### Recommended implementation order

1. `tests/scenarioRegistry.test.ts`
   - Pure data/logic first
   - Lowest UI complexity

2. `tests/gamePersistence.test.ts`
   - Save/restore/reset logic next
   - Supports later flow tests

3. `tests/gameScreen.statusCard.test.ts`
   - Lock down representative state logic early
   - Includes episode 1 override

4. `tests/gameScreen.result.test.ts`
   - Post-choice result behavior

5. `tests/gameScreen.flow.test.ts`
   - Main scene flow and transitions

6. `tests/summaryScene.test.ts`
   - SUMMARY display and continue flow

7. `tests/endingScene.test.ts`
   - Success/failure endings

### After P1

8. `tests/startFlow.test.ts`
9. `tests/characterFlow.test.ts`

### After P2

10. Responsive / BGM / explore tab checks

### Step 7 Evaluation

- The order moves from pure logic to UI flow, which reduces risk.
- Locking scenario loader, persistence, and status logic first will make later UI tests more stable.
- Once P1 is complete, the game’s core runtime flow should be significantly safer.

---

## Step 1~7 Overall Evaluation

### What went well

- The planning now flows clearly: feature -> action -> case -> priority -> file -> write order.
- The structure is readable and maintainable for future work.
- Complex `GameScreen` responsibilities were decomposed into manageable parts.

### What to watch out for

- `GameScreen` tests can easily mix rendering, state, and flow. File responsibility must stay strict.
- Snapshot-heavy testing will likely become brittle. Prefer behavior assertions.
- Areas like status card and result overlay should test both logic and visible output separately when possible.

### Fixes and follow-up items

- Consider whether existing [`scenarioV2.test.ts`](/D:/Projects/ReadTheRoom/ReadTheRoom.App/tests/scenarioV2.test.ts) should be expanded or renamed to match `scenarioRegistry.test.ts`.
- Review whether [`gameStats.test.ts`](/D:/Projects/ReadTheRoom/ReadTheRoom.App/tests/gameStats.test.ts) should own some representative status logic or whether that belongs entirely to `gameScreen.statusCard.test.ts`.
- Prepare shared fixtures before writing tests:
  - default character
  - default scenario node
  - default stats set
- Fix language-sensitive tests by always using explicit `ko` or `en` fixtures.
- Keep a note that UI polish changes should not begin until the planned test phase is complete.

---

## Work To Do After Tests Finish

The items below should be done only after the full planned test phase is complete.

- UI micro-adjustments
  - header thickness and padding
  - status card size and position
  - situation description overlap ratio
  - choice height and line spacing

- Responsive tuning
  - small / regular / large phone breakpoints

- Code cleanup
  - review GameScreen responsibility split
  - consider extracting status card and result card subcomponents
  - clean remaining warnings such as BOM and unused imports

- Visual polish
  - animation timing refinements
  - status card flip polish
  - result card and tip card polish

---

## Unit Test Baseline and Fixture Plan

### Existing unit tests

These tests already exist and can be used as the base layer before adding new files.

- `ReadTheRoom.App/tests/gamePersistence.test.ts`
- `ReadTheRoom.App/tests/gameStats.test.ts`
- `ReadTheRoom.App/tests/scenarioV2.test.ts`

### Why fixtures are needed

To run tests automatically and reliably, shared dummy data should be prepared first.
The goal is to avoid rebuilding scenario objects and stat sets inside every test file.

### Recommended shared fixtures

#### Character fixtures

- `defaultCharacterKen`
- `defaultCharacterJina`
- `defaultCharacterAmy`

Each fixture should include only the fields needed by tests:
- id
- name
- base stats
- card image / overlay image when relevant

#### Scenario fixtures

- `defaultScenarioNode`
- `defaultChoiceNode`
- `summaryScenarioNode`
- `endingScenarioNode`
- `episodeOneScenarioNode`

Recommended coverage:
- one normal node with 3 choices
- one node with tip
- one node without tip
- one SUMMARY node without choices
- one ENDING node

#### Stat fixtures

- `stableStats`
- `warningStats`
- `riskStats`
- `fundsRiskStats`
- `multiRiskStats`
- `episodeOneStartStats`

Recommended use:
- `stableStats` for `완벽 적응`
- `warningStats` for warning-priority tests
- `riskStats` for single-risk tests
- `fundsRiskStats` for `생존 압박`
- `multiRiskStats` for `생존 경보` / `비상 모드`
- `episodeOneStartStats` for episode 1 override tests

#### Result fixtures

- `choiceWithPositiveChanges`
- `choiceWithNegativeChanges`
- `choiceWithZeroChanges`
- `choiceWithTipKo`
- `choiceWithTipEn`

These should help test:
- changed stats only
- zero-value stat filtering
- language-specific tip rendering

### Suggested fixture file structure

- `ReadTheRoom.App/tests/fixtures/characters.ts`
- `ReadTheRoom.App/tests/fixtures/scenarios.ts`
- `ReadTheRoom.App/tests/fixtures/stats.ts`
- `ReadTheRoom.App/tests/fixtures/results.ts`
- `ReadTheRoom.App/tests/fixtures/index.ts`

### Automatic test workflow

1. Create shared fixtures first.
2. Extend existing logic tests using those fixtures.
3. Add new P1 test files after fixture reuse is stable.
4. Run `npm test` after each file-level milestone.
5. Only move to UI polish after P1 and P2 test layers are stable.

### Notes for later implementation

- Prefer explicit `ko` and `en` fixture values instead of relying on defaults.
- Keep fixture names behavior-oriented, not screen-oriented.
- Reuse the same base fixture and override only the fields needed for each test.
- If a bug is fixed later, add a regression fixture or regression case before closing the task.

- Result card rule tests added: selected text normalization, changed-stat filtering, localized tip selection
