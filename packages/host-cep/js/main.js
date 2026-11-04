/* Adobe MCP — panneau CEP.
 * Rôle unique : se connecter au serveur MCP local (WebSocket) et exécuter les
 * fonctions ExtendScript du dépôt (jsx/*.jsx) à la demande. Aucun code reçu par
 * le réseau n'est exécuté : seul le nom de fonction et ses arguments transitent.
 */
(function () {
  'use strict';

  var PROTOCOL = 1;
  var BRIDGE_VERSION = '0.1.0';
  var DEFAULT_PORT = 8765;
  var RECONNECT_MS = 3000;
  var PING_MS = 10000;

  var cs = new CSInterface();
  var env = cs.hostEnvironment || {};
  var appId = (env.appName || '').toUpperCase(); // "PPRO" | "AEFT"
  var app = appId === 'PPRO' ? 'ppro' : appId === 'AEFT' ? 'aeft' : 'unknown';
  var appVersion = env.appVersion || '?';

  var ws = null, pingTimer = null, reconnectTimer = null, manualPort = null, quietFail = 0;
  var $ = function (id) { return document.getElementById(id); };

  $('host').textContent = '— ' + (app === 'ppro' ? 'Premiere Pro' : app === 'aeft' ? 'After Effects' : appId) + ' ' + appVersion;
  $('reconnect').onclick = function () { connect(); };
  $('apply').onclick = function () { manualPort = parseInt($('port').value, 10) || null; connect(); };

  function log(msg, cls) {
    var el = $('log');
    var line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = new Date().toTimeString().slice(0, 8) + '  ' + msg;
    el.appendChild(line);
    while (el.childNodes.length > 200) el.removeChild(el.firstChild);
    el.scrollTop = el.scrollHeight;
  }
  function setStatus(text, state) { $('status').textContent = text; $('dot').className = 'dot ' + (state || ''); }

  // --- découverte du serveur : <USER_DATA>/adobe-mcp/bridge.json ---------------
  function readBridgeFile() {
    try {
      var base = cs.getSystemPath(SystemPath.USER_DATA); // %APPDATA% / ~/Library/Application Support
      var path = base + '/adobe-mcp/bridge.json';
      var r = window.cep.fs.readFile(path);
      if (r.err !== 0) return null;
      return JSON.parse(r.data);
    } catch (e) { return null; }
  }

  // --- ExtendScript -------------------------------------------------------------
  function evalJsx(code) {
    return new Promise(function (resolve, reject) {
      cs.evalScript(code, function (raw) {
        if (raw === 'EvalScript error.' || raw === undefined) return reject(new Error('EvalScript error (voir la console ExtendScript).'));
        resolve(raw);
      });
    });
  }
  function callJsx(req) {
    var code = 'ADOBE_MCP.call(' + JSON.stringify(JSON.stringify(req)) + ')';
    return evalJsx(code).then(function (raw) {
      try { return JSON.parse(raw); }
      catch (e) { return { ok: false, error: { code: 'BAD_JSON', message: 'Réponse ExtendScript illisible', detail: String(raw).slice(0, 500) } }; }
    });
  }
  function capabilities() {
    return evalJsx('ADOBE_MCP.capabilities()').then(function (raw) { try { return JSON.parse(raw); } catch (e) { return { fns: [] }; } });
  }

  // --- WebSocket ----------------------------------------------------------------
  function send(obj) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); }

  function connect() {
    clearTimeout(reconnectTimer); clearInterval(pingTimer);
    if (ws) { try { ws.onclose = null; ws.close(); } catch (e) {} ws = null; }

    var bridge = readBridgeFile();
    var port = manualPort || (bridge && bridge.port) || DEFAULT_PORT;
    var token = (bridge && bridge.token) || '';
    $('port').value = port;
    if (!bridge) log('Serveur MCP non lancé (pas de bridge.json). Lancez votre client MCP. Essai sur le port ' + port + '.', 'muted');
    else log('Serveur annoncé sur le port ' + port + ' (pid ' + bridge.pid + ', démarré ' + String(bridge.startedAt || '').replace('T', ' ').slice(0, 19) + ')', 'muted');

    setStatus('Connexion au serveur MCP (port ' + port + ')…', 'wait');
    try { ws = new WebSocket('ws://127.0.0.1:' + port); }
    catch (e) { setStatus('Impossible d\'ouvrir le WebSocket', 'ko'); scheduleReconnect(); return; }

    ws.onopen = function () {
      capabilities().then(function (caps) {
        send({ type: 'hello', protocol: PROTOCOL, token: token, app: app, appVersion: String(caps.version || appVersion),
               bridge: 'cep', bridgeVersion: BRIDGE_VERSION, os: navigator.platform, capabilities: caps.fns || [] });
      });
      pingTimer = setInterval(function () { send({ type: 'ping' }); }, PING_MS);
    };
    ws.onmessage = function (ev) {
      var msg; try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (msg.type === 'welcome') { quietFail = 0; setStatus('Connecté au serveur MCP (port ' + port + ')', 'ok'); log('connecté, id ' + msg.hostId); return; }
      if (msg.type === 'pong') return;
      if (msg.type === 'error') { setStatus('Refusé : ' + msg.message, 'ko'); log('erreur serveur : ' + msg.message); return; }
      if (msg.type === 'call') {
        var t0 = Date.now();
        log('→ ' + msg.fn);
        callJsx({ fn: msg.fn, args: msg.args || {} }).then(function (res) {
          res.type = 'result'; res.id = msg.id; res.durationMs = Date.now() - t0;
          send(res);
          log((res.ok ? '✓ ' : '✗ ') + msg.fn + ' (' + res.durationMs + ' ms)' + (res.ok ? '' : ' : ' + (res.error && res.error.message)));
        }, function (err) {
          send({ type: 'result', id: msg.id, ok: false, durationMs: Date.now() - t0,
                 error: { code: 'EVALSCRIPT_ERROR', message: err.message } });
          log('✗ ' + msg.fn + ' : ' + err.message);
        });
      }
    };
    ws.onerror = function () { /* onclose suit */ };
    ws.onclose = function () {
      var wasOpen = $('dot').className.indexOf('ok') >= 0;
      setStatus('Déconnecté — nouvelle tentative dans 3 s', 'ko');
      if (wasOpen) log('Connexion perdue (serveur MCP arrêté ?)');
      else if (!quietFail++) log('Aucun serveur sur le port ' + port + ' : le client MCP est-il ouvert ? (nouvel essai toutes les 3 s)');
      clearInterval(pingTimer); scheduleReconnect();
    };
  }
  function scheduleReconnect() { clearTimeout(reconnectTimer); reconnectTimer = setTimeout(connect, RECONNECT_MS); }

  // Signale au serveur les changements de séquence active (polling léger)
  var lastSeq = null;
  setInterval(function () {
    if (!ws || ws.readyState !== 1 || app !== 'ppro') return;
    evalJsx('ADOBE_MCP.activeSequenceId()').then(function (id) {
      if (id !== lastSeq) { lastSeq = id; send({ type: 'event', name: 'sequence.activated', data: { id: id } }); }
    }).catch(function () {});
  }, 2000);

  connect();
})();
