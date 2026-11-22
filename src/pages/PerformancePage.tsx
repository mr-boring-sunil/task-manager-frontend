import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Cpu,
  Database,
  HardDrive,
  Network,
  Thermometer,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { CpuChart } from '../components/charts/CpuChart';
import { MemoryChart } from '../components/charts/MemoryChart';
import { NetworkChart } from '../components/charts/NetworkChart';
import { TemperatureChart } from '../components/charts/TemperatureChart';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { metricsService } from '../services/metricsService';
import { useMetrics } from '../context/MetricsContext';
import {
  CpuMetrics,
  MemoryMetrics,
  DiskMetric,
  NetworkMetric,
  TemperatureMetric,
} from '../types/metrics';
import { formatBytes, formatRate } from '../utils/formatBytes';
import { formatPercentage } from '../utils/formatPercentage';

type PerformanceTab = 'cpu' | 'memory' | 'disk' | 'network' | 'temperature';

export const PerformancePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as PerformanceTab) || 'cpu';

  const { history } = useMetrics();

  const [activeTab, setActiveTab] = useState<PerformanceTab>(currentTab);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Telemetry details
  const [cpu, setCpu] = useState<CpuMetrics | null>(null);
  const [memory, setMemory] = useState<MemoryMetrics | null>(null);
  const [disk, setDisk] = useState<DiskMetric[]>([]);
  const [network, setNetwork] = useState<NetworkMetric[]>([]);
  const [temperature, setTemperature] = useState<TemperatureMetric | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cpuData, memData, diskData, netData, tempData] = await Promise.all([
        metricsService.getCpu(),
        metricsService.getMemory(),
        metricsService.getDisk(),
        metricsService.getNetwork(),
        metricsService.getTemperature(),
      ]);

      setCpu(cpuData);
      setMemory(memData);
      setDisk(diskData);
      setNetwork(netData);
      setTemperature(tempData);
    } catch (err: any) {
      setError(err.message || 'Failed to load detailed performance metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh detailed telemetry every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab: PerformanceTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'cpu' as PerformanceTab, label: 'CPU Processor', icon: Cpu },
    { id: 'memory' as PerformanceTab, label: 'Memory & Swap', icon: Database },
    { id: 'disk' as PerformanceTab, label: 'Disk Filesystems', icon: HardDrive },
    { id: 'network' as PerformanceTab, label: 'Network Interfaces', icon: Network },
    { id: 'temperature' as PerformanceTab, label: 'Thermal Sensors', icon: Thermometer },
  ];

  return (
    <PageContainer
      title="Hardware Performance & Telemetry"
      subtitle="Detailed Linux kernel metrics, per-core load, and hardware counters"
    >
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading && !cpu && !memory ? (
        <LoadingState message="Querying Linux system telemetry..." />
      ) : error && !cpu ? (
        <ErrorState title="Telemetry Error" message={error} onRetry={loadData} />
      ) : (
        <div className="space-y-6">
          {/* TAB 1: CPU SECTION */}
          {activeTab === 'cpu' && (
            <div className="space-y-6">
              {/* CPU Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-base p-4">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Overall Load</span>
                  <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                    {cpu ? formatPercentage(cpu.overallCpuUtilization) : '—'}
                  </div>
                  <span className="text-xs text-slate-400">Total CPU utilization</span>
                </div>

                <div className="card-base p-4">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Architecture</span>
                  <div className="text-base font-semibold text-slate-100 truncate mt-1">
                    {cpu?.cpuModel || 'ARM Cortex'}
                  </div>
                  <span className="text-xs text-slate-400">SoC Processor Model</span>
                </div>

                <div className="card-base p-4">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Physical Cores</span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                    {cpu?.cores || '4'} Cores
                  </div>
                  <span className="text-xs text-slate-400">SMP Multi-Processing</span>
                </div>

                <div className="card-base p-4">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Clock Speed</span>
                  <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                    {cpu?.frequencyGhz ? `${cpu.frequencyGhz} GHz` : '1.2 - 1.4 GHz'}
                  </div>
                  <span className="text-xs text-slate-400">Current Frequency</span>
                </div>
              </div>

              {/* Per-Core Visual Bars */}
              <div className="card-base p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">Per-Core CPU Utilization</h3>
                  <span className="text-xs font-mono text-slate-400">
                    {cpu?.perCoreUtilization?.length || 0} SMP Cores
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cpu?.perCoreUtilization?.map((core) => {
                    const color =
                      core.load > 85 ? 'bg-rose-500' : core.load > 70 ? 'bg-amber-500' : 'bg-emerald-500';
                    return (
                      <div key={core.core} className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="font-semibold text-slate-300">Core #{core.core}</span>
                          <span className="font-bold text-slate-100">{formatPercentage(core.load)}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${color}`}
                            style={{ width: `${Math.min(100, Math.max(0, core.load))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Historical Load Chart */}
              <div className="card-base p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">Live CPU Trend (60s)</h3>
                <CpuChart data={history} height={240} />
              </div>
            </div>
          )}

          {/* TAB 2: MEMORY SECTION */}
          {activeTab === 'memory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-base p-4">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Total Physical RAM</span>
                  <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
                    {memory ? formatBytes(memory.total) : '—'}
                  </div>
                  <span className="text-xs text-slate-400">Hardware installed memory</span>
                </div>

                <div className="card-base p-4">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Used Memory</span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                    {memory ? formatBytes(memory.used) : '—'}
                  </div>
                  <span className="text-xs text-slate-400">Actively mapped RAM</span>
                </div>

                <div className="card-base p-4">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Available Memory</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {memory ? formatBytes(memory.available) : '—'}
                  </div>
                  <span className="text-xs text-slate-400">Free + reclaimable cache</span>
                </div>

                <div className="card-base p-4">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Free Memory (Unused)</span>
                  <div className="text-2xl font-bold font-mono text-slate-300 mt-1">
                    {memory ? formatBytes(memory.free) : '—'}
                  </div>
                  <span className="text-xs text-slate-400">Strictly unallocated memory</span>
                </div>
              </div>

              {/* Swap Details */}
              {memory?.swap && (
                <div className="card-base p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-200">Linux Swap Space</h3>
                  <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Swap Total</span>
                      <span className="text-slate-200 font-semibold">{formatBytes(memory.swap.total)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Swap Used</span>
                      <span className="text-rose-400 font-semibold">{formatBytes(memory.swap.used)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Swap Free</span>
                      <span className="text-slate-300 font-semibold">{formatBytes(memory.swap.free)}</span>
                    </div>
                  </div>
                  {memory.swap.total > 0 && (
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (memory.swap.used / memory.swap.total) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Live Memory Trend */}
              <div className="card-base p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">RAM Utilization Trend (60s)</h3>
                <MemoryChart data={history} height={240} />
              </div>
            </div>
          )}

          {/* TAB 3: DISK SECTION */}
          {activeTab === 'disk' && (
            <div className="space-y-6">
              <div className="card-base p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Mounted Linux Filesystems</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-2 px-3">Device / Filesystem</th>
                        <th className="py-2 px-3">Mount Point</th>
                        <th className="py-2 px-3 text-right">Total Capacity</th>
                        <th className="py-2 px-3 text-right">Used Space</th>
                        <th className="py-2 px-3 text-right">Available</th>
                        <th className="py-2 px-3 w-40 text-center">Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disk.map((d, idx) => {
                        const isRoot = d.mountPoint === '/' || d.mountPoint === 'C:';
                        const color =
                          d.utilizationPercentage > 90
                            ? 'bg-rose-500'
                            : d.utilizationPercentage > 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500';
                        return (
                          <tr
                            key={idx}
                            className={`border-b border-slate-800/60 ${
                              isRoot ? 'bg-rose-500/5' : ''
                            }`}
                          >
                            <td className="py-3 px-3 font-semibold text-slate-200">
                              {d.filesystem} {isRoot && <span className="text-[10px] text-rose-400 font-bold ml-1.5">[ROOT FS]</span>}
                            </td>
                            <td className="py-3 px-3 text-slate-300">{d.mountPoint}</td>
                            <td className="py-3 px-3 text-right text-slate-300">{formatBytes(d.totalCapacity)}</td>
                            <td className="py-3 px-3 text-right text-slate-300">{formatBytes(d.usedCapacity)}</td>
                            <td className="py-3 px-3 text-right text-slate-300">{formatBytes(d.availableCapacity)}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${color}`}
                                    style={{ width: `${Math.min(100, d.utilizationPercentage)}%` }}
                                  />
                                </div>
                                <span className="w-12 text-right font-bold text-slate-200">
                                  {d.utilizationPercentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NETWORK SECTION */}
          {activeTab === 'network' && (
            <div className="space-y-6">
              <div className="card-base p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Network Interfaces &amp; Rates</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-2 px-3">Interface</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Receive Rate (RX)</th>
                        <th className="py-2 px-3 text-right">Transmit Rate (TX)</th>
                        <th className="py-2 px-3 text-right">Total Received</th>
                        <th className="py-2 px-3 text-right">Total Transmitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {network.map((net) => {
                        const isUp = net.status.toLowerCase() === 'up';
                        return (
                          <tr key={net.interface} className="border-b border-slate-800/60">
                            <td className="py-3 px-3 font-bold text-slate-200">{net.interface}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  isUp
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {net.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                              {formatRate(net.receiveRateBytesPerSec)}
                            </td>
                            <td className="py-3 px-3 text-right text-sky-400 font-semibold">
                              {formatRate(net.transmitRateBytesPerSec)}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-300">
                              {formatBytes(net.receivedBytes)}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-300">
                              {formatBytes(net.transmittedBytes)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bandwidth Graph */}
              <div className="card-base p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Live Network Transfer Speeds</h3>
                    <p className="text-xs text-slate-400">
                      Rolling 60-second throughput history across active network interfaces
                    </p>
                  </div>
                </div>
                <NetworkChart data={history} height={240} />
              </div>
            </div>
          )}

          {/* TAB 5: TEMPERATURE SECTION */}
          {activeTab === 'temperature' && (
            <div className="space-y-6">
              <div className="card-base p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">Broadcom SoC Thermal Sensor</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      /sys/class/thermal/thermal_zone0/temp
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                      temperature?.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {temperature?.status === 'available' ? 'Sensor Available' : 'Sensor Unavailable'}
                  </span>
                </div>

                {temperature?.status === 'available' && typeof temperature.celsius === 'number' ? (
                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500">Core Temp</span>
                      <div className="text-3xl font-bold font-mono text-amber-400 mt-1">
                        {temperature.celsius.toFixed(1)} °C
                      </div>
                    </div>
                    <div className="text-right text-xs font-mono text-slate-400 space-y-1">
                      <div>Normal: &lt; 65.0 °C</div>
                      <div>Warm: 65.0 - 79.9 °C</div>
                      <div className="text-rose-400 font-bold">Throttling: &ge; 80.0 °C</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-850 border border-slate-800 text-center space-y-2">
                    <Thermometer className="w-8 h-8 text-slate-500 mx-auto" />
                    <h4 className="text-sm font-medium text-slate-300">
                      Temperature sensor unavailable
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      The thermal sensor could not be read on this host or environment. Values are not simulated to preserve data integrity.
                    </p>
                  </div>
                )}
              </div>

              {/* Thermal Chart */}
              <div className="card-base p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">Live Thermal Trend (60s)</h3>
                <TemperatureChart
                  data={history}
                  isAvailable={temperature?.status === 'available'}
                  height={240}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};
