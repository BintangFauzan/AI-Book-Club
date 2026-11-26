import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { DesignColors } from '@/constants/theme';

type TagProps = {
  children: React.ReactNode;
  onPress?: () => void;
};

export function Tag({ children, onPress }: TagProps) {
  const Comp = onPress ? TouchableOpacity : View;
  return (
    <Comp style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.text}>{children}</Text>
    </Comp>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    color: DesignColors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
});
