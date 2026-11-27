import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DesignColors, FontOptions, Fonts, Type } from '@/constants/theme';
import { BrandHeader } from '@/components/BrandHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { MiniCover } from '@/components/MiniCover';
import { Toast } from '@/components/Toast';
import { useReader } from '@/contexts/ReaderContext';
import { useToast } from '@/contexts/ToastContext';

export default function ReaderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { toast, showToast } = useToast();
  const { book, loaded, hasReadableText, current, total, percent, paragraphs, goTo, fontFamily, fontSize, setFontFamily, changeFontSize } = useReader();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!loaded) return <ActivityIndicator style={styles.loading} />;
  if (!book) {
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
              onPress={() => setSettingsOpen((open) => !open)}
              accessibilityRole="button"
              accessibilityLabel="Pengaturan font pembaca"
              accessibilityState={{ expanded: settingsOpen }}
            >
              <Text style={styles.softBtnText}>Aa</Text>
            </Pressable>
          </View>

          {settingsOpen ? (
            <View style={styles.settings}>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Ukuran teks</Text>
                <View style={styles.sizeControls}>
                  <Pressable
                    style={({ pressed }) => [styles.sizeBtn, pressed && styles.pressed]}
                    onPress={() => changeFontSize(-2)}
                    disabled={fontSize <= 12}
                    accessibilityRole="button"
                    accessibilityLabel="Perkecil ukuran teks"
                  >
                    <Text style={styles.sizeBtnText}>A−</Text>
                  </Pressable>
                  <Text style={styles.sizeValue}>{fontSize}</Text>
                  <Pressable
                    style={({ pressed }) => [styles.sizeBtn, pressed && styles.pressed]}
                    onPress={() => changeFontSize(2)}
                    disabled={fontSize >= 32}
                    accessibilityRole="button"
                    accessibilityLabel="Perbesar ukuran teks"
                  >
                    <Text style={styles.sizeBtnText}>A+</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.settingsLabel}>Jenis font</Text>
              <View style={styles.fontRow}>
                {FontOptions.map((option) => (
                  <Pressable
                    key={option.label}
                    style={({ pressed }) => [
                      styles.fontChip,
                      option.value === fontFamily && styles.fontChipActive,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setFontFamily(option.value)}
                    accessibilityRole="button"
                    accessibilityLabel={`Font ${option.label}`}
                    accessibilityState={{ selected: option.value === fontFamily }}
                  >
                    <Text
                      style={[
                        styles.fontChipText,
                        { fontFamily: option.value },
                        option.value === fontFamily && styles.fontChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.coverWrap}>
            <MiniCover text={book.coverText} backgroundColor={book.coverColor} fontSize={20} />
          </View>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>{book.author}</Text>

          <Text style={styles.eyebrow}>ISI BUKU</Text>
          {hasReadableText ? (
            paragraphs.map((p, i) => (
              <Text
                key={i}
                style={[styles.p, { fontFamily, fontSize, lineHeight: Math.round(fontSize * 1.75) }]}
              >
                {p}
              </Text>
            ))
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
  settings: {
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsLabel: {
    ...Type.eyebrow,
    color: DesignColors.muted,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sizeBtn: {
    minWidth: 40,
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: DesignColors.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeBtnText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: DesignColors.ink,
  },
  sizeValue: {
    ...Type.tiny,
    color: DesignColors.ink,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  fontRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fontChip: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: DesignColors.paper,
    justifyContent: 'center',
  },
  fontChipActive: {
    backgroundColor: DesignColors.ink,
  },
  fontChipText: {
    fontSize: 13,
    lineHeight: 17,
    color: DesignColors.ink,
  },
  fontChipTextActive: {
    color: '#fff',
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
