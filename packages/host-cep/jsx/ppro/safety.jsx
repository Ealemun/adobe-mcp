// Adobe MCP — Premiere Pro : sauvegardes de séquence (checkpoints) et interface.
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var P = ADOBE_MCP.ppro;

  var CKPT = /^__ckpt_(\d{8}-\d{6})(?:_([\w\-]*))?__(.*)$/;

  // Copie horodatée de la séquence dans le chutier _adobe-mcp ; la séquence de travail reste active.
  F['safety.checkpoint'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    var copy = P.cloneSequence(seq);
    var label = String(a.label || '').replace(/[^\w\-]+/g, '_').slice(0, 40);
    copy.name = '__ckpt_' + U.stamp() + (label ? '_' + label : '') + '__' + seq.name;
    try { var item = P.findProjectItemForSequence(copy); if (item) item.moveBin(P.findOrCreateBin('_adobe-mcp')); } catch (e) {}
    app.project.openSequence(seq.sequenceID);
    return { checkpointId: String(copy.sequenceID), checkpointName: String(copy.name), originalSequenceId: String(seq.sequenceID), originalName: String(seq.name) };
  };

  F['safety.listCheckpoints'] = function () {
    var p = P.requireProject(), out = [];
    for (var i = 0; i < p.sequences.numSequences; i++) {
      var s = p.sequences[i], m = CKPT.exec(String(s.name));
      if (m) out.push({ checkpointId: String(s.sequenceID), stamp: m[1], label: m[2] || '', originalName: m[3] });
    }
    out.sort(function (x, y) { return x.stamp < y.stamp ? -1 : x.stamp > y.stamp ? 1 : 0; });
    return out;
  };

  // Restaure : le clone du checkpoint reprend le nom de la séquence de travail, l'ancienne est renommée.
  F['safety.rewind'] = function (a) {
    if (!a.checkpointId) throw ADOBE_MCP.err('BAD_ARGS', 'checkpointId requis');
    var ck = P.requireSequence(a.checkpointId);
    var m = CKPT.exec(String(ck.name));
    var originalName = a.originalName || (m ? m[3] : String(ck.name));
    var p = P.requireProject(), current = null;
    for (var i = 0; i < p.sequences.numSequences; i++) if (String(p.sequences[i].name) === originalName && String(p.sequences[i].sequenceID) !== String(ck.sequenceID)) current = p.sequences[i];
    var restored = P.cloneSequence(ck);
    if (current) current.name = originalName + ' (remplacée ' + U.stamp() + ')';
    restored.name = originalName;
    try { var item = P.findProjectItemForSequence(restored); if (item) item.moveBin(app.project.rootItem); } catch (e) {}
    app.project.openSequence(restored.sequenceID);
    return { restoredSequenceId: String(restored.sequenceID), name: originalName, replacedSequenceId: current ? String(current.sequenceID) : null };
  };

  // Supprime les checkpoints les plus anciens, en garde `keep` (défaut 5). Les séquences « (remplacée …) » ne sont pas touchées.
  F['safety.pruneCheckpoints'] = function (a) {
    var p = P.requireProject(), list = F['safety.listCheckpoints'](), keep = a.keep === undefined ? 5 : Number(a.keep), removed = [];
    if (typeof p.deleteSequence !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Project.deleteSequence() indisponible : supprimer les checkpoints à la main dans le chutier _adobe-mcp');
    while (list.length > keep) {
      var ck = list.shift();
      var seq = P.requireSequence(ck.checkpointId);
      if (p.deleteSequence(seq)) removed.push(ck);
    }
    return { removed: removed, remaining: F['safety.listCheckpoints']() };
  };

  F['ui.alert'] = function (a) { alert(String(a.message || '')); return { shown: true }; };
})();
