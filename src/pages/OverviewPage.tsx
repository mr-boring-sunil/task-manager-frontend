import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { CpuCard } from '../components/metrics/CpuCard';
import { MemoryCard } from '../components/metrics/MemoryCard';
import { DiskCard } from '../components/metrics/DiskCard';
import { TemperatureCard } from '../components/metrics/TemperatureCard';
import { NetworkCard } from '../components/metrics/NetworkCard';
import { CpuChart } from '../components/charts/CpuChart';
import { MemoryChart } from '../components/charts/MemoryChart';
import { NetworkChart } from '../components/charts/NetworkChart';
import { TemperatureChart } from '../components/charts/TemperatureChart';
import { ProcessInspector } from '../components/processes/ProcessInspector';
import { ChangePriorityDialog } from '../components/processes/ChangePriorityDialog';
import { TerminateProcessDialog } from '../components/processes/TerminateProcessDialog';
import { StatusBadge } from '../components/common/StatusBadge';
import { useMetrics } from '../context/MetricsContext';
import { useBackend } from '../context/BackendContext';
import { useProcessesStream } from '../hooks/useProcessesStream';
import { useProcessDetails } from '../hooks/useProcessDetails';
import { metricsService } from '../services/metricsService';
import { CpuMetrics, MemoryMetrics, NetworkMetric } from '../types/metrics';
import { Process, SignalType } from '../types/process';
import { formatDuration } from '../utils/formatDuration';
import { formatBytes } from '../utils/formatBytes';
import { formatPercentage } from '../utils/formatPercentage';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { metrics, history } = useMetrics();
  const { baseUrl, isOnline, health } = useBackend();
  const { processes: streamProcesses } = useProcessesStream({ enabled: true });

  // Detailed telemetry states
  const [cpuDetails, setCpuDetails] = useState<CpuMetrics | null>(null);
  const [memDetails, setMemDetails] = useState<MemoryMetrics | null>(null);
  const [netDetails, setNetDetails] = useState<NetworkMetric[] | null>(null);

  // Inspector and Dialog states
  const [inspectPid, setInspectPid] = useState<number | null>(null);
  const [priorityProcess, setPriorityProcess] = useState<Process | null>(null);
  const [terminateProcess, setTerminateProcess] = useState<Process | null>(null);

  const {
    process: inspectedProcess,
    isLoading: isInspectLoading,
    error: inspectError,
    refresh: refreshInspector,
    pause: pauseProcess,
    resume: resumeProcess,
    changePriority: applyPriority,
    terminate: applyTerminate,
    actionLoading,
  } = useProcessDetails(inspectPid);

  // Load supplemental hardware details on mount
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      metricsService.getCpu().catch(() => null),
      metricsService.getMemory().catch(() => null),
      metricsService.getNetwork().catch(() => null),
    ]).then(([cpu, mem, net]) => {
      if (isMounted) {
        if (cpu) setCpuDetails(cpu);
        if (mem) setMemDetails(mem);
        if (net) setNetDetails(net);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const hostName = baseUrl.replace(/^https?:\/\//, '').split(':')[0] || 'Raspberry Pi';

  // Top processes by CPU
  const topProcesses = [...streamProcesses]
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 5);

  const isTempAvailable = metrics?.cpuTemperatureStatus === 'available';

  return (
    <PageContainer>
      {/* SECTION A: System Status Header */}
      <div className="card-base p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">{hostName}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Raspberry Pi 3B
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Linux SBC Node • {health?.status || (isOnline ? 'Online' : 'Offline')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">System Uptime</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatDuration(metrics?.systemUptime)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Active Processes</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                {streamProcesses.length > 0 ? streamProcesses.length : '—'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 block text-[10px] uppercase">Connection Status</span>
              <span
                className={`font-semibold mt-0.5 block ${
                  isOnline ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isOnline ? 'Active SSE Sync' : 'Host Unreachable'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: Resource Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <CpuCard
          utilization={metrics?.cpuUtilization}
          cpuDetails={cpuDetails}
          onClick={() => navigate('/performance?tab=cpu')}
        />
        <MemoryCard
          totalRam={metrics?.totalRam || 0}
          usedRam={metrics?.usedRam || 0}
          availableRam={metrics?.availableRam || 0}
          utilizationPercentage={metrics?.ramUtilizationPercentage || 0}
          memDetails={memDetails}
          onClick={() => navigate('/performance?tab=memory')}
        />
        <DiskCard
          total={metrics?.diskTotal || 0}
          used={metrics?.diskUsed || 0}
          available={metrics?.diskAvailable || 0}
          percentage={metrics?.diskUtilizationPercentage || 0}
          onClick={() => navigate('/storage')}
        />
        <TemperatureCard
          celsius={metrics?.cpuTemperature}
          status={metrics?.cpuTemperatureStatus || 'unavailable'}
          onClick={() => navigate('/performance?tab=temperature')}
        />
        <NetworkCard
          interfaces={netDetails}
          onClick={() => navigate('/network')}
        />
      </div>

      {/* SECTION C: Live Performance Charts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Real-Time Resource Telemetry (Rolling 60s)
          </h2>
          <span className="text-xs font-mono text-slate-500">
            {history.length} active samples
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CPU Chart */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Processor Utilization Over Time
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400">
                {metrics ? formatPercentage(metrics.cpuUtilization) : '—'}
              </span>
            </div>
            <CpuChart data={history} height={200} />
          </div>

          {/* Memory Chart */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-400" />
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  RAM Utilization Over Time
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400">
                {metrics ? formatPercentage(metrics.ramUtilizationPercentage) : '—'}
              </span>
            </div>
            <MemoryChart data={history} height={200} />
          </div>

          {/* Network Chart */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Network Bandwidth Activity
              </h3>
            </div>
            <NetworkChart data={history} height={200} />
          </div>

          {/* Temperature Chart */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                CPU Core Temperature
              </h3>
              {isTempAvailable && metrics?.cpuTemperature && (
                <span className="text-xs font-mono font-bold text-amber-400">
                  {metrics.cpuTemperature.toFixed(1)} °C
                </span>
              )}
            </div>
            <TemperatureChart
              data={history}
              isAvailable={isTempAvailable}
              height={200}
            />
          </div>
        </div>
      </div>

      {/* SECTION D: Top Active Processes */}
      <div className="card-base p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Top Processes by CPU Load</h3>
            <p className="text-xs text-slate-400">Live high-consumption Linux tasks</p>
          </div>
          <button
            onClick={() => navigate('/processes')}
            className="text-xs font-medium text-rose-400 hover:text-rose-300 transition flex items-center gap-1"
          >
            <span>View All Processes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2 px-3">PID</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3 text-right">CPU %</th>
                <th className="py-2 px-3 text-right">RAM %</th>
                <th className="py-2 px-3 text-right">Resident</th>
                <th className="py-2 px-3">State</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {topProcesses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    Awaiting process telemetry stream...
                  </td>
                </tr>
              ) : (
                topProcesses.map((proc) => (
                  <tr
                    key={proc.pid}
                    onClick={() => setInspectPid(proc.pid)}
                    className="border-b border-slate-800/60 hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3 font-bold text-rose-400">{proc.pid}</td>
                    <td className="py-2.5 px-3 text-slate-100 font-sans font-medium">{proc.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{proc.username}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                      {formatPercentage(proc.cpu)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {formatPercentage(proc.memory)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {formatBytes(proc.memoryUsage)}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge state={proc.state} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectPid(proc.pid);
                        }}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Inspector Drawer */}
      {inspectPid !== null && (
        <ProcessInspector
          process={inspectedProcess}
          isLoading={isInspectLoading}
          error={inspectError}
          onClose={() => setInspectPid(null)}
          onRefresh={refreshInspector}
          onPause={pauseProcess}
          onResume={resumeProcess}
          onChangePriority={(p) => setPriorityProcess(p)}
          onTerminate={(p) => setTerminateProcess(p)}
          actionLoading={actionLoading}
        />
      )}

      {/* Priority Change Dialog */}
      <ChangePriorityDialog
        isOpen={priorityProcess !== null}
        process={priorityProcess}
        onConfirm={async (newPriority) => {
          await applyPriority(newPriority);
          setPriorityProcess(null);
        }}
        onClose={() => setPriorityProcess(null)}
      />

      {/* Terminate Dialog */}
      <TerminateProcessDialog
        isOpen={terminateProcess !== null}
        process={terminateProcess}
        onConfirm={async (sig: SignalType) => {
          await applyTerminate(sig);
          setTerminateProcess(null);
        }}
        onClose={() => setTerminateProcess(null)}
      />
    </PageContainer>
  );
};
