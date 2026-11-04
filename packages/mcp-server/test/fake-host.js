// Faux panneau Premiere Pro : simule le pont CEP pour tester le serveur sans Adobe (Node ≥ 22 pour WebSocket global).
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { BRIDGE_FILE } from '../src/config.js';

function tinyPng() { // PNG 1x1 valide
  const crc = (buf) => { let c, crcTable = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; }
    let v = 0xffffffff; for (const b of buf) v = crcTable[(v ^ b) & 0xff] ^ (v >>> 8); return (v ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const t = Buffer.from(type); const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(1, 0); ihdr.writeUInt32BE(1, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.from([0, 255, 0, 0]))), chunk('IEND', Buffer.alloc(0))]);
}

const state = {
  sequences: [{ id: 'seq-1', name: 'Montage test', fps: 25, width: 1920, height: 1080, duration: 60, videoTracks: 2, audioTracks: 2 }],
  clips: { V1: [{ id: 'V1/0', name: 'cam_A.mp4', start: 0, end: 30 }, { id: 'V1/1', name: 'cam_B.mp4', start: 30, end: 60 }] },
  checkpoints: [],
  markers: []
};

export const fns = {
  'project.get': () => ({ name: 'Projet test', path: 'C:/test/projet.prproj', version: '14.9.0', sequences: 1, activeSequence: state.sequences[0] }),
  'sequence.list': () => state.sequences,
  'sequence.get': (a) => ({ ...state.sequences[0], tracks: { video: [{ index: 0, name: 'V1', clips: state.clips.V1.filter(c => !a.range || (c.end >= a.range[0] && c.start <= a.range[1])) }], audio: [] }, markers: [] }),
  'sequence.activate': (a) => state.sequences[0],
  'sequence.seek': (a) => ({ playhead: a.time }),
  'edit.cutAt': (a) => {
    const before = state.clips.V1.length;
    for (const t of a.times) {
      const i = state.clips.V1.findIndex(c => c.start < t && t < c.end);
      if (i >= 0) { const c = state.clips.V1[i]; state.clips.V1.splice(i, 1, { ...c, end: t }, { ...c, id: c.id + 'b', start: t }); }
    }
    return { sequence: 'Montage test', results: a.times.map(t => ({ time: t, timecode: '00:00:00:00', cuts: 1 })), clipsBefore: before, clipsAfter: state.clips.V1.length };
  },
  'project.import': (a) => ({ ok: true, imported: a.paths.map((p, i) => ({ nodeId: 'n' + i, name: p.split(/[\\/]/).pop(), mediaPath: p })), bin: a.bin || 'root' }),
  'export.frame': (a) => { const dir = mkdtempSync(join(tmpdir(), 'adobe-mcp-')); const p = join(dir, 'frame.png'); writeFileSync(p, tinyPng()); return { path: p, time: a.time ?? 0, timecode: '00:00:00:00', bytes: tinyPng().length }; },
  'safety.checkpoint': (a) => { const ck = { checkpointId: 'ck-' + (state.checkpoints.length + 1), checkpointName: '__ckpt_x_' + (a.label || ''), originalSequenceId: 'seq-1', originalName: 'Montage test' }; state.checkpoints.push(ck); return ck; },
  'safety.listCheckpoints': () => state.checkpoints,
  'safety.rewind': (a) => ({ restoredSequenceId: 'seq-2', name: 'Montage test', replacedSequenceId: 'seq-1' }),
  'ui.alert': () => ({ shown: true }),
  'sequence.getActive': () => ({ ...state.sequences[0], selection: [] }),
  'markers.get': () => ({ markers: state.markers }),
  'markers.add': (a) => { for (const m of a.markers) state.markers.push({ index: state.markers.length, start: m.start, end: m.end ?? m.start, name: m.name ?? '', comment: m.comment ?? '', type: m.type ?? 'Comment', color: m.color ?? null }); return { added: a.markers, total: state.markers.length }; },
  'markers.exportChapters': () => ({ format: 'youtube', count: state.markers.length, text: state.markers.map(m => `${Math.floor(m.start / 60)}:${String(Math.floor(m.start % 60)).padStart(2, '0')} ${m.name}`).join('\n'), chapters: state.markers, warnings: state.markers.length < 3 ? ['YouTube exige au moins 3 chapitres'] : [] }),
  'edit.deleteClips': (a) => { const removed = []; for (const id of a.clipIds) { const i = state.clips.V1.findIndex(c => c.id === id); if (i >= 0) removed.push(state.clips.V1.splice(i, 1)[0]); } return { removed, failed: [], ripple: !!a.ripple, clipsAfter: state.clips.V1.length }; },
  'edit.moveClip': (a) => { const c = state.clips.V1.find(c => c.id === a.clipId); const d = c.end - c.start; c.start = a.time ?? c.start + (a.delta ?? 0); c.end = c.start + d; return { moved: true, id: c.id, start: c.start, end: c.end, moveSemantics: 'relative' }; }
};

export function startFakeHost({ app = 'ppro', appVersion = '14.9.0' } = {}) {
  const bridge = JSON.parse(readFileSync(BRIDGE_FILE, 'utf8'));
  const ws = new WebSocket(`ws://127.0.0.1:${bridge.port}`);
  return new Promise((resolve, reject) => {
    ws.onopen = () => ws.send(JSON.stringify({ type: 'hello', protocol: 1, token: bridge.token, app, appVersion, bridge: 'fake', bridgeVersion: '0.0.1', os: process.platform, capabilities: Object.keys(fns) }));
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'welcome') return resolve(ws);
      if (msg.type === 'error') return reject(new Error(msg.message));
      if (msg.type === 'ping') return ws.send(JSON.stringify({ type: 'pong' }));
      if (msg.type === 'call') {
        try { ws.send(JSON.stringify({ type: 'result', id: msg.id, ok: true, durationMs: 1, data: fns[msg.fn](msg.args || {}) })); }
        catch (e) { ws.send(JSON.stringify({ type: 'result', id: msg.id, ok: false, error: { code: 'FAKE_ERROR', message: e.message } })); }
      }
    };
    ws.onerror = (e) => reject(new Error('WebSocket: ' + (e.message || 'erreur')));
  });
}

if (process.argv[1] && process.argv[1].endsWith('fake-host.js')) {
  startFakeHost().then(() => console.log('faux hôte Premiere connecté — Ctrl+C pour quitter'));
}
