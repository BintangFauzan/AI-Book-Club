import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { DesignColors, Fonts } from '@/constants/theme';

const SPLASH_DURATION_MS = 2400;

export function SplashScreenView({ onFinish }: { onFinish: () => void }) {
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    // Native splash tetap terlihat sampai layar ini siap, lalu fade ke splash React.
    SplashScreen.hide();
    const timer = setTimeout(onFinish, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <Pressable
      style={[styles.screen, { paddingTop: insets.top + 54, paddingBottom: insets.bottom + 34 }]}
      onPress={onFinish}
      accessibilityRole="button"
      accessibilityLabel="Masuk ke Folio"
    >
      <View style={styles.mark} accessible={false}>
        <View style={styles.pageBack} />
        <View style={styles.pageFront}>
          <View style={styles.lineTitle} />
          <View style={styles.line} />
          <View style={styles.line} />
        </View>
        <Text style={styles.spark}>✦</Text>
      </View>

      <Text style={styles.kicker}>READ · REFLECT · CONNECT</Text>
      <Text style={styles.title}>Stories bring{'\n'}us together.</Text>
      <Text style={styles.copy}>
        A quieter place to read deeply,{'\n'}think freely, and share the good bits.
      </Text>
      <Text style={styles.foot}>YOUR NEXT CHAPTER STARTS HERE</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DesignColors.paper,
    paddingHorizontal: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  mark: {
    width: 148,
    height: 156,
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 42,
  },
  pageBack: {
    position: 'absolute',
    left: 20,
    top: 14,
    width: 94,
    height: 126,
    borderRadius: 14,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    backgroundColor: DesignColors.blue,
    transform: [{ rotate: '-10deg' }],
    shadowColor: DesignColors.ink,
    shadowOffset: { width: 7, height: 11 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 4,
  },
  pageFront: {
    position: 'absolute',
    left: 36,
    top: 4,
    width: 94,
    height: 126,
    borderRadius: 14,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    backgroundColor: DesignColors.sand,
    paddingTop: 31,
    paddingHorizontal: 16,
    gap: 8,
    transform: [{ rotate: '7deg' }],
    shadowColor: DesignColors.ink,
    shadowOffset: { width: 7, height: 11 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 5,
  },
  lineTitle: {
    height: 3,
    width: '70%',
    backgroundColor: DesignColors.brown,
  },
  line: {
    height: 2,
    width: '100%',
    backgroundColor: 'rgba(156,115,104,0.47)',
  },
  spark: {
    position: 'absolute',
    right: 1,
    top: 2,
    fontSize: 30,
    lineHeight: 34,
    color: DesignColors.orange,
  },
  kicker: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.87,
    fontWeight: '800',
    color: DesignColors.brown,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 43,
    lineHeight: 44,
    letterSpacing: -1.5,
    color: DesignColors.ink,
    marginTop: 12,
    marginBottom: 14,
  },
  copy: {
    fontSize: 15,
    lineHeight: 24,
    color: DesignColors.muted,
  },
  foot: {
    alignSelf: 'center',
    marginTop: 20,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1.5,
    color: DesignColors.muted,
  },
});
