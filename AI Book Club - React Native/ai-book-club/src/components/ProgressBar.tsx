import { View, StyleSheet } from 'react-native';
import { DesignColors } from '@/constants/theme';

type ProgressBarProps = {
  percent: number;
  height?: number;
};

export function ProgressBar({ percent, height = 6 }: ProgressBarProps) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <View
      style={[styles.track, { height }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: value }}
    >
      <View style={[styles.fill, { width: `${value}%`, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: 'rgba(255,255,255,0.63)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: DesignColors.brown,
    borderRadius: 8,
  },
});
