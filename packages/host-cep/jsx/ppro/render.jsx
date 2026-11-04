// Adobe MCP — Premiere Pro : presets d'export (.epr), export audio, export d'une plage ou de la séquence.
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var P = ADOBE_MCP.ppro;
  var safe = P.safe;

  var presetCache = null; // scan des .epr, fait une fois par session Premiere

  // Dossiers où chercher des presets : Premiere et Media Encoder (systempresets), presets utilisateur.
  function presetRoots() {
    var roots = [], i, j;
    var appPath = safe(function () { return String(app.path); }, '');
    var appDir = appPath ? new File(appPath).parent : null; // Windows : dossier de l'exe ; macOS : dossier du bundle .app
    if (appPath) roots.push(appPath + '/Contents/MediaIO/systempresets'); // macOS : app.path = bundle
    if (appDir) {
      roots.push(appDir.fsName + '/MediaIO/systempresets');
      if (appDir.parent) roots.push(appDir.parent.fsName + '/MediaIO/systempresets');
    }
    // Media Encoder : même dossier parent que Premiere (Program Files\Adobe\… ou /Applications)
    var adobeDir = appDir && appDir.parent ? appDir.parent : null;
    if (adobeDir && adobeDir.exists) {
      var subs = safe(function () { return adobeDir.getFiles(); }, []);
      for (i = 0; i < subs.length; i++) if (subs[i] instanceof Folder && /Media Encoder/i.test(subs[i].name)) {
        roots.push(subs[i].fsName + '/MediaIO/systempresets');
        var inner = safe(function () { return subs[i].getFiles(); }, []);
        for (j = 0; j < inner.length; j++) if (inner[j] instanceof Folder && /\.app$/i.test(inner[j].name)) roots.push(inner[j].fsName + '/Contents/MediaIO/systempresets');
      }
    }
    var docs = Folder.myDocuments.fsName + '/Adobe/Adobe Media Encoder';
    var vers = safe(function () { return new Folder(docs).getFiles(); }, []);
    for (i = 0; i < vers.length; i++) if (vers[i] instanceof Folder) roots.push(vers[i].fsName + '/Presets');
    return roots;
  }

  // Lit les premiers Ko d'un .epr pour en extraire le nom affiché et le format.
  function readPresetHeader(f) {
    var name = null, exporter = null;
    try {
      f.encoding = 'UTF-8'; f.open('r');
      var head = f.read(16000);
      f.close();
      var m = /<PresetName[^>]*>([^<]*)<\/PresetName>/i.exec(head);
      if (m) name = m[1];
      var m2 = /<ExporterName[^>]*>([^<]*)<\/ExporterName>/i.exec(head) || /<Name[^>]*>([^<]*)<\/Name>/i.exec(head);
      if (m2) exporter = m2[1];
    } catch (e) {}
    return { name: name, exporter: exporter };
  }

  function scanPresets() {
    if (presetCache) return presetCache;
    var roots = presetRoots(), out = [], seen = {};
    function walk(folder, depth, origin) {
      if (depth > 4) return;
      var files = safe(function () { return folder.getFiles(); }, []);
      for (var i = 0; i < files.length; i++) {
        var f = files[i];
        if (f instanceof Folder) walk(f, depth + 1, origin);
        else if (/\.epr$/i.test(f.name) && !seen[f.fsName]) {
          seen[f.fsName] = true;
          out.push({ name: decodeURI(f.name).replace(/\.epr$/i, ''), folder: String(folder.name), path: f.fsName, origin: origin });
        }
      }
    }
    for (var r = 0; r < roots.length; r++) {
      var fo = new Folder(roots[r]);
      if (fo.exists) walk(fo, 0, /Documents/i.test(roots[r]) ? 'user' : 'system');
    }
    presetCache = out;
    return out;
  }

  // Liste des presets, filtrée par expression régulière (nom de fichier, dossier). details=true lit l'en-tête XML
  // (nom affiché, exporter) des presets renvoyés : plus lent, à réserver à une liste courte.
  F['export.listPresets'] = function (a) {
    if (a.refresh === true) presetCache = null;
    var all = scanPresets(), out = [];
    var re = a.search ? new RegExp(String(a.search), 'i') : null;
    for (var i = 0; i < all.length; i++) {
      var p = all[i];
      if (!re || re.test(p.name) || re.test(p.folder) || re.test(p.path)) out.push(p);
    }
    out = out.slice(0, Number(a.limit || 200));
    if (a.details === true) for (var k = 0; k < out.length && k < 50; k++) {
      var h = readPresetHeader(new File(out[k].path));
      out[k].displayName = h.name; out[k].exporter = h.exporter;
    }
    return { count: out.length, roots: presetRoots(), presets: out };
  };

  // Choisit un preset : chemin donné, nom (regex) ou mot-clé par défaut.
  function resolvePreset(spec, dflt) {
    if (spec && U.fileExists(spec)) return String(new File(spec).fsName);
    var re = new RegExp(String(spec || dflt), 'i'), all = scanPresets(), best = null;
    for (var i = 0; i < all.length; i++) {
      var p = all[i];
      if (re.test(p.name) || re.test(p.folder) || re.test(p.path)) {
        // Préférence : presets utilisateur, puis 48 kHz, puis mono 16 bits pour la transcription.
        var score = (p.origin === 'user' ? 10 : 0) + (/48 ?k/i.test(p.name) ? 2 : 0) + (/mono/i.test(p.name) ? 1 : 0);
        if (!best || score > best.score) best = { p: p, score: score };
      }
    }
    if (!best) throw ADOBE_MCP.err('PRESET_NOT_FOUND', 'Aucun preset d\'export ne correspond à « ' + (spec || dflt) + ' ». Lister avec ppro_list_export_presets, ou donner le chemin d\'un .epr.');
    return best.p.path;
  }

  // Export synchrone (bloque Premiere) ou via la file Media Encoder (asynchrone).
  // workArea : "entire" | "inout" | [start,end]
  function exportSequence(seq, outPath, presetPath, range, queue, tracks) {
    var workAreaType = 0, prevIn = null, prevOut = null;
    if (range && range.length === 2) {
      prevIn = safe(function () { return String(seq.getInPointAsTime().ticks); }, null);
      prevOut = safe(function () { return String(seq.getOutPointAsTime().ticks); }, null);
      seq.setInPoint(P.snap(seq, Number(range[0])).ticks);
      seq.setOutPoint(P.snap(seq, Number(range[1])).ticks);
      workAreaType = 1;
    } else if (range === 'inout') workAreaType = 1;
    // Pistes : on coupe le son / la vue des pistes non demandées le temps de l'export.
    var muted = [];
    if (tracks && tracks !== 'all') {
      var sel = P.parseTracks(tracks, seq), all = P.allTracks(seq);
      for (var k = 0; k < all.length; k++) {
        var ti = all[k], idxs = ti.kind === 'video' ? sel.video : sel.audio, wanted = false;
        for (var q = 0; q < idxs.length; q++) if (idxs[q] === ti.index) wanted = true;
        if (!wanted && !safe(function () { return ti.track.isMuted(); }, false)) { safe(function () { ti.track.setMute(1); }); muted.push(ti.track); }
      }
    }
    // Extension du fichier produit, d'après le preset (QE) ; Premiere l'impose de toute façon.
    var ext = safe(function () { return String(P.qeSequence(seq).getExportFileExtension(presetPath)); }, '').replace(/^\./, '');
    if (ext && !new RegExp('\\.' + ext + '$', 'i').test(outPath)) outPath = outPath.replace(/\.[A-Za-z0-9]{2,4}$/, '') + '.' + ext;
    var result = {};
    try {
      if (queue === 'ame') {
        if (!app.encoder || typeof app.encoder.encodeSequence !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Media Encoder indisponible (app.encoder)');
        safe(function () { app.encoder.launchEncoder(); });
        var jobId = app.encoder.encodeSequence(seq, outPath, presetPath, workAreaType, 1, true);
        result = { queued: true, jobId: String(jobId), path: outPath, note: 'Rendu lancé dans Media Encoder ; le fichier apparaît à la fin du rendu.' };
      } else {
        if (typeof seq.exportAsMediaDirect !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'exportAsMediaDirect indisponible');
        var r = seq.exportAsMediaDirect(outPath, presetPath, workAreaType);
        var f = U.waitForFile(outPath, 15000);
        if (!f) throw ADOBE_MCP.err('EXPORT_FAILED', 'Fichier non produit : ' + outPath, String(r));
        result = { queued: false, path: f.fsName, bytes: f.length, status: String(r) };
      }
    } finally {
      for (var m = 0; m < muted.length; m++) safe(function () { muted[m].setMute(0); });
      if (prevIn && prevOut) { safe(function () { seq.setInPoint(prevIn); }); safe(function () { seq.setOutPoint(prevOut); }); }
    }
    result.preset = presetPath;
    return result;
  }

  // Audio de la séquence (ou d'une plage, ou de certaines pistes) en WAV, pour analyse (silences, niveaux, transcription).
  F['export.audio'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    var preset = resolvePreset(a.preset, 'wav|waveform');
    var path = U.outPath(a.path || (U.tempDir() + '/audio_' + U.stamp() + '.wav'));
    if (!/\.wav$/i.test(path)) path += '.wav';
    var r = exportSequence(seq, path, preset, a.range, null, a.tracks);
    r.range = a.range || 'entire'; r.tracks = a.tracks || 'all';
    return r;
  };

  // Rendu d'une plage ou de la séquence entière avec un preset (.epr ou nom/regex).
  F['export.render'] = function (a) {
    var seq = P.requireSequence(a.sequenceId);
    if (!a.preset) throw ADOBE_MCP.err('BAD_ARGS', 'preset requis (chemin .epr, ou nom/regex : "H.264", "YouTube 1080p", "ProRes")');
    var preset = resolvePreset(a.preset, a.preset);
    var path = U.outPath(a.path || (P.workDir('exports') + '/' + String(seq.name).replace(/[^\w\-]+/g, '_') + '_' + U.stamp()));
    var r = exportSequence(seq, path, preset, a.range, a.queue, a.tracks);
    r.range = a.range || 'entire';
    return r;
  };
})();
