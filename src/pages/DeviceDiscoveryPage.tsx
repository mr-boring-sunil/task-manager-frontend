/**
 * Device Discovery Page
 * Discovers Raspberry Pi Task Manager nodes and allows manual SBC hostname/IP entry.
 * Raspberry Pi Task Manager — Dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  RefreshCw,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Cpu,
  Clock,
} from 'lucide-react';
import { deviceDiscoveryService } from '../../src/services/deviceDiscoveryService';
import { DiscoveredDevice } from '../../src/types/auth';
import { useAuth } from '../../src/context/AuthContext';
import { formatDuration } from '../../src/utils/formatDuration';

export const DeviceDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectDevice } = useAuth();

  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [manualHost, setManualHost] = useState<string>('');
  const [manualPort, setManualPort] = useState<string>('5000');
  const [isVerifyingManual, setIsVerifyingManual] = useState<boolean>(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const scanDevices = useCallback(async () => {
    setIsScanning(true);
    try {
      const results = await deviceDiscoveryService.discoverDevices();
      setDevices(results);
    } catch (err) {
      console.error('Discovery scan error:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    scanDevices();
  }, [scanDevices]);

  const handleSelectDevice = (device: DiscoveredDevice) => {
    selectDevice(device);
    navigate('/login');
  };

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHost.trim()) return;

    setIsVerifyingManual(true);
    setManualError(null);

    try {
      const port = parseInt(manualPort.trim() || '5000', 10);
      const verified = await deviceDiscoveryService.verifyCustomDevice(manualHost, port);

      if (verified.status === 'online') {
        selectDevice(verified);
        navigate('/login');
      } else {
        setManualError(
          verified.error ||
            'Device failed health check. Verify host IP, port 5000, and ensure Task Manager backend is running.'
        );
      }
    } catch (err: any) {
      setManualError(err.message || 'Unable to connect to specified host');
    } finally {
      setIsVerifyingManual(false);
    }
  };

  const onlineDevices = devices.filter((d) => d.status === 'online');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-xl shadow-rose-950/50 mb-2">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Raspberry Pi Task Manager
          </h1>
          <p className="text-sm text-slate-400">
            Step 1: Discover and select your Raspberry Pi SBC device on the local network
          </p>
        </div>

        {/* SECTION 1: Discovered Devices Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-semibold text-slate-200">Discovered Network Devices</h2>
            </div>
            <button
              onClick={scanDevices}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-rose-400' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Rescan'}</span>
            </button>
          </div>

          {/* Devices List */}
          <div className="space-y-3">
            {isScanning && devices.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto" />
                <p className="text-xs font-mono text-slate-400">
                  Probing mDNS hostnames (task-manager.local, raspberrypi.local) and port 5000...
                </p>
              </div>
            ) : onlineDevices.length > 0 ? (
              onlineDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-850/70 border border-slate-800 hover:border-rose-500/40 transition group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100">{device.name}</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Online</span>
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {device.host}:{device.port}
                      </p>
                      {device.uptime !== undefined && (
                        <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Uptime: {formatDuration(device.uptime)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectDevice(device)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition shadow-lg shadow-rose-950/30 group-hover:translate-x-0.5"
                  >
                    <span>Connect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">No active devices found automatically</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Verify your Raspberry Pi is powered on, running the backend on port 5000, and connected to the same local network. Enter the device IP manually below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Manual IP Entry Fallback */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Plus className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-200">Manual Host or IP Address Entry</h2>
          </div>

          <form onSubmit={handleManualConnect} className="space-y-4">
            {manualError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{manualError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Hostname or IP Address</label>
                <div className="relative">
                  <Server className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualHost}
                    onChange={(e) => setManualHost(e.target.value)}
                    placeholder="e.g. 192.168.1.100 or task-manager.local"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">API Port</label>
                <input
                  type="text"
                  value={manualPort}
                  onChange={(e) => setManualPort(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifyingManual || !manualHost.trim()}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifyingManual ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                  <span>Verifying GET /health...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Connect to Device</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
