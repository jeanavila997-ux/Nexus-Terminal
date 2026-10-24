import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import {
  Cpu,
  HardDrive,
  Activity,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Flame,
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  Server,
  Layers,
  Sparkles,
  CheckCircle2,
  Gauge,
  AlertTriangle,
  BellRing,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Info,
  Clock,
  Power
} from 'lucide-react';
import { ResourceMetricPoint, ProcessMetric, CpuAlert, CpuAlertKillPolicy } from '../types';

interface ResourceMonitorViewProps {
  onBackToOverview?: () => void;
  onNavigateToChat?: () => void;
  isOverloadStressTesting?: boolean;
  onToggleOverloadStressTest?: () => void;
  overloadCountdown?: number;
  consecutiveHighCpuSeconds?: number;
  isAlertActive?: boolean;
  activeAlertData?: CpuAlert | null;
  alertHistory?: CpuAlert[];
  cpuKillPolicy?: CpuAlertKillPolicy;
  onSetCpuKillPolicy?: (policy: CpuAlertKillPolicy) => void;
  alertActiveSeconds?: number;
  onExecuteKillProcess?: (pid: number, processName: string) => void;
}

const INITIAL_PROCESSES: ProcessMetric[] = [
  { pid: 1042, name: 'Nexus Engine Core', category: 'system', cpu: 3.8, memoryMB: 112, threads: 8, status: 'running' },
  { pid: 2180, name: 'Dev Agent (9Router Worker)', category: 'agent', cpu: 5.4, memoryMB: 148, threads: 12, status: 'running' },
  { pid: 3014, name: 'Vite Dev Server', category: 'dev', cpu: 2.1, memoryMB: 94, threads: 6, status: 'running' },
  { pid: 4120, name: 'PostgreSQL MCP Bridge', category: 'mcp', cpu: 1.2, memoryMB: 48, threads: 4, status: 'idle' },
  { pid: 4890, name: 'FS & CLI Watcher', category: 'system', cpu: 0.9, memoryMB: 32, threads: 3, status: 'running' },
  { pid: 5612, name: 'Web Search MCP Tool', category: 'mcp', cpu: 0.5, memoryMB: 26, threads: 2, status: 'idle' },
];

export const ResourceMonitorView: React.FC<ResourceMonitorViewProps> = ({ 
  onBackToOverview,
  onNavigateToChat,
  isOverloadStressTesting = false,
  onToggleOverloadStressTest,
  overloadCountdown = 0,
  consecutiveHighCpuSeconds = 0,
  isAlertActive = false,
  activeAlertData = null,
  alertHistory = [],
  cpuKillPolicy = 'suggest',
  onSetCpuKillPolicy,
  alertActiveSeconds = 0,
  onExecuteKillProcess,
}) => {
  // Streaming & Historical Data State
  const [isLive, setIsLive] = useState<boolean>(true);
  const [timeHorizon, setTimeHorizon] = useState<'30s' | '60s' | '120s'>('60s');
  const [activeTab, setActiveTab] = useState<'all' | 'cpu' | 'memory' | 'network' | 'latency'>('all');
  const [samplingRate, setSamplingRate] = useState<number>(1000); // ms
  const [isStressTesting, setIsStressTesting] = useState<boolean>(false);
  const [stressCountdown, setStressCountdown] = useState<number>(0);
  const [processes, setProcesses] = useState<ProcessMetric[]>(INITIAL_PROCESSES);

  // Cumulative transfer counters
  const [totalRxMB, setTotalRxMB] = useState<number>(18.4);
  const [totalTxMB, setTotalTxMB] = useState<number>(4.9);

  // Generate initial historical buffer (60 points)
  const [history, setHistory] = useState<ResourceMetricPoint[]>(() => {
    const now = Date.now();
    const points: ResourceMetricPoint[] = [];
    for (let i = 59; i >= 0; i--) {
      const t = now - i * 1000;
      const date = new Date(t);
      const timeStr = date.toTimeString().split(' ')[0];
      const baseCpu = 12 + Math.sin(i * 0.3) * 6 + Math.random() * 4;
      const c1 = Math.min(99, Math.max(2, baseCpu + (Math.random() * 6 - 3)));
      const c2 = Math.min(99, Math.max(2, baseCpu + (Math.random() * 8 - 4)));
      const c3 = Math.min(99, Math.max(2, baseCpu + (Math.random() * 5 - 2.5)));
      const c4 = Math.min(99, Math.max(2, baseCpu + (Math.random() * 6 - 3)));
      const memMB = 420 + Math.sin(i * 0.1) * 18 + (Math.random() * 10);
      const rx = 35 + Math.random() * 80 + (i % 8 === 0 ? 160 : 0);
      const tx = 15 + Math.random() * 35;

      points.push({
        time: timeStr,
        timestamp: t,
        cpuTotal: parseFloat(baseCpu.toFixed(1)),
        cpuCore1: parseFloat(c1.toFixed(1)),
        cpuCore2: parseFloat(c2.toFixed(1)),
        cpuCore3: parseFloat(c3.toFixed(1)),
        cpuCore4: parseFloat(c4.toFixed(1)),
        memoryUsedMB: parseFloat(memMB.toFixed(1)),
        memoryTotalMB: 2048,
        memoryPercent: parseFloat(((memMB / 2048) * 100).toFixed(1)),
        networkRxKB: parseFloat(rx.toFixed(1)),
        networkTxKB: parseFloat(tx.toFixed(1)),
        networkLatencyMs: parseFloat((14 + Math.random() * 8).toFixed(1)),
        ioReadKB: parseFloat((120 + Math.random() * 80).toFixed(1)),
        ioWriteKB: parseFloat((45 + Math.random() * 40).toFixed(1)),
      });
    }
    return points;
  });

  // Current latest metric point
  const currentMetric = useMemo(() => {
    return history[history.length - 1] || {
      cpuTotal: 14.2,
      cpuCore1: 12.0,
      cpuCore2: 15.5,
      cpuCore3: 13.8,
      cpuCore4: 14.9,
      memoryUsedMB: 432,
      memoryTotalMB: 2048,
      memoryPercent: 21.1,
      networkRxKB: 48.5,
      networkTxKB: 18.2,
      networkLatencyMs: 16.4,
      ioReadKB: 135,
      ioWriteKB: 48,
    };
  }, [history]);

  // Real-time telemetry generator loop
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeStr = new Date(now).toTimeString().split(' ')[0];

      // Native browser memory check if accessible
      let browserMemoryMB = 0;
      const perfAny = window.performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } };
      if (perfAny && perfAny.memory) {
        browserMemoryMB = perfAny.memory.usedJSHeapSize / (1024 * 1024);
      }

      // Check if stress test or overload is active
      const isOverload = isOverloadStressTesting;
      const isStress = isStressTesting || isOverload;
      const baseCpu = isOverload
        ? 93.8 + Math.random() * 3.8
        : isStress
        ? 72 + Math.random() * 18
        : 11 + Math.sin(now / 5000) * 5 + (Math.random() * 6);

      const c1 = isOverload ? Math.min(99.4, 94 + Math.random() * 5) : Math.min(99, Math.max(3, baseCpu + (Math.random() * 8 - 4)));
      const c2 = isOverload ? Math.min(99.4, 93 + Math.random() * 5.5) : Math.min(99, Math.max(3, baseCpu + (Math.random() * 10 - 5)));
      const c3 = isOverload ? Math.min(99.4, 95 + Math.random() * 4) : Math.min(99, Math.max(3, baseCpu + (Math.random() * 7 - 3.5)));
      const c4 = isOverload ? Math.min(99.4, 92 + Math.random() * 6) : Math.min(99, Math.max(3, baseCpu + (Math.random() * 9 - 4.5)));

      const baseMem = browserMemoryMB > 0 
        ? Math.min(1800, browserMemoryMB * 3.5 + 300) 
        : 430 + (isOverload ? 380 : isStress ? 280 : 0) + Math.sin(now / 8000) * 20 + Math.random() * 8;

      const rx = isOverload ? 620 + Math.random() * 400 : isStress ? 420 + Math.random() * 300 : 25 + Math.random() * 95 + (Math.random() > 0.85 ? 180 : 0);
      const tx = isOverload ? 280 + Math.random() * 200 : isStress ? 190 + Math.random() * 150 : 12 + Math.random() * 45;
      const latency = isOverload ? 55 + Math.random() * 35 : isStress ? 38 + Math.random() * 25 : 12 + Math.random() * 9;

      const newPoint: ResourceMetricPoint = {
        time: timeStr,
        timestamp: now,
        cpuTotal: parseFloat(baseCpu.toFixed(1)),
        cpuCore1: parseFloat(c1.toFixed(1)),
        cpuCore2: parseFloat(c2.toFixed(1)),
        cpuCore3: parseFloat(c3.toFixed(1)),
        cpuCore4: parseFloat(c4.toFixed(1)),
        memoryUsedMB: parseFloat(baseMem.toFixed(1)),
        memoryTotalMB: 2048,
        memoryPercent: parseFloat(((baseMem / 2048) * 100).toFixed(1)),
        networkRxKB: parseFloat(rx.toFixed(1)),
        networkTxKB: parseFloat(tx.toFixed(1)),
        networkLatencyMs: parseFloat(latency.toFixed(1)),
        ioReadKB: parseFloat((isOverload ? 820 : isStress ? 650 : 110 + Math.random() * 90).toFixed(1)),
        ioWriteKB: parseFloat((isOverload ? 460 : isStress ? 320 : 35 + Math.random() * 50).toFixed(1)),
      };

      setTotalRxMB((prev) => parseFloat((prev + rx / 1024).toFixed(3)));
      setTotalTxMB((prev) => parseFloat((prev + tx / 1024).toFixed(3)));

      setHistory((prev) => {
        const maxPoints = timeHorizon === '30s' ? 30 : timeHorizon === '60s' ? 60 : 120;
        const updated = [...prev, newPoint];
        if (updated.length > maxPoints) {
          return updated.slice(updated.length - maxPoints);
        }
        return updated;
      });

      // Fluctuate process stats dynamically
      setProcesses((prev) =>
        prev.map((p) => {
          if (p.name.includes('Dev Agent') && isOverload) {
            return { ...p, cpu: parseFloat((63 + Math.random() * 6).toFixed(1)), memoryMB: p.memoryMB + (Math.random() > 0.5 ? 1 : 0) };
          }
          if (p.name.includes('Nexus Engine') && isOverload) {
            return { ...p, cpu: parseFloat((24 + Math.random() * 3).toFixed(1)) };
          }
          if (p.name.includes('Dev Agent') && isStress) {
            return { ...p, cpu: parseFloat((35 + Math.random() * 25).toFixed(1)), memoryMB: p.memoryMB + (Math.random() > 0.5 ? 2 : -1) };
          }
          if (p.name.includes('Nexus Engine') && isStress) {
            return { ...p, cpu: parseFloat((18 + Math.random() * 12).toFixed(1)) };
          }
          const jitter = (Math.random() * 0.8 - 0.4);
          return {
            ...p,
            cpu: Math.max(0.1, parseFloat((p.cpu + jitter).toFixed(1))),
          };
        })
      );
    }, samplingRate);

    return () => clearInterval(interval);
  }, [isLive, samplingRate, timeHorizon, isStressTesting, isOverloadStressTesting]);

  // Stress test countdown effect
  useEffect(() => {
    if (!isStressTesting) return;

    if (stressCountdown <= 0) {
      setIsStressTesting(false);
      return;
    }

    const timer = setTimeout(() => {
      setStressCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isStressTesting, stressCountdown]);

  const handleTriggerStressTest = () => {
    if (isStressTesting) {
      setIsStressTesting(false);
      setStressCountdown(0);
    } else {
      setIsStressTesting(true);
      setStressCountdown(15);
    }
  };

  const handleExportSnapshot = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexus-telemetry-${new Date().toISOString().slice(0, 19)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetHistory = () => {
    setHistory([]);
  };

  // Filtered view points based on time horizon
  const visiblePoints = useMemo(() => {
    const limit = timeHorizon === '30s' ? 30 : timeHorizon === '60s' ? 60 : 120;
    return history.slice(-limit);
  }, [history, timeHorizon]);

  // Custom Dark Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a] border border-white/15 p-3 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs z-50">
          <p className="text-white/40 mb-2 border-b border-white/10 pb-1 text-[11px]">
            Timestamp: <span className="text-white font-semibold">{label}</span>
          </p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-white/70">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className="font-bold text-white font-mono">
                  {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                  {entry.unit || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 sm:p-8 bg-[#050505] space-y-6 text-white font-sans">
      {/* Top Header & Navigation Breadcrumb */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {onBackToOverview && (
              <button
                onClick={onBackToOverview}
                className="text-xs font-mono text-[#F27D26] hover:underline cursor-pointer flex items-center gap-1 uppercase tracking-wider"
              >
                &larr; Estado Geral
              </button>
            )}
            <span className="text-white/20">&bull;</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 uppercase tracking-widest">
              Telemetria ao Vivo
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="w-6 h-6 text-[#F27D26]" />
            Monitor de Recursos em Tempo Real
          </h2>
          <p className="text-xs text-white/50 font-mono mt-1">
            Estatísticas contínuas de CPU multi-core, consumo de memória Heap/RSS e vazão de rede Rx/Tx.
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Live Streaming Indicator & Toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 border transition-all cursor-pointer ${
              isLive
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-400'
            }`}
            title={isLive ? 'Pausar streaming' : 'Retomar streaming'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{isLive ? 'AO VIVO (1 Hz)' : 'PAUSADO'}</span>
            {isLive ? <Pause className="w-3 h-3 ml-1" /> : <Play className="w-3 h-3 ml-1" />}
          </button>

          {/* Time Horizon Selector */}
          <div className="flex rounded-full border border-white/10 bg-[#0a0a0a] p-0.5 text-xs font-mono">
            {(['30s', '60s', '120s'] as const).map((horizon) => (
              <button
                key={horizon}
                onClick={() => setTimeHorizon(horizon)}
                className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                  timeHorizon === horizon
                    ? 'bg-white text-black font-bold'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {horizon}
              </button>
            ))}
          </div>

          {/* Stress Test Simulator Button */}
          <button
            onClick={handleTriggerStressTest}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isStressTesting
                ? 'bg-[#F27D26] border-[#F27D26] text-black shadow-[0_0_15px_rgba(242,125,38,0.4)] animate-pulse'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
            }`}
            title="Simular processamento pesado do Agente de IA para observar reatividade do gráfico"
          >
            <Flame className={`w-3.5 h-3.5 ${isStressTesting ? 'text-black' : 'text-[#F27D26]'}`} />
            <span>{isStressTesting ? `Stress Ativo (${stressCountdown}s)` : 'Simular Carga IA'}</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportSnapshot}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white cursor-pointer"
            title="Exportar dados de telemetria (.JSON)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Alert Active or In-Progress Notice Banner */}
      {isAlertActive ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-[#0c0404] border-2 border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.35)] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/30 border border-rose-500/60 flex items-center justify-center shrink-0 shadow-lg text-rose-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/50">
                  ALERTA CRÍTICO ATIVO (CPU &gt; 90%)
                </span>
                <span className="text-[11px] font-mono text-rose-300">
                  Duração contínua: <strong>{consecutiveHighCpuSeconds}s</strong> (Limiar de 5s violado)
                </span>
              </div>
              <p className="text-sm font-medium text-white/90 mt-1">
                Uso de CPU atingiu <strong>{currentMetric.cpuTotal.toFixed(1)}%</strong>. O daemon registrou e enviou automaticamente os logs de diagnóstico para o chat (#geral).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onNavigateToChat && (
              <button
                onClick={onNavigateToChat}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono flex items-center gap-1.5 shadow-lg hover:bg-white/90 transition-all cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5 text-[#F27D26]" />
                <span>Ver Logs no Chat (#Geral)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {isOverloadStressTesting && onToggleOverloadStressTest && (
              <button
                onClick={onToggleOverloadStressTest}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-200 text-xs font-mono font-medium transition-all cursor-pointer"
              >
                Parar Sobrecarga
              </button>
            )}
          </div>
        </div>
      ) : consecutiveHighCpuSeconds > 0 ? (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
            <div>
              <p className="text-xs font-mono font-semibold">
                Elevação Crítica de CPU ({currentMetric.cpuTotal.toFixed(1)}% &gt; 90%)
              </p>
              <p className="text-[11px] text-amber-200/70 font-mono mt-0.5">
                Contagem contínua para emissão de alerta no chat: {consecutiveHighCpuSeconds}s de 5s requeridos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 bg-black/40 h-2 rounded-full overflow-hidden border border-amber-500/30">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (consecutiveHighCpuSeconds / 5) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-300">
              {consecutiveHighCpuSeconds}/5s
            </span>
          </div>
        </div>
      ) : null}

      {/* CPU Alert System Watchdog Card */}
      <div className="p-5 sm:p-6 bg-gradient-to-b from-[#0c0c0c] to-[#070707] border border-white/10 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner ${
              isAlertActive 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' 
                : 'bg-[#F27D26]/10 border-[#F27D26]/30 text-[#F27D26]'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white tracking-wide">
                  Sistema de Alertas (CPU Watchdog Daemon)
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isAlertActive
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                    : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400'
                }`}>
                  {isAlertActive ? '🚨 ALERTA ATIVO' : 'MONITORANDO (NOMINAL)'}
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Regra: Notificar o usuário via logs no chat quando o uso de CPU ultrapassar 90% por mais de 5 segundos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleOverloadStressTest && (
              <button
                onClick={onToggleOverloadStressTest}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  isOverloadStressTesting
                    ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse'
                    : 'bg-white/5 hover:bg-white/10 border-white/15 text-white/90 hover:text-white'
                }`}
                title="Pressionar para simular CPU > 90% contínua e acionar o alerta aos 5 segundos"
              >
                <Flame className={`w-3.5 h-3.5 ${isOverloadStressTesting ? 'text-white' : 'text-rose-400'}`} />
                <span>
                  {isOverloadStressTesting 
                    ? `Sobrecarga Crítica (${overloadCountdown}s)` 
                    : 'Simular Sobrecarga Crítica (> 90%)'}
                </span>
              </button>
            )}

            {onNavigateToChat && (
              <button
                onClick={onNavigateToChat}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Abrir canal do chat para visualizar o histórico de logs do terminal"
              >
                <BellRing className="w-3.5 h-3.5 text-[#F27D26]" />
                <span>Ver Logs no Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* 5-Second Watchdog Progression & Rules Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* 5-Second Visual Progress Tracker */}
          <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white/60">Critério de Tempo (&gt; 5s):</span>
              <span className={`font-bold ${
                isAlertActive ? 'text-rose-400' : consecutiveHighCpuSeconds > 0 ? 'text-amber-400' : 'text-white/40'
              }`}>
                {consecutiveHighCpuSeconds}s / 5s
              </span>
            </div>
            {/* Visual 5-segment blocks */}
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((sec) => {
                const isPassed = consecutiveHighCpuSeconds >= sec;
                const isDisparador = sec === 5;
                return (
                  <div
                    key={sec}
                    className={`h-7 rounded-lg border flex flex-col items-center justify-center transition-all duration-300 ${
                      isPassed && isDisparador
                        ? 'bg-rose-500 border-rose-400 text-white font-bold shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse'
                        : isPassed
                        ? 'bg-amber-500/80 border-amber-400 text-black font-bold'
                        : 'bg-white/5 border-white/10 text-white/20'
                    }`}
                  >
                    <span className="text-[10px] font-mono">{sec}s</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1">
              <span>0s (Normal)</span>
              <span className="text-rose-400 font-semibold">&gt; 5s Dispara Alerta</span>
            </div>
          </div>

          {/* Rule Threshold Metric Card */}
          <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-white/60">
              <span>Limiar Crítico:</span>
              <span className="text-rose-400 font-bold">90.0% CPU</span>
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl font-bold font-mono text-white">
                {currentMetric.cpuTotal.toFixed(1)}%
              </span>
              <span className={`text-xs font-mono ${
                currentMetric.cpuTotal > 90 ? 'text-rose-400 font-bold' : 'text-emerald-400'
              }`}>
                {currentMetric.cpuTotal > 90 ? 'Acima do Limiar' : 'Abaixo do Limiar'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-white/40">
              Polling contínuo ativo a cada 1.0s (1 Hz).
            </div>
          </div>

          {/* Alert History Summary Counter */}
          <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-white/60">
              <span>Total de Incidentes Disparados:</span>
              <span className="text-[#F27D26] font-bold">{alertHistory.length}</span>
            </div>
            <div className="flex items-center gap-2 my-1">
              <span className="text-2xl font-bold font-mono text-white">
                {alertHistory.length}
              </span>
              <span className="text-xs font-mono text-white/50">alertas registrados</span>
            </div>
            <div className="text-[10px] font-mono text-white/40 flex items-center justify-between">
              <span>Canal de Destino:</span>
              <span className="text-[#F27D26] font-semibold">#geral (Chat Logs)</span>
            </div>
          </div>
        </div>

        {/* 10-Second Watchdog Remediation & Kill Action Sub-Panel */}
        <div className="mt-3 p-4 bg-black/60 rounded-xl border border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-4 h-4 ${isAlertActive ? 'text-rose-400 animate-pulse' : 'text-[#F27D26]'}`} />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Remediação Automática: Encerramento de Processo (10s de Alerta)
              </span>
            </div>
            
            {/* Policy Selector Pills */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
              <span className="text-white/40 px-1.5">Política:</span>
              <button
                type="button"
                onClick={() => onSetCpuKillPolicy?.('suggest')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  cpuKillPolicy === 'suggest'
                    ? 'bg-[#F27D26] text-black font-bold shadow-[0_0_10px_rgba(242,125,38,0.4)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Sugerir (Manual)
              </button>
              <button
                type="button"
                onClick={() => onSetCpuKillPolicy?.('auto_kill')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  cpuKillPolicy === 'auto_kill'
                    ? 'bg-rose-600 text-white font-bold shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Auto-Kill (10s)
              </button>
              <button
                type="button"
                onClick={() => onSetCpuKillPolicy?.('disabled')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  cpuKillPolicy === 'disabled'
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Desativado
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            {/* 10s Timer Progression */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">Tempo Contínuo em Alerta:</span>
                <span className={`font-bold ${isAlertActive ? 'text-rose-400 font-mono' : 'text-white/40'}`}>
                  {isAlertActive ? `${alertActiveSeconds}s / 10s` : '0s / 10s (Inativo)'}
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-300 ${
                    alertActiveSeconds >= 10 ? 'bg-rose-500 animate-pulse' : 'bg-[#F27D26]'
                  }`}
                  style={{ width: `${Math.min(100, (alertActiveSeconds / 10) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-white/40 flex justify-between">
                <span>0s (Alerta ativo)</span>
                <span className={alertActiveSeconds >= 10 ? 'text-rose-400 font-bold' : 'text-white/60'}>
                  10s: {cpuKillPolicy === 'auto_kill' ? 'Execução Auto-Kill' : cpuKillPolicy === 'suggest' ? 'Sugestão de Kill' : 'Sem Ação'}
                </span>
              </div>
            </div>

            {/* Top Consumer Identification */}
            <div className="p-2.5 bg-black/40 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-white/40 block">Maior Consumidor Alvo:</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isAlertActive ? 'bg-rose-500 animate-pulse' : 'bg-[#F27D26]'}`} />
                  [PID 2180] Dev Agent
                </span>
                <span className="text-xs font-mono text-rose-400 font-bold">~65.4% CPU</span>
              </div>
              <p className="text-[10px] font-mono text-white/50 truncate">
                {cpuKillPolicy === 'auto_kill' ? 'Encerramento automático aos 10s' : 'Sugestão interativa via console'}
              </p>
            </div>

            {/* Quick Kill Button */}
            <div className="flex flex-col justify-center">
              {onExecuteKillProcess && (
                <button
                  type="button"
                  onClick={() => onExecuteKillProcess(2180, 'Dev Agent (9Router Worker)')}
                  disabled={!isAlertActive && !isOverloadStressTesting}
                  className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    isAlertActive || isOverloadStressTesting
                      ? 'bg-rose-600 hover:bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                  }`}
                  title="Executar encerramento imediato via SIGKILL (kill -9 2180)"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>kill -9 2180 (Encerrar Agora)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Instant Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Total Card */}
        <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-white/50 mb-1.5">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider">CPU Total</span>
              <Cpu className="w-4 h-4 text-[#F27D26]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white">
                {currentMetric.cpuTotal.toFixed(1)}%
              </span>
              <span className={`text-xs font-mono font-medium ${
                currentMetric.cpuTotal > 70 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {currentMetric.cpuTotal > 70 ? 'Carga Elevada' : 'Normal'}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  currentMetric.cpuTotal > 70 ? 'bg-rose-500' : 'bg-[#F27D26]'
                }`}
                style={{ width: `${Math.min(100, currentMetric.cpuTotal)}%` }}
              />
            </div>
            {/* Core distribution spark bar */}
            <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-white/40 pt-1 border-t border-white/5">
              <div>C1: <span className="text-white/80">{currentMetric.cpuCore1.toFixed(0)}%</span></div>
              <div>C2: <span className="text-white/80">{currentMetric.cpuCore2.toFixed(0)}%</span></div>
              <div>C3: <span className="text-white/80">{currentMetric.cpuCore3.toFixed(0)}%</span></div>
              <div>C4: <span className="text-white/80">{currentMetric.cpuCore4.toFixed(0)}%</span></div>
            </div>
          </div>
        </div>

        {/* Memory RAM Card */}
        <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-white/50 mb-1.5">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider">Memória RAM</span>
              <HardDrive className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-white">
                {currentMetric.memoryUsedMB.toFixed(0)}
              </span>
              <span className="text-xs font-mono text-white/50">/ 2048 MB</span>
              <span className="text-xs font-mono font-medium text-emerald-400 ml-auto">
                {currentMetric.memoryPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, currentMetric.memoryPercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1 border-t border-white/5">
              <span>Heap Livre: ~{(2048 - currentMetric.memoryUsedMB).toFixed(0)} MB</span>
              <span className="text-emerald-400">Garbage Collector OK</span>
            </div>
          </div>
        </div>

        {/* Network Inbound & Outbound Card */}
        <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-white/50 mb-1.5">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider">Tráfego de Rede</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="flex items-center gap-1 text-xs text-white/60 font-mono">
                  <ArrowDownCircle className="w-3 h-3 text-[#F27D26]" />
                  <span>Rx:</span>
                  <span className="text-white font-bold">{currentMetric.networkRxKB.toFixed(1)} KB/s</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/60 font-mono mt-1">
                  <ArrowUpCircle className="w-3 h-3 text-sky-400" />
                  <span>Tx:</span>
                  <span className="text-white font-bold">{currentMetric.networkTxKB.toFixed(1)} KB/s</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-white/40 block">Total Sessão</span>
                <span className="text-xs font-mono font-bold text-white/80">{(totalRxMB + totalTxMB).toFixed(1)} MB</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
            <span>Latência MCP: <strong className="text-sky-300 font-bold">{currentMetric.networkLatencyMs.toFixed(0)} ms</strong></span>
            <span className="text-emerald-400">Socket Ativo</span>
          </div>
        </div>

        {/* I/O Operations & System Health Card */}
        <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-white/50 mb-1.5">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider">I/O & Conectividade</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white">
                {(currentMetric.ioReadKB + currentMetric.ioWriteKB).toFixed(0)}
              </span>
              <span className="text-xs font-mono text-white/50">KB/s I/O</span>
            </div>
          </div>

          <div className="mt-4 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              4 vCPUs &bull; 0 Falhas
            </span>
            <span className="text-white/60">Swap: 0%</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl space-y-5">
        {/* Chart View Selection Tabs & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-black font-bold shadow'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              Visão Combinada
            </button>
            <button
              onClick={() => setActiveTab('cpu')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'cpu'
                  ? 'bg-[#F27D26] text-black font-bold shadow'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              CPU Multi-Core
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'memory'
                  ? 'bg-emerald-400 text-black font-bold shadow'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              Memória RAM (MB)
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'network'
                  ? 'bg-sky-400 text-black font-bold shadow'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              Rede Rx / Tx (KB/s)
            </button>
            <button
              onClick={() => setActiveTab('latency')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'latency'
                  ? 'bg-amber-400 text-black font-bold shadow'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              Latência MCP (ms)
            </button>
          </div>

          <div className="text-xs font-mono text-white/40 flex items-center gap-2">
            <span>Intervalo: <strong>{timeHorizon}</strong></span>
            <span>&bull;</span>
            <span>Amostras: <strong>{visiblePoints.length}</strong></span>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="w-full h-72 sm:h-80 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'all' ? (
              <AreaChart data={visiblePoints} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F27D26" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F27D26" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff40" fontSize={11} tickLine={false} fontFamilly="monospace" />
                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} domain={[0, 100]} unit="%" fontFamilly="monospace" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'LIMIAR CRÍTICO (>90%)', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                <Area type="monotone" dataKey="cpuTotal" name="CPU Total" stroke="#F27D26" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" unit="%" isAnimationActive={false} />
                <Area type="monotone" dataKey="memoryPercent" name="Memória RAM" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" unit="%" isAnimationActive={false} />
              </AreaChart>
            ) : activeTab === 'cpu' ? (
              <AreaChart data={visiblePoints} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCore1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F27D26" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F27D26" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff40" fontSize={11} tickLine={false} />
                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'LIMIAR CRÍTICO (>90%)', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                <Area type="monotone" dataKey="cpuCore1" name="vCPU 1" stroke="#F27D26" strokeWidth={2} fill="url(#colorCore1)" unit="%" isAnimationActive={false} />
                <Line type="monotone" dataKey="cpuCore2" name="vCPU 2" stroke="#ff9d5c" strokeWidth={1.5} dot={false} unit="%" isAnimationActive={false} />
                <Line type="monotone" dataKey="cpuCore3" name="vCPU 3" stroke="#f59e0b" strokeWidth={1.5} dot={false} unit="%" isAnimationActive={false} />
                <Line type="monotone" dataKey="cpuCore4" name="vCPU 4" stroke="#eab308" strokeWidth={1.5} dot={false} unit="%" isAnimationActive={false} />
              </AreaChart>
            ) : activeTab === 'memory' ? (
              <AreaChart data={visiblePoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMemMB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff40" fontSize={11} tickLine={false} />
                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} domain={[0, 2048]} unit="MB" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={2048} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Teto 2048 MB', fill: '#ef4444', fontSize: 10 }} />
                <Area type="monotone" dataKey="memoryUsedMB" name="RAM Utilizada" stroke="#10b981" strokeWidth={2} fill="url(#colorMemMB)" unit=" MB" isAnimationActive={false} />
              </AreaChart>
            ) : activeTab === 'network' ? (
              <AreaChart data={visiblePoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F27D26" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F27D26" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff40" fontSize={11} tickLine={false} />
                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} unit=" KB/s" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="networkRxKB" name="Download (Rx)" stroke="#F27D26" strokeWidth={2} fill="url(#colorRx)" unit=" KB/s" isAnimationActive={false} />
                <Area type="monotone" dataKey="networkTxKB" name="Upload (Tx)" stroke="#38bdf8" strokeWidth={2} fill="url(#colorTx)" unit=" KB/s" isAnimationActive={false} />
              </AreaChart>
            ) : (
              <AreaChart data={visiblePoints} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff40" fontSize={11} tickLine={false} />
                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} unit=" ms" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Target SLA < 50ms', fill: '#f59e0b', fontSize: 10 }} />
                <Area type="monotone" dataKey="networkLatencyMs" name="Latência RTT" stroke="#f59e0b" strokeWidth={2} fill="url(#colorLatency)" unit=" ms" isAnimationActive={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Processes & Workers Resource Allocation Table */}
      <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-[#F27D26]" />
              Processos e Agentes em Execução
            </h3>
            <p className="text-xs text-white/50 font-mono">
              Consumo granular de CPU, memória heap alocada e contagem de threads por worker.
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 w-fit">
            6 Processos Monitorados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-[10px]">
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">Processo / Agente</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Threads</th>
                <th className="py-2.5 px-3">Uso de CPU</th>
                <th className="py-2.5 px-3">Memória</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processes.map((proc) => {
                const isTopOverload = isAlertActive && proc.pid === 2180;
                return (
                  <tr 
                    key={proc.pid} 
                    className={`transition-colors ${
                      isTopOverload ? 'bg-rose-950/20 border-l-2 border-rose-500' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-white/50">{proc.pid}</td>
                    <td className="py-2.5 px-3 text-white font-medium flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isTopOverload ? 'bg-rose-500 animate-pulse' : 'bg-[#F27D26]'}`} />
                      <span>{proc.name}</span>
                      {isTopOverload && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold">
                          ALERTA CRÍTICO
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                        {proc.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white/60">{proc.threads}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isTopOverload ? 'text-rose-400' : 'text-white'}`}>
                          {proc.cpu.toFixed(1)}%
                        </span>
                        <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${isTopOverload ? 'bg-rose-500' : 'bg-[#F27D26]'}`}
                            style={{ width: `${Math.min(100, proc.cpu * 2)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-white/80">{proc.memoryMB} MB</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        proc.status === 'running'
                          ? isTopOverload
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                          : 'bg-white/5 border-white/10 text-white/40'
                      }`}>
                        {proc.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {onExecuteKillProcess && (
                        <button
                          type="button"
                          onClick={() => onExecuteKillProcess(proc.pid, proc.name)}
                          disabled={!isAlertActive && !isOverloadStressTesting && proc.pid !== 2180}
                          className={`px-2 py-1 rounded text-[10px] font-mono font-bold inline-flex items-center gap-1 border transition-all cursor-pointer ${
                            isTopOverload
                              ? 'bg-rose-600 hover:bg-rose-500 border-rose-400 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white'
                          }`}
                          title={`Encerrar processo PID ${proc.pid} via SIGKILL (kill -9)`}
                        >
                          <Power className="w-2.5 h-2.5" />
                          <span>kill -9</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Incident Log History */}
      <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-[#F27D26]" />
              Histórico de Alertas de CPU (Logs Emitidos no Chat)
            </h3>
            <p className="text-xs text-white/50 font-mono">
              Registros de incidentes onde o uso de CPU excedeu 90% continuamente por mais de 5 segundos.
            </p>
          </div>
          <span className="text-[10px] font-mono text-white/60 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 w-fit">
            {alertHistory.length} Alerta(s) na Sessão
          </span>
        </div>

        {alertHistory.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-mono text-white/80 font-medium">
              Nenhum alerta crítico disparado até o momento.
            </p>
            <p className="text-[11px] font-mono text-white/40 mt-1 max-w-md mx-auto">
              O sistema permanece dentro dos parâmetros operacionais normais. Para testar o sistema de alerta, clique em &ldquo;Simular Sobrecarga Crítica (&gt; 90%)&rdquo; no painel do Watchdog.
            </p>
            {onToggleOverloadStressTest && (
              <button
                onClick={onToggleOverloadStressTest}
                className="mt-4 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#F27D26] cursor-pointer inline-flex items-center gap-1.5"
              >
                <Flame className="w-3 h-3" />
                Simular Sobrecarga Agora (5s para alerta)
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-[10px]">
                  <th className="py-2.5 px-3">Hora / ID</th>
                  <th className="py-2.5 px-3">Pico CPU</th>
                  <th className="py-2.5 px-3">Duração</th>
                  <th className="py-2.5 px-3">Núcleos vCPU</th>
                  <th className="py-2.5 px-3">Remediação (10s)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Log no Chat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {alertHistory.map((alert) => (
                  <tr key={alert.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 text-white font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          alert.status === 'active' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                        }`} />
                        <span>{alert.time}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">
                      {alert.cpuPercent.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-white/80">
                      {alert.durationSeconds}s (&gt; 5s)
                    </td>
                    <td className="py-2.5 px-3 text-white/60 text-[11px]">
                      {alert.coreBreakdown
                        ? `C1:${alert.coreBreakdown.core1}% C2:${alert.coreBreakdown.core2}% C3:${alert.coreBreakdown.core3}% C4:${alert.coreBreakdown.core4}%`
                        : 'Todos os 4 vCPUs'}
                    </td>
                    <td className="py-2.5 px-3">
                      {alert.killedProcess ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold flex items-center gap-1 w-fit">
                          <Power className="w-2.5 h-2.5" />
                          {alert.killedProcess.auto ? 'Auto-Kill' : 'Kill Manual'}: PID {alert.killedProcess.pid}
                        </span>
                      ) : alert.killActionStatus === 'suggested' ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1 w-fit">
                          <BellRing className="w-2.5 h-2.5" />
                          Sugestão Emitida (10s)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-white/40">
                          {alert.killPolicy === 'disabled' ? 'Sem Ação' : 'Aguardando 10s'}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        alert.status === 'active'
                          ? 'bg-rose-950/50 border-rose-500/50 text-rose-400 animate-pulse'
                          : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                      }`}>
                        {alert.status === 'active' ? '🚨 Ativo' : `Normalizado (${alert.resolvedAt || 'OK'})`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {onNavigateToChat && (
                        <button
                          onClick={onNavigateToChat}
                          className="text-[#F27D26] hover:underline text-xs font-mono inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver no Chat</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
