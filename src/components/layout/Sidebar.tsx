import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  HardDrive,
  Network,
  Settings,
  X,
  Server,
} from 'lucide-react';
import { useBackend } from '../../context/BackendContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { baseUrl, isOnline, health } = useBackend();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/processes', label: 'Processes', icon: Cpu },
    { to: '/performance', label: 'Performance', icon: Activity },
    { to: '/storage', label: 'Storage', icon: HardDrive },
    { to: '/network', label: 'Network', icon: Network },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  // Host display name derived from baseUrl
  const hostLabel = baseUrl.replace(/^https?:\/\//, '').split(':')[0] || 'localhost';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-950/40">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="7" r="3" />
                <circle cx="7" cy="14" r="3" />
                <circle cx="17" cy="14" r="3" />
                <circle cx="12" cy="19" r="2.5" />
                <path d="M12 2v2M12 20v2M5 12H3M21 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-1.5">
                Task Manager
              </h1>
              <span className="text-[10px] font-mono text-rose-400 font-medium">Raspberry Pi</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Device & Status Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-850/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-mono font-medium text-slate-300 truncate max-w-[120px]">
                  {hostLabel}
                </span>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-500'
                }`}
                title={isOnline ? 'Host Connected' : 'Host Offline'}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Status</span>
              <span className={isOnline ? 'text-emerald-400' : 'text-rose-400'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {isOnline && health?.status && (
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>Engine</span>
                <span className="text-slate-400">{health.status}</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
