---
name: transitions-effets-premiere
description: Transitions, effets vidéo Premiere Pro, images-clés (keyframes), stabilisation (Warp Stabilizer), masques et suivi de masque, vitesse, ralenti et speed ramp (Time Remapping), Morph Cut, remplacement par une composition After Effects (Dynamic Link). À charger pour toute demande de fondu, dissolve, whip pan, zoom, flou, ease, stabiliser, flouter un visage, ralentir, accélérer, rampe de vitesse.
---
# Transitions, effets, images-clés, vitesse et Dynamic Link dans Premiere Pro

## Quand utiliser ce skill

Charger ce skill quand la demande porte sur l'un de ces points :

- poser, régler ou remplacer une **transition** (fondu enchaîné, plongée au noir, wipe, whip pan, zoom, glitch) ;
- appliquer ou régler un **effet vidéo** sur un clip ou un calque d'effets ;
- animer une propriété par **images-clés** (position, échelle, opacité, flou) et en régler les courbes ;
- **stabiliser** un plan, **masquer** une zone, **flouter** un visage, suivre un objet ;
- changer la **vitesse** d'un clip : ralenti, accéléré, inversion, **rampe de vitesse** (speed ramp), arrêt sur image ;
- cacher un jump cut sur une interview avec **Morph Cut** ;
- envoyer un plan vers After Effects (**Remplacer par une composition After Effects**, Dynamic Link) et le récupérer.

Ne pas l'utiliser seul pour : le choix des coupes et le rythme (`montage-fondamentaux`), les titres (`titres-texte-sous-titres`), le son des transitions (`audio-montage`), les animations complexes dans After Effects (`after-effects-motion-design`), le détourage et le tracking avancé (`after-effects-effets-video`), l'export (`export-livraison-workflow`).

Règles permanentes (lire avant d'écrire, checkpoint, vérifier) : voir `adobe-editing`.

## Principes

### A. Transitions

1. **La coupe sèche est le choix par défaut.** Ajouter une transition seulement si on sait dire ce qu'elle raconte (temps qui passe, changement de lieu, respiration). Pourquoi : une transition sans raison se lit comme un gadget et casse la continuité.
2. **Fondu enchaîné court : 8 à 12 images à 24 i/s (0,3 à 0,5 s)**, plus long seulement pour marquer un vrai saut de temps. Pourquoi : un recouvrement long montre deux images superposées et ralentit le rythme.
3. **Repère courant : environ 20 images (0,6 s) comme base prudente** quand on hésite ; 0,5 à 1 s pour une intro YouTube dynamique. Pourquoi : assez long pour être vu, assez court pour ne pas freiner.
4. **Plongée au noir ou au blanc : fins de section, grands sauts temporels.** Jamais entre deux plans d'une même scène continue. Pourquoi : elle suggère une rupture qui n'existe pas.
5. **Wipe, push, slide : seulement si le style est graphique ou si le mouvement est motivé.** Ne pas les enchaîner. Pourquoi : empilés, ils paraissent « template » et chargent l'image.
6. **Les transitions de mouvement (whip pan, zoom, flou directionnel) exigent du mouvement réel des deux côtés, dans la même direction et à vitesse comparable.** Couper près du pic de flou de mouvement. Pourquoi : sur des plans statiques, le flou ajouté paraît faux.
7. **Garder le flou ajouté très court (quelques images).** Repère : whip pan fabriquée avec un recouvrement d'environ 10 images. Pourquoi : un flou long devient un effet visible, pas un raccord.
8. **Une transition a besoin de « poignées » (matière au-delà de la coupe).** Sans elles, Premiere avertit « Insufficient media » et répète des images figées. Pourquoi : la transition consomme du média de part et d'autre.
9. **Le son fait la transition avant l'image.** Un J-cut ou L-cut (6 à 15 images de décalage, à l'oreille) rend une coupe naturelle ; fondu audio « Constant Power » sur les raccords sonores. Pourquoi : l'oreille accepte une coupe image si le son continue.
10. **Un seul style de transition par projet, appliqué avec constance.** Régler une durée par défaut unique. Pourquoi : des durées et des styles variables donnent un montage brouillon.
11. **Adapter au ton.** Interview, institutionnel : coupe ou fondu discret. Contenu créatif ou divertissant : effets marqués possibles. Pourquoi : l'effet doit servir le contenu, pas le détourner.

### B. Images-clés et effets

12. **Toute animation naturelle utilise une accélération/décélération.** Ease Out sur la première image-clé, Ease In sur la seconde. Pourquoi : la vitesse constante (linéaire, valeur par défaut) paraît mécanique.
13. **Ease Out va sur la première clé, Ease In sur la seconde** : ce ne sont pas des points d'entrée/sortie. Pourquoi : c'est l'erreur de débutant la plus courante.
14. **Distinguer temporel (vitesse) et spatial (forme du trajet).** Temporel : linéaire, Bézier, Auto/Continu, Maintien, Ease. Spatial : Bézier automatique par défaut ; linéaire donne des angles vifs. Pourquoi : un mouvement bizarre vient de l'un ou de l'autre, pas des deux.
15. **« Maintien » (Hold) pour les changements brusques sans transition**, par exemple un cadre qui saute. Pourquoi : valeur constante jusqu'à la clé suivante, puis saut instantané.
16. **Plus les clés sont rapprochées, plus le mouvement est rapide.** Pour un zoom lent, espacer les clés, pas seulement changer la valeur. Pourquoi : la vitesse = écart de valeur / écart de temps.
17. **Les effets d'ambiance (flou, étalonnage, grain) vont sur un calque d'effets au-dessus des clips**, pas sur chaque clip. Pourquoi : une modification, un seul endroit, originaux intacts. C'est aussi la bonne pratique au-dessus d'un Morph Cut.
18. **Un seul effet « lourd » à la fois par plan** (stabilisation, flux optique, flou). Pourquoi : chaque effet allonge analyse et rendu et fait chuter la lecture.

### C. Stabilisation, masques

19. **Stabiliser seulement les plans qui en ont besoin.** Commencer par un lissage modéré, pas le maximum. Pourquoi : la stabilisation recadre et peut déformer ; trop forte, elle produit un effet « gélatine ».
20. **Régler le rolling shutter (ondulations) avant l'analyse.** Pourquoi : changer ce réglage après coup oblige à ré-analyser.
21. **Un masque dur se voit : toujours adoucir le contour (Contour progressif/Feather).** Pourquoi : un bord net trahit l'effet. Pour un flou de visage, étendre l'adoucissement jusqu'à la racine des cheveux.
22. **Un suivi automatique de masque n'est jamais fiable à 100 % : relire le plan image par image aux moments de rotation, d'occultation, de sortie de cadre.** Pourquoi : le masque dérive, et un visage « flouté » qui se découvre est une faute grave.

### D. Vitesse

23. **Tourner à cadence élevée si on prévoit du ralenti** (repère de monteur : 60 i/s pour livrer à 30 i/s afin de ralentir à 50 % sans saccade). Pourquoi : sans images en plus, Premiere doit en inventer.
24. **Ralenti modéré = moins d'artefacts.** Plus le ralenti est fort (par exemple 24 i/s ralenti à 20 %), plus l'interpolation de mouvement devient nécessaire et fragile. Pourquoi : on invente davantage d'images.
25. **Une rampe de vitesse doit avoir des transitions entre les paliers (clés scindées + courbe de Bézier).** Pourquoi : un changement abrupt se lit comme une coupe, pas comme une rampe.
26. **Après tout changement de vitesse, vérifier le son** (hauteur conservée ou son coupé, resynchronisation, SFX). Pourquoi : un ralenti sans correction audio fait un son grave et traînant.

### E. Morph Cut et After Effects

27. **Morph Cut uniquement sur un plan fixe, un seul sujet, fond immobile, tête dans la même position des deux côtés de la coupe.** Sinon : cutaway ou fondu. Pourquoi : l'outil repose sur un suivi de visage et une interpolation.
28. **Remplacer par une composition After Effects seulement quand Premiere ne sait pas faire** (suivi complexe, 3D, animation de formes, détourage poussé). Pourquoi : chaque lien dynamique consomme de la mémoire et ralentit la timeline.
29. **Même version de Premiere et d'After Effects, projet .aep jamais déplacé ni renommé.** Pourquoi : sinon le lien passe hors ligne.
30. **Une fois la comp validée, « Rendre et remplacer » en un fichier intermédiaire de qualité.** Pourquoi : on libère les ressources et on évite les re-rendus à chaque sauvegarde d'After Effects.

## Procédures

Légende outils : **[existant]** = disponible en phase 1 ; **[prévu]** = dans le catalogue, pas encore implémenté (proposer le guidage manuel de la section « Comment un humain le fait »).

Départ commun à toutes les procédures : `ppro_get_capabilities` [existant], `ppro_get_sequence` [existant] (ou `ppro_get_active_sequence` [existant]) pour connaître pistes, clips, fps et durées. Puis `ppro_checkpoint {label}` [existant] avant toute modification.

### P1. Poser une transition sur une coupe

**Objectif** : raccorder deux plans avec une transition courte et propre.

1. Lire les deux clips autour de la coupe : durées, points d'entrée/sortie, fps.
2. Décider : coupe sèche, fondu, ou transition de mouvement (principes 1 à 6). Si rien ne la justifie, ne rien poser.
3. Vérifier les **poignées** : le clip sortant doit avoir de la matière après son point de sortie et le clip entrant avant son point d'entrée, au moins la moitié de la durée de la transition de chaque côté (alignement centré sur la coupe). Si non : raccourcir la transition, ou changer l'alignement (début/fin sur la coupe), ou choisir une coupe sèche.
4. Choisir la durée (voir tableau « Paramètres de référence »), en images : `durée_s = images / fps`.
5. Poser la transition : `ppro_add_transition {clipId, side: "out"|"in"|"both", name: "Cross Dissolve", duration}` [prévu]. Pour l'audio, ajouter un fondu « Constant Power » sur la même coupe.
6. Pour plusieurs coupes identiques : `ppro_add_default_transitions {clipIds | range}` [prévu].
7. Vérifier : `ppro_export_frame {time}` [existant] au milieu de la transition (pas de double image gênante, pas d'image figée), puis relire `ppro_get_sequence {range}` [existant] pour contrôler que la durée voulue est bien appliquée.

**Manuel** : voir section « Comment un humain le fait » (T1).

### P2. Transition de mouvement « maison » (whip pan, zoom)

**Objectif** : cacher une coupe entre deux plans en mouvement.

1. Vérifier le critère (principe 6) : mouvement dans la même direction des deux côtés ? Sinon, abandonner.
2. Étendre la fin du plan A et le début du plan B pour créer un recouvrement (repère : ~10 images pour une whip pan, 6 à 12 pour un zoom).
3. Imbriquer le recouvrement (`ppro_nest {clipIds, name}` [prévu]) pour animer l'ensemble.
4. **Whip pan** : images-clés sur Position X : le plan A sort du cadre, le plan B entre, en sens cohérent. Ajouter Flou directionnel (angle horizontal) avec une quantité qui monte puis redescend. Si le flou assombrit les bords, corriger avec un effet Niveaux (noirs, blancs, gamma).
5. **Zoom** : images-clés sur Échelle du plan A (monte vite), Ease Out sur la première clé et Ease In sur la seconde, flou sur un calque d'effets au-dessus des deux plans. Le plan B démarre légèrement agrandi puis revient à 100 %.
6. Outils : `ppro_set_keyframes {clipId, effect: "Motion", prop: "Position", keyframes}` [prévu], `ppro_apply_effect {clipIds, effect}` [prévu], `ppro_add_adjustment_layer {start, end, track, effects}` [prévu].
7. Vérifier : exporter 3 images (début, milieu, fin) avec `ppro_export_frame` [existant]. Au milieu, le flou doit être maximal et la coupe invisible ; aux extrémités, plus aucun flou résiduel.

### P3. Animer une propriété par images-clés (avec courbes)

**Objectif** : mouvement fluide (zoom, glissement, apparition).

1. Choisir la propriété (Position, Échelle, Rotation, Opacité) et l'intervalle (début, fin en secondes).
2. Poser au moins deux clés : `ppro_set_keyframes {clipId, effect: "Motion", prop: "Scale", keyframes:[{t, value, interp}]}` [prévu] ou `ppro_set_transform {clipIds, scale, at}` [prévu].
3. Régler les courbes : Ease Out sur la première clé, Ease In sur la dernière. Auto Bézier spatial pour les trajets courbes ; linéaire spatial pour des angles vifs ; Maintien pour un saut.
4. Durée type d'un mouvement d'interface/texte : 0,3 à 0,5 s (repère). Plus long = plus calme.
5. Vérifier : relire les clés (`ppro_get_clip_effects` [prévu]), exporter 3 images à t0, milieu, t1 (`ppro_export_frame` [existant]). Détecter : valeur finale non atteinte, saut brutal, trajet en zigzag (clés trop nombreuses).

### P4. Stabiliser un plan

**Objectif** : réduire les tremblements sans dégrader l'image.

1. Repérer les plans instables (échantillon d'images avec `ppro_export_frame` [existant], mouvement visible, ou demande explicite).
2. Appliquer « Stabilisateur de déformation » (Warp Stabilizer) : `ppro_stabilize {clipIds, method}` [prévu]. L'analyse démarre seule et peut prendre du temps ; ne pas toucher le clip pendant l'analyse.
3. Premier essai : Résultat « Lissage du mouvement », lissage autour de 50 % (valeur par défaut du panneau, repère), méthode Sous-espace (Subspace Warp). Si l'image se déforme (lignes qui ondulent) : essayer Position, échelle, rotation, ou Position seule.
4. Bords : « Stabiliser, recadrer, mise à l'échelle automatique » est le plus simple ; « Stabiliser, synthétiser les bords » reconstruit les bords mais coûte du calcul et désactive la mise à l'échelle auto.
5. Caméra CMOS avec ondulations (rolling shutter) : régler la réduction avant l'analyse.
6. Si le plan reste mauvais après toutes les méthodes : il est probablement inutilisable. Proposer un autre plan ou un recadrage assumé.
7. Vérifier : lire le plan après rendu (la prévisualisation peut tromper) et comparer deux images exportées avant/après pour le cadrage. Contrôle des sorties : recadrage perceptible, déformation de verticales, flou.

### P5. Masque : flouter ou isoler une zone, avec suivi

**Objectif** : appliquer un effet (flou, étalonnage) à une zone qui bouge.

1. Appliquer l'effet voulu (par exemple Flou gaussien) au clip.
2. Dans le panneau Options d'effet, créer le masque : ellipse pour un visage, rectangle pour un écran, plume pour une forme libre.
3. Régler Contour progressif (adoucit le bord), Expansion (agrandit/réduit), Opacité du masque, et « Inversé » si l'effet doit s'appliquer à l'extérieur.
4. Lancer le suivi : « Suivre le masque sélectionné vers l'avant » (et vers l'arrière si le point de départ est au milieu).
5. Pour une révélation progressive : image-clé du flou à une valeur forte (repère d'un tutoriel : 10) à l'instant de départ, puis une seconde clé à 0 quelques secondes plus tard.
6. Outils : `ppro_apply_effect` [prévu], `ppro_set_effect_params {clipId, effect, params}` [prévu]. Le tracé de masque et le suivi n'ont pas d'outil dédié dans le catalogue de phase 1 : proposer le guidage manuel (T4).
7. Vérifier : exporter une image toutes les 0,5 s sur la durée du flou (`ppro_export_frames {every: 0.5}` [prévu]) puis les regarder en planche ; chercher toute image où le visage ressort. Désélectionner le masque avant de juger le rendu (sinon la zone s'affiche en surbrillance).

### P6. Ralenti, accéléré, inversion

**Objectif** : changer la vitesse d'un clip entier.

1. Lire la cadence source et la cadence de séquence. Si source ≥ 2 × séquence (par exemple 60 i/s source, séquence 30 i/s) : ralenti à 50 % propre, sans interpolation.
2. Appliquer : `ppro_set_clip_speed {clipId, speed | duration, reverse, maintainPitch, ripple}` [prévu]. Activer « Propager » (ripple) pour décaler les clips suivants, sinon le clip allongé écrase le suivant.
3. Interpolation temporelle : échantillonnage d'images (rapide, saccadé), fusion d'images (ghosting), flux optique (le plus fluide, mais artefacts « gélatine » sur les mouvements complexes). Règle : essayer le flux optique, passer à la fusion d'images si les bords se déforment.
4. Audio : soit couper (silence) soit conserver la hauteur ; vérifier la synchro.
5. Vérifier : durée finale attendue ; image exportée aux extrémités ; relire l'audio.

### P7. Rampe de vitesse (speed ramp)

**Objectif** : alterner ralenti et accéléré autour d'un moment clé, de façon fluide.

1. Identifier le moment clé (impact, saut, geste). Placer une marque (`ppro_add_markers` [prévu]).
2. Déplacer le clip sur une piste libre (le changement de vitesse modifie sa longueur).
3. Activer le remappage temporel (Vitesse) : `ppro_speed_ramp {clipId, keyframes:[{t, speed}]}` [prévu].
4. Structure type en trois paliers : approche normale ou rapide, ralenti sur le moment clé (50 % ou moins si la cadence le permet), retour rapide. Poser des clés de part et d'autre.
5. **Scinder chaque clé** pour créer une zone de transition de vitesse, puis régler une courbe de Bézier (forme en S) : plus la zone de transition est longue, plus la rampe est douce.
6. Flou de mouvement : activer le remappage temporel dans la zone de flou ; angle d'obturateur 180° pour rester net, jusqu'à 360° pour plus de flou sur du rapide (repère).
7. Synchroniser avec la musique : placer la clé de ralenti sur un temps fort (`media_detect_beats` [prévu]).
8. Vérifier : lecture complète + images exportées dans le ralenti. Défauts : rampe qui ressemble à une coupe, saccades (cadence insuffisante), son non corrigé.

### P8. Morph Cut sur une interview

**Objectif** : masquer un jump cut dans un plan de face.

1. Critères (tous) : un seul sujet, caméra fixe, fond immobile et éclairage stable, visage entier dans le cadre, tête à peu près à la même place des deux côtés. Sinon : cutaway/B-roll ou fondu.
2. Choisir une coupe courte dans une pause naturelle (utiliser la forme d'onde).
3. Poser la transition Morph Cut sur la coupe. L'analyse démarre seule et se relance après chaque ajustement. Outil : `ppro_add_transition {clipId, side: "both", name: "Morph Cut"}` [prévu].
4. Ajuster durée et symétrie pour que le début et la fin tombent près des pics des mots voisins (évite le décalage labial).
5. Mettre l'étalonnage (Lumetri) sur un calque d'effets au-dessus, pas sur les clips sous le Morph Cut.
6. Quand l'analyse est finie, générer le rendu de prévisualisation et regarder en lecture réelle.
7. Si le message « ne peut pas être appliqué à un seul clip » apparaît : raccourcir les clips de quelques images à la jonction pour ménager de la matière, mettre l'alignement sur « Centré sur la coupe », aplatir les clips multicaméra, rendre les deux clips « de l'entrée à la sortie ».
8. Vérifier : visage déformé, fond qui « respire », bouche qui saute. Si oui : cutaway ou fondu court.

### P9. Remplacer par une composition After Effects (Dynamic Link)

**Objectif** : envoyer un ou plusieurs plans dans After Effects pour un travail impossible dans Premiere, sans export.

1. Vérifier que Premiere et After Effects sont de la même version, et que le projet Premiere est enregistré.
2. Dupliquer la séquence ou le clip avant de remplacer (conserver l'original).
3. Sélectionner les clips à envoyer ; si multicaméra, les aplatir d'abord.
4. Lancer le remplacement : `ppro_replace_with_ae_comp {clipIds, compName}` [prévu]. After Effects crée une comp liée, enregistrée dans un projet .aep (le sauvegarder dans un dossier stable).
5. Travailler dans After Effects : `aeft_get_comp` [prévu], `aeft_apply_effect` [prévu], etc. (voir `after-effects-effets-video`).
6. Revenir dans Premiere : le clip se met à jour sans export.
7. Si la timeline devient lente ou si on termine : « Rendre et remplacer » vers un intermédiaire de qualité (ProRes 422 ou 422 HQ ; 4444 si transparence), puis, si besoin de retoucher, « Restaurer le non rendu ».
8. Vérifier : lecture de la zone liée, absence de médias hors ligne, couleurs identiques avant/après (si décalage : mode fusion en gamma 1,0 et 32 bits dans After Effects, ou désactiver « Composite en couleur linéaire » dans les réglages de séquence).

Alternative sans lien : `ppro_import_ae_comp {aepPath, compName, time, track}` [prévu] pour placer une comp existante.

## Paramètres de référence

### Durées de transitions

| Transition | Durée | Usage | Source / statut |
|---|---|---|---|
| Fondu enchaîné discret | 8 à 12 images à 24 i/s (0,3 à 0,5 s) | raccord doux, passage de temps léger | sourcé |
| Fondu enchaîné « sûr » | ~20 images (~0,6 s) | cas général hésitant | sourcé |
| Transition d'intro YouTube | 0,5 à 1 s | rythme rapide | sourcé |
| Fondu enchaîné long | 1 s et plus | grand saut de temps, émotion | (repère) |
| Plongée au noir / blanc | 0,5 à 1,5 s | fin de section | (repère) |
| Whip pan fabriquée | ~10 images de recouvrement | cacher une coupe en mouvement | sourcé |
| Flou ajouté sur transition de mouvement | quelques images | éviter l'effet visible | sourcé |
| Fondu audio « Constant Power » | durée de la coupe, 6 à 15 images | raccord sonore | sourcé |
| J-cut / L-cut | décalage 6 à 15 images, à l'oreille | coupe naturelle | sourcé |
| Défaut Premiere (vidéo, audio) | fondu enchaîné et Constant Power, 1 s selon une source, ~20 images selon une autre ; vérifier dans Préférences > Montage | | à vérifier dans la version |

### Quelle transition pour quel besoin

| Besoin | Choix | À éviter |
|---|---|---|
| Plans qui s'enchaînent dans une même scène | coupe sèche | toute transition |
| Temps qui passe, souvenir | fondu enchaîné | dans l'action rapide |
| Fin de chapitre, grand saut | plongée au noir ou au blanc | entre deux plans d'une scène continue |
| Changement de lieu stylisé | wipe, push, glissement | enchaîner plusieurs |
| Énergie, coupe sur un temps de musique | whip pan, zoom, flou | plans statiques |
| Raccord de parole | Morph Cut (conditions strictes) | mouvement, fond changeant |
| Raccord de parole raté | cutaway ou B-roll | Morph Cut forcé |

### Images-clés : interpolation

| Type | Effet | Quand |
|---|---|---|
| Linéaire (temporel, défaut) | vitesse constante | défilement, mouvement mécanique |
| Ease Out (1re clé) | démarre doucement | départ d'un mouvement |
| Ease In (dernière clé) | ralentit à l'arrivée | fin naturelle |
| Bézier / Continu / Auto | courbe réglable | profils de vitesse précis |
| Maintien (Hold) | valeur figée puis saut | changement brusque |
| Spatial Auto Bézier (défaut Position) | trajet courbe | mouvement organique |
| Spatial linéaire | angles vifs | rebond, trajet géométrique |

### Warp Stabilizer

| Réglage | Valeurs | Conseil |
|---|---|---|
| Résultat | Lissage du mouvement / Aucun mouvement | lissage pour une caméra à la main qui doit rester vivante |
| Lissage | pourcentage ; plus bas = effet plus discret | partir du défaut, baisser si ça « flotte » |
| Méthode | Position ; Position-échelle-rotation ; Perspective ; Sous-espace | commencer par Sous-espace, repli sur Position si déformation |
| Cadrage | Stabiliser seul ; recadrer ; recadrer + mise à l'échelle auto ; synthétiser les bords | recadrer + auto en premier ; synthèse si le recadrage est trop fort |
| Moins recadrer <-> plus lisser | curseur | compromis cadrage / fluidité |
| Analyse détaillée | case à cocher | seulement si l'analyse standard échoue |
| Rolling shutter | réduction (renforcée pour les grosses ondulations) | régler avant l'analyse |
| Plage d'entrée de synthèse | nombre d'images/secondes avant et après | plus grande pour les mouvements rapides |

### Vitesse

| Situation | Réglage |
|---|---|
| Source 60 i/s, séquence 30 i/s | ralenti 50 % possible sans interpolation |
| Source 24 i/s, ralenti ≥ 50 % | échantillonnage ou fusion d'images |
| Source 24 i/s, ralenti < 50 % | flux optique (tester) ; repli sur fusion d'images si artefacts |
| Mouvement complexe (mains, eau, cheveux, feuillage) | fusion d'images ; flux optique risque la « gélatine » |
| Mouvement simple et régulier | flux optique |
| Obturateur du flou de mouvement (remappage) | ~180° net ; jusqu'à 360° plus flou (repère source unique) |
| Inversion | Cmd/Ctrl + glisser une clé de vitesse vers la droite, ou case « Vitesse inversée » |

### Flou de visage (repère)

| Élément | Valeur |
|---|---|
| Masque | ellipse couvrant tout le visage, légèrement plus grande |
| Contour progressif | jusqu'à la racine des cheveux |
| Flou gaussien | ~10 (un tutoriel) ; augmenter si les traits restent lisibles |
| Suivi | avant et arrière, contrôle image par image |

## Erreurs fréquentes et comment les détecter

| Erreur | Comment la détecter | Correction |
|---|---|---|
| Transition sans poignées (images répétées) | avertissement « Insufficient media » ; image figée dans la transition | raccourcir, décaler la coupe, alignement début/fin, ou coupe sèche |
| Fondu trop long en action rapide | double image visible plus de ~0,5 s ; rythme qui ralentit | 8 à 12 images ou coupe |
| Enchaînement de wipes/slides | 3 transitions graphiques d'affilée | un seul style, le reste en coupes |
| Whip pan sur plans statiques | flou sans mouvement réel | coupe sèche |
| Bords assombris après flou directionnel | vignette sombre au milieu de la transition | effet Niveaux (noirs, blancs, gamma) |
| Ease inversé (Ease In sur la 1re clé) | mouvement qui démarre vite et finit brutalement | Ease Out sur la 1re, Ease In sur la 2e |
| Mouvement saccadé | clés trop nombreuses, valeurs en zigzag | supprimer les clés intermédiaires, ajuster les poignées |
| Clip allongé qui écrase le suivant | trou ou chevauchement après ralenti | propager (ripple) ou déplacer le clip |
| Rampe qui ressemble à une coupe | changement de vitesse sans zone de transition | scinder les clés, courbe de Bézier |
| Ralenti saccadé | cadence source basse | flux optique/fusion, ou accepter ; prévenir la prochaine fois |
| Flux optique « gélatine » | bords étirés, fondus dans le fond | fusion d'images, ralenti plus doux |
| Son non corrigé après changement de vitesse | voix grave ou aiguë, désynchronisation | conserver la hauteur ou couper l'audio, ajouter un SFX |
| Warp Stabilizer : image qui ondule | lignes droites courbées | autre méthode (Position-échelle-rotation), baisser le lissage |
| Warp Stabilizer : bords noirs | bandes sur les côtés | recadrage + auto, ou synthèse des bords |
| Warp Stabilizer : aperçu faux | lecture saccadée avant rendu | rendre la zone (Entrée) puis juger |
| Masque qui dérive | visage non couvert sur certaines images | corriger les clés de masque, relancer le suivi par tronçons |
| Bord de masque dur | contour visible | augmenter le contour progressif |
| Morph Cut : fond qui bouge, visage déformé | « respiration » du fond ; bouche qui saute | cutaway, fondu court, ou changer le point de coupe |
| Morph Cut : échec d'analyse | bandeau d'erreur ; visage de profil ou trop gros | recadrer plus large, autre coupe |
| Morph Cut avec étalonnage dessous | affichage incorrect | étalonner sur un calque d'effets au-dessus |
| Lien Dynamic Link hors ligne | clip rouge/hors ligne | ne pas déplacer le .aep ; versions identiques ; relier |
| Re-rendu à chaque sauvegarde d'After Effects | barre de rendu qui repasse en rouge | Rendre et remplacer |
| Timeline lente avec plusieurs liens | lecture saccadée, mémoire saturée | un seul projet AE avec plusieurs comps ; rendre et remplacer |
| Couleurs différentes après aller-retour AE | teinte modifiée | gamma 1,0 et 32 bits dans AE, ou couleur linéaire désactivée dans Premiere |

## Contrôle qualité

Avant de livrer :

- [ ] Chaque transition a une raison ; il n'y en a pas d'autre. Un seul style principal.
- [ ] Aucune transition sans poignées (pas d'images figées, pas d'avertissement).
- [ ] Durées cohérentes dans tout le projet (même valeur par défaut).
- [ ] Les transitions de mouvement ont été vérifiées sur 3 images exportées (début, milieu, fin).
- [ ] Les animations ont des courbes (Ease In/Out), aucune ne s'arrête brutalement.
- [ ] Les plans stabilisés ont été regardés après rendu : pas de déformation, cadrage acceptable.
- [ ] Tous les masques de flou ont été relus sur toute la durée ; aucune image où l'élément masqué réapparaît.
- [ ] Les changements de vitesse sont fluides ; audio corrigé et synchronisé ; séquence sans trous ni écrasement.
- [ ] Morph Cut regardé en lecture réelle après rendu ; sinon remplacé par cutaway/fondu.
- [ ] Aucun média hors ligne (Dynamic Link) ; les comps lourdes sont rendues et remplacées.
- [ ] Vérification finale par `ppro_get_sequence` [existant] et images exportées `ppro_export_frame` [existant] ; écarts signalés à l'utilisateur.
- [ ] Checkpoint disponible pour `ppro_rewind` [existant].

## Comment un humain le fait dans Premiere / After Effects

Les raccourcis varient selon la version et le clavier : à confirmer dans l'application.

### T1. Transitions
- Panneau **Effets** (Fenêtre > Effets) > Transitions vidéo : glisser sur la coupe entre deux clips. Ajuster en tirant les bords, ou double-cliquer la transition pour les réglages (durée, alignement : centré sur la coupe, début sur la coupe, fin sur la coupe).
- Transition par défaut : sélectionner la coupe puis **Ctrl/Cmd + D** (vidéo) ; audio **Ctrl/Cmd + Maj + D** ; vidéo + audio **Maj + D** (selon la version, vérifier dans le menu Séquence).
- Clic droit sur une transition > **Définir la transition sélectionnée comme transition par défaut**.
- Durée par défaut : Préférences > Montage (Timeline).
- Plusieurs coupes : sélectionner les clips > clic droit > Appliquer les transitions par défaut à la sélection.
- Audio : Transitions audio > Fondu enchaîné > Puissance constante.

### T2. Images-clés
- Panneau **Options d'effet** (Effect Controls) : cliquer le chronomètre d'une propriété pour activer l'animation ; déplacer la tête de lecture et changer la valeur pour poser une clé.
- Clic droit sur une clé : type d'interpolation (Linéaire, Bézier, Auto, Continu, Maintien, Ease In, Ease Out).
- Déplier le triangle à côté de la propriété pour afficher le graphique de vitesse et les poignées de Bézier.
- Dans le moniteur Programme : clic sur le trajet de Position pour modifier la forme ; Maj + clic sur une clé alterne linéaire/Bézier ; Alt/Option + poignée casse la symétrie.

### T3. Stabilisation
- Effets > Effets vidéo > Distorsion > **Stabilisateur de déformation** (Warp Stabilizer) : glisser sur le clip. L'analyse se fait en arrière-plan, bandeau bleu puis orange.
- Réglages dans Options d'effet : Résultat, Lissage, Méthode, Cadrage ; dérouler « Avancé » pour l'analyse détaillée, le rolling shutter, la synthèse des bords.

### T4. Masques et suivi
- Dans Options d'effet, sous un effet : icônes ellipse, rectangle, plume. Dessiner dans le moniteur Programme.
- Paramètres de masque : Tracé, Contour progressif, Opacité, Expansion, Inversé.
- Boutons de suivi : « Suivre le masque sélectionné vers l'arrière / vers l'avant » (lire l'image après chaque tronçon).
- Outil de masque d'objet (IA) dans la barre d'outils : sélectionne un sujet et le suit ; à vérifier et à corriger.

### T5. Vitesse et rampe
- Clic droit sur le clip > **Vitesse/Durée** (Ctrl/Cmd + R) : pourcentage, durée, inverser, conserver la hauteur audio, propager les modifications, interpolation temporelle (échantillonnage, fusion, flux optique).
- Rampe : clic droit sur le bouton **fx** du clip > Remappage temporel > Vitesse ; Ctrl/Cmd + clic sur la bande pour ajouter des clés ; glisser le segment pour changer la vitesse ; tirer la moitié droite d'une clé pour la scinder et créer la zone de transition ; cliquer la zone grise pour régler la courbe de Bézier. Alt/Option + glisser déplace une clé entière. Cmd + glisser une clé vers la droite crée un segment inversé.
- Flou de mouvement : dans Options d'effet > Remappage temporel, activer l'option et régler l'angle d'obturateur.
- Arrêt sur image : clic droit sur le clip > Ajouter une image fixe (Add Frame Hold), ou clé de remappage de vitesse maintenue (repère, non vérifié dans les sources).

### T6. Morph Cut
- Panneau Effets > Transitions vidéo > Dissolve > **Morph Cut** : glisser sur la coupe. Bandeau « Analyse de l'effet en arrière-plan ». Ajuster durée et symétrie dans Options d'effet ou en tirant les bords.

### T7. Remplacer par une composition After Effects
- Sélectionner les clips > clic droit > **Remplacer par une composition After Effects** (ou Fichier > Adobe Dynamic Link). After Effects s'ouvre avec la comp. Enregistrer le projet AE dans un dossier stable.
- Dans Premiere : clic droit sur le clip lié > **Rendre et remplacer** (intermédiaire ProRes), puis **Restaurer le non rendu** pour revenir au lien actif.
- Dans After Effects : Composition > Ajouter à la file d'attente de rendu, ou Fichier > Dynamic Link > Importer une composition d'After Effects dans Premiere.

## Sources

Listes de sources consultées pour ce skill (les pages ont été lues ou résumées ; seules des paraphrases sont utilisées) :

1. Aide Adobe, Réglages du Stabilisateur de déformation (analyse du mouvement, méthodes, bords) — https://helpx.adobe.com/premiere/desktop/add-video-effects/commonly-used-effects/warp-stabilizer-settings.html — structure des réglages (partiel, page lue en métadonnées).
2. Blog Adobe, Morph Cut : trucs et astuces — https://blog.adobe.com/en/publish/2015/06/18/morph-cut-tips-tricks-for-best-results — conditions, limites, étapes, calque d'effets au-dessus, rendu de prévisualisation.
3. Motion Array, Speed ramping dans Premiere Pro — https://blog.motionarray.com/learn/premiere-pro/premiere-pro-speed-ramping-tutorial/ — procédure Time Remapping, clés scindées, Bézier, angle d'obturateur, erreurs.
4. Larry Jordan, Fonctions avancées du Warp Stabilizer — https://larryjordan.com/articles/advanced-features-of-warp-stabilizer-in-adobe-premiere-pro/ — analyse détaillée, rolling shutter, synthèse des bords.
5. PremiumBeat, Time remapping dans Premiere Pro — https://www.premiumbeat.com/blog/time-remapping-in-premiere-pro — ouverture du remappage, accélérer, ralentir, inverser.
6. Frame.io Insider, Dépannage de Dynamic Link — https://blog.frame.io/2022/06/13/troubleshooting-dynamic-link-problems-in-premiere-pro-and-after-effects/ — causes de liens hors ligne, performances, Rendre et remplacer.
7. MediaStorm, Guide du Dynamic Link — https://www.mediastorm.com/blog/?p=13694 — procédure et précautions de chemin.
8. Frame.io Insider, Interpolation d'images-clés — https://blog.frame.io/2023/09/20/insider-tips-use-keyframe-interpolation-for-smoother-animation-premiere-pro/ — Ease Out/In, graphique de vitesse.
9. Larry Jordan, Les contrôles cachés des images-clés — https://larryjordan.com/articles/premiere-pro-discover-the-hidden-controls-in-keyframes/ — temporel vs spatial, poignées d'ease.
10. PremiumBeat, Astuces d'images-clés — https://www.premiumbeat.com/blog/keyframe-tips-and-tricks-in-premiere-pro/ — Maj + clic, Alt/Option, Hold.
11. Screenlight, Interpolation d'images-clés — https://screenlight.tv/blog/breaking-down-keyframe-interpolation-in-premiere-pro — usages de chaque type.
12. PremiumBeat, Appliquer les transitions par défaut — https://www.premiumbeat.com/blog/quickly-applying-default-transitions-in-premiere-pro — raccourcis, défauts.
13. PremiumBeat, Whip pan avec les effets natifs — https://www.premiumbeat.com/blog/create-whip-pan-using-built-effects-premiere-pro/ — recouvrement ~10 images, Position X, flou directionnel, Niveaux.
14. No Film School, Whip pan dans Premiere — https://nofilmschool.com/2018/04/watch-how-pull-stylish-whip-pan-transition-adobe-premiere-pro — usages de la whip pan.
15. Aiarty, Fusion d'images ou flux optique — https://www.aiarty.com/knowledge-base/frame-blending-vs-optical-flow.htm — quand utiliser chaque méthode, artefacts.
16. Freevisuals, Flux optique dans Premiere — https://www.freevisuals.net/post/premiere-pro-optical-flow — procédure, cas d'échec.
17. SpotlightFX, Ajouter des transitions (2025) — https://spotlightfx.com/blog/how-to-add-transitions-in-premiere-pro-2025-guide — ~20 images, poignées, erreurs.
18. SpotlightFX, Masquer dans Premiere Pro — https://spotlightfx.com/blog/how-to-mask-in-premiere-pro-step-by-step-guide — types de masques, contour progressif, suivi.
19. Cursa, Transitions et continuité — https://cursa.app/en/page/transitions-and-continuity-when-to-cut-when-to-transition — critères coupe vs transition, 8 à 12 images, J/L-cut.
20. Miracamp, Transitions dans Premiere — https://miracamp.com/post/how-to-add-transitions-in-premiere-pro — durées d'intro, erreurs.
21. Adobe Learn (FR), Flou et suivi de masque — https://www.adobe.com/fr/learn/premiere-pro/web/track-mask-blur-effect — procédure de floutage de visage.
22. Dawan, Premiere Pro : les masques — https://www.dawan.fr/formations/audiovisuel/workshops-premiere-pro/Premiere-Pro--Les-masques.pdf — masques d'opacité/d'effet, expansion, contour progressif.
23. Boris FX, Transition de zoom en quatre étapes — https://borisfx.com/blog/how-to-do-a-zoom-transition-in-premiere-pro-4-steps/ — clés d'échelle, ease, calque d'effets.
24. Elephorm (FR), Maîtriser les transitions vidéo dans Premiere Pro — https://www.elephorm.com/formation/maitriser-premiere-2026/maitriser-les-transitions-video-dans-premiere-pro — mesure, ton du projet.
25. Communauté Adobe, Morph Cut « ne peut pas être appliqué à un seul clip » — https://community.adobe.com/t5/premiere-pro-discussions/morph-cut-quot-can-t-apply-to-a-single-clip-quot/m-p/15265349 — correctifs pratiques.
26. No Film School, Morph Cut — https://nofilmschool.com/2015/06/how-use-premiere-pro-morph-cut-jump-cuts-disappear — limites, cutaway nécessaire.
27. Motion Array, Le Morph Cut est-il bon ? — https://motionarray.com/learn/premiere-pro/how-good-is-adobe-premiere-pros-morph-cut/ — bons et mauvais cas.
28. Online Tech Tips, Stabiliser une vidéo dans Premiere Pro — https://www.online-tech-tips.com/how-to-stabilize-video-in-premiere-pro/ — méthodes, cadrage, problèmes courants.
29. Elephorm (FR), Warp Stabilizer — https://www.elephorm.com/formation/maitriser-premiere-pro-cc-la-formation-la-plus-complete/comment-utiliser-le-warp-stabilizer-dans-premiere-pro — rendu pour juger la qualité.
30. Elephorm (FR), Speed ramping — https://www.elephorm.com/formation/maitriser-premiere-2026/creer-un-effet-de-speed-ramping-en-montage-video — 60 i/s vers 30 i/s, ralenti 50 %, propagation.
31. Aide Adobe, Remplacer des clips par une composition After Effects liée — https://helpx.adobe.com/cn/premiere/desktop/use-premiere-with-other-apps/working-with-other-adobe-applications/replace-clips-with-a-dynamically-linked-after-effects-composition0.html — intitulé de la fonction (page lue en métadonnées seulement).
