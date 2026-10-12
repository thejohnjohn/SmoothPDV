import React, { useCallback, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { ToastContext } from './ToastContext';
import type { ToastTone } from './ToastContext';

interface ToastMessage {
  id: number;
  tone: ToastTone;
  message: string;
}

const toneClasses: Record<ToastTone, string> = {
  success: 'border-success-100 bg-success-50 text-success-700',
  error: 'border-error-100 bg-error-50 text-error-700',
  info: 'border-secondary-100 bg-secondary-50 text-secondary-700',
};

const toneIcons: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />,
  error: <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />,
  info: <Info className="h-4 w-4 flex-shrink-0" aria-hidden="true" />,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 p-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-4 py-3 text-sm font-semibold shadow-dropdown ${toneClasses[toast.tone]}`}
          >
            {toneIcons[toast.tone]}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
