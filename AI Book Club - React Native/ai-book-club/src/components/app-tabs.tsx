import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { DesignColors } from '@/constants/theme';

const TABS = [
  { name: 'index', label: 'Home', icon: '⌂' },
  { name: 'library', label: 'Library', icon: '▤' },
  { name: 'reader', label: 'Read', icon: '▣' },
  { name: 'audio', label: 'Listen', icon: '♫' },
  { name: 'club', label: 'Club', icon: '◉' },
] as const;

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: DesignColors.paper },
        tabBarActiveTintColor: DesignColors.brown,
        tabBarInactiveTintColor: DesignColors.muted,
        tabBarStyle: {
          backgroundColor: 'rgba(230,231,230,0.95)',
          borderTopColor: 'rgba(7,7,7,0.07)',
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 18, lineHeight: 20 }}>{tab.icon}</Text>
            ),
            tabBarLabel: ({ color, focused }) => (
              <Text
                style={{
                  color,
                  fontSize: 10,
                  lineHeight: 12,
                  fontWeight: focused ? '800' : '600',
                }}
              >
                {tab.label}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
