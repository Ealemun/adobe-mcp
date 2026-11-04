<#
.SYNOPSIS
  Installe (ou retire) adobe-mcp sur Windows, sans droits administrateur.
.DESCRIPTION
  1. Vérifie Node.js (>= 18).
  2. Autorise les panneaux CEP non signés (PlayerDebugMode, CEP 8 à 12).
  3. Installe le panneau "Adobe MCP" dans %APPDATA%\Adobe\CEP\extensions (jonction vers ce dépôt).
  4. Déclare le serveur MCP auprès des clients MCP détectés (voir scripts\clients.json).
  5. Copie les instructions de montage (skills\adobe-editing) dans le dossier de skills des clients qui en ont un.
.PARAMETER Remove
  Retire le panneau, les entrées de configuration et les skills copiés. Laisse %USERPROFILE%\.adobe-mcp (journaux, config).
.PARAMETER Purge
  Avec -Remove : supprime aussi %USERPROFILE%\.adobe-mcp.
.PARAMETER Copy
  Copie le panneau au lieu de créer une jonction (utile si le dépôt est sur un lecteur réseau ou amovible).
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\install.ps1
  powershell -ExecutionPolicy Bypass -File scripts\install.ps1 -Remove
#>
[CmdletBinding()]
param([switch]$Remove, [switch]$Purge, [switch]$Copy)

$ErrorActionPreference = 'Stop'
$Root     = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Panel    = Join-Path $Root 'packages\host-cep'
$Server   = Join-Path $Root 'packages\mcp-server\src\index.js'
$Skill    = Join-Path $Root 'skills\adobe-editing'
$ExtDir   = Join-Path $env:APPDATA 'Adobe\CEP\extensions'
$Link     = Join-Path $ExtDir 'com.adobe-mcp.panel'
$Clients  = Get-Content (Join-Path $PSScriptRoot 'clients.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$ServerId = 'adobe'
$Report   = @()

function Step($msg) { Write-Host "`n== $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "   OK  $msg" -ForegroundColor Green;  $script:Report += "OK   $msg" }
function Warn($msg) { Write-Host "   !!  $msg" -ForegroundColor Yellow; $script:Report += "!!   $msg" }
function Expand($p) { [Environment]::ExpandEnvironmentVariables($p) }

function Read-JsonFile($path) {
  if (Test-Path $path) { $raw = Get-Content $path -Raw; if ($raw.Trim()) { return ($raw | ConvertFrom-Json) } }
  return [pscustomobject]@{}
}
function Write-JsonFile($path, $obj) {
  New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
  if (Test-Path $path) { Copy-Item $path "$path.bak-adobe-mcp" -Force }   # sauvegarde avant modification
  $json = $obj | ConvertTo-Json -Depth 20
  # UTF-8 SANS BOM : Set-Content -Encoding UTF8 de PowerShell 5.1 ajoute un BOM que les clients Node refusent
  [System.IO.File]::WriteAllText($path, $json, (New-Object System.Text.UTF8Encoding($false)))
}
# Exécute un programme externe sans que PowerShell 5.1 transforme sa sortie d'erreur en exception.
function Invoke-Native([string]$exe, [string[]]$argv) {
  $prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  try { $out = & $exe @argv 2>&1 | ForEach-Object { "$_" } } finally { $ErrorActionPreference = $prev }
  return [pscustomobject]@{ Code = $LASTEXITCODE; Output = ($out -join "`n") }
}
# Chemins de configuration d'un client : tous les candidats dont le dossier existe (jokers acceptés),
# sinon le dernier candidat sans joker.
function Get-ConfigTargets($c) {
  $targets = @(); $fallback = $null
  foreach ($cand in @($c.configFiles)) {
    $p = Expand $cand
    if ($p -match '\*') {
      $parentPattern = Split-Path $p; $leaf = Split-Path $p -Leaf
      foreach ($d in @(Get-Item -Path $parentPattern -ErrorAction SilentlyContinue)) { $targets += (Join-Path $d.FullName $leaf) }
    } else {
      $fallback = $p
      if (Test-Path (Split-Path $p)) { $targets += $p }
    }
  }
  if ($targets.Count -eq 0 -and $fallback) { $targets = @($fallback) }
  return $targets | Select-Object -Unique
}
function Set-ServerEntry($cfg, $key) {
  if (-not ($cfg.PSObject.Properties.Name -contains $key)) { $cfg | Add-Member -NotePropertyName $key -NotePropertyValue ([pscustomobject]@{}) }
  $entry = [pscustomobject]@{ command = 'node'; args = @($Server) }
  $cfg.$key | Add-Member -NotePropertyName $ServerId -NotePropertyValue $entry -Force
}
function Remove-ServerEntry($cfg, $key) {
  if (($cfg.PSObject.Properties.Name -contains $key) -and ($cfg.$key.PSObject.Properties.Name -contains $ServerId)) { $cfg.$key.PSObject.Properties.Remove($ServerId); return $true }
  return $false
}

# ------------------------------------------------------------------ désinstallation
if ($Remove) {
  Step 'Retrait du panneau'
  if (Test-Path $Link) { (Get-Item $Link).Delete(); Ok "panneau retiré : $Link" } else { Warn 'panneau absent' }

  Step 'Retrait des configurations clients'
  foreach ($c in $Clients) {
    if ($c.configFiles) {
      foreach ($path in (Get-ConfigTargets $c)) {
        if (Test-Path $path) { $cfg = Read-JsonFile $path; if (Remove-ServerEntry $cfg $c.configKey) { Write-JsonFile $path $cfg; Ok "entrée '$ServerId' retirée de $($c.name) ($path)" } }
      }
    }
    if ($c.cli -and (Get-Command $c.cli -ErrorAction SilentlyContinue)) {
      $r = Invoke-Native $c.cli @('mcp','remove','--scope','user',$ServerId)
      if ($r.Code -eq 0) { Ok "entrée '$ServerId' retirée via $($c.cli)" }
    }
    if ($c.skillsDir) { $sd = Join-Path (Expand $c.skillsDir) 'adobe-editing'; if (Test-Path $sd) { Remove-Item $sd -Recurse -Force; Ok "skill retiré : $sd" } }
  }
  if ($Purge) { $home1 = Join-Path $env:USERPROFILE '.adobe-mcp'; if (Test-Path $home1) { Remove-Item $home1 -Recurse -Force; Ok "supprimé : $home1" } }
  Write-Host "`nDésinstallation terminée. PlayerDebugMode reste activé (sans effet si aucun panneau non signé n'est installé)." -ForegroundColor Green
  exit 0
}

# ------------------------------------------------------------------ 1. Node.js
Step 'Node.js'
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Write-Host "Node.js est introuvable. Installez la version LTS depuis https://nodejs.org puis relancez ce script." -ForegroundColor Red; exit 1 }
$ver = (& node --version).TrimStart('v'); $major = [int]($ver.Split('.')[0])
if ($major -lt 18) { Write-Host "Node.js $ver trouvé, version 18 ou plus requise : https://nodejs.org" -ForegroundColor Red; exit 1 }
Ok "Node.js $ver ($($node.Source))"
if (-not (Test-Path $Server)) { Write-Host "Serveur introuvable : $Server" -ForegroundColor Red; exit 1 }

# ------------------------------------------------------------------ 2. PlayerDebugMode
Step 'Autorisation des panneaux non signés (PlayerDebugMode)'
foreach ($v in 8..12) {
  $key = "HKCU:\Software\Adobe\CSXS.$v"
  if (-not (Test-Path $key)) { New-Item -Path $key -Force | Out-Null }
  Set-ItemProperty -Path $key -Name 'PlayerDebugMode' -Value '1' -Type String
}
Ok 'CEP 8 à 12 (Premiere/After Effects 2018 à aujourd''hui)'

# ------------------------------------------------------------------ 3. Panneau
Step 'Installation du panneau Adobe MCP'
New-Item -ItemType Directory -Force -Path $ExtDir | Out-Null
if (Test-Path $Link) { (Get-Item $Link).Delete() }
if ($Copy) { Copy-Item $Panel $Link -Recurse; Ok "panneau copié dans $Link" }
else {
  try { New-Item -ItemType Junction -Path $Link -Target $Panel | Out-Null; Ok "jonction $Link -> $Panel (les mises à jour du dépôt sont prises en compte sans réinstaller)" }
  catch { Copy-Item $Panel $Link -Recurse; Warn "jonction impossible, panneau copié dans $Link (relancer l'installeur après une mise à jour)" }
}

# ------------------------------------------------------------------ 4. Clients MCP
Step 'Déclaration du serveur MCP auprès des clients'
$configured = 0
foreach ($c in $Clients) {
  $present = $false
  if ($c.detect) { foreach ($d in $c.detect) { if (Get-Item -Path (Expand $d) -ErrorAction SilentlyContinue) { $present = $true } } }
  if ($c.cli -and (Get-Command $c.cli -ErrorAction SilentlyContinue)) { $present = $true }
  if (-not $present) { continue }
  if ($c.cli -and (Get-Command $c.cli -ErrorAction SilentlyContinue)) {
    $null = Invoke-Native $c.cli @('mcp','remove','--scope','user',$ServerId)   # « No MCP server named… » attendu au premier passage
    $r = Invoke-Native $c.cli @('mcp','add','--scope','user',$ServerId,'--','node',$Server)
    if ($r.Code -eq 0) { Ok "$($c.name) : serveur '$ServerId' déclaré via '$($c.cli) mcp add'"; $configured++ }
    else { Warn "$($c.name) : '$($c.cli) mcp add' a échoué (code $($r.Code)) : $($r.Output)" }
  } elseif ($c.configFiles) {
    foreach ($path in (Get-ConfigTargets $c)) {
      try {
        $cfg = Read-JsonFile $path; Set-ServerEntry $cfg $c.configKey; Write-JsonFile $path $cfg
        Ok "$($c.name) : serveur '$ServerId' déclaré dans $path"; $configured++
      } catch { Warn "$($c.name) : impossible d'écrire $path ($($_.Exception.Message))" }
    }
    if ($c.restartHint) { Warn "$($c.name) : $($c.restartHint)" }
  }
  if ($c.skillsDir) {
    $sd = Join-Path (Expand $c.skillsDir) 'adobe-editing'
    New-Item -ItemType Directory -Force -Path $sd | Out-Null
    Copy-Item (Join-Path $Skill '*') $sd -Recurse -Force
    Ok "$($c.name) : instructions de montage copiées dans $sd"
  }
}
if ($configured -eq 0) {
  Warn 'aucun client MCP détecté. Ajoutez manuellement ce serveur dans votre client :'
  Write-Host (@{ mcpServers = @{ $ServerId = @{ command = 'node'; args = @($Server) } } } | ConvertTo-Json -Depth 5)
}

# ------------------------------------------------------------------ 5. Test rapide du serveur
Step 'Test du serveur'
$t = Invoke-Native 'node' @((Join-Path $Root 'packages\mcp-server\test\smoke.js'))
$testOut = $t.Output
if ($t.Code -eq 0) { Ok 'test de fumée réussi (serveur MCP + pont WebSocket)' } else { Warn "test de fumée en échec :`n$testOut" }

# ------------------------------------------------------------------ résumé
Write-Host "`n================ Résumé ================" -ForegroundColor Cyan
$Report | ForEach-Object { Write-Host "  $_" }
Write-Host @"

Étapes suivantes :
  1. Lancez (ou relancez) Premiere Pro / After Effects.
  2. Menu Fenêtre > Extensions > Adobe MCP : le panneau doit afficher « Connecté » dès que votre client MCP a démarré le serveur.
  3. Dans votre client MCP, demandez : « Quelles sont tes capacités Premiere ? »
  Journaux : $env:USERPROFILE\.adobe-mcp\logs      Configuration : $env:USERPROFILE\.adobe-mcp\config.json
"@ -ForegroundColor Green
