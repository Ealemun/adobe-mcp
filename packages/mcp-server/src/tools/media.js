// Tools media_* : analyse locale de fichiers audio (WAV) sans dépendance. Pas besoin de Premiere pour ces tools.
import { existsSync } from 'node:fs';
import { text } from '../mcp.js';
import { probe, detectSilences, loudness } from '../workers/audio.js';
import { contactSheet } from '../workers/png.js';
import { transcribe, detectEngine } from '../workers/transcribe.js';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PATH = { type: 'string', description: 'Chemin absolu du fichier (WAV exporté par ppro_export_audio).' };
const readOnly = { readOnlyHint: true, openWorldHint: false };
const need = (p) => { if (!p || !existsSync(p)) throw Object.assign(new Error(`Fichier introuvable : ${p}`), { code: 'FILE_NOT_FOUND' }); };

export function registerMediaTools(server, config = {}) {
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

  server.registerTool({
    name: 'media_contact_sheet', title: 'Planche-contact',
    description: 'Assemble des PNG (ppro_export_frames, aeft_export_frame) en une seule image mosaïque numérotée, pour regarder 20 à 40 plans en un coup d\'œil (repérage de B-roll, contrôle couleur, cadrage vertical). Renvoie l\'image.',
    inputSchema: { type: 'object', required: ['frames'], additionalProperties: false, properties: {
      frames: { type: 'array', minItems: 1, maxItems: 100, items: { anyOf: [{ type: 'string' }, { type: 'object', required: ['path'], additionalProperties: false, properties: { path: { type: 'string' }, label: { type: 'string', description: 'Étiquette courte (chiffres, ":" et "." seulement), ex. "12.5".' } } }] } },
      cols: { type: 'integer', minimum: 1, maximum: 10, default: 5 }, thumbWidth: { type: 'integer', minimum: 80, maximum: 800, default: 320 }, inline: { type: 'boolean', default: true }
    } }, annotations: readOnly,
    handler: async ({ frames, cols, thumbWidth, inline = true }) => {
      const list = frames.map((f) => (typeof f === 'string' ? { path: f } : f));
      for (const f of list) need(f.path);
      const sheet = contactSheet(list, { cols, thumbWidth });
      const out = join(mkdtempSync(join(tmpdir(), 'adobe-mcp-sheet-')), 'contact-sheet.png');
      writeFileSync(out, sheet.png);
      const meta = { path: out, frames: list.length, cols: sheet.cols, rows: sheet.rows, thumb: [sheet.thumbWidth, sheet.thumbHeight], order: 'numérotées de gauche à droite puis de haut en bas, à partir de 0 (ou label donné)' };
      return inline ? { content: [{ type: 'text', text: JSON.stringify(meta) }, { type: 'image', data: sheet.png.toString('base64'), mimeType: 'image/png' }] } : text(meta);
    }
  });

  server.registerTool({
    name: 'media_transcribe', title: 'Transcrire (Whisper local)',
    description: 'Transcription avec horodatage par mot via un moteur Whisper installé sur la machine (openai-whisper ou whisper.cpp ; configurable). Renvoie segments[{start,end,text,words[]}], le texte et un SRT. ' +
      'Si aucun moteur n\'est installé, l\'erreur le dit : proposer `pip install openai-whisper` ou demander à l\'utilisateur de transcrire dans Premiere (Fenêtre > Texte) et d\'exporter le SRT.',
    inputSchema: { type: 'object', required: ['path'], additionalProperties: false, properties: { path: PATH, language: { type: 'string', default: 'fr' }, model: { type: 'string', description: 'Modèle (tiny/base/small/medium/large, ou chemin du .bin pour whisper.cpp).' }, offset: { type: 'number', default: 0 }, maxSegments: { type: 'integer', default: 400 } } }, annotations: readOnly,
    handler: async ({ path, language, model, offset, maxSegments = 400 }) => {
      need(path);
      const r = transcribe(path, { language, model, offset, config: config.transcribe || {} });
      const truncated = r.segments.length > maxSegments;
      return text({ ...r, segments: r.segments.slice(0, maxSegments), truncated, note: truncated ? `Segments tronqués à ${maxSegments} ; le SRT complet est dans srtPath.` : undefined });
    }
  });

  server.registerTool({
    name: 'media_transcribe_status', title: 'Moteur de transcription',
    description: 'Indique quel moteur Whisper local est détecté (ou aucun) et la commande qui serait utilisée.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: readOnly,
    handler: async () => text(detectEngine(config.transcribe || {}) || { engine: null, hint: 'Installer openai-whisper (pip install openai-whisper) ou whisper.cpp, ou définir transcribe.command dans ~/.adobe-mcp/config.json' })
  });
}
