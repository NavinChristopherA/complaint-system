import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'critical';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}
    >
      {toasts.map(t => {
        const isSuccess = t.type === 'success';
        const isCritical = t.type === 'critical';
        const isWarning = t.type === 'warning';

        const borderColor = isSuccess ? '#10b981' : isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#0284c7';
        const bgColor = isSuccess ? '#ecfdf5' : isCritical ? '#fef2f2' : isWarning ? '#fffbeb' : '#f0f9ff';
        const iconColor = isSuccess ? '#059669' : isCritical ? '#dc2626' : isWarning ? '#d97706' : '#0284c7';

        return (
          <div
            key={t.id}
            className="animate-fade-in card"
            style={{
              pointerEvents: 'auto',
              background: 'white',
              borderLeft: `5px solid ${borderColor}`,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <div style={{ color: iconColor, marginTop: '2px', flexShrink: 0 }}>
              {isSuccess ? <CheckCircle2 size={18} /> : isCritical || isWarning ? <AlertTriangle size={18} /> : <Info size={18} />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--slate-900)' }}>
                {t.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', lineHeight: 1.4 }}>
                {t.message}
              </div>
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--slate-400)',
                padding: '0 0.2rem'
              }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
