// Tools de lecture : capacités, projet, séquences, éléments de projet.
import { SEQ_ID, TRACKS_SCHEMA, RANGE, READ_ONLY, WRITE } from './common.js';

export function registerReadTools(ctx) {
  const { tool, call, text, bridge, config } = ctx;

  tool({
    name: 'ppro_get_capabilities', title: 'Capacités Premiere Pro', annotations: READ_ONLY,
    description: 'Vérifie que Premiere Pro est connecté et renvoie sa version et la liste des fonctions disponibles. À appeler en premier.',
    handler: async () => {
      const h = bridge.host('ppro');
      if (!h) throw Object.assign(new Error('Premiere Pro n\'est pas connecté. Ouvrez Premiere puis Fenêtre > Extensions > Adobe MCP.'), { code: 'HOST_DISCONNECTED' });
      return text({ app: 'Premiere Pro', version: h.appVersion, bridge: `${h.bridge} ${h.bridgeVersion}`, os: h.os, functions: [...h.capabilities].sort(), safety: config.safety });
    }
  });

  tool({
    name: 'ppro_get_project', title: 'Projet Premiere', annotations: READ_ONLY,
    description: 'Nom, chemin, version de Premiere, nombre de séquences et séquence active du projet ouvert.',
    handler: async () => text(await call('project.get'))
  });

  tool({
    name: 'ppro_list_sequences', title: 'Lister les séquences', annotations: READ_ONLY,
    description: 'Toutes les séquences du projet : id, nom, fps, taille, durée, nombre de pistes.',
    handler: async () => text(await call('sequence.list'))
  });

  tool({
    name: 'ppro_get_active_sequence', title: 'Séquence active', annotations: READ_ONLY,
    description: 'Identité de la séquence active, tête de lecture, points in/out et clips sélectionnés dans la timeline (ce que l\'utilisateur a cliqué).',
    handler: async () => text(await call('sequence.getActive'))
  });

  tool({
    name: 'ppro_get_sequence', title: 'Lire une séquence', annotations: READ_ONLY,
    description: 'Structure complète d\'une séquence : pistes vidéo/audio, clips (id "V1/3", start/end/in/out en secondes, nom, média, désactivé, sélectionné), marqueurs, fps et durée d\'une image (frameTicks). ' +
      'Limiter avec range et tracks sur les longues séquences. Temps en secondes décimales.',
    input: { properties: { sequenceId: SEQ_ID, range: { ...RANGE, description: '[début, fin] en secondes : ne renvoie que les clips qui chevauchent cette plage.' }, tracks: TRACKS_SCHEMA, includeMarkers: { type: 'boolean', default: true } } },
    handler: async (a) => text(await call('sequence.get', a))
  });

  tool({
    name: 'ppro_list_items', title: 'Lister les éléments du projet', annotations: READ_ONLY,
    description: 'Arborescence des chutiers et médias du projet : nodeId, nom, type (bin/sequence/video/audio/image/caption/other), chemin du média, hors ligne, durée.',
    input: { properties: {
      bin: { type: 'string', description: 'Chutier de départ (nom, "A/B" pour un sous-chutier). Défaut : racine.' },
      type: { type: 'string', enum: ['bin', 'sequence', 'video', 'audio', 'image', 'caption', 'media', 'other'], description: 'Filtre par type ("media" = tout sauf chutiers et séquences).' },
      recursive: { type: 'boolean', default: true }, limit: { type: 'integer', minimum: 1, maximum: 5000, default: 500 }
    } },
    handler: async (a) => text(await call('project.listItems', a))
  });

  tool({
    name: 'ppro_get_item', title: 'Détail d\'un média', annotations: READ_ONLY,
    description: 'Détail d\'un élément de projet (nodeId) : chemin, in/out, proxy, étiquette de couleur, métadonnées XMP optionnelles.',
    input: { required: ['nodeId'], properties: { nodeId: { type: 'string' }, includeMetadata: { type: 'boolean', default: false } } },
    handler: async (a) => text(await call('project.getItem', a))
  });

  tool({
    name: 'ppro_set_active_sequence', title: 'Activer une séquence', annotations: WRITE,
    description: 'Ouvre la séquence donnée dans la timeline et la rend active.',
    input: { required: ['sequenceId'], properties: { sequenceId: { type: 'string' } } },
    handler: async (a) => text(await call('sequence.activate', a))
  });

  tool({
    name: 'ppro_seek', title: 'Déplacer la tête de lecture', annotations: WRITE,
    description: 'Place la tête de lecture à un instant (secondes, aligné sur l\'image la plus proche).',
    input: { required: ['time'], properties: { time: { type: 'number', minimum: 0 }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('sequence.seek', a))
  });

  tool({
    name: 'ppro_set_in_out', title: 'Points in/out', annotations: WRITE,
    description: 'Règle les points d\'entrée et/ou de sortie de la séquence (secondes). Utilisé par les exports de plage.',
    input: { properties: { in: { type: 'number', minimum: 0 }, out: { type: 'number', minimum: 0 }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('sequence.setInOut', a))
  });
}
