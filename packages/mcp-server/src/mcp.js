// Serveur MCP minimal sur stdio (JSON-RPC 2.0, messages séparés par des sauts de ligne).
// Sans dépendance : couvre initialize, ping, tools/list, tools/call, resources/list, resources/read.
import { createInterface } from 'node:readline';

const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

export class McpServer {
  constructor({ name, version, instructions }) {
    this.info = { name, version };
    this.instructions = instructions;
    this.tools = new Map();
    this.resources = new Map();
    this.out = process.stdout;
  }

  /** tool = { name, title?, description, inputSchema (JSON Schema), handler(args) → { content, isError? } } */
  registerTool(tool) { this.tools.set(tool.name, tool); }
  /** resource = { uri, name, description?, mimeType?, read() → string } */
  registerResource(res) { this.resources.set(res.uri, res); }

  send(msg) { this.out.write(JSON.stringify(msg) + '\n'); }
  notify(method, params) { this.send({ jsonrpc: '2.0', method, params }); }
  log(level, data, logger = 'adobe-mcp') { this.notify('notifications/message', { level, logger, data }); }

  async handle(msg) {
    const { id, method, params = {} } = msg;
    const reply = (result) => { if (id !== undefined) this.send({ jsonrpc: '2.0', id, result }); };
    const fail = (code, message, data) => { if (id !== undefined) this.send({ jsonrpc: '2.0', id, error: { code, message, data } }); };
    try {
      switch (method) {
        case 'initialize': {
          const requested = params.protocolVersion;
          const protocolVersion = SUPPORTED_VERSIONS.includes(requested) ? requested : SUPPORTED_VERSIONS[0];
          return reply({ protocolVersion, capabilities: { tools: { listChanged: false }, resources: { listChanged: false }, logging: {} },
                         serverInfo: this.info, instructions: this.instructions });
        }
        case 'notifications/initialized':
        case 'notifications/cancelled':
        case 'notifications/roots/list_changed':
          return; // notifications : pas de réponse
        case 'ping':
          return reply({});
        case 'tools/list':
          return reply({ tools: [...this.tools.values()].map(t => ({ name: t.name, title: t.title, description: t.description, inputSchema: t.inputSchema, annotations: t.annotations })) });
        case 'tools/call': {
          const tool = this.tools.get(params.name);
          if (!tool) return fail(-32602, `Tool inconnu : ${params.name}`);
          try {
            const result = await tool.handler(params.arguments ?? {});
            return reply(result);
          } catch (e) {
            // Erreur d'exécution d'un tool : renvoyée comme résultat isError (le client la montre au modèle)
            return reply({ content: [{ type: 'text', text: formatError(e) }], isError: true });
          }
        }
        case 'resources/list':
          return reply({ resources: [...this.resources.values()].map(r => ({ uri: r.uri, name: r.name, description: r.description, mimeType: r.mimeType ?? 'application/json' })) });
        case 'resources/read': {
          const r = this.resources.get(params.uri);
          if (!r) return fail(-32002, `Ressource inconnue : ${params.uri}`);
          const text = await r.read();
          return reply({ contents: [{ uri: r.uri, mimeType: r.mimeType ?? 'application/json', text }] });
        }
        case 'prompts/list':
          return reply({ prompts: [] });
        default:
          return fail(-32601, `Méthode non supportée : ${method}`);
      }
    } catch (e) {
      return fail(-32603, formatError(e));
    }
  }

  start() {
    const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
    rl.on('line', (line) => {
      line = line.trim();
      if (!line) return;
      let msg;
      try { msg = JSON.parse(line); } catch { return this.send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON invalide' } }); }
      if (Array.isArray(msg)) msg.forEach(m => this.handle(m)); else this.handle(msg);
    });
    rl.on('close', () => process.exit(0));
  }
}

export function formatError(e) {
  if (e && typeof e === 'object' && e.code && e.message) {
    return `${e.code}: ${e.message}${e.detail ? `\n${typeof e.detail === 'string' ? e.detail : JSON.stringify(e.detail)}` : ''}`;
  }
  return e?.stack || String(e);
}

export const text = (data) => ({ content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }] });
