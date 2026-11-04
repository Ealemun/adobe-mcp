// Éléments partagés par les tools Premiere Pro : schémas JSON récurrents, annotations, aide à l'enregistrement.
import { text } from '../../mcp.js';

export const TRACKS_SCHEMA = {
  description: 'Pistes concernées : "all" (défaut), "video", "audio", ou liste ["V1","A2"].',
  anyOf: [{ type: 'string', enum: ['all', 'video', 'audio'] }, { type: 'array', items: { type: 'string', pattern: '^[VAva][0-9]+$' } }]
};
export const SEQ_ID = { type: 'string', description: 'ID de séquence (défaut : séquence active).' };
export const DRY_RUN = { type: 'boolean', description: 'true = renvoie le plan sans rien modifier.', default: false };
export const CLIP_ID = { type: 'string', description: 'Identifiant de clip "V1/3" (piste/index, voir ppro_get_sequence) ou nodeId.' };
export const CLIP_IDS = { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Identifiants de clips "V1/3" (piste/index) ou nodeId.' };
export const RANGE = { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2, description: '[début, fin] en secondes.' };
export const RANGES = {
  type: 'array', minItems: 1, description: 'Plages de temps en secondes.',
  items: { type: 'object', required: ['start', 'end'], additionalProperties: false, properties: { start: { type: 'number', minimum: 0 }, end: { type: 'number', minimum: 0 } } }
};

export const DESTRUCTIVE = { destructiveHint: true, idempotentHint: false, openWorldHint: false };
export const WRITE = { destructiveHint: false, idempotentHint: false, openWorldHint: false };
export const READ_ONLY = { readOnlyHint: true, openWorldHint: false };

/** Contexte passé à chaque module : call(fn, args, opts) vers Premiere, config, et un helper tool(). */
export function makeContext(server, bridge, config) {
  const call = (fn, args = {}, opts) => bridge.call('ppro', fn, args, opts);
  // tool({ name, title, description, input: {properties, required?}, annotations?, handler }) : enregistre avec un schéma objet fermé.
  const tool = ({ name, title, description, input = {}, annotations = WRITE, handler }) => server.registerTool({
    name, title, description, annotations,
    inputSchema: { type: 'object', additionalProperties: false, properties: input.properties ?? {}, ...(input.required ? { required: input.required } : {}) },
    handler
  });
  // Checkpoint automatique avant une opération destructive (sauf désactivé par l'appel ou la config).
  const withCheckpoint = async (a, label, run) => {
    const { checkpoint, dryRun, ...args } = a;
    let ckpt = null;
    if (!dryRun && (checkpoint ?? config.safety.autoCheckpoint)) ckpt = await call('safety.checkpoint', { label, sequenceId: args.sequenceId });
    const result = await run(args, dryRun);
    return text(dryRun ? result : { ...result, checkpoint: ckpt });
  };
  return { call, config, tool, text, withCheckpoint, bridge };
}
