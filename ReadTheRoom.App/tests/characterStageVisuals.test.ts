import { describe, expect, test } from 'vitest';
import { CHARACTER_STAGE_VISUALS } from '../locales/characterStageVisuals';

describe('Stage character visual configuration', () => {
  test('uses the approved per-character scales', () => {
    expect(CHARACTER_STAGE_VISUALS).toEqual({
      ken: { scale: 1.2 },
      amy: { scale: 1.12 },
      sora: { scale: 1.08 },
    });
  });

  test('does not introduce position offsets', () => {
    for (const visual of Object.values(CHARACTER_STAGE_VISUALS)) {
      expect(Object.keys(visual)).toEqual(['scale']);
    }
  });
});

