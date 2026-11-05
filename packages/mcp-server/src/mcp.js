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
            // Validation des arguments contre le schéma du tool : erreur lisible plutôt qu'un plantage côté Adobe.
            const args = params.arguments ?? {};
            const problems = validateArgs(tool.inputSchema, args, '');
            if (problems.length) return reply({ content: [{ type: 'text', text: `BAD_ARGS: ${problems.join(' ; ')}\nParamètres attendus : ${Object.keys(tool.inputSchema.properties ?? {}).join(', ')}` }], isError: true });
            const result = await tool.handler(args);
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

/** Validation JSON Schema minimale (type, required, additionalProperties, enum, bornes, items, anyOf). Convertit nombre→chaîne quand une chaîne est attendue. */
export function validateArgs(schema, value, path) {
  const out = [];
  if (!schema || typeof schema !== 'object' || !Object.keys(schema).length) return out;
  const label = path || 'arguments';
  if (schema.anyOf) {
    const ok = schema.anyOf.some((s) => validateArgs(s, value, path).length === 0);
    if (!ok) out.push(`${label} : valeur invalide`);
    return out;
  }
  const types = schema.type ? [].concat(schema.type) : null;
  const jsType = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  if (types) {
    const matches = types.some((t) => t === jsType || (t === 'integer' && jsType === 'number' && Number.isInteger(value)));
    if (!matches) {
      if (types.includes('string') && jsType === 'number') return out; // converti par l'appelant (coerce)
      out.push(`${label} : attendu ${types.join('|')}, reçu ${jsType}`);
      return out;
    }
  }
  if (schema.enum && !schema.enum.includes(value)) out.push(`${label} : valeurs possibles ${schema.enum.join(', ')}`);
  if (jsType === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) out.push(`${label} : minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) out.push(`${label} : maximum ${schema.maximum}`);
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) out.push(`${label} : doit être > ${schema.exclusiveMinimum}`);
  }
  if (jsType === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) out.push(`${label} : au moins ${schema.minItems} élément(s)`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) out.push(`${label} : au plus ${schema.maxItems} élément(s)`);
    if (schema.items) value.forEach((v, i) => { out.push(...validateArgs(schema.items, v, `${label}[${i}]`)); if (schema.items.type === 'string' && typeof v === 'number') value[i] = String(v); });
  }
  if (jsType === 'object' && schema.properties) {
    for (const k of schema.required ?? []) if (value[k] === undefined) out.push(`${path ? path + '.' : ''}${k} manquant`);
    for (const [k, v] of Object.entries(value)) {
      const sub = schema.properties[k];
      if (!sub) { if (schema.additionalProperties === false) out.push(`paramètre inconnu « ${k} »`); continue; }
      out.push(...validateArgs(sub, v, path ? `${path}.${k}` : k));
      if (sub.type === 'string' && typeof v === 'number') value[k] = String(v);
    }
  }
  return out;
}

export function formatError(e) {
  if (e && typeof e === 'object' && e.code && e.message) {
    return `${e.code}: ${e.message}${e.detail ? `\n${typeof e.detail === 'string' ? e.detail : JSON.stringify(e.detail)}` : ''}`;
  }
  return e?.stack || String(e);
}

export const text = (data) => ({ content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }] });
