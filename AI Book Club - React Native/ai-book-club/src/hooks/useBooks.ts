import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  logComplete,
  logError,
  logInfo,
  logInput,
  logOutput,
  logStart,
  logSuccess,
} from '@/helpers/log';

const STORAGE_KEY = '@folio_books';

export type Book = {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  coverText: string;
  uri: string;
  totalPages: number;
  currentPage: number;
  progressPercent: number;
  text: string;
  addedAt: string;
};

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    logStart('BOOK_STORAGE', 'load books');
    logInput('BOOK_STORAGE', 'storageKey', STORAGE_KEY);
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          setBooks(parsed);
          logOutput('BOOK_STORAGE', 'loadedBooks', parsed.length);
          logSuccess('BOOK_STORAGE', 'load books');
        } else {
          setBooks([]);
          logInfo('BOOK_STORAGE', 'no books stored yet');
          logSuccess('BOOK_STORAGE', 'load books');
        }
      })
      .catch((err: unknown) => {
        setBooks([]);
        logError('BOOK_STORAGE', 'Failed to load books', {
          functionName: 'useBooks()',
          reason: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        logComplete('BOOK_STORAGE', 'load books');
      })
      .finally(() => setLoaded(true));
  }, []);

  const addBook = useCallback((book: Book) => {
    logStart('BOOK_STORAGE', 'add book');
    logInput('BOOK_STORAGE', 'bookId', book.id);
    logInput('BOOK_STORAGE', 'title', book.title);
    logInput('BOOK_STORAGE', 'totalPages', book.totalPages);
    setBooks((prev) => {
      const next = [book, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((err: unknown) => {
        logError('BOOK_STORAGE', 'Failed to persist added book', {
          functionName: 'addBook()',
          reason: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
      });
      logOutput('BOOK_STORAGE', 'totalBooks', next.length);
      logSuccess('BOOK_STORAGE', 'add book');
      return next;
    });
  }, []);

  const updateProgress = useCallback(
    (bookId: string, currentPage: number, progressPercent: number) => {
      logStart('BOOK_STORAGE', 'update progress');
      logInput('BOOK_STORAGE', 'bookId', bookId);
      logInput('BOOK_STORAGE', 'currentPage', currentPage);
      logInput('BOOK_STORAGE', 'progressPercent', progressPercent);
      setBooks((prev) => {
        const next = prev.map((b) =>
          b.id === bookId ? { ...b, currentPage, progressPercent } : b
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((err: unknown) => {
          logError('BOOK_STORAGE', 'Failed to persist progress update', {
            functionName: 'updateProgress()',
            reason: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          });
        });
        const updated = next.find((b) => b.id === bookId);
        logOutput('BOOK_STORAGE', 'bookFound', !!updated);
        logSuccess('BOOK_STORAGE', 'update progress');
        return next;
      });
    },
    []
  );

  return { books, loaded, addBook, updateProgress };
}
