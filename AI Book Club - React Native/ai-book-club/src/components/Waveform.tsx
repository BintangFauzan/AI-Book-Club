import { View, StyleSheet } from 'react-native';

type WaveformProps = {
  count?: number;
  color?: string;
};

export function Waveform({ count = 24, color = '#9C7368' }: WaveformProps) {
  const heights = [
    11, 20, 15, 29, 18, 25, 12, 32, 19, 13, 27, 16, 22, 10, 29, 16, 24, 12, 30, 18, 14, 26, 11, 21, 9,
  ];
  const bars = heights.slice(0, count).map((h, i) => (
    <View key={i} style={[styles.bar, { height: h, backgroundColor: color }]} />
  ));
  return <View style={styles.container}>{bars}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bar: {
    width: 3,
    borderRadius: 4,
  },
});
