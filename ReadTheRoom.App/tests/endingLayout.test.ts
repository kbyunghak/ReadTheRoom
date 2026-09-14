import { describe, expect, it } from 'vitest';
import { getEndingLayoutMetrics } from '../utils/endingLayout';

const portraitMetrics = (height: number, safeAreaTop = 24, safeAreaBottom = 24) =>
  getEndingLayoutMetrics({
    canvasWidth: 390,
    canvasHeight: height,
    safeAreaTop,
    safeAreaBottom,
    horizontalPadding: 16,
    imageAspectRatio: 1684 / 2528,
    isLandscape: false,
  });

describe('getEndingLayoutMetrics', () => {
  it('targets the reference image hierarchy on a normal Android viewport', () => {
    const metrics = portraitMetrics(844, 24, 34);

    expect(metrics.availableHeight).toBe(786);
    expect(metrics.imageHeight / metrics.availableHeight).toBeCloseTo(0.63, 2);
    expect(metrics.buttonHeight).toBe(56);
    expect(metrics.buttonGap).toBe(10);
    expect(metrics.messagePaddingVertical).toBe(12);
    expect(metrics.verySmall).toBe(false);
  });

  it('reduces vertical image and control space before requiring tiny-screen scrolling', () => {
    const compact = portraitMetrics(680);
    const tiny = portraitMetrics(540);

    expect(compact.imageHeight / compact.availableHeight).toBeCloseTo(0.6, 2);
    expect(compact.buttonHeight).toBe(52);
    expect(compact.messagePaddingVertical).toBe(10);
    expect(compact.verySmall).toBe(false);

    expect(tiny.imageHeight / tiny.availableHeight).toBeCloseTo(0.54, 2);
    expect(tiny.buttonHeight).toBe(48);
    expect(tiny.buttonGap).toBe(8);
    expect(tiny.messagePaddingVertical).toBe(8);
    expect(tiny.verySmall).toBe(true);
  });

  it('preserves the source aspect ratio at every portrait size', () => {
    for (const height of [540, 680, 844, 980]) {
      const metrics = portraitMetrics(height);
      expect(metrics.imageWidth / metrics.imageHeight).toBeCloseTo(1684 / 2528, 5);
      expect(metrics.imageWidth).toBeLessThanOrEqual(390 - 32);
    }
  });

  it('caps a landscape image by safe available height without stretching it', () => {
    const metrics = getEndingLayoutMetrics({
      canvasWidth: 960,
      canvasHeight: 540,
      safeAreaTop: 0,
      safeAreaBottom: 0,
      horizontalPadding: 28,
      imageAspectRatio: 1684 / 2528,
      isLandscape: true,
    });

    expect(metrics.imageHeight).toBeLessThanOrEqual(metrics.availableHeight * 0.88);
    expect(metrics.imageWidth / metrics.imageHeight).toBeCloseTo(1684 / 2528, 5);
    expect(metrics.compact).toBe(false);
  });
});
