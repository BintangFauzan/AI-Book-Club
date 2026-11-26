import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DesignColors, Fonts, Type } from '@/constants/theme';
import { Streak } from '@/components/Streak';
import { BookCard } from '@/components/BookCard';
import { Tag } from '@/components/Tag';
import { MiniCover } from '@/components/MiniCover';
import { BrandHeader } from '@/components/BrandHeader';
import { Toast } from '@/components/Toast';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [toast, setToast] = React.useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2400);
  };

  return (
    <View style={styles.container}>
      <Toast visible={toast.visible} message={toast.message} />
      <ScrollView contentContainerStyle={styles.scroll} style={styles.scrollView}>
        <View style={[styles.padding, { paddingTop: insets.top + 8 }]}>
          <BrandHeader onProfile={() => showToast('Profile and reading preferences')} />

          <Text style={styles.eyebrow}>MONDAY, OCTOBER 14</Text>
          <Text style={styles.h1}>Make room{'\n'}for a good story.</Text>

          <Streak
            days={12}
            message="Your reading rhythm is growing"
            dayLetters={['M', 'T', 'W', 'T', 'F', 'S', 'S']}
          />

          <View style={styles.sectionHead}>
            <Text style={styles.h2}>Pick up where you left off</Text>
            <Tag>Reading</Tag>
          </View>

          <BookCard
            coverText={'THE\nCREATIVE\nACT'}
            coverColor="#29434a"
            author="Rick Rubin"
            title="The Creative Act"
            subtitle="Rick Rubin · 42 min left"
            progressPercent={62}
            page="186"
            totalPage="302"
            onContinue={() => {
              showToast('Continue reading');
              router.push('/reader');
            }}
          />

          <View style={styles.sectionHead}>
            <Text style={styles.h2}>Today&apos;s thought</Text>
            <Pressable
              style={styles.textLink}
              onPress={() => showToast('Quote saved to your collection')}
              accessibilityRole="button"
            >
              <Text style={styles.textLinkText}>Save quote</Text>
            </Pressable>
          </View>

          <View style={styles.quoteBlock}>
            <Text style={styles.quote}>
              “The act of creating is not limited to making things. It is a way of moving through
              the world.”
            </Text>
          </View>

          <View style={styles.sectionHead}>
            <Text style={styles.h2}>For your next chapter</Text>
            <Pressable
              style={styles.textLink}
              onPress={() => {
                showToast('See all');
                router.push('/library');
              }}
              accessibilityRole="button"
            >
              <Text style={styles.textLinkText}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.recommendRow}>
            <MiniCover
              text={'BRAIDING\nSWEETGRASS'}
              backgroundColor={DesignColors.blue}
              width={66}
              fontSize={12}
            />
            <View style={styles.recommendInfo}>
              <Text style={styles.h3}>Braiding Sweetgrass</Text>
              <Text style={styles.muted}>Robin Wall Kimmerer</Text>
              <Text style={styles.muted}>Recommended by your club</Text>
            </View>
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
  h2: {
    ...Type.h2,
    color: DesignColors.ink,
  },
  h3: {
    ...Type.h3,
    color: DesignColors.ink,
    marginBottom: 4,
  },
  muted: {
    ...Type.muted,
    color: DesignColors.muted,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    gap: 12,
  },
  textLink: {
    paddingVertical: 4,
  },
  textLinkText: {
    color: DesignColors.brown,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 17,
  },
  quoteBlock: {
    borderLeftWidth: 2,
    borderLeftColor: DesignColors.orange,
    paddingLeft: 13,
    paddingVertical: 2,
  },
  quote: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    lineHeight: 25,
    color: DesignColors.ink,
  },
  recommendRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  recommendInfo: {
    flex: 1,
    minWidth: 0,
  },
});
