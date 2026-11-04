// Analyse audio locale, sans dépendance : niveaux, silences, loudness ITU-R BS.1770 / EBU R128 (K-weighting + gating).
// Entrée : fichiers WAV (exportés par Premiere avec ppro_export_audio).
import { statSync } from 'node:fs';
import { readWav, readWavHeader, dbfs, round } from './wav.js';
import { readFileSync } from 'node:fs';

// ---------------------------------------------------------------- utilitaires
function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

// Niveau RMS (dBFS) par fenêtre de `windowMs` sur un signal mono.
function windowLevels(x, sampleRate, windowMs) {
  const n = Math.max(1, Math.round(sampleRate * windowMs / 1000));
  const count = Math.floor(x.length / n);
  const levels = new Float64Array(count);
  for (let w = 0; w < count; w++) {
    let acc = 0;
    const base = w * n;
    for (let i = 0; i < n; i++) acc += x[base + i] * x[base + i];
    levels[w] = dbfs(Math.sqrt(acc / n));
  }
  return { levels, windowSec: n / sampleRate };
}

// ---------------------------------------------------------------- probe
export function probe(path) {
  const size = statSync(path).size;
  if (!/\.wav$/i.test(path)) return { path, bytes: size, note: 'Seuls les fichiers WAV sont analysés en détail ; exporter l\'audio en WAV avec ppro_export_audio.' };
  const buf = readFileSync(path);
  const h = readWavHeader(buf);
  const { channels } = readWav(path);
  let peak = 0, acc = 0, total = 0;
  for (const ch of channels) for (let i = 0; i < ch.length; i++) { const v = Math.abs(ch[i]); if (v > peak) peak = v; acc += ch[i] * ch[i]; total++; }
  return {
    path, bytes: size, sampleRate: h.sampleRate, channels: h.channels, bits: h.bits, format: h.format === 3 ? 'float' : 'pcm',
    duration: round(h.duration), samplePeakDbfs: round(dbfs(peak), 2), rmsDbfs: round(dbfs(Math.sqrt(acc / Math.max(1, total))), 2)
  };
}

// ---------------------------------------------------------------- silences
/**
 * Détecte les silences d'un WAV.
 * minDuration : durée minimale d'un silence (s) ; noiseDb : seuil RMS (dBFS) sous lequel c'est du silence ;
 * padding : marge gardée de chaque côté (s), pour ne pas couper les attaques/respirations ;
 * minSpeech : un passage sonore plus court que ça entre deux silences est absorbé (clics, bruits).
 */
export function detectSilences(path, { minDuration = 0.5, noiseDb = -35, padding = 0.08, minSpeech = 0.12, windowMs = 10 } = {}) {
  const { header, channels } = readWav(path, { mono: true });
  const x = channels[0];
  const { levels, windowSec } = windowLevels(x, header.sampleRate, windowMs);
  // Repères de niveau pour aider à choisir le seuil.
  const sorted = Array.from(levels).filter(Number.isFinite).sort((a, b) => a - b);
  const stats = { p10: round(percentile(sorted, 0.10), 1), p50: round(percentile(sorted, 0.50), 1), p90: round(percentile(sorted, 0.90), 1), max: round(sorted[sorted.length - 1], 1) };
  // 1) fenêtres sous le seuil → plages brutes
  const raw = [];
  let start = -1;
  for (let w = 0; w <= levels.length; w++) {
    const quiet = w < levels.length && levels[w] < noiseDb;
    if (quiet && start < 0) start = w;
    if (!quiet && start >= 0) { raw.push([start * windowSec, w * windowSec]); start = -1; }
  }
  // 2) absorber les blips sonores trop courts entre deux silences
  const merged = [];
  for (const r of raw) {
    const last = merged[merged.length - 1];
    if (last && r[0] - last[1] < minSpeech) last[1] = r[1]; else merged.push([r[0], r[1]]);
  }
  // 3) garder les silences assez longs, puis appliquer la marge
  const silences = [];
  for (const [s, e] of merged) {
    if (e - s < minDuration) continue;
    const ps = s + padding, pe = e - padding;
    if (pe - ps > 0.02) silences.push({ start: round(ps), end: round(pe), duration: round(pe - ps) });
  }
  // 4) parole = complément
  const speech = [];
  let cursor = 0;
  for (const s of silences) { if (s.start > cursor) speech.push({ start: round(cursor), end: s.start, duration: round(s.start - cursor) }); cursor = s.end; }
  if (header.duration > cursor + 0.02) speech.push({ start: round(cursor), end: round(header.duration), duration: round(header.duration - cursor) });
  const removed = silences.reduce((a, s) => a + s.duration, 0);
  return {
    path, duration: round(header.duration), params: { minDuration, noiseDb, padding, minSpeech, windowMs },
    levels: stats,
    hint: `Plancher de bruit ≈ ${stats.p10} dBFS, parole typique ≈ ${stats.p90} dBFS. Si trop/pas assez de silences, ajuster noiseDb entre ces deux valeurs.`,
    silences, speech,
    summary: { silences: silences.length, timeRemovable: round(removed), durationAfter: round(header.duration - removed), speechSegments: speech.length }
  };
}

// ---------------------------------------------------------------- loudness BS.1770 / R128
function biquad(b0, b1, b2, a1, a2) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => { const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
}
// Filtres K-weighting pour une fréquence d'échantillonnage quelconque (paramètres du filtre de référence à 48 kHz).
function kWeighting(fs) {
  const f0 = 1681.974450955533, G = 3.999843853973347, Q = 0.7071752369554196;
  const K = Math.tan(Math.PI * f0 / fs), Vh = 10 ** (G / 20), Vb = Vh ** 0.4996667741545416;
  const a0 = 1 + K / Q + K * K;
  const shelf = biquad((Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0);
  const f1 = 38.13547087602444, Q1 = 0.5003270373238773;
  const K1 = Math.tan(Math.PI * f1 / fs), a01 = 1 + K1 / Q1 + K1 * K1;
  const hp = biquad(1 / a01, -2 / a01, 1 / a01, 2 * (K1 * K1 - 1) / a01, (1 - K1 / Q1 + K1 * K1) / a01);
  return (x) => hp(shelf(x));
}
const lufs = (ms) => -0.691 + 10 * Math.log10(ms);

export function loudness(path, { target = -14 } = {}) {
  const { header, channels } = readWav(path);
  const fs = header.sampleRate, nch = channels.length;
  const weights = nch === 5 ? [1, 1, 1, 1.41, 1.41] : Array(nch).fill(1);
  // Puissance moyenne pondérée par blocs de 100 ms (puis fenêtres de 400 ms = 4 blocs, 3 s = 30 blocs).
  const hop = Math.round(fs * 0.1), nHops = Math.floor(header.frames / hop);
  const blockPower = new Float64Array(nHops);
  let samplePeak = 0;
  for (let c = 0; c < nch; c++) {
    const filt = kWeighting(fs), x = channels[c];
    for (let h = 0; h < nHops; h++) {
      let acc = 0;
      const base = h * hop;
      for (let i = 0; i < hop; i++) { const v = x[base + i]; const a = Math.abs(v); if (a > samplePeak) samplePeak = a; const y = filt(v); acc += y * y; }
      blockPower[h] += weights[c] * acc / hop;
    }
  }
  const windowed = (nBlocks) => { const out = []; for (let h = 0; h + nBlocks <= nHops; h++) { let s = 0; for (let k = 0; k < nBlocks; k++) s += blockPower[h + k]; out.push(s / nBlocks); } return out; };
  // Momentary (400 ms), gating absolu -70 LUFS puis relatif -10 LU → intégrée
  const m = windowed(4);
  const above = m.filter((p) => lufs(p) > -70);
  let integrated = -Infinity;
  if (above.length) {
    const relGate = lufs(above.reduce((a, b) => a + b, 0) / above.length) - 10;
    const gated = above.filter((p) => lufs(p) > relGate);
    if (gated.length) integrated = lufs(gated.reduce((a, b) => a + b, 0) / gated.length);
  }
  // Short-term (3 s) → LRA (EBU Tech 3342 : gate absolu -70, relatif -20 LU, 10e–95e percentile)
  const s = windowed(30).map(lufs).filter((l) => l > -70);
  let lra = null;
  if (s.length > 1) {
    const mean = lufs(s.reduce((a, l) => a + 10 ** ((l + 0.691) / 10), 0) / s.length);
    const kept = s.filter((l) => l > mean - 20).sort((a, b) => a - b);
    if (kept.length > 1) lra = round(percentile(kept, 0.95) - percentile(kept, 0.10), 1);
  }
  const maxMomentary = m.length ? round(Math.max(...m.map(lufs)), 1) : null;
  const maxShortTerm = s.length ? round(Math.max(...s), 1) : null;
  const gain = Number.isFinite(integrated) ? round(target - integrated, 1) : null;
  return {
    path, duration: round(header.duration), channels: nch, sampleRate: fs,
    integratedLufs: round(integrated, 1), lra, maxMomentaryLufs: maxMomentary, maxShortTermLufs: maxShortTerm,
    samplePeakDbfs: round(dbfs(samplePeak), 1), truePeakNote: 'Crête mesurée sur les échantillons (la crête vraie inter-échantillons peut dépasser de ~0,5 dB).',
    target, gainToTargetDb: gain,
    verdict: gain === null ? 'signal trop faible pour mesurer' : Math.abs(gain) <= 1 ? 'dans la cible (±1 LU)' : gain > 0 ? `trop faible : monter de ${gain} dB` : `trop fort : baisser de ${-gain} dB`
  };
}
