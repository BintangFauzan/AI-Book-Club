import { View, Text, StyleSheet } from 'react-native';
import { DesignColors } from '@/constants/theme';
import type { StyleProp, ViewStyle } from 'react-native';

type AvatarProps = {
  label: string;
  size?: number;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ label, size = 38, fontSize = 16, style }: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Text style={[styles.text, { fontSize, lineHeight: fontSize + 2 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    backgroundColor: DesignColors.sand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: DesignColors.ink,
    fontWeight: '700',
  },
});
