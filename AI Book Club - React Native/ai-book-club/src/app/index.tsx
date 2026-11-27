import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getDocumentAsync } from 'expo-document-picker';

import { DesignColors, Fonts, Type } from '@/constants/theme';
import { Streak } from '@/components/Streak';
import { BookCard } from '@/components/BookCard';
import { Tag } from '@/components/Tag';
import { MiniCover } from '@/components/MiniCover';
import { BrandHeader } from '@/components/BrandHeader';
import { Toast } from '@/components/Toast';
import { ProgressBar } from '@/components/ProgressBar';
import { importBook } from '@/services/pdf';
import { useBooks } from '@/hooks/useBooks';
import {
  logComplete,
  logError,
  logInfo,
  logInput,
  logOutput,
  logStart,
  logSuccess,
  logWarn,
} from '@/helpers/log';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [toast, setToast] = React.useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2400);
  };

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { books, loaded, addBook } = useBooks();
  const [importing, setImporting] = useState(false);

  const handlePickPdf = useCallback(async () => {
    logStart('PDF_IMPORT', 'file picker');
    setImporting(true);
    try {
      logInfo('PDF_IMPORT', 'Opening device file picker (PDF only)');
      const result = await getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: Platform.OS !== 'android',
      });
      if (result.canceled || result.assets.length === 0) {
        logWarn('PDF_IMPORT', 'File picker cancelled or no asset selected');
        setImporting(false);
        return;
      }
      const asset = result.assets[0];
      logInput('PDF_IMPORT', 'fileName', asset.name ?? 'Buku PDF');
      logInput('PDF_IMPORT', 'uri', asset.uri);
      logOutput('PDF_IMPORT', 'assetSelected', asset.name ?? 'Buku PDF');

      const book = await importBook(asset.uri, asset.name ?? 'Buku PDF');
      addBook(book);
      showToast('Buku ditambahkan ke rak');
      logInput('READER', 'bookId', book.id);
      logOutput('PDF_IMPORT', 'navigateTo', `/reader?bookId=${book.id}`);
      router.push(`/reader?bookId=${encodeURIComponent(book.id)}`);
      logSuccess('PDF_IMPORT', 'file picker');
    } catch (err: unknown) {
      logError('PDF_IMPORT', 'Failed to process PDF', {
        functionName: 'handlePickPdf()',
        reason: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      showToast('Gagal memproses PDF');
    } finally {
      setImporting(false);
      logComplete('PDF_IMPORT', 'file picker');
    }
  }, [addBook, router]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

  return (
    <View style={styles.container}>
      <Toast visible={toast.visible} message={toast.message} />
      <ScrollView contentContainerStyle={styles.scroll} style={styles.scrollView}>
        <View style={[styles.padding, { paddingTop: insets.top + 8 }]}>
          <BrandHeader onProfile={() => showToast('Profile and reading preferences')} />

          <Text style={styles.eyebrow}>{formatDate(currentDate)}</Text>
          {/*<Text style={styles.h1}>Make room{'\n'}for a good story.</Text>*/}

          <Streak
            days={12}
            message="Your reading rhythm is growing"
            dayLetters={['M', 'T', 'W', 'T', 'F', 'S', 'S']}
          />

          <View style={styles.sectionHead}>
            <Text style={styles.h2}>Pick up where you left off</Text>
            <Tag>Reading</Tag>
          </View>

          {loaded ? (
            books.length > 0 ? (
              <BookCard
                coverText={books[0].coverText}
                coverColor={books[0].coverColor}
                author={books[0].author}
                title={books[0].title}
                subtitle={`${books[0].progressPercent}% selesai · Halaman ${books[0].currentPage} / ${books[0].totalPages}`}
                progressPercent={books[0].progressPercent}
                page={String(books[0].currentPage)}
                totalPage={String(books[0].totalPages)}
                onContinue={() => router.push(`/reader?bookId=${books[0].id}`)}
              />
            ) : (
              <Pressable
                style={styles.startButton}
                onPress={handlePickPdf}
                disabled={importing}
                accessibilityRole="button"
                accessibilityLabel="Mulai Membaca"
              >
                <Text style={styles.startButtonText}>Mulai Membaca</Text>
              </Pressable>
            )
          ) : null}

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

          <View style={styles.nextChapter}>
            {books.map((book) => (
              <Pressable
                key={book.id}
                style={styles.nextCard}
                onPress={() => router.push(`/reader?bookId=${book.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Lanjutkan membaca ${book.title}`}
              >
                <MiniCover
                  text={book.coverText}
                  backgroundColor={book.coverColor}
                  fontSize={16}
                />
                <View style={styles.nextInfo}>
                  <Text style={styles.nextTitle}>{book.title}</Text>
                  <Text style={styles.nextAuthor}>{book.author}</Text>
                  <View style={styles.nextProgress}>
                    <ProgressBar percent={book.progressPercent} />
                    <Text style={styles.nextPercent}>{book.progressPercent}%</Text>
                  </View>
                </View>
              </Pressable>
            ))}
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
  startButton: {
    alignSelf: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: DesignColors.sand,
  },
  startButtonText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: DesignColors.ink,
    textAlign: 'center',
  },
  nextChapter: {
    gap: 12,
  },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: DesignColors.sand,
    borderRadius: 18,
    padding: 14,
    minHeight: 100,
  },
  nextInfo: {
    flex: 1,
    minWidth: 0,
  },
  nextTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    lineHeight: 22,
    color: DesignColors.ink,
  },
  nextAuthor: {
    ...Type.muted,
    color: DesignColors.muted,
  },
  nextProgress: {
    marginTop: 8,
  },
  nextPercent: {
    ...Type.tiny,
    color: DesignColors.muted,
    marginTop: 4,
  },
});
