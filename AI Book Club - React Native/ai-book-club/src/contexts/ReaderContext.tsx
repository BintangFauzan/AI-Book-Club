import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useGlobalSearchParams } from 'expo-router';

import { useBooks } from '@/contexts/BookContext';
import type { Book } from '@/contexts/BookContext';
import { useToast } from '@/contexts/ToastContext';
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

type ReaderContextValue = {
  book: Book | undefined;
  loaded: boolean;
  hasReadableText: boolean;
  current: number;
  total: number;
  percent: number;
  paragraphs: string[];
  goTo: (page: number) => void;
};

const ReaderContext = createContext<ReaderContextValue | null>(null);

export function ReaderProvider({ children }: { children: ReactNode }) {
  const params = useGlobalSearchParams();
  const bookId = typeof params.bookId === 'string' ? params.bookId : undefined;
  const { books, loaded, updateProgress } = useBooks();
  const { showToast } = useToast();
  const book = books.find((b) => b.id === bookId);
  const [page, setPage] = useState<number | null>(null);
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
    }),
    [book, loaded, hasReadableText, current, total, percent, paragraphs, goTo]
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
