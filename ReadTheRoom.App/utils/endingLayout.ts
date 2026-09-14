type EndingLayoutInput = {
  canvasWidth: number;
  canvasHeight: number;
  safeAreaTop: number;
  safeAreaBottom: number;
  horizontalPadding: number;
  imageAspectRatio: number;
  isLandscape: boolean;
};

export type EndingLayoutMetrics = {
  availableHeight: number;
  contentPaddingVertical: number;
  imageWidth: number;
  imageHeight: number;
  imageGap: number;
  messagePaddingVertical: number;
  messageTitleGap: number;
  buttonHeight: number;
  buttonGap: number;
  buttonMarginTop: number;
  compact: boolean;
  verySmall: boolean;
};

const clampPositive = (value: number, fallback: number) =>
  Number.isFinite(value) && value > 0 ? value : fallback;

export function getEndingLayoutMetrics({
  canvasWidth,
  canvasHeight,
  safeAreaTop,
  safeAreaBottom,
  horizontalPadding,
  imageAspectRatio,
  isLandscape,
}: EndingLayoutInput): EndingLayoutMetrics {
  const availableHeight = Math.max(1, canvasHeight - safeAreaTop - safeAreaBottom);
  const aspectRatio = clampPositive(imageAspectRatio, 2 / 3);
  const compact = !isLandscape && availableHeight < 700;
  const verySmall = !isLandscape && availableHeight < 560;
  const contentPaddingVertical = isLandscape ? 16 : verySmall ? 4 : compact ? 6 : 8;
  const imageHeightShare = verySmall ? 0.54 : compact ? 0.6 : 0.63;
  const maxImageWidth = isLandscape
    ? Math.max(1, Math.round(canvasWidth * 0.52))
    : Math.max(1, canvasWidth - horizontalPadding * 2);
  const targetImageHeight = isLandscape
    ? availableHeight * 0.88
    : availableHeight * imageHeightShare;
  const imageHeight = Math.max(
    1,
    Math.min(targetImageHeight, maxImageWidth / aspectRatio),
  );

  return {
    availableHeight,
    contentPaddingVertical,
    imageWidth: imageHeight * aspectRatio,
    imageHeight,
    imageGap: isLandscape ? 0 : verySmall ? 6 : 8,
    messagePaddingVertical: isLandscape ? 10 : verySmall ? 8 : compact ? 10 : 12,
    messageTitleGap: 4,
    buttonHeight: isLandscape ? 52 : verySmall ? 48 : compact ? 52 : 56,
    buttonGap: isLandscape ? 9 : verySmall ? 8 : 10,
    buttonMarginTop: isLandscape ? 9 : verySmall ? 8 : 10,
    compact,
    verySmall,
  };
}
