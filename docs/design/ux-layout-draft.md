# UX Layout Draft

> Status: Portfolio summary
> Source note: [ux-layout-draft.ko.md](ux-layout-draft.ko.md)

This document summarizes the intended layout principles for the main story screen in ReadTheRoom.

## Purpose

The story screen should help the player quickly understand the current situation, read the social context, and choose an action without losing immersion.

The screen is organized around five priority zones:

- Header
- Scene
- Status overlay
- Narrative
- Choices

The goal is not to show every piece of information at once. The goal is to preserve a clear reading order across small phones, tall phones, tablets, and web viewports.

## Visual Priority

The player's attention should move in this order:

1. Current scene title and day context.
2. Character and background for emotional immersion.
3. Current condition or mood status.
4. Situation description.
5. Available choices.

This keeps the screen readable even when the scenario text or choice text becomes longer.

## Layout Principles

- Keep the header compact and stable.
- Let the character and background carry the atmosphere.
- Avoid overlays that compete with the character's face or important text.
- Keep the situation panel close to the lower part of the character, not floating awkwardly in empty space.
- Keep choices inside the same visual panel as the situation description when possible.
- Use modals for longer feedback or tips instead of crowding the main screen.

## Responsive Behavior

The game UI should behave like a vertical game canvas:

- On phones, the canvas can use the full viewport width.
- On wider screens, the game canvas should stay centered and width-limited.
- Bottom panels and buttons should be positioned relative to the game canvas, not the full browser viewport.
- Safe-area padding should be respected for device notches and system navigation.

## Result And Feedback UX

After the player chooses an option:

- Highlight the selected choice.
- De-emphasize the unselected choices.
- Open the feedback modal automatically.
- Show feedback, stat changes, and optional tips in the modal.
- Keep the main scene lightweight after selection.

The main principle is:

```text
Choice first, feedback second, continuation always clear.
```

## StoryMap UX

The StoryMap should prioritize progress comprehension over decoration:

- Completed scenes are tappable.
- The current scene is visually emphasized.
- Locked scenes are visible but subdued.
- Week tabs help navigation without overwhelming the main card area.
- Repeated action text should be avoided when a fixed instruction already explains the interaction.

## Portfolio Notes

This layout direction supports the game's core product promise: helping players practice reading social situations through short, choice-driven scenes. The UI should feel playful and narrative-driven, but the information hierarchy must stay disciplined.
