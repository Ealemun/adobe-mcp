// Tools MCP After Effects (aeft_*) : projet, compositions, calques, texte, formes, propriétés, images-clés, expressions,
// effets, précomposition, rendu, propriétés essentielles / MOGRT.
import { imageContent } from '../files.js';
import { text } from '../mcp.js';

const COMP_ID = { type: 'string', description: 'ID ou nom de composition (défaut : composition active).' };
const LAYER_ID = { type: 'string', description: 'Calque : index (1 = en haut), nom, ou id.' };
const LAYER_IDS = { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Calques : index, noms ou ids.' };
const PATH = { type: 'string', description: 'Chemin de propriété : "Transform.Position", "Transform.Scale", "Transform.Opacity", "Effects.Gaussian Blur.Blurriness", "Text.Source Text", "Contents.Forme.Contents.Rectangle Path 1.Size". Noms anglais ou matchNames ("ADBE Position").' };
const COLOR = { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 4, description: 'Couleur [r,g,b] (0-255 ou 0-1).' };
const XY = { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 };
const EASE = { type: 'object', additionalProperties: false, properties: { speed: { type: 'number', default: 0 }, influence: { type: 'number', minimum: 0.1, maximum: 100, default: 33.33 } } };
const readOnly = { readOnlyHint: true, openWorldHint: false };
const write = { destructiveHint: false, idempotentHint: false, openWorldHint: false };
const destructive = { destructiveHint: true, idempotentHint: false, openWorldHint: false };

export function registerAeftTools(server, bridge) {
  const call = (fn, args = {}, opts) => bridge.call('aeft', fn, args, opts);
  const tool = ({ name, title, description, input = {}, annotations = write, handler }) => server.registerTool({
    name, title, description, annotations,
    inputSchema: { type: 'object', additionalProperties: false, properties: input.properties ?? {}, ...(input.required ? { required: input.required } : {}) }, handler
  });

  tool({
    name: 'aeft_get_capabilities', title: 'Capacités After Effects', annotations: readOnly,
    description: 'Vérifie qu\'After Effects est connecté et renvoie sa version et les fonctions disponibles. À appeler en premier.',
    handler: async () => {
      const h = bridge.host('aeft');
      if (!h) throw Object.assign(new Error('After Effects n\'est pas connecté. Ouvrez-le puis Fenêtre > Extensions > Adobe MCP.'), { code: 'HOST_DISCONNECTED' });
      return text({ app: 'After Effects', version: h.appVersion, bridge: `${h.bridge} ${h.bridgeVersion}`, functions: [...h.capabilities].sort() });
    }
  });
  tool({ name: 'aeft_get_project', title: 'Projet After Effects', annotations: readOnly, description: 'Nom, chemin, nombre d\'éléments et de compositions, composition active.', handler: async () => text(await call('project.get')) });
  tool({
    name: 'aeft_list_items', title: 'Éléments du projet AE', annotations: readOnly,
    description: 'Compositions, métrages et dossiers du projet (id, nom, chemin, durée, taille).',
    input: { properties: { type: { type: 'string', enum: ['comp', 'footage', 'folder'] } } },
    handler: async (a) => text(await call('project.listItems', a))
  });
  tool({
    name: 'aeft_import', title: 'Importer dans AE',
    description: 'Importe des fichiers (vidéo, image, audio, AI/PSD) dans le projet After Effects, dans un dossier optionnel. sequence=true pour une séquence d\'images, asComp=true pour un PSD/AI en calques.',
    input: { required: ['paths'], properties: { paths: { type: 'array', items: { type: 'string' }, minItems: 1 }, folder: { type: 'string' }, sequence: { type: 'boolean', default: false }, asComp: { type: 'boolean', default: false } } },
    handler: async (a) => text(await call('project.import', a, { timeoutMs: 180000 }))
  });
  tool({
    name: 'aeft_save_project', title: 'Enregistrer le projet AE',
    description: 'Enregistre le projet After Effects (path pour « Enregistrer sous » ou pour un projet jamais enregistré).',
    input: { properties: { path: { type: 'string' } } },
    handler: async (a) => text(await call('project.save', a, { timeoutMs: 120000 }))
  });

  tool({ name: 'aeft_list_comps', title: 'Lister les compositions', annotations: readOnly, description: 'Compositions du projet : id, nom, taille, fps, durée, nombre de calques.', handler: async () => text(await call('comp.list')) });
  tool({
    name: 'aeft_get_comp', title: 'Lire une composition', annotations: readOnly,
    description: 'Calques d\'une composition (index, nom, type, in/out, parent, texte). depth > 0 inclut l\'arbre des propriétés (1 = groupes de premier niveau, 2 = valeurs de Transform/Effets) ; includeKeyframes pour les images-clés.',
    input: { properties: { compId: COMP_ID, depth: { type: 'integer', minimum: 0, maximum: 4, default: 0 }, includeKeyframes: { type: 'boolean', default: false } } },
    handler: async (a) => text(await call('comp.get', a))
  });
  tool({
    name: 'aeft_create_comp', title: 'Créer une composition',
    description: 'Crée une composition vide et l\'ouvre. bg = couleur de fond [r,g,b].',
    input: { required: ['name'], properties: { name: { type: 'string' }, width: { type: 'integer', default: 1920 }, height: { type: 'integer', default: 1080 }, fps: { type: 'number', default: 30 }, duration: { type: 'number', default: 10, description: 'secondes' }, bg: COLOR, folder: { type: 'string' }, open: { type: 'boolean', default: true } } },
    handler: async (a) => text(await call('comp.create', a))
  });
  tool({
    name: 'aeft_set_comp_settings', title: 'Réglages de composition',
    description: 'Modifie nom, taille, fps, durée, fond, zone de travail ou tête de lecture (time) d\'une composition.',
    input: { properties: { compId: COMP_ID, name: { type: 'string' }, width: { type: 'integer' }, height: { type: 'integer' }, fps: { type: 'number' }, duration: { type: 'number' }, bg: COLOR, workArea: XY, time: { type: 'number', minimum: 0 }, open: { type: 'boolean' } } },
    handler: async (a) => text(await call('comp.setSettings', a))
  });
  tool({
    name: 'aeft_checkpoint', title: 'Dupliquer la composition (sauvegarde)',
    description: 'Duplique la composition (copie de sécurité avant une modification importante). Pour revenir : travailler sur la copie ou la renommer.',
    input: { properties: { compId: COMP_ID, name: { type: 'string' } } },
    handler: async (a) => text(await call('comp.duplicate', a))
  });

  tool({
    name: 'aeft_duplicate_comp', title: 'Dupliquer une composition',
    description: 'Duplique une composition (gabarit) count fois, avec des noms (names[] ou name + numéro). deep=true duplique aussi les précompositions imbriquées et rebranche les copies : chaque copie devient indépendante (indispensable pour décliner un gabarit dont les plans sont dans des précomps). Ensuite : aeft_replace_layer_source / aeft_set_text sur chaque copie.',
    input: { properties: { compId: COMP_ID, count: { type: 'integer', minimum: 1, maximum: 100, default: 1 }, name: { type: 'string' }, names: { type: 'array', items: { type: 'string' } }, deep: { type: 'boolean', default: false }, folder: { type: 'string' } } },
    handler: async (a) => text(await call('comp.duplicate', a, { timeoutMs: 300000 }))
  });
  tool({
    name: 'aeft_replace_layer_source', title: 'Remplacer la source d\'un calque',
    description: 'Remplace le métrage / la composition d\'un calque par un autre élément du projet (itemId) ou par un fichier (path, importé si besoin), en gardant position, effets, masques et images-clés du calque. C\'est ainsi qu\'on remplit un gabarit (plan A / plan B…). startTime optionnel pour caler le nouveau métrage.',
    input: { required: ['layerId'], properties: { compId: COMP_ID, layerId: LAYER_ID, itemId: { type: 'string', description: 'id ou nom de l\'élément de projet.' }, path: { type: 'string', description: 'Fichier à utiliser (importé s\'il n\'est pas déjà dans le projet).' }, folder: { type: 'string' }, startTime: { type: 'number' }, fixExpressions: { type: 'boolean', default: true } } },
    handler: async (a) => {
      if (!a.itemId && !a.path) throw Object.assign(new Error('itemId ou path requis'), { code: 'BAD_ARGS' });
      return text(await call('layer.replaceSource', a, { timeoutMs: 120000 }));
    }
  });

  const LAYER_ATTRS = { name: { type: 'string' }, startTime: { type: 'number' }, inPoint: { type: 'number' }, outPoint: { type: 'number' }, enabled: { type: 'boolean' }, solo: { type: 'boolean' }, shy: { type: 'boolean' }, locked: { type: 'boolean' }, is3D: { type: 'boolean' }, motionBlur: { type: 'boolean' }, label: { type: 'integer', minimum: 0, maximum: 16 }, parent: { type: ['string', 'null'], description: 'Calque parent (index/nom), null pour détacher.' }, blendMode: { type: 'string', description: 'NORMAL, MULTIPLY, SCREEN, ADD, OVERLAY, SILHOUETE_ALPHA, STENCIL_ALPHA…' }, trackMatte: { type: 'object', additionalProperties: false, properties: { type: { type: 'string', enum: ['ALPHA', 'ALPHA_INVERTED', 'LUMA', 'LUMA_INVERTED', 'NO_TRACK_MATTE'] }, layer: { type: 'string' } } }, index: { type: 'integer', minimum: 1, description: 'Position dans la pile (1 = en haut).' } };
  tool({
    name: 'aeft_add_layer', title: 'Ajouter un calque',
    description: 'Crée un calque : solid, adjustment (calque d\'effets), text (params.text), null, shape, camera, light, footage/comp (params.itemId = élément de projet). Attributs optionnels (in/out, parent, blendMode, 3D…).',
    input: { required: ['type'], properties: { compId: COMP_ID, type: { type: 'string', enum: ['solid', 'adjustment', 'text', 'null', 'shape', 'camera', 'light', 'footage', 'comp'] }, params: { type: 'object', additionalProperties: true, description: '{text, color [r,g,b], width, height, duration, itemId}' }, ...LAYER_ATTRS } },
    handler: async (a) => text(await call('layer.add', a))
  });
  tool({
    name: 'aeft_set_layer', title: 'Attributs d\'un calque',
    description: 'Renomme, décale (startTime), rogne (inPoint/outPoint), active, verrouille, parente, change le mode de fusion, le cache (track matte), la 3D, le flou de mouvement ou l\'ordre d\'un calque.',
    input: { required: ['layerId'], properties: { compId: COMP_ID, layerId: LAYER_ID, ...LAYER_ATTRS } },
    handler: async (a) => text(await call('layer.set', a))
  });
  tool({ name: 'aeft_delete_layers', title: 'Supprimer des calques', annotations: destructive, description: 'Supprime des calques (annulable par Ctrl+Z dans After Effects).', input: { required: ['layerIds'], properties: { compId: COMP_ID, layerIds: LAYER_IDS } }, handler: async (a) => text(await call('layer.delete', a)) });
  tool({ name: 'aeft_duplicate_layer', title: 'Dupliquer un calque', description: 'Duplique un calque (copie juste au-dessus).', input: { required: ['layerId'], properties: { compId: COMP_ID, layerId: LAYER_ID, name: { type: 'string' } } }, handler: async (a) => text(await call('layer.duplicate', a)) });
  tool({
    name: 'aeft_precompose', title: 'Précomposer',
    description: 'Regroupe des calques dans une précomposition (moveAttributes = déplacer tous les attributs).',
    input: { required: ['layerIds', 'name'], properties: { compId: COMP_ID, layerIds: LAYER_IDS, name: { type: 'string' }, moveAttributes: { type: 'boolean', default: true } } },
    handler: async (a) => text(await call('layer.precompose', a))
  });
  tool({
    name: 'aeft_set_text', title: 'Texte et style',
    description: 'Contenu et style d\'un calque de texte : text, font (nom PostScript, ex. "Montserrat-Bold"), size (px), fill/stroke [r,g,b], strokeWidth, tracking, leading, justification (left/center/right), boxSize [w,h].',
    input: { required: ['layerId'], properties: { compId: COMP_ID, layerId: LAYER_ID, text: { type: 'string' }, font: { type: 'string' }, size: { type: 'number' }, fill: COLOR, stroke: COLOR, strokeWidth: { type: 'number' }, tracking: { type: 'number' }, leading: { type: 'number' }, justification: { type: 'string', enum: ['left', 'center', 'right'] }, boxSize: XY } },
    handler: async (a) => text(await call('layer.setText', a))
  });
  tool({
    name: 'aeft_add_shape', title: 'Ajouter une forme',
    description: 'Ajoute un groupe de forme (rect, ellipse ou path par points) dans un calque de forme (nouveau si layerId absent) : taille, position, arrondi, remplissage, contour, Trim Paths. Renvoie le chemin "Contents.<groupe>" pour animer ensuite.',
    input: { properties: { compId: COMP_ID, layerId: LAYER_ID, name: { type: 'string' }, groupName: { type: 'string' }, shape: { type: 'string', enum: ['rect', 'ellipse', 'path'], default: 'rect' }, size: XY, position: XY, roundness: { type: 'number' }, points: { type: 'array', items: XY }, closed: { type: 'boolean' }, fill: { anyOf: [COLOR, { type: 'boolean' }, { type: 'null' }], description: '[r,g,b], ou false pour aucun remplissage.' }, fillOpacity: { type: 'number' }, stroke: COLOR, strokeWidth: { type: 'number' }, trimPaths: { type: 'object', additionalProperties: false, properties: { start: { type: 'number' }, end: { type: 'number' } } }, groupPosition: XY } },
    handler: async (a) => text(await call('layer.addShape', a))
  });

  tool({
    name: 'aeft_get_property', title: 'Lire une propriété', annotations: readOnly,
    description: 'Valeur, images-clés et expression d\'une propriété d\'un calque (ou arbre d\'un groupe). at = valeur à un instant.',
    input: { required: ['layerId', 'path'], properties: { compId: COMP_ID, layerId: LAYER_ID, path: PATH, at: { type: 'number' }, depth: { type: 'integer', default: 1 }, includeKeyframes: { type: 'boolean', default: true } } },
    handler: async (a) => text(await call('property.get', a))
  });
  tool({
    name: 'aeft_set_property', title: 'Écrire une propriété',
    description: 'Valeur fixe d\'une propriété, ou image-clé à l\'instant at. Position [x,y] en pixels, Scale [x,y] en %, Opacity 0-100, couleurs [r,g,b].',
    input: { required: ['layerId', 'path', 'value'], properties: { compId: COMP_ID, layerId: LAYER_ID, path: PATH, value: {}, at: { type: 'number' } } },
    handler: async (a) => text(await call('property.set', a))
  });
  tool({
    name: 'aeft_set_keyframes', title: 'Animer une propriété',
    description: 'Animation complète : keyframes[{t, value, interp? (bezier|linear|hold), easeIn?/easeOut? {speed, influence}}]. Par défaut Bézier avec Easy Ease (influence 33). replace=true efface les clés existantes.',
    input: { required: ['layerId', 'path', 'keyframes'], properties: { compId: COMP_ID, layerId: LAYER_ID, path: PATH, keyframes: { type: 'array', minItems: 1, items: { type: 'object', required: ['t', 'value'], additionalProperties: false, properties: { t: { type: 'number' }, value: {}, interp: { type: 'string', enum: ['bezier', 'linear', 'hold'] }, inInterp: { type: 'string' }, outInterp: { type: 'string' }, easeIn: EASE, easeOut: EASE } } }, replace: { type: 'boolean', default: true } } },
    handler: async (a) => text(await call('property.setKeyframes', a))
  });
  tool({ name: 'aeft_clear_keyframes', title: 'Supprimer des images-clés', description: 'Supprime les images-clés d\'une propriété (toutes, ou dans range [t0, t1]).', input: { required: ['layerId', 'path'], properties: { compId: COMP_ID, layerId: LAYER_ID, path: PATH, range: XY } }, handler: async (a) => text(await call('property.clearKeyframes', a)) });
  tool({
    name: 'aeft_apply_ease', title: 'Courbes d\'accélération',
    description: 'Applique un préréglage d\'ease sur toutes les clés d\'une propriété : easeInOut (F9), easeIn, easeOut, overshoot, linear. influence 0.1-100.',
    input: { required: ['layerId', 'path'], properties: { compId: COMP_ID, layerId: LAYER_ID, path: PATH, preset: { type: 'string', enum: ['easeInOut', 'easeIn', 'easeOut', 'overshoot', 'linear'], default: 'easeInOut' }, influence: { type: 'number', default: 33.33 }, overshootInfluence: { type: 'number', default: 60 } } },
    handler: async (a) => text(await call('property.applyEase', a))
  });
  tool({
    name: 'aeft_set_expression', title: 'Écrire une expression',
    description: 'Pose une expression sur une propriété ; en cas d\'erreur After Effects, l\'expression est retirée et l\'erreur renvoyée. Expression vide = supprimer.',
    input: { required: ['layerId', 'path', 'expression'], properties: { compId: COMP_ID, layerId: LAYER_ID, path: PATH, expression: { type: 'string' }, enabled: { type: 'boolean' }, keepOnError: { type: 'boolean', default: false } } },
    handler: async (a) => text(await call('property.setExpression', a))
  });
  tool({
    name: 'aeft_validate_expression', title: 'Tester une expression', annotations: readOnly,
    description: 'Teste une expression sans la conserver : valide ou message d\'erreur d\'After Effects, et valeur calculée à l\'instant at.',
    input: { required: ['layerId', 'path', 'expression'], properties: { compId: COMP_ID, layerId: LAYER_ID, path: PATH, expression: { type: 'string' }, at: { type: 'number' } } },
    handler: async (a) => text(await call('property.validateExpression', a))
  });
  tool({
    name: 'aeft_bake_expression', title: 'Convertir une expression en images-clés',
    description: 'Échantillonne l\'expression à chaque image (ou step) entre start et end, puis la remplace par des images-clés.',
    input: { required: ['layerId', 'path'], properties: { compId: COMP_ID, layerId: LAYER_ID, path: PATH, step: { type: 'number' }, start: { type: 'number' }, end: { type: 'number' } } },
    handler: async (a) => text(await call('property.bakeExpression', a, { timeoutMs: 600000 }))
  });

  tool({ name: 'aeft_list_effects', title: 'Effets AE disponibles', annotations: readOnly, description: 'Effets installés (nom affiché, matchName, catégorie). search = expression régulière.', input: { properties: { search: { type: 'string' }, limit: { type: 'integer', default: 300 } } }, handler: async (a) => text(await call('effects.list', a)) });
  tool({
    name: 'aeft_apply_effect', title: 'Appliquer un effet AE',
    description: 'Ajoute un effet à des calques et règle ses paramètres {nom: valeur}. Nom accepté : matchName ("ADBE Leave Color"), nom anglais ou français courant ("Leave Color", "Conserver la couleur", "Lumetri", "Teinte", "Déplacement turbulent", "Keylight"…), ou nom affiché exact ; en cas de doute, l\'erreur liste les candidats.',
    input: { required: ['layerIds', 'effect'], properties: { compId: COMP_ID, layerIds: LAYER_IDS, effect: { type: 'string' }, name: { type: 'string' }, params: { type: 'object', additionalProperties: true } } },
    handler: async (a) => text(await call('effects.apply', a))
  });
  tool({ name: 'aeft_remove_effect', title: 'Retirer un effet AE', description: 'Retire un effet d\'un calque (nom ou index dans Effects).', input: { required: ['layerId', 'effect'], properties: { compId: COMP_ID, layerId: LAYER_ID, effect: { type: 'string' } } }, handler: async (a) => text(await call('effects.remove', a)) });

  tool({
    name: 'aeft_render_queue_add', title: 'Ajouter à la file de rendu',
    description: 'Ajoute la composition à la file de rendu avec un module de sortie (template, ex. "Lossless", "H.264" selon version) et un chemin. Lancer ensuite aeft_render.',
    input: { properties: { compId: COMP_ID, outputModule: { type: 'string' }, renderSettings: { type: 'string' }, path: { type: 'string' }, range: XY } },
    handler: async (a) => text(await call('render.add', a))
  });
  tool({ name: 'aeft_render', title: 'Lancer le rendu', description: 'Lance la file de rendu d\'After Effects (bloque jusqu\'à la fin) et renvoie l\'état de chaque élément.', handler: async () => text(await call('render.start', {}, { timeoutMs: 7200000 })) });
  tool({
    name: 'aeft_export_frame', title: 'Exporter une image (AE)', annotations: readOnly,
    description: 'Rend une image PNG de la composition à l\'instant donné et la renvoie pour inspection. Vérifier début / milieu / fin d\'une animation.',
    input: { properties: { compId: COMP_ID, time: { type: 'number', minimum: 0 }, path: { type: 'string' }, inline: { type: 'boolean', default: true } } },
    handler: async (a) => { const { inline = true, ...args } = a; return imageContent(await call('export.frame', args, { timeoutMs: 120000 }), { inline }); }
  });
  tool({
    name: 'aeft_essential_props', title: 'Propriétés essentielles (MOGRT)',
    description: 'Expose des propriétés dans Graphiques essentiels : add[{layerId, path, name}] ; templateName = nom du modèle. Renvoie la liste des contrôles exposés.',
    input: { properties: { compId: COMP_ID, add: { type: 'array', items: { type: 'object', required: ['layerId', 'path'], additionalProperties: false, properties: { layerId: LAYER_ID, path: PATH, name: { type: 'string' } } } }, templateName: { type: 'string' } } },
    handler: async (a) => text(await call('mogrt.essential', a))
  });
  tool({
    name: 'aeft_export_mogrt', title: 'Exporter un MOGRT',
    description: 'Exporte la composition en modèle d\'animations graphiques (.mogrt) utilisable dans Premiere (ppro_insert_mogrt). Exposer d\'abord les propriétés avec aeft_essential_props.',
    input: { properties: { compId: COMP_ID, path: { type: 'string' } } },
    handler: async (a) => text(await call('mogrt.export', a, { timeoutMs: 300000 }))
  });
}
