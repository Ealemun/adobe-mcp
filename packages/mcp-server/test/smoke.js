// Test de fumée : lance le serveur MCP, connecte un faux Premiere, dialogue en MCP sur stdio.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { startFakeHost } from './fake-host.js';

const serverPath = fileURLToPath(new URL('../src/index.js', import.meta.url));
const proc = spawn(process.execPath, [serverPath], { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, ADOBE_MCP_CONFIG: '' } });
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
