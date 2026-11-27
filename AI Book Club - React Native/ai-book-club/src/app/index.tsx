import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { DesignColors, Fonts, Type } from '@/constants/theme';
import { Streak } from '@/components/Streak';
import { BookCard } from '@/components/BookCard';
import { Tag } from '@/components/Tag';
import { MiniCover } from '@/components/MiniCover';
import { BrandHeader } from '@/components/BrandHeader';
import { Toast } from '@/components/Toast';
import { ProgressBar } from '@/components/ProgressBar';
import { useBooks } from '@/contexts/BookContext';
import { useHighlights } from '@/contexts/HighlightContext';
import { useToast } from '@/contexts/ToastContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { toast, showToast } = useToast();
  const { books, loaded, importing, importProgress, importBookFromDevice } = useBooks();
  const { currentQuote } = useHighlights();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const player = useAudioPlayer(require('../../assets/audio/always-with-me.mp3'));
  const playerStatus = useAudioPlayerStatus(player);

  React.useEffect(() => {
    // expo-audio tidak punya opsi loop di hook; set imperatif setelah player dibuat.
    // eslint-disable-next-line react-hooks/immutability
    player.loop = true;
  }, [player]);

  function toggleMusic() {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  function handleDismissImport() {
    // Impor tidak bisa dibatalkan di tengah jalan.
  }

  async function handlePickPdf() {
    const book = await importBookFromDevice();
    if (book) {
      router.push(`/reader?bookId=${encodeURIComponent(book.id)}`);
    }
  }

  function formatDate(date: Date) {
    return date
      .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      .toUpperCase();
  }

  const currentQuoteBook = currentQuote
    ? books.find((book) => book.id === currentQuote.bookId)
    : undefined;

  return (
    <View style={styles.container}>
      <Toast visible={toast.visible} message={toast.message} />
      <Modal
        visible={importing}
        transparent
        animationType="fade"
        onRequestClose={handleDismissImport}
      >
        <View style={styles.importOverlay}>
          <View style={styles.importPanel} accessibilityViewIsModal>
            <ActivityIndicator size="large" color={DesignColors.brown} />
            <Text style={styles.importTitle}>Mengimpor buku</Text>
            <Text style={styles.importPercent}>
              {importProgress > 0 ? `${importProgress}%` : 'Menyiapkan file...'}
            </Text>
            <Text style={styles.importHint}>Buku besar butuh waktu lebih lama.</Text>
          </View>
        </View>
      </Modal>
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
          </View>

          <View style={styles.quoteBlock}>
            {currentQuote ? (
              <View style={styles.savedQuote}>
                <Text style={styles.quote}>“{currentQuote.text}”</Text>
                <Text style={styles.quoteBook}>{currentQuoteBook?.title ?? ''}</Text>
              </View>
            ) : (
              <Text style={styles.quote}>
                “The act of creating is not limited to making things. It is a way of moving through
                the world.”
              </Text>
            )}
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
            {loaded && books.length === 0 ? (
              <Pressable
                style={styles.importCard}
                onPress={handlePickPdf}
                disabled={importing}
                accessibilityRole="button"
                accessibilityLabel="Import buku baru"
              >
                <View style={styles.importIcon}>
                  <Text style={styles.importIconText}>+</Text>
                </View>
                <View style={styles.nextInfo}>
                  <Text style={styles.nextTitle}>
                    {importing ? 'Mengimpor...' : 'Import buku baru'}
                  </Text>
                  <Text style={styles.nextAuthor}>Tambah PDF dari perangkat</Text>
                </View>
              </Pressable>
            ) : null}
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
      <Pressable
        style={[styles.musicButton, { bottom: insets.bottom }]}
        onPress={toggleMusic}
        accessibilityRole="button"
        accessibilityLabel={playerStatus.playing ? 'Jeda musik' : 'Putar musik'}
      >
        <Text style={styles.musicIcon}>{playerStatus.playing ? '❚❚' : '▶'}</Text>
      </Pressable>
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
  savedQuote: {
    marginBottom: 12,
  },
  quoteBook: {
    ...Type.tiny,
    color: DesignColors.brown,
    fontWeight: '700',
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  importOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7,7,7,0.44)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  importPanel: {
    backgroundColor: DesignColors.white,
    borderRadius: 22,
    padding: 26,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 12,
  },
  importTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 26,
    color: DesignColors.ink,
    marginTop: 16,
  },
  importPercent: {
    ...Type.h2,
    color: DesignColors.brown,
    marginTop: 6,
  },
  importHint: {
    ...Type.muted,
    color: DesignColors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  importCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: DesignColors.muted,
    padding: 14,
    minHeight: 100,
  },
  importIcon: {
    width: 66,
    aspectRatio: 0.7,
    borderRadius: 8,
    backgroundColor: DesignColors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importIconText: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    lineHeight: 38,
    color: DesignColors.brown,
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
  musicButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 48,
    borderRadius: 28,
    backgroundColor: DesignColors.brown,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  musicIcon: {
    color: DesignColors.paper,
    fontSize: 20,
    lineHeight: 24,
  },
});
