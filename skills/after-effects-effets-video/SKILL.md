---
name: after-effects-effets-video
description: Appliquer des effets sur de la vidéo réelle dans After Effects et faire l'aller-retour avec Premiere Pro (Dynamic Link). À charger pour : coller un élément sur un visage ou un objet (tracking, suivi de masque, caméra 3D, Mocha), grosse tête / déformation / caricature, détourage (Roto Brush), fond vert (Keylight), effets de style (Glow, Cartoon, Posterize Time), compositing (modes de fusion, track mattes, ombres, grain), stabilisation (Warp Stabilizer), ralenti (Timewarp, Pixel Motion), nettoyage (Remove Grain, Content-Aware Fill), « Remplacer par une composition After Effects », Render and Replace.
---
# After Effects — effets sur vidéo réelle, compositing et flux Dynamic Link

## Quand utiliser ce skill
- L'utilisateur veut un effet que Premiere ne fait pas bien : coller un objet sur une tête, déformer un visage, détourer, incruster un fond vert, stabiliser fort, ralentir proprement, effacer un objet.
- Un plan de la timeline Premiere doit passer dans After Effects puis revenir, sans casser le montage.
- Compléter `adobe-editing` (règles permanentes, checkpoints) : ce skill ne les répète pas, il les suppose chargées.
- Détails de paramètres (tableaux complets) : `references/parametres-effets.md`.

Rappel sur les outils : tous les `aeft_*` et `ppro_replace_with_ae_comp` / `ppro_import_ae_comp` sont **[prévu]**. En phase 1, seuls `ppro_get_sequence`, `ppro_cut_at`, `ppro_import_media`, `ppro_export_frame`, `ppro_checkpoint`/`ppro_rewind` sont **[existant]**. Les analyses lourdes (Track Motion, Roto Brush, Content-Aware Fill) se lancent dans l'interface : l'agent prépare, l'humain clique « Analyser », l'agent relit et termine.

## Principes
1. **Un seul plan isolé par comp AE.** Couper le plan dans Premiere avant de l'envoyer (`ppro_cut_at`) : la comp liée hérite de la durée du clip, et un tracking court dérive moins.
2. **Mêmes versions de Premiere et d'After Effects**, sinon Dynamic Link ne fonctionne pas (aide Adobe).
3. **Le .aep ne bouge plus** une fois lié : le déplacer met la comp hors ligne dans Premiere.
4. **Enregistrer les deux projets** avant de fermer : Premiere affiche les changements AE même non enregistrés, ils seraient perdus.
5. **Dynamic Link pour les comps courtes et retouchées souvent ; export pour tout le reste.** Les monteurs expérimentés rendent le plan terminé et le remplacent dans Premiere : moins de charge machine, playback fiable.
6. **Render and Replace avant de monter dessus** : une comp liée affiche une barre rouge (pas de cache) ; une fois rendue (QuickTime ProRes/CineForm), la barre passe jaune et le plan lit en temps réel. Après rendu, les modifs AE ne remontent plus tant qu'on ne restaure pas.
7. **Un point de suivi = position ; deux = échelle + rotation ; quatre = corner pin.** Choisir le type avant de poser les points.
8. **Zone de recherche = déplacement entre deux images, pas sur tout le plan.** Petite zone = analyse rapide ; trop petite = l'élément en sort et le suivi décroche.
9. **Appliquer un suivi sur un calque nul, puis parenter.** On peut ensuite décaler, mettre à l'échelle ou remplacer l'élément sans refaire le suivi.
10. **Caméra 3D : erreur moyenne proche de 0 px ; 0,7 px est bon, au-delà de 1 px le texte glisse** (tutoriel VFX). Supprimer les points sur les objets mobiles, garder ≥ 3 points dans le même plan.
11. **Suivi qui dérive : revenir à la dernière image juste, ajuster la zone, relancer** ; ne jamais laisser filer puis corriger à la main.
12. **Détourage : un trait au milieu du sujet, jamais sur le bord.** Le moins de traits possible, puis corriger à la première image qui décroche. Geler (Freeze) seulement quand le matte est final.
13. **Clé : échantillonner la couleur d'écran d'abord, Gain et Balance ensuite, Clip Black/White après, le reste en dernier.** Tout dépend du premier choix. Vue Screen Matte ou Status pour juger, pas Final Result.
14. **Screen Gain reste près de 100** (105–112 au maximum) : à 150 les cheveux disparaissent et le fond transparaît. Nettoyer les bords avec Clip, Shrink/Grow (−0,5 à −1), pas avec le gain.
15. **Plus la caméra est mauvaise, plus il faut de réglages** : environ un tiers des contrôles pour du 10 bits pro, la moitié pour une caméra grand public, presque tous pour un téléphone.
16. **Stabiliser en premier, effets après** ; le clip doit avoir la taille de la comp (sinon précomposer) et ne pas être ralenti/accéléré, sinon Warp Stabilizer refuse.
17. **Méthode la plus simple qui marche** : Subspace Warp par défaut, mais s'il « gondole », descendre vers Position, Échelle, Rotation puis Position.
18. **Ralenti : tourner à ≥ 50 fps pour un demi-vitesse** ; sous 24 images réelles par seconde, ça saccade. Pixel Motion lisse mais rend lentement et crée des bavures sur les croisements d'objets.
19. **Timewarp : Speed 50 = vitesse normale, 25 = moitié.** Les keyframes de Speed font la rampe.
20. **Grain : échantillonner sur une zone unie (ciel, mur), jamais sur un bord ou un dégradé** ; juger la perte de netteté sur un visage ou du texte.
21. **Effacement d'objet : enlever séparément la personne et son ombre**, masque petit, suivi de masque d'abord. Démarrer Lighting Correction à Strong et redescendre si ça scintille.
22. **Compositer = faire croire** : ombre portée, grain assorti (Match Grain), flou de bougé cohérent (Shutter Phase = −½ × Shutter Angle sur l'élément collé), bords adoucis de 1–2 px.
23. **Track matte : la source peut être n'importe quel calque de la pile** (AE 2023+) ; la vidéo du matte s'éteint seule. Luma matte = contraste fort (Levels).
24. **Vérifier au moins trois images (début, milieu, fin)** par `aeft_export_frame` après chaque étape de suivi ou de clé ; une dérive se voit en comparant deux images, pas une.
25. **Imbrication inter-applications : un seul niveau.** Une comp AE dans une séquence Premiere qui est elle-même dans AE apparaît comme un simple espace réservé.

## Procédures

### P1. Envoyer un plan dans After Effects (Dynamic Link) et revenir
Objectif : retoucher un plan dans AE sans le réexporter à chaque fois.
1. `ppro_get_sequence` [existant] : repérer le clip, sa durée, ses pistes. Isoler : `ppro_cut_at` [existant] aux bornes si le clip est trop long. `ppro_checkpoint {label:"vers-ae"}` [existant].
2. `ppro_replace_with_ae_comp {clipIds}` [prévu] (ou l'humain : clic droit > Remplacer par une composition After Effects). Premiere ouvre AE s'il est fermé, crée une comp liée aux réglages de la séquence, nommée « <projet> Linked Comp N », et remplace le clip par un média lié (icône dédiée). Si AE demande d'enregistrer : enregistrer le .aep à côté du projet Premiere, dans un dossier qui ne bougera plus.
3. `aeft_get_comp` [prévu] : vérifier que la comp contient bien le métrage (bug connu en 25.6 : comp vide ; correctif 25.6.1 ; sinon relancer après avoir tué le processus DynamicLinkManager).
4. Travailler dans AE (P3 à P14). `aeft_save_project` [prévu].
5. Retour Premiere : la timeline reflète la comp automatiquement ; Premiere jette ses prévisualisations précédentes du clip. Pour rouvrir plus tard : sélectionner le clip > Edit > Edit Original.
6. Lecture saccadée ? `ppro_export_range` [prévu] n'est pas nécessaire : clic droit sur le clip > Render and Replace (Source : clips individuels ; Format : QuickTime ; preset ProRes ou CineForm ; destination à côté des médias). Pour reprendre la modification : Clip > Restore Unrendered (repère).
Vérifier : `ppro_export_frame` [existant] à trois instants et comparer avec `aeft_export_frame` [prévu] aux mêmes temps.

Limites connues : versions différentes = pas de lien ; renommer la comp dans AE ne renomme pas l'élément dans Premiere (le lien tient) ; une comp peut être liée plusieurs fois ; comp liée créée depuis Premiere via File > Adobe Dynamic Link > New After Effects Composition = 30 s par défaut (Composition > Composition Settings pour changer) ; Dynamic Link est gourmand et parfois instable sur les projets lourds.

### P2. Alternative : exporter puis importer
Objectif : même résultat, sans lien vivant. À préférer pour les comps longues, lourdes (Roto Brush, Content-Aware Fill) ou livrées.
1. Premiere : `ppro_export_range {start, end, preset: intermédiaire}` [prévu] avec poignées de 1–2 s (repère), ou l'humain exporte le sous-clip avec « Importer dans le projet ».
2. AE : `aeft_import {paths}` [prévu] → `aeft_create_comp {fromFootage}` [prévu] → effets.
3. `aeft_render_queue_add {outputModule: "ProRes 4444"/"PNG séquence" si alpha}` [prévu] → `aeft_render` [prévu].
4. Premiere : `ppro_import_media {paths}` [existant] → `ppro_insert_clip {mode:"overwrite"}` [prévu] au même temps, même piste, ou l'humain : clic droit > Remplacer le métrage.
Vérifier : durée identique à l'original (`ppro_get_sequence`), pas de trou ni de décalage audio.

### P3. Coller un élément sur un visage ou un objet (Track Motion)
Objectif : un PNG, un texte ou une comp suit un point du plan.
1. `aeft_get_comp` [prévu]. Regarder tout le plan (`aeft_export_frame` ×3) : la cible doit rester visible, contrastée, de forme stable.
2. `aeft_add_layer {type:"null", name:"TRK"}` [prévu]. Importer l'élément (`aeft_import`) et `aeft_set_layer {parent:"TRK"}`.
3. Humain : Window > Tracker > Track Motion sur le métrage ; Track Type « Transform » ; cocher Position (+ Rotation/Scale si deux points). Zone de forme serrée sur le détail, zone de recherche de la taille du déplacement image à image. Déplacer le point d'attache si l'élément doit être décalé (ex. au-dessus de la tête). Analyze Forward. Si dérive : revenir à la dernière bonne image, replacer, relancer. Edit Target → nul TRK → Apply (X and Y).
4. `aeft_get_property {layerId:"TRK", path:"Transform.Position"}` [prévu] : vérifier qu'il y a des keyframes sur toute la durée, sans saut > quelques px entre deux images (repère : un saut net = décrochage).
5. Positionner l'élément par rapport au nul (`aeft_set_property Transform.Position` sur l'élément, pas sur le nul). Flou de bougé : activer `motionBlur` et Shutter Phase = −½ × Shutter Angle (repère : 180° → −90).
Deux points (rotation/échelle) : les placer de part et d'autre du même objet, le plus loin possible. Corner pin : les quatre zones dans un même plan réel.
Vérifier : `aeft_export_frame` à 3–5 instants, l'élément ne glisse pas par rapport au détail suivi.

### P4. Suivi de masque (flouter un visage, préparer un effacement)
1. `aeft_set_mask {layerId, path: contour large autour de la cible, feather}` [prévu] — ou l'humain dessine au stylo.
2. Humain : clic droit sur le masque > Track Mask ; méthode Position (+ Scale, + Rotation, + Skew, Perspective) selon ce que fait l'objet ; Analyze. Le suivi écrit des keyframes sur Mask Path.
3. Flou : `aeft_apply_effect {effect:"Gaussian Blur" ou "Mosaic"}` [prévu] sur une copie du calque masquée, au-dessus de l'original.
4. Pour Content-Aware Fill : mode du masque = Subtract (voir P14).
Vérifier : `aeft_export_frame` ×3 ; le masque couvre encore la cible en fin de plan.

### P5. Caméra 3D (texte au sol, objet posé dans la scène)
1. Pré-requis : calque à la taille de la comp, transformations par défaut, caméra qui se déplace (parallaxe). Un pano sur pied → Solve Method « Tripod Pan ».
2. `aeft_apply_effect {effect:"3D Camera Tracker"}` [prévu] (l'analyse puis la résolution tournent en arrière-plan) ou l'humain : Animation > Track Camera.
3. Lire Average Error dans Advanced : viser < 1 px. Si « Solve failed » : cocher Detailed Analysis ; si toujours : couper le plan plus court.
4. Humain : supprimer les points sur les objets mobiles (Auto-delete Points Across Time), sélectionner ≥ 3 points sur la surface voulue, clic droit > Set Ground Plane and Origin, puis Create Text/Solid/Null and Camera. Create Shadow Catcher crée un solide blanc « accepte les ombres ».
5. Agent : `aeft_set_layer {parent: nul créé, is3D: true}` sur l'élément ; `aeft_set_property Transform.Orientation` pour le redresser (le texte créé est à plat).
Vérifier : `aeft_export_frame` ×3 ; le texte ne « recule » pas quand la caméra avance. S'il glisse : points sur un autre plan, ou erreur > 1 px → refaire avec Detailed Analysis.

### P6. Mocha AE (suivi planaire, surfaces, écrans)
1. Humain : Effect > Boris FX Mocha > Mocha AE (ou Animation > Track in Boris FX Mocha) ; cliquer le logo pour ouvrir l'interface ; dessiner une spline sur une surface plane et texturée, Track Forward.
2. Export : Effect Controls > Tracking Data > Create Track Data ; Export Option « Corner Pin » (écran, affiche) ou « Transform » (position/échelle/rotation sur un nul).
3. Masques : « Create AE Masks » (ignore le contour adouci) ou « Apply Matte » (respecte le contour adouci).
Mocha AE ne résout pas de caméra (réservé à Mocha Pro).

### P7. Grosse tête, déformation, caricature
Objectif : agrandir ou déformer une partie du visage, qui suit le mouvement.
Trois approches, de la plus simple à la plus fine :
- **Duplication + masque (repère)** : dupliquer le calque, masque ovale sur la tête avec contour adouci 20–40 px, `aeft_set_property Transform.Scale` 120–140 % avec point d'ancrage au centre de la tête, parent = nul suivi (P3). Le plus robuste, bords propres.
- **Bulge** : `aeft_apply_effect {effect:"Bulge", params:{Horizontal Radius, Vertical Radius, Bulge Height (+ bombe vers le spectateur, − creuse), Taper Radius 0 = bosse raide}}` ; `aeft_set_expression` sur Bulge Center vers la position du nul suivi (repère : `thisComp.layer("TRK").transform.position`). Antialiasing n'agit qu'en qualité Best. CC Lens (Center, Size, Convergence) donne l'effet « fisheye » (repère).
- **Mesh Warp / Liquify** : déformation libre. Mesh Warp : grille jusqu'à 31×31 ; chaque case est une frontière, les pixels ne la franchissent pas ; Shift-clic pour plusieurs sommets ; Distortion Mesh s'anime. Liquify : outils Warp, Bloat (gonfle), Pucker (pince), Twirl ; Freeze Area Mask protège une zone ; Distortion Percentage s'anime pour monter/descendre l'effet. Ni l'un ni l'autre ne suit un mouvement : précomposer après stabilisation (P12, Objective « Reversible »/ stabiliser puis re-shaker, repère) ou limiter à un plan quasi fixe.
- **Transform (effet)** : échelle/rotation/skew avec son propre point d'ancrage et son angle d'obturateur ; utile pour animer une seule zone sans toucher aux transformations du calque (repère).
Vérifier : `aeft_export_frame` sur une image de mouvement rapide : bords de la zone déformée sans « marche », pas de pixels du décor entraînés.

### P8. Détourer une personne (Roto Brush)
1. Humain : double-clic sur le calque (panneau Calque) ; Alt+W (Roto Brush, version 3.0 par défaut) ; choisir une image de base où le sujet est entier ; Ctrl-glisser pour la taille de brosse ; un trait au milieu du sujet ; Alt+trait pour retirer.
2. Espace pour propager ; corriger sur la première image qui décroche (trait + ou −). Un trait hors de l'intervalle crée une nouvelle image de base.
3. Bords fins (cheveux) : Refine Edge Tool (Alt+W pour cycler) sur les bords seulement.
4. Agent : `aeft_set_property` [prévu] sur Roto Brush Matte : Feather (adoucit), Contrast, Shift Edges (+ élargit, − réduit), Reduce Chatter (bord qui tremble). Si bords mauvais : Enable Classic Controls, Edge Detection « Favor Predicted Edges » quand sujet et fond ont la même couleur.
5. Freeze quand c'est final : le cache (barres violettes) est enregistré avec le projet ; nouveaux traits ignorés tant que gelé.
Vues : Alt+4 alpha, Alt+5 contour, Alt+6 recouvrement. Le sujet doit rester dans la boîte verte « Search Radius ».
Vérifier : `aeft_export_frame` sur fond uni contrasté, début/milieu/fin ; chercher trous, bavures, bord qui clignote.

### P9. Fond vert (Keylight)
1. Masque poubelle d'abord (`aeft_set_mask`) : enlever pieds de projecteur, bords d'écran.
2. `aeft_apply_effect {effect:"Keylight (1.2)"}` [prévu] ; Screen Colour : humain à la pipette sur le fond près du visage (ou `params:{Screen Colour}` depuis une image exportée, repère). Vue → Screen Matte.
3. Screen Gain 100 (≤ 110) ; Screen Balance ≈ 50 vert / ≈ 95 bleu, tester 5/50/95.
4. Clip Black ↑ jusqu'à fond noir (15–20), Clip White ↓ jusqu'à sujet blanc (60–70) ; Clip Rollback 2–3 si les bords s'érodent ; Screen Shrink/Grow −0,5 à −1 ; Screen Softness 1 ; Despot Black/White 1–2.
5. Despill Bias : pipette sur une peau sans reflet. Vue Final Result sur fond de couleur vive puis Alt+4 (alpha).
6. Clé difficile : trois passes — Core (Clip White bas, Shrink +), Edge (seul calque réglé finement), Background (Clip Black haut) assemblés en Stencil/Silhouette Alpha.
Vérifier : `aeft_export_frame` sur solide rouge et sur le vrai fond ; pas de liseré sombre, pas de vert sur la peau, cheveux présents.

### P10. Effets de style
- **Glow** : Glow Threshold (% de luminosité sous lequel rien ne brille, bas = plus de glow), Glow Radius (px), Glow Intensity ; Composite Original « On Top » ; projet 32 bpc = glows plus réalistes.
- **Cartoon** : Render « Fill » d'abord, puis « Fill & Edges » ; Detail Radius/Threshold (plus haut = plus simple) ; Shading Steps = niveaux d'aplat ; Edge Width/Softness/Opacity ; pour le rendu « dessin animé », ajouter Posterize Time (Effect > Time) à 12 fps (repère) ou baisser la cadence.
- **Find Edges** : Invert (traits clairs sur noir), Blend With Original pour doser ; 8 bpc seulement.
- **Posterize Time** : Frame Rate (défaut 24, repère) ; l'appliquer en dernier ou sur un calque d'effets (repère).
- **CC Vector Blur** : Type « Natural », Amount, Vector Map = le calque lui-même ; effet « peinture qui coule » (repère).
- **Turbulent Displace** : Amount, Size, Complexity, Evolution ; animer Evolution (`time*60`, repère) pour un bord qui ondule ; Pinning « All Edges » pour garder le cadre.
Appliquer sur un calque d'effets (`aeft_add_layer {type:"adjustment"}`) pour toucher tous les calques dessous.

### P11. Compositing : fusion, mattes, ombres, grain
1. `aeft_set_layer {blendMode}` [prévu] : Screen/Add pour fumée, lumière, particules sur fond noir ; Multiply pour ombres et textures ; Stencil Alpha / Silhouette Alpha pour découper tout ce qui est dessous.
2. Track matte : `aeft_set_layer {trackMatte:{layer, type:"alpha"|"luma", invert}}` [prévu] ; luma = pousser le contraste du matte avec Levels ; parenter le matte au calque pour qu'il le suive ; précomposer les deux s'ils doivent partager les réglages.
3. Ombre portée d'un élément collé (repère) : dupliquer, `Fill` noir, `Transform.Scale` [100, −60], skew ou rotation vers la source de lumière, Gaussian Blur 10–30 px, opacité 30–50 %, Multiply.
4. Grain : `aeft_apply_effect {effect:"Match Grain", params:{Noise Source Layer: le plan}}` sur l'élément incrusté ; vue Final Output à la fin.
5. Bords : Shift Edges −0,5 à −1 px et Feather 1–2 px (repère) sur tout élément détouré.
Vérifier : `aeft_export_frame` → l'élément a la même netteté, le même grain et la même direction d'ombre que le plan.

### P12. Stabilisation (Warp Stabilizer VFX)
1. Clip à la taille de la comp, pas de time-stretch ; sinon `aeft_precompose` [prévu].
2. `aeft_apply_effect {effect:"Warp Stabilizer VFX"}` [prévu] (l'analyse démarre d'elle-même : bannières « Analyzing » puis « Stabilizing ») ou Premiere : `ppro_stabilize` [prévu].
3. Défauts : Result Smooth Motion, Smoothness 50 %, Method Subspace Warp, Framing « Stabilize, Crop, Auto-scale ». Première passe conseillée : Smoothness 100 % puis descendre.
4. Si gondolement : Method → Position, Scale, Rotation → Position. Si trop de zoom : Crop Less ↔ Smooth More de 50 % vers le bas par pas de 10 ; ou Framing « Synthesize Edges » (Smoothness bas, Synthesis Input Range ↑ si bords restent, Edge Feather ↑ si raccord visible).
5. Jello/rolling shutter (DSLR) : Rolling Shutter Ripple → Enhanced Reduction (Perspective ou Subspace seulement). Résultat bof : Detailed Analysis.
6. No Motion seulement si le sujet reste cadré du début à la fin.
Vérifier : `aeft_export_frame` ×3 : pas de bord noir, zoom raisonnable (Maximum Scale 150 % par défaut, repère), pas d'arrière-plan qui « respire ».

### P13. Ralenti (Time Stretch, Time Remap, Timewarp)
1. Cadence source : `aeft_list_items` [prévu] → si 50/60 fps dans une comp 24/25, ralenti ×2 propre ; alternative sans effet : Interpret Footage > Conform to frame rate 24.
2. Simple : Layer > Time > Time Stretch, Stretch Factor 200 % = moitié ; ou `aeft_time_remap {keyframes}` [prévu] (Layer > Time > Enable Time Remapping) pour une rampe.
3. Lissage : switch Frame Blending du calque + bouton de comp ; Frame Mix (rapide, fondu) ou Pixel Motion (lent, lisse). Qualité Best. Ne se met pas sur une précomp entière : l'activer sur les calques à l'intérieur.
4. Rampe fine : `aeft_apply_effect {effect:"Timewarp", params:{Method:"Pixel Motion", Speed:50}}` puis `aeft_set_keyframes` sur Speed (50 → 25 → 50) avec ease ; Tuning : Vector Detail ↑ et Smoothing si bavures (repère). Flou : Pixel Motion Blur (Effect > Time), Shutter Control manuel.
Vérifier : `aeft_export_frame` sur un croisement d'objets (mains, bords) : pas de déchirure ; sinon Frame Mix ou tourner plus vite.

### P14. Nettoyage : Remove Grain, Content-Aware Fill
Remove Grain : `aeft_apply_effect {effect:"Remove Grain"}` ; Viewing Mode Preview (zone 200×200 px à déplacer sur une zone bruitée unie) ; échantillons 24×24 px pris à l'image 0 (Source Frame pour changer), sur ciel/mur, jamais sur bords ; précomposer si le calque a déjà des effets (ils sont ignorés) ; Noise Reduction + passes, Temporal Filtering (repère) ; Final Output à la fin ; vérifier visage/texte.
Content-Aware Fill :
1. Masque Subtract sur l'objet avec marge, suivi de masque (P4). Personne et ombre = deux masques.
2. Window > Content-Aware Fill ; Alpha Expansion léger ; Fill Method : Object (objet mobile), Surface (tache sur surface plane), Edge Blend (texte sur fond uni, le plus rapide) ; Range Work Area ; Lighting Correction Strong → baisser si scintillement.
3. Si résultat sale : Create Reference Frame → correction dans l'éditeur d'image → Save (pas Save As) → Generate Fill Layer de nouveau. Plusieurs références si la lumière change.
4. Generate Fill Layer : séquence PNG/EXR dans un dossier « Fills » à côté du projet ; l'image sous la tête de lecture sort en premier pour juger vite. 4K dans une comp HD : transcoder avant. Panel menu > Delete Unused Fill Footage.
Vérifier : `aeft_export_frame` ×3 ; pas de « tache » qui flotte, pas de bord de masque visible.

## Paramètres de référence
| Sujet | Valeur par défaut | Plage utile | Note |
|---|---|---|---|
| Comp liée créée depuis Premiere | 30 s | — | Composition Settings pour ajuster |
| Render and Replace | QuickTime ProRes / CineForm | — | barre rouge → jaune |
| Track Motion : points | 1 pos. / 2 échelle+rot. / 4 corner pin | — | 3 pour parallel corner pin |
| Confiance tracker | 80 % (repère) | 60–90 (repère) | Stop / Extrapolate / Adapt |
| Caméra 3D : Average Error | 0 = parfait | < 1 px ; 0,7 bon | > 1 px : glisse |
| Keylight Screen Gain | 100 | 100–110 | 150 = bords érodés |
| Keylight Screen Balance | auto | 50 vert / 95 bleu | tester 5, 50, 95 |
| Keylight Clip Black / White | 0 / 100 | 15–20 / 60–70 | Rollback 2–3 |
| Keylight Shrink/Grow | 0 | −1 à −0,5 | Softness 1, Despot 1–2 |
| Roto Brush | version 3.0 | — | Freeze = cache violet |
| Warp Stabilizer Smoothness | 50 % | 5–100 % | > 100 % = recadrage fort |
| Warp Stabilizer Method | Subspace Warp | → PSR → Position | Perspective = keystoning |
| Warp Stabilizer Crop Less/Smooth More | 50 % | descendre par 10 | — |
| Warp Stabilizer Max Scale / Safe margin | 150 % / 5 % (repère) | — | — |
| Timewarp Speed | 50 = ×1 | 25 = ×0,5 | Method Pixel Motion |
| Time Stretch | 100 % | 200 % = ×0,5 | Frame Blending ON |
| Cadence de tournage pour ralenti ×2 | — | ≥ 50 fps | 24/30 fps = saccadé |
| Remove Grain preview / échantillon | 200×200 px / 24×24 px | — | image 0 par défaut |
| Content-Aware Fill Lighting | — | Strong → Moderate → Subtle | scintillement = baisser |
| Mesh Warp grille | 7×7 (repère) | ≤ 31×31 | Quality ↑ = rendu lent |
| Posterize Time | 24 fps (repère) | 8–15 pour cartoon (repère) | — |
| Displacement Map | 128 = nul | 0–255 → −1…+1 | précomposer la map |
| Ombre portée (repère) | opacité 30–50 %, flou 10–30 px | — | Multiply |

Tableaux complets (Keylight, Roto Brush, Warp Stabilizer, Content-Aware Fill, distorsion, style, grain) : `references/parametres-effets.md`.

## Erreurs fréquentes et comment les détecter
| Symptôme | Cause probable | Détection / remède |
|---|---|---|
| « Remplacer par une composition AE » grisé ou comp vide | versions différentes, Team Projects, bug 25.6 | `ppro_get_capabilities` + version AE ; patch 25.6.1 ; tuer DynamicLinkManager ; P2 |
| Comp liée hors ligne | .aep déplacé/renommé | remettre le fichier ; relier |
| Timeline Premiere saccadée sur le clip lié | pas de cache (barre rouge) | Render and Replace |
| Modifs AE invisibles dans Premiere | clip déjà rendu/remplacé | Restore Unrendered ou re-remplacer |
| Changements perdus | AE fermé sans enregistrer | enregistrer les deux projets |
| Élément collé qui glisse | zone de recherche trop petite, détail qui change, point d'attache déplacé après coup | comparer 2 frames exportées ; revenir à la dernière bonne image et relancer |
| Texte 3D qui recule avec la caméra | erreur > 1 px, points sur objets mobiles, pas de parallaxe | Advanced > Average Error ; supprimer points ; Detailed Analysis ; Tripod Pan |
| « Analysis solve failed » | trop de mouvement, plan long | Detailed Analysis ; couper le plan |
| Roto : bord qui clignote | trop de traits, traits sur le bord | Reduce Chatter ; refaire depuis l'image de base avec un seul trait |
| Roto : sujet perdu | sorti de la boîte verte | Search Radius ↑ |
| Liseré sombre autour du sujet clé | Clip trop agressifs, gain trop haut, mauvaise couleur d'écran | vue Status : gris = bords ; Shrink −1, Rollback, re-pipette |
| Vert sur la peau | spill | Despill Bias, Edge Colour Correction |
| Warp Stabilizer refuse | clip ≠ taille comp, clip ralenti | précomposer ; enlever le time-stretch |
| Image qui gondole après stabilisation | Subspace Warp sur arrière-plan changeant | Method plus simple ; Detailed Analysis |
| Ralenti avec bavures | Pixel Motion sur croisements | Frame Mix local, Vector Detail ↑, tourner à 50/60 fps |
| Frame Blending sans effet | activé sur une précomp | l'activer sur les calques internes + bouton comp |
| Content-Aware Fill qui scintille | Lighting Correction trop fort, texture mobile | Moderate/Subtle ; Reference Frame |
| Remove Grain floute les visages | échantillons sur du détail | re-sampler sur zone unie ; Blend With Original |
| Rendu interminable | Roto non gelé, Pixel Motion partout, CAF sur 4K | Freeze ; limiter aux plages ; transcoder ; P2 |

## Contrôle qualité (avant de livrer)
- [ ] Même durée et même position du plan avant/après l'aller-retour (`ppro_get_sequence`).
- [ ] Trois images exportées (début/milieu/fin) : l'élément collé ne dérive pas ; pas de saut aux coupes.
- [ ] Image en mouvement rapide : flou de bougé de l'élément cohérent avec le plan.
- [ ] Clé/détourage vus sur fond rouge et sur le vrai fond : pas de liseré, pas de trou, cheveux présents, pas de clignotement.
- [ ] Grain, netteté, direction de l'ombre de l'élément = ceux du plan.
- [ ] Stabilisation : aucun bord noir, zoom ≤ 150 %, pas de « respiration » du fond.
- [ ] Ralenti : pas de déchirure sur les croisements ; audio géré (muet ou ralenti à part).
- [ ] Comp liée : .aep enregistré au bon endroit, versions identiques, Render and Replace fait si livraison.
- [ ] Projet AE : Roto gelé, fills inutilisés supprimés, caches purgés si lourds (`aeft_purge` [prévu]).
- [ ] `ppro_checkpoint` d'avant l'opération encore disponible ; `ppro_rewind` proposé.

## Comment un humain le fait dans Premiere / After Effects
Noms FR d'interface indiqués entre parenthèses (repère pour ceux non confirmés par une source).
- **Dynamic Link** : Premiere, clip > clic droit > Replace With After Effects Composition (Remplacer par une composition After Effects) ; File > Adobe Dynamic Link > New / Import After Effects Composition ; Edit > Edit Original (Modifier l'original) ; clip > clic droit > Render and Replace (Rendu et remplacement) / Restore Unrendered. Glisser un .aep ou une comp depuis le panneau Projet AE vers le panneau Projet Premiere fonctionne aussi.
- **Tracker** : Window > Tracker (Fenêtre > Suivi) ; Track Motion / Stabilize Motion / Track Camera ; Alt+clic sur Apply saute la boîte de dialogue ; Alt+clic sur une zone pour la désactiver (parallel corner pin).
- **Suivi de masque** : sélectionner le masque > clic droit > Track Mask (Suivre le masque) ; Animation > Track Mask.
- **Caméra 3D** : Animation > Track Camera (Suivi de la caméra) ou Effect > Perspective > 3D Camera Tracker ; Shift-clic pour ajouter des points ; Delete pour supprimer ; clic droit > Set Ground Plane and Origin / Create Text and Camera / Create Shadow Catcher.
- **Mocha AE** : Effect > Boris FX Mocha > Mocha AE ; Animation > Track in Boris FX Mocha ; Workspace > Classic pour AdjustTrack.
- **Roto Brush** : double-clic sur le calque (panneau Calque) ; Alt+W ; Alt+trait = fond ; Ctrl-glisser = taille ; Espace = propager ; Page Up/Down = image par image ; Alt+4/5/6 = alpha / contour / recouvrement ; bouton Freeze en bas du panneau Calque.
- **Keylight** : Effect > Keying > Keylight (1.2) (Effet > Masquage) ; View (Affichage) = Screen Matte / Status / Final Result ; Alt+4 dans le visualiseur pour l'alpha.
- **Track matte** : afficher la colonne Modes (clic droit sur l'en-tête de la timeline > Columns > Modes, ou F4 pour basculer, repère) ; menu déroulant Track Matte = calque source ; icône demi-cercle = Alpha/Luma ; case = Invert.
- **Warp Stabilizer** : Animation > Warp Stabilizer VFX ; Effect > Distort > Warp Stabilizer VFX ; Premiere : panneau Effets > Vidéo > Déformation > Stabilisation de déformation ; clip > Nest (Imbriquer) si la taille diffère.
- **Ralenti** : Layer > Time > Time Stretch (Calque > Temps > Étirement temporel) ; Layer > Time > Enable Time Remapping ; Layer > Frame Blending > Frame Mix / Pixel Motion (+ bouton Frame Blending de la comp) ; Effect > Time > Timewarp / Pixel Motion Blur / Posterize Time ; projet : clic droit sur le métrage > Interpret Footage > Main > Conform to frame rate.
- **Content-Aware Fill** : Window > Content-Aware Fill ; masque en mode Subtract ; Generate Fill Layer ; Create Reference Frame.
- **Remove / Match Grain** : Effect > Noise & Grain > Remove Grain / Match Grain ; Viewing Mode ; Preview Region ; Final Output.
- **Distorsion / style** : Effect > Distort > Bulge / Mesh Warp / Liquify / Transform / Turbulent Displace / CC Lens / Corner Pin ; Effect > Stylize > Glow / Cartoon / Find Edges / Mosaic ; Effect > Blur & Sharpen > CC Vector Blur.
- **Flux conseillé** : couper le plan → envoyer → travailler sur une précomp → vérifier à 3 instants → enregistrer → Render and Replace si livraison.

## Sources
1. Adobe Help — Tracking and stabilizing motion (After Effects) — https://helpx.adobe.com/after-effects/desktop/animate-in-after-effects/track-motion/tracking-stabilizing-motion-cs5.html — points par type de suivi, zones de forme/recherche, point d'attache, dérive, deux points éloignés, corner pin dans un plan, Shutter Phase −½, nul + parent, Mocha AE (menus, export Corner Pin/Transform, Create AE Masks vs Apply Matte), Alt+Apply.
2. Adobe Help (locale RU, contenu identique) — Dynamic Link and After Effects — https://helpx.adobe.com/ru/after-effects/desktop/work-with-other-applications/work-with-dynamic-link/dynamic-link-effects.html — même version obligatoire, comp liée héritant de la séquence, « Linked Comp », 30 s par défaut, Edit Original, renommage non répercuté, lien multiple, méthodes d'import.
3. MediaStorm — Guide to Dynamic Linking in Premiere Pro and After Effects — https://www.mediastorm.com/blog/?p=13694 — étapes, .aep à ne pas déplacer, enregistrer les deux applis.
4. Envato Tuts+ — How to use Dynamic Link between Premiere Pro and After Effects — https://photography.tutsplus.com/articles/how-to-use-dynamic-link-to-share-projects-between-premeire-pro-and-after-effects--cms-41140 — Render and Replace (réglages, barre rouge → jaune), modifs non répercutées après rendu, comp = durée du clip.
5. CrumplePop — 4 ways to connect Premiere Pro and After Effects — https://www.dev.crumplepop.com/4-ways-to-connect-premiere-pro-and-after-effects/ — menus Dynamic Link, enregistrer le .aep à côté du projet, MOGRT comme alternative.
6. Adobe Community — Best way to work with Premiere and AE — https://community.adobe.com/t5/premiere-pro-discussions/best-way-to-work-with-premier-and-ae/m-p/9694043 — export/import préféré aux comps lourdes, Dynamic Link instable, dupliquer avec poignées, enregistrer avant de fermer.
7. Adobe Community — Render and Replace AE Dynamic Link (bug) — https://community.adobe.com/t5/premiere-pro-discussions/render-and-replace-ae-dynamic-link/m-p/14565214 — versions identiques, ouvrir le .aep en arrière-plan, remplacer les clips liés par des rendus avant livraison.
8. Adobe Community — Replace with AE composition does not bring footage (25.6) — https://community.adobe.com/t5/after-effects-discussions/premiere-to-replace-ae-composition-does-not-bring-footage-to-after-effects-25-6/m-p/15592258 — bug 25.6 corrigé en 25.6.1, processus DynamicLinkManager.
9. Adobe Community — Dynamic Link / Team Projects — https://community.adobe.com/questions-79/dynamic-link-between-after-effects-and-premiere-pro-an-absolute-mess-1497746 — imbrication inter-applications limitée à un niveau, sous-clip exporté avec « Importer dans le projet ».
10. Adobe Help — Tracking 3D camera movement — https://helpx.adobe.com/after-effects/desktop/work-with-3d-composition/3d-camera-tracker-effect/tracking-3d-camera-movement.html — menus, Average Error (px, 0 idéal), Detailed Analysis, Shot Type, Solve Method, plan de sol, Auto-delete Points, Shadow Catcher.
11. Vincent Laforet — Tutorial: After Effects 3D Camera Tracker — https://blog.vincentlaforet.com/tutorial-after-effects-cs6-3d-camera-tracker — erreur 0,71 bonne, > 1 problématique, suppression de points, nul + pick whip.
12. Adobe Community — Track camera: text slightly keeps moving — https://community.adobe.com/t5/after-effects-discussions/after-effects-track-camera-text-slightly-keeps-moving-as-camera-moves/m-p/10726422 — ≥ 3 points, même plan, plan de sol, Detailed Analysis.
13. Boris FX blog — 3D camera tracker in After Effects — https://borisfx.com/blog/3d-camera-tracker-in-after-effects/ — Solve failed → Detailed Analysis → couper le plan ; objets fixes ; Mocha AE sans Camera Solve ; types de caméra Mocha.
14. Adobe Help — Roto Brush and Refine Matte — https://helpx.adobe.com/ca/after-effects/desktop/roto-brush-and-refine-matte/roto-brush/roto-brush-refine-matte.html — raccourcis, traits, image de base, propagation, Freeze, propriétés de matte, Search Radius, vues Alt+4/5/6.
15. Adobe Help — After Effects feature summary (May 2024) — https://helpx.adobe.com/au/after-effects/desktop/using/whats-new/2024-4.html — Freeze met en cache l'inférence des images déjà propagées.
16. Peachpit — Using Keylight for After Effects — https://www.peachpit.com/articles/article.aspx?p=1252172 — ordre des réglages, vue Status (gris = bords), Balance 5/50/95, Gain ≤ 105–110, méthode trois passes core/edge/background, Stencil/Silhouette Alpha.
17. Foundry — Keylight 1.2 for After Effects user guide (PDF) — https://untamedscience.com/wp-content/uploads/2016/08/Keylight_1.2_AE.pdf — vues, défauts (Gain 100, Clip 0/100), valeurs des tutoriels (Clip 20/70, Rollback 3, Softness 1, Despot 1–2, Shrink −0,5), Despill/Alpha Bias, masques Inside/Outside, Replace Method.
18. Packt — Creative Motion Mastery with After Effects, fine-tuning the screen matte — https://packtpub.com/en-gb/product/creative-motion-mastery-with-adobe-after-effects-9781804617281/chapter/chapter-9-chroma-keying-11/section/fine-tuning-the-screen-matte-ch11lvl1sec75 — Clip Black 15, Clip White 60, Shrink/Grow −1.
19. Adobe Community — thick dark line around keyed subject — https://community.adobe.com/t5/after-effects-discussions/i-finally-found-a-great-tutorial-on-greenscreening-however-i-ve-got-a-thick-dark-line-around/m-p/11563221 — masque poubelle d'abord, Gain/Balance puis Clip, part des contrôles selon la caméra, Key Cleaner en dernier recours.
20. DVinfo forum — better green screen key with Keylight — https://www.dvinfo.net/forum/archive/index.php/t-483103.html — écran exposé à 50 IRE, netteté caméra off, pipette près du visage, test sur matte blanc.
21. Adobe Help — Distort effects — https://helpx.adobe.com/en/after-effects/using/distort-effects.html — Bulge, Mesh Warp (≤ 31, frontières de cases), Liquify (outils, Freeze Area Mask, Reconstruction), Corner Pin, Optics Compensation, Displacement Map (128 = nul), Magnify, Reshape.
22. Adobe Help — Stylize effects — https://helpx.adobe.com/au/after-effects/desktop/apply-effects-and-animation-presets/list-of-effects/stylize-effects.html — Glow, Cartoon (Fill d'abord, Posterize Time), Find Edges (8 bpc), Mosaic, Motion Tile, Roughen Edges, Posterize.
23. Adobe Help — Track mattes and traveling mattes — https://helpx.adobe.com/after-effects/using/track-mattes-and-traveling-mattes.html — source n'importe où dans la pile, colonne Modes, types Alpha/Luma/Inverted, vidéo du matte éteinte, Levels, Shift Channels, parentage, Preserve Underlying Transparency.
24. Adobe Community — Alpha/Luma options missing in track matte dropdown — https://community.adobe.com/t5/after-effects-discussions/the-alpha-and-luma-options-do-not-show-up-in-the-track-matte-drop-down-in-after-effects/m-p/13385901 — nouvelle interface : liste de calques + icône demi-cercle + case Invert.
25. Adobe Help — Noise and Grain effects — https://helpx.adobe.com/after-effects/desktop/apply-effects-and-animation-presets/list-of-effects/noise-grain-effects.html — Remove/Add/Match Grain, preview 200×200, échantillons 24×24 à l'image 0, zones unies, précomposer, Final Output, Animation Speed, Random Seed.
26. Adobe Help — Remove objects with the Content-Aware Fill panel — https://helpx.adobe.com/after-effects/desktop/remove-objects-from-your-videos/content-aware-fill.html — masque Subtract + Track Mask, Alpha Expansion, Object/Surface/Edge Blend, Lighting Correction, Reference Frame, dossier Fills, personne et ombre séparées, 4K → transcoder.
27. MediaStorm — Guide to the Warp Stabilizer effect — https://www.mediastorm.com/blog/?p=13649 — pas sur clip ralenti, méthodes, Smooth vs No Motion, Smoothness 100 % en première passe, framing, Synthesis, Detailed Analysis, Rolling Shutter.
28. Movavi — Warp Stabilizer in Premiere Pro — https://movavi.com/learning-portal/warp-stabilizer-premiere-pro.html — No Motion si sujet cadré, fallback des méthodes, Crop Less/Smooth More 50 % par pas de 10, Enhanced Reduction DSLR, imbriquer si taille diffère, stabiliser avant les autres effets.
29. Motion Array — Slow motion (Time Stretch) in After Effects — https://motionarray.com/learn/after-effects/after-effects-slow-motion/ — Time Stretch 200 %, Timewarp Speed 50/25, ≥ 50 fps, Conform to frame rate, Pixel Motion Blur.
30. SoftwareHow — Timewarp et frame blending dans After Effects — https://softwarehow.com/?p=38929 — keyframes de Speed pour la rampe, Frame Mix vs Pixel Motion, qualité Best, pas de frame blending sur une précomp entière.
31. Adobe Community — How to make smooth slow motion — https://community.adobe.com/t5/after-effects-discussions/how-to-make-smooth-slow-motion/m-p/13632399 — Pixel Motion plus lent mais correct ; Optical Flow côté Premiere, rendre avant de juger.
