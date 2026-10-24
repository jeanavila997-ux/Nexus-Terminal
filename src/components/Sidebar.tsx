import React from 'react';
import { 
  Terminal, 
  MessageSquare, 
  BarChart3, 
  FolderOpen, 
  FileText, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut,
  Hash,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { Channel, ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (channelId: string) => void;
  onNewChat: () => void;
  onOpenSupport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  channels,
  activeChannelId,
  onSelectChannel,
  onNewChat,
  onOpenSupport,
}) => {
  return (
    <aside className="w-72 border-r border-white/10 flex flex-col h-full bg-[#080808] fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="p-8 pb-5">
        <h1 className="text-2xl font-serif italic font-light tracking-tight text-white flex items-center gap-2">
          Nexus<span className="text-[#F27D26] not-italic">.</span>Terminal
        </h1>
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold mt-1">
          Agentic Workspace v2.4
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-5 space-y-1.5 overflow-y-auto">
        {/* Canais Section Header / Button */}
        <div
          onClick={() => onSelectView('chat')}
          className={`px-4 py-3 rounded-lg border transition-all cursor-pointer ${
            currentView === 'chat'
              ? 'bg-white/5 border-white/10'
              : 'border-transparent hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <p
              className={`text-xs uppercase tracking-widest font-semibold mb-0.5 ${
                currentView === 'chat' ? 'text-[#F27D26]' : 'text-white/40'
              }`}
            >
              Dashboard
            </p>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#F27D26] border border-white/10">
              {channels.reduce((acc, c) => acc + (c.unreadCount || 0), 0) || 2}
            </span>
          </div>
          <p className="text-sm font-medium text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-white/70" />
            Canais de Comunicação
          </p>
        </div>

        {/* Channels sub-list */}
        <div className="pl-6 space-y-1 py-1 border-l border-white/10 ml-5 my-1">
          {channels.map((channel) => {
            const isActive = currentView === 'chat' && activeChannelId === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => {
                  onSelectView('chat');
                  onSelectChannel(channel.id);
                }}
                className={`w-full text-left text-xs py-1.5 px-3 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold bg-white/5 border border-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="truncate"># {channel.name}</span>
                {channel.unreadCount ? (
                  <span className="text-[9px] font-mono bg-[#F27D26]/20 text-[#F27D26] px-1.5 py-0.2 rounded-full">
                    {channel.unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Métricas & Monitor */}
        <div className="space-y-1">
          <div
            onClick={() => onSelectView('status')}
            className={`px-4 py-2.5 rounded-lg border transition-all cursor-pointer ${
              currentView === 'status'
                ? 'bg-white/5 border-white/10'
                : 'border-transparent hover:bg-white/5'
            }`}
          >
            <p
              className={`text-xs uppercase tracking-widest font-semibold mb-0.5 ${
                currentView === 'status' || currentView === 'monitor' ? 'text-[#F27D26]' : 'text-white/40'
              }`}
            >
              Métricas
            </p>
            <p className="text-sm text-white/90 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-white/70" />
              Estado Geral
            </p>
          </div>

          <div
            onClick={() => onSelectView('monitor')}
            className={`px-4 py-2 ml-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
              currentView === 'monitor'
                ? 'bg-white/5 border-white/10 text-white font-medium'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <p className="text-xs flex items-center gap-2 font-mono">
              <Activity className="w-3.5 h-3.5 text-[#F27D26]" />
              Monitor de Recursos
            </p>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>

        {/* Arquivos */}
        <div
          onClick={() => onSelectView('files')}
          className={`px-4 py-3 rounded-lg border transition-all cursor-pointer ${
            currentView === 'files'
              ? 'bg-white/5 border-white/10'
              : 'border-transparent hover:bg-white/5'
          }`}
        >
          <p
            className={`text-xs uppercase tracking-widest font-semibold mb-0.5 ${
              currentView === 'files' ? 'text-[#F27D26]' : 'text-white/40'
            }`}
          >
            Assets
          </p>
          <p className="text-sm text-white/90 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-white/70" />
            Arquivos & HTML
          </p>
        </div>

        {/* Logs */}
        <div
          onClick={() => onSelectView('logs')}
          className={`px-4 py-3 rounded-lg border transition-all cursor-pointer ${
            currentView === 'logs'
              ? 'bg-white/5 border-white/10'
              : 'border-transparent hover:bg-white/5'
          }`}
        >
          <p
            className={`text-xs uppercase tracking-widest font-semibold mb-0.5 ${
              currentView === 'logs' ? 'text-[#F27D26]' : 'text-white/40'
            }`}
          >
            Runtime
          </p>
          <p className="text-sm text-white/90 flex items-center gap-2">
            <FileText className="w-4 h-4 text-white/70" />
            Logs do Sistema
          </p>
        </div>

        {/* Configurações */}
        <div
          onClick={() => onSelectView('settings')}
          className={`px-4 py-3 rounded-lg border transition-all cursor-pointer ${
            currentView === 'settings'
              ? 'bg-white/5 border-white/10'
              : 'border-transparent hover:bg-white/5'
          }`}
        >
          <p
            className={`text-xs uppercase tracking-widest font-semibold mb-0.5 ${
              currentView === 'settings' ? 'text-[#F27D26]' : 'text-white/40'
            }`}
          >
            Preferências
          </p>
          <p className="text-sm text-white/90 flex items-center gap-2">
            <Settings className="w-4 h-4 text-white/70" />
            Configurações
          </p>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-6 border-t border-white/10 space-y-3 bg-[#060606]">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full text-xs uppercase tracking-widest font-semibold flex justify-center items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#F27D26]" />
          Novo Chat
        </button>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F27D26] to-[#ff9d5c] flex items-center justify-center text-black font-bold text-xs">
              AS
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Alexandre Silva</p>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter font-mono">Lead Developer</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSupport}
              title="Ajuda e Suporte"
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert('Sessão encerrada com segurança no Nexus Terminal.')}
              title="Encerrar Sessão"
              className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
