import React, { useState } from 'react';
import { 
  Bell, 
  History, 
  Network, 
  User, 
  Terminal, 
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  activeChannelName: string;
  onOpenImageModal: () => void;
  onOpenTerminalModal: () => void;
  onSelectView: (view: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  activeChannelName,
  onOpenImageModal,
  onOpenTerminalModal,
  onSelectView,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTopology, setShowTopology] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: '1', title: 'Node Runner conectado', time: 'Há 2 min', type: 'success' },
    { id: '2', title: 'Link direto de imagem HTML validado (200 OK)', time: 'Há 5 min', type: 'info' },
    { id: '3', title: 'DevAgent executou script "server.js"', time: 'Há 12 min', type: 'action' },
  ];

  const sessionHistory = [
    { id: 's1', name: 'Setup Express & HTML Image Links', date: 'Hoje, 10:45 AM', status: 'Ativo' },
    { id: 's2', name: 'Auditoria de Segurança & npm audit', date: 'Hoje, 09:12 AM', status: 'Concluído' },
    { id: 's3', name: 'Configuração MCP Local FS & Postgres', date: 'Ontem, 16:30 PM', status: 'Arquivado' },
  ];

  return (
    <header className="glass-panel border-b border-white/10 flex justify-between items-center h-20 w-full px-8 fixed top-0 left-0 z-30 lg:left-[280px] lg:w-[calc(100%-280px)] bg-[#060606]/90 backdrop-blur-xl">
      {/* Title & View / Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-light tracking-tight text-white">
            Interface <span className="font-serif italic font-normal text-[#F27D26]">Console</span>
          </h2>
          <span className="hidden sm:inline-block text-white/20">/</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/90 text-xs uppercase tracking-widest font-mono">
            {currentView === 'chat'
              ? `# ${activeChannelName}`
              : currentView === 'monitor'
              ? 'Monitor de Recursos'
              : currentView === 'status'
              ? 'Estado Geral'
              : currentView}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-widest text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 px-3 py-1 rounded-full font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Online &bull; 4 MCPs</span>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex items-center gap-3">
        {/* Direct Image Link Quick Tool */}
        <button
          onClick={onOpenImageModal}
          title="Adicionar link direto para imagem HTML"
          className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-full text-xs uppercase tracking-widest text-white/90 transition-all cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#F27D26]" />
          <span className="hidden sm:inline">Imagem HTML</span>
        </button>

        {/* Quick Terminal Runner */}
        <button
          onClick={onOpenTerminalModal}
          title="Abrir Terminal Interativo"
          className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-black" />
          <span className="hidden sm:inline">Terminal CLI</span>
        </button>

        <div className="h-5 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowHistory(false);
              setShowTopology(false);
              setShowProfile(false);
            }}
            aria-label="Notificações"
            className="text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-all p-2 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F27D26] rounded-full shadow-[0_0_8px_rgba(242,125,38,0.8)]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs uppercase tracking-widest text-white/60 font-mono">Notificações</span>
                <button onClick={() => setShowNotifications(false)} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 mt-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-[#111111] border border-white/5 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#F27D26] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white/90">{n.title}</p>
                      <span className="text-[10px] text-white/40 font-mono">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="relative">
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              setShowNotifications(false);
              setShowTopology(false);
              setShowProfile(false);
            }}
            aria-label="Histórico de Sessões"
            className="text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-all p-2"
          >
            <History className="w-4 h-4" />
          </button>

          {showHistory && (
            <div className="absolute right-0 mt-3 w-84 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs uppercase tracking-widest text-white/60 font-mono">Histórico de Sessões</span>
                <button onClick={() => setShowHistory(false)} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 mt-3">
                {sessionHistory.map((s) => (
                  <div 
                    key={s.id} 
                    onClick={() => {
                      onSelectView('chat');
                      setShowHistory(false);
                    }}
                    className="p-3 bg-[#111111] hover:bg-[#181818] border border-white/5 hover:border-white/15 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white/90">{s.name}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#F27D26] border border-white/10">
                        {s.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono mt-1 block">{s.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MCP / Architecture Topology */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTopology(!showTopology);
              setShowNotifications(false);
              setShowHistory(false);
              setShowProfile(false);
            }}
            aria-label="Topologia de Agentes e MCP"
            className="text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-all p-2"
          >
            <Network className="w-4 h-4" />
          </button>

          {showTopology && (
            <div className="absolute right-0 mt-3 w-80 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs uppercase tracking-widest text-white/60 font-mono">Topologia Hub</span>
                <button onClick={() => setShowTopology(false)} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 mt-3 text-xs">
                <div className="p-3 bg-[#111111] border border-white/5 rounded-xl">
                  <div className="flex items-center justify-between text-white/90 font-mono">
                    <span className="font-semibold">DevAgent (Principal)</span>
                    <span className="text-[#F27D26] text-[10px] uppercase tracking-wider">ATIVO</span>
                  </div>
                  <p className="text-white/40 text-[11px] mt-1">Conectado a 4 Servidores MCP e porta 3000</p>
                </div>
                <div className="p-3 bg-[#111111] border border-white/5 rounded-xl">
                  <div className="flex items-center justify-between text-white/90 font-mono">
                    <span>Protocolo MCP</span>
                    <span className="text-white/50 text-[10px]">JSON-RPC 2.0</span>
                  </div>
                  <p className="text-white/40 text-[11px] mt-1">Local FS &bull; Web Search &bull; Node Runner &bull; PostgreSQL</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Pill */}
        <div className="relative">
          <div
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
              setShowHistory(false);
              setShowTopology(false);
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F27D26] to-[#ff9d5c] flex items-center justify-center overflow-hidden shadow-md cursor-pointer hover:opacity-90 transition-opacity border border-white/20"
          >
            <User className="w-4 h-4 text-black" />
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-64 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#F27D26] to-[#ff9d5c] flex items-center justify-center text-black font-bold text-xs">
                  NT
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Alexandre Silva</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-mono">Lead Developer</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs">
                <button
                  onClick={() => {
                    onSelectView('settings');
                    setShowProfile(false);
                  }}
                  className="w-full text-left p-2 hover:bg-white/5 text-white/70 hover:text-white rounded-lg transition-colors"
                >
                  Configurações & API Keys
                </button>
                <button
                  onClick={() => {
                    onSelectView('status');
                    setShowProfile(false);
                  }}
                  className="w-full text-left p-2 hover:bg-white/5 text-white/70 hover:text-white rounded-lg transition-colors"
                >
                  Métricas de Uso e Tokens
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
