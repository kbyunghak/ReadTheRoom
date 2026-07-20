# Contributing

This project is currently maintained as a focused indie game project. Contributions should preserve release stability, scenario integrity, and localization safety.

## Before Opening A Pull Request

Run from `ReadTheRoom.App`:

```bash
npm run lint
npm run check:encoding
npx tsc --noEmit
npm test
```

## Encoding

All project files must be saved using UTF-8.

Do not commit files encoded in CP949, EUC-KR, or other legacy encodings.

Use the localization system or scenario data structures instead of hardcoding user-facing strings where practical.

Run:

```bash
npm run check:encoding
```

before opening a pull request.

If corrupted Korean text is found, do not guess the intended wording. Restore it from Git history, an original source, or verified localization content.

For details, see [Encoding Policy](encoding-policy.md).

## Scenario Changes

Scenario changes should preserve:

- Unique scenario ids.
- Valid `nextScenarioId` links.
- Complete stat changes for choices.
- Localized Korean and English text.
- StoryMap metadata such as `week`, `day`, and `mainEpisode`.

For the current scenario format, see [Scenario Format](scenario-format.md).

## Commit Hygiene

Keep unrelated work in separate commits:

- Documentation updates.
- Encoding infrastructure.
- Scenario content changes.
- Korean text restoration.
- UI polish.
- Refactoring.

This keeps release review safer and makes regressions easier to trace.
