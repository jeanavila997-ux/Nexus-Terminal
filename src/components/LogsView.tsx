import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Trash2, 
  Download, 
  Filter, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  XCircle,
  Copy,
  Check
} from 'lucide-react';

export interface LogEntry {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'AGENT' | 'SUCCESS';
  source: string;
  message: string;
}

interface LogsViewProps {
  logs?: LogEntry[];
  onClearLogs?: () => void;
}

const DEFAULT_LOGS: LogEntry[] = [
  { id: '1', time: '10:42:01', level: 'INFO', source: 'NexusKernel', message: 'Iniciando contêiner Cloud Run na porta 3000...' },
  { id: '2', time: '10:42:04', level: 'SUCCESS', source: 'MCPBridge', message: 'Servidores MCP conectados: Local FS, Web Search, Node Runner, PostgreSQL' },
  { id: '3', time: '10:43:10', level: 'AGENT', source: 'DevAgent', message: 'Recebida instrução: "Setup a basic Express server in the current directory"' },
  { id: '4', time: '10:43:12', level: 'INFO', source: 'NodeRunner', message: 'Executando comando: npm init -y && npm install express' },
  { id: '5', time: '10:43:15', level: 'SUCCESS', source: 'NodeRunner', message: 'server.js criado e ouvindo em http://localhost:3000' },
  { id: '6', time: '10:45:00', level: 'INFO', source: 'HTMLRenderer', message: 'Validando tags <img src="..." /> com links diretos' },
  { id: '7', time: '10:45:02', level: 'SUCCESS', source: 'HTMLRenderer', message: 'Link direto https://images.unsplash.com/photo-1555066931-4365d14bab8c retornado com HTTP 200' },
  { id: '8', time: '10:45:10', level: 'INFO', source: 'WorkspacePreview', message: 'Painel de preview sincronizado com index.html' },
];

export const LogsView: React.FC<LogsViewProps> = ({
  logs: externalLogs,
  onClearLogs,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const [internalLogs, setInternalLogs] = useState<LogEntry[]>(DEFAULT_LOGS);
  const activeLogs = externalLogs || internalLogs;

  const filteredLogs = activeLogs.filter((log) => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'SUCCESS':
        return <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">SUCCESS</span>;
      case 'AGENT':
        return <span className="bg-blue-950/60 text-[#b8c4ff] border border-blue-800/40 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">AGENT</span>;
      case 'WARN':
        return <span className="bg-amber-950/60 text-amber-400 border border-amber-800/40 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">WARN</span>;
      case 'ERROR':
        return <span className="bg-red-950/60 text-red-400 border border-red-800/40 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">ERROR</span>;
      default:
        return <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-mono">INFO</span>;
    }
  };

  const handleCopyLogs = () => {
    const text = filteredLogs.map((l) => `[${l.time}] [${l.level}] [${l.source}]: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = filteredLogs.map((l) => `[${l.time}] [${l.level}] [${l.source}]: ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-terminal-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131313] overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 border-b border-[#444653]/40 bg-[#1c1b1b]/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-[#b8c4ff]" />
          <div>
            <h2 className="font-headline font-bold text-lg text-[#e5e2e1]">Logs de Execução em Tempo Real</h2>
            <p className="text-xs text-[#8e909f] font-mono">Fluxo de logs do contêiner, MCPs e ações dos agentes.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#353534] border border-[#444653] text-[#c4c5d5] rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar</span>
          </button>
          <button
            onClick={handleDownloadLogs}
            className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#353534] border border-[#444653] text-[#c4c5d5] rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar .log</span>
          </button>
          <button
            onClick={() => {
              if (onClearLogs) {
                onClearLogs();
              } else {
                setInternalLogs([]);
              }
            }}
            className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 text-red-300 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="px-4 py-3 bg-[#0e0e0e] border-b border-[#2a2a2a] flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e909f]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por mensagem ou serviço..."
            className="w-full bg-[#1c1b1b] border border-[#444653]/50 text-xs font-mono text-[#e5e2e1] py-1.5 pl-9 pr-3 rounded focus:outline-none focus:border-[#b8c4ff]"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5">
          {['ALL', 'INFO', 'AGENT', 'SUCCESS', 'WARN', 'ERROR'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                filterLevel === lvl
                  ? 'bg-[#1e40af] text-white font-bold'
                  : 'bg-[#1c1b1b] text-[#8e909f] hover:text-white border border-[#2a2a2a]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#050505]">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-[#8e909f]">Nenhum registro de log encontrado para os filtros selecionados.</div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-2 bg-[#0e0e0e]/80 hover:bg-[#131313] border border-[#201f1f] rounded flex items-start gap-3 transition-colors"
            >
              <span className="text-[#8e909f] text-[11px] shrink-0">{log.time}</span>
              <div className="shrink-0">{getLevelBadge(log.level)}</div>
              <span className="text-[#b8c4ff] font-semibold text-[11px] shrink-0">[{log.source}]</span>
              <span className="text-gray-300 break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
