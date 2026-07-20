# Legacy Backend

ReadTheRoom previously included a .NET 8 Azure Functions backend.

The active project is now the Expo-based mobile app in `ReadTheRoom.App`. The backend is not part of the current runtime path.

## Historical Reference

The removed backend remains available in Git history under:

```text
archive/server-backend-before-removal-2026-06-10
```

Use this tag only when historical backend code needs to be inspected.

## Current Runtime

The current application uses local bundled data and local persistence:

- Scenario data is bundled in `ReadTheRoom.App/assets/data`.
- Runtime scenario loading is handled by `ReadTheRoom.App/utils/scenarioRegistry.ts`.
- Save/resume uses AsyncStorage through `ReadTheRoom.App/utils/gamePersistence.ts`.

## Documentation Rule

Do not describe the legacy backend as part of the active architecture. Link to this page instead when historical context is needed.
