import React from 'react';
import { getProcessStateConfig } from '../../utils/processState';

interface StatusBadgeProps {
  state: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ state, size = 'md', className = '' }) => {
  const config = getProcessStateConfig(state);

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md capitalize ${config.badgeClass} ${sizeClasses[size]} ${className}`}
      title={`${config.label}: ${config.description}`}
      aria-label={`Process state: ${config.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
