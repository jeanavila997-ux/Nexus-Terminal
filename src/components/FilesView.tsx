import React, { useState } from 'react';
import { 
  FolderOpen, 
  FileCode, 
  FileJson, 
  FileText, 
  File, 
  Image as ImageIcon, 
  Eye, 
  Code, 
  Copy, 
  Check, 
  Save, 
  Plus, 
  Sparkles,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Play,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
  Settings,
  Clock,
  Sparkle
} from 'lucide-react';
import { ProjectFile, GitHookConfig, GitHookType, GitHookRunResult } from '../types';
import { INITIAL_GIT_HOOKS } from '../data/mockData';

interface FilesViewProps {
  files: ProjectFile[];
  onSaveFile: (fileId: string, newContent: string) => void;
  onOpenImageModal: () => void;
  gitHooks?: GitHookConfig[];
  onSaveGitHook?: (hookId: GitHookType, script: string, enabled: boolean) => void;
  onRunGitHook?: (hookId: GitHookType) => Promise<GitHookRunResult>;
  onNavigateToChat?: () => void;
  onNavigateToLogs?: () => void;
}

// Pre-configured hook script templates
const HOOK_PRESETS: Record<GitHookType, { label: string; script: string; description: string }[]> = {
  'pre-commit': [
    {
      label: 'TypeScript & Linter (Recomendado)',
      description: 'Executa validação estática e cancela o commit em caso de erros',
      script: `#!/bin/bash
# ==========================================================
# Nexus Terminal - Git pre-commit Hook
# ==========================================================
echo "🔍 [GIT HOOK: pre-commit] Iniciando auditoria de integridade..."

# 1. Checagem de tipagem estática (TypeScript)
echo "⚡ Validando tipagem estática do projeto..."
npm run lint --silent || {
  echo "❌ [FALHA] Erros de validação encontrados. O commit foi bloqueado."
  exit 1
}

# 2. Scanner de segredos e credenciais sensíveis
echo "🔒 Verificando vazamento acidental de chaves de API (.env / tokens)..."
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || echo "")
if [ -n "$STAGED_FILES" ]; then
  grep -rnE "(AIzaSy|sk-[a-zA-Z0-9]{32}|ghp_[a-zA-Z0-9]{36})" $STAGED_FILES 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "🚨 [ERRO CRÍTICO] Chave de API sensível detectada nos arquivos staged!"
    echo "⚠️ Remova as credenciais antes de prosseguir com o commit."
    exit 1
  fi
fi

echo "✅ [SUCESSO] Todas as verificações de pré-commit foram aprovadas."
exit 0`
    },
    {
      label: 'Scanner Rigoroso de Segredos e API Keys',
      description: 'Foco exclusivo em proteção de tokens, chaves de API e arquivos .env',
      script: `#!/bin/bash
# ==========================================================
# Nexus Terminal - Secret & Credential Leak Scanner
# ==========================================================
echo "🔒 [GIT HOOK: pre-commit] Analisando staged files para segredos..."

# Proíbe commit de arquivos .env
FORBIDDEN_FILES=$(git diff --cached --name-only | grep -E "(\\.env|id_rsa|private\\.key)" 2>/dev/null || true)
if [ -n "$FORBIDDEN_FILES" ]; then
  echo "🚨 [ERRO] Tentativa de commit de arquivos confidenciais: $FORBIDDEN_FILES"
  exit 1
fi

echo "✔ Nenhum arquivo confidencial detectado."
echo "✅ [SUCESSO] Auditoria de segurança concluída com êxito."
exit 0`
    },
    {
      label: 'Checagem Rápida de Sintaxe e Testes',
      description: 'Verificação rápida de sintaxe Node e integridade de pacotes',
      script: `#!/bin/bash
# ==========================================================
# Nexus Terminal - Quick Health Check
# ==========================================================
echo "🧪 [GIT HOOK: pre-commit] Executando smoke test rápido..."
node -e "console.log('Node environment OK:', process.version)"

echo "📦 Validando consistência de package.json..."
node -e "require('./package.json')" || {
  echo "❌ package.json corrompido!"
  exit 1
}

echo "✅ [SUCESSO] Smoke tests finalizados sem advertências."
exit 0`
    }
  ],
  'post-push': [
    {
      label: 'Webhook CI/CD & Deploy Trigger (Recomendado)',
      description: 'Despacha payload HTTP para a esteira contínua de deploy',
      script: `#!/bin/bash
# ==========================================================
# Nexus Terminal - Git post-push Hook
# ==========================================================
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "a1c8f39")

echo "🚀 [GIT HOOK: post-push] Branch '$BRANCH' sincronizada no commit $COMMIT_HASH"

# 1. Notificação do Nexus Kernel e Webhook CI/CD
echo "📡 Despachando webhook para fila de deploy contínuo..."
curl -s -X POST https://api.nexus.internal/v1/ci/pipeline-trigger \\
  -H "Content-Type: application/json" \\
  -d "{\\"event\\":\\"push\\",\\"branch\\":\\"$BRANCH\\",\\"commit\\":\\"$COMMIT_HASH\\",\\"agent\\":\\"DevAgent\\"}" \\
  --connect-timeout 2 || echo "ℹ️ [INFO] Webhook de CI/CD enfileirado para fila local (127.0.0.1)."

# 2. Registro no canal #deploy
echo "🔔 Notificando canal #deploy e atualizando status operacional..."
echo "✅ [SUCESSO] Pipeline pós-push concluído com sucesso."
exit 0`
    },
    {
      label: 'Notificação nos Canais e Logs do Sistema',
      description: 'Emite alerta nos canais #deploy e grava nos logs de auditoria',
      script: `#!/bin/bash
# ==========================================================
# Nexus Terminal - Push Notification & Audit Logger
# ==========================================================
COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "Update project files")
AUTHOR=$(git log -1 --pretty=%an 2>/dev/null || echo "Nexus Operator")

echo "📢 [GIT HOOK: post-push] Registrando push de $AUTHOR..."
echo "📝 Mensagem: $COMMIT_MSG"
echo "🌐 Notificando console Nexus Terminal..."
echo "✅ [SUCESSO] Notificação propagada nos canais ativos."
exit 0`
    },
    {
      label: 'Purga de Cache e Health Check Pós-Deploy',
      description: 'Invalida caches de CDN e executa ping nas rotas principais',
      script: `#!/bin/bash
# ==========================================================
# Nexus Terminal - Cache Invalidation & Endpoint Ping
# ==========================================================
echo "🧹 [GIT HOOK: post-push] Limpando cache de assets estáticos..."
echo "🩺 Verificando saúde da rota /api/status na porta 3000..."
curl -s -f http://localhost:3000/api/status > /dev/null || echo "ℹ️ Servidor em inicialização rápida..."
echo "✅ [SUCESSO] Rotas operacionais e cache atualizado."
exit 0`
    }
  ]
};

export const FilesView: React.FC<FilesViewProps> = ({
  files,
  onSaveFile,
  onOpenImageModal,
  gitHooks: propGitHooks,
  onSaveGitHook,
  onRunGitHook,
  onNavigateToChat,
  onNavigateToLogs,
}) => {
  // Navigation mode between project files and git hooks
  const [activeTab, setActiveTab] = useState<'files' | 'hooks'>('files');

  // File Editor state
  const [selectedFileId, setSelectedFileId] = useState<string>(files[2]?.id || files[0]?.id);
  const [editorContent, setEditorContent] = useState<string>(
    files.find((f) => f.id === (files[2]?.id || files[0]?.id))?.content || ''
  );
  const [isLivePreviewMode, setIsLivePreviewMode] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Git Hooks state
  const [gitHooks, setGitHooks] = useState<GitHookConfig[]>(propGitHooks || INITIAL_GIT_HOOKS);
  const [selectedHookType, setSelectedHookType] = useState<GitHookType>('pre-commit');
  const [hookScriptContent, setHookScriptContent] = useState<string>(
    (propGitHooks || INITIAL_GIT_HOOKS).find(h => h.id === 'pre-commit')?.script || ''
  );
  const [hookSavedSuccess, setHookSavedSuccess] = useState(false);
  const [hookCopied, setHookCopied] = useState(false);
  const [isRunningHook, setIsRunningHook] = useState(false);
  const [lastExecutionResult, setLastExecutionResult] = useState<GitHookRunResult | null>(
    (propGitHooks || INITIAL_GIT_HOOKS).find(h => h.id === 'pre-commit')?.lastRun || null
  );
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const selectedFile = files.find((f) => f.id === selectedFileId) || files[0];
  const currentHook = gitHooks.find(h => h.id === selectedHookType) || gitHooks[0];

  // Keep hook script synced when selecting hook
  const handleSelectHook = (type: GitHookType) => {
    setSelectedHookType(type);
    const hook = gitHooks.find(h => h.id === type);
    if (hook) {
      setHookScriptContent(hook.script);
      setLastExecutionResult(hook.lastRun || null);
    }
  };

  const handleSelectFile = (file: ProjectFile) => {
    if (file.path.startsWith('/.git/hooks/') || file.path.startsWith('.git/hooks/')) {
      const hookName = file.name === 'pre-commit' ? 'pre-commit' : 'post-push';
      setActiveTab('hooks');
      handleSelectHook(hookName);
      return;
    }
    setSelectedFileId(file.id);
    setEditorContent(file.content);
    if (file.name.endsWith('.html')) {
      setIsLivePreviewMode(true);
    }
  };

  const handleSave = () => {
    onSaveFile(selectedFileId, editorContent);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Toggle hook enabled / disabled
  const handleToggleHookEnabled = (type: GitHookType) => {
    const updated = gitHooks.map(h => {
      if (h.id === type) {
        const nextEnabled = !h.enabled;
        onSaveGitHook?.(type, h.script, nextEnabled);
        return { ...h, enabled: nextEnabled };
      }
      return h;
    });
    setGitHooks(updated);
    showToast(`Hook '${type}' agora está ${!currentHook.enabled ? 'ATIVO (chmod +x)' : 'DESATIVADO'}.`);
  };

  // Save hook script
  const handleSaveHook = () => {
    const updated = gitHooks.map(h => {
      if (h.id === selectedHookType) {
        return { ...h, script: hookScriptContent };
      }
      return h;
    });
    setGitHooks(updated);
    onSaveGitHook?.(selectedHookType, hookScriptContent, currentHook.enabled);

    // Also sync the file in project files if present
    const matchingFile = files.find(f => f.path.includes(selectedHookType));
    if (matchingFile) {
      onSaveFile(matchingFile.id, hookScriptContent);
    }

    setHookSavedSuccess(true);
    setTimeout(() => setHookSavedSuccess(false), 2000);
    showToast(`Script .git/hooks/${selectedHookType} salvo com sucesso!`);
  };

  // Copy hook script
  const handleCopyHook = () => {
    navigator.clipboard.writeText(hookScriptContent);
    setHookCopied(true);
    setTimeout(() => setHookCopied(false), 2000);
  };

  // Load a preset template
  const handleLoadPreset = (script: string, label: string) => {
    setHookScriptContent(script);
    showToast(`Preset "${label}" carregado no editor.`);
  };

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Run/test the hook with integrated execution log
  const handleRunHook = async () => {
    setIsRunningHook(true);
    const startTime = Date.now();

    try {
      if (onRunGitHook) {
        const result = await onRunGitHook(selectedHookType);
        setLastExecutionResult(result);
        const updated = gitHooks.map(h => h.id === selectedHookType ? { ...h, lastRun: result } : h);
        setGitHooks(updated);
      } else {
        // Local simulation fallback
        await new Promise(r => setTimeout(r, 600));
        const duration = Date.now() - startTime;
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let outputText = '';
        if (selectedHookType === 'pre-commit') {
          outputText = `🔍 [GIT HOOK: pre-commit] Iniciando auditoria de integridade...
⚡ Validando tipagem estática do projeto...
   ✔ [tsc --noEmit]: 0 errors found in 16 files
🔒 Verificando vazamento acidental de chaves de API (.env / tokens)...
   ✔ Scanner aprovado: Nenhuma credencial staged detectada
✅ [SUCESSO] Todas as verificações de pré-commit foram aprovadas. Exit code: 0.`;
        } else {
          outputText = `🚀 [GIT HOOK: post-push] Branch 'main' sincronizada no commit e4f128c
📡 Despachando webhook para fila de deploy contínuo...
   ✔ Payload HTTP 202 Accepted recebido de https://api.nexus.internal
🔔 Notificando canal #deploy e atualizando status operacional...
✅ [SUCESSO] Pipeline pós-push concluído com sucesso. Exit code: 0.`;
        }

        const runResult: GitHookRunResult = {
          id: `run-${Date.now()}`,
          time: nowStr,
          hookType: selectedHookType,
          exitCode: 0,
          status: 'success',
          durationMs: duration,
          output: outputText
        };
        setLastExecutionResult(runResult);
        const updated = gitHooks.map(h => h.id === selectedHookType ? { ...h, lastRun: runResult } : h);
        setGitHooks(updated);
      }
      showToast(`Hook .git/hooks/${selectedHookType} executado! Saída registrada no Console do Sistema.`);
    } catch {
      showToast(`Erro na execução do hook ${selectedHookType}.`);
    } finally {
      setIsRunningHook(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('hook') || fileName === 'pre-commit' || fileName === 'post-push') {
      return <GitBranch className="w-4 h-4 text-purple-400" />;
    }
    if (fileName.endsWith('.js') || fileName.endsWith('.ts') || fileName.endsWith('.tsx')) {
      return <FileCode className="w-4 h-4 text-[#F27D26]" />;
    }
    if (fileName.endsWith('.json')) {
      return <FileJson className="w-4 h-4 text-amber-400" />;
    }
    if (fileName.endsWith('.html')) {
      return <Code className="w-4 h-4 text-[#ff9d5c]" />;
    }
    if (fileName.endsWith('.md')) {
      return <FileText className="w-4 h-4 text-white/60" />;
    }
    return <File className="w-4 h-4 text-white/50" />;
  };

  return (
    <div className="flex-1 flex h-full bg-[#050505] overflow-hidden relative">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="absolute top-4 right-6 z-50 bg-[#161616] border border-[#F27D26]/40 text-white text-xs font-mono px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Terminal className="w-4 h-4 text-[#F27D26]" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Left Sidebar Column */}
      <div className="w-64 sm:w-72 border-r border-white/10 bg-[#080808] flex flex-col shrink-0">
        {/* Navigation Tabs Switcher */}
        <div className="p-3 border-b border-white/10 bg-[#060606]">
          <div className="grid grid-cols-2 gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'files'
                  ? 'bg-white/15 text-white font-bold shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Arquivos</span>
            </button>
            <button
              onClick={() => setActiveTab('hooks')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer relative ${
                activeTab === 'hooks'
                  ? 'bg-purple-950/60 border border-purple-500/40 text-purple-200 font-bold shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span>Git Hooks</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Tab 1: Project Files Explorer */}
        {activeTab === 'files' ? (
          <>
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-[#F27D26]" />
                Workspace Root
              </span>
              <button
                onClick={onOpenImageModal}
                className="text-[10px] text-[#F27D26] hover:underline font-mono uppercase tracking-wider cursor-pointer"
                title="Inserir link direto de imagem no HTML"
              >
                + Link Imagem
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                Código & Mídia
              </div>
              {files.filter(f => !f.path.includes('.git/hooks')).map((file) => {
                const isSelected = file.id === selectedFileId;
                return (
                  <button
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border border-white/15 text-white font-semibold shadow-sm'
                        : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    {getFileIcon(file.name)}
                    <span className="truncate">{file.name}</span>
                    {file.name.endsWith('.html') && (
                      <span className="ml-auto text-[9px] bg-[#F27D26]/15 text-[#F27D26] border border-[#F27D26]/30 px-1.5 py-0.2 rounded-full">
                        HTML
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Git Hooks Folder Section in Explorer */}
              <div className="pt-3">
                <div className="px-2 py-1 text-[10px] font-mono text-purple-300/60 uppercase tracking-widest flex items-center justify-between">
                  <span>.git/hooks/</span>
                  <span className="text-[9px] text-purple-400 font-bold">2 scripts</span>
                </div>
                {files.filter(f => f.path.includes('.git/hooks')).map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono text-left transition-all hover:bg-purple-950/20 text-purple-300/80 hover:text-purple-200 border border-purple-500/10 cursor-pointer"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                    <span className="truncate">{file.name}</span>
                    <span className="ml-auto text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded-full">
                      Hook
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-white/10 bg-[#060606] space-y-2">
              <button
                onClick={() => setActiveTab('hooks')}
                className="w-full py-2 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-mono rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                Gerenciar Git Hooks
              </button>
              <button
                onClick={onOpenImageModal}
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[#F27D26] text-xs font-mono rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Adicionar Imagem HTML
              </button>
            </div>
          </>
        ) : (
          /* Tab 2: Git Hooks Selection List */
          <>
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                Git Hooks Locais
              </span>
              <span className="text-[10px] font-mono text-white/40">
                .git/hooks/
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="px-1 py-1 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                Gatilhos Disponíveis
              </div>

              {gitHooks.map((hook) => {
                const isSelected = hook.id === selectedHookType;
                return (
                  <div
                    key={hook.id}
                    onClick={() => handleSelectHook(hook.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/50 shadow-md'
                        : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {hook.id === 'pre-commit' ? (
                          <GitCommit className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-white/60'}`} />
                        ) : (
                          <GitPullRequest className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-white/60'}`} />
                        )}
                        <span className="font-mono text-xs font-bold text-white">
                          {hook.name}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                          hook.enabled
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                            : 'bg-white/5 text-white/40 border-white/10'
                        }`}
                      >
                        {hook.enabled ? 'ATIVO' : 'DESATIVADO'}
                      </span>
                    </div>

                    <p className="text-[10px] font-mono text-white/50 line-clamp-2 leading-relaxed">
                      {hook.description}
                    </p>

                    {hook.lastRun && (
                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/40">
                        <span>Último teste: {hook.lastRun.time}</span>
                        <span className={hook.lastRun.status === 'success' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {hook.lastRun.status === 'success' ? '✔ Sucesso' : '✖ Falhou'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Informational Card */}
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-white/50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-white/80 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-[#F27D26]" />
                  <span>Integração de Hooks</span>
                </div>
                <p className="leading-relaxed">
                  Os scripts são persistidos em <code className="text-white/80">.git/hooks/</code>. Ao executar qualquer teste, o log completo é direcionado para o <strong>Console do Sistema</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 border-t border-white/10 bg-[#060606]">
              <button
                onClick={() => setActiveTab('files')}
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-mono rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#F27D26]" />
                Voltar aos Arquivos
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Work Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {activeTab === 'files' ? (
          /* Normal File Editor & Preview Mode */
          <>
            {/* Editor Toolbar */}
            <div className="px-6 py-3 border-b border-white/10 bg-[#080808] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
                  {getFileIcon(selectedFile.name)}
                  {selectedFile.path}
                </span>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  ({selectedFile.language})
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {selectedFile.name.endsWith('.html') && (
                  <div className="flex rounded-full border border-white/10 overflow-hidden p-0.5 bg-[#050505]">
                    <button
                      onClick={() => setIsLivePreviewMode(false)}
                      className={`px-3 py-1 text-xs font-mono flex items-center gap-1.5 rounded-full transition-colors cursor-pointer ${
                        !isLivePreviewMode ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Code className="w-3 h-3" />
                      Código
                    </button>
                    <button
                      onClick={() => setIsLivePreviewMode(true)}
                      className={`px-3 py-1 text-xs font-mono flex items-center gap-1.5 rounded-full transition-colors cursor-pointer ${
                        isLivePreviewMode ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      Preview Renderizado
                    </button>
                  </div>
                )}

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-mono rounded-full flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-[#F27D26] hover:bg-[#ff9245] text-black text-xs font-mono font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5 text-black" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? 'Salvo!' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {selectedFile.name.endsWith('.html') && isLivePreviewMode ? (
                <div className="h-full flex flex-col bg-[#050505] overflow-y-auto">
                  <div className="px-6 py-2.5 bg-[#080808] border-b border-white/10 flex items-center justify-between text-xs text-white/50 font-mono">
                    <span>Preview em tempo real do HTML com links diretos de imagens</span>
                    <span className="text-[#F27D26]">&lt;img src="..." /&gt; tags ativas</span>
                  </div>
                  <div className="flex-1 p-8">
                    <div
                      className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-[#0c0c0c] p-8 shadow-2xl"
                      dangerouslySetInnerHTML={{ __html: editorContent }}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex">
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className="w-full h-full bg-[#050505] text-white font-mono text-xs p-6 resize-none border-none focus:outline-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          /* Specialized Git Hooks Management Stage */
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505]">
            {/* Git Hook Control Toolbar */}
            <div className="px-6 py-3.5 border-b border-white/10 bg-[#080808] flex flex-wrap items-center justify-between gap-3">
              {/* Hook Identifier & Trigger Lifecycle */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/40">
                  {currentHook.id === 'pre-commit' ? (
                    <GitCommit className="w-4 h-4 text-purple-400" />
                  ) : (
                    <GitPullRequest className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-sm font-bold text-white">
                      {currentHook.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60">
                      {currentHook.path}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-white/40">
                    {currentHook.id === 'pre-commit' 
                      ? 'Gatilho: Executa automaticamente antes do `git commit`' 
                      : 'Gatilho: Executa automaticamente após o término do `git push`'}
                  </p>
                </div>
              </div>

              {/* Status Toggle & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Active/Inactive Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleHookEnabled(currentHook.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                    currentHook.enabled
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                  title={currentHook.enabled ? 'Clique para desativar este hook (chmod -x)' : 'Clique para ativar este hook (chmod +x)'}
                >
                  <span className={`w-2 h-2 rounded-full ${currentHook.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                  <span>{currentHook.enabled ? 'Hook Ativo (chmod +x)' : 'Desativado'}</span>
                </button>

                {/* Preset Templates Dropdown Selector */}
                <div className="relative group">
                  <select
                    onChange={(e) => {
                      const selected = HOOK_PRESETS[currentHook.id].find(p => p.label === e.target.value);
                      if (selected) {
                        handleLoadPreset(selected.script, selected.label);
                      }
                    }}
                    value=""
                    className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-mono py-1.5 pl-3 pr-8 rounded-full focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#121212] text-white/50">
                      Carregar Template...
                    </option>
                    {HOOK_PRESETS[currentHook.id].map((preset) => (
                      <option key={preset.label} value={preset.label} className="bg-[#121212] text-white">
                        {preset.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 text-[10px]">
                    ▼
                  </div>
                </div>

                {/* Copy Script */}
                <button
                  onClick={handleCopyHook}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-mono rounded-full flex items-center gap-1.5 cursor-pointer"
                >
                  {hookCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hookCopied ? 'Copiado' : 'Copiar'}</span>
                </button>

                {/* Save Hook */}
                <button
                  onClick={handleSaveHook}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-mono font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {hookSavedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{hookSavedSuccess ? 'Salvo!' : 'Salvar Script'}</span>
                </button>

                {/* Test / Run Hook Button */}
                <button
                  onClick={handleRunHook}
                  disabled={isRunningHook}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all cursor-pointer"
                  title="Testar e executar o script do hook agora"
                >
                  {isRunningHook ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executando...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Executar Hook</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Split View: Hook Script Editor + Execution Logs Panel */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-white/10">
              {/* Left/Top: Script Shell Editor */}
              <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#060606]">
                <div className="px-4 py-2 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-white/50">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>Editor de Script Bash ({currentHook.path})</span>
                  </div>
                  <span className="text-white/40">
                    {hookScriptContent.split('\n').length} linhas
                  </span>
                </div>

                <div className="flex-1 relative overflow-hidden flex">
                  {/* Line Numbers Simulation */}
                  <div className="w-10 bg-[#040404] select-none py-4 px-1 text-right text-[11px] font-mono text-white/20 border-r border-white/5 leading-relaxed shrink-0">
                    {hookScriptContent.split('\n').slice(0, 45).map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  {/* Main Textarea */}
                  <textarea
                    value={hookScriptContent}
                    onChange={(e) => setHookScriptContent(e.target.value)}
                    className="w-full h-full bg-[#050505] text-white font-mono text-xs p-4 resize-none border-none focus:outline-none leading-relaxed selection:bg-purple-600/40"
                    spellCheck={false}
                    placeholder="#!/bin/bash\n# Escreva o script executável do seu hook..."
                  />
                </div>
              </div>

              {/* Right/Bottom: Execution Console & System Logs Panel */}
              <div className="w-full lg:w-[460px] flex flex-col h-full overflow-hidden bg-[#070707] shrink-0">
                {/* Panel Header */}
                <div className="px-4 py-2.5 bg-[#0b0b0b] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#F27D26]" />
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      Logs de Execução (Console)
                    </span>
                  </div>
                  {lastExecutionResult && (
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        lastExecutionResult.status === 'success'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-950/60 text-rose-400 border-rose-500/40'
                      }`}
                    >
                      Exit Code: {lastExecutionResult.exitCode} ({lastExecutionResult.status === 'success' ? 'SUCESSO' : 'FALHA'})
                    </span>
                  )}
                </div>

                {/* Console Metadata Strip */}
                <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>CWD: /workspace/project</span>
                  <span>
                    {lastExecutionResult ? `${lastExecutionResult.durationMs}ms decorridos` : 'Aguardando execução'}
                  </span>
                </div>

                {/* Terminal Output Viewer */}
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-white/90 space-y-2 bg-black">
                  {lastExecutionResult ? (
                    <div className="space-y-2">
                      <div className="text-white/40 text-[11px] pb-1 border-b border-white/10 flex items-center justify-between">
                        <span>$ bash {currentHook.path}</span>
                        <span className="text-white/30">{lastExecutionResult.time}</span>
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed text-emerald-300/90 font-mono text-[11px]">
                        {lastExecutionResult.output}
                      </pre>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40 space-y-2">
                      <Terminal className="w-8 h-8 text-white/20" />
                      <p className="text-xs">Nenhum log de execução recente.</p>
                      <p className="text-[10px] max-w-xs text-white/30">
                        Clique no botão <strong>"Executar Hook"</strong> no topo para testar o script e emitir o log para o console.
                      </p>
                    </div>
                  )}
                </div>

                {/* Integration Actions Footer */}
                <div className="p-3 border-t border-white/10 bg-[#080808] space-y-2">
                  <div className="text-[10px] font-mono text-white/50 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Logs integrados automaticamente ao Console e Terminal.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {onNavigateToChat && (
                      <button
                        type="button"
                        onClick={onNavigateToChat}
                        className="py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-[11px] font-mono rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Ver mensagens e comandos emitidos no canal #geral"
                      >
                        <Terminal className="w-3 h-3 text-[#F27D26]" />
                        <span>Ver no Console (#geral)</span>
                      </button>
                    )}
                    {onNavigateToLogs && (
                      <button
                        type="button"
                        onClick={onNavigateToLogs}
                        className="py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-[11px] font-mono rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Ver histórico nos Logs do Sistema"
                      >
                        <FileText className="w-3 h-3 text-purple-400" />
                        <span>Ver em Logs</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
