import React, { useState } from 'react';
import { 
  Cpu, 
  Users, 
  Search, 
  Code, 
  Compass, 
  Database, 
  Shield, 
  Server, 
  Wrench, 
  BookOpen, 
  Play, 
  Image as ImageIcon,
  ExternalLink,
  Check,
  Maximize2,
  Copy
} from 'lucide-react';
import { Agent, CommandItem, LLMModel, MCPServer, SkillTool } from '../types';

interface RightSidebarProps {
  llms: LLMModel[];
  selectedLLMId: string;
  onSelectLLM: (id: string) => void;
  agents: Agent[];
  activeAgentId: string;
  onSelectAgent: (id: string) => void;
  mcpServers: MCPServer[];
  skills: SkillTool[];
  commands: CommandItem[];
  onRunCommand: (command: CommandItem) => void;
  onSelectSkill: (skill: SkillTool) => void;
  onOpenImageModal: () => void;
  previewImageUrl?: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  llms,
  selectedLLMId,
  onSelectLLM,
  agents,
  activeAgentId,
  onSelectAgent,
  mcpServers,
  skills,
  commands,
  onRunCommand,
  onSelectSkill,
  onOpenImageModal,
  previewImageUrl = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80',
}) => {
  const [agentFilter, setAgentFilter] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(agentFilter.toLowerCase()) ||
      a.description.toLowerCase().includes(agentFilter.toLowerCase())
  );

  const handleCopyDirectImageLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-4 h-4 text-[#F27D26]" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-white/70" />;
      case 'Database':
        return <Database className="w-4 h-4 text-white/70" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-white/70" />;
      default:
        return <Code className="w-4 h-4 text-[#F27D26]" />;
    }
  };

  return (
    <aside className="w-[320px] bg-[#080808] border-l border-white/10 flex flex-col z-30 shrink-0 h-full overflow-y-auto">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-white/10 sticky top-0 bg-[#080808]/95 backdrop-blur-xl z-10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-white uppercase tracking-widest">
            Painel de Controle
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-[#F27D26] font-mono mt-0.5">
            Contexto & Configurações
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. LLM Selection */}
        <section className="bg-[#111111] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest text-white/60 font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#F27D26]" />
              LLM da Sessão
            </h3>
          </div>

          <div className="space-y-2">
            {llms.map((model) => {
              const isSelected = selectedLLMId === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => onSelectLLM(model.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#F27D26]/40 bg-[#F27D26]/10 text-white'
                      : 'border-white/5 bg-[#0a0a0a] hover:bg-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-full transition-all ${
                        isSelected
                          ? 'bg-[#F27D26] shadow-[0_0_8px_rgba(242,125,38,0.8)]'
                          : 'bg-white/20'
                      }`}
                    />
                    <span className="text-xs font-medium tracking-wide">
                      {model.name}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase text-white/40">
                    {model.provider}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Available Agents */}
        <section className="bg-[#111111] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest text-white/60 font-mono flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#F27D26]" />
              Agentes Disponíveis
            </h3>
          </div>

          {/* Search Filter */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              placeholder="Filtrar agentes..."
              className="w-full bg-[#080808] border border-white/10 text-white text-xs py-1.5 pl-8 pr-3 rounded-lg focus:border-[#F27D26] focus:outline-none placeholder:text-white/30 transition-all font-mono"
            />
          </div>

          {/* Agent Cards */}
          <div className="space-y-2">
            {filteredAgents.map((agent) => {
              const isActive = activeAgentId === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => onSelectAgent(agent.id)}
                  className={`p-3 rounded-xl transition-all cursor-pointer border ${
                    isActive
                      ? 'border-[#F27D26]/40 bg-[#F27D26]/10'
                      : 'border-white/5 bg-[#0a0a0a] hover:bg-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold flex items-center gap-2 text-white">
                      {getAgentIcon(agent.icon)}
                      {agent.name}
                    </span>

                    {isActive && (
                      <span className="text-[9px] font-mono font-bold bg-[#F27D26]/20 text-[#F27D26] px-2 py-0.5 rounded-full border border-[#F27D26]/30 uppercase tracking-wider">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/60 leading-tight">
                    {agent.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. MCP Servers */}
        <section className="bg-[#111111] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest text-white/60 font-mono flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#F27D26]" />
              Servidores MCP
            </h3>
          </div>

          <div className="space-y-2">
            {mcpServers.map((server) => (
              <div
                key={server.id}
                className="flex items-center justify-between p-2.5 bg-[#0a0a0a] rounded-xl border border-white/5 hover:border-white/15 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/90 font-medium">
                    {server.name}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    ({server.latency})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      server.status === 'online'
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                        : server.status === 'busy'
                        ? 'bg-[#F27D26] shadow-[0_0_6px_rgba(242,125,38,0.8)]'
                        : 'bg-zinc-600'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Skills & Tools */}
        <section className="bg-[#111111] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest text-white/60 font-mono flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#F27D26]" />
              Skills & Ferramentas
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {skills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => onSelectSkill(skill)}
                title={`${skill.name} - ${skill.description}`}
                className="px-2.5 py-2 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer text-center font-mono text-[11px] text-white/80 truncate"
              >
                {skill.name}
              </button>
            ))}
          </div>
        </section>

        {/* 5. Command Library */}
        <section className="bg-[#111111] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest text-white/60 font-mono flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#F27D26]" />
              Comandos Rápidos
            </h3>
          </div>

          <div className="space-y-1.5">
            {commands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => onRunCommand(cmd)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all rounded-xl group text-left cursor-pointer"
              >
                <div className="truncate mr-2">
                  <span className="text-xs text-white/90 group-hover:text-white block font-medium">
                    {cmd.title}
                  </span>
                  <span className="font-mono text-[10px] text-white/40 truncate block">
                    {cmd.command}
                  </span>
                </div>
                <Play className="w-3.5 h-3.5 text-[#F27D26] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* 6. Workspace Preview & HTML Image Direct Link */}
        <section className="bg-[#111111] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-widest text-white/60 font-mono flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#F27D26]" />
              Preview HTML & Imagens
            </div>
            <button
              onClick={onOpenImageModal}
              className="text-[10px] text-[#F27D26] hover:underline font-mono uppercase tracking-wider"
            >
              Adicionar
            </button>
          </div>

          <div className="aspect-video w-full bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden relative group shadow-sm">
            <img
              src={previewImageUrl}
              alt="Workspace direct HTML link preview"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 cursor-pointer"
              onClick={onOpenImageModal}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex items-end justify-between">
              <span className="text-[10px] font-mono text-white/90 bg-black/80 px-2 py-0.5 rounded-full border border-white/10">
                &lt;img src="..." /&gt;
              </span>
              <button
                onClick={() => handleCopyDirectImageLink(previewImageUrl)}
                className="p-1 bg-[#F27D26] hover:bg-[#ff9d5c] rounded-full text-black font-semibold text-xs flex items-center gap-1 px-2.5 shadow-md"
                title="Copiar URL direta da imagem"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span className="text-[10px]">Copiar</span>
              </button>
            </div>
          </div>
          <p className="text-[10px] text-white/40 font-mono mt-2 text-center">
            Renderiza tags <code>&lt;img src="..." /&gt;</code> nativamente
          </p>
        </section>
      </div>
    </aside>
  );
};
