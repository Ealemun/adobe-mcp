// Tools marqueurs : lecture, ajout par lot, suppression filtrée, chapitres YouTube.
import { SEQ_ID, RANGE, READ_ONLY, WRITE } from './common.js';

const COLOR = { type: 'string', enum: ['green', 'red', 'purple', 'orange', 'yellow', 'white', 'blue', 'cyan'] };

export function registerMarkerTools(ctx) {
  const { tool, call, text } = ctx;

  tool({
    name: 'ppro_get_markers', title: 'Lire les marqueurs', annotations: READ_ONLY,
    description: 'Marqueurs de la séquence (ou d\'un média si nodeId) : start, end, nom, commentaire, type, couleur.',
    input: { properties: { sequenceId: SEQ_ID, nodeId: { type: 'string', description: 'Marqueurs de clip d\'un élément de projet au lieu de la séquence.' } } },
    handler: async (a) => text(await call('markers.get', a))
  });

  tool({
    name: 'ppro_add_markers', title: 'Ajouter des marqueurs', annotations: WRITE,
    description: 'Ajoute des marqueurs par lot (chapitres, beats, hooks, points à revoir). type "Chapter" pour les chapitres YouTube. Les instants sont alignés sur l\'image.',
    input: { required: ['markers'], properties: {
      markers: { type: 'array', minItems: 1, items: { type: 'object', required: ['start'], additionalProperties: false, properties: {
        start: { type: 'number', minimum: 0 }, end: { type: 'number', minimum: 0 }, name: { type: 'string' }, comment: { type: 'string' },
        type: { type: 'string', enum: ['Comment', 'Chapter', 'Segmentation', 'WebLink'], default: 'Comment' }, color: COLOR, url: { type: 'string' }
      } } },
      sequenceId: SEQ_ID, nodeId: { type: 'string', description: 'Ajoute des marqueurs de clip à un élément de projet au lieu de la séquence.' }
    } },
    handler: async (a) => text(await call('markers.add', a))
  });

  tool({
    name: 'ppro_remove_markers', title: 'Supprimer des marqueurs', annotations: WRITE,
    description: 'Supprime les marqueurs qui correspondent aux filtres (name = expression régulière, color, type, range) ; all=true supprime tout.',
    input: { properties: { name: { type: 'string' }, color: COLOR, type: { type: 'string' }, range: RANGE, all: { type: 'boolean', default: false }, sequenceId: SEQ_ID, nodeId: { type: 'string' } } },
    handler: async (a) => text(await call('markers.remove', a))
  });

  tool({
    name: 'ppro_export_chapters', title: 'Chapitres YouTube', annotations: READ_ONLY,
    description: 'Texte de chapitres prêt à coller dans la description YouTube ("0:00 Titre" par ligne) à partir des marqueurs de type Chapter (ou de tous les marqueurs à défaut), avec les avertissements de validité (premier à 0:00, ≥ 3 chapitres, ≥ 10 s).',
    input: { properties: { sequenceId: SEQ_ID, onlyChapterType: { type: 'boolean', default: false } } },
    handler: async (a) => text(await call('markers.exportChapters', a))
  });
}
