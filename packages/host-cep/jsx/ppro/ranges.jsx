// Adobe MCP — Premiere Pro : suppression de plages de temps (cœur du jump cut) et inverse (keep).
// Méthode : pour chaque plage, de la dernière à la première : razor aux deux bornes, retrait (lift) des clips
// entièrement compris dans la plage, puis — si ripple — décalage vers la gauche de tous les clips qui suivent.
// On ne dépend pas du « ripple delete » natif (comportement variable selon les pistes) : chaque étape est vérifiée.
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var P = ADOBE_MCP.ppro;
  var safe = P.safe;

  // Normalise, trie et fusionne des plages {start,end} (secondes), alignées sur l'image.
  P.normalizeRanges = function (seq, ranges, minLen) {
    var out = [], i;
    for (i = 0; i < ranges.length; i++) {
      var s = P.snap(seq, Number(ranges[i].start)).seconds, e = P.snap(seq, Number(ranges[i].end)).seconds;
      if (e - s >= (minLen || 0.001)) out.push({ start: s, end: e });
    }
    out.sort(function (x, y) { return x.start - y.start; });
    var merged = [];
    for (i = 0; i < out.length; i++) {
      var last = merged.length ? merged[merged.length - 1] : null;
      if (last && out[i].start <= last.end + 1e-6) { if (out[i].end > last.end) last.end = out[i].end; }
      else merged.push({ start: out[i].start, end: out[i].end });
    }
    return merged;
  };

  // Premiere 2020 (14.x) n'a pas TrackItem.move() : on referme alors les trous avec la suppression
  // « ripple » native de chaque clip. Vrai si move() est absent sur les clips de la séquence.
  P.noMove = function (seq) {
    var tracks = P.allTracks(seq);
    for (var k = 0; k < tracks.length; k++)
      if (tracks[k].track.clips.numItems) return typeof tracks[k].track.clips[0].move !== 'function';
    return false;
  };

  // Début du premier clip de chaque piste situé après t (témoin du décalage). { "V1": 12.3, ... }
  P.witnesses = function (seq, t, sel) {
    var after = P.clipsInRange(seq, t - 1e-4, 1e12, sel, 'inside'), w = {};
    for (var i = 0; i < after.length; i++) {
      var s = after[i].clip.start.seconds;
      if (w[after[i].label] === undefined || s < w[after[i].label]) w[after[i].label] = s;
    }
    return w;
  };

  // Retire une plage sur les pistes sel. Renvoie { removed[], shifted } ; lance une erreur si un décalage échoue.
  P.removeRange = function (seq, qs, range, sel, ripple) {
    var len = range.end - range.start, eps = 1e-4;
    P.razorAt(seq, qs, range.start, sel);
    P.razorAt(seq, qs, range.end, sel);
    var inside = P.clipsInRange(seq, range.start, range.end, sel, 'inside');
    // Du dernier au premier : les index des clips précédents ne bougent pas.
    inside.sort(function (x, y) { return y.clip.start.seconds - x.clip.start.seconds; });
    if (ripple && P.noMove(seq)) return P.removeRangeNative(seq, range, sel, inside);
    var removed = [];
    for (var i = 0; i < inside.length; i++) {
      var c = inside[i];
      var desc = { track: c.label, name: String(c.clip.name), start: P.timeSec(c.clip.start), end: P.timeSec(c.clip.end) };
      if (typeof c.clip.remove !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'TrackItem.remove() indisponible sur cette version');
      if (safe(function () { return c.clip.remove(false, false); }, false) === false) throw ADOBE_MCP.err('REMOVE_FAILED', 'Suppression refusée : ' + desc.track + ' ' + desc.name + ' (' + desc.start + '–' + desc.end + ' s)');
      removed.push(desc);
    }
    var shifted = 0;
    if (ripple) {
      // Tous les clips des pistes sel qui commencent à la fin de la plage ou après, du premier au dernier :
      // chacun recule de len. Un clip déjà à sa place (clip lié déplacé avec son partenaire) est ignoré.
      var after = P.clipsInRange(seq, range.end - eps, 1e12, sel, 'inside');
      after.sort(function (x, y) { return x.clip.start.seconds - y.clip.start.seconds; });
      for (var j = 0; j < after.length; j++) {
        var target = after[j].clip.start.seconds - len;
        if (target < -eps) continue;
        var r = P.moveClipTo(seq, after[j].clip, target < 0 ? 0 : target);
        if (r.moved) shifted++;
      }
    }
    return { start: range.start, end: range.end, duration: U.round(len, 4), removed: removed, shifted: shifted };
  };

  // Variante sans move() (Premiere 2020) : suppression ripple native, clip par clip, puis contrôle.
  // La suppression ripple d'un clip referme exactement sa durée sur sa piste : chaque piste qui a du
  // contenu après la plage doit donc être entièrement couverte par ses clips dans la plage (pas de trou),
  // sinon elle ne reculerait pas d'autant et se désynchroniserait. On le vérifie avant de toucher à quoi que ce soit.
  P.removeRangeNative = function (seq, range, sel, inside) {
    var len = range.end - range.start, tol = P.frameTicks(seq) / ADOBE_MCP.TICKS_PER_SECOND * 0.6;
    var before = P.witnesses(seq, range.end, sel), couvert = {}, label, i;
    for (i = 0; i < inside.length; i++) couvert[inside[i].label] = (couvert[inside[i].label] || 0) + inside[i].clip.end.seconds - inside[i].clip.start.seconds;
    for (label in before) {
      if (Math.abs((couvert[label] || 0) - len) > tol)
        throw ADOBE_MCP.err('UNSUPPORTED', 'Piste ' + label + ' : trou dans la plage ' + U.round(range.start, 3) + '–' + U.round(range.end, 3) +
          ' s. Sans TrackItem.move() (Premiere 2020), elle ne peut pas être refermée sans désynchroniser les pistes. Combler le trou ou limiter tracks.');
    }
    var removed = [];
    for (i = 0; i < inside.length; i++) {
      var c = inside[i];
      var desc = { track: c.label, name: String(c.clip.name), start: P.timeSec(c.clip.start), end: P.timeSec(c.clip.end) };
      if (safe(function () { return c.clip.remove(true, true); }, false) === false) throw ADOBE_MCP.err('REMOVE_FAILED', 'Suppression refusée : ' + desc.track + ' ' + desc.name + ' (' + desc.start + '–' + desc.end + ' s)');
      removed.push(desc);
    }
    // Contrôle : chaque piste a reculé d'exactement len (sinon : désynchronisation, à annuler par ppro_rewind).
    var now = P.witnesses(seq, range.start, sel), ecarts = [];
    for (label in before) {
      var recul = before[label] - (now[label] === undefined ? before[label] : now[label]);
      if (Math.abs(recul - len) > tol) ecarts.push(label + ' a reculé de ' + U.round(recul, 3) + ' s au lieu de ' + U.round(len, 3) + ' s');
    }
    if (ecarts.length) throw ADOBE_MCP.err('DESYNC', 'Pistes désynchronisées après la plage ' + U.round(range.start, 3) + ' s : ' + ecarts.join(' ; ') + '. Annuler avec ppro_rewind.');
    return { start: range.start, end: range.end, duration: U.round(len, 4), removed: removed, shifted: 0, method: 'ripple-natif' };
  };

  F['edit.removeRanges'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (!a.ranges || !a.ranges.length) throw ADOBE_MCP.err('BAD_ARGS', 'ranges[] requis');
    var sel = P.parseTracks(a.tracks, seq);
    var ranges = P.normalizeRanges(seq, a.ranges);
    var ripple = a.ripple !== false, qs = P.qeSequence(seq), playhead = P.savePlayhead(seq);
    var durationBefore = U.ticksToSeconds(seq.end), clipsBefore = P.countClips(seq), results = [];
    try {
      for (var i = ranges.length - 1; i >= 0; i--) results.push(P.removeRange(seq, qs, ranges[i], sel, ripple));
    } finally { P.restorePlayhead(seq, playhead); }
    results.reverse();
    var removedTotal = 0;
    for (var k = 0; k < results.length; k++) removedTotal += results[k].duration;
    return {
      ranges: results.length, ripple: ripple, timeRemoved: U.round(removedTotal, 4),
      durationBefore: U.round(durationBefore, 4), durationAfter: U.round(U.ticksToSeconds(seq.end), 4),
      clipsBefore: clipsBefore, clipsAfter: P.countClips(seq), moveSemantics: P.moveSemantics, details: results
    };
  };

  // Inverse : ne garde que les plages données (tout le reste est retiré, avec ripple).
  F['edit.keepRanges'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (!a.ranges || !a.ranges.length) throw ADOBE_MCP.err('BAD_ARGS', 'ranges[] requis');
    var keep = P.normalizeRanges(seq, a.ranges), end = U.ticksToSeconds(seq.end), remove = [], cursor = 0;
    for (var i = 0; i < keep.length; i++) {
      if (keep[i].start > cursor) remove.push({ start: cursor, end: keep[i].start });
      cursor = keep[i].end;
    }
    if (end > cursor) remove.push({ start: cursor, end: end });
    return F['edit.removeRanges']({ ranges: remove, tracks: a.tracks, ripple: a.ripple !== false, sequenceId: a.sequenceId });
  };
})();
