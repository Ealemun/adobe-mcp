// Tools complémentaires : rognage, lien/délien, vitesse, sons, sous-titres, infos audio.
import { SEQ_ID, CLIP_ID, CLIP_IDS, TRACKS_SCHEMA, READ_ONLY, WRITE } from './common.js';

export function registerExtraTools(ctx) {
  const { tool, call, text } = ctx;

  tool({
    name: 'ppro_trim_clip', title: 'Rogner un clip', annotations: WRITE,
    description: 'Déplace le bord de début (start) et/ou de fin (end) d\'un clip, en secondes de séquence, sans décaler le reste. Le contenu reste calé (comme tirer un bord avec l\'outil Sélection).',
    input: { required: ['clipId'], properties: { clipId: CLIP_ID, start: { type: 'number', minimum: 0 }, end: { type: 'number', minimum: 0 }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('edit.trimClip', a))
  });

  tool({
    name: 'ppro_unlink_clips', title: 'Délier vidéo/audio', annotations: WRITE,
    description: 'Délie la vidéo et l\'audio des clips donnés (pour un J-cut/L-cut : délier, puis ppro_trim_clip ou ppro_move_clip sur l\'audio seul).',
    input: { required: ['clipIds'], properties: { clipIds: CLIP_IDS, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('edit.setLinked', { ...a, linked: false }))
  });
  tool({
    name: 'ppro_link_clips', title: 'Lier vidéo/audio', annotations: WRITE,
    description: 'Lie les clips donnés (vidéo + audio) pour qu\'ils se déplacent ensemble.',
    input: { required: ['clipIds'], properties: { clipIds: CLIP_IDS, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('edit.setLinked', { ...a, linked: true }))
  });

  tool({
    name: 'ppro_set_clip_speed', title: 'Vitesse / durée d\'un clip', annotations: WRITE,
    description: 'Change la vitesse d\'un clip (speed en %, ou duration cible en secondes), inversion et conservation de la hauteur du son. Fonction QE non documentée : vérifiée après coup, sinon erreur claire (faire clic droit > Vitesse/Durée).',
    input: { required: ['clipId'], properties: { clipId: CLIP_ID, speed: { type: 'number', exclusiveMinimum: 0 }, duration: { type: 'number', exclusiveMinimum: 0 }, reverse: { type: 'boolean', default: false }, maintainPitch: { type: 'boolean', default: true }, ripple: { type: 'boolean', default: false }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('edit.setSpeed', a))
  });

  tool({
    name: 'ppro_place_sfx', title: 'Placer des sons', annotations: WRITE,
    description: 'Importe et pose des effets sonores : items[{path, time, track?, gainDb?}] (piste audio A3 par défaut, gain en dB appliqué au clip).',
    input: { required: ['items'], properties: { items: { type: 'array', minItems: 1, items: { type: 'object', required: ['path', 'time'], additionalProperties: false, properties: { path: { type: 'string' }, time: { type: 'number', minimum: 0 }, track: { type: 'string', pattern: '^[Aa][0-9]+$' }, gainDb: { type: 'number' } } } }, track: { type: 'string', pattern: '^[Aa][0-9]+$', default: 'A3' }, gainDb: { type: 'number' }, bin: { type: 'string' }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('edit.placeSfx', a, { timeoutMs: 300000 }))
  });

  tool({
    name: 'ppro_import_captions', title: 'Importer des sous-titres', annotations: WRITE,
    description: 'Importe un fichier .srt/.vtt/.scc et le pose sur la piste vidéo du haut à partir de time (clip de légendes). Premiere 2020 : style via Fenêtre > Légendes. Export SRT : l\'utilisateur passe par Exporter > Légendes.',
    input: { required: ['path'], properties: { path: { type: 'string' }, time: { type: 'number', minimum: 0, default: 0 }, track: { type: 'string', pattern: '^[Vv][0-9]+$' }, bin: { type: 'string' }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('captions.import', a, { timeoutMs: 120000 }))
  });

  tool({
    name: 'ppro_get_audio_info', title: 'Infos audio', annotations: READ_ONLY,
    description: 'Pistes audio : état (mute, verrou) et volume (dB) de chaque clip d\'après l\'effet Volume.',
    input: { properties: { tracks: TRACKS_SCHEMA, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('audio.getInfo', a))
  });
}
