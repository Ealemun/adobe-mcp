// Adobe MCP — bibliothèque ExtendScript pour After Effects (ES3). Socle minimal du spike.
(function () {
  if (ADOBE_MCP.appName() !== 'aftereffects') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;

  function requireProject() {
    if (!app.project) throw ADOBE_MCP.err('NO_PROJECT', 'Aucun projet ouvert');
    return app.project;
  }
  function findComp(id) {
    var p = requireProject();
    if (id) {
      for (var i = 1; i <= p.numItems; i++) if (p.item(i) instanceof CompItem && String(p.item(i).id) === String(id)) return p.item(i);
      throw ADOBE_MCP.err('COMP_NOT_FOUND', 'Composition introuvable : ' + id);
    }
    var a = p.activeItem;
    if (!(a instanceof CompItem)) throw ADOBE_MCP.err('NO_ACTIVE_COMP', 'Aucune composition active');
    return a;
  }
  function safe(fn, dflt) { try { var v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } }
  function compInfo(c) {
    return { id: String(c.id), name: String(c.name), width: c.width, height: c.height, fps: U.round(c.frameRate, 3),
             duration: U.round(c.duration, 4), layers: c.numLayers, currentTime: U.round(c.time, 4) };
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
      if (l.source instanceof SolidSource || (l.source && l.source.mainSource instanceof SolidSource)) return 'solid';
      return 'footage';
    }
    return 'other';
  }

  F['project.get'] = function () {
    var p = requireProject(), comps = 0;
    for (var i = 1; i <= p.numItems; i++) if (p.item(i) instanceof CompItem) comps++;
    return { name: p.file ? String(p.file.name) : '(non enregistré)', path: p.file ? String(p.file.fsName) : null, version: String(app.version),
             items: p.numItems, comps: comps, activeComp: (p.activeItem instanceof CompItem) ? compInfo(p.activeItem) : null };
  };

  F['comp.list'] = function () {
    var p = requireProject(), out = [];
    for (var i = 1; i <= p.numItems; i++) if (p.item(i) instanceof CompItem) out.push(compInfo(p.item(i)));
    return out;
  };

  F['comp.get'] = function (a) {
    var c = findComp(a.compId), info = compInfo(c), layers = [];
    for (var i = 1; i <= c.numLayers; i++) {
      var l = c.layer(i);
      layers.push({
        index: i, name: String(l.name), type: layerType(l), enabled: l.enabled, locked: l.locked, shy: l.shy, solo: l.solo,
        inPoint: U.round(l.inPoint, 4), outPoint: U.round(l.outPoint, 4), startTime: U.round(l.startTime, 4),
        parent: l.parent ? l.parent.index : null, is3D: safe(function () { return l.threeDLayer; }, null),
        text: (l instanceof TextLayer) ? safe(function () { return String(l.property('Source Text').value.text); }, null) : undefined,
        source: (l instanceof AVLayer && l.source) ? String(l.source.name) : undefined
      });
    }
    info.layers = layers;
    return info;
  };

  F['comp.create'] = function (a) {
    var p = requireProject();
    var c = p.items.addComp(String(a.name || 'Comp'), Number(a.width || 1920), Number(a.height || 1080), Number(a.pixelAspect || 1),
                            Number(a.duration || 10), Number(a.fps || 30));
    if (a.open !== false) c.openInViewer();
    return compInfo(c);
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

  F['ui.alert'] = function (a) { alert(String(a.message || '')); return { shown: true }; };
})();
