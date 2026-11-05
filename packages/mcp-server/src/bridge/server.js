// Pont entre le serveur MCP et les panneaux Adobe, partagé par plusieurs clients MCP à la fois.
//
// Chaque client MCP (chaque fenêtre d'assistant) lance son propre serveur adobe-mcp. Un seul peut écouter le
// port du pont (8765), et chaque panneau Adobe ne se connecte qu'à un seul serveur. D'où deux rôles :
//  - « principal » (leader) : écoute le port, accueille les panneaux Premiere / After Effects, écrit bridge.json ;
//  - « relais » (peer) : se connecte au principal comme un client et lui fait exécuter ses appels.
// Le premier serveur lancé devient principal. Si le principal s'arrête (fermeture de son client MCP), un relais
// reprend le port ; les panneaux se reconnectent tout seuls (nouvel essai toutes les 3 s, nouveau jeton lu dans
// bridge.json). Vu des tools, rien ne change : host(), call(), status(), hosts, port.
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync, appendFileSync, rmSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { EventEmitter } from 'node:events';
import { startWebSocketServer, connectWebSocket } from './ws.js';
import { BRIDGE_FILE, LOG_DIR } from '../config.js';

const PROTOCOL = 1;
const PING_INTERVAL_MS = 10000;
const HOST_TIMEOUT_MS = 30000;
const TAKEOVER_DELAY_MS = [300, 1500]; // délai aléatoire avant de reprendre le port : évite que deux relais se le disputent

export class BridgeError extends Error {
  constructor(code, message, detail) { super(message); this.code = code; this.detail = detail; }
}

const appLabel = (app) => (app === 'ppro' ? 'Premiere Pro' : app === 'aeft' ? 'After Effects' : app);

export class Bridge extends EventEmitter {
  constructor({ port, callTimeoutMs = 60000, serverVersion = '0.1.0' }) {
    super();
    this.requestedPort = port;
    this.callTimeoutMs = callTimeoutMs;
    this.serverVersion = serverVersion;
    this.token = randomBytes(16).toString('hex');
    this.role = null;          // 'leader' | 'peer'
    this.hosts = new Map();    // principal : hostId → hôte connecté ; relais : copie distante (sans conn)
    this.peers = new Map();    // principal : peerId → { conn, pid }
    this.peerPending = new Map(); // relais : id d'appel → { resolve, reject, timer, fn }
    this.seq = 0;
    this.stopped = false;
    this.logFile = join(LOG_DIR, `${new Date().toISOString().slice(0, 10)}.jsonl`);
  }

  // ---------------------------------------------------------------- démarrage et rôles
  async start() {
    await this.#claim();
    this.pingTimer = setInterval(() => this.#sweep(), PING_INTERVAL_MS);
    return this;
  }

  /** Devient principal si le port est libre, sinon relais d'un principal existant. */
  async #claim() {
    for (let attempt = 0; attempt < 5 && !this.stopped; attempt++) {
      try { await this.#becomeLeader(this.requestedPort); return; }
      catch (e) { if (e.code !== 'EADDRINUSE') throw e; }
      try { await this.#becomePeer(); return; }
      catch (e) {
        if (e.code === 'NOT_BRIDGE') {
          // Le port est tenu par un autre programme : on travaille seul sur un port libre (ancien comportement).
          this.log('bridge.port-foreign', { port: this.requestedPort });
          await this.#becomeLeader(0);
          return;
        }
        // Principal en train de s'arrêter, ou bridge.json pas encore écrit : on réessaie un peu plus tard.
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));
      }
    }
    throw new BridgeError('BRIDGE_START', `Impossible d'ouvrir ou de rejoindre le pont sur le port ${this.requestedPort}`);
  }

  async #becomeLeader(port) {
    const result = await startWebSocketServer({ port, onConnection: (c, req) => this.#onConnection(c, req) });
    this.server = result.server; this.port = result.port; this.role = 'leader';
    this.hosts.clear(); // copie distante éventuelle (ancien relais) : les panneaux vont se reconnecter ici
    mkdirSync(dirname(BRIDGE_FILE), { recursive: true });
    writeFileSync(BRIDGE_FILE, JSON.stringify({ protocol: PROTOCOL, port: this.port, token: this.token, pid: process.pid, startedAt: new Date().toISOString() }, null, 2));
    this.log('bridge.leader', { port: this.port });
    this.emit('role', 'leader');
  }

  async #becomePeer() {
    let info;
    try { info = JSON.parse(readFileSync(BRIDGE_FILE, 'utf8')); }
    catch { throw new BridgeError('NO_BRIDGE_FILE', 'bridge.json absent'); }
    if (info.port !== this.requestedPort && this.requestedPort !== 0) throw new BridgeError('STALE_BRIDGE_FILE', 'bridge.json ne correspond pas au port');
    const conn = await connectWebSocket({ port: this.requestedPort });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { conn.close(); reject(new BridgeError('PEER_TIMEOUT', 'Le pont principal ne répond pas')); }, 3000);
      conn.on('message', (raw) => {
        let msg; try { msg = JSON.parse(raw); } catch { return; }
        if (msg.type === 'welcome-peer') { clearTimeout(timer); this.#applyHostSnapshot(msg.hosts); resolve(); return; }
        if (msg.type === 'error') { clearTimeout(timer); conn.close(); reject(new BridgeError('PEER_REFUSED', msg.message)); return; }
        this.#onLeaderMessage(msg);
      });
      conn.on('close', () => this.#onLeaderLost());
      conn.on('error', () => {});
      conn.send({ type: 'hello-peer', protocol: PROTOCOL, token: info.token, pid: process.pid, serverVersion: this.serverVersion });
    });
    this.leaderConn = conn; this.port = this.requestedPort; this.role = 'peer';
    this.log('bridge.peer', { port: this.port, leaderPid: info.pid });
    this.emit('role', 'peer');
  }

  /** Relais : le principal a disparu → appels en cours en erreur, puis reprise du port (ou nouveau principal). */
  #onLeaderLost() {
    if (this.role !== 'peer' || this.stopped) return;
    this.leaderConn = null;
    for (const [id, p] of this.peerPending) { clearTimeout(p.timer); p.reject(new BridgeError('BRIDGE_RESTART', `Le pont a changé de serveur pendant ${p.fn} : relancer l'appel (vérifier d'abord l'état dans l'application).`)); this.peerPending.delete(id); }
    for (const h of this.hosts.values()) this.emit('hostgone', h);
    this.hosts.clear();
    this.role = null;
    this.log('bridge.leader-lost', {});
    const delay = TAKEOVER_DELAY_MS[0] + Math.random() * (TAKEOVER_DELAY_MS[1] - TAKEOVER_DELAY_MS[0]);
    setTimeout(() => this.#claim().catch((e) => this.log('bridge.claim-failed', { error: e.message })), delay);
  }

  stop() {
    this.stopped = true;
    clearInterval(this.pingTimer);
    if (this.role === 'leader') {
      for (const h of this.hosts.values()) h.conn.close();
      for (const p of this.peers.values()) p.conn.close();
      this.server?.close();
      // Ne supprime bridge.json que s'il est encore le nôtre (un relais a pu reprendre entre-temps).
      try { const info = JSON.parse(readFileSync(BRIDGE_FILE, 'utf8')); if (info.pid === process.pid) rmSync(BRIDGE_FILE, { force: true }); } catch {}
    } else this.leaderConn?.close();
  }

  log(event, data) {
    try { appendFileSync(this.logFile, JSON.stringify({ t: new Date().toISOString(), pid: process.pid, role: this.role, event, ...data }) + '\n'); } catch {}
  }

  // ---------------------------------------------------------------- principal : connexions entrantes
  #onConnection(conn) {
    let host = null, peer = null;
    conn.on('message', (raw) => {
      let msg; try { msg = JSON.parse(raw); } catch { return; }
      if (!host && !peer) {
        if (msg.type === 'hello-peer') {
          if (msg.protocol !== PROTOCOL || msg.token !== this.token) { conn.send({ type: 'error', message: 'jeton ou protocole invalide' }); return conn.close(1008); }
          peer = { id: `peer-${++this.seq}`, pid: msg.pid, conn, lastSeen: Date.now() };
          this.peers.set(peer.id, peer);
          conn.send({ type: 'welcome-peer', peerId: peer.id, hosts: this.#hostSnapshot() });
          this.log('peer.connected', { peerId: peer.id, pid: msg.pid });
          return;
        }
        if (msg.type !== 'hello') { conn.send({ type: 'error', message: 'hello attendu' }); return conn.close(1002); }
        if (msg.protocol !== PROTOCOL) { conn.send({ type: 'error', message: `protocole ${msg.protocol} non supporté (attendu ${PROTOCOL})` }); return conn.close(1002); }
        if (msg.token && msg.token !== this.token) { conn.send({ type: 'error', message: 'jeton périmé : le panneau va relire bridge.json et se reconnecter' }); return conn.close(1008); }
        if (!msg.token) this.log('bridge.hello.notoken', { app: msg.app });
        host = { id: `${msg.app}-${++this.seq}`, app: msg.app, appVersion: msg.appVersion, bridge: msg.bridge, bridgeVersion: msg.bridgeVersion,
                 os: msg.os, capabilities: new Set(msg.capabilities || []), conn, lastSeen: Date.now(), pending: new Map(), connectedAt: new Date().toISOString() };
        // un seul hôte par application : le nouveau remplace l'ancien
        for (const [id, h] of this.hosts) if (h.app === host.app) { h.conn.close(); this.hosts.delete(id); }
        this.hosts.set(host.id, host);
        conn.send({ type: 'welcome', hostId: host.id, serverVersion: this.serverVersion });
        this.log('host.connected', { hostId: host.id, app: host.app, appVersion: host.appVersion, fns: host.capabilities.size });
        this.emit('host', host);
        this.#broadcastHosts();
        return;
      }
      if (peer) return this.#onPeerMessage(peer, msg);
      host.lastSeen = Date.now();
      switch (msg.type) {
        case 'ping': return conn.send({ type: 'pong' });
        case 'pong': return;
        case 'result': {
          const p = host.pending.get(msg.id);
          if (!p) return;
          host.pending.delete(msg.id); clearTimeout(p.timer);
          this.log('call.result', { hostId: host.id, id: msg.id, fn: p.fn, ok: msg.ok, durationMs: msg.durationMs, error: msg.ok ? undefined : msg.error?.code });
          return msg.ok ? p.resolve(msg.data) : p.reject(new BridgeError(msg.error?.code || 'HOST_ERROR', msg.error?.message || 'Erreur hôte', msg.error?.detail));
        }
        case 'progress': this.emit('progress', { host, ...msg }); return;
        case 'event': this.emit('event', { host, name: msg.name, data: msg.data }); return;
        default: return;
      }
    });
    conn.on('close', () => {
      if (host) this.#dropHost(host, 'HOST_DISCONNECTED');
      if (peer) { this.peers.delete(peer.id); this.log('peer.disconnected', { peerId: peer.id }); }
    });
    conn.on('error', () => {});
  }

  /** Principal : un relais demande d'exécuter un appel sur un hôte. On l'exécute comme un appel local. */
  #onPeerMessage(peer, msg) {
    peer.lastSeen = Date.now();
    if (msg.type === 'ping') return peer.conn.send({ type: 'pong' });
    if (msg.type !== 'peer-call') return;
    let promise;
    try { promise = this.call(msg.app, msg.fn, msg.args, { timeoutMs: msg.timeoutMs, via: peer.id }); }
    catch (e) { return peer.conn.send({ type: 'peer-result', id: msg.id, ok: false, error: { code: e.code, message: e.message, detail: e.detail } }); }
    promise.then(
      (data) => peer.conn.send({ type: 'peer-result', id: msg.id, ok: true, data }),
      (e) => peer.conn.send({ type: 'peer-result', id: msg.id, ok: false, error: { code: e.code, message: e.message, detail: e.detail } })
    );
  }

  #hostSnapshot() {
    return [...this.hosts.values()].map((h) => ({ id: h.id, app: h.app, appVersion: h.appVersion, bridge: h.bridge, bridgeVersion: h.bridgeVersion,
                                                  os: h.os, capabilities: [...h.capabilities], connectedAt: h.connectedAt }));
  }
  #broadcastHosts() {
    const hosts = this.#hostSnapshot();
    for (const p of this.peers.values()) p.conn.send({ type: 'hosts', hosts });
  }

  // ---------------------------------------------------------------- relais : messages du principal
  #onLeaderMessage(msg) {
    if (msg.type === 'hosts') return this.#applyHostSnapshot(msg.hosts);
    if (msg.type === 'peer-result') {
      const p = this.peerPending.get(msg.id);
      if (!p) return;
      this.peerPending.delete(msg.id); clearTimeout(p.timer);
      return msg.ok ? p.resolve(msg.data) : p.reject(new BridgeError(msg.error?.code || 'HOST_ERROR', msg.error?.message || 'Erreur hôte', msg.error?.detail));
    }
  }
  /** Remplace la copie locale des hôtes par celle du principal et émet host / hostgone pour les changements. */
  #applyHostSnapshot(list = []) {
    const next = new Map(list.map((h) => [h.id, { ...h, capabilities: new Set(h.capabilities), pending: new Map(), remote: true }]));
    for (const [id, h] of this.hosts) if (!next.has(id)) this.emit('hostgone', h);
    for (const [id, h] of next) if (!this.hosts.has(id)) this.emit('host', h);
    this.hosts = next;
  }

  // ---------------------------------------------------------------- commun
  #dropHost(host, code) {
    if (!this.hosts.has(host.id)) return;
    this.hosts.delete(host.id);
    for (const p of host.pending.values()) { clearTimeout(p.timer); p.reject(new BridgeError(code, `Hôte ${host.app} déconnecté pendant l'appel`)); }
    this.log('host.disconnected', { hostId: host.id, app: host.app });
    this.emit('hostgone', host);
    this.#broadcastHosts();
  }

  #sweep() {
    if (this.role === 'peer') { this.leaderConn?.send({ type: 'ping' }); return; }
    const now = Date.now();
    for (const h of [...this.hosts.values()]) {
      if (now - h.lastSeen > HOST_TIMEOUT_MS) { h.conn.close(); this.#dropHost(h, 'HOST_TIMEOUT'); }
      else h.conn.ping();
    }
    for (const p of this.peers.values()) p.conn.ping();
  }

  host(app) { for (const h of this.hosts.values()) if (h.app === app) return h; return null; }

  status() {
    return [...this.hosts.values()].map((h) => ({ hostId: h.id, app: h.app, appVersion: h.appVersion, bridge: h.bridge, bridgeVersion: h.bridgeVersion,
                                                  os: h.os, functions: [...h.capabilities].sort(), connectedAt: h.connectedAt, pendingCalls: h.pending.size }));
  }

  /** Rôle de ce serveur et nombre de clients MCP qui partagent le pont (pour adobe_status). */
  info() {
    return { role: this.role, port: this.port, sharedWith: this.role === 'leader' ? this.peers.size : null,
             note: this.role === 'peer' ? 'Ce client passe par le pont d\'un autre client MCP ouvert : tout fonctionne de la même façon.' : undefined };
  }

  /** Appelle fn sur l'hôte de l'application donnée (directement si principal, via le principal si relais). */
  call(app, fn, args = {}, { timeoutMs, via } = {}) {
    const host = this.host(app);
    const label = appLabel(app);
    if (!host) throw new BridgeError('HOST_DISCONNECTED', `${label} n'est pas connecté. Ouvrez l'application, puis le panneau Fenêtre > Extensions > Adobe MCP (il doit afficher « Connecté »).`);
    if (host.capabilities.size && !host.capabilities.has(fn)) throw new BridgeError('UNSUPPORTED', `La fonction ${fn} n'est pas disponible sur ${label} ${host.appVersion}`);
    const id = randomUUID();
    const ms = timeoutMs ?? this.callTimeoutMs;
    if (this.role === 'peer') {
      if (!this.leaderConn) throw new BridgeError('BRIDGE_RESTART', 'Le pont est en train de changer de serveur : réessayer dans quelques secondes.');
      return new Promise((resolve, reject) => {
        // Marge de 5 s : le principal applique lui-même le délai et renvoie son erreur TIMEOUT.
        const timer = setTimeout(() => { this.peerPending.delete(id); reject(new BridgeError('TIMEOUT', `${fn} n'a pas répondu en ${ms / 1000} s (dialogue ouvert dans ${label} ? rendu en cours ?)`)); }, ms + 5000);
        this.peerPending.set(id, { fn, resolve, reject, timer });
        this.leaderConn.send({ type: 'peer-call', id, app, fn, args, timeoutMs: ms });
      });
    }
    this.log('call.start', { hostId: host.id, id, fn, args, via });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { host.pending.delete(id); reject(new BridgeError('TIMEOUT', `${fn} n'a pas répondu en ${ms / 1000} s (dialogue ouvert dans ${label} ? rendu en cours ?)`)); }, ms);
      host.pending.set(id, { fn, resolve, reject, timer });
      host.conn.send({ type: 'call', id, fn, args, timeoutMs: ms });
    });
  }
}
