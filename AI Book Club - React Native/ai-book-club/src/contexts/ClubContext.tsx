import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { useToast } from '@/contexts/ToastContext';

const CLUBS = ['The Marginalia Club', 'Quiet Readers', 'New Fiction Circle'];
const POLL_OPTIONS = ['On a walk', 'In a quiet room', 'In conversation'];

type ClubContextValue = {
  clubs: string[];
  pollOptions: string[];
  clubName: string;
  pollSelected: string | null;
  switchClub: (name: string) => void;
  votePoll: (label: string) => void;
};

const ClubContext = createContext<ClubContextValue | null>(null);

export function ClubProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [clubName, setClubName] = useState('The Marginalia Club');
  const [pollSelected, setPollSelected] = useState<string | null>(null);

  const switchClub = useCallback(
    function switchClub(name: string) {
      setClubName(name);
      showToast('Club switched');
    },
    [showToast]
  );

  const votePoll = useCallback(
    function votePoll(label: string) {
      setPollSelected(label);
      showToast(`Your vote: ${label} · 18 votes`);
    },
    [showToast]
  );

  const value = useMemo(
    () => ({
      clubs: CLUBS,
      pollOptions: POLL_OPTIONS,
      clubName,
      pollSelected,
      switchClub,
      votePoll,
    }),
    [clubName, pollSelected, switchClub, votePoll]
  );

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
}

export function useClub() {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
}
