# Amy JSON Schema v2.8 Reference

> Status: Portfolio summary
> Source note: [json-schema-amy-v2.8.ko.md](json-schema-amy-v2.8.ko.md)

This document summarizes a historical Amy-focused JSON schema draft.

## Purpose

The Amy schema draft adapts the general ReadTheRoom scenario structure for Amy's point of view.

It is reference material only. The current runtime format is documented in [Scenario Format](../scenario-format.md).

## Character-Specific Framing

The draft emphasizes that scenario text should be written from Amy's perspective instead of using generic player language.

For Amy, this means:

- Her job and daily environment should shape the scene pressure.
- Feedback should reflect practical work and service-industry experience.
- Choices should feel like realistic working-holiday decisions.
- Stats should support her specific emotional and social arc.

## Schema Direction

The draft follows the same broad direction as the Ken v2.7 reference:

- Day-keyed scenario buckets.
- `type`-based node behavior.
- Localized Korean and English text.
- Structured choice data.
- Summary nodes for day completion.
- Separated ID ranges for main flow, special events, and summaries.

## Implementation Notes

Before adapting this document into active data:

- Compare it against the current `Scenario` type.
- Confirm required localization fields.
- Verify all `nextScenarioId` links.
- Avoid copying historical balance numbers without review.
- Keep Amy-specific scenario data separate from Ken's active release data.

## Portfolio Notes

This reference shows how the scenario system can support character-specific routes while keeping the engine structure consistent. The value is not only in the JSON shape, but in the discipline of writing content through a specific character lens.
