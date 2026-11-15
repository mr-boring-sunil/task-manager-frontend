import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, RefreshCw, Sun, Moon, Laptop } from 'lucide-react';
import { ConnectionIndicator } from '../common/ConnectionIndicator';
import { useMetrics } from '../../context/MetricsContext';
import { useTheme } from '../../context/ThemeContext';
import { formatTimeOnly } from '../../utils/formatDate';

interface TopbarProps {
  onToggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/': 'System Overview',
  '/processes': 'Process Manager',
  '/performance': 'System Performance',
  '/storage': 'Storage & Filesystems',
  '/network': 'Network Interfaces',
  '/settings': 'Dashboard Settings',
};

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { lastUpdated, refreshMetrics, isLoading } = useMetrics();
  const { theme, setTheme } = useTheme();

  // Find matching title, handling dynamic routes like /processes/:pid
  let title = PAGE_TITLES[location.pathname];
  if (!title && location.pathname.startsWith('/processes/')) {
    title = 'Process Details';
  } else if (!title) {
    title = 'Task Manager';
  }

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-slate-100 lg:hidden rounded-lg hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-slate-100 tracking-tight">{title}</h2>
          <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
            Raspberry Pi Linux Monitor
          </p>
        </div>
      </div>

      {/* Right: Status, Refresh, Theme */}
      <div className="flex items-center gap-3">
        {/* Backend & SSE status badge */}
        <ConnectionIndicator />

        {/* Last update timestamp */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400 border-l border-slate-800 pl-3">
          <span>Updated:</span>
          <span className="text-slate-200">
            {lastUpdated ? formatTimeOnly(lastUpdated) : '—'}
          </span>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={() => refreshMetrics()}
          disabled={isLoading}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition border border-slate-800 disabled:opacity-50"
          title="Refresh Telemetry"
          aria-label="Refresh Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition border border-slate-800"
          title={`Current theme: ${theme}. Click to change.`}
          aria-label="Toggle Theme"
        >
          <ThemeIcon className="w-4 h-4 text-amber-400 dark:text-sky-300" />
        </button>
      </div>
    </header>
  );
};
