import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { preloadLaunchVisualAssets } from "../utils/assetPreload";
import { LAUNCH_AUDIO } from "../shared/assets/registry";
import { STAMP_ANIMATION } from "../utils/stampAnimation";
import { getIntroCtaTop } from "../utils/splashLayout";

type Props = {
  onTransitionReady: () => void;
  onLoadComplete: () => void;
};

export default function SplashScreen({
  onTransitionReady,
  onLoadComplete,
}: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [isBackgroundReady, setIsBackgroundReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const stampOpacity = useRef(new Animated.Value(0)).current;
  const stampScale = useRef(
    new Animated.Value(STAMP_ANIMATION.initialScale),
  ).current;
  const stampRotation = useRef(
    new Animated.Value(STAMP_ANIMATION.initialRotation),
  ).current;
  const screenShakeX = useRef(new Animated.Value(0)).current;
  const screenShakeY = useRef(new Animated.Value(0)).current;
  const stampAudioPlayerRef = useRef<AudioPlayer | null>(null);
  const stampAudioCleanupTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const hasStartedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const stampAudioPlayer = createAudioPlayer(LAUNCH_AUDIO.stampImpact, {
      updateInterval: 250,
      keepAudioSessionActive: true,
    });
    stampAudioPlayer.volume = 0.9;
    stampAudioPlayerRef.current = stampAudioPlayer;

    void preloadLaunchVisualAssets().then(() => {
      if (isMountedRef.current) {
        setIsBackgroundReady(true);
      }
    });

    return () => {
      isMountedRef.current = false;
      fadeAnim.stopAnimation();
      stampOpacity.stopAnimation();
      stampScale.stopAnimation();
      stampRotation.stopAnimation();
      screenShakeX.stopAnimation();
      screenShakeY.stopAnimation();

      if (!hasStartedRef.current) {
        stampAudioPlayer.remove();
        stampAudioPlayerRef.current = null;
      }
    };
  }, [
    fadeAnim,
    screenShakeX,
    screenShakeY,
    stampOpacity,
    stampRotation,
    stampScale,
  ]);

  const handleStart = useCallback(async () => {
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;
    setHasStarted(true);

    const stampAudioPlayer = stampAudioPlayerRef.current;
    if (stampAudioPlayer) {
      stampAudioPlayer.play();
      stampAudioCleanupTimerRef.current = setTimeout(() => {
        stampAudioPlayer.pause();
        stampAudioPlayer.remove();
        if (stampAudioPlayerRef.current === stampAudioPlayer) {
          stampAudioPlayerRef.current = null;
        }
        stampAudioCleanupTimerRef.current = null;
      }, 1100);
    }

    try {
      const [, stampFinished] = await Promise.all([
        preloadLaunchVisualAssets(),
        new Promise<boolean>((resolve) => {
          Animated.parallel([
            Animated.sequence([
              Animated.timing(stampOpacity, {
                toValue: STAMP_ANIMATION.revealOpacity,
                duration: 150,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(stampOpacity, {
                toValue: STAMP_ANIMATION.settledOpacity,
                duration: STAMP_ANIMATION.impactAtMs - 150,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(stampScale, {
                toValue: STAMP_ANIMATION.pullbackScale,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(stampScale, {
                toValue: STAMP_ANIMATION.impactScale,
                duration: STAMP_ANIMATION.impactAtMs - 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(stampScale, {
                toValue: STAMP_ANIMATION.settledScale,
                duration: 170,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(stampRotation, {
                toValue: STAMP_ANIMATION.pullbackRotation,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(stampRotation, {
                toValue: STAMP_ANIMATION.settledRotation,
                duration: STAMP_ANIMATION.impactAtMs - 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.delay(STAMP_ANIMATION.impactAtMs),
              Animated.timing(screenShakeX, {
                toValue: -6,
                duration: 30,
                useNativeDriver: true,
              }),
              Animated.timing(screenShakeX, {
                toValue: 7,
                duration: 35,
                useNativeDriver: true,
              }),
              Animated.timing(screenShakeX, {
                toValue: -4,
                duration: 35,
                useNativeDriver: true,
              }),
              Animated.timing(screenShakeX, {
                toValue: 2,
                duration: 30,
                useNativeDriver: true,
              }),
              Animated.timing(screenShakeX, {
                toValue: 0,
                duration: 35,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.delay(STAMP_ANIMATION.impactAtMs),
              Animated.timing(screenShakeY, {
                toValue: 3,
                duration: 30,
                useNativeDriver: true,
              }),
              Animated.timing(screenShakeY, {
                toValue: -3,
                duration: 35,
                useNativeDriver: true,
              }),
              Animated.timing(screenShakeY, {
                toValue: 2,
                duration: 35,
                useNativeDriver: true,
              }),
              Animated.timing(screenShakeY, {
                toValue: -1,
                duration: 30,
                useNativeDriver: true,
              }),
              Animated.timing(screenShakeY, {
                toValue: 0,
                duration: 35,
                useNativeDriver: true,
              }),
            ]),
            Animated.delay(STAMP_ANIMATION.totalDurationMs),
          ]).start(({ finished }) => resolve(finished));
        }),
      ]);

      if (!stampFinished) return;
    } catch {
      if (isMountedRef.current) {
        stampOpacity.stopAnimation();
        stampScale.stopAnimation();
        stampRotation.stopAnimation();
        screenShakeX.stopAnimation();
        screenShakeY.stopAnimation();
        hasStartedRef.current = false;
        setHasStarted(false);
        stampOpacity.setValue(0);
        stampScale.setValue(STAMP_ANIMATION.initialScale);
        stampRotation.setValue(STAMP_ANIMATION.initialRotation);
        screenShakeX.setValue(0);
        screenShakeY.setValue(0);
      }
      return;
    }

    if (!isMountedRef.current) return;

    onTransitionReady();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!isMountedRef.current) return;

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: STAMP_ANIMATION.crossfadeDurationMs,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished && isMountedRef.current) {
            onLoadComplete();
          }
        });
      });
    });
  }, [
    fadeAnim,
    onLoadComplete,
    onTransitionReady,
    screenShakeX,
    screenShakeY,
    stampOpacity,
    stampRotation,
    stampScale,
  ]);

  const stampRotationDegrees = stampRotation.interpolate({
    inputRange: [
      STAMP_ANIMATION.initialRotation,
      STAMP_ANIMATION.settledRotation,
    ],
    outputRange: [
      `${STAMP_ANIMATION.initialRotation}deg`,
      `${STAMP_ANIMATION.settledRotation}deg`,
    ],
  });
  const INTRO_IMAGE_WIDTH = 941;
  const INTRO_IMAGE_HEIGHT = 1672;

  const reservedBottom = Math.max(insets.bottom, 10);
  const visualHeight = Math.max(height - reservedBottom, 1);

  // main.png resizeMode="contain"과 동일한 scale
  const imageScale = Math.min(
    width / INTRO_IMAGE_WIDTH,
    visualHeight / INTRO_IMAGE_HEIGHT,
  );

  const portraitImageScale = 360 / INTRO_IMAGE_WIDTH;

  const ctaScale = Math.min(1, imageScale / portraitImageScale);
  const ctaWidth = 340;
  const ctaHeight = 64;

  const visualWidth = Math.min(width, 420);

  const ctaTop = getIntroCtaTop({
    viewportWidth: width,
    viewportHeight: height,
    bottomInset: insets.bottom,
    ctaHeight,
  });

  const stampWidth = Math.min(Math.round(visualWidth * 0.78), 340);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.visualContainer,
          { marginBottom: Math.max(insets.bottom, 10) },
          {
            transform: [
              { translateX: screenShakeX },
              { translateY: screenShakeY },
            ],
          },
        ]}
      >
        {isBackgroundReady ? (
          <Image
            source={require("../assets/images/main.png")}
            style={styles.backgroundImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.backgroundPlaceholder} />
        )}

        <View pointerEvents="none" style={styles.darkOverlay} />

        <Animated.View
          pointerEvents="none"
          style={[styles.stampOverlay, { opacity: stampOpacity }]}
        >
          <View style={styles.stampBackdrop} />
          <Animated.Image
            source={require("../assets/images/Stamp.png")}
            resizeMode="contain"
            style={[
              {
                width: stampWidth,
                height: stampWidth / (1278 / 1230),
                transform: [
                  { scale: stampScale },
                  { rotate: stampRotationDegrees },
                ],
              },
            ]}
          />
        </Animated.View>

        {isBackgroundReady ? (
          <View
            style={[
              styles.bottomContent,
              {
                top: ctaTop,
                width: ctaWidth,
                minHeight: ctaHeight,
                transform: [{ scale: ctaScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.startButton,
                {
                  height: ctaHeight,
                  minHeight: ctaHeight,
                },
              ]}
              activeOpacity={hasStarted ? 1 : 0.9}
              disabled={hasStarted}
              onPress={handleStart}
            >
              <View style={styles.startButtonCopy}>
                <Text style={styles.startButtonTitle}>
                  MAKE YOUR FIRST CHOICE
                </Text>
                <Text style={styles.startButtonSubtitle}>START YOUR STORY</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  visualContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  backgroundPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121B32",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  stampOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    elevation: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stampBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
  bottomContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    width: "100%",
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7C433",
    borderWidth: 2,
    borderColor: "#FFE9A3",
    shadowColor: "#FFBF1F",
    shadowOpacity: 0.58,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  startButtonCopy: {
    width: "100%",
    alignItems: "center",
  },
  startButtonTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
    color: "#272014",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  startButtonSubtitle: {
    marginTop: 0,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
    color: "#6E4B09",
    letterSpacing: 1.2,
    textAlign: "center",
  },
});
