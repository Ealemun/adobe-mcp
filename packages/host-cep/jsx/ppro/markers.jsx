// Adobe MCP — Premiere Pro : marqueurs de séquence et de clip, chapitres.
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var P = ADOBE_MCP.ppro;
  var safe = P.safe;

  // Index de couleur Premiere (setColorByIndex) → nom, et inverse.
  var COLORS = ['green', 'red', 'purple', 'orange', 'yellow', 'white', 'blue', 'cyan'];
  function colorIndex(name) {
    if (name === undefined || name === null) return -1;
    if (typeof name === 'number') return name;
    for (var i = 0; i < COLORS.length; i++) if (COLORS[i] === String(name).toLowerCase()) return i;
    return -1;
  }

  function markerInfo(m, idx) {
    var ci = safe(function () { return m.getColorByIndex(); }, null);
    return {
      index: idx, start: P.timeSec(m.start), end: P.timeSec(m.end), name: String(m.name), comment: String(m.comments),
      type: String(m.type), color: (ci !== null && ci >= 0 && ci < COLORS.length) ? COLORS[ci] : null,
      guid: safe(function () { return String(m.guid); }, null)
    };
  }

  // Lit une MarkerCollection (séquence ou élément de projet) → tableau trié par start.
  P.readMarkers = function (coll) {
    var out = [];
    try {
      var m = coll.getFirstMarker(), idx = 0;
      while (m) { out.push(markerInfo(m, idx++)); m = coll.getNextMarker(m); }
    } catch (e) {}
    out.sort(function (x, y) { return x.start - y.start; });
    return out;
  };
  function markerCollection(a) {
    if (a.nodeId) return P.requireItem(a.nodeId).getMarkers();
    return P.requireSequence(a.sequenceId).markers;
  }

  F['markers.get'] = function (a) { return { markers: P.readMarkers(markerCollection(a)) }; };

  // Ajout par lot : markers[{start, end?, name, comment?, type?, color?}]
  F['markers.add'] = function (a) {
    if (!a.markers || !a.markers.length) throw ADOBE_MCP.err('BAD_ARGS', 'markers[] requis');
    var seq = a.nodeId ? null : P.requireSequence(a.sequenceId);
    var coll = markerCollection(a), added = [];
    for (var i = 0; i < a.markers.length; i++) {
      var spec = a.markers[i], start = Number(spec.start || 0);
      if (seq) start = P.snap(seq, start).seconds;
      var m = coll.createMarker(start);
      if (!m) throw ADOBE_MCP.err('MARKER_FAILED', 'createMarker a échoué à ' + start + ' s');
      if (spec.name !== undefined) m.name = String(spec.name);
      if (spec.comment !== undefined) m.comments = String(spec.comment);
      if (spec.end !== undefined && Number(spec.end) > start) {
        var t = new Time(); t.seconds = seq ? P.snap(seq, Number(spec.end)).seconds : Number(spec.end);
        safe(function () { m.end = t; });
      }
      var type = String(spec.type || 'Comment').toLowerCase();
      if (type === 'chapter') safe(function () { m.setTypeAsChapter(); });
      else if (type === 'segmentation') safe(function () { m.setTypeAsSegmentation(); });
      else if (type === 'weblink') safe(function () { m.setTypeAsWebLink(String(spec.url || ''), String(spec.frameTarget || '')); });
      else safe(function () { m.setTypeAsComment(); });
      var ci = colorIndex(spec.color);
      if (ci >= 0) safe(function () { m.setColorByIndex(ci); });
      added.push(markerInfo(m, -1));
    }
    return { added: added, total: P.readMarkers(coll).length };
  };

  // Suppression filtrée : name (regex insensible à la casse), color, type, range [start,end], all
  F['markers.remove'] = function (a) {
    var coll = markerCollection(a), list = P.readMarkers(coll), removed = [];
    var re = a.name ? new RegExp(String(a.name), 'i') : null;
    var toDelete = [];
    var m = coll.getFirstMarker();
    while (m) {
      var info = markerInfo(m, 0), keep = true;
      if (a.all === true) keep = false;
      if (re && re.test(info.name)) keep = false;
      if (a.color && info.color === String(a.color).toLowerCase()) keep = false;
      if (a.type && info.type.toLowerCase() === String(a.type).toLowerCase()) keep = false;
      if (a.range && info.start >= Number(a.range[0]) && info.start <= Number(a.range[1])) keep = false;
      if (!keep) toDelete.push(m);
      m = coll.getNextMarker(m);
    }
    for (var i = 0; i < toDelete.length; i++) { removed.push(markerInfo(toDelete[i], i)); coll.deleteMarker(toDelete[i]); }
    return { removed: removed, before: list.length, after: P.readMarkers(coll).length };
  };

  // Chapitres YouTube : "0:00 Titre" par ligne, à partir des marqueurs (type Chapter d'abord, sinon tous).
  F['markers.exportChapters'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), all = P.readMarkers(seq.markers), chapters = [], i;
    for (i = 0; i < all.length; i++) if (all[i].type.toLowerCase() === 'chapter') chapters.push(all[i]);
    if (!chapters.length && a.onlyChapterType !== true) chapters = all;
    var lines = [], warnings = [];
    function fmt(s) {
      s = Math.floor(s); var h = Math.floor(s / 3600), mn = Math.floor((s % 3600) / 60), sc = s % 60;
      return (h ? h + ':' + U.pad2(mn) : String(mn)) + ':' + U.pad2(sc);
    }
    for (i = 0; i < chapters.length; i++) lines.push(fmt(chapters[i].start) + ' ' + (chapters[i].name || chapters[i].comment || ('Chapitre ' + (i + 1))));
    if (!chapters.length) warnings.push('Aucun marqueur');
    else {
      if (chapters[0].start > 0.5) warnings.push('YouTube exige un premier chapitre à 0:00');
      if (chapters.length < 3) warnings.push('YouTube exige au moins 3 chapitres');
      for (i = 1; i < chapters.length; i++) if (chapters[i].start - chapters[i - 1].start < 10) warnings.push('Chapitre ' + (i + 1) + ' : moins de 10 s après le précédent');
    }
    return { format: a.format || 'youtube', count: chapters.length, text: lines.join('\n'), chapters: chapters, warnings: warnings };
  };
})();
