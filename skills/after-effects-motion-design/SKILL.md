---
name: after-effects-motion-design
description: Animer et construire du motion design dans After Effects (keyframes, easing, graph editor, expressions, typographie cinétique, animateurs de texte, calques de forme, trim paths, précompositions, flou de mouvement, MOGRT / propriétés essentielles). À charger pour toute demande de titre animé, lower third, compteur, HUD, transition graphique, boucle ou template Premiere créé dans After Effects.
---
# After Effects : animation et motion design

Complète `adobe-editing` (règles permanentes, lecture avant écriture, checkpoints). Pour la lisibilité des textes, les zones de sécurité et les sous-titres, charger aussi `titres-texte-sous-titres`. Pour le tracking, les masques et le fond vert, voir `after-effects-effets-video`.

**État des outils** : les outils `aeft_*` marqués `[existant]` pilotent After Effects (panneau Adobe MCP ouvert dans AE) : comps, calques, texte, formes, propriétés et images-clés avec easing, expressions (test puis pose), effets, précomposition, rendu, propriétés essentielles et export MOGRT. Ceux marqués `[prévu]` (animateurs de texte, purge…) se font à la main : décrire le plan, fournir les valeurs exactes et guider l'utilisateur pas à pas (section « Comment un humain le fait »). Les chemins de propriétés acceptent les noms anglais (`Transform.Position`) ou les matchNames (`ADBE Position`) : en cas de doute, lire l'arbre avec `aeft_get_comp {depth: 2}`.

## Quand utiliser ce skill

- Titre animé, lower third, carton, compteur, barre de progression, HUD (score, timer), notification, logo sting.
- Typographie cinétique : texte lettre par lettre, mot par mot, révélation, glitch, machine à écrire.
- Réglage d'une animation qui « fait raide » : easing, overshoot, décalages, flou de mouvement.
- Expressions : wiggle, boucle, compteur, lien entre propriétés, contrôles par curseur.
- Organisation d'une comp : précompositions, nulls, nommage.
- Création d'un MOGRT (Motion Graphics Template) à utiliser dans Premiere.
- Audit d'une animation existante (courbes, expressions cassées, projet désordonné).

Ne pas l'utiliser pour : montage de rushes (Premiere), étalonnage, mix audio, export final (voir les skills correspondants).

## Principes

### Mouvement et timing
1. **Jamais de keyframes linéaires pour un mouvement de titre ou d'objet.** Pourquoi : la vitesse constante paraît artificielle ; appliquer Easy Ease (F9) au minimum.
2. **Partir de la vitesse nulle, monter à un pic, redescendre** (courbe de vitesse en « colline »). Pourquoi : un objet réel ne passe pas instantanément de 0 à sa vitesse de croisière.
3. **Entrée = ease out (décélération), sortie = ease in (accélération), déplacement d'un point à un autre = ease in-out.** Pourquoi : l'œil lit l'objet qui arrive comme « freiné » et celui qui part comme « lancé ». Courbes Material de référence : `cubic-bezier(0,0,0.2,1)` entrée, `(0.4,0,1,1)` sortie, `(0.4,0,0.2,1)` standard.
4. **Entrée plus lente que sortie.** Pourquoi : le spectateur doit lire ce qui arrive, pas ce qui part. Repère UI : environ 225 ms en entrée, 195 ms en sortie sur mobile.
5. **Durées d'un élément graphique : 200 à 300 ms pour un petit élément, 400 à 500 ms pour un grand déplacement ou un rebond ; sous 200 ms le mouvement n'est plus perçu.** Pourquoi : repères issus du design d'interface, à convertir en images (à 30 i/s : 200 ms = 6 i, 500 ms = 15 i).
6. **Décaler les départs (2 à 4 images entre éléments voisins) plutôt que tout animer en même temps.** Pourquoi : des éléments qui démarrent et s'arrêtent ensemble donnent une impression rigide (repère pour la valeur en images).
7. **Un seul élément important bouge à la fois.** Pourquoi : si tout bouge, rien n'est mis en avant ; réserver 2 à 3 temps forts par séquence courte.
8. **Anticipation, dépassement, retour.** Un petit mouvement inverse avant l'action (1 à 2 px en interface, plus en motion pur) et un dépassement de la cible avant stabilisation donnent du poids.
9. **Overshoot sans image clé supplémentaire** : tirer la poignée d'entrée de la dernière keyframe au-delà de la valeur cible dans le graphe de valeur. Pourquoi : plus propre et plus modifiable que d'ajouter une keyframe.
10. **Les rebonds multiples demandent des keyframes (amplitudes et durées décroissantes) ou une expression.** Pourquoi : une seule courbe de Bézier ne peut pas osciller plusieurs fois.
11. **Trajectoires courbes (arcs) pour les objets qui se déplacent, lignes droites pour les éléments d'interface.** Pourquoi : le mouvement organique suit des arcs.
12. **Flou de mouvement activé sur tout ce qui bouge vite** (interrupteur du calque + interrupteur global de la comp). Angle d'obturateur proche de 180° pour un rendu caméra naturel ; plus haut = plus de traînée. Pourquoi : sans flou, les déplacements rapides scintillent.

### Structure et propreté
13. **Placer le point d'ancrage avant d'animer** position, échelle ou rotation (outil Pan Behind, touche Y). Pourquoi : c'est le pivot de toutes les transformations ; le corriger après coup décale l'animation.
14. **Nommer chaque calque, groupe de forme et animateur de texte.** Pourquoi : les projets non nommés sont impossibles à reprendre, par un humain comme par l'agent.
15. **Une animation décomposée en briques : un null parent pour le mouvement global, des calques enfants pour les détails.** Pourquoi : on peut ré-animer le global sans casser les détails.
16. **Précomposer pour regrouper, pas pour cacher.** Raccourci Ctrl/Cmd+Maj+C. Avec plusieurs calques, seule l'option « Déplacer tous les attributs » est disponible. Pourquoi : un masque ou un effet posé sur un groupe animé s'applique à tout le groupe.
17. **Formes avant images importées.** Les calques de forme (vectoriels) restent nets et éditables ; les groupes de forme isolent chaque sous-élément et son Trim Paths.
18. **Animer l'élément, pas la composition entière** : transformer le groupe de forme pour un sous-élément, le calque pour l'ensemble.

### Expressions
19. **Expression = dernier recours après les keyframes, sauf pour boucles, aléa, liens et compteurs.** Pourquoi : elles se recalculent à chaque image et alourdissent l'aperçu.
20. **Chaque calque calcule son propre résultat** (pas de chaîne `thisComp.layer(index-1)` qui dépend de tous les précédents). Pourquoi : le coût peut croître de façon explosive.
21. **Pas de `valueAtTime()` dans une boucle** sur une comp longue. Pourquoi : le coût croît avec la durée de la comp.
22. **Exposer les nombres variables dans des Contrôles d'expression** (curseur, case à cocher, couleur) plutôt que dans le code. Pourquoi : on règle et on anime sans éditer le script, et ces contrôles se relient aux propriétés essentielles.
23. **Tester avant d'appliquer** (`aeft_validate_expression`) : les causes d'erreur courantes sont une faute de frappe, un point-virgule oublié, un mauvais nom de calque, un type de propriété incompatible.

### Templates
24. **Exposer peu de contrôles dans un MOGRT** : texte, une couleur, éventuellement la position. Pourquoi : tout ce qui n'est pas ajouté au panneau reste verrouillé et un modèle simple se réutilise mieux.
25. **Prévoir la durée variable** (régions protégées d'intro et d'outro) pour que l'éditeur puisse étirer le titre sans casser les entrées et sorties.

## Procédures

### P1. Poser une animation de base (position, échelle, opacité)
Objectif : un élément qui entre, se stabilise, sort, avec un mouvement naturel.
1. Lire l'état : `aeft_get_comp {depth: 2, includeKeyframes: true}` [prévu].
2. Fixer le point d'ancrage (valeur de `Anchor Point`) au bon endroit avec `aeft_set_property` [existant] ou à la main (touche Y).
3. Poser 2 keyframes minimum (`aeft_set_keyframes` [existant]) : état initial hors champ / à 0 % d'opacité, état final. Entrée typique : 12 à 15 images à 30 i/s (repère), sortie : 8 à 10 images (repère).
4. Appliquer l'easing : `aeft_apply_ease {preset: "easeInOut"}` [prévu], ou en direct `KeyframeEase(0, 33.33333)` des deux côtés (équivalent exact de F9 ; 33 donne une courbe légèrement différente).
5. Ajuster dans le graphe de vitesse : pic proche de la fin d'une entrée (ease out fort : influence entrante élevée, sortante faible).
6. Ajouter dépassement ou rebond si le style le demande (P3).
7. Vérifier : `aeft_export_frame` [existant] à 3 instants (début, milieu de l'entrée, fin) et comparer. Prévoir aussi une image à mi-sortie.

### P2. Régler l'easing dans le graphe
Objectif : donner du caractère (vif, lourd, doux) sans keyframes en plus.
1. Sélectionner la propriété, ouvrir l'éditeur de graphes (Maj+F3).
2. Choisir le type de graphe : **vitesse** pour régler l'accélération, **valeur** pour le dépassement.
3. Les poignées n'existent que sur les keyframes Easy Ease, Ease In, Ease Out et Bézier ; Linear, Hold et Bézier automatique n'en ont pas.
4. Poignée plus longue = influence plus forte ; poignée orientée vers le haut = changement rapide.
5. Alt/Option + glisser sépare entrée et sortie ; Maj + glisser contraint l'angle ; Ctrl/Cmd + glisser garde la longueur.
6. Pour des valeurs exactes : clic droit sur la keyframe > Vitesse de keyframe, saisir vitesse et influence.
7. Pour l'axe X et Y séparés : clic droit sur Position > Séparer les dimensions.
8. Cacher un changement brutal à la vitesse maximale : copier l'animation sur un second calque légèrement décalé, F9, influence autour de 90 % des deux côtés, puis couper le calque au pic de vitesse.
Script (ExtendScript) : créer toutes les keyframes d'abord, puis appeler `setTemporalEaseAtKey` ; pour une propriété 2D/3D (Échelle), passer un `KeyframeEase` par dimension ; influence limitée à 0,1 à 100.

```js
// Easy Ease exact (F9) sur toutes les keyframes d'une propriété
// À lancer APRÈS la création de toutes les keyframes
var prop = app.project.item(1).layer(1).property("Scale"); // propriété ciblée
var ease = new KeyframeEase(0, 33.33333);                  // vitesse 0, influence 33,33333 %
var eases = [];
for (var d = 0; d < prop.value.length; d++) eases.push(ease); // un objet d'ease par dimension
for (var i = 1; i <= prop.numKeys; i++) {                  // les index de keyframes commencent à 1
  prop.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
  prop.setTemporalEaseAtKey(i, eases, eases);              // entrée et sortie
}
```

### P3. Dépassement et rebond
Objectif : un élément qui « arrive avec de l'énergie ».
1. **Dépassement manuel** : 3 keyframes, par exemple échelle 50 → 110 → 100, ou une seule paire de keyframes avec la poignée d'entrée relevée au-delà de la cible.
2. **Rebond manuel** : ajouter une keyframe de rebond (par exemple échelle 75), puis revenir à 100 ; répéter avec amplitudes et durées plus petites.
3. **Rebond par expression** (deux keyframes suffisent), sur la propriété animée :

```js
// Rebond inertiel : s'applique après la dernière keyframe de la propriété
amp = 0.1;      // amplitude du rebond (fraction de la vitesse d'arrivée), à régler à l'œil
freq = 3;       // oscillations par seconde (repère de départ : 3)
decay = 5;      // vitesse d'amortissement (repère de départ : 5)
n = 0;
if (numKeys > 0) {
  n = nearestKey(time).index;                 // keyframe la plus proche
  if (key(n).time > time) n--;                // on veut la précédente
}
if (n > 0) {
  t = time - key(n).time;                     // temps écoulé depuis la dernière keyframe
  v = velocityAtTime(key(n).time - thisComp.frameDuration / 10); // vitesse juste avant l'arrivée
  value + v * amp * Math.sin(t * freq * Math.PI * 2) / Math.exp(t * decay); // oscillation amortie
} else {
  value;
}
```
4. Garder `freq` et `decay` dans des curseurs d'expression pour pouvoir les animer.
5. Vérifications : la valeur finale doit être exactement la cible ; le dépassement ne doit pas faire sortir un élément du cadre ou de la zone de sécurité ; un frein trop faible (`decay` proche de 0) oscille indéfiniment.
6. Piège : sur des propriétés à keyframes « hold » (listes, modes), le rebond n'est pas visible.

### P4. Typographie cinétique avec les animateurs de texte
Objectif : texte qui entre lettre par lettre, mot par mot ou ligne par ligne.
1. Créer le calque de texte, finir police, taille, interlettrage, position avant d'animer (`aeft_set_text` [existant]).
2. Texte > Animer > choisir la propriété (Position, Opacité, Échelle, Rotation, Flou, Couleur de fond…). Renommer l'animateur selon son rôle (`entrée-position`).
3. Fixer l'état initial (les valeurs sont relatives à l'état normal) : par exemple Position Y = +60 px (repère), Opacité = 0 %.
4. Dans le sélecteur de plage, animer **Décalage** de -100 % à 0 % sur environ 1 s (ou **Fin** de 0 à 100 %). Chaque lettre passe ainsi de l'état initial à l'état normal l'une après l'autre.
5. Régler « Avancé » :
   - **Forme** : Carré (défaut) = lettre par lettre sans recouvrement, raide ; **Rampe vers le bas** ou **Rampe vers le haut** = recouvrement fluide. Avec Rampe vers le bas, finir le décalage à 100 % pour que tout arrive.
   - **Adoucissement haut** (Ease High) = ease in ; **bas** (Ease Low) = ease out. Les deux à 100 donnent un résultat instable ; 50/50 convient pour un retour après dépassement.
   - **Basé sur** : caractères, caractères sans espaces, mots, lignes.
   - **Ordre aléatoire** + **Valeur de départ aléatoire** pour un effet « scramble » ; changer la valeur de départ jusqu'à obtenir un motif convaincant.
6. Empiler des animateurs (position, puis un second avec léger dépassement, puis retour), décalés de 2 images environ pour le rebond. Trop d'animateurs écrase le timing.
7. Centrer le point d'ancrage par caractère (animateur « Point d'ancrage ») avant d'animer échelle ou rotation, sinon chaque lettre pivote autour de son coin.
8. Pour une alternance haut/bas : sélecteur d'expression, test du modulo sur `textIndex` (comparaison avec `==`), amplitude positive pour les index pairs, négative sinon. Mettre l'opacité dans un animateur séparé, sinon les lettres impaires n'atteignent jamais zéro.
9. Pour une vague : sélecteur **Ondulation** (Wiggly), fréquence pour la vitesse, corrélation haute = lettres synchrones, basse = indépendantes ; mode **Ajouter** pour cumuler avec une plage. Ne pas laisser le minimum négatif sur l'échelle.
10. Pour accentuer une portion sans animer : placer Début et Fin autour des caractères voulus et changer couleur, graisse ou taille.
11. Pour « machine à écrire » ou écriture au trait : voir P5 (Trim Paths) ou animer Fin avec une opacité 0 % / 100 % (sélecteur de plage, pas d'adoucissement).
12. Vérifier : `aeft_export_frame` à plusieurs instants, relire le texte entier à l'état final (rien ne doit rester décalé), contrôler le texte le plus long prévu.
Outil : `aeft_add_text_animator` [prévu]. Variation de longueur : le texte saisi dans le calque réutilise l'animation, étaler les keyframes si le texte s'allonge.

### P5. Calques de forme : barres, soulignements, lower third
Objectif : un lower third propre, animé, éditable.
1. Créer un calque de forme (outil Rectangle/Ellipse, rien de sélectionné) et le renommer. Dans **Contenu**, un groupe contient chemin (rectangle), remplissage, contour, modificateurs (Trim Paths, Répéteur) et sa propre transformation.
2. Ordre de rendu de haut en bas : un contour placé au-dessus d'un remplissage se dessine par-dessus.
3. Fond de bandeau : rectangle 500 × 120 px (exemple), arrondi 30 à 60 pour une pilule ; croissance depuis la gauche : point d'ancrage du groupe à X = -largeur/2, Y = 0, largeur animée de ~0-20 à 500.
4. Ligne qui se dessine : ajouter **Trim Paths** dans le groupe, animer **Fin** de 0 à 100 % (ou Début si la direction est mauvaise), bouts arrondis (Round Cap).
5. Texte qui sort de derrière une forme : forme rectangulaire en cache (track matte) du texte avec Alpha + Inversé, texte animé en Y qui monte, tient, redescend. Depuis la version 2023 le calque servant de cache n'a plus à être juste au-dessus.
6. Ajouter un null parent pour déplacer l'ensemble, puis `aeft_add_shape` [existant] pour les formes, `aeft_set_layer {parent}` [prévu] pour le lien.
7. Durée à l'écran d'un lower third : environ 3 à 6 s ; lire le texte à voix haute deux fois, il doit rester au moins aussi longtemps. Entrée et sortie courtes (voir P1).
8. Vérifier : image à la fin de l'entrée (texte entièrement lisible), image à mi-sortie, aucun débordement hors cache.

### P6. Expressions utiles (recettes)
Activer : Alt/Option + clic sur le chronomètre de la propriété. Lien automatique : lasso (pick whip). Toujours commenter le code.

```js
// 1. Tremblement : 2 fois par seconde, jusqu'à 50 px
wiggle(2, 50);

// 2. Boucle des keyframes existantes (cycle, pingpong, offset)
loopOut("cycle");

// 3. Compteur animé de a à b entre t0 et t1 (valeur entière)
t0 = 0; t1 = 2;                 // début et fin en secondes
a = 0;  b = 1250;               // valeurs de départ et d'arrivée
Math.round(ease(time, t0, t1, a, b)); // ease() = interpolation douce ; linear() pour constant

// 4. Rotation continue : 100 degrés par seconde
time * 100;

// 5. Variation par calque (décalage selon l'index)
delay = index * 0.1;            // 0,1 s de plus par calque
wiggle(2, 50, 1, 0.5, time - delay);

// 6. Lier une propriété à un curseur d'expression
effect("Slider Control")("Slider");

// 7. Suivre un autre calque avec décalage de 100 px
thisComp.layer("Calque 1").transform.position + [100, 0];

// 8. Boucle de wiggle sans raccord (durée dur en secondes)
freq = 4; amp = 50; dur = 2;
t = time % dur;                                   // temps cyclique
w1 = wiggle(freq, amp, 2, 1, t);                  // début du cycle
w2 = wiggle(freq, amp, 2, 1, t - dur);            // fin du cycle
linear(t, 0, dur, w1, w2);                        // fondu entre les deux : boucle parfaite
```
Autres : `smooth()` adoucit un mouvement existant (tracking compris) ; `thisComp.layer("X").position.wiggle(1,100)` applique un wiggle sur une autre propriété sans la modifier ; les marqueurs de comp peuvent piloter du texte (`comment`) ; les keyframes se lisent (`key(n).time`, `.value`, index à partir de 1) mais ne s'éditent pas par expression.
Procédure : `aeft_validate_expression` [existant] → `aeft_set_expression` [existant] → `aeft_export_frame` à deux instants → si l'expression doit durer, `aeft_bake_expression` [existant] la convertit en keyframes (plus rapide au rendu).

### P7. Précompositions et organisation
1. Sélectionner les calques liés, Ctrl/Cmd+Maj+C, nom descriptif (`LT_nom_bandeau`), « Déplacer tous les attributs ».
2. Quand précomposer : timeline encombrée, masque ou effet à appliquer à tout un groupe animé, élément réutilisé plusieurs fois, bloc à pré-rendre si lourd.
3. Ne pas précomposer un calque seul sans raison : on perd la lisibilité des keyframes.
4. Garder les nulls de contrôle dans la comp parente, les détails dans la précomp.
5. `aeft_precompose {layerIds, name, moveAttributes: true}` [prévu].
6. Vérifier : durée de la précomp égale à celle du contenu, aucun effet disparu (les effets d'un calque d'effet restent dans la précomp ; un calque d'effet ne s'applique pas aux calques de la précomp).
Organisation du projet : dossiers par type (comps, médias, précomps), comp et calques nommés, durée de comp réglée sur le contenu, zone de travail couvrant la partie à prévisualiser ou rendre.

### P8. Créer un MOGRT pour Premiere
Objectif : un titre éditable dans Premiere sans ouvrir After Effects.
1. Construire la comp (animations déjà au point). Prévoir la résolution et la cadence du projet cible.
2. Ouvrir **Fenêtre > Graphiques essentiels** (version 14.2 ou plus), choisir la comp principale, nommer le modèle.
3. « Solo des propriétés prises en charge » pour lister ce qui peut être exposé ; glisser dans le panneau : texte source, couleur, curseurs, cases à cocher, point 2D, échelle 2D, angle. Seules ces propriétés (champ de texte, sélecteur de couleur, curseur, case) sont exposables.
4. Renommer chaque contrôle pour l'éditeur ; ajouter des commentaires ; cocher police/taille/style dans « Modifier les propriétés » seulement si l'éditeur doit pouvoir les changer.
5. Utiliser des curseurs plutôt que des champs libres pour les nombres (pas de saisie hors limites).
6. Durée variable : **Composition > Conception réactive - Temps > Créer une intro** puis **Créer un outro**, tirer les poignées de la région protégée sur les keyframes d'entrée et de sortie. Noter la durée protégée dans un commentaire (Premiere ne l'affiche pas).
7. Définir l'image de référence (« Définir l'image d'affiche »), puis **Exporter le modèle de graphiques animés** : bibliothèque Creative Cloud, dossier local de modèles (apparaît tout de suite dans Premiere) ou disque.
8. Lire les avertissements d'export : polices absentes d'Adobe Fonts, besoin d'After Effects installé.
9. Tester dans Premiere : installer le .mogrt, le poser sur une piste, modifier chaque contrôle, étirer et raccourcir le clip.
10. Outils : `aeft_essential_props` [existant], `aeft_export_mogrt` [existant], puis `ppro_insert_mogrt` [existant].
Limites connues : les keyframes d'une propriété ne sont pas modifiables côté éditeur ; une liste déroulante exige des expressions ; un .mogrt ne s'importe pas dans After Effects (Fichier > Ouvrir le projet pour le dézipper) ; les modèles faits dans After Effects n'acceptent pas de média remplaçable aussi facilement que ceux faits dans Premiere ; ajouter le fichier .aegraphic quand on consolide un projet.

### P9. Boucles et animations en continu
1. Boucle simple : deux keyframes identiques (début/fin) puis `loopOut("cycle")`.
2. Mouvement continu : `time * vitesse`.
3. Wiggle bouclé : recette 8 de P6.
4. Vérifier : la dernière image doit être identique à la première (comparer deux `aeft_export_frame` aux instants 0 et durée - 1 image).

### P10. Rendu et contrôle
1. Prévisualiser en résolution réduite (moitié ou quart) ; repasser en pleine résolution avant le rendu ; effets lourds (flou, lueur) désactivés pendant la construction, réactivés ensuite.
2. Rendu en deux temps : maître sans perte (ProRes ou séquence d'images) depuis After Effects, puis encodage final (voir `export-livraison-workflow`). Une séquence d'images permet de reprendre un rendu interrompu.
3. `aeft_render_queue_add` puis `aeft_render` [existant] ; ou export direct `aeft_export_mogrt`.

## Paramètres de référence

### Durées et easing (repères pour des éléments graphiques)
| Cas | Durée | Courbe | Source du repère |
|---|---|---|---|
| Micro-interaction, petit élément | 150 à 300 ms | ease in-out | design d'interface |
| Grand déplacement, plein écran | 400 à 500 ms | ease in-out | design d'interface |
| Entrée d'un élément | ~225 ms (mobile) | ease out | Material 1 |
| Sortie d'un élément | ~195 ms (mobile) | ease in | Material 1 |
| Rebond ou élastique | 400 à 500 ms | personnalisée | design d'interface |
| Lower third à l'écran | 3 à 6 s (hors entrée/sortie) | — | guide de lower thirds |
| Écart de départ entre éléments | 2 à 4 images | — | (repère) |
| Écart entre keyframes d'un rebond | ~2 images, puis plus | — | tutoriel animateurs de texte |
| Vidéo explicative, réseaux sociaux | 15 à 45 s | — | article français |
| Vidéo explicative produit | 30 à 60 s | — | article français |

Durées d'interface (Material 1) : mobile ~300 ms (plein écran jusqu'à ~375 ms, au-delà de 400 ms trop lent), tablette +30 %, montre -30 %, bureau 150 à 200 ms. Ces valeurs viennent du design d'application : pour la vidéo, on peut aller plus lentement pour la lisibilité (repère).

### Interpolation
| Type | Raccourci / commande | Usage |
|---|---|---|
| Linéaire | clic droit > Interpolation de keyframe | vitesse constante voulue (rotation continue, compteurs) |
| Easy Ease | F9 | défaut pour presque tout |
| Easy Ease In / Out | Maj+F9 / Ctrl+Maj+F9 | un seul côté adouci |
| Bézier | éditeur de graphes | contrôle fin, dépassement |
| Hold | clic droit > Interpolation > Hold | changement instantané |
| `KeyframeEase(0, 33.33333)` | script | équivalent F9 |
| `KeyframeEase` influence | 0,1 à 100 | limites de l'API |

### Sélecteur de plage de texte
| Réglage | Valeur de départ | Effet |
|---|---|---|
| Forme | Rampe vers le bas | recouvrement fluide |
| Décalage | -100 % → 0 % (ou 0 → 100 %) en ~1 s | passage des lettres |
| Adoucissement haut / bas | 50 / 50 pour un retour après dépassement ; haut 100 pour ease in | éviter 100/100 |
| Basé sur | Caractères / Mots / Lignes | granularité |
| Wiggly : fréquence, corrélation | selon l'effet | vague synchrone ou aléatoire |
| Rotation par caractère 3D | par exemple 45° en X (exemple d'aide Adobe) | basculement |

### Flou de mouvement
| Réglage | Valeur | Remarque |
|---|---|---|
| Interrupteur calque + interrupteur global | les deux actifs | un seul ne suffit pas |
| Angle d'obturateur (Composition > Réglages > Avancé) | 180° | rendu caméra naturel ; 180 à 720 = plus de traînée |

### MOGRT
| Élément | Règle |
|---|---|
| Version minimale | After Effects 14.2 |
| Contrôles exposables | texte, couleur, curseur, case, point 2D, échelle 2D, angle |
| Nombre de contrôles | quelques-uns (texte, une couleur, position) |
| Durée variable | régions protégées intro/outro |
| Marge de titre (exemple de modèle) | 10 % de la largeur de comp (`thisComp.width/10`) |
| Poster frame | image la plus représentative |

### Performance
| Action | Gain |
|---|---|
| Mettre l'aperçu en demi ou quart de résolution | fluidité |
| Purger le cache régulièrement | évite erreurs et images fantômes |
| `posterizeTime(0)` dans une expression lourde (AE 2020+) | limite le nombre d'évaluations |
| Convertir en keyframes les expressions stables | aucun calcul au rendu |
| Médias MP4 lourds : transcoder en intermédiaire avant import | évite lenteurs et cadence variable |

## Erreurs fréquentes et comment les détecter

| Erreur | Symptôme | Détection / correction |
|---|---|---|
| Keyframes restées linéaires | mouvement mécanique | `aeft_get_comp {includeKeyframes}` : interpolation LINEAR sur Position/Échelle ; appliquer F9 |
| Point d'ancrage au centre par défaut | rotation ou échelle autour du mauvais point | image intermédiaire : le pivot doit être sur le bord ou le coin attendu |
| Tout démarre et s'arrête ensemble | rendu rigide | tracer les temps de départ : écarts nuls entre calques |
| Overshoot par keyframes en trop | courbe difficile à modifier | préférer poignée de Bézier |
| Forme du sélecteur laissée sur Carré | lettres sans recouvrement, saccadé | vérifier Forme et Décalage final à 100 % si Rampe |
| Adoucissement 100/100 | easing instable | passer à 50/50 |
| Hauts/bas inversés (haut = ease in, bas = ease out) | confusion des courbes | tester sur une image |
| Valeurs relatives non remises à zéro avant d'empiler un animateur | tout le texte se décale | comparer état final et état de départ |
| Minimum négatif sur échelle | texte inversé | Wiggly Min >= 0 |
| Opacité dans un animateur à sélecteur d'expression | lettres impaires visibles | animateur d'opacité séparé |
| Un seul interrupteur de flou activé | pas de flou | vérifier calque et comp |
| Index de keyframes à 0 en expression | erreur | les index commencent à 1 |
| Boucle d'expressions chaînées (`index-1`) | aperçu lent | colonne « Temps de rendu » du panneau Montage |
| Média MP4 variable importé tel quel | ralentissement, désynchro | transcoder en intermédiaire |
| Rendu direct en MP4 depuis l'AE | lent, plantages | maître intermédiaire puis encodage |
| Qualité d'aperçu restée au quart | rendu flou | contrôler avant rendu |
| Contrôle MOGRT oublié | texte non modifiable | tester chaque champ dans Premiere |
| Police absente d'Adobe Fonts | substitution chez l'éditeur | lire les avertissements d'export |
| Écrasement du fichier source par un rendu | perte de média | sortir toujours dans un dossier dédié |

## Contrôle qualité (avant de livrer)

- [ ] Aucune keyframe linéaire involontaire ; courbes de vitesse en « colline ».
- [ ] Entrées en ease out, sorties en ease in ; entrée plus lente que la sortie.
- [ ] Un seul mouvement principal à la fois ; départs décalés.
- [ ] Flou de mouvement actif (calque + comp) sur les éléments rapides.
- [ ] Texte lisible à l'arrêt pendant la durée minimale (3 à 6 s pour un lower third).
- [ ] Texte et éléments dans les marges de sécurité (voir `titres-texte-sous-titres`).
- [ ] Images exportées au début, à mi-entrée, à l'arrêt, à mi-sortie : conformes.
- [ ] Texte le plus long prévu testé ; texte vide ou court testé.
- [ ] Calques, groupes, animateurs et comps nommés ; pas de calque orphelin.
- [ ] Expressions sans erreur ; réglages exposés en curseurs.
- [ ] Cadence et résolution de la comp = cadence et résolution de la destination.
- [ ] Boucle : première et dernière image identiques (si boucle).
- [ ] MOGRT : contrôles renommés, durée variable testée en étirant, avertissements d'export lus, importé et testé dans Premiere.
- [ ] Rendu ou export dans un dossier dédié, source intacte.

## Comment un humain le fait dans After Effects

| Tâche | Menu / panneau / raccourci |
|---|---|
| Nouvelle comp | Ctrl/Cmd+N ; Composition > Nouvelle composition |
| Rendre une propriété animable | clic sur le chronomètre (U affiche les propriétés animées, UU les modifiées) |
| Position / Échelle / Rotation / Opacité | P / S / R / T |
| Point d'ancrage | outil Pan Behind (Y) ; propriété A |
| Easy Ease | F9 ; Maj+F9 (In) ; Ctrl/Cmd+Maj+F9 (Out) |
| Éditeur de graphes | Maj+F3 |
| Choisir graphe valeur ou vitesse | bouton « Choisir le type de graphe » en bas de l'éditeur |
| Vitesse exacte | clic droit sur keyframe > Vitesse de keyframe |
| Séparer X/Y | clic droit Position > Séparer les dimensions |
| Expression | Alt/Option + clic chronomètre ; lasso pour relier ; chevron pour le menu de fonctions |
| Contrôle d'expression | Effet > Contrôles d'expression > Curseur |
| Animer du texte | calque texte > Animer > choisir propriété ; Ajouter > Sélecteur ; sélecteur de plage > Avancé |
| Forme | outils Rectangle/Ellipse/Plume (G) ; Contenu > Ajouter > Trim Paths / Répéteur |
| Cache (track matte) | colonne Cache en regard du calque (Alpha, Alpha inversé…) ; touche F4 pour les colonnes Modes |
| Parentage | colonne Parent / lien |
| Calque d'effet | Calque > Nouveau > Calque d'effet (Alt+Cmd+Y sur Mac) |
| Précomposer | Calque > Précomposer ; Ctrl/Cmd+Maj+C |
| Flou de mouvement | icône des trois cercles sur le calque et sur la comp ; Composition > Réglages > Avancé (angle d'obturateur) |
| Aperçu RAM | barre d'espace ; barre verte = en cache |
| Graphiques essentiels | Fenêtre > Graphiques essentiels |
| Durée variable MOGRT | Composition > Conception réactive - Temps > Créer une intro / un outro |
| Export MOGRT | Graphiques essentiels > Exporter le modèle de graphiques animés |
| File de rendu | Composition > Ajouter à la file d'attente de rendu ; ou Media Encoder |
| Purge du cache | Édition > Purger |
| Réduire le projet | Fichier > Dépendances > Rassembler les fichiers / Réduire le projet |

## Sources

Aide et référence
1. Exemples et ressources d'animation de texte (aide Adobe FR) — https://helpx.adobe.com/fr/after-effects/desktop/animating-text/text-animation-examples/examples-resources-text-animation.html — rotation 3D par caractère, décalage de caractères, Wiggly, Approach.
2. Creating Motion Graphics templates in After Effects (blog Adobe) — https://blog.adobe.com/en/publish/2017/09/22/creating-motion-graphics-templates-in-adobe-after-effects — étapes d'export MOGRT, version 14.2, propriétés exposables.
3. After Effects Scripting Guide, KeyframeEase — https://after-effects-scripting-guide.readthedocs.io/other/keyframeease.html — constructeur, influence 0,1 à 100, un objet d'ease par dimension.
4. Discussion Adobe Community, Easy Ease par script — https://community.adobe.com/t5/after-effects/easy-ease-keyframe-temporal-interpolation-in-ae-scripting/m-p/10096539 — 33,33333 identique à F9, créer d'abord les keyframes.
5. Discussion Adobe Community, performance des expressions — https://community.adobe.com/t5/after-effects-discussions/do-expressions-use-caching-expression-performance-help/m-p/15548425 — références O(1), posterizeTime(0).
6. Discussion Adobe Community, durée variable MOGRT — https://community.adobe.com/questions-529/variable-duration-in-mogrt-step-by-step-guide-54570 — Conception réactive - Temps, régions protégées, curseurs en images.
7. Précomposition, imbrication, pré-rendu (aide Adobe) — https://helpx.adobe.com/ca/after-effects/desktop/work-with-compositions/precomposing-and-nesting/precomposing-nesting-pre-rendering.html — page non lisible automatiquement ; sert de renvoi pour l'utilisateur.
8. Expression examples (aide Adobe) — https://helpx.adobe.com/after-effects/desktop/work-with-expressions/expression-examples/expression-examples.html — renvoi de référence (page non lue automatiquement).

Tutoriels et blogs (EN)
9. School of Motion, Text Animators — https://www.schoolofmotion.com/blog/text-animators-after-effects — réglages Forme/Adoucissement/Décalage, erreurs d'empilement.
10. School of Motion, Expressions pour débuter — https://www.schoolofmotion.com/blog/after-effects-expressions-what-you-need-to-know-to-get-started — wiggle, time, index, loopOut, lasso.
11. School of Motion, Expressions (partie 1) — https://www.schoolofmotion.com/blog/everything-expressions-you-didnt-know-part-1 — smooth, clés 1-based, marqueurs.
12. School of Motion, expression de rebond — https://www.schoolofmotion.com/blog/after-effects-bounce-expression — paramètres élasticité, gravité, nombre de rebonds.
13. School of Motion, Précomposer — https://www.schoolofmotion.com/blog/precomposing-in-after-effects — raccourci, déplacer tous les attributs.
14. School of Motion, 3 conseils — https://www.schoolofmotion.com/blog/3-pro-tips-after-effects-beginners — F9, calque d'effet, masquer un changement brutal avec influence ~90 %.
15. Premium Beat, lettres individuelles — https://www.premiumbeat.com/blog/animate-individual-letters-in-after-effects/ — plusieurs sélecteurs par calque, Rampe.
16. Premium Beat, créer un MOGRT — https://www.premiumbeat.com/blog/create-motion-graphics-template-after-effects/ — étapes, limites (keyframes, polices).
17. Lester Banks, Offset dans les animateurs — https://lesterbanks.com/2022/08/how-to-better-animate-type-using-offset-in-after-effects/ — confirme l'usage de l'Offset (page courte).
18. Free Visuals, sélecteur de plage — https://www.freevisuals.net/post/after-effects-range-selector — Randomize Order, Wiggly, accentuation.
19. AEJuice, éditeur de graphes — https://aejuice.com/blog/how-to-use-graph-editor-in-after-effects/ — valeur vs vitesse, F9, poignées.
20. MTMograph, éditeur de graphes — https://mtmograph.com/blogs/tools/how-to-use-the-graph-editor-in-after-effects — poignées, vitesse en colline, séparer les dimensions.
21. MTMograph, rebond et overshoot — https://mtmograph.com/blogs/tools/the-bounce-and-overshoot-animation-trick-every-motion-designer-should-know — freq/decay, keyframes Linear.
22. Pixel Bakery, Trim Paths et texte — https://pixelbakery.com/recipes/trim-paths-animate-text — écriture au trait avec cache Alpha inversé.
23. Cursa, calques de forme — https://cursa.app/en/page/after-effects-for-absolute-beginners-shape-layers-for-clean-editable-motion-graphics — groupes, arrondis, ancre, Trim Paths.
24. Photofocus, wiggle bouclé — https://photofocus.com/video/looping-wiggle-in-after-effects/ — recette de boucle.
25. Filmdaft, guide MOGRT — https://filmdaft.com/how-to-create-a-mogrt-file-in-adobe-after-effects-illustrated-guide/ — cache de piste, types de propriétés, limites.
26. Frame.io, panneau Graphiques essentiels — https://blog.frame.io/2019/03/11/premiere-pro-essential-graphics-panel/ — exposer peu, avertissements d'export, .aegraphic.
27. Spotlight FX, flou de mouvement — https://spotlightfx.com/blog/how-to-add-motion-blur-in-after-effects-3-easy-steps — double interrupteur, angle 180°.
28. Juno School, animation « robotique » — https://junoschool.pages.dev/article/after-effects-animation-looks-robotic-fix/ — F9, ancre, décalages, précomposer.
29. Adobe Creative Cloud, principes d'animation — https://www.adobe.com/in/creativecloud/roc/blog/video/animation-principles.html — application des principes dans After Effects.
30. Jake in Motion, principes pour motion designers — https://jakeinmotion.com/animation-principles-for-motion-designers — espacement, chevauchement.
31. Epidemic Sound, lower thirds — https://www.epidemicsound.com/blog/lower-thirds/ — 3 à 6 s, position, éviter le regard.

Design d'interface (repères de durée)
32. Material Design 1, durée et easing — https://m1.material.io/motion/duration-easing.html — durées par appareil, courbes standard/décélération/accélération.
33. Val Head, durées d'animation d'interface — https://valhead.com/?p=2978 — 200 à 500 ms, rebond 400 à 500 ms.

Français
34. 75 Secondes, 8 principes du motion design — https://www.75secondes.fr/?p=171782 — slow in/out, un mouvement à la fois, durées de format.
35. Elephorm, Maîtriser les expressions — https://www.elephorm.com/formation/after-effects-2025-les-fondamentaux-du-motion-design/maitriser-les-expressions-dans-after-effects — wiggle, time, loopOut.
36. Elephorm, Animer un texte (principes) — https://www.elephorm.com/formation/apprendre-after-effects-2026-les-fondamentaux/animer-un-texte-dans-after-effects-principes-fondamentaux — animateurs, sélecteur de plage, propriétés.

Forums et communauté
37. Creative COW, optimiser les expressions — https://creativecow.net/forums/thread/tips-to-optimize-your-expressions-which-expressi/ — éviter chaînes, valueAtTime en boucle, convertir en keyframes.
38. Reddit r/AfterEffects, conseils aux débutants — https://reddit.birdcat.cafe/r/AfterEffects/comments/12pqw6f/things_about_after_effects_for_the_newbie_an — performance, maître intermédiaire, MP4 à transcoder.
