// Tools de projet et de séquences : import, chutiers, renommage, sauvegarde, création/duplication/extraction de séquences, pistes.
import { SEQ_ID, WRITE } from './common.js';

export function registerProjectTools(ctx) {
  const { tool, call, text } = ctx;

  tool({
    name: 'ppro_import_media', title: 'Importer des médias', annotations: WRITE,
    description: 'Importe des fichiers (vidéo, audio, image, SRT) dans le projet, dans un chutier optionnel. Chemins absolus. Renvoie les nodeId des éléments créés.',
    input: { required: ['paths'], properties: { paths: { type: 'array', items: { type: 'string' }, minItems: 1 }, bin: { type: 'string', description: 'Nom du chutier cible (créé s\'il n\'existe pas).' }, asSequence: { type: 'boolean', default: false, description: 'true : une séquence d\'images numérotées est importée comme un seul clip.' } } },
    handler: async (a) => text(await call('project.import', a, { timeoutMs: 180000 }))
  });

  tool({
    name: 'ppro_create_bin', title: 'Créer un chutier', annotations: WRITE,
    description: 'Crée un chutier (dossier) dans le projet, à la racine ou dans un chutier parent. Renvoie le chutier existant s\'il porte déjà ce nom.',
    input: { required: ['name'], properties: { name: { type: 'string' }, parent: { type: 'string', description: 'Chutier parent (nom).' } } },
    handler: async (a) => text(await call('project.createBin', a))
  });

  tool({
    name: 'ppro_move_items', title: 'Ranger des éléments', annotations: WRITE,
    description: 'Déplace des éléments de projet (nodeIds) dans un chutier (créé s\'il n\'existe pas ; vide = racine).',
    input: { required: ['nodeIds'], properties: { nodeIds: { type: 'array', items: { type: 'string' }, minItems: 1 }, bin: { type: 'string' } } },
    handler: async (a) => text(await call('project.moveItems', a))
  });

  tool({
    name: 'ppro_rename_item', title: 'Renommer un élément', annotations: WRITE,
    description: 'Renomme un élément de projet (média, séquence ou chutier) par nodeId.',
    input: { required: ['nodeId', 'name'], properties: { nodeId: { type: 'string' }, name: { type: 'string' } } },
    handler: async (a) => text(await call('project.renameItem', a))
  });

  tool({
    name: 'ppro_save_project', title: 'Enregistrer le projet', annotations: WRITE,
    description: 'Enregistre le projet (ou « Enregistrer sous » si as est donné : chemin .prproj). Le serveur enregistre déjà automatiquement après chaque opération destructive et au plus toutes les 2 min (config safety.autoSaveSeconds).',
    input: { properties: { as: { type: 'string', description: 'Chemin du nouveau fichier .prproj (Enregistrer sous).' } } },
    handler: async (a) => text(await call('project.save', a, { timeoutMs: 120000 }))
  });

  tool({
    name: 'ppro_create_sequence', title: 'Créer une séquence', annotations: WRITE,
    description: 'Crée une séquence vide. Avec preset (.sqpreset), sinon à partir des réglages d\'un média du projet (fromItem, ou la première vidéo trouvée), puis taille/fps demandés (settingsApplied indique si l\'ajustement a été accepté par cette version). N\'ouvre jamais la fenêtre « Nouvelle séquence » (qui bloque Premiere 2020).',
    input: { required: ['name'], properties: { name: { type: 'string' }, preset: { type: 'string', description: 'Chemin d\'un fichier .sqpreset.' }, fromItem: { type: 'string', description: 'nodeId du média dont la séquence reprend les réglages (défaut : première vidéo du projet).' }, width: { type: 'integer' }, height: { type: 'integer' }, fps: { type: 'number' } } },
    handler: async (a) => text(await call('sequence.create', a))
  });

  tool({
    name: 'ppro_duplicate_sequence', title: 'Dupliquer une séquence', annotations: WRITE,
    description: 'Copie indépendante d\'une séquence sous un nouveau nom (base d\'une variante : version courte, vertical, test).',
    input: { properties: { sequenceId: SEQ_ID, name: { type: 'string' }, bin: { type: 'string' }, activate: { type: 'boolean', default: false, description: 'true : la copie devient la séquence active.' } } },
    handler: async (a) => text(await call('sequence.duplicate', a, { timeoutMs: 120000 }))
  });

  tool({
    name: 'ppro_extract_range_to_sequence', title: 'Extraire une plage en séquence', annotations: WRITE,
    description: 'Crée une nouvelle séquence contenant uniquement la plage [start, end] (sous-séquence), sans modifier l\'originale. Base des extraits courts / shorts. Les points in/out de l\'utilisateur sont restaurés.',
    input: { required: ['start', 'end'], properties: { start: { type: 'number', minimum: 0 }, end: { type: 'number', minimum: 0 }, name: { type: 'string' }, sequenceId: SEQ_ID, activate: { type: 'boolean', default: false } } },
    handler: async (a) => text(await call('sequence.extractRange', a, { timeoutMs: 120000 }))
  });

  tool({
    name: 'ppro_set_track_state', title: 'État d\'une piste', annotations: WRITE,
    description: 'Verrouille/déverrouille, coupe le son (mute) ou cible une piste ("V2", "A1").',
    input: { required: ['track'], properties: { track: { type: 'string', pattern: '^[VAva][0-9]+$' }, locked: { type: 'boolean' }, muted: { type: 'boolean' }, targeted: { type: 'boolean' }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('track.setState', a))
  });

  tool({
    name: 'ppro_add_track', title: 'Ajouter des pistes', annotations: WRITE,
    description: 'Ajoute des pistes vidéo ou audio à la séquence.',
    input: { required: ['type'], properties: { type: { type: 'string', enum: ['video', 'audio'] }, count: { type: 'integer', minimum: 1, default: 1 }, audioType: { type: 'string', enum: ['mono', 'stereo'], default: 'stereo' }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('track.add', a))
  });
}
