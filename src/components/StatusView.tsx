import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Cpu, 
  HardDrive, 
  Activity, 
  Server, 
  CheckCircle2, 
  Zap, 
  Clock, 
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MCPServer, Agent, CpuAlert, CpuAlertKillPolicy } from '../types';
import { ResourceMonitorView } from './ResourceMonitorView';

interface StatusViewProps {
  mcpServers: MCPServer[];
  agents: Agent[];
  activeAgentId: string;
  initialTab?: 'overview' | 'monitor';
  onTabChange?: (tab: 'overview' | 'monitor') => void;
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

export const StatusView: React.FC<StatusViewProps> = ({
  mcpServers,
  agents,
  activeAgentId,
  initialTab = 'overview',
  onTabChange,
  onNavigateToChat,
  isOverloadStressTesting,
  onToggleOverloadStressTest,
  overloadCountdown,
  consecutiveHighCpuSeconds,
  isAlertActive,
  activeAlertData,
  alertHistory,
  cpuKillPolicy,
  onSetCpuKillPolicy,
  alertActiveSeconds,
  onExecuteKillProcess,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'monitor'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSelect = (tab: 'overview' | 'monitor') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col bg-[#050505]">
      {/* Sub-Navigation Tabs Bar */}
      <div className="px-6 sm:px-8 pt-4 pb-0 bg-[#080808] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabSelect('overview')}
            className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#F27D26] text-white font-bold'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Visão Geral do Sistema
          </button>
          <button
            onClick={() => handleTabSelect('monitor')}
            className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'monitor'
                ? 'border-[#F27D26] text-white font-bold'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isAlertActive ? 'text-rose-400' : 'text-[#F27D26]'}`} />
            Monitor de Recursos (Tempo Real)
            {isAlertActive ? (
              <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                ALERTA CPU
              </span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 pb-3">
          {isAlertActive ? (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-rose-400 bg-rose-950/40 border border-rose-500/40 px-3 py-1 rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Alerta Crítico: CPU &gt; 90%
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              99.98% Uptime &bull; Saudável
            </span>
          )}
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'monitor' ? (
        <ResourceMonitorView 
          onBackToOverview={() => handleTabSelect('overview')}
          onNavigateToChat={onNavigateToChat}
          isOverloadStressTesting={isOverloadStressTesting}
          onToggleOverloadStressTest={onToggleOverloadStressTest}
          overloadCountdown={overloadCountdown}
          consecutiveHighCpuSeconds={consecutiveHighCpuSeconds}
          isAlertActive={isAlertActive}
          activeAlertData={activeAlertData}
          alertHistory={alertHistory}
          cpuKillPolicy={cpuKillPolicy}
          onSetCpuKillPolicy={onSetCpuKillPolicy}
          alertActiveSeconds={alertActiveSeconds}
          onExecuteKillProcess={onExecuteKillProcess}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-[#050505]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Estado Geral do Sistema
              </h2>
              <p className="text-xs text-white/50 font-mono mt-1">
                Métricas de execução, recursos do contêiner e conectividade MCP em tempo real.
              </p>
            </div>

            <button
              onClick={() => handleTabSelect('monitor')}
              className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer w-fit"
            >
              <Activity className="w-3.5 h-3.5 text-[#F27D26]" />
              Abrir Monitor de Recursos
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CPU Card */}
            <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-white/50 mb-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider">Uso de CPU</span>
                  <Cpu className="w-4 h-4 text-[#F27D26]" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">14.2%</div>
                <div className="w-full bg-white/5 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-[#F27D26] h-full rounded-full" style={{ width: '14.2%' }} />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/40">4 vCPUs alocadas</span>
                <button
                  onClick={() => handleTabSelect('monitor')}
                  className="text-[#F27D26] hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  Gráfico &rarr;
                </button>
              </div>
            </div>

            {/* RAM Card */}
            <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-white/50 mb-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider">Memória RAM</span>
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">
                  428 MB <span className="text-xs font-normal text-white/40">/ 2048 MB</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '21%' }} />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/40">Heap alocado de forma segura</span>
                <button
                  onClick={() => handleTabSelect('monitor')}
                  className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  Gráfico &rarr;
                </button>
              </div>
            </div>

            {/* MCP Latency Card */}
            <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-white/50 mb-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider">Latência dos MCPs</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">18 ms</div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono mt-3">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>4 servidores conectados</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-white/40 font-mono">
                Local FS, Search, Node, DB
              </div>
            </div>

            {/* HTML Image Links Card */}
            <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-white/50 mb-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider">Links de Imagens HTML</span>
                  <Activity className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">100% OK</div>
                <div className="flex items-center gap-1.5 text-[10px] text-sky-400 font-mono mt-3">
                  <span>CORS Habilitado &bull; CDN Ativa</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-white/40 font-mono">
                Tags &lt;img&gt; renderizando
              </div>
            </div>
          </div>

          {/* MCP Servers Deep Dive */}
          <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl space-y-4 shadow-xl">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-[#F27D26]" />
              Servidores Model Context Protocol (MCP) Ativos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mcpServers.map((server) => (
                <div key={server.id} className="p-4 bg-[#050505] border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                      <span className="font-bold text-xs text-white">{server.name}</span>
                    </div>
                    <span className="font-mono text-[10px] bg-white/5 text-white/80 border border-white/10 px-2 py-0.5 rounded-full">
                      {server.latency}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 font-mono">{server.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-white/60 pt-2 border-t border-white/5">
                    <span>{server.toolsCount} ferramentas registradas</span>
                    <span className="text-emerald-400">STATUS: PRONTO</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Agents Fleet */}
          <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl space-y-4 shadow-xl">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F27D26]" />
              Frota de Agentes de IA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-4 rounded-xl border transition-all ${
                    agent.id === activeAgentId
                      ? 'border-[#F27D26] bg-[#F27D26]/5'
                      : 'border-white/10 bg-[#050505]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-white">{agent.name}</span>
                    {agent.id === activeAgentId ? (
                      <span className="text-[9px] font-mono font-bold bg-[#F27D26] text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        EM EXECUÇÃO
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        STANDBY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 font-mono">{agent.role}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {agent.capabilities.map((cap, cIdx) => (
                      <span key={cIdx} className="text-[9px] font-mono bg-white/5 text-white/70 px-1.5 py-0.5 rounded border border-white/10">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
