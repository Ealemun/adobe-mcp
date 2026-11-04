// Adobe MCP — Premiere Pro : fonctions complémentaires (rognage, lien/délien, vitesse, SFX, sous-titres, infos audio).
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var P = ADOBE_MCP.ppro;
  var safe = P.safe;

  // Rogne un clip : nouveaux start/end en secondes de séquence (les bords sont déplacés, le contenu reste calé).
  F['edit.trimClip'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId), c = f.clip;
    var before = P.clipInfo(c, f.label, f.index);
    if (a.end !== undefined && a.end !== null) { var te = new Time(); te.ticks = P.snap(seq, Number(a.end)).ticks; c.end = te; }
    if (a.start !== undefined && a.start !== null) { var ts = new Time(); ts.ticks = P.snap(seq, Number(a.start)).ticks; c.start = ts; }
    var after = P.clipInfo(c, f.label, f.index);
    if ((a.end !== undefined && Math.abs(after.end - Number(a.end)) > 0.05) || (a.start !== undefined && Math.abs(after.start - Number(a.start)) > 0.05)) {
      return { before: before, after: after, warning: 'Le bord n\'a pas pris la valeur demandée (média insuffisant ou clip voisin ?)' };
    }
    return { before: before, after: after };
  };

  // Lie / délie vidéo et audio des clips donnés (passe par la sélection, comme l'interface).
  F['edit.setLinked'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), found = P.findClips(seq, a.clipIds), tracks = P.allTracks(seq), i, j;
    for (i = 0; i < tracks.length; i++) for (j = 0; j < tracks[i].track.clips.numItems; j++) safe(function () { tracks[i].track.clips[j].setSelected(false, true); });
    for (i = 0; i < found.length; i++) safe(function () { found[i].clip.setSelected(true, true); });
    var fn = a.linked === false ? 'unlinkSelection' : 'linkSelection';
    if (typeof seq[fn] !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Sequence.' + fn + ' indisponible sur cette version');
    var ok = seq[fn]();
    return { linked: a.linked !== false, ok: ok !== false, clips: a.clipIds };
  };

  // Vitesse d'un clip (QE, non documenté) : speed en %, reverse, maintainPitch, ripple. Vérifié via getSpeed().
  F['edit.setSpeed'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId);
    var speed = Number(a.speed || 100), before = safe(function () { return f.clip.getSpeed(); }, null);
    if (a.duration) speed = U.round(100 * f.clip.duration.seconds / Number(a.duration), 3);
    if (a.reverse === true) speed = -Math.abs(speed);
    var qs = P.qeSequence(seq), qt = f.trackInfo.kind === 'video' ? qs.getVideoTrackAt(f.trackInfo.index) : qs.getAudioTrackAt(f.trackInfo.index);
    var startTicks = String(f.clip.start.ticks), it = null;
    for (var i = 0; i < safe(function () { return qt.numItems; }, 0) && !it; i++) { var q = qt.getItemAt(i); if (q && safe(function () { return String(q.start.ticks); }, '') === startTicks) it = q; }
    if (!it || typeof it.setSpeed !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Changement de vitesse indisponible (QE setSpeed) : clic droit sur le clip > Vitesse/Durée');
    var tries = [
      function () { return it.setSpeed(speed, '00;00;00;00', a.ripple === true, a.maintainPitch !== false, a.reverse === true); },
      function () { return it.setSpeed(speed, a.ripple === true, a.maintainPitch !== false); },
      function () { return it.setSpeed(speed); }
    ];
    var ok = false;
    for (var k = 0; k < tries.length && !ok; k++) {
      safe(tries[k]);
      var now = safe(function () { return f.clip.getSpeed(); }, null);
      if (now !== null && before !== null && Math.abs(Math.abs(now) - Math.abs(speed) / 100) < 0.01) ok = true;
      if (now !== null && before !== null && Math.abs(now - before) > 1e-6 && !ok) ok = true; // changement constaté, échelle différente
    }
    var after = P.clipInfo(f.clip, f.label, f.index);
    if (!ok) throw ADOBE_MCP.err('SPEED_FAILED', 'La vitesse n\'a pas changé (getSpeed = ' + before + '). Faire clic droit > Vitesse/Durée dans Premiere.');
    return { clip: f.label + '/' + f.index, requestedSpeed: speed, speedBefore: before, speedAfter: after.speed, start: after.start, end: after.end };
  };

  // Place des sons : items[{path, time, track?, gainDb?}] → import (chutier _adobe-mcp/SFX) + pose + volume.
  F['edit.placeSfx'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (!a.items || !a.items.length) throw ADOBE_MCP.err('BAD_ARGS', 'items[] requis');
    var paths = [], i;
    for (i = 0; i < a.items.length; i++) { var pth = String(a.items[i].path); var dup = false; for (var d = 0; d < paths.length; d++) if (paths[d] === pth) dup = true; if (!dup) paths.push(pth); }
    var imp = F['project.import']({ paths: paths, bin: a.bin || '_adobe-mcp/SFX' });
    var byPath = {};
    for (i = 0; i < imp.imported.length; i++) if (imp.imported[i].mediaPath) byPath[String(new File(imp.imported[i].mediaPath).fsName)] = imp.imported[i].nodeId;
    // Les fichiers déjà importés auparavant ne sont pas dans "imported" : on les cherche dans le projet.
    var placed = [];
    for (i = 0; i < a.items.length; i++) {
      var it = a.items[i], key = String(new File(it.path).fsName), nodeId = byPath[key];
      if (!nodeId) { var all = F['project.listItems']({ type: 'audio', limit: 5000 }).items; for (var j = 0; j < all.length; j++) if (all[j].mediaPath && String(new File(all[j].mediaPath).fsName) === key) nodeId = all[j].nodeId; }
      if (!nodeId) throw ADOBE_MCP.err('IMPORT_FAILED', 'Son non importé : ' + it.path);
      var r = P.placeClip(seq, { nodeId: nodeId, time: Number(it.time), videoTrack: 'V1', audioTrack: it.track || a.track || 'A3', mode: 'overwrite', includeAudio: true });
      var ids = [];
      for (var k = 0; k < r.added.length; k++) if (r.added[k].id.charAt(0) === 'A') ids.push(r.added[k].id);
      if (ids.length && (it.gainDb !== undefined || a.gainDb !== undefined)) F['audio.setClipVolume']({ clipIds: ids, db: Number(it.gainDb !== undefined ? it.gainDb : a.gainDb), sequenceId: a.sequenceId });
      placed.push({ path: it.path, time: Number(it.time), clips: ids });
    }
    return { placed: placed };
  };

  // Sous-titres : importe un fichier (.srt/.vtt/.scc) et le pose sur une piste vidéo (Premiere 2020 : clip de légendes).
  F['captions.import'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (!a.path || !U.fileExists(a.path)) throw ADOBE_MCP.err('FILE_NOT_FOUND', 'Fichier de sous-titres introuvable : ' + a.path);
    var imp = F['project.import']({ paths: [String(a.path)], bin: a.bin || '_adobe-mcp/Captions' });
    if (!imp.imported.length) throw ADOBE_MCP.err('IMPORT_FAILED', 'Import des sous-titres refusé par Premiere');
    var track = a.track || ('V' + seq.videoTracks.numTracks);
    var r = P.placeClip(seq, { nodeId: imp.imported[0].nodeId, time: Number(a.time || 0), videoTrack: track, audioTrack: 'A1', mode: 'overwrite', includeAudio: false });
    return { item: imp.imported[0], track: track, placed: r.added, note: 'Premiere 2020 : les sous-titres sont un clip de légendes ; style via Fenêtre > Légendes. Versions 15+ : piste de légendes native.' };
  };

  // Niveaux : volume (dB) de chaque clip audio, pistes muettes/verrouillées.
  F['audio.getInfo'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), sel = P.parseTracks(a.tracks || 'audio', seq), out = [];
    for (var k = 0; k < sel.audio.length; k++) {
      var i = sel.audio[k], t = seq.audioTracks[i], clips = [];
      for (var j = 0; j < t.clips.numItems; j++) {
        var c = t.clips[j], info = P.clipInfo(c, 'A' + (i + 1), j), raw = null;
        try {
          for (var m = 0; m < c.components.numItems && raw === null; m++) {
            var comp = c.components[m];
            if (/volume/i.test(String(comp.displayName))) for (var n = 0; n < comp.properties.numItems; n++) if (/level|niveau/i.test(String(comp.properties[n].displayName))) raw = comp.properties[n].getValue();
          }
        } catch (e) {}
        info.volumeRaw = raw;
        info.volumeDb = (typeof raw === 'number' && raw > 0) ? U.round(20 * Math.log(raw) / Math.LN10, 2) : null;
        clips.push(info);
      }
      out.push({ name: 'A' + (i + 1), label: String(t.name), muted: safe(function () { return t.isMuted(); }, null), locked: safe(function () { return t.isLocked(); }, null), clips: clips });
    }
    return { tracks: out, note: 'volumeDb suppose une valeur interne linéaire (1.0 = 0 dB). Mesure réelle : ppro_export_audio + media_loudness.' };
  };
})();
