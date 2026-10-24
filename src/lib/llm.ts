import type { LLMModel } from '../types';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface LlmChatOptions {
  model: LLMModel;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LlmChatResult {
  content: string;
  provider: 'ollama' | '9router';
  modelId: string;
}

export interface OllamaStatus {
  ok: boolean;
  version?: string;
  models: string[];
  error?: string;
}

export interface RouterStatus {
  ok: boolean;
  models: string[];
  error?: string;
}

/** Nome limpo do modelo Ollama (remove prefixo ollama/). */
export function resolveOllamaModelName(modelId: string): string {
  return modelId.startsWith('ollama/') ? modelId.slice('ollama/'.length) : modelId;
}

export function isOllamaModel(model: LLMModel): boolean {
  return model.provider === 'ollama' || model.id.startsWith('ollama/');
}

/**
 * Chat via proxy do Vite:
 * - Ollama  → POST /api/ollama/api/chat   (docs: https://github.com/ollama/ollama/blob/main/docs/api.md)
 * - 9Router → POST /api/router/v1/chat/completions  (OpenAI-compat)
 */
export async function chatWithLlm(opts: LlmChatOptions): Promise<LlmChatResult> {
  const { model, messages, temperature = 0.7, maxTokens = 2048 } = opts;

  if (isOllamaModel(model)) {
    const ollamaModel = resolveOllamaModelName(model.id);
    const res = await fetch('/api/ollama/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Ollama HTTP ${res.status}: ${body.slice(0, 300) || res.statusText}`);
    }

    const data = await res.json();
    const content = data?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('Ollama respondeu sem conteúdo em message.content');
    }

    return { content, provider: 'ollama', modelId: ollamaModel };
  }

  // 9Router (OpenAI-compatible)
  const res = await fetch('/api/router/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model.id,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`9Router HTTP ${res.status}: ${body.slice(0, 300) || res.statusText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('9Router respondeu sem choices[0].message.content');
  }

  return { content, provider: '9router', modelId: model.id };
}

export async function checkOllamaStatus(): Promise<OllamaStatus> {
  try {
    const [tagsRes, versionRes] = await Promise.all([
      fetch('/api/ollama/api/tags'),
      fetch('/api/ollama/api/version').catch(() => null),
    ]);

    if (!tagsRes.ok) {
      return { ok: false, models: [], error: `HTTP ${tagsRes.status}` };
    }

    const tags = await tagsRes.json();
    const models = Array.isArray(tags?.models)
      ? tags.models.map((m: { name?: string }) => m.name).filter(Boolean)
      : [];

    let version: string | undefined;
    if (versionRes && versionRes.ok) {
      const v = await versionRes.json();
      version = v?.version;
    }

    return { ok: true, models, version };
  } catch (err) {
    return {
      ok: false,
      models: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function checkRouterStatus(): Promise<RouterStatus> {
  try {
    const res = await fetch('/api/router/v1/models');
    if (!res.ok) {
      return { ok: false, models: [], error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    const models = Array.isArray(data?.data)
      ? data.data.map((m: { id?: string }) => m.id).filter(Boolean)
      : [];
    return { ok: true, models };
  } catch (err) {
    return {
      ok: false,
      models: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
