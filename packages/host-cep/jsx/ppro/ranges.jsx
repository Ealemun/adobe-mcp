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

  // Retire une plage sur les pistes sel. Renvoie { removed[], shifted } ; lance une erreur si un décalage échoue.
  P.removeRange = function (seq, qs, range, sel, ripple) {
    var len = range.end - range.start, eps = 1e-4;
    P.razorAt(seq, qs, range.start, sel);
    P.razorAt(seq, qs, range.end, sel);
    var inside = P.clipsInRange(seq, range.start, range.end, sel, 'inside');
    // Du dernier au premier : les index des clips précédents ne bougent pas.
    inside.sort(function (x, y) { return y.clip.start.seconds - x.clip.start.seconds; });
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
