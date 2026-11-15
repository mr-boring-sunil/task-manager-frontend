import React, { useState } from 'react';
import {
  Server,
  Key,
  Palette,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { useBackend } from '../context/BackendContext';
import { useTheme } from '../context/ThemeContext';
import { formatDate } from '../utils/formatDate';

export const SettingsPage: React.FC = () => {
  const {
    baseUrl,
    setBaseUrl,
    token,
    authType,
    setAuthCredentials,
    isOnline,
    health,
    lastConnected,
    lastError,
    checkConnection,
    historyWindowSeconds,
    setHistoryWindowSeconds,
  } = useBackend();

  const { theme, setTheme } = useTheme();

  // Local form states
  const [inputUrl, setInputUrl] = useState(baseUrl);
  const [inputToken, setInputToken] = useState(token || '');
  const [inputAuthType, setInputAuthType] = useState<'apiKey' | 'bearer'>(authType);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const ok = await checkConnection();
      if (ok) {
        setTestResult({
          success: true,
          message: 'Connection successful! Backend CEE engine is healthy.',
        });
      } else {
        setTestResult({
          success: false,
          message: lastError || 'Connection failed. Verify host IP and port.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveApiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setBaseUrl(inputUrl);
    setAuthCredentials(inputToken.trim() ? inputToken.trim() : null, inputAuthType);
    setSaveMessage('Backend settings updated and reconnected.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <PageContainer
      title="Settings & Host Configuration"
      subtitle="Manage Raspberry Pi connection, authentication, chart windows, and theme"
    >
      <div className="max-w-4xl space-y-6">
        {saveMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* SECTION 1: Backend API Connection */}
        <div className="card-base p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Raspberry Pi Host Connection</h3>
              <p className="text-xs text-slate-400">
                Specify local network IP or hostname of the Raspberry Pi Node.js server
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveApiSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Backend Server URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="http://192.168.1.100:5000 or http://localhost:5000"
                  required
                  className="flex-1 px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-medium transition disabled:opacity-50"
                >
                  {isTesting ? 'Testing...' : 'Test Ping'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Default: <code className="text-slate-400">http://localhost:5000</code>. On a local LAN, set to your Pi&apos;s static IP (e.g. <code className="text-slate-400">http://192.168.1.45:5000</code>).
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Connection Status Box */}
            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">State</span>
                <span className={isOnline ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isOnline ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Last Sync</span>
                <span className="text-slate-300">
                  {lastConnected ? formatDate(lastConnected.toISOString()) : 'Never'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Engine Status</span>
                <span className="text-slate-200">{health?.status || 'Unknown'}</span>
              </div>
            </div>

            {/* SECTION 2: Authentication Credentials */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Protected Process Operations Authentication
                </h4>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Process lifecycle mutations (killing, pausing, resuming, creating processes, changing nice priority) require authorization headers. SSE streams and telemetry overview are public and unauthenticated.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Credential Type
                  </label>
                  <select
                    value={inputAuthType}
                    onChange={(e) => setInputAuthType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="apiKey">API Key (x-api-key)</option>
                    <option value="bearer">Bearer Token (Authorization)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    API Key / Signed Token Value
                  </label>
                  <input
                    type="password"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    placeholder="Enter API Key or session token..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Security Architecture:</strong> Credentials are kept in memory and browser session storage. They are never logged or passed in query strings. In backend dev mode, fallback authentication is permitted for testing.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium transition shadow-sm"
              >
                Save &amp; Apply Connection
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 3: Appearance & Theme */}
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Interface Appearance</h3>
              <p className="text-xs text-slate-400">
                Choose between Technical Dark Mode, Light Mode, or Follow OS System Theme
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark' as const, label: 'Dark Mode', desc: 'Optimized for monitors' },
              { id: 'light' as const, label: 'Light Mode', desc: 'High contrast daylight' },
              { id: 'system' as const, label: 'System Theme', desc: 'Match OS preference' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`p-3.5 rounded-xl border text-left transition ${
                  theme === t.id
                    ? 'border-rose-500 bg-rose-500/10 text-white'
                    : 'border-slate-800 bg-slate-850/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold">{t.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 4: Chart & Telemetry Preferences */}
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Telemetry History Window</h3>
              <p className="text-xs text-slate-400">
                Rolling duration of samples plotted in live performance charts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { sec: 30, label: '30 Seconds' },
              { sec: 60, label: '60 Seconds (Default)' },
              { sec: 120, label: '2 Minutes' },
              { sec: 300, label: '5 Minutes' },
            ].map((w) => (
              <button
                key={w.sec}
                type="button"
                onClick={() => setHistoryWindowSeconds(w.sec)}
                className={`p-3 rounded-xl border text-center transition font-mono text-xs ${
                  historyWindowSeconds === w.sec
                    ? 'border-rose-500 bg-rose-500/10 text-rose-300 font-bold'
                    : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Charts record samples received in this browser session. Data is not artificially simulated.
          </p>
        </div>

        {/* SECTION 5: About & Architecture */}
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">About Task Manager</h3>
              <p className="text-xs text-slate-400">
                Unified Linux System Monitor engineered for Raspberry Pi 3B
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono text-slate-300">
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Dashboard Frontend Version:</span>
                <span className="text-slate-200 font-bold">1.0.0 (Vite + React + TS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Backend API Gateway (CEE):</span>
                <span className="text-slate-200">Express + SSE Stream Hub</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduling Engine (SE):</span>
                <span className="text-slate-200">Linux /proc &amp; POSIX Signals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Database &amp; Security Engine (DSE):</span>
                <span className="text-slate-200">SQLite WAL + RBAC Guard</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Swagger OpenAPI Spec:</span>
                <a
                  href={`${baseUrl}/api/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>/api/docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
