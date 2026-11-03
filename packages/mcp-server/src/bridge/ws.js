// Serveur WebSocket minimal (RFC 6455) sans dépendance, limité à ce dont le pont a besoin :
// trames texte, ping/pong, close ; clients masqués (navigateur), serveur non masqué ; pas de fragmentation.
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

export class WebSocketConnection extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.open = true;
    socket.on('data', (chunk) => { this.buffer = Buffer.concat([this.buffer, chunk]); this.#drain(); });
    socket.on('close', () => { if (this.open) { this.open = false; this.emit('close'); } });
    socket.on('error', (e) => { this.emit('error', e); });
  }

  #drain() {
    for (;;) {
      const b = this.buffer;
      if (b.length < 2) return;
      const fin = (b[0] & 0x80) !== 0, opcode = b[0] & 0x0f, masked = (b[1] & 0x80) !== 0;
      let len = b[1] & 0x7f, off = 2;
      if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); off = 10; }
      const maskKey = masked ? b.subarray(off, off + 4) : null;
      if (masked) off += 4;
      if (b.length < off + len) return;
      let payload = Buffer.from(b.subarray(off, off + len));
      if (masked) for (let i = 0; i < payload.length; i++) payload[i] ^= maskKey[i % 4];
      this.buffer = b.subarray(off + len);
      if (!fin) { this.emit('error', new Error('Trame fragmentée non supportée')); this.close(1003); return; }
      switch (opcode) {
        case 0x1: this.emit('message', payload.toString('utf8')); break;
        case 0x2: this.emit('message', payload); break;
        case 0x8: this.open = false; this.#frame(0x8, payload); this.socket.end(); this.emit('close'); return;
        case 0x9: this.#frame(0xA, payload); break; // ping → pong
        case 0xA: break; // pong
        default: break;
      }
    }
  }

  #frame(opcode, payload) {
    if (!this.socket.writable) return;
    const len = payload.length;
    let header;
    if (len < 126) header = Buffer.from([0x80 | opcode, len]);
    else if (len < 65536) { header = Buffer.alloc(4); header[0] = 0x80 | opcode; header[1] = 126; header.writeUInt16BE(len, 2); }
    else { header = Buffer.alloc(10); header[0] = 0x80 | opcode; header[1] = 127; header.writeBigUInt64BE(BigInt(len), 2); }
    this.socket.write(Buffer.concat([header, payload]));
  }

  send(data) { if (this.open) this.#frame(0x1, Buffer.from(typeof data === 'string' ? data : JSON.stringify(data), 'utf8')); }
  ping() { this.#frame(0x9, Buffer.alloc(0)); }
  close(code = 1000) {
    if (!this.open) return;
    this.open = false;
    const p = Buffer.alloc(2); p.writeUInt16BE(code, 0);
    this.#frame(0x8, p);
    this.socket.end();
    this.emit('close');
  }
}

/** Démarre un serveur HTTP+WebSocket sur 127.0.0.1. Résout avec { server, port }. onConnection(conn, req). */
export function startWebSocketServer({ port, host = '127.0.0.1', onConnection }) {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => { res.writeHead(426, { 'Content-Type': 'text/plain' }); res.end('adobe-mcp bridge: WebSocket uniquement'); });
    server.on('upgrade', (req, socket, head) => {
      const key = req.headers['sec-websocket-key'];
      if (req.headers.upgrade?.toLowerCase() !== 'websocket' || !key) { socket.write('HTTP/1.1 400 Bad Request\r\n\r\n'); socket.destroy(); return; }
      const accept = createHash('sha1').update(key + GUID).digest('base64');
      socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' + `Sec-WebSocket-Accept: ${accept}\r\n\r\n`);
      const conn = new WebSocketConnection(socket);
      if (head?.length) { conn.buffer = Buffer.concat([conn.buffer, head]); }
      onConnection(conn, req);
    });
    server.on('error', reject);
    server.listen(port, host, () => resolve({ server, port: server.address().port }));
  });
}
