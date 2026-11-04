// Tools effets, images-clés, transformations, volume, transitions, Lumetri, stabilisation, insertion, MOGRT, Auto Reframe.
import { SEQ_ID, CLIP_ID, CLIP_IDS, READ_ONLY, WRITE } from './common.js';

const EFFECT = { type: 'string', description: 'Nom de l\'effet tel qu\'affiché (anglais ou français : "Motion"/"Trajectoire", "Lumetri Color", "Gaussian Blur"…), son matchName, ou son index dans ppro_get_clip_effects.' };
const PARAMS = { type: 'object', additionalProperties: true, description: 'Paramètres {nom: valeur}. Nombre, booléen, chaîne, [x,y] pour une position, [r,g,b] (0-255) pour une couleur. Les noms acceptent anglais/français.' };
const AT = { type: 'number', minimum: 0, description: 'Secondes de séquence : pose une image-clé à cet instant au lieu d\'une valeur fixe.' };
const INTERP = { type: 'string', enum: ['linear', 'hold', 'bezier', 'ease'] };
const UNITS = { type: 'string', enum: ['px', 'normalized'], default: 'px', description: 'Unités de position/anchor : pixels de la séquence (défaut) ou normalisé 0..1 (0.5,0.5 = centre).' };

export function registerEffectTools(ctx) {
  const { tool, call, text } = ctx;

  tool({
    name: 'ppro_list_effects', title: 'Effets disponibles', annotations: READ_ONLY,
    description: 'Noms exacts des effets vidéo/audio et des transitions installés dans cette version (localisés). search = expression régulière.',
    input: { properties: { type: { type: 'string', enum: ['video', 'audio', 'transition', 'audioTransition'], default: 'video' }, search: { type: 'string' }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('effects.list', a))
  });

  tool({
    name: 'ppro_get_clip_effects', title: 'Effets d\'un clip', annotations: READ_ONLY,
    description: 'Effets du clip (Trajectoire, Opacité, Volume, effets ajoutés) avec leurs paramètres, valeurs et images-clés (temps de séquence). À lire avant de modifier.',
    input: { required: ['clipId'], properties: { clipId: CLIP_ID, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('effects.getClip', a))
  });

  tool({
    name: 'ppro_apply_effect', title: 'Appliquer un effet', annotations: WRITE,
    description: 'Ajoute un effet vidéo ou audio à des clips (s\'il est absent) et règle ses paramètres. Ex. "Gaussian Blur" {Blurriness: 20}, "Lumetri Color", "Warp Stabilizer". Lire ensuite ppro_get_clip_effects pour les noms exacts des paramètres.',
    input: { required: ['clipIds', 'effect'], properties: { clipIds: CLIP_IDS, effect: EFFECT, params: PARAMS, allowDuplicate: { type: 'boolean', default: false }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('effects.apply', a, { timeoutMs: 300000 }))
  });

  tool({
    name: 'ppro_remove_effect', title: 'Retirer un effet', annotations: WRITE,
    description: 'Retire un effet d\'un clip (pas les effets fixes Trajectoire/Opacité/Volume).',
    input: { required: ['clipId', 'effect'], properties: { clipId: CLIP_ID, effect: EFFECT, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('effects.remove', a))
  });

  tool({
    name: 'ppro_set_effect_params', title: 'Régler des paramètres', annotations: WRITE,
    description: 'Modifie des paramètres d\'un effet déjà présent sur un clip ; avec at, pose une image-clé à cet instant (secondes de séquence).',
    input: { required: ['clipId', 'effect', 'params'], properties: { clipId: CLIP_ID, effect: EFFECT, params: PARAMS, at: AT, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('effects.setParams', a))
  });

  tool({
    name: 'ppro_set_keyframes', title: 'Animer un paramètre', annotations: WRITE,
    description: 'Pose une animation complète sur un paramètre : keyframes[{t (secondes de séquence), value, interp?}]. replace=true (défaut) efface les images-clés existantes du paramètre.',
    input: { required: ['clipId', 'effect', 'param', 'keyframes'], properties: {
      clipId: CLIP_ID, effect: EFFECT, param: { type: 'string' },
      keyframes: { type: 'array', minItems: 1, items: { type: 'object', required: ['t', 'value'], additionalProperties: false, properties: { t: { type: 'number', minimum: 0 }, value: {}, interp: INTERP } } },
      replace: { type: 'boolean', default: true }, sequenceId: SEQ_ID
    } },
    handler: async (a) => text(await call('effects.setKeyframes', a))
  });

  tool({
    name: 'ppro_clear_keyframes', title: 'Supprimer les images-clés', annotations: WRITE,
    description: 'Supprime toutes les images-clés d\'un paramètre (il redevient fixe).',
    input: { required: ['clipId', 'effect', 'param'], properties: { clipId: CLIP_ID, effect: EFFECT, param: { type: 'string' }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('effects.clearKeyframes', a))
  });

  tool({
    name: 'ppro_set_transform', title: 'Transformer (échelle, position, rotation, opacité)', annotations: WRITE,
    description: 'Raccourci Trajectoire/Opacité sur des clips : scale (%), position [x,y], rotation (°), anchor [x,y], opacity (%). Avec at : image-clé à cet instant.',
    input: { required: ['clipIds'], properties: {
      clipIds: CLIP_IDS, scale: { type: 'number', minimum: 0 }, position: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 }, rotation: { type: 'number' },
      anchor: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 }, opacity: { type: 'number', minimum: 0, maximum: 100 }, positionUnits: UNITS, at: AT, sequenceId: SEQ_ID
    } },
    handler: async (a) => text(await call('effects.setTransform', a))
  });

  tool({
    name: 'ppro_punch_in', title: 'Punch-in (zooms)', annotations: WRITE,
    description: 'Zooms par images-clés sur l\'Échelle d\'un clip : ranges[{start, end, scale (défaut 112), position?}] en secondes de séquence, retour à l\'échelle de base entre les plages. ease "cut" (saut net, défaut) ou "ramp" (rampe de rampMs). Garder les yeux à la même hauteur avec position.',
    input: { required: ['clipId', 'ranges'], properties: {
      clipId: CLIP_ID,
      ranges: { type: 'array', minItems: 1, items: { type: 'object', required: ['start', 'end'], additionalProperties: false, properties: { start: { type: 'number' }, end: { type: 'number' }, scale: { type: 'number', default: 112 }, position: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 } } } },
      ease: { type: 'string', enum: ['cut', 'ramp'], default: 'cut' }, rampMs: { type: 'number', default: 300 }, positionUnits: UNITS, replace: { type: 'boolean', default: true }, sequenceId: SEQ_ID
    } },
    handler: async (a) => text(await call('effects.punchIn', a))
  });

  tool({
    name: 'ppro_set_clip_volume', title: 'Volume d\'un clip', annotations: WRITE,
    description: 'Règle le niveau (dB) de clips audio via l\'effet Volume ; avec at, image-clé. Vérifier ensuite à l\'oreille ou avec ppro_export_audio + media_loudness.',
    input: { required: ['clipIds', 'db'], properties: { clipIds: CLIP_IDS, db: { type: 'number', minimum: -60, maximum: 15 }, at: AT, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('audio.setClipVolume', a))
  });

  tool({
    name: 'ppro_set_volume_keyframes', title: 'Automation de volume', annotations: WRITE,
    description: 'Automation de volume d\'un clip audio : keyframes[{t, db}] (ducking manuel, fondus).',
    input: { required: ['clipId', 'keyframes'], properties: { clipId: CLIP_ID, keyframes: { type: 'array', minItems: 1, items: { type: 'object', required: ['t', 'db'], additionalProperties: false, properties: { t: { type: 'number', minimum: 0 }, db: { type: 'number' }, interp: INTERP } } }, replace: { type: 'boolean', default: true }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('audio.setVolumeKeyframes', a))
  });

  tool({
    name: 'ppro_add_transition', title: 'Ajouter une transition', annotations: WRITE,
    description: 'Pose une transition vidéo ou audio sur le début ("in"), la fin ("out") ou les deux bords d\'un clip. Défaut : Cross Dissolve (vidéo) / Constant Power (audio), 1 s. Le clip doit avoir des poignées. Le résultat dit si la transition a bien été ajoutée.',
    input: { required: ['clipId'], properties: { clipId: CLIP_ID, side: { type: 'string', enum: ['in', 'out', 'both'], default: 'in' }, name: { type: 'string', description: 'Nom de la transition (voir ppro_list_effects type "transition").' }, duration: { type: 'number', exclusiveMinimum: 0, default: 1, description: 'Durée en secondes.' }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('effects.addTransition', a))
  });

  tool({
    name: 'ppro_set_lumetri', title: 'Lumetri (correction de base)', annotations: WRITE,
    description: 'Applique Lumetri Color si absent et règle la Correction de base : basic {exposure, contrast, highlights, shadows, whites, blacks, temperature, tint, saturation}, creative {vibrance, sharpen…}. Petits pas (±10 à 30) ; vérifier par ppro_export_frame.',
    input: { required: ['clipIds'], properties: { clipIds: CLIP_IDS, basic: PARAMS, creative: PARAMS, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('effects.setLumetri', a, { timeoutMs: 300000 }))
  });

  tool({
    name: 'ppro_stabilize', title: 'Stabiliser (Warp Stabilizer)', annotations: WRITE,
    description: 'Applique le Stabilisateur de déformation à des clips ; l\'analyse démarre dans Premiere. Régler ensuite les paramètres avec ppro_set_effect_params.',
    input: { required: ['clipIds'], properties: { clipIds: CLIP_IDS, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('effects.stabilize', a, { timeoutMs: 300000 }))
  });

  tool({
    name: 'ppro_insert_clip', title: 'Placer un média', annotations: WRITE,
    description: 'Place un élément de projet (nodeId) dans la timeline à un instant : mode "overwrite" (écrase, défaut) ou "insert" (décale la suite). inPoint/outPoint (secondes du média) pour ne prendre qu\'une partie. Renvoie les clips créés.',
    input: { required: ['nodeId', 'time'], properties: { nodeId: { type: 'string' }, time: { type: 'number', minimum: 0 }, videoTrack: { type: 'string', pattern: '^[Vv][0-9]+$', default: 'V1' }, audioTrack: { type: 'string', pattern: '^[Aa][0-9]+$', default: 'A1' }, inPoint: { type: 'number', minimum: 0 }, outPoint: { type: 'number', minimum: 0 }, mode: { type: 'string', enum: ['overwrite', 'insert'], default: 'overwrite' }, includeAudio: { type: 'boolean', default: true }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('edit.insertClip', a, { timeoutMs: 120000 }))
  });

  tool({
    name: 'ppro_place_clips', title: 'Placer des médias par lot', annotations: WRITE,
    description: 'Assemblage par lot : items[{nodeId, time, videoTrack?, audioTrack?, inPoint?, outPoint?, mode?}] placés par ordre de temps (ours, montage sur beats, B-roll).',
    input: { required: ['items'], properties: {
      items: { type: 'array', minItems: 1, items: { type: 'object', required: ['nodeId', 'time'], additionalProperties: false, properties: { nodeId: { type: 'string' }, time: { type: 'number', minimum: 0 }, videoTrack: { type: 'string' }, audioTrack: { type: 'string' }, inPoint: { type: 'number' }, outPoint: { type: 'number' }, mode: { type: 'string', enum: ['overwrite', 'insert'] } } } },
      videoTrack: { type: 'string' }, audioTrack: { type: 'string' }, mode: { type: 'string', enum: ['overwrite', 'insert'] }, stopOnError: { type: 'boolean', default: true }, sequenceId: SEQ_ID
    } },
    handler: async (a) => text(await call('edit.placeClips', a, { timeoutMs: 600000 }))
  });

  tool({
    name: 'ppro_insert_mogrt', title: 'Insérer un MOGRT', annotations: WRITE,
    description: 'Insère un modèle d\'animations graphiques (.mogrt) sur une piste à un instant, règle sa durée et ses paramètres (texte, couleurs). Renvoie la liste des paramètres du modèle.',
    input: { required: ['path', 'time'], properties: { path: { type: 'string' }, time: { type: 'number', minimum: 0 }, duration: { type: 'number', exclusiveMinimum: 0 }, track: { type: 'string', pattern: '^[Vv][0-9]+$', default: 'V2' }, audioTrack: { type: 'string' }, params: PARAMS, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('mogrt.insert', a, { timeoutMs: 300000 }))
  });

  tool({
    name: 'ppro_list_mogrt_params', title: 'Paramètres d\'un MOGRT', annotations: READ_ONLY,
    description: 'Paramètres exposés d\'un MOGRT déjà placé dans la timeline (clipId).',
    input: { required: ['clipId'], properties: { clipId: CLIP_ID, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('mogrt.getParams', a))
  });

  tool({
    name: 'ppro_set_mogrt_params', title: 'Modifier un MOGRT', annotations: WRITE,
    description: 'Met à jour les paramètres d\'un MOGRT placé (texte, couleur [r,g,b], nombres).',
    input: { required: ['clipId', 'params'], properties: { clipId: CLIP_ID, params: PARAMS, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('mogrt.setParams', a))
  });

  tool({
    name: 'ppro_reframe_vertical', title: 'Auto Reframe (vertical)', annotations: WRITE,
    description: 'Crée une copie recadrée de la séquence (Auto Reframe, Premiere 2020+) au ratio voulu : 9:16, 1:1, 4:5. motion : slower (talking head), default, faster (sport). Vérifier ensuite par ppro_export_frames.',
    input: { properties: { aspect: { type: 'string', enum: ['9:16', '1:1', '4:5', '16:9', '4:3'], default: '9:16' }, motion: { type: 'string', enum: ['slower', 'default', 'faster'], default: 'default' }, name: { type: 'string' }, nest: { type: 'boolean', default: false }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('sequence.autoReframe', a, { timeoutMs: 1800000 }))
  });
}
