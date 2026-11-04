// Tools d'export : presets, audio (WAV pour analyse), rendu d'une plage ou de la séquence, suppression de plages (jump cut).
import { SEQ_ID, TRACKS_SCHEMA, RANGE, RANGES, DRY_RUN, DESTRUCTIVE, READ_ONLY, WRITE } from './common.js';

const CHECKPOINT_FLAG = { type: 'boolean', description: 'Forcer/empêcher la sauvegarde préalable (défaut : config safety.autoCheckpoint).' };
const PRESET = { type: 'string', description: 'Preset d\'export : chemin d\'un .epr, ou nom/expression régulière cherchée dans les presets installés (ex. "H.264", "YouTube 1080p", "ProRes", "wav").' };
const QUEUE = { type: 'string', enum: ['direct', 'ame'], default: 'direct', description: '"direct" : rendu immédiat (bloque Premiere jusqu\'à la fin) ; "ame" : envoie dans la file de Media Encoder et rend la main tout de suite.' };

export function registerRenderTools(ctx) {
  const { tool, call, text, withCheckpoint } = ctx;

  tool({
    name: 'ppro_remove_ranges', title: 'Supprimer des plages (jump cut)', annotations: DESTRUCTIVE,
    description: 'Retire des plages de temps de la timeline : coupe aux bornes, enlève les clips compris dans chaque plage, puis (ripple, défaut) referme les trous en reculant tout ce qui suit sur les pistes concernées. ' +
      'C\'est l\'étape finale du jump cut après media_detect_silences. Les plages se chevauchant sont fusionnées. Checkpoint automatique. Utiliser tracks "all" (défaut) pour garder vidéo et audio synchronisés. ' +
      'Avant de lancer : annoncer le nombre de plages et la durée retirée (dryRun les renvoie).',
    input: { required: ['ranges'], properties: { ranges: RANGES, tracks: TRACKS_SCHEMA, ripple: { type: 'boolean', default: true }, sequenceId: SEQ_ID, dryRun: DRY_RUN, checkpoint: CHECKPOINT_FLAG } },
    handler: (a) => withCheckpoint(a, 'remove-ranges', async (args, dryRun) => {
      if (dryRun) {
        const total = args.ranges.reduce((s, r) => s + Math.max(0, r.end - r.start), 0);
        return { plan: 'remove-ranges', ranges: args.ranges.length, timeRemoved: Math.round(total * 1000) / 1000, ripple: args.ripple ?? true, tracks: args.tracks ?? 'all', note: 'Aucune modification effectuée (dryRun).' };
      }
      return call('edit.removeRanges', args, { timeoutMs: 1800000 });
    })
  });

  tool({
    name: 'ppro_keep_ranges', title: 'Ne garder que des plages', annotations: DESTRUCTIVE,
    description: 'Inverse de ppro_remove_ranges : ne conserve que les plages données (tout le reste est retiré, les trous refermés). Checkpoint automatique.',
    input: { required: ['ranges'], properties: { ranges: RANGES, tracks: TRACKS_SCHEMA, ripple: { type: 'boolean', default: true }, sequenceId: SEQ_ID, dryRun: DRY_RUN, checkpoint: CHECKPOINT_FLAG } },
    handler: (a) => withCheckpoint(a, 'keep-ranges', async (args, dryRun) => dryRun ? { plan: 'keep-ranges', ranges: args.ranges.length } : call('edit.keepRanges', args, { timeoutMs: 1800000 }))
  });

  tool({
    name: 'ppro_list_export_presets', title: 'Presets d\'export', annotations: READ_ONLY,
    description: 'Presets d\'export (.epr) installés : système (Premiere, Media Encoder) et utilisateur. search = expression régulière (ex. "youtube", "wav", "prores"). details=true lit aussi le nom affiché (plus lent).',
    input: { properties: { search: { type: 'string' }, details: { type: 'boolean', default: false }, limit: { type: 'integer', minimum: 1, maximum: 1000, default: 200 }, refresh: { type: 'boolean', default: false } } },
    handler: async (a) => text(await call('export.listPresets', a, { timeoutMs: 300000 }))
  });

  tool({
    name: 'ppro_export_audio', title: 'Exporter l\'audio (WAV)', annotations: READ_ONLY,
    description: 'Exporte l\'audio de la séquence (ou d\'une plage, ou de certaines pistes : les autres sont coupées le temps de l\'export) en WAV dans le dossier temporaire, puis renvoie le chemin à passer à media_detect_silences / media_loudness. ' +
      'Bloque Premiere pendant l\'export (quelques secondes par minute de séquence).',
    input: { properties: { range: RANGE, tracks: TRACKS_SCHEMA, preset: { ...PRESET, description: 'Preset WAV (défaut : premier preset "wav" trouvé).' }, path: { type: 'string', description: 'Chemin .wav de sortie (défaut : dossier temporaire).' }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('export.audio', a, { timeoutMs: 1800000 }))
  });

  tool({
    name: 'ppro_export_sequence', title: 'Exporter la séquence', annotations: WRITE,
    description: 'Rend la séquence entière avec un preset (fichier dans <projet>/_adobe-mcp/exports par défaut). queue "ame" pour ne pas bloquer Premiere. Vérifier ensuite le fichier (media_probe sur le WAV, lecture par l\'utilisateur).',
    input: { required: ['preset'], properties: { preset: PRESET, path: { type: 'string' }, queue: QUEUE, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('export.render', a, { timeoutMs: 7200000 }))
  });

  tool({
    name: 'ppro_export_range', title: 'Exporter une plage', annotations: WRITE,
    description: 'Rend la plage [start, end] de la séquence avec un preset (les points in/out de l\'utilisateur sont restaurés). queue "ame" pour ne pas bloquer Premiere.',
    input: { required: ['start', 'end', 'preset'], properties: { start: { type: 'number', minimum: 0 }, end: { type: 'number', minimum: 0 }, preset: PRESET, path: { type: 'string' }, queue: QUEUE, sequenceId: SEQ_ID } },
    handler: async ({ start, end, ...rest }) => text(await call('export.render', { ...rest, range: [start, end] }, { timeoutMs: 7200000 }))
  });
}
