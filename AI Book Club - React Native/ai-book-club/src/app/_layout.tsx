import { useCallback, useState } from 'react';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import AppTabs from '@/components/app-tabs';
import { SplashScreenView } from '@/components/SplashScreenView';
import { AppProviders } from '@/providers/AppProviders';

// Tahan splash native sampai splash React siap, supaya transisinya tanpa layar kosong.
void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 500, fade: true });

export default function TabLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(function finishSplash() {
    setShowSplash(false);
  }, []);

  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      <AppProviders>
        {showSplash ? <SplashScreenView onFinish={handleSplashFinish} /> : <AppTabs />}
      </AppProviders>
    </ThemeProvider>
  );
}
