import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DesignColors, Fonts, Type } from '@/constants/theme';
import { BrandHeader } from '@/components/BrandHeader';
import { Toast } from '@/components/Toast';

export default function ReaderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [toast, setToast] = React.useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2400);
  };

  return (
    <View style={styles.container}>
      <Toast visible={toast.visible} message={toast.message} />
      <ScrollView contentContainerStyle={styles.scroll} style={styles.scrollView}>
        <View style={[styles.padding, { paddingTop: insets.top + 8 }]}>
          <BrandHeader onProfile={() => showToast('Profile and reading preferences')} />
          <View style={styles.readerHead}>
            <Pressable
              style={({ pressed }) => [styles.softBtn, pressed && styles.pressed]}
              onPress={() => router.replace('/')}
              accessibilityRole="button"
              accessibilityLabel="Back to home"
            >
              <Text style={styles.softBtnText}>←</Text>
            </Pressable>
            <View style={styles.center}>
              <Text style={styles.eyebrow}>THE CREATIVE ACT</Text>
              <Text style={styles.tiny}>Chapter 9 · The Experiment</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.softBtn, pressed && styles.pressed]}
              onPress={() => showToast('Reader settings')}
              accessibilityRole="button"
              accessibilityLabel="Reader settings"
            >
              <Text style={styles.softBtnText}>Aa</Text>
            </Pressable>
          </View>

          <Text style={styles.eyebrow}>PAGE 186</Text>
          <Text style={styles.title}>The beauty of the first try</Text>

          <View>
            <Text style={styles.p}>
              When we begin something new, we bring with us the desire to get it right. But the
              first attempt is not a verdict. It is an opening.
            </Text>
            <Text style={styles.p}>
              We can give ourselves permission to make a mess. To follow a thread without knowing
              where it leads. To{' '}
              <Text style={styles.mark}>let curiosity move faster than judgment.</Text>
            </Text>
            <Text style={styles.p}>
              In this space, the work is not a performance. It is a conversation with what wants to
              come through.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
              onPress={() =>
                showToast('AI explanation: Curiosity helps ideas develop before self-criticism narrows them.')
              }
              accessibilityRole="button"
            >
              <Text style={styles.actionText}>✦ Explain with AI</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
              onPress={() => showToast('Define: curiosity — a strong desire to know or learn something.')}
              accessibilityRole="button"
            >
              <Text style={styles.actionText}>Define</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
              onPress={() => showToast('Passage saved to your highlights')}
              accessibilityRole="button"
            >
              <Text style={styles.actionText}>Save highlight</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
              onPress={() => showToast('Quote copied to share sheet')}
              accessibilityRole="button"
            >
              <Text style={styles.actionText}>Share quote</Text>
            </Pressable>
          </View>

          <View style={styles.navRow}>
            <Pressable
              style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
              onPress={() => showToast('Previous page')}
              accessibilityRole="button"
            >
              <Text style={styles.navText}>‹ Previous</Text>
            </Pressable>
            <Text style={styles.tiny}>186 / 302</Text>
            <Pressable
              style={({ pressed }) => [styles.navBtnPrimary, pressed && styles.pressed]}
              onPress={() => showToast('Opened page 187')}
              accessibilityRole="button"
            >
              <Text style={styles.navTextPrimary}>Next page ›</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignColors.paper,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 24,
  },
  padding: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  readerHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  softBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.66)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  softBtnText: {
    fontSize: 17,
    lineHeight: 21,
    color: DesignColors.ink,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  eyebrow: {
    ...Type.eyebrow,
    color: DesignColors.muted,
    marginBottom: 6,
  },
  tiny: {
    ...Type.tiny,
    color: DesignColors.muted,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    lineHeight: 32,
    color: DesignColors.ink,
    marginBottom: 18,
  },
  p: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    lineHeight: 32,
    color: '#252323',
    marginBottom: 15,
  },
  mark: {
    backgroundColor: '#f0c6a9',
    color: '#252323',
  },
  actions: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  actionBtn: {
    width: '48.5%',
    minHeight: 46,
    borderWidth: 1,
    borderColor: 'rgba(7,7,7,0.13)',
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.53)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontWeight: '700',
    color: DesignColors.ink,
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  navBtn: {
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.66)',
    justifyContent: 'center',
  },
  navBtnPrimary: {
    backgroundColor: DesignColors.ink,
    borderRadius: 14,
    minHeight: 44,
    paddingVertical: 13,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  navText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: DesignColors.ink,
  },
  navTextPrimary: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: '#fff',
  },
  pressed: {
    opacity: 0.7,
  },
});
