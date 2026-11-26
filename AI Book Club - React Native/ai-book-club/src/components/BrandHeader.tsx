import { View, Text, StyleSheet, Pressable } from 'react-native';

import { DesignColors, Fonts } from '@/constants/theme';
import { Avatar } from '@/components/Avatar';

export function BrandHeader({ onProfile }: { onProfile: () => void }) {
  return (
    <View style={styles.top}>
      <Text style={styles.brandText}>
        folio<Text style={styles.orangeDot}>.</Text>
      </Text>
      <Pressable
        style={styles.avatarWrap}
        onPress={onProfile}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        <Avatar label="A" size={38} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandText: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: DesignColors.ink,
  },
  orangeDot: {
    color: DesignColors.orange,
  },
  avatarWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
