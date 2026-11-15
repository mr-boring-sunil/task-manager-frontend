import React, { useState, useEffect } from 'react';
import { HardDrive, RefreshCw } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { metricsService } from '../services/metricsService';
import { DiskMetric } from '../types/metrics';
import { formatBytes } from '../utils/formatBytes';
import { formatPercentage } from '../utils/formatPercentage';

export const StoragePage: React.FC = () => {
  const [filesystems, setFilesystems] = useState<DiskMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiskMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await metricsService.getDisk();
      setFilesystems(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to query filesystem metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiskMetrics();
  }, []);

  // Compute aggregate totals
  const totalStorage = filesystems.reduce((acc, fs) => acc + (fs.totalCapacity || 0), 0);
  const totalUsed = filesystems.reduce((acc, fs) => acc + (fs.usedCapacity || 0), 0);
  const totalAvailable = filesystems.reduce((acc, fs) => acc + (fs.availableCapacity || 0), 0);
  const totalPercentage = totalStorage > 0 ? (totalUsed / totalStorage) * 100 : 0;

  return (
    <PageContainer
      title="Storage & Mounted Filesystems"
      subtitle="Capacity, mount points, and partition utilization on Raspberry Pi"
      actions={
        <button
          onClick={fetchDiskMetrics}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {isLoading && filesystems.length === 0 ? (
        <LoadingState message="Scanning mounted storage partitions..." />
      ) : error ? (
        <ErrorState title="Storage Error" message={error} onRetry={fetchDiskMetrics} />
      ) : (
        <div className="space-y-6">
          {/* Storage Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-base p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500">Total Pooled Space</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {formatBytes(totalStorage)}
              </div>
              <span className="text-xs text-slate-400">All partitions</span>
            </div>

            <div className="card-base p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500">Allocated Space</span>
              <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                {formatBytes(totalUsed)}
              </div>
              <span className="text-xs text-slate-400">
                {formatPercentage(totalPercentage)} pooled usage
              </span>
            </div>

            <div className="card-base p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500">Available Space</span>
              <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                {formatBytes(totalAvailable)}
              </div>
              <span className="text-xs text-slate-400">Unallocated free storage</span>
            </div>

            <div className="card-base p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500">Partitions</span>
              <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                {filesystems.length} Mounted
              </div>
              <span className="text-xs text-slate-400">Detected mount points</span>
            </div>
          </div>

          {/* Individual Storage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filesystems.map((fs, idx) => {
              const isRoot = fs.mountPoint === '/' || fs.mountPoint === 'C:';
              const percent = fs.utilizationPercentage || 0;
              const color =
                percent > 90 ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : 'bg-emerald-500';

              return (
                <div
                  key={idx}
                  className={`card-base p-5 space-y-3 ${
                    isRoot ? 'border-rose-500/40 bg-gradient-to-br from-slate-900 to-rose-950/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                          <span>{fs.filesystem}</span>
                          {isRoot && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              ROOT FS
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">Mount: {fs.mountPoint}</p>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-200">
                      {formatPercentage(percent)}
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${color}`}
                      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-1">
                    <span>
                      {formatBytes(fs.usedCapacity)} of {formatBytes(fs.totalCapacity)}
                    </span>
                    <span className="text-slate-300 font-semibold">
                      {formatBytes(fs.availableCapacity)} free
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filesystem Table */}
          <div className="card-base p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Filesystem Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Device</th>
                    <th className="py-2.5 px-3">Mount Point</th>
                    <th className="py-2.5 px-3 text-right">Total Capacity</th>
                    <th className="py-2.5 px-3 text-right">Used Space</th>
                    <th className="py-2.5 px-3 text-right">Available Space</th>
                    <th className="py-2.5 px-3 text-right">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {filesystems.map((fs, idx) => (
                    <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-850/50">
                      <td className="py-3 px-3 font-semibold text-slate-200">{fs.filesystem}</td>
                      <td className="py-3 px-3 text-slate-300">{fs.mountPoint}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{formatBytes(fs.totalCapacity)}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{formatBytes(fs.usedCapacity)}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{formatBytes(fs.availableCapacity)}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-100">
                        {formatPercentage(fs.utilizationPercentage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
