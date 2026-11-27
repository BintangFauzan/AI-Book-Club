import { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DesignColors, FontOptions, Fonts, Type } from '@/constants/theme';
import { BrandHeader } from '@/components/BrandHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { MiniCover } from '@/components/MiniCover';
import { Toast } from '@/components/Toast';
import { useReader } from '@/contexts/ReaderContext';
import { useToast } from '@/contexts/ToastContext';
import { useHighlights } from '@/contexts/HighlightContext';
import type { Highlight } from '@/services/highlights';

const HighlightColors = [
  { label: 'Pasir', value: DesignColors.sand },
  { label: 'Biru', value: DesignColors.blue },
  { label: 'Jingga', value: DesignColors.orange },
] as const;

type TextToken = {
  text: string;
  start: number;
  end: number;
};

type Range = {
  page: number;
  index: number;
  start: number;
  end: number;
};

type PendingSelection = Range & { id?: string };

/* Pecah paragraf jadi kata + posisi karakter supaya user bisa blok sebagian teks. */
function tokenize(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  const pattern = /\S+\s*/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    tokens.push({ text: match[0], start: match.index, end: match.index + match[0].length });
  }
  return tokens;
}

export default function ReaderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { toast, showToast } = useToast();
  const { book, loaded, hasReadableText, current, total, percent, paragraphs, goTo, fontFamily, fontSize, setFontFamily, changeFontSize } = useReader();
  const { highlights, saveHighlight: storeHighlight, removeHighlight: deleteHighlight } = useHighlights();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [highlightColor, setHighlightColor] = useState<string>(DesignColors.sand);
  const [selection, setSelection] = useState<Range | null>(null);
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const [draftColor, setDraftColor] = useState<string>(DesignColors.sand);
  const [draftNote, setDraftNote] = useState('');
  const lastTap = useRef<{ page: number; index: number; start: number; time: number } | null>(null);

  const bookHighlights = (book && highlights[book.id]) || [];

  function openEditorFor(highlight: Highlight) {
    setSelection(null);
    setDraftColor(highlight.color);
    setDraftNote(highlight.note);
    setPending({
      id: highlight.id,
      page: highlight.page,
      index: highlight.index,
      start: highlight.start,
      end: highlight.end,
    });
  }

  function closeEditor() {
    setPending(null);
    setSelection(null);
  }

  function openEditor(range: Range) {
    const existing = bookHighlights.find(
      (h) => h.page === range.page && h.index === range.index && h.start === range.start && h.end === range.end
    );
    if (existing) {
      openEditorFor(existing);
      return;
    }
    setDraftColor(highlightColor);
    setDraftNote('');
    setPending(range);
  }

  function handleWordPress(page: number, index: number, start: number, end: number, tapTime: number) {
    const existing = bookHighlights.find(
      (h) => h.page === page && h.index === index && start >= h.start && start < h.end
    );
    if (existing) {
      openEditorFor(existing);
      lastTap.current = null;
      return;
    }
    const previous = lastTap.current;
    const isDoubleTap =
      previous !== null &&
      previous.page === page &&
      previous.index === index &&
      previous.start === start &&
      tapTime - previous.time < 350;
    if (!isDoubleTap) {
      lastTap.current = { page, index, start, time: tapTime };
      return;
    }
    lastTap.current = null;
    if (selection && selection.page === page && selection.index === index) {
      const range = {
        page,
        index,
        start: Math.min(selection.start, start),
        end: Math.max(selection.end, end),
      };
      setSelection(range);
      openEditor(range);
      return;
    }
    setSelection({ page, index, start, end });
    showToast('Dobel ketuk kata akhir untuk menandai kutipan');
  }

  function saveHighlight(tapTime: number) {
    if (!book || !pending) return;
    const id = pending.id ?? `${pending.page}:${pending.index}:${pending.start}:${pending.end}`;
    const highlight: Highlight = {
      id,
      page: pending.page,
      index: pending.index,
      start: pending.start,
      end: pending.end,
      color: draftColor,
      note: draftNote.trim(),
      text: paragraphs[pending.index].slice(pending.start, pending.end).trim(),
      savedAt: tapTime,
    };
    storeHighlight(book.id, highlight);
    setPending(null);
    setSelection(null);
    showToast('Kutipan disimpan');
  }

  function removeHighlight() {
    if (!book || !pending || !pending.id) return;
    deleteHighlight(book.id, pending.id);
    setPending(null);
    setSelection(null);
    showToast('Kutipan dihapus');
  }

  function changePage(next: number) {
    setSelection(null);
    setPending(null);
    goTo(next);
  }

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
              <Text style={styles.settingsLabel}>Warna highlight</Text>
              <View style={styles.fontRow}>
                {HighlightColors.map((option) => (
                  <Pressable
                    key={option.value}
                    style={({ pressed }) => [
                      styles.colorChip,
                      { backgroundColor: option.value },
                      option.value === highlightColor && styles.colorChipActive,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setHighlightColor(option.value)}
                    accessibilityRole="button"
                    accessibilityLabel={`Warna highlight ${option.label}`}
                    accessibilityState={{ selected: option.value === highlightColor }}
                  >
                    <Text style={styles.colorChipText}>{option.label}</Text>
                  </Pressable>
                ))}
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
          <Text style={styles.tiny}>Dobel ketuk kata awal, lalu dobel ketuk kata akhir untuk highlight.</Text>
          {hasReadableText ? (
            paragraphs.map((p, i) => {
              const paragraphHighlights = bookHighlights.filter((h) => h.page === current && h.index === i);
              const activeSelection =
                selection && selection.page === current && selection.index === i ? selection : null;
              return (
                <View key={i} style={styles.paragraphBlock}>
                  <Text
                    style={[styles.p, { fontFamily, fontSize, lineHeight: Math.round(fontSize * 1.75) }]}
                    accessibilityLabel={`Paragraf ${i + 1}. Dobel ketuk kata awal lalu dobel ketuk kata akhir untuk menandai kutipan`}
                  >
                    {tokenize(p).map((token) => {
                      const existing = paragraphHighlights.find(
                        (h) => token.start >= h.start && token.end <= h.end
                      );
                      const selected = activeSelection && token.start >= activeSelection.start && token.end <= activeSelection.end;
                      const backgroundColor = selected ? highlightColor : existing?.color;
                      return (
                        <Text
                          key={token.start}
                          style={backgroundColor ? { backgroundColor } : undefined}
                          onPress={(event) =>
                            handleWordPress(current, i, token.start, token.end, event.nativeEvent.timestamp)
                          }
                        >
                          {token.text}
                        </Text>
                      );
                    })}
                  </Text>
                  {paragraphHighlights
                    .filter((h) => h.note)
                    .map((h) => (
                      <Pressable
                        key={h.id}
                        onPress={() => openEditorFor(h)}
                        accessibilityRole="button"
                        accessibilityLabel={`Catatan kutipan: ${h.note}. Ketuk untuk ubah`}
                      >
                        <Text style={[styles.note, { borderLeftColor: h.color }]}>“{h.note}”</Text>
                      </Pressable>
                    ))}
                </View>
              );
            })
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
              onPress={() => changePage(current - 1)}
              disabled={!hasReadableText || current === 1}
              accessibilityRole="button"
              accessibilityLabel="Halaman sebelumnya"
            >
              <Text style={styles.navText}>‹ Sebelumnya</Text>
            </Pressable>
            <Text style={styles.pageInfo}>{hasReadableText ? `${current} / ${total}` : '— / —'}</Text>
            <Pressable
              style={({ pressed }) => [styles.navBtnPrimary, (!hasReadableText || current === total) && styles.navBtnDisabled, pressed && styles.pressed]}
              onPress={() => changePage(current + 1)}
              disabled={!hasReadableText || current === total}
              accessibilityRole="button"
              accessibilityLabel="Halaman berikutnya"
            >
              <Text style={styles.navTextPrimary}>Selanjutnya ›</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={pending !== null}
        transparent
        animationType="fade"
        onRequestClose={closeEditor}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Simpan kutipan</Text>
            <Text style={styles.modalQuote} numberOfLines={3}>
              {pending ? paragraphs[pending.index].slice(pending.start, pending.end) : ''}
            </Text>
            <Text style={styles.settingsLabel}>Warna highlight</Text>
            <View style={styles.fontRow}>
              {HighlightColors.map((option) => (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.colorChip,
                    { backgroundColor: option.value },
                    option.value === draftColor && styles.colorChipActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setDraftColor(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Warna highlight ${option.label}`}
                  accessibilityState={{ selected: option.value === draftColor }}
                >
                  <Text style={styles.colorChipText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.noteInput}
              value={draftNote}
              onChangeText={setDraftNote}
              placeholder="Catatan kecil (opsional)"
              placeholderTextColor={DesignColors.muted}
              multiline
              accessibilityLabel="Catatan kutipan"
            />
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalBtn, pressed && styles.pressed]}
                onPress={closeEditor}
                accessibilityRole="button"
                accessibilityLabel="Batal"
              >
                <Text style={styles.modalBtnText}>Batal</Text>
              </Pressable>
              {pending?.id ? (
                <Pressable
                  style={({ pressed }) => [styles.modalBtn, pressed && styles.pressed]}
                  onPress={removeHighlight}
                  accessibilityRole="button"
                  accessibilityLabel="Hapus kutipan"
                >
                  <Text style={styles.modalBtnText}>Hapus</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={({ pressed }) => [styles.modalBtnPrimary, pressed && styles.pressed]}
                onPress={(event) => saveHighlight(event.nativeEvent.timestamp)}
                accessibilityRole="button"
                accessibilityLabel="Simpan kutipan"
              >
                <Text style={styles.modalBtnPrimaryText}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  paragraphBlock: {
    marginBottom: 14,
  },
  note: {
    ...Type.muted,
    color: DesignColors.muted,
    fontStyle: 'italic',
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginTop: 6,
  },
  colorChip: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  colorChipActive: {
    borderColor: DesignColors.ink,
  },
  colorChipText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: DesignColors.ink,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(7,7,7,0.45)',
  },
  modalCard: {
    backgroundColor: DesignColors.white,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    lineHeight: 24,
    color: DesignColors.ink,
  },
  modalQuote: {
    ...Type.muted,
    color: DesignColors.muted,
    fontStyle: 'italic',
  },
  noteInput: {
    minHeight: 72,
    borderRadius: 12,
    backgroundColor: DesignColors.paper,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 20,
    color: DesignColors.ink,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: DesignColors.paper,
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: DesignColors.ink,
  },
  modalBtnPrimary: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: DesignColors.ink,
    justifyContent: 'center',
  },
  modalBtnPrimaryText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: '#fff',
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
