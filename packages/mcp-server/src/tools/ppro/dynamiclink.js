// Tools Dynamic Link : remplacer un clip Premiere par une composition After Effects, importer des comps.
// Le remplacement orchestre les deux hôtes : Premiere décrit le clip → After Effects crée la comp et enregistre
// le projet → Premiere importe la comp (lien dynamique) et la pose à la place du clip.
import { SEQ_ID, CLIP_ID, DESTRUCTIVE, WRITE } from './common.js';

export function registerDynamicLinkTools(ctx) {
  const { tool, call, text, bridge, config } = ctx;
  const callAe = (fn, args, opts) => bridge.call('aeft', fn, args, opts);

  tool({
    name: 'ppro_replace_with_ae_comp', title: 'Remplacer par une composition After Effects', annotations: DESTRUCTIVE,
    description: 'Équivalent du clic droit « Remplacer par une composition After Effects » : crée dans After Effects (qui doit être ouvert avec le panneau Adobe MCP) une composition aux réglages de la séquence contenant le clip aux mêmes points in/out, ' +
      'enregistre le projet AE (celui déjà ouvert, sinon <projet>/_adobe-mcp/ae/<projet>_ae.aep), importe la comp par Dynamic Link et la pose à la place du clip (vidéo et audio liés). Checkpoint automatique. ' +
      'Ensuite : travailler dans AE avec les tools aeft_* sur cette comp ; si la lecture saccade, l\'utilisateur fait clic droit > Rendu et remplacement.',
    input: { required: ['clipId'], properties: { clipId: CLIP_ID, compName: { type: 'string', description: 'Nom de la comp (défaut : nom du clip + " lié").' }, aepPath: { type: 'string', description: 'Projet AE à créer si aucun projet enregistré n\'est ouvert dans After Effects.' }, sequenceId: SEQ_ID, checkpoint: { type: 'boolean' } } },
    handler: async (a) => {
      if (!bridge.host('aeft')) throw Object.assign(new Error('After Effects n\'est pas connecté : ouvrir After Effects puis Fenêtre > Extensions > Adobe MCP, et réessayer.'), { code: 'HOST_DISCONNECTED' });
      const desc = await call('dynamiclink.describeClip', { clipId: a.clipId, sequenceId: a.sequenceId });
      const clip = desc.clip, seq = desc.sequence;
      const compName = a.compName || `${clip.name.replace(/\.[^.]+$/, '')} lié`;
      let ckpt = null;
      if (a.checkpoint ?? config.safety.autoCheckpoint) ckpt = await call('safety.checkpoint', { label: 'ae-comp', sequenceId: a.sequenceId });
      const made = await callAe('dynamiclink.makeComp', {
        name: compName, width: seq.width, height: seq.height, fps: seq.fps, duration: clip.duration,
        mediaPath: clip.mediaPath, inPoint: clip.inPoint, outPoint: clip.outPoint, speed: clip.speed, aepPath: a.aepPath || desc.aepSuggested
      }, { timeoutMs: 300000 });
      const replaced = await call('dynamiclink.replaceClip', { clipId: a.clipId, aepPath: made.aepPath, compName: made.compName, sequenceId: a.sequenceId }, { timeoutMs: 300000 });
      return text({ ...replaced, aepPath: made.aepPath, compId: made.compId, checkpoint: ckpt, next: 'Comp ouverte dans After Effects : utiliser aeft_get_comp / aeft_apply_effect / aeft_set_keyframes sur compId ' + made.compId + '. Premiere reflète les changements (après enregistrement du projet AE).' });
    }
  });

  tool({
    name: 'ppro_import_ae_comp', title: 'Importer une composition After Effects', annotations: WRITE,
    description: 'Importe une ou plusieurs compositions d\'un projet .aep dans Premiere par Dynamic Link (chutier "_adobe-mcp/After Effects") et, si time est donné, pose la première dans la timeline.',
    input: { required: ['aepPath'], properties: { aepPath: { type: 'string' }, compNames: { type: 'array', items: { type: 'string' }, description: 'Noms exacts des comps (défaut : toutes).' }, bin: { type: 'string' }, time: { type: 'number', minimum: 0 }, videoTrack: { type: 'string', default: 'V2' }, audioTrack: { type: 'string', default: 'A2' }, mode: { type: 'string', enum: ['overwrite', 'insert'], default: 'overwrite' }, sequenceId: SEQ_ID } },
    handler: async (a) => {
      const imported = await call('dynamiclink.importComps', { aepPath: a.aepPath, compNames: a.compNames, bin: a.bin }, { timeoutMs: 300000 });
      let placed = null;
      if (a.time !== undefined && imported.imported.length) placed = await call('edit.insertClip', { nodeId: imported.imported[0].nodeId, time: a.time, videoTrack: a.videoTrack, audioTrack: a.audioTrack, mode: a.mode, sequenceId: a.sequenceId }, { timeoutMs: 120000 });
      return text({ ...imported, placed });
    }
  });
}
