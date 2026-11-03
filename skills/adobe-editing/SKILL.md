---
name: adobe-editing
description: Monter une vidéo dans Adobe Premiere Pro ou créer des animations dans After Effects via les tools MCP `ppro_*`, `aeft_*`, `media_*`. À charger dès qu'une demande concerne une timeline, une séquence, une composition, des sous-titres, un jump cut, un export ou un rendu Adobe.
---

# Monter avec adobe-mcp

## Règles permanentes

1. **Lire avant d'écrire.** Commencer par `ppro_get_capabilities` (hôte connecté ? version ?) puis `ppro_get_sequence` (ou `aeft_get_comp`). Ne jamais supposer l'état de la timeline.
2. **Annoncer le plan avant toute action destructive** (`D` : coupes, suppressions, rewind) : nombre de coupes, clips touchés, durée avant/après. Attendre l'accord sauf si l'utilisateur a dit de ne pas demander.
3. **Checkpoint** avant chaque lot destructif (`ppro_checkpoint {label}`), même si `autoCheckpoint` est actif ; proposer `ppro_rewind` à la fin.
4. **Vérifier** après l'action : relire la structure (`ppro_get_sequence {range}`) ou exporter une image (`ppro_export_frame`) et comparer au résultat attendu. Signaler tout écart.
5. **Temps en secondes**, jamais en timecode dans les paramètres. Arrondir aux frames (`1/fps`) pour les coupes.
6. **Gros résultats** : limiter avec `range` et `tracks`. Une séquence de 2 h se lit par tranches.
7. **Jamais `*_run_script`** sauf demande explicite de l'utilisateur pour du développement.
8. Les workers `media_*` reçoivent des **chemins de fichiers** : exporter d'abord (`ppro_export_audio`, `ppro_export_frames`) puis analyser.

## Recettes

### Jump cut (silences)
```
ppro_get_sequence
ppro_export_audio {range?, tracks: voix, preset: "transcription"}   → wav
media_detect_silences {path, minDuration: 0.5, noiseDb: -35, padding: 0.08}
→ présenter : N plages, X s gagnées
ppro_checkpoint {label: "jump-cut"}
ppro_remove_ranges {ranges, tracks: "all", ripple: true}
ppro_get_sequence {range: [0, 30]} pour vérifier le début
```
Variante « écouter d'abord » : `ppro_disable_clips` sur les plages, puis `ppro_remove_disabled_clips`.

### Captions
```
ppro_export_audio → media_transcribe {wordTimestamps: true, language}
segmenter : ≤ 5 mots/ligne, couper aux ponctuations, ≥ 0.6 s par ligne
ppro_import_captions {srtPath}            # piste native
ou ppro_captions_to_graphics {style}      # mot-à-mot animé
ppro_extract_texts → relecture orthographe/noms propres → ppro_set_captions
```

### Chapitres YouTube
```
media_transcribe → découper en thèmes (3–8 chapitres, titres courts)
ppro_add_markers {type: "Chapter"} → ppro_export_chapters {format: "youtube"}
```

### Auto-zoom
```
transcript + énergie vocale → instants d'emphase (1 toutes les 8–15 s max)
ppro_punch_in {clipId, ranges: [{start, end, scale: 112}], ease: "easeInOut"}
alterner zoom in / retour, jamais deux zooms consécutifs sur < 3 s
```

### Montage rythmé sur musique
```
media_detect_beats {musique} → downbeats, drops
media_detect_scenes + ppro_export_frames {every: 2} sur les rushes → media_contact_sheet
choisir les plans par moment (action/réaction), 1 coupe par temps fort, plans de 0.5–2 s hors drop, < 0.5 s sur le drop
ppro_checkpoint → ppro_place_clips {items alignés sur les beats}
ppro_set_clip_speed / ppro_speed_ramp sur 2–3 moments clés
ppro_add_markers {drop, build-up}  → vérification visuelle
```

### Montage vertical
```
ppro_extract_range_to_sequence {start, end, name, aspect: "9:16"}
ppro_reframe_vertical {strategy: "face" | "center"}   (face : media_detect_faces sur frames exportées)
captions (recette) + ppro_set_safe_zones {enabled: true}
ppro_export_sequence {preset: "shorts-1080x1920"}
```

### Color grade / match
```
ppro_export_frames {une par clip, size: 640} → media_contact_sheet
analyser exposition/dominante → ppro_apply_cdl ou ppro_set_lumetri par groupe de clips
ppro_add_adjustment_layer {look global}
nouvelle contact sheet → comparer
```

### Mix audio
```
ppro_get_audio_info + media_loudness par export de piste
ppro_set_clip_gain {voix → -16 LUFS}, {musique → -28 LUFS}
ppro_auto_duck {musicTrack, voiceTracks, reductionDb: 12, fade: 0.3}
```

### B-roll automatique
```
index : ppro_list_items {type: "video"} → media_extract_frames {every: 2} → contact sheets → description par clip (sauvegarder l'index)
pour chaque phrase du transcript sans image illustrative : choisir un clip de l'index
ppro_insert_clip {mode: "overwrite", videoTrack: "V2", duration 2–4 s}
```

### After Effects — animation à partir d'une description
```
aeft_create_comp {name, 1920x1080, fps 60, duration}
aeft_add_layer / aeft_add_shape / aeft_set_text
aeft_set_keyframes {ease} ; aeft_validate_expression avant aeft_set_expression
aeft_export_frame à 3 instants (début / milieu / fin) → regarder → corriger
aeft_export_mogrt ou aeft_render ; puis ppro_insert_mogrt / ppro_import_ae_comp
```
Briques : titre cinétique (animateurs texte, position + opacité, ease out 0.4 s), lower third (forme + texte, trim paths), compteur (expression `Math.round(linear(time, t0, t1, a, b))`), HUD (score, timer).

## Dépannage

- `HOST_DISCONNECTED` : demander d'ouvrir Window > Extensions > Adobe MCP dans l'application, puis `ppro_get_capabilities`.
- `NO_ACTIVE_SEQUENCE` : `ppro_list_sequences` puis `ppro_set_active_sequence`.
- Résultat tronqué : relancer avec `range`/`tracks`.
- Fonction indisponible sur cette version : proposer l'alternative (ex. pas de QE DOM → `ppro_import_xml` avec coupes calculées).
