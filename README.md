# adobe-mcp

Serveur MCP local pour piloter **Adobe Premiere Pro** et **After Effects** depuis n'importe quel client MCP (assistant IA en ligne de commande ou application de bureau), sans serveur tiers, sans abonnement, sans code distant.

> Statut : **phase 0 — spécification**. Le code arrive dans les phases suivantes (voir `docs/05-roadmap.md`).

## Pourquoi

Les « copilotes » commerciaux pour Premiere sont pour la plupart des coquilles : un panneau qui télécharge son code au démarrage, envoie vos demandes à un serveur distant qui appelle un LLM, et renvoie du code ExtendScript exécuté dans votre Premiere. Vous payez des crédits, vous dépendez d'un serveur, et l'éditeur peut changer le code à tout moment.

`adobe-mcp` fait la même chose en local : l'agent IA est le cerveau, un petit pont dans l'application Adobe exécute les primitives, des workers locaux (Whisper, ffmpeg, Demucs) font l'analyse média.

## Architecture en une phrase

```
Agent  ──(MCP stdio)──▶ mcp-server ──(WebSocket localhost)──▶ host-cep / host-uxp ──(evalScript)──▶ Premiere / After Effects
                            │
                            └──▶ workers (ffmpeg, whisper, demucs, scenedetect)
```

## Compatibilité visée

| Application | Versions | Pont |
|---|---|---|
| Premiere Pro | 2018 (12.x) → 2028 | CEP (`host-cep`), puis UXP (`host-uxp`) en parallèle |
| After Effects | 2018 (15.x) → 2028+ | CEP (`host-cep`) + mode sans panneau (`AfterFX -r`), UXP quand GA |
| Media Encoder | via Premiere / `aerender` | — |

Adobe (sept. 2026) : CEP reste actif dans Premiere et After Effects jusqu'à fin 2028 (désactivé par défaut ensuite, retiré en déc. 2029). UXP est GA dans Premiere ; bêta publique After Effects prévue nov. 2026. ExtendScript n'est pas affecté. Le protocole du pont est indépendant de CEP/UXP : seul le client du pont change, pas le serveur MCP.

## Documentation

| Fichier | Contenu |
|---|---|
| `docs/00-guide-utilisateur.md` | **Commencer ici** : installation en 5 minutes, premier montage, ce qu'on peut demander, sécurité, dépannage |
| `docs/01-architecture.md` | Composants, flux, choix techniques, sécurité |
| `docs/02-protocole-bridge.md` | Protocole WebSocket serveur MCP ↔ pont Adobe, format des données |
| `docs/03-catalogue-tools.md` | Catalogue exhaustif des tools MCP (Premiere, After Effects, média, sécurité) |
| `docs/04-fonctionnalites-recettes.md` | Fonctionnalités de haut niveau (jump cut, captions, B-roll, multicam…) exprimées comme recettes |
| `docs/05-roadmap.md` | Phases, livrables, critères de validation |
| `docs/06-installation-dev.md` | Installer un pont CEP non signé, PlayerDebugMode, chemins, signature ZXP |
| `skills/adobe-editing/SKILL.md` | Instructions pour l'agent : comment enchaîner les tools pour monter une vidéo |

## Arborescence

```
adobe-mcp/
├── packages/
│   ├── mcp-server/      # Node/TypeScript, serveur MCP (stdio) + serveur WebSocket du pont
│   ├── host-cep/        # Panneau CEP (Premiere + After Effects) : client WS → evalScript
│   ├── host-uxp/        # Plugin UXP Premiere (même protocole), phase 5
│   └── workers/         # Python : transcription, silences, stems, scènes, loudness
├── presets/             # .epr (export), .sqpreset, .mogrt de base
├── skills/              # Instructions agent (recettes de montage)
├── scripts/             # install dev, signature ZXP, packaging
└── docs/
```

