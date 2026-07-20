# UTF-8 And Korean Localization Encoding Policy

This document defines how ReadTheRoom prevents Korean text corruption and mojibake regressions.

## Purpose

ReadTheRoom contains English technical documentation and localized Korean/English game content. The project must keep all text files readable across Windows, GitHub, Node.js, Expo, and editor environments.

The safest convention is:

- Store all source, data, localization, and documentation files as UTF-8.
- Keep English and Korean content separated through localization structures where practical.
- Explicitly specify UTF-8 when using PowerShell file operations.
- Detect mojibake automatically before CI and release.
- Restore already corrupted strings only from verified sources.

## Files Covered

The UTF-8 policy applies to:

- TypeScript and JavaScript files.
- JSON scenario and localization data.
- Markdown documentation.
- YAML workflow files.
- Test fixtures.
- Scripts.

## Editor Settings

The repository includes:

- [`.editorconfig`](../.editorconfig)
- [`.gitattributes`](../.gitattributes)
- [`.vscode/settings.json`](../.vscode/settings.json)

These files tell editors and Git to use UTF-8 and LF line endings for project text files.

## PowerShell Rules

When reading files in PowerShell, prefer:

```powershell
Get-Content -Raw -Encoding utf8 -LiteralPath "path\to\file.md"
```

When writing files:

```powershell
Set-Content -LiteralPath "path\to\file.md" -Value $content -Encoding utf8
```

When appending:

```powershell
Add-Content -LiteralPath "path\to\file.md" -Value $content -Encoding utf8
```

PowerShell 7 is preferred because UTF-8 behavior is more predictable than Windows PowerShell 5.1.

## Mojibake Detection

The project includes:

```text
ReadTheRoom.App/scripts/check-mojibake.mjs
```

Run:

```bash
cd ReadTheRoom.App
npm run check:encoding
```

The script scans project text files for known corrupted Korean/mojibake patterns. It intentionally ignores policy documents, the checker itself, and dedicated mojibake test files so that documented examples do not fail the check.

## Corrupted Draft Documents

The previous TypeScript scenario format draft was moved to:

```text
docs/schema/TS시나리오_포맷_v1.0.md.bak
```

It is kept only as a recovery reference and is not official documentation. The official current-format document is [Scenario Format](scenario-format.md).

## Recovery Policy

Do not repair corrupted Korean by guessing.

Use this order:

1. Check Git history.
2. Look for an uncorrupted original source.
3. Determine whether the original was UTF-8, CP949, or EUC-KR.
4. Convert into a new file first.
5. Review Korean text manually.
6. Replace the corrupted file only after verification.

Saving already corrupted text as UTF-8 does not recover the original Korean. It only preserves the corrupted characters.

## Localization Policy

User-facing Korean text should be centralized in scenario data or localization modules whenever practical.

Recommended shape:

```ts
type LocaleText = {
  ko: string;
  en: string;
};
```

Both languages must use UTF-8. The languages may be separated logically, but they should not use different encodings.

## CI Policy

CI should run the encoding check before typecheck and tests:

```bash
npm ci
npm run lint
npm run check:encoding
npx tsc --noEmit
npm test
```

See [Testing Strategy](testing-strategy.md) and [Release Checklist](release-checklist.md).

## Commit Policy

Keep encoding infrastructure, documentation, and corrupted-string recovery in separate commits:

```text
docs: reorganize documentation hub
chore: enforce UTF-8 text file settings
test: add mojibake detection
fix: restore corrupted Korean localization strings
```
