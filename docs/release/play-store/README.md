# Play Store Release Kit

This folder collects the assets and copy needed to publish ReadTheRoom to Google Play Store.

## Current Status

| Item | Status | Source / Notes |
| --- | --- | --- |
| Android App Bundle | Pending | Generated with `eas build --platform android --profile production` |
| App icon 512x512 | Ready | `ReadTheRoom.App/assets/images/ReadTheRoom.png` |
| Feature graphic 1024x500 | Ready | `docs/release/play-store/assets/feature-graphic-1024x500.png` |
| English screenshots | Pending | Capture at least 2 screenshots from the dev build |
| Korean screenshots | Pending | Capture at least 2 screenshots from the dev build |
| English store listing | Template | [store-listing.en-US.md](store-listing.en-US.md) |
| Korean store listing | Template | [store-listing.ko-KR.md](store-listing.ko-KR.md) |
| Privacy policy page | Draft | [privacy-policy.md](privacy-policy.md) |
| Tester email list | Template | [tester-emails.template.csv](tester-emails.template.csv) |
| App access notes | Template | [app-access.md](app-access.md) |
| Release notes | Template | [release-notes.en-US.md](release-notes.en-US.md), [release-notes.ko-KR.md](release-notes.ko-KR.md) |

## Build Command

From `ReadTheRoom.App`:

```powershell
npx eas-cli@latest build --platform android --profile production
```

## Store Submission Notes

- The Play Store release uses an `.aab`, not an `.apk`.
- `app-release.aab` is a build artifact and should not be committed to the repository.
- The app package name is `com.spdshts.readtheroom`.
- The Play Console app slug is `rtr`.
