#!/usr/bin/env node
// adobe-mcp — serveur MCP local pour Premiere Pro et After Effects. Sans dépendance : Node ≥ 18 suffit.
import { readFileSync } from 'node:fs';
import { McpServer, text } from './mcp.js';
import { Bridge } from './bridge/server.js';
import { loadConfig, CONFIG_PATH, BRIDGE_FILE, LOG_DIR } from './config.js';
import { registerPproTools } from './tools/ppro.js';
import { registerAeftTools } from './tools/aeft.js';

const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

const INSTRUCTIONS = `adobe-mcp pilote Adobe Premiere Pro (tools ppro_*) et After Effects (tools aeft_*) via un panneau installé dans chaque application.
Règles : 1) commencer par ppro_get_capabilities / aeft_get_capabilities ; 2) lire la séquence (ppro_get_sequence) avant de modifier ;
3) annoncer le plan avant une opération destructive (coupes) et utiliser dryRun si l'utilisateur hésite ; 4) un checkpoint est créé automatiquement avant chaque coupe, proposer ppro_rewind en cas de doute ;
5) les temps sont en secondes décimales ; 6) si un hôte n'est pas connecté, demander à l'utilisateur d'ouvrir Fenêtre > Extensions > Adobe MCP dans l'application.`;

async function main() {
  const config = loadConfig();
  const bridge = new Bridge({ port: process.env.ADOBE_MCP_PORT !== undefined ? Number(process.env.ADOBE_MCP_PORT) : config.bridge.port, callTimeoutMs: config.calls.timeoutMs, serverVersion: VERSION });
  await bridge.start();

  const server = new McpServer({ name: 'adobe-mcp', version: VERSION, instructions: INSTRUCTIONS });

  server.registerTool({
    name: 'adobe_status', title: 'État du pont',
    description: 'Applications Adobe connectées au serveur (Premiere Pro, After Effects), leurs versions et fonctions, port du pont, chemins de config et de journaux.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true },
    handler: async () => text({ serverVersion: VERSION, bridgePort: bridge.port, bridgeFile: BRIDGE_FILE, configPath: CONFIG_PATH, logDir: LOG_DIR, hosts: bridge.status(),
                                hint: bridge.hosts.size ? undefined : 'Aucune application connectée : ouvrez Premiere Pro ou After Effects, puis Fenêtre > Extensions > Adobe MCP.' })
  });

  registerPproTools(server, bridge, config);
  registerAeftTools(server, bridge);

  server.registerResource({ uri: 'adobe://status', name: 'État du pont adobe-mcp', description: 'Hôtes connectés', read: async () => JSON.stringify(bridge.status(), null, 2) });
  server.registerResource({ uri: 'adobe://ppro/active-sequence', name: 'Séquence active Premiere', description: 'Structure de la séquence active',
                            read: async () => JSON.stringify(await bridge.call('ppro', 'sequence.get', {}), null, 2) });

  bridge.on('host', (h) => server.log('info', `${h.app} ${h.appVersion} connecté (${h.capabilities.size} fonctions)`));
  bridge.on('hostgone', (h) => server.log('warning', `${h.app} déconnecté`));

  const shutdown = () => { bridge.stop(); process.exit(0); };
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
  process.stdin.on('end', shutdown);

  server.start();
  process.stderr.write(`[adobe-mcp ${VERSION}] pont WebSocket sur 127.0.0.1:${bridge.port} — en attente des panneaux Adobe\n`);
}

main().catch((e) => { process.stderr.write(`[adobe-mcp] erreur fatale : ${e.stack || e}\n`); process.exit(1); });
