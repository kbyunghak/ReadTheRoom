import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { preloadCoreVisualAssets } from '../utils/assetPreload';

export const unstable_settings = {
  anchor: '(tabs)',
};

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Keep the native splash visible until our core images are cached.
});

const hideAndroidSystemNavigation = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  await NavigationBar.setBehaviorAsync('overlay-swipe');
  await NavigationBar.setVisibilityAsync('hidden');
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    void hideAndroidSystemNavigation().catch(() => {
      // Some Android shells/dev clients reject immersive mode requests.
      // The app should keep running even if the system UI cannot be hidden.
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        await preloadCoreVisualAssets();
      } finally {
        if (isMounted) {
          setIsAppReady(true);
        }
        await SplashScreen.hideAsync().catch(() => {});
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAppReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar hidden style="light" />
    </ThemeProvider>
  );
}
