import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignColors, Type } from '@/constants/theme';
import { MiniCover } from '@/components/MiniCover';
import { Waveform } from '@/components/Waveform';
import { BrandHeader } from '@/components/BrandHeader';
import { Toast } from '@/components/Toast';
import { useAudio } from '@/contexts/AudioContext';
import { useToast } from '@/contexts/ToastContext';

export default function AudioScreen() {
  const insets = useSafeAreaInsets();
  const { playing, togglePlay } = useAudio();
  const { toast, showToast } = useToast();

  return (
    <View style={styles.container}>
      <Toast visible={toast.visible} message={toast.message} />
      <ScrollView contentContainerStyle={styles.scroll} style={styles.scrollView}>
        <View style={[styles.padding, { paddingTop: insets.top + 8 }]}>
          <BrandHeader onProfile={() => showToast('Profile and reading preferences')} />
          <Text style={styles.eyebrow}>NOW PLAYING</Text>
          <Text style={styles.h1}>Listen, and let{'\n'}the words settle.</Text>

          <View style={styles.audioArt}>
            <MiniCover
              text={'THE\nCREATIVE\nACT'}
              backgroundColor={DesignColors.blue}
              width={124}
              fontSize={19}
            />
          </View>

          <View style={styles.center}>
            <Text style={styles.title}>The Creative Act</Text>
            <Text style={styles.muted}>Rick Rubin</Text>
          </View>

          <Text style={styles.chapter}>
            <Text style={styles.strong}>Chapter 9</Text>
            {' · '}The Experiment
          </Text>

          <View style={styles.playerBlock}>
            <View style={styles.waveWrap}>
              <Waveform count={24} color={DesignColors.brown} />
            </View>
            <View
              style={styles.sliderTrack}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: 38 }}
            >
              <View style={styles.sliderFill} />
              <View style={styles.sliderThumb} />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.tiny}>12:48</Text>
              <Text style={styles.tiny}>33:41</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <Pressable
              style={({ pressed }) => [styles.controlBtn, pressed && styles.pressed]}
              onPress={() => showToast('Back 15 seconds')}
              accessibilityRole="button"
              accessibilityLabel="Back 15 seconds"
            >
              <Text style={styles.controlText}>↶15</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}
              onPress={togglePlay}
              accessibilityRole="button"
              accessibilityLabel={playing ? 'Pause audio' : 'Play audio'}
            >
              <Text style={styles.playText}>{playing ? 'Ⅱ' : '▶'}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.controlBtn, pressed && styles.pressed]}
              onPress={() => showToast('Forward 15 seconds')}
              accessibilityRole="button"
              accessibilityLabel="Forward 15 seconds"
            >
              <Text style={styles.controlText}>15↷</Text>
            </Pressable>
          </View>

          <View style={styles.optionsRow}>
            <Pressable style={styles.optionLink} onPress={() => showToast('Sleep timer options')}>
              <Text style={styles.optionText}>Sleep timer</Text>
            </Pressable>
            <Pressable style={styles.optionLink} onPress={() => showToast('Playback speed set to 1×')}>
              <Text style={styles.optionText}>1× speed</Text>
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
  eyebrow: {
    ...Type.eyebrow,
    color: DesignColors.muted,
    marginBottom: 6,
  },
  h1: {
    ...Type.h1,
    color: DesignColors.ink,
    marginBottom: 18,
  },
  audioArt: {
    height: 210,
    borderRadius: 22,
    backgroundColor: DesignColors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  center: {
    alignItems: 'center',
  },
  title: {
    ...Type.h2,
    color: DesignColors.ink,
    marginBottom: 5,
  },
  muted: {
    ...Type.muted,
    color: DesignColors.muted,
  },
  chapter: {
    ...Type.muted,
    color: DesignColors.ink,
    marginTop: 24,
    textAlign: 'center',
  },
  strong: {
    fontWeight: '700',
  },
  playerBlock: {
    marginTop: 24,
  },
  waveWrap: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: 'rgba(7,7,7,0.12)',
    borderRadius: 8,
    overflow: 'visible',
  },
  sliderFill: {
    width: '38%',
    height: 6,
    backgroundColor: DesignColors.brown,
    borderRadius: 8,
  },
  sliderThumb: {
    position: 'absolute',
    left: '38%',
    top: -4,
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: 7,
    backgroundColor: DesignColors.brown,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 20,
  },
  tiny: {
    ...Type.tiny,
    color: DesignColors.muted,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 14,
  },
  controlBtn: {
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  controlText: {
    fontSize: 13,
    lineHeight: 17,
    color: DesignColors.ink,
  },
  playBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: DesignColors.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playText: {
    color: '#fff',
    fontSize: 17,
    lineHeight: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionLink: {
    paddingVertical: 6,
  },
  optionText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: DesignColors.brown,
  },
  pressed: {
    opacity: 0.7,
  },
});
