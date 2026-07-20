# JSON Schema v2.7 Reference

> Status: Portfolio summary
> Source note: [json-schema-v2.7.ko.md](json-schema-v2.7.ko.md)

This document summarizes an earlier JSON scenario schema reference for Ken's route.

## Purpose

The v2.7 schema draft describes how system design notes can be represented as runtime scenario data.

The current runtime format is documented in [Scenario Format](../scenario-format.md). This file is historical reference material and should not override the active implementation.

## Design Goals

The schema draft aimed to:

- Keep scenario data simple to load.
- Remove unnecessary top-level metadata when the filename already identifies the character.
- Use Day buckets for readability.
- Use `type` instead of multiple boolean flags for normal, summary, and ending nodes.
- Separate main flow, special events, and summary nodes through ID ranges.

## Suggested Data Shape

The draft uses a Day-keyed object:

```json
{
  "Day1": {
    "1": { "id": 1, "type": "NORMAL" },
    "2": { "id": 2, "type": "NORMAL" }
  },
  "Day2": {
    "20": { "id": 20, "type": "NORMAL" }
  }
}
```

## Node Concepts

The draft separates nodes into:

- `NORMAL`: regular player-choice scenes.
- `SUMMARY`: end-of-day wrap-up scenes.
- `ENDING`: terminal or final outcome scenes.
- Special event nodes, usually separated by higher ID ranges.

Each regular node is expected to include:

- A unique `id`.
- `day`, `episode`, and related progress metadata.
- Localized Korean and English text.
- Three choices.
- Choice feedback.
- Complete stat changes.
- A valid `nextScenarioId`.

## Implementation Notes

The active project already follows many of these ideas, but the official source of truth is still the current runtime JSON and TypeScript types.

Before using this historical schema for new content:

- Verify IDs against the active scenario registry.
- Confirm `nextScenarioId` links.
- Confirm `week`, `day`, and `mainEpisode` metadata.
- Keep JSON and TypeScript scenario packs from being registered for the same character at the same time.

## Portfolio Notes

This schema draft shows the project's movement from free-form story writing toward structured, testable narrative data. It is most useful as design history and as background for future content migration work.
