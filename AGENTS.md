# AGENTS.md — guia para agentes de código

Instruções para qualquer harness de código (Claude Code, Codex, GitHub Copilot, OpenCode Go, Gemini/Antigravity e outros) que trabalhe neste repositório. Os arquivos `CLAUDE.md`, `GEMINI.md` e `.github/copilot-instructions.md` apontam para este.

## Projeto

Nexus Terminal: console local (React 19 + TypeScript + Vite 6 + Tailwind 4) para conversar com IA. Provedores de chat: **Ollama** (local), **9Router** (gateway local) e **OpenCode Go** (nuvem). Veja o `README.md`.

## Comandos

```bash
npm install
cp .env.example .env     # preencha só as chaves que for usar
npm run dev              # http://127.0.0.1:3000 (sobe o Ollama se existir)
npm run lint             # tsc --noEmit — obrigatório antes do PR
npm run build            # vite build — obrigatório antes do PR
```

Não há suíte de testes: valide com `lint` + `build`.

## Mapa do código

| Caminho | Função |
|---|---|
| `src/lib/llm.ts` | Cliente dos provedores (`chatWithLlm`, `check*Status`) |
| `vite.config.ts` | Proxies `/api/ollama`, `/api/router`, `/api/opencode`; injeta as chaves no servidor |
| `src/data/mockData.ts` | Catálogo `INITIAL_LLMS` e dados de exemplo |
| `src/types.ts` | `LLMModel.provider` e demais tipos |
| `src/components/SettingsView.tsx` | Status dos provedores |
| `scripts/ensure-ollama.mjs` | Garante o Ollama no ar (multiplataforma) |

### Adicionar um provedor

1. Tipo em `LLMModel.provider` (`src/types.ts`).
2. Função de chat + `check*Status` em `src/lib/llm.ts`.
3. Proxy no `vite.config.ts` (chave só no servidor) e variáveis no `.env.example`.
4. Modelo em `INITIAL_LLMS` e cartão de status em `SettingsView.tsx`.
5. Documentar no `README.md`.

## Regras

- **Segredos:** nunca faça commit de `.env` ou chaves. Chaves só em `.env`, usadas apenas no proxy do Vite; nunca no código do navegador.
- Use `127.0.0.1`, não `localhost` (IPv6 no Windows quebra o Ollama).
- Textos da interface, README e mensagens em **português (pt-BR)**; código e identificadores em inglês.
- Mudanças pequenas e focadas; não reformate arquivos inteiros nem mexa em `package-lock.json`/`bun.lock` sem alterar dependências.
- Não afirme que um endpoint ou id de modelo funciona sem testá-lo; marque como não validado no PR.

## Fluxo de PR

1. Crie um branch a partir de `main` (`feat/...`, `fix/...`, `docs/...`); nunca faça push direto em `main`.
2. Rode `npm run lint && npm run build`.
3. Commits curtos e descritivos. Identifique o agente com um trailer `Co-authored-by` quando a ferramenta o suportar.
4. Abra o PR contra `main` com: o que mudou, por que, como foi validado e o que **não** foi validado.
5. Um humano revisa e faz o merge.

## MCP (Model Context Protocol)

O Nexus Terminal ainda **não** expõe nem consome servidores MCP; a tela de MCP em `mockData.ts` é só exemplo. Para integrar:

- **Cliente MCP no app:** implemente no servidor (proxy/Express), nunca no navegador, e leia comandos e chaves do `.env`.
- **Harness usando MCP neste repositório:** configure localmente (ex.: `.mcp.json` do Claude Code, `~/.codex/config.toml`, `opencode.json`, `mcp_config` do Gemini/Antigravity). Esses arquivos **não** devem conter segredos versionados; use variáveis de ambiente.
- Servidores úteis: GitHub (issues/PRs), filesystem restrito à raiz do projeto, Playwright para testar a UI.
- Dê o mínimo de permissão: somente leitura por padrão; escrita/PR só quando a tarefa pedir.

## Permissões dos agentes

- Podem: ler o repositório, editar arquivos, rodar `npm run lint/build/dev`, criar branches e abrir PRs.
- Não podem: alterar `main` diretamente, fazer merge do próprio PR, mexer em segredos/`.env`, mudar configurações do GitHub ou publicar pacotes.
- Quem concede acesso é o dono do repositório (colaborador, token com escopo mínimo ou GitHub App); este arquivo é orientação, não controle de acesso. Proteja `main` com branch protection exigindo revisão.
