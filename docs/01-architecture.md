# 01 — Architecture

## 1. Vue d'ensemble

```
┌──────────────┐  MCP (stdio/JSON-RPC)  ┌─────────────────────────────┐
│ Agent IA     │◀──────────────────────▶│ packages/mcp-server (Node)  │
│ (client MCP) │                        │  • tools MCP (JSON Schema)  │
└──────────────┘                        │  • bridge: serveur WS       │
                                        │  • safety: checkpoints, log │
                                        │  • media: appel des workers │
                                        └──────┬───────────────┬──────┘
                                               │ ws://127.0.0.1:PORT      │ CLI / JSON
                     ┌─────────────────────────┴──────────┐      ┌───────┴────────────────┐
                     │ packages/host-cep (panneau CEP)     │      │ packages/workers (Py)  │
                     │  JS : client WS, file d'attente     │      │  ffmpeg / ffprobe      │
                     │  JSX: lib ppro/ + lib aeft/         │      │  faster-whisper        │
                     │     exécutée via evalScript         │      │  demucs, scenedetect   │
                     └──────┬──────────────────┬──────────┘      └────────────────────────┘
                            │                  │
                   ┌────────┴──────┐   ┌───────┴────────┐
                   │ Premiere Pro  │   │ After Effects  │
                   └───────────────┘   └────────────────┘
```

Trois paquets, trois responsabilités :

| Paquet | Responsabilité | Ne fait pas |
|---|---|---|
| `mcp-server` | Exposer des tools MCP typés, router vers l'hôte Adobe connecté, garantir la sécurité (checkpoints, confirmations), appeler les workers | Aucune logique ExtendScript, aucun appel LLM |
| `host-cep` / `host-uxp` | Recevoir `{fn, args}`, exécuter la primitive dans l'application, renvoyer du JSON | Aucune décision, aucune UI au-delà d'un statut |
| `workers` | Transformer des fichiers média en données (texte, timestamps, stems, scènes) | Aucun accès aux applications Adobe |

L'agent IA (le client MCP) est le seul décideur. Il voit la timeline sous forme de JSON, décide, appelle des primitives.

## 2. Choix techniques

### 2.1 Serveur MCP — Node.js / TypeScript
- **Sans dépendance** (Node ≥ 18 suffit, pas de `npm install`) : MCP sur stdio (JSON-RPC, `src/mcp.js`) et serveur WebSocket RFC 6455 (`src/bridge/ws.js`) sont implémentés dans le dépôt. Lancement par le client MCP via son fichier de configuration. Option HTTP streamable pour un usage distant plus tard.
- Schémas d'entrée en JSON Schema ; chaque tool a une description orientée « comment l'agent doit l'utiliser », des annotations (readOnly/destructive) et `dryRun` pour les opérations destructives.
- Serveur WebSocket sur `127.0.0.1`, port configurable (défaut 8765, port libre sinon), **token aléatoire** généré au démarrage, écrit dans `bridge.json` (`%APPDATA%\adobe-mcp` sous Windows, `~/Library/Application Support/adobe-mcp` sous macOS : l'emplacement que le panneau sait lire). Rien n'écoute sur le réseau.
- Registre des hôtes connectés : `{app: "ppro"|"aeft", version, pid, capabilities[]}`. Les tools `ppro_*` sont routés vers l'hôte Premiere, `aeft_*` vers After Effects. Si l'hôte n'est pas connecté, le tool répond avec une consigne claire (« ouvrez le panneau Window > Extensions > Adobe MCP »).
- Journal structuré de chaque appel (`~/.adobe-mcp/logs/`), jamais envoyé nulle part.

### 2.2 Pont CEP — panneau sans framework
- Un seul panneau déclarant deux hôtes dans `manifest.xml` :
  ```xml
  <Host Name="PPRO" Version="[12.0,99.9]" />
  <Host Name="AEFT" Version="[15.0,99.9]" />
  ```
  Bornes ouvertes pour ne pas être bloqué par les futures versions. `RequiredRuntime CSXS 9.0` (compatible CEP 9 à 12, soit Premiere/After Effects 2019 et suivants ; CEP 8 pour 2018 en abaissant cette valeur).
- **Pas de Node.js dans le panneau** : il lit `bridge.json` via `cep.fs` et parle au serveur en WebSocket natif. Le JS ne fait qu'appeler `evalScript("ADOBE_MCP.call(<json>)")`. Toute fonction appelable est **dans le dépôt** (`jsx/ppro.jsx`, `jsx/aeft.jsx`), versionnée, auditable ; aucun code reçu par le réseau n'est exécuté.
- UI du panneau : état de connexion, hôte détecté, journal des appels, bouton « Reconnecter », port modifiable. Rien d'autre.
- Bibliothèque ExtendScript écrite directement en ES3 (pas de chaîne de build) ; `json2.js` embarqué car ExtendScript n'a pas `JSON` natif. Un passage à TypeScript (`types-for-adobe`, Bolt CEP) reste possible plus tard si la lib grossit.

### 2.3 Pont UXP (phase 5)
- Même protocole WebSocket (UXP dispose de `WebSocket` natif). Les primitives sont réécrites sur l'API UXP de Premiere (`require("premierepro")`), fonction par fonction, derrière la même interface `{fn, args}`. Un hôte UXP s'enregistre avec `capabilities` listant les `fn` disponibles ; le serveur MCP préfère UXP quand la fonction y existe, sinon CEP (plugin hybride possible pendant la transition).

### 2.4 After Effects sans panneau
- `AfterFX.exe -r "C:\...\script.jsx"` exécute un script dans l'instance en cours ; `-s "code"` exécute une chaîne. Le serveur MCP peut donc piloter AE sans panneau pour des commandes ponctuelles (résultat via fichier JSON temporaire). Mode « dégradé » utile pour l'automatisation batch et pour les versions où le panneau ne charge pas.
- `aerender` pour le rendu hors application.

### 2.5 Workers média — Python
- Un seul CLI `adobe-mcp-worker <commande> --json` (ou un serveur HTTP local lancé à la demande) ; sortie JSON ; modèles téléchargés une fois dans `packages/workers/models/`.
- `faster-whisper` (ou `whisper.cpp`) pour la transcription mot-à-mot avec timestamps ; `pyannote` optionnel pour la diarisation ; `demucs` pour les stems ; `ffmpeg` pour silences (`silencedetect`), loudness (`loudnorm`, EBU R128), extraction de frames, waveforms ; `PySceneDetect` pour les plans ; `librosa` pour les beats.
- GPU si disponible (CUDA), sinon CPU avec modèles `small`/`base`.

### 2.6 Génération externe (optionnelle, jamais requise)
- Images/vidéos/SFX/voix générées : adaptateurs vers des API tierces, ElevenLabs, modèles locaux (Stable Diffusion, Kokoro TTS…) **avec la clé API de l'utilisateur**, dans `mcp-server/src/tools/gen/`. Désactivés par défaut.

## 3. Modèle de données

### 3.1 Unités de temps
- Premiere : les ticks (`254 016 000 000` ticks/seconde). Toutes les API du pont parlent en **secondes décimales** côté MCP ; la conversion est faite dans la lib JSX. Les timecodes affichés sont fournis en plus (`"00:01:23:12"`), jamais utilisés comme entrée.
- After Effects : secondes natives.
- Identifiants stables : `nodeId` (projectItem), `sequenceID`, `clip.nodeId` / `trackItem` repéré par `(trackType, trackIndex, index)` + `start/end`. On renvoie toujours les deux pour que l'agent puisse reparler du même clip.

### 3.2 Structure de séquence (sortie de `ppro_get_sequence`)
```json
{
  "id": "…", "name": "Edit exemple #4", "fps": 59.94, "width": 1920, "height": 1080,
  "duration": 184.25, "inPoint": 0, "outPoint": 184.25, "playhead": 42.1,
  "tracks": {
    "video": [{ "index": 0, "name": "V1", "locked": false, "muted": false,
      "clips": [{ "id": "V1/0", "nodeId": "…", "name": "cam_A.mp4", "start": 0, "end": 12.4,
                  "inPoint": 3.2, "outPoint": 15.6, "disabled": false, "speed": 1,
                  "linked": ["A1/0"], "effects": ["Motion","Opacity","Lumetri Color"],
                  "mediaPath": "D:/…/cam_A.mp4" }] }],
    "audio": [ … ]
  },
  "markers": [{ "start": 10.0, "end": 10.0, "name": "Hook", "comment": "", "type": "Chapter" }]
}
```
Pour les séquences longues, le tool accepte `range: [t0, t1]` et `tracks: ["V1","A1"]` pour limiter la taille ; les résultats `evalScript` sont découpés en morceaux (`chunk`) si > 1 Mo.

### 3.3 Structure de composition AE (sortie de `aeft_get_comp`)
Arbre `comp → layers → properties` avec, pour chaque propriété animée, `keyframes: [{t, value, in/out interp}]` et `expression`. Profondeur et filtres paramétrables (`includeProperties: ["Transform", "Text"]`).

## 4. Sécurité et robustesse

| Risque | Réponse |
|---|---|
| Opération destructive ratée | Niveaux de tools : `read` (libre), `write` (journalisé), `destructive` (checkpoint automatique = duplication de la séquence/comp horodatée avant exécution, option `dryRun: true` qui renvoie le plan sans l'appliquer) |
| Boucle d'actions non voulue | Confirmation configurable pour les `destructive` (`confirmPolicy: "always" \| "batch" \| "never"`) ; l'agent reçoit le plan et doit le relire |
| Code arbitraire dans l'hôte | Aucun tool `eval` par défaut. Un tool `ppro_run_script` / `aeft_run_script` existe pour le développement, **désactivé** sauf `ADOBE_MCP_ALLOW_SCRIPT=1`, et journalisé |
| Fuite de données | Pas de télémétrie, pas de réseau sortant hors adaptateurs optionnels explicitement configurés |
| Hôte bloqué (dialogue modal, rendu) | Timeout par appel (défaut 60 s, configurable par tool), heartbeat WS, file d'attente FIFO par hôte (ExtendScript est mono-thread) |
| Résultats trop gros | Pagination/plages, chunking, écriture dans un fichier temporaire et renvoi du chemin si > 5 Mo |
| Versions différentes de Premiere | Détection `app.version`, table de capacités (`capabilities[]`) : les fonctions utilisant le QE DOM ou des API absentes sur une version se déclarent indisponibles proprement |

## 5. Configuration

`~/.adobe-mcp/config.json` (créé au premier lancement) :
```json
{
  "bridge": { "port": 8765 },
  "safety": { "confirmPolicy": "batch", "autoCheckpoint": true, "allowScript": false },
  "workers": { "python": "python", "whisperModel": "small", "device": "auto" },
  "presets": { "exportAudioForTranscription": "presets/epr/Audio_Transcription.epr" },
  "generation": { "falApiKey": null, "elevenLabsApiKey": null }
}
```

Enregistrement côté client MCP (ex. `.mcp.json` du projet vidéo ou configuration globale) :
```json
{ "mcpServers": { "adobe": { "command": "node", "args": ["<repo>/packages/mcp-server/dist/index.js"] } } }
```

## 6. Flux type : « enlève les silences de plus de 0,6 s »

1. Agent : `ppro_get_sequence` → structure.
2. Agent : `ppro_export_audio {range, preset: "transcription"}` → `C:\…\seq.wav`.
3. Agent : `media_detect_silences {path, minDuration: 0.6, noise: -35}` → `[{start, end}]`.
4. Agent : `ppro_checkpoint {label: "avant silences"}` (automatique si `destructive`).
5. Agent : `ppro_remove_ranges {ranges, ripple: true, tracks: "all"}` → rapport `{removed: 23, newDuration}`.
6. L'agent résume, propose `ppro_rewind` si le résultat ne plaît pas.
