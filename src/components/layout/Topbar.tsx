import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, RefreshCw, Sun, Moon, Laptop, LogOut, User, Shield } from 'lucide-react';
import { ConnectionIndicator } from '../common/ConnectionIndicator';
import { useMetrics } from '../../context/MetricsContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
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
  const { user, logout } = useAuth();

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

      {/* Right: Status, Refresh, User Profile, Theme, Logout */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Backend & SSE status badge */}
        <ConnectionIndicator />

        {/* Last update timestamp */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono text-slate-400 border-l border-slate-800 pl-3">
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

        {/* Authenticated User & Role Indicator */}
        {user && (
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-200 leading-tight">
                {user.username}
              </span>
              <span className="text-[10px] font-mono text-rose-400 flex items-center gap-0.5">
                <Shield className="w-2.5 h-2.5" />
                <span>{user.role === 'admin' ? 'Administrator' : 'Standard User'}</span>
              </span>
            </div>

            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4 text-rose-400" />
            </div>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-slate-800"
              title="Log out and terminate session"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
