---
name: titres-texte-sous-titres
description: Ajouter, styler, placer et chronométrer du texte à l'écran dans Premiere Pro / After Effects via adobe-mcp — titres, cartons, call-outs, lower thirds (synthés), sous-titres et légendes (transcription, piste de légendes, SRT, incrustation, SDH), captions « mot à mot » pour les formats courts, Motion Graphics Templates (.mogrt). À charger dès qu'une demande parle de texte, police, lisibilité, zone de sécurité, sous-titre, caption, transcription, synthé, bandeau, MOGRT ou Essential Graphics.
---

# Titres, texte à l'écran, lower thirds, sous-titres et MOGRT

## Quand utiliser ce skill

- L'utilisateur veut un titre, un carton de chapitre, un texte d'emphase, une citation, une statistique, un appel à l'action à l'écran.
- Il faut présenter une personne (nom + fonction) : lower third / synthé.
- Il faut sous-titrer : transcription, piste de légendes native, export SRT/VTT, incrustation, traduction, version SDH.
- Il veut des captions animées « mot à mot » pour un format vertical court.
- Il faut créer, importer, paramétrer ou corriger un MOGRT.
- Il faut relire ou corriger tous les textes d'une séquence.
- Il faut vérifier qu'un texte reste lisible et dans la zone de sécurité (16:9 ou 9:16).

Détails chiffrés complémentaires : `references/normes-sous-titres.md` (normes par diffuseur et par langue) et `references/zones-securite.md` (marges par plateforme et résolution).

## Principes

1. **Taille plancher : 28 px de hauteur de capitale à 1080p**, et viser plus. En dessous, la compression de streaming et les petits écrans rendent le texte illisible.
2. **Captions incrustées : 40–60 px en 16:9 1080p, 60–75 px en 9:16 1080×1920** (48–55 px est le minimum lisible sur téléphone). Un texte mot à mot monte à 70–90 px ; ne pas dépasser ~100 px, sinon il mange l'image.
3. **Hiérarchie par la taille** : un titre fait 3 à 4 fois la taille d'un sous-titre ; dans un lower third, le nom fait 4–6 % de la hauteur d'image et la fonction 2–3 %, une graisse plus légère. L'œil doit savoir quoi lire en premier.
4. **Sans-serif, graisse 600–900 pour tout texte posé sur de la vidéo**, 400–700 pour les sous-titres à fond noir. Les fines (300) disparaissent après compression ; éviter les polices qui confondent I, l et 1.
5. **Contraste 4,5:1 minimum (3:1 pour les gros titres)**. Blanc sur image = toujours un renfort : contour noir 2 px à 1080p, ou ombre portée, ou boîte noire à 70–80 % d'opacité avec 0,5 em de marge. Sans renfort, le texte disparaît sur les zones claires.
6. **Une ou deux familles de police par projet, jamais plus.** Le mélange de polices est l'erreur la plus visible d'un montage amateur.
7. **Resserrer l'interlettrage quand la taille augmente** (jusqu'à −0,03 em à 140 px) et l'ouvrir légèrement sur les petits corps. Interligne 120–140 % pour un bloc de deux lignes.
8. **Zone de sécurité 16:9 : rien d'important hors des 90 % centraux (action safe), aucun texte hors des 80 % centraux (title safe)**, soit 192 px de marge latérale et 108 px en haut/bas à 1080p. Les téléviseurs et certains lecteurs rognent encore les bords ; la norme EBU R95 autorise 3,5 % / 5 % pour le HD, mais 5 % / 10 % reste le réglage sûr.
9. **Web 16:9 : éviter aussi les 10 % du haut et du bas**, où les contrôles du lecteur se superposent au texte.
10. **Vertical 9:16 : travailler dans une boîte de 900×1400 px centrée** (≈ 90 px de côté, ≈ 260 px haut et bas) et poser les captions dans le tiers bas-milieu, entre 370 et 720 px du bas. En dessous, l'interface des applications (légende, son, boutons) recouvre le texte ; la colonne de droite (120–160 px) est réservée aux icônes.
11. **Durée d'un texte = nombre de mots × 0,3 s au minimum**, et le viser « lisible deux fois » (≈ 0,6 s par mot). Un texte de 10 mots tient donc 3 s au strict minimum, 6 s confortablement.
12. **L'animation ne compte pas dans le temps de lecture** : entrée + fenêtre stable + sortie. Exemple : 0,4 s d'entrée + 2 s stable + 0,3 s de sortie = 2,7 s.
13. **Lower third : 3 à 6 s à l'écran, apparition 1–2 s après le début de la parole**, à la première apparition d'une personne, jamais à cheval sur une coupe ou une transition. Au-delà de 8 s il « s'incruste », sous 3 s on ne le lit pas.
14. **Entrée en ease-out (décélération) 0,4–0,6 s, sortie en ease-in (accélération) 0,3–0,4 s**, soit 30 % plus rapide que l'entrée. Entrer en ease-in donne l'impression de heurter un mur. Formats courts : 0,2–0,4 s ; explicatif : 0,5–0,8 s.
15. **Durées en nombre entier d'images** (12–18 images à 30 fps pour une entrée). Fondu de caption : 3–6 images. Pas de rebond, de rotation ni d'animation longue sur un texte informatif.
16. **Sous-titres : 2 lignes maximum, 42 caractères par ligne maximum (36–40 en français TV/vidéo)**. Une seule ligne tant que le texte tient.
17. **Vitesse de lecture : 15–17 caractères/s en français (14–15 confortable), 20 max en anglais ; 13–17 pour un public enfant.** Au-delà, les spectateurs décrochent ou l'œil ne quitte plus le bas de l'image.
18. **Durée d'un sous-titre : minimum 1 s (5/6 s absolu, 16 images en normes FR), maximum 6–7 s (5 s en normes FR).** Intervalle minimal de 2 images entre deux sous-titres (4 en normes FR) ; se caler sur les changements de plan, pas à 1–7 images d'une coupe.
19. **Couper les lignes sur le sens** : après une ponctuation, jamais entre article et nom, ni verbe et complément, ni avec un trait d'union. Une phrase par sous-titre quand c'est possible.
20. **Synchronisation à ±3 images de la parole** ; un sous-titre peut rester jusqu'à 12 images après la fin de la réplique, jamais apparaître avant qu'on ait commencé à parler (sauf 0,5–1 s d'avance volontaire pour des captions incrustées de format court).
21. **Mot à mot : 1–3 mots par carte, phrases courtes 3–7 mots, 32 caractères par ligne max.** Fichier soft (SRT/VTT) : texte brut sans style, le lecteur applique les préférences du spectateur ; incrustation : style explicite obligatoire.
22. **SDH : identifier le locuteur hors champ entre crochets, décrire les sons utiles entre crochets en minuscules (ex. [rires]), musique en capitales ou ♪ paroles ♪, jamais de capitales pour l'emphase** (les capitales ralentissent la lecture d'environ 10–15 %).
23. **MOGRT : n'exposer que ce que le monteur doit changer** (texte, une couleur, une position). Une propriété animée exposée telle quelle perd ses images-clés ; piloter l'animation par expression.
24. **Toujours relire les textes générés** : noms propres, chiffres, ponctuation, casse. Une transcription automatique se trompe surtout sur les noms et les termes techniques.
25. **Vérifier en image exportée, à taille réelle sur téléphone** pour tout format vertical et à 1/2 résolution minimum pour un 16:9. Un texte lisible dans le moniteur à 25 % ne l'est pas forcément sur mobile.

## Procédures

Légende : [existant] = tool de phase 1 disponible ; [prévu] = tool du catalogue non encore implémenté. Toujours commencer par `ppro_get_capabilities` + `ppro_get_sequence` [existant].

### P1 — Poser un titre, un carton ou un texte d'emphase

Objectif : un texte lisible, dans la zone de sécurité, affiché assez longtemps.

1. Lire la séquence : format (16:9 / 9:16), fps, pistes vidéo libres (`ppro_get_sequence` [existant]).
2. Choisir le gabarit selon l'usage (voir tableau « Tailles ») : titre plein cadre, call-out, étiquette lieu/date, statistique, appel à l'action.
3. Calculer la durée : `max(mots × 0,3 s + anim, durée cible du tableau)`. Caler l'entrée sur une coupe ou un temps fort, la sortie avant la coupe suivante.
4. Exporter l'image à l'instant visé (`ppro_export_frame {time}` [existant]) et regarder où est le sujet : ne pas couvrir un visage, une bouche, un élément d'interface filmé.
5. Créer le calque : `ppro_add_text {text, time, duration, track: V2+, style:{font, size, color, align, stroke|shadow|background, position}}` [prévu]. Position en zone title safe ; texte centré pour un titre, aligné à gauche pour un call-out latéral.
6. Entrée/sortie : `ppro_set_keyframes` [existant] sur Opacity (0→100 sur 0,4 s ease-out) et Position (+40 px → 0) ; sortie 0,3 s ease-in. Ou MOGRT générique via `ppro_insert_mogrt` [existant].
7. Vérifier : `ppro_export_frame` à t+0,5 s (après l'entrée) et à la fin de la fenêtre stable ; relire `ppro_extract_texts` [prévu] pour l'orthographe.

Vérification : texte entièrement dans title safe, contraste visible sur l'image exportée, durée ≥ mots × 0,3 s après soustraction des animations.

### P2 — Lower third (synthé nom + fonction)

Objectif : présenter une personne sans gêner l'image.

1. Repérer la première prise de parole de la personne (transcription `media_transcribe {diarize: true}` [prévu] ou marqueurs `ppro_get_markers` [existant]).
2. Exporter une image à cet instant [existant] : vérifier que le bas-gauche est libre (sinon bas-droite, ou plus haut ; jamais au niveau des yeux du sujet, jamais sur la bouche en gros plan).
3. Paramètres : début = parole + 1 à 2 s, durée 4–6 s (3 s mini, 8 s maxi), pas à cheval sur une coupe (`ppro_get_sequence {range}` pour lister les coupes autour).
4. Avec un MOGRT de projet : `ppro_list_mogrt_params {path}` → `ppro_insert_mogrt {path, time, duration, track, params:{Nom, Fonction, Couleur}}` [prévu].
   Sans MOGRT : `ppro_add_shape {rect}` [prévu] + deux `ppro_add_text` [prévu] (nom 44–65 px à 1080p, graisse 600–700 ; fonction 26–32 px, graisse 400, 60 % de la largeur du nom), position ≈ x 96 px, y 864 px à 1080p (coin bas-gauche action safe).
5. Animation sobre : glissement 30–40 px + opacité, 0,4–0,5 s ease-out en entrée, 0,3 s ease-in en sortie ; ou « trim path » de la barre puis texte.
6. Réutiliser le même style, la même position et la même durée pour toutes les personnes de la vidéo.

Vérification : image exportée à mi-durée ; nom lisible à 50 % de taille d'affichage ; `ppro_extract_texts` pour l'orthographe des noms (demander confirmation à l'utilisateur pour tout nom propre).

### P3 — Sous-titres : transcription → piste de légendes → SRT ou incrustation

Objectif : une piste de légendes propre, conforme aux normes, exportable.

1. Exporter la voix seule : `ppro_export_audio {tracks: voix, preset: "transcription"}` [existant] (pas la musique : elle dégrade la transcription).
2. `media_transcribe {path, language, wordTimestamps: true, diarize?}` [prévu] → segments + mots horodatés.
3. Segmenter en sous-titres : ≤ 42 caractères/ligne (≤ 40 en FR), 1–2 lignes, coupure sur ponctuation ou groupe de sens, durée = `clamp(caractères / CPS cible, 1 s, 6 s)` avec CPS cible 15 (FR) ou 17–20 (EN), intervalle ≥ 2 images, calage sur les changements de plan (`media_detect_scenes` [prévu] : si un bord est à ≤ 7 images d'une coupe, le poser sur la coupe).
4. Écrire le SRT (UTF-8, timecodes `HH:MM:SS,mmm`) et l'importer : `ppro_import_captions {srtPath, format: "subtitle"}` [prévu]. Alternative actuelle : écrire le SRT, puis demander à l'utilisateur de l'importer (Fenêtre > Texte > Légendes > Importer des légendes à partir d'un fichier).
5. Relecture : `ppro_get_captions` [prévu] → corriger noms, chiffres, ponctuation → `ppro_set_captions {edits}` [prévu]. Ne jamais corriger un nom propre sans l'avoir demandé.
6. Style de piste (si incrustation) : police sans-serif, 40–60 px à 1080p, blanc, contour 2 px ou boîte noire 70–80 %, centré, 10–15 % du bas en 16:9 ; `ppro_import_captions {style}` ou `ppro_update_text` [prévu].
7. Livraison : `ppro_export_captions {format: "srt"|"vtt"}` [prévu] pour un fichier soft ; `ppro_burn_captions` [prévu] + `ppro_export_sequence` [existant] pour l'incrustation.

Vérification : aucun sous-titre > 42 car./ligne, > 2 lignes, > 20 CPS, < 1 s ; aucun chevauchement ; début/milieu/fin synchronisés sur image exportée + lecture par l'utilisateur.

### P4 — Captions « mot à mot » animées (formats courts 9:16)

Objectif : captions incrustées lisibles sur téléphone, rythmées sur la voix.

1. Prérequis : séquence verticale (`ppro_extract_range_to_sequence {aspect: "9:16"}` [prévu]) et transcription mot à mot (P3 étapes 1–2).
2. Grouper : 1–3 mots par carte en mot à mot, ou 3–7 mots par phrase avec surlignage du mot courant ; aucune carte < 0,3 s ; regrouper les mots courts (« et », « de ») avec le suivant.
3. Style : 60–75 px (phrase) ou 70–90 px (mot à mot) à 1080×1920, graisse 700–900, capitales ou casse mixte selon la charte, contour noir ou boîte, surlignage du mot courant par couleur ou changement d'échelle 105–110 %. Position : 370–720 px du bas, largeur ≤ 900 px, jamais sur la bouche (visage ≈ y 200–900 en cadrage parlant).
4. Générer : `ppro_captions_to_graphics {style, wordsPerLine, highlight}` [prévu] depuis la piste de légendes, ou une série de `ppro_add_text` [prévu] avec `ppro_set_keyframes` (échelle 95→100 % sur 3–4 images ease-out) [prévu].
5. Vérifier sur 3 images exportées [existant] : début, milieu, fin ; puis `ppro_set_safe_zones {aspect: "9:16"}` [prévu] et nouvelle image.

Vérification : aucune carte hors de la boîte 900×1400 ; mot courant distinct ; pas de texte sur le visage ; lisible sur une image réduite à 360 px de large.

### P5 — Importer un SRT existant ou produire une version traduite

1. Lire le SRT fourni ; vérifier l'encodage UTF-8 et la cohérence de fps/timecode avec la séquence (`ppro_get_sequence` [existant]).
2. Traduction : l'agent traduit segment par segment (`gen_translate` = l'agent, pas d'API) en gardant les timecodes, puis recompte : le français est ~15–20 % plus long que l'anglais, condenser plutôt que dépasser 42 caractères ou 15–17 CPS. Ne jamais traduire mot à mot une carte de 1–3 mots : regrouper.
3. `ppro_import_captions {srtPath, track: nouvelle piste}` [prévu] ; une piste par langue.
4. Export par langue : `ppro_export_captions` [prévu].

Vérification : nombre de sous-titres identique entre langues (sauf regroupements annoncés), aucun > 2 lignes.

### P6 — Relecture et correction de tous les textes

1. `ppro_extract_texts` + `ppro_get_captions` [prévu] → liste (clip, texte, start, end).
2. Contrôler : orthographe, accents sur capitales, casse cohérente, chiffres (1–10 en lettres dans les sous-titres), unités, noms propres (demander), doublons entre caption et call-out au même instant.
3. Calcul des durées : signaler tout texte dont `durée < mots × 0,3 s`.
4. Appliquer : `ppro_update_text {clipId, text}` / `ppro_set_captions` [prévu]. Rapport des changements.

### P7 — Créer un MOGRT dans After Effects

Objectif : un modèle paramétrable que Premiere peut réutiliser.

1. `aeft_create_comp {1920×1080 (ou 1080×1920), fps de la séquence cible, durée 5–8 s}` [prévu] ; fond transparent.
2. Construire : `aeft_add_shape` (barre, boîte), `aeft_add_layer {type: "text"}` + `aeft_set_text` (nom, fonction), `aeft_set_keyframes` (position/opacité, ease-out 12–15 images, ease-in 9–12 images) [prévu]. Nommer les calques.
3. Exposer les propriétés essentielles : `aeft_essential_props {add: [{Source Text → "Nom"}, {Source Text → "Fonction"}, {Fill Color → "Couleur"}, {Position → "Position"}]}` [prévu]. Pour le texte, activer police/taille modifiables si le monteur doit pouvoir les changer.
4. Toute propriété animée à exposer passe par une expression (glissière → valeur), sinon l'animation est perdue.
5. Protéger intro/outro (Responsive Design – Time) pour que l'allongement du clip dans Premiere étire le maintien, pas l'animation.
6. `aeft_export_frame` à 3 instants [prévu] → regarder → corriger. Image d'aperçu (poster time) sur l'état complet.
7. `aeft_export_mogrt {compId, path}` [prévu] ; noter les polices non-Adobe Fonts utilisées (elles manqueront chez un autre utilisateur).

Vérification : `ppro_list_mogrt_params {path}` [prévu] renvoie exactement les paramètres voulus ; insertion test et image exportée.

### P8 — Importer et utiliser un MOGRT dans Premiere

1. `ppro_list_mogrt_params {path}` [prévu] → nom et type de chaque paramètre (texte, couleur, glissière, case).
2. `ppro_insert_mogrt {path, time, duration, track, params}` [prévu] ; une instance par occurrence (chaque instance est indépendante).
3. Si la durée demandée est supérieure à celle du modèle : vérifier que le modèle est « responsive » (intro/outro protégés), sinon l'animation s'étire.
4. `ppro_set_mogrt_params {clipId, params}` [prévu] pour corriger ; `ppro_export_frame` [existant] pour contrôler.
5. Polices manquantes signalées par Premiere : demander à l'utilisateur de les installer puis de relancer Premiere, ou choisir une police de substitution dans les paramètres.

### P9 — Contrôle visuel des textes d'une séquence

1. `ppro_extract_texts` [prévu] → instants ; sans ce tool, `ppro_export_frames {every: 2}` [prévu] ou plusieurs `ppro_export_frame` [existant] et `media_ocr_frames` [prévu] pour repérer le texte.
2. `ppro_set_safe_zones {enabled: true}` [prévu] puis images exportées : signaler tout texte hors title safe (16:9) ou hors boîte 900×1400 (9:16).
3. Signaler : contraste faible (texte blanc sur ciel, noir sur ombre), taille < 28 px à 1080p, texte sur visage, deux textes concurrents, durée < mots × 0,3 s.

## Paramètres de référence

### Tailles de texte (hauteur en px, 1080p 16:9 ; ×2 en 4K ; ratio en % de la hauteur d'image)

| Usage | 1080p | % hauteur | Graisse | Note |
|---|---|---|---|---|
| Titre plein cadre | 100–140 | 9–13 % | 700–800 | interlettrage −0,02 à −0,03 em |
| Titre de chapitre / heading | 56–72 | 5–7 % | 700 | |
| Call-out, statistique | 40–56 | 4–5 % | 600–700 | boîte ou contour |
| Lower third – nom | 44–65 | 4–6 % | 600–700 | |
| Lower third – fonction | 26–32 | 2–3 % | 400 | 60 % de la largeur du nom |
| Caption incrustée 16:9 | 40–60 | 4–5,5 % | 500–700 | hauteur de ligne ≤ 8 % de l'image |
| Caption 9:16 (1080×1920) | 60–75 | 3–4 % | 700–900 | mini lisible 48–55 ; mot à mot 70–90 |
| Plancher absolu | 28 | 2,6 % | — | 22 px toléré pour une note de bas d'écran |

### Durée d'affichage selon le contenu (hors animations)

| Texte | Durée de départ | Règle |
|---|---|---|
| 1–2 mots d'emphase | 1–1,5 s | |
| Call-out 3–5 mots | 1,5–2,5 s | mots × 0,3 s = plancher |
| Phrase 6–8 mots | 2,5–4 s | mots × 0,6 s = confortable |
| Statistique courte | 2–4 s | |
| Lower third | 3–6 s (≥ 4 s conseillé) | apparaît 1–2 s après la parole |
| Titre de chapitre | 1,5–3 s | |
| Citation courte | 3–6 s | |
| Appel à l'action | 2–3 s (simple) / 3–6 s (complexe) | |
| Sous-titre | suit la parole | 1 s mini, 6–7 s maxi |

### Animations d'entrée / sortie

| Contexte | Entrée (ease-out) | Sortie (ease-in) | Mouvement type |
|---|---|---|---|
| Format court mobile | 0,2–0,4 s | 0,15–0,3 s | opacité + 20–40 px |
| Vidéo explicative / YouTube | 0,4–0,6 s (12–18 im. à 30 fps) | 0,3–0,4 s | opacité, y +40→0, échelle 0,95→1 |
| Cinématique | 1–1,6 s | 0,7–1 s | fondu lent |
| Caption incrustée | 3–6 images de fondu | idem | pas de mouvement |
| Dépassement (overshoot) | ≤ 5–8 % | — | jamais sur du texte informatif |

Courbes repères : entrée `cubic-bezier(0.1, 0, 0, 1)`, sortie `cubic-bezier(0.3, 0, 0.8, 0.15)`, dans la scène `ease-in-out`. Toujours arrondir au nombre d'images entier.

### Normes de sous-titrage (résumé ; détails dans `references/normes-sous-titres.md`)

| Paramètre | Streaming EN (Netflix) | Diffuseur UK (BBC/Ofcom) | Normes FR (ATAA) | Formats courts incrustés |
|---|---|---|---|---|
| Caractères / ligne | 42 | ≈ 38 (68 % de largeur) | 36–37 TV, 38–40 vidéo, 40–42 streaming | ≤ 32 |
| Lignes | 2 | 2 (3 exceptionnel) | 2 | 1–2 |
| Vitesse | 20 CPS adulte, 17 enfant (17/13 dans la version générale) | 160–180 mots/min (≈ 0,33 s/mot) | 14–15 CPS, 16–17 = trop vite | 1–3 mots/carte |
| Durée min | 5/6 s (20 im. à 24 fps) | ≈ 0,3 s/mot, 1,2 s pour 4 mots | 16 images | 1–1,5 s |
| Durée max | 7 s | — | 5 s | 6 s |
| Intervalle | 2 images | éviter les trous < 1,5 s (enchaîner) | 4 images | — |
| Changement de plan | sur la coupe si ≤ 7 im., sinon ≥ 12 im. | se caler sur la coupe | 4–6 images autour | — |
| Sync | ± 3 images ; sortie ≤ 12 im. après | — | — | ± 200 ms ; avance 0,5–1 s tolérée |

### Zones de sécurité (résumé ; détails dans `references/zones-securite.md`)

| Format | Action safe | Title safe | Marges 1080p / 1080×1920 |
|---|---|---|---|
| 16:9 broadcast classique | 90 % (5 % / bord) | 80 % (10 % / bord) | 96×54 / 192×108 px |
| 16:9 EBU R95 (HD) | 93 % (3,5 %) | 90 % (5 %) | 67×38 / 96×54 px |
| 16:9 web | éviter 10 % haut et bas (lecteur) | idem | 108 px haut/bas |
| 9:16 universel | boîte 900×1400 centrée | idem | ≈ 90 px côtés, ≈ 260 px haut/bas |
| 9:16 captions | — | 370–720 px du bas, ≤ 900 px de large | colonne droite 120–160 px interdite |

### Réglages « Créer des légendes » (Premiere) conseillés

| Réglage | Valeur conseillée | Remarque |
|---|---|---|
| Format | Sous-titre (SRT) ; CEA-608/708 pour broadcast | |
| Longueur max. (caractères) | 38–42 (défaut 42, puis 72 depuis la v22) | indicatif : la coupure réelle dépend de la police et de la largeur de boîte |
| Durée min. | 1,2 s (minimum imposé par Premiere) | |
| Espace entre légendes | 2–4 images | |
| Lignes | Deux lignes | « une ligne » + 7 caractères max pour des cartes courtes |

## Erreurs fréquentes et comment les détecter

| Erreur | Détection | Correction |
|---|---|---|
| Texte trop petit (< 28 px à 1080p, < 48 px en 9:16) | `style.size` dans `ppro_extract_texts` ; image exportée réduite à 360 px de large | agrandir, réduire le nombre de mots |
| Texte blanc sans contour sur zone claire | image exportée : contraste visuel ; estimer la luminance moyenne derrière le texte | contour 2 px, ombre, boîte 70–80 % |
| Texte hors zone de sécurité | position ± demi-largeur du bloc comparée aux marges | recentrer, réduire la largeur |
| Caption dans les 300–450 px du bas en 9:16 | y du bloc | remonter à 370–720 px du bas |
| Texte sur le visage / la bouche | `media_detect_faces` sur image exportée, ou regard de l'agent | déplacer, réduire |
| Durée trop courte | `durée < mots × 0,3 s` | allonger ou condenser |
| Lower third à cheval sur une coupe | comparer start/end aux coupes de V1 | décaler de 0,5–1 s |
| Trois lignes de sous-titre, > 42 car./ligne | compteur sur `ppro_get_captions` | re-segmenter |
| Vitesse > 20 CPS (EN) / > 17 (FR) | `caractères / durée` | allonger, condenser, fusionner |
| Sous-titre < 1 s ou chevauchement | `end_i > start_{i+1}` ; `end − start < 1 s` | fusionner, décaler de 2 images |
| Sous-titre qui saute à 1–7 images d'une coupe | comparer aux `media_detect_scenes` | poser sur la coupe |
| Capitales pour l'emphase, ponctuation retirée | relecture `ppro_get_captions` | casse mixte, ponctuation |
| Styles incohérents entre textes (police, taille, position) | regrouper `ppro_extract_texts` par style | un style lié / style de piste unique |
| Caption et call-out qui répètent le même texte | doublons au même instant | supprimer l'un des deux |
| MOGRT figé (pas d'animation) | aperçu : image identique à 3 instants | propriété animée exposée directement → expression |
| Polices manquantes à l'import d'un MOGRT | avertissement Premiere / rendu en police par défaut | installer la police, redémarrer |
| Fichier SRT mal encodé ou mauvais fps | caractères accentués cassés, dérive progressive | UTF-8, fps de la séquence, vérifier début/milieu/fin |
| Fichier soft stylé | VTT/SRT avec balises de style | livrer brut, garder le style pour l'incrustation |

## Contrôle qualité (avant de livrer)

- [ ] Tous les textes relus : orthographe, accents sur capitales, noms propres confirmés par l'utilisateur, chiffres.
- [ ] Une ou deux polices, un style par type de texte (titre, call-out, lower third, caption).
- [ ] Taille ≥ 28 px à 1080p (≥ 48 px en 9:16) ; contraste renforcé (contour, ombre ou boîte).
- [ ] 16:9 : tout texte dans title safe (80 %) ; web : hors des 10 % haut/bas. 9:16 : dans la boîte 900×1400, captions à 370–720 px du bas.
- [ ] Durée ≥ mots × 0,3 s après soustraction des animations ; lower thirds 3–6 s, pas sur une coupe.
- [ ] Animations : entrée ease-out ≤ 0,6 s, sortie ease-in ≤ 0,4 s, nombre d'images entier, pas de rebond.
- [ ] Sous-titres : ≤ 2 lignes, ≤ 42 car./ligne (≤ 40 FR), 1 s ≤ durée ≤ 6–7 s, ≤ 17–20 CPS, intervalle ≥ 2 images, pas de chevauchement, calés sur les coupes.
- [ ] SDH si demandé : locuteurs hors champ, sons utiles, musique.
- [ ] Fichier soft : SRT/VTT UTF-8, fps de la séquence, sans style. Incrustation : style vérifié sur image exportée.
- [ ] MOGRT : paramètres listés = paramètres attendus ; animation intacte ; polices disponibles ; aperçu correct.
- [ ] Images exportées début / milieu / fin regardées par l'agent, et lecture demandée à l'utilisateur sur l'écran cible (téléphone pour le 9:16).
- [ ] Checkpoint posé avant toute modification de masse (`ppro_checkpoint` [existant]).

## Comment un humain le fait dans Premiere / After Effects

**Premiere Pro — titres et texte**
- Outil Texte : `T` (raccourci), cliquer dans le moniteur du programme, taper. Un clip graphique se crée sur la piste vidéo ciblée au-dessus de la tête de lecture.
- Panneau d'édition : Fenêtre > Graphiques essentiels (versions ≤ 24) — onglet Modifier : Aligner et transformer, Styles, Texte, Aspect (Fond, Contour, Arrière-plan, Ombre, Masquer avec le texte). Depuis la version 25 : Fenêtre > Propriétés (édition contextuelle) et Fenêtre > Modèles d'animations graphiques (navigation).
- Styles : bouton `+` → Créer un style lié (graphiques) ou style de piste (légendes) ; « Redéfinir le style » met à jour toutes les occurrences ; navigateur de styles (icône grille) ; styles exportables dans `Documents/Adobe/Common/Assets/Text Styles`.
- Conception réactive – Temps : durées d'intro et d'outro protégées quand on étire le clip. Conception réactive – Position : épingler un calque à un autre ou au bord de l'image.
- Zones de sécurité : moniteur du programme > clé à molette (Paramètres) > Marges admissibles ; pourcentages dans Fichier > Paramètres du projet > Général (affichés 10 % / 20 %, soit 5 % / 10 % par bord).
- Exporter un titre Premiere en modèle : Graphiques > Exporter en tant que modèle d'animations graphiques.

**Premiere Pro — sous-titres**
- Espace de travail : Fenêtre > Espaces de travail > Légendes et graphiques, ou Fenêtre > Texte (onglets Transcription / Légendes).
- Transcrire la séquence : langue, étiquetage des locuteurs (oui), piste audio (mixage, piste donnée ou clips marqués Dialogue). Corriger dans l'onglet Transcription (double-clic sur un mot).
- Icône CC → Créer des légendes : format, style, longueur max., durée min., espace entre légendes, une ou deux lignes. Les légendes arrivent sur une piste dédiée en haut de la timeline (une seule piste active à la fois ; verrou, solo, ciblage comme une piste A/V).
- Édition : scinder / fusionner dans le panneau Légendes ; `Ctrl/Cmd+Alt+C` nouvelle légende à la tête de lecture ; les outils de montage standard déplacent et rognent les blocs. Convertir en graphiques (23.1+) : sélectionner la piste → Graphiques > Convertir les légendes en graphiques (dupliquer la piste avant).
- Import : Fenêtre > Texte > Légendes > Importer des légendes à partir d'un fichier (`Ctrl/Cmd+I`), ou glisser le SRT dans le projet puis sur la timeline (choix du point de départ).
- Export : menu `…` du panneau Légendes > Exporter au format SRT ; ou `Ctrl/Cmd+M` > onglet Légendes > Options d'exportation : Créer un fichier annexe (SRT/VTT…), Incruster les légendes dans la vidéo, Intégrer (formats broadcast).

**After Effects — MOGRT**
- Fenêtre > Graphiques essentiels ; nommer le modèle ; Composition principale ; bouton « Isoler les propriétés prises en charge » ; glisser Texte source, Couleur de fond, Position, Échelle, Angle, Point, Case à cocher, Curseur (menus déroulants via contrôle d'expression). Texte source > Modifier les propriétés : autoriser police, taille, faux styles.
- Grouper, commenter, définir l'image d'aperçu (Poster Time), protéger intro/outro.
- Bouton « Exporter le modèle d'animations graphiques » : Dossier des modèles locaux (apparaît directement dans Premiere), Bibliothèque Creative Cloud, ou disque ; mots-clés ; avertissement sur les polices hors Adobe Fonts et sur la dépendance à After Effects.
- Dans Premiere : onglet Parcourir > « Installer un modèle d'animations graphiques » (ou glisser le .mogrt dans le panneau ; File > Import ne fonctionne pas). Copie dans le dossier « Média de modèles d'animations graphiques » (Paramètres du projet > Disques de travail). Glisser sur la timeline → paramètres dans Modifier / Propriétés / Options d'effet. Pastille jaune = MOGRT Premiere, rouge = MOGRT After Effects (modifiable en ouvrant le .mogrt dans AE : Fichier > Ouvrir le projet).
- Lecture saccadée : moniteur à 1/2 ou 1/4.

## Sources

1. BBC Subtitling Guidelines (résumé) — https://clevercast.com/bbc-subtitling-guidelines — 160–180 mots/min, 0,3 s/mot, 2 lignes, 68 % de largeur, zones 90 % V / 75 % H, coupures sur ponctuation, libellés de musique.
2. BBC R&D, « How fast should subtitles be? » (miroir) — https://bbcbreakingnews.pages.dev/rd/blog/2015-09-how-fast-should-subtitles-be — étude 90–230 mots/min : ≈ 175 jugé juste, 230 trop vite, 115 trop lent ; Ofcom 160–180.
3. Subtitle reading speed: CPS, WPM — https://subtitle-toolset.pages.dev/guides/subtitle-reading-speed/ — 17 CPS Netflix adulte / 13 enfant (guide général), 42 car., min 5/6 s, max 7 s, formule durée = caractères / CPS.
4. Netflix Timed Text Style Guide (synthèse) — https://www.languagesunlimited.com/?p=17279 — 5/6 s, 7 s, 2 images, 42 caractères, 2 lignes, SDH crochets, italique hors champ, pas de capitales d'emphase, UTF-8.
5. Netflix captioning requirements (3Play Media) — https://www.3playmedia.com/?p=15170 — sync ± 3 images, sortie ≤ 12 images, règle des 7 / 8–11 / 12 images aux coupes, 20 CPS adulte / 17 enfant (guide anglais), chiffres 1–10 en lettres.
6. ATAA — Normes de sous-titrage français 2022.4 — https://www.ataa.fr/documents/NORMES_FR_2022.4.pdf — 36–42 car. selon support, 14–15 CPS, 16 images mini, 5 s maxi, 4 images d'intervalle, 4–6 images aux coupes, règles d'italique et de ponctuation.
7. Standard Subtitling Guidelines (EasySub) — https://easyssub.com/blog/standard-subtitling-guidelines/ — 5–7 mots/ligne, 40–60 px à 1080p, interligne 120–140 %, contraste 4,5:1, erreurs fréquentes.
8. Subtitle styling best practices — https://convertaudiototext.com/blog/subtitle-styling-best-practices — hauteur de ligne 8 % (BBC), contour 2 px, boîte noire 70–80 % + 0,5 em, position 10–15 % du bas (16:9) / 25–45 % (9:16), capitales −10–15 % de vitesse, erreurs.
9. Comment bien sous-titrer vos vidéos (Blog du Modérateur) — https://www.blogdumoderateur.com/comment-sous-titrer-videos-conseils/ — 30–50 caractères, 2 lignes, 1,5–2 s, sons entre crochets, erreurs de cohérence.
10. Video subtitling guidelines (First News) — https://help.firstnews.co.uk/video/video-subtitling-guidelines/ — 42 car. (44 max), ≥ 2 s une ligne, ≥ 3,5 s deux lignes.
11. Video captions for maximum readability (Opus) — https://www.opus.pro/blog/video-captions-for-maximum-readability — 1,5–6 s, 32 car./ligne, sync ± 200 ms, fondu 100–200 ms, avance 0,5–1 s, durées par plateforme.
12. Best caption size for TikTok (BlitzCut) — https://blitzcutai.com/blog/best-caption-size-tiktok-2026 — 48–55 px mini, 60–75 standard, 70–90 mot à mot, ≤ 100 px, graisse 700–900, 1–3 / 3–7 mots, marges par plateforme.
13. Best caption placement for short-form video (BlitzCut) — https://blitzcutai.com/blog/best-caption-placement-short-form-video — captions à 370–720 px du bas, boîte 900×1400, visage y ≈ 200–900, pourquoi pas le bas ni le haut.
14. Safe zones for Shorts/Reels/TikTok (BlitzCut) — https://blitzcutai.com/blog/safe-zones-youtube-shorts-reels-tiktok — 15–20 % à droite, 25–30 % en bas, texte dans les 60 % hauts.
15. Vertical video safe zone (Vidpros) — https://vidpros.com/vertical-video-safe-zone/ — 900×1400 universel, marges TikTok/Reels/Shorts, captions au tiers central, CTA au-dessus de la médiane.
16. Guide to safe zones (House of Marketers) — https://houseofmarketers.com/guide-to-safe-zones-tiktok-facebook-instagram-stories-reels/ — Reels 14 % haut / 35 % bas / 6 % côtés, TikTok bas 20 %, Stories 1010×1280.
17. Short-form video safe zones (Reap) — https://reap.video/blog/short-form-video-safe-zones — marges génériques 15 % haut, 10–15 % côtés, 25–35 % bas ; pas de zone unique entre apps.
18. EBU R95 — Safe areas for 16:9 television production — https://tech.ebu.ch/publications/r095 — action safe 3,5 %, graphics safe 5 %.
19. Why do safe zones exist? (Larry Jordan) — https://larryjordan.com/?p=79301 — 5 % / 10 % par bord (affiché 10 % / 20 % dans Premiere), clé à molette > Marges admissibles, web montre tout le cadre.
20. How to calculate title/action safe margins — https://dev.to/utilitylab/how-to-calculate-title-safe-and-action-safe-margins-for-video-1ifj — formule et pixels : 1536×864 / 1728×972 à 1080p ; références SMPTE RP 27.3 / ITU-R BT.1973.
21. Safe margins (Tella) — https://www.tella.com/definition/safe-margins — définitions 90 % / 80 %, visibilité par zone.
22. Designing titles for TV (aide Adobe Premiere Elements) — https://helpx.adobe.com/id_id/premiere-elements/desktop/movie-titles/designing-titles-tv.html — texte dans les marges titre, action pour le reste ; pourcentages réglables dans les paramètres du projet ; web affiche tout.
23. Do you give enough time to read texts in your videos? (SSW) — https://www.ssw.com.au/rules/post-production-do-you-give-enough-time-to-read-texts-in-your-videos — 200 mots/min, lire deux fois ≈ 0,6 s/mot.
24. How long should on-screen text stay (Overseer) — https://www.overseeros.com/blog/how-long-should-on-screen-text-stay-youtube — 0,3 s/mot plancher, durées par type de texte, fenêtre stable hors animation, contraste WCAG 4,5:1 / 3:1.
25. Video word count (Biteable) — https://biteable.com/blog/video-word-count/ — parole 120–200 mots/min, texte à l'écran 1 s pour 2–3 mots.
26. 4 common mistakes when adding text on videos (Typito) — https://medium.com/typito/4-common-mistakes-you-should-avoid-when-adding-text-on-videos-52e8ab4dc9af — titres 3–4× les sous-titres, bandeau 0,7–0,8 d'opacité, éviter 10 % haut/bas, +2 s sur le temps de lecture.
27. Video typography style guide (Towbook) — https://styleguide.towbook.com/video/typography — grille de tailles 1080p/4K, lower third 44/26 px à (96, 864), interlettrage négatif, 22 px mini, lower third ≥ 4 s, 90 % / 93 %.
28. Game accessibility guidelines — default font size — https://gameaccessibilityguidelines.com/?p=3285 — 28 px minimum à 1080p (référence UI TV à 3 m).
29. Lower thirds titles that don't suck (Frame.io) — https://blog.frame.io/2017/12/04/create-lower-thirds-titles-that-dont-suck/ — lire deux fois, ligne des yeux, pas sur la bouche, sans-serif, erreurs (polices, contraste, placement, animation).
30. How to get the best lower thirds (Epidemic Sound) — https://www.epidemicsound.com/blog/lower-thirds/ — 3–6 s, hors ligne du regard, animation avec prudence.
31. The complete guide to lower thirds (TechSmith) — https://www.techsmith.com/blog/edit-videos-lower-thirds/ — hors des 10 % extérieurs, fondu ou glissement simple, erreurs.
32. Lower thirds & titles (Fiveable, TV studio production) — https://fiveable.me/tv-studio-production/unit-7/thirds-titles/study-guide/kQd4R1XeWNW530P9 — 3–5 s, nom en premier, casse mixte, cohérence.
33. Animated lower thirds (ChatCut) — https://chatcut.io/blog/how-to-make-animated-lower-thirds-no-after-effects — 4–6 s, > 8 s trop long, nom 4–6 % / fonction 2–3 % de la hauteur, apparition 1–2 s après la parole.
34. Lower third advanced (ETH Zürich guidelines) — https://ethz.ch/staffnet/en/service/communication/video/essential-graphics-elements/lower-third-advanced.html — à la présentation de la personne, jamais sur une transition.
35. Motion design physics model (Editframe) — https://editframe.com/skills/motion-design/2-physics-model — entrée 400–600 ms ease-out, sortie 300–400 ms ease-in, durées par contexte, images entières, overshoot.
36. Motion principles (ruttl design system) — https://design.ruttl.com/motion — courbes décélérée / accélérée, 200–400 ms.
37. Premiere Pro editor's guide to Essential Graphics (Frame.io) — https://blog.frame.io/?p=7962 — Isoler les propriétés, exposer le minimum, export, installation, dossier de médias, .aegraphic, instances indépendantes, polices.
38. Create a Motion Graphics Template in After Effects (PremiumBeat) — https://www.premiumbeat.com/blog/create-motion-graphics-template-after-effects/ — procédure AE → Premiere, poster time, limites.
39. How to create a MOGRT (FilmDaft) — https://filmdaft.com/how-to-create-a-mogrt-file-in-adobe-after-effects-illustrated-guide/ — types pris en charge, Modifier les propriétés du texte, destinations d'export, ouverture d'un .mogrt dans AE.
40. Creating Motion Graphics templates in After Effects (blog Adobe) — https://blog.adobe.com/en/publish/2017/09/22/creating-motion-graphics-templates-in-adobe-after-effects — curseurs/cases via expressions, commentaires, précomps.
41. MOGRT files (Noble Desktop) — https://nobledesktop.com/learn/adobe/mogrt — exposer la couleur d'un effet Fill, effet Transform pour garder les images-clés.
42. Adjusting MOGRTs (ProVideo Coalition) — https://www.provideocoalition.com/?p=286766 — pastille jaune / rouge, polices verrouillées, propriétés non publiées.
43. How to install & customize MOGRT files — https://adobebasics.com/pages/how-to-install-customize-mogrt-files — Parcourir > Installer, pas via Fichier > Importer, panneaux v25, polices, lecture 1/2.
44. Forum Adobe AE — Essential Graphics panel MOGRT template — https://community.adobe.com/t5/after-effects-discussions/essential-graphics-panel-mogrt-template/m-p/13257490 — propriétés animées exposées = images-clés perdues ; passer par expressions.
45. Forum Adobe — Where is the Essential Graphics panel — https://community.adobe.com/t5/premiere-pro-discussions/where-is-the-essential-graphic-panel/m-p/14940094 — renommage en Modèles d'animations graphiques + panneau Propriétés.
46. Forum Adobe — Text styles enhancements (beta 24.3) — https://community.adobe.com/t5/premiere-pro-beta-discussions/now-in-beta-premiere-pro-text-styles-enhancements/m-p/14547706 — styles liés / de piste, Redéfinir, navigateur, dossier Text Styles.
47. Forum Adobe — New captions workflow — https://community.adobe.com/t5/premiere-pro-beta/discuss-new-captions-workflow-in-premiere-pro/m-p/11685071 — pistes de légendes, une active à la fois, export annexe / incrusté / intégré, raccourcis non assignés.
48. Forum Adobe — Caption character length — https://community.adobe.com/t5/premiere-pro-discussions/caption-character-length/m-p/12194083 — défaut 42 puis 72 (v22), limite dépendante de la police, conversion en graphiques 23.1.
49. Forum Adobe — Custom caption durations — https://community.adobe.com/t5/premiere-pro-discussions/custom-caption-durations-length/m-p/13197212 — minimum imposé 1,2 s, contournement par SRT externe.
50. Forum Adobe — Auto captions character length setting — https://community.adobe.com/t5/premiere-pro-discussions/auto-captions-character-length-setting-does-not-work-right/td-p/14000960 — 7 caractères pour des cartes courtes, fusion/scission manuelle.
51. How to add captions in Premiere Pro (Riverside) — https://riverside.com/blog/how-to-add-captions-and-subtitles-in-premiere-pro — menus, raccourcis Ctrl+I / Ctrl+Alt+C / Ctrl+M, style de piste, export annexe / incrusté.
52. Adobe Speech to Text guide (Miracamp) — https://miracamp.com/learn/premiere-pro/adobe-speech-to-text — piste dialogue seule, nettoyer l'audio avant, sections pour les longs projets.
53. Captions in Premiere Pro (Utah State University accessibility) — https://www.usu.edu/accessibility/captions/adobe-premiere-pro — espace de travail Légendes et graphiques, boîte noire 90 %, incrustation à l'export, relecture obligatoire.
54. Auto transcribe and caption (UT Austin wiki) — https://cloud.wikis.utexas.edu/wiki/spaces/comm/pages/33425444 — étiquetage des locuteurs recommandé, piste Mixage, export SRT, réimport.
55. Subtitle export settings (GoTranscript) — https://gotranscript.com/blog/create-subtitles-adobe-premiere-pro-best-export-settings-formats — annexe vs incrusté vs intégré, vérifier début/milieu/fin, re-synchroniser après picture lock.
56. Reading speed critique (md-subs) — https://md-subs.com/blog/tis1-reading-speed — CPS/WPM ignorent complexité, format et mouvement de l'œil : juger aussi à l'écoute.
