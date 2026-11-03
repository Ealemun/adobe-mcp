// Chemins et configuration de adobe-mcp.
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

export const HOME_DIR = join(homedir(), '.adobe-mcp');           // config, journaux
export const LOG_DIR = join(HOME_DIR, 'logs');
export const CONFIG_PATH = process.env.ADOBE_MCP_CONFIG || join(HOME_DIR, 'config.json');

/** Dossier où le panneau CEP lit bridge.json : SystemPath.USER_DATA côté CEP. */
export function userDataDir() {
  const p = platform();
  if (p === 'win32') return process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
  if (p === 'darwin') return join(homedir(), 'Library', 'Application Support');
  return process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
}
export const BRIDGE_FILE = join(userDataDir(), 'adobe-mcp', 'bridge.json');

export const DEFAULT_CONFIG = {
  bridge: { port: 8765 },
  safety: { confirmPolicy: 'batch', autoCheckpoint: true, allowScript: false },
  calls: { timeoutMs: 60000 },
  workers: { python: 'python', whisperModel: 'small', device: 'auto' }
};

function deepMerge(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b || {})) out[k] = (v && typeof v === 'object' && !Array.isArray(v)) ? deepMerge(a[k] || {}, v) : v;
  return out;
}

export function loadConfig() {
  mkdirSync(HOME_DIR, { recursive: true });
  mkdirSync(LOG_DIR, { recursive: true });
  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return structuredClone(DEFAULT_CONFIG);
  }
  try { return deepMerge(DEFAULT_CONFIG, JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))); }
  catch (e) { process.stderr.write(`[adobe-mcp] config.json illisible (${e.message}), valeurs par défaut utilisées\n`); return structuredClone(DEFAULT_CONFIG); }
}
