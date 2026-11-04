// Adobe MCP — Premiere Pro : Dynamic Link avec After Effects (import de compositions, remplacement d'un clip).
// L'API officielle Project.importAEComps(aepPath, compNames[], bin) crée des éléments liés (comme File > Adobe Dynamic Link).
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var P = ADOBE_MCP.ppro;
  var safe = P.safe;

  // Clips audio liés à un clip vidéo : même média, même début et même fin (à une image près).
  function linkedAudio(seq, found) {
    var out = [], eps = P.frameTicks(seq) / ADOBE_MCP.TICKS_PER_SECOND;
    var path = safe(function () { return String(found.clip.projectItem.getMediaPath()); }, null);
    var s = found.clip.start.seconds, e = found.clip.end.seconds;
    for (var i = 0; i < seq.audioTracks.numTracks; i++) {
      var t = seq.audioTracks[i];
      for (var j = 0; j < t.clips.numItems; j++) {
        var c = t.clips[j], cp = safe(function () { return String(c.projectItem.getMediaPath()); }, null);
        if (cp === path && Math.abs(c.start.seconds - s) <= eps && Math.abs(c.end.seconds - e) <= eps) out.push({ clip: c, label: 'A' + (i + 1), index: j, trackInfo: { track: t, label: 'A' + (i + 1), kind: 'audio', index: i } });
      }
    }
    return out;
  }

  // Tout ce qu'After Effects doit savoir pour recréer le clip dans une comp.
  F['dynamiclink.describeClip'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId), info = P.sequenceInfo(seq);
    var audio = linkedAudio(seq, f), audioLabels = [];
    for (var i = 0; i < audio.length; i++) audioLabels.push(audio[i].label + '/' + audio[i].index);
    var clip = P.clipInfo(f.clip, f.label, f.index);
    if (!clip.mediaPath) throw ADOBE_MCP.err('NO_MEDIA', 'Ce clip n\'a pas de fichier média (séquence imbriquée, titre, barres…) : impossible de le recréer dans After Effects');
    return { sequence: info, clip: clip, track: f.label, linkedAudio: audioLabels, projectDir: P.projectDir(), aepSuggested: P.workDir('ae') + '/' + String(P.requireProject().name).replace(/\.prproj$/i, '').replace(/[^\w\-]+/g, '_') + '_ae.aep' };
  };

  // Importe des compositions d'un .aep (lien dynamique) dans un chutier ; renvoie les éléments créés.
  F['dynamiclink.importComps'] = function (a) {
    var p = P.requireProject();
    if (!a.aepPath || !U.fileExists(a.aepPath)) throw ADOBE_MCP.err('FILE_NOT_FOUND', 'Projet After Effects introuvable : ' + a.aepPath);
    if (typeof p.importAEComps !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Project.importAEComps indisponible sur cette version');
    var bin = P.findOrCreateBin(String(a.bin || '_adobe-mcp/After Effects'));
    var before = {};
    for (var i = 0; i < bin.children.numItems; i++) before[safe(function () { return String(bin.children[i].nodeId); }, 'i' + i)] = true;
    var names = a.compNames && a.compNames.length ? a.compNames : null;
    var ok = names ? p.importAEComps(String(new File(a.aepPath).fsName), names, bin) : p.importAllAEComps(String(new File(a.aepPath).fsName), bin);
    var added = [];
    for (var j = 0; j < bin.children.numItems; j++) { var c = bin.children[j], id = safe(function () { return String(c.nodeId); }, 'i' + j); if (!before[id]) added.push(P.itemInfo(c, 0)); }
    // Si rien de nouveau n'apparaît, la comp était peut-être déjà importée : on la cherche par nom.
    if (!added.length && names) for (var k = 0; k < bin.children.numItems; k++) for (var n = 0; n < names.length; n++) if (String(bin.children[k].name) === String(names[n])) added.push(P.itemInfo(bin.children[k], 0));
    if (!added.length) throw ADOBE_MCP.err('IMPORT_FAILED', 'Aucune composition importée (ok=' + ok + '). Versions de Premiere et d\'After Effects identiques ? Noms de comps exacts ?');
    return { ok: ok !== false, bin: String(bin.name), imported: added };
  };

  // Remplace un clip de la timeline par une composition After Effects liée (vidéo + audio liés).
  F['dynamiclink.replaceClip'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId);
    var imported = F['dynamiclink.importComps']({ aepPath: a.aepPath, compNames: [a.compName], bin: a.bin });
    var item = P.findItemByNodeId(imported.imported[0].nodeId);
    if (!item) throw ADOBE_MCP.err('IMPORT_FAILED', 'Élément importé introuvable');
    var start = f.clip.start.seconds, end = f.clip.end.seconds, vTrack = f.trackInfo, audio = linkedAudio(seq, f);
    var aTrack = audio.length ? audio[0].trackInfo : null;
    // 1) retirer l'original (lift) et ses pistes audio liées
    var removed = [f.label + '/' + f.index];
    for (var i = 0; i < audio.length; i++) removed.push(audio[i].label + '/' + audio[i].index);
    if (safe(function () { return f.clip.remove(false, false); }, false) === false) throw ADOBE_MCP.err('REMOVE_FAILED', 'Impossible de retirer le clip original');
    for (var j = 0; j < audio.length; j++) safe(function () { audio[j].clip.remove(false, false); });
    // 2) poser la comp au même endroit
    var placed = P.placeClip(seq, { nodeId: imported.imported[0].nodeId, time: start, videoTrack: vTrack.label, audioTrack: aTrack ? aTrack.label : 'A1', mode: 'overwrite', includeAudio: audio.length > 0 });
    // 3) contrôle : la vidéo posée doit couvrir [start, end]
    var check = null;
    for (var k = 0; k < placed.added.length; k++) if (placed.added[k].id.charAt(0) === 'V') check = placed.added[k];
    var warn = [];
    if (!check) warn.push('Aucun clip vidéo posé : vérifier la timeline (ppro_rewind possible).');
    else if (Math.abs(check.end - end) > 0.05) warn.push('La comp ne couvre pas exactement la durée du clip (' + check.end + ' s au lieu de ' + U.round(end, 3) + ' s) : ajuster la durée de la comp dans After Effects.');
    return { replaced: removed, comp: String(item.name), placed: placed.added, warnings: warn, note: 'Si la lecture saccade : clic droit sur le clip > Rendu et remplacement. Modifier l\'original : clic droit > Modifier l\'original.' };
  };
})();
