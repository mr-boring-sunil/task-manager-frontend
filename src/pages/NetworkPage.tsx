import React, { useState, useEffect } from 'react';
import { Network, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { NetworkChart } from '../components/charts/NetworkChart';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { metricsService } from '../services/metricsService';
import { useMetrics } from '../context/MetricsContext';
import { NetworkMetric } from '../types/metrics';
import { formatBytes, formatRate } from '../utils/formatBytes';

export const NetworkPage: React.FC = () => {
  const { history } = useMetrics();
  const [interfaces, setInterfaces] = useState<NetworkMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetwork = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await metricsService.getNetwork();
      setInterfaces(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to query network interfaces.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
    const timer = setInterval(fetchNetwork, 3000);
    return () => clearInterval(timer);
  }, []);

  const totalRxRate = interfaces.reduce((sum, i) => sum + (i.receiveRateBytesPerSec || 0), 0);
  const totalTxRate = interfaces.reduce((sum, i) => sum + (i.transmitRateBytesPerSec || 0), 0);
  const totalRxBytes = interfaces.reduce((sum, i) => sum + (i.receivedBytes || 0), 0);
  const totalTxBytes = interfaces.reduce((sum, i) => sum + (i.transmittedBytes || 0), 0);

  return (
    <PageContainer
      title="Network Interfaces & Traffic"
      subtitle="Live bandwidth transfer rates and packet counters per interface"
      actions={
        <button
          onClick={fetchNetwork}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {isLoading && interfaces.length === 0 ? (
        <LoadingState message="Querying Linux network sockets..." />
      ) : error && interfaces.length === 0 ? (
        <ErrorState title="Network Error" message={error} onRetry={fetchNetwork} />
      ) : (
        <div className="space-y-6">
          {/* Rate Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-base p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500">Download Speed</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
                <ArrowDown className="w-5 h-5 text-emerald-500" />
                {formatRate(totalRxRate)}
              </div>
              <span className="text-xs text-slate-400">Total ingress bandwidth</span>
            </div>

            <div className="card-base p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500">Upload Speed</span>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-1 flex items-center gap-1.5">
                <ArrowUp className="w-5 h-5 text-sky-500" />
                {formatRate(totalTxRate)}
              </div>
              <span className="text-xs text-slate-400">Total egress bandwidth</span>
            </div>

            <div className="card-base p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500">Total Ingress (RX)</span>
              <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                {formatBytes(totalRxBytes)}
              </div>
              <span className="text-xs text-slate-400">Received since boot</span>
            </div>

            <div className="card-base p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500">Total Egress (TX)</span>
              <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                {formatBytes(totalTxBytes)}
              </div>
              <span className="text-xs text-slate-400">Transmitted since boot</span>
            </div>
          </div>

          {/* Individual Interface Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interfaces.map((iface) => {
              const isUp = iface.status.toLowerCase() === 'up';
              return (
                <div key={iface.interface} className="card-base p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-800 text-violet-400 border border-slate-700">
                        <Network className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 font-mono">
                          {iface.interface}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {iface.interface.startsWith('wlan')
                            ? 'Wireless 802.11'
                            : iface.interface.startsWith('eth')
                            ? 'Ethernet LAN'
                            : 'Network adapter'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                        isUp
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {iface.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <ArrowDown className="w-3.5 h-3.5 text-emerald-400" /> RX Rate:
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        {formatRate(iface.receiveRateBytesPerSec)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <ArrowUp className="w-3.5 h-3.5 text-sky-400" /> TX Rate:
                      </span>
                      <span className="text-sky-400 font-semibold">
                        {formatRate(iface.transmitRateBytesPerSec)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                      <span>Total RX / TX:</span>
                      <span className="text-slate-300">
                        {formatBytes(iface.receivedBytes)} / {formatBytes(iface.transmittedBytes)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Bandwidth Chart */}
          <div className="card-base p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Live Bandwidth History (Rolling 60s)
            </h3>
            <NetworkChart data={history} height={260} />
          </div>
        </div>
      )}
    </PageContainer>
  );
};
