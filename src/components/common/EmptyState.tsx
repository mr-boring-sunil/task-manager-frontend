import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'No data matching your current filter criteria is currently available.',
  icon: Icon = Inbox,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-10 text-center text-slate-400 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mb-3 border border-slate-700/50">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-medium text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
