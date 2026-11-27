import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { DesignColors, Fonts, Type } from '@/constants/theme';
import { BrandHeader } from '@/components/BrandHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { MiniCover } from '@/components/MiniCover';
import { Toast } from '@/components/Toast';
import { useBooks } from '@/hooks/useBooks';
import { computeProgress } from '@/helpers/book';
import {
  logComplete,
  logInfo,
  logInput,
  logOutput,
  logStart,
  logSuccess,
  logWarn,
} from '@/helpers/log';

export default function ReaderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookId = typeof params.bookId === 'string' ? params.bookId : undefined;
  const { books, loaded, updateProgress } = useBooks();
  const [toast, setToast] = React.useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2400);
  };

  const book = books.find((b) => b.id === bookId);
  const [page, setPage] = React.useState(book?.currentPage ?? 1);

  React.useEffect(() => {
    logStart('READER', 'persist reading progress');
    if (book && page !== book.currentPage) {
      const percent = book.totalPages > 0 ? Math.round((page / book.totalPages) * 100) : 0;
      logInput('READER', 'bookId', book.id);
      logInput('READER', 'currentPage', page);
      logInput('READER', 'totalPages', book.totalPages);
      logInput('READER', 'progressPercent', percent);
      updateProgress(book.id, page, percent);
      logOutput('READER', 'progressPercent', percent);
      logSuccess('READER', 'persist reading progress');
    } else {
      logInfo('READER', 'no progress change to persist');
      logComplete('READER', 'persist reading progress');
    }
  }, [book, page, updateProgress]);

  if (!loaded) return <ActivityIndicator style={styles.loading} />;
  if (!book) {
    logWarn('READER', 'book not found');
    logInput('READER', 'requestedBookId', bookId ?? 'undefined');
    return (
      <View style={styles.container}>
        <View style={[styles.padding, { paddingTop: insets.top + 8 }]}>
          <BrandHeader onProfile={() => showToast('Profil dan preferensi bacaan')} />
          <Pressable
            style={styles.back}
            onPress={() => router.replace('/')}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <Text style={styles.backText}>← Kembali ke beranda</Text>
          </Pressable>
          <Text style={styles.emptyTitle}>Buku tidak ditemukan</Text>
          <Text style={styles.emptyText}>Silakan impor sebuah PDF dari beranda.</Text>
        </View>
      </View>
    );
  }

  logStart('READER', 'open reader');
  logInput('READER', 'bookId', book.id);
  logInput('READER', 'title', book.title);
  logInput('READER', 'totalPages', book.totalPages);
  logInput('READER', 'currentPage', book.currentPage);
  logInput('READER', 'extractedCharacters', book.text.length);

  const pages = book.text ? book.text.split('\n\n').filter(Boolean) : [];
  const total = pages.length > 0 ? pages.length : book.totalPages;
  const hasReadableText = pages.length > 0 && total > 0;
  const current = hasReadableText ? Math.max(1, Math.min(page, total)) : 0;
  const percent = hasReadableText ? computeProgress(current, total) : 0;
  const content = hasReadableText ? pages[current - 1] : '';
  const paragraphs = content.split('\n').filter(Boolean);

  logOutput('READER', 'renderedPage', current);
  logOutput('READER', 'totalRenderPages', total);
  logOutput('READER', 'progressPercent', percent);
  logSuccess('READER', 'open reader');

  const goTo = (next: number) => {
    logStart('READER', 'navigate page');
    logInput('READER', 'requestedPage', next);
    logInput('READER', 'currentPage', current);
    const target = Math.max(1, Math.min(next, total));
    setPage(target);
    showToast(target === total ? 'Halaman terakhir' : `Halaman ${target}`);
    logOutput('READER', 'targetPage', target);
    logSuccess('READER', 'navigate page');
  };

  return (
    <View style={styles.container}>
      <Toast visible={toast.visible} message={toast.message} />
      <ScrollView contentContainerStyle={styles.scroll} style={styles.scrollView}>
        <View style={[styles.padding, { paddingTop: insets.top + 8 }]}>
          <BrandHeader onProfile={() => showToast('Profil dan preferensi bacaan')} />
          <View style={styles.readerHead}>
            <Pressable
              style={({ pressed }) => [styles.softBtn, pressed && styles.pressed]}
              onPress={() => router.replace('/')}
              accessibilityRole="button"
              accessibilityLabel="Back to home"
            >
              <Text style={styles.softBtnText}>←</Text>
            </Pressable>
            <View style={styles.center}>
              <Text style={styles.eyebrow}>{book.title}</Text>
              <Text style={styles.tiny}>{hasReadableText ? `Halaman ${current} of ${total}` : 'Halaman tidak tersedia'}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.softBtn, pressed && styles.pressed]}
              onPress={() => showToast('Pengaturan pembaca')}
              accessibilityRole="button"
              accessibilityLabel="Reader settings"
            >
              <Text style={styles.softBtnText}>Aa</Text>
            </Pressable>
          </View>

          <View style={styles.coverWrap}>
            <MiniCover text={book.coverText} backgroundColor={book.coverColor} fontSize={20} />
          </View>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>{book.author}</Text>

          <Text style={styles.eyebrow}>ISI BUKU</Text>
          {hasReadableText ? (
            paragraphs.map((p, i) => <Text key={i} style={styles.p}>{p}</Text>)
          ) : (
            <Text style={styles.p}>Teks buku tidak tersedia. PDF perlu diimpor ulang setelah ekstraksi berhasil.</Text>
          )}

          <View style={styles.progressWrap}>
            <ProgressBar percent={percent} />
            <Text style={styles.percentText}>{percent}% selesai</Text>
          </View>

          <View style={styles.navRow}>
            <Pressable
              style={({ pressed }) => [styles.navBtn, (!hasReadableText || current === 1) && styles.navBtnDisabled, pressed && styles.pressed]}
              onPress={() => goTo(current - 1)}
              disabled={!hasReadableText || current === 1}
              accessibilityRole="button"
              accessibilityLabel="Halaman sebelumnya"
            >
              <Text style={styles.navText}>‹ Sebelumnya</Text>
            </Pressable>
            <Text style={styles.pageInfo}>{hasReadableText ? `${current} / ${total}` : '— / —'}</Text>
            <Pressable
              style={({ pressed }) => [styles.navBtnPrimary, (!hasReadableText || current === total) && styles.navBtnDisabled, pressed && styles.pressed]}
              onPress={() => goTo(current + 1)}
              disabled={!hasReadableText || current === total}
              accessibilityRole="button"
              accessibilityLabel="Halaman berikutnya"
            >
              <Text style={styles.navTextPrimary}>Selanjutnya ›</Text>
            </Pressable>
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readerHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  softBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.66)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  softBtnText: {
    fontSize: 17,
    lineHeight: 21,
    color: DesignColors.ink,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  eyebrow: {
    ...Type.eyebrow,
    color: DesignColors.muted,
    marginBottom: 6,
  },
  tiny: {
    ...Type.tiny,
    color: DesignColors.muted,
  },
  coverWrap: {
    alignItems: 'center',
    marginVertical: 16,
  },
  bookTitle: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 30,
    color: DesignColors.ink,
    textAlign: 'center',
    marginBottom: 4,
  },
  bookAuthor: {
    ...Type.muted,
    color: DesignColors.muted,
    textAlign: 'center',
    marginBottom: 18,
  },
  p: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    lineHeight: 32,
    color: '#252323',
    marginBottom: 14,
    textAlign: 'justify',
  },
  progressWrap: {
    marginTop: 10,
    alignItems: 'center',
  },
  percentText: {
    ...Type.tiny,
    color: DesignColors.muted,
    marginTop: 6,
  },
  pageInfo: {
    ...Type.tiny,
    color: DesignColors.muted,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  navBtn: {
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.66)',
    justifyContent: 'center',
    opacity: 1,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnPrimary: {
    backgroundColor: DesignColors.ink,
    borderRadius: 14,
    minHeight: 44,
    paddingVertical: 13,
    paddingHorizontal: 16,
    justifyContent: 'center',
    opacity: 1,
  },
  navText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: DesignColors.ink,
  },
  navTextPrimary: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: '#fff',
  },
  pressed: {
    opacity: 0.7,
  },
  back: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 15,
    lineHeight: 20,
    color: DesignColors.ink,
    textDecorationLine: 'underline',
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
    color: DesignColors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    ...Type.muted,
    color: DesignColors.muted,
    textAlign: 'center',
  },
});
