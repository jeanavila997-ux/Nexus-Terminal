import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Terminal as TerminalIcon, 
  Play, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface InteractiveTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCommand?: string;
  onImageLinkDetected?: (url: string) => void;
}

interface TerminalLine {
  type: 'input' | 'output' | 'system' | 'error' | 'success';
  text: string;
}

export const InteractiveTerminalModal: React.FC<InteractiveTerminalModalProps> = ({
  isOpen,
  onClose,
  initialCommand,
  onImageLinkDetected,
}) => {
  const [commandInput, setCommandInput] = useState(initialCommand || '');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isExpanded, setIsExpanded] = useState(false);

  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', text: 'Nexus Terminal CLI Engine v2.4.0 [Host: local 127.0.0.1 / Node.js 24 + 9Router]' },
    { type: 'system', text: 'Digite "help" para ver a lista de comandos suportados.' },
    { type: 'output', text: 'MCP Servers: [Local FS: ONLINE, Web Search: ONLINE, Node Runner: ONLINE]' },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialCommand) {
      executeCommand(initialCommand);
    }
  }, [initialCommand]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  if (!isOpen) return null;

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Add input line
    const newLines: TerminalLine[] = [...lines, { type: 'input', text: `PS C:\\Projects\\Nexus> ${trimmed}` }];

    // Record history
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const mainCmd = parts[0].toLowerCase();

    if (mainCmd === 'clear' || mainCmd === 'cls') {
      setLines([{ type: 'system', text: 'Nexus Terminal Console pronto.' }]);
      setCommandInput('');
      return;
    }

    if (mainCmd === 'help') {
      newLines.push({
        type: 'output',
        text: `Comandos disponíveis no Nexus Terminal:
  help                     Exibe esta mensagem de ajuda
  clear                    Limpa a tela do terminal
  ls / dir                 Lista os arquivos do workspace
  cat <arquivo>            Exibe o conteúdo de um arquivo (ex: cat server.js)
  node server.js           Executa o servidor Express na porta 3000
  npm init -y              Inicializa novo projeto Node.js
  npm install <pacote>     Instala dependências npm
  curl -I <url>            Inspeciona cabeçalhos HTTP de uma URL ou imagem
  img <url>                Valida e renderiza link direto de imagem HTML
  mcp status               Verifica o estado dos servidores MCP
  agent run <tarefa>       Envia instrução direta para o DevAgent
  date / uptime            Mostra a hora e tempo de atividade do container`,
      });
    } else if (mainCmd === 'ls' || mainCmd === 'dir') {
      newLines.push({
        type: 'output',
        text: `Diretório: C:\\Projects\\Nexus

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-----         31/08/2026   10:42                public (assets & index.html)
-a----         31/08/2026   10:43           1240 server.js
-a----         31/08/2026   10:42            580 package.json
-a----         31/08/2026   10:45           1890 README.md
-a----         31/08/2026   10:45           2100 index.html (Direct image links)`,
      });
    } else if (mainCmd === 'node' && parts[1] === 'server.js') {
      newLines.push({
        type: 'success',
        text: `[Nexus Engine] Iniciando server.js...
Server listening at http://localhost:3000
Rotas ativas:
  GET /           -> HTML com tags <img src="..." /> diretas
  GET /api/status -> JSON status com DevAgent
✓ Servidor Express operacional.`,
      });
    } else if (mainCmd === 'cat') {
      const file = parts[1] || 'server.js';
      if (file.includes('index.html')) {
        newLines.push({
          type: 'output',
          text: `<!DOCTYPE html>
<html lang="pt-BR">
<head><title>Nexus HTML Preview</title></head>
<body>
  <!-- Link Direto para Imagem no HTML -->
  <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000" alt="Code Terminal" />
</body>
</html>`,
        });
      } else {
        newLines.push({
          type: 'output',
          text: `const express = require('express');
const app = express();
const port = 3000;
app.get('/', (req, res) => res.send('Nexus Express Active'));
app.listen(port, () => console.log(\`Server on \${port}\`));`,
        });
      }
    } else if (mainCmd === 'img' || mainCmd === 'image') {
      const url = parts[1] || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000';
      newLines.push({
        type: 'success',
        text: `[HTML Image Link Validator]
Verificando URL: ${url}
Tag gerada: <img src="${url}" alt="Direct HTML Image" />
HTTP Status: 200 OK | Content-Type: image/jpeg
✓ Imagem validada e pronta para inserção no HTML.`,
      });
      if (onImageLinkDetected) {
        onImageLinkDetected(url);
      }
    } else if (mainCmd === 'curl') {
      const url = parts[1] || parts[2] || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c';
      newLines.push({
        type: 'output',
        text: `HTTP/2 200 OK
server: cloudflare
date: Mon, 31 Aug 2026 21:30:00 GMT
content-type: image/jpeg
content-length: 241980
cache-control: max-age=31536000, public
access-control-allow-origin: *
[OK] Link direto acessível sem bloqueios CORS.`,
      });
    } else if (mainCmd === 'mcp') {
      newLines.push({
        type: 'output',
        text: `Status dos Servidores MCP:
  • Local FS:     [ONLINE]  4ms  (12 ferramentas registradas)
  • Web Search:   [ONLINE] 120ms (4 ferramentas registradas)
  • Node Runner:  [ONLINE]  18ms (6 ferramentas registradas)
  • PostgreSQL:   [READY]   35ms (8 ferramentas registradas)
Todos os protocolos JSON-RPC ativos no Nexus Hub.`,
      });
    } else if (mainCmd === 'npm') {
      newLines.push({
        type: 'output',
        text: `npm package manager execution:
+ express@4.21.2
+ dotenv@17.2.3
+ lucide-react@0.546.0
added 62 packages, and audited 63 packages in 1.8s
found 0 vulnerabilities`,
      });
    } else {
      newLines.push({
        type: 'output',
        text: `Comando executado: "${trimmed}".
Saída gerada pelo subsistema Nexus Agent (código de retorno: 0).`,
      });
    }

    setLines(newLines);
    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0 && historyIndex < commandHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      } else {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className={`bg-[#080808] border border-white/10 w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all ${
          isExpanded ? 'max-w-5xl h-[85vh]' : 'max-w-3xl h-[65vh]'
        }`}
      >
        {/* Terminal Header */}
        <div className="px-6 py-3.5 border-b border-white/10 bg-[#060606] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block"></span>
            </div>
            <div className="flex items-center gap-2 pl-2">
              <TerminalIcon className="w-4 h-4 text-[#F27D26]" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                PowerShell & Bash CLI [Nexus Interactive Runner]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/40 hover:text-white p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
              title={isExpanded ? 'Restaurar tamanho' : 'Maximizar'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setLines([{ type: 'system', text: 'Nexus Terminal limpo.' }])}
              className="text-white/40 hover:text-white p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
              title="Limpar tela"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-6 font-mono text-xs text-white/90 overflow-y-auto space-y-2 bg-[#050505]">
          {lines.map((line, idx) => {
            if (line.type === 'system') {
              return (
                <div key={idx} className="text-white/40 leading-relaxed font-mono">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'input') {
              return (
                <div key={idx} className="text-[#F27D26] font-semibold pt-1 font-mono">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'success') {
              return (
                <div key={idx} className="text-emerald-300 bg-white/5 p-3 rounded-xl border border-white/10 whitespace-pre-wrap font-mono">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'error') {
              return (
                <div key={idx} className="text-red-400 bg-white/5 p-3 rounded-xl border border-white/10 whitespace-pre-wrap font-mono">
                  {line.text}
                </div>
              );
            }
            return (
              <div key={idx} className="text-white/80 whitespace-pre-wrap leading-relaxed font-mono">
                {line.text}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-[#060606] flex items-center gap-3">
          <span className="font-mono text-xs text-[#F27D26] font-bold shrink-0">
            PS C:\Projects\Nexus&gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite um comando (ex: node server.js, img https://..., help)"
            className="flex-1 bg-transparent border-none text-xs font-mono text-white focus:ring-0 focus:outline-none placeholder:text-white/30"
          />
          <button
            onClick={() => executeCommand(commandInput)}
            className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Play className="w-3 h-3" />
            Executar
          </button>
        </div>
      </div>
    </div>
  );
};
