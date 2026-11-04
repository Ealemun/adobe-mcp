// Adobe MCP — bibliothèque ExtendScript pour After Effects (ES3).
// Projet, compositions, calques, texte, formes, propriétés/images-clés/expressions, effets, précomposition,
// rendu, propriétés essentielles / MOGRT, Dynamic Link (comp à partir d'un clip Premiere).
(function () {
  if (ADOBE_MCP.appName() !== 'aftereffects') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;

  // ---------------------------------------------------------------- accès
  function requireProject() {
    if (!app.project) throw ADOBE_MCP.err('NO_PROJECT', 'Aucun projet ouvert');
    return app.project;
  }
  function findComp(id) {
    var p = requireProject();
    if (id) {
      for (var i = 1; i <= p.numItems; i++) if (p.item(i) instanceof CompItem && (String(p.item(i).id) === String(id) || String(p.item(i).name) === String(id))) return p.item(i);
      throw ADOBE_MCP.err('COMP_NOT_FOUND', 'Composition introuvable : ' + id);
    }
    var a = p.activeItem;
    if (!(a instanceof CompItem)) throw ADOBE_MCP.err('NO_ACTIVE_COMP', 'Aucune composition active (ouvrir une comp ou donner compId)');
    return a;
  }
  function findItem(ref) {
    var p = requireProject();
    for (var i = 1; i <= p.numItems; i++) if (String(p.item(i).id) === String(ref) || String(p.item(i).name) === String(ref)) return p.item(i);
    throw ADOBE_MCP.err('ITEM_NOT_FOUND', 'Élément introuvable : ' + ref);
  }
  // Calque par index (1..n), par nom ou par id (AE 2020+ : layer.id).
  function findLayer(comp, ref) {
    if (ref === undefined || ref === null) throw ADOBE_MCP.err('BAD_ARGS', 'layerId requis (index, nom ou id)');
    var n = Number(ref);
    if (!isNaN(n) && String(ref).length < 6 && n >= 1 && n <= comp.numLayers && String(n) === String(ref)) return comp.layer(n);
    for (var i = 1; i <= comp.numLayers; i++) if (String(comp.layer(i).name) === String(ref) || safe(function () { return String(comp.layer(i).id) === String(ref); }, false)) return comp.layer(i);
    throw ADOBE_MCP.err('LAYER_NOT_FOUND', 'Calque introuvable : ' + ref + ' (comp ' + comp.name + ', ' + comp.numLayers + ' calques)');
  }
  function safe(fn, dflt) { try { var v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } }
  // Toute écriture est groupée dans un Undo AE.
  function undoable(name, fn) {
    app.beginUndoGroup('adobe-mcp: ' + name);
    try { return fn(); } finally { app.endUndoGroup(); }
  }

  // ---------------------------------------------------------------- descriptions
  function compInfo(c) {
    return { id: String(c.id), name: String(c.name), width: c.width, height: c.height, fps: U.round(c.frameRate, 3),
             duration: U.round(c.duration, 4), layers: c.numLayers, currentTime: U.round(c.time, 4),
             workArea: [U.round(c.workAreaStart, 4), U.round(c.workAreaStart + c.workAreaDuration, 4)],
             bg: safe(function () { return [Math.round(c.bgColor[0] * 255), Math.round(c.bgColor[1] * 255), Math.round(c.bgColor[2] * 255)]; }, null) };
  }
  function layerType(l) {
    if (l instanceof TextLayer) return 'text';
    if (l instanceof ShapeLayer) return 'shape';
    if (l instanceof CameraLayer) return 'camera';
    if (l instanceof LightLayer) return 'light';
    if (l instanceof AVLayer) {
      if (l.nullLayer) return 'null';
      if (l.adjustmentLayer) return 'adjustment';
      if (l.source instanceof CompItem) return 'comp';
      if (l.source && l.source.mainSource instanceof SolidSource) return 'solid';
      return 'footage';
    }
    return 'other';
  }
  function layerInfo(l, i) {
    var info = {
      index: i, id: safe(function () { return String(l.id); }, null), name: String(l.name), type: layerType(l), enabled: l.enabled, locked: l.locked, shy: l.shy, solo: l.solo,
      inPoint: U.round(l.inPoint, 4), outPoint: U.round(l.outPoint, 4), startTime: U.round(l.startTime, 4),
      parent: l.parent ? l.parent.index : null, is3D: safe(function () { return l.threeDLayer; }, null),
      label: safe(function () { return l.label; }, null)
    };
    if (l instanceof TextLayer) info.text = safe(function () { return String(textProp(l).value.text); }, null);
    if (l instanceof AVLayer && l.source) { info.source = String(l.source.name); info.blendMode = safe(function () { return String(l.blendingMode); }, null); }
    return info;
  }
  function itemInfo(it) {
    var kind = it instanceof CompItem ? 'comp' : it instanceof FolderItem ? 'folder' : 'footage';
    var info = { id: String(it.id), name: String(it.name), type: kind, folder: it.parentFolder ? String(it.parentFolder.name) : null };
    if (kind === 'footage') {
      info.path = safe(function () { return String(it.file.fsName); }, null);
      info.duration = safe(function () { return U.round(it.duration, 4); }, null);
      info.width = safe(function () { return it.width; }, null); info.height = safe(function () { return it.height; }, null);
      info.hasVideo = safe(function () { return it.hasVideo; }, null); info.hasAudio = safe(function () { return it.hasAudio; }, null);
      info.missing = safe(function () { return it.footageMissing; }, null);
    }
    if (kind === 'comp') { info.width = it.width; info.height = it.height; info.duration = U.round(it.duration, 4); info.fps = U.round(it.frameRate, 3); }
    return info;
  }

  // ---------------------------------------------------------------- propriétés par chemin
  // "Transform.Position", "Effects.Gaussian Blur.Blurriness", "Text.Source Text", "Contents.Group 1.Contents.Rectangle Path 1.Size"
  // Les segments acceptent le nom affiché ou le matchName ("ADBE Position").
  // Noms anglais → matchName (l'interface peut être localisée : « Échelle », « Opacité »…).
  var NAMES = { 'anchor point': 'ADBE Anchor Point', position: 'ADBE Position', scale: 'ADBE Scale', rotation: 'ADBE Rotate Z', 'z rotation': 'ADBE Rotate Z',
    'x rotation': 'ADBE Rotate X', 'y rotation': 'ADBE Rotate Y', orientation: 'ADBE Orientation', opacity: 'ADBE Opacity', 'source text': 'ADBE Text Document',
    'audio levels': 'ADBE Audio Levels', 'time remap': 'ADBE Time Remapping', 'x position': 'ADBE Position_0', 'y position': 'ADBE Position_1' };
  function textProp(l) { return l.property('ADBE Text Properties').property('ADBE Text Document'); }
  var ROOTS = { transform: 'ADBE Transform Group', effects: 'ADBE Effect Parade', text: 'ADBE Text Properties', contents: 'ADBE Root Vectors Group', masks: 'ADBE Mask Parade', audio: 'ADBE Audio Group', materialoptions: 'ADBE Material Options Group', layerstyles: 'ADBE Layer Styles' };
  function resolveProperty(layer, path) {
    var parts = String(path).split(/[.\/]/), cur = layer;
    for (var i = 0; i < parts.length; i++) {
      var seg = parts[i], next = null;
      if (!seg) continue;
      if (i === 0 && ROOTS[seg.toLowerCase().replace(/\s+/g, '')]) next = safe(function () { return cur.property(ROOTS[seg.toLowerCase().replace(/\s+/g, '')]); }, null);
      if (!next && NAMES[seg.toLowerCase()]) next = safe(function () { return cur.property(NAMES[seg.toLowerCase()]); }, null);
      if (!next) next = safe(function () { return cur.property(seg); }, null);
      if (!next && /^\d+$/.test(seg)) next = safe(function () { return cur.property(Number(seg)); }, null);
      if (!next && cur.numProperties) {
        var want = seg.toLowerCase();
        for (var j = 1; j <= cur.numProperties && !next; j++) {
          var pr = cur.property(j);
          if (String(pr.name).toLowerCase() === want || String(pr.matchName).toLowerCase() === want) next = pr;
        }
      }
      if (!next) throw ADOBE_MCP.err('PROPERTY_NOT_FOUND', 'Propriété introuvable : ' + path + ' (segment « ' + seg + ' » dans ' + String(cur.name) + ')');
      cur = next;
    }
    return cur;
  }
  function valueOut(v) {
    if (v && typeof v === 'object' && v.text !== undefined) return String(v.text); // TextDocument
    return v;
  }
  function propInfo(prop, includeKeys) {
    var info = { name: String(prop.name), matchName: String(prop.matchName), value: safe(function () { return valueOut(prop.value); }, null) };
    if (prop.numKeys !== undefined) {
      info.numKeys = prop.numKeys;
      if (includeKeys !== false && prop.numKeys) {
        var keys = [];
        for (var k = 1; k <= prop.numKeys && k <= 200; k++) keys.push({ t: U.round(prop.keyTime(k), 4), value: valueOut(prop.keyValue(k)), inInterp: String(prop.keyInInterpolationType(k)), outInterp: String(prop.keyOutInterpolationType(k)) });
        info.keyframes = keys;
      }
    }
    if (prop.canSetExpression) { info.expression = String(prop.expression || ''); info.expressionEnabled = prop.expressionEnabled; if (prop.expressionError) info.expressionError = String(prop.expressionError); }
    return info;
  }
  function walkProps(group, depth, maxDepth, includeKeys) {
    var out = [];
    for (var i = 1; i <= group.numProperties; i++) {
      var p = group.property(i);
      if (p.propertyType === PropertyType.PROPERTY) out.push(propInfo(p, includeKeys));
      else {
        var g = { name: String(p.name), matchName: String(p.matchName), group: true };
        if (depth < maxDepth) g.properties = walkProps(p, depth + 1, maxDepth, includeKeys);
        out.push(g);
      }
    }
    return out;
  }
  // Nombre d'éléments attendu dans les tableaux d'ease (1 pour spatial/1D, n pour nD non spatial).
  function easeDims(prop) {
    var t = prop.propertyValueType;
    if (t === PropertyValueType.TwoD_SPATIAL || t === PropertyValueType.ThreeD_SPATIAL || t === PropertyValueType.OneD || t === PropertyValueType.COLOR) return 1;
    if (t === PropertyValueType.TwoD) return 2;
    if (t === PropertyValueType.ThreeD) return 3;
    return 1;
  }
  function easeArray(prop, speed, influence) {
    var n = easeDims(prop), arr = [];
    for (var i = 0; i < n; i++) arr.push(new KeyframeEase(Number(speed || 0), Math.max(0.1, Math.min(100, Number(influence || 33.33333)))));
    return arr;
  }
  function interpType(s) {
    s = String(s || '').toLowerCase();
    if (s === 'hold') return KeyframeInterpolationType.HOLD;
    if (s === 'linear') return KeyframeInterpolationType.LINEAR;
    return KeyframeInterpolationType.BEZIER;
  }
  function colorIn(c) { // [r,g,b] 0-255 ou 0-1 → [r,g,b] 0-1
    if (!(c instanceof Array)) return c;
    var big = c[0] > 1 || c[1] > 1 || c[2] > 1;
    return [c[0] / (big ? 255 : 1), c[1] / (big ? 255 : 1), c[2] / (big ? 255 : 1)];
  }

  // ---------------------------------------------------------------- projet et compositions
  F['project.get'] = function () {
    var p = requireProject(), comps = 0;
    for (var i = 1; i <= p.numItems; i++) if (p.item(i) instanceof CompItem) comps++;
    return { name: p.file ? String(p.file.name) : '(non enregistré)', path: p.file ? String(p.file.fsName) : null, version: String(app.version),
             items: p.numItems, comps: comps, activeComp: (p.activeItem instanceof CompItem) ? compInfo(p.activeItem) : null };
  };
  F['project.listItems'] = function (a) {
    var p = requireProject(), out = [];
    for (var i = 1; i <= p.numItems; i++) { var info = itemInfo(p.item(i)); if (!a.type || a.type === info.type) out.push(info); }
    return { count: out.length, items: out };
  };
  F['project.import'] = function (a) {
    if (!a.paths || !a.paths.length) throw ADOBE_MCP.err('BAD_ARGS', 'paths[] requis');
    return undoable('import', function () {
      var p = requireProject(), folder = a.folder ? ensureFolder(a.folder) : null, out = [];
      for (var i = 0; i < a.paths.length; i++) {
        var f = new File(a.paths[i]);
        if (!f.exists) throw ADOBE_MCP.err('FILE_NOT_FOUND', 'Fichier introuvable : ' + a.paths[i]);
        var io = new ImportOptions(f);
        if (a.sequence === true && io.canImportAs(ImportAsType.FOOTAGE)) io.sequence = true;
        if (a.asComp === true && io.canImportAs(ImportAsType.COMP)) io.importAs = ImportAsType.COMP;
        var item = p.importFile(io);
        if (folder && item) item.parentFolder = folder;
        out.push(itemInfo(item));
      }
      return { imported: out };
    });
  };
  function ensureFolder(name) {
    var p = requireProject();
    for (var i = 1; i <= p.numItems; i++) if (p.item(i) instanceof FolderItem && String(p.item(i).name) === String(name)) return p.item(i);
    return p.items.addFolder(String(name));
  }
  F['project.save'] = function (a) {
    var p = requireProject();
    if (a.path) { var f = new File(U.outPath(a.path)); p.save(f); return { saved: true, path: String(f.fsName) }; }
    if (!p.file) throw ADOBE_MCP.err('BAD_ARGS', 'Projet jamais enregistré : donner path');
    p.save();
    return { saved: true, path: String(p.file.fsName) };
  };

  F['comp.list'] = function () {
    var p = requireProject(), out = [];
    for (var i = 1; i <= p.numItems; i++) if (p.item(i) instanceof CompItem) out.push(compInfo(p.item(i)));
    return out;
  };
  F['comp.get'] = function (a) {
    var c = findComp(a.compId), info = compInfo(c), layers = [];
    var depth = Number(a.depth || 0), includeKeys = a.includeKeyframes === true;
    for (var i = 1; i <= c.numLayers; i++) {
      var l = c.layer(i), li = layerInfo(l, i);
      if (depth > 0) li.properties = walkProps(l, 1, depth, includeKeys);
      layers.push(li);
    }
    info.layers = layers;
    return info;
  };
  F['comp.create'] = function (a) {
    return undoable('create comp', function () {
      var p = requireProject();
      var c = p.items.addComp(String(a.name || 'Comp'), Number(a.width || 1920), Number(a.height || 1080), Number(a.pixelAspect || 1), Number(a.duration || 10), Number(a.fps || 30));
      if (a.bg) c.bgColor = colorIn(a.bg);
      if (a.folder) c.parentFolder = ensureFolder(a.folder);
      if (a.open !== false) c.openInViewer();
      return compInfo(c);
    });
  };
  F['comp.setSettings'] = function (a) {
    return undoable('comp settings', function () {
      var c = findComp(a.compId);
      if (a.name) c.name = String(a.name);
      if (a.width) c.width = Number(a.width); if (a.height) c.height = Number(a.height);
      if (a.fps) c.frameRate = Number(a.fps); if (a.duration) c.duration = Number(a.duration);
      if (a.bg) c.bgColor = colorIn(a.bg);
      if (a.workArea) { c.workAreaStart = Number(a.workArea[0]); c.workAreaDuration = Number(a.workArea[1]) - Number(a.workArea[0]); }
      if (a.time !== undefined) c.time = Number(a.time);
      if (a.open) c.openInViewer();
      return compInfo(c);
    });
  };
  F['comp.duplicate'] = function (a) {
    return undoable('duplicate comp', function () {
      var c = findComp(a.compId), d = c.duplicate();
      d.name = String(a.name || (c.name + ' copie'));
      return compInfo(d);
    });
  };

  // ---------------------------------------------------------------- calques
  F['layer.add'] = function (a) {
    return undoable('add layer', function () {
      var c = findComp(a.compId), type = String(a.type || 'solid'), params = a.params || {}, l;
      var dur = Number(params.duration || c.duration);
      if (type === 'solid' || type === 'adjustment') {
        l = c.layers.addSolid(colorIn(params.color || [0, 0, 0]), String(a.name || (type === 'adjustment' ? 'Calque d\'effets' : 'Solide')), Number(params.width || c.width), Number(params.height || c.height), 1, dur);
        if (type === 'adjustment') l.adjustmentLayer = true;
      } else if (type === 'text') { l = c.layers.addText(String(params.text || a.name || 'Texte')); }
      else if (type === 'null') { l = c.layers.addNull(dur); }
      else if (type === 'shape') { l = c.layers.addShape(); }
      else if (type === 'camera') { l = c.layers.addCamera(String(a.name || 'Caméra'), [c.width / 2, c.height / 2]); }
      else if (type === 'light') { l = c.layers.addLight(String(a.name || 'Lumière'), [c.width / 2, c.height / 2]); }
      else if (type === 'footage' || type === 'comp') {
        if (!params.itemId) throw ADOBE_MCP.err('BAD_ARGS', 'params.itemId requis (id ou nom de l\'élément de projet)');
        l = c.layers.add(findItem(params.itemId));
      } else throw ADOBE_MCP.err('BAD_ARGS', 'type inconnu : ' + type);
      if (a.name) l.name = String(a.name);
      applyLayerAttrs(c, l, a);
      return layerInfo(l, l.index);
    });
  };
  function applyLayerAttrs(c, l, a) {
    if (a.startTime !== undefined) l.startTime = Number(a.startTime);
    if (a.inPoint !== undefined) l.inPoint = Number(a.inPoint);
    if (a.outPoint !== undefined) l.outPoint = Number(a.outPoint);
    if (a.enabled !== undefined) l.enabled = a.enabled === true;
    if (a.solo !== undefined) l.solo = a.solo === true;
    if (a.shy !== undefined) l.shy = a.shy === true;
    if (a.locked !== undefined) l.locked = a.locked === true;
    if (a.is3D !== undefined) safe(function () { l.threeDLayer = a.is3D === true; });
    if (a.motionBlur !== undefined) safe(function () { l.motionBlur = a.motionBlur === true; });
    if (a.label !== undefined) safe(function () { l.label = Number(a.label); });
    if (a.parent !== undefined) l.parent = (a.parent === null || a.parent === '') ? null : findLayer(c, a.parent);
    if (a.blendMode) { var bm = BlendingMode[String(a.blendMode).toUpperCase()]; if (bm === undefined) throw ADOBE_MCP.err('BAD_ARGS', 'blendMode inconnu : ' + a.blendMode); l.blendingMode = bm; }
    if (a.trackMatte) {
      var tm = a.trackMatte, type = TrackMatteType[String(tm.type || 'ALPHA').toUpperCase()];
      if (type === undefined) throw ADOBE_MCP.err('BAD_ARGS', 'trackMatte.type inconnu : ' + tm.type);
      if (typeof l.setTrackMatte === 'function' && tm.layer !== undefined) l.setTrackMatte(findLayer(c, tm.layer), type); // AE 23+
      else l.trackMatteType = type; // versions antérieures : le cache est le calque juste au-dessus
    }
    if (a.index !== undefined) { var target = c.layer(Number(a.index)); if (target && target !== l) { if (Number(a.index) < l.index) l.moveBefore(target); else l.moveAfter(target); } }
  }
  F['layer.set'] = function (a) {
    return undoable('set layer', function () {
      var c = findComp(a.compId), l = findLayer(c, a.layerId);
      if (a.name) l.name = String(a.name);
      applyLayerAttrs(c, l, a);
      return layerInfo(l, l.index);
    });
  };
  F['layer.delete'] = function (a) {
    return undoable('delete layers', function () {
      var c = findComp(a.compId), names = [], layers = [];
      for (var i = 0; i < a.layerIds.length; i++) layers.push(findLayer(c, a.layerIds[i]));
      layers.sort(function (x, y) { return y.index - x.index; });
      for (var j = 0; j < layers.length; j++) { names.push(String(layers[j].name)); layers[j].remove(); }
      return { removed: names, layers: c.numLayers };
    });
  };
  F['layer.duplicate'] = function (a) {
    return undoable('duplicate layer', function () {
      var c = findComp(a.compId), l = findLayer(c, a.layerId), d = l.duplicate();
      if (a.name) d.name = String(a.name);
      return layerInfo(d, d.index);
    });
  };
  F['layer.precompose'] = function (a) {
    return undoable('precompose', function () {
      var c = findComp(a.compId), idx = [];
      for (var i = 0; i < a.layerIds.length; i++) idx.push(findLayer(c, a.layerIds[i]).index);
      var pre = c.layers.precompose(idx, String(a.name || 'Précomp'), a.moveAttributes !== false);
      return compInfo(pre);
    });
  };

  // Texte : contenu et style (TextDocument).
  F['layer.setText'] = function (a) {
    return undoable('set text', function () {
      var c = findComp(a.compId), l = findLayer(c, a.layerId);
      if (!(l instanceof TextLayer)) throw ADOBE_MCP.err('BAD_ARGS', 'Le calque n\'est pas un calque de texte');
      var prop = textProp(l), doc = prop.value;
      if (a.text !== undefined) doc.text = String(a.text);
      if (a.font) doc.font = String(a.font);
      if (a.size) doc.fontSize = Number(a.size);
      if (a.fill) { doc.applyFill = true; doc.fillColor = colorIn(a.fill); }
      if (a.stroke) { doc.applyStroke = true; doc.strokeColor = colorIn(a.stroke); if (a.strokeWidth) doc.strokeWidth = Number(a.strokeWidth); }
      if (a.tracking !== undefined) doc.tracking = Number(a.tracking);
      if (a.leading !== undefined) safe(function () { doc.leading = Number(a.leading); });
      if (a.justification) { var j = { left: ParagraphJustification.LEFT_JUSTIFY, center: ParagraphJustification.CENTER_JUSTIFY, right: ParagraphJustification.RIGHT_JUSTIFY }[String(a.justification).toLowerCase()]; if (j !== undefined) doc.justification = j; }
      if (a.boxSize) { safe(function () { doc.boxText = true; doc.boxTextSize = [Number(a.boxSize[0]), Number(a.boxSize[1])]; }); }
      prop.setValue(doc);
      return { layer: String(l.name), text: String(prop.value.text), font: safe(function () { return String(prop.value.font); }, null), size: safe(function () { return prop.value.fontSize; }, null) };
    });
  };

  // Formes : ajoute un groupe (rect | ellipse | path) avec remplissage, contour, trim paths dans un calque de forme.
  F['layer.addShape'] = function (a) {
    return undoable('add shape', function () {
      var c = findComp(a.compId), l = a.layerId !== undefined ? findLayer(c, a.layerId) : c.layers.addShape();
      if (!(l instanceof ShapeLayer)) throw ADOBE_MCP.err('BAD_ARGS', 'Le calque n\'est pas un calque de forme');
      if (a.layerId === undefined && a.name) l.name = String(a.name);
      var contents = l.property('ADBE Root Vectors Group');
      var group = contents.addProperty('ADBE Vector Group');
      group.name = String(a.groupName || a.shape || 'Forme');
      var gc = group.property('ADBE Vectors Group');
      var shape = String(a.shape || 'rect');
      if (shape === 'rect') {
        var r = gc.addProperty('ADBE Vector Shape - Rect');
        r.property('ADBE Vector Rect Size').setValue([Number(a.size ? a.size[0] : 200), Number(a.size ? a.size[1] : 100)]);
        if (a.position) r.property('ADBE Vector Rect Position').setValue([Number(a.position[0]), Number(a.position[1])]);
        if (a.roundness !== undefined) r.property('ADBE Vector Rect Roundness').setValue(Number(a.roundness));
      } else if (shape === 'ellipse') {
        var e = gc.addProperty('ADBE Vector Shape - Ellipse');
        e.property('ADBE Vector Ellipse Size').setValue([Number(a.size ? a.size[0] : 200), Number(a.size ? a.size[1] : 200)]);
        if (a.position) e.property('ADBE Vector Ellipse Position').setValue([Number(a.position[0]), Number(a.position[1])]);
      } else if (shape === 'path') {
        if (!a.points || a.points.length < 2) throw ADOBE_MCP.err('BAD_ARGS', 'points[[x,y],…] requis pour un tracé');
        var pth = gc.addProperty('ADBE Vector Shape - Group'), sh = new Shape(), verts = [], inT = [], outT = [];
        for (var i = 0; i < a.points.length; i++) { verts.push([Number(a.points[i][0]), Number(a.points[i][1])]); inT.push([0, 0]); outT.push([0, 0]); }
        sh.vertices = verts; sh.inTangents = inT; sh.outTangents = outT; sh.closed = a.closed !== false;
        pth.property('ADBE Vector Shape').setValue(sh);
      } else throw ADOBE_MCP.err('BAD_ARGS', 'shape inconnu : ' + shape);
      if (a.fill !== null && a.fill !== false) {
        var fill = gc.addProperty('ADBE Vector Graphic - Fill');
        var fc = colorIn(a.fill || [255, 255, 255]);
        fill.property('ADBE Vector Fill Color').setValue([fc[0], fc[1], fc[2], 1]);
        if (a.fillOpacity !== undefined) fill.property('ADBE Vector Fill Opacity').setValue(Number(a.fillOpacity));
      }
      if (a.stroke) {
        var st = gc.addProperty('ADBE Vector Graphic - Stroke'), sc = colorIn(a.stroke);
        st.property('ADBE Vector Stroke Color').setValue([sc[0], sc[1], sc[2], 1]);
        st.property('ADBE Vector Stroke Width').setValue(Number(a.strokeWidth || 4));
      }
      if (a.trimPaths) {
        var tp = gc.addProperty('ADBE Vector Filter - Trim');
        if (a.trimPaths.start !== undefined) tp.property('ADBE Vector Trim Start').setValue(Number(a.trimPaths.start));
        if (a.trimPaths.end !== undefined) tp.property('ADBE Vector Trim End').setValue(Number(a.trimPaths.end));
      }
      if (a.groupPosition) group.property('ADBE Vector Transform Group').property('ADBE Vector Position').setValue([Number(a.groupPosition[0]), Number(a.groupPosition[1])]);
      return { layer: layerInfo(l, l.index), group: String(group.name), path: 'Contents.' + group.name };
    });
  };

  // ---------------------------------------------------------------- propriétés, images-clés, expressions
  F['property.get'] = function (a) {
    var c = findComp(a.compId), l = findLayer(c, a.layerId), prop = resolveProperty(l, a.path);
    if (prop.propertyType !== PropertyType.PROPERTY) return { name: String(prop.name), group: true, properties: walkProps(prop, 1, Number(a.depth || 1), a.includeKeyframes !== false) };
    var info = propInfo(prop, a.includeKeyframes !== false);
    if (a.at !== undefined) info.valueAt = valueOut(prop.valueAtTime(Number(a.at), false));
    return info;
  };
  F['property.set'] = function (a) {
    return undoable('set property', function () {
      var c = findComp(a.compId), l = findLayer(c, a.layerId), prop = resolveProperty(l, a.path), v = a.value;
      if (prop.propertyValueType === PropertyValueType.COLOR && v instanceof Array) { var cc = colorIn(v); v = [cc[0], cc[1], cc[2], v.length > 3 ? Number(v[3]) : 1]; }
      if (a.at !== undefined && a.at !== null) prop.setValueAtTime(Number(a.at), v); else { if (prop.numKeys) throw ADOBE_MCP.err('HAS_KEYFRAMES', 'La propriété a des images-clés : donner at, ou aeft_clear_keyframes avant'); prop.setValue(v); }
      return propInfo(prop, true);
    });
  };
  F['property.setKeyframes'] = function (a) {
    return undoable('set keyframes', function () {
      var c = findComp(a.compId), l = findLayer(c, a.layerId), prop = resolveProperty(l, a.path);
      if (!prop.canVaryOverTime) throw ADOBE_MCP.err('UNSUPPORTED', 'Propriété non animable : ' + prop.name);
      if (a.replace !== false) while (prop.numKeys) prop.removeKey(1);
      var kfs = a.keyframes, written = [];
      for (var i = 0; i < kfs.length; i++) {
        var v = kfs[i].value;
        if (prop.propertyValueType === PropertyValueType.COLOR && v instanceof Array) { var cc = colorIn(v); v = [cc[0], cc[1], cc[2], v.length > 3 ? Number(v[3]) : 1]; }
        prop.setValueAtTime(Number(kfs[i].t), v);
      }
      for (var k = 0; k < kfs.length; k++) {
        var kf = kfs[k], idx = prop.nearestKeyIndex(Number(kf.t));
        var inI = interpType(kf.inInterp || kf.interp || 'bezier'), outI = interpType(kf.outInterp || kf.interp || 'bezier');
        safe(function () { prop.setInterpolationTypeAtKey(idx, inI, outI); });
        if (inI === KeyframeInterpolationType.BEZIER || outI === KeyframeInterpolationType.BEZIER) {
          var ei = kf.easeIn || {}, eo = kf.easeOut || {};
          safe(function () { prop.setTemporalEaseAtKey(idx, easeArray(prop, ei.speed, ei.influence), easeArray(prop, eo.speed, eo.influence)); });
        }
        written.push({ t: U.round(prop.keyTime(idx), 4), value: valueOut(prop.keyValue(idx)) });
      }
      return { layer: String(l.name), path: String(a.path), numKeys: prop.numKeys, keyframes: written };
    });
  };
  F['property.clearKeyframes'] = function (a) {
    return undoable('clear keyframes', function () {
      var c = findComp(a.compId), l = findLayer(c, a.layerId), prop = resolveProperty(l, a.path), n = prop.numKeys;
      if (a.range) { for (var i = prop.numKeys; i >= 1; i--) { var t = prop.keyTime(i); if (t >= Number(a.range[0]) && t <= Number(a.range[1])) prop.removeKey(i); } }
      else while (prop.numKeys) prop.removeKey(1);
      return { removed: n - prop.numKeys, remaining: prop.numKeys };
    });
  };
  // Préréglages d'accélération sur toutes les clés d'une propriété.
  F['property.applyEase'] = function (a) {
    return undoable('apply ease', function () {
      var c = findComp(a.compId), l = findLayer(c, a.layerId), prop = resolveProperty(l, a.path);
      var preset = String(a.preset || 'easeInOut'), inf = Number(a.influence || 33.33333), n = prop.numKeys;
      if (!n) throw ADOBE_MCP.err('NO_KEYFRAMES', 'Aucune image-clé sur ' + prop.name);
      for (var i = 1; i <= n; i++) {
        var inInf = inf, outInf = inf;
        if (preset === 'easeOut' && i === 1) { inInf = 0.1; } // sortie douce du départ seulement
        if (preset === 'easeIn' && i === n) { outInf = 0.1; }
        if (preset === 'easeOut') { if (i === n) inInf = inf; }
        if (preset === 'overshoot' && i === n) { outInf = inf; inInf = Number(a.overshootInfluence || 60); }
        if (preset === 'linear') { prop.setInterpolationTypeAtKey(i, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR); continue; }
        prop.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
        prop.setTemporalEaseAtKey(i, easeArray(prop, 0, inInf), easeArray(prop, 0, outInf));
      }
      return { layer: String(l.name), path: String(a.path), preset: preset, numKeys: n };
    });
  };
  F['property.setExpression'] = function (a) {
    return undoable('set expression', function () {
      var c = findComp(a.compId), l = findLayer(c, a.layerId), prop = resolveProperty(l, a.path);
      if (!prop.canSetExpression) throw ADOBE_MCP.err('UNSUPPORTED', 'Pas d\'expression possible sur ' + prop.name);
      prop.expression = String(a.expression === undefined ? '' : a.expression);
      if (a.enabled !== undefined) prop.expressionEnabled = a.enabled === true;
      var err = String(prop.expressionError || '');
      if (err && a.keepOnError !== true) { prop.expression = ''; throw ADOBE_MCP.err('EXPRESSION_ERROR', err); }
      return { layer: String(l.name), path: String(a.path), expression: String(prop.expression), enabled: prop.expressionEnabled, error: err || null, valueNow: valueOut(safe(function () { return prop.valueAtTime(c.time, false); }, null)) };
    });
  };
  // Teste une expression sans la conserver.
  F['property.validateExpression'] = function (a) {
    return undoable('validate expression', function () {
      var c = findComp(a.compId), l = findLayer(c, a.layerId), prop = resolveProperty(l, a.path);
      var old = String(prop.expression || ''), oldEnabled = prop.expressionEnabled;
      prop.expression = String(a.expression || '');
      var err = String(prop.expressionError || ''), v = safe(function () { return valueOut(prop.valueAtTime(Number(a.at !== undefined ? a.at : c.time), false)); }, null);
      prop.expression = old; prop.expressionEnabled = oldEnabled;
      return { valid: !err, error: err || null, sampleValue: v };
    });
  };
  // Convertit une expression en images-clés (échantillonnage à chaque image).
  F['property.bakeExpression'] = function (a) {
    return undoable('bake expression', function () {
      var c = findComp(a.compId), l = findLayer(c, a.layerId), prop = resolveProperty(l, a.path);
      if (!prop.expression) throw ADOBE_MCP.err('NO_EXPRESSION', 'Aucune expression sur ' + prop.name);
      var step = Number(a.step || c.frameDuration), start = Number(a.start !== undefined ? a.start : l.inPoint), end = Number(a.end !== undefined ? a.end : l.outPoint), vals = [], times = [];
      for (var t = start; t <= end + 1e-6; t += step) { times.push(t); vals.push(prop.valueAtTime(t, false)); }
      prop.expression = '';
      while (prop.numKeys) prop.removeKey(1);
      prop.setValuesAtTimes(times, vals);
      return { numKeys: prop.numKeys, from: U.round(start, 4), to: U.round(end, 4) };
    });
  };

  // ---------------------------------------------------------------- effets
  F['effects.list'] = function (a) {
    var out = [], re = a.search ? new RegExp(String(a.search), 'i') : null;
    for (var i = 0; i < app.effects.length; i++) {
      var e = app.effects[i];
      if (!re || re.test(e.displayName) || re.test(e.matchName) || re.test(e.category)) out.push({ name: String(e.displayName), matchName: String(e.matchName), category: String(e.category) });
    }
    return { count: out.length, effects: out.slice(0, Number(a.limit || 300)) };
  };
  F['effects.apply'] = function (a) {
    return undoable('apply effect', function () {
      var c = findComp(a.compId), out = [];
      for (var i = 0; i < a.layerIds.length; i++) {
        var l = findLayer(c, a.layerIds[i]), fx = l.property('ADBE Effect Parade');
        if (!fx.canAddProperty(String(a.effect))) {
          // nom affiché → matchName
          var mn = null;
          for (var k = 0; k < app.effects.length && !mn; k++) if (String(app.effects[k].displayName).toLowerCase() === String(a.effect).toLowerCase()) mn = String(app.effects[k].matchName);
          if (!mn || !fx.canAddProperty(mn)) throw ADOBE_MCP.err('EFFECT_NOT_FOUND', 'Effet inconnu ou inapplicable : ' + a.effect + ' (voir aeft_list_effects)');
          a.effect = mn;
        }
        var e = fx.addProperty(String(a.effect));
        if (a.name) e.name = String(a.name);
        var set = {};
        if (a.params) for (var p in a.params) if (a.params.hasOwnProperty(p)) {
          var prop = resolveProperty(l, 'Effects.' + e.name + '.' + p), v = a.params[p];
          if (prop.propertyValueType === PropertyValueType.COLOR && v instanceof Array) { var cc = colorIn(v); v = [cc[0], cc[1], cc[2], v.length > 3 ? Number(v[3]) : 1]; }
          prop.setValue(v); set[p] = valueOut(prop.value);
        }
        out.push({ layer: String(l.name), effect: String(e.name), matchName: String(e.matchName), params: set });
      }
      return { applied: out };
    });
  };
  F['effects.remove'] = function (a) {
    return undoable('remove effect', function () {
      var c = findComp(a.compId), l = findLayer(c, a.layerId), prop = resolveProperty(l, 'Effects.' + a.effect), name = String(prop.name);
      prop.remove();
      return { removed: name };
    });
  };

  // ---------------------------------------------------------------- rendu et export
  F['render.add'] = function (a) {
    return undoable('render queue', function () {
      var c = findComp(a.compId), rq = app.project.renderQueue, item = rq.items.add(c);
      if (a.range) { item.timeSpanStart = Number(a.range[0]); item.timeSpanDuration = Number(a.range[1]) - Number(a.range[0]); }
      var om = item.outputModule(1);
      if (a.outputModule) { var ok = safe(function () { om.applyTemplate(String(a.outputModule)); return true; }, false); if (!ok) throw ADOBE_MCP.err('TEMPLATE_NOT_FOUND', 'Module de sortie introuvable : ' + a.outputModule + ' (templates : ' + String(om.templates).slice(0, 300) + ')'); }
      if (a.renderSettings) safe(function () { item.applyTemplate(String(a.renderSettings)); });
      var path = U.outPath(a.path || (U.tempDir() + '/render_' + U.stamp()));
      om.file = new File(path);
      return { index: rq.numItems, comp: String(c.name), path: String(om.file.fsName), outputModules: String(om.templates) };
    });
  };
  F['render.start'] = function (a) {
    var rq = app.project.renderQueue;
    if (!rq.numItems) throw ADOBE_MCP.err('EMPTY_QUEUE', 'File de rendu vide');
    rq.render();
    var out = [];
    for (var i = 1; i <= rq.numItems; i++) out.push({ index: i, comp: String(rq.item(i).comp.name), status: String(rq.item(i).status), file: safe(function () { return String(rq.item(i).outputModule(1).file.fsName); }, null) });
    return { items: out };
  };
  F['export.frame'] = function (a) {
    var c = findComp(a.compId);
    var t = (a.time === undefined || a.time === null) ? c.time : Number(a.time);
    var path = U.outPath(a.path || (U.tempDir() + '/aeframe_' + U.stamp() + '.png'));
    c.saveFrameToPng(t, new File(path));
    var f = U.waitForFile(path, 30000);
    if (!f) throw ADOBE_MCP.err('EXPORT_FAILED', 'Image non produite : ' + path);
    return { path: f.fsName, time: U.round(t, 4), bytes: f.length };
  };

  // Propriétés essentielles (Graphiques essentiels) et export MOGRT.
  F['mogrt.essential'] = function (a) {
    return undoable('essential props', function () {
      var c = findComp(a.compId), added = [];
      if (a.add) for (var i = 0; i < a.add.length; i++) {
        var spec = a.add[i], l = findLayer(c, spec.layerId), prop = resolveProperty(l, spec.path);
        if (!safe(function () { return prop.canAddToMotionGraphicsTemplate(c); }, true)) throw ADOBE_MCP.err('UNSUPPORTED', 'Propriété non exposable : ' + spec.path);
        var ok = prop.addToMotionGraphicsTemplateAs ? prop.addToMotionGraphicsTemplateAs(c, String(spec.name || prop.name)) : prop.addToMotionGraphicsTemplate(c);
        added.push({ layer: String(l.name), path: String(spec.path), name: String(spec.name || prop.name), ok: ok !== false });
      }
      if (a.templateName) c.motionGraphicsTemplateName = String(a.templateName);
      var controllers = [], n = safe(function () { return c.motionGraphicsTemplateControllerCount; }, 0);
      for (var k = 0; k < n; k++) controllers.push(String(c.getMotionGraphicsTemplateControllerName(k)));
      return { templateName: safe(function () { return String(c.motionGraphicsTemplateName); }, null), added: added, controllers: controllers };
    });
  };
  F['mogrt.export'] = function (a) {
    var c = findComp(a.compId);
    if (typeof c.exportAsMotionGraphicsTemplate !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Export MOGRT indisponible sur cette version');
    var path = U.outPath(a.path || (U.tempDir() + '/' + String(c.name).replace(/[^\w\-]+/g, '_') + '.mogrt'));
    if (!/\.mogrt$/i.test(path)) path += '.mogrt';
    var ok = c.exportAsMotionGraphicsTemplate(true, path);
    var f = U.waitForFile(path, 60000);
    if (!ok || !f) throw ADOBE_MCP.err('EXPORT_FAILED', 'MOGRT non produit (polices non Adobe Fonts ? propriétés non exposées ?)');
    return { path: f.fsName, bytes: f.length };
  };

  // ---------------------------------------------------------------- Dynamic Link : comp à partir d'un clip Premiere
  // Crée (ou réutilise) le métrage, crée une comp aux réglages de la séquence contenant le clip aux mêmes in/out,
  // enregistre le projet (chemin donné si le projet n'a pas de fichier) et renvoie {aepPath, compName}.
  F['dynamiclink.makeComp'] = function (a) {
    return undoable('comp from clip', function () {
      var p = requireProject();
      if (!a.mediaPath || !new File(a.mediaPath).exists) throw ADOBE_MCP.err('FILE_NOT_FOUND', 'Média introuvable : ' + a.mediaPath);
      var footage = null, target = new File(a.mediaPath).fsName;
      for (var i = 1; i <= p.numItems && !footage; i++) {
        var it = p.item(i);
        if (it instanceof FootageItem && safe(function () { return String(it.file.fsName) === target; }, false)) footage = it;
      }
      var folder = ensureFolder(a.folder || 'adobe-mcp');
      if (!footage) { footage = p.importFile(new ImportOptions(new File(target))); footage.parentFolder = folder; }
      var dur = Number(a.duration), name = String(a.name || ('Clip lié ' + U.stamp()));
      var c = p.items.addComp(name, Number(a.width), Number(a.height), 1, dur, Number(a.fps));
      c.parentFolder = folder;
      var l = c.layers.add(footage);
      l.startTime = -Number(a.inPoint || 0); // le temps 0 de la comp = point d'entrée du clip dans Premiere
      l.inPoint = 0; l.outPoint = dur;
      if (a.speed && Number(a.speed) !== 100) safe(function () { l.stretch = 10000 / Number(a.speed); });
      if (a.open !== false) c.openInViewer();
      var aep;
      if (p.file) { p.save(); aep = String(p.file.fsName); }
      else { aep = U.outPath(a.aepPath || (U.tempDir() + '/adobe-mcp_' + U.stamp() + '.aep')); p.save(new File(aep)); aep = String(p.file.fsName); }
      return { aepPath: aep, compName: String(c.name), compId: String(c.id), footage: itemInfo(footage), comp: compInfo(c) };
    });
  };

  F['ui.alert'] = function (a) { alert(String(a.message || '')); return { shown: true }; };
})();
