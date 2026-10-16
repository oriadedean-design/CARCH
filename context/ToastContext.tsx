import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ToastContextValue {
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  showConfirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
  });

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch (e) {
        // Ignored
      }
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const showConfirm = useCallback((options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      isDestructive: options.isDestructive ?? false,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    });
  }, []);

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (confirmDialog.onCancel) confirmDialog.onCancel();
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* CineArch Terminal Top Toast Notification */}
      <div 
        aria-live="polite" 
        className="fixed top-2 left-0 right-0 z-[999] pointer-events-none flex flex-col items-center gap-2 px-4"
        style={{ top: 'max(env(safe-area-inset-top), 12px)' }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={clsx(
              "pointer-events-auto flex items-center gap-3 px-5 py-3 text-xs font-mono shadow-2xl backdrop-blur-2xl border transition-all duration-300 animate-in slide-in-from-top-3 max-w-[92vw] select-none rounded-none",
              toast.type === 'error' && "bg-black/95 text-red-300 border-red-500/50",
              toast.type === 'success' && "bg-black/95 text-emerald-300 border-emerald-500/50",
              toast.type === 'warning' && "bg-black/95 text-accent border-accent/50",
              toast.type === 'info' && "bg-black/95 text-white border-white/30"
            )}
          >
            {toast.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
            {toast.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-accent shrink-0" />}
            {toast.type === 'info' && <Info className="w-3.5 h-3.5 text-accent shrink-0" />}
            <span className="leading-snug uppercase tracking-wider text-[10px] font-semibold">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-2 opacity-50 hover:opacity-100 p-0.5"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* CineArch Terminal Shutter Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCancel}
        >
          <div 
            className="w-full max-w-sm bg-black/95 border-2 border-white/20 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 select-none rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <span className="font-serif italic text-2xl text-accent">Ca</span>
              <div>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 block">System Verification</span>
                <h4 className="text-lg font-serif italic text-white tracking-tight leading-none">{confirmDialog.title}</h4>
              </div>
            </div>
            
            <p className="text-xs text-white/70 leading-relaxed font-light italic">{confirmDialog.message}</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="h-11 text-[9px] font-black tracking-[0.3em] uppercase text-white/60 border border-white/20 hover:border-white hover:text-white active:scale-95 transition-all rounded-none"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={clsx(
                  "h-11 text-[9px] font-black tracking-[0.3em] uppercase active:scale-95 transition-all text-black rounded-none",
                  confirmDialog.isDestructive ? "bg-red-500 hover:bg-red-400 text-white" : "bg-white hover:bg-accent text-black"
                )}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
