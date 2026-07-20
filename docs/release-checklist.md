# Release Checklist

Use this checklist before treating a build as a release candidate.

## Automated Checks

Run from `ReadTheRoom.App`:

```bash
npm run lint
npm run check:encoding
npx tsc --noEmit
npm test
```

Expected:

- Lint passes.
- TypeScript passes.
- All tests pass.
- Existing `MODULE_TYPELESS_PACKAGE_JSON` warnings are not failures, but should be cleaned later.

## Expo Go Smoke Test

### Startup

- App starts without crashing.
- Splash screen loads.
- Warning screen is shown and can continue.
- Character select screen appears.

### Character Selection

- Ken, Amy, and Sora appear as beta characters.
- Start button enters the story without requiring the details screen.
- Details button opens the character details screen.
- Details start button enters the story.

### Ken Scenario Flow

- Ken starts at Day 1.
- Day 1 main flow reaches the Day 1 summary.
- Day 2 main flow reaches the Day 2 summary.
- Special event branch `22 -> 9001 -> 23` works.
- Summary screens use summary layout rather than normal choice layout.

### Feedback And Tips

- Selecting a choice highlights it.
- Feedback modal opens.
- The modal shows choice, result, changed stats, and optional tip.
- Tips appear only when tip data exists.
- Continue advances to the next scenario.

### StoryMap

- StoryMap opens above the game screen.
- Completed, current, and locked cards are visually distinct.
- Completed cards can return to a previous completed scene.
- Current location is clear.
- Week tabs do not overlap the content.

### Save And Resume

- Progress is saved after advancing.
- Closing and reopening the app restores the expected character and scenario.
- Character saves are isolated.
- Clear/reset removes the saved state for the active character.

### Localization

- Korean mode displays Korean text.
- English mode displays English text.
- Language toggle does not mix Korean and English in the same header.
- No mojibake appears on screen.

Check for:

```text
????
쨌
?곹
?쒕
�
```

Normal TypeScript syntax such as `??` and `?.` is allowed in source code.

## Device Checks

Validate at least:

- Android phone through Expo Go.
- Small mobile viewport.
- Tall mobile viewport.
- Wider tablet or web viewport.

Check:

- Header does not crop important text.
- Bottom game controls stay inside the game canvas.
- Status card does not cover important text.
- Feedback modal remains readable.
- StoryMap fits inside the safe area.

## Release Notes

Before publishing:

- Confirm current commit SHA.
- Confirm known limitations.
- Confirm scenario content scope.
- Confirm test command output.
- Confirm manual smoke-test result.
