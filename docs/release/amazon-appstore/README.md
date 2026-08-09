# Amazon Appstore Release Kit

This folder tracks the materials and checks required to submit Read The Room to the Amazon Appstore for Fire tablets.

## Release Target

- Platform: Fire OS tablets
- Submission format: Android App Bundle (`.aab`)
- Package name: `com.joygle.readtheroom`
- Supported in-app languages: Korean and English
- Login requirement: none
- Current monetization: optional rewarded advertising; no in-app purchases are available in this release

## Current Status

| Item | Status | Notes |
| --- | --- | --- |
| Production AAB | Ready for device validation | Download from the completed EAS production build. Do not commit the binary. |
| Amazon developer account | Pending | Create or complete the Amazon Developer Console profile. |
| Fire tablet install test | Pending | Required before submission, including the rewarded-ad fallback flow. |
| Large icon (512 x 512) | Candidate available | Four candidate PNG files exist; select one final icon. |
| Small icon (114 x 114) | Pending | Export from the selected source artwork; do not rely on an automatic upscale/downscale without visual review. |
| Screenshots | Pending | Amazon requires 3 to 10 Fire tablet screenshots. |
| English listing copy | Pending | Adapt the Play Store draft to Amazon's short description, long description, and feature bullets. |
| Korean listing copy | Pending | Add only if Korean is selected as a localized Appstore listing language. |
| Privacy policy URL | Pending deployment | GitHub Pages policy page is prepared locally but must be committed and deployed. |
| Support contact | Ready | `joygle.dev@gmail.com` |
| Fire TV assets | Not required | Do not target Fire TV in this release. |

## Submission Package

Keep source-controlled templates here. Store binaries and final image exports outside Git, for example in a local `release-assets/` folder excluded by `.gitignore`.

```text
release-assets/
└── amazon-appstore/
    ├── app-release.aab
    ├── icons/
    │   ├── large-icon-512.png
    │   └── small-icon-114.png
    └── screenshots/
        ├── en-US/
        └── ko-KR/
```

## Required Amazon Tablet Assets

- Small icon: 114 x 114 PNG, transparent.
- Large icon: 512 x 512 PNG, transparent.
- Screenshots: 3 to 10 PNG or JPEG files captured from the Fire tablet experience.
- Promotional image: optional 1024 x 500 PNG or JPEG.

The app is portrait-oriented. Capture tablet screenshots in the actual portrait experience; do not create marketing mockups that misrepresent the application.

## Submission Sequence

1. Select and validate the final app icon.
2. Install the production candidate on a Fire tablet or comparable Fire OS test device.
3. Capture three English screenshots; capture Korean equivalents if publishing a Korean listing.
4. Finalize listing text and product feature bullets.
5. Deploy the public privacy-policy and support URLs.
6. Create the Amazon app record and upload the AAB.
7. Complete content policy, category, language, and support contact fields.
8. Submit only after all tablet smoke-test checks pass.

See [submission-checklist.md](submission-checklist.md) for the detailed validation list.
