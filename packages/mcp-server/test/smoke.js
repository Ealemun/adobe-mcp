// Test de fumée : lance le serveur MCP, connecte un faux Premiere, dialogue en MCP sur stdio.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// Isolation : le test n'écrit jamais le bridge.json réel et ne prend pas le port 8765.
process.env.ADOBE_MCP_BRIDGE_FILE = join(mkdtempSync(join(tmpdir(), 'adobe-mcp-test-')), 'bridge.json');
process.env.ADOBE_MCP_PORT = '0';
const { startFakeHost } = await import('./fake-host.js');

const serverPath = fileURLToPath(new URL('../src/index.js', import.meta.url));
const proc = spawn(process.execPath, [serverPath], { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env } });
proc.stderr.on('data', (d) => process.stderr.write('[server] ' + d));
const rl = createInterface({ input: proc.stdout });
const pending = new Map(); let nextId = 1;
rl.on('line', (line) => { let m; try { m = JSON.parse(line); } catch { return; } if (m.id !== undefined && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const rpc = (method, params) => new Promise((res) => { const id = nextId++; pending.set(id, res); proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'); });
const notify = (method, params) => proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
const callTool = async (name, args) => { const r = await rpc('tools/call', { name, arguments: args }); if (r.error) throw new Error(r.error.message); return r.result; };
let failures = 0;
const check = (label, ok, info) => { console.log(`${ok ? '✓' : '✗'} ${label}${info ? ' — ' + info : ''}`); if (!ok) failures++; };

try {
  const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'smoke', version: '0' } });
  check('initialize', init.result?.serverInfo?.name === 'adobe-mcp', init.result?.protocolVersion);
  notify('notifications/initialized');

  const list = await rpc('tools/list');
  check('tools/list', list.result.tools.length >= 12, `${list.result.tools.length} tools`);

  const status0 = await callTool('adobe_status', {});
  check('adobe_status sans hôte', JSON.parse(status0.content[0].text).hosts.length === 0);
  const noHost = await callTool('ppro_get_project', {});
  check('erreur claire sans hôte', noHost.isError && /n'est pas connecté/.test(noHost.content[0].text));

  await new Promise(r => setTimeout(r, 200));
  const ws = await startFakeHost();
  await new Promise(r => setTimeout(r, 100));

  const caps = JSON.parse((await callTool('ppro_get_capabilities', {})).content[0].text);
  check('ppro_get_capabilities', caps.version === '14.9.0' && caps.functions.includes('edit.cutAt'));

  const seq = JSON.parse((await callTool('ppro_get_sequence', { range: [0, 10] })).content[0].text);
  check('ppro_get_sequence (range)', seq.tracks.video[0].clips.length === 1, seq.name);

  const dry = JSON.parse((await callTool('ppro_cut_at', { times: [12, 5, 12], dryRun: true })).content[0].text);
  check('ppro_cut_at dryRun', dry.plan === 'cut' && dry.times.join() === '5,12');

  const cut = JSON.parse((await callTool('ppro_cut_at', { times: [12] })).content[0].text);
  check('ppro_cut_at + checkpoint auto', cut.clipsAfter === cut.clipsBefore + 1 && cut.checkpoint?.checkpointId === 'ck-1');

  const frame = await callTool('ppro_export_frame', { time: 3 });
  check('ppro_export_frame renvoie une image', frame.content.some(c => c.type === 'image' && c.mimeType === 'image/png'));

  const cks = JSON.parse((await callTool('ppro_list_checkpoints', {})).content[0].text);
  check('ppro_list_checkpoints', cks.length === 1);
  const rw = JSON.parse((await callTool('ppro_rewind', { checkpointId: 'ck-1' })).content[0].text);
  check('ppro_rewind', rw.name === 'Montage test');

  const mk = JSON.parse((await callTool('ppro_add_markers', { markers: [{ start: 0, name: 'Intro', type: 'Chapter' }, { start: 65.5, name: 'Suite', type: 'Chapter', color: 'blue' }] })).content[0].text);
  check('ppro_add_markers', mk.total === 2);
  const ch = JSON.parse((await callTool('ppro_export_chapters', {})).content[0].text);
  check('ppro_export_chapters', ch.text === '0:00 Intro\n1:05 Suite' && ch.warnings.length === 1, JSON.stringify(ch.text));
  const del = JSON.parse((await callTool('ppro_delete_clips', { clipIds: ['V1/1'] })).content[0].text);
  check('ppro_delete_clips + checkpoint', del.removed.length === 1 && del.checkpoint?.checkpointId === 'ck-2');
  const mv = JSON.parse((await callTool('ppro_move_clip', { clipId: 'V1/0', delta: 2 })).content[0].text);
  check('ppro_move_clip', mv.start === 2);

  // Workers média : WAV synthétique (son à -20 dBFS avec deux trous) → silences et loudness
  const { writeFileSync } = await import('node:fs');
  const sr = 48000, n = sr * 10, wav = Buffer.alloc(44 + n * 2);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + n * 2, 4); wav.write('WAVE', 8); wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sr, 24); wav.writeUInt32LE(sr * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) { const t = i / sr; const on = !((t > 2 && t < 3) || (t > 6 && t < 7.3)); wav.writeInt16LE(Math.round((on ? 0.1 * Math.sin(2 * Math.PI * 1000 * t) : 0) * 32767), 44 + i * 2); }
  const wavPath = join(tmpdir(), 'adobe-mcp-smoke.wav'); writeFileSync(wavPath, wav);
  const sil = JSON.parse((await callTool('media_detect_silences', { path: wavPath, offset: 100 })).content[0].text);
  check('media_detect_silences', sil.silences.length === 2 && sil.silences[0].start > 102 && sil.silences[0].start < 102.2, JSON.stringify(sil.summary));
  const loud = JSON.parse((await callTool('media_loudness', { path: wavPath })).content[0].text);
  check('media_loudness', loud.integratedLufs < -22 && loud.integratedLufs > -25 && loud.gainToTargetDb > 0, `${loud.integratedLufs} LUFS`);

  const noAe = await callTool('ppro_replace_with_ae_comp', { clipId: 'V1/0' });
  check('replace_with_ae_comp sans AE → erreur claire', noAe.isError && /After Effects/.test(noAe.content[0].text));
  const wsAe = await startFakeHost({ app: 'aeft', appVersion: '17.0' });
  await new Promise(r => setTimeout(r, 100));
  const rep = JSON.parse((await callTool('ppro_replace_with_ae_comp', { clipId: 'V1/0' })).content[0].text);
  check('ppro_replace_with_ae_comp (orchestration)', rep.comp === 'cam_A lié' && rep.aepPath === 'C:/test/test.aep' && rep.checkpoint?.checkpointId, rep.comp);
  wsAe.close();

  const res = await rpc('resources/read', { uri: 'adobe://ppro/active-sequence' });
  check('resources/read', res.result?.contents?.[0]?.text?.includes('Montage test'));

  const aeNo = await callTool('aeft_get_comp', {});
  check('aeft sans hôte → erreur claire', aeNo.isError && /After Effects/.test(aeNo.content[0].text));

  ws.close();
  await new Promise(r => setTimeout(r, 150));
  const status1 = JSON.parse((await callTool('adobe_status', {})).content[0].text);
  check('déconnexion détectée', status1.hosts.length === 0);
} catch (e) {
  check('exception', false, e.stack || String(e));
} finally {
  proc.kill();
  console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests passent');
  process.exit(failures ? 1 : 0);
}
