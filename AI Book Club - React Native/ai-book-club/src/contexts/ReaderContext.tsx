import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useGlobalSearchParams } from 'expo-router';

import { Fonts } from '@/constants/theme';
import { useBooks } from '@/contexts/BookContext';
import type { Book } from '@/contexts/BookContext';
import { useHighlights } from '@/contexts/HighlightContext';
import { useToast } from '@/contexts/ToastContext';
import { computeProgress } from '@/helpers/book';
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
import { mapHighlightRanges } from '@/helpers/translation';
import type { HighlightRange } from '@/helpers/translation';
import { loadPageTranslation, savePageTranslation, translatePage } from '@/services/translation';
import type { LanguageCode, PageTranslation } from '@/services/translation';

export type ReaderLanguage = LanguageCode | 'or';

type ReaderContextValue = {
  book: Book | undefined;
  loaded: boolean;
  hasReadableText: boolean;
  current: number;
  total: number;
  percent: number;
  paragraphs: string[];
  goTo: (page: number) => void;
  fontFamily: string;
  fontSize: number;
  setFontFamily: (fontFamily: string) => void;
  changeFontSize: (delta: number) => void;
  language: ReaderLanguage;
  setLanguage: (language: ReaderLanguage) => void;
  translating: boolean;
  displayParagraphs: string[];
  translatedHighlights: HighlightRange[];
};

const ReaderContext = createContext<ReaderContextValue | null>(null);

export function ReaderProvider({ children }: { children: ReactNode }) {
  const params = useGlobalSearchParams();
  const bookId = typeof params.bookId === 'string' ? params.bookId : undefined;
  const { books, loaded, updateProgress } = useBooks();
  const { highlights } = useHighlights();
  const { showToast } = useToast();
  const book = books.find((b) => b.id === bookId);
  const [page, setPage] = useState<number | null>(null);
  const [fontFamily, setFontFamily] = useState<string>(Fonts.serif);
  const [fontSize, setFontSize] = useState(18);
  const [languageChoice, setLanguageChoice] = useState<{
    bookId: string | undefined;
    value: ReaderLanguage;
  }>({ bookId, value: 'or' });
  const [translation, setTranslation] = useState<
    { key: string; data: PageTranslation } | { key: string; error: true } | null
  >(null);
  const language: ReaderLanguage = languageChoice.bookId === bookId ? languageChoice.value : 'or';
  const setLanguage = useCallback(
    function setLanguage(value: ReaderLanguage) {
      setLanguageChoice({ bookId, value });
    },
    [bookId]
  );
  const currentPage = page ?? book?.currentPage ?? 1;

  useEffect(() => {
    logStart('READER', 'persist reading progress');
    if (book && currentPage !== book.currentPage) {
      const progressPercent =
        book.totalPages > 0 ? Math.round((currentPage / book.totalPages) * 100) : 0;
      logInput('READER', 'bookId', book.id);
      logInput('READER', 'currentPage', currentPage);
      logInput('READER', 'totalPages', book.totalPages);
      logInput('READER', 'progressPercent', progressPercent);
      updateProgress(book.id, currentPage, progressPercent);
      logOutput('READER', 'progressPercent', progressPercent);
      logSuccess('READER', 'persist reading progress');
    } else {
      logInfo('READER', 'no progress change to persist');
      logComplete('READER', 'persist reading progress');
    }
  }, [book, currentPage, updateProgress]);

  const pages = book?.text ? book.text.split('\n\n').filter(Boolean) : [];
  const total = pages.length > 0 ? pages.length : book?.totalPages ?? 0;
  const hasReadableText = pages.length > 0 && total > 0;
  const current = hasReadableText ? Math.max(1, Math.min(currentPage, total)) : 0;
  const percent = hasReadableText ? computeProgress(current, total) : 0;
  const content = hasReadableText ? pages[current - 1] : '';
  const paragraphs = content.split('\n').filter(Boolean);

  const pageHighlights = useMemo(
    function selectPageHighlights() {
      if (!book) return [];
      return (highlights[book.id] ?? []).filter((highlight) => highlight.page === current);
    },
    [book, current, highlights]
  );

  useEffect(
    function translateCurrentPage() {
      if (!book || language === 'or' || !hasReadableText) return;

      let cancelled = false;
      const key = `${book.id}:${language}:${current}`;
      const targetLanguage: LanguageCode = language;
      const targetPage = current;
      const sourcePages = book.text ? book.text.split('\n\n').filter(Boolean) : [];
      const sourceParagraphs = (sourcePages[targetPage - 1] ?? '').split('\n').filter(Boolean);
      const quotes = pageHighlights
        .filter((highlight) => highlight.text)
        .map((highlight) => ({ id: highlight.id, text: highlight.text }));

      loadPageTranslation(book.id, targetLanguage, targetPage)
        .then(function useCachedPage(cached) {
          if (cancelled) return null;
          if (!cached) {
            return translatePage(sourceParagraphs, quotes, targetLanguage).then(function saveNewPage(data) {
              if (cancelled) return null;
              setTranslation({ key, data });
              savePageTranslation(book.id, targetLanguage, targetPage, data);
              return null;
            });
          }
          const missingQuotes = quotes.filter((quote) => !cached.quotes[quote.id]);
          if (missingQuotes.length === 0) {
            setTranslation({ key, data: cached });
            return null;
          }
          return translatePage([], missingQuotes, targetLanguage).then(function mergeQuotes(extra) {
            if (cancelled) return null;
            const merged = {
              paragraphs: cached.paragraphs,
              quotes: { ...cached.quotes, ...extra.quotes },
            };
            setTranslation({ key, data: merged });
            savePageTranslation(book.id, targetLanguage, targetPage, merged);
            return null;
          });
        })
        .catch(function onTranslateError(err: unknown) {
          if (cancelled) return;
          setTranslation({ key, error: true });
          showToast('Gagal menerjemahkan halaman. Periksa koneksi untuk unduh model bahasa.');
          logError('TRANSLATION', 'Failed to translate page', {
            functionName: 'translateCurrentPage()',
            reason: err instanceof Error ? err.message : String(err),
          });
        });

      return function cancelTranslation() {
        cancelled = true;
      };
    },
    [book, current, hasReadableText, language, pageHighlights, showToast]
  );

  const translationKey = book ? `${book.id}:${language}:${current}` : '';
  const activeTranslation =
    translation && translation.key === translationKey && 'data' in translation
      ? translation.data
      : null;
  const translating =
    !!book && hasReadableText && language !== 'or' && translation?.key !== translationKey;
  const displayParagraphs = activeTranslation?.paragraphs ?? paragraphs;
  const translatedHighlights = useMemo(
    function mapTranslatedHighlights() {
      if (!activeTranslation) return [];
      return mapHighlightRanges(activeTranslation.paragraphs, activeTranslation.quotes, pageHighlights);
    },
    [activeTranslation, pageHighlights]
  );

  if (book) {
    logStart('READER', 'open reader');
    logInput('READER', 'bookId', book.id);
    logInput('READER', 'title', book.title);
    logInput('READER', 'totalPages', book.totalPages);
    logInput('READER', 'currentPage', book.currentPage);
    logInput('READER', 'extractedCharacters', book.text.length);
    logOutput('READER', 'renderedPage', current);
    logOutput('READER', 'totalRenderPages', total);
    logOutput('READER', 'progressPercent', percent);
    logSuccess('READER', 'open reader');
  } else if (bookId) {
    logWarn('READER', 'book not found');
    logInput('READER', 'requestedBookId', bookId);
  }

  const goTo = useCallback(
    function goTo(next: number) {
      logStart('READER', 'navigate page');
      logInput('READER', 'requestedPage', next);
      logInput('READER', 'currentPage', current);
      const target = Math.max(1, Math.min(next, total));
      setPage(target);
      showToast(target === total ? 'Halaman terakhir' : `Halaman ${target}`);
      logOutput('READER', 'targetPage', target);
      logSuccess('READER', 'navigate page');
    },
    [current, total, showToast]
  );

  const changeFontSize = useCallback(function changeFontSize(delta: number) {
    setFontSize((size) => Math.max(12, Math.min(32, size + delta)));
  }, []);

  const value = useMemo(
    () => ({
      book,
      loaded,
      hasReadableText,
      current,
      total,
      percent,
      paragraphs,
      goTo,
      fontFamily,
      fontSize,
      setFontFamily,
      changeFontSize,
      language,
      setLanguage,
      translating,
      displayParagraphs,
      translatedHighlights,
    }),
    [
      book,
      loaded,
      hasReadableText,
      current,
      total,
      percent,
      paragraphs,
      goTo,
      fontFamily,
      fontSize,
      changeFontSize,
      language,
      setLanguage,
      translating,
      displayParagraphs,
      translatedHighlights,
    ]
  );

  return <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>;
}

export function useReader() {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReader must be used within a ReaderProvider');
  }
  return context;
}
