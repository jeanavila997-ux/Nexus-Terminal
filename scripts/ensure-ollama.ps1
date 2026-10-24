<#
.SYNOPSIS
  Garante que o Ollama está servindo a API em 127.0.0.1:11434.

.DESCRIPTION
  1. Testa GET /api/tags
  2. Se falhar, tenta `ollama serve` em background
  3. Aguarda até 20s e re-testa

  Use sempre 127.0.0.1 (no Windows, localhost pode ir para IPv6 e o Ollama
  escuta só IPv4 — timeout ~2s em vez de falha rápida).

.EXAMPLE
  .\scripts\ensure-ollama.ps1
#>
$ErrorActionPreference = 'Continue'
$Api = 'http://127.0.0.1:11434/api/tags'

function Test-Ollama {
  try {
    $r = Invoke-RestMethod -Uri $Api -TimeoutSec 3
    return @{ Ok = $true; Count = @($r.models).Count }
  } catch {
    return @{ Ok = $false; Error = $_.Exception.Message }
  }
}

Write-Host '==> Checando Ollama em 127.0.0.1:11434 ...'
$probe = Test-Ollama
if ($probe.Ok) {
  Write-Host "  OK  API no ar ($($probe.Count) modelos)" -ForegroundColor Green
  exit 0
}

Write-Host "  !!  API fora: $($probe.Error)" -ForegroundColor Yellow

$ollama = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollama) {
  Write-Host '  ERRO ollama.exe nao esta no PATH. Instale: winget install Ollama.Ollama' -ForegroundColor Red
  exit 2
}

Write-Host '==> Subindo: ollama serve'
Start-Process -FilePath $ollama.Source -ArgumentList 'serve' -WindowStyle Hidden
Write-Host '  aguardando API...'

for ($i = 1; $i -le 20; $i++) {
  Start-Sleep -Seconds 1
  $probe = Test-Ollama
  if ($probe.Ok) {
    Write-Host "  OK  ollama serve respondeu apos ${i}s ($($probe.Count) modelos)" -ForegroundColor Green
    exit 0
  }
  Write-Host "  ... tentativa $i/20"
}

Write-Host '  ERRO timeout: ollama serve nao abriu a API em 20s' -ForegroundColor Red
Write-Host '  Dica: abra o app Ollama pelo menu Iniciar ou rode: ollama serve'
exit 1
