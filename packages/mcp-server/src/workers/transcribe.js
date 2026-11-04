// Transcription par un programme Whisper installé sur la machine (optionnel). Deux formats de sortie reconnus :
//  - openai-whisper (commande `whisper`) : JSON {segments[{start,end,text,words[{word,start,end,probability}]}]}
//  - whisper.cpp (`whisper-cli` / `main`) avec -ojf : JSON {transcription[{timestamps, offsets{from,to}, text, tokens[]}]}
// La commande est configurable (config.transcribe.command) avec les variables {input} {lang} {model} {outDir} {outBase}.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';

function which(cmd) {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.split(/\r?\n/)[0].trim() : null;
}

/** Détecte un moteur disponible : { engine, command } ou null. */
export function detectEngine(config = {}) {
  if (config.command) return { engine: 'custom', command: config.command };
  if (which('whisper')) return { engine: 'openai-whisper', command: 'whisper "{input}" --model {model} --language {lang} --output_format json --output_dir "{outDir}" --word_timestamps True --verbose False' };
  for (const bin of ['whisper-cli', 'whisper-cpp', 'whisper.cpp']) if (which(bin)) return { engine: 'whisper.cpp', command: `${bin} -m "{model}" -f "{input}" -l {lang} -ojf -of "{outBase}"` };
  return null;
}

const fmtSrt = (t) => { const ms = Math.round(t * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
export const toSrt = (segments) => segments.map((s, i) => `${i + 1}\n${fmtSrt(s.start)} --> ${fmtSrt(s.end)}\n${s.text.trim()}\n`).join('\n');

function parseOutput(outDir, outBase) {
  const files = readdirSync(outDir).filter((f) => f.endsWith('.json'));
  if (!files.length) throw Object.assign(new Error('Le moteur n\'a produit aucun JSON'), { code: 'TRANSCRIBE_FAILED' });
  const data = JSON.parse(readFileSync(join(outDir, files[0]), 'utf8'));
  const segments = [];
  if (Array.isArray(data.segments)) { // openai-whisper
    for (const s of data.segments) segments.push({ start: s.start, end: s.end, text: s.text, words: (s.words || []).map((w) => ({ w: w.word.trim(), start: w.start, end: w.end, conf: w.probability })) });
  } else if (Array.isArray(data.transcription)) { // whisper.cpp
    for (const s of data.transcription) segments.push({ start: s.offsets.from / 1000, end: s.offsets.to / 1000, text: s.text, words: (s.tokens || []).filter((t) => !/^\[_/.test(t.text)).map((t) => ({ w: t.text.trim(), start: t.offsets.from / 1000, end: t.offsets.to / 1000, conf: t.p })) });
  } else throw Object.assign(new Error('Format JSON de transcription inconnu'), { code: 'TRANSCRIBE_FAILED' });
  return { language: data.language || null, segments };
}

/** Transcrit un fichier audio. Renvoie { engine, language, segments, srtPath, txt }. */
export function transcribe(path, { language = 'fr', model = 'base', config = {}, offset = 0 } = {}) {
  const eng = detectEngine(config);
  if (!eng) throw Object.assign(new Error('Aucun moteur de transcription trouvé. Installer openai-whisper (`pip install openai-whisper`) ou whisper.cpp, ou renseigner transcribe.command dans la config.'), { code: 'NO_ENGINE' });
  const outDir = mkdtempSync(join(tmpdir(), 'adobe-mcp-stt-')), outBase = join(outDir, basename(path).replace(/\.[^.]+$/, ''));
  const cmd = eng.command.replace(/\{input\}/g, path).replace(/\{lang\}/g, language).replace(/\{model\}/g, config.model || model).replace(/\{outDir\}/g, outDir).replace(/\{outBase\}/g, outBase);
  const r = spawnSync(cmd, { shell: true, encoding: 'utf8', timeout: 3600000, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && !existsSync(outDir)) throw Object.assign(new Error(`Transcription échouée (${eng.engine}) : ${(r.stderr || r.stdout || '').slice(-800)}`), { code: 'TRANSCRIBE_FAILED' });
  let parsed;
  try { parsed = parseOutput(outDir, outBase); }
  catch (e) { throw Object.assign(new Error(`${e.message}. Sortie du moteur : ${(r.stderr || r.stdout || '').slice(-800)}`), { code: 'TRANSCRIBE_FAILED' }); }
  if (offset) for (const s of parsed.segments) { s.start += offset; s.end += offset; for (const w of s.words) { w.start += offset; w.end += offset; } }
  const srtPath = join(outDir, 'transcript.srt');
  writeFileSync(srtPath, toSrt(parsed.segments), 'utf8');
  return { engine: eng.engine, language: parsed.language || language, segments: parsed.segments, srtPath, txt: parsed.segments.map((s) => s.text.trim()).join(' ') };
}
