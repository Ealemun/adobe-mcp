---
name: montage-gaming-stream
description: Monter du contenu gaming et de stream dans Premiere Pro / After Effects via adobe-mcp — nettoyage de VOD, best-of et highlights, edits rythmés sur musique (speed ramps, freeze, zoom d'impact, shake, flash), facecam, overlays/HUD, sous-titres de réactions, SFX, déclinaison verticale, musique sans droits. Mots-clés : VOD, stream, highlight, best-of, montage, edit, clip, drop, beat, facecam, webcam, HUD, Shorts, TikTok, DMCA.
---

# Montage de contenu gaming et de streams

## Quand utiliser ce skill

Charger ce skill dès qu'une demande porte sur : une VOD de stream à raccourcir, un best-of / highlights, un « edit » ou « montage » rythmé sur une musique, une facecam à repositionner ou à mettre en avant, un overlay ou un HUD à préserver, un clip vertical tiré d'un stream, des sous-titres de réaction, des effets d'impact (ralenti, arrêt sur image, zoom, shake, flash) ou une question de droits musicaux. Il complète `adobe-editing` (règles permanentes, recettes génériques) : lire d'abord ce dernier, puis appliquer les règles ci-dessous.

Détails complémentaires : `references/formats-et-zones-sures.md` (tableaux pixels par plateforme, préparation de l'enregistrement).

## Principes

1. **Le résultat d'abord, le contexte après.** Sur un clip court, montrer la fin de l'action en 0,5–1 s, puis revenir au début ; le spectateur décide en 1–3 s (clip.dor.gg, insights.gg). Pourquoi : en vertical, un démarrage lent se fait zapper avant la première coupe.
2. **Test des 3 secondes** pour sélectionner un moment : si on ne comprend pas ce qui se passe en 3 s, on ne le garde pas (clip.dor.gg workflow). Pourquoi : un highlight n'a pas le temps d'expliquer.
3. **Un pic par clip.** Un clip court = un seul moment fort ; un combat long se découpe en plusieurs clips (clip.dor.gg, eklipse). Pourquoi : la complétion chute nettement au-delà de 45 s sur les formats courts.
4. **Plans de 3–8 s dans un montage rythmé**, cadrés juste avant le climax et coupés juste après le payoff (clip.dor.gg, onsetengine). Pourquoi : hors drop, un plan plus long retombe ; plus court, on ne lit pas l'action.
5. **Ne pas couper sur chaque temps.** Couper sur les temps forts, réserver zooms et shakes aux temps faibles ; décaler parfois d'une image avant ou après le beat (clip.dor.gg, r/editors). Pourquoi : un montage métronomique devient prévisible et fatigant.
6. **Varier le rythme** : une suite de plans courts puis un plan long (motif « 6 courts + 1 long » cité sur r/editors) ; une durée moyenne de plan de 12 images est jugée trop rapide pour être lisible. Pourquoi : le contraste de rythme crée les temps forts.
7. **Le meilleur plan sur le premier drop**, le deuxième meilleur en ouverture, un plan fort pour finir (onsetengine, clip.dor.gg, eklipse). Pourquoi : accroche, climax, sortie mémorable.
8. **Un effet = une raison.** Shake de 2–3 images sur un impact, flash blanc d'une seule image réservé au plus gros moment, zoom d'impact de 3–5 % (clip.dor.gg, nikke.gg). Pourquoi : les effets sur chaque coupe rendent la vidéo brouillonne et peuvent donner la nausée.
9. **Ralentir avant l'impact, revenir à vitesse normale sur le beat** ; rampes douces (courbes), pas de marche d'escalier (clip.dor.gg, motionarray). Pourquoi : une rampe abrupte se lit comme une coupe ratée.
10. **Retirer 2 images juste avant un impact** rend le choc plus sec (Vashi Nedomansky). Pourquoi : l'impact arrive une fraction avant que l'œil l'attende.
11. **La facecam ne couvre jamais le HUD critique** : minimap, barre de vie, munitions, kill feed, réticule (streamhub, clip.dor.gg). Pourquoi : c'est l'information que le spectateur gaming lit en premier.
12. **Facecam ≈ 15–20 % de la largeur de l'image** en 16:9, dans un coin libre du HUD ; le jeu doit occuper environ 80 % de l'écran (clip.dor.gg, r/Twitch). Pourquoi : une cam plus grande cannibalise l'action.
13. **Agrandir la cam = perdre de la netteté.** Une cam enregistrée en coin à 300 px ne devient pas plein écran ; demander une piste cam séparée en pleine résolution (Adobe Community). Pourquoi : on ne récupère pas des pixels absents.
14. **Texte lisible sur téléphone : hauteur ≥ 1/20 de la largeur du cadre** (≈ 54 px sur 1080 px) et deux lignes maximum (eklipse, fluxnote). Pourquoi : la majorité des vues de clips se font sur mobile, souvent sans son.
15. **Sous-titres dans le tiers central bas**, à 19–38 % du bord inférieur, jamais dans les 300–350 px du bas ni sous les boutons de droite (blitzcut, adaptlypost). Pourquoi : l'interface de l'application se superpose à l'export.
16. **Voix 3–5 dB au-dessus du son du jeu** ; dans un edit musical, musique ≈ 70–80 % et jeu ≈ 30–40 % de volume (eklipse). Pourquoi : la voix porte la réaction, la musique porte le rythme.
17. **Viser −14 LUFS intégré et −1 dBTP à l'export YouTube** ; la plateforme baisse ce qui est trop fort mais ne remonte jamais ce qui est trop faible (youlean, meterplugs). Pourquoi : un mix trop bas reste bas pour toujours.
18. **SFX sur 2–3 moments clés seulement**, crêtes autour de −6 à −3 dB, calés à l'image près (clip.dor.gg, sfxengine). Pourquoi : un whoosh à chaque coupe devient du bruit.
19. **Whoosh à cheval sur la coupe, riser qui finit sur le climax, impact qui tombe sur la nouvelle image** (filmeditingpro, sozai). Pourquoi : c'est la grammaire sonore que le public reconnaît sans y penser.
20. **Pas de musique commerciale non licenciée.** Les VOD sont scannées et coupées par blocs, 3 signalements = bannissement sur Twitch, un Short > 1 min avec réclamation Content ID est bloqué (foster.com, routenote, Google). Pourquoi : une vidéo muette ou supprimée a coûté le même temps de montage.
21. **La musique du jeu est aussi sous droits** : certains titres sous licence déclenchent des coupures de VOD ; désactiver cette musique dans le jeu quand l'option existe (r/Twitch). Pourquoi : le scanner ne distingue pas la source.
22. **Pour les clips verticaux, ajouter la musique tendance dans l'application**, pas dans l'export (clip.dor.gg, fluxnote). Pourquoi : la plateforme possède la licence, pas le monteur.
23. **Lecture avant écriture, checkpoint avant chaque lot destructif** (voir `adobe-editing`). Pourquoi : une VOD de 6 h ne se remonte pas à la main après une erreur de ripple.

## Procédures

### A. Nettoyer une VOD de stream → vidéo longue (20–30 min)

Objectif : passer d'une VOD de 4–8 h à une vidéo regardable, sans temps morts, avec des parties identifiables.

1. `ppro_get_capabilities` [existant] puis `ppro_get_sequence {range, tracks}` [existant] par tranches de 30 min.
2. Récupérer les repères du stream : marqueurs posés en direct (Alt+M ou `/marker` sur Twitch, visibles dans Video Producer), notes horodatées, clips créés par le chat. Les importer comme marqueurs : `ppro_add_markers` [existant].
3. Exporter la voix : `ppro_export_audio {tracks: voix, preset: "transcription"}` [existant] → `media_transcribe {wordTimestamps: true}` [prévu]. Chercher dans le texte les mots de réaction (« let's go », « non », « incroyable », rires) : chaque pic = candidat.
4. Détecter les temps morts : `media_detect_silences {minDuration: 20, noiseDb: -40}` [prévu] sur la voix ; croiser avec `media_detect_scenes` [prévu] (écrans de chargement, menus, pauses). Un silence voix > 20 s sans action visible = coupe candidate (repère).
5. Classer chaque segment : garder / hésitation / couper (clip.dor.gg). Conserver 10–30 s de contexte avant chaque moment fort (besttwitchextensions). Préférer les parties fortes complètes (une manche gagnée, un boss) aux fragments.
6. Présenter le plan : nombre de plages, durée avant/après, liste des parties. Attendre l'accord.
7. `ppro_checkpoint {label: "vod-clean"}` [existant] → `ppro_remove_ranges {ranges, tracks: "all", ripple: true}` [prévu] (ou `ppro_cut_at` [existant] + suppression manuelle guidée si les primitives manquent).
8. Marquer les parties : `ppro_add_markers {type: "Chapter"}` [prévu] → `ppro_export_chapters` [existant] ; une transition courte (dip 6–10 images, repère) ou un titre `ppro_add_text` [prévu] entre deux parties.
9. Vérifier : `ppro_get_sequence {range: [0, 60]}` [existant] et `ppro_export_frame` [existant] à chaque jonction ; écouter les 2 s autour de chaque coupe (pas de mot tronqué).

### B. Monter un best-of / highlights (2–5 min, 16:9)

1. Constituer le vivier : 25–40 clips bruts, en garder 40–50 % (eklipse) ; pour une première vidéo, 6–8 clips sur 30 s de musique (clip.dor.gg).
2. Noter chaque clip A/B/C : A = 5–8 moments incontournables (ouverture et payoff vers 60–70 % de la durée), B = soutien, C = coupé.
3. Trim : ~5 s par clip, du juste-avant à l'aboutissement ; couper l'errance avant l'action et le silence après (clip.dor.gg, eklipse).
4. Ordre : deuxième meilleur clip en ouverture (action dans les 3 premières s), montée, meilleur clip au pic, baisse courte, fin forte. Varier modes et situations.
5. Placement : `ppro_place_clips {items}` [prévu] ; sinon `ppro_import_media` [existant] puis guidage de l'utilisateur.
6. Ralenti ou plan tenu sur les 1–2 plus gros moments uniquement ; `ppro_set_clip_speed` [existant].
7. Légendes minimales : situation, compte, réaction, grandes et loin des bords (`ppro_add_text` [prévu]).
8. Vérifier avec `ppro_export_frames {every: 2}` [prévu] → `media_contact_sheet` [existant] : aucun plan noir, aucun écran de menu, aucun HUD coupé.

### C. Edit rythmé sur musique (build-up, drop, speed ramps)

1. Choisir la musique **avant** de monter ; elle dicte la structure (eklipse, videoproc). Prévoir 10–15 clips pour 90 s, 25–40 pour 3 min.
2. `media_detect_beats {path}` [prévu] → BPM, temps forts, sections. `ppro_add_markers` [existant] : couleur par type (beat, downbeat, drop). Manuel : marqueurs à la touche M pendant la lecture, puis Clip > Automate to Sequence > « At Unnumbered Markers » (Adobe Community).
3. Structure type (onsetengine) : intro 5–10 s de plans d'ambiance (écran de sélection, plan large), build-up avec plans B coupés sur les temps, drop = plans A en coupes franches rapides, breakdown = ralentis et changements de point de vue.
4. Densité : en phonk, coupe toutes les 4 temps ; en dubstep, longs builds puis drop dense (onsetengine). Hors drop, 1 coupe par temps fort ; sur le drop, plans < 0,5 s (voir recette `adobe-editing`).
5. Caler les sons du jeu (tirs, impacts) sur les beats : détection d'onsets sur l'audio du jeu, puis ajuster la vitesse ou l'in-point du clip (videoproc).
6. Effets d'impact (procédure D) sur 2–3 moments ; `ppro_speed_ramp` [prévu] autour du kill : 0,3× avant, retour à 1× ou 2× sur le beat (onsetengine).
7. Tester le montage **sans la musique** : s'il tient encore, le rythme est bon (r/editors).
8. Vérifier : frames exportées sur chaque marqueur de drop ; durée moyenne de plan ≥ 15 images hors drop (repère, à partir des 12 images jugées trop rapides sur r/editors).

### D. Effets d'impact : valeurs et appels

| Effet | Valeurs | Appels adobe-mcp |
|---|---|---|
| Speed ramp | ralenti 40–50 % (flux optique fiable à ≥ 50 %), accéléré 200–300 % ; 800–1 000 % sur une transition fouettée ; images-clés Bézier, « oreilles » étirées (motionarray, 4kshooters, stingray) | `ppro_speed_ramp {keyframes}` [prévu], `ppro_set_clip_speed` [existant] |
| Freeze frame | hold de 0,3–1 s (micro-replay nikke.gg) ; segment par défaut 2 s ; cadre + texte + léger zoom 105 % (repère) | `ppro_export_frame` [existant] + `ppro_add_image_overlay` [prévu] ; ou time remap avec image-clé « hold » |
| Zoom d'impact | +3 à +5 % en 2–3 images, retour en 4–6 images (nikke.gg ; durées repère) ; snap zoom jusqu'à 200 % sans perte visible (Vashi) | `ppro_set_keyframes {effect: "Motion", prop: "Scale"}` [prévu], `ppro_punch_in` [existant] |
| Shake | 2–3 images, amplitude 10–20 px en 1080p (durée clip.dor.gg ; amplitude repère) | `ppro_set_keyframes {Position}` [prévu] ; AE : `wiggle(fréquence, amplitude)` sur un calque d'ajustement, `aeft_set_expression` [existant] |
| Flash | 1 image blanche sur le drop, 1 seule fois par edit (clip.dor.gg) ; variante dip to white 3–4 images (repère) | `ppro_add_adjustment_layer` [prévu] + opacité, ou `ppro_add_transition {name: "Dip to White"}` [prévu] |
| Coupe sèche | retirer 2 images avant l'impact (Vashi) | `ppro_trim_clip` [existant] |

Toujours : `ppro_checkpoint` [existant] avant, `ppro_export_frame` [existant] aux instants clés après, et un SFX associé (procédure H).

### E. Facecam : position, taille, réactions

1. Lire le HUD : `ppro_export_frame` [existant] en jeu → repérer minimap, vie, munitions, kill feed, scoreboard, chat.
2. Choisir le coin libre (clip.dor.gg) : bas-gauche si minimap à droite ; bas-droite si minimap à gauche ou chat en bas-gauche ; haut-gauche si scoreboard / kill log en haut-droite. Décoller la cam du bord de quelques dizaines de px (repère).
3. Taille 15–20 % de la largeur (≈ 290–380 px sur 1920), ratio conservé ; bord fin ; opacité des panneaux secondaires 60–80 % (streamhub).
4. Mettre en avant une réaction : alterner « cam plein cadre » 1–3 s (repère) sur le pic vocal, puis retour. Si la cam est incrustée dans l'enregistrement : `ppro_set_transform {scale, position}` [prévu] ou crop de la zone cam dupliquée sur V2 (cutsio) ; prévenir de la perte de netteté (Adobe Community). Si une piste cam séparée existe : `ppro_insert_clip` [existant] en overwrite sur V2.
5. Repérer les pics : `media_transcribe` [existant] + énergie vocale ; 1 mise en avant toutes les 8–15 s max (recette auto-zoom).
6. Vérifier : frames avant/après chaque bascule, cam jamais sur le HUD, visage dans la zone sûre.

### F. Overlays et HUD

- Zones à préserver : centre de l'image (réticule, action), minimap, vie/munitions, scoreboard et kill feed même s'ils n'apparaissent que brièvement (streamhub).
- Infos incrustées (score, timer, nom de la partie) : bandeau fin en haut ou en bas, 2–4 s pour une alerte, 60–80 % d'opacité pour un panneau (streamhub) ; `ppro_insert_mogrt` [existant] ou `ppro_add_text` [prévu].
- Jeux non 16:9 (4:3, 8:7) : 25–35 % de l'écran est libre, y placer cam et infos (r/Twitch).
- Export : PNG pour les images fixes, WebM pour les overlays animés avec transparence (techradar).
- Vérifier avec `media_ocr_frames` [prévu] que le texte incrusté ne chevauche pas un texte du jeu.

### G. Sous-titres de réactions

1. `ppro_export_audio` [existant] → `media_transcribe {wordTimestamps: true}` [prévu] sur la voix seule (jamais sur le mix).
2. Garder les phrases courtes de réaction ; retirer les « euh » ; ≤ 5 mots par ligne, 2 lignes max, ≥ 0,6 s par ligne (recette captions).
3. Style : sans-serif grasse, contour épais ou fond plein, hauteur ≥ 1/20 de la largeur ; blanc + contour noir en haut du cadre pour l'accroche d'ouverture (clip.dor.gg, fluxnote).
4. `ppro_captions_to_graphics {style, wordsPerLine: 4, highlight: true}` [prévu] ou `ppro_import_captions` [existant].
5. Relire : `ppro_extract_texts` [prévu] → corriger noms propres et termes du jeu → `ppro_set_captions` [prévu].

### H. Sound design

1. Lister les instants : coupes de drop, zooms, bascules cam, transitions de parties.
2. Choisir : whoosh (mouvement, transition), impact grave (coupe de drop, kill), riser (10–30 s avant un drop ou une révélation, filmeditingpro), click/métal (rechargement), sub-bass (explosion) (nikke.gg).
3. Placer : whoosh démarre 3–6 images avant la coupe et la traverse (repère) ; impact sur la première image du nouveau plan ; riser se termine exactement sur le climax (sozai). `ppro_place_sfx {items}` [prévu].
4. Niveaux : SFX en crêtes −6 à −3 dB, sous la voix ; ordre de priorité du mix : voix > SFX clés > musique > ambiance (sfxengine). `ppro_set_clip_volume` [existant].
5. Limiter à 2–3 moments par clip court ; vérifier au casque que le mix sans musique reste intelligible.

### I. Déclinaison verticale (Shorts, TikTok, Reels)

1. Choisir un moment avec payoff visible en 3 s ; cible 7–15 s pour un pur moment de jeu, 15–30 s avec réaction, 60 s max (insights.gg, clip.dor.gg, eklipse).
2. `ppro_extract_range_to_sequence {aspect: "9:16"}` [prévu] ; mise en page : crop plein (tranche 9:16 de 608 px de large sur une source 1920, centrée à x = 656, clip.dor.gg) pour les duels ; cam en haut + jeu en bas quand la réaction compte (cutsio, fluxnote) ; flou latéral si la minimap compte.
3. Facecam : haut-centre pour un clip de réaction, haut-droite pour un clip de jeu (eklipse). `ppro_reframe_vertical {strategy: "face"}` [prévu] ou crop dupliqué sur V2.
4. Accroche texte dès la première image, résultat montré 0,5–1 s avant le rembobinage (clip.dor.gg).
5. Sous-titres (procédure G) entre la cam et le jeu, dans la zone sûre ; `ppro_set_safe_zones {enabled: true}` [prévu].
6. Audio : voix +3–5 dB sur le jeu ; musique ajoutée dans l'application si elle doit être tendance (procédure J).
7. Export 1080×1920, fps de la source, ≥ 10 Mb/s H.264 (eklipse, fluxnote) : `ppro_export_sequence {preset: "shorts-1080x1920"}` [prévu]. Vérifier sur capture d'écran de téléphone que rien n'est sous les boutons.

### J. Musique et droits

1. Demander la source de chaque musique. Sans licence prouvée → ne pas l'utiliser.
2. Options sûres : bibliothèques libres de droits ou sous licence (bibliothèque audio de YouTube, catalogues d'abonnement, musique avec licence de stream), musique fournie par la plateforme (son tendance ajouté dans l'application), musique générée par `gen_music` [prévu] si l'utilisateur a configuré un fournisseur.
3. Si la VOD contient déjà une musique commerciale : `media_separate_stems` [prévu] → ne garder que la voix et le jeu, puis poser une musique propre.
4. Musique de jeu sous licence : vérifier les segments concernés ; la couper ou la remplacer.
5. Short > 60 s : vérifier l'absence de réclamation Content ID après upload ; sinon raccourcir à ≤ 60 s ou remplacer la musique (Google).
6. Consigner dans le rapport de montage : titre, source, licence, durée utilisée (≤ 90 s pour la plupart des titres de la bibliothèque Shorts).

## Paramètres de référence

### Durées

| Format | Durée cible | Source |
|---|---|---|
| Clip vertical pur jeu | 7–15 s | insights.gg |
| Clip vertical avec réaction | 15–30 s ; complétion chute après 45 s | clip.dor.gg, eklipse |
| Highlight Twitch (plateforme) | clip 5–60 s ; highlight sans max | besttwitchextensions, tomshardware |
| Montage musical YouTube | 2–5 min ; < 90 s manque de montée | eklipse ; 3–5 min selon YTtalk |
| Best-of commenté entre amis | 5–10 min | YTtalk |
| VOD nettoyée → YouTube | 20–30 min | r/Twitch |
| Contexte avant un moment fort | 10–30 s | besttwitchextensions |
| Plan dans un edit | 3–8 s hors drop ; < 0,5 s sur le drop | clip.dor.gg, recette beat-edit |
| Intro d'edit | 5–10 s | onsetengine |
| Micro-replay / freeze | 0,3–1 s | nikke.gg |
| Shake | 2–3 images | clip.dor.gg |
| Flash blanc | 1 image | clip.dor.gg |
| Alerte / bandeau | 2–4 s | streamhub |
| Riser | 10–30 s | filmeditingpro |

### Vitesses et effets

| Paramètre | Valeur |
|---|---|
| Ralenti avec flux optique | ≥ 50 % de la vitesse d'origine ; source 60 fps ou plus (4kshooters, motionarray) |
| Vitesses « propres » | valeurs qui divisent 200 (50 %, 25 %, 200 %…) (larryjordan) |
| Transition fouettée | 800–1 000 % entre deux images-clés (stingray) |
| Rampe gaming | 0,3× → 1× ou 2× sur le beat (onsetengine) |
| Zoom d'impact | +3–5 % (nikke.gg) ; snap zoom jusqu'à 200 % (Vashi) |
| Flou de mouvement time remap | shutter angle 180–360° pour plus de flou (motionarray) |
| LUT de grade | intensité < 50 % (clip.dor.gg) |

### Image, cam, texte

| Paramètre | Valeur |
|---|---|
| Facecam 16:9 | 15–20 % de la largeur ; jeu ≈ 80 % de l'écran |
| Panneaux secondaires | opacité 60–80 % |
| Texte mobile | hauteur ≥ 1/20 de la largeur (≥ 54 px à 1080) ; 2 lignes max |
| Sous-titres verticaux | 19–38 % du bas ; boîte sûre 900×1400 px centrée (blitzcut) |
| Marges sûres 9:16 (approche conservatrice) | haut 15 %, bas 25–35 %, côtés 10–15 % (reap.video) — détail en pixels : `references/formats-et-zones-sures.md` |
| Tranche 9:16 sur source 1920×1080 | 608 px de large, x = 656 pour centrer (clip.dor.gg) |

### Audio et export

| Paramètre | Valeur |
|---|---|
| Voix vs jeu | voix +3–5 dB ; EQ voix +3 dB à 2–4 kHz, coupe-bas 100 Hz (eklipse) |
| Edit musical | musique 70–80 %, jeu 30–40 % (eklipse) |
| SFX | crêtes −6 à −3 dB (sfxengine) |
| Cible YouTube | −14 LUFS intégré, −1 dBTP (youlean) ; plage −12 à −14 (frame.io) |
| Export 16:9 | 1920×1080, 60 fps, H.264 8–12 Mb/s (clip.dor.gg) |
| Export 9:16 | 1080×1920, fps source, ≥ 10 Mb/s (eklipse) |
| Enregistrement | 1440p+ si crop vertical prévu (clip.dor.gg) ; pistes audio séparées (mix, micro, jeu, vocal) en MKV puis remux (obsbot) |

## Erreurs fréquentes et comment les détecter

| Erreur | Détection |
|---|---|
| Effet sur chaque coupe | compter les images-clés Motion par minute via `ppro_get_clip_effects` ; > 1 effet toutes les 5 s hors drop = trop (repère) |
| Shake tenu > 3 images | lire les keyframes Position : durée entre premier et dernier |
| Rampe de vitesse en escalier | keyframes time remap sans oreilles / interpolation linéaire pure |
| Cam sur la minimap ou le kill feed | `ppro_export_frame` en pleine action, comparer avec la position cam |
| Cam agrandie floue | scale > 150 % sur une cam incrustée (repère) → demander la piste séparée |
| Texte sous l'interface mobile | position y dans les 320 px du bas ou dans les 120 px de droite |
| Texte trop petit | taille < 1/20 de la largeur |
| Mix trop bas | `media_loudness` < −16 LUFS (repère) ; la plateforme ne remontera pas |
| Musique couvre la voix | `media_loudness` par stem : écart voix/musique < 3 dB |
| Musique non licenciée | source inconnue, titre commercial, musique de jeu sous licence |
| Mot coupé au ripple | écouter 2 s autour de chaque coupe ; transcript : mot tronqué |
| Plan noir / écran de chargement laissé | `media_contact_sheet` : vignettes sombres ou menus |
| Vertical avec haut vide | 20–30 % du haut sans contenu (eklipse) → recadrer plus serré |
| Montage qui ne tient que par la musique | relecture sans piste musique |

## Contrôle qualité (avant de livrer)

- [ ] Accroche : action ou résultat visible dans les 3 premières secondes (1 s en vertical).
- [ ] Aucun plan sans intérêt : noir, chargement, menu, silence > 20 s sans action.
- [ ] Rythme : plans 3–8 s hors drop, variation courts/longs, pas de coupe sur chaque temps.
- [ ] Effets : shake ≤ 3 images, flash unique, zooms 3–5 %, rampes lissées, SFX associés.
- [ ] Cam : coin libre, 15–20 % de largeur, HUD critique visible en permanence.
- [ ] Texte : ≥ 1/20 de largeur, 2 lignes, zone sûre, noms propres relus.
- [ ] Audio : voix +3–5 dB sur le jeu, SFX −6/−3 dB, −14 LUFS / −1 dBTP, pas de clipping.
- [ ] Droits : chaque musique sourcée et licenciée ; musique de jeu vérifiée.
- [ ] Export : résolution, fps et débit du tableau ; vérification sur téléphone pour le 9:16.
- [ ] Checkpoint conservé, `ppro_rewind` proposé, rapport : durée avant/après, coupes, textes, musiques.

## Comment un humain le fait dans Premiere / After Effects

- **Marqueurs au rythme** : lecture + touche M sur chaque temps ; puis sélection des clips dans le panneau Projet → Clip > Automate to Sequence → Placement « At Unnumbered Markers », méthode Overwrite.
- **Vitesse constante** : clic droit > Speed/Duration (Ctrl/Cmd+R) : vitesse %, Reverse, Maintain Audio Pitch, Ripple Edit ; Time Interpolation : Frame Sampling (défaut), Frame Blending, Optical Flow (rendre : Sequence > Render In to Out). Rate Stretch (R) pour caler une durée à la main.
- **Speed ramp** : clic droit sur le badge fx du clip > Time Remapping > Speed ; Ctrl/Cmd+clic sur la bande pour poser une image-clé ; écarter les deux moitiés de l'image-clé pour créer la rampe ; poignées Bézier pour la courbe en S ; Alt/Option+glisser pour déplacer l'image-clé ; Ctrl+Alt (Cmd+Option)+glisser pour un segment « hold ». Effect Controls > Time Remapping : shutter angle pour le flou.
- **Freeze** : clic droit sur le clip > Add Frame Hold (fige jusqu'à la fin), Insert Frame Hold Segment (segment ~2 s au milieu), Frame Hold Options (image sous la tête de lecture, point In/Out ou timecode). Export d'image : Shift+E ou icône appareil photo, cocher « Import into Project ».
- **Zoom / shake** : Effect Controls > Motion (Scale, Position) avec images-clés ; ou effet Transform (décocher « Use Composition's Shutter Angle », régler l'angle) pour un flou de mouvement sur les mouvements rapides (repère). Shake réaliste : nest clip + clip tremblant, Warp Stabilizer en « No Motion », méthode Position/Scale/Rotation, puis masquer le clip tremblant (motionarray).
- **Flash** : calque de couleur blanc d'1 image sur V3, ou transition Dip to White raccourcie.
- **Nesting** : sélection > clic droit > Nest > nom ; double-clic pour ouvrir ; les changements internes se répercutent ; bouton « Insert and overwrite sequences as nests or individual clips » pour choisir le comportement au glisser.
- **Presets** : Effect Controls > sélectionner les effets (Ctrl/Cmd+clic) > menu du panneau > Save Preset ; type Scale (étire les images-clés), Anchor to In Point, Anchor to Out Point ; rangés dans Effects > Presets, bins personnalisés. Variante « template » : séquence imbriquée contenant un calque d'ajustement + un SFX, marqueur central pour l'aimantation (premierebro).
- **Cam depuis une VOD** : dupliquer le clip sur V2 > effet Crop sur la zone cam > Scale/Position ; ou Sequence > Auto Reframe Sequence en 9:16 avec suivi de mouvement.
- **Recherche de réactions** : Text-Based Editing (transcription) > rechercher un mot > couper autour.
- **Audio** : Essential Sound (Dialogue / Music / SFX), Auto-ducking ; mesure LUFS avec le Loudness Radar ou un plug-in de mesure.
- **After Effects** : shake par expression `wiggle(10, 15)` sur la Position d'un calque d'ajustement (valeurs repère), désactivée hors des 2–3 images utiles ; compteur/score HUD par expression ; export MOGRT pour réutilisation dans Premiere.

## Sources

1. Top 10 Editing Tips: Hype Up Your Gameplay — https://nikke.gg/top-10-editing-tips-hype-up-your-gameplay-share-the-wisdom/ — zoom punch 3–5 %, micro-replays 0,3–1 s, structure en 4 temps, couches de SFX.
2. How to use speed ramping in Premiere Pro (Motion Array) — https://blog.motionarray.com/learn/premiere-pro/premiere-pro-speed-ramping-tutorial/ — procédure time remap, Ctrl+clic, Bézier, shutter angle 180–360°.
3. Create Realistic Camera Shake Effects in Premiere Pro (Motion Array) — https://blog.motionarray.com/learn/premiere-pro/shake-effects-in-premiere-pro/ — shake via nest + Warp Stabilizer.
4. Short-form video safe zones (reap.video) — https://reap.video/blog/short-form-video-safe-zones — marges 15 % / 25–35 % / 10–15 %, placement des visages et sous-titres.
5. A Video Editor's Guide to Sound Design (Film Editing Pro) — https://www.filmeditingpro.com/a-video-editors-guide-to-sound-design/ — hits, whooshes, swells, risers 10–30 s.
6. Designing Custom Stream Overlays That Don't Obstruct Gameplay (StreamHub) — https://streamhub.world/streamer-blog/software/4601-designing-custom-stream-overlays-that-dont-obstruct-gameplay-2/ — zones HUD, opacité 60–80 %, alertes 2–4 s.
7. How to Freeze Frame in Premiere Pro (PremiumBeat) — https://www.premiumbeat.com/blog/how-to-freeze-frame-in-premiere-pro — Add Frame Hold, segment 2 s, Shift+E.
8. Nesting in Adobe Premiere Pro (PremiumBeat) — https://www.premiumbeat.com/blog/nesting-in-adobe-premiere-pro/ — usages et pièges du nesting.
9. Nesting sequence (Adobe Learn) — https://www.adobe.com/learn/premiere-pro/web/premiere-pro-nesting-sequence-cc — procédure, bouton nest/clips individuels.
10. Create Custom Effect Presets (Larry Jordan) — https://larryjordan.com/?p=160320 — Save Preset, Scale / Anchor In / Anchor Out.
11. 4 ways to change clip speed (Larry Jordan) — https://larryjordan.com/articles/premiere-pro-4-ways-to-change-clip-speed/ — options Speed/Duration, valeurs divisant 200.
12. Best Practices for Optical Flow (4K Shooters) — https://4kshooters.net/2015/12/11/best-practices-for-optical-flow-time-remapping-in-premiere-pro-cc — flux optique fiable à ≥ 50 %, rendu requis.
13. How to freeze frame in Premiere Pro (Simon Says) — https://www.simonsaysai.com/blog/how-to-freeze-frame-in-premiere-pro — hold par time remap (Ctrl+Alt).
14. Premiere Pro speed ramp (Adobe CC hub) — https://www.adobe.com/creativecloud/video/hub/guides/premiere-pro-speed-ramp.html — outil Plume, écarter les images-clés.
15. Seamless transition / speed ramp for beginners — https://stingray-alligator-3g85.squarespace.com/blog/editseamlesstransition — 800–1 000 %, 40 % en séquence 24p, Render In to Out.
16. Is there an easy way to create a video synced to a beat (Adobe Community) — https://community.adobe.com/questions-729/is-there-an-easy-way-to-create-a-video-synced-to-a-beat-in-premiere-1339194 — marqueurs + Automate to Sequence.
17. How to make my webcam full screen after a stream (Adobe Community) — https://community.adobe.com/t5/premiere-pro-discussions/how-to-make-my-webcam-full-screen-after-a-stream/m-p/13423112/highlight/true — perte de netteté, piste cam séparée.
18. Premiere Pro Effects Templates (Premiere Bro) — https://premierebro.squarespace.com/premiere-in-post/premiere-pro-effects-templates — templates par séquence imbriquée, marqueur central.
19. Understand three-minute YouTube Shorts (Aide YouTube) — https://support.google.com/youtube/answer/15424877?hl=en-GB — 3 min, 9:16, blocage Content ID > 1 min, 90 s de musique.
20. Loudness for YouTube (frame.io) — https://workflow.frame.io/guide/loudness-for-youtube — −12 à −14 LUFS.
21. YouTube loudness (Youlean) — https://youlean.co/?p=30813 — −14 LUFS, −1 dBTP, pas de remontée.
22. YouTube changes loudness reference to −14 LUFS (MeterPlugs) — https://meterplugs.com/blog/2019/09/18/youtube-changes-loudness-reference-to-14-lufs.html — normalisation vers le bas seulement.
23. Twitch Highlights: complete guide — https://besttwitchextensions-com.pages.dev/articles/twitch-highlights-complete-guide.html — clips 5–60 s, rétention 7/14/60 j, contexte 10–30 s, durées par type.
24. How to Publish Highlights of Twitch to YouTube (Tom's Hardware) — https://www.tomshardware.com/how-to/publish-highlights-of-twitch-to-youtube — Video Producer, export YouTube.
25. Twitch Implements Automatic Muting (Foster) — https://www.foster.com/sports-entertainment-beat/video-and-gaming-platform-twitch-implements-automatic-muting-for-copyright-protected-audio — scan des VOD par Audible Magic.
26. Twitch will issue strikes (RouteNote) — https://routenote.com/blog/twitch-will-issue-strikes/ — 3 signalements = bannissement.
27. Twitch copyright and the DMCA (r/Twitch) — https://cal1.lr.ggtyler.dev/r/Twitch/comments/gyfdxz/post_throwback_topic_twitch_copyright_and_the_dmca — musique de jeu sous licence, clips.
28. Creating long-form YT videos from stream VODs (r/Twitch) — https://lr.us.psf.lt/r/Twitch/comments/1k8dgct/creating_longform_yt_videos_from_stream_vods — cible 20–30 min, marqueurs en direct.
29. Tracking highlights during long streams (r/Twitch, instantané) — https://reddit.sentinel-team.org/posts/1ptsc5s/snapshots/2025-12-23T20%3A30%3A12.481779Z — /marker, replay buffer 3 min, clips de 30 s.
30. Are layouts overrated? (r/Twitch, instantané) — https://reddit.sentinel-team.org/posts/1tay7vj/snapshots/2026-05-13T20%3A06%3A50.253141Z — jeu ≈ 80 %, 25–35 % libres sur les jeux 4:3.
31. Why does my montage feel amateur (r/editors, instantané) — https://reddit.sentinel-team.org/posts/1qjzyn9/snapshots/2026-01-24T02%3A40%3A21.603475Z — ASL 12 images trop rapide, 6 courts + 1 long, coupe décalée d'une image, test sans musique.
32. How to make a gaming montage (clip.dor.gg) — https://clip.dor.gg/en/blog/how-to-make-gaming-montage — plans 3–8 s, shake 2–3 images, flash 1 image, 6–8 clips / 30 s.
33. Game highlight editing workflow (clip.dor.gg) — https://clip.dor.gg/en/blog/game-highlight-editing-workflow — test des 3 s, SFX sur 2–3 moments, LUT < 50 %, export 8–12 Mb/s.
34. Record game with facecam (clip.dor.gg) — https://clip.dor.gg/en/blog/record-game-with-facecam — cam 15–20 % de largeur, coin selon le HUD.
35. Game Shorts / TikTok tips (clip.dor.gg) — https://clip.dor.gg/en/blog/game-shorts-tiktok-tips — décision en 1–3 s, résultat d'abord 0,5–1 s, 15–30 s, chute après 45 s.
36. Record game vertical shorts (clip.dor.gg) — https://clip.dor.gg/en/blog/record-game-vertical-shorts — tranche 608 px à x = 656, 1440p+.
37. How to make gaming montage (Eklipse) — https://blog.eklipse.gg/beginner-guide-2/how-to-make-gaming-montage.html — 25–40 clips, tiers A/B/C, 10–15 clips / 90 s, musique 70–80 %.
38. Common vertical video mistakes (Eklipse) — https://blog.eklipse.gg/basic-knowledge/common-vertical-video-mistakes-streamers-fix.html — texte ≥ 1/20, voix +3–5 dB, cam haut-centre, ≥ 10 Mb/s.
39. Best practices for editing stream highlights (Eklipse) — https://eklipse.gg/help/what-are-the-best-practices-for-editing-stream-highlights/ — 15–60 s, découper les longs combats.
40. How to Post Gaming Clips to TikTok (insights.gg) — https://insights.gg/blog/how-to-post-gaming-clips-to-tiktok — 7–15 s, payoff dans la première seconde, accroche texte.
41. Twitch VOD to TikTok workflow (Cutsio) — https://cutsio.com/blog/twitch-vod-to-tiktok-workflow-cuts-captions-and-reformatting — Text-Based Editing par mots-clés, cam sur V2 par Crop.
42. How to turn Twitch clips into TikToks (FluxNote) — https://fluxnote.io/guides/how-to-turn-twitch-clips-into-tiktoks — 2 lignes, police grasse, ≥ 10 Mb/s, musique de la plateforme.
43. Best caption placement for short-form video (BlitzCut) — https://blitzcutai.com/blog/best-caption-placement-short-form-video — 19–38 % du bas, boîte 900×1400.
44. Social media safe zones 2026 (AdaptlyPost) — https://adaptlypost.com/blog/social-media-safe-zones-2026-complete-guide — tableaux en pixels par plateforme.
45. Sound effects for editing videos (SFX Engine) — https://sfxengine.com/blog/sound-effects-for-editing-videos — crêtes −6/−3 dB, ordre du mix, calage à l'image.
46. The only 3 sound effects you need (transcription) — https://sozai.app/transcript/three-sound-effects-tell-any-story/index.md — whoosh à cheval, riser → climax, impact sur la nouvelle image.
47. Low budget editing techniques for action (Vashi Nedomansky / No Film School) — https://nofilmschool.com/2013/09/low-budget-editing-techniques-for-action-sequences — retirer 2 images avant l'impact, snap zoom 200 %.
48. Edit gaming/esports montages fast (OnsetEngine) — https://onsetengine.pages.dev/guides/edit-gaming-esports-montages-fast — intro 5–10 s, 3–5 s par highlight, rampes 0,3×→2×, phonk / 4 temps.
49. How to make a gaming montage (VideoProc) — https://videoproc.com/video-editor/how-to-make-a-gaming-montage.htm — onsets du jeu sur les beats, musique choisie en premier.
50. Highly edited gaming video length (YTtalk) — https://yttalk.com/threads/highly-editing-gaming-video-length.220237/ — montage 3–5 min, moments drôles 5–10 min.
51. How to get multiple audio tracks in OBS (OBSBOT) — https://www.obsbot.com/blog/video-editing/how-to-get-multiple-audio-tracks-in-obs — pistes séparées, MKV, remux.
52. Separate game and Discord audio (forum OBS) — https://obsproject.com/forum/threads/how-to-separate-game-and-discord-audio-into-different-tracks.188802 — capture par application, éviter le mix desktop.
53. Créer un YouTube Short (vidIQ, FR) — https://vidiq.com/fr/blog/post/make-youtube-short-ultimate-beginners-guide/ — jugement en 1–2 s, 3–5 Shorts par vidéo longue, 90 s de musique.
54. Créer des highlights Twitch (Filmora, FR) — https://filmora.wondershare.fr/livestreaming/how-to-make-twitch-highlighting.html — Gestionnaire vidéo, viser moins de 2 min.
55. How to create interesting overlays (TechRadar) — https://www.techradar.com/gaming/how-to-create-interesting-overlays-for-game-streaming — PNG / WebM pour la transparence.
56. When should editors use a flash cut (Beverly Boy) — https://beverlyboy.com/filmmaking/when-should-editors-use-a-flash-cut — quelques images, usage parcimonieux.
