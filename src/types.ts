export type ViewMode = 'chat' | 'status' | 'monitor' | 'files' | 'logs' | 'settings';

export interface CodeSnippet {
  filename: string;
  code: string;
  language: string;
}

export interface TerminalOutput {
  cwd: string;
  command: string;
  output: string;
  isError?: boolean;
}

export interface ImageAttachment {
  url: string;
  alt?: string;
  caption?: string;
  sourceType?: 'url' | 'html' | 'upload';
}

export interface Message {
  id: string;
  role: 'system' | 'user' | 'agent' | 'terminal';
  sender: string;
  time: string;
  content: string;
  actionBadge?: string;
  codeSnippet?: CodeSnippet;
  terminalOutput?: TerminalOutput;
  images?: ImageAttachment[];
  htmlSnippet?: string;
  killAction?: {
    pid: number;
    processName: string;
    cpu: number;
    executed?: boolean;
    autoTriggered?: boolean;
  };
}

export interface Channel {
  id: string;
  name: string;
  unreadCount?: number;
  description: string;
  isGeneral?: boolean;
  messages: Message[];
}

export interface LLMModel {
  id: string;
  name: string;
  provider: '9router' | 'openai' | 'anthropic' | 'deepseek' | 'meta' | 'ollama';
  description: string;
  badge?: string;
  contextWindow: string;
  speed: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  status: 'active' | 'idle' | 'running';
  capabilities: string[];
  skills: string[];
}

export interface MCPServer {
  id: string;
  name: string;
  status: 'online' | 'busy' | 'offline';
  latency: string;
  toolsCount: number;
  description: string;
}

export interface SkillTool {
  id: string;
  name: string;
  category: string;
  description: string;
  usageSnippet: string;
}

export interface CommandItem {
  id: string;
  title: string;
  command: string;
  category: string;
  description: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  isImage?: boolean;
  imageUrl?: string;
}

export interface ResourceMetricPoint {
  time: string;
  timestamp: number;
  cpuTotal: number;
  cpuCore1: number;
  cpuCore2: number;
  cpuCore3: number;
  cpuCore4: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  memoryPercent: number;
  networkRxKB: number; // Inbound / Download
  networkTxKB: number; // Outbound / Upload
  networkLatencyMs: number;
  ioReadKB: number;
  ioWriteKB: number;
}

export interface ProcessMetric {
  pid: number;
  name: string;
  category: 'system' | 'agent' | 'mcp' | 'dev';
  cpu: number;
  memoryMB: number;
  threads: number;
  status: 'running' | 'idle' | 'sleeping';
}

export type CpuAlertKillPolicy = 'suggest' | 'auto_kill' | 'disabled';

export interface CpuAlert {
  id: string;
  timestamp: number;
  time: string;
  cpuPercent: number;
  durationSeconds: number;
  alertActiveSeconds?: number;
  thresholdPercent: number;
  status: 'active' | 'resolved';
  resolvedAt?: string;
  killPolicy?: CpuAlertKillPolicy;
  killActionStatus?: 'none' | 'suggested' | 'executed';
  killedProcess?: {
    pid: number;
    name: string;
    executedAt: string;
    auto: boolean;
  };
  coreBreakdown?: {
    core1: number;
    core2: number;
    core3: number;
    core4: number;
  };
  topProcesses?: {
    name: string;
    cpu: number;
    pid: number;
  }[];
}

export interface SystemLogEntry {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'AGENT' | 'SUCCESS';
  source: string;
  message: string;
}

export type GitHookType = 'pre-commit' | 'post-push';

export interface GitHookRunResult {
  id: string;
  time: string;
  hookType: GitHookType;
  exitCode: number;
  status: 'success' | 'failed';
  durationMs: number;
  output: string;
}

export interface GitHookConfig {
  id: GitHookType;
  name: string;
  path: string;
  description: string;
  enabled: boolean;
  script: string;
  lastRun?: GitHookRunResult;
}
