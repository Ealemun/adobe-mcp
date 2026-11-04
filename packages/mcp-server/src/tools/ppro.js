// Tools MCP Premiere Pro (phase 1 : spike).
import { imageContent } from '../files.js';
import { text } from '../mcp.js';

const TRACKS_SCHEMA = {
  description: 'Pistes concernées : "all" (défaut), "video", "audio", ou liste ["V1","A2"].',
  anyOf: [{ type: 'string', enum: ['all', 'video', 'audio'] }, { type: 'array', items: { type: 'string', pattern: '^[VAva][0-9]+$' } }]
};
const SEQ_ID = { type: 'string', description: 'ID de séquence (défaut : séquence active).' };
const DRY_RUN = { type: 'boolean', description: 'true = renvoie le plan sans rien modifier.', default: false };

export function registerPproTools(server, bridge, config) {
  const call = (fn, args, opts) => bridge.call('ppro', fn, args, opts);
  const destructive = { destructiveHint: true, idempotentHint: false, openWorldHint: false };
  const readOnly = { readOnlyHint: true, openWorldHint: false };

  server.registerTool({
    name: 'ppro_get_capabilities', title: 'Capacités Premiere Pro',
    description: 'Vérifie que Premiere Pro est connecté et renvoie sa version et la liste des fonctions disponibles. À appeler en premier.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: readOnly,
    handler: async () => {
      const h = bridge.host('ppro');
      if (!h) throw Object.assign(new Error('Premiere Pro n\'est pas connecté. Ouvrez Premiere puis Fenêtre > Extensions > Adobe MCP.'), { code: 'HOST_DISCONNECTED' });
      return text({ app: 'Premiere Pro', version: h.appVersion, bridge: `${h.bridge} ${h.bridgeVersion}`, os: h.os, functions: [...h.capabilities].sort(), safety: config.safety });
    }
  });

  server.registerTool({
    name: 'ppro_get_project', title: 'Projet Premiere',
    description: 'Nom, chemin, version de Premiere, nombre de séquences et séquence active du projet ouvert.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: readOnly,
    handler: async () => text(await call('project.get'))
  });

  server.registerTool({
    name: 'ppro_list_sequences', title: 'Lister les séquences',
    description: 'Toutes les séquences du projet : id, nom, fps, taille, durée, nombre de pistes.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: readOnly,
    handler: async () => text(await call('sequence.list'))
  });

  server.registerTool({
    name: 'ppro_get_sequence', title: 'Lire une séquence',
    description: 'Structure complète d\'une séquence : pistes vidéo/audio, clips (id "V1/3", start/end/in/out en secondes, nom, média, désactivé), marqueurs. ' +
      'Limiter avec range et tracks sur les longues séquences. Temps en secondes décimales.',
    inputSchema: {
      type: 'object', additionalProperties: false,
      properties: {
        sequenceId: SEQ_ID,
        range: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2, description: '[début, fin] en secondes : ne renvoie que les clips qui chevauchent cette plage.' },
        tracks: TRACKS_SCHEMA,
        includeMarkers: { type: 'boolean', default: true }
      }
    }, annotations: readOnly,
    handler: async (a) => text(await call('sequence.get', a))
  });

  server.registerTool({
    name: 'ppro_set_active_sequence', title: 'Activer une séquence',
    description: 'Ouvre la séquence donnée dans la timeline et la rend active.',
    inputSchema: { type: 'object', required: ['sequenceId'], additionalProperties: false, properties: { sequenceId: { type: 'string' } } },
    handler: async (a) => text(await call('sequence.activate', a))
  });

  server.registerTool({
    name: 'ppro_seek', title: 'Déplacer la tête de lecture',
    description: 'Place la tête de lecture à un instant (secondes).',
    inputSchema: { type: 'object', required: ['time'], additionalProperties: false, properties: { time: { type: 'number', minimum: 0 }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('sequence.seek', a))
  });

  server.registerTool({
    name: 'ppro_cut_at', title: 'Couper (razor)',
    description: 'Coupe les clips aux instants donnés (secondes) sur les pistes choisies. Opération destructive : une sauvegarde de la séquence (checkpoint) est créée automatiquement avant, sauf si autoCheckpoint est désactivé. ' +
      'Utiliser dryRun pour obtenir le plan. Arrondir les temps à la frame (1/fps).',
    inputSchema: {
      type: 'object', required: ['times'], additionalProperties: false,
      properties: {
        times: { type: 'array', items: { type: 'number', minimum: 0 }, minItems: 1, description: 'Instants de coupe en secondes.' },
        tracks: TRACKS_SCHEMA,
        includeAudio: { type: 'boolean', default: true, description: 'false = ne coupe que les pistes vidéo.' },
        sequenceId: SEQ_ID, dryRun: DRY_RUN,
        checkpoint: { type: 'boolean', description: 'Forcer/empêcher la sauvegarde préalable (défaut : config safety.autoCheckpoint).' }
      }
    }, annotations: destructive,
    handler: async (a) => {
      const { dryRun, checkpoint, ...args } = a;
      args.times = [...new Set(args.times.map(Number))].sort((x, y) => x - y);
      if (dryRun) return text({ plan: 'cut', times: args.times, tracks: args.tracks ?? 'all', includeAudio: args.includeAudio ?? true, note: 'Aucune modification effectuée (dryRun).' });
      let ckpt = null;
      if (checkpoint ?? config.safety.autoCheckpoint) ckpt = await call('safety.checkpoint', { label: 'cut', sequenceId: args.sequenceId });
      const result = await call('edit.cutAt', args);
      return text({ ...result, checkpoint: ckpt });
    }
  });

  server.registerTool({
    name: 'ppro_import_media', title: 'Importer des médias',
    description: 'Importe des fichiers (vidéo, audio, image) dans le projet, dans un chutier optionnel. Chemins absolus.',
    inputSchema: {
      type: 'object', required: ['paths'], additionalProperties: false,
      properties: { paths: { type: 'array', items: { type: 'string' }, minItems: 1 }, bin: { type: 'string', description: 'Nom du chutier cible (créé s\'il n\'existe pas).' } }
    },
    handler: async (a) => text(await call('project.import', a, { timeoutMs: 180000 }))
  });

  server.registerTool({
    name: 'ppro_export_frame', title: 'Exporter une image',
    description: 'Exporte une image fixe (PNG, pleine résolution) de la séquence à l\'instant donné (défaut : tête de lecture) et la renvoie pour inspection visuelle. Par défaut le fichier va dans le dossier temporaire ; ne pas passer de path dans le dossier du projet sauf demande de l\'utilisateur.',
    inputSchema: {
      type: 'object', additionalProperties: false,
      properties: {
        time: { type: 'number', minimum: 0 }, sequenceId: SEQ_ID,
        path: { type: 'string', description: 'Chemin de sortie .png (défaut : dossier temporaire).' },
        inline: { type: 'boolean', default: true, description: 'false = ne renvoie que le chemin, sans l\'image.' }
      }
    }, annotations: readOnly,
    handler: async (a) => {
      const { inline = true, ...args } = a;
      const r = await call('export.frame', args, { timeoutMs: 60000 });
      return imageContent(r, { inline });
    }
  });

  server.registerTool({
    name: 'ppro_checkpoint', title: 'Sauvegarder la séquence',
    description: 'Crée une copie horodatée de la séquence active (chutier _adobe-mcp) avant une opération risquée. Renvoie checkpointId pour ppro_rewind.',
    inputSchema: { type: 'object', additionalProperties: false, properties: { label: { type: 'string', description: 'Étiquette courte (ex. "avant-silences").' }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('safety.checkpoint', a))
  });

  server.registerTool({
    name: 'ppro_list_checkpoints', title: 'Lister les sauvegardes',
    description: 'Sauvegardes (checkpoints) présentes dans le projet.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: readOnly,
    handler: async () => text(await call('safety.listCheckpoints'))
  });

  server.registerTool({
    name: 'ppro_rewind', title: 'Revenir à une sauvegarde',
    description: 'Restaure une sauvegarde : la copie devient la séquence de travail (même nom), la version actuelle est conservée renommée « (remplacée …) ». Rien n\'est supprimé.',
    inputSchema: { type: 'object', required: ['checkpointId'], additionalProperties: false, properties: { checkpointId: { type: 'string' } } },
    annotations: destructive,
    handler: async (a) => text(await call('safety.rewind', a))
  });

  server.registerTool({
    name: 'ppro_alert', title: 'Message dans Premiere',
    description: 'Affiche une boîte de dialogue dans Premiere Pro (bloque l\'application jusqu\'à OK).',
    inputSchema: { type: 'object', required: ['message'], additionalProperties: false, properties: { message: { type: 'string' } } },
    handler: async (a) => text(await call('ui.alert', a, { timeoutMs: 600000 }))
  });
}
