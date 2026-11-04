// Tools de montage : coupes, suppression, désactivation, déplacement, sélection.
import { SEQ_ID, TRACKS_SCHEMA, DRY_RUN, CLIP_ID, CLIP_IDS, RANGES, DESTRUCTIVE, WRITE } from './common.js';

const CHECKPOINT_FLAG = { type: 'boolean', description: 'Forcer/empêcher la sauvegarde préalable (défaut : config safety.autoCheckpoint).' };

export function registerEditTools(ctx) {
  const { tool, call, text, withCheckpoint } = ctx;

  tool({
    name: 'ppro_cut_at', title: 'Couper (razor)', annotations: DESTRUCTIVE,
    description: 'Coupe les clips aux instants donnés (secondes, alignés sur l\'image la plus proche de la séquence) sur les pistes choisies. ' +
      'Renvoie pour chaque instant la frame, le timecode et les pistes réellement coupées (un razor sur du vide ou sur un bord ne compte pas). ' +
      'Opération destructive : sauvegarde automatique (checkpoint) avant, sauf désactivée. dryRun renvoie le plan.',
    input: { required: ['times'], properties: {
      times: { type: 'array', items: { type: 'number', minimum: 0 }, minItems: 1, description: 'Instants de coupe en secondes.' },
      tracks: TRACKS_SCHEMA, includeAudio: { type: 'boolean', default: true, description: 'false = ne coupe que les pistes vidéo.' },
      sequenceId: SEQ_ID, dryRun: DRY_RUN, checkpoint: CHECKPOINT_FLAG
    } },
    handler: (a) => withCheckpoint(a, 'cut', async (args, dryRun) => {
      args.times = [...new Set(args.times.map(Number))].sort((x, y) => x - y);
      if (dryRun) return { plan: 'cut', times: args.times, tracks: args.tracks ?? 'all', includeAudio: args.includeAudio ?? true, note: 'Aucune modification effectuée (dryRun).' };
      return call('edit.cutAt', args, { timeoutMs: 120000 });
    })
  });

  tool({
    name: 'ppro_delete_clips', title: 'Supprimer des clips', annotations: DESTRUCTIVE,
    description: 'Supprime des clips de la timeline. ripple=false (défaut) laisse un trou ; ripple=true referme le trou (les clips suivants reculent). Checkpoint automatique.',
    input: { required: ['clipIds'], properties: { clipIds: CLIP_IDS, ripple: { type: 'boolean', default: false }, sequenceId: SEQ_ID, dryRun: DRY_RUN, checkpoint: CHECKPOINT_FLAG } },
    handler: (a) => withCheckpoint(a, 'delete', async (args, dryRun) => dryRun ? { plan: 'delete', clipIds: args.clipIds, ripple: args.ripple ?? false } : call('edit.deleteClips', args, { timeoutMs: 120000 }))
  });

  tool({
    name: 'ppro_disable_clips', title: 'Activer/désactiver des clips', annotations: WRITE,
    description: 'Désactive (ou réactive) des clips : ils restent dans la timeline mais ne sont plus lus ni rendus. Pratique pour « écouter d\'abord » avant de supprimer. ' +
      'Par clipIds, ou par plages de temps (coupe d\'abord aux bornes puis désactive les clips entièrement compris dans chaque plage).',
    input: { properties: { clipIds: { ...CLIP_IDS, minItems: 0 }, ranges: { ...RANGES, minItems: 0 }, tracks: TRACKS_SCHEMA, disabled: { type: 'boolean', default: true }, cutAtBounds: { type: 'boolean', default: true }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('edit.setDisabled', a, { timeoutMs: 120000 }))
  });

  tool({
    name: 'ppro_remove_disabled_clips', title: 'Supprimer les clips désactivés', annotations: DESTRUCTIVE,
    description: 'Supprime tous les clips désactivés des pistes choisies (ripple optionnel). Checkpoint automatique.',
    input: { properties: { tracks: TRACKS_SCHEMA, ripple: { type: 'boolean', default: false }, sequenceId: SEQ_ID, dryRun: DRY_RUN, checkpoint: CHECKPOINT_FLAG } },
    handler: (a) => withCheckpoint(a, 'remove-disabled', async (args, dryRun) => dryRun ? { plan: 'remove-disabled', tracks: args.tracks ?? 'all', ripple: args.ripple ?? false } : call('edit.removeDisabled', args, { timeoutMs: 120000 }))
  });

  tool({
    name: 'ppro_move_clip', title: 'Déplacer un clip', annotations: WRITE,
    description: 'Déplace un clip sur sa piste à un instant donné (time) ou d\'un décalage (delta, secondes, négatif = vers la gauche). Écrase ce qui se trouve à l\'arrivée selon le comportement de Premiere.',
    input: { required: ['clipId'], properties: { clipId: CLIP_ID, time: { type: 'number', minimum: 0 }, delta: { type: 'number' }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('edit.moveClip', a))
  });

  tool({
    name: 'ppro_select_clips', title: 'Sélectionner des clips', annotations: WRITE,
    description: 'Sélectionne des clips dans la timeline (clear=true désélectionne d\'abord le reste). Sans clipIds : désélectionne tout.',
    input: { properties: { clipIds: { ...CLIP_IDS, minItems: 0 }, clear: { type: 'boolean', default: true }, sequenceId: SEQ_ID } },
    handler: async (a) => text(await call('edit.select', a))
  });
}
