import { describe, expect, it } from 'vitest';
import { STAMP_ANIMATION } from '../utils/stampAnimation';

describe('stamp animation timeline', () => {
  it('matches the impact peak of the bundled stamp sound', () => {
    expect(STAMP_ANIMATION.impactAtMs).toBe(380);
    expect(STAMP_ANIMATION.impactAtMs).toBeLessThan(
      STAMP_ANIMATION.totalDurationMs,
    );
  });

  it('pulls back from a close view and settles after impact', () => {
    expect(STAMP_ANIMATION.initialScale).toBe(1.4);
    expect(STAMP_ANIMATION.pullbackScale).toBe(0.8);
    expect(STAMP_ANIMATION.impactScale).toBeGreaterThan(1);
    expect(STAMP_ANIMATION.settledScale).toBe(1);
    expect(STAMP_ANIMATION.initialRotation).toBe(-30);
    expect(STAMP_ANIMATION.settledRotation).toBe(0);
  });

  it('holds briefly after impact before the short crossfade', () => {
    expect(STAMP_ANIMATION.totalDurationMs).toBe(650);
    expect(
      STAMP_ANIMATION.totalDurationMs - STAMP_ANIMATION.impactAtMs,
    ).toBe(270);
    expect(STAMP_ANIMATION.crossfadeDurationMs).toBe(200);
    expect(STAMP_ANIMATION.initialOpacity).toBe(0);
    expect(STAMP_ANIMATION.settledOpacity).toBe(1);
  });
});
