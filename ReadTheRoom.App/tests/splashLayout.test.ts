import { describe, expect, it } from "vitest";
import { getIntroCtaTop } from "../utils/splashLayout";

describe("intro CTA layout", () => {
  it("positions the CTA above the embedded tagline on a standard phone", () => {
    const ctaTop = getIntroCtaTop({
      viewportWidth: 360,
      viewportHeight: 640,
      bottomInset: 0,
      ctaHeight: 64,
    });

    expect(ctaTop).toBeCloseTo(509, 0);
  });

  it("positions the CTA above the embedded tagline on a tall phone", () => {
    const ctaTop = getIntroCtaTop({
      viewportWidth: 360,
      viewportHeight: 780,
      bottomInset: 24,
      ctaHeight: 64,
    });

    expect(ctaTop).toBeCloseTo(576, 0);
  });
});
