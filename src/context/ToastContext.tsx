import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateUniqueId } from '../utils/a11yUtils';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, variant?: ToastVariant, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', title?: string, duration = 5000) => {
      const id = generateUniqueId('toast');
      const newToast: ToastMessage = { id, message, variant, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string, title = 'Sucesso!') => addToast(message, 'success', title),
    [addToast]
  );

  const showError = useCallback(
    (message: string, title = 'Erro!') => addToast(message, 'danger', title, 7000),
    [addToast]
  );

  const showWarning = useCallback(
    (message: string, title = 'Atenção!') => addToast(message, 'warning', title),
    [addToast]
  );

  const showInfo = useCallback(
    (message: string, title = 'Informação') => addToast(message, 'info', title),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }
  return context;
}
