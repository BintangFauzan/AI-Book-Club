import { View, Text, StyleSheet } from 'react-native';
import type { DimensionValue } from 'react-native';
import { Fonts } from '@/constants/theme';

type MiniCoverProps = {
  text: string;
  backgroundColor: string;
  width?: DimensionValue;
  fontSize?: number;
};

export function MiniCover({ text, backgroundColor, width = 66, fontSize = 12 }: MiniCoverProps) {
  return (
    <View style={[styles.container, { width, backgroundColor }]}>
      <Text style={[styles.text, { fontSize, lineHeight: fontSize * 1.15 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 0.7,
    padding: 7,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
    borderBottomLeftRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 4.5,
    elevation: 3,
  },
  text: {
    color: '#25343a',
    fontFamily: Fonts.serif,
    textAlign: 'center',
  },
});
