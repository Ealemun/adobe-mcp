// Adobe MCP — point d'entrée ExtendScript (chargé par l'hôte via ScriptPath).
// ES3 uniquement : pas de let/const, pas de fonctions fléchées, pas de JSON natif.
#include "json2.js"

var ADOBE_MCP = ADOBE_MCP || {};
ADOBE_MCP.VERSION = '0.2.0';
ADOBE_MCP.fns = ADOBE_MCP.fns || {};
ADOBE_MCP.TICKS_PER_SECOND = 254016000000;

ADOBE_MCP.appName = function () {
  try { return String(BridgeTalk.appName); } catch (e) { return 'unknown'; } // "premierepro" | "aftereffects"
};

ADOBE_MCP.err = function (code, message, detail) {
  var e = new Error(message); e.code = code; e.detail = detail; return e;
};

ADOBE_MCP.normalizeError = function (e) {
  var out = { code: e && e.code ? e.code : 'JSX_ERROR', message: e && e.message ? String(e.message) : String(e) };
  if (e && e.detail !== undefined) out.detail = e.detail;
  if (e && e.line) out.line = e.line;
  return out;
};

ADOBE_MCP.capabilities = function () {
  var names = [];
  for (var k in ADOBE_MCP.fns) if (ADOBE_MCP.fns.hasOwnProperty(k)) names.push(k);
  names.sort();
  var version = '';
  try { version = String(app.version); } catch (e) {}
  return JSON.stringify({ app: ADOBE_MCP.appName(), version: version, lib: ADOBE_MCP.VERSION, fns: names });
};

// Appel générique : reçoit une chaîne JSON {fn, args}, renvoie une chaîne JSON {ok, data|error}.
ADOBE_MCP.call = function (reqJson) {
  var req;
  try { req = JSON.parse(reqJson); }
  catch (e) { return JSON.stringify({ ok: false, error: { code: 'BAD_REQUEST', message: 'Requête JSON invalide' } }); }
  try {
    var fn = ADOBE_MCP.fns[req.fn];
    if (!fn) throw ADOBE_MCP.err('UNKNOWN_FN', 'Fonction inconnue : ' + req.fn);
    var data = fn(req.args || {});
    return JSON.stringify({ ok: true, data: data === undefined ? null : data });
  } catch (e) {
    return JSON.stringify({ ok: false, error: ADOBE_MCP.normalizeError(e) });
  }
};

ADOBE_MCP.activeSequenceId = function () {
  try { return app.project.activeSequence ? String(app.project.activeSequence.sequenceID) : ''; } catch (e) { return ''; }
};

// Utilitaires communs
ADOBE_MCP.util = {
  round: function (x, d) { var p = Math.pow(10, d || 3); return Math.round(x * p) / p; },
  secondsToTicks: function (s) { return String(Math.round(s * ADOBE_MCP.TICKS_PER_SECOND)); },
  ticksToSeconds: function (t) { return Number(t) / ADOBE_MCP.TICKS_PER_SECOND; },
  pad2: function (n) { return (n < 10 ? '0' : '') + n; },
  fileExists: function (p) { return new File(p).exists; },
  // Chemin natif normalisé (séparateurs de l'OS) ; crée le dossier parent si besoin.
  outPath: function (p) { var f = new File(p); if (!f.parent.exists) f.parent.create(); return f.fsName; },
  // Attend qu'un fichier existe et que sa taille ne bouge plus (écriture terminée). Renvoie le File ou null.
  waitForFile: function (p, timeoutMs) {
    var waited = 0, last = -1, stable = 0, f;
    while (waited < (timeoutMs || 15000)) {
      f = new File(p);
      if (f.exists) {
        var len = f.length;
        if (len > 0 && len === last) { if (++stable >= 2) return f; } else stable = 0;
        last = len;
      }
      $.sleep(150); waited += 150;
    }
    f = new File(p);
    return f.exists && f.length > 0 ? f : null;
  },
  ensureFolder: function (p) { var f = new Folder(p); if (!f.exists) f.create(); return f; },
  // Dossier temporaire du projet : <Temp>/adobe-mcp
  tempDir: function () { var f = new Folder(Folder.temp.fsName + '/adobe-mcp'); if (!f.exists) f.create(); return f.fsName; },
  stamp: function () {
    var d = new Date();
    return d.getFullYear() + ADOBE_MCP.util.pad2(d.getMonth() + 1) + ADOBE_MCP.util.pad2(d.getDate()) + '-' +
      ADOBE_MCP.util.pad2(d.getHours()) + ADOBE_MCP.util.pad2(d.getMinutes()) + ADOBE_MCP.util.pad2(d.getSeconds());
  }
};

#include "ppro/core.jsx"
#include "ppro/project.jsx"
#include "ppro/edit.jsx"
#include "ppro/ranges.jsx"
#include "ppro/effects.jsx"
#include "ppro/insert.jsx"
#include "ppro/markers.jsx"
#include "ppro/export.jsx"
#include "ppro/render.jsx"
#include "ppro/safety.jsx"
#include "aeft.jsx"
