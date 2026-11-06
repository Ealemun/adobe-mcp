// Test du pont partagé : deux serveurs adobe-mcp (deux clients MCP) sur le même port.
//  1. le premier devient principal, le second relais ;
//  2. un faux Premiere et un faux After Effects se connectent au principal ;
//  3. les deux serveurs appellent les deux applications en même temps ;
//  4. le principal s'arrête : le relais reprend le port, les panneaux se reconnectent, les appels refonctionnent.
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';

// Isolation : bridge.json et port propres au test.
process.env.ADOBE_MCP_BRIDGE_FILE = join(mkdtempSync(join(tmpdir(), 'adobe-mcp-share-')), 'bridge.json');
const port = await new Promise((r) => { const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const { Bridge } = await import('../src/bridge/server.js');
const { startFakeHost } = await import('./fake-host.js');

let failures = 0;
const check = (label, ok, info) => { console.log(`${ok ? '✓' : '✗'} ${label}${info ? ' — ' + info : ''}`); if (!ok) failures++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Attend qu'une condition devienne vraie (reconnexions asynchrones).
const until = async (fn, ms = 6000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await wait(50); } return false; };

// Faux panneau qui se reconnecte comme le vrai (nouvel essai toutes les 300 ms ici au lieu de 3 s).
function persistentHost(app, appVersion) {
  const state = { ws: null, stopped: false };
  const loop = async () => {
    while (!state.stopped) {
      try { state.ws = await startFakeHost({ app, appVersion }); await new Promise((r) => { state.ws.onclose = r; }); }
      catch { /* serveur absent ou en transition */ }
      state.ws = null;
      await wait(300);
    }
  };
  loop();
  return { stop: () => { state.stopped = true; state.ws?.close(); } };
}

try {
  const a = await new Bridge({ port, serverVersion: 'test-A' }).start();
  const b = await new Bridge({ port, serverVersion: 'test-B' }).start();
  check('premier serveur = principal', a.role === 'leader' && a.port === port);
  check('second serveur = relais (même port, pas de port aléatoire)', b.role === 'peer' && b.port === port);

  const ppro = persistentHost('ppro', '14.9.0');
  const aeft = persistentHost('aeft', '17.0');
  check('les deux applications sont visibles depuis le principal', await until(() => a.host('ppro') && a.host('aeft')));
  check('… et depuis le relais', await until(() => b.host('ppro') && b.host('aeft')));

  // Appels croisés simultanés : A sur After Effects, B sur Premiere, et l'inverse.
  const [r1, r2, r3, r4] = await Promise.all([
    a.call('aeft', 'project.get'), b.call('ppro', 'project.get'), b.call('aeft', 'project.get'), a.call('ppro', 'sequence.list')
  ]);
  check('appels simultanés des deux serveurs vers les deux applications', r1.version === '17.0' && r2.version === '14.9.0' && r3.version === '17.0' && Array.isArray(r4));
  check('le principal compte un client relais', a.info().sharedWith === 1);

  // Erreur d'hôte relayée telle quelle
  let relayed = null;
  try { await b.call('ppro', 'fonction.inconnue'); } catch (e) { relayed = e; }
  check('erreur claire relayée au relais', relayed?.code === 'UNSUPPORTED', relayed?.message);

  // Le principal s'arrête (fermeture de son client MCP) → le relais reprend le port.
  a.stop();
  check('le relais reprend le rôle principal', await until(() => b.role === 'leader'), `rôle ${b.role}`);
  check('les panneaux se reconnectent au nouveau principal', await until(() => b.host('ppro') && b.host('aeft')));
  const r5 = await b.call('aeft', 'project.get');
  check('appels de nouveau possibles après la reprise', r5.version === '17.0');

  // Un troisième client arrive après la reprise : il devient relais du nouveau principal.
  const c = await new Bridge({ port, serverVersion: 'test-C' }).start();
  check('un nouveau client rejoint le pont en relais', c.role === 'peer' && await until(() => c.host('ppro')));
  const r6 = await c.call('ppro', 'project.get');
  check('appel depuis le nouveau relais', r6.version === '14.9.0');

  ppro.stop(); aeft.stop(); c.stop(); b.stop();
  await wait(300);

  // Ancienne version d'adobe-mcp sur le port (refuse hello-peer) : le nouveau serveur doit démarrer quand même.
  const { startWebSocketServer } = await import('../src/bridge/ws.js');
  const { writeFileSync } = await import('node:fs');
  const old = await startWebSocketServer({ port, onConnection: (conn) => conn.on('message', () => { conn.send({ type: 'error', message: 'hello attendu' }); conn.close(1002); }) });
  writeFileSync(process.env.ADOBE_MCP_BRIDGE_FILE, JSON.stringify({ protocol: 1, port, token: 'ancien', pid: 1 }));
  const d = await new Bridge({ port, serverVersion: 'test-D' }).start();
  check('ancienne version sur le port → démarrage seul sur un port libre', d.role === 'leader' && d.port !== port, `port ${d.port}`);
  d.stop(); old.server.close();
} catch (e) {
  check('exception', false, e.stack || String(e));
}
console.log(failures ? `\n${failures} échec(s)` : '\nPont partagé : tous les tests passent');
process.exit(failures ? 1 : 0);
