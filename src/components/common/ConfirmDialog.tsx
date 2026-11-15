import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition p-1 rounded-lg hover:bg-slate-800"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 id="dialog-title" className="text-base font-semibold text-slate-100">
              {title}
            </h2>
            <div className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition shadow-sm inline-flex items-center gap-1.5 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800'
                : 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800'
            }`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
