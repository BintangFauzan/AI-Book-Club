import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type ToastState = {
  visible: boolean;
  message: string;
};

type ToastContextValue = {
  toast: ToastState;
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' });

  const showToast = useCallback(function showToast(message: string) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2400);
  }, []);

  const value = useMemo(
    () => ({ toast, showToast }),
    [toast, showToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
