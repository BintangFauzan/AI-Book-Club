import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DesignColors, Type } from '@/constants/theme';
import { Tag } from '@/components/Tag';
import { MiniCover } from '@/components/MiniCover';
import { BrandHeader } from '@/components/BrandHeader';
import { Toast } from '@/components/Toast';
import { useToast } from '@/contexts/ToastContext';
import { useBooks } from '@/contexts/BookContext';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { toast, showToast } = useToast();
  const { books, loaded, importing, importBookFromDevice, searchBooks } = useBooks();
  const [query, setQuery] = React.useState('');
  const filteredBooks = searchBooks(query);
  const inProgress = books.filter(
    (book) => book.progressPercent > 0 && book.progressPercent < 100
  ).length;

  async function handleAddBook() {
    const book = await importBookFromDevice();
    if (book) {
      router.push(`/reader?bookId=${encodeURIComponent(book.id)}`);
    }
  }

  return (
    <View style={styles.container}>
      <Toast visible={toast.visible} message={toast.message} />
      <ScrollView contentContainerStyle={styles.scroll} style={styles.scrollView}>
        <View style={[styles.padding, { paddingTop: insets.top + 8 }]}>
          <BrandHeader onProfile={() => showToast('Profile and reading preferences')} />
          <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
          <Text style={styles.h1}>Bookshelf</Text>

          <View style={styles.headerRow}>
            <Text style={styles.muted}>
              {books.length} books · {inProgress} in progress
            </Text>
            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search"
                placeholderTextColor={DesignColors.muted}
                accessibilityLabel="Cari buku"
                returnKeyType="search"
              />
            </View>
          </View>

          {loaded && books.length === 0 ? (
            <Text style={[styles.muted, styles.empty]}>
              Belum ada buku. Import PDF dari perangkat untuk mulai membaca.
            </Text>
          ) : null}

          {loaded && books.length > 0 && filteredBooks.length === 0 ? (
            <Text style={[styles.muted, styles.empty]}>
              Tidak ada buku yang cocok dengan “{query.trim()}”.
            </Text>
          ) : null}

          <View style={styles.grid}>
            {filteredBooks.map((book) => (
              <Pressable
                key={book.id}
                style={styles.cardWrap}
                onPress={() => router.push(`/reader?bookId=${encodeURIComponent(book.id)}`)}
                accessibilityRole="button"
                accessibilityLabel={`${book.title} by ${book.author}`}
              >
                <MiniCover
                  text={book.coverText}
                  backgroundColor={book.coverColor}
                  width="100%"
                  fontSize={18}
                />
                <Text style={styles.title}>{book.title}</Text>
                <Text style={[styles.muted, styles.author]}>{book.author}</Text>
                <View style={styles.tagWrap}>
                  <Tag>
                    {book.progressPercent >= 100
                      ? 'Finished'
                      : book.progressPercent > 0
                        ? `Reading · ${book.progressPercent}%`
                        : 'Want to read'}
                  </Tag>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.addWrap, pressed && styles.pressed]}
            onPress={handleAddBook}
            disabled={importing}
            accessibilityRole="button"
          >
            <Text style={styles.addText}>{importing ? 'Mengimpor...' : '＋ Add a book'}</Text>
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
  empty: {
    marginTop: 24,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchIcon: {
    fontSize: 16,
    lineHeight: 20,
    color: DesignColors.muted,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
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
