// Adobe MCP — Premiere Pro : montage (coupes, suppression, désactivation, déplacement, sélection).
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var P = ADOBE_MCP.ppro;
  var safe = P.safe;

  // Coupe (razor) à un instant sur les pistes sélectionnées. Renvoie les pistes réellement coupées.
  // Un razor sur du vide ou sur un bord de clip ne change pas le nombre de clips : on ne le compte pas.
  P.razorAt = function (seq, qs, seconds, sel) {
    var tc = P.timecodeAt(seq, seconds), cut = [], k;
    for (k = 0; k < sel.video.length; k++) {
      var i = sel.video[k], t = seq.videoTracks[i], vt = qs.getVideoTrackAt(i);
      if (!vt || !t || P.isLocked(t)) continue;
      var before = t.clips.numItems;
      safe(function () { vt.razor(tc.timecode); });
      if (t.clips.numItems > before) cut.push('V' + (i + 1));
    }
    for (k = 0; k < sel.audio.length; k++) {
      var j = sel.audio[k], ta = seq.audioTracks[j], at = qs.getAudioTrackAt(j);
      if (!at || !ta || P.isLocked(ta)) continue;
      var beforeA = ta.clips.numItems;
      safe(function () { at.razor(tc.timecode); });
      if (ta.clips.numItems > beforeA) cut.push('A' + (j + 1));
    }
    return { time: tc.seconds, frame: tc.frame, timecode: tc.timecode, tracksCut: cut, cuts: cut.length };
  };

  F['edit.cutAt'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (!a.times || !a.times.length) throw ADOBE_MCP.err('BAD_ARGS', 'times[] requis (secondes)');
    var sel = P.parseTracks(a.tracks, seq);
    if (a.includeAudio === false) sel.audio = [];
    var qs = P.qeSequence(seq);
    var before = P.countClips(seq), results = [], playhead = P.savePlayhead(seq);
    for (var i = 0; i < a.times.length; i++) results.push(P.razorAt(seq, qs, Number(a.times[i]), sel));
    P.restorePlayhead(seq, playhead);
    return { sequence: String(seq.name), fps: P.seqFps(seq), results: results, clipsBefore: before, clipsAfter: P.countClips(seq) };
  };

  // Supprime des clips. ripple=false : laisse un trou (lift) ; ripple=true : referme le trou (extract).
  F['edit.deleteClips'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    var found = P.findClips(seq, a.clipIds), removed = [], failed = [];
    // Du dernier au premier pour que les index "V1/n" des clips restants ne bougent pas pendant la boucle.
    found.sort(function (x, y) { return y.clip.start.seconds - x.clip.start.seconds; });
    for (var i = 0; i < found.length; i++) {
      var f = found[i], desc = { id: f.label + '/' + f.index, name: String(f.clip.name), start: P.timeSec(f.clip.start), end: P.timeSec(f.clip.end) };
      if (typeof f.clip.remove !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'TrackItem.remove() indisponible sur cette version');
      var ok = safe(function () { return f.clip.remove(a.ripple === true, a.alignToVideo !== false); }, false);
      (ok === false ? failed : removed).push(desc);
    }
    return { removed: removed, failed: failed, ripple: a.ripple === true, clipsAfter: P.countClips(seq) };
  };

  // Active/désactive des clips (par id ou par plages). Avec ranges, coupe d'abord aux bornes si cutAtBounds.
  F['edit.setDisabled'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), targets = [], disabled = a.disabled !== false;
    if (a.clipIds && a.clipIds.length) targets = P.findClips(seq, a.clipIds);
    else if (a.ranges && a.ranges.length) {
      var sel = P.parseTracks(a.tracks, seq), playhead = P.savePlayhead(seq);
      if (a.cutAtBounds !== false) {
        var qs = P.qeSequence(seq);
        for (var r = 0; r < a.ranges.length; r++) { P.razorAt(seq, qs, Number(a.ranges[r].start), sel); P.razorAt(seq, qs, Number(a.ranges[r].end), sel); }
      }
      P.restorePlayhead(seq, playhead);
      for (var q = 0; q < a.ranges.length; q++) targets = targets.concat(P.clipsInRange(seq, Number(a.ranges[q].start), Number(a.ranges[q].end), sel, 'inside'));
    } else throw ADOBE_MCP.err('BAD_ARGS', 'clipIds[] ou ranges[] requis');
    var out = [];
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      t.clip.disabled = disabled;
      out.push({ id: t.label + '/' + t.index, name: String(t.clip.name), start: P.timeSec(t.clip.start), end: P.timeSec(t.clip.end), disabled: safe(function () { return t.clip.disabled === true; }, null) });
    }
    return { disabled: disabled, clips: out };
  };

  // Supprime tous les clips désactivés des pistes choisies (du dernier au premier).
  F['edit.removeDisabled'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), sel = P.parseTracks(a.tracks, seq);
    var all = P.clipsInRange(seq, -1, 1e12, sel, 'overlap'), targets = [];
    for (var i = 0; i < all.length; i++) if (safe(function () { return all[i].clip.disabled === true; }, false)) targets.push(all[i]);
    targets.sort(function (x, y) { return y.clip.start.seconds - x.clip.start.seconds; });
    var removed = [];
    for (var j = 0; j < targets.length; j++) {
      var t = targets[j], desc = { id: t.label + '/' + t.index, name: String(t.clip.name), start: P.timeSec(t.clip.start), end: P.timeSec(t.clip.end) };
      if (safe(function () { return t.clip.remove(a.ripple === true, true); }, false) !== false) removed.push(desc);
    }
    return { removed: removed, ripple: a.ripple === true, clipsAfter: P.countClips(seq) };
  };

  // Déplace un clip à un instant (start) ou d'un décalage (delta). TrackItem.move() prend un décalage
  // en secondes sur la plupart des versions ; on vérifie le résultat et on corrige si l'interprétation diffère.
  P.moveSemantics = null; // 'relative' | 'absolute', appris au premier déplacement réussi
  P.moveClipTo = function (seq, clip, targetStart) {
    if (typeof clip.move !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'TrackItem.move() indisponible sur cette version');
    var ft = P.frameTicks(seq) / ADOBE_MCP.TICKS_PER_SECOND, tol = ft * 0.6;
    var from = clip.start.seconds, delta = Number(targetStart) - from;
    if (Math.abs(delta) < tol) return { moved: false, start: from };
    var t = new Time();
    if (P.moveSemantics === 'absolute') t.ticks = P.snap(seq, targetStart).ticks; else t.seconds = delta;
    clip.move(t);
    var now = clip.start.seconds;
    if (Math.abs(now - targetStart) <= tol) { if (!P.moveSemantics) P.moveSemantics = 'relative'; return { moved: true, start: U.round(now, 4) }; }
    // L'hôte a lu une position absolue (ou l'inverse) : on compense une fois.
    var t2 = new Time();
    if (P.moveSemantics === 'absolute') { t2.seconds = Number(targetStart) - now; P.moveSemantics = 'relative'; }
    else { t2.ticks = P.snap(seq, targetStart).ticks; P.moveSemantics = 'absolute'; }
    clip.move(t2);
    now = clip.start.seconds;
    if (Math.abs(now - targetStart) > tol) throw ADOBE_MCP.err('MOVE_FAILED', 'Le clip n\'a pas atteint la position demandée (' + U.round(targetStart, 3) + ' s, obtenu ' + U.round(now, 3) + ' s)');
    return { moved: true, start: U.round(now, 4) };
  };

  F['edit.moveClip'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    var f = P.findClip(seq, a.clipId);
    var target = a.time !== undefined ? Number(a.time) : f.clip.start.seconds + Number(a.delta || 0);
    if (target < 0) target = 0;
    var r = P.moveClipTo(seq, f.clip, target);
    r.id = f.label + '/' + f.index; r.name = String(f.clip.name); r.end = P.timeSec(f.clip.end); r.moveSemantics = P.moveSemantics;
    return r;
  };

  // Sélection dans la timeline.
  F['edit.select'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), tracks = P.allTracks(seq), i, j;
    if (a.clear !== false) for (i = 0; i < tracks.length; i++) for (j = 0; j < tracks[i].track.clips.numItems; j++) safe(function () { tracks[i].track.clips[j].setSelected(false, true); });
    var selected = [];
    if (a.clipIds && a.clipIds.length) {
      var found = P.findClips(seq, a.clipIds);
      for (i = 0; i < found.length; i++) { safe(function () { found[i].clip.setSelected(true, true); }); selected.push(found[i].label + '/' + found[i].index); }
    }
    return { selected: selected };
  };
})();
