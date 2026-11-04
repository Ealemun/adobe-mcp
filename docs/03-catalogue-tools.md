# 03 — Catalogue des tools MCP

Conventions :
- Niveau **R** = lecture (libre), **W** = écriture (journalisée, annulable via `safety`), **D** = destructive (checkpoint automatique + politique de confirmation).
- Temps en secondes décimales ; identifiants de clips `"V1/3"` (piste/index) + `nodeId` ; `tracks` accepte `"all"`, `"video"`, `"audio"` ou une liste `["V1","A2"]`.
- Tous les tools `W`/`D` acceptent `dryRun: true` (renvoient le plan d'actions sans l'exécuter).
- `✦` = capacité avancée, au-delà des fonctions de base d'un assistant de montage.

Phase indicative : **P1** spike, **P2** primitives Premiere, **P3** workers, **P4** After Effects, **P5** UXP, **P6** confort.

## État d'implémentation

Les tools ci-dessous existent dans `packages/mcp-server` (112 au total, `tools/list`). Les tables qui suivent restent la référence des paramètres ; un tool absent de cette liste est encore à faire.

**Premiere Pro** (72) : `ppro_add_markers`, `ppro_add_track`, `ppro_add_transition`, `ppro_alert`, `ppro_apply_effect`, `ppro_checkpoint`, `ppro_clear_keyframes`, `ppro_create_bin`, `ppro_create_sequence`, `ppro_cut_at`, `ppro_delete_clips`, `ppro_disable_clips`, `ppro_duplicate_sequence`, `ppro_export_audio`, `ppro_export_chapters`, `ppro_export_frame`, `ppro_export_frames`, `ppro_export_range`, `ppro_export_sequence`, `ppro_extract_range_to_sequence`, `ppro_get_active_sequence`, `ppro_get_audio_info`, `ppro_get_capabilities`, `ppro_get_clip_effects`, `ppro_get_item`, `ppro_get_markers`, `ppro_get_project`, `ppro_get_sequence`, `ppro_import_ae_comp`, `ppro_import_captions`, `ppro_import_media`, `ppro_insert_clip`, `ppro_insert_mogrt`, `ppro_keep_ranges`, `ppro_link_clips`, `ppro_list_checkpoints`, `ppro_list_effects`, `ppro_list_export_presets`, `ppro_list_items`, `ppro_list_mogrt_params`, `ppro_list_sequences`, `ppro_move_clip`, `ppro_move_items`, `ppro_place_clips`, `ppro_place_sfx`, `ppro_prune_checkpoints`, `ppro_punch_in`, `ppro_reframe_vertical`, `ppro_remove_disabled_clips`, `ppro_remove_effect`, `ppro_remove_markers`, `ppro_remove_ranges`, `ppro_rename_item`, `ppro_replace_with_ae_comp`, `ppro_rewind`, `ppro_save_project`, `ppro_seek`, `ppro_select_clips`, `ppro_set_active_sequence`, `ppro_set_clip_speed`, `ppro_set_clip_volume`, `ppro_set_effect_params`, `ppro_set_in_out`, `ppro_set_keyframes`, `ppro_set_lumetri`, `ppro_set_mogrt_params`, `ppro_set_track_state`, `ppro_set_transform`, `ppro_set_volume_keyframes`, `ppro_stabilize`, `ppro_trim_clip`, `ppro_unlink_clips`

**After Effects** (33) : `aeft_add_layer`, `aeft_add_shape`, `aeft_apply_ease`, `aeft_apply_effect`, `aeft_bake_expression`, `aeft_checkpoint`, `aeft_clear_keyframes`, `aeft_create_comp`, `aeft_delete_layers`, `aeft_duplicate_layer`, `aeft_essential_props`, `aeft_export_frame`, `aeft_export_mogrt`, `aeft_get_capabilities`, `aeft_get_comp`, `aeft_get_project`, `aeft_get_property`, `aeft_import`, `aeft_list_comps`, `aeft_list_effects`, `aeft_list_items`, `aeft_precompose`, `aeft_remove_effect`, `aeft_render`, `aeft_render_queue_add`, `aeft_save_project`, `aeft_set_comp_settings`, `aeft_set_expression`, `aeft_set_keyframes`, `aeft_set_layer`, `aeft_set_property`, `aeft_set_text`, `aeft_validate_expression`

**Média (analyse locale)** (6) : `media_contact_sheet`, `media_detect_silences`, `media_loudness`, `media_probe`, `media_transcribe`, `media_transcribe_status`

**Serveur** (0) : 

Écarts par rapport aux tables : `ppro_set_clip_gain` s'appelle `ppro_set_clip_volume` ; `ppro_export_range`/`ppro_export_sequence` prennent un preset `.epr` ou un nom/regex ; `ppro_insert_mogrt` / `ppro_set_mogrt_params` / `ppro_list_mogrt_params` fonctionnent sur un MOGRT déjà placé (clipId) ; `media_transcribe` nécessite un Whisper local (openai-whisper ou whisper.cpp) ; `media_contact_sheet` prend des PNG (pas de décodage vidéo).

Non implémentés (et pourquoi) : `ppro_add_text` / `ppro_update_text` / `ppro_extract_texts` (pas d'API de création de texte Essential Graphics en ExtendScript : passer par MOGRT ou After Effects), `ppro_add_adjustment_layer` (pas d'API de création de calque d'effets), `ppro_get_captions` / `ppro_set_captions` / `ppro_export_captions` (API des légendes absente avant Premiere 15), `ppro_reframe_vertical` strategy "face" (pas de détection de visages), `media_detect_beats` / `media_detect_scenes` / `media_detect_faces` / `media_separate_stems` (nécessitent des bibliothèques externes), `aeft_set_mask` / `aeft_time_remap` / `aeft_add_text_animator` / `aeft_set_camera` (à venir).

---

## A. Premiere Pro — `ppro_*`

### A1. Projet
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `ppro_get_project` | R | — | Nom, chemin, fps/format par défaut, nb d'items, séquence active, version Premiere | P1 |
| `ppro_list_items` | R | `bin?`, `type?` (video/audio/image/sequence/bin), `recursive?`, `includeMetadata?` | Arborescence des chutiers et médias avec durée, résolution, fps, chemin, proxys | P2 |
| `ppro_get_item` | R | `nodeId` | Détail d'un média : flux, codec, métadonnées XMP, marqueurs de clip, usage dans les séquences | P2 |
| `ppro_import_media` | W | `paths[]`, `bin?`, `asSequence?` | Importe fichiers/dossiers (séquences d'images, dossiers récursifs) | P1 |
| `ppro_create_bin` | W | `name`, `parent?` | Crée un chutier | P2 |
| `ppro_move_items` | W | `nodeIds[]`, `bin` | Range des médias dans un chutier | P2 |
| `ppro_rename_item` | W | `nodeId`, `name` | Renomme | P2 |
| `ppro_set_item_metadata` ✦ | W | `nodeId`, `fields{}` (description, scène, prise, log note, color label) | Écrit les métadonnées/étiquettes de couleur | P6 |
| `ppro_relink_media` ✦ | W | `nodeId`, `newPath` / `searchFolder` | Reconnecte les médias hors ligne | P6 |
| `ppro_find_items` ✦ | R | `query` (nom, chemin, durée, hors ligne, inutilisé) | Recherche de médias (ex. « tous les clips non utilisés ») | P6 |
| `ppro_create_proxies` ✦ | W | `nodeIds[]`, `preset` | Lance la création de proxys | P6 |
| `ppro_save_project` | W | `as?` | Sauvegarde / Enregistrer sous | P2 |
| `ppro_open_project` | W | `path` | Ouvre un projet | P6 |

### A2. Séquences
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `ppro_list_sequences` | R | — | Toutes les séquences (id, nom, durée, format) | P1 |
| `ppro_get_sequence` | R | `sequenceId?`, `range?`, `tracks?`, `includeEffects?`, `includeMarkers?` | Structure complète (voir 01-architecture §3.2) | P1 |
| `ppro_get_active_sequence` | R | — | Identité + tête de lecture + in/out + sélection courante | P1 |
| `ppro_set_active_sequence` | W | `sequenceId` | Active une séquence dans la timeline | P2 |
| `ppro_create_sequence` | W | `name`, `preset?` (.sqpreset) ou `fromClip?` ou `{width,height,fps}` | Nouvelle séquence | P2 |
| `ppro_duplicate_sequence` | W | `sequenceId`, `name` | Duplique (base des checkpoints) | P1 |
| `ppro_set_in_out` | W | `in`, `out` | Points d'entrée/sortie de la timeline | P2 |
| `ppro_seek` | W | `time` | Déplace la tête de lecture | P2 |
| `ppro_get_selection` | R | — | Clips sélectionnés dans la timeline | P2 |
| `ppro_select_clips` | W | `clipIds[]` | Sélectionne des clips (permet ensuite des actions UI) | P2 |
| `ppro_set_sequence_settings` ✦ | W | `fps?`, `size?`, `audioChannels?` | Change les réglages de séquence | P6 |
| `ppro_nest` ✦ | W | `clipIds[]`, `name` | Imbrique une sélection | P6 |
| `ppro_create_multicam` ✦ | W | `nodeIds[]`, `syncBy` (timecode/audio/marker), `name` | Crée une séquence multicaméra | P6 |

### A3. Montage (timeline)
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `ppro_cut_at` | D | `times[]`, `tracks?`, `includeAudio?` | Coupe (razor) aux instants donnés | P1 |
| `ppro_insert_clip` | W | `nodeId`, `time`, `videoTrack?`, `audioTrack?`, `inPoint?`, `outPoint?`, `mode: "insert"\|"overwrite"` | Place un média dans la timeline | P2 |
| `ppro_place_clips` | W | `items[{nodeId, time, track, in, out}]` | Placement par lot (assemblage d'un ours) | P2 |
| `ppro_move_clip` | W | `clipId`, `time`, `track?` | Déplace | P2 |
| `ppro_trim_clip` | W | `clipId`, `start?`, `end?`, `inPoint?`, `outPoint?`, `ripple?` | Modifie les bords | P2 |
| `ppro_delete_clips` | D | `clipIds[]`, `ripple?` | Supprime (lift ou extract) | P2 |
| `ppro_remove_ranges` | D | `ranges[{start,end}]`, `tracks?`, `ripple?` | Supprime des plages de temps (cœur du jump cut) | P2 |
| `ppro_keep_ranges` ✦ | D | `ranges[]`, `tracks?` | Inverse : ne conserve que ces plages | P2 |
| `ppro_disable_clips` | W | `clipIds[]` ou `ranges[]`, `disabled` | Active/désactive | P2 |
| `ppro_remove_disabled_clips` | D | `tracks?`, `ripple?` | Supprime tous les clips désactivés | P2 |
| `ppro_link_clips` / `ppro_unlink_clips` | W | `clipIds[]` | Lien vidéo/audio | P2 |
| `ppro_set_clip_speed` ✦ | W | `clipId`, `speed` ou `duration`, `reverse?`, `maintainPitch?`, `ripple?` | Vitesse/durée | P2 |
| `ppro_speed_ramp` ✦ | W | `clipId`, `keyframes[{t, speed}]` | Rampe de vitesse par remappage temporel | P6 |
| `ppro_add_transition` | W | `clipId`, `side: "in"\|"out"\|"both"`, `name` (ex. « Cross Dissolve »), `duration?` | Transition vidéo/audio | P2 |
| `ppro_add_default_transitions` ✦ | W | `clipIds[]` / `range` | Applique les transitions par défaut (Ctrl+D) | P6 |
| `ppro_set_track_state` | W | `track`, `locked?`, `muted?`, `solo?`, `visible?`, `targeted?` | État de piste | P2 |
| `ppro_add_track` / `ppro_remove_empty_tracks` ✦ | W | `type`, `count?` | Gère les pistes | P2 |
| `ppro_reframe_vertical` | W | `sequenceId`, `aspect: "9:16"\|"1:1"\|"4:5"`, `strategy: "center"\|"face"\|"manual"`, `keyframes?` | Crée une séquence verticale recadrée (Auto Reframe ou transformations) | P3 |
| `ppro_extract_range_to_sequence` | W | `start`, `end`, `name`, `aspect?` | Extrait un sous-clip de timeline dans une nouvelle séquence (« smart virals ») | P2 |
| `ppro_group_clips` ✦ | W | `clipIds[]` | Groupe | P6 |
| `ppro_match_frame` ✦ | R | `time`, `track` | Retrouve la source d'une image | P6 |

### A4. Clip : transformations, effets, couleur
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `ppro_list_effects` | R | `type?` (video/audio/transition), `search?` | Effets disponibles (nom affiché + matchName) | P2 |
| `ppro_get_clip_effects` | R | `clipId` | Effets du clip, propriétés, valeurs, keyframes | P2 |
| `ppro_apply_effect` | W | `clipIds[]`, `effect` (matchName), `params?` | Applique un effet avec valeurs initiales | P2 |
| `ppro_remove_effect` | W | `clipId`, `effectIndex` | Retire | P2 |
| `ppro_set_effect_params` | W | `clipId`, `effect`, `params{prop: value}`, `at?` (keyframe) | Modifie des propriétés ; avec `at`, pose une image-clé | P2 |
| `ppro_set_keyframes` | W | `clipId`, `effect`, `prop`, `keyframes[{t, value, interp?}]`, `replace?` | Animation complète d'une propriété | P2 |
| `ppro_clear_keyframes` | W | `clipId`, `effect`, `prop` | Supprime les images-clés | P2 |
| `ppro_set_transform` | W | `clipIds[]`, `scale?`, `position?`, `rotation?`, `anchor?`, `opacity?`, `crop?`, `at?` | Raccourci Motion/Opacity | P2 |
| `ppro_punch_in` | W | `clipId`, `ranges[{start,end,scale,position?}]`, `ease?` | Zooms (auto-zoom) par images-clés sur Motion | P3 |
| `ppro_add_adjustment_layer` | W | `start`, `end`, `track`, `effects?` | Calque d'effets | P2 |
| `ppro_apply_preset` ✦ | W | `clipIds[]`, `presetPath` (.prfpset) | Preset d'effets | P6 |
| `ppro_apply_lut` ✦ | W | `clipIds[]`, `lutPath` | Lumetri : LUT d'entrée | P6 |
| `ppro_set_lumetri` | W | `clipIds[]`, `basic{exposure,contrast,highlights,shadows,whites,blacks,temperature,tint,saturation}`, `creative?`, `curves?` | Correction colorimétrique paramétrique | P3 |
| `ppro_apply_cdl` | W | `clipIds[]`, `slope[3]`, `offset[3]`, `power[3]`, `saturation` | ASC-CDL (color grade automatique) | P3 |
| `ppro_copy_attributes` ✦ | W | `fromClipId`, `toClipIds[]`, `effects?[]` | Copier/coller les attributs | P6 |
| `ppro_set_blend_mode` ✦ | W | `clipIds[]`, `mode` | Mode de fusion | P6 |
| `ppro_set_safe_zones` | W | `enabled`, `aspect?` | Guides zones de sécurité (overlay ou calque) | P6 |
| `ppro_stabilize` ✦ | W | `clipIds[]`, `method?` | Warp Stabilizer | P6 |

### A5. Graphiques, texte, MOGRT, sous-titres
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `ppro_insert_mogrt` | W | `path`, `time`, `duration`, `track`, `params{name: value}` | Insère un MOGRT et règle ses propriétés (texte, couleurs) | P2 |
| `ppro_list_mogrt_params` | R | `path` ou `clipId` | Paramètres exposés d'un MOGRT | P2 |
| `ppro_set_mogrt_params` | W | `clipId`, `params{}` | Met à jour un MOGRT placé | P2 |
| `ppro_add_text` | W | `text`, `time`, `duration`, `track`, `style?{font,size,color,position,align,stroke,shadow,background}` | Calque texte Essential Graphics (ou MOGRT générique fourni) | P2 |
| `ppro_update_text` | W | `clipId`, `text?`, `style?` | Modifie un texte | P2 |
| `ppro_extract_texts` | R | `sequenceId?` | Tous les textes de la séquence (relecture orthographique, traduction) | P2 |
| `ppro_add_shape` ✦ | W | `type` (rect/ellipse), `time`, `duration`, `style` | Formes (fonds, bandeaux) | P6 |
| `ppro_add_image_overlay` | W | `path`, `time`, `duration`, `track`, `transform?` | Place une image (emoji, logo, PNG généré) avec transformation | P3 |
| `ppro_import_captions` | W | `srtPath`, `track?`, `format?` (subtitle/CEA-608), `style?` | Importe des sous-titres (piste de légendes) | P2 |
| `ppro_export_captions` | R | `sequenceId?`, `format: "srt"\|"vtt"\|"txt"`, `path` | Exporte les légendes | P2 |
| `ppro_get_captions` | R | — | Légendes en JSON (texte, start, end) | P2 |
| `ppro_set_captions` ✦ | W | `edits[{index, text?, start?, end?}]` | Corrige des légendes | P6 |
| `ppro_captions_to_graphics` | W | `style`, `wordsPerLine?`, `highlight?` | Convertit en graphiques animés (captions « TikTok ») | P3 |
| `ppro_burn_captions` ✦ | W | — | Active l'incrustation à l'export | P6 |

### A6. Audio
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `ppro_get_audio_info` | R | `tracks?` | Niveaux, gain, mute/solo, effets audio, clips par piste | P2 |
| `ppro_set_clip_gain` | W | `clipIds[]`, `gainDb` ou `normalizeTo` | Gain / normalisation | P2 |
| `ppro_set_volume_keyframes` | W | `clipId`, `keyframes[{t, db}]` | Automation de volume (ducking manuel) | P2 |
| `ppro_auto_duck` ✦ | W | `musicTrack`, `voiceTracks[]`, `reductionDb`, `fade` | Ducking par analyse des plages de voix | P3 |
| `ppro_mute_ranges` | W | `ranges[]`, `tracks`, `mode: "mute"\|"bleep"\|"silence"` | Coupe/bip sur des plages (auto-bleep) | P3 |
| `ppro_add_audio_effect` | W | `clipIds[]` ou `track`, `effect`, `params?` | Effets audio (DeNoise, Parametric EQ, Compressor…) | P2 |
| `ppro_set_track_volume` | W | `track`, `db` | Volume de piste | P2 |
| `ppro_place_sfx` | W | `items[{path, time, track?, gainDb?}]` | Place des sons | P3 |
| `ppro_export_audio` | R | `range?`, `tracks?`, `preset?`, `format?` | Exporte l'audio (wav mono 16 kHz pour transcription, stems séparés…) → chemin | P1 |
| `ppro_audio_tag_speech` ✦ | W | `clipIds[]`, `type: "dialogue"\|"music"\|"sfx"` | Essential Sound : étiquetage | P6 |

### A7. Marqueurs
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `ppro_get_markers` | R | `sequenceId?` ou `nodeId?` | Marqueurs de séquence ou de clip | P2 |
| `ppro_add_markers` | W | `markers[{start, end?, name, comment?, type?, color?}]` | Ajout par lot (chapitres, beats, hooks) | P2 |
| `ppro_remove_markers` | W | `filter{name?, color?, range?}` | Suppression filtrée | P2 |
| `ppro_export_chapters` ✦ | R | `format: "youtube"\|"json"` | Texte de chapitres YouTube prêt à coller | P6 |

### A8. Export et images
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `ppro_export_frame` | R | `time?` (défaut tête de lecture), `path?`, `format: "png"\|"jpg"`, `size?` | Image fixe → chemin (l'agent peut la regarder) | P1 |
| `ppro_export_frames` | R | `times[]` ou `every: 2.0`, `size?` | Planche d'images pour analyse visuelle (B-roll, couleur, qualité) | P3 |
| `ppro_export_range` | R | `start?`, `end?`, `preset` (.epr), `path`, `queue?: "ame"` | Rendu d'une plage (direct ou via Media Encoder) | P2 |
| `ppro_export_sequence` | R | `preset`, `path`, `queue?` | Rendu complet | P2 |
| `ppro_list_export_presets` | R | — | Presets `.epr` du dépôt + presets utilisateur | P2 |
| `ppro_export_xml` ✦ | R | `format: "fcpxml"\|"xmeml"\|"edl"\|"otio"`, `path` | Échange avec d'autres outils | P6 |
| `ppro_import_xml` | W | `path` | Importe une séquence XML (coupes calculées hors Premiere) | P2 |
| `ppro_render_preview` ✦ | W | `range?` | Rendu des prévisualisations | P6 |

### A9. Sécurité, UI, divers
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `ppro_checkpoint` | W | `label?` | Duplique la séquence active en `__ckpt_<n>_<label>` dans un chutier `_adobe-mcp` ; renvoie `checkpointId` | P1 |
| `ppro_rewind` | D | `checkpointId` ou `last` | Restaure (réactive la copie, renomme) | P1 |
| `ppro_list_checkpoints` / `ppro_prune_checkpoints` | R/D | `keep?` | Gestion | P2 |
| `ppro_undo` ✦ | D | `steps?` | Undo natif (via QE/menu) quand disponible | P6 |
| `ppro_alert` | W | `message` | Boîte de dialogue dans Premiere | P1 |
| `ppro_pick_file` | W | `type: "file"\|"folder"`, `filter?` | Ouvre un sélecteur de fichier côté utilisateur | P2 |
| `ppro_open_in_source_monitor` ✦ | W | `nodeId`, `time?` | Affiche un média | P6 |
| `ppro_run_script` | D | `code` | ExtendScript arbitraire, **désactivé par défaut** (`allowScript`) | P1 |
| `ppro_get_capabilities` | R | — | Version, pont (CEP/UXP), fonctions disponibles | P1 |

---

## B. After Effects — `aeft_*`

### B1. Projet et compositions
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `aeft_get_project` | R | — | Nom, chemin, items, comp active, version | P4 |
| `aeft_list_items` | R | `folder?`, `type?` | Comps, footage, dossiers | P4 |
| `aeft_import` | W | `paths[]`, `folder?`, `sequence?`, `asComp?` (fichiers AI/PSD en calques) | Import | P4 |
| `aeft_create_folder` / `aeft_move_items` / `aeft_rename_item` | W | … | Organisation | P4 |
| `aeft_list_comps` | R | — | Compositions (id, nom, durée, fps, taille) | P4 |
| `aeft_get_comp` | R | `compId?`, `depth?`, `includeProperties?[]`, `includeKeyframes?`, `includeExpressions?` | Arbre complet calques → propriétés | P4 |
| `aeft_create_comp` | W | `name`, `width`, `height`, `fps`, `duration`, `bg?` | Nouvelle comp | P4 |
| `aeft_set_comp_settings` | W | `compId`, `…` | Réglages | P4 |
| `aeft_open_comp` | W | `compId` | Ouvre dans le visualiseur | P4 |
| `aeft_set_work_area` / `aeft_set_current_time` | W | `start`, `end` / `time` | Zone de travail, tête de lecture | P4 |
| `aeft_precompose` | W | `layerIds[]`, `name`, `moveAttributes?` | Précomposition | P4 |
| `aeft_save_project` / `aeft_open_project` | W | `path?` | Fichier | P4 |
| `aeft_reduce_project` / `aeft_collect_files` ✦ | W | … | Nettoyage/archivage | P6 |

### B2. Calques
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `aeft_add_layer` | W | `compId`, `type: "solid"\|"text"\|"shape"\|"null"\|"adjustment"\|"camera"\|"light"\|"footage"\|"comp"`, `name?`, `params{}` | Crée un calque | P4 |
| `aeft_duplicate_layer` / `aeft_delete_layers` | W/D | `layerIds[]` | | P4 |
| `aeft_set_layer` | W | `layerId`, `name?`, `inPoint?`, `outPoint?`, `startTime?`, `enabled?`, `solo?`, `shy?`, `locked?`, `parent?`, `blendMode?`, `is3D?`, `motionBlur?`, `label?`, `trackMatte?` | Attributs | P4 |
| `aeft_reorder_layer` | W | `layerId`, `index` | Ordre d'empilement | P4 |
| `aeft_set_text` | W | `layerId`, `text`, `font?`, `size?`, `fill?`, `stroke?`, `tracking?`, `leading?`, `justification?`, `boxSize?` | Texte source et style (TextDocument) | P4 |
| `aeft_add_text_animator` ✦ | W | `layerId`, `properties{}`, `rangeSelector{}` , `keyframes?` | Animateurs de texte (typo cinétique) | P4 |
| `aeft_add_shape` | W | `layerId` ou `compId`, `shape: "rect"\|"ellipse"\|"path"`, `points?`, `fill?`, `stroke?`, `trimPaths?`, `repeater?` | Contenus de calque de forme | P4 |
| `aeft_set_mask` ✦ | W | `layerId`, `path[]`, `mode?`, `feather?` | Masques | P6 |
| `aeft_split_layer` ✦ | W | `layerId`, `time` | Scinde | P6 |
| `aeft_time_remap` ✦ | W | `layerId`, `keyframes[]` | Remappage temporel | P6 |

### B3. Propriétés, keyframes, expressions
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `aeft_get_property` | R | `layerId`, `path` (ex. `"Transform.Position"` ou `"Effects.Gaussian Blur.Blurriness"`) | Valeur, keyframes, expression | P4 |
| `aeft_set_property` | W | `layerId`, `path`, `value`, `at?` | Valeur fixe ou image-clé | P4 |
| `aeft_set_keyframes` | W | `layerId`, `path`, `keyframes[{t, value, inInterp?, outInterp?, easeIn?, easeOut?, spatialTangents?}]`, `replace?` | Animation complète avec courbes | P4 |
| `aeft_clear_keyframes` | W | `layerId`, `path`, `range?` | | P4 |
| `aeft_set_expression` | W | `layerId`, `path`, `expression`, `enabled?` | Expression JS écrite par l'agent | P4 |
| `aeft_validate_expression` ✦ | R | `layerId`, `path`, `expression` | Teste sans appliquer, renvoie l'erreur AE | P4 |
| `aeft_bake_expression` ✦ | W | `layerId`, `path`, `step?` | Convertit en keyframes | P6 |
| `aeft_apply_ease` ✦ | W | `layerId`, `path`, `preset: "easeInOut"\|"overshoot"\|"bounce"\|custom` | Courbes d'accélération | P4 |
| `aeft_essential_props` ✦ | R/W | `compId`, `add{layerId, path, name}` | Propriétés essentielles (base des MOGRT) | P6 |

### B4. Effets, 3D, rendu
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `aeft_list_effects` | R | `search?` | Effets installés (matchName) | P4 |
| `aeft_apply_effect` | W | `layerIds[]`, `effect`, `params?` | | P4 |
| `aeft_remove_effect` | W | `layerId`, `effectIndex` | | P4 |
| `aeft_apply_preset` | W | `layerIds[]`, `ffxPath` | Presets d'animation `.ffx` | P4 |
| `aeft_set_camera` ✦ | W | `layerId`, `position`, `pointOfInterest`, `zoom`, `dof?` | Caméra 3D | P6 |
| `aeft_render_queue_add` | W | `compId`, `outputModule`, `renderSettings?`, `path`, `range?` | Ajoute à la file d'attente | P4 |
| `aeft_render` | W | `wait?` | Lance le rendu (ou `aerender` externe) | P4 |
| `aeft_export_frame` | R | `compId`, `time`, `path` | Image PNG pour contrôle visuel | P4 |
| `aeft_export_mogrt` ✦ | W | `compId`, `path` | Exporte un Motion Graphics Template pour Premiere | P6 |
| `aeft_add_to_ame` ✦ | W | `compId`, `preset` | Envoi à Media Encoder | P6 |

### B5. Sécurité, UI, divers
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `aeft_checkpoint` / `aeft_rewind` | W/D | `label?` / `checkpointId` | Duplique la comp (et optionnellement « Enregistrer sous » incrémental) | P4 |
| `aeft_undo_group` | W | `name`, `calls[]` | Regroupe plusieurs appels dans un seul Undo AE (`app.beginUndoGroup`) | P4 |
| `aeft_purge` ✦ | W | — | Vide les caches | P6 |
| `aeft_run_script` | D | `code` | ExtendScript arbitraire, désactivé par défaut | P4 |
| `aeft_get_capabilities` | R | — | | P4 |

### B6. Dynamic Link
| Tool | Niv. | Paramètres | Description | Ph. |
|---|---|---|---|---|
| `ppro_replace_with_ae_comp` ✦ | W | `clipIds[]`, `compName?` | « Remplacer par une composition After Effects » | P6 |
| `ppro_import_ae_comp` ✦ | W | `aepPath`, `compName`, `time`, `track` | Place une comp AE dans Premiere | P6 |

---

## C. Média et analyse (workers locaux) — `media_*`

| Tool | Paramètres | Sortie | Ph. |
|---|---|---|---|
| `media_probe` | `path` | Flux, codecs, durée, fps, résolution, loudness intégrée | P3 |
| `media_transcribe` | `path`, `language?`, `model?`, `wordTimestamps: true`, `diarize?` | `{segments[{start,end,text,speaker?,words[{w,start,end,conf}]}]}` + `srt` + `txt` | P3 |
| `media_detect_silences` | `path`, `minDuration`, `noiseDb`, `padding?` | `[{start,end}]` + plages de parole | P3 |
| `media_detect_fillers` ✦ | `transcript`, `lang` | Plages de « euh », répétitions, faux départs (via transcript + règles) | P3 |
| `media_separate_stems` | `path`, `stems: 2\|4\|6` | Chemins voix/musique/basse/batterie | P3 |
| `media_detect_beats` | `path`, `tempoHint?` | BPM, temps forts, downbeats, sections (intro/drop) | P3 |
| `media_detect_scenes` | `path`, `threshold?` | Changements de plan `[{start,end}]` | P3 |
| `media_extract_frames` | `path`, `every?` ou `times[]`, `size?` | Dossier de PNG (analyse visuelle par l'agent) | P3 |
| `media_contact_sheet` ✦ | `frames[]`, `cols` | Une seule image mosaïque annotée (moins de tokens pour « voir » 30 plans) | P3 |
| `media_loudness` | `path`, `target: -14` | Mesure EBU R128 + gain à appliquer | P3 |
| `media_normalize_audio` | `path`, `target`, `out` | Fichier normalisé | P3 |
| `media_denoise` ✦ | `path`, `strength` | ffmpeg `afftdn` / RNNoise | P6 |
| `media_convert` | `path`, `out`, `codec?`, `size?`, `fps?`, `trim?` | Transcodage, proxys, GIF | P3 |
| `media_waveform_image` ✦ | `path`, `range` | PNG de forme d'onde (visualisation pour l'agent) | P6 |
| `media_detect_faces` ✦ | `frames[]` | Boîtes de visages par image (recadrage vertical intelligent) | P6 |
| `media_ocr_frames` ✦ | `frames[]` | Texte présent à l'écran (ex. texte affiché à l'écran) | P6 |
| `media_match_music` ✦ | `voiceRanges`, `beats` | Propose des points de coupe alignés sur les beats | P3 |

## D. Génération (adaptateurs optionnels, clés utilisateur) — `gen_*`

| Tool | Description | Ph. |
|---|---|---|
| `gen_image` | Image à partir d'un prompt (API tierce / modèle local) → PNG | P6 |
| `gen_video_clip` | Court clip vidéo généré | P6 |
| `gen_sfx` | Effet sonore à partir d'une description | P6 |
| `gen_tts` | Voix off (ElevenLabs / Kokoro / Piper local) → WAV + timestamps | P6 |
| `gen_music` ✦ | Musique de fond (Stable Audio / Suno API) | P6 |
| `gen_translate` ✦ | Traduction de sous-titres (par l'agent lui-même, pas d'API externe) | — |

## E. Ressources et prompts MCP

- Ressources : `adobe://ppro/project`, `adobe://ppro/active-sequence`, `adobe://aeft/active-comp`, `adobe://logs/last-session`, `adobe://checkpoints` — permettent à l'agent de « consulter » l'état sans appel de tool.
- Prompts MCP (gabarits) : `jump-cut`, `captions`, `chapters`, `vertical-cut`, `beat-edit`, `color-match`, `podcast-multicam` — chacun lance la recette correspondante de `04-fonctionnalites-recettes.md` avec les bons paramètres.
