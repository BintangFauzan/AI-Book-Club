import type { ReactNode } from 'react';

import { ToastProvider } from '@/contexts/ToastContext';
import { BookProvider } from '@/contexts/BookContext';
import { ReaderProvider } from '@/contexts/ReaderContext';
import { ClubProvider } from '@/contexts/ClubContext';
import { AudioProvider } from '@/contexts/AudioContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <BookProvider>
        <ReaderProvider>
          <ClubProvider>
            <AudioProvider>{children}</AudioProvider>
          </ClubProvider>
        </ReaderProvider>
      </BookProvider>
    </ToastProvider>
  );
}
