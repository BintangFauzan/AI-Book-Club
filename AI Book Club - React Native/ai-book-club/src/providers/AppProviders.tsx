import type { ReactNode } from 'react';

import { ToastProvider } from '@/contexts/ToastContext';
import { BookProvider } from '@/contexts/BookContext';
import { HighlightProvider } from '@/contexts/HighlightContext';
import { ReaderProvider } from '@/contexts/ReaderContext';
import { ClubProvider } from '@/contexts/ClubContext';
import { AudioProvider } from '@/contexts/AudioContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <BookProvider>
        <HighlightProvider>
          <ReaderProvider>
            <ClubProvider>
              <AudioProvider>{children}</AudioProvider>
            </ClubProvider>
          </ReaderProvider>
        </HighlightProvider>
      </BookProvider>
    </ToastProvider>
  );
}
