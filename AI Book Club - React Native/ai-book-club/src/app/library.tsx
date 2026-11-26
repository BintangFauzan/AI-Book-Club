import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DesignColors, Type } from '@/constants/theme';
import { Tag } from '@/components/Tag';
import { MiniCover } from '@/components/MiniCover';
import { BrandHeader } from '@/components/BrandHeader';
import { Toast } from '@/components/Toast';

type BookItem = {
  id: string;
  coverColor: string;
  coverText: string;
  title: string;
  author: string;
  tag: string;
};

const BOOKS: BookItem[] = [
  {
    id: '1',
    coverColor: '#b7c8d2',
    coverText: 'BRAIDING\nSWEETGRASS',
    title: 'Braiding Sweetgrass',
    author: 'Robin Wall Kimmerer',
    tag: 'Want to read',
  },
  {
    id: '2',
    coverColor: '#cfbeae',
    coverText: 'TOMORROW\nAND TOMORROW',
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: 'Gabrielle Zevin',
    tag: 'Finished',
  },
  {
    id: '3',
    coverColor: '#9da4ac',
    coverText: 'PACHINKO',
    title: 'Pachinko',
    author: 'Min Jin Lee',
    tag: 'Reading · 38%',
  },
  {
    id: '4',
    coverColor: '#e89c6c',
    coverText: 'THE\nCREATIVE ACT',
    title: 'The Creative Act',
    author: 'Rick Rubin',
    tag: 'Reading · 62%',
  },
];

export default function LibraryScreen() {
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
          <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
          <Text style={styles.h1}>Bookshelf</Text>

          <View style={styles.headerRow}>
            <Text style={styles.muted}>12 books · 3 in progress</Text>
            <Pressable
              style={styles.searchWrap}
              onPress={() => showToast('Search your library')}
              accessibilityRole="button"
            >
              <Text style={styles.searchText}>⌕ Search</Text>
            </Pressable>
          </View>

          <View style={styles.grid}>
            {BOOKS.map((item) => (
              <Pressable
                key={item.id}
                style={styles.cardWrap}
                onPress={() => router.push('/reader')}
                accessibilityRole="button"
                accessibilityLabel={`${item.title} by ${item.author}`}
              >
                <MiniCover
                  text={item.coverText}
                  backgroundColor={item.coverColor}
                  width="100%"
                  fontSize={18}
                />
                <Text style={styles.title}>{item.title}</Text>
                <Text style={[styles.muted, styles.author]}>{item.author}</Text>
                <View style={styles.tagWrap}>
                  <Tag>{item.tag}</Tag>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.addWrap, pressed && styles.pressed]}
            onPress={() => showToast('Add a book to your shelf')}
            accessibilityRole="button"
          >
            <Text style={styles.addText}>＋ Add a book</Text>
          </Pressable>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  muted: {
    ...Type.muted,
    color: DesignColors.muted,
  },
  searchWrap: {
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  searchText: {
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 17,
    color: DesignColors.ink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
    marginTop: 24,
  },
  cardWrap: {
    width: '47.5%',
  },
  title: {
    ...Type.h3,
    color: DesignColors.ink,
    marginTop: 8,
    marginBottom: 4,
  },
  author: {
    marginBottom: 8,
  },
  tagWrap: {
    alignItems: 'flex-start',
  },
  addWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.66)',
  },
  addText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: DesignColors.ink,
  },
  pressed: {
    opacity: 0.7,
  },
});
