import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  Code, 
  Copy, 
  Check, 
  Terminal as TerminalIcon, 
  PlusCircle, 
  Send, 
  Image as ImageIcon,
  ExternalLink,
  Play,
  RotateCcw,
  Zap,
  Layers,
  ChevronRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Power
} from 'lucide-react';
import { Message, Channel } from '../types';

interface ChatViewProps {
  channel: Channel;
  onSendMessage: (text: string, imageLink?: string) => void;
  onOpenImageModal: () => void;
  onRunTerminalCommand: (cmd: string) => void;
  activeAgentName: string;
  onNavigateToMonitor?: () => void;
  onExecuteKillProcess?: (pid: number, processName: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  channel,
  onSendMessage,
  onOpenImageModal,
  onRunTerminalCommand,
  activeAgentName,
  onNavigateToMonitor,
  onExecuteKillProcess,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [quickImageInput, setQuickImageInput] = useState('');
  const [showQuickImagePrompt, setShowQuickImagePrompt] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channel.messages]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleSend = () => {
    if (!inputText.trim() && !quickImageInput.trim()) return;
    onSendMessage(inputText, quickImageInput ? quickImageInput : undefined);
    setInputText('');
    setQuickImageInput('');
    setShowQuickImagePrompt(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Syntax highlighter helper for code snippets
  const renderHighlightedCode = (code: string, language: string) => {
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      let formatted = line;
      const parts = line.split(/(['"`].*?['"`])/g);
      return (
        <div key={idx} className="table-row">
          <span className="table-cell pr-4 text-white/30 select-none text-right text-xs font-mono">
            {idx + 1}
          </span>
          <span className="table-cell font-mono">
            {parts.map((part, pIdx) => {
              if (part.startsWith("'") || part.startsWith('"') || part.startsWith('`')) {
                return (
                  <span key={pIdx} className="text-[#ff9d5c]">
                    {part}
                  </span>
                );
              }
              if (
                part.includes('const ') ||
                part.includes('let ') ||
                part.includes('var ') ||
                part.includes('import ') ||
                part.includes('export ')
              ) {
                const words = part.split(/\b/);
                return (
                  <span key={pIdx}>
                    {words.map((w, wIdx) => {
                      if (['const', 'let', 'var', 'import', 'from', 'export', 'default', 'return', 'function', 'class'].includes(w)) {
                        return <span key={wIdx} className="text-[#F27D26] font-semibold">{w}</span>;
                      }
                      if (['require', 'listen', 'get', 'post', 'send', 'json', 'log'].includes(w)) {
                        return <span key={wIdx} className="text-white font-medium">{w}</span>;
                      }
                      if (!isNaN(Number(w)) && w.trim() !== '') {
                        return <span key={wIdx} className="text-amber-300">{w}</span>;
                      }
                      return <span key={wIdx}>{w}</span>;
                    })}
                  </span>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-[#050505] min-w-0 overflow-hidden">
      {/* Channel Topic Banner */}
      <div className="px-8 py-3 bg-[#080808] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-white/80">
          <span className="font-mono font-bold text-[#F27D26]">#{channel.name}</span>
          <span className="text-white/20">&bull;</span>
          <span className="truncate text-white/60">{channel.description}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Agente Ativo:</span>
          <span className="text-[11px] font-mono text-white bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F27D26]"></span>
            {activeAgentName}
          </span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {channel.messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="flex gap-4 group">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white/60" />
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs uppercase tracking-widest font-semibold text-white/80">
                      {msg.sender}
                    </span>
                    <span className="font-mono text-[10px] text-white/40">
                      {msg.time}
                    </span>
                  </div>
                  <div className="bg-[#0c0c0c] border border-white/10 p-5 rounded-2xl rounded-tl-none text-white/80 shadow-md text-sm leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          }

          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex gap-4 flex-row-reverse group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F27D26] to-[#ff9d5c] shrink-0 flex items-center justify-center overflow-hidden shadow-md">
                  <UserIcon className="w-4 h-4 text-black" />
                </div>
                <div className="flex-1 space-y-2 flex flex-col items-end min-w-0">
                  <div className="flex items-baseline gap-2 flex-row-reverse">
                    <span className="text-xs uppercase tracking-widest font-semibold text-white/90">
                      {msg.sender}
                    </span>
                    <span className="font-mono text-[10px] text-white/40">
                      {msg.time}
                    </span>
                  </div>
                  <div className="bg-[#141414] border border-white/10 p-5 rounded-2xl rounded-tr-none text-white text-right shadow-lg text-sm leading-relaxed max-w-2xl">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          }

          if (msg.role === 'terminal') {
            const isAlert = msg.actionBadge?.includes('ALERTA') || msg.terminalOutput?.isError;
            const isResolved = msg.actionBadge?.includes('NORMALIZADO');
            return (
              <div key={msg.id} className="flex gap-4 group">
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-lg ${
                    isAlert
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse'
                      : isResolved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  {isAlert ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : isResolved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <TerminalIcon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className={`text-xs uppercase tracking-widest font-bold ${
                      isAlert ? 'text-rose-400' : isResolved ? 'text-emerald-400' : 'text-white/90'
                    }`}>
                      {msg.sender}
                    </span>
                    <span className="font-mono text-[10px] text-white/40">
                      {msg.time}
                    </span>
                    {msg.actionBadge && (
                      <span className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                        isAlert
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                          : isResolved
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          : 'bg-white/5 border-white/10 text-white/70'
                      }`}>
                        {msg.actionBadge}
                      </span>
                    )}
                    {onNavigateToMonitor && (
                      <button
                        onClick={onNavigateToMonitor}
                        className="ml-auto text-xs font-mono text-[#F27D26] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Ver no Monitor de Recursos</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className={`p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed border ${
                    isAlert
                      ? 'bg-rose-950/20 border-rose-500/30 text-white/90'
                      : isResolved
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-white/90'
                      : 'bg-[#0a0a0a] border-white/10 text-white/80'
                  }`}>
                    {msg.content}
                  </div>

                  {msg.killAction && (
                    <div className={`p-4 rounded-2xl border transition-all ${
                      msg.killAction.executed
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-gradient-to-r from-rose-950/70 to-rose-900/30 border-rose-500/60 text-white shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            msg.killAction.executed
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                          }`}>
                            {msg.killAction.executed ? <CheckCircle2 className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold tracking-wide">
                                {msg.killAction.executed 
                                  ? 'PROCESSO ENCERRADO VIA SIGKILL' 
                                  : 'SUGESTÃO DE ENCERRAMENTO (10s DE ALERTA)'}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                msg.killAction.executed
                                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                                  : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                              }`}>
                                PID {msg.killAction.pid}
                              </span>
                            </div>
                            <p className="text-xs text-white/80 font-mono mt-1">
                              Processo: <strong>{msg.killAction.processName}</strong> ({msg.killAction.cpu}% CPU)
                              {msg.killAction.executed && (
                                <span className="text-emerald-400 block sm:inline sm:ml-2">
                                  ✓ Finalizado {msg.killAction.autoTriggered ? 'automaticamente pelo daemon' : 'manualmente pelo operador'}.
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {!msg.killAction.executed && onExecuteKillProcess && (
                          <button
                            onClick={() => onExecuteKillProcess(msg.killAction!.pid, msg.killAction!.processName)}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-rose-600/50 transition-all cursor-pointer shrink-0"
                            title={`Encerrar processo ${msg.killAction.processName} (PID ${msg.killAction.pid})`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>kill -9 {msg.killAction.pid}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {msg.terminalOutput && (
                    <div className={`border rounded-2xl overflow-hidden shadow-2xl ${
                      isAlert
                        ? 'border-rose-500/30 bg-[#080202]'
                        : isResolved
                        ? 'border-emerald-500/30 bg-[#020804]'
                        : 'border-white/10 bg-[#040404]'
                    }`}>
                      <div className={`flex items-center justify-between px-4 py-2 border-b text-xs font-mono ${
                        isAlert
                          ? 'border-rose-500/20 bg-rose-950/40 text-rose-300'
                          : isResolved
                          ? 'border-emerald-500/20 bg-emerald-950/40 text-emerald-300'
                          : 'border-white/10 bg-[#080808] text-white/80'
                      }`}>
                        <div className="flex items-center gap-2">
                          <TerminalIcon className="w-3.5 h-3.5" />
                          <span className="font-semibold tracking-wide truncate max-w-md">
                            {msg.terminalOutput.command}
                          </span>
                        </div>
                        {onNavigateToMonitor && (
                          <button
                            onClick={onNavigateToMonitor}
                            className="text-[11px] font-mono hover:underline flex items-center gap-1 cursor-pointer text-[#F27D26] shrink-0"
                          >
                            <Activity className="w-3 h-3" />
                            Live Metrics
                          </button>
                        )}
                      </div>
                      <div className="p-4 font-mono text-xs leading-[1.7] text-white/90 whitespace-pre-wrap overflow-x-auto">
                        {msg.terminalOutput.output}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Agent Message
          return (
            <div key={msg.id} className="flex gap-4 group">
              <div className="w-8 h-8 bg-white text-black rounded-full shrink-0 flex items-center justify-center shadow-lg font-bold">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div className="flex-1 space-y-4 min-w-0">
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs uppercase tracking-widest font-bold text-[#F27D26]">
                      {msg.sender}
                    </span>
                    <span className="font-mono text-[10px] text-white/40">
                      {msg.time}
                    </span>
                    {msg.actionBadge && (
                      <span className="font-mono text-[10px] font-bold bg-[#F27D26]/10 border border-[#F27D26]/30 text-[#F27D26] px-2.5 py-0.5 rounded-full ml-2 uppercase tracking-wider">
                        {msg.actionBadge}
                      </span>
                    )}
                  </div>
                  <div className="text-white/80 leading-relaxed text-sm">
                    {msg.content}
                  </div>
                </div>

                {/* Render Code Block */}
                {msg.codeSnippet && (
                  <div className="border border-white/10 bg-[#060606] rounded-2xl overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#0a0a0a]">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-[#F27D26]" />
                        <span className="font-mono text-xs text-white/80 tracking-wide">
                          {msg.codeSnippet.filename}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyCode(msg.codeSnippet!.code, msg.id)}
                          className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 text-xs flex items-center gap-1.5 font-mono cursor-pointer"
                          title="Copiar código"
                        >
                          {copiedCodeId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px] text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-5 font-mono text-[13px] text-white/90 overflow-x-auto whitespace-pre leading-[1.6]">
                      <div className="table w-full">
                        {renderHighlightedCode(msg.codeSnippet.code, msg.codeSnippet.language)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct Image Links Render Block */}
                {msg.images && msg.images.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-2 text-xs text-[#F27D26] font-mono uppercase tracking-wider">
                      <ImageIcon className="w-4 h-4" />
                      <span>Imagens incorporadas com link direto HTML:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {msg.images.map((img, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="group/img relative rounded-2xl border border-white/10 bg-[#0c0c0c] overflow-hidden shadow-2xl transition-all hover:border-[#F27D26]/40"
                        >
                          <div className="aspect-video w-full overflow-hidden bg-[#050505]">
                            {/* Standard direct HTML img tag */}
                            <img
                              src={img.url}
                              alt={img.alt || 'Direct HTML Link Image'}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-3.5 bg-[#0e0e0e] border-t border-white/10 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-white truncate">{img.alt || 'Imagem'}</span>
                              <span className="text-[10px] font-mono bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20 px-2 py-0.5 rounded-full">
                                &lt;img src&gt; Direct
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-white/40 font-mono mt-0.5">
                              <span className="truncate max-w-[200px]" title={img.url}>{img.url}</span>
                              <a
                                href={img.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#F27D26] hover:underline flex items-center gap-1 shrink-0 ml-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Abrir
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PowerShell / Terminal Output Box */}
                {msg.terminalOutput && (
                  <div className="border border-white/10 bg-[#040404] rounded-2xl overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#080808]">
                      <div className="flex items-center gap-2">
                        <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-xs font-medium text-white/80 tracking-wide">
                          PowerShell & Bash CLI Runner
                        </span>
                      </div>
                      <button
                        onClick={() => onRunTerminalCommand(msg.terminalOutput!.command)}
                        className="text-[11px] text-[#F27D26] hover:underline flex items-center gap-1 font-mono cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        Reexecutar
                      </button>
                    </div>
                    <div className="p-5 font-mono text-[13px] leading-[1.7] text-white/90 whitespace-pre-wrap">
                      {msg.terminalOutput.output}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Action Suggestions */}
      <div className="px-8 py-3 border-t border-white/10 bg-[#080808]/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-white/40 uppercase tracking-widest font-mono text-[10px] shrink-0">Sugestões:</span>
        <button
          onClick={() => {
            setInputText('Adicionar um link direto para imagem no index.html com tag <img src="https://..." />');
            textareaRef.current?.focus();
          }}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 rounded-full font-mono text-xs uppercase tracking-wider shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ImageIcon className="w-3 h-3 text-[#F27D26]" />
          + Link Direto Imagem HTML
        </button>
        <button
          onClick={() => {
            setInputText('npm run build && node server.js');
            textareaRef.current?.focus();
          }}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 rounded-full font-mono text-xs uppercase tracking-wider shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="w-3 h-3 text-emerald-400" />
          Build & Start
        </button>
        <button
          onClick={() => {
            setInputText('Verificar status dos servidores MCP e listar ferramentas disponíveis');
            textareaRef.current?.focus();
          }}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 rounded-full font-mono text-xs uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
        >
          Métricas MCP
        </button>
      </div>

      {/* Quick Image URL prompt popup */}
      {showQuickImagePrompt && (
        <div className="mx-8 mb-3 p-4 bg-[#0e0e0e] border border-[#F27D26]/40 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#F27D26] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Inserir Link Direto de Imagem (URL)
            </span>
            <button
              onClick={() => setShowQuickImagePrompt(false)}
              className="text-xs text-white/40 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={quickImageInput}
              onChange={(e) => setQuickImageInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-... ou URL direta"
              className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-[#F27D26] outline-none font-mono"
            />
            <button
              onClick={() => {
                if (quickImageInput) {
                  onSendMessage(
                    `Carregar imagem direta no HTML: <img src="${quickImageInput}" alt="Asset Direto" />`,
                    quickImageInput
                  );
                  setQuickImageInput('');
                  setShowQuickImagePrompt(false);
                }
              }}
              className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-full text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="p-6 border-t border-white/10 bg-[#060606]">
        <div className="flex items-end gap-3 bg-[#0a0a0a] border border-white/10 focus-within:border-[#F27D26]/50 p-2.5 rounded-2xl transition-all shadow-xl">
          <button
            onClick={() => setShowQuickImagePrompt(!showQuickImagePrompt)}
            title="Adicionar link direto para imagem ou arquivo"
            className="p-2 text-white/40 hover:text-[#F27D26] transition-colors rounded-full hover:bg-white/5 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enviar comando, instrução ou link de imagem... (Enter para enviar)"
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] text-white py-2 px-2 text-sm outline-none placeholder:text-white/30 font-sans"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() && !quickImageInput.trim()}
            title="Enviar mensagem ou comando"
            className={`p-2.5 rounded-full transition-all shadow-md shrink-0 cursor-pointer ${
              inputText.trim() || quickImageInput.trim()
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
};
