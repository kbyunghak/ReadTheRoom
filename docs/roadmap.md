# Roadmap

This roadmap separates release stabilization from future content and technical improvements.

## Current Focus

- Keep the active scenario runtime on JSON for the current release.
- Stabilize Ken Day 1 and Day 2.
- Keep TS scenario migration separate from release stabilization.
- Improve documentation and CI before major refactoring.

## Near-Term

- Rewrite the documentation hub.
- Add GitHub Actions CI.
- Replace the long `npm test` command chain with a test runner script.
- Polish StoryMap readability and episode state hierarchy.
- Clean remaining mojibake/localization copy issues in source files.
- Add a release checklist-driven Expo Go validation pass.

## Testing Improvements

- Add React Native Testing Library.
- Cover character select to game start.
- Cover choice to feedback modal to next scenario.
- Cover save and resume behavior at screen level.

## Scenario Data Improvements

- Keep `scenarios_ken.json` as the active release source until migration is approved.
- Expand Ken Day 3 to Day 6 on a separate branch.
- Keep Day 7 and later as Week 2 planning.
- Avoid registering JSON and TS scenario packs for the same character at the same time.

## Technical Debt

- Split remaining large GameScreen responsibilities.
- Move reusable UI state into focused hooks where appropriate.
- Improve StoryMap card text handling for long Korean and English titles.
- Add stricter localization/mojibake guards for known corrupted strings.
- Decide whether to adopt Vitest or Jest after the current Node test runner is simplified.

## Longer-Term

- Finish Ken through Day 30.
- Add or stabilize Amy and Sora scenario packs.
- Add analytics only after privacy requirements are documented.
- Add EAS Build configuration when app-store release becomes a concrete target.
