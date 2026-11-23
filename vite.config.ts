import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

/**
 * Proxies locais (chave do 9Router fica no servidor Vite, nao no browser):
 *   /api/ollama/*  →  http://127.0.0.1:11434/*
 *   /api/router/*  →  http://127.0.0.1:20128/*
 *   /api/opencode/* →  https://opencode.ai/zen/go/* (OpenCode Go, chave só no servidor)
 *
 * Sempre 127.0.0.1 — no Windows, localhost pode resolver pra ::1.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const routerKey = env.ROUTER_API_KEY || '';
  const ollamaTarget = env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const opencodeKey = env.OPENCODE_API_KEY || '';
  const opencodeTarget = (env.OPENCODE_BASE_URL || 'https://opencode.ai/zen/go/v1').replace(/\/v1\/?$/, '');
  const routerTarget = (env.ROUTER_BASE_URL || 'http://127.0.0.1:20128/v1').replace(/\/v1\/?$/, '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      // DISABLE_HMR=true desliga HMR/file watch (útil em edições em massa por agentes).
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/ollama': {
          target: ollamaTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/ollama/, ''),
        },
        '/api/opencode': {
          target: opencodeTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/opencode/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (opencodeKey) {
                proxyReq.setHeader('Authorization', `Bearer ${opencodeKey}`);
              }
            });
          },
        },
        '/api/router': {
          target: routerTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/router/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (routerKey) {
                proxyReq.setHeader('Authorization', `Bearer ${routerKey}`);
              }
            });
          },
        },
      },
    },
  };
});
