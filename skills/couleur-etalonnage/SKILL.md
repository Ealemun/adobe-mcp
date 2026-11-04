---
name: couleur-etalonnage
description: Corriger et étalonner la couleur dans Premiere Pro avec Lumetri (balance des blancs, exposition, contraste, saturation, LUT, look, match entre caméras, footage LOG, HDR). À charger dès qu'une demande parle de couleur, colorimétrie, étalonnage, color grade, LUT, scopes, peau trop orange, noirs écrasés, image terne, teal & orange, look cinéma, matcher deux caméras.
---

# Couleur : correction et étalonnage dans Premiere (Lumetri)

## Quand utiliser ce skill

- L'utilisateur veut « améliorer les couleurs », « un look cinéma », « matcher mes deux caméras », « appliquer une LUT », « corriger la peau », « c'est trop sombre / trop terne ».
- Un plan LOG ou RAW arrive plat et désaturé dans la timeline.
- Avant un export : vérifier que rien n'est écrêté, que les plans d'une même scène se ressemblent, que la peau est naturelle.
- En complément du skill `adobe-editing` (recette « Color grade / match ») : ce skill dit *comment* régler, l'autre dit *avec quels tools*.

Fichiers associés : `references/scopes.md` (lecture détaillée des scopes, valeurs cibles par type de peau) et `references/looks.md` (looks courants avec paramètres indicatifs).

## Principes

1. **Corriger avant d'étalonner.** La correction neutralise (balance des blancs, exposition, contraste) ; l'étalonnage ajoute un style. Un look posé sur une image déséquilibrée amplifie les défauts, surtout sur la peau.
2. **Ordre fixe : transformation technique → balance des blancs → exposition/contraste → saturation → corrections locales → look.** L'exposition change la perception des couleurs ; la régler après oblige à tout refaire.
3. **Lumetri a un ordre de traitement interne, quel que soit l'onglet touché** : LUT d'entrée → Correction de base (Blancs et Noirs d'abord) → LUT créative → réglages Créatif → Courbes → Roues → HSL secondaire → Vignette. Un écrêtage produit tôt dans la chaîne ne se récupère pas plus loin.
4. **Verrouiller le montage avant de grader.** Grader un plan qu'on coupera ensuite est du temps perdu ; le montage change aussi les raccords couleur à vérifier.
5. **Lire les scopes, pas seulement l'image.** Un écran non calibré ment ; la forme d'onde et la parade RVB ne mentent pas. L'agent ne voit pas le panneau Scopes : il lit les frames exportées et raisonne en niveaux.
6. **Plage luma utile : 0–100 IRE, noirs vers 3–5, blancs vers 95.** Au-dessus de 100 c'est écrêté sur un écran d'ordinateur ; sous 0 c'est du noir sans détail. Un repère plus prudent : garder l'essentiel entre 10 et 90.
7. **Peu de pixels sous 10 IRE dans une scène de jour.** Une scène dont la masse est sous 10 et les hautes lumières vers 50–60 se lit comme un crépuscule, pas comme du jour.
8. **La peau se juge sur deux scopes** : angle sur le vectorscope (la ligne « 10 h 30 », axe –I, identique pour toutes les carnations) et niveau sur la forme d'onde (peau claire 50–70 %, hautes lumières diffuses ~70 ; peau foncée 15–35 %). Les carnations diffèrent en luminance, pas en teinte.
9. **Un plan « héros » par scène, puis matcher les autres dessus.** Choisir un plan représentatif de l'éclairage moyen (souvent un plan large ou moyen), pas le plus beau.
10. **Matcher dans l'ordre : noirs (parade RVB), puis blancs, puis gamma, puis peau.** Les extrêmes alignés, le milieu se règle avec les roues sans tout décaler.
11. **LUT technique ≠ LUT créative.** La technique (LOG → Rec.709) convertit un espace ; la créative stylise. Une LUT créative sur un plan déjà Rec.709 bien corrigé peut aller ; une LUT créative sur du LOG brut donne des ombres bouchées et boueuses.
12. **Une LUT d'entrée dans la Correction de base est appliquée avant les curseurs** : si elle écrête, les curseurs ne récupèrent rien. Beaucoup de monteurs placent la LUT dans Créatif > Look pour pouvoir « trimmer » dessous avec la Correction de base.
13. **Intensité de LUT créative : commencer vers 50 %, rarement plus de 70 %.** À 100 % la plupart des LUT bouchent les ombres et oranger la peau.
14. **Depuis Premiere 23.2 / 25.x, la gestion des couleurs remplace la LUT technique pour la plupart des caméras** (détection automatique du LOG + tone mapping). Vérifier l'onglet Réglages de Lumetri avant d'ajouter une LUT, sinon double conversion.
15. **Un look global vit sur un calque d'effets au-dessus de tous les clips.** Un clic pour le désactiver, un seul endroit à modifier ; les corrections par plan restent sur les clips. Exception : pas de Lumetri sur calque d'effets au-dessus de LOG non converti.
16. **Petits mouvements de curseurs.** Au-delà de ±30 à 40 sur un curseur de la Correction de base, le bruit et les artefacts arrivent (repère). Si un curseur part loin, c'est souvent le mauvais curseur.
17. **Vibrance plutôt que Saturation pour les visages.** La vibrance pousse surtout les couleurs peu saturées et épargne la peau ; la saturation pousse tout, et des couleurs vives (rouge d'un vêtement) sont déjà souvent trop saturées en numérique.
18. **Les clés HSL lisent les pixels après les corrections précédentes.** Faire la sélection juste après la LUT d'entrée / la correction de base, avant de déplacer les couleurs, sinon la clé bouge.
19. **Banding = 8 bits poussé trop loin.** 8 bits = 256 niveaux par canal, 10 bits = 1024. Dégradés de ciel, ombres relevées et LUT fortes révèlent les marches ; grain fin, « Rendu à la profondeur maximale » et bitrate d'export élevé les masquent.
20. **Le gamma du visualiseur doit correspondre à la destination** : 2,2 (web), 2,4 (broadcast), 1,96 (QuickTime). Sinon le contraste et la saturation changent après export.
21. **Toujours comparer avant/après et avec une référence.** L'œil s'habitue en quelques minutes ; sans bascule on dérive vers le trop saturé, trop chaud, trop contrasté.
22. **Moins, c'est mieux.** L'erreur la plus fréquente est le sur-étalonnage : si le spectateur remarque la couleur avant l'histoire, c'est trop. Faire une pause et revoir à froid.

## Procédures

### P1. Correction primaire d'un plan (neutraliser)

Objectif : image neutre, exposée, sans dominante, prête à matcher ou à styliser.

1. Lire l'état : `ppro_get_sequence` [existant] puis `ppro_get_clip_effects {clipId}` [prévu] pour savoir s'il y a déjà un Lumetri, une LUT, un calque d'effets.
2. Exporter une image du plan : `ppro_export_frame {time, size: 1280}` [existant]. Regarder : dominante ? zones écrêtées ? peau ? noirs gris ou bouchés ?
3. Si le plan est LOG/RAW : passer d'abord par P3, puis revenir ici.
4. `ppro_checkpoint {label: "couleur-<plan>"}` [existant].
5. Balance des blancs : `ppro_set_lumetri {clipIds, basic: {temperature, tint}}` [prévu]. Viser une parade RVB nivelée dans les hautes lumières (voir `references/scopes.md`). Bleu plus haut que rouge et vert dans les blancs = cast froid → température vers le chaud. Dominante verte/magenta → teinte.
6. Noirs puis blancs : `basic.blacks` jusqu'à ce que les pixels les plus sombres touchent ~3–5 IRE (jamais un paquet à 0), `basic.whites` jusqu'à ~95 sans dépasser 100.
7. Exposition puis contraste : relever `basic.exposure` d'abord si le plan est sombre ; `basic.contrast` seulement quand l'exposition est proche. Le contraste n'est pas un substitut à l'exposition.
8. Hautes lumières / ombres : `basic.highlights` pour récupérer un ciel, `basic.shadows` pour ouvrir un visage, par petits pas.
9. Saturation : `basic.saturation` 100 par défaut ; retoucher de ±10 à 20 maximum à ce stade (repère).
10. Vérifier : `ppro_export_frame` au même instant, comparer à l'image de l'étape 2 ; relire `ppro_get_clip_effects`. Signaler les valeurs appliquées.

Vérification réussie si : pas de zone pleine à 0 ou 100, parade équilibrée sur les neutres, peau dans sa plage, aucune valeur de curseur au-delà de ±40 (sinon chercher la vraie cause : LUT, exposition de tournage).

### P2. Matcher les plans d'une scène

Objectif : tous les plans d'une scène ont le même contraste, la même balance, la même saturation.

1. `ppro_export_frames {times: [un instant par clip], size: 640}` [prévu] → `media_contact_sheet` [prévu]. Regarder la planche : repérer le plan héros (éclairage représentatif) et les plans qui s'écartent (plus chaud, plus plat, plus saturé).
2. Corriger le héros avec P1.
3. Pour chaque autre plan, dans l'ordre : noirs alignés (parade), blancs alignés, gamma (ombres/médiums/hautes lumières via `ppro_set_lumetri {curves}` ou roues), puis peau.
4. Alternative rapide : demander à l'utilisateur de lancer Color Match dans Premiere (Vue de comparaison → image de référence sur le héros → Appliquer la correspondance). Il écrit dans les roues chromatiques et leurs curseurs luma ; il ne touche pas (ou peu) à la saturation : aligner l'exposition et la saturation avant, affiner après.
5. Même caméra, même éclairage : `ppro_copy_attributes {fromClipId, toClipIds, effects: ["Lumetri Color"]}` [prévu] puis ajuster seulement l'exposition par plan.
6. Vérifier : nouvelle planche `ppro_export_frames` → `media_contact_sheet` ; les vignettes doivent se lire comme une seule scène. Enchaîner deux frames consécutives (fin du plan A, début du plan B) en vue côte à côte si possible.

Pièges du Color Match : un grand ciel ou un fond vif fausse l'analyse (recadrer temporairement) ; le résultat est « dans la bonne zone », pas fini ; il peut remettre à zéro un HSL secondaire déjà réglé.

### P3. Footage LOG / RAW → Rec.709

Objectif : un plan plat et désaturé devient une image normale, sans écrêtage, avant toute correction.

1. Identifier le profil : `ppro_get_item {nodeId}` [prévu] (métadonnées, caméra) ou `media_probe {path}` [prévu] (codec, primaires, profondeur de bits). Demander à l'utilisateur si doute (S-Log3, V-Log, C-Log3, Apple Log, D-Log…). Attention : certains profils « plats » de drones ne sont pas du vrai LOG ; ils se traitent avec contraste + saturation, pas avec une LUT LOG.
2. Choisir la voie :
   - **Gestion des couleurs (préférée, Premiere 25+)** : vérifier que « Gérer automatiquement les médias Log et RAW détectés » et « Tone mapping automatique » sont actifs (Lumetri > Réglages, ou Fichier > Paramètres du projet > Couleur) et que la séquence est en Rec.709 (SDR). Méthode de tone mapping : « Par canal » pour le LOG, « Max RGB » pour sources PQ/HLG, « Préservation de la teinte » pour HDR de téléphone. Aucune LUT à ajouter.
   - **LUT technique** : si la caméra n'est pas détectée, si l'utilisateur fournit sa LUT, ou si le projet a la gestion des couleurs désactivée. `ppro_apply_lut {clipIds, lutPath}` [prévu] ou, de préférence, LUT dans Créatif > Look via `ppro_set_lumetri {creative: {look, intensity: 100}}` pour trimmer dessous.
   - Jamais les deux : gestion des couleurs active + LUT LOG = double conversion (image sur-contrastée, hautes lumières brûlées).
3. Après la conversion, si les hautes lumières écrêtent : baisser `basic.exposure` ou `basic.whites` (la LUT dans Créatif laisse la Correction de base agir avant elle).
4. Puis P1 normalement.
5. Vérifier par `ppro_export_frame` : la peau est dans sa plage, le ciel garde du détail, les noirs ne sont pas à 0.

Note : un plan LOG non converti sous un calque d'effets Lumetri donne des résultats faux (les curseurs attendent un gamma standard). Convertir sur le clip, styliser sur le calque.

### P4. Look global sur calque d'effets

Objectif : un style cohérent sur toute la séquence, désactivable en un clic.

1. S'assurer que P1/P2 sont faits sur les clips.
2. `ppro_add_adjustment_layer {start, end, track: "V<top>", effects: [Lumetri]}` [prévu] au-dessus de tous les clips. Un calque par scène si l'éclairage change beaucoup.
3. Appliquer le look : LUT créative (`creative.look` + `creative.intensity` 40–70) ou construit à la main (roues : ombres vers une teinte, hautes lumières vers la complémentaire ; courbe S douce ; `creative.fadedFilm` 10–25 pour un voile ; vignette légère). Paramètres indicatifs dans `references/looks.md`.
4. Protéger la peau : si le look la décale, HSL secondaire (P5) avec masque inversé pour que le look n'affecte que le reste.
5. Vérifier sur 4–6 frames réparties (`ppro_export_frames`) : la peau reste naturelle partout, pas de banding dans les ciels, pas de noirs bouchés. Comparer calque activé / désactivé (`ppro_disable_clips` sur le calque [prévu]).

### P5. Correction secondaire (peau, ciel, objet)

Objectif : corriger une zone de couleur sans toucher au reste.

1. Faire la clé tôt (avant les roues et le look) : `ppro_set_lumetri {hsl: {key: {h, s, l}, refine: {denoise: 30, blur: 8}}}` [prévu — paramètres HSL à ajouter à `ppro_set_lumetri`]. Si le tool ne les expose pas, guider l'utilisateur dans l'interface (voir plus bas).
2. Vérifier la clé en mode Couleur/Gris : seule la zone visée doit apparaître. Clé trop large = lèvres, fond et peau bougent ensemble.
3. Appliquer la correction sur la clé : roue (teinte), température, contraste, saturation. Pour la peau : ramener vers la ligne 10 h 30, baisser la saturation plutôt que la monter.
4. Vérifier sur 2–3 frames, dont une avec mouvement : la clé ne doit pas clignoter.

### P6. HDR (bases)

- Séquence en Rec.2100 PQ (HDR10, HDR10+, Dolby Vision) ou Rec.2100 HLG (broadcast). Blanc des graphiques HDR : 203 nits par défaut.
- Moniteur : activer la plage dynamique étendue (Mac) et la gestion des couleurs d'affichage ; sans écran HDR, ne pas grader en HDR.
- Scopes en mode HDR pour voir au-dessus de 100 ; des « overbrights » venant de sources HDR/YUV se ramènent avec Blancs ou Courbes RVB.
- Livrer en SDR à partir d'une séquence HDR : tone mapping automatique à l'export, puis contrôler les hautes lumières sur une frame exportée.

## Paramètres de référence

### Cibles scopes (Rec.709, SDR)

| Élément | Cible | Note |
|---|---|---|
| Noir le plus profond | 0 à ~5 IRE | Films : point noir souvent 3–5 ; un paquet à 0 = écrasé |
| Masse des ombres (scène de jour) | > 10 IRE | Peu de pixels sous 10 |
| Blanc diffus (mur, chemise) | 85–95 IRE | Repère |
| Blanc le plus brillant | ≤ 100 IRE | 100–109 = « super-blancs », écrêtés sur ordinateur |
| Peau claire | 50–70 % ; hautes lumières diffuses ~70 | Jamais au-dessus de ~75 hors spéculaire |
| Peau foncée | 15–35 % | Tableau complet dans `references/scopes.md` |
| Herbe / végétation | 40–50 IRE | |
| Angle peau (vectorscope) | ligne 10 h 30 (axe –I), entre Y et R | Toutes carnations |
| Saturation (broadcast) | trace à l'intérieur des cibles R/Mg/B/Cy/G/Yl | Web : plus tolérant |

### Curseurs Lumetri (plages et usage)

| Curseur | Plage UI | Défaut | Usage raisonnable | Pourquoi |
|---|---|---|---|---|
| Température | −150…+150 (repère) | 0 | ±10 à 30 | Au-delà, la peau vire |
| Teinte | −150…+150 (repère) | 0 | ±5 à 15 | Magenta rend malade, vert rend cadavérique |
| Exposition | −5…+5 (repère, ~diaphs) | 0 | ±0,3 à 1 | Premier curseur d'un plan sombre |
| Contraste | −100…+100 | 0 | +5 à +25 | Écrase 0 et 100 si trop fort |
| Hautes lumières | −100…+100 | 0 | −40 à +20 | Récupérer un ciel |
| Ombres | −100…+100 | 0 | −20 à +30 | Ouvrir un visage ; révèle le bruit |
| Blancs | −100…+100 | 0 | jusqu'à ~95 IRE | Non destructif vis-à-vis des overbrights |
| Noirs | −100…+100 | 0 | jusqu'à ~3–5 IRE | Point noir |
| Saturation (base) | 0…300 (repère) | 100 | 90–120 | Au-delà, dérive des teintes |
| Créatif › Intensité (Look) | 0…200 (repère) | 100 | 40–70 | LUT à 100 % bouche les ombres |
| Créatif › Faded Film | 0…100 | 0 | 10–25 | Voile sur les noirs |
| Créatif › Netteté | −100…+100 | 0 | 0 à +20 | Au-delà, halos |
| Créatif › Vibrance | −100…+100 | 0 | +10 à +25 | Épargne la peau |
| HSL › Réduction du bruit / Flou | 0…100 | 0 | ~30 / ~8 | Lisse la clé |
| Vignette › Quantité | −5…+5 (repère) | 0 | −0,5 à −1,5 | Subtil, sinon « hokey » |
| Vignette › Contour progressif | 0…100 (repère) | 50 | 60–90 | Transition douce |

Un curseur de la Correction de base au-delà de ±30 à 40 signale généralement un problème en amont (repère).

### Choix de la voie LOG → Rec.709

| Situation | Voie | Où |
|---|---|---|
| Caméra reconnue, Premiere 25+ | Gestion des couleurs (auto-détection + tone mapping) | Lumetri > Réglages |
| Caméra non reconnue / LUT fournie | LUT technique | Créatif > Look (trim dessous) ou Correction de base > LUT d'entrée |
| LUT à appliquer en lot | Preset Lumetri contenant seulement la LUT, glissé sur les clips du chutier (effet de clip source) | Panneau Projet |
| Projet ancien « tout LUT » | Désactiver la gestion des couleurs de la séquence | Séquence > Réglages > Gestion des couleurs |
| Profil « plat » non LOG (certains drones) | Preset Lumetri contraste + saturation | Clip |

### Gamma et affichage

| Destination | Gamma visualiseur | Espace séquence |
|---|---|---|
| Web / ordinateur | 2,2 | Rec.709 |
| Broadcast | 2,4 | Rec.709 |
| HDR streaming | — (écran HDR, EDR) | Rec.2100 PQ |
| HDR broadcast | — | Rec.2100 HLG |

Écran de référence pour juger une image : D65, ~100 nits, BT.1886 (≈ gamma 2,4), pièce sombre. Un écran grand public en mode « Rec.709 » sort souvent 250 nits et trompe.

### Dossiers de LUT

- macOS : `/Library/Application Support/Adobe/Common/LUTs/` ; Windows : `C:\Program Files\Adobe\Common\LUTs\` ; sous-dossiers `Technical` (apparaît dans LUT d'entrée) et `Creative` (apparaît dans Look). Variante par utilisateur dans le dossier de profil (`Library/Application Support/Adobe/Common/LUTs` ou `AppData\Roaming`). Redémarrer Premiere.
- Ne jamais copier dans les dossiers de l'application : les LUT y sont indexées par position, l'ajout décale les autres.
- Format d'échange : `.cube` (la vignette n'y est pas incluse ; `.look` la garde mais reste propre à Premiere). Interpolation 3D LUT : tétraédrique.

## Erreurs fréquentes et comment les détecter

| Erreur | Comment la voir | Correction |
|---|---|---|
| Sur-saturation | Vectorscope qui dépasse les cibles ; vêtements rouges « qui bavent » ; l'image fixe semble bien mais bouge mal | Baisser la saturation globale, utiliser la vibrance, désaturer la teinte fautive (Hue vs Sat) |
| Peau orange | Peau au-dessus de la ligne 10 h 30 côté rouge/jaune, très saturée ; typique d'une LUT à 100 % ou d'une température trop chaude | Intensité de LUT 50 %, température vers le froid de quelques points, HSL secondaire sur la peau : −saturation, teinte vers la ligne |
| Noirs écrasés | Histogramme qui s'empile sur le bord gauche ; forme d'onde plate à 0 ; détails de vêtements sombres perdus | Remonter Noirs, puis Ombres légèrement ; si c'est la LUT, baisser son intensité ; vérifier que ce n'est pas l'exposition |
| Blancs brûlés | Trace collée à 100 ; ciel blanc uni | Baisser Blancs puis Hautes lumières ; si l'écrêtage vient d'une LUT d'entrée, la déplacer en Créatif et baisser l'exposition avant |
| Banding | Marches dans un ciel, un mur, un fond flou ; pire après export | Réduire la poussée (LUT, ombres), « Rendu à la profondeur maximale » à l'export, grain fin, source 10 bits, bitrate élevé, éviter les ré-encodages |
| Dominante magenta/verte dans les ombres | Parade RVB : un canal plus haut que les autres dans le bas ; noirs « sales » | Teinte, puis roue des ombres vers la complémentaire ; viser des noirs neutres |
| Plans d'une scène qui ne se ressemblent pas | Planche de frames : un plan plus chaud/plus plat ; sauts au raccord | P2 (noirs, blancs, gamma, peau) ; Color Match puis affinage |
| Double conversion LOG | Image très contrastée et saturée dès l'import, hautes lumières brûlées sans aucun réglage | Vérifier Lumetri > Réglages (auto-détection) et retirer la LUT, ou l'inverse |
| LUT créative sur LOG brut | Ombres bouchées et boueuses, couleurs ternes | Conversion technique d'abord (P3) |
| Clé HSL trop large | Lèvres, fond et peau changent ensemble ; clignotement au mouvement | Réduire la plage H/S/L, adoucir avec les triangles du bas, réduction du bruit ~30, flou ~8 |
| Ombres relevées sur image bruitée | Grain coloré dans les ombres après +Ombres | Limiter la montée, réduction de bruit avant, ou accepter des ombres plus denses |
| Empilement de Lumetri | Lecture saccadée ; plusieurs instances au même nom dans Options d'effet | Fusionner en une instance, renommer chaque instance, proxys |
| Gamma d'export décalé | L'export paraît plus plat ou plus contrasté que le moniteur | Aligner gamma visualiseur et destination (2,2 web / 2,4 broadcast) |
| Bouton Auto / pipette BdB sur chaque plan | Casts dans les ombres, résultats différents d'un plan à l'autre | Auto = point de départ ; pipette sur un vrai neutre puis réglage manuel |
| Grader avant de verrouiller le montage | Plans gradés supprimés, raccords non vérifiés | Terminer la coupe d'abord |

## Contrôle qualité (checklist avant de livrer)

- [ ] Montage verrouillé ; Lumetri > Réglages vérifié (gestion des couleurs, gamma visualiseur, espace de séquence).
- [ ] Aucun plan avec masse à 0 ou à 100 IRE ; noirs ~3–5, blancs ≤ 95–100 (frames exportées sur chaque plan ou toutes les 10 s).
- [ ] Peau : angle sur la ligne 10 h 30, niveau dans la plage de la carnation, sur tous les plans avec visage.
- [ ] Parade RVB nivelée sur les neutres de chaque plan ; pas de dominante dans les ombres.
- [ ] Planche de frames de la séquence : chaque scène se lit comme une seule caméra ; raccords sans saut de chaleur ni de contraste.
- [ ] Bascule avant/après du look (calque d'effets off/on) : le look reste lisible mais la peau reste naturelle.
- [ ] Comparaison à 1–2 images de référence fournies par l'utilisateur (moodboard, plan de film, grade précédent).
- [ ] Pas de banding visible sur les ciels/fonds à 100 % de zoom ; « Rendu à la profondeur maximale » coché si poussée forte ou source 8 bits.
- [ ] Limiteur vidéo (preset EBU ou clip 100 IRE pour le web) sur le calque du haut en filet de sécurité, pas comme substitut ; « Avertissement de gamut » désactivé avant export.
- [ ] Export test court (10–20 s) regardé sur un deuxième écran ou un téléphone : la plateforme recompresse et peut révéler banding et sur-saturation.
- [ ] Checkpoint final posé (`ppro_checkpoint {label: "couleur-final"}`) et rapport : valeurs par plan, LUT utilisées, calques ajoutés.

## Comment un humain le fait dans Premiere / After Effects (menus, raccourcis, panneaux)

- **Espace de travail** : Fenêtre > Espaces de travail > Couleur. Panneau **Couleur Lumetri** (Fenêtre > Couleur Lumetri) à droite, **Moniteur Lumetri** / Lumetri Scopes (Fenêtre > Moniteur Lumetri) à gauche, Moniteur du programme au centre.
- **Scopes** : clic droit dans le panneau ou icône clé à molette en bas → choisir Forme d'onde (type YC sans chroma pour la luma seule), Parade RVB, Vectorscope YUV, Histogramme ; preset « Tous les scopes (RVB) ». Option **Limiter le signal** (Clamp Signal) à désactiver avant export pour voir ce qui dépasse. Fermer le panneau quand on ne s'en sert pas (il double la charge CPU).
- **Sections Lumetri** (dans l'ordre du panneau) : Correction de base › Créatif › Courbes › Roues chromatiques et correspondance › HSL secondaire › Vignette. Chaque section a une case pour la désactiver ; double-clic sur un curseur = retour à la valeur par défaut ; bouton Réinitialiser en bas.
- **Balance des blancs** : pipette « Sélecteur BdB » puis clic sur un blanc/gris neutre dans le Moniteur du programme ; Température et Teinte se mettent à jour, à affiner à la main.
- **Courbes** : clic sur la courbe pour ajouter un point, Ctrl/Cmd-clic (Alt/Option-clic selon version) pour le retirer ; courbe blanche = luma, R/V/B = canal ; courbes Teinte vs Sat, Teinte vs Teinte, Teinte vs Luma, Luma vs Sat, Sat vs Sat avec pipette pour poser trois points autour d'une couleur.
- **Color Match** : section Roues chromatiques et correspondance › bouton **Vue de comparaison** (aussi en bas du Moniteur du programme) ; côte à côte / séparation verticale / horizontale ; glisser le curseur bleu sous l'image de référence (par défaut la première image de la séquence, presque jamais la bonne) ; tête de lecture sur le plan à corriger ; cocher **Détection des visages** s'il y a des visages ; **Appliquer la correspondance**. Le résultat atterrit dans les roues et leurs curseurs luma.
- **HSL secondaire** : pipette « Définir la couleur » (Ctrl/Cmd-clic = échantillon 5×5), pipettes + / − ; case **Couleur/Gris** pour voir la clé, menu Couleur/Noir ou Blanc/Noir, bouton d'inversion ; triangles du haut = plage, du bas = adoucissement ; Affiner : Réduction du bruit, Flou ; Correction : roue (icône pour passer en trois roues), Température, Teinte, Contraste, Netteté, Saturation.
- **Calque d'effets** : Fichier > Nouveau > Calque d'effets (ou bouton Nouvel élément du panneau Projet), glisser sur la piste vidéo du haut, étirer sur la plage voulue, puis Lumetri dessus. Affichage > Mode d'affichage > Vidéo composite pour ne voir qu'un plan.
- **Copier une correction** : panneau Options d'effet › clic droit sur Lumetri Color › Copier, puis Coller sur l'autre clip ; ou Ctrl/Cmd+C sur le clip puis clic droit › **Coller les attributs** en décochant Trajectoire/Échelle.
- **Presets et LUT** : menu du panneau Lumetri (≡) › Enregistrer le préconfiguré ; Exporter .cube (portable) ou .look (Premiere, garde la vignette). LUT temporaire : Correction de base › LUT d'entrée › Parcourir, ou Créatif › Look › Parcourir. Auto-actualiser LUT/Look pour recharger depuis le disque à l'ouverture.
- **Gestion des couleurs** : Couleur Lumetri › onglet **Réglages** (projet : gérer automatiquement Log/RAW détectés, gestion des couleurs d'affichage, interpolation 3D LUT ; séquence : espace de travail Rec.709 / Rec.2100, tone mapping automatique et méthode). Par clip : clic droit › Modifier › Couleur › « Utiliser l'espace colorimétrique du média » ou « Remplacer ». Par séquence : Séquence > Réglages de séquence > Gestion des couleurs > Configuration (« Désactiver la gestion des couleurs » pour un flux tout LUT). Projet : Fichier > Paramètres du projet > Couleur (gamma du visualiseur, blanc graphique HDR).
- **Export** : Exporter › Vidéo › **Rendu à la profondeur maximale** (contre le banding) ; limiteur vidéo appliqué sur le calque du haut avant.
- **After Effects** : même effet Lumetri Color (Effet > Correction colorimétrique > Couleur Lumetri) avec les mêmes sections ; un calque d'effets AE joue le rôle du calque d'effets Premiere ; les scopes Lumetri existent aussi dans AE (Fenêtre > Moniteur Lumetri).

## Sources

- Frame.io Insider — The Complete 2024 Premiere Pro Color Correction Guide — https://blog.frame.io/2024/08/25/complete-2024-premiere-pro-color-correction-guide/ — ordre de traitement interne de Lumetri, onglet Réglages, gamma 2,2/2,4/1,96, 203 nits, méthodes de tone mapping, dossiers LUT, limites du Color Match, erreurs (instances multiples, Gamut Warning, CPU des scopes).
- Adobe Community — Overview of automatic log video detection, interpretation and timeline tone mapping — https://community.adobe.com/t5/premiere-pro-discussions/overview-of-automatic-log-video-detection-interpretation-and-timeline-tone-mapping-workflow/td-p/13588144/page/4 — formats détectés (S-Log, V-Log, C-Log, HLG/PQ), coexistence LUT / gestion des couleurs.
- Adobe Community — Premiere is automatically applying a LUT to my S-Log footage — https://community.adobe.com/t5/premiere-pro-discussions/premiere-is-automatically-applying-a-lut-to-my-s-log-footage-and-i-can-t-fix-it/td-p/15606501 — chemins exacts : Paramètres du projet > Couleur, Modifier > Couleur, Réglages de séquence > Gestion des couleurs.
- Adobe Community — How do I convert Apple Log to Rec.709 — https://community.adobe.com/t5/premiere-pro-discussions/how-do-i-convert-apple-log-to-rec-709/td-p/15371470 — réponse d'un employé Adobe sur l'onglet Réglages (auto-détection + tone mapping, séquence Rec.709).
- Adobe Community — New color tools in 25.2 — https://community.adobe.com/t5/premiere-pro-discussions/new-color-tools-in-25-2/m-p/15253245 — gestion des couleurs d'affichage, EDR sur Mac, profils « plats » non LOG (preset contraste/saturation).
- Newsshooter — Premiere Pro 25 color management — https://newsshooter.com/?p=245227 — six presets de gestion des couleurs, ACEScct, caméras RAW/LOG prises en charge.
- Adobe Community — Are LUTs and "Creative Looks" the same thing? — https://community.adobe.com/t5/premiere-pro-discussions/are-luts-and-quot-creative-looks-quot-the-same-thing/td-p/12541037 — LUT d'entrée avant la Correction de base, Look après ; intensité seulement côté Look ; LUT en Créatif pour trimmer dessous ; ne pas copier dans les dossiers de l'application.
- Adobe Community — Where to put LUTs — https://community.adobe.com/t5/premiere-pro-discussions/where-to-put-luts/m-p/13055939 — sous-dossiers Technical / Creative / Input, dossier utilisateur, LUT bâties sur des médias de test (écrêtage).
- Digital Filmmaker — How to use LUTs in Premiere Pro — https://digitalfilmmaker.net/how-to-use-luts-in-premiere-pro/ — LUT technique vs créative, démarrer vers 50 %, dossiers Common/LUTs, erreurs (LUT créative sur LOG brut, empilement).
- 4K Shooters — Color grading workflow with LUTs in Premiere Pro CC — https://4kshooters.net/2017/09/25/color-grading-workflow-with-luts-in-premiere-pro-cc — LUT sur calque d'effets, Créatif > Look > Parcourir.
- Noam Kroll — The best order of operations for color grading — https://noamkroll.com/the-best-order-of-operations-for-color-grading-why-it-makes-all-the-difference/ — ordre : transformation technique, neutraliser et matcher (plan héros), corrections locales, corrections de couleur (peau), look, retouches finales.
- Envato Tuts+ — How to color correct video efficiently in Premiere (order of ops) — https://photography.tutsplus.com/tutorials/how-to-color-correct-video-in-premiere-order-of-ops--cms-40353 — exposition avant couleur, ne pas grader avant la coupe.
- Adobe Learn — Adjust contrast, shadows and highlights — https://www.adobe.com/learn/premiere-pro/web/adjust-contrast-shadows-highlights — forme d'onde YC sans chroma, lecture 0–100 IRE, rôle de chaque curseur, Noirs jusqu'à la ligne 0.
- Adobe Learn — Correct skin tones — https://www.adobe.com/learn/premiere-pro/web/correct-skin-tones — calque d'effets de balance des blancs, pipette BdB, ligne de peau sur l'axe –I, astuce du recadrage pour isoler la peau.
- Adobe Help — Correct color using HSL Secondary controls — https://helpx.adobe.com/au/premiere-pro/using/hsl-secondary-controls.html — pipettes, triangles plage/adoucissement, Couleur/Gris, Réduction du bruit, Flou, roue de correction.
- Adobe Learn — Color match clips — https://www.adobe.com/learn/premiere-pro/web/color-match-clips — Vue de comparaison, modes d'affichage, image de référence, Détection des visages, Appliquer la correspondance.
- Adobe Learn — Automatically match color — https://www.adobe.com/learn/premiere-pro/web/automatically-match-color — le match écrit dans les roues Ombres/Médiums/Hautes lumières et leurs curseurs luma.
- Larry Jordan — Premiere Pro CC automatically color match shots — https://larryjordan.com/articles/abobe-premiere-pro-cc-automatically-color-match-shots/ — image de référence par défaut inadaptée, effet de la détection des visages, « dans la bonne zone », méthode avec charte.
- MakeUseOf — How to read Lumetri Scopes in Premiere Pro — https://www.makeuseof.com/read-lumetri-scopes-adobe-premiere-pro/ — ouverture des scopes, icône clé, presets, Limiter le signal, ligne de peau à 10 h 30, histogramme 0–255.
- PremiumBeat — Color correcting video with Lumetri Scopes — https://www.premiumbeat.com/blog/color-correcting-video-lumetri-scopes/ — 0/100 IRE, hautes lumières de peau claire vers 70, parade pour matcher.
- Pixflow — How to read video scopes fast — https://pixflow.net/blog/read-video-scopes-fast/ — tableau des niveaux de peau par carnation (d'après Van Hurkman), herbe 40–50, parade pour la balance des blancs, histogramme et écrasement.
- Adobe Community — Colorists: luma waveform ranges, is my grade too dark? — https://community.adobe.com/t5/premiere-pro-discussions/re-colorists-luma-waveform-ranges-is-my-grade-too-dark/m-p/14349647 — peau ~50 / hautes lumières ~70, peu de pixels sous 10, point noir 3–5, calibration D65/100 nits/BT.1886.
- Wolfcrow — A quick look at understanding IRE values — https://wolfcrow.com/a-quick-look-at-understanding-ire-values/ — super-blancs 100–109, peau 45–70, ombres au-dessus de 10–20, gris moyen en LOG (34–41 selon profil).
- DVinfo — Using waveform for accurate exposure — https://www.dvinfo.net/forum/view-video-display-hardware-software/481996-using-waveform-accurate-exposure.html — peau exposée de 45 à 75 IRE selon la carnation, zebra à 75 %.
- Elephorm — Comprendre le moniteur Lumetri pour étalonner une image — https://www.elephorm.com/formation/maitriser-premiere-2026/comprendre-le-moniteur-lumetri-pour-etalonner-une-image — lecture de la forme d'onde, plage indicative 10–90, noms français des panneaux.
- Elephorm — Guide d'utilisation du module Lumetri — https://www.elephorm.com/formation/apprendre-la-colorimetrie-avec-lumetri-de-premiere-pro-cc-maitriser-letalonnage-numerique/guide-dutilisation-du-module-lumetri-dans-adobe-premiere-pro — sections en français, pipette de balance des blancs.
- Graphiste.com — 8 étapes pour réussir l'étalonnage de vos vidéos — https://graphiste.com/blog/etalonnage-video/ — vocabulaire français (correction vs étalonnage, dominante, correspondance), tests sur plusieurs écrans.
- LearnPerfect — Programme Correction de couleur et étalonnage (PDF) — https://www.learnperfect.fr/wp-content/uploads/2024/11/LP_Programme_Adobe-Premiere_Correction-de-Couleur-et-Etalonnage.pdf — structure primaire → secondaire → supports, vocabulaire (oscilloscope, vecteurscope, parade).
- Evergreen Help Wiki — Lumetri Color, Premiere Pro — https://helpwiki.evergreen.edu/wiki/index.php/Lumetri_Color_-_Premiere_Pro — rôle de chaque curseur, Auto = point de départ, vibrance épargne la peau, échantillon 5×5, double-clic = défaut.
- Storyblocks — Basics of video color correction in Premiere Pro — https://www.storyblocks.com/resources/tutorials/basics-of-video-color-correction-in-premiere-pro — ne pas dépasser ~30–40 sur les curseurs, copier/coller Lumetri, presets .cube/.look, sur-saturation visible en mouvement.
- lesfm — Color correct in Premiere Pro — https://lesfm.net/blog/color-correct-premiere-pro/ — blancs ~95 / noirs ~5, exposition avant contraste, erreurs (clé HSL trop large, ombres bruitées, Auto), pénalité de rendu avec la gestion des couleurs.
- Premiere Bro — The complete Lumetri Color workflow — https://premierebro.squarespace.com/premiere-in-post/the-complete-lumetri-color-workflow-in-premiere-pro — rôle de chaque onglet, courbe S, vectorscope et saturation broadcast vs web, « les LUT ne sont pas de l'étalonnage ».
- Dartmouth Film & Media — Color correcting in Lumetri and Resolve (PDF) — https://film-media.dartmouth.edu/sites/department_film.prod/files/department_film/wysiwyg/color_correcting_in_lumetri_and_resolve.pdf — points noir/blanc avant BdB, Coller les attributs, un calque d'effets par scène.
- Freelance Video Collective — How to color grade in Premiere Pro — https://www.freelancevideocollective.com/tutorials/how-to-color-grade-in-premiere-pro — matcher avant le look, Vidéo composite, LUT à intensité réduite si ombres bouchées.
- Studio Plugins — Premiere Pro color grading workflow, cinematic look — https://studioplugins.net/article/premiere-pro-color-grading-workflow-cinematic-look — LUT à 50–70 %, ordre correction → scopes → LUT → courbes → teal & orange → vignette → calque.
- Chimes — Color grading in 5 easy steps (no LUTs) — https://chimes-cod-anpw.squarespace.com/blog-1/color-grading-in-5-easy-steps-no-luts-premiere-pro-tutorial — courbe S subtile, Hue vs Sat sur les verts, HSL peau avec Réduction du bruit 30 / Flou 8 et masque inversé, vignette subtile.
- Motion Array — Orange and teal LUT — https://blog.motionarray.com/learn/video-effects/orange-and-teal-lut/ — construction via HSL inversé + roue maître vers teal, Luma vs Sat pour désaturer les ombres, avertissements.
- Shotkit — Teal and orange look — https://shotkit.com/teal-orange-look/ — complémentaires, peau dans l'orange, désaturer les teintes concurrentes, vignette pour guider l'œil.
- PetaPixel — What is the orange & teal look — https://petapixel.com/2017/02/23/orange-teal-look-popular-hollywood/ — pourquoi ça marche (contraste max des complémentaires, peau).
- Frame.io Insider — How a pro colorist handles crushed blacks — https://blog.frame.io/2024/05/06/how-a-pro-colorist-handles-crushed-blacks-in-resolve/ — diagnostic (écran, exposition, contraste, look) avant de corriger, ouvrir le bas sans aplatir.
- Boris FX — Learn how to handle banding in video — https://borisfx.com/blog/learn-how-to-handle-banding-in-video/ — causes (bits, compression, grading, réduction de bruit, sous-exposition), Rendu à la profondeur maximale, grain, vérifier sur plusieurs écrans.
- UniFab — What is color banding — https://unifab.ai/resource/what-is-color-banding.htm — 256 / 1024 / 4096 niveaux, 4:2:0, prévention tournage et post.
- Videomaker — 5 color grading mistakes to avoid — https://www.videomaker.com/news/you-should-avoid-these-5-color-grading-mistakes-at-all-costs/ — visages orange = LUT trop forte, magenta dans les ombres, plans non matchés.
- No Film School — 7 things to watch out for to avoid bad color grading — https://nofilmschool.com/2016/12/7-things-watch-out-avoid-bad-color-grading — sur-étalonnage, BdB, incohérence, clés et suivi.
- Fstoppers — Four color grading mistakes amateurs often make — https://fstoppers.com/education/four-color-grading-mistakes-amateurs-often-make-369811 — sur-étalonnage, revoir à froid après une pause.
- Artlist — Color grading mistakes — https://help-center.artlist.io/insights/color-grading-mistakes/ — indicateur de peau du vectorscope, ombres non neutres (teinte verte/rouge dans les noirs).
- Tella — Lumetri Color panel (définition) — https://www.tella.com/definition/lumetri-color-panel — Fenêtre > Couleur Lumetri, Fenêtre > Moniteur Lumetri.
