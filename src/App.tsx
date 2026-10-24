import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { ChatView } from './components/ChatView';
import { FilesView } from './components/FilesView';
import { StatusView } from './components/StatusView';
import { LogsView } from './components/LogsView';
import { SettingsView } from './components/SettingsView';
import { ImageModal } from './components/ImageModal';
import { InteractiveTerminalModal } from './components/InteractiveTerminalModal';
import { 
  INITIAL_AGENTS, 
  INITIAL_CHANNELS, 
  INITIAL_COMMANDS, 
  INITIAL_FILES, 
  INITIAL_LLMS, 
  INITIAL_MCP_SERVERS, 
  INITIAL_SKILLS,
  INITIAL_GIT_HOOKS
} from './data/mockData';
import { 
  Agent, 
  Channel, 
  CommandItem, 
  LLMModel, 
  MCPServer, 
  Message, 
  ProjectFile, 
  SkillTool, 
  ViewMode,
  CpuAlert,
  CpuAlertKillPolicy,
  GitHookConfig,
  GitHookType,
  GitHookRunResult,
  SystemLogEntry
} from './types';
import { HelpCircle, X } from 'lucide-react';

export default function App() {
  // Navigation View
  const [currentView, setCurrentView] = useState<ViewMode>('chat');

  // Channels and Chat State
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('general');

  // CPU Alert Daemon & Overload Watchdog State
  const [isOverloadStressTesting, setIsOverloadStressTesting] = useState<boolean>(false);
  const [overloadCountdown, setOverloadCountdown] = useState<number>(0);
  const [consecutiveHighCpuSeconds, setConsecutiveHighCpuSeconds] = useState<number>(0);
  const [isAlertActive, setIsAlertActive] = useState<boolean>(false);
  const [activeAlertData, setActiveAlertData] = useState<CpuAlert | null>(null);
  const [alertHistory, setAlertHistory] = useState<CpuAlert[]>([]);
  const [cpuKillPolicy, setCpuKillPolicy] = useState<CpuAlertKillPolicy>('suggest');
  const [alertActiveSeconds, setAlertActiveSeconds] = useState<number>(0);
  const [killSuggestionEmitted, setKillSuggestionEmitted] = useState<boolean>(false);

  // LLM & Agent State
  const [llms] = useState<LLMModel[]>(INITIAL_LLMS);
  const [selectedLLMId, setSelectedLLMId] = useState<string>('gpt-4o');

  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [activeAgentId, setActiveAgentId] = useState<string>('dev-agent');

  // MCP Servers, Skills & Commands
  const [mcpServers] = useState<MCPServer[]>(INITIAL_MCP_SERVERS);
  const [skills] = useState<SkillTool[]>(INITIAL_SKILLS);
  const [commands] = useState<CommandItem[]>(INITIAL_COMMANDS);

  // Files & Git Hooks
  const [files, setFiles] = useState<ProjectFile[]>(INITIAL_FILES);
  const [gitHooks, setGitHooks] = useState<GitHookConfig[]>(INITIAL_GIT_HOOKS);

  // Integrated System Logs
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>([
    { id: '1', time: '10:42:01', level: 'INFO', source: 'NexusKernel', message: 'Iniciando contêiner Cloud Run na porta 3000...' },
    { id: '2', time: '10:42:04', level: 'SUCCESS', source: 'MCPBridge', message: 'Servidores MCP conectados: Local FS, Web Search, Node Runner, PostgreSQL' },
    { id: '3', time: '10:43:10', level: 'AGENT', source: 'DevAgent', message: 'Recebida instrução: "Setup a basic Express server in the current directory"' },
    { id: '4', time: '10:43:12', level: 'INFO', source: 'NodeRunner', message: 'Executando comando: npm init -y && npm install express' },
    { id: '5', time: '10:43:15', level: 'SUCCESS', source: 'NodeRunner', message: 'server.js criado e ouvindo em http://localhost:3000' },
    { id: '6', time: '10:45:00', level: 'INFO', source: 'HTMLRenderer', message: 'Validando tags <img src="..." /> com links diretos' },
    { id: '7', time: '10:45:02', level: 'SUCCESS', source: 'HTMLRenderer', message: 'Link direto https://images.unsplash.com/photo-1555066931-4365d14bab8c retornado com HTTP 200' },
    { id: '8', time: '10:45:10', level: 'INFO', source: 'WorkspacePreview', message: 'Painel de preview sincronizado com index.html' },
    { id: '9', time: '10:46:00', level: 'INFO', source: 'GitHooks', message: 'Git Hooks carregados: .git/hooks/pre-commit e .git/hooks/post-push disponíveis no Workspace.' },
  ]);

  // Workspace preview image (Direct HTML link)
  const [previewImageUrl, setPreviewImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80'
  );

  // Modals
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);
  const [terminalInitialCmd, setTerminalInitialCmd] = useState<string>('');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Active channel helper
  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const activeAgent = agents.find((a) => a.id === activeAgentId) || agents[0];

  // Handle Send Message
  const handleSendMessage = (text: string, imageLink?: string) => {
    const userMsgId = `user-${Date.now()}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      sender: 'User',
      time: currentTime,
      content: text,
      images: imageLink
        ? [
            {
              url: imageLink,
              alt: 'Link direto inserido pelo usuário',
              sourceType: 'url',
            },
          ]
        : undefined,
    };

    // Update channel messages with user message
    const updatedMessages = [...activeChannel.messages, userMessage];

    // Determine agent response based on user input
    setTimeout(() => {
      const agentMsgId = `agent-${Date.now()}`;
      let agentResponse: Message;

      const lowerText = text.toLowerCase();

      if (lowerText.includes('imagem') || lowerText.includes('image') || lowerText.includes('img') || imageLink) {
        const urlToUse = imageLink || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80';
        setPreviewImageUrl(urlToUse);

        agentResponse = {
          id: agentMsgId,
          role: 'agent',
          sender: 'Nexus Agent',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionBadge: 'ACTION',
          content: `Link direto de imagem adicionado com sucesso! Renderizado no preview HTML com tag <img src="${urlToUse}" />:`,
          codeSnippet: {
            filename: 'public/index.html',
            language: 'html',
            code: `<!-- Link direto para imagem adicionado dinamicamente -->
<div class="card">
  <img 
    src="${urlToUse}" 
    alt="Imagem direta carregada" 
    class="w-full rounded-lg border border-[#444653]" 
  />
</div>`,
          },
          images: [
            {
              url: urlToUse,
              alt: 'Imagem renderizada via link direto HTML',
              sourceType: 'html',
            },
          ],
          terminalOutput: {
            cwd: 'PS C:\\Projects\\Nexus>',
            command: `echo '<img src="${urlToUse}" />' >> public/index.html`,
            output: `[HTML Renderer] Tag <img> inserida no index.html.
[HTTP 200] Link direto de imagem verificado com sucesso.
Workspace Preview atualizado.`,
          },
        };
      } else if (lowerText.includes('server') || lowerText.includes('express') || lowerText.includes('node')) {
        agentResponse = {
          id: agentMsgId,
          role: 'agent',
          sender: 'Nexus Agent',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionBadge: 'ACTION',
          content: 'Servidor Express configurado com suporte para servir arquivos estáticos e imagens HTML diretamente.',
          codeSnippet: {
            filename: 'server.js',
            language: 'javascript',
            code: `const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.get('/api/health', (req, res) => res.json({ status: 'healthy', port }));
app.listen(port, () => console.log(\`Running on port \${port}\`));`,
          },
          terminalOutput: {
            cwd: 'PS C:\\Projects\\Nexus>',
            command: 'node server.js',
            output: `Server listening at http://localhost:3000
MCP Local FS: Sincronizado
Rotas de imagens e assets estáticos liberadas.`,
          },
        };
      } else {
        agentResponse = {
          id: agentMsgId,
          role: 'agent',
          sender: 'Nexus Agent',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionBadge: 'ACTION',
          content: `Comando processado com sucesso pelo ${activeAgent.name}. Todos os 4 servidores MCP e rotas do contêiner estão operacionais.`,
          terminalOutput: {
            cwd: 'PS C:\\Projects\\Nexus>',
            command: `nexus-cli execute "${text.substring(0, 30)}..."`,
            output: `[DevAgent] Tarefa executada com sucesso.
Código de retorno: 0 (OK)`,
          },
        };
      }

      setChannels((prev) =>
        prev.map((c) =>
          c.id === activeChannelId
            ? { ...c, messages: [...updatedMessages, agentResponse] }
            : c
        )
      );
    }, 600);

    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannelId
          ? { ...c, messages: updatedMessages }
          : c
      )
    );
  };

  // Handle Command Run from Command Library or Terminal
  const handleRunCommand = (cmd: CommandItem) => {
    setCurrentView('chat');
    handleSendMessage(`Executar comando: ${cmd.title} (${cmd.command})`);
  };

  const handleSelectSkill = (skill: SkillTool) => {
    setCurrentView('chat');
    handleSendMessage(`Utilizar skill: ${skill.name} - ${skill.description}`);
  };

  const handleSaveFile = (fileId: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content: newContent } : f))
    );
  };

  // Git Hooks management handlers
  const handleSaveGitHook = (hookId: GitHookType, script: string, enabled: boolean) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setGitHooks((prev) =>
      prev.map((h) => (h.id === hookId ? { ...h, script, enabled } : h))
    );

    // Sync with project files so .git/hooks/* is also updated in explorer
    setFiles((prevFiles) =>
      prevFiles.map((f) => {
        if (f.path.includes(hookId)) {
          return { ...f, content: script };
        }
        return f;
      })
    );

    // Append to system logs
    const logEntry: SystemLogEntry = {
      id: `log-hook-save-${Date.now()}`,
      time: timeStr,
      level: 'INFO',
      source: 'GitHooks',
      message: `Configuração do hook '.git/hooks/${hookId}' atualizada: status ${enabled ? 'ATIVO (chmod +x)' : 'DESATIVADO'}.`,
    };
    setSystemLogs((prev) => [logEntry, ...prev]);
  };

  const handleRunGitHook = async (hookId: GitHookType): Promise<GitHookRunResult> => {
    const startTime = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 1. Dispatch starting log to system logs
    const startLog: SystemLogEntry = {
      id: `log-hook-run-${Date.now()}`,
      time: timeStr,
      level: 'INFO',
      source: 'GitHooks',
      message: `Executando script de hook: bash .git/hooks/${hookId}...`,
    };
    setSystemLogs((prev) => [startLog, ...prev]);

    // 2. Simulated realistic execution duration
    await new Promise((resolve) => setTimeout(resolve, 600));
    const duration = Date.now() - startTime;
    const finishTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let outputText = '';
    if (hookId === 'pre-commit') {
      outputText = `🔍 [GIT HOOK: pre-commit] Iniciando auditoria de integridade do código...
⚡ Validando tipagem estática do projeto...
   ✔ tsc --noEmit: 0 erros encontrados em 16 arquivos
🔒 Verificando vazamento acidental de chaves de API (.env / tokens)...
   ✔ Scanner aprovado: Nenhuma credencial staged detectada
✅ [SUCESSO] Todas as verificações de pré-commit foram aprovadas. Exit code: 0.`;
    } else {
      outputText = `🚀 [GIT HOOK: post-push] Branch 'main' sincronizada no commit a1c8f39
📡 Despachando webhook para fila de deploy contínuo...
   ✔ Payload HTTP 202 Accepted recebido de https://api.nexus.internal
🔔 Notificando canal #deploy e atualizando status operacional...
✅ [SUCESSO] Pipeline pós-push concluído com sucesso. Exit code: 0.`;
    }

    const runResult: GitHookRunResult = {
      id: `run-${Date.now()}`,
      time: finishTime,
      hookType: hookId,
      exitCode: 0,
      status: 'success',
      durationMs: duration,
      output: outputText,
    };

    // Update hook state with last execution
    setGitHooks((prev) =>
      prev.map((h) => (h.id === hookId ? { ...h, lastRun: runResult } : h))
    );

    // 3. Dispatch success log to system logs
    const finishLog: SystemLogEntry = {
      id: `log-hook-fin-${Date.now()}`,
      time: finishTime,
      level: 'SUCCESS',
      source: 'GitHooks',
      message: `Hook '.git/hooks/${hookId}' finalizado com EXIT CODE 0 em ${duration}ms.`,
    };
    setSystemLogs((prev) => [finishLog, ...prev]);

    // 4. Dispatch terminal message to chat channels (Console do Sistema)
    const terminalMessage: Message = {
      id: `msg-hook-run-${Date.now()}`,
      role: 'terminal',
      sender: 'Console GitHooks',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionBadge: `GIT HOOK: ${hookId.toUpperCase()}`,
      content: `Execução do Git Hook [${hookId}] finalizada com status SUCESSO (Exit Code: 0) em ${duration}ms.`,
      terminalOutput: {
        cwd: '/var/www/nexus-project',
        command: `bash .git/hooks/${hookId}`,
        output: runResult.output,
        isError: false,
      },
    };

    setChannels((prevChannels) =>
      prevChannels.map((c) => {
        if (c.id === 'general' || (hookId === 'post-push' && c.id === 'deploy') || c.id === activeChannelId) {
          return {
            ...c,
            messages: [...c.messages, terminalMessage],
          };
        }
        return c;
      })
    );

    return runResult;
  };

  const handleNewChat = () => {
    const greetingMsg: Message = {
      id: `system-new-${Date.now()}`,
      role: 'system',
      sender: 'System',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: 'Nova sessão iniciada no Nexus Terminal. Ambiente preparado para tarefas de código, execução de scripts e renderização de imagens HTML.',
    };

    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannelId ? { ...c, messages: [greetingMsg] } : c
      )
    );
  };

  const handleSelectAgent = (agentId: string) => {
    setActiveAgentId(agentId);
    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        status: a.id === agentId ? 'active' : 'idle',
      }))
    );
  };

  // Trigger CPU Alert Daemon action
  const triggerCpuAlert = (cpuPercent: number, durationSec: number) => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const c1 = parseFloat((94 + Math.random() * 5).toFixed(1));
    const c2 = parseFloat((93 + Math.random() * 5).toFixed(1));
    const c3 = parseFloat((95 + Math.random() * 4).toFixed(1));
    const c4 = parseFloat((92 + Math.random() * 6).toFixed(1));

    const newAlert: CpuAlert = {
      id: `cpu-alert-${now}`,
      timestamp: now,
      time: timeStr,
      cpuPercent: parseFloat(cpuPercent.toFixed(1)),
      durationSeconds: durationSec,
      alertActiveSeconds: 0,
      thresholdPercent: 90,
      status: 'active',
      killPolicy: cpuKillPolicy,
      killActionStatus: 'none',
      coreBreakdown: { core1: c1, core2: c2, core3: c3, core4: c4 },
      topProcesses: [
        { name: 'Dev Agent (Gemini Worker)', cpu: 65.4, pid: 2180 },
        { name: 'Nexus Engine Core', cpu: 24.8, pid: 1042 },
        { name: 'Vite Dev Server', cpu: 4.2, pid: 3014 },
      ],
    };

    setIsAlertActive(true);
    setAlertActiveSeconds(0);
    setKillSuggestionEmitted(false);
    setActiveAlertData(newAlert);
    setAlertHistory((prev) => [newAlert, ...prev]);

    // Format the system terminal alert log message for chat
    const alertMessage: Message = {
      id: `msg-alert-${now}`,
      role: 'terminal',
      sender: 'Monitor de Recursos (Daemon)',
      time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionBadge: 'ALERTA CRÍTICO: CPU > 90%',
      content: `🚨 [ALERTA DE SISTEMA] Uso excessivo de CPU detectado: ${cpuPercent.toFixed(1)}%. O limiar crítico de 90% foi excedido continuamente por mais de 5 segundos.`,
      terminalOutput: {
        cwd: '/var/log/nexus/monitor',
        command: 'nexus-monitor-daemon --check-alert --metric=cpu --threshold=90 --duration=5s',
        output: `[CRITICAL ALERT TRIGGERED] CPU Saturation Exceeded Threshold!
------------------------------------------------------------
• Regra: Limiar de CPU > 90.0% contínuo por > 5.0 segundos
• Tempo em Sobrecarga: ${durationSec}s (Limite de 5s violado)
• Utilização Atual de CPU: ${cpuPercent.toFixed(1)}%
• Núcleos saturados:
   - vCPU 0: ${c1}%
   - vCPU 1: ${c2}%
   - vCPU 2: ${c3}%
   - vCPU 3: ${c4}%
• Processos com Maior Consumo Identificados:
   [PID 2180] Dev Agent (Gemini Worker): 65.4% CPU
   [PID 1042] Nexus Engine Core: 24.8% CPU
   [PID 3014] Vite Dev Server: 4.2% CPU
• Política de Encerramento: ${
          cpuKillPolicy === 'auto_kill'
            ? 'AUTO-KILL ATIVO (Encerra o maior processo após 10s de alerta)'
            : cpuKillPolicy === 'suggest'
            ? 'SUGESTÃO ATIVA (Sugerir kill após 10s de alerta)'
            : 'DESATIVADO'
        }
• Timestamp: ${new Date(now).toISOString()}`,
        isError: true,
      },
    };

    setChannels((prevChannels) =>
      prevChannels.map((ch) => {
        if (ch.id === 'general' || ch.id === activeChannelId) {
          const hasAlready = ch.messages.some((m) => m.id === alertMessage.id);
          if (hasAlready) return ch;
          return {
            ...ch,
            messages: [...ch.messages, alertMessage],
            unreadCount: currentView !== 'chat' && ch.id === 'general' ? (ch.unreadCount || 0) + 1 : ch.unreadCount,
          };
        }
        return ch;
      })
    );
  };

  // Trigger Kill Suggestion after 10 seconds of active alert
  const triggerKillSuggestion = (pid: number, processName: string, cpuPercent: number) => {
    const now = Date.now();
    setKillSuggestionEmitted(true);

    setActiveAlertData((current) => {
      if (current) {
        const updated: CpuAlert = {
          ...current,
          killActionStatus: 'suggested',
        };
        setAlertHistory((prev) =>
          prev.map((a) => (a.id === current.id ? updated : a))
        );
        return updated;
      }
      return current;
    });

    const suggestionMessage: Message = {
      id: `msg-suggest-kill-${now}`,
      role: 'terminal',
      sender: 'Monitor de Recursos (Daemon)',
      time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionBadge: 'SUGESTÃO: ENCERRAMENTO (10s ALERTA)',
      content: `⚠️ [SUGESTÃO DE ENCERRAMENTO] O alerta de sobrecarga crítica de CPU permanece ativo por 10 segundos ininterruptos. O processo [PID ${pid}] ${processName} é o maior consumidor (${cpuPercent}% CPU). Recomenda-se o encerramento imediato via SIGKILL (kill -9) para estabilização do sistema.`,
      killAction: {
        pid,
        processName,
        cpu: cpuPercent,
        executed: false,
        autoTriggered: false,
      },
      terminalOutput: {
        cwd: '/var/log/nexus/monitor',
        command: `nexus-monitor-daemon --suggest-kill --pid=${pid} --alert-duration=10s`,
        output: `[WATCHDOG RECOMMENDATION: PROCESS TERMINATION]
------------------------------------------------------------
• Tempo em Alerta Ativo: 10.0 segundos
• Processo com Maior Utilização de CPU:
   [PID ${pid}] ${processName} (${cpuPercent}% CPU)
• Ação Proposta: Encerramento forçado via SIGKILL (kill -9 ${pid})
• Efeito Esperado: Recuperação instantânea de capacidade de processamento
• Clique no botão 'kill -9 ${pid}' para executar a terminação manual imediata.`,
        isError: true,
      },
    };

    setChannels((prevChannels) =>
      prevChannels.map((ch) => {
        if (ch.id === 'general' || ch.id === activeChannelId) {
          return {
            ...ch,
            messages: [...ch.messages, suggestionMessage],
            unreadCount: currentView !== 'chat' && ch.id === 'general' ? (ch.unreadCount || 0) + 1 : ch.unreadCount,
          };
        }
        return ch;
      })
    );
  };

  // Execute Kill of the top consuming process (Manual or Automatic)
  const handleKillProcess = (pid: number, processName: string, isAuto: boolean = false) => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Instantly terminate overload stress test & reset active alert
    setIsOverloadStressTesting(false);
    setOverloadCountdown(0);
    setConsecutiveHighCpuSeconds(0);
    setAlertActiveSeconds(0);
    setKillSuggestionEmitted(false);
    setIsAlertActive(false);

    // Update active alert & alert history to resolved via killed process
    setActiveAlertData((current) => {
      if (current) {
        setAlertHistory((prev) =>
          prev.map((a) =>
            a.id === current.id
              ? {
                  ...a,
                  status: 'resolved',
                  resolvedAt: timeStr,
                  killActionStatus: 'executed',
                  killedProcess: {
                    pid,
                    name: processName,
                    executedAt: timeStr,
                    auto: isAuto,
                  },
                }
              : a
          )
        );
      }
      return null;
    });

    // Mark any existing suggestion message in channels as executed
    setChannels((prevChannels) =>
      prevChannels.map((ch) => ({
        ...ch,
        messages: ch.messages.map((m) =>
          m.killAction && m.killAction.pid === pid
            ? {
                ...m,
                killAction: {
                  ...m.killAction,
                  executed: true,
                  autoTriggered: isAuto,
                },
              }
            : m
        ),
      }))
    );

    // Create execution confirmation message for terminal chat
    const killConfirmationMessage: Message = {
      id: `msg-kill-${now}`,
      role: 'terminal',
      sender: 'Monitor de Recursos (Daemon)',
      time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionBadge: isAuto ? 'AUTO-KILL EXECUTADO (10s ALERTA)' : 'PROCESSO ENCERRADO (SIGKILL -9)',
      content: isAuto
        ? `⚡ [AUTO-KILL EXECUTADO] O alerta de CPU (> 90%) completou 10 segundos contínuos. O Watchdog executou automaticamente a terminação do processo [PID ${pid}] ${processName} via SIGKILL (kill -9). O uso de CPU foi normalizado.`
        : `🛑 [PROCESSO ENCERRADO] O operador confirmou o encerramento do processo [PID ${pid}] ${processName} via SIGKILL (kill -9). Os recursos de CPU foram liberados imediatamente.`,
      killAction: {
        pid,
        processName,
        cpu: 65.4,
        executed: true,
        autoTriggered: isAuto,
      },
      terminalOutput: {
        cwd: '/var/log/nexus/monitor',
        command: `kill -9 ${pid} # ${processName}`,
        output: `[SIGKILL -9 EXECUTED BY ${isAuto ? 'WATCHDOG AUTO-KILL DAEMON (10s CRITICAL TIMEOUT)' : 'OPERATOR MANUAL DISPATCH'}]
------------------------------------------------------------
• Processo Encerrado: [PID ${pid}] ${processName}
• Motivo: ${isAuto ? 'Alerta de CPU > 90% ininterrupto por 10s (Política Auto-Kill ativada)' : 'Comando manual de encerramento pelo operador'}
• Sinal de Terminação: SIGKILL (-9)
• Código de Saída do Processo: 137 (Fatal: Process killed by SIGKILL)
• Carga de CPU Liberada: ~65.4%
• Utilização Atual de CPU: ~13.8% (Saudável / Nominal)
• Status Operacional: RESTABELECIDO COM SUCESSO
• Timestamp: ${new Date(now).toISOString()}`,
        isError: false,
      },
    };

    setChannels((prevChannels) =>
      prevChannels.map((ch) => {
        if (ch.id === 'general' || ch.id === activeChannelId) {
          return {
            ...ch,
            messages: [...ch.messages, killConfirmationMessage],
            unreadCount: currentView !== 'chat' && ch.id === 'general' ? (ch.unreadCount || 0) + 1 : ch.unreadCount,
          };
        }
        return ch;
      })
    );
  };

  const triggerCpuResolved = (cpuPercent: number) => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setIsAlertActive(false);
    setAlertActiveSeconds(0);
    setKillSuggestionEmitted(false);
    setActiveAlertData((currentActive) => {
      if (currentActive) {
        setAlertHistory((prev) =>
          prev.map((a) => (a.id === currentActive.id ? { ...a, status: 'resolved', resolvedAt: timeStr } : a))
        );
      }
      return null;
    });

    const recoveryMessage: Message = {
      id: `msg-recovery-${now}`,
      role: 'terminal',
      sender: 'Monitor de Recursos (Daemon)',
      time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionBadge: 'SISTEMA NORMALIZADO',
      content: `✅ [SISTEMA NORMALIZADO] O uso de CPU estabilizou em ${cpuPercent.toFixed(1)}%, retornando aos níveis operacionais seguros (< 90%).`,
      terminalOutput: {
        cwd: '/var/log/nexus/monitor',
        command: 'nexus-monitor-daemon --status=nominal --metric=cpu',
        output: `[INCIDENT RESOLVED] CPU Load Returned to Nominal Levels
------------------------------------------------------------
• Utilização Atual de CPU: ${cpuPercent.toFixed(1)}%
• Limite Crítico (< 90.0%): Restabelecido com sucesso
• Status Operacional: SAUDÁVEL / NOMINAL
• Timestamp: ${new Date(now).toISOString()}`,
        isError: false,
      },
    };

    setChannels((prevChannels) =>
      prevChannels.map((ch) => {
        if (ch.id === 'general' || ch.id === activeChannelId) {
          const hasAlready = ch.messages.some((m) => m.id === recoveryMessage.id);
          if (hasAlready) return ch;
          return {
            ...ch,
            messages: [...ch.messages, recoveryMessage],
          };
        }
        return ch;
      })
    );
  };

  const handleToggleOverloadStressTest = () => {
    if (isOverloadStressTesting) {
      setIsOverloadStressTesting(false);
      setOverloadCountdown(0);
    } else {
      setIsOverloadStressTesting(true);
      setOverloadCountdown(30); // 30 seconds ensures full test window (5s alert + 10s kill)
    }
  };

  // Watchdog ticker: monitors CPU level every second
  useEffect(() => {
    const timer = setInterval(() => {
      // Overload countdown
      if (isOverloadStressTesting) {
        setOverloadCountdown((prev) => {
          if (prev <= 1) {
            setIsOverloadStressTesting(false);
            return 0;
          }
          return prev - 1;
        });
      }

      // Simulated CPU level
      const simulatedCpu = isOverloadStressTesting 
        ? 93.5 + Math.random() * 4
        : 14 + Math.random() * 8;

      if (simulatedCpu > 90) {
        setConsecutiveHighCpuSeconds((prevStreak) => {
          const nextStreak = prevStreak + 1;
          if (nextStreak === 5 && !isAlertActive) {
            triggerCpuAlert(simulatedCpu, nextStreak);
          }
          return nextStreak;
        });

        // If alert is already active, count the active alert duration
        if (isAlertActive) {
          setAlertActiveSeconds((prevActive) => {
            const nextActive = prevActive + 1;

            // When the alert has been active continuously for 10 seconds:
            if (nextActive === 10) {
              const topProcess = { pid: 2180, name: 'Dev Agent (Gemini Worker)', cpu: 65.4 };
              if (cpuKillPolicy === 'auto_kill') {
                handleKillProcess(topProcess.pid, topProcess.name, true /* auto */);
              } else if (cpuKillPolicy === 'suggest') {
                triggerKillSuggestion(topProcess.pid, topProcess.name, topProcess.cpu);
              }
            }

            return nextActive;
          });
        }
      } else {
        setConsecutiveHighCpuSeconds((prevStreak) => {
          if (prevStreak >= 5 || isAlertActive) {
            triggerCpuResolved(simulatedCpu);
          }
          return 0;
        });
        setAlertActiveSeconds(0);
        setKillSuggestionEmitted(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOverloadStressTesting, isAlertActive, activeChannelId, currentView, cpuKillPolicy, killSuggestionEmitted]);

  return (
    <div className="bg-gradient-to-br from-[#131313] to-[#080808] text-[#e5e2e1] h-screen w-screen overflow-hidden flex flex-col antialiased">
      {/* Top Navigation Header */}
      <Header
        currentView={currentView}
        activeChannelName={activeChannel.name}
        onOpenImageModal={() => setIsImageModalOpen(true)}
        onOpenTerminalModal={() => {
          setTerminalInitialCmd('');
          setIsTerminalModalOpen(true);
        }}
        onSelectView={setCurrentView}
      />

      {/* Main Content Layout */}
      <div className="flex flex-1 pt-16 h-full w-full overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={(id) => {
            setActiveChannelId(id);
            setCurrentView('chat');
          }}
          onNewChat={handleNewChat}
          onOpenSupport={() => setIsSupportModalOpen(true)}
        />

        {/* Center Main Stage + Right Context Sidebar */}
        <div className="flex flex-1 lg:ml-[280px] h-full overflow-hidden">
          {/* Main Dynamic View */}
          <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
            {currentView === 'chat' && (
              <ChatView
                channel={activeChannel}
                onSendMessage={handleSendMessage}
                onOpenImageModal={() => setIsImageModalOpen(true)}
                onRunTerminalCommand={(cmd) => {
                  setTerminalInitialCmd(cmd);
                  setIsTerminalModalOpen(true);
                }}
                activeAgentName={activeAgent.name}
                onNavigateToMonitor={() => setCurrentView('monitor')}
                onExecuteKillProcess={handleKillProcess}
              />
            )}

            {currentView === 'files' && (
              <FilesView
                files={files}
                onSaveFile={handleSaveFile}
                onOpenImageModal={() => setIsImageModalOpen(true)}
                gitHooks={gitHooks}
                onSaveGitHook={handleSaveGitHook}
                onRunGitHook={handleRunGitHook}
                onNavigateToChat={() => {
                  setActiveChannelId('general');
                  setCurrentView('chat');
                }}
                onNavigateToLogs={() => setCurrentView('logs')}
              />
            )}

            {(currentView === 'status' || currentView === 'monitor') && (
              <StatusView
                mcpServers={mcpServers}
                agents={agents}
                activeAgentId={activeAgentId}
                initialTab={currentView === 'monitor' ? 'monitor' : 'overview'}
                onTabChange={(tab) => {
                  setCurrentView(tab === 'monitor' ? 'monitor' : 'status');
                }}
                onNavigateToChat={() => {
                  setActiveChannelId('general');
                  setCurrentView('chat');
                }}
                isOverloadStressTesting={isOverloadStressTesting}
                onToggleOverloadStressTest={handleToggleOverloadStressTest}
                overloadCountdown={overloadCountdown}
                consecutiveHighCpuSeconds={consecutiveHighCpuSeconds}
                isAlertActive={isAlertActive}
                activeAlertData={activeAlertData}
                alertHistory={alertHistory}
                cpuKillPolicy={cpuKillPolicy}
                onSetCpuKillPolicy={setCpuKillPolicy}
                alertActiveSeconds={alertActiveSeconds}
                onExecuteKillProcess={handleKillProcess}
              />
            )}

            {currentView === 'logs' && (
              <LogsView
                logs={systemLogs}
                onClearLogs={() => setSystemLogs([])}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                llms={llms}
                selectedLLMId={selectedLLMId}
                onSelectLLM={setSelectedLLMId}
                cpuKillPolicy={cpuKillPolicy}
                onSetCpuKillPolicy={setCpuKillPolicy}
              />
            )}
          </div>

          {/* Right Context & Config Sidebar */}
          <div className="hidden xl:block">
            <RightSidebar
              llms={llms}
              selectedLLMId={selectedLLMId}
              onSelectLLM={setSelectedLLMId}
              agents={agents}
              activeAgentId={activeAgentId}
              onSelectAgent={handleSelectAgent}
              mcpServers={mcpServers}
              skills={skills}
              commands={commands}
              onRunCommand={handleRunCommand}
              onSelectSkill={handleSelectSkill}
              onOpenImageModal={() => setIsImageModalOpen(true)}
              previewImageUrl={previewImageUrl}
            />
          </div>
        </div>
      </div>

      {/* Direct Image Links Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertImageToChat={(url, alt) => {
          handleSendMessage(`Carregar imagem HTML direta: <img src="${url}" alt="${alt}" />`, url);
        }}
        onSetWorkspacePreviewImage={(url) => {
          setPreviewImageUrl(url);
        }}
      />

      {/* Interactive Terminal Runner Modal */}
      <InteractiveTerminalModal
        isOpen={isTerminalModalOpen}
        onClose={() => setIsTerminalModalOpen(false)}
        initialCommand={terminalInitialCmd}
        onImageLinkDetected={(url) => {
          setPreviewImageUrl(url);
        }}
      />

      {/* Support / Quick Help Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1b1b] border border-[#444653] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#444653]/40 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#b8c4ff]" />
                <h3 className="font-headline font-bold text-base text-[#e5e2e1]">
                  Suporte Nexus Terminal
                </h3>
              </div>
              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="text-[#8e909f] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#c4c5d5] leading-relaxed">
              <p>
                <strong className="text-[#b8c4ff]">Links Diretos para Imagens no HTML:</strong> Você pode adicionar tags como <code className="bg-[#0e0e0e] px-1.5 py-0.5 rounded border border-[#2a2a2a] text-[#b8c4ff]">&lt;img src="https://..." alt="..." /&gt;</code> tanto no editor de arquivos (<code className="text-[#e5e2e1]">index.html</code>), nas mensagens do chat quanto no Workspace Preview.
              </p>
              <p>
                <strong className="text-[#b8c4ff]">Execução CLI Interativa:</strong> Abra o botão "Terminal CLI" ou clique em "Reexecutar" nos blocos de código PowerShell para executar comandos interativos no contêiner.
              </p>
              <p>
                <strong className="text-[#b8c4ff]">Servidores MCP:</strong> Suporta Local FS, Web Search, Node Runner e PostgreSQL via JSON-RPC 2.0.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="px-4 py-2 bg-[#1e40af] hover:bg-blue-600 text-white rounded text-xs font-mono"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
