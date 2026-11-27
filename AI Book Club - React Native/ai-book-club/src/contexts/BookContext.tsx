import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocumentAsync } from 'expo-document-picker';

import { importBook } from '@/services/pdf';
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
import { useToast } from '@/contexts/ToastContext';

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

type BookContextValue = {
  books: Book[];
  loaded: boolean;
  importing: boolean;
  importProgress: number;
  addBook: (book: Book) => void;
  updateProgress: (bookId: string, currentPage: number, progressPercent: number) => void;
  importBookFromDevice: () => Promise<Book | null>;
};

const BookContext = createContext<BookContextValue | null>(null);

export function BookProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

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

  const addBook = useCallback(function addBook(book: Book) {
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
    function updateProgress(bookId: string, currentPage: number, progressPercent: number) {
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

  const importBookFromDevice = useCallback(
    async function importBookFromDevice(): Promise<Book | null> {
      logStart('PDF_IMPORT', 'file picker');
      setImportProgress(0);
      try {
        logInfo('PDF_IMPORT', 'Opening device file picker (PDF only)');
        const result = await getDocumentAsync({
          type: 'application/pdf',
          copyToCacheDirectory: Platform.OS !== 'android',
        });
        if (result.canceled || result.assets.length === 0) {
          logWarn('PDF_IMPORT', 'File picker cancelled or no asset selected');
          return null;
        }
        setImporting(true);
        const asset = result.assets[0];
        logInput('PDF_IMPORT', 'fileName', asset.name ?? 'Buku PDF');
        logInput('PDF_IMPORT', 'uri', asset.uri);
        logOutput('PDF_IMPORT', 'assetSelected', asset.name ?? 'Buku PDF');

        function handleProgress(percent: number) {
          setImportProgress(percent);
        }

        const book = await importBook(asset.uri, asset.name ?? 'Buku PDF', handleProgress);
        setImporting(false);
        addBook(book);
        showToast('Buku ditambahkan ke rak');
        logInput('READER', 'bookId', book.id);
        logOutput('PDF_IMPORT', 'navigateTo', `/reader?bookId=${book.id}`);
        logSuccess('PDF_IMPORT', 'file picker');
        return book;
      } catch (err: unknown) {
        logError('PDF_IMPORT', 'Failed to process PDF', {
          functionName: 'importBookFromDevice()',
          reason: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
        });
        showToast('Gagal memproses PDF');
        return null;
      } finally {
        setImporting(false);
        logComplete('PDF_IMPORT', 'file picker');
      }
    },
    [addBook, showToast]
  );

  const value = useMemo(
    () => ({
      books,
      loaded,
      importing,
      importProgress,
      addBook,
      updateProgress,
      importBookFromDevice,
    }),
    [books, loaded, importing, importProgress, addBook, updateProgress, importBookFromDevice]
  );

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
}
