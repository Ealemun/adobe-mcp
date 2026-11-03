# 04 — Fonctionnalités de haut niveau (recettes)

Aucune de ces fonctionnalités n'est codée en dur. Chacune est une **recette** : une suite d'appels de tools que l'agent exécute, adapte à la demande, et que l'utilisateur peut modifier en langage naturel. Les recettes vivent dans `skills/adobe-editing/SKILL.md` (version opérationnelle) ; ce document est la référence.

Légende : ✦ = fonctionnalité avancée, au-delà des fonctions de base d'un assistant de montage.

## 1. Nettoyage de parole

### 1.1 Jump cut / suppression des silences
- Entrées : séquence active, `minSilence` (0,5 s), `padding` (0,08 s), pistes voix.
- Étapes : `ppro_export_audio` (wav 16 kHz) → `media_detect_silences` → aperçu : liste des plages + durée gagnée → `ppro_checkpoint` → `ppro_remove_ranges {ripple: true}` → rapport.
- Options : conserver les respirations courtes, ne couper que la vidéo (désactiver au lieu de supprimer), « preview » = `ppro_disable_clips` sur les plages pour écouter avant de supprimer.

### 1.2 Nettoyage de script (fillers, répétitions, faux départs)
- `media_transcribe {wordTimestamps}` → l'agent repère « euh », mots répétés, phrases reprises (`media_detect_fillers` pour un premier passage mécanique, puis relecture par l'agent) → propose la liste des coupes avec le texte retiré → `ppro_remove_ranges`.
- ✦ Mode « meilleure prise » : quand une phrase est dite plusieurs fois, garder la dernière (ou celle sans hésitation) et supprimer les autres.

### 1.3 Auto-bleep / censure
- Transcript → liste de mots → `ppro_mute_ranges {mode: "bleep"}` (son placé sur une piste SFX) ou `"mute"`.

### 1.4 Podcast / multicam par diarisation
- `media_transcribe {diarize: true}` → segments par locuteur → `ppro_cut_at` aux changements de locuteur → bascule de caméra : activer le clip de la caméra du locuteur, désactiver les autres (`ppro_disable_clips`) → `ppro_remove_disabled_clips`.
- ✦ Variante : `ppro_create_multicam` puis écriture des coupes multicam ; règle « plan large toutes les N secondes ou sur les rires ».

## 2. Sous-titres et texte

### 2.1 Captions animées (« smart captions »)
- `media_transcribe` → segmentation en lignes (max N mots, coupures aux ponctuations) → deux sorties au choix : piste de légendes native (`ppro_import_captions`) ou graphiques mot-à-mot (`ppro_captions_to_graphics` avec style : police, surlignage du mot courant, position, fond).
- ✦ Styles enregistrés dans `presets/captions/*.json` ; emojis contextuels ; traduction (`gen_translate` = l'agent) pour pistes multilingues.

### 2.2 Relecture et corrections
- `ppro_extract_texts` + `ppro_get_captions` → l'agent corrige l'orthographe, harmonise la casse, repère les noms propres (équipes, joueurs, personnages de jeu) → `ppro_set_captions` / `ppro_update_text`.

### 2.3 Chapitres
- Transcript → segmentation thématique par l'agent → `ppro_add_markers {type: "Chapter"}` → `ppro_export_chapters {format: "youtube"}`.

## 3. Rythme et dynamique

### 3.1 Auto-zoom (punch-ins)
- Transcript + énergie vocale (RMS par fenêtre via `media_probe`/ffmpeg) → instants d'emphase → `ppro_punch_in` (scale 100→115 %, ease, durée de phrase), alternance in/out pour éviter la monotonie.

### 3.2 ✦ Montage sur la musique (montage rythmé sur musique)
- `media_detect_beats` sur la musique → grille de beats/downbeats/drops → `media_detect_scenes` + `ppro_export_frames` sur les rushes → l'agent choisit les plans (action, réactions) → `ppro_place_clips` alignés sur les temps forts → `ppro_set_clip_speed` / `ppro_speed_ramp` sur les moments clés → `ppro_add_transition` courts → `ppro_add_markers` « drop », « build-up » pour les retouches.
- Entrées utiles : liste des moments à mettre en avant (timecodes ou description), style (nombre de coupes par mesure), zone de sécurité pour le texte.

### 3.3 Smart beats
- `media_detect_beats` → `ppro_add_markers` (couleur par type : beat / downbeat / section).

### 3.4 ✦ Rampes de vitesse et freeze frames
- `ppro_speed_ramp` sur un clip autour d'un instant clé ; `ppro_export_frame` + `ppro_add_image_overlay` pour un arrêt sur image stylisé.

## 4. Formats et déclinaisons

### 4.1 Moments viraux / shorts (« smart virals »)
- Transcript + énergie + rires/réactions → l'agent note chaque segment (hook, autonomie, émotion) → `ppro_add_markers` + `ppro_extract_range_to_sequence` pour les N meilleurs → 4.2.

### 4.2 Montage vertical 9:16
- `ppro_reframe_vertical {strategy}` : centre, suivi de visage (`media_detect_faces` sur des frames exportées → keyframes de position), ou split-screen (deux cadrages empilés pour un duo).
- Ajout automatique des captions (2.1) et des zones de sécurité (`ppro_set_safe_zones`).

### 4.3 ✦ Déclinaisons multi-plateformes
- À partir d'une séquence maître : 16:9 YouTube, 9:16 Shorts/TikTok, 1:1, avec export par lot (`ppro_export_sequence` + presets) et chapitres/descriptions générés.

## 5. Image et couleur

### 5.1 Color grade automatique
- `ppro_export_frames` (une par clip) → l'agent analyse (exposition, dominante, cohérence entre caméras) → `ppro_apply_cdl` ou `ppro_set_lumetri` par clip, calque d'effets global pour le look → nouvelle planche de frames pour vérification.
- ✦ « Match » : aligner la colorimétrie de la caméra B sur la caméra A.

### 5.2 ✦ Contrôle qualité visuel
- Planche de frames (`media_contact_sheet`) → l'agent signale : plans flous, noirs, mal cadrés, sauts d'exposition, textes hors zone de sécurité, incohérences de ratio.

### 5.3 ✦ Stabilisation et recadrage
- `ppro_stabilize` sur les plans détectés instables (variance de flux optique via ffmpeg `vidstab` dans un worker).

## 6. B-roll, images, sons

### 6.1 Auto B-roll
- Index des chutiers : `ppro_list_items` + `media_extract_frames` (1 frame / 2 s) + `media_contact_sheet` → l'agent décrit chaque clip (index textuel conservé dans `~/.adobe-mcp/index/<projet>.json`) → pour chaque phrase du transcript, choix d'un plan illustratif → `ppro_insert_clip {mode: "overwrite", videoTrack: "V2"}`.
- ✦ Index persistant et incrémental ; recherche sémantique sans réseau (embeddings locaux optionnels).

### 6.2 Auto SFX
- Transcript + marqueurs d'événements (whoosh sur les zooms, impact sur les coupes de drop) → bibliothèque locale de SFX (dossier utilisateur, indexée par nom/tags) → `ppro_place_sfx`.
- ✦ `gen_sfx` si l'utilisateur a configuré un fournisseur.

### 6.3 Emoji / images contextuelles
- Transcript → mots-clés → `ppro_add_image_overlay` (emojis Noto embarqués, PNG de l'utilisateur, images générées) avec animation d'entrée via `ppro_set_keyframes`.

### 6.4 ✦ Smart paste
- Coller un chemin, une URL locale ou un texte dans le chat : import + placement à la tête de lecture avec le bon format (image → 5 s sur V2, audio → piste musique, SRT → légendes).

## 7. Audio

### 7.1 Mix automatique
- `ppro_get_audio_info` + `media_loudness` par piste → `ppro_set_clip_gain` (voix à −16 LUFS, musique à −28), `ppro_auto_duck` (musique −12 dB sous la voix, attaque 0,2 s, relâche 0,8 s), `ppro_set_track_volume`.

### 7.2 Séparation de stems
- `ppro_export_audio` → `media_separate_stems` → réimport (voix seule pour la transcription, musique seule pour la remixer, suppression d'une musique sous-jacente avant d'en poser une autre).

### 7.3 ✦ Nettoyage
- `media_denoise` / `ppro_add_audio_effect {effect: "DeNoise"}`, dé-essing, normalisation EBU R128 pour la plateforme cible.

### 7.4 ✦ Voix off
- Script → `gen_tts` (ou lecture par l'utilisateur) → `ppro_insert_clip` + alignement du montage sur les timestamps de la voix.

## 8. After Effects

### 8.1 Animations décrites en langage naturel → compositions générées par code ✦
- Description en langage naturel → l'agent crée la comp (`aeft_create_comp`), les calques (`aeft_add_layer`, `aeft_add_shape`, `aeft_set_text`), l'animation (`aeft_set_keyframes`, `aeft_set_expression` avec `aeft_validate_expression`), vérifie visuellement (`aeft_export_frame` à 3-4 instants), itère, puis `aeft_export_mogrt` ou `aeft_render` et placement dans Premiere.
- Bibliothèque de « briques » dans le skill : titres cinétiques, lower thirds, compteurs, barres de progression, transitions, notifications, HUD (score, timer, compteur).

### 8.2 ✦ Templates et MOGRT maison
- Création de MOGRT paramétrés (propriétés essentielles) pour les captions, les titres, les lower thirds du projet ; versionnés dans `presets/mogrt/`.

### 8.3 ✦ Vidéos pilotées par données
- CSV/JSON (classement, stats de match) → comps générées en série, rendu par lot via `aerender`.

### 8.4 ✦ Audit et réparation de projet AE
- `aeft_get_comp` → expressions en erreur, calques orphelins, médias manquants, comps non utilisées → corrections proposées.

## 9. Organisation et livraison

### 9.1 ✦ Rangement de projet
- `ppro_list_items` + analyse → chutiers par type/date/caméra, renommage normalisé, étiquettes de couleur, repérage des médias inutilisés et hors ligne (`ppro_find_items`, `ppro_relink_media`).

### 9.2 Auto-export
- Détection des plages marquées (`ppro_get_markers`) → `ppro_export_range` par marqueur avec nommage automatique → file Media Encoder.

### 9.3 ✦ Rapport de montage
- « Explique la timeline » : structure, durée par section, ratio parole/musique, rythme de coupe (coupes/minute), liste des textes, points à vérifier.

### 9.4 ✦ Import de notes de relecture
- CSV/texte « 01:23 — remplacer le plan » → marqueurs + proposition d'actions par note.

## 10. Garde-fous appliqués à toutes les recettes

1. Lecture avant écriture : toute recette commence par `ppro_get_sequence` / `aeft_get_comp`.
2. Plan explicite : l'agent présente ce qu'il va faire (nombre de coupes, durée gagnée, clips touchés) avant les étapes `D`.
3. Checkpoint automatique avant chaque étape destructive ; `ppro_rewind` proposé à la fin.
4. Vérification : image exportée ou relecture de la structure après l'action, écart signalé.
5. Jamais de code arbitraire (`*_run_script`) dans une recette.
