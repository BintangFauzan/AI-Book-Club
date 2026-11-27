import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { loadHighlights, saveHighlights } from '@/services/highlights';
import type { Highlight, HighlightsByBook } from '@/services/highlights';
import { logError, logStart, logSuccess } from '@/helpers/log';

export type SavedQuote = Highlight & { bookId: string };

type HighlightContextValue = {
  loaded: boolean;
  highlights: HighlightsByBook;
  quotes: SavedQuote[];
  currentQuote: SavedQuote | undefined;
  saveHighlight: (bookId: string, highlight: Highlight) => void;
  removeHighlight: (bookId: string, highlightId: string) => void;
};

const HighlightContext = createContext<HighlightContextValue | null>(null);

export function HighlightProvider({ children }: { children: ReactNode }) {
  const [highlights, setHighlights] = useState<HighlightsByBook>({});
  const [loaded, setLoaded] = useState(false);
  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(function loadAllHighlights() {
    logStart('HIGHLIGHTS', 'load highlights');
    loadHighlights()
      .then((saved) => {
        setHighlights(saved);
        logSuccess('HIGHLIGHTS', 'load highlights');
      })
      .catch((err: unknown) => {
        setHighlights({});
        logError('HIGHLIGHTS', 'Failed to load highlights', {
          functionName: 'loadAllHighlights()',
          reason: err instanceof Error ? err.message : String(err),
        });
      })
      .finally(() => setLoaded(true));
  }, []);

  const quotes = useMemo(function flattenQuotes(): SavedQuote[] {
    const all = Object.entries(highlights).flatMap(([bookId, items]) =>
      items.map((item) => ({ ...item, bookId }))
    );
    return all.filter((quote) => quote.text).sort((a, b) => b.savedAt - a.savedAt);
  }, [highlights]);

  useEffect(
    function rotateQuotes() {
      if (quotes.length < 2) return;
      const timer = setInterval(function nextQuote() {
        setActiveQuote((index) => (index + 1) % quotes.length);
      }, 5000);
      return function stopRotation() {
        clearInterval(timer);
      };
    },
    [quotes.length]
  );

  const saveHighlight = useCallback(function saveHighlight(bookId: string, highlight: Highlight) {
    setHighlights((previous) => {
      const bookHighlights = previous[bookId] ?? [];
      const next = {
        ...previous,
        [bookId]: [...bookHighlights.filter((item) => item.id !== highlight.id), highlight],
      };
      saveHighlights(next).catch((err: unknown) => {
        logError('HIGHLIGHTS', 'Failed to persist highlight', {
          functionName: 'saveHighlight()',
          reason: err instanceof Error ? err.message : String(err),
        });
      });
      return next;
    });
    logSuccess('HIGHLIGHTS', 'save highlight');
  }, []);

  const removeHighlight = useCallback(function removeHighlight(bookId: string, highlightId: string) {
    setHighlights((previous) => {
      const next = {
        ...previous,
        [bookId]: (previous[bookId] ?? []).filter((item) => item.id !== highlightId),
      };
      saveHighlights(next).catch((err: unknown) => {
        logError('HIGHLIGHTS', 'Failed to remove highlight', {
          functionName: 'removeHighlight()',
          reason: err instanceof Error ? err.message : String(err),
        });
      });
      return next;
    });
    logSuccess('HIGHLIGHTS', 'remove highlight');
  }, []);

  const currentQuote = quotes.length > 0 ? quotes[activeQuote % quotes.length] : undefined;

  const value = useMemo(
    () => ({
      loaded,
      highlights,
      quotes,
      currentQuote,
      saveHighlight,
      removeHighlight,
    }),
    [loaded, highlights, quotes, currentQuote, saveHighlight, removeHighlight]
  );

  return <HighlightContext.Provider value={value}>{children}</HighlightContext.Provider>;
}

export function useHighlights() {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlights must be used within a HighlightProvider');
  }
  return context;
}
