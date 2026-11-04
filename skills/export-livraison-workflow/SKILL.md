---
name: export-livraison-workflow
description: Exporter et livrer une vidéo depuis Premiere Pro (YouTube 1080p/1440p/4K, Shorts/TikTok/Reels, Twitch, master d'archive ProRes/DNxHR), régler codec/bitrate/profil/niveau/audio, utiliser Media Encoder, exporter une plage ou une image fixe, gérer sous-titres et loudness à l'export, vérifier le fichier rendu, et organiser le projet (chutiers, nommage, versions, proxys, Project Manager, sauvegardes, cache). Mots-clés : export, rendu, livraison, bitrate, H.264, H.265, ProRes, preset, Media Encoder, proxy, consolider, relier, archiver, autosave.
---

# Export, livraison et organisation du projet

## Quand utiliser ce skill
- L'utilisateur demande d'**exporter**, **rendre**, **livrer**, **publier** une séquence, ou pose une question de **réglages d'export** (bitrate, codec, résolution, audio, sous-titres).
- Il faut produire **plusieurs déclinaisons** (16:9 YouTube + 9:16 Shorts/TikTok/Reels + master).
- Il faut **vérifier un fichier exporté** (flou, saccades, audio d'un seul côté, mauvais fps, image déformée).
- Le projet est **désorganisé**, lent, ou doit être **archivé / déplacé** (médias hors ligne, proxys, cache, sauvegardes).
- Charger aussi `adobe-editing` (règles permanentes : lire avant d'écrire, checkpoints, vérification).

## Principes
1. **Exporter aux réglages de la séquence (Match Source) puis ne changer que le bitrate.** Un export qui change la taille ou le fps de la séquence ajoute une mise à l'échelle ou des images dupliquées (saccades). Sources : Adobe hub, Cursa.
2. **Ne jamais changer le fps à l'export.** 60→30 crée du judder, 30→60 n'ajoute aucun détail ; YouTube demande le fps d'origine. Sources : YouTube, Compresto, Clipspeed.
3. **Bitrate cible = 1,5 à 2 × le minimum YouTube ; maximum = 1,3 à 1,5 × la cible.** YouTube ré-encode : plus la source garde de détail, mieux le ré-encodage tient. Sources : YouTube, Compresto, Pixflow, clip.dor.
4. **1080p30 : jamais sous 8 Mbit/s ; 1080p60 : jamais sous 12 ; 1440p : 16/24 ; 4K : 35–45 / 53–68.** Ce sont les minima publiés par YouTube ; en dessous, blocs et dégradés sales. Source : YouTube.
5. **Gameplay et forte motion : viser le haut de la fourchette (1080p60 : 16–20 Mbit/s).** Tout le cadre bouge, le ré-encodage lisse d'abord feuillages, fumées, particules. Source : clip.dor.
6. **VBR 2 passes pour le final YouTube, VBR 1 passe pour brouillons/relectures/social, CBR uniquement sur cahier des charges ou live.** 2 passes ≈ ×1,8–2,2 en temps pour une meilleure répartition des bits. Sources : Pixflow, Cursa, Vimeo.
7. **Profil High, niveau 4.2 (1080p60), 5.1 (4K30), 5.2 (4K60).** Un niveau trop bas grise les champs taille/fps dans Premiere ; Main/Baseline compressent moins bien. Sources : Adobe hub, Puget, Compresto.
8. **Audio AAC 48 kHz stéréo, 320 kbit/s (Premiere) ; YouTube recommande 384.** 128 kbit/s ou HE-AAC dégradent audiblement. Sources : Adobe hub, YouTube, Pixflow.
9. **H.264 pour livrer, H.265 seulement si on maîtrise la lecture.** HEVC fait 25–50 % plus petit à qualité égale mais lit mal sur anciens appareils ; en HEVC baisser la cible de 25–40 %. Sources : Compresto, Pixflow.
10. **Encodage matériel pour brouillons et longs exports, logiciel pour un final où la taille compte.** 2–4× plus rapide, pas de 2 passes en matériel, perte de qualité minime. Sources : Puget, PCWorld, Compresto.
11. **Vertical : monter dans une séquence 1080×1920, pas recadrer à l'export.** Recadrer du 1080p horizontal laisse ~607 px de large à upscaler. Sources : Freevisuals, Clipspeed.
12. **Shorts = 9:16 et ≤ 180 s, détecté automatiquement.** Carré ou horizontal n'est pas classé Short. Sources : Ayrshare YouTube, Shortsync.
13. **Reels : ≤ 25 Mbit/s VBR, ≤ 1 Go, 3 s à 15 min, H.264/HEVC 4:2:0, AAC 128 kbit/s.** Au-delà, le fichier est refusé ou recompressé plus fort. Source : Ayrshare Instagram.
14. **TikTok : 1080×1920, MP4 H.264, 23–60 fps, < 10 Go, 3–600 s (API) / 30 min (Studio).** TikTok ne publie pas de bitrate conseillé ; 8–16 Mbit/s selon le fps est la pratique courante. Sources : Ayrshare TikTok, Renderforest, Clipspeed.
15. **Twitch diffuse en 1080p60 à 6 000 kbit/s CBR max.** Un montage tiré d'une VOD Twitch ne gagne rien à être exporté au-delà d'un bon 1080p60. Sources : videoengineer (guidelines Twitch), Compresto Twitch.
16. **Master d'archive en codec intermédiaire (ProRes 422 HQ / 4444 ou DNxHR dans MXF) avec audio PCM**, jamais en H.264. ProRes 422 HQ 1080p ≈ 220 Mbit/s : c'est le point de départ de toute déclinaison future. Sources : Freevisuals, Compresto, Pixflow.
17. **Sous-titres : sidecar SRT pour YouTube/Vimeo/Twitch, incrustés pour TikTok/Instagram.** Les plateformes sans piste de légendes n'affichent rien sinon. Sources : No Film School, GoTranscript.
18. **Loudness : YouTube normalise à −14 LUFS ; livrer entre −14 et −16 LUFS intégré, true peak ≤ −1 dBTP (repère).** Plus fort est abaissé, plus faible reste faible. Sources : Pixflow, skill `adobe-editing`.
19. **Toujours relire le fichier exporté hors de Premiere** (10 premières s, un passage rapide, 10 dernières s) et sonder ses propriétés. Source : Cursa.
20. **Nommer `Projet_v03_YT_1080p.mp4` : version, plateforme, format. Jamais « FINAL ».** On retrouve et on n'écrase pas. Source : Cursa.
21. **Une séquence de travail par version, un MASTER verrouillé.** Dupliquer avant un gros changement (c'est le checkpoint d'adobe-mcp). (repère)
22. **Exporter vers un SSD distinct des rushes.** Lecture et écriture sur le même disque ralentissent l'export. Source : Adobe Community FAQ.
23. **Sauvegarde auto + versions multiples activées, cache média sur SSD rapide, purge régulière.** Un plantage sans autosave coûte la session. (repère)
24. **Proxys dès que la lecture saccade (4K, H.264/HEVC 10 bits, portable)** ; l'export utilise automatiquement les originaux. (repère)
25. **Vérifier le résumé Source/Sortie du panneau Export avant de cliquer.** C'est là qu'on voit un fps ou une taille qui ne correspondent pas. Sources : Pixflow, Shotkit.

## Procédures

### P1. Export YouTube 16:9 (1080p / 1440p / 4K)
Objectif : un MP4 H.264 prêt à téléverser, sans perte visible.
1. Lire la séquence : `ppro_get_sequence` [existant] (taille, fps, durée, pistes audio).
2. Choisir la cible : 1080p si la séquence est 1080p ; 1440p/4K si la séquence l'est. Option « upscale 1440p » : exporter une séquence 1080p en 2560×1440 (Mise à l'échelle : ajuster) pour obtenir VP9/AV1 côté YouTube ; coût : fichier plus gros. Sources : clip.dor, Pixflow.
3. Choisir le preset : `ppro_list_export_presets` [existant] → preset du dépôt `youtube-1080p60` (ou 1440p/2160p) ; sinon « Match Source – Adaptive High Bitrate » puis ajuster.
4. Régler : H.264, Progressive, pixels carrés 1.0, High, niveau selon tableau, VBR 2 passes, cible/max selon tableau, AAC 48 kHz stéréo 320 kbit/s, Rec. 709. « Rendu à la profondeur maximale » et « Qualité de rendu maximale » seulement si l'export change la taille (repère ; ×2–3 en temps selon Pixflow).
5. Annoncer la durée estimée (voir P5) et lancer : `ppro_export_sequence {preset, path, queue?: "ame"}` [prévu].
6. Vérifier : P7.

### P2. Déclinaison verticale (Shorts / TikTok / Reels)
Objectif : un 1080×1920 propre par plateforme.
1. `ppro_extract_range_to_sequence {aspect: "9:16"}` [prévu] + `ppro_reframe_vertical` [existant] (recette « Montage vertical » d'`adobe-editing`). Ne pas recadrer à l'export.
2. Captions incrustées (`ppro_captions_to_graphics` ou `ppro_burn_captions` [prévu]) ; texte hors des zones d'interface bas/droite (`ppro_set_safe_zones` [prévu]).
3. Durée : Shorts ≤ 180 s ; Reels 3 s–15 min ; TikTok 3–600 s.
4. Export : H.264 MP4, 1080×1920, fps de la séquence, VBR 1 passe, cible 8–12 Mbit/s (30 fps) / 12–16 (60 fps), max +50 %, AAC 48 kHz stéréo 256–320 kbit/s. Reels : max ≤ 25 Mbit/s et fichier ≤ 1 Go.
5. Un seul master vertical, puis un export par plateforme : `ppro_export_sequence {preset: "shorts-1080x1920"}` [prévu] ×3 dans la file.
6. Vérifier : P7 + vérifier que les captions ne sont pas coupées par le cadre.

### P3. Master d'archive
Objectif : conserver une copie quasi sans perte, base de toutes les déclinaisons.
1. Dupliquer la séquence en `MASTER_<projet>_vNN` : `ppro_duplicate_sequence` [existant].
2. Export : QuickTime ProRes 422 HQ (ou 4444 si alpha) sur Mac ; MXF OP1a DNxHR HQ/HQX (ou DNxHD 185x/220x) sur Windows ; taille et fps de la séquence ; audio PCM 48 kHz. `ppro_export_sequence {preset: "master-prores-422hq"}` [prévu].
3. Stocker avec le projet consolidé (P10) ; nommer `MASTER_<projet>_vNN_<date>.mov`.
4. Vérifier : `media_probe` [existant] → codec, durée identique à la séquence, 2 canaux audio.

### P4. Export d'une plage (in/out) et lots par marqueurs
Objectif : rendre une partie de la séquence, ou N extraits en une passe.
1. Plage unique : `ppro_set_in_out {in, out}` [prévu] puis `ppro_export_range {start, end, preset, path}` [prévu] (Plage « Source In/Out »).
2. Lots : `ppro_get_markers` [existant] → pour chaque marqueur avec durée, `ppro_export_range {..., queue: "ame"}` avec nom `Projet_vNN_<marqueur>.mp4`. L'export par marqueur n'est pas natif dans Premiere : on boucle (repère).
3. Lancer la file Media Encoder une fois tous les éléments ajoutés ; l'utilisateur peut continuer à monter pendant ce temps. Source : Freevisuals.
4. Vérifier : nombre de fichiers = nombre de plages ; durée de chacun = out − in (`media_probe`).

### P5. Estimer et accélérer l'export
1. Base = encodage logiciel 1 passe. ×1,8–2,2 pour 2 passes (Pixflow). ×2–3 si Qualité de rendu maximale (Pixflow). ÷2 à ÷4 avec l'encodage matériel H.264/HEVC (Puget, PCWorld).
2. L'encodage matériel ne couvre que H.264/HEVC ; ProRes/DNx restent sur CPU (Adobe Community FAQ). Pas de VBR 2 passes en matériel : Premiere bascule en logiciel sans prévenir (PCWorld, Adobe Community).
3. VRAM conseillée : 4 Go en 1080p, 6 Go en 4K, 8 Go+ au-delà (PCWorld citant Adobe).
4. Rendre d'abord les prévisualisations des sections lourdes (`ppro_render_preview` [prévu]) et cocher « Utiliser les prévisualisations » si le format correspond (repère).
5. Si l'export doit tourner longtemps : `queue: "ame"` et proposer `ppro_alert` [existant] à la fin.

### P6. Export d'images fixes
1. `ppro_export_frame {time, format: "png", size?}` [existant] — vignette YouTube 1280×720 (Piktochart), cover Shorts 1080×1920, image de contrôle pour l'agent.
2. Pour une miniature : choisir une frame nette, sans flou de mouvement, puis `ppro_export_frames {times}` [prévu] pour proposer 3–5 candidates.
3. Vérifier : ouvrir l'image ; la résolution = celle de la séquence (moniteur Programme) (repère).

### P7. Vérifier le fichier exporté
1. `media_probe {path}` [prévu] → comparer à `ppro_get_sequence` : largeur×hauteur, fps, durée (± 1 frame), codec/profil/niveau, bitrate moyen, audio 2 canaux 48 kHz.
2. `media_loudness {path, target: -14}` [prévu] → intégré entre −16 et −14 LUFS, true peak ≤ −1 dBTP (repère).
3. `media_extract_frames {times: [1, milieu, durée-1]}` [prévu] → regarder : pas d'image noire au début/fin, pas de barres noires, pas de captions non voulues, pas d'overlay de timecode.
4. Taille de fichier ≈ (bitrate vidéo + audio) × durée / 8 ; écart > 30 % = mauvais preset (repère).
5. Demander à l'utilisateur une lecture dans un lecteur externe : 10 premières s, passage rapide, 10 dernières s (Cursa).

### P8. Mettre en ordre un projet
1. `ppro_get_project` [existant] + `ppro_list_items {recursive: true}` [prévu] → inventaire par type, fps, taille, hors ligne, inutilisé.
2. Proposer l'arborescence (voir `references/organisation-projet.md`), puis `ppro_create_bin` / `ppro_move_items` / `ppro_rename_item` [existant]. Annoncer le plan avant de déplacer.
3. Séquences : renommer `SEQ_<projet>_vNN` ; marquer le master. Signaler les séquences dont le fps ≠ fps des rushes principaux.
4. Médias hors ligne : `ppro_find_items {offline: true}` → `ppro_relink_media {searchFolder}` [prévu]. Inutilisés : lister, ne supprimer qu'avec accord.
5. `ppro_save_project` [existant]. Vérifier : nouvel inventaire sans « hors ligne », chutiers remplis.

### P9. Proxys
1. Déclencheur : lecture saccadée, 4K/HEVC 10 bits, portable, multicam. `ppro_list_items {includeMetadata: true}` → clips sans proxy.
2. `ppro_create_proxies {nodeIds, preset: "h264-1024x540"}` [prévu] (ou 1280×720 ; ProRes Proxy sur Mac) (repère sur les presets).
3. Pendant le montage : proxys actifs ; à l'export, Premiere reprend les originaux sauf si « Utiliser les proxys » est coché (repère).
4. Vérifier : `media_probe` du fichier final montre la résolution d'origine, pas 1024×540.

### P10. Consolider, relier, archiver (Project Manager)
1. Avant : P8 (tout relié), `ppro_save_project {as: "<projet>_vNN"}` [prévu].
2. Fin de projet : Project Manager « Collecter les fichiers et copier » (sans transcodage, exclure les clips inutilisés, poignées 24 images (repère)) vers un dossier d'archive ; ou « Consolider et transcoder » pour réduire. Pas de tool prévu : guider l'utilisateur (voir section humain).
3. Ajouter le master (P3), les exports livrés, les SRT, un `README` avec date, version, destinataire.
4. Vérifier : ouvrir le projet copié depuis l'archive, aucun média hors ligne.

## Paramètres de référence

### Bitrates vidéo H.264 (Mbit/s) — minima YouTube SDR et réglage conseillé Premiere
| Sortie | Min. YouTube 24–30 fps | Min. YouTube 48–60 fps | Cible / Max conseillés 30 fps | Cible / Max conseillés 60 fps |
|---|---|---|---|---|
| 720p | 5 | 7,5 | 5 / 7 | 8 / 12 |
| 1080p | 8 | 12 | 12 / 18 | 16 / 24 |
| 1440p | 16 | 24 | 20 / 30 | 30 / 45 |
| 2160p (4K) | 35–45 | 53–68 | 45 / 60 | 60 / 80 |
Sources : YouTube (minima), Compresto, Pixflow, Cursa, Freevisuals (fourchettes). HDR : 1080p 10/15, 1440p 20/30, 4K 44–56 / 66–85 (YouTube). HEVC : −25 à −40 % (Pixflow).

### Profil et niveau H.264
| Sortie | Profil | Niveau |
|---|---|---|
| 1080p ≤ 30 fps | High | 4.1 |
| 1080p 50/60 fps | High | 4.2 |
| 1440p / 4K ≤ 30 fps | High | 5.1 |
| 4K 50/60 fps | High | 5.2 |
Sources : Vimeo (4.1), Adobe hub (4.2 / 5.2), Puget (5.1→5.2 pour 3840×2160), Pixflow. YouTube exige aussi : GOP fermé = ½ fps, 2 B-frames, CABAC, 4:2:0, BT.709, atome moov en tête (MP4 « fast start »).

### Audio à l'export
| Usage | Codec | Fréq. | Canaux | Débit |
|---|---|---|---|---|
| YouTube / social | AAC-LC | 48 kHz | stéréo | 320 kbit/s Premiere (384 recommandé YouTube) |
| Relecture client | AAC | 48 kHz | stéréo | 192 kbit/s |
| Master | PCM | 48 kHz | stéréo ou 5.1 | non compressé |
| Reels | AAC | 48 kHz | mono/stéréo | 128 kbit/s |
Sources : YouTube, Compresto, Freevisuals, Ayrshare Instagram. Loudness cible : −14 LUFS (YouTube), −16 voix / −28 musique en mix (skill `adobe-editing`), EBU R128 −23 LUFS pour la diffusion TV (repère).

### Par plateforme
| Plateforme | Format | Taille | fps | Durée | Fichier | Sous-titres |
|---|---|---|---|---|---|---|
| YouTube | MP4 H.264 (HEVC/AV1 acceptés) | source, 16:9 | source (24–60) | — | ≤ 256 Go / 12 h | SRT sidecar |
| YouTube Shorts | MP4 H.264 | 1080×1920 (min 720×1280) | 30/60 | ≤ 180 s | — | incrustés + SRT |
| TikTok | MP4 H.264 (MOV/WebM) | 1080×1920 ; 360–4096 px | 23–60 | 3–600 s (API), 30 min (Studio) | < 10 Go (API 4 Go) | incrustés |
| Instagram Reels | MP4/MOV H.264 ou HEVC | 1080×1920 ; larg. ≤ 1920 | 23–60 | 3 s–15 min | ≤ 1 Go ; VBR ≤ 25 Mbit/s | incrustés |
| Twitch (live) | H.264 CBR, GOP 2 s | 1080p60 / 720p60 / 720p30 | 60/50/30 | — | 6000 / 4500 / 3000 kbit/s | — |
| Vimeo | MP4 H.264 | source | 15–60 | — | selon offre | SRT |
| Archive | ProRes 422 HQ / 4444 ; DNxHR (MXF) | séquence | séquence | — | ~220 Mbit/s 1080p (ProRes HQ) | SRT à part |
Sources : YouTube, Ayrshare (YouTube, TikTok, Instagram), Shortsync, Renderforest, videoengineer (Twitch), Vimeo, Compresto.

### Presets `.epr` attendus dans le dépôt
`youtube-1080p30`, `youtube-1080p60`, `youtube-1440p60`, `youtube-2160p60`, `shorts-1080x1920`, `reels-1080x1920`, `tiktok-1080x1920`, `review-1080p-8mbps`, `master-prores-422hq`, `master-dnxhr-hq`, `audio-wav-16k-mono` (transcription). `ppro_list_export_presets` [existant] les expose.

## Erreurs fréquentes et comment les détecter
| Symptôme | Cause probable | Détection | Correction |
|---|---|---|---|
| Image floue, blocs, dégradés sales | Bitrate sous le minimum, ou export d'un proxy | `media_probe` : bitrate < tableau ; taille 1024×540 | Relever cible/max ; désactiver proxys |
| Barres noires | Taille d'export ≠ séquence, ou 16:9 dans un preset 9:16 | frames exportées | Match Source ; séquence verticale dédiée |
| Saccades, images doublées | fps d'export ≠ fps de séquence ; 60→30 | `media_probe` fps ; lecture | Exporter au fps de la séquence |
| Image étirée / écrasée | Pixels non carrés (PAR ≠ 1.0) dans la séquence ou l'export | `media_probe` : SAR ≠ 1:1 ; largeur inattendue | Aspect « Pixels carrés 1.0 » ; Interpréter le métrage |
| Son d'un seul côté | Rush « double mono » : voix sur la gauche uniquement | forme d'onde d'un canal vide ; `media_probe` | Modifier > Canaux audio → mono ; ou Remplir à gauche/droite |
| Son trop faible sur téléphone | Mix trop bas, voix sous la musique | `media_loudness` < −18 LUFS (repère) | Remixer à −14/−16 LUFS |
| Champs taille/fps grisés | Niveau H.264 trop bas (4.0/4.1 pour du 4K ou du 60p) | Panneau Export | Niveau 4.2 / 5.1 / 5.2 |
| Export très lent | 2 passes + Qualité max + logiciel ; disque unique | durée estimée | Matériel pour brouillon ; SSD distinct ; file AME |
| Captions incrustées non voulues | Piste de légendes visible à l'export (bug connu v15–25) | frame exportée | Masquer la piste (œil) avant export ; Légendes : Aucune |
| Couleurs délavées | Espace colorimétrique ≠ Rec. 709 ; HLG/Log non converti | frame exportée | Export en Rec. 709 ; conformer SDR |
| Dérive audio/vidéo | Fréquence d'échantillonnage mixte ; source à fps variable | lecture fin de fichier | Séquence 48 kHz ; convertir la source en fps constant |
| Fichier refusé | > 1 Go Reels, > 25 Mbit/s, > 180 s Short, horizontal en Short | `media_probe` | Respecter le tableau plateforme |
| Mauvaise version livrée | Fichier « FINAL » écrasé | nom sans vNN | Nommage `Projet_vNN_PLAT_FMT` |
Sources : Cursa, Freevisuals, Clipspeed, Compresto, Vimeo, Adobe Community (captions), YouTube.

## Contrôle qualité (avant de livrer)
- [ ] `media_probe` : taille, fps, durée, codec/profil/niveau, bitrate, 2 canaux 48 kHz = attendus.
- [ ] Loudness intégré −16 à −14 LUFS, true peak ≤ −1 dBTP (repère) ; pas d'écrêtage.
- [ ] Frames début / milieu / fin : pas de noir, pas de barres, pas d'overlay, texte dans la zone sûre.
- [ ] Captions : incrustées si TikTok/IG ; SRT non vide, timecodes croissants, orthographe relue (`ppro_get_captions`).
- [ ] Nom `Projet_vNN_PLAT_FMT.ext`, dossier `05_Exports/<date>/<plateforme>/`.
- [ ] Master d'archive exporté et projet sauvegardé en version.
- [ ] Lecture humaine hors Premiere : 10 s début, passage rapide, 10 s fin.
- [ ] Pour YouTube : chapitres (`ppro_export_chapters`), vignette 1280×720 exportée.

## Comment un humain le fait dans Premiere Pro
- **Ouvrir l'export** : `Ctrl+M` / `Cmd+M`, ou onglet **Exporter** en haut à gauche (mode Export depuis la v22), ou Fichier > Exporter > Média. À gauche : destinations (Fichier, YouTube…) ; au centre : Nom, Emplacement, Préconfiguration, Format, puis sections Vidéo / Audio / Légendes / Effets / Métadonnées / Général ; en bas : résumé **Source / Sortie** et **Plage** (Séquence entière, In/Out de la séquence, Zone de travail, Personnalisé). Boutons **Exporter** (rend dans Premiere) ou **Envoyer vers Media Encoder** (file d'attente, Premiere reste libre).
- **Plage** : `I` / `O` dans la timeline, puis Plage = In/Out de la séquence.
- **Match Source** : section Vidéo, bouton « Faire correspondre à la source » ou cases cochées « Faire correspondre » par champ (taille, fps, trame, aspect) ; décocher un champ pour le régler.
- **Bitrate** : Vidéo > Plus > Paramètres de débit : Encodage (CBR, VBR 1 passe, VBR 2 passes), Débit cible, Débit maximum. **Profil / Niveau** : Paramètres d'encodage. **Encodage matériel / logiciel** : Performances d'encodage. **Rendu à la profondeur maximale** et **Qualité de rendu maximale** : en bas de Vidéo / Général.
- **Audio** : Format AAC, Codec AAC (pas HE-AAC), 48000 Hz, Stéréo, Qualité Élevée, Débit 320.
- **Légendes** : section Légendes > Options d'exportation : Aucune / Créer un fichier sidecar (.srt, .scc, .vtt…) / Incruster dans la vidéo / Intégrer. Masquer la piste (œil) si on ne veut rien d'incrusté. Export SRT seul : panneau Légendes > menu ⋯ > Exporter vers un fichier SRT.
- **Loudness** : section Effets > Normalisation de la sonie : norme (ITU BS.1770-3, EBU R128, ATSC A/85), cible LUFS, tolérance, crête maximale (repère sur les champs).
- **Overlays à désactiver** : Effets > Incrustation d'image / de nom / de timecode, LUT Lumetri (Vimeo les recommande décochés).
- **Image fixe** : icône appareil photo du moniteur Programme, `Ctrl+Maj+E` / `Maj+E` ; formats PNG, JPEG, TIFF, DPX, BMP, Targa, OpenEXR ; case « Importer dans le projet » (repère).
- **Media Encoder** : fenêtre File d'attente ; `+` ou glisser une séquence ; Fichier > Ajouter une séquence Premiere Pro ; dupliquer un élément pour une autre préconfiguration ; bouton lecture vert pour lancer ; dossiers de contrôle pour un transcodage automatique.
- **Preset personnalisé** : icône ⋯ à côté de la préconfiguration > Enregistrer la préconfiguration (`.epr`), importable dans AME.
- **Proxys** : clic droit sur les clips > Proxy > Créer des proxys (H.264 basse résolution, ProRes Proxy, Cineform) ; ou Paramètres d'acquisition du panneau Projet (Copier / Transcoder / Créer des proxys) ; bouton **Activer/désactiver les proxys** à ajouter au moniteur Programme via l'éditeur de boutons.
- **Relier** : clic droit > Relier le média… > Localiser ; cocher « Relier les autres automatiquement ». Fichier > Project Manager pour collecter / consolider et transcoder (exclure les clips inutilisés, poignées, renommer les médias, calculer la taille).
- **Sauvegardes** : Préférences > Enregistrement automatique (intervalle, nombre de versions, copie Creative Cloud) ; `Ctrl+S` souvent ; Fichier > Enregistrer une copie avant un gros changement ; dossier « Adobe Premiere Pro Auto-Save » à côté du projet (repère).
- **Cache et aperçus** : Préférences > Cache de média (emplacement sur SSD, Supprimer les fichiers inutilisés, suppression automatique) ; Séquence > Rendu de l'entrée à la sortie (`Entrée`) ; Séquence > Supprimer les fichiers de rendu.

Détails d'organisation (arborescence de chutiers, nommage, versions, Project Manager, proxys, sauvegardes, cache) : `references/organisation-projet.md`.

## Sources
1. YouTube recommended upload encoding settings — https://support.google.com/youtube/answer/1722171 — conteneur MP4 fast start, H.264 High/CABAC/GOP ½ fps, bitrates SDR/HDR par résolution et fps, AAC 48 kHz 128/384/512, fps source, BT.709.
2. Adobe — Best export settings for Premiere Pro — https://www.adobe.com/creativecloud/video/hub/guides/best-export-settings-for-premiere-pro.html — réglages par défaut (High, 4.2/5.2, VBR 1 passe, 20–30 / 60–80 Mbit/s), presets Match Source, encodage matériel et repli logiciel, AAC 320.
3. Adobe — Export settings reference — https://helpx.adobe.com/premiere/desktop/render-and-export/export-files/overview-of-export-settings.html — structure des sections d'export (vidéo, audio, légendes, métadonnées) ; corps non lisible via l'outil, utilisé pour la table des matières.
4. Adobe Community — Difference between VBR 1 pass and 2 pass — https://community.adobe.com/t5/premiere-pro-discussions/difference-between-export-vbr-1-pass-and-vbr-2-pass/m-p/13712319 — 2 passes = analyse préalable, pas de 2 passes accéléré en matériel, taille = bitrate × durée.
5. Adobe Community — Bitrate encoding VBR vs CBR — https://community.adobe.com/t5/premiere-pro/bitrate-encoding-vbr-vs-cbr/m-p/9538618 — blocs à 10–15 Mbit/s en forte motion, 20 Mbit/s fiable, 8 Mbit/s pour relectures.
6. Adobe Community FAQ — What hardware makes exporting faster — https://community.adobe.com/questions-729/faq-what-hardware-makes-exporting-encoding-and-rendering-faster-1355160 — matériel limité à H.264/HEVC, ProRes sur CPU, exporter vers un SSD distinct.
7. Adobe Community — Captions burning into video even when not selected — https://community.adobe.com/t5/premiere-pro-discussions/fixed-captions-burning-into-video-even-when-not-selected-to/m-p/14812257 — bug v15–25, masquer la piste avant export.
8. Puget Systems — GPU hardware encoding Premiere Pro 14.2 (M. Bach) — https://pugetsystems.com/?p=8863 — gains ×2–4, niveau 5.1→5.2 pour 3840×2160, perte de qualité minime.
9. PCWorld — Adobe flips on GPU-accelerated encoding — https://www.pcworld.com/article/3544027/adobe-flips-on-gpu-accelerated-encoding-for-premiere-pro-and-wow-its-fast.html — temps divisé par 2, pas de 2 passes en GPU, VRAM 4/6/8 Go.
10. Pixflow — Best export settings for YouTube in Premiere Pro — https://pixflow.net/blog/?p=91431 — table cible/max 1080p/4K, −14 LUFS YouTube, Qualité max ×2–3, liste d'erreurs.
11. Pixflow — VBR vs CBR — https://pixflow.net/blog/vbr-vs-cbr-bitrate-setting/ — temps ×1,8–2,2 en 2 passes, max ≈ 1,5× cible, HEVC −25–40 %, usages par mode.
12. Compresto — Premiere Pro export settings for small file size — https://compresto.app/blog/premiere-pro-export-settings — table 720p→4K60, max +30–40 %, HEVC −30–50 %, ProRes HQ ≈ 220 Mbit/s, erreurs fréquentes.
13. Compresto — Best bitrate for Twitch — https://compresto.app/blog/best-bitrate-for-twitch — plafond 6000 kbit/s, GOP 2 s, AAC 160, table par résolution.
14. videoengineer.net — Twitch broadcasting guidelines (reproduction) — https://videoengineer.net/pages/broadcasting_guidelines.html — 1080p60 6000 / 720p60 4500 / 720p30 3000 kbit/s CBR, keyframe 2 s, profil Main/High.
15. streamer.guide — Bitrate & encoder settings cheat sheet — https://streamer.guide/guides/bitrate-encoder-settings-cheat-sheet — Twitch 1080p60 6000 CBR High, AAC 160 kbit/s 48 kHz, YouTube live sans plafond.
16. Vimeo Help — Export from Adobe Premiere Pro — https://help.vimeo.com/hc/en-us/articles/12426058823057-Export-from-Adobe-Premiere-Pro — procédure complète onglet par onglet, High/4.1, VBR 2 passes, fourchettes par résolution, overlays à décocher, fps > 60 à diviser.
17. Shotkit — How to export video in Premiere Pro — https://shotkit.com/premiere-pro-export-video/ — I/O, Fichier > Exporter > Média, Match Source, pixels carrés, enregistrer un preset.
18. 4K Shooters — Best export settings for Premiere Pro 2023 — https://4kshooters.net/2023/04/04/best-export-settings-for-premiere-pro-in-2023 — in/out avant export, High / niveau 5.0, VBR 1 passe 30 Mbit/s, matériel pour la vitesse.
19. Freevisuals — Best export settings for Premiere Pro — https://www.freevisuals.net/post/best-export-settings-for-adobe-premiere-pro-your-ultimate-guide — tables YouTube/Reels/TikTok/client/master (ProRes, DNxHD, PCM), file AME, dépannage (barres noires, dérive audio).
20. Cursa — Premiere Pro export settings for YouTube, social and review links — https://cursa.app/en/page/premiere-pro-beginner-workflow-export-settings-for-youtube-social-and-review-links — nommage `Projet_v##_PLAT_FMT`, arborescence Exports, checklist QC, plage In/Out, erreurs (flou, saccades, banding).
21. No Film School — Burn-in captions in Premiere Pro — https://nofilmschool.com/2023/01/burn-captions-how-import-edit-export-subtitles-premiere-pro — trois options d'export, plateformes sidecar vs incrustation, réexport complet en incrustation.
22. GoTranscript — Subtitles in Premiere Pro: export settings & formats — https://gotranscript.com/blog/create-subtitles-adobe-premiere-pro-best-export-settings-formats — SRT/VTT, intégré variable selon plateforme, un SRT par langue sur YouTube.
23. Ayrshare — YouTube media guidelines — https://www.ayrshare.com/docs/media-guidelines/youtube — Shorts 9:16, 1080×1920, ≤ 3 min ; MP4/MOV, fps acceptés.
24. Ayrshare — Instagram media guidelines — https://ayrshare.com/docs/media-guidelines/instagram — Reels : 1 Go, VBR ≤ 25 Mbit/s, 23–60 fps, larg. ≤ 1920, 3 s–15 min, AAC 128, moov en tête.
25. Ayrshare — TikTok media guidelines — https://ayrshare.com/docs/media-guidelines/tiktok — 10 Go, 3–600 s, 360–4096 px, 23–60 fps, 9:16 ou 16:9.
26. Renderforest — TikTok video specs & dimensions — https://www.renderforest.com/blog/tiktok-video-specs-dimensions — 1080×1920, min 720×1280 (Studio), 30 min Studio, 4 Go API, 516 kbit/s min pubs.
27. Shortsync — YouTube Shorts upload requirements 2026 — https://shortsync.app/resources/youtube-shorts-upload-requirements-2026 — 180 s, détection auto, 12 Mbit/s 1080p, 256 Go / 12 h, HEVC accepté.
28. Piktochart — YouTube Shorts dimensions — https://piktochart.com/blog/youtube-shorts-dimensions/ — vignette 1280×720, cover 1080×1920, zones UI bas/haut, ≥ 8 Mbit/s.
29. Clipspeed — Video resolution guide for Shorts, Reels, TikTok — https://www.clipspeed.ai/blog/video-resolution-guide-shorts-reels-tiktok.html — 8–16 Mbit/s selon fps, recadrage 1080p → 607 px, erreurs (720p, 4K inutile, 30→60).
30. clip.dor.gg — Upload game video without quality loss — https://clip.dor.gg/en/blog/upload-game-video-without-quality-loss — gameplay : 1080p60 16–20 Mbit/s, plafond utile 1,5×, 1440p pour VP9/AV1, AAC 384.
31. Streamlabs — Best settings for YouTube uploads — https://streamlabs.com/ar-sa/content-hub/post/best-settings-for-youtube-uploads — MP4 H.264, 2 passes VBR, AAC-LC 384, fps source.
32. Visnalize — Instagram media specs & compression guide — https://visnalize.com/blog/instagram-media-specs-compression-guide — éviter la double compression, test privé 10 s, source VFR → CFR, texte loin des bords.
