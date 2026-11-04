# Brief commun — rédaction d'un skill de montage pour adobe-mcp

## Contexte
`adobe-mcp` permet à un agent IA de piloter Adobe Premiere Pro et After Effects via des outils MCP (`ppro_*`, `aeft_*`, `media_*`). L'agent lit la timeline en JSON, décide, appelle des primitives. Les **skills** sont des fichiers `SKILL.md` que l'agent charge pour savoir *comment bien monter* : ils doivent contenir du savoir-faire concret de monteur, pas des généralités.

Lire d'abord, dans ce dépôt :
- `skills/adobe-editing/SKILL.md` — format et ton d'un skill existant ;
- `docs/03-catalogue-tools.md` — tous les outils (existants en phase 1 : lecture projet/séquence, `ppro_cut_at`, `ppro_import_media`, `ppro_export_frame`, checkpoints ; les autres sont prévus) ;
- `docs/04-fonctionnalites-recettes.md` — recettes déjà esquissées.

## Recherche attendue
- **Beaucoup de sources, variées** : au moins 20 à 30, en anglais et en français : tutoriels (pages de chaînes YouTube, transcriptions ou résumés), blogs de monteurs professionnels, aide Adobe (helpx.adobe.com), forums (Reddit r/editors, r/premiere, r/AfterEffects, Creative COW), livres de référence (résumés), guides de plateformes (YouTube Creators, TikTok…).
- Chercher des **chiffres et des seuils** (durées de plans, dB, LUFS, %, frames, tailles de police, marges), des **critères de décision** (quand faire X plutôt que Y), des **procédures pas à pas** et des **erreurs fréquentes** de débutant.
- Noter **comment un humain fait l'opération dans l'interface** (menu, raccourci, panneau) : utile pour guider l'utilisateur et pour savoir quoi scripter plus tard.
- Ne pas inventer de chiffres. Un repère non sourcé est marqué « (repère) ».

## Format du fichier à produire : `skills/<slug>/SKILL.md`
```
---
name: <slug>
description: <une phrase précise : quand charger ce skill, mots-clés déclencheurs>
---
# <Titre>

## Quand utiliser ce skill
## Principes (10 à 25 règles courtes, chiffrées quand possible, chacune avec son « pourquoi » en une phrase)
## Procédures
   Pour chaque tâche type : objectif → étapes numérotées → outils adobe-mcp à appeler (marquer [existant] ou [prévu]) → comment vérifier le résultat
## Paramètres de référence (tableaux : valeurs par défaut, plages, par plateforme/usage)
## Erreurs fréquentes et comment les détecter
## Contrôle qualité (checklist avant de livrer)
## Comment un humain le fait dans Premiere / After Effects (menus, raccourcis, panneaux)
## Sources (liste : titre — URL — ce qu'on en a tiré)
```
- **Français**, phrases courtes, ton direct. Listes et tableaux bienvenus.
- `SKILL.md` : 250 à 450 lignes. Si plus de matière : fichiers `skills/<slug>/references/<sujet>.md` et renvoi depuis le SKILL.md.
- Paraphraser ; aucune citation de plus de 15 mots ; pas de reproduction de paroles ou de textes protégés.

## Interdits (vérifier avant de rendre)
- Aucune mention d'un produit ou d'une société d'IA (écrire « l'agent », « l'assistant », « le client MCP »).
- Aucune mention de personnes réelles identifiables (streamers, youtubeurs, monteurs) autrement que comme auteur d'une source dans la section Sources ; aucune mention d'équipes, de jeux ou de chaînes spécifiques dans le corps du skill.
- Aucun chemin de fichier personnel, aucun nom d'utilisateur.

## Livrable
1. Le fichier `SKILL.md` (et `references/` si besoin) écrit au bon chemin.
2. En réponse : 10 lignes maximum — ce qui a été couvert, nombre de sources, les 3 règles les plus utiles, ce qui manque encore.
