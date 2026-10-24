import { Agent, Channel, CommandItem, LLMModel, MCPServer, ProjectFile, SkillTool, GitHookConfig } from '../types';

export const INITIAL_LLMS: LLMModel[] = [
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    description: 'Raciocínio multimodal de alta velocidade e precisão para código.',
    badge: 'Recomendado',
    contextWindow: '128k',
    speed: 'Rápido',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Especialista em arquitetura, refatoração de código complexo e escrita técnica.',
    contextWindow: '200k',
    speed: 'Equilibrado',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Janela de contexto massiva de 2M tokens com análise profunda de repositórios.',
    contextWindow: '2M',
    speed: 'Ultra Rápido',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    description: 'Modelo de raciocínio lógico profundo e resolução algorítmica avançada.',
    contextWindow: '64k',
    speed: 'Raciocínio',
  },
];

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'dev-agent',
    name: 'DevAgent',
    role: 'Full-Stack Developer',
    description: 'Escreve código, executa scripts no terminal e gerencia arquivos do projeto.',
    icon: 'Code',
    status: 'active',
    capabilities: ['Node.js', 'Express', 'React', 'Terminal Shell', 'File I/O'],
    skills: ['Read File', 'Write File', 'Exec CMD', 'Bash'],
  },
  {
    id: 'research-agent',
    name: 'ResearchAgent',
    role: 'Web & Docs Researcher',
    description: 'Pesquisa na web, documentações de APIs e sintetiza informações técnicas.',
    icon: 'Compass',
    status: 'idle',
    capabilities: ['Web Search', 'API Docs Scraping', 'Benchmark Analysis'],
    skills: ['HTTP Request', 'JSON Parse'],
  },
  {
    id: 'data-agent',
    name: 'DataAgent',
    role: 'Database & Analytics',
    description: 'Executa queries em bancos de dados SQL/NoSQL e analisa datasets estruturados.',
    icon: 'Database',
    status: 'idle',
    capabilities: ['PostgreSQL', 'Firestore', 'Data Pipelines', 'ETL'],
    skills: ['SQL Query', 'JSON Parse'],
  },
  {
    id: 'security-agent',
    name: 'SecurityAgent',
    role: 'Security & Vulnerability Auditor',
    description: 'Verifica vulnerabilidades em dependências (npm audit), secrets e CORS.',
    icon: 'Shield',
    status: 'idle',
    capabilities: ['Static Analysis', 'Secret Scanner', 'Dependency Audit'],
    skills: ['Exec CMD', 'Read File'],
  },
];

export const INITIAL_MCP_SERVERS: MCPServer[] = [
  {
    id: 'local-fs',
    name: 'Local FS',
    status: 'online',
    latency: '4ms',
    toolsCount: 12,
    description: 'Acesso direto ao sistema de arquivos local do container.',
  },
  {
    id: 'web-search',
    name: 'Web Search',
    status: 'online',
    latency: '120ms',
    toolsCount: 4,
    description: 'Motor de busca em tempo real para documentações e pacotes.',
  },
  {
    id: 'node-runner',
    name: 'Node Runner',
    status: 'online',
    latency: '18ms',
    toolsCount: 6,
    description: 'Ambiente de execução isolado para scripts Node.js e Bash.',
  },
  {
    id: 'db-postgres',
    name: 'PostgreSQL MCP',
    status: 'busy',
    latency: '35ms',
    toolsCount: 8,
    description: 'Conector de banco de dados relacional e migrações DDL.',
  },
];

export const INITIAL_SKILLS: SkillTool[] = [
  { id: 'read-file', name: 'Read File', category: 'FS', description: 'Lê conteúdo de qualquer arquivo no workspace', usageSnippet: 'fs.readFile(path, "utf-8")' },
  { id: 'write-file', name: 'Write File', category: 'FS', description: 'Cria ou edita arquivos com substituição atômica', usageSnippet: 'fs.writeFile(path, content)' },
  { id: 'exec-cmd', name: 'Exec CMD', category: 'Shell', description: 'Executa comandos assíncronos no shell', usageSnippet: 'child_process.exec(cmd)' },
  { id: 'bash', name: 'Bash', category: 'Shell', description: 'Sessão interativa do terminal Bash/PowerShell', usageSnippet: 'bash -c "npm test"' },
  { id: 'http-req', name: 'HTTP Request', category: 'Network', description: 'Faz chamadas HTTP REST e GraphQL', usageSnippet: 'fetch("https://api.site.com")' },
  { id: 'json-parse', name: 'JSON Parse', category: 'Data', description: 'Valida e formata JSON/YAML', usageSnippet: 'JSON.parse(data)' },
  { id: 'img-render', name: 'HTML Image', category: 'Media', description: 'Renderiza imagens diretas no preview HTML', usageSnippet: '<img src="url" alt="preview" />' },
  { id: 'git-commit', name: 'Git Commit', category: 'VCS', description: 'Gerencia ramificações e commits no repositório', usageSnippet: 'git commit -m "update"' },
];

export const INITIAL_COMMANDS: CommandItem[] = [
  {
    id: 'setup-project',
    title: 'Setup Project',
    command: 'npm init -y && npm install express dotenv lucide-react',
    category: 'Inicialização',
    description: 'Instala dependências base e inicializa servidor Express',
  },
  {
    id: 'deploy-app',
    title: 'Deploy App',
    command: 'npm run build && gcloud run deploy --source .',
    category: 'DevOps',
    description: 'Compila a aplicação e envia build de produção para o Cloud Run',
  },
  {
    id: 'code-audit',
    title: 'Code Audit',
    command: 'npm audit && npx eslint . --ext .ts,.tsx',
    category: 'Qualidade',
    description: 'Executa verificação de segurança e análise estática de código',
  },
  {
    id: 'log-analysis',
    title: 'Log Analysis',
    command: 'tail -n 50 /var/log/nexus/app.log | grep -E "ERROR|WARN"',
    category: 'Monitoramento',
    description: 'Inspeciona os últimos logs do sistema em busca de erros',
  },
  {
    id: 'add-image-link',
    title: 'Add HTML Image Link',
    command: 'echo \'<img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800" alt="Code Terminal" />\' >> index.html',
    category: 'HTML & Mídia',
    description: 'Insere um link direto para imagem no HTML e atualiza preview',
  },
];

export const INITIAL_FILES: ProjectFile[] = [
  {
    id: 'server-js',
    name: 'server.js',
    path: '/server.js',
    language: 'javascript',
    content: `const express = require('express');
const app = express();
const port = 3000;

// Middleware para servir arquivos estáticos e imagens HTML
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Nexus Terminal Server</title>
      <style>
        body { background: #131313; color: #e5e2e1; font-family: monospace; padding: 2rem; }
        .hero-img { max-width: 100%; border-radius: 8px; border: 1px solid #444; }
      </style>
    </head>
    <body>
      <h1>Nexus Terminal Express Server Active</h1>
      <p>Servidor rodando na porta \${port}. Imagem direta do HTML:</p>
      <!-- Link direto para imagem no HTML -->
      <img class="hero-img" src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80" alt="Developer Terminal" />
    </body>
    </html>
  \`);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    agent: 'DevAgent',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(\`Server listening at http://localhost:\${port}\`);
});`,
  },
  {
    id: 'package-json',
    name: 'package.json',
    path: '/package.json',
    language: 'json',
    content: `{
  "name": "nexus-terminal-project",
  "version": "1.0.0",
  "description": "Nexus Terminal full-stack environment with direct HTML image linking and agent orchestration",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \\"Error: no test specified\\" && exit 0"
  },
  "dependencies": {
    "express": "^4.21.2",
    "dotenv": "^17.2.3",
    "lucide-react": "^0.546.0"
  }
}`,
  },
  {
    id: 'index-html',
    name: 'index.html',
    path: '/public/index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus Terminal Preview</title>
  <style>
    body {
      background: #131313;
      color: #e5e2e1;
      font-family: 'Space Grotesk', system-ui, sans-serif;
      margin: 0;
      padding: 24px;
    }
    .card {
      background: #1c1b1b;
      border: 1px solid #444653;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .direct-image {
      width: 100%;
      height: 240px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #2a2a2a;
      transition: transform 0.3s ease;
    }
    .direct-image:hover {
      transform: scale(1.01);
    }
    .badge {
      background: rgba(184, 196, 255, 0.15);
      color: #b8c4ff;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">NEXUS WORKSPACE</span>
    <h2>Serviço Web com Suporte a Links Diretos de Imagens</h2>
    <p>Você pode inserir links diretos para imagens (Unsplash, URLs externas, assets locais) diretamente nas tags <code>&lt;img src="..." /&gt;</code> do HTML:</p>
    
    <!-- Imagem Direta do HTML 1: Terminal & Código -->
    <img 
      class="direct-image" 
      src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80" 
      alt="Ambiente de Desenvolvimento Terminal" 
    />
    
    <div style="margin-top: 16px;">
      <p>Outra imagem incorporada via link direto:</p>
      <!-- Imagem Direta do HTML 2: Dashboard Analytics -->
      <img 
        class="direct-image" 
        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80" 
        alt="Dashboard e Métricas" 
      />
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'readme-md',
    name: 'README.md',
    path: '/README.md',
    language: 'markdown',
    content: `# Nexus Terminal ⚡

Ambiente completo de console de terminal e orquestração de agentes.

## 🚀 Recursos
- Gerenciador integrado de Git Hooks (\`pre-commit\` e \`post-push\`)
- Suporte nativo a tags \`<img>\` com **links diretos para imagens no HTML**
- Execução de comandos interativos no PowerShell / Bash
- Múltiplos agentes (DevAgent, ResearchAgent, DataAgent, SecurityAgent)
- Servidores MCP integrados (Local FS, Web Search, Node Runner)
- Seleção dinâmica de LLMs (GPT-4o, Claude 3.5, Gemini 1.5 Pro, DeepSeek R1)
- Canais de comunicação dedicados (# Geral, # Frontend, # Backend, # Deploy)
`,
  },
  {
    id: 'hook-pre-commit',
    name: 'pre-commit',
    path: '/.git/hooks/pre-commit',
    language: 'shell',
    content: `#!/bin/bash
# ==========================================================
# Nexus Terminal - Git pre-commit Hook
# ==========================================================
echo "🔍 [GIT HOOK: pre-commit] Iniciando auditoria de pré-commit..."

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
exit 0`,
  },
  {
    id: 'hook-post-push',
    name: 'post-push',
    path: '/.git/hooks/post-push',
    language: 'shell',
    content: `#!/bin/bash
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
  --connect-timeout 2 || echo "ℹ️ [INFO] Webhook de CI/CD enfileirado para Cloud Run."

# 2. Registro no canal #deploy
echo "🔔 Notificando canal #deploy e atualizando status operacional..."
echo "✅ [SUCESSO] Pipeline pós-push concluído com sucesso."
exit 0`,
  },
];

export const INITIAL_GIT_HOOKS: GitHookConfig[] = [
  {
    id: 'pre-commit',
    name: 'pre-commit',
    path: '.git/hooks/pre-commit',
    description: 'Executado antes da confirmação do commit pelo Git. Valida integridade de código, checagem de tipos e previne vazamento de credenciais e segredos.',
    enabled: true,
    script: `#!/bin/bash
# ==========================================================
# Nexus Terminal - Git pre-commit Hook
# ==========================================================
echo "🔍 [GIT HOOK: pre-commit] Iniciando auditoria de pré-commit..."

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
exit 0`,
    lastRun: {
      id: 'run-pre-1',
      time: '10:41:20',
      hookType: 'pre-commit',
      exitCode: 0,
      status: 'success',
      durationMs: 312,
      output: `🔍 [GIT HOOK: pre-commit] Iniciando auditoria de pré-commit...
⚡ Validando tipagem estática do projeto...
   ✔ 0 errors found in 14 files
🔒 Verificando vazamento acidental de chaves de API (.env / tokens)...
   ✔ Nenhum padrão de chave de API encontrado no commit staged
✅ [SUCESSO] Todas as verificações de pré-commit foram aprovadas.`,
    },
  },
  {
    id: 'post-push',
    name: 'post-push',
    path: '.git/hooks/post-push',
    description: 'Executado automaticamente após o envio com sucesso do código para o repositório remoto. Dispara gatilhos de CI/CD, notificações em canais e webhooks de deploy.',
    enabled: true,
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
  --connect-timeout 2 || echo "ℹ️ [INFO] Webhook de CI/CD enfileirado para Cloud Run."

# 2. Registro no canal #deploy
echo "🔔 Notificando canal #deploy e atualizando status operacional..."
echo "✅ [SUCESSO] Pipeline pós-push concluído com sucesso."
exit 0`,
    lastRun: {
      id: 'run-post-1',
      time: '10:42:00',
      hookType: 'post-push',
      exitCode: 0,
      status: 'success',
      durationMs: 460,
      output: `🚀 [GIT HOOK: post-push] Branch 'main' sincronizada no commit a1c8f39
📡 Despachando webhook para fila de deploy contínuo...
   ✔ Payload HTTP 202 Accepted recebido de https://api.nexus.internal
🔔 Notificando canal #deploy e atualizando status operacional...
✅ [SUCESSO] Pipeline pós-push concluído com sucesso.`,
    },
  },
];

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'general',
    name: 'Geral',
    unreadCount: 2,
    isGeneral: true,
    description: 'Canal principal de comandos, inicialização de servidores e tarefas de desenvolvimento.',
    messages: [
      {
        id: 'msg-1',
        role: 'system',
        sender: 'System',
        time: '10:42 AM',
        content: 'Initializing Nexus Terminal environment. Connection established. Ready for agentic tasks.',
      },
      {
        id: 'msg-2',
        role: 'user',
        sender: 'User',
        time: '10:43 AM',
        content: 'Setup a basic Express server in the current directory.',
      },
      {
        id: 'msg-3',
        role: 'agent',
        sender: 'Nexus Agent',
        time: '10:43 AM',
        actionBadge: 'ACTION',
        content: 'I will initialize a new Node project, install Express, and create a basic server.js file to listen on port 3000.',
        codeSnippet: {
          filename: 'server.js',
          language: 'javascript',
          code: `const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Nexus Terminal Express Server Active');
});

app.listen(port, () => {
  console.log(\`Server listening at http://localhost:\${port}\`);
});`,
        },
        terminalOutput: {
          cwd: 'PS C:\\Projects\\Nexus>',
          command: 'npm init -y && npm install express && node server.js',
          output: `PS C:\\Projects\\Nexus> npm init -y
Wrote to C:\\Projects\\Nexus\\package.json...

PS C:\\Projects\\Nexus> npm install express
added 62 packages, and audited 63 packages in 2s

PS C:\\Projects\\Nexus> node server.js
Server listening at http://localhost:3000`,
        },
      },
      {
        id: 'msg-4',
        role: 'user',
        sender: 'User',
        time: '10:45 AM',
        content: 'É possível adicionar links diretos para as imagens do HTML no preview e na resposta?',
      },
      {
        id: 'msg-5',
        role: 'agent',
        sender: 'Nexus Agent',
        time: '10:45 AM',
        actionBadge: 'ACTION',
        content: 'Sim, totalmente! Você pode adicionar links diretos de imagens utilizando tags normais do HTML (`<img src="https://..." />`), links diretos de CDN ou arquivos locais da pasta `/public`. Abaixo configurei o preview com links diretos funcionais:',
        codeSnippet: {
          filename: 'public/index.html',
          language: 'html',
          code: `<!-- Link direto para imagem externa no HTML -->
<img 
  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80" 
  alt="Nexus Terminal Workspace" 
  class="rounded-lg border border-[#444653] w-full shadow-lg"
/>`,
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
            alt: 'Terminal Code Workspace',
            caption: 'Link direto carregado: https://images.unsplash.com/photo-1555066931-4365d14bab8c',
            sourceType: 'html',
          },
          {
            url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
            alt: 'Analytics & Dashboards',
            caption: 'Link direto de métricas: https://images.unsplash.com/photo-1551288049-bebda4e38f71',
            sourceType: 'html',
          }
        ],
        terminalOutput: {
          cwd: 'PS C:\\Projects\\Nexus>',
          command: 'curl -I https://images.unsplash.com/photo-1555066931-4365d14bab8c',
          output: `HTTP/2 200 OK
content-type: image/jpeg
content-length: 184520
cache-control: public, max-age=31536000
access-control-allow-origin: *
[OK] Direct image URL validated and rendered in Workspace Preview!`,
        },
      }
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend',
    unreadCount: 0,
    description: 'Interface do usuário com Tailwind CSS, animações Motion e componentes React.',
    messages: [
      {
        id: 'f-msg-1',
        role: 'system',
        sender: 'System',
        time: '09:15 AM',
        content: 'Canal #Frontend inicializado. Vite + Tailwind CSS 4 ativo.',
      },
      {
        id: 'f-msg-2',
        role: 'user',
        sender: 'User',
        time: '09:16 AM',
        content: 'Como renderizar imagens diretas no painel do Workspace?',
      },
      {
        id: 'f-msg-3',
        role: 'agent',
        sender: 'Nexus Agent',
        time: '09:17 AM',
        actionBadge: 'ACTION',
        content: 'Basta passar o atributo `src` com o link direto da imagem no elemento `<img>` ou usar o componente de preview integrado do Nexus Terminal. As imagens são carregadas com fallbacks e suporte a zoom/modal.',
      },
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    unreadCount: 0,
    description: 'APIs Express, rotas REST, conexão com banco de dados e MCP servers.',
    messages: [
      {
        id: 'b-msg-1',
        role: 'system',
        sender: 'System',
        time: '08:00 AM',
        content: 'Canal #Backend pronto. Conectado ao Local FS e Node Runner.',
      }
    ],
  },
  {
    id: 'deploy',
    name: 'Deploy',
    unreadCount: 0,
    description: 'Pipelines CI/CD, contêineres Docker, logs de produção e métricas Cloud Run.',
    messages: [
      {
        id: 'd-msg-1',
        role: 'system',
        sender: 'System',
        time: '07:30 AM',
        content: 'Pipeline de build verificado com sucesso. Porta 3000 exposta.',
      }
    ],
  }
];
