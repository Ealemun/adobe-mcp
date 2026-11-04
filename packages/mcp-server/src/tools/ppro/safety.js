// Tools de sécurité et d'interface : checkpoints, retour arrière, nettoyage, boîte de dialogue, export d'images.
import { imageContent } from '../../files.js';
import { SEQ_ID, RANGE, DESTRUCTIVE, READ_ONLY, WRITE } from './common.js';

export function registerSafetyTools(ctx) {
  const { tool, call, text } = ctx;

  tool({
    name: 'ppro_export_frame', title: 'Exporter une image', annotations: READ_ONLY,
    description: 'Exporte une image fixe (PNG, pleine résolution) de la séquence à l\'instant donné (défaut : tête de lecture) et la renvoie pour inspection visuelle. Par défaut le fichier va dans le dossier temporaire ; ne pas passer de path dans le dossier du projet sauf demande de l\'utilisateur.',
    input: { properties: { time: { type: 'number', minimum: 0 }, sequenceId: SEQ_ID, path: { type: 'string', description: 'Chemin de sortie .png (défaut : dossier temporaire).' }, inline: { type: 'boolean', default: true, description: 'false = ne renvoie que le chemin, sans l\'image.' } } },
    handler: async (a) => { const { inline = true, ...args } = a; return imageContent(await call('export.frame', args, { timeoutMs: 60000 }), { inline }); }
  });

  tool({
    name: 'ppro_export_frames', title: 'Exporter plusieurs images', annotations: READ_ONLY,
    description: 'Exporte une série d\'images (times[] ou une toutes les `every` secondes sur range) dans le dossier temporaire et renvoie leurs chemins (sans les images, pour économiser le contexte) ; regarder ensuite celles qui comptent avec ppro_export_frame ou en lisant le fichier. Max 60 par appel.',
    input: { properties: { times: { type: 'array', items: { type: 'number', minimum: 0 } }, every: { type: 'number', exclusiveMinimum: 0 }, range: RANGE, sequenceId: SEQ_ID, max: { type: 'integer', minimum: 1, maximum: 200, default: 60 } } },
    handler: async (a) => text(await call('export.frames', a, { timeoutMs: 600000 }))
  });

  tool({
    name: 'ppro_checkpoint', title: 'Sauvegarder la séquence', annotations: WRITE,
    description: 'Crée une copie horodatée de la séquence active (chutier _adobe-mcp) avant une opération risquée. Renvoie checkpointId pour ppro_rewind.',
    input: { properties: { label: { type: 'string', description: 'Étiquette courte (ex. "avant-silences").' }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('safety.checkpoint', a, { timeoutMs: 120000 }))
  });

  tool({
    name: 'ppro_list_checkpoints', title: 'Lister les sauvegardes', annotations: READ_ONLY,
    description: 'Sauvegardes (checkpoints) présentes dans le projet, de la plus ancienne à la plus récente.',
    handler: async () => text(await call('safety.listCheckpoints'))
  });

  tool({
    name: 'ppro_rewind', title: 'Revenir à une sauvegarde', annotations: DESTRUCTIVE,
    description: 'Restaure une sauvegarde : la copie devient la séquence de travail (même nom), la version actuelle est conservée renommée « (remplacée …) ». Rien n\'est supprimé.',
    input: { required: ['checkpointId'], properties: { checkpointId: { type: 'string' } } },
    handler: async (a) => text(await call('safety.rewind', a, { timeoutMs: 120000 }))
  });

  tool({
    name: 'ppro_prune_checkpoints', title: 'Nettoyer les sauvegardes', annotations: DESTRUCTIVE,
    description: 'Supprime les sauvegardes les plus anciennes et n\'en garde que `keep` (défaut 5). À proposer en fin de session, jamais sans accord.',
    input: { properties: { keep: { type: 'integer', minimum: 0, default: 5 } } },
    handler: async (a) => text(await call('safety.pruneCheckpoints', a))
  });

  tool({
    name: 'ppro_alert', title: 'Message dans Premiere', annotations: WRITE,
    description: 'Affiche une boîte de dialogue dans Premiere Pro (bloque l\'application jusqu\'à OK).',
    input: { required: ['message'], properties: { message: { type: 'string' } } },
    handler: async (a) => text(await call('ui.alert', a, { timeoutMs: 600000 }))
  });
}
