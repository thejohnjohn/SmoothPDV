import { createContext } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
