import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity, useWindowDimensions } from 'react-native';
import { preloadLaunchVisualAssets } from '../utils/assetPreload';

type Props = {
  onLoadComplete: () => void;
};

export default function SplashScreen({ onLoadComplete }: Props) {
  const { width } = useWindowDimensions();
  const [isBackgroundReady, setIsBackgroundReady] = useState(false);
  const loadingProgress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const startButtonFade = useRef(new Animated.Value(1)).current;
  const loadingFade = useRef(new Animated.Value(0)).current;
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void preloadLaunchVisualAssets().then(() => {
      if (isMounted) {
        setIsBackgroundReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    Animated.parallel([
      Animated.timing(startButtonFade, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(loadingFade, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 2000,
      delay: 120,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }).start(() => onLoadComplete());
    });
  }, [fadeAnim, hasStarted, loadingFade, loadingProgress, onLoadComplete, startButtonFade]);

  const barWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const posterWidth = Math.min(width, 420);
  const ctaWidth = Math.min(Math.round(posterWidth * 0.78), 320);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <View
        style={{
          position: 'relative',
          width: posterWidth,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {isBackgroundReady ? (
          <Image
            source={require('../assets/images/main.png')}
            style={{
              position: 'absolute',
              top: '2.5%',
              left: '2.5%',
              width: '95%',
              height: '95%',
            }}
            resizeMode="contain"
          />
        ) : (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#000000',
            }}
          />
        )}

        {isBackgroundReady ? (
          <View
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 96,
              width: ctaWidth,
              minHeight: 74,
              marginLeft: -(ctaWidth / 2),
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <Animated.View
              pointerEvents={hasStarted ? 'none' : 'auto'}
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: startButtonFade,
                zIndex: 3,
              }}
            >
              <TouchableOpacity
                style={{
                  width: '100%',
                  minHeight: 82,
                  paddingLeft: 28,
                  paddingRight: 22,
                  paddingVertical: 14,
                  borderRadius: 999,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#F7C433',
                  borderWidth: 2,
                  borderColor: '#FFE9A3',
                  shadowColor: '#FFBF1F',
                  shadowOpacity: 0.58,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 10,
                }}
                activeOpacity={0.9}
                onPress={() => setHasStarted(true)}
              >
                <View style={styles.startButtonCopy}>
                  <Text style={styles.startButtonTitle}>Make your first choice</Text>
                  <Text style={styles.startButtonSubtitle}>START YOUR STORY</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loadingFade,
                zIndex: 4,
              }}
            >
              <View
                style={{
                  width: '100%',
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: 'rgba(22, 31, 56, 0.34)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.28)',
                }}
              >
                <View
                  style={{
                    height: 8,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <Animated.View
                    style={{
                      width: barWidth,
                      height: '100%',
                      backgroundColor: '#FF8FB1',
                      borderRadius: 999,
                    }}
                  />
                </View>
              </View>
            </Animated.View>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  backgroundPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121B32',
  },
  taglineMask: {
    position: 'absolute',
    left: 48,
    right: 48,
    bottom: 102,
    height: 34,
    borderRadius: 18,
    backgroundColor: 'rgba(95, 83, 103, 0.20)',
  },
  taglineOverlay: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 126,
    alignItems: 'center',
  },
  taglineText: {
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    fontWeight: '500',
    letterSpacing: 0.1,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.16)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  bottomContent: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 96,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 74,
  },
  ctaLayer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startLayer: {
    position: 'relative',
    zIndex: 3,
  },
  loadingLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 4,
  },
  startButton: {
    width: '100%',
    maxWidth: 360,
    minHeight: 82,
    paddingLeft: 28,
    paddingRight: 22,
    paddingVertical: 14,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7C433',
    borderWidth: 2,
    borderColor: '#FFE9A3',
    shadowColor: '#FFBF1F',
    shadowOpacity: 0.58,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  startButtonCopy: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 12,
  },
  startButtonTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    color: '#272014',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  startButtonSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: '#6E4B09',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  startButtonArrow: {
    marginLeft: 12,
  },
  loadingShell: {
    width: '100%',
    maxWidth: 270,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(22, 31, 56, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  barTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FF8FB1',
    borderRadius: 999,
  },
});
