// Garante que o Ollama está servindo a API (Windows, macOS e Linux).
// Sem o Ollama instalado, apenas avisa e segue (o app funciona com outros provedores).
import { spawn } from 'node:child_process';
import 'dotenv/config';

const base = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
const strict = process.argv.includes('--strict');

async function up() {
  try {
    const res = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.models) ? data.models.length : 0;
  } catch {
    return null;
  }
}

function finish(code) {
  process.exit(strict ? code : 0);
}

const count = await up();
if (count !== null) {
  console.log(`[ollama] OK em ${base} (${count} modelos)`);
  finish(0);
}

console.log(`[ollama] API fora (${base}). Tentando "ollama serve"...`);
const child = spawn('ollama', ['serve'], { detached: true, stdio: 'ignore' });
let missing = false;
child.on('error', () => {
  missing = true;
});
child.unref();

for (let i = 1; i <= 20; i++) {
  await new Promise((r) => setTimeout(r, 1000));
  if (missing) break;
  const n = await up();
  if (n !== null) {
    console.log(`[ollama] OK apos ${i}s (${n} modelos)`);
    finish(0);
  }
}

console.warn(
  missing
    ? '[ollama] binário "ollama" não encontrado no PATH. Instale em https://ollama.com/download'
    : '[ollama] "ollama serve" não respondeu em 20s.',
);
finish(1);
