#!/usr/bin/env node
// adobe-mcp — serveur MCP local pour Premiere Pro et After Effects. Sans dépendance : Node ≥ 18 suffit.
import { readFileSync } from 'node:fs';
import { McpServer, text } from './mcp.js';
import { Bridge } from './bridge/server.js';
import { loadConfig, CONFIG_PATH, BRIDGE_FILE, LOG_DIR } from './config.js';
import { registerPproTools } from './tools/ppro/index.js';
import { registerAeftTools } from './tools/aeft.js';
import { registerMediaTools } from './tools/media.js';

const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

const INSTRUCTIONS = `adobe-mcp pilote Adobe Premiere Pro (tools ppro_*) et After Effects (tools aeft_*) via un panneau installé dans chaque application, plus des analyses locales (media_*).
Règles :
1) commencer par ppro_get_capabilities / aeft_get_capabilities ; si un hôte n'est pas connecté, demander à l'utilisateur d'ouvrir Fenêtre > Extensions > Adobe MCP dans l'application ;
2) lire avant d'écrire : ppro_get_sequence (avec range/tracks sur les longues séquences), ppro_get_clip_effects, aeft_get_comp ; les identifiants de clips "V1/3" changent après chaque coupe ou suppression, relire avant d'enchaîner ;
3) annoncer le plan avant une opération destructive (coupes, suppression de plages, remplacement) : dryRun renvoie le bilan ; un checkpoint est créé automatiquement et ppro_rewind permet de revenir en arrière ;
4) vérifier après : relire la structure ou exporter une image (ppro_export_frame, ppro_export_frames + media_contact_sheet) ;
5) temps en secondes décimales ; le pont aligne sur l'image la plus proche ;
6) jump cut = ppro_export_audio → media_detect_silences → ppro_remove_ranges ; niveaux = ppro_export_audio → media_loudness ;
7) noms d'effets/paramètres : anglais ou français courants acceptés ; en cas d'échec, la réponse liste les noms exacts ;
8) After Effects : expressions testées avec aeft_validate_expression ; images-clés avec easing par défaut ; ppro_replace_with_ae_comp demande les deux panneaux ouverts.
Le skill "adobe-editing" (et les skills de domaine) détaille les recettes.`;

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
  registerMediaTools(server, config);

  server.registerResource({ uri: 'adobe://status', name: 'État du pont adobe-mcp', description: 'Hôtes connectés', read: async () => JSON.stringify(bridge.status(), null, 2) });
  server.registerResource({ uri: 'adobe://ppro/active-sequence', name: 'Séquence active Premiere', description: 'Structure de la séquence active',
                            read: async () => JSON.stringify(await bridge.call('ppro', 'sequence.get', {}), null, 2) });
  server.registerResource({ uri: 'adobe://ppro/checkpoints', name: 'Sauvegardes de séquence', description: 'Checkpoints présents dans le projet Premiere',
                            read: async () => JSON.stringify(await bridge.call('ppro', 'safety.listCheckpoints', {}), null, 2) });
  server.registerResource({ uri: 'adobe://aeft/active-comp', name: 'Composition active After Effects', description: 'Calques de la composition active',
                            read: async () => JSON.stringify(await bridge.call('aeft', 'comp.get', { depth: 1 }), null, 2) });

  bridge.on('host', (h) => server.log('info', `${h.app} ${h.appVersion} connecté (${h.capabilities.size} fonctions)`));
  bridge.on('hostgone', (h) => server.log('warning', `${h.app} déconnecté`));

  const shutdown = () => { bridge.stop(); process.exit(0); };
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
  process.stdin.on('end', shutdown);

  server.start();
  process.stderr.write(`[adobe-mcp ${VERSION}] pont WebSocket sur 127.0.0.1:${bridge.port} — en attente des panneaux Adobe\n`);
}

main().catch((e) => { process.stderr.write(`[adobe-mcp] erreur fatale : ${e.stack || e}\n`); process.exit(1); });
