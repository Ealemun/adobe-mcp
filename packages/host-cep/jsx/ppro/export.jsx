// Adobe MCP — Premiere Pro : export d'images.
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var P = ADOBE_MCP.ppro;

  // Exporte une image PNG pleine résolution à un instant (QE exportFramePNG). La tête de lecture est restaurée.
  P.exportFrame = function (seq, qs, seconds, path) {
    var tc = P.timecodeAt(seq, seconds);
    if (typeof qs.exportFramePNG !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'exportFramePNG indisponible sur cette version');
    qs.exportFramePNG(tc.timecode, path);
    var f = U.waitForFile(path, 20000);
    if (!f) throw ADOBE_MCP.err('EXPORT_FAILED', 'Image non produite : ' + path, 'timecode ' + tc.timecode);
    return { path: f.fsName, time: tc.seconds, frame: tc.frame, timecode: tc.timecode, bytes: f.length };
  };

  F['export.frame'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    var t = (a.time === undefined || a.time === null) ? seq.getPlayerPosition().seconds : Number(a.time);
    var path = U.outPath(a.path || (U.tempDir() + '/frame_' + U.stamp() + '.png'));
    if (!/\.png$/i.test(path)) path += '.png';
    var playhead = P.savePlayhead(seq), qs = P.qeSequence(seq);
    try { return P.exportFrame(seq, qs, t, path); }
    finally { P.restorePlayhead(seq, playhead); }
  };

  // Plusieurs images : times[] ou every (secondes) sur range. Fichiers frame_<stamp>_<n>.png dans le dossier temporaire.
  F['export.frames'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), times = [], i;
    if (a.times && a.times.length) for (i = 0; i < a.times.length; i++) times.push(Number(a.times[i]));
    else {
      var every = Number(a.every || 2), r0 = a.range ? Number(a.range[0]) : 0, r1 = a.range ? Number(a.range[1]) : U.ticksToSeconds(seq.end);
      if (!(every > 0)) throw ADOBE_MCP.err('BAD_ARGS', 'every > 0 requis');
      for (var t = r0; t < r1; t += every) times.push(U.round(t, 4));
    }
    var max = Number(a.max || 60);
    if (times.length > max) throw ADOBE_MCP.err('TOO_MANY', times.length + ' images demandées (max ' + max + ') : augmenter every ou réduire range');
    var dir = a.dir ? U.ensureFolder(a.dir).fsName : U.tempDir(), stamp = U.stamp(), out = [];
    var playhead = P.savePlayhead(seq), qs = P.qeSequence(seq);
    try {
      for (i = 0; i < times.length; i++) out.push(P.exportFrame(seq, qs, times[i], U.outPath(dir + '/frame_' + stamp + '_' + (i < 10 ? '0' : '') + i + '.png')));
    } finally { P.restorePlayhead(seq, playhead); }
    return { dir: dir, count: out.length, frames: out };
  };
})();
