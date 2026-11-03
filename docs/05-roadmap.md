# 05 — Roadmap

Chaque phase a un **critère de validation** concret, testé sur un vrai projet (un montage de test par exemple). Les numéros de tools renvoient à `03-catalogue-tools.md`.

| Phase | Objectif | Livrables | Validation |
|---|---|---|---|
| **P0 — Spécification** (fait) | Cadre complet | Ce dépôt : docs 01→06, skill | Relecture, publication git |
| **P1 — Spike** (en cours : code écrit, test réel sur Premiere 2020 à faire) | Prouver la chaîne complète agent → Premiere | `mcp-server` minimal (stdio + WS + 6 tools : `get_capabilities`, `get_project`, `get_sequence`, `cut_at`, `import_media`, `export_frame`, + `checkpoint`/`rewind`), `host-cep` Bolt CEP avec lib JSX Premiere de base, `scripts/install-dev.*` | Depuis le client MCP : « coupe à 12 s et 18 s et montre-moi l'image à 15 s » fonctionne sur Premiere installé |
| **P2 — Primitives Premiere** (1–2 semaines) | Catalogue A complet (hors ✦ P6) | Lib JSX `ppro/*` organisée par domaine, schémas JSON, dry-run, journal, tests d'intégration (projet de test `.prproj` + script de non-régression) | 100 % des tools P1/P2 passent la suite de tests sur la version installée ; table de capacités par version |
| **P3 — Workers média** (1 semaine) | Analyse locale | CLI Python : probe, transcribe (faster-whisper), silences, beats, scenes, stems (demucs), loudness, frames/contact sheet ; tools `media_*` ; recettes jump cut, captions, chapitres, auto-zoom, vertical, mix, B-roll dans le skill | Jump cut + captions de bout en bout sur une vidéo de 10 min en < 3 min, sans réseau |
| **P4 — After Effects** (1–2 semaines) | Catalogue B | Lib JSX `aeft/*`, manifeste double hôte, mode `AfterFX -r`, recettes AE (animations générées par code, MOGRT) | « Fais-moi un lower third animé avec un texte donné » produit un MOGRT utilisable dans Premiere |
| **P5 — Pont UXP Premiere** (1 semaine) | Pérennité post-2028 | `host-uxp` avec le même protocole, matrice de parité CEP/UXP, sélection automatique | Les tools P1 fonctionnent via UXP sur Premiere ≥ 25 ; bascule transparente |
| **P6 — Confort et ✦** (continu) | Fonctions avancées | Tools ✦ P6, adaptateurs `gen_*`, Dynamic Link, index B-roll persistant, rapport de montage, packaging ZXP signé + installeur, doc utilisateur | Installation en 2 commandes sur une machine vierge |

## Ordre de développement dans P1 (détail)

1. `packages/mcp-server` (fait) : `src/mcp.js` (MCP stdio), `src/bridge/ws.js` + `server.js` (WebSocket, registre, timeouts, journal), `src/tools/ppro.js` et `aeft.js` (20 tools), checkpoint automatique avant coupe, `test/smoke.js` avec un faux Premiere.
2. `packages/host-cep` (fait) : panneau vanilla (`index.html`, `js/main.js`), `jsx/index.jsx` + `ppro.jsx` + `aeft.jsx`.
3. `scripts/install.ps1` (fait) : PlayerDebugMode, jonction du panneau, déclaration dans les clients MCP (`clients.json`), copie du skill, test de fumée.
4. **À faire** : test réel sur Premiere Pro 2020 (razor via QE, `exportFramePNG`, `Sequence.clone()`), corrections, puis publication.

## Décisions ouvertes

| Sujet | Options | Choix provisoire |
|---|---|---|
| Langage de la lib hôte | TypeScript compilé en ES3 (Bolt) vs JSX à la main | JSX à la main pour le spike ; TypeScript si la lib dépasse ~2 000 lignes |
| Transcription | faster-whisper (Python, GPU) vs whisper.cpp (binaire, sans Python) | faster-whisper ; whisper.cpp en option « sans Python » |
| Coupes complexes | QE DOM (razor direct) vs génération XML + réimport | QE DOM par défaut, XML en secours pour les versions sans QE |
| Confirmation des actions D | Dans l'agent (prompt) vs dialogue dans le panneau | Dans l'agent, politique configurable |
| Distribution | ZXP signé + installeur vs dossier à copier | Les deux : `scripts/package-zxp` + `install-dev` |
