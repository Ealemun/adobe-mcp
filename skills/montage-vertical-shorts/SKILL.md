---
name: montage-vertical-shorts
description: Produire un format vertical court (YouTube Shorts, TikTok, Reels) à partir d'une vidéo longue ou de rushes — extraire un moment fort, recadrer 16:9 → 9:16 (centrage, suivi de visage, Auto Reframe, split-screen), zones de sécurité, sous-titres mot à mot, hook des 3 premières secondes, boucle de fin, rythme, musique, export 1080×1920. À charger dès qu'une demande parle de short, TikTok, Reel, vertical, 9:16, « moment viral », « clip », recadrage ou sous-titres animés.
---

# Montage vertical court (Shorts, TikTok, Reels)

## Quand utiliser ce skill

- L'utilisateur veut « sortir des shorts » d'un podcast, d'un live, d'une vidéo longue.
- Une séquence 16:9 doit devenir 9:16 (ou 4:5, 1:1).
- Il faut des sous-titres « mot à mot » animés, un texte d'accroche, une boucle, un export plateforme.
- Toujours combiner avec `skills/adobe-editing/SKILL.md` (règles permanentes : lire avant d'écrire, checkpoint, vérifier).
- Détails chiffrés par plateforme et divergences entre sources : `references/specs-plateformes.md`.

## Principes

1. **Une idée par clip.** Un short tient sur une seule idée, blague, réponse ou réaction ; s'il faut le contexte de la vidéo longue, ce n'est pas un bon candidat (sources : vidpros, autocut).
2. **Le hook tient en 2 à 2,5 s, pas 3.** La décision de swiper se prend dans les 3 premières secondes ; livrer l'accroche complète avant, garder 0,5 s de marge (opus.pro Shorts).
3. **Zéro préambule.** Pas d'intro, de logo, de « salut », de « avant de commencer » ; les intros coûteraient 30 à 40 % de rétention selon une analyse non vérifiée (opus.pro TikTok length). Commencer dans l'action ou sur la phrase forte.
4. **Payoff rapide.** Moins de 4 s entre le hook et le premier élément qui le paie ; une affirmation forte doit être justifiée avant 10 à 15 s (vidpros, opus.pro).
5. **Durée cible : 15 à 60 s.** Point d'équilibre 21 à 34 s sur TikTok (opus.pro, trymypost) ; 45 à 60 s pour un extrait de podcast vertical (vidpros) ; portée Reels maximale vers 45 à 60 s (Socialinsider via inro). Au-delà de 60 s, prévoir des relances toutes les 15 s.
6. **Un changement visuel toutes les 3 à 5 s.** Coupe, zoom, b-roll, texte ou son ; aucun plan statique > 4 à 5 s (blitzcut, tokcount, joyspace). Pas de coupe < 2 s d'intervalle en continu : ça épuise.
7. **Supprimer les pauses > 0,5 s** et les 0,5 s de silence avant la première parole (blitzcut 3-second rule).
8. **Le sujet vit dans le tiers supérieur.** Visage et épaules dans le tiers haut, titre au-dessus, sous-titres en dessous (vidpros). Les yeux vers 30 à 40 % de la hauteur (repère).
9. **Un 16:9 recadré en 9:16 perd 68 % de sa largeur** (1920 → 607 px visibles). Tout texte ou graphisme étalé en largeur doit être refait, pas recadré (senego).
10. **Choisir la stratégie de recadrage selon le mouvement** : sujet fixe → centrage ou Auto Reframe « Slower Motion » ; sujet mobile → « Default/Faster » ou keyframes manuels ; deux locuteurs → split-screen empilé ou coupes alternées ; capture d'écran large → image entière sur fond flou (larryjordan, streamingmedia, senego).
11. **Ne jamais lancer Auto Reframe deux fois sur la même séquence** et jamais sur des images fixes : résultats aberrants (larryjordan).
12. **Rien d'important dans les bandes UI.** Repère multiplateforme : garder texte et visages dans un rectangle central ≈ 900 × 1400 px (marges ≈ 90 px côtés, 260 px haut/bas) ; bas de cadre et bord droit sont les zones les plus couvertes (adaptlypost, hopperhq, trymypost).
13. **Sous-titres 1 à 3 mots en mode karaoké, 3 à 7 mots en mode phrase**, 1 à 6 s par bloc, 2 à 3 s idéal, ≤ 20 caractères/s (opus.pro captions, blitzcut professional).
14. **Gras, sans-serif, blanc, contour noir 3 à 4 px**, mot actif en jaune vif ; largeur de texte ≤ 80 à 85 % du cadre (blitzcut professional, opus.pro).
15. **Les sous-titres se placent juste sous le centre** (55 à 75 % de la hauteur depuis le haut), jamais dans les 20 à 35 % du bas (captions.ai, blitzcut) ; ils restent lisibles son coupé, cas majoritaire sur mobile selon plusieurs guides (chiffres non sourcés).
16. **Texte d'accroche : 4 à 8 mots**, à l'écran ≥ 2 s, haut de cadre sous la bande UI (vidpros, opus.pro). La première image sert de miniature : pas de frame noire ou floue.
17. **La fin boucle.** Pas d'outro, pas de « merci d'avoir regardé » ; couper dans l'action ou sur une phrase qui enchaîne avec le début ; sur Shorts la lecture reboucle d'elle-même et chaque boucle compte comme vue (shortimize, creatorhandbook).
18. **Musique sous la voix, jamais au-dessus** : voix ≈ −16 LUFS, musique ≈ −28 LUFS (recette mix d'`adobe-editing`). Les sons tendance se posent de préférence dans l'app (licence, catalogue commercial pour comptes pro) ; une piste non licenciée peut faire couper le son (socialk.it).
19. **Couper sur le temps fort quand il y a de la musique** : aligner les coupes sur les pics de la forme d'onde ou les marqueurs de beat (vidio.ai, tokcount).
20. **Exporter en 1080 × 1920, H.264, fps de la source, VBR cible 10 à 12 Mbit/s, AAC 48 kHz** (online-tech-tips ; YouTube officiel : 8 Mbit/s à 30 fps, 12 à 60 fps).
21. **Vérifier sur image exportée**, jamais sur la seule structure JSON : cadrage, sous-titre dans la zone sûre, première et dernière image.

## Procédures

### P1. Extraire un moment fort d'une vidéo longue

Objectif : N candidats de 20 à 60 s, autonomes, avec hook.

1. `ppro_get_sequence` [existant] : durée, pistes voix, marqueurs existants.
2. `ppro_export_audio {preset: "transcription"}` [existant] → `media_transcribe {wordTimestamps: true}` [prévu].
3. Signaux d'énergie : `media_detect_silences` [prévu] (pauses, rires isolés) + RMS par fenêtre via `media_probe` [prévu]. Repérer rires, hausses de volume, questions, chiffres, contradictions.
4. Pour chaque candidat, noter sur 5 (vidpros) : hook dans la première seconde ; autonome ou cliffhanger assumé ; réaction visible (rire, geste, expression) ; payoff < 4 s ; pas de préambule. 4/5 = publiable, 5/5 = à pousser.
5. Borner : début sur la phrase-hook (pas de montée), fin juste après le payoff ou sur une phrase ouverte qui boucle. Retirer 1 à 2 s de « run-up » au début, quelques secondes de « trail-off » à la fin.
6. `ppro_add_markers [{start, end, name: score + idée, color par score}]` [prévu] → présenter la liste (timecodes, durée, texte) à l'utilisateur.
7. Pour chaque retenu : `ppro_checkpoint` [existant] puis `ppro_extract_range_to_sequence {start, end, name, aspect: "9:16"}` [prévu]. Repli phase 1 : `ppro_duplicate_sequence` [existant] + `ppro_cut_at {times: [start, end]}` [existant], puis demander la suppression des parties hors plage (`ppro_remove_ranges` [prévu]).
8. Vérifier : `ppro_get_sequence {range}` ; `ppro_export_frame {time: start}` [existant] : la première image doit déjà montrer le sujet.

Repère de volume : un épisode de 60 min donne 8 à 12 clips publiables (vidpros).

### P2. Recadrer 16:9 → 9:16

Objectif : séquence 1080 × 1920 où le sujet reste cadré sans jitter.

Décision :
| Situation | Stratégie |
|---|---|
| Caméra fixe, un sujet quasi immobile | Centrage fixe ou Auto Reframe « Slower Motion » |
| Sujet qui se déplace, caméra qui suit | Auto Reframe « Default », « Faster » seulement pour sport/action |
| Deux locuteurs face à face | Split-screen empilé (P2-D) ou coupes alternées par locuteur (diarisation) |
| Capture d'écran, slide, texte large | Image entière + fond flou (P2-E) ou recomposition |
| Plan avec titres/graphismes 16:9 | Retirer les graphismes avant, les refaire en vertical |

A. Auto Reframe (par défaut)
1. `ppro_reframe_vertical {aspect: "9:16", strategy: "face"}` [prévu] (équivalent de Sequence > Auto Reframe Sequence, Motion Tracking selon la table ; « Don't nest » sauf keyframes de mouvement ou changements de vitesse à conserver).
2. `ppro_export_frames {every: 2, size: 480}` [prévu] → `media_contact_sheet` [prévu] : chercher visages coupés, bascules brusques.
3. Corriger un plan : `ppro_set_keyframes {clipId, effect: "Motion", prop: "Position", keyframes}` [prévu] ou, aujourd'hui, guider l'utilisateur (Effect Controls > Auto Reframe > Adjust Framing).
4. Vérifier : `ppro_export_frame` [existant] à 3 instants (début, milieu, fin).

B. Centrage fixe (calcul pour source 1920 × 1080 dans 1080 × 1920)
1. `ppro_create_sequence {width: 1080, height: 1920, fps source}` [prévu].
2. `ppro_set_transform {scale: 177.8, position: [x, 960]}` [prévu] ; x = 540 montre le centre, x ∈ [−626 ; 1706] balaie toute la largeur. Source 3840 × 2160 : scale 88.9.
3. Une seule position par plan ; si le sujet sort, passer en C.

C. Suivi de visage par keyframes
1. `ppro_export_frames {every: 1}` [prévu] → `media_detect_faces` [prévu] → x du visage par seconde.
2. Lisser (médiane sur 1 s) ; ne poser un keyframe que si le visage quitte la bande centrale de 60 % du cadre (repère) ; ease in/out.
3. `ppro_set_keyframes {Motion.Position}` [prévu]. Un recadrage fixe par plan reste préférable à un suivi nerveux.

D. Split-screen deux cadrages (calcul)
1. Deux clips empilés V1/V2, chacun dans une moitié 1080 × 960.
2. Version « large » : `ppro_set_transform {scale: 88.9, crop: {left: 16, right: 16}}` [prévu], position y = 480 (haut) et 1440 (bas).
3. Version « serrée » (visages plus gros) : scale 177.8, crop top 25 % / bottom 25 %, puis position x pour centrer chaque visage.
4. Le locuteur actif en haut (repère) ; sous-titres sur la jonction ou juste dessous.

E. Fond flou (image entière)
1. Dupliquer le clip : V1 copie `scale: 177.8` + `ppro_apply_effect {effect: "Gaussian Blur", params: {Blurriness: 100}}` (repère) ; V2 original `scale: 56.25` (1080 px de large, 608 px de haut) centré ou légèrement au-dessus du centre pour laisser les sous-titres dessous.

### P3. Zones de sécurité

1. `ppro_set_safe_zones {enabled: true, aspect: "9:16"}` [prévu] ou `ppro_add_image_overlay {path: gabarit PNG, track: V9}` [prévu] (désactiver avant export).
2. Phase 1 : `ppro_export_frame` [existant] et contrôler les marges du tableau « Zones à éviter » ci-dessous.
3. `ppro_extract_texts` [prévu] : lister chaque texte et sa position ; signaler tout texte dans les bandes.

### P4. Sous-titres mot à mot

1. Recette captions d'`adobe-editing` : `ppro_export_audio` [existant] → `media_transcribe {wordTimestamps: true, language}` [prévu].
2. Segmenter : mode karaoké 1 à 3 mots par affichage ; mode phrase ≤ 5 à 7 mots, ≤ 20 à 25 caractères par ligne en vertical, une seule ligne, 1 à 6 s par bloc, couper sur la ponctuation.
3. `ppro_captions_to_graphics {style, wordsPerLine: 3, highlight: true}` [prévu] ; repli : `ppro_import_captions {srtPath, style}` [prévu] (piste native, pas d'animation).
4. Style par défaut (voir tableau Sous-titres) : gras 700–900, blanc, contour noir 3–4 px, mot actif jaune, centre du bloc à ≈ 62 % de la hauteur (≈ 1190 px) (repère), largeur ≤ 85 %.
5. Relecture : `ppro_get_captions` / `ppro_extract_texts` [prévu] → noms propres, chiffres, ponctuation → `ppro_set_captions` [prévu].
6. Vérifier : `ppro_export_frame` [existant] sur 3 mots dont un long ; le mot le plus long ne doit pas dépasser la zone sûre.

### P5. Hook et texte d'accroche

1. Dans le transcript, repérer la phrase la plus forte des 10 premières secondes du candidat : affirmation contraire à l'intuition, question précise, promesse chiffrée, résultat montré d'abord (opus.pro).
2. Si elle n'ouvre pas le clip : `ppro_checkpoint` [existant] → `ppro_remove_ranges` [prévu] sur le préambule (phase 1 : `ppro_cut_at` [existant] + suppression par l'utilisateur).
3. `ppro_add_text {text: 4–8 mots, time: 0, duration: 2.5, style: gros, contraste, position y ≈ 420 px}` [prévu].
4. Optionnel : `ppro_punch_in {ranges: [{start: 0, end: 2, scale: 112}]}` [prévu] ou SFX court sur l'apparition du texte (`ppro_place_sfx` [prévu]).
5. Vérifier : `ppro_export_frame {time: 0}` [existant] (image de miniature) et `{time: 2}` : sujet visible, texte lisible, pas de noir.

### P6. Rythme de coupe et boucle de fin

1. `media_detect_silences {minDuration: 0.5, padding: 0.08}` [prévu] → `ppro_remove_ranges {ripple: true}` [prévu].
2. Scanner la structure : toute plage sans coupe, zoom ou texte > 4 s reçoit un changement : `ppro_punch_in` 100 → 115 % en 4 images (tokcount), alternance zoom/retour, jamais deux zooms en < 3 s ; ou b-roll 1 à 2 s (`ppro_insert_clip` [prévu]).
3. Transitions : coupe franche par défaut ; L-cut de 3 à 5 images vers un b-roll (tokcount).
4. Boucle : supprimer l'air mort final ; terminer sur une action ou une demi-phrase qui enchaîne sur la première ; même plan ou même cadrage au début et à la fin si possible ; garder 1 à 2 s stables avant la fin pour laisser liker (opus.pro).
5. Vérifier : `ppro_export_frame` [existant] à la dernière image et à la première ; les deux doivent se « suivre » visuellement (même cadrage, même lumière).

### P7. Musique et beat

1. `ppro_import_media {paths: [musique]}` [existant] → `media_detect_beats` [prévu] → `ppro_add_markers` [prévu] (downbeats, drop).
2. Coupes sur les temps forts : `ppro_cut_at {times: downbeats}` [existant] ; un changement par temps fort, pas par temps.
3. Niveaux : `ppro_set_clip_gain {voix: -16 LUFS, musique: -28 LUFS}` + `ppro_auto_duck {reductionDb: 12}` [prévu].
4. Son tendance : exporter sans musique et l'ajouter dans l'app, sauf si le montage dépend du beat ; contenu parlé/éducatif → audio original (socialk.it).

### P8. Export et déclinaisons

1. `ppro_list_export_presets` → `ppro_export_sequence {preset: "shorts-1080x1920"}` [prévu] ; phase 1 : indiquer les réglages du tableau Export à l'utilisateur.
2. `media_probe {path}` [prévu] : 1080 × 1920, fps = source, durée ≤ limite plateforme, bitrate ≥ 8 Mbit/s.
3. Déclinaisons : même séquence maître, un export par plateforme ; sous-titres incrustés (burn-in) pour tous les formats courts.

## Paramètres de référence

### Durées
| Plateforme | Maximum | Zone efficace | Source |
|---|---|---|---|
| YouTube Shorts | 3 min (vertical ou carré) ; un 16:9 n'est pas un Short ; > 1 min avec réclamation de droits = bloqué | 30–60 s | YouTube officiel, shortimize |
| TikTok | 10 min (majorité) ; jusqu'à 30 min via TikTok Studio ; pubs 5–60 s, 9–15 s recommandé | 15–60 s, pic 21–34 s | TikTok Ads officiel, renderforest, opus.pro |
| Instagram Reels | 3 min en enregistrement in-app (90 s sur certains comptes, 20 min en test) ; 15 min en import | < 90 s ; portée max 45–60 s ; > 3 min plus poussé aux non-abonnés | buffer, inro/Socialinsider |

### Zones à éviter (cadre 1080 × 1920, valeurs en px, repères issus de guides tiers)
| Bord | TikTok | Reels | Shorts | Ce qui s'y trouve |
|---|---|---|---|---|
| Haut | 108–192 | 210–270 | 120–288 | Onglets, nom de compte, bouton Suivre, barre de progression |
| Bas | 320–400 | 310–670 (Meta : 35 %) | 288–300 | Légende, son, nom de chaîne, bouton S'abonner |
| Droite | 100–140 | 84–230 | 96–140 | Pile like / commentaire / partage |
| Gauche | 60 | 65 | — | Marge gestes |
Zone sûre multiplateforme : x 90–990, y 260–1450 (≈ 900 × 1400 centré). Couverture Reels sur la grille du profil : recadrée 3:4 (1080 × 1440), 240 px perdus en haut et en bas.

### Sous-titres
| Paramètre | Valeur | Source |
|---|---|---|
| Mots par affichage | karaoké 1–3 ; phrase 3–7 | opus.pro, blitzcut |
| Caractères par ligne (vertical) | 20–25, une ligne | enchanted.media, blitzcut (35–42 max en 2 lignes) |
| Durée d'un bloc | 1–6 s, idéal 2–3 s | opus.pro |
| Vitesse de lecture | ≤ 20 car./s ; 3–4 mots/s | blitzcut, opus.pro |
| Police | sans-serif gras 700–900 (Montserrat, Poppins, Anton…) | blitzcut, firecut |
| Taille | sources divergentes : 60–100 px (dialogue, max 100) ou 134–192 px (7–10 % de hauteur) ; défaut 90 px pour 1–3 mots (repère) | blitzcut (2 guides) |
| Bloc de texte | ≤ 20 % de la hauteur (≤ 384 px) | blitzcut |
| Contour / ombre | noir 3–4 px ; ombre 2–3 px à 30–50 % en option | blitzcut |
| Fond | aucun, ou boîte noire 70–80 % | blitzcut |
| Couleurs | blanc ; mot actif jaune vif ; contraste ≥ 4.5:1, viser 7:1 | blitzcut |
| Position verticale | 55–75 % depuis le haut ; TikTok 50–73 %, Reels 45–68 %, Shorts 55–78 % | blitzcut |
| Casse | capitales pour le style « hype », phrase pour le style posé | kapwing, blitzcut |

### Export
| Réglage | Valeur | Source |
|---|---|---|
| Résolution / ratio | 1080 × 1920, 9:16, pixels carrés, progressif | tous |
| Fps | celui de la source (24/25/30/60), jamais converti | YouTube officiel, clipspeed |
| Codec | H.264 High Profile, MP4, moov en tête ; 2 B-frames, GOP fermé = fps/2 | YouTube officiel |
| Débit vidéo | VBR 1 passe, cible 10–12 Mbit/s, max 14–16 ; YouTube : 8 Mbit/s à 24–30 fps, 12 à 48–60 fps ; TikTok pub ≥ 2,5 Mbit/s | online-tech-tips, YouTube, TikTok Ads |
| Audio | AAC, 48 kHz, stéréo, 320 kbit/s (YouTube : 384) | online-tech-tips, YouTube |
| Taille max | Reels 4 Go ; TikTok pubs 500 Mo ; TikTok Studio < 10 Go | hopperhq, TikTok Ads, renderforest |
| Sous-titres | incrustés (burn-in) ; SRT en plus pour YouTube | checksub, kapwing |

### Auto Reframe (Premiere)
| Réglage | Quand | Effet observé |
|---|---|---|
| Slower Motion | talking head, caméra fixe | ≈ 45 keyframes / 30 s, quasi invisibles |
| Default | la plupart des contenus | suit l'action, peut peiner sur action rapide |
| Faster Motion | sport, sujet rapide | ≈ 83 keyframes / 30 s, peut distraire |
| Don't nest clips | défaut | transitions conservées, keyframes Motion perdus |
| Nest clips | keyframes ou vitesse à garder | Motion conservé, transitions perdues |
Source : streamingmediaglobal, larryjordan, wiki Curtin. Un seul axe est ajusté (horizontal pour 16:9 → 9:16), jamais l'échelle.

### Rythme
| Paramètre | Valeur | Source |
|---|---|---|
| Intervalle entre changements | 3–5 s ; jamais > 8 s | blitzcut, joyspace, opus.pro |
| Coupes par minute | 15–25 | blitzcut |
| Pause supprimée | > 0,5 s | blitzcut, opus.pro |
| Punch-in | 100 → 115 % en 4 images ; retour avant le suivant | tokcount |
| B-roll flash | 1–2 s (3 images pour un gag) | joyspace, tokcount |
| L-cut | audio suivant 3–5 images avant l'image | tokcount |
| Premier pattern interrupt | avant 10 s | tokcount |

## Erreurs fréquentes et comment les détecter

- **Clip qui dépend du contexte** : le transcript du clip contient « comme je disais », « ça », « lui » sans référent → changer le point d'entrée ou abandonner.
- **Montée avant le hook** : les 2 premières secondes sont du silence, une respiration ou une amorce → `media_detect_silences` sur [0, 3] ; `ppro_export_frame {time: 0}` noir ou flou.
- **Recadrage qui coupe un visage** : contact sheet toutes les 2 s ; visage à cheval sur le bord → keyframe ou split-screen.
- **Suivi nerveux** : > 2 keyframes de position par seconde sur un plan parlé → lisser ou passer en « Slower Motion ».
- **Auto Reframe relancé ou appliqué à des stills** : image fixe non recadrée ou cadrage aberrant → refaire depuis la séquence d'origine.
- **Texte 16:9 recadré** : titre tronqué à gauche/droite → retirer et refaire via `ppro_add_text`.
- **Sous-titre dans la bande UI** : centre du bloc sous 1 450 px ou texte dans les 100–140 px de droite → remonter.
- **Sous-titre illisible** : plus de 25 caractères sur une ligne, pas de contour, bloc > 20 % de la hauteur, mot affiché < 0,3 s.
- **Transcription brute** : noms propres, chiffres, homophones → relecture systématique avant incrustation.
- **Plan statique > 5 s** : balayer `ppro_get_sequence` ; aucune coupe, keyframe ni texte sur la plage → ajouter un changement.
- **Fin avec outro, logo ou CTA long** : dernière seconde sans parole ni action → couper.
- **Musique qui écrase la voix** : `media_loudness` voix < musique + 8 dB (repère) → ducking.
- **Fps converti ou 1080 × 1356 pris pour du 9:16** : `media_probe` sur l'export.
- **Ratio 16:9 envoyé en Short** : n'est pas classé Short par YouTube.

## Contrôle qualité (avant de livrer)

- [ ] Durée dans la zone efficace de la plateforme ; sous la limite dure.
- [ ] Image 0 : sujet visible, texte lisible, pas de noir ; hook complet avant 2,5 s.
- [ ] Contact sheet toutes les 2 s : visage entier à chaque image, pas de bascule brusque.
- [ ] Aucun texte ni visage dans les bandes haut/bas/droite de la plateforme cible.
- [ ] Sous-titres relus ; mot le plus long dans la zone sûre ; mot actif visible ; aucun bloc > 6 s.
- [ ] Aucune plage > 5 s sans changement visuel ; aucune pause > 0,5 s.
- [ ] Voix ≈ −16 LUFS, musique ≈ −28 LUFS ; pas de piste non licenciée incrustée si le compte est pro.
- [ ] Dernière image enchaîne sur la première ; pas d'outro.
- [ ] Export : 1080 × 1920, fps source, H.264, ≥ 8 Mbit/s, AAC 48 kHz, sous-titres incrustés ; vérifié par `media_probe`.
- [ ] Checkpoint conservé ; `ppro_rewind` proposé.

## Comment un humain le fait dans Premiere / After Effects

- **Séquence verticale** : File > New > Sequence (Ctrl+N) → preset « Social Media / Vertical 1080×1920 » ou Settings : 1080 × 1920, pixels carrés, progressif, fps source. À l'insertion d'un clip 16:9, choisir « Keep existing settings ».
- **Extraire un passage** : I / O sur la timeline → clic droit > Make Subsequence ; ou dupliquer la séquence (clic droit dans le Projet > Duplicate) et trim.
- **Auto Reframe séquence** : sélectionner la séquence dans le Projet → Sequence > Auto Reframe Sequence (ou clic droit) → Target Aspect Ratio 9:16 → Motion Tracking → Don't nest / Nest → Create. Nouvelle séquence dans le chutier « Auto Reframed Sequences ».
- **Auto Reframe clip** : Effects > Auto Reframe sur le clip → Effect Controls : Motion Tracking, Analyze, puis cocher « Adjust Framing » pour reprendre les keyframes générés à la main.
- **Recadrage manuel** : Effect Controls (Shift+5) > Motion > Scale / Position ; keyframes au chrono ; clic droit clip > Set to Frame Size (garde la résolution) plutôt que Scale to Frame Size.
- **Split-screen** : View > Show Rulers / Show Guides, guide à 50 % ; Effects > Video Effects > Transform > Crop ; View > Guide Template > Save Guides as Template.
- **Fond flou** : Alt-glisser le clip sur V1, Scale 177,8 %, Effects > Blur & Sharpen > Gaussian Blur ; V2 à 56,25 %.
- **Zones de sécurité** : Program Monitor > clé à molette > Safe Margins (pourcentages dans Sequence > Sequence Settings) ; ou PNG gabarit sur la piste du haut, désactivé à l'export.
- **Sous-titres** : Window > Workspaces > Captions and Graphics ; Window > Text > onglet Transcript > Transcribe sequence (langue, piste audio) → onglet Captions > Create captions (Format Subtitle, longueur max ≈ 20 caractères, Single line) → style dans Essential Graphics (ou panneau Propriétés) : police, taille, contour, fond, position → Track Style > Create Style pour tout appliquer.
- **Mot à mot animé** : clic droit sur un caption > Upgrade Caption to Graphic, puis découper et animer (Scale / Opacity par mot) ; ou MOGRT « caption » avec paramètres exposés ; ou nester la piste de sous-titres pour changer de style sans toucher au montage.
- **Texte d'accroche** : outil Texte (T) dans le Program Monitor ; Essential Graphics > Align and Transform ; durée par trim.
- **Zoom** : Motion > Scale keyframes 100 → 115 sur 4 images, Ease Out ; ou Nest + Scale.
- **Beats** : lecture (Espace) + M à chaque temps fort ; ou clip droit > Edit in Adobe Audition → Window > Markers → Mark Beats, sauvegarder ; Clip > Automate to Sequence (Placement : At Unnumbered Markers, Overwrite, Ignore Audio).
- **Musique à la bonne durée** : Essential Sound > Music > Duration > Remix.
- **Ducking** : Essential Sound > Dialogue sur la voix, Music > Ducking sur la musique.
- **Export** : File > Export (Ctrl+M) → H.264 → preset « Match Source – Adaptive High Bitrate » → vérifier 1080 × 1920, fps → Bitrate VBR 1 pass, cible 10–12 Mbit/s → Audio AAC 48 kHz 320 kbit/s → onglet Captions : « Burn Captions Into Video » → Hardware Encoding.
- **After Effects** : Composition 1080 × 1920 ; titre d'accroche avec animateurs de texte (Position + Opacity, ease out 0,4 s) ; sous-titre mot à mot par expression sur `sourceText` lisant un tableau de mots et de temps ; exporter en MOGRT (Essential Graphics > Export Motion Graphics Template) → Premiere.

## Sources

- YouTube Help — Understand three-minute YouTube Shorts — https://support.google.com/youtube/answer/15424877 — limite 3 min, vertical ou carré, 16:9 exclu, blocage > 1 min avec réclamation.
- YouTube Help — YouTube Shorts upload tips — https://support.google.com/youtube/answer/12921536 — Shorts = vertical ≤ 3 min, upload via Studio.
- YouTube Help — Recommended upload encoding settings — https://support.google.com/youtube/answer/1722171 — H.264 High, B-frames, GOP, 8/12 Mbit/s, AAC 48 kHz.
- TikTok Ads Help — Reservation in-feed ad specifications — https://ads.tiktok.com/help/article/tiktok-reservation-in-feed-ads-reach-frequency — 9:16 ≥ 540×960, 5–60 s (9–15 s), ≥ 2 500 kbit/s, 500 Mo, éléments UI.
- Buffer — Instagram Reels length — https://buffer.com/library/instagram-reels-length — limites in-app / import, < 90 s pour la portée.
- Inro — Instagram Reels time limit explained — https://www.inro.social/blog/instagram-reels-can-now-be-20-minutes-long-new-time-limit-explained-2025 — 3 min majorité, 20 min en test, données Socialinsider 45–60 s.
- Hopper HQ — Instagram Reel size — https://www.hopperhq.com/blog/instagram-reel-size/ — specs Reels, zones Meta 14 % / 35 % / 6 %, grille 3:4, 4 Go.
- House of Marketers — Guide to safe zones — https://www.houseofmarketers.com/guide-to-safe-zones-tiktok-facebook-instagram-stories — pourcentages TikTok/Reels/Stories.
- Quso — TikTok dimensions — https://quso.ai/blog/tiktok-dimensions — bas 270 px, droite 100 px.
- Adaptly Post — Social media safe zones 2026 — https://adaptlypost.com/blog/social-media-safe-zones-2026-complete-guide — marges px par plateforme, zone 900×1400.
- Clipspeed — YouTube Shorts size — https://www.clipspeed.ai/blog/youtube-shorts-size.html — 15 % haut/bas, 140 px droite, fps source.
- TryMyPost — TikTok ad specs & safe zones — https://www.trymypost.com/blog/tiktok-ad-specs-2026-safe-zones — 150 / 350–400 / 120 px, 21–34 s.
- Viberoll — Short-form video specs — https://viberoll.questera.ai/learn/short-form-video-specs/ — tableau comparatif, défaut 220/450/150 px.
- Renderforest — TikTok video specs — https://www.renderforest.com/blog/tiktok-video-specs-dimensions — 23–60 fps, 30 min Studio, < 10 Go.
- Picc — Safe zone templates — https://explore.picc.co/safe-zone-templates-social-media-videos/ — Safe Margins Premiere, gabarit PNG, 672 px bas Shorts.
- Larry Jordan — Auto Reframe: convert a horizontal timeline to vertical — https://larryjordan.com/articles/auto-reframe-convert-a-horizontal-timeline-to-vertical-in-adobe-premiere-pro/ — presets de mouvement, nesting, pas deux fois, pas de stills.
- Curtin MCASI wiki — SPRO2004 Auto Reframe — https://curtinmcasi.atlassian.net/wiki/spaces/POS/pages/1805582339/SPRO2004+-+Auto+Reframe — procédure clip et séquence, Adjust Framing.
- Streaming Media — Review: Premiere Pro Auto Reframe — https://www.streamingmediaglobal.com/Articles/Editorial/Featured-Articles/Review-Adobe-Premiere-Pro-Auto-Reframe-135118.aspx — 45 vs 83 keyframes, un seul axe, nested vs non.
- Miracamp — How to use Auto Reframe — https://miracamp.com/learn/premiere-pro/auto-reframe — menus, vérification des titres.
- Elephorm — Créer une séquence verticale avec Premiere Pro — https://www.elephorm.com/formation/maitriser-premiere-2026/creer-une-sequence-verticale-pour-les-reseaux-sociaux-avec-premiere-pro — « Recadrer automatiquement la séquence », contrôle plan par plan (FR).
- Enchanted Media — Editing vertical videos in Premiere Pro — https://www.enchanted.media/editing-vertical-videos-in-premiere-pro — preset Social, split-screen par guides, captions 20 caractères, preset d'export.
- FlexClip — Vertical split screen in Premiere Pro — https://www.flexclip.com/learn/vertical-split-screen-premiere-pro.html — guides, Crop, gabarit de guides.
- Senego — Une vidéo horizontale recadrée en vertical perd 68 % — https://senego.com/une-video-horizontale-recadree-en-vertical-perd-environ-68-de-sa-largeur_2015598.html — 607 px, méthodes de recadrage (FR).
- ShortGenius — Ratio d'aspect vidéo verticale — https://shortgenius.com/fr/blog/ratio-aspect-video-verticale — 250 px bas, 4:5 = 1080×1350, 1080×1356 ≠ 9:16 (FR).
- Online Tech Tips — Premiere Pro export settings for TikTok, Reels, Shorts — https://www.online-tech-tips.com/premiere-pro-export-settings-tiktok-instagram-reels-youtube-shorts/ — VBR 1 passe, 10–12 Mbit/s, AAC 320.
- Blitzcut — Best caption size for TikTok — https://blitzcutai.com/blog/best-caption-size-tiktok-2026 — 60–100 px, bloc ≤ 20 %, gras 700–900.
- Blitzcut — How to make captions look professional — https://blitzcutai.com/blog/how-to-make-captions-look-professional — 7–10 %, contour 3–4 px, jaune, 55–75 %, 20 car./s.
- Blitzcut — TikTok 3-second rule, jump cut timing — https://blitzcutai.com/blog/3-second-rule-tiktok-jump-cuts — coupe toutes les 3–4 s, pauses > 0,5 s.
- Captions (aide) — Caption styles by platform — https://captions.ai/help/guides/engagement/caption-styles-by-platform — position par plateforme, 1–3 mots.
- Opus — TikTok caption & subtitle best practices — https://www.opus.pro/blog/tiktok-caption-subtitle-best-practices — 3–7 mots, 1–6 s, 3–4 mots/s, bas 25 %.
- Opus — Ideal TikTok length & format for retention — https://www.opus.pro/blog/tiktok-length-format-retention-data — 21–34 s, 3–5 s, 1–2 s stables en fin (données internes non vérifiées).
- Opus — YouTube Shorts hook formulas — https://www.opus.pro/blog/youtube-shorts-hook-formulas — hook en 2–2,5 s, texte ≥ 2 s, première image.
- Opus — TikTok hook formulas — https://www.opus.pro/blog/tiktok-hook-formulas — types de hooks, 65 % à 3 s, justifier en 10–15 s.
- Kapwing — Social media caption styles — https://www.kapwing.com/resources/social-media-captions-styles-a-complete-guide/ — styles, casse, SRT YouTube.
- Firecut — Guide to Premiere captions — https://firecut.ai/blog/the-ultimate-guide-to-premiere-captions-edit-customize-fast/ — Text panel, Track Style.
- GoTranscript — Premiere Pro 15 captioning workflow — https://gotranscript.com/public/adobe-premiere-pro-150-new-captioning-workflow-tutorial-and-tips — export burn-in vs sidecar, Format Subtitle.
- Checksub — Add captions in Premiere Pro — https://www.checksub.com/blog/how-easily-add-captions-subtitles-premiere-pro-videos — onglet Captions à l'export.
- AutoCut — Viral moment — https://www.autocut.com/en/blogs/viral-moment/ — critères : autonome, hook, pic émotionnel, une idée.
- Vidpros — Podcast clips: editor's cut — https://vidpros.com/podcast-clips/ — score /5, 45–60 s, 8–12 clips/h, titre 4–8 mots, tiers supérieur.
- Creator Handbook — How to make a perfect loop — https://www.creatorhandbook.net/how-to-make-a-perfect-loop-tiktok/ — tourner fin et début d'un trait, lumière constante, test en privé.
- Shortimize — Watch time TikTok vs Reels vs Shorts — https://www.shortimize.com/blog/compare-watch-time-tiktok-vs-reels-vs-shorts — métriques par plateforme, boucles comptées sur Shorts, skip rate 3 s Reels.
- Joyspace — Pattern interrupts — https://joyspace.ai/pattern-interrupt-reset-attention-span — règle des 5 s, types d'interruptions, b-roll 1–2 s.
- TokCount — 14 micro-cut transitions — https://tokcount.com/blog/14-micro-cut-transitions-that-keep-completion-rates-above-60-percent — push-in 115 % en 4 images, L-cut 3–5 images, statique < 4 s.
- Socialk — Using trending audio on Reels and TikTok — https://socialk.it/en/blog/using-trending-audio-reels-tiktok — cycle de tendance, licence comptes pro, audio original pour le parlé.
- Vidio — Sync cuts to a sound in Premiere Pro — https://www.vidio.ai/blog/article/is-there-a-way-to-automatically-sync-cuts-to-a-tiktok-sound-in-premiere-pro — marqueurs M, Audition Mark Beats, Automate to Sequence.
- Reddit r/premiere — How to frame like this for vertical reels — https://www.reddit.com/r/premiere/comments/1fntbb3/ — empiler les angles dans une séquence 1080×1920, scale/position seul coupe trop.
