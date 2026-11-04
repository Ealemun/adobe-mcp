// Tools MCP After Effects (phase 1 : socle minimal).
import { imageContent } from '../files.js';
import { text } from '../mcp.js';

export function registerAeftTools(server, bridge) {
  const call = (fn, args, opts) => bridge.call('aeft', fn, args, opts);
  const readOnly = { readOnlyHint: true, openWorldHint: false };

  server.registerTool({
    name: 'aeft_get_capabilities', title: 'Capacités After Effects',
    description: 'Vérifie qu\'After Effects est connecté et renvoie sa version et les fonctions disponibles.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: readOnly,
    handler: async () => {
      const h = bridge.host('aeft');
      if (!h) throw Object.assign(new Error('After Effects n\'est pas connecté. Ouvrez-le puis Fenêtre > Extensions > Adobe MCP.'), { code: 'HOST_DISCONNECTED' });
      return text({ app: 'After Effects', version: h.appVersion, bridge: `${h.bridge} ${h.bridgeVersion}`, functions: [...h.capabilities].sort() });
    }
  });

  server.registerTool({
    name: 'aeft_get_project', title: 'Projet After Effects',
    description: 'Nom, chemin, nombre d\'éléments et de compositions, composition active.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: readOnly,
    handler: async () => text(await call('project.get'))
  });

  server.registerTool({
    name: 'aeft_list_comps', title: 'Lister les compositions',
    description: 'Compositions du projet : id, nom, taille, fps, durée, nombre de calques.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: readOnly,
    handler: async () => text(await call('comp.list'))
  });

  server.registerTool({
    name: 'aeft_get_comp', title: 'Lire une composition',
    description: 'Calques d\'une composition (index, nom, type, in/out, parent, texte source pour les calques texte).',
    inputSchema: { type: 'object', additionalProperties: false, properties: { compId: { type: 'string', description: 'ID de composition (défaut : active).' } } },
    annotations: readOnly,
    handler: async (a) => text(await call('comp.get', a))
  });

  server.registerTool({
    name: 'aeft_create_comp', title: 'Créer une composition',
    description: 'Crée une composition vide et l\'ouvre.',
    inputSchema: {
      type: 'object', required: ['name'], additionalProperties: false,
      properties: { name: { type: 'string' }, width: { type: 'integer', default: 1920 }, height: { type: 'integer', default: 1080 },
                    fps: { type: 'number', default: 30 }, duration: { type: 'number', default: 10, description: 'secondes' }, open: { type: 'boolean', default: true } }
    },
    handler: async (a) => text(await call('comp.create', a))
  });

  server.registerTool({
    name: 'aeft_export_frame', title: 'Exporter une image (AE)',
    description: 'Rend une image PNG de la composition à l\'instant donné et la renvoie pour inspection.',
    inputSchema: { type: 'object', additionalProperties: false, properties: { compId: { type: 'string' }, time: { type: 'number', minimum: 0 }, path: { type: 'string' }, inline: { type: 'boolean', default: true } } },
    annotations: readOnly,
    handler: async (a) => {
      const { inline = true, ...args } = a;
      const r = await call('export.frame', args, { timeoutMs: 120000 });
      return imageContent(r, { inline });
    }
  });
}
