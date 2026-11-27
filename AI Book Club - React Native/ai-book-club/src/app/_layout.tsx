import { DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { AppProviders } from '@/providers/AppProviders';

export default function TabLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      <AppProviders>
        <AppTabs />
      </AppProviders>
    </ThemeProvider>
  );
}
