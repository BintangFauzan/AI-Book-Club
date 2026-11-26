import { View, Text, Pressable, StyleSheet } from 'react-native';
import { DesignColors, Fonts, Type } from '@/constants/theme';
import { ProgressBar } from '@/components/ProgressBar';

type BookCardProps = {
  coverText: string;
  coverColor: string;
  author: string;
  title: string;
  subtitle: string;
  progressPercent: number;
  page: string;
  totalPage: string;
  onContinue: () => void;
};

export function BookCard({
  coverText,
  coverColor,
  author,
  title,
  subtitle,
  progressPercent,
  page,
  totalPage,
  onContinue,
}: BookCardProps) {
  return (
    <View style={styles.cardWrap}>
      <View style={[styles.cover, { backgroundColor: coverColor }]}>
        <Text style={styles.coverSmall}>{author.toUpperCase()}</Text>
        <Text style={styles.coverTitle}>{coverText}</Text>
        <Text style={styles.coverSmall}>A WAY OF BEING</Text>
      </View>
      <View style={styles.infoWrap}>
        <Text style={styles.eyebrow}>YOUR CURRENT BOOK</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.muted}>{subtitle}</Text>
        <View style={styles.progressWrap}>
          <ProgressBar percent={progressPercent} />
        </View>
        <View style={styles.pageRow}>
          <Text style={styles.tiny}>Page {page}</Text>
          <Text style={styles.tiny}>of {totalPage}</Text>
        </View>
        <Pressable style={styles.continueBtn} onPress={onContinue} accessibilityRole="button">
          <Text style={styles.continueText}>Continue reading</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    backgroundColor: DesignColors.sand,
    borderRadius: 22,
    padding: 17,
    flexDirection: 'row',
    gap: 16,
    minHeight: 202,
    alignItems: 'center',
  },
  cover: {
    width: 112,
    aspectRatio: 0.7,
    flexShrink: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 5,
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#38271f',
    shadowOffset: { width: 5, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 13,
    elevation: 4,
  },
  coverSmall: {
    color: '#f8ead1',
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 1.1,
  },
  coverTitle: {
    color: '#f8ead1',
    fontFamily: Fonts.serif,
    fontSize: 16,
    lineHeight: 18,
  },
  infoWrap: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    ...Type.eyebrow,
    color: DesignColors.muted,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 21,
    lineHeight: 23,
    marginVertical: 7,
    color: DesignColors.ink,
  },
  muted: {
    ...Type.muted,
    color: DesignColors.muted,
  },
  progressWrap: {
    marginTop: 14,
    marginBottom: 7,
  },
  pageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  tiny: {
    ...Type.tiny,
    color: DesignColors.muted,
  },
  continueBtn: {
    marginTop: 5,
    backgroundColor: DesignColors.ink,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    minHeight: 46,
    justifyContent: 'center',
  },
  continueText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
  },
});
