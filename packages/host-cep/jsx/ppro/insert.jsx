// Adobe MCP — Premiere Pro : placement de médias dans la timeline, MOGRT, Auto Reframe.
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var P = ADOBE_MCP.ppro;
  var safe = P.safe;

  // Points in/out d'un élément de projet (secondes). mediaType 4 = vidéo et audio (14.x) ; repli sans type.
  function setItemInOut(item, inPoint, outPoint) {
    if (inPoint !== undefined && inPoint !== null) {
      var ok = safe(function () { item.setInPoint(Number(inPoint), 4); return true; }, false);
      if (!ok) safe(function () { item.setInPoint(Number(inPoint)); });
    }
    if (outPoint !== undefined && outPoint !== null) {
      var ok2 = safe(function () { item.setOutPoint(Number(outPoint), 4); return true; }, false);
      if (!ok2) safe(function () { item.setOutPoint(Number(outPoint)); });
    }
  }
  function clearItemInOut(item) {
    safe(function () { item.clearInPoint(4); }); safe(function () { item.clearOutPoint(4); });
    safe(function () { item.clearInPoint(); }); safe(function () { item.clearOutPoint(); });
  }
  // Clips nouvellement apparus sur une piste depuis un instantané des nodeId.
  function snapshotIds(track) { var ids = {}; for (var j = 0; j < track.clips.numItems; j++) ids[safe(function () { return String(track.clips[j].nodeId); }, 'i' + j)] = true; return ids; }
  function newClips(track, label, before) {
    var out = [];
    for (var j = 0; j < track.clips.numItems; j++) { var id = safe(function () { return String(track.clips[j].nodeId); }, 'i' + j); if (!before[id]) out.push(P.clipInfo(track.clips[j], label, j)); }
    return out;
  }

  // Place un média : mode "overwrite" (écrase ce qui est à l'arrivée) ou "insert" (décale la suite).
  P.placeClip = function (seq, a) {
    var item = P.requireItem(a.nodeId);
    if (item.type === ProjectItemType.BIN) throw ADOBE_MCP.err('BAD_ARGS', 'nodeId désigne un chutier');
    var v = a.videoTrack ? P.trackByLabel(seq, a.videoTrack) : P.trackByLabel(seq, 'V1');
    var au = a.audioTrack ? P.trackByLabel(seq, a.audioTrack) : P.trackByLabel(seq, 'A1');
    if (v.kind !== 'video') throw ADOBE_MCP.err('BAD_TRACK', 'videoTrack doit être une piste vidéo');
    if (au.kind !== 'audio') throw ADOBE_MCP.err('BAD_TRACK', 'audioTrack doit être une piste audio');
    var time = P.snap(seq, Number(a.time || 0));
    var hadInOut = a.inPoint !== undefined || a.outPoint !== undefined;
    if (hadInOut) setItemInOut(item, a.inPoint, a.outPoint);
    var beforeV = snapshotIds(v.track), beforeA = snapshotIds(au.track);
    var tracksAll = P.allTracks(seq), beforeAll = [];
    for (var k = 0; k < tracksAll.length; k++) beforeAll.push(snapshotIds(tracksAll[k].track));
    try {
      if (a.mode === 'insert') {
        if (typeof seq.insertClip !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Sequence.insertClip indisponible sur cette version');
        var tt = new Time(); tt.ticks = time.ticks;
        var ok = safe(function () { seq.insertClip(item, tt, v.index, au.index); return true; }, false);
        var any = false;
        for (var z = 0; z < tracksAll.length; z++) if (newClips(tracksAll[z].track, tracksAll[z].label, beforeAll[z]).length) any = true;
        if (!ok || !any) seq.insertClip(item, time.seconds, v.index, au.index);
      } else {
        var t = new Time(); t.ticks = time.ticks;
        var placed = safe(function () { return v.track.overwriteClip(item, t); }, null);
        if (placed === null) placed = safe(function () { return v.track.overwriteClip(item, time.seconds); }, null);
        if (placed === false) throw ADOBE_MCP.err('PLACE_FAILED', 'overwriteClip refusé sur ' + v.label);
        // Si l'audio du média n'a pas été posé automatiquement, le poser sur la piste audio demandée.
        var audioKind = P.mediaKind(safe(function () { return String(item.getMediaPath()); }, ''));
        var audioPlaced = newClips(au.track, au.label, beforeA).length > 0;
        if (!audioPlaced && a.includeAudio !== false && audioKind !== 'image') {
          var anyAudio = false;
          for (var q = 0; q < tracksAll.length; q++) if (tracksAll[q].kind === 'audio' && newClips(tracksAll[q].track, tracksAll[q].label, beforeAll[q]).length) anyAudio = true;
          if (!anyAudio && audioKind === 'audio') safe(function () { au.track.overwriteClip(item, t); });
        }
      }
    } finally { if (hadInOut && a.keepItemInOut !== true) clearItemInOut(item); }
    var added = [];
    for (var m = 0; m < tracksAll.length; m++) added = added.concat(newClips(tracksAll[m].track, tracksAll[m].label, beforeAll[m]));
    return { item: String(item.name), mode: a.mode || 'overwrite', time: time.seconds, added: added };
  };

  F['edit.insertClip'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (!a.nodeId) throw ADOBE_MCP.err('BAD_ARGS', 'nodeId requis (voir ppro_list_items / ppro_import_media)');
    return P.placeClip(seq, a);
  };

  // Placement par lot : items[{nodeId, time, videoTrack?, audioTrack?, inPoint?, outPoint?, mode?}], dans l'ordre des temps.
  F['edit.placeClips'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (!a.items || !a.items.length) throw ADOBE_MCP.err('BAD_ARGS', 'items[] requis');
    var items = a.items.slice(0);
    items.sort(function (x, y) { return Number(x.time || 0) - Number(y.time || 0); });
    var results = [], errors = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it.videoTrack && a.videoTrack) it.videoTrack = a.videoTrack;
      if (!it.audioTrack && a.audioTrack) it.audioTrack = a.audioTrack;
      if (!it.mode && a.mode) it.mode = a.mode;
      try { results.push(P.placeClip(seq, it)); }
      catch (e) { errors.push({ index: i, nodeId: it.nodeId, error: ADOBE_MCP.normalizeError(e) }); if (a.stopOnError !== false) break; }
    }
    return { placed: results.length, results: results, errors: errors };
  };

  // ---------------------------------------------------------------- MOGRT
  function mgtParams(clip) {
    var comp = safe(function () { return clip.getMGTComponent(); }, null);
    if (!comp) throw ADOBE_MCP.err('NOT_MOGRT', 'Ce clip n\'est pas un modèle d\'animations graphiques (MOGRT)');
    var out = [];
    for (var i = 0; i < comp.properties.numItems; i++) {
      var p = comp.properties[i], v = safe(function () { return p.getValue(); }, undefined);
      if (v === undefined) v = safe(function () { return p.getColorValue(); }, null);
      out.push({ index: i, name: String(p.displayName), value: v });
    }
    return { comp: comp, params: out };
  }
  function setMgtParams(clip, params) {
    var m = mgtParams(clip), set = {};
    for (var k in params) if (params.hasOwnProperty(k)) {
      var prop = null;
      for (var i = 0; i < m.comp.properties.numItems && !prop; i++) if (String(m.comp.properties[i].displayName).toLowerCase() === String(k).toLowerCase()) prop = m.comp.properties[i];
      if (!prop) throw ADOBE_MCP.err('PARAM_NOT_FOUND', 'Paramètre MOGRT introuvable : ' + k + ' (paramètres : ' + paramNames(m.params) + ')');
      var value = params[k], current = safe(function () { return prop.getValue(); }, undefined);
      // Les textes des MOGRT récents sont stockés en JSON {textEditValue: "…"} : on respecte le format existant.
      if (typeof value === 'string' && typeof current === 'string' && /^\s*\{/.test(current)) {
        var obj = safe(function () { return JSON.parse(current); }, null);
        if (obj && obj.hasOwnProperty('textEditValue')) { obj.textEditValue = value; value = JSON.stringify(obj); }
      }
      if (value instanceof Array && (value.length === 3 || value.length === 4) && current === undefined) { var c = value.length === 3 ? [255].concat(value) : value; prop.setColorValue(c[0], c[1], c[2], c[3], true); }
      else prop.setValue(value, true);
      set[k] = safe(function () { return prop.getValue(); }, value);
    }
    return set;
  }
  function paramNames(list) { var n = []; for (var i = 0; i < list.length; i++) n.push(list[i].name); return n.join(', '); }

  F['mogrt.insert'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (!a.path || !U.fileExists(a.path)) throw ADOBE_MCP.err('FILE_NOT_FOUND', 'Fichier .mogrt introuvable : ' + a.path);
    if (typeof seq.importMGT !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Sequence.importMGT indisponible sur cette version');
    var v = P.trackByLabel(seq, a.track || 'V2'), au = a.audioTrack ? P.trackByLabel(seq, a.audioTrack) : P.trackByLabel(seq, 'A1');
    var time = P.snap(seq, Number(a.time || 0));
    var clip = seq.importMGT(String(new File(a.path).fsName), time.ticks, v.index, au.index);
    if (!clip) throw ADOBE_MCP.err('MOGRT_FAILED', 'importMGT a échoué (polices manquantes ? After Effects requis pour ce modèle ?)');
    var found = safe(function () { return P.findClip(seq, String(clip.nodeId)); }, null);
    if (a.duration) {
      var endT = new Time(); endT.ticks = P.snap(seq, time.seconds + Number(a.duration)).ticks;
      safe(function () { clip.end = endT; });
    }
    var set = a.params ? setMgtParams(clip, a.params) : {};
    return { clip: found ? P.clipInfo(found.clip, found.label, found.index) : { name: String(clip.name) }, params: mgtParams(clip).params, set: set };
  };

  F['mogrt.getParams'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId);
    return { clip: f.label + '/' + f.index, params: mgtParams(f.clip).params };
  };

  F['mogrt.setParams'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId);
    return { clip: f.label + '/' + f.index, set: setMgtParams(f.clip, a.params || {}) };
  };

  // ---------------------------------------------------------------- Auto Reframe (Premiere 14+)
  F['sequence.autoReframe'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (typeof seq.autoReframeSequence !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Auto Reframe indisponible (Premiere 2020 / 14.0 requis)');
    var ratios = { '9:16': [9, 16], '1:1': [1, 1], '4:5': [4, 5], '16:9': [16, 9], '4:3': [4, 3] };
    var r = ratios[a.aspect || '9:16'];
    if (!r) throw ADOBE_MCP.err('BAD_ARGS', 'aspect inconnu : ' + a.aspect);
    var preset = { slower: 'slower', 'default': 'default', faster: 'faster' }[String(a.motion || 'default').toLowerCase()] || 'default';
    var name = String(a.name || (seq.name + ' ' + (a.aspect || '9:16')));
    var before = P.sequenceIdSet();
    var out = seq.autoReframeSequence(r[0], r[1], preset, name, a.nest === true);
    if (!out) { var p = P.requireProject(); for (var i = 0; i < p.sequences.numSequences; i++) if (!before[String(p.sequences[i].sequenceID)]) out = p.sequences[i]; }
    if (!out) throw ADOBE_MCP.err('REFRAME_FAILED', 'Auto Reframe n\'a pas produit de séquence');
    return P.sequenceInfo(out);
  };
})();
