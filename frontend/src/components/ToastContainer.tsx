'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, PlusCircle, Trash2, Pencil, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'danger' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} />,
  info:    <PlusCircle   size={18} />,
  danger:  <Trash2       size={18} />,
  warning: <Pencil       size={18} />,
};

const LABELS: Record<ToastType, string> = {
  success: '✅ Berhasil',
  info:    '➕ Ditambahkan',
  danger:  '🗑️ Dihapus',
  warning: '✏️ Diperbarui',
};

function SingleToast({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? 3500;
  const startRef = useRef<number>(Date.now());
  const rafRef = useRef<number>(0);

  const dismiss = () => {
    cancelAnimationFrame(rafRef.current);
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 500);
  };

  // Animate progress bar via RAF
  useEffect(() => {
    startRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    const timer = setTimeout(dismiss, duration);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const borderColor: Record<ToastType, string> = {
    success: 'rgba(34,211,160,0.3)',
    info:    'rgba(108,99,255,0.3)',
    danger:  'rgba(244,63,94,0.3)',
    warning: 'rgba(245,158,11,0.3)',
  };

  return (
    <div
      className={`toast${exiting ? ' toast-exit' : ''}`}
      style={{ borderColor: borderColor[toast.type] }}
      onClick={dismiss}
      role="alert"
    >
      {/* Icon */}
      <div className={`toast-icon ${toast.type}`}>
        {ICONS[toast.type]}
      </div>

      {/* Body */}
      <div className="toast-body">
        <div className="toast-title">{toast.title}</div>
        {toast.message && (
          <div className="toast-message">{toast.message}</div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 6,
          flexShrink: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        aria-label="Tutup notifikasi"
      >
        <X size={14} />
      </button>

      {/* Progress bar — driven by RAF state */}
      <div
        className={`toast-progress ${toast.type}`}
        style={{ width: `${progress}%`, transition: 'width 80ms linear' }}
      />
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <SingleToast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
}

// Re-export for convenience
export type { ToastItem as Toast };
export { LABELS };
