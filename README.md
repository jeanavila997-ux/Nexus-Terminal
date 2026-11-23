# Nexus Terminal

Console local para conversar com IA, acompanhar agentes e usar um terminal, rodando 100% na sua máquina. Não precisa de Google Cloud nem de API paga: o chat usa modelos locais via **Ollama**, o **9Router** (gateway local compatível com a API da OpenAI) ou o **OpenCode Go** (assinatura, API compatível com a OpenAI).

> Feito para quem quer IA funcionando mesmo com internet fraca, com os dados ficando no próprio computador.

## O que tem

| Tela | Status |
|---|---|
| Chat com IA (Ollama, 9Router e OpenCode Go) | ✅ Funcionando |
| Status dos provedores (online/offline e modelos instalados) | ✅ Funcionando |
| Arquivos, Logs, Monitor de recursos, Terminal interativo | 🚧 Interface pronta, ainda com dados de exemplo |
| Configurações | 🚧 Em andamento |

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · Motion · Recharts · Lucide

## Requisitos

- Node.js 18+
- [Ollama](https://ollama.com) instalado (para modelos locais)
- Opcional: 9Router rodando em `127.0.0.1:20128`
- Opcional: chave do OpenCode Go (`OPENCODE_API_KEY`)

## Como rodar

```bash
git clone https://github.com/jeanavila997-ux/Nexus-Terminal.git
cd Nexus-Terminal
npm install
cp .env.example .env   # preencha ROUTER_API_KEY e/ou OPENCODE_API_KEY, se usar
ollama pull qwen2.5-coder:3b-instruct
npm run dev
```

Abra http://127.0.0.1:3000.

O `npm run dev` roda antes o `scripts/ensure-ollama.mjs` (Windows, Mac e Linux), que confere se o Ollama está no ar e sobe o `ollama serve` se precisar. Se o Ollama não estiver instalado, só avisa e o app segue com os outros provedores. `npm run ollama:status` faz a mesma checagem e falha com código de saída ≠ 0 se o Ollama não subir.

### GitHub Copilot

O Copilot **não** é um provedor do chat: a GitHub não oferece API local compatível com a OpenAI para ele. Use-o ao lado do app, no editor ou com o Copilot CLI, para trabalhar neste repositório.

## Configuração (`.env`)

| Variável | Padrão | Para que serve |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Endereço da API do Ollama |
| `OLLAMA_MODEL` | `qwen2.5-coder:3b-instruct` | Modelo local padrão |
| `ROUTER_BASE_URL` | `http://127.0.0.1:20128/v1` | Endereço do 9Router |
| `ROUTER_API_KEY` | (vazio) | Chave do 9Router |
| `ROUTER_MODEL` | `cx/gpt-5.6-sol` | Modelo padrão no 9Router |
| `OPENCODE_BASE_URL` | `https://opencode.ai/zen/go/v1` | Endereço do OpenCode Go |
| `OPENCODE_API_KEY` | (vazio) | Chave do OpenCode Go |
| `APP_URL` | `http://127.0.0.1:3000` | URL do app |
| `DISABLE_HMR` | `false` | `true` desliga o hot reload |

## Segurança

As chaves do 9Router e do OpenCode Go ficam só no servidor do Vite: o navegador chama `/api/router/*` ou `/api/opencode/*` e o proxy adiciona o cabeçalho `Authorization`. As chaves nunca vão para o front-end. O servidor escuta em `0.0.0.0`, então qualquer máquina na sua rede acessa o proxy e usa suas chaves; em rede não confiável, rode com `npx vite --host 127.0.0.1`. Nunca faça commit do arquivo `.env`.

Use sempre `127.0.0.1` em vez de `localhost`: no Windows, `localhost` pode resolver para IPv6 e o Ollama escuta só em IPv4.

## Estrutura

```
src/
  App.tsx              # layout e navegação
  lib/llm.ts           # cliente do Ollama, 9Router e OpenCode Go
  components/          # Chat, Arquivos, Logs, Monitor, Terminal, Configurações
  data/mockData.ts     # dados de exemplo das telas em construção
scripts/
  ensure-ollama.mjs    # garante o Ollama no ar (multiplataforma)
```

## Próximos passos

- [ ] Ligar Arquivos, Logs e Monitor a dados reais
- [ ] Terminal interativo de verdade
- [ ] Streaming das respostas no chat

## Autor

Feito por [Jean Avila](https://github.com/jeanavila997-ux), pecuarista e dev no Acre, construindo ferramentas com IA para o agro e para pequenos negócios.
