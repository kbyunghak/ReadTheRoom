# Roadmap

This roadmap separates release stabilization from future content and technical improvements.

## Current Focus

- Keep the active scenario runtime on JSON for the current release.
- Stabilize Ken Day 1 and Day 2.
- Keep TS scenario migration separate from release stabilization.
- Improve documentation and CI before major refactoring.

## Near-Term

- Polish StoryMap readability and episode state hierarchy.
- Add a release checklist-driven Expo Go validation pass.
- Add initial UI tests for the highest-risk screens.

## Testing Improvements

- Add React Native Testing Library.
- Cover character select to game start.
- Cover choice to feedback modal to next scenario.
- Cover save and resume behavior at screen level.
- Use current Vitest coverage reports to identify meaningful branch gaps.

## Scenario Data Improvements

- Keep `scenarios_ken.json` as the active release source until migration is approved.
- Expand Ken Day 3 to Day 6 on a separate branch.
- Keep Day 7 and later as Week 2 planning.
- Avoid registering JSON and TS scenario packs for the same character at the same time.

## Technical Debt

- Split remaining large GameScreen responsibilities.
- Move reusable UI state into focused hooks where appropriate.
- Improve StoryMap card text handling for long Korean and English titles.
- Keep localization/mojibake guard patterns updated as new regressions are discovered.

## Longer-Term

- Finish Ken through Day 30.
- Add or stabilize Amy and Sora scenario packs.
- Add analytics only after privacy requirements are documented.
- Add EAS Build configuration when app-store release becomes a concrete target.
