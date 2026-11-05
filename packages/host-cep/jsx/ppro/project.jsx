// Adobe MCP — Premiere Pro : projet, chutiers, éléments, séquences (lecture et organisation).
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var P = ADOBE_MCP.ppro;
  var safe = P.safe;

  // ---------------------------------------------------------------- projet
  F['project.get'] = function () {
    var p = P.requireProject();
    return {
      name: String(p.name), path: String(p.path), version: String(app.version), build: safe(function () { return String(app.build); }, null),
      sequences: p.sequences.numSequences, rootItems: p.rootItem.children.numItems,
      activeSequence: p.activeSequence ? P.sequenceInfo(p.activeSequence) : null
    };
  };

  F['project.save'] = function (a) {
    var p = P.requireProject();
    if (a.as) {
      var path = U.outPath(String(a.as));
      if (!/\.prproj$/i.test(path)) path += '.prproj';
      p.saveAs(path);
      return { saved: true, path: String(app.project.path) };
    }
    p.save();
    return { saved: true, path: String(p.path) };
  };

  F['project.import'] = function (a) {
    var p = P.requireProject();
    if (!a.paths || !a.paths.length) throw ADOBE_MCP.err('BAD_ARGS', 'paths[] requis');
    var missing = [];
    for (var i = 0; i < a.paths.length; i++) if (!U.fileExists(a.paths[i]) && !new Folder(a.paths[i]).exists) missing.push(a.paths[i]);
    if (missing.length) throw ADOBE_MCP.err('FILE_NOT_FOUND', 'Fichiers introuvables : ' + missing.join(', '));
    var bin = a.bin ? P.findOrCreateBin(String(a.bin)) : p.rootItem;
    var before = bin.children.numItems;
    var ok = p.importFiles(a.paths, true, bin, a.asSequence === true);
    var added = [];
    for (var j = before; j < bin.children.numItems; j++) added.push(P.itemInfo(bin.children[j]));
    return { ok: ok !== false, imported: added, bin: String(bin.name) };
  };

  // Arborescence des chutiers et médias. type : bin/sequence/video/audio/image/caption/other
  F['project.listItems'] = function (a) {
    var p = P.requireProject();
    var root = a.bin ? P.findOrCreateBin(String(a.bin)) : p.rootItem;
    var recursive = a.recursive !== false, out = [], limit = Number(a.limit || 500);
    function walk(item, depth) {
      for (var i = 0; i < item.children.numItems && out.length < limit; i++) {
        var c = item.children[i], info = P.itemInfo(c, depth);
        if (!a.type || a.type === info.type || (a.type === 'media' && info.type !== 'bin' && info.type !== 'sequence')) out.push(info);
        if (recursive && c.type === ProjectItemType.BIN) walk(c, depth + 1);
      }
    }
    walk(root, 0);
    return { bin: String(root.name), count: out.length, truncated: out.length >= limit, items: out };
  };

  F['project.getItem'] = function (a) {
    var it = P.requireItem(a.nodeId), info = P.itemInfo(it, 0);
    info.inPoint = safe(function () { return U.round(it.getInPoint().seconds, 4); }, null);
    info.outPoint = safe(function () { return U.round(it.getOutPoint().seconds, 4); }, null);
    info.hasProxy = safe(function () { return it.hasProxy(); }, null);
    info.proxyPath = safe(function () { return it.hasProxy() ? String(it.getProxyPath()) : null; }, null);
    if (a.includeMetadata) info.xmp = safe(function () { return String(it.getXMPMetadata()).slice(0, 20000); }, null);
    return info;
  };

  F['project.createBin'] = function (a) {
    if (!a.name) throw ADOBE_MCP.err('BAD_ARGS', 'name requis');
    var parent = a.parent ? P.findOrCreateBin(String(a.parent)) : null;
    var bin = P.findOrCreateBin(String(a.name), parent);
    return P.itemInfo(bin, 0);
  };

  F['project.moveItems'] = function (a) {
    if (!a.nodeIds || !a.nodeIds.length) throw ADOBE_MCP.err('BAD_ARGS', 'nodeIds[] requis');
    var bin = a.bin ? P.findOrCreateBin(String(a.bin)) : P.requireProject().rootItem, moved = [];
    for (var i = 0; i < a.nodeIds.length; i++) {
      var it = P.requireItem(a.nodeIds[i]);
      it.moveBin(bin);
      moved.push(String(it.name));
    }
    return { bin: String(bin.name), moved: moved };
  };

  F['project.renameItem'] = function (a) {
    if (!a.nodeId || !a.name) throw ADOBE_MCP.err('BAD_ARGS', 'nodeId et name requis');
    var it = P.requireItem(a.nodeId), old = String(it.name);
    if (it.type === ProjectItemType.BIN && typeof it.renameBin === 'function') it.renameBin(String(a.name)); else it.name = String(a.name);
    return { nodeId: String(a.nodeId), oldName: old, name: String(it.name) };
  };

  // ---------------------------------------------------------------- séquences
  F['sequence.list'] = function () {
    var p = P.requireProject(), out = [];
    for (var i = 0; i < p.sequences.numSequences; i++) out.push(P.sequenceInfo(p.sequences[i]));
    return out;
  };

  F['sequence.activate'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    app.project.openSequence(seq.sequenceID);
    return P.sequenceInfo(seq);
  };

  // Identité + tête de lecture + in/out + sélection courante.
  F['sequence.getActive'] = function () {
    var seq = P.requireSequence();
    var info = P.sequenceInfo(seq), selection = [];
    var sel = safe(function () { return seq.getSelection(); }, null);
    if (sel) {
      for (var i = 0; i < sel.length; i++) {
        var hit = safe(function () { return P.findClip(seq, String(sel[i].nodeId)); }, null);
        selection.push(hit ? P.clipInfo(hit.clip, hit.label, hit.index) : { name: String(sel[i].name), start: P.timeSec(sel[i].start), end: P.timeSec(sel[i].end) });
      }
    }
    info.selection = selection;
    return info;
  };

  F['sequence.seek'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    seq.setPlayerPosition(P.snap(seq, Number(a.time)).ticks);
    return { playhead: U.round(seq.getPlayerPosition().seconds, 4) };
  };

  F['sequence.setInOut'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (a['in'] !== undefined && a['in'] !== null) seq.setInPoint(P.snap(seq, Number(a['in'])).ticks);
    if (a.out !== undefined && a.out !== null) seq.setOutPoint(P.snap(seq, Number(a.out)).ticks);
    var info = P.sequenceInfo(seq);
    return { inPoint: info.inPoint, outPoint: info.outPoint };
  };

  F['sequence.get'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    var info = P.sequenceInfo(seq);
    var sel = P.parseTracks(a.tracks, seq);
    var r0 = a.range ? Number(a.range[0]) : -1, r1 = a.range ? Number(a.range[1]) : 1e12;
    function readTracks(coll, prefix, idxs) {
      var out = [];
      for (var k = 0; k < idxs.length; k++) {
        var i = idxs[k], t = coll[i];
        if (!t) continue;
        var clips = [];
        for (var j = 0; j < t.clips.numItems; j++) {
          var c = t.clips[j];
          if (c.end.seconds < r0 || c.start.seconds > r1) continue;
          clips.push(P.clipInfo(c, prefix + (i + 1), j));
        }
        out.push({
          index: i, name: prefix + (i + 1), label: String(t.name),
          muted: safe(function () { return t.isMuted(); }, null), locked: safe(function () { return t.isLocked(); }, null),
          clipCount: t.clips.numItems, transitions: safe(function () { return t.transitions.numItems; }, null), clips: clips
        });
      }
      return out;
    }
    info.tracks = { video: readTracks(seq.videoTracks, 'V', sel.video), audio: readTracks(seq.audioTracks, 'A', sel.audio) };
    if (a.includeMarkers !== false) info.markers = P.readMarkers(seq.markers);
    return info;
  };

  // Duplique une séquence (copie indépendante, nom donné).
  F['sequence.duplicate'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    var copy = P.cloneSequence(seq);
    copy.name = String(a.name || (seq.name + ' copie'));
    if (a.bin) { try { var item = P.findProjectItemForSequence(copy); if (item) item.moveBin(P.findOrCreateBin(String(a.bin))); } catch (e) {} }
    if (a.activate !== true) app.project.openSequence(seq.sequenceID);
    return P.sequenceInfo(copy);
  };

  // Extrait [start,end] dans une nouvelle séquence (sous-séquence) sans toucher à l'originale.
  F['sequence.extractRange'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (typeof seq.createSubsequence !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Sequence.createSubsequence() indisponible sur cette version (Premiere 13+ requis)');
    if (a.start === undefined || a.end === undefined || Number(a.end) <= Number(a.start)) throw ADOBE_MCP.err('BAD_ARGS', 'start < end requis (secondes)');
    var prevIn = safe(function () { return String(seq.getInPointAsTime().ticks); }, null);
    var prevOut = safe(function () { return String(seq.getOutPointAsTime().ticks); }, null);
    seq.setInPoint(P.snap(seq, Number(a.start)).ticks);
    seq.setOutPoint(P.snap(seq, Number(a.end)).ticks);
    var before = P.sequenceIdSet();
    var sub = seq.createSubsequence(a.ignoreTrackTargeting !== false);
    // Restaure les points in/out de l'utilisateur.
    if (prevIn && prevOut) { safe(function () { seq.setInPoint(prevIn); }); safe(function () { seq.setOutPoint(prevOut); }); }
    if (!sub) { var p = P.requireProject(); for (var i = 0; i < p.sequences.numSequences; i++) if (!before[String(p.sequences[i].sequenceID)]) sub = p.sequences[i]; }
    if (!sub) throw ADOBE_MCP.err('EXTRACT_FAILED', 'La sous-séquence n\'a pas été créée');
    if (a.name) sub.name = String(a.name);
    if (a.activate !== true) app.project.openSequence(seq.sequenceID);
    return P.sequenceInfo(sub);
  };

  // Nouvelle séquence vide. Sans preset : réglages par défaut de Premiere, puis ajustement taille/fps si demandé.
  F['sequence.create'] = function (a) {
    var p = P.requireProject();
    if (!a.name) throw ADOBE_MCP.err('BAD_ARGS', 'name requis');
    var before = P.sequenceIdSet(), seq = null, method;
    if (a.preset) {
      if (!U.fileExists(a.preset)) throw ADOBE_MCP.err('FILE_NOT_FOUND', 'Preset introuvable : ' + a.preset);
      p.newSequence(String(a.name), String(a.preset));
      method = 'preset';
    } else {
      // createNewSequence() ouvre la fenêtre modale « Nouvelle séquence » sur certaines versions
      // (Premiere 2020 : l'appel ne rend jamais la main et Premiere reste bloqué). On passe donc par
      // createNewSequenceFromClips() avec un média du projet (fromItem, sinon la première vidéo trouvée),
      // puis on vide la séquence : elle hérite des réglages du média, ajustés ensuite par width/height/fps.
      var media = a.fromItem ? P.requireItem(a.fromItem) : P.firstVideoItem();
      if (media && typeof p.createNewSequenceFromClips === 'function') {
        seq = p.createNewSequenceFromClips(String(a.name), [media], p.rootItem);
        if (seq) P.emptySequence(seq);
        method = 'fromClips';
      } else if (P.appMajor() >= 22) {
        seq = p.createNewSequence(String(a.name), 'adobe-mcp-' + U.stamp());
        method = 'default';
      } else {
        throw ADOBE_MCP.err('UNSUPPORTED', 'Sur cette version de Premiere, une séquence vide ne peut être créée sans bloquer l\'interface : ' +
          'donner preset (.sqpreset), ou importer un média (fromItem), ou dupliquer une séquence existante (ppro_duplicate_sequence).');
      }
    }
    if (!seq) for (var i = 0; i < p.sequences.numSequences; i++) if (!before[String(p.sequences[i].sequenceID)]) seq = p.sequences[i];
    if (!seq) throw ADOBE_MCP.err('CREATE_FAILED', 'La séquence n\'a pas été créée');
    if (a.name) seq.name = String(a.name);
    var applied = null;
    if (a.width || a.height || a.fps) {
      applied = safe(function () {
        var st = seq.getSettings();
        if (a.width) st.videoFrameWidth = Number(a.width);
        if (a.height) st.videoFrameHeight = Number(a.height);
        if (a.fps) { var t = new Time(); t.ticks = String(Math.round(ADOBE_MCP.TICKS_PER_SECOND / Number(a.fps))); st.videoFrameRate = t; }
        seq.setSettings(st);
        return true;
      }, false);
    }
    var info = P.sequenceInfo(seq);
    info.settingsApplied = applied;
    info.method = method;
    return info;
  };

  // Version majeure de Premiere (14 = 2020, 22 = 2022…).
  P.appMajor = function () { return parseInt(String(app.version), 10) || 0; };

  // Premier média vidéo du projet (parcours récursif des chutiers) ; null si aucun.
  P.firstVideoItem = function () {
    function walk(item) {
      for (var i = 0; i < item.children.numItems; i++) {
        var c = item.children[i];
        if (c.type === ProjectItemType.BIN) { var r = walk(c); if (r) return r; continue; }
        if (safe(function () { return c.isSequence(); }, false)) continue;
        if (P.mediaKind(safe(function () { return String(c.getMediaPath()); }, null)) === 'video') return c;
      }
      return null;
    }
    return walk(app.project.rootItem);
  };

  // Retire tous les clips d'une séquence (du dernier au premier sur chaque piste).
  P.emptySequence = function (seq) {
    var tracks = P.allTracks(seq);
    for (var k = 0; k < tracks.length; k++)
      for (var j = tracks[k].track.clips.numItems - 1; j >= 0; j--)
        safe(function () { tracks[k].track.clips[j].remove(false, false); });
  };

  // ---------------------------------------------------------------- pistes
  F['track.setState'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    var ti = P.trackByLabel(seq, a.track), t = ti.track, done = {};
    if (a.muted !== undefined) { safe(function () { t.setMute(a.muted ? 1 : 0); done.muted = true; }); }
    if (a.locked !== undefined) { safe(function () { t.setLocked(a.locked ? 1 : 0); done.locked = true; }); }
    if (a.targeted !== undefined) { safe(function () { t.setTargeted(a.targeted === true, true); done.targeted = true; }); }
    return { track: ti.label, applied: done, muted: safe(function () { return t.isMuted(); }, null), locked: safe(function () { return t.isLocked(); }, null), targeted: safe(function () { return t.isTargeted(); }, null) };
  };

  // Ajoute des pistes (QE). type : "video" | "audio" ; count ; audioType : "mono" | "stereo"
  F['track.add'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    var qs = P.qeSequence(seq);
    if (typeof qs.addTracks !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'addTracks indisponible (QE)');
    var n = Number(a.count || 1), v = seq.videoTracks.numTracks, au = seq.audioTracks.numTracks;
    var audioType = a.audioType === 'mono' ? 0 : 1;
    if (a.type === 'audio') qs.addTracks(0, 0, n, audioType, au, 0, 0); else qs.addTracks(n, v, 0, audioType, 0, 0, 0);
    return { videoTracks: seq.videoTracks.numTracks, audioTracks: seq.audioTracks.numTracks };
  };
})();
