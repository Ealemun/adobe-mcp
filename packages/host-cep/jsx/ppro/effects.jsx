// Adobe MCP — Premiere Pro : effets, paramètres, images-clés, transformations, volume, transitions, Lumetri, stabilisation.
// API DOM « components » (TrackItem.components → Component → properties → ComponentParam) pour lire/écrire,
// API QE (non documentée) pour ajouter des effets et des transitions.
(function () {
  if (ADOBE_MCP.appName() !== 'premierepro') return;

  var U = ADOBE_MCP.util;
  var F = ADOBE_MCP.fns;
  var P = ADOBE_MCP.ppro;
  var safe = P.safe;

  // ---------------------------------------------------------------- noms (interface localisée)
  // Comparaison tolérante : minuscules, sans accents, sans ponctuation.
  function norm(s) {
    s = String(s || '').toLowerCase();
    s = s.replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u').replace(/ç/g, 'c');
    return s.replace(/[^a-z0-9]+/g, '');
  }
  // Alias anglais → variantes (FR) pour les effets et paramètres les plus utilisés.
  var ALIASES = {
    'motion': ['trajectoire'], 'opacity': ['opacite'], 'position': [], 'scale': ['echelle'], 'rotation': [], 'anchorpoint': ['pointdancrage'],
    'uniformscale': ['echelleuniforme'], 'volume': [], 'level': ['niveau'],
    'lumetricolor': ['couleurlumetri', 'lumetri'], 'gaussianblur': ['flougaussien'], 'warpstabilizer': ['stabilisateurdedeformation'],
    'crossdissolve': ['fonduenchaine'], 'dipto black': ['fondu au noir'], 'diptoblack': ['plongeeaunoir', 'fonduaunoir'], 'diptowhite': ['plongeeaublanc'],
    'constantpower': ['puissanceconstante'], 'morphcut': [], 'directionalblur': ['floudirectionnel'], 'transform': ['transformation'],
    'exposure': ['exposition'], 'contrast': ['contraste'], 'highlights': ['hauteslumieres', 'tonsclairs'], 'shadows': ['tonsfonces', 'ombres'],
    'whites': ['blancs'], 'blacks': ['noirs'], 'temperature': [], 'tint': ['teinte'], 'saturation': [], 'vibrance': [], 'sharpen': ['nettete'],
    'blurriness': ['flou'], 'intensity': ['intensite'], 'fadedfilm': ['filmdelave'], 'amount': ['quantite']
  };
  function sameName(a, b) {
    var na = norm(a), nb = norm(b);
    if (na === nb) return true;
    var list = ALIASES[na] || [];
    for (var i = 0; i < list.length; i++) if (norm(list[i]) === nb) return true;
    var list2 = ALIASES[nb] || [];
    for (var j = 0; j < list2.length; j++) if (norm(list2[j]) === na) return true;
    return false;
  }
  function looseMatch(a, b) { var na = norm(a), nb = norm(b); return na.length >= 3 && (nb.indexOf(na) >= 0 || na.indexOf(nb) >= 0); }

  // ---------------------------------------------------------------- composants et paramètres
  function componentInfo(comp, idx) {
    return { index: idx, name: String(comp.displayName), matchName: safe(function () { return String(comp.matchName); }, null) };
  }
  function paramValue(prop) {
    var v = safe(function () { return prop.getValue(); }, undefined);
    if (v === undefined) v = safe(function () { return prop.getColorValue(); }, null);
    if (v && typeof v === 'object' && !(v instanceof Array)) v = String(v);
    return v;
  }
  function paramInfo(prop, idx, clip) {
    var info = { index: idx, name: String(prop.displayName), value: paramValue(prop) };
    var varying = safe(function () { return prop.isTimeVarying(); }, false);
    if (varying) {
      var keys = safe(function () { return prop.getKeys(); }, []) || [], out = [];
      for (var k = 0; k < keys.length && k < 200; k++) {
        var kt = keys[k];
        out.push({ time: U.round(keyToSeqTime(clip, kt.seconds), 4), clipTime: U.round(kt.seconds, 4), value: safe(function () { return prop.getValueAtKey(kt); }, null) });
      }
      info.keyframes = out;
    }
    return info;
  }
  // Les temps d'images-clés sont relatifs à la source du clip (point d'entrée) : conversion ↔ temps de séquence.
  function seqToKeyTime(clip, seqSeconds) { return clip.inPoint.seconds + (Number(seqSeconds) - clip.start.seconds); }
  function keyToSeqTime(clip, keySeconds) { return clip.start.seconds + (Number(keySeconds) - clip.inPoint.seconds); }

  // Composant d'un clip par nom (tolérant), index numérique ou matchName.
  function findComponent(clip, ref) {
    var comps = clip.components, i;
    if (!comps) throw ADOBE_MCP.err('UNSUPPORTED', 'TrackItem.components indisponible sur cette version');
    if (typeof ref === 'number') { if (ref < 0 || ref >= comps.numItems) throw ADOBE_MCP.err('EFFECT_NOT_FOUND', 'Index d\'effet hors limites : ' + ref); return comps[ref]; }
    for (i = 0; i < comps.numItems; i++) if (sameName(comps[i].displayName, ref) || safe(function () { return String(comps[i].matchName) === String(ref); }, false)) return comps[i];
    for (i = 0; i < comps.numItems; i++) if (looseMatch(ref, comps[i].displayName)) return comps[i];
    return null;
  }
  function requireComponent(clip, ref) {
    var c = findComponent(clip, ref);
    if (!c) {
      var names = [];
      for (var i = 0; i < clip.components.numItems; i++) names.push(String(clip.components[i].displayName));
      throw ADOBE_MCP.err('EFFECT_NOT_FOUND', 'Effet « ' + ref + ' » absent du clip. Effets présents : ' + names.join(', '));
    }
    return c;
  }
  function findParam(comp, ref) {
    var props = comp.properties, i;
    if (typeof ref === 'number') return props[ref];
    for (i = 0; i < props.numItems; i++) if (sameName(props[i].displayName, ref)) return props[i];
    for (i = 0; i < props.numItems; i++) if (looseMatch(ref, props[i].displayName)) return props[i];
    return null;
  }
  function requireParam(comp, ref) {
    var p = findParam(comp, ref);
    if (!p) {
      var names = [];
      for (var i = 0; i < comp.properties.numItems; i++) names.push(String(comp.properties[i].displayName));
      throw ADOBE_MCP.err('PARAM_NOT_FOUND', 'Paramètre « ' + ref + ' » absent de ' + comp.displayName + '. Paramètres : ' + names.join(', '));
    }
    return p;
  }
  // Écrit une valeur : nombre, booléen, chaîne, tableau ([x,y]) ; une couleur se donne en [r,g,b] ou [a,r,g,b] (0-255).
  function setParamValue(prop, value) {
    var isColor = value instanceof Array && (value.length === 3 || value.length === 4) && typeof prop.setColorValue === 'function' && safe(function () { return prop.getValue(); }, undefined) === undefined;
    if (isColor) {
      var c = value.length === 3 ? [255].concat(value) : value;
      prop.setColorValue(c[0], c[1], c[2], c[3], true);
      return;
    }
    prop.setValue(value, true);
  }

  // Élément QE correspondant à un clip DOM (même piste, même début en ticks).
  function qeItemFor(seq, found) {
    var qs = P.qeSequence(seq);
    var qt = found.trackInfo.kind === 'video' ? qs.getVideoTrackAt(found.trackInfo.index) : qs.getAudioTrackAt(found.trackInfo.index);
    if (!qt) throw ADOBE_MCP.err('QE_ERROR', 'Piste QE introuvable : ' + found.label);
    var startTicks = String(found.clip.start.ticks), n = safe(function () { return qt.numItems; }, 0);
    for (var i = 0; i < n; i++) {
      var it = qt.getItemAt(i);
      if (!it) continue;
      var t = safe(function () { return String(it.start.ticks); }, '');
      if (t === startTicks && safe(function () { return String(it.type); }, 'Clip') !== 'Empty') return it;
    }
    throw ADOBE_MCP.err('QE_ERROR', 'Clip QE introuvable pour ' + found.label + '/' + found.index);
  }
  // Effet QE par nom (tolérant aux noms localisés).
  function qeEffectByName(name, kind) {
    var fnName = kind === 'audio' ? 'getAudioEffectByName' : 'getVideoEffectByName';
    var lister = kind === 'audio' ? 'getAudioEffectList' : 'getVideoEffectList';
    var fx = safe(function () { return qe.project[fnName](String(name)); }, null);
    if (fx) return fx;
    var list = safe(function () { return qe.project[lister](); }, null) || [];
    for (var pass = 0; pass < 2 && !fx; pass++) {
      for (var i = 0; i < list.length; i++) {
        var n = String(list[i]);
        if (pass === 0 ? sameName(n, name) : looseMatch(name, n)) { fx = safe(function () { return qe.project[fnName](n); }, null); if (fx) break; }
      }
    }
    if (!fx) throw ADOBE_MCP.err('EFFECT_NOT_FOUND', 'Effet introuvable : ' + name + ' (voir ppro_list_effects pour les noms exacts de cette version)');
    return fx;
  }

  // ---------------------------------------------------------------- fonctions appelables
  F['effects.list'] = function (a) {
    P.qeSequence(P.requireSequence(a.sequenceId));
    var kind = a.type || 'video', names;
    if (kind === 'transition') names = safe(function () { return qe.project.getVideoTransitionList(); }, null);
    else if (kind === 'audioTransition') names = safe(function () { return qe.project.getAudioTransitionList(); }, null);
    else if (kind === 'audio') names = safe(function () { return qe.project.getAudioEffectList(); }, null);
    else names = safe(function () { return qe.project.getVideoEffectList(); }, null);
    if (!names) throw ADOBE_MCP.err('UNSUPPORTED', 'Liste des effets indisponible (QE) sur cette version');
    var out = [], re = a.search ? new RegExp(String(a.search), 'i') : null;
    for (var i = 0; i < names.length; i++) { var n = String(names[i]); if (!re || re.test(n) || re.test(norm(n))) out.push(n); }
    return { type: kind, count: out.length, names: out };
  };

  F['effects.getClip'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId), clip = f.clip, out = [];
    if (!clip.components) throw ADOBE_MCP.err('UNSUPPORTED', 'TrackItem.components indisponible sur cette version');
    for (var i = 0; i < clip.components.numItems; i++) {
      var comp = clip.components[i], info = componentInfo(comp, i), params = [];
      for (var j = 0; j < comp.properties.numItems; j++) params.push(paramInfo(comp.properties[j], j, clip));
      info.params = params;
      out.push(info);
    }
    return { clip: P.clipInfo(clip, f.label, f.index), effects: out, note: 'Temps des images-clés : "time" en secondes de séquence, "clipTime" en temps source du clip.' };
  };

  F['effects.apply'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), found = P.findClips(seq, a.clipIds), applied = [];
    for (var i = 0; i < found.length; i++) {
      var f = found[i], kind = f.trackInfo.kind;
      var existing = findComponent(f.clip, a.effect);
      if (!existing || a.allowDuplicate === true) {
        var it = qeItemFor(seq, f), fx = qeEffectByName(a.effect, kind);
        var ok = safe(function () { return kind === 'audio' ? it.addAudioEffect(fx) : it.addVideoEffect(fx); }, false);
        if (ok === false) throw ADOBE_MCP.err('EFFECT_FAILED', 'Ajout de l\'effet refusé sur ' + f.label + '/' + f.index);
        existing = findComponent(f.clip, a.effect) || f.clip.components[f.clip.components.numItems - 1];
      }
      var set = {};
      if (a.params) for (var k in a.params) if (a.params.hasOwnProperty(k)) { setParamValue(requireParam(existing, k), a.params[k]); set[k] = paramValue(requireParam(existing, k)); }
      applied.push({ clip: f.label + '/' + f.index, effect: String(existing.displayName), params: set });
    }
    return { applied: applied };
  };

  F['effects.remove'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId);
    var comp = requireComponent(f.clip, a.effect), name = String(comp.displayName);
    if (typeof comp.remove !== 'function') throw ADOBE_MCP.err('UNSUPPORTED', 'Suppression d\'effet indisponible sur cette version (supprimer dans Options d\'effet)');
    comp.remove();
    return { removed: name, remaining: f.clip.components.numItems };
  };

  // Valeurs fixes ou image-clé (at = secondes de séquence) sur un effet existant.
  F['effects.setParams'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId), comp = requireComponent(f.clip, a.effect), out = {};
    for (var k in a.params) if (a.params.hasOwnProperty(k)) {
      var prop = requireParam(comp, k);
      if (a.at !== undefined && a.at !== null) {
        var t = new Time(); t.seconds = seqToKeyTime(f.clip, a.at);
        if (!safe(function () { return prop.isTimeVarying(); }, false)) prop.setTimeVarying(true);
        safe(function () { prop.addKey(t); });
        prop.setValueAtKey(t, a.params[k], true);
        out[k] = safe(function () { return prop.getValueAtKey(t); }, null);
      } else {
        setParamValue(prop, a.params[k]);
        out[k] = paramValue(prop);
      }
    }
    return { clip: f.label + '/' + f.index, effect: String(comp.displayName), params: out, at: a.at };
  };

  // Animation complète d'un paramètre : keyframes[{t, value, interp?}] ; replace=true efface les clés existantes.
  P.setKeyframes = function (seq, f, effectRef, paramRef, keyframes, replace) {
    var comp = requireComponent(f.clip, effectRef), prop = requireParam(comp, paramRef);
    if (!safe(function () { return prop.areKeyframesSupported(); }, true)) throw ADOBE_MCP.err('UNSUPPORTED', 'Pas d\'images-clés possibles sur ' + prop.displayName);
    if (replace !== false) {
      var keys = safe(function () { return prop.getKeys(); }, []) || [];
      for (var r = keys.length - 1; r >= 0; r--) safe(function () { prop.removeKey(keys[r]); });
    }
    if (!safe(function () { return prop.isTimeVarying(); }, false)) prop.setTimeVarying(true);
    var written = [];
    for (var i = 0; i < keyframes.length; i++) {
      var kf = keyframes[i], t = new Time();
      t.seconds = seqToKeyTime(f.clip, kf.t);
      safe(function () { prop.addKey(t); });
      prop.setValueAtKey(t, kf.value, true);
      if (kf.interp && typeof prop.setInterpolationTypeAtKey === 'function') {
        var mode = { linear: 0, hold: 3, bezier: 4, ease: 4 }[String(kf.interp).toLowerCase()];
        if (mode !== undefined) safe(function () { prop.setInterpolationTypeAtKey(t, mode, true); });
      }
      written.push({ t: U.round(kf.t, 4), value: safe(function () { return prop.getValueAtKey(t); }, kf.value) });
    }
    return { clip: f.label + '/' + f.index, effect: String(comp.displayName), param: String(prop.displayName), keyframes: written };
  };
  F['effects.setKeyframes'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId);
    if (!a.keyframes || !a.keyframes.length) throw ADOBE_MCP.err('BAD_ARGS', 'keyframes[] requis');
    return P.setKeyframes(seq, f, a.effect, a.param, a.keyframes, a.replace);
  };
  F['effects.clearKeyframes'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId), comp = requireComponent(f.clip, a.effect), prop = requireParam(comp, a.param);
    var keys = safe(function () { return prop.getKeys(); }, []) || [], n = keys.length;
    for (var r = keys.length - 1; r >= 0; r--) safe(function () { prop.removeKey(keys[r]); });
    safe(function () { prop.setTimeVarying(false); });
    return { removed: n, param: String(prop.displayName) };
  };

  // Raccourci Trajectoire/Opacité : scale (%), position ([x,y] en pixels ou normalisé 0..1), rotation (°), anchor, opacity (%).
  // at : secondes de séquence → image-clé ; sinon valeur fixe.
  F['effects.setTransform'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), found = P.findClips(seq, a.clipIds), size = P.seqSize(seq), out = [];
    function write(prop, value) {
      if (a.at !== undefined && a.at !== null) {
        var t = new Time(); t.seconds = seqToKeyTime(cur.clip, a.at);
        if (!safe(function () { return prop.isTimeVarying(); }, false)) prop.setTimeVarying(true);
        safe(function () { prop.addKey(t); }); prop.setValueAtKey(t, value, true);
      } else prop.setValue(value, true);
    }
    var cur;
    for (var i = 0; i < found.length; i++) {
      cur = found[i];
      var motion = requireComponent(cur.clip, 'Motion'), res = { clip: cur.label + '/' + cur.index };
      if (a.scale !== undefined) { var us = findParam(motion, 'Uniform Scale'); if (us && paramValue(us) === false) safe(function () { us.setValue(true, true); }); write(requireParam(motion, 'Scale'), Number(a.scale)); res.scale = Number(a.scale); }
      if (a.position) {
        var px = a.positionUnits === 'normalized' ? a.position : [Number(a.position[0]) / (size.width || 1920), Number(a.position[1]) / (size.height || 1080)];
        write(requireParam(motion, 'Position'), [px[0], px[1]]); res.position = px;
      }
      if (a.rotation !== undefined) { write(requireParam(motion, 'Rotation'), Number(a.rotation)); res.rotation = Number(a.rotation); }
      if (a.anchor) { var ap = a.positionUnits === 'normalized' ? a.anchor : [Number(a.anchor[0]) / (size.width || 1920), Number(a.anchor[1]) / (size.height || 1080)]; write(requireParam(motion, 'Anchor Point'), [ap[0], ap[1]]); res.anchor = ap; }
      if (a.opacity !== undefined) { var op = requireComponent(cur.clip, 'Opacity'); write(requireParam(op, 'Opacity'), Number(a.opacity)); res.opacity = Number(a.opacity); }
      out.push(res);
    }
    return { applied: out, at: a.at, frameSize: size };
  };

  // Punch-in : zooms par images-clés sur Échelle (et Position optionnelle), retour à 100 % à la fin de chaque plage.
  // ease : "cut" (saut) ou "ramp" (rampe de rampMs). Les plages sont en secondes de séquence.
  F['effects.punchIn'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId), size = P.seqSize(seq);
    if (!a.ranges || !a.ranges.length) throw ADOBE_MCP.err('BAD_ARGS', 'ranges[{start,end,scale}] requis');
    var ft = P.frameTicks(seq) / ADOBE_MCP.TICKS_PER_SECOND, ramp = a.ease === 'ramp' ? Number(a.rampMs || 300) / 1000 : ft;
    var motion = requireComponent(f.clip, 'Motion'), baseScale = Number(paramValue(requireParam(motion, 'Scale')) || 100);
    var basePos = paramValue(requireParam(motion, 'Position')) || [0.5, 0.5];
    var scaleKeys = [], posKeys = [];
    var ranges = a.ranges.slice(0);
    ranges.sort(function (x, y) { return x.start - y.start; });
    for (var i = 0; i < ranges.length; i++) {
      var r = ranges[i], s = Number(r.start), e = Number(r.end), sc = Number(r.scale || 112);
      scaleKeys.push({ t: s - ramp, value: baseScale }, { t: s, value: sc }, { t: e, value: sc }, { t: e + ramp, value: baseScale });
      if (r.position) {
        var p = a.positionUnits === 'normalized' ? r.position : [Number(r.position[0]) / (size.width || 1920), Number(r.position[1]) / (size.height || 1080)];
        posKeys.push({ t: s - ramp, value: basePos }, { t: s, value: p }, { t: e, value: p }, { t: e + ramp, value: basePos });
      }
    }
    var res = { scale: P.setKeyframes(seq, f, 'Motion', 'Scale', scaleKeys, a.replace !== false) };
    if (posKeys.length) res.position = P.setKeyframes(seq, f, 'Motion', 'Position', posKeys, a.replace !== false);
    return res;
  };

  // Volume d'un clip audio (dB) : paramètre Niveau de l'effet Volume (valeur linéaire : 0 dB = 1.0).
  F['audio.setClipVolume'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), found = P.findClips(seq, a.clipIds), out = [];
    for (var i = 0; i < found.length; i++) {
      var f = found[i], vol = findComponent(f.clip, 'Volume');
      if (!vol) { out.push({ clip: f.label + '/' + f.index, error: 'pas d\'effet Volume (clip vidéo ?)' }); continue; }
      var lvl = requireParam(vol, 'Level'), before = paramValue(lvl);
      var lin = Math.pow(10, Number(a.db) / 20);
      if (a.at !== undefined && a.at !== null) {
        var t = new Time(); t.seconds = seqToKeyTime(f.clip, a.at);
        if (!safe(function () { return lvl.isTimeVarying(); }, false)) lvl.setTimeVarying(true);
        safe(function () { lvl.addKey(t); }); lvl.setValueAtKey(t, lin, true);
      } else lvl.setValue(lin, true);
      out.push({ clip: f.label + '/' + f.index, db: Number(a.db), rawBefore: before, rawAfter: paramValue(lvl) });
    }
    return { applied: out, note: 'rawBefore/rawAfter = valeur interne du paramètre Niveau (1.0 = 0 dB si l\'échelle est linéaire). Vérifier à l\'oreille ou avec media_loudness.' };
  };

  // Automation de volume : keyframes[{t, db}]
  F['audio.setVolumeKeyframes'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId), kfs = [];
    if (!a.keyframes || !a.keyframes.length) throw ADOBE_MCP.err('BAD_ARGS', 'keyframes[{t, db}] requis');
    for (var i = 0; i < a.keyframes.length; i++) kfs.push({ t: Number(a.keyframes[i].t), value: Math.pow(10, Number(a.keyframes[i].db) / 20), interp: a.keyframes[i].interp });
    return P.setKeyframes(seq, f, 'Volume', 'Level', kfs, a.replace !== false);
  };

  // Transition sur un bord de clip (QE). side : "in" | "out" | "both" ; duration en secondes.
  F['effects.addTransition'] = function (a) {
    var seq = P.requireSequence(a.sequenceId), f = P.findClip(seq, a.clipId), kind = f.trackInfo.kind;
    var name = a.name || (kind === 'audio' ? 'Constant Power' : 'Cross Dissolve');
    var fnName = kind === 'audio' ? 'getAudioTransitionByName' : 'getVideoTransitionByName';
    var tr = safe(function () { return qe.project[fnName](String(name)); }, null);
    if (!tr) {
      var list = safe(function () { return kind === 'audio' ? qe.project.getAudioTransitionList() : qe.project.getVideoTransitionList(); }, null) || [];
      for (var i = 0; i < list.length && !tr; i++) if (sameName(list[i], name) || looseMatch(name, list[i])) tr = safe(function () { return qe.project[fnName](String(list[i])); }, null);
    }
    if (!tr) throw ADOBE_MCP.err('EFFECT_NOT_FOUND', 'Transition introuvable : ' + name + ' (voir ppro_list_effects type "transition")');
    var it = qeItemFor(seq, f), track = f.trackInfo.track;
    var dur = Number(a.duration || 1), frames = Math.max(1, Math.round(dur * P.seqFps(seq)));
    var playhead = P.savePlayhead(seq);
    var tcDur = safe(function () { return String(P.timecodeAt(seq, dur).timecode); }, null);
    P.restorePlayhead(seq, playhead);
    var sides = a.side === 'both' ? ['in', 'out'] : [a.side || 'in'], results = [];
    for (var s = 0; s < sides.length; s++) {
      var atStart = sides[s] === 'in', before = safe(function () { return track.transitions.numItems; }, 0), ok = false;
      // Signatures QE connues ; on s'arrête à la première qui ajoute une transition.
      var tries = [
        function () { return it.addTransition(tr, atStart, tcDur, '00:00:00:00', 0.5, false, false); },
        function () { return it.addTransition(tr, atStart, tcDur); },
        function () { return it.addTransition(tr, atStart); }
      ];
      for (var k = 0; k < tries.length && !ok; k++) {
        safe(tries[k]);
        if (safe(function () { return track.transitions.numItems; }, 0) > before) ok = true;
      }
      results.push({ side: sides[s], added: ok });
    }
    return { clip: f.label + '/' + f.index, transition: String(name), durationFrames: frames, results: results, transitionsOnTrack: safe(function () { return track.transitions.numItems; }, null) };
  };

  // Lumetri : applique l'effet si absent et règle la Correction de base (noms anglais, traduits via alias).
  F['effects.setLumetri'] = function (a) {
    var params = {}, basic = a.basic || {}, k;
    for (k in basic) if (basic.hasOwnProperty(k)) params[k] = basic[k];
    var creative = a.creative || {};
    for (k in creative) if (creative.hasOwnProperty(k)) params[k] = creative[k];
    return F['effects.apply']({ clipIds: a.clipIds, effect: 'Lumetri Color', params: params, sequenceId: a.sequenceId });
  };

  // Warp Stabilizer : l'ajout lance l'analyse dans Premiere.
  F['effects.stabilize'] = function (a) {
    var r = F['effects.apply']({ clipIds: a.clipIds, effect: 'Warp Stabilizer', sequenceId: a.sequenceId });
    r.note = 'L\'analyse démarre dans Premiere (bannière bleue) ; ne pas modifier le clip pendant. Régler Lissage/Méthode avec ppro_set_effect_params une fois l\'analyse finie.';
    return r;
  };
})();
