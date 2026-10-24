import React, { useEffect, useState } from 'react';
import {
  Settings,
  Key,
  Cpu,
  Image as ImageIcon,
  Server,
  Save,
  Check,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { LLMModel, CpuAlertKillPolicy } from '../types';
import {
  checkOllamaStatus,
  checkRouterStatus,
  type OllamaStatus,
  type RouterStatus,
} from '../lib/llm';

interface SettingsViewProps {
  llms: LLMModel[];
  selectedLLMId: string;
  onSelectLLM: (id: string) => void;
  cpuKillPolicy?: CpuAlertKillPolicy;
  onSetCpuKillPolicy?: (policy: CpuAlertKillPolicy) => void;
  temperature: number;
  onTemperatureChange: (value: number) => void;
  maxTokens: number;
  onMaxTokensChange: (value: number) => void;
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  llms,
  selectedLLMId,
  onSelectLLM,
  cpuKillPolicy = 'suggest',
  onSetCpuKillPolicy,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  systemPrompt,
  onSystemPromptChange,
}) => {
  const [enableHtmlImageLinks, setEnableHtmlImageLinks] = useState(true);
  const [enableCorsBypass, setEnableCorsBypass] = useState(true);
  const [autoPreviewSync, setAutoPreviewSync] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [routerStatus, setRouterStatus] = useState<RouterStatus | null>(null);
  const [probing, setProbing] = useState(false);

  const refreshProviders = async () => {
    setProbing(true);
    try {
      const [o, r] = await Promise.all([checkOllamaStatus(), checkRouterStatus()]);
      setOllamaStatus(o);
      setRouterStatus(r);
    } finally {
      setProbing(false);
    }
  };

  useEffect(() => {
    void refreshProviders();
  }, []);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 bg-[#131313] space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-[#444653]/30 pb-4">
        <div>
          <h2 className="font-headline font-bold text-2xl text-[#e5e2e1] tracking-tight flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#b8c4ff]" />
            Configurações do Nexus Terminal
          </h2>
          <p className="text-xs text-[#8e909f] font-mono mt-1">
            Provedores locais: 9Router (20128) + Ollama serve (11434). Sem Google Cloud.
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

      {/* Provedores locais */}
      <div className="p-6 bg-[#1c1b1b] border border-[#444653]/40 rounded-lg space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-headline font-semibold text-lg text-[#e5e2e1] flex items-center gap-2">
            <Server className="w-5 h-5 text-[#b8c4ff]" />
            Status dos Provedores Locais
          </h3>
          <button
            type="button"
            onClick={() => void refreshProviders()}
            disabled={probing}
            className="px-3 py-1.5 rounded-md border border-[#333] text-xs font-mono text-[#e5e2e1] hover:border-white/30 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${probing ? 'animate-spin' : ''}`} />
            Verificar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 bg-[#0e0e0e] border border-[#2a2a2a] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Ollama API</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  ollamaStatus?.ok
                    ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                    : 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                }`}
              >
                {ollamaStatus == null ? '...' : ollamaStatus.ok ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs font-mono text-[#b8c4ff]">http://127.0.0.1:11434</p>
            <p className="text-[11px] text-[#8e909f] font-mono">
              {ollamaStatus?.ok
                ? `${ollamaStatus.models.length} modelos · v${ollamaStatus.version ?? '?'}`
                : ollamaStatus?.error || 'Rode: npm run ollama:serve'}
            </p>
            {ollamaStatus?.ok && (
              <p className="text-[10px] text-[#8e909f] font-mono break-all">
                {ollamaStatus.models.slice(0, 6).join(' · ')}
                {ollamaStatus.models.length > 6 ? ' · …' : ''}
              </p>
            )}
          </div>

          <div className="p-4 bg-[#0e0e0e] border border-[#2a2a2a] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">9Router</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  routerStatus?.ok
                    ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                    : 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                }`}
              >
                {routerStatus == null ? '...' : routerStatus.ok ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs font-mono text-[#b8c4ff]">http://127.0.0.1:20128/v1</p>
            <p className="text-[11px] text-[#8e909f] font-mono">
              {routerStatus?.ok
                ? `${routerStatus.models.length} ids no catálogo`
                : routerStatus?.error || 'Suba com start-9router'}
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#0e0e0e] border border-[#2a2a2a] rounded text-xs font-mono text-[#8e909f] space-y-1">
          <p>
            <span className="text-[#b8c4ff]">npm run ollama:serve</span> — garante{' '}
            <code>ollama serve</code> + API em 127.0.0.1:11434
          </p>
          <p>
            Endpoints usados: <code className="text-[#b8c4ff]">POST /api/chat</code>,{' '}
            <code className="text-[#b8c4ff]">GET /api/tags</code> (docs oficiais Ollama)
          </p>
        </div>
      </div>

      {/* Imagens HTML */}
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

      {/* Parâmetros LLM */}
      <div className="p-6 bg-[#1c1b1b] border border-[#444653]/40 rounded-lg space-y-5">
        <h3 className="font-headline font-semibold text-lg text-[#e5e2e1] flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#b8c4ff]" />
          Parâmetros do Modelo de Linguagem
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {llms.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => onSelectLLM(model.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedLLMId === model.id
                  ? 'border-[#b8c4ff] bg-[#b8c4ff]/10'
                  : 'border-[#2a2a2a] bg-[#0e0e0e] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">{model.name}</span>
                {selectedLLMId === model.id && <Check className="w-4 h-4 text-[#b8c4ff]" />}
              </div>
              <p className="text-[10px] font-mono text-[#8e909f] mt-1">
                {model.provider} · {model.id}
              </p>
            </button>
          ))}
        </div>

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
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
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
              min="256"
              max="8192"
              step="256"
              value={maxTokens}
              onChange={(e) => onMaxTokensChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#0e0e0e] rounded-lg appearance-none cursor-pointer accent-[#b8c4ff]"
            />
            <div className="flex justify-between text-[10px] text-[#8e909f] font-mono mt-1">
              <span>256</span>
              <span>8k</span>
            </div>
          </div>
        </div>

        <div>
          <label className="font-mono text-xs font-semibold text-[#c4c5d5] block mb-2">
            System Prompt do Nexus Agent
          </label>
          <textarea
            rows={3}
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
            className="w-full bg-[#0e0e0e] border border-[#444653] rounded-lg p-3 text-xs font-mono text-[#e5e2e1] focus:border-[#b8c4ff] outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Watchdog CPU */}
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

      {/* Env / chaves */}
      <div className="p-6 bg-[#1c1b1b] border border-[#444653]/40 rounded-lg space-y-4">
        <h3 className="font-headline font-semibold text-lg text-[#e5e2e1] flex items-center gap-2">
          <Key className="w-5 h-5 text-[#b8c4ff]" />
          Variáveis de Ambiente (.env)
        </h3>
        <p className="text-xs text-[#8e909f]">
          Proxies do Vite: <code className="text-[#b8c4ff]">/api/ollama</code> → 11434 e{' '}
          <code className="text-[#b8c4ff]">/api/router</code> → 20128 (Bearer do 9Router só no servidor).
        </p>
        <div className="space-y-2">
          <div className="p-3 bg-[#0e0e0e] border border-[#2a2a2a] rounded text-xs font-mono text-[#b8c4ff] flex items-center justify-between gap-3">
            <span>OLLAMA_BASE_URL=http://127.0.0.1:11434</span>
            <span className="text-emerald-400 font-bold shrink-0">LOCAL</span>
          </div>
          <div className="p-3 bg-[#0e0e0e] border border-[#2a2a2a] rounded text-xs font-mono text-[#b8c4ff] flex items-center justify-between gap-3">
            <span>OLLAMA_MODEL=qwen2.5-coder:3b-instruct</span>
            <span className="text-emerald-400 font-bold shrink-0">PADRÃO</span>
          </div>
          <div className="p-3 bg-[#0e0e0e] border border-[#2a2a2a] rounded text-xs font-mono text-[#b8c4ff] flex items-center justify-between gap-3">
            <span>ROUTER_BASE_URL=http://127.0.0.1:20128/v1</span>
            <span className="text-emerald-400 font-bold shrink-0">LOCAL</span>
          </div>
          <div className="p-3 bg-[#0e0e0e] border border-[#2a2a2a] rounded text-xs font-mono text-[#b8c4ff] flex items-center justify-between gap-3">
            <span>ROUTER_API_KEY: lida do .env (nunca commitada)</span>
            <span className="text-emerald-400 font-bold shrink-0">CONFIGURADO</span>
          </div>
        </div>
      </div>
    </div>
  );
};
