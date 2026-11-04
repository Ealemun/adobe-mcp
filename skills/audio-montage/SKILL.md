---
name: audio-montage
description: Mixer et nettoyer l'audio d'un montage dans Premiere Pro (niveaux voix/musique/SFX, LUFS et normes par plateforme, chaîne de traitement d'une voix, ducking, placement de la musique, sound design, J-cut/L-cut, fondus audio, pops et clics, mono/stéréo, loudness meter). À charger dès qu'une demande parle de volume, de son trop fort ou trop faible, de voix à nettoyer, de musique sous la voix, de loudness, de LUFS, de bruit de fond, de sifflantes, d'effets sonores, de transition audio ou d'export pour YouTube, podcast ou diffusion TV.
---

# Audio en montage vidéo

## Quand utiliser ce skill
- L'utilisateur demande de « mixer », « équilibrer », « nettoyer », « normaliser » l'audio d'une séquence.
- Il mentionne un niveau (dB, LUFS), une plateforme cible (YouTube, podcast, TV), ou un symptôme : voix inaudible, musique trop forte, souffle, écho, « S » agressifs, saturation, pops.
- Il veut placer ou couper une musique, poser des effets sonores, faire un J-cut/L-cut, ou vérifier l'audio avant export.
- Ne pas l'utiliser seul pour les coupes de silences ou la transcription : voir `adobe-editing` (recettes jump cut, captions).

## Principes
1. **Lire avant de toucher** : `ppro_get_sequence` puis `ppro_get_audio_info` ou export + `media_loudness`. On ne règle pas un niveau qu'on n'a pas mesuré.
2. **La voix est la référence.** On la règle en premier ; musique, SFX et ambiance se placent par rapport à elle. Changer la voix après coup oblige à refaire tout le mix (ducking compris).
3. **Deux échelles à ne pas confondre** : le crête-mètre (dBFS, instantané) sert à éviter la saturation ; le LUFS (loudness intégrée) décide du niveau perçu et de ce que la plateforme fera du fichier.
4. **Jamais au-dessus de 0 dBFS**, et crête vraie ≤ −1 dBTP (≤ −2 dBTP pour YouTube, car l'encodage peut décaler les niveaux de ~2 dB). Une saturation numérique ne se répare pas.
5. **Voix : moyenne ≈ −12 dBFS, crêtes −6 à −3 dBFS.** C'est le repère commun des monteurs vidéo ; il laisse de la marge au limiteur.
6. **Musique sous la voix : 10 à 20 dB en dessous** (≈ −18 à −25 dBFS). Musique seule (sans parole) : jusqu'à ≈ −10 dBFS. La musique « bien » à l'oreille est presque toujours trop forte.
7. **SFX : −12 à −18 dBFS, jamais au-dessus de la voix** sauf impact volontaire (≈ −6 dBFS). Ambiance/room tone ≈ −30 dBFS, filtrée dans l'aigu pour rester derrière.
8. **Cible d'export selon la plateforme** : YouTube −14 LUFS, podcast −16 LUFS stéréo (−19 mono), TV Europe −23 LUFS (EBU R128), TV États-Unis −24 LKFS. Plus fort que la cible = baissé par la plateforme ; plus faible = laissé faible (YouTube ne remonte jamais).
9. **Gain de clip d'abord, compression ensuite.** Les écarts entre prises se corrigent au gain (ou Auto-Match) ; le compresseur ne sert qu'à lisser les 3 à 6 dB restants.
10. **Ordre de la chaîne voix** : nettoyage (DeNoise/DeReverb/DeHum) → coupe-bas + EQ → de-esser → compresseur → limiteur → mesure. Tout boost d'aigu se fait après le de-esser, sinon on amplifie les sifflantes.
11. **Coupe-bas systématique sur la voix** : 80 Hz (voix grave) à 100 Hz (voix aiguë), 12 dB/oct. Une voix ne produit presque rien en dessous, mais les pops et le grondement, si.
12. **Traitements de réparation légers** : réduction de bruit 6–12 dB maxi, curseur Reduce Noise d'Essential Sound à 1–2 (distorsion dès 5), de-essing ≤ 4–6 dB, compression ≤ 6 dB. Au-delà on entend l'effet (« sous l'eau », zézaiement, pompage).
13. **Ducking : −12 à −18 dB, fondus 300–800 ms.** Trop court = pompage audible ; trop long = la musique écrase le début de phrase.
14. **Creuser la musique plutôt que la baisser encore** : une cloche à −6…−12 dB entre 1 et 4 kHz (Q 2–6) libère la zone d'intelligibilité de la parole.
15. **Couper la musique sur le temps fort** (premier temps de la mesure) ou sur un coup de batterie ; jamais au milieu d'une phrase musicale. Une coupe de musique qu'on entend attire plus l'attention qu'une coupe d'image.
16. **Jamais d'arrêt sec de musique** : fondu 1–2 s (Exponential Fade) ou fin « cappée » sur la vraie fin du morceau.
17. **Impact exactement sur l'image de la coupe** ; couches secondaires (whoosh, rumble) décalées de quelques images. Un riser monte avant la coupe et s'arrête dessus. Les dizaines de millisecondes comptent.
18. **Transitions audio : Constant Power par défaut** (1 s par défaut dans Premiere, à réduire). Constant Gain seulement entre deux sons quasi identiques (room tone). Exponential Fade pour les fins de musique.
19. **Dialogue en mono, centré, sur les deux canaux.** Musique en stéréo. SFX/ambiances panoramiqués avec parcimonie. Vérifier la compatibilité mono (phase) avant de livrer.
20. **Jamais de silence absolu** entre deux phrases : combler avec du room tone (5–15 s prélevés sans parole, bouclés avec fondus 20–100 ms).
21. **Un seul loudness meter, sur la piste Mix, et on lit l'intégrée sur toute la durée.** La valeur intégrée n'a de sens qu'après lecture complète du programme.
22. **Vérifier sur deux écoutes** (casque + haut-parleurs de téléphone/portable). Les enceintes d'ordinateur mentent sur le grave et la musique.

## Procédures

### P1 — Audit audio d'une séquence
Objectif : savoir où on en est avant de toucher quoi que ce soit.
1. `ppro_get_sequence {tracks: "audio"}` [existant] : pistes, clips, durée, pistes muettes.
2. `ppro_get_audio_info` [existant] : gain, volume de piste, effets déjà posés, mute/solo.
3. `ppro_export_audio {tracks: ["A1"]}` [existant] par piste (voix, musique, SFX) → `media_loudness {path}` [prévu] ou `media_probe` [existant] : intégrée, crête vraie, LRA.
4. Résumer : écart voix/musique en LU, crêtes > −1 dBTP, pistes à −35 LUFS (probablement oubliées), clips sans étiquette Essential Sound.
Vérification : un tableau piste → LUFS / dBTP / problème présumé, présenté à l'utilisateur avant tout plan.

### P2 — Chaîne de traitement d'une voix
Objectif : voix propre, régulière, intelligible, sans effet audible.
1. `ppro_checkpoint {label: "voix"}` [existant].
2. Étiqueter : `ppro_audio_tag_speech {clipIds, type: "dialogue"}` [prévu] (ouvre les réparations d'Essential Sound).
3. Nettoyage, dans cet ordre et seulement si nécessaire : `ppro_add_audio_effect {effect: "DeHummer"}` (50/60 Hz) → `{effect: "DeNoise", params: {amount: faible}}` → `{effect: "DeReverb"}` [prévu]. Compenser la perte de niveau (ces effets baissent le clip).
4. EQ : `ppro_add_audio_effect {effect: "Parametric Equalizer", params: {HPF: 80–100 Hz, cloche −2…−4 dB à 200–400 Hz, +1…+2 dB à 2–5 kHz}}` [prévu]. Voir tableau EQ.
5. De-esser : `{effect: "DeEsser", params: {freq: 5–8 kHz, reduction: 3–6 dB}}` [prévu] (ou curseur DeEss d'Essential Sound, ou Audition si l'effet manque dans cette version).
6. Compresseur : `{effect: "Tube-modeled Compressor" | "Multiband Compressor", params: {ratio: 3:1, attack: 10 ms, release: 100 ms, threshold réglé pour 3–6 dB de réduction}}` [prévu].
7. Gain : `ppro_set_clip_volume {clipIds, normalizeTo: cible}` [prévu] pour aligner toutes les prises.
8. Limiteur sur la piste voix ou Mix : `{effect: "Hard Limiter", params: {ceiling: −1 dBTP}}` [prévu], ≤ 2–3 dB de réduction.
Vérification : `ppro_export_audio` de la piste voix → `media_loudness` : LRA resserrée, aucune crête > −1 dBTP ; écouter 10 s avec/sans effets (le « avec » ne doit pas sembler meilleur seulement parce qu'il est plus fort).

### P3 — Niveaux cibles et normalisation
Objectif : chaque famille au bon niveau, mix final à la cible plateforme.
1. Demander la plateforme ; choisir la cible dans le tableau « Normes ».
2. Voix : `ppro_set_clip_volume {normalizeTo}` [prévu] sur tous les clips voix, ou Auto-Match (−23 LUFS par défaut, broadcast) puis remonter la piste.
3. Musique : `ppro_set_track_volume {track: "A3", db: −12…−20 par rapport à la voix}` [prévu]. SFX : `ppro_set_clip_volume` clip par clip (chaque effet a son propre niveau).
4. Export mix complet : `ppro_export_audio {tracks: "all"}` [existant] → `media_loudness {target}` [prévu] : renvoie l'écart à appliquer.
5. Appliquer l'écart sur la piste Mix (`ppro_set_track_volume {track: "Mix"}`) ou via `media_normalize_audio` [prévu] si on livre un fichier audio séparé.
Vérification : nouvelle mesure ; intégrée dans ±1 LU de la cible, crête vraie ≤ −1 dBTP, écart voix/musique conservé.

### P4 — Ducking de la musique sous la voix
Objectif : la musique descend quand on parle, remonte dans les trous, sans pompage.
1. Voix finalisée (P2, P3) ; sinon le ducking sera à refaire.
2. Étiqueter voix (`dialogue`) et musique (`music`) [prévu].
3. Automatique : `ppro_auto_duck {musicTrack, voiceTracks, reductionDb: 12–18, fade: 0.3–0.8}` [prévu]. Équivalent manuel : `ppro_export_audio` voix → `media_detect_silences {minDuration: 1.0}` [prévu] → plages de parole → `ppro_set_volume_keyframes {clipId: musique, keyframes: [t−0.5 s: 0 dB, t: −15 dB, fin+0.3 s: −15 dB, fin+0.8 s: 0 dB]}` [prévu].
4. Si la musique est ducked presque tout le temps (parole continue) : baisser plutôt la piste musique de façon fixe et réduire la sensibilité ; le ducking n'a d'intérêt que s'il y a des trous.
5. Optionnel : cloche −6…−12 dB à 1–4 kHz sur la musique (`ppro_add_audio_effect Parametric Equalizer`).
Vérification : `ppro_get_clip_effects {clipId: musique}` → keyframes présents ; écoute de 3 transitions parole/silence ; `media_loudness` sur la musique seule pendant une phrase : 10–20 LU sous la voix.

### P5 — Placer et couper la musique
Objectif : musique qui commence, respire et finit sur la structure du morceau.
1. `media_detect_beats {musique}` [prévu] → BPM, temps forts, sections ; `ppro_add_markers` [existant] sur les temps forts (couleur dédiée).
2. Choisir le point d'entrée : sur un temps fort, de préférence au début d'une section (intro, couplet) ; aligner le drop/refrain sur le meilleur plan.
3. Raccourcir : retirer des mesures entières entre deux temps forts (`ppro_cut_at {times}` [existant] + `ppro_remove_ranges` [existant]), raccord avec Constant Power court. Allonger : dupliquer le clip, caler les coups de batterie, chevauchement 1–2 s avec fondu croisé.
4. Fin : soit fondu 1–2 s (`ppro_add_transition {side: "out", name: "Exponential Fade", duration: 1.5}` [prévu]), soit « cap » : couper les ~10 dernières secondes du morceau, les placer sur une piste voisine, aligner les formes d'onde, couper les deux sur un temps fort.
5. Pas de paroles chantées sous une voix parlée.
Vérification : écouter chaque raccord les yeux fermés ; s'il s'entend, déplacer la coupe au temps fort voisin.

### P6 — Sound design (SFX)
Objectif : des effets qui renforcent l'image sans se faire remarquer.
1. Lister les événements : coupes fortes, apparitions de texte, zooms, changements de scène (`ppro_get_markers`, `ppro_get_sequence`).
2. Choisir par type : impact (coupe, apparition), whoosh (mouvement, texte qui glisse), riser (montée avant un drop), rumble (profondeur sous un impact).
3. Placer : impact à l'image exacte de l'événement ; whoosh avec son point le plus fort sur la coupe ou le mouvement le plus rapide ; riser qui se termine sur la coupe ; laisser ~80 ms entre la fin d'un whoosh et un impact séparé. `ppro_place_sfx {items: [{path, time, track: "A5", gainDb: −12…−18}]}` [prévu].
4. Varier : pas deux fois le même fichier à la suite ; pitch ou longueur différents. Court (≈ 0,5 s) pour un titre, long (≈ 1 s) pour un objet qui traverse l'écran.
5. Panoramique modéré selon la position à l'image ; vérifier en mono.
Vérification : `ppro_export_frame` [existant] à l'instant de l'impact (l'image doit avoir changé à cette frame) ; `media_loudness` de la piste SFX pendant une phrase : sous la voix.

### P7 — J-cut / L-cut et transitions audio
Objectif : raccords de parole fluides, changements de scène préparés.
1. `ppro_unlink_clips {clipIds}` [prévu] sur les deux clips concernés.
2. J-cut : avancer l'audio du clip B de quelques images à 2 s avant l'image (`ppro_trim_clip {clipId: B.audio, start}` [prévu]). L-cut : prolonger l'audio du clip A sous B.
3. Fondu croisé au raccord : `ppro_add_transition {name: "Constant Power", duration: 1–3 images}` [prévu] pour deux dialogues ; 20–100 ms pour mêler room tone ou prises différentes ; plus long (0,5–1 s) seulement entre ambiances.
4. Pour un changement de scène : J-cut avec l'ambiance de la scène suivante 1–2 s avant la coupe image (repère).
Vérification : `ppro_get_sequence {range}` : audio et vidéo décalés comme prévu, pas de trou ; écouter le raccord.

### P8 — Pops, clics, bruits de bouche
Objectif : retirer les artefacts ponctuels sans toucher à la voix.
1. Localiser : `ppro_export_audio` voix → `media_waveform_image {range}` [prévu] ou écoute ; les pops sont des bosses graves isolées, les clics des pics très courts.
2. Plosive : coupe-bas (déjà en P2) ; si elle reste, `ppro_set_volume_keyframes` [existant] creux de −6 à −10 dB sur 50–100 ms autour du pop (repère), ou coupe-bas local plus haut (150 Hz) sur un sous-clip (`ppro_cut_at` [existant] puis effet sur le morceau).
3. Clics : si la version le permet, Audition : Effects > Diagnostics > DeClicker (preset par défaut, Scan, Repair All, repasser si besoin) ; sinon `media_denoise` [prévu] sur l'export puis réimport.
4. Bruit de fond constant : `media_denoise` [prévu] ou DeNoise (P2), jamais plusieurs outils de bruit empilés.
Vérification : écouter le passage isolé ; aucun « trou » audible dans la voix.

### P9 — Contrôle final et export
1. `ppro_export_audio {tracks: "all"}` [existant] → `media_loudness {target}` [prévu] : intégrée, crête vraie, LRA.
2. Corriger sur la piste Mix (`ppro_set_track_volume` + Hard Limiter) ; remesurer.
3. `ppro_export_sequence {preset}` [prévu] ; `media_probe` [existant] sur le fichier rendu : loudness identique à la mesure de la timeline (l'encodage ne doit pas changer l'intégrée de plus de ~1 LU).
4. Rapport : cible visée, valeurs obtenues, points écoutés.

## Paramètres de référence

### Normes de loudness par destination
| Destination | Intégrée | Crête vraie | Remarques |
|---|---|---|---|
| YouTube | −14 LUFS | −1 dBTP (−2 dBTP conseillé) | Baisse seulement ; un fichier à −22 LUFS reste à −22. « Stats for nerds » affiche l'écart (content loudness). |
| TikTok / Instagram Reels | ≈ −14 LUFS (repère) | −1 dBTP | Normalisation non documentée officiellement ; viser comme YouTube. |
| Spotify (musique, podcast) | −14 LUFS | −1 dBTP (−2 si > −14) | |
| Apple Podcasts / podcast stéréo | −16 LUFS ±1 | −1 dBTP | Mono : −19 LUFS (le mono paraît plus fort). |
| TV Europe — EBU R128 | −23 LUFS ±0,5 LU (±1 live) | −1 dBTP | Même règle pour pubs et bandes-annonces. LRA non pertinente sous 1 min. |
| TV États-Unis — ATSC A/85 | −24 LKFS | −2 dBTP (repère) | |
| Netflix | −27 LKFS ±2 (dialogue-gated) | −2 dBTP | Spécification de livraison stricte. |
| Essential Sound Auto-Match (Premiere) | Dialogue −23, Musique −25, SFX −21, Ambiance −30 LUFS | — | Cibles broadcast non modifiables dans Premiere ; remonter ensuite pour le web. |

### Niveaux de travail sur le crête-mètre (dBFS)
| Élément | Moyenne | Crêtes | Pourquoi |
|---|---|---|---|
| Voix | −12 | −6 à −3 | Marge pour le limiteur, intelligibilité |
| Musique sous voix | −18 à −25 | — | 10–20 dB sous la voix |
| Musique seule | −12 à −10 | −6 | Elle porte le passage |
| SFX | −12 à −18 | −6 pour un impact | Jamais au-dessus de la voix |
| Ambiance / room tone | ≈ −30 | — | Comble les trous sans s'entendre |
| Exemple de spec client (forum Adobe) | mix −10/−14, voix −12/−15, musique −18/−22, SFX −10/−20, pics −8 | | |

### EQ voix (points de départ)
| Zone | Fréquence | Action | Pourquoi |
|---|---|---|---|
| Coupe-bas | 80 Hz (grave) – 100 Hz (aiguë), 12 dB/oct | filtre | Grondement, pops |
| Plosives résiduelles | ~150 Hz | −3 à −5 dB dynamique | Garde le corps de la voix |
| Corps | 200–300 Hz | +1 à +3 dB maxi | Chaleur ; au-delà, boueux |
| Boue / carton | 200–500 Hz | −2 à −4 dB (jusqu'à −6 si enregistrement en pièce) | Clarté |
| Nasal | 700 Hz – 2 kHz | −1 à −2 dB | À trouver en balayant |
| Présence | 2–5 kHz | +1 à +2 dB (jusqu'à +4) | Intelligibilité ; après avoir coupé la boue |
| Sifflantes | 5–10 kHz (homme 3–6, femme 6–8) | de-esser 3–6 dB | Jamais une coupe statique forte |
| Air | > 10 kHz | +2 à +3 dB, après le de-esser | Ouverture |
| Clics de bouche | ~11 kHz | coupe dynamique | |

### Dynamique voix
| Outil | Réglage | Note |
|---|---|---|
| Compresseur | ratio 2:1–4:1 (3:1), attaque 10–30 ms, relâche 60–150 ms (100), seuil pour 3–6 dB de réduction, knee doux | Au-delà de 8:1 : rare pour la voix |
| De-esser | 5–8 kHz, split-band, 3–6 dB maxi | Trop = zézaiement |
| Gate (si utilisé) | plage 6–8 dB seulement | Plage 60 dB = fins de mots coupées |
| Limiteur | plafond −1 dBTP (−2 pour YouTube), ≤ 2–3 dB de réduction, relâche ~50 ms | S'il travaille beaucoup, revoir le compresseur |
| Réduction de bruit | 6–12 dB maxi ; curseur Essential Sound 1–2 | Dès 5 : voix métallique |

### Ducking et transitions
| Paramètre | Valeur | Source / note |
|---|---|---|
| Réduction ducking | −12 à −18 dB (jusqu'à −24 si beaucoup de parole) | Essential Sound « Reduce By » |
| Fondus ducking | 300–800 ms (exemple Adobe : 800 ms) | « Fades », en ms |
| Sensibilité | plus haute = il faut un trou plus long pour remonter | baisser si ducked en permanence |
| Keyframe manuel | −0,5 s avant la parole : 0 dB ; début de parole : −15 dB | |
| Creux EQ dans la musique | 1–4 kHz, −6 à −12 dB, Q 2–6 | ex. 1250 Hz, −10 dB, Q 4 |
| Fondu croisé dialogue | 1–3 images (Premiere ne descend pas sous 1 image) ; 2–10 ms en DAW | |
| Fondu croisé room tone / prises | 20–100 ms | |
| Transition audio par défaut | Constant Power, 1 s (à réduire dans Préférences > Timeline) | |
| Fin de musique | fondu 1–2 s, Exponential Fade | |
| Chevauchement J/L-cut | quelques images à 2 s | plus long = effet voulu |
| Whoosh | ~0,5 s (titre) à ~1,2 s (objet qui passe) ; ~80 ms avant un impact séparé | |
| Room tone à prélever | 5–15 s (30–60 s en tournage) | |

### Lire un loudness meter
- **Momentary (M)** : fenêtre glissante 400 ms, sert à repérer un son ponctuel trop fort.
- **Short-term (S)** : fenêtre 3 s, sert à régler un passage ou un micro en direct.
- **Integrated (I)** : moyenne de tout le programme avec gating (silence < −70 LUFS ignoré, puis tout ce qui est 10 LU sous la moyenne courante). C'est la valeur demandée par les plateformes. Elle n'est valable qu'après lecture complète.
- **LRA** : écart de dynamique en LU ; non fiable sous 1 min.
- **True Peak (dBTP)** : crêtes inter-échantillons ; un crête-mètre classique peut afficher −0,3 dBFS alors que la crête vraie dépasse 0.
- 1 LU = 1 dB. Échelle EBU +9 pour la parole, +18 pour musique/fiction.

## Erreurs fréquentes et comment les détecter
| Erreur | Symptôme / détection | Correction |
|---|---|---|
| Saturation | crêtes à 0 dBFS, formes d'onde plates, `media_loudness` crête vraie > −1 dBTP | Baisser le gain source ; limiteur ; si enregistrement saturé : réparation impossible, re-prise |
| Musique trop forte | écart voix/musique < 8 LU ; la musique « sonne bien » seule | Piste musique −12 dB, ducking, creux EQ 1–4 kHz |
| Paroles chantées sous la voix | deux voix se chevauchent | Version instrumentale ou autre morceau |
| Mix trop faible pour la plateforme | intégrée < cible de 4 LU ou plus ; YouTube ne remonte pas | Remonter la piste Mix, limiteur −1 dBTP |
| Sifflantes | pics à 5–10 kHz sur chaque « s » | De-esser 3–6 dB ; ne pas booster l'air avant |
| Réduction de bruit excessive | voix « sous l'eau », métallique | Curseur 1–2 ; une seule couche ; accepter un peu de souffle |
| Sur-compression | souffle qui monte entre les mots, respirations énormes, pompage | Gain de clip d'abord ; ≤ 6 dB de réduction |
| Gate trop agressif | fins de mots coupées, clics | Plage 6–8 dB ou pas de gate |
| Silence absolu entre phrases | « trous » sensibles au casque | Room tone bouclé avec fondus |
| Ducking à refaire | clips déplacés après Generate Keyframes ; keyframes manuels effacés | Régénérer en dernier ; retouches manuelles après seulement |
| Ducking sur la mauvaise piste / clips non étiquetés | la voix descend, ou rien ne se passe | Vérifier les types Essential Sound |
| Pops | bosses graves isolées à chaque « p », « b » | Coupe-bas 80–100 Hz, creux local, réenregistrer avec filtre anti-pop |
| Voix sur un seul canal | voix à gauche ou à droite seulement | Clip en mono ou « Fill left/right » (repère) ; centrer |
| Phase / mono incompatible | la voix s'affaiblit en écoute mono (téléphone) | Dual mono en phase ; pas de widener sur la voix |
| Coupe musicale audible | à-coup rythmique ou harmonique | Déplacer au temps fort ; fondu croisé court |
| Arrêt sec de la musique | fin brutale | Fondu 1–2 s ou cap sur la vraie fin |
| Jugement sans mesure | « ça me semble bien » | Loudness meter + deux systèmes d'écoute |

## Contrôle qualité (avant de livrer)
- [ ] Intégrée dans ±1 LU de la cible plateforme, crête vraie ≤ −1 dBTP (−2 pour YouTube/Netflix).
- [ ] Voix : moyenne ≈ −12 dBFS, LRA resserrée, aucune phrase inaudible ni saturée.
- [ ] Musique 10–20 LU sous la voix pendant la parole ; ducking régénéré après la dernière modification de montage.
- [ ] Aucun clip audio à 0 dB non traité (oublié) ; aucune piste muette par erreur (`ppro_get_audio_info`).
- [ ] Voix centrée, lecture mono vérifiée (pas de perte de niveau).
- [ ] Pas de silence absolu ; room tone sous les coupes de parole.
- [ ] Toutes les coupes de musique sur un temps fort ; début et fin fondus ou cappés.
- [ ] SFX sous la voix, impacts à l'image exacte.
- [ ] Écoute complète au casque + une écoute sur haut-parleur de téléphone ou portable.
- [ ] Fichier rendu remesuré (`media_probe`) : mêmes valeurs qu'en timeline.

## Comment un humain le fait dans Premiere / After Effects
- **Espace de travail Audio** : Window > Workspaces > Audio ; panneau **Essential Sound** (Window > Essential Sound). Sélectionner les clips (sinon panneau grisé), choisir le type : Dialogue, Music, SFX, Ambience. Bouton **Auto Tag** pour étiqueter automatiquement.
- **Essential Sound — Dialogue** : Loudness > Auto-Match ; Repair : Reduce Noise, Reduce Rumble (< 80 Hz), DeHum (50/60 Hz), DeEss, Reduce Reverb (curseurs 0–10, commencer par défaut, 1–2 pour le bruit) ; Clarity : Dynamics (Natural ↔ Focused), EQ (presets), Enhance Speech ; Clip Volume pour compenser la perte de niveau. Les curseurs posent des effets normaux, modifiables dans **Effect Controls** (bouton Edit de DeNoise/DeReverb : Processing Focus, Amount, Gain) ; clic droit sur l'effet > Save Preset.
- **Essential Sound — Music** : Loudness > Auto-Match ; Duration : Remix (segments, variations) ou Stretch (change le pitch, éviter les extrêmes) ; **Ducking** : cocher, Duck against (icônes : Dialogue par défaut, SFX, Ambience…), Sensitivity, Reduce By (dB), Fades (ms), **Generate Keyframes**. Presets « Smooth Vocal Ducking » etc. Régénérer après toute modif ; ça écrase les keyframes manuels.
- **Essential Sound — SFX / Ambience** : Auto-Match, Creative > Reverb, Pan (position), Stereo Width (vérifier au casque, facile à exagérer).
- **Gain de clip** : sélectionner, **G** (Audio Gain : Set Gain to / Adjust Gain by / Normalize). Keyframes de volume : Ctrl/Cmd+clic sur la ligne de volume du clip ; **[** / **]** baisse/monte le clip de 1 dB (repère).
- **Transitions audio** : Effects > Audio Transitions > Crossfade : Constant Gain, Constant Power, Exponential Fade ; au point de montage **Ctrl+Shift+D / Shift+Cmd+D** (transition audio par défaut ; **Shift+D** vidéo + audio). Durée par défaut 1 s : Preferences > Timeline > Audio Transition Default Duration.
- **J/L-cut** : clic droit > Unlink (ou **Ctrl/Cmd+L**, repère), puis déplacer/étirer l'audio seul ; ou **Alt/Option+glisser** un bord audio (repère) ; outil Rolling Edit (**N**) sur l'audio seul.
- **Effets audio** (Effects > Audio Effects) : DeNoise, DeReverb, DeHummer, Parametric Equalizer, Tube-modeled Compressor, Multiband Compressor, Hard Limiter, Loudness Meter (Special).
- **Loudness Meter** : Window > Audio Track Mixer > flèche en haut à gauche (afficher les effets) > piste **Mix**, un insert > Special > Loudness Meter ; clic droit > post-fader ; double-clic pour ouvrir ; Presets (EBU, ATSC, YouTube, Spotify, Apple Podcasts, Netflix) ; Settings : Target Loudness, Low Level Below, Maximum True Peak, Scale EBU +9/+18, Unit LUFS/LKFS/LU. Lire Input, Momentary, Short-Term, Integrated en lisant **toute** la séquence. Loudness Radar = version héritée (projets < 15.2) : régler Radar Speed sur la durée du programme. Le meter ne corrige rien : ajuster avec le fader Mix ou un Hard Limiter.
- **Musique** : désélectionner le clip, lecture, **M** sur chaque temps fort = marqueurs de séquence ; verrouiller la piste musique ; forme d'onde agrandie pour repérer les coups de batterie.
- **Audition** (Edit > Edit in Adobe Audition > Sequence) : Effects > Noise Reduction/Restoration > Click/Pop Eliminator ; Effects > Diagnostics > DeClicker (Scan, Repair All) ; Effects > Amplitude and Compression > DeEsser (Threshold, Center Frequency ; **Shift+D** affiche le spectre pour trouver la fréquence) ; Window > Amplitude Statistics (loudness de tout le fichier en un clic) ; Essential Sound > Master Template View pour changer les cibles par défaut.
- **After Effects** : pas d'outil de mixage ; niveaux par calque (Audio > Audio Levels), aperçu audio seul avec la touche **.** du pavé numérique (repère). Faire le mix dans Premiere.

## Sources
- EBU R 128 (2014) — https://tech.ebu.ch/docs/r/r128-2014.pdf — −23 LUFS ±0,5/±1 LU, −1 dBTP, gating, LRA < 1 min, pubs et trailers traités comme des programmes.
- EBU R 128 (Wikipedia) — https://en.wikipedia.org/wiki/EBU_R_128 — fenêtres M 400 ms / S 3 s, gates −70 LUFS et −10 LU, cibles streaming, normalisation descendante.
- Loudness Standard Explained (OpenClip) — https://openclip.app/learn/loudness-standard — cibles YouTube/Spotify −14, Apple −16, ATSC −24 ; normalisation descendante seulement.
- LUFS Explained (OpenClip) — https://openclip.app/learn/lufs — définitions M/S/I, TikTok/Reels ≈ −14 LUFS.
- The LUFS and LKFS FAQ for podcasters (Podnews) — https://podnews.net/article/lufs-lkfs-for-podcasters — −16 LUFS stéréo, −19 mono, ±1 dB, −1 dBTP ; short-term pour régler, intégrée pour livrer.
- The new loudness target war (Auphonic) — https://auphonic.com/blog/2019/06/12/the-new-loudness-target-war/ — cibles Apple/Google/Spotify/Amazon/EBU ; pourquoi −16 pour la parole mobile.
- LUFS, loudness, public radio… (WBUR) — https://www.wbur.org/citrus/2020/07/02/lufs-loudness-public-radio-npr-spotify-google — PRSS −24, Spotify −14/−1 dBTP (−2 si plus fort), Google −16/−19 mono.
- YouTube loudness normalization (Youlean) — https://youlean.co/?p=30813 — YouTube ne remonte jamais ; Stats for nerds ; −14 LUFS / −1 dBTP.
- Mastering Voice-Over Dialogue for Video (Sage Audio) — https://www.sageaudio.com/articles/mastering-voice-over-dialogue-for-video — chaîne gate→EQ→de-ess→comp→limiteur, ≤ 6 dB de compression, −2 dBTP YouTube, Netflix −27 LKFS, erreurs fréquentes.
- How to Make Voice Over Sound Better (Sage Audio) — https://www.sageaudio.com/articles/how-to-make-voice-over-sound-better — EQ 200/300/500/700 Hz, 1,5–2,5 kHz ; compresseur 3:1, 100 ms, 3–4 dB ; de-esser 3–4 dB ; limiteur 50 ms.
- Podcast audio mixing (Ruah Creative House) — https://ruahcreativehouse.org/blog/podcast-audio-mixing/ — HPF 80–100 Hz 12 dB/oct, NR 6–12 dB, EQ −2…−4 dB 200–400 Hz, comp 3–4:1 / 10 ms / 100 ms, de-esser 5–8 kHz 3–6 dB, limiteur −1 dBTP ≤ 2–3 dB.
- Audio Basics for Video Editing (Cursa) — https://cursa.app/en/page/audio-basics-for-video-editing-dialogue-music-and-clean-mixes — crêtes voix −6/−3, musique 10–20 dB sous, fondus 2–10 ms / 20–100 ms, room tone 5–15 s, comp 2–4:1 / 10–30 ms / 60–150 ms, ducking 10–20 dB / 200–500 ms, erreurs débutant.
- Fairlight compressor for dialogue (DaVinci Resolve Club) — https://davinciresolveclub.com/fairlight-compressor-dialogue/ — ratio 2,5–3:1, « quelques dB » de réduction, gain de clip avant compression, comparer à niveau égal.
- Use Compression for Better Audio Control (StudioDaily) — https://www.studiodaily.com/2005/10/use-compression-for-better-audio-control/ — voix −12 dB moyenne / −3 crêtes à la prise, seuil −12, ratio 2:1 de départ, > 8:1 rare, EQ avant compression.
- Voice EQ (Music Guy Mixing) — https://www.musicguymixing.com/voice-eq/ — HPF 80/100 Hz, 150 Hz dynamique, 200–300 Hz ≤ +3 dB, 400–600 Hz −1…−2, 5 kHz sibilantes, 11 kHz clics.
- How to EQ Vocals (Audient) — https://audient.com/tutorial/how-to-eq-vocals/ — boue 200–500 Hz −3…−6, présence 1–4 kHz +2…+4, sibilantes 5–10 kHz, air > 10 kHz +2…+3 après le de-esser.
- De-essing (Wikipedia) — https://en.wikipedia.org/wiki/De-essing — sibilantes 2–10 kHz, homme 3–6 / femme 6–8 kHz, broadband vs split-band.
- Audition DeEsser (Music Radio Creative) — https://producer.musicradiocreative.com/how-to-use-adobe-audition-deesser — menu, Threshold, Center Frequency, Shift+D.
- Remove pops, clicks and mouth noises (Notetracks) — https://notetracks.com/blog/how-to-remove-pops-clicks-and-mouth-noises-in-every-daw — Audition DeClicker : Diagnostics, Scan, préréglage par défaut.
- Click/Pop Eliminator (Adobe Learn, Audition) — https://adobe.com/learn/audition/web/use-click-pop-eliminator-audition — DeClicker Threshold/Complexity, Repair All, passes répétées, gros clics à la main.
- Essential Sound panel (aide Audition) — https://helpx.adobe.com/audition/using/essential-sound-panel.html — types, curseurs Repair 0–10, Rumble < 80 Hz, DeHum 50/60 Hz, Ducking (Duck Against, Sensitivity, Reduce By, Fades), Remix.
- Essential Sound panel (Adobe Learn, Premiere) — https://www.adobe.com/learn/premiere-pro/web/essential-sound-panel — Dynamics = compresseur, EQ = graphique 10 bandes, Stereo Width au casque, effets éditables dans Effect Controls.
- Reduce noise and reverberation (Adobe Learn) — https://www.adobe.com/learn/premiere-pro/web/reduce-noise-and-reverberation — Dialogue obligatoire, défauts d'abord, compenser le niveau.
- Advanced noise/reverb reduction (Adobe Learn) — https://www.adobe.com/learn/premiere-pro/web/advanced-noise-reverberation-reduction — bouton Edit, Processing Focus, Amount, Gain, Save Preset.
- Automatic audio ducking (Adobe Learn) — https://www.adobe.com/learn/premiere-pro/web/automatic-audio-ducking — étapes, Fades en ms (ex. 800), keyframes remplacés, baisser la sensibilité si ducked en permanence.
- Balance audio (Adobe Learn) — https://www.adobe.com/learn/premiere-pro/web/balance-audio — ordre : voix, Auto-Match, musique, ducking, retouche manuelle.
- How to auto duck audio in Premiere Pro CC (Larry Jordan) — https://larryjordan.com/articles/how-to-auto-duck-audio-in-adobe-premiere-pro-cc/ — ducking symétrique, écrase les keyframes manuels, régler la voix d'abord.
- Modify Essential Sound panel settings (Larry Jordan) — https://larryjordan.com/?p=82186 — Auto-Match −23 LUFS, −16 pour le web, Master Template View d'Audition.
- The Loudness Meter (Larry Jordan) — https://larryjordan.com/articles/premiere-pro-new-loudness-meter/ — piste Mix, Integrated à lire, −1 dBTP, cibles, Amplitude Statistics d'Audition.
- Loudness Meter (aide Premiere, version PL) — https://helpx.adobe.com/pl/premiere-pro/using/loudness-radar.html — insert Mix, Settings (Target, Low Level Below, Max True Peak, Scale EBU +9/+18, Unit), presets plateformes, Radar hérité < 15.2.
- Loudness Meter (Evergreen helpwiki) — https://helpwiki.evergreen.edu/wiki/index.php/Loudness_Meter — insert post-fader, presets ATSC −24 / YouTube −14, M 400 ms / S 3 s.
- Premiere Pro Audio Workflow Guide (Premiere Bro) — https://premierebro.squarespace.com/blog/premiere-pro-audio-workflow-guide-for-editors-part-1 — Auto-Match −23/−25/−21/−30, touche G, Radar par piste.
- How to Measure Loudness in Premiere Pro (Premiere Bro) — https://premierebro.squarespace.com/blog/how-to-measure-loudness-in-premiere-pro — Radar Speed = durée du programme, ligne vert/jaune, Hard Limiter +3,3 dB.
- Tips and Tools for Editing Music (Premiere Bro) — https://premierebro.squarespace.com/blog/tips-and-tools-for-editing-music-in-premiere-pro — marqueurs M, temps fort, creux EQ 1250 Hz −10 dB Q 4, Remix.
- How to Mix Sound for Video (Premiere Gal) — https://premieregal.squarespace.com/blog/2021/11/12/how-to-mix-sound-for-video-in-premiere-pro — voix −12, musique −18/−25, SFX −12/−18, Reduce Noise 1–2, Exponential Fade.
- How to Mix Dialogue, Music, and SFX (Pixflow) — https://pixflow.net/blog/?p=92478 — disposition des pistes, Reduce By −18/−24, creux 1–4 kHz, limiteur Mix −1 dBTP, erreurs.
- Audio ducking tips (CrumplePop) — https://crumplepop.com/audio-ducking-in-premiere-pro-tips-and-advices — niveler la musique avant ducking, même réduction sur tout le clip.
- Auto-ducking tool (No Film School) — https://nofilmschool.com/2018/04/save-time-adobe-premiere-pros-new-auto-ducking-tool — presets de ducking (Smooth Vocal Ducking), Auto-Match avant.
- Essential Sound for music (Tuts+) — https://photography.tutsplus.com/articles/how-to-use-the-essential-sound-panel-for-music-in-premiere-pro--cms-41939 — Stretch change le pitch, Duck against options.
- Essential Sound panel (RedShark) — https://www.redsharknews.com/how-to-use-the-essential-sound-panel-in-adobe-premiere-pro — Auto Tag, Remix segments/variations, réparation = essais.
- Crossfades in Premiere Pro explained (FilmDaft) — https://filmdaft.com/crossfades-in-premiere-pro-explained/ — Constant Gain / Power / Exponential, 1 s par défaut, Ctrl+Shift+D, préférence Timeline.
- J-cuts and L-cuts (Soundstripe) — https://www.soundstripe.com/blogs/a-video-editors-guide-to-j-cuts-and-l-cuts — quelques images à quelques secondes, unlink nécessaire.
- J-cuts and L-cuts (Epidemic Sound) — https://www.epidemicsound.com/blog/j-cuts-and-l-cuts/ — étapes, nettoyage par fondus, Rolling Edit.
- L and J cuts (Boris FX) — https://borisfx.com/blog/l-and-j-cuts-smoother-more-cinematic/ — clic droit > Unlink, cas d'usage.
- L-Cuts and J-Cuts (TechSmith) — https://www.techsmith.com/blog/how-to-edit-videos-l-cuts-and-j-cuts/ — enchaînement L-cut → B-roll → J-cut entre deux intervenants.
- What is sound design in video editing (Krotos) — https://krotos.studio/blog/what-is-sound-design-in-video-editing — couches sub/mid/high, riser avant la coupe, musique 6–10 dB sous, ambiance −18/−12 LU filtrée, room tone 30–60 s.
- Transition sound design (Beverly Boy) — https://beverlyboy.com/blog/transition-sound-design-that-strengthens-commercial-video-editing — impact à l'image exacte, couches ± quelques images, retenue.
- Whoosh sound effect guide (Sonilo) — https://sonilo.com/ai-music/whoosh-sound-effect-guide — point « cross » sur la coupe, 0,48 s / 1,15 s, 80 ms avant l'impact, pas de pan littéral.
- Cap your music tracks (PremiumBeat) — https://www.premiumbeat.com/blog/cap-your-music-tracks-for-a-smooth-ending/ — technique du cap : ~10 s de fin, aligner, couper sur un temps.
- Trimming Music for Time (Videomaker) — https://www.videomaker.com/article/c4/15659-trimming-music-for-time — allonger par copies, caler la batterie, chevauchement 1–2 s, couper toutes 1/2/4 temps.
- Background music video editing (SFX Engine) — https://sfxengine.com/blog/background-music-video-editing — voix −6/−12, musique −18/−24, fondu 1–2 s, keyframe 0,5 s avant la parole, creux 1–4 kHz.
- Tips for adding music (Fstoppers) — https://fstoppers.com/music/tips-adding-music-films-video-editing-266660 — hit points sur les meilleurs plans, pas de paroles sous un dialogue.
- Why is dialogue recorded in mono? (DVinfo) — https://www.dvinfo.net/forum/all-things-audio/30255-why-dialogue-recorded-mono.html — voix centrée, pan modéré.
- Editing film: audio mono or stereo? (forum Vegas) — https://www.vegascreativesoftware.info/us/forum/editing-film-audio-mono-or-stereo--40140 — dual mono, phase et TV mono, musique stéréo, pan keyframé pour les SFX.
- Temp mixes: keeping centred (Alex4D) — https://blog.alex4d.com/2007/07/28/temp-mixes-keeping-centred/ — voix au centre, le reste écarté.
- Suggested decibel levels (DVinfo) — https://www.dvinfo.net/forum/adobe-creative-suite/497493-suggested-decibel-levels.html — voix −6 crête web, limiteur plutôt que normalisation.
- Setting audio levels to specs (forum Adobe) — https://community.adobe.com/t5/premiere-pro-discussions/setting-audio-levels-to-specs/m-p/14263782 — exemple de spec client en dB.
- How to set the right audio levels for YouTube (Filmstro) — https://filmstro.com/?p=11364 — voix −6/−15, musique −18/−20, SFX −14/−20, tester sur mobile.
