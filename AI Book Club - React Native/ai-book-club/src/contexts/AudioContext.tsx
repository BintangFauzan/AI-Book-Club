import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { useToast } from '@/contexts/ToastContext';

type AudioContextValue = {
  playing: boolean;
  togglePlay: () => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [playing, setPlaying] = useState(false);

  const togglePlay = useCallback(
    function togglePlay() {
      setPlaying((prev) => {
        const next = !prev;
        showToast(next ? 'Playing chapter' : 'Playback paused');
        return next;
      });
    },
    [showToast]
  );

  const value = useMemo(() => ({ playing, togglePlay }), [playing, togglePlay]);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
