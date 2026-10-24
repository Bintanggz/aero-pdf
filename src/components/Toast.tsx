import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item ${t.type}`}>
          {t.type === 'error' ? (
            <AlertCircle size={18} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
          )}
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
