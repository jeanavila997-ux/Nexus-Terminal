import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Cpu, 
  Image as ImageIcon, 
  Server, 
  Sliders, 
  Save, 
  Check, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { LLMModel, CpuAlertKillPolicy } from '../types';

interface SettingsViewProps {
  llms: LLMModel[];
  selectedLLMId: string;
  onSelectLLM: (id: string) => void;
  cpuKillPolicy?: CpuAlertKillPolicy;
  onSetCpuKillPolicy?: (policy: CpuAlertKillPolicy) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  llms,
  selectedLLMId,
  onSelectLLM,
  cpuKillPolicy = 'suggest',
  onSetCpuKillPolicy,
}) => {
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [enableHtmlImageLinks, setEnableHtmlImageLinks] = useState(true);
  const [enableCorsBypass, setEnableCorsBypass] = useState(true);
  const [autoPreviewSync, setAutoPreviewSync] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState(
    'Você é o Nexus Agent, um assistente técnico de desenvolvimento e orquestrador de contêineres com suporte a execução CLI e renderização direta de links de imagens no HTML.'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 bg-[#131313] space-y-8 max-w-5xl mx-auto">
      {/* Settings Header */}
      <div className="flex items-center justify-between border-b border-[#444653]/30 pb-4">
        <div>
          <h2 className="font-headline font-bold text-2xl text-[#e5e2e1] tracking-tight flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#b8c4ff]" />
            Configurações do Nexus Terminal
          </h2>
          <p className="text-xs text-[#8e909f] font-mono mt-1">
            Personalize modelos de LLM, comportamento de renderização de imagens HTML e permissões de agentes.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#1e40af] hover:bg-blue-600 text-white rounded-md text-xs font-mono font-medium flex items-center gap-2 shadow-md transition-all"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Configurações Salvas!' : 'Salvar Preferências'}</span>
        </button>
      </div>

      {/* 1. Suporte a Links Diretos de Imagens HTML (Requested Feature!) */}
      <div className="p-6 bg-[#1c1b1b] border border-[#444653]/40 rounded-lg space-y-4">
        <h3 className="font-headline font-semibold text-lg text-[#e5e2e1] flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#b8c4ff]" />
          Renderização e Links Diretos de Imagens HTML
        </h3>
        <p className="text-xs text-[#8e909f]">
          Controla como as tags <code>&lt;img src="..." /&gt;</code> e URLs diretas de imagens externas são tratadas no terminal, chat e preview de arquivos.
        </p>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3 bg-[#0e0e0e] border border-[#2a2a2a] rounded-lg cursor-pointer">
            <div>
              <span className="text-sm font-semibold text-[#e5e2e1] block">
                Habilitar renderização de links diretos de imagens HTML
              </span>
              <span className="text-xs text-[#8e909f] font-mono">
                Permite que o assistente e o preview exibam imagens diretas de URLs (Unsplash, CDNs, domínios autorizados).
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableHtmlImageLinks}
              onChange={(e) => setEnableHtmlImageLinks(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-[#1c1b1b] border-[#444653] focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-[#0e0e0e] border border-[#2a2a2a] rounded-lg cursor-pointer">
            <div>
              <span className="text-sm font-semibold text-[#e5e2e1] block">
                Sincronização automática com Workspace Preview
              </span>
              <span className="text-xs text-[#8e909f] font-mono">
                Atualiza o painel de preview do Workspace na barra lateral sempre que novas imagens forem adicionadas.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoPreviewSync}
              onChange={(e) => setAutoPreviewSync(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-[#1c1b1b] border-[#444653] focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-[#0e0e0e] border border-[#2a2a2a] rounded-lg cursor-pointer">
            <div>
              <span className="text-sm font-semibold text-[#e5e2e1] block">
                Tratamento de CORS e fallbacks visuais
              </span>
              <span className="text-xs text-[#8e909f] font-mono">
                Utiliza <code>referrerpolicy="no-referrer"</code> e manipuladores <code>onError</code> para garantir carregamento contínuo.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableCorsBypass}
              onChange={(e) => setEnableCorsBypass(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-[#1c1b1b] border-[#444653] focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* 2. Parâmetros de Inferência da LLM */}
      <div className="p-6 bg-[#1c1b1b] border border-[#444653]/40 rounded-lg space-y-5">
        <h3 className="font-headline font-semibold text-lg text-[#e5e2e1] flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#b8c4ff]" />
          Parâmetros do Modelo de Linguagem
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-[#c4c5d5]">Temperature (Criatividade vs Precisão)</span>
              <span className="text-[#b8c4ff] font-bold">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#0e0e0e] rounded-lg appearance-none cursor-pointer accent-[#b8c4ff]"
            />
            <div className="flex justify-between text-[10px] text-[#8e909f] font-mono mt-1">
              <span>0.0 (Determinístico)</span>
              <span>1.0 (Criativo)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-[#c4c5d5]">Max Tokens de Resposta</span>
              <span className="text-[#b8c4ff] font-bold">{maxTokens}</span>
            </div>
            <input
              type="range"
              min="1024"
              max="8192"
              step="512"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#0e0e0e] rounded-lg appearance-none cursor-pointer accent-[#b8c4ff]"
            />
            <div className="flex justify-between text-[10px] text-[#8e909f] font-mono mt-1">
              <span>1k</span>
              <span>8k</span>
            </div>
          </div>
        </div>

        {/* System Prompt Customization */}
        <div>
          <label className="font-mono text-xs font-semibold text-[#c4c5d5] block mb-2">
            System Prompt do Nexus Agent
          </label>
          <textarea
            rows={3}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-[#0e0e0e] border border-[#444653] rounded-lg p-3 text-xs font-mono text-[#e5e2e1] focus:border-[#b8c4ff] outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* 3. Watchdog de CPU & Política de Encerramento (Kill) */}
      <div className="p-6 bg-[#1c1b1b] border border-[#444653]/40 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-semibold text-lg text-[#e5e2e1] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#F27D26]" />
            Watchdog de Sobrecarga e Encerramento de Processos
          </h3>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#F27D26]">
            Tolerância: 10 Segundos
          </span>
        </div>
        <p className="text-xs text-[#8e909f] font-mono leading-relaxed">
          Configure a ação executada pelo Nexus Terminal quando o alerta de CPU (&gt; 90%) permanecer ativo continuamente por mais de 10 segundos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onSetCpuKillPolicy?.('suggest')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              cpuKillPolicy === 'suggest'
                ? 'bg-[#F27D26]/10 border-[#F27D26] shadow-[0_0_15px_rgba(242,125,38,0.2)]'
                : 'bg-[#0e0e0e] border-[#333] hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-white">Sugerir Encerramento</span>
              {cpuKillPolicy === 'suggest' && <Check className="w-4 h-4 text-[#F27D26]" />}
            </div>
            <p className="text-[11px] text-[#8e909f] font-mono">
              Emite um card interativo no chat e no painel para confirmação manual do operador com 1 clique (kill -9).
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSetCpuKillPolicy?.('auto_kill')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              cpuKillPolicy === 'auto_kill'
                ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-[#0e0e0e] border-[#333] hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-white">Auto-Kill Automático</span>
              {cpuKillPolicy === 'auto_kill' && <Check className="w-4 h-4 text-rose-400" />}
            </div>
            <p className="text-[11px] text-[#8e909f] font-mono">
              Executa kill -9 automaticamente no maior consumidor após 10s de alerta, restaurando a estabilidade.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSetCpuKillPolicy?.('disabled')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              cpuKillPolicy === 'disabled'
                ? 'bg-white/10 border-white text-white'
                : 'bg-[#0e0e0e] border-[#333] hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-white">Apenas Alerta (Sem Ação)</span>
              {cpuKillPolicy === 'disabled' && <Check className="w-4 h-4 text-white" />}
            </div>
            <p className="text-[11px] text-[#8e909f] font-mono">
              Mantém apenas os avisos visuais e logs contínuos sem sugerir ou executar encerramentos.
            </p>
          </button>
        </div>
      </div>

      {/* 4. API Keys & Segredos */}
      <div className="p-6 bg-[#1c1b1b] border border-[#444653]/40 rounded-lg space-y-4">
        <h3 className="font-headline font-semibold text-lg text-[#e5e2e1] flex items-center gap-2">
          <Key className="w-5 h-5 text-[#b8c4ff]" />
          Gerenciamento de Chaves de API
        </h3>
        <p className="text-xs text-[#8e909f]">
          As chaves do Gemini e outros provedores são gerenciadas com segurança pelo ambiente Cloud Run do AI Studio.
        </p>
        <div className="p-3 bg-[#0e0e0e] border border-[#2a2a2a] rounded text-xs font-mono text-[#b8c4ff] flex items-center justify-between">
          <span>GEMINI_API_KEY: Injetado dinamicamente via variáveis de ambiente</span>
          <span className="text-emerald-400 font-bold">CONFIGURADO</span>
        </div>
      </div>
    </div>
  );
};
