// Tools media_* : analyse locale de fichiers audio (WAV) sans dépendance. Pas besoin de Premiere pour ces tools.
import { existsSync } from 'node:fs';
import { text } from '../mcp.js';
import { probe, detectSilences, loudness } from '../workers/audio.js';

const PATH = { type: 'string', description: 'Chemin absolu du fichier (WAV exporté par ppro_export_audio).' };
const readOnly = { readOnlyHint: true, openWorldHint: false };
const need = (p) => { if (!p || !existsSync(p)) throw Object.assign(new Error(`Fichier introuvable : ${p}`), { code: 'FILE_NOT_FOUND' }); };

export function registerMediaTools(server) {
  server.registerTool({
    name: 'media_probe', title: 'Analyser un fichier audio',
    description: 'Caractéristiques d\'un WAV : fréquence, canaux, bits, durée, crête et RMS (dBFS). Pour un autre format, renvoie seulement la taille.',
    inputSchema: { type: 'object', required: ['path'], additionalProperties: false, properties: { path: PATH } }, annotations: readOnly,
    handler: async ({ path }) => { need(path); return text(probe(path)); }
  });

  server.registerTool({
    name: 'media_detect_silences', title: 'Détecter les silences',
    description: 'Repère les silences d\'un WAV (parole) : plages {start, end} en secondes du fichier, plages de parole, durée récupérable, et repères de niveau (plancher de bruit, parole) pour ajuster noiseDb. ' +
      'Enchaînement jump cut : ppro_export_audio → media_detect_silences → présenter le bilan → ppro_remove_ranges. Si l\'audio a été exporté sur une plage [a, b], ajouter a aux temps renvoyés.',
    inputSchema: { type: 'object', required: ['path'], additionalProperties: false, properties: {
      path: PATH,
      minDuration: { type: 'number', minimum: 0.05, default: 0.5, description: 'Durée minimale d\'un silence (s). 0.5 = dialogue serré ; 1 = rythme naturel ; < 0.3 rend la parole robotique.' },
      noiseDb: { type: 'number', maximum: 0, default: -35, description: 'Seuil (dBFS RMS) sous lequel c\'est du silence. Prendre une valeur entre le plancher de bruit et la parole (voir levels).' },
      padding: { type: 'number', minimum: 0, default: 0.08, description: 'Marge gardée de chaque côté d\'un silence (s), pour ne pas couper les attaques.' },
      minSpeech: { type: 'number', minimum: 0, default: 0.12, description: 'Un son plus court que ça entre deux silences est traité comme du silence (clics).' },
      offset: { type: 'number', default: 0, description: 'Décalage ajouté à tous les temps (début de la plage exportée).' }
    } }, annotations: readOnly,
    handler: async ({ path, offset = 0, ...opts }) => {
      need(path);
      const r = detectSilences(path, opts);
      if (offset) { for (const s of r.silences) { s.start += offset; s.end += offset; } for (const s of r.speech) { s.start += offset; s.end += offset; } r.offset = offset; }
      return text(r);
    }
  });

  server.registerTool({
    name: 'media_loudness', title: 'Mesurer la loudness',
    description: 'Mesure EBU R128 / ITU BS.1770 d\'un WAV : loudness intégrée (LUFS), LRA, max momentané et court terme, crête, et gain à appliquer pour atteindre la cible (YouTube −14, podcast −16, TV −23).',
    inputSchema: { type: 'object', required: ['path'], additionalProperties: false, properties: { path: PATH, target: { type: 'number', default: -14, description: 'Cible en LUFS.' } } }, annotations: readOnly,
    handler: async ({ path, target }) => { need(path); return text(loudness(path, { target })); }
  });
}
