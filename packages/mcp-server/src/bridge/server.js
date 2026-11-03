// Pont : serveur WebSocket local, registre des hôtes Adobe connectés, appels avec timeout, journal.
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync, appendFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { EventEmitter } from 'node:events';
import { startWebSocketServer } from './ws.js';
import { BRIDGE_FILE, LOG_DIR } from '../config.js';

const PROTOCOL = 1;
const PING_INTERVAL_MS = 10000;
const HOST_TIMEOUT_MS = 30000;

export class BridgeError extends Error {
  constructor(code, message, detail) { super(message); this.code = code; this.detail = detail; }
}

export class Bridge extends EventEmitter {
  constructor({ port, callTimeoutMs = 60000, serverVersion = '0.1.0' }) {
    super();
    this.requestedPort = port;
    this.callTimeoutMs = callTimeoutMs;
    this.serverVersion = serverVersion;
    this.token = randomBytes(16).toString('hex');
    this.hosts = new Map();   // hostId → { id, app, appVersion, bridge, bridgeVersion, os, capabilities, conn, lastSeen, pending }
    this.seq = 0;
    this.logFile = join(LOG_DIR, `${new Date().toISOString().slice(0, 10)}.jsonl`);
  }

  async start() {
    let result;
    try { result = await startWebSocketServer({ port: this.requestedPort, onConnection: (c, req) => this.#onConnection(c, req) }); }
    catch (e) {
      if (e.code !== 'EADDRINUSE') throw e;
      result = await startWebSocketServer({ port: 0, onConnection: (c, req) => this.#onConnection(c, req) }); // port libre
    }
    this.server = result.server; this.port = result.port;
    mkdirSync(dirname(BRIDGE_FILE), { recursive: true });
    writeFileSync(BRIDGE_FILE, JSON.stringify({ protocol: PROTOCOL, port: this.port, token: this.token, pid: process.pid, startedAt: new Date().toISOString() }, null, 2));
    this.pingTimer = setInterval(() => this.#sweep(), PING_INTERVAL_MS);
    this.log('bridge.started', { port: this.port });
    return this;
  }

  stop() {
    clearInterval(this.pingTimer);
    for (const h of this.hosts.values()) h.conn.close();
    this.server?.close();
    try { rmSync(BRIDGE_FILE, { force: true }); } catch {}
  }

  log(event, data) {
    try { appendFileSync(this.logFile, JSON.stringify({ t: new Date().toISOString(), event, ...data }) + '\n'); } catch {}
  }

  #onConnection(conn, req) {
    let host = null;
    conn.on('message', (raw) => {
      let msg; try { msg = JSON.parse(raw); } catch { return; }
      if (!host) {
        if (msg.type !== 'hello') { conn.send({ type: 'error', message: 'hello attendu' }); return conn.close(1002); }
        if (msg.protocol !== PROTOCOL) { conn.send({ type: 'error', message: `protocole ${msg.protocol} non supporté (attendu ${PROTOCOL})` }); return conn.close(1002); }
        if (msg.token && msg.token !== this.token) { conn.send({ type: 'error', message: 'token invalide : relancez le serveur MCP ou cliquez Reconnecter' }); return conn.close(1008); }
        if (!msg.token) this.log('bridge.hello.notoken', { app: msg.app }); // toléré en local, journalisé
        host = { id: `${msg.app}-${++this.seq}`, app: msg.app, appVersion: msg.appVersion, bridge: msg.bridge, bridgeVersion: msg.bridgeVersion,
                 os: msg.os, capabilities: new Set(msg.capabilities || []), conn, lastSeen: Date.now(), pending: new Map(), connectedAt: new Date().toISOString() };
        // un seul hôte par application : le nouveau remplace l'ancien
        for (const [id, h] of this.hosts) if (h.app === host.app) { h.conn.close(); this.hosts.delete(id); }
        this.hosts.set(host.id, host);
        conn.send({ type: 'welcome', hostId: host.id, serverVersion: this.serverVersion });
        this.log('host.connected', { hostId: host.id, app: host.app, appVersion: host.appVersion, fns: host.capabilities.size });
        this.emit('host', host);
        return;
      }
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
    conn.on('close', () => { if (host) this.#dropHost(host, 'HOST_DISCONNECTED'); });
    conn.on('error', () => {});
  }

  #dropHost(host, code) {
    if (!this.hosts.has(host.id)) return;
    this.hosts.delete(host.id);
    for (const p of host.pending.values()) { clearTimeout(p.timer); p.reject(new BridgeError(code, `Hôte ${host.app} déconnecté pendant l'appel`)); }
    this.log('host.disconnected', { hostId: host.id, app: host.app });
    this.emit('hostgone', host);
  }

  #sweep() {
    const now = Date.now();
    for (const h of [...this.hosts.values()]) {
      if (now - h.lastSeen > HOST_TIMEOUT_MS) { h.conn.close(); this.#dropHost(h, 'HOST_TIMEOUT'); }
      else h.conn.ping();
    }
  }

  host(app) { for (const h of this.hosts.values()) if (h.app === app) return h; return null; }

  status() {
    return [...this.hosts.values()].map(h => ({ hostId: h.id, app: h.app, appVersion: h.appVersion, bridge: h.bridge, bridgeVersion: h.bridgeVersion,
                                                os: h.os, functions: [...h.capabilities].sort(), connectedAt: h.connectedAt, pendingCalls: h.pending.size }));
  }

  /** Appelle fn sur l'hôte de l'application donnée. */
  call(app, fn, args = {}, { timeoutMs } = {}) {
    const host = this.host(app);
    const label = app === 'ppro' ? 'Premiere Pro' : app === 'aeft' ? 'After Effects' : app;
    if (!host) throw new BridgeError('HOST_DISCONNECTED', `${label} n'est pas connecté. Ouvrez l'application, puis le panneau Fenêtre > Extensions > Adobe MCP (il doit afficher « Connecté »).`);
    if (host.capabilities.size && !host.capabilities.has(fn)) throw new BridgeError('UNSUPPORTED', `La fonction ${fn} n'est pas disponible sur ${label} ${host.appVersion}`);
    const id = randomUUID();
    const ms = timeoutMs ?? this.callTimeoutMs;
    this.log('call.start', { hostId: host.id, id, fn, args });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { host.pending.delete(id); reject(new BridgeError('TIMEOUT', `${fn} n'a pas répondu en ${ms / 1000} s (dialogue ouvert dans ${label} ? rendu en cours ?)`)); }, ms);
      host.pending.set(id, { fn, resolve, reject, timer });
      host.conn.send({ type: 'call', id, fn, args, timeoutMs: ms });
    });
  }
}
