// Adobe MCP — bibliothèque ExtendScript pour Premiere Pro (ES3).
// Testée en priorité sur Premiere Pro 2020 (14.x) ; les API absentes sont détectées et signalées.
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var TPS = ADOBE_MCP.TICKS_PER_SECOND;

  // ---------------------------------------------------------------- helpers
  function requireProject() {
    if (!app.project) throw ADOBE_MCP.err('NO_PROJECT', 'Aucun projet ouvert');
    return app.project;
  }
  function requireSequence(id) {
    var p = requireProject();
    if (id) {
      for (var i = 0; i < p.sequences.numSequences; i++) {
        if (String(p.sequences[i].sequenceID) === String(id)) return p.sequences[i];
      }
      throw ADOBE_MCP.err('SEQUENCE_NOT_FOUND', 'Séquence introuvable : ' + id);
    }
    if (!p.activeSequence) throw ADOBE_MCP.err('NO_ACTIVE_SEQUENCE', 'Aucune séquence active dans la timeline');
    return p.activeSequence;
  }
  function qeSequence() {
    app.enableQE();
    var s = qe.project.getActiveSequence();
    if (!s) throw ADOBE_MCP.err('NO_ACTIVE_SEQUENCE', 'Aucune séquence active (QE)');
    return s;
  }
  function seqFps(seq) {
    try { var tb = Number(seq.timebase); if (tb > 0) return U.round(TPS / tb, 3); } catch (e) {}
    try { var st = seq.getSettings(); if (st && st.videoFrameRate) return U.round(1 / st.videoFrameRate.seconds, 3); } catch (e2) {}
    return 0;
  }
  function seqSize(seq) {
    var w = 0, h = 0;
    try { w = Number(seq.frameSizeHorizontal); h = Number(seq.frameSizeVertical); } catch (e) {}
    if (!w) { try { var st = seq.getSettings(); w = Number(st.videoFrameWidth); h = Number(st.videoFrameHeight); } catch (e2) {} }
    return { width: w, height: h };
  }
  function timeSec(t) { return t ? U.round(t.seconds, 4) : 0; }
  function safe(fn, dflt) { try { var v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } }
  function sequenceInfo(seq) {
    var size = seqSize(seq);
    return {
      id: String(seq.sequenceID), name: String(seq.name), fps: seqFps(seq), width: size.width, height: size.height,
      duration: safe(function () { return U.round(U.ticksToSeconds(seq.end), 4); }, 0), // seq.end = ticks (chaîne)
      inPoint: safe(function () { return U.round(Number(seq.getInPointAsTime().seconds), 4); }, null),
      outPoint: safe(function () { return U.round(Number(seq.getOutPointAsTime().seconds), 4); }, null),
      playhead: safe(function () { return U.round(seq.getPlayerPosition().seconds, 4); }, null),
      videoTracks: seq.videoTracks.numTracks, audioTracks: seq.audioTracks.numTracks
    };
  }
  // "all" | "video" | "audio" | ["V1","A2"]  →  { video: [idx...], audio: [idx...] }
  function parseTracks(spec, seq) {
    var out = { video: [], audio: [] }, i;
    if (!spec || spec === 'all' || spec === 'video') for (i = 0; i < seq.videoTracks.numTracks; i++) out.video.push(i);
    if (!spec || spec === 'all' || spec === 'audio') for (i = 0; i < seq.audioTracks.numTracks; i++) out.audio.push(i);
    if (spec instanceof Array) {
      out = { video: [], audio: [] };
      for (i = 0; i < spec.length; i++) {
        var m = /^([VA])(\d+)$/i.exec(String(spec[i]));
        if (!m) throw ADOBE_MCP.err('BAD_TRACK', 'Nom de piste invalide : ' + spec[i] + ' (attendu V1, A2…)');
        (m[1].toUpperCase() === 'V' ? out.video : out.audio).push(parseInt(m[2], 10) - 1);
      }
    }
    return out;
  }
  function clipInfo(clip, trackLabel, idx) {
    var pi = safe(function () { return clip.projectItem; }, null);
    return {
      id: trackLabel + '/' + idx,
      nodeId: safe(function () { return String(clip.nodeId); }, null),
      name: String(clip.name),
      start: timeSec(clip.start), end: timeSec(clip.end),
      inPoint: timeSec(clip.inPoint), outPoint: timeSec(clip.outPoint),
      duration: timeSec(clip.duration),
      disabled: safe(function () { return clip.disabled === true; }, null),
      speed: safe(function () { return U.round(clip.getSpeed(), 4); }, null),
      mediaType: safe(function () { return String(clip.mediaType); }, null),
      mediaPath: pi ? safe(function () { return String(pi.getMediaPath()); }, null) : null
    };
  }
  function findProjectItemForSequence(seq) {
    var direct = safe(function () { return seq.projectItem; }, null);
    if (direct) return direct;
    function walk(item) {
      for (var i = 0; i < item.children.numItems; i++) {
        var c = item.children[i];
        if (c.type === ProjectItemType.BIN) { var r = walk(c); if (r) return r; }
        else if (safe(function () { return c.isSequence(); }, false) && String(c.name) === String(seq.name)) return c;
      }
      return null;
    }
    return walk(app.project.rootItem);
  }
  function findOrCreateBin(name) {
    var root = app.project.rootItem;
    for (var i = 0; i < root.children.numItems; i++) {
      var c = root.children[i];
      if (c.type === ProjectItemType.BIN && String(c.name) === name) return c;
    }
    return root.createBin(name);
  }
  function sequenceIdSet() {
    var ids = {}, p = requireProject();
    for (var i = 0; i < p.sequences.numSequences; i++) ids[String(p.sequences[i].sequenceID)] = true;
    return ids;
  }
  function timecodeAt(seq, seconds) {
    // Positionne la tête de lecture puis lit le timecode QE : format toujours correct (drop-frame ou non).
    seq.setPlayerPosition(U.secondsToTicks(seconds));
    var tc = String(qeSequence().CTI.timecode);
    if (!tc) throw ADOBE_MCP.err('NO_TIMECODE', 'Impossible de lire le timecode de la tête de lecture');
    return tc;
  }

  // ---------------------------------------------------------------- projet
  F['project.get'] = function () {
    var p = requireProject();
    return {
      name: String(p.name), path: String(p.path), version: String(app.version), build: safe(function () { return String(app.build); }, null),
      sequences: p.sequences.numSequences, rootItems: p.rootItem.children.numItems,
      activeSequence: p.activeSequence ? sequenceInfo(p.activeSequence) : null
    };
  };

  F['project.import'] = function (a) {
    var p = requireProject();
    if (!a.paths || !a.paths.length) throw ADOBE_MCP.err('BAD_ARGS', 'paths[] requis');
    var missing = [];
    for (var i = 0; i < a.paths.length; i++) if (!U.fileExists(a.paths[i]) && !new Folder(a.paths[i]).exists) missing.push(a.paths[i]);
    if (missing.length) throw ADOBE_MCP.err('FILE_NOT_FOUND', 'Fichiers introuvables : ' + missing.join(', '));
    var bin = a.bin ? findOrCreateBin(String(a.bin)) : p.rootItem;
    var before = bin.children.numItems;
    var ok = p.importFiles(a.paths, true, bin, false);
    var added = [];
    for (var j = before; j < bin.children.numItems; j++) {
      var c = bin.children[j];
      added.push({ nodeId: safe(function () { return String(c.nodeId); }, null), name: String(c.name), mediaPath: safe(function () { return String(c.getMediaPath()); }, null) });
    }
    return { ok: ok !== false, imported: added, bin: String(bin.name) };
  };

  // ---------------------------------------------------------------- séquences
  F['sequence.list'] = function () {
    var p = requireProject(), out = [];
    for (var i = 0; i < p.sequences.numSequences; i++) out.push(sequenceInfo(p.sequences[i]));
    return out;
  };

  F['sequence.activate'] = function (a) {
    var seq = requireSequence(a.sequenceId);
    app.project.openSequence(seq.sequenceID);
    return sequenceInfo(seq);
  };

  F['sequence.seek'] = function (a) {
    var seq = requireSequence(a.sequenceId);
    seq.setPlayerPosition(U.secondsToTicks(Number(a.time)));
    return { playhead: U.round(seq.getPlayerPosition().seconds, 4) };
  };

  F['sequence.get'] = function (a) {
    var seq = requireSequence(a.sequenceId);
    var info = sequenceInfo(seq);
    var sel = parseTracks(a.tracks, seq);
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
          clips.push(clipInfo(c, prefix + (i + 1), j));
        }
        out.push({
          index: i, name: prefix + (i + 1), label: String(t.name),
          muted: safe(function () { return t.isMuted(); }, null), locked: safe(function () { return t.isLocked(); }, null),
          clipCount: t.clips.numItems, clips: clips
        });
      }
      return out;
    }
    info.tracks = { video: readTracks(seq.videoTracks, 'V', sel.video), audio: readTracks(seq.audioTracks, 'A', sel.audio) };
    if (a.includeMarkers !== false) {
      var markers = [];
      try {
        var m = seq.markers.getFirstMarker();
        while (m) {
          markers.push({ start: timeSec(m.start), end: timeSec(m.end), name: String(m.name), comment: String(m.comments), type: String(m.type) });
          m = seq.markers.getNextMarker(m);
        }
      } catch (e) {}
      info.markers = markers;
    }
    return info;
  };

  // ---------------------------------------------------------------- montage
  F['edit.cutAt'] = function (a) {
    var seq = requireSequence(a.sequenceId);
    if (!a.times || !a.times.length) throw ADOBE_MCP.err('BAD_ARGS', 'times[] requis (secondes)');
    var sel = parseTracks(a.tracks, seq);
    if (a.includeAudio === false) sel.audio = [];
    var qs = qeSequence();
    var before = countClips(seq), results = [], playhead = safe(function () { return seq.getPlayerPosition().ticks; }, null);
    for (var i = 0; i < a.times.length; i++) {
      var t = Number(a.times[i]);
      var tc = timecodeAt(seq, t), cutsHere = 0, k;
      for (k = 0; k < sel.video.length; k++) {
        var vt = qs.getVideoTrackAt(sel.video[k]);
        if (vt && safe(function () { return !seq.videoTracks[sel.video[k]].isLocked(); }, true) && vt.razor(tc)) cutsHere++;
      }
      for (k = 0; k < sel.audio.length; k++) {
        var at = qs.getAudioTrackAt(sel.audio[k]);
        if (at && safe(function () { return !seq.audioTracks[sel.audio[k]].isLocked(); }, true) && at.razor(tc)) cutsHere++;
      }
      results.push({ time: t, timecode: tc, cuts: cutsHere });
    }
    if (playhead) seq.setPlayerPosition(playhead);
    return { sequence: String(seq.name), results: results, clipsBefore: before, clipsAfter: countClips(seq) };
  };
  function countClips(seq) {
    var n = 0, i;
    for (i = 0; i < seq.videoTracks.numTracks; i++) n += seq.videoTracks[i].clips.numItems;
    for (i = 0; i < seq.audioTracks.numTracks; i++) n += seq.audioTracks[i].clips.numItems;
    return n;
  }

  // ---------------------------------------------------------------- export
  F['export.frame'] = function (a) {
    var seq = requireSequence(a.sequenceId);
    var t = (a.time === undefined || a.time === null) ? seq.getPlayerPosition().seconds : Number(a.time);
    var path = a.path || (U.tempDir() + '/frame_' + U.stamp() + '.png');
    var tc = timecodeAt(seq, t);
    var qs = qeSequence();
    if (typeof qs.exportFramePNG !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'exportFramePNG indisponible sur cette version');
    qs.exportFramePNG(tc, path);
    var f = new File(path), waited = 0;
    while (!f.exists && waited < 8000) { $.sleep(200); waited += 200; }
    if (!f.exists) throw ADOBE_MCP.err('EXPORT_FAILED', 'Image non produite : ' + path);
    return { path: f.fsName, time: U.round(t, 4), timecode: tc, bytes: f.length };
  };

  // ---------------------------------------------------------------- sécurité
  F['safety.checkpoint'] = function (a) {
    var seq = requireSequence(a.sequenceId);
    if (typeof seq.clone !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Sequence.clone() indisponible sur cette version');
    var before = sequenceIdSet();
    seq.clone();
    var p = requireProject(), copy = null;
    for (var i = 0; i < p.sequences.numSequences; i++) if (!before[String(p.sequences[i].sequenceID)]) copy = p.sequences[i];
    if (!copy) throw ADOBE_MCP.err('CHECKPOINT_FAILED', 'La copie de la séquence est introuvable');
    var label = String(a.label || '').replace(/[^\w\-]+/g, '_').slice(0, 40);
    copy.name = '__ckpt_' + U.stamp() + (label ? '_' + label : '') + '__' + seq.name;
    try { var item = findProjectItemForSequence(copy); if (item) item.moveBin(findOrCreateBin('_adobe-mcp')); } catch (e) {}
    app.project.openSequence(seq.sequenceID); // la séquence de travail reste active
    return { checkpointId: String(copy.sequenceID), checkpointName: String(copy.name), originalSequenceId: String(seq.sequenceID), originalName: String(seq.name) };
  };

  F['safety.listCheckpoints'] = function () {
    var p = requireProject(), out = [];
    for (var i = 0; i < p.sequences.numSequences; i++) {
      var s = p.sequences[i], m = /^__ckpt_(\d{8}-\d{6})(?:_([\w\-]*))?__(.*)$/.exec(String(s.name));
      if (m) out.push({ checkpointId: String(s.sequenceID), stamp: m[1], label: m[2] || '', originalName: m[3] });
    }
    return out;
  };

  F['safety.rewind'] = function (a) {
    if (!a.checkpointId) throw ADOBE_MCP.err('BAD_ARGS', 'checkpointId requis');
    var ck = requireSequence(a.checkpointId);
    var m = /^__ckpt_(\d{8}-\d{6})(?:_([\w\-]*))?__(.*)$/.exec(String(ck.name));
    var originalName = a.originalName || (m ? m[3] : String(ck.name));
    var p = requireProject(), current = null;
    for (var i = 0; i < p.sequences.numSequences; i++) if (String(p.sequences[i].name) === originalName && String(p.sequences[i].sequenceID) !== String(ck.sequenceID)) current = p.sequences[i];
    var before = sequenceIdSet();
    ck.clone();
    var restored = null;
    for (var j = 0; j < p.sequences.numSequences; j++) if (!before[String(p.sequences[j].sequenceID)]) restored = p.sequences[j];
    if (!restored) throw ADOBE_MCP.err('REWIND_FAILED', 'Impossible de cloner le checkpoint');
    if (current) current.name = originalName + ' (remplacée ' + U.stamp() + ')';
    restored.name = originalName;
    try { var item = findProjectItemForSequence(restored); if (item) item.moveBin(app.project.rootItem); } catch (e) {}
    app.project.openSequence(restored.sequenceID);
    return { restoredSequenceId: String(restored.sequenceID), name: originalName, replacedSequenceId: current ? String(current.sequenceID) : null };
  };

  // ---------------------------------------------------------------- UI
  F['ui.alert'] = function (a) { alert(String(a.message || '')); return { shown: true }; };
})();
