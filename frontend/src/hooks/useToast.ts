import { useState, useCallback } from 'react';
import type { ToastItem, ToastType } from '@/components/ToastContainer';

let _id = 0;
const genId = () => `toast-${++_id}-${Date.now()}`;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 3500) => {
      const item: ToastItem = { id: genId(), type, title, message, duration };
      setToasts((prev) => [...prev, item]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Convenience helpers
  const success = useCallback(
    (title: string, message?: string) => addToast('success', title, message),
    [addToast]
  );
  const info = useCallback(
    (title: string, message?: string) => addToast('info', title, message),
    [addToast]
  );
  const danger = useCallback(
    (title: string, message?: string) => addToast('danger', title, message),
    [addToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => addToast('warning', title, message),
    [addToast]
  );

  return { toasts, addToast, removeToast, success, info, danger, warning };
}
