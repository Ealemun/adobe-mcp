// Lecture de fichiers WAV (PCM entier 8/16/24/32 bits, float 32/64, WAVE_FORMAT_EXTENSIBLE) sans dépendance.
// Renvoie des échantillons normalisés [-1, 1] par canal, ou un mixage mono.
import { readFileSync } from 'node:fs';

/** Analyse l'en-tête RIFF/WAVE et renvoie { sampleRate, channels, bits, format, dataOffset, dataLength, duration }. */
export function readWavHeader(buf) {
  if (buf.length < 12 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw Object.assign(new Error('Fichier WAV invalide (en-tête RIFF/WAVE absent)'), { code: 'BAD_WAV' });
  }
  let pos = 12, fmt = null, data = null;
  while (pos + 8 <= buf.length) {
    const id = buf.toString('ascii', pos, pos + 4);
    const size = buf.readUInt32LE(pos + 4);
    const body = pos + 8;
    if (id === 'fmt ') {
      let format = buf.readUInt16LE(body);
      const channels = buf.readUInt16LE(body + 2);
      const sampleRate = buf.readUInt32LE(body + 4);
      const bits = buf.readUInt16LE(body + 14);
      if (format === 0xfffe && size >= 26) format = buf.readUInt16LE(body + 24); // EXTENSIBLE : sous-format dans le GUID
      fmt = { format, channels, sampleRate, bits };
    } else if (id === 'data') {
      data = { offset: body, length: Math.min(size, buf.length - body) };
      if (size === 0xffffffff || size === 0) data.length = buf.length - body; // taille inconnue (flux)
    }
    pos = body + size + (size & 1);
    if (fmt && data) break;
  }
  if (!fmt || !data) throw Object.assign(new Error('Fichier WAV incomplet (chunk fmt ou data absent)'), { code: 'BAD_WAV' });
  const frameBytes = fmt.channels * (fmt.bits / 8);
  const frames = Math.floor(data.length / frameBytes);
  return { ...fmt, dataOffset: data.offset, dataLength: data.length, frames, duration: frames / fmt.sampleRate };
}

/** Lit le fichier et renvoie { header, channels: Float32Array[] } (un tableau par canal, valeurs dans [-1, 1]). */
export function readWav(path, { mono = false } = {}) {
  const buf = readFileSync(path);
  const h = readWavHeader(buf);
  const { channels: nch, bits, format, dataOffset, frames } = h;
  const out = mono ? [new Float32Array(frames)] : Array.from({ length: nch }, () => new Float32Array(frames));
  const isFloat = format === 3;
  const step = bits / 8;
  let p = dataOffset;
  for (let i = 0; i < frames; i++) {
    let acc = 0;
    for (let c = 0; c < nch; c++) {
      let v;
      if (isFloat) v = bits === 64 ? buf.readDoubleLE(p) : buf.readFloatLE(p);
      else if (bits === 16) v = buf.readInt16LE(p) / 32768;
      else if (bits === 24) v = ((buf[p] | (buf[p + 1] << 8) | (buf[p + 2] << 16)) << 8 >> 8) / 8388608;
      else if (bits === 32) v = buf.readInt32LE(p) / 2147483648;
      else if (bits === 8) v = (buf[p] - 128) / 128;
      else throw Object.assign(new Error(`Profondeur WAV non gérée : ${bits} bits`), { code: 'BAD_WAV' });
      p += step;
      if (mono) acc += v; else out[c][i] = v;
    }
    if (mono) out[0][i] = acc / nch;
  }
  return { header: h, channels: out };
}

export const dbfs = (x) => (x > 0 ? 20 * Math.log10(x) : -Infinity);
export const round = (x, d = 3) => (Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : x);
