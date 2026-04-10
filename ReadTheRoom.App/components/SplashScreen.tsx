import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

type Props = {
  onLoadComplete: () => void;
};

export default function SplashScreen({ onLoadComplete }: Props) {
  // Loading progress (0 to 1)
  const loadingProgress = useRef(new Animated.Value(0)).current;
  // Entire screen fade-out
  const fadeAnim = useRef(new Animated.Value(1)).current;
  // Title fade-in
  const titleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Title fade-in
    Animated.timing(titleFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 2. Loading bar progress (2 seconds)
    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 2000,
      delay: 400,
      useNativeDriver: false, // With width animation, we can't use native driver
    }).start(() => {
      // 3. After loading completes, fade out the entire screen
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }).start(() => onLoadComplete());
    });
  }, []);

  const barWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Main background image */}
      <Image
        source={require('../../assets/UI/Main.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Dark gradient overlay — bottom text readability */}
      <View style={styles.overlay} />

      {/* Title */}
      <Animated.View style={[styles.titleContainer, { opacity: titleFade }]}>
        <Text style={styles.subtitle}>2026 · VANCOUVER</Text>
        <Text style={styles.title}>밴쿠버 생존기</Text>
        <Text style={styles.titleEn}>Vancouver Survival Guide</Text>
      </Animated.View>

      {/* bottom loading bar area */}
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLabel}>Loading...</Text>
        {/* loading bar track */}
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: barWidth }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  // bottom 60% darkened — text readability
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  // Title
  titleContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 4,
    marginBottom: 8,
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 4,
  },
  titleEn: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },

  // loading bar — main image bottom overlay
  loadingContainer: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    right: 40,
  },
  loadingLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
    letterSpacing: 2,
  },
  barTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#F59F00', // Funds 색상과 통일 — 황금색
    borderRadius: 2,
  },
});
