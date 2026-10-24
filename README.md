# Nexus Terminal

Console local para conversar com IA, acompanhar agentes e usar um terminal, rodando 100% na sua máquina. Não precisa de Google Cloud nem de API paga: o chat usa modelos locais via **Ollama** ou qualquer modelo exposto pelo **9Router** (gateway compatível com a API da OpenAI).

> Feito para quem quer IA funcionando mesmo com internet fraca, com os dados ficando no próprio computador.

## O que tem

| Tela | Status |
|---|---|
| Chat com IA (Ollama e 9Router) | ✅ Funcionando |
| Status dos provedores (online/offline e modelos instalados) | ✅ Funcionando |
| Arquivos, Logs, Monitor de recursos, Terminal interativo | 🚧 Interface pronta, ainda com dados de exemplo |
| Configurações | 🚧 Em andamento |

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · Motion · Recharts · Lucide

## Requisitos

- Node.js 18+
- [Ollama](https://ollama.com) instalado (para modelos locais)
- Opcional: 9Router rodando em `127.0.0.1:20128`
- Windows: PowerShell 7 (`pwsh`), usado pelo script que sobe o Ollama automaticamente

## Como rodar

```bash
git clone https://github.com/jeanavila997-ux/Nexus-Terminal.git
cd Nexus-Terminal
npm install
cp .env.example .env   # preencha ROUTER_API_KEY se for usar o 9Router
ollama pull qwen2.5-coder:3b-instruct
npm run dev
```

Abra http://127.0.0.1:3000.

No Windows, o `npm run dev` roda antes o `scripts/ensure-ollama.ps1`, que confere se o Ollama está no ar e sobe o `ollama serve` se precisar. Em Mac ou Linux sem `pwsh`, inicie o Ollama manualmente (`ollama serve`) e rode `npx vite`.

## Configuração (`.env`)

| Variável | Padrão | Para que serve |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Endereço da API do Ollama |
| `OLLAMA_MODEL` | `qwen2.5-coder:3b-instruct` | Modelo local padrão |
| `ROUTER_BASE_URL` | `http://127.0.0.1:20128/v1` | Endereço do 9Router |
| `ROUTER_API_KEY` | (vazio) | Chave do 9Router |
| `ROUTER_MODEL` | `cx/gpt-5.6-sol` | Modelo padrão no 9Router |
| `APP_URL` | `http://127.0.0.1:3000` | URL do app |
| `DISABLE_HMR` | `false` | `true` desliga o hot reload |

## Segurança

A chave do 9Router fica só no servidor do Vite: o navegador chama `/api/router/*` e o proxy adiciona o cabeçalho `Authorization`. A chave nunca vai para o front-end. Nunca faça commit do arquivo `.env`.

Use sempre `127.0.0.1` em vez de `localhost`: no Windows, `localhost` pode resolver para IPv6 e o Ollama escuta só em IPv4.

## Estrutura

```
src/
  App.tsx              # layout e navegação
  lib/llm.ts           # cliente do Ollama e do 9Router
  components/          # Chat, Arquivos, Logs, Monitor, Terminal, Configurações
  data/mockData.ts     # dados de exemplo das telas em construção
scripts/
  ensure-ollama.ps1    # garante o Ollama no ar (Windows)
```

## Próximos passos

- [ ] Ligar Arquivos, Logs e Monitor a dados reais
- [ ] Terminal interativo de verdade
- [ ] Streaming das respostas no chat
- [ ] Script de inicialização para Mac e Linux

## Autor

Feito por [Jean Avila](https://github.com/jeanavila997-ux), pecuarista e dev no Acre, construindo ferramentas com IA para o agro e para pequenos negócios.
