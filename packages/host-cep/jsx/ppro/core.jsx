// Adobe MCP — Premiere Pro : fonctions communes à tous les modules ppro/*.jsx (ES3).
// Testé en priorité sur Premiere Pro 2020 (14.x) ; les API absentes sont détectées et signalées.
// Ce fichier ne déclare aucune fonction appelable : il expose les utilitaires sous ADOBE_MCP.ppro.
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var TPS = ADOBE_MCP.TICKS_PER_SECOND;
  var P = ADOBE_MCP.ppro = {};

  // ---------------------------------------------------------------- accès projet / séquence
  P.requireProject = function () {
    if (!app.project) throw ADOBE_MCP.err('NO_PROJECT', 'Aucun projet ouvert');
    return app.project;
  };

  // Séquence par id (sequenceID) ou séquence active si id absent.
  P.requireSequence = function (id) {
    var p = P.requireProject();
    if (id) {
      for (var i = 0; i < p.sequences.numSequences; i++) {
        if (String(p.sequences[i].sequenceID) === String(id)) return p.sequences[i];
      }
      throw ADOBE_MCP.err('SEQUENCE_NOT_FOUND', 'Séquence introuvable : ' + id);
    }
    if (!p.activeSequence) throw ADOBE_MCP.err('NO_ACTIVE_SEQUENCE', 'Aucune séquence active dans la timeline');
    return p.activeSequence;
  };

  // Séquence active côté QE (API non documentée : razor, exportFramePNG, effets, transitions).
  // La séquence QE est toujours la séquence active : on active d'abord la séquence demandée.
  P.qeSequence = function (seq) {
    if (seq) {
      var active = P.requireProject().activeSequence;
      if (!active || String(active.sequenceID) !== String(seq.sequenceID)) app.project.openSequence(seq.sequenceID);
    }
    app.enableQE();
    var s = qe.project.getActiveSequence();
    if (!s) throw ADOBE_MCP.err('NO_ACTIVE_SEQUENCE', 'Aucune séquence active (QE)');
    return s;
  };

  // Renvoie undefined → dflt, et avale les exceptions (propriétés absentes selon la version).
  P.safe = function (fn, dflt) { try { var v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } };
  var safe = P.safe;

  // ---------------------------------------------------------------- temps et images
  // Durée d'une image en ticks (entier). seq.timebase est une chaîne de ticks par image.
  P.frameTicks = function (seq) {
    var tb = safe(function () { return Number(seq.timebase); }, 0);
    if (!(tb > 0)) tb = safe(function () { return Number(seq.getSettings().videoFrameRate.ticks); }, 0);
    if (!(tb > 0)) throw ADOBE_MCP.err('NO_TIMEBASE', 'Base de temps de la séquence illisible');
    return tb;
  };
  P.seqFps = function (seq) {
    var tb = safe(function () { return P.frameTicks(seq); }, 0);
    return tb > 0 ? U.round(TPS / tb, 3) : 0;
  };
  // Aligne un instant (secondes) sur l'image la plus proche de la séquence : évite les coupes
  // « une image trop tôt » dues aux arrondis flottants. Renvoie ticks (chaîne), frame, seconds.
  P.snap = function (seq, seconds) {
    var ft = P.frameTicks(seq);
    var frame = Math.round(Number(seconds) * TPS / ft);
    if (frame < 0) frame = 0;
    return { ticks: String(frame * ft), frame: frame, seconds: U.round(frame * ft / TPS, 6) };
  };
  // Objet Time (API Premiere) à partir de secondes alignées sur l'image.
  P.timeAt = function (seq, seconds) {
    var t = new Time();
    t.ticks = P.snap(seq, seconds).ticks;
    return t;
  };
  P.timeSec = function (t) { return t ? U.round(t.seconds, 4) : 0; };
  // Timecode (chaîne) d'un instant : positionne la tête de lecture puis lit le timecode QE,
  // format toujours correct (drop-frame ou non). La tête de lecture doit être restaurée par l'appelant.
  P.timecodeAt = function (seq, seconds) {
    var s = P.snap(seq, seconds);
    seq.setPlayerPosition(s.ticks);
    var tc = String(P.qeSequence(seq).CTI.timecode);
    if (!tc) throw ADOBE_MCP.err('NO_TIMECODE', 'Impossible de lire le timecode de la tête de lecture');
    return { timecode: tc, frame: s.frame, seconds: s.seconds, ticks: s.ticks };
  };
  // Sauvegarde/restauration de la tête de lecture et des points in/out de l'utilisateur.
  P.savePlayhead = function (seq) { return safe(function () { return String(seq.getPlayerPosition().ticks); }, null); };
  P.restorePlayhead = function (seq, ticks) { if (ticks) safe(function () { seq.setPlayerPosition(ticks); }); };

  // ---------------------------------------------------------------- description de séquence
  P.seqSize = function (seq) {
    var w = 0, h = 0;
    try { w = Number(seq.frameSizeHorizontal); h = Number(seq.frameSizeVertical); } catch (e) {}
    if (!w) { try { var st = seq.getSettings(); w = Number(st.videoFrameWidth); h = Number(st.videoFrameHeight); } catch (e2) {} }
    return { width: w, height: h };
  };
  P.sequenceInfo = function (seq) {
    var size = P.seqSize(seq);
    var ft = safe(function () { return P.frameTicks(seq); }, 0);
    return {
      id: String(seq.sequenceID), name: String(seq.name), fps: P.seqFps(seq), frameTicks: ft, width: size.width, height: size.height,
      duration: safe(function () { return U.round(U.ticksToSeconds(seq.end), 4); }, 0), // seq.end = ticks (chaîne)
      inPoint: safe(function () { return U.round(Number(seq.getInPointAsTime().seconds), 4); }, null),
      outPoint: safe(function () { return U.round(Number(seq.getOutPointAsTime().seconds), 4); }, null),
      playhead: safe(function () { return U.round(seq.getPlayerPosition().seconds, 4); }, null),
      videoTracks: seq.videoTracks.numTracks, audioTracks: seq.audioTracks.numTracks
    };
  };

  // "all" | "video" | "audio" | ["V1","A2"]  →  { video: [idx...], audio: [idx...] }
  P.parseTracks = function (spec, seq) {
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
  };
  // Piste par étiquette "V2" / "A1" → { track, label, kind, index }
  P.trackByLabel = function (seq, label) {
    var m = /^([VA])(\d+)$/i.exec(String(label));
    if (!m) throw ADOBE_MCP.err('BAD_TRACK', 'Nom de piste invalide : ' + label + ' (attendu V1, A2…)');
    var kind = m[1].toUpperCase() === 'V' ? 'video' : 'audio', idx = parseInt(m[2], 10) - 1;
    var coll = kind === 'video' ? seq.videoTracks : seq.audioTracks;
    if (idx < 0 || idx >= coll.numTracks) throw ADOBE_MCP.err('BAD_TRACK', 'Piste inexistante : ' + label);
    return { track: coll[idx], label: m[1].toUpperCase() + (idx + 1), kind: kind, index: idx };
  };
  // Toutes les pistes : [{ track, label, kind, index }]
  P.allTracks = function (seq) {
    var out = [], i;
    for (i = 0; i < seq.videoTracks.numTracks; i++) out.push({ track: seq.videoTracks[i], label: 'V' + (i + 1), kind: 'video', index: i });
    for (i = 0; i < seq.audioTracks.numTracks; i++) out.push({ track: seq.audioTracks[i], label: 'A' + (i + 1), kind: 'audio', index: i });
    return out;
  };
  P.isLocked = function (track) { return safe(function () { return track.isLocked() === true; }, false); };

  P.clipInfo = function (clip, trackLabel, idx) {
    var pi = safe(function () { return clip.projectItem; }, null);
    return {
      id: trackLabel + '/' + idx,
      nodeId: safe(function () { return String(clip.nodeId); }, null),
      name: String(clip.name),
      start: P.timeSec(clip.start), end: P.timeSec(clip.end),
      inPoint: P.timeSec(clip.inPoint), outPoint: P.timeSec(clip.outPoint),
      duration: P.timeSec(clip.duration),
      disabled: safe(function () { return clip.disabled === true; }, null),
      selected: safe(function () { return clip.isSelected() === true; }, null),
      speed: safe(function () { return U.round(clip.getSpeed(), 4); }, null),
      mediaType: safe(function () { return String(clip.mediaType); }, null),
      mediaPath: pi ? safe(function () { return String(pi.getMediaPath()); }, null) : null
    };
  };

  // Résout un identifiant de clip : "V1/3" (piste/index) ou un nodeId. Renvoie { clip, label, index, trackInfo }.
  P.findClip = function (seq, ref) {
    var m = /^([VA])(\d+)\/(\d+)$/i.exec(String(ref));
    if (m) {
      var ti = P.trackByLabel(seq, m[1] + m[2]), idx = parseInt(m[3], 10);
      if (idx < 0 || idx >= ti.track.clips.numItems) throw ADOBE_MCP.err('CLIP_NOT_FOUND', 'Clip introuvable : ' + ref + ' (piste ' + ti.label + ' : ' + ti.track.clips.numItems + ' clips)');
      return { clip: ti.track.clips[idx], label: ti.label, index: idx, trackInfo: ti };
    }
    var tracks = P.allTracks(seq);
    for (var k = 0; k < tracks.length; k++) {
      var t = tracks[k].track;
      for (var j = 0; j < t.clips.numItems; j++) {
        if (safe(function () { return String(t.clips[j].nodeId); }, '') === String(ref)) return { clip: t.clips[j], label: tracks[k].label, index: j, trackInfo: tracks[k] };
      }
    }
    throw ADOBE_MCP.err('CLIP_NOT_FOUND', 'Clip introuvable : ' + ref + ' (attendu "V1/3" ou un nodeId)');
  };
  // Liste de références → tableau de résultats findClip, dans l'ordre donné.
  P.findClips = function (seq, refs) {
    if (!refs || !refs.length) throw ADOBE_MCP.err('BAD_ARGS', 'clipIds[] requis');
    var out = [];
    for (var i = 0; i < refs.length; i++) out.push(P.findClip(seq, refs[i]));
    return out;
  };
  // Clips d'une plage [start,end] sur les pistes choisies. mode "inside" (entièrement inclus) ou "overlap".
  P.clipsInRange = function (seq, start, end, sel, mode) {
    var out = [], tracks = P.allTracks(seq), eps = 1e-4;
    for (var k = 0; k < tracks.length; k++) {
      var ti = tracks[k], idxs = ti.kind === 'video' ? sel.video : sel.audio, wanted = false;
      for (var q = 0; q < idxs.length; q++) if (idxs[q] === ti.index) wanted = true;
      if (!wanted) continue;
      for (var j = 0; j < ti.track.clips.numItems; j++) {
        var c = ti.track.clips[j], s = c.start.seconds, e = c.end.seconds;
        var hit = mode === 'overlap' ? (e > start + eps && s < end - eps) : (s >= start - eps && e <= end + eps);
        if (hit) out.push({ clip: c, label: ti.label, index: j, trackInfo: ti });
      }
    }
    return out;
  };
  P.countClips = function (seq) {
    var n = 0, i;
    for (i = 0; i < seq.videoTracks.numTracks; i++) n += seq.videoTracks[i].clips.numItems;
    for (i = 0; i < seq.audioTracks.numTracks; i++) n += seq.audioTracks[i].clips.numItems;
    return n;
  };

  // ---------------------------------------------------------------- éléments de projet
  P.findProjectItemForSequence = function (seq) {
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
  };
  // Chutier par nom (créé à la racine s'il n'existe pas) ; "A/B" descend dans les sous-chutiers.
  P.findOrCreateBin = function (name, parent) {
    var bin = parent || app.project.rootItem;
    var parts = String(name).split('/');
    for (var p = 0; p < parts.length; p++) {
      var part = parts[p], found = null;
      if (!part) continue;
      for (var i = 0; i < bin.children.numItems; i++) {
        var c = bin.children[i];
        if (c.type === ProjectItemType.BIN && String(c.name) === part) { found = c; break; }
      }
      bin = found || bin.createBin(part);
    }
    return bin;
  };
  // Élément de projet par nodeId (parcours récursif) ; null si absent.
  P.findItemByNodeId = function (nodeId) {
    function walk(item) {
      for (var i = 0; i < item.children.numItems; i++) {
        var c = item.children[i];
        if (safe(function () { return String(c.nodeId); }, '') === String(nodeId)) return c;
        if (c.type === ProjectItemType.BIN) { var r = walk(c); if (r) return r; }
      }
      return null;
    }
    return walk(app.project.rootItem);
  };
  P.requireItem = function (nodeId) {
    var it = P.findItemByNodeId(nodeId);
    if (!it) throw ADOBE_MCP.err('ITEM_NOT_FOUND', 'Élément de projet introuvable : ' + nodeId);
    return it;
  };
  P.itemInfo = function (item, depth) {
    var isBin = item.type === ProjectItemType.BIN;
    var isSeq = !isBin && safe(function () { return item.isSequence(); }, false);
    var mp = (!isBin && !isSeq) ? safe(function () { return String(item.getMediaPath()); }, null) : null;
    var kind = isBin ? 'bin' : isSeq ? 'sequence' : P.mediaKind(mp);
    var out = {
      nodeId: safe(function () { return String(item.nodeId); }, null), name: String(item.name), type: kind,
      path: safe(function () { return String(item.treePath); }, null), depth: depth || 0
    };
    if (mp) out.mediaPath = mp;
    if (!isBin) {
      out.offline = safe(function () { return item.isOffline() === true; }, null);
      out.duration = safe(function () { return U.round(item.getOutPoint().seconds - item.getInPoint().seconds, 4); }, null);
      out.colorLabel = safe(function () { return item.getColorLabel(); }, null);
    }
    if (isBin) out.children = item.children.numItems;
    return out;
  };
  P.mediaKind = function (path) {
    if (!path) return 'other';
    var m = /\.([a-z0-9]+)$/i.exec(path);
    var ext = m ? m[1].toLowerCase() : '';
    if (/^(mp4|mov|mxf|avi|mkv|m4v|mts|m2ts|webm|r3d|braw|prores|dnxhd)$/.test(ext)) return 'video';
    if (/^(wav|mp3|aac|m4a|aif|aiff|flac|ogg|wma)$/.test(ext)) return 'audio';
    if (/^(png|jpg|jpeg|tif|tiff|psd|ai|gif|bmp|tga|exr|dpx|svg|webp)$/.test(ext)) return 'image';
    if (/^(srt|vtt|scc|stl|xml)$/.test(ext)) return 'caption';
    return 'other';
  };
  P.sequenceIdSet = function () {
    var ids = {}, p = P.requireProject();
    for (var i = 0; i < p.sequences.numSequences; i++) ids[String(p.sequences[i].sequenceID)] = true;
    return ids;
  };
  // Clone une séquence et renvoie la nouvelle (la seule dont l'id n'existait pas avant).
  P.cloneSequence = function (seq) {
    if (typeof seq.clone !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Sequence.clone() indisponible sur cette version');
    var before = P.sequenceIdSet();
    seq.clone();
    var p = P.requireProject();
    for (var i = 0; i < p.sequences.numSequences; i++) if (!before[String(p.sequences[i].sequenceID)]) return p.sequences[i];
    throw ADOBE_MCP.err('CLONE_FAILED', 'La copie de la séquence est introuvable');
  };
  // Dossier du projet (pour y ranger les fichiers produits : sous-dossier _adobe-mcp).
  P.projectDir = function () {
    var p = P.requireProject();
    var f = new File(String(p.path));
    return f.parent && f.parent.exists ? f.parent.fsName : U.tempDir();
  };
  P.workDir = function (sub) {
    var d = new Folder(P.projectDir() + '/_adobe-mcp' + (sub ? '/' + sub : ''));
    if (!d.exists) d.create();
    return d.fsName;
  };
})();
