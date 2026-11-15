import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load telemetry',
  message = 'An unexpected error occurred while communicating with the backend engine.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-rose-500/5 border border-rose-500/20 rounded-xl ${className}`}>
      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-rose-300 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Operation
        </button>
      )}
    </div>
  );
};
