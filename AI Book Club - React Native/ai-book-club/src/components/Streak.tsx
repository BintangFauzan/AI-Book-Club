import { View, Text, StyleSheet } from 'react-native';
import { DesignColors, Fonts } from '@/constants/theme';

type DayProps = {
  letter: string;
  done?: boolean;
};

function Day({ letter, done }: DayProps) {
  return (
    <View style={[styles.day, done && styles.done]}>
      <Text style={[styles.letter, done && styles.doneLetter]}>{letter}</Text>
    </View>
  );
}

type StreakProps = {
  days: number;
  message: string;
  dayLetters: string[]; // 7 letters
};

export function Streak({ days, message, dayLetters }: StreakProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.days}>{days} days</Text>
        <Text style={styles.msg}>{message}</Text>
      </View>
      <View
        style={styles.dots}
        accessibilityLabel="Last seven days reading streak"
      >
        {dayLetters.map((letter, i) => (
          <Day key={i} letter={letter} done={i < 6} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignColors.ink,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  left: {
    flex: 1,
  },
  days: {
    color: DesignColors.orange,
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '700',
  },
  msg: {
    color: '#ddd',
    fontSize: 12,
    lineHeight: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  day: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#393a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  done: {
    backgroundColor: DesignColors.orange,
  },
  letter: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  doneLetter: {
    color: DesignColors.ink,
  },
});
