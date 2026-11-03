# 02 — Protocole du pont (serveur MCP ↔ hôte Adobe)

Transport : WebSocket sur `ws://127.0.0.1:<port>`. Le **serveur MCP écoute**, chaque hôte (panneau CEP, plugin UXP, lanceur `AfterFX -r`) se connecte en client. Messages JSON, un objet par trame. Version du protocole : `1`.

## 1. Découverte

Au démarrage, `mcp-server` écrit `~/.adobe-mcp/bridge.json` :
```json
{ "protocol": 1, "port": 8765, "token": "b3f1…", "startedAt": "2026-11-03T20:00:00Z" }
```
Le panneau lit ce fichier (Node dans CEP, `fs` dans UXP via dossier plugin-data ou saisie manuelle du port/token dans l'UI), se connecte, et retente toutes les 3 s en cas d'échec.

## 2. Poignée de main

Hôte → serveur :
```json
{ "type": "hello", "protocol": 1, "token": "b3f1…",
  "app": "ppro", "appVersion": "25.6.0", "bridge": "cep", "bridgeVersion": "0.1.0",
  "os": "win32", "capabilities": ["project.get", "sequence.get", "edit.cutAt", "…"] }
```
Serveur → hôte :
```json
{ "type": "welcome", "hostId": "ppro-1", "serverVersion": "0.1.0" }
```
`capabilities` est la liste des `fn` que cet hôte sait exécuter : la lib JSX l'énumère dynamiquement (`Object.keys(ADOBE_MCP.fns)`) après détection de version. Le serveur MCP n'expose à l'agent que les tools dont la fonction est disponible sur au moins un hôte connecté (ou les expose avec un message d'indisponibilité explicite, au choix par config).

## 3. Appel

Serveur → hôte :
```json
{ "type": "call", "id": "c_0042", "fn": "edit.cutAt",
  "args": { "times": [12.4, 18.0], "tracks": "all", "includeAudio": true },
  "timeoutMs": 60000 }
```
Hôte → serveur (succès) :
```json
{ "type": "result", "id": "c_0042", "ok": true, "durationMs": 310,
  "data": { "cuts": 2, "affectedClips": ["V1/3", "A1/3"] } }
```
Hôte → serveur (erreur) :
```json
{ "type": "result", "id": "c_0042", "ok": false,
  "error": { "code": "NO_ACTIVE_SEQUENCE", "message": "Aucune séquence active", "detail": "…stack ExtendScript…" } }
```

Côté panneau, l'exécution est :
```js
csInterface.evalScript(`ADOBE_MCP.call(${JSON.stringify({fn, args})})`, raw => { /* JSON.parse(raw) → result */ })
```
et côté ExtendScript :
```js
ADOBE_MCP.call = function (req) {
  try { var fn = ADOBE_MCP.fns[req.fn]; if (!fn) throw errorOf("UNKNOWN_FN", req.fn);
        return JSON.stringify({ ok: true, data: fn(req.args || {}) }); }
  catch (e) { return JSON.stringify({ ok: false, error: normalize(e) }); }
};
```

## 4. Progression et gros résultats

- Appels longs (export, index de frames) : l'hôte peut émettre `{ "type": "progress", "id", "pct": 42, "message": "Export 42 %" }` ; le serveur MCP les relaie à l'agent via les notifications de progression MCP.
- Résultat > 900 Ko : l'hôte écrit le JSON dans `%TEMP%/adobe-mcp/<id>.json` et renvoie `{ "ok": true, "file": "…" }` ; le serveur lit le fichier et le supprime. Évite les limites de `evalScript`.
- Annulation : `{ "type": "cancel", "id" }` (best-effort ; ExtendScript n'est pas interruptible, mais les boucles longues de la lib vérifient un drapeau entre deux itérations via `$.global`).

## 5. Événements hôte → serveur (optionnels)

```json
{ "type": "event", "name": "sequence.activated", "data": { "id": "…", "name": "…" } }
{ "type": "event", "name": "project.opened", "data": { "path": "…" } }
```
Produits par les événements CEP (`com.adobe.csxs.events.*`) ou par polling léger (2 s) dans le panneau. Servent à invalider les caches côté serveur et à informer l'agent via des ressources MCP (`adobe://ppro/active-sequence`).

## 6. Keepalive

`{ "type": "ping" }` / `{ "type": "pong" }` toutes les 10 s. Un hôte silencieux 30 s est marqué `disconnected` ; les appels en attente échouent avec `HOST_DISCONNECTED`.

## 7. Nommage des fonctions (`fn`)

`<domaine>.<action>` en camelCase, identique sur CEP et UXP, préfixé par l'application côté MCP (`ppro_` / `aeft_`). Domaines Premiere : `project`, `sequence`, `edit`, `clip`, `effects`, `audio`, `markers`, `captions`, `export`, `safety`, `ui`. Domaines After Effects : `project`, `comp`, `layer`, `property`, `effects`, `text`, `render`, `safety`, `ui`. Le catalogue complet est dans `03-catalogue-tools.md`.

## 8. Mode sans panneau (After Effects)

Pour `AfterFX -r`, le « client » est un sous-processus lancé par le serveur : il écrit `request.json`, lance `AfterFX.exe -r runner.jsx`, et `runner.jsx` lit la requête, appelle `ADOBE_MCP.call`, écrit `response.json`. Même sémantique, latence plus élevée (~1 s), pas de `progress`.
