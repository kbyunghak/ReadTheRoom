const INTRO_IMAGE_ASPECT_RATIO = 941 / 1672;

const TAGLINE_TOP_Y_RATIO = 0.935;
const CTA_TAGLINE_GAP = 16;

type IntroCtaLayoutInput = {
  viewportWidth: number;
  viewportHeight: number;
  bottomInset: number;
  ctaHeight: number;
};

export const getIntroCtaTop = ({
  viewportWidth,
  viewportHeight,
  bottomInset,
  ctaHeight,
}: IntroCtaLayoutInput) => {
  const reservedBottom = Math.max(bottomInset, 10);
  const visualHeight = Math.max(viewportHeight - reservedBottom, 1);

  const renderedImageHeight = Math.min(
    visualHeight,
    viewportWidth / INTRO_IMAGE_ASPECT_RATIO,
  );

  const imageTop = (visualHeight - renderedImageHeight) / 2;

  const taglineTop = imageTop + renderedImageHeight * TAGLINE_TOP_Y_RATIO;

  const desiredTop = taglineTop - CTA_TAGLINE_GAP - ctaHeight;

  return Math.max(0, Math.min(desiredTop, visualHeight - ctaHeight));
};
