import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { preloadLaunchVisualAssets } from '../utils/assetPreload';

type Props = {
  onComplete: () => void;
};

export default function WarningScreen({ onComplete }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const hasCompleted = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const finish = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;

    Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => onComplete());
  }, [onComplete, opacity]);

  useEffect(() => {
    let isMounted = true;

    void preloadLaunchVisualAssets().then(() => {
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    Animated.timing(opacity, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      finish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [finish, isReady, opacity]);

  return (
    <Pressable style={styles.pressable} onPress={finish}>
      {isReady ? (
        <ImageBackground
          source={require('../assets/images/background/dream.png')}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.content}>
              <Animated.View style={[styles.messageBlock, { opacity }]}>
                <Text style={styles.koText}>
                  이 게임은 재미를 위한 가상의 콘텐츠입니다. {"\n"}
                  의견이나 문제 보고는 구글 플레이 스토어 리뷰를 통해 공유해주세요.
                </Text>
                <Text style={styles.enText}>
                  This is a fictional game created for entertainment purposes.{"\n"}
                  Please share your feedback or report issues via Google Play Store reviews.
                </Text>
              </Animated.View>
            </View>
          </SafeAreaView>
        </ImageBackground>
      ) : (
        <View style={styles.placeholderBackground} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  placeholderBackground: {
    flex: 1,
    backgroundColor: '#1A2030',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingTop: 44,
  },
  messageBlock: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  koText: {
    color: '#2F1D1A',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(255,255,255,0.22)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  enText: {
    color: 'rgba(47,29,26,0.92)',
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '600',
    textAlign: 'center',
  },
});
