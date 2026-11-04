---
name: adobe-editing
description: Monter une vidéo dans Adobe Premiere Pro ou créer des animations dans After Effects via les tools MCP `ppro_*`, `aeft_*`, `media_*`. À charger dès qu'une demande concerne une timeline, une séquence, une composition, des sous-titres, un jump cut, un export ou un rendu Adobe.
---

# Monter avec adobe-mcp

Ce skill porte les règles permanentes et les enchaînements de base. Pour le savoir-faire de monteur (chiffres, critères, erreurs à éviter), charger **en plus** le skill du domaine concerné :

| Demande | Skill à charger |
|---|---|
| rythme, coupes, continuité, structure, dérushage | `montage-fondamentaux` |
| vidéo YouTube longue, rétention, hook, B-roll, zooms, chapitres | `montage-youtube-retention` |
| Shorts, TikTok, Reels, vertical, 9:16, sous-titres mot à mot | `montage-vertical-shorts` |
| gaming, stream, VOD, highlights, edit sur musique, speed ramp | `montage-gaming-stream` |
| niveaux, LUFS, voix, musique, ducking, SFX, nettoyage audio | `audio-montage` |
| couleur, Lumetri, LUT, étalonnage, match caméras, LOG | `couleur-etalonnage` |
| titres, lower thirds, texte à l'écran, sous-titres, MOGRT | `titres-texte-sous-titres` |
| transitions, effets Premiere, keyframes, stabilisation, masques | `transitions-effets-premiere` |
| animation, motion design, expressions, typo cinétique (After Effects) | `after-effects-motion-design` |
| tracking, effets sur un visage, détourage, fond vert, Dynamic Link | `after-effects-effets-video` |
| interview, podcast, talking head, multicam | `interview-podcast-multicam` |
| export, bitrate, presets plateforme, proxys, organisation du projet | `export-livraison-workflow` |

Chaque skill de domaine marque les outils `[existant]` ou `[prévu]` : n'annoncer que ce qui est `[existant]` comme faisable immédiatement, et proposer le guidage manuel (section « Comment un humain le fait ») pour le reste.

## Ce que le pont sait faire (résumé)

- **Lecture** : projet, chutiers et médias (`ppro_list_items`), séquences, timeline (`ppro_get_sequence`, avec `range`/`tracks`), séquence active et sélection (`ppro_get_active_sequence`), effets et images-clés d'un clip (`ppro_get_clip_effects`), marqueurs, presets d'export, infos audio.
- **Montage** : coupes à l'image près (`ppro_cut_at`), suppression/conservation de plages avec fermeture des trous (`ppro_remove_ranges`, `ppro_keep_ranges`), supprimer/désactiver/déplacer/rogner des clips, lier/délier, vitesse, placement de médias (`ppro_insert_clip`, `ppro_place_clips`), sons (`ppro_place_sfx`), pistes, séquences (créer, dupliquer, extraire une plage, Auto Reframe vertical).
- **Effets** : appliquer et régler n'importe quel effet (`ppro_apply_effect`, `ppro_set_effect_params`), animer (`ppro_set_keyframes`), transformations et punch-in, transitions, Lumetri, Warp Stabilizer, volume et automation, MOGRT (insérer, lire, modifier).
- **Export et analyse** : image(s) fixe(s), audio WAV (`ppro_export_audio`) puis `media_detect_silences`, `media_loudness`, `media_probe`, planche-contact (`media_contact_sheet`), transcription si un Whisper local est installé (`media_transcribe`, vérifier avec `media_transcribe_status`), rendu d'une plage ou de la séquence (`ppro_export_sequence`, `ppro_export_range`, direct ou Media Encoder).
- **After Effects** : comps, calques (solide, texte, forme, nul, calque d'effets, métrage), texte et style, formes avec Trim Paths, propriétés et images-clés avec easing, expressions (tester avant de poser), effets, précomposition, rendu, propriétés essentielles et export MOGRT.
- **Dynamic Link** : `ppro_replace_with_ae_comp` (équivalent du clic droit « Remplacer par une composition After Effects », les deux panneaux ouverts), `ppro_import_ae_comp`.
- **Pas encore** : texte Essential Graphics créé de zéro dans Premiere (passer par un MOGRT, ou créer le texte dans After Effects puis Dynamic Link / export MOGRT), calque d'effets créé de zéro (demander à l'utilisateur de le créer puis `ppro_insert_clip`), détection de beats/scènes/visages, séparation de stems, masques et tracking dans AE.

## Règles permanentes

1. **Lire avant d'écrire.** Commencer par `ppro_get_capabilities` (hôte connecté ? version ?) puis `ppro_get_sequence` (ou `aeft_get_comp`). Ne jamais supposer l'état de la timeline. Les identifiants de clips `"V1/3"` changent après chaque coupe ou suppression : relire avant d'enchaîner.
2. **Annoncer le plan avant toute action destructive** (coupes, suppressions, remplacement, rewind) : nombre de coupes/plages, clips touchés, durée avant/après (`dryRun: true` le calcule). Attendre l'accord sauf si l'utilisateur a dit de ne pas demander.
3. **Checkpoint** avant chaque lot destructif (automatique sur `ppro_cut_at`, `ppro_remove_ranges`, `ppro_delete_clips`, `ppro_replace_with_ae_comp`) ; `ppro_checkpoint {label}` avant un lot d'effets ; proposer `ppro_rewind` à la fin.
4. **Vérifier** après l'action : relire la structure (`ppro_get_sequence {range}`) ou exporter une image (`ppro_export_frame`, `ppro_export_frames` + `media_contact_sheet`) et comparer au résultat attendu. Signaler tout écart.
5. **Temps en secondes**, jamais en timecode dans les paramètres. Le pont aligne lui-même sur l'image la plus proche (`frameTicks`, `fps` dans `ppro_get_sequence`).
6. **Gros résultats** : limiter avec `range` et `tracks`. Une séquence de 2 h se lit par tranches.
7. **Noms localisés** : effets et paramètres acceptent anglais/français courants ; en cas d'échec, `ppro_list_effects` / `ppro_get_clip_effects` / `aeft_get_comp {depth: 2}` donnent les noms exacts.
8. Les workers `media_*` reçoivent des **chemins de fichiers** : exporter d'abord (`ppro_export_audio`, `ppro_export_frames`) puis analyser. Les temps renvoyés sont ceux du fichier : si l'audio vient d'une plage `[a, b]`, passer `offset: a`.
9. Opérations longues (export, Auto Reframe, remplacement AE) : prévenir que Premiere se fige pendant l'opération.

## Recettes

### Jump cut (silences)
```
ppro_get_sequence
ppro_export_audio {tracks: ["A1"] (la voix), range?}        → wav
media_detect_silences {path, minDuration: 0.5, noiseDb: entre levels.p10 et p90, padding: 0.08, offset?}
→ présenter : N plages, X s gagnées, durée avant/après
ppro_remove_ranges {ranges: silences, tracks: "all", ripple: true}   (checkpoint auto)
ppro_get_sequence {range: [0, 30]} pour vérifier le début
```
Variante « écouter d'abord » : `ppro_disable_clips {ranges}` puis `ppro_remove_disabled_clips {ripple: true}`.

### Captions
```
ppro_export_audio → media_transcribe (si moteur local) ; sinon l'utilisateur transcrit dans Premiere et exporte un SRT
segmenter : ≤ 42 caractères/ligne, 2 lignes, 1–6 s, couper sur la ponctuation → écrire le .srt
ppro_import_captions {path, time: 0}
relecture : noms propres, chiffres
```

### Chapitres YouTube
```
transcript ou structure → 3–8 chapitres, titres courts
ppro_add_markers {markers: [{start, name, type: "Chapter"}]} → ppro_export_chapters
```

### Auto-zoom
```
transcript + énergie vocale → instants d'emphase (1 toutes les 8–15 s max)
ppro_punch_in {clipId, ranges: [{start, end, scale: 112}], ease: "cut"}
alterner zoom in / retour, jamais deux zooms consécutifs sur < 3 s ; vérifier par ppro_export_frame
```

### Montage rythmé sur musique
```
ppro_import_media {musique} → ppro_insert_clip {audioTrack: "A2"} ; beats : l'utilisateur pose des marqueurs (M) ou donne le BPM
ppro_export_frames {every: 2} sur les rushes → media_contact_sheet → choisir les plans
ppro_checkpoint → ppro_place_clips {items alignés sur les beats}
ppro_set_clip_speed sur 2–3 moments clés ; ppro_add_markers {drop, build-up} ; vérification visuelle
```

### Montage vertical
```
ppro_extract_range_to_sequence {start, end, name}
ppro_reframe_vertical {aspect: "9:16", motion: "slower"}   ou ppro_set_transform {scale: 177.8, position}
captions (recette) ; ppro_export_frames → media_contact_sheet pour contrôler le cadrage
ppro_export_sequence {preset: "1080x1920|vertical|9:16"}
```

### Color grade / match
```
ppro_export_frames {une par clip} → media_contact_sheet
analyser exposition/dominante → ppro_set_lumetri {clipIds, basic: {...}} par groupe de clips
nouvelle planche-contact → comparer
```

### Mix audio
```
ppro_get_audio_info ; ppro_export_audio {tracks: ["A1"]} → media_loudness {target: -16}
ppro_set_clip_volume {clipIds: voix, db: gainToTargetDb}, {musique → ~12 dB sous la voix}
ducking manuel : ppro_set_volume_keyframes {clipId: musique, keyframes: [{t, db}]} aux plages de parole (media_detect_silences → speech)
```

### B-roll
```
ppro_list_items {type: "video"} → ppro_import_media si besoin
pour chaque phrase à illustrer : ppro_insert_clip {nodeId, time, videoTrack: "V2", inPoint, outPoint, mode: "overwrite", includeAudio: false}
```

### After Effects — animation à partir d'une description
```
aeft_create_comp {name, 1920x1080, fps, duration}
aeft_add_layer {type: "text", params: {text}} → aeft_set_text {font, size, fill}
aeft_set_keyframes {path: "Transform.Opacity", keyframes: [{t: 0, value: 0}, {t: 0.4, value: 100}]} (ease par défaut)
aeft_validate_expression avant aeft_set_expression
aeft_export_frame à 3 instants (début / milieu / fin) → regarder → corriger
aeft_essential_props + aeft_export_mogrt → ppro_insert_mogrt ; ou ppro_import_ae_comp
```
Briques : titre cinétique (position + opacité, ease out 0.4 s), lower third (`aeft_add_shape` rect + texte, Trim Paths), compteur (expression `Math.round(linear(time, t0, t1, a, b))`), HUD (score, timer).

### Remplacer un clip par une composition After Effects
```
After Effects ouvert + panneau Adobe MCP (aeft_get_capabilities)
ppro_replace_with_ae_comp {clipId}      (checkpoint auto ; comp aux mêmes in/out, projet AE enregistré)
aeft_get_comp {compId} → travailler (effets, tracking à la main, texte…) → aeft_save_project
si la lecture saccade : l'utilisateur fait clic droit > Rendu et remplacement
```

## Dépannage

- `HOST_DISCONNECTED` : demander d'ouvrir Window > Extensions > Adobe MCP dans l'application, puis `ppro_get_capabilities`.
- `NO_ACTIVE_SEQUENCE` : `ppro_list_sequences` puis `ppro_set_active_sequence`.
- `CLIP_NOT_FOUND` : les index ont changé, relire `ppro_get_sequence`.
- `EFFECT_NOT_FOUND` / `PARAM_NOT_FOUND` : la réponse liste les noms présents ; sinon `ppro_list_effects {search}`.
- `UNSUPPORTED` : fonction absente de cette version de Premiere/AE → guidage manuel.
- `MOVE_FAILED` lors d'un `ppro_remove_ranges` : proposer `ppro_rewind` puis la variante « désactiver puis supprimer ».
- Résultat tronqué : relancer avec `range`/`tracks`.
