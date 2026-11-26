import { View, Text, StyleSheet } from 'react-native';
import { DesignColors } from '@/constants/theme';

type ToastProps = {
  visible: boolean;
  message: string;
};

export function Toast({ visible, message }: ToastProps) {
  if (!visible) return null;
  return (
    <View
      style={styles.container}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      pointerEvents="none"
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 30,
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: DesignColors.ink,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 99,
    maxWidth: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.19,
    shadowRadius: 10,
    elevation: 6,
  },
  text: {
    color: DesignColors.white,
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
  },
});
