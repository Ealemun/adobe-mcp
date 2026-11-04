---
name: interview-podcast-multicam
description: Monter une interview, un podcast vidéo ou un talking head, surtout en multicaméra : synchroniser caméras et audio (forme d'onde, timecode, dérive), choisir la caméra active, couper sur le locuteur, placer plans de coupe et plans d'écoute, régler le rythme, couvrir les jump cuts, régler le son voix. À charger pour multicam, split-screen, plan large/serré, J-cut/L-cut, morph cut, dérushage d'interview.
---
# Interview, podcast vidéo et multicam

Ce skill complète `adobe-editing` (règles permanentes : lire avant d'écrire, checkpoint, vérifier). Pour le détail du son, charger aussi `audio-montage` ; pour les titres et sous-titres, `titres-texte-sous-titres` ; pour les extraits verticaux, `montage-vertical-shorts` ; pour la sortie, `export-livraison-workflow`.

Légende des outils : **[existant]** = disponible ; **[prévu]** = pas encore livré. N'annoncer comme faisable tout de suite que le premier groupe ; pour le reste, guider l'utilisateur (section « Comment un humain le fait »).

## Quand utiliser ce skill

- Plusieurs caméras sur une même conversation (podcast, table ronde, interview à deux ou trois).
- Une seule caméra avec un invité et un besoin de rythme (talking head, interview de type documentaire).
- Question de synchronisation : audio externe, caméras sans timecode commun, dérive sur un enregistrement long.
- Question de choix de plan : qui montrer, quand passer en large, quand montrer l'écoute, combien de temps tenir un plan.
- Jump cuts à masquer après nettoyage de la parole (plans de coupe, punch-in, morph cut).
- Ne PAS l'utiliser seul pour : un montage sur musique (`montage-gaming-stream`), un format vertical pur (`montage-vertical-shorts`), l'étalonnage (`couleur-etalonnage`).

## Principes

### Préparation et synchronisation
1. **Choisir la source audio de référence avant de monter** (micro cravate ou enregistreur, pas le micro de la caméra). Pourquoi : le choix du son se fait une fois, tout le reste en découle ; le corriger plus tard casse les coupes.
2. **Un seul taux d'échantillonnage dans tout le projet : 48 kHz** (repère vidéo pro). Pourquoi : des taux mélangés provoquent une dérive lente et des problèmes de synchro tardifs.
3. **Chaque caméra enregistre un son de travail** (même médiocre), même si le vrai son vient d'ailleurs. Pourquoi : la synchro automatique par forme d'onde en a besoin ; sans piste son sur une caméra, il faut synchroniser à la main.
4. **Ordre de synchro : timecode commun si tous les appareils l'ont réellement partagé > forme d'onde audio > marqueurs/points d'entrée posés à la main (clap, claquement de mains).** Pourquoi : des enregistrements non liés n'ont pas de timecode commun même s'ils en affichent un.
5. **Vérifier la synchro en au moins deux points (début et fin), jamais sur un seul clap.** Pourquoi : un accord au début ne prouve pas l'absence de dérive.
6. **Dérive d'horloge : compter environ 9 à 11 images de décalage sur une heure avec un enregistreur grand public.** Pourquoi : deux horloges ne tournent jamais exactement à la même vitesse. Si l'écart dépasse ~2 images en fin de fichier, couper le clip à un silence et recaler, toutes les 30 à 40 min environ, ou étirer la piste audio.
7. **Distinguer décalage constant et dérive.** Constant : glisser la piste. Dérive : recaler par segments ou étirer. Pourquoi : appliquer une correction de vitesse sur un simple décalage ajoute une erreur.
8. **Lancer le montage sur des médias à fréquence constante.** Les fichiers à fréquence variable (enregistrements d'écran, visio, téléphones) se transcodent d'abord en fréquence constante. Pourquoi : sinon la dérive revient.
9. **Étiqueter les caméras (A, B, C ou nom du locuteur) et les couleurs de chutier avant d'assembler.** Pourquoi : savoir quel numéro d'angle est quel plan évite les erreurs de bascule.

### Choix de plan
10. **Montrer par défaut celui qui parle, en plan serré « maison » (poitrine et tête).** Pourquoi : c'est le plan de référence, tout le reste est une variation.
11. **Durées de tenue (repères, podcast de conversation) :** plan serré du locuteur jusqu'à ~30 s ; plan d'écoute de l'autre personne 2 à 3 s ; plan large 5 à 10 s aux pauses, changements de sujet et chevauchements de voix ; recadrage plus serré du même locuteur 10 à 15 s s'il parle longtemps. Pourquoi : ces valeurs donnent un changement visuel régulier sans hacher la parole.
12. **Cadence globale selon le type de contenu :** interview ou débat standard : un changement toutes les 10 à 15 s ; discussion dense et longue : 20 à 40 s par plan ; intro ou bande-annonce : 2,5 à 3 s par plan. Pourquoi : le rythme suit l'énergie de la parole, pas l'inverse.
13. **Pour les extraits courts de conversation, viser 3 à 5 s par plan ; en dessous de 3 s c'est chaotique sauf échange rapide ; au-delà de 7 s une caméra unique fatigue.** Pourquoi : repères de stratégie d'extraits, à adapter au contenu.
14. **Durée minimale 2 à 4 s par plan, durée maximale 15 à 30 s.** Pourquoi : le minimum évite que les « oui », « hm » provoquent un clignotement ; le maximum force une variation pendant un long monologue.
15. **Ne pas couper sur le moindre bruit (rire, toux, « ouais »).** Pourquoi : un basculement déclenché par le volume rate les vraies réactions et suit les micros qui captent le voisin.
16. **Règle des 30 degrés / 20 mm entre deux plans du même sujet :** changer la position de caméra d'au moins 30°, ou la focale d'au moins ~20 mm (ou nettement la taille de plan). Pourquoi : sinon la coupe ressemble à un jump cut.
17. **Rester du même côté de l'axe (ligne des 180°) entre les deux personnes.** Pourquoi : traverser l'axe inverse le sens du regard et désoriente.
18. **Choisir une coupe par l'émotion d'abord, puis l'histoire, puis le rythme.** Ordre de priorité des six critères d'une bonne coupe : émotion, histoire, rythme, trajet du regard, plan 2D, espace 3D. Pourquoi : si un compromis est nécessaire, on sacrifie le critère le plus bas. Un rire ou un silence gêné peut justifier une coupe imparfaite.

### Coupes de son (J et L)
19. **Décaler le son et l'image de 6 à 12 images pour une coupe « en escalier » (J-cut / L-cut).** Moins de 6 images ne se remarque presque pas ; plus de 12 peut sembler désynchronisé. Pourquoi : l'oreille anticipe, la coupe devient fluide.
20. **J-cut pour introduire un nouveau locuteur (le son arrive avant l'image) ; L-cut pour montrer la réaction de l'écoutant pendant que le locuteur finit.** Pourquoi : c'est le geste normal du dialogue filmé.
21. **Les coupes sèches exactement au premier son de la nouvelle voix donnent un effet « robot ».** Si on coupe franc, le faire quelques images (2 à 4 selon un repère) après le début du son, sinon utiliser une coupe en escalier. Pourquoi : le spectateur a besoin d'un instant pour repérer qui parle.

### Plans de coupe, plans d'écoute, jump cuts
22. **Couvrir chaque jump cut par une des trois solutions : plan de coupe, punch-in de 15 à 20 %, ou morph cut.** Pourquoi : un saut d'image non justifié se remarque.
23. **Punch-in surtout si la source est en 4K et la sortie en 1080p.** Pourquoi : on recadre sans perte de netteté. En 1080p source, rester autour de 110 à 115 %. Alterner plan large et plan serré, jamais deux zooms de suite sur < 3 s (règle de l'agent).
24. **Plan de coupe : le placer avant la coupe et le finir après (« à cheval ») ; faire arriver l'image un peu avant le mot qui la justifie ; revenir au locuteur sur une frontière de phrase.** Pourquoi : on cache la couture et on laisse la phrase respirer.
25. **Prévoir de quoi couvrir : environ 30 à 45 s de B-roll varié par minute d'interview finie (repère d'un prestataire).** Pourquoi : sans matière on retombe sur les mêmes plans.
26. **Garder le locuteur à l'écran pour les affirmations clés, les phrases émotionnelles et les transitions.** Pourquoi : trop de B-roll coupe le lien avec la personne.
27. **Les plans d'écoute (hochements, sourires, surprise) ne se devinent pas à l'oreille.** Les choisir à la main (ou à partir d'une prise « d'écoute » tournée exprès). Pourquoi : une bascule automatique ne les repère pas.
28. **Morph cut seulement si : un seul sujet, caméra fixe, fond statique, éclairage constant, pause courte, tête placée pareillement des deux côtés.** Pourquoi : sinon il produit des zones floues ou échoue à l'analyse (cadrage trop serré, profil).

### Son de la voix
29. **Cible de niveau pour un podcast : −16 LUFS intégré en stéréo, −19 LUFS en mono (compensation de 3 LU), crête vraie ≤ −1 dBFS.** Pourquoi : Apple Podcasts vise −16 ±1 ; la plupart des appareils lisent le mono sur deux haut-parleurs sans corriger.
30. **Pour YouTube et Spotify, la plateforme normalise vers environ −14 LUFS ; livrer à −16 reste courant.** Pourquoi : la plateforme baisse ou monte ensuite, sans surcompresser si la marge existe. (Vérifier les exigences actuelles de la plateforme avant livraison.)
31. **Égaliser les niveaux entre locuteurs avant le mixage final ; régler les écarts par compression ou gain de clip, pas en tirant sur le compteur de niveau.** Pourquoi : un invité plus fort que l'autre fatigue l'écoute.
32. **Mesurer le niveau final en LUFS intégré sur l'épisode entier ; utiliser la mesure à court terme (3 s) pour régler les niveaux au fil du mixage.** Pourquoi : l'intégré moyenne tout le fichier, le court terme guide pendant le travail.

### Garde-fous d'édition
33. **Ne pas supprimer pauses et réactions par réflexe.** Pourquoi : une conversation sans respiration sonne artificielle ; réduire les silences, ne pas les gommer.
34. **Ne pas étalonner les clips sources d'un multicam.** Pourquoi : la correction touche toutes les instances du clip. Étalonner après aplatissement ou via un calque d'ajustement.
35. **Ne plus toucher aux images ni à la synchro après verrouillage de l'image.** Pourquoi : tout décalage ultérieur casse la couleur et le son.

## Procédures

### P1. Dérusher et organiser (talking head, interview, podcast)
Objectif : savoir ce qu'on a avant de couper.
1. `ppro_get_capabilities`, `ppro_get_project`, `ppro_list_sequences` **[existant]**.
2. `ppro_list_items {type: "video"}` **[prévu]** pour voir les rushs ; sinon demander à l'utilisateur la liste des caméras et de l'audio externe.
3. Nommer et ranger : un chutier par caméra, étiquette « Angle » A/B/C, un sous-dossier audio. `ppro_create_bin`, `ppro_move_items`, `ppro_rename_item` **[existant]**. À défaut, guider à la main.
4. Repérer les prises utilisables (couleur de chutier : une couleur pour « retenu », une pour « écarté ») : `ppro_set_item_metadata` **[prévu]**.
5. Dérusher dans une séquence séparée, pas dans la séquence finale.
Vérifier : `ppro_list_items` montre une structure par caméra et aucun média hors ligne (`ppro_find_items` **[prévu]**).

### P2. Synchroniser les sources et créer le multicam
Objectif : une séquence source multicam où toutes les caméras sont alignées et un son de référence unique.
1. Confirmer les sources : quelle caméra a le meilleur son de travail, quel enregistreur est la référence, tous à 48 kHz.
2. `ppro_checkpoint {label: "avant-multicam"}` **[existant]**.
3. `ppro_create_multicam {nodeIds, syncBy: "audio", name}` **[prévu]**. Ordre des clips : caméra de référence audio en premier. Si la création échoue (pas de son sur une caméra), la caméra concernée se synchronise à la main sur un clap.
4. Régler le son de la séquence : « Camera 1 » (une piste fixe) si l'audio de référence est sur la caméra 1 ou un clip audio séparé ; « Switch Audio » seulement si le son doit suivre l'image.
5. Créer la séquence de montage à partir de ce clip (`ppro_create_sequence {fromClip}` **[prévu]**).
Vérifier : `ppro_get_sequence` **[existant]** liste un clip multicam ; `ppro_export_frame` **[existant]** à 3 instants (début, milieu, fin) puis comparer le mouvement des lèvres / un geste visible sur chaque angle. Si un angle est décalé à la fin, passer à P3.

### P3. Détecter et corriger une dérive
Objectif : pas plus de ~2 images d'écart en fin d'enregistrement.
1. Mesurer l'écart au début et à la fin avec un point sonore identifiable (clap, claquement de mains, mot fort) : `ppro_export_frame` **[existant]** sur chaque caméra à ces instants ; `media_waveform_image` **[prévu]** pour aligner visuellement.
2. Si l'écart est constant : glisser la piste (`ppro_move_clip` **[existant]**).
3. Si l'écart grandit : couper à un silence toutes les 30 à 40 min et recaler chaque segment (`ppro_cut_at` **[existant]** + `ppro_move_clip`), ou étirer la piste audio (guidage manuel : Audition, outil d'étirement, voir plus bas).
Vérifier : nouvelle mesure à la fin ; écart ≤ 2 images (repère).

### P4. Choisir les caméras à partir de la parole (cadre de décision)
Objectif : une feuille de coupes caméra, justifiée, avant de toucher la timeline.
1. `ppro_export_audio {tracks: voix, preset: "transcription"}` **[existant]** → `media_transcribe {wordTimestamps: true, diarize: true}` **[prévu]** → segments par locuteur.
2. Construire la liste des tours de parole : `[{speaker, start, end}]`. Fusionner les interjections < 1 s dans le tour du locuteur principal (elles ne déclenchent pas de coupe).
3. Règle de base (voir tableau « Cadence » plus bas) :
   - tour de parole → plan serré du locuteur ;
   - tour > 30 s → insérer un recadrage plus serré du même locuteur (10 à 15 s) ou un plan d'écoute (2 à 3 s) à une frontière de phrase ;
   - pause longue, rires, chevauchement de voix → plan large 5 à 10 s ;
   - changement de sujet → plan large.
4. Respecter les contraintes : durée mini 2 à 4 s, maxi 15 à 30 s, jamais deux plans du même angle consécutifs.
5. Décaler chaque coupe de locuteur par une coupe en escalier de 6 à 12 images (J-cut de préférence, 3 à 6 images pour une réaction courte).
6. Présenter le plan à l'utilisateur : nombre de coupes, durée moyenne des plans, répartition par angle, points de plan large. Attendre l'accord (`D`).
Vérifier : durée moyenne par plan dans la plage visée ; aucune coupe < 2 s sauf demande ; aucun angle > 30 s.

### P5. Exécuter les coupes multicam
Objectif : appliquer la feuille de coupes dans la séquence de montage.
1. `ppro_checkpoint {label: "avant-bascules"}` **[existant]**.
2. `ppro_cut_at {times, tracks: "video", includeAudio: false}` **[existant]** aux instants de la feuille, puis choisir l'angle par segment : `ppro_set_multicam_angle` **[prévu, absent du catalogue actuel]**. Tant que cet outil n'existe pas : produire la liste « instant → angle » et guider l'utilisateur (bascule en direct avec les touches numériques, voir plus bas) ; ou alternative : séquence XML calculée hors Premiere puis `ppro_import_xml` **[prévu]**.
3. Alternative sans multicam : une piste vidéo par caméra, activer le clip de la caméra du locuteur et désactiver les autres (`ppro_disable_clips` **[existant]**), puis `ppro_remove_disabled_clips` **[existant]**.
4. Garder le son continu : ne jamais couper la piste de référence en même temps que l'image.
Vérifier : `ppro_get_sequence {range}` **[existant]** ; `ppro_export_frame` **[existant]** une image par bascule ; contrôler qu'aucun trou noir ni angle faux n'apparaît.

### P6. Couvrir un jump cut (3 solutions)
Choisir selon le critère :
| Situation | Solution |
|---|---|
| Du B-roll pertinent existe, ou l'orateur évoque un objet | Plan de coupe à cheval sur la coupe |
| Source 4K, sortie 1080p, pas de B-roll | Punch-in 15 à 20 % sur un des deux côtés (`ppro_punch_in` **[existant]**) |
| Plan unique, fond fixe, courte pause, tête alignée | Morph cut (`ppro_add_transition {name: "Morph Cut"}` **[prévu]**) |
| Réaction de l'autre personne disponible | Plan d'écoute 2 à 3 s |
Étapes : repérer les coupes après nettoyage de la parole (`ppro_get_sequence`), proposer la solution par coupe, appliquer par lot, vérifier.
Vérifier : `ppro_export_frame` avant/après la coupe ; relire à vitesse normale sur 10 s autour de chaque coupe.

### P7. Plans de coupe (B-roll) sur une interview
1. Lister les moments illustrables (objet cité, lieu, action) à partir du transcript.
2. Pour chaque moment : choisir un plan par rôle (contexte, preuve, émotion, couverture d'un raccord).
3. `ppro_insert_clip {mode: "overwrite", videoTrack: "V2"}` **[prévu]** ; durée 2 à 4 s selon le contenu (repère, comprendre l'image prend du temps), début un peu avant le mot clé, fin après la frontière de phrase.
4. Ne pas dépasser un bon pourcentage de la durée en B-roll ; revenir au locuteur pour les phrases clés.
Vérifier : aucune coupe de B-roll au milieu d'un mot ; pas de répétition du même plan ; couleur/lumière cohérentes.

### P8. Split-screen (duo, table ronde)
Objectif : montrer deux ou trois personnes en même temps quand une interaction rapide ou un rire le justifie.
1. `ppro_add_track` **[existant]**, deux clips superposés, recadrage de chaque visage dans sa moitié (`ppro_set_transform` **[existant]**).
2. Utiliser surtout pour les remises de parole rapides ou les rires, pas comme plan permanent.
Vérifier : visages complets dans chaque moitié, yeux à la même hauteur approximative.

### P9. Son : voix et niveau final
1. Séparer pistes par locuteur ; `ppro_get_audio_info` **[existant]** ; `media_loudness` **[existant]** par locuteur.
2. Égaliser les écarts entre voix ; cible −16 LUFS stéréo / −19 mono ; crête ≤ −1 dBFS.
3. Réduction de bruit légère, compression modérée (voir `audio-montage`).
4. Musique de générique : ducking (`ppro_auto_duck` **[prévu]**).
Vérifier : `media_loudness` sur l'export audio de la séquence entière.

### P10. Extraits courts depuis l'épisode
1. Poser des marqueurs sur les moments forts (`ppro_add_markers` **[existant]**).
2. `ppro_extract_range_to_sequence` **[existant]**, puis suivre `montage-vertical-shorts`.
3. Garder les durées de plan à 3 à 5 s dans l'extrait, plan large pour établir.

## Paramètres de référence

### Cadence et durées de plan (conversation)
| Plan | Durée typique | Usage |
|---|---|---|
| Large (16 à 35 mm) | 5 à 10 s | Ouverture, pauses, changements de sujet, voix qui se chevauchent |
| Serré « maison » (50 à 100 mm, poitrine) | jusqu'à ~30 s (15 à 30 s) | Locuteur de base |
| Recadrage plus serré du locuteur (crop 4K) | 10 à 15 s | Appui, rattrapage de longues interventions |
| Plan d'écoute | 2 à 3 s | Réaction, rire, hochement |
| Mini/maxi absolus | 2 à 4 s / 15 à 30 s | Garde-fous de la bascule |

### Cadence selon le contenu
| Contenu | Un changement toutes les… |
|---|---|
| Intro, bande-annonce | 2,5 à 3 s |
| Extraits courts de conversation | 3 à 5 s |
| Interview / débat standard | 10 à 15 s |
| Discussion dense longue durée | 20 à 40 s |

### Nombre de caméras (podcast)
| Format | Caméras |
|---|---|
| 2 personnes | 3 (un large + un serré par personne) |
| 3 personnes, ou 2 avec angle de côté | 4 |
| 4 personnes ou sortie d'extraits importante | 5 |
| Moins de 3 / plus de 5 | plans statiques / complexité sans gain |

### Coupes et décalages
| Paramètre | Valeur |
|---|---|
| Décalage J/L | 6 à 12 images |
| Coupe sèche après début du son | 2 à 4 images (repère) |
| Punch-in pour masquer un jump cut | 15 à 20 % |
| Punch-in d'emphase (recette générale) | 110 à 115 % |
| Changement d'angle minimal | 30° ou ≥ 20 mm de focale |
| Dérive d'horloge d'un enregistreur grand public | ~9 à 11 images par heure |
| Recalage préventif | toutes les 30 à 40 min |
| Fréquence d'échantillonnage | 48 kHz |
| Proxys | 1080p ou 720p, intra-image (ProRes 422 Proxy, DNxHR LB) |

### Niveaux et livraison
| Cible | Valeur |
|---|---|
| Podcast stéréo | −16 LUFS intégré |
| Podcast mono | −19 LUFS intégré |
| Tolérance Apple Podcasts | ±1 LU |
| Crête vraie | ≤ −1 dBFS |
| Spotify / YouTube (normalisation) | ~−14 LUFS |
| Référence de mix avant export | −17 à −15,5 LUFS |
| Vidéo longue | 16:9, H.264/H.265 en MP4 ; 4K YouTube, 1080p pour extraits courts |
| Extraits courts | 9:16, 1080p |

## Erreurs fréquentes et comment les détecter

| Erreur | Détection | Correction |
|---|---|---|
| Synchro bonne au début, fausse à la fin | Image du même mot sur chaque caméra à t=0 et t=fin | P3 : recaler par segments ou étirer |
| Sync par timecode entre appareils non liés | Écart de plusieurs secondes ou images | Resynchroniser par forme d'onde |
| Fréquence variable non transcodée | Dérive progressive sur visio/téléphone | Transcoder en fréquence constante (`media_convert` **[prévu]**) |
| Taux d'échantillonnage mélangés | Son plus lent ou rapide, décalage progressif | Conformer à 48 kHz |
| Bascule sur le volume (rire, toux) | Plan sur quelqu'un qui ne parle pas | Fusionner les interjections < 1 s, vérifier le transcript |
| Plans trop courts (< 2 s) ou trop longs (> 30 s) | Statistiques de durée de plan | Appliquer mini/maxi |
| Coupe sèche « robot » | Image change pile sur le premier son | Coupe en escalier 6 à 12 images |
| Axe traversé | Regard du locuteur qui change de côté | Revenir à la caméra du bon côté ou plan large |
| Deux plans trop proches | Coupe qui saute sans changement d'angle | Respecter 30° / 20 mm, ou plan de coupe |
| Jump cut non couvert | Saut visible de la tête | P6 |
| Morph cut flou | Zones brouillées autour de la bouche, bandeau d'échec d'analyse | Choisir plan de coupe, ou plus large |
| Réactions et pauses supprimées | Conversation sans respirations | Rétablir une partie des silences |
| Écart de niveau entre locuteurs | Mesure LUFS par locuteur | Compression / gain de clip, P9 |
| Écrêtage | Crête > 0 dBFS | Baisser le gain, limiteur |
| Corriger la couleur sur les clips sources | Tous les angles changent ensemble | Aplatir puis étalonner par clip, ou calque d'ajustement |
| Cuts non visibles pendant la lecture | Rien dans la timeline pendant le direct | Ils apparaissent à l'arrêt de la lecture ; arrêter pour contrôler |
| Supprimer une coupe multicam croit supprimer le clip | La caméra revient à l'angle précédent | C'est normal ; changer l'angle directement |
| Chaîne de livraison non revue | Temps mort, graphique manquant | Relecture complète (pair si possible) avant export |

## Contrôle qualité (checklist avant de livrer)

- [ ] Synchro vérifiée au début, au milieu, à la fin, pour chaque caméra.
- [ ] Une seule source audio de référence, 48 kHz partout.
- [ ] Aucune bascule < 2 s (hors échange rapide) ni plan > 30 s.
- [ ] Les interjections courtes n'ont pas déclenché de coupe.
- [ ] Les plans d'écoute sont placés à des moments choisis, pas au hasard.
- [ ] Axe respecté, règle des 30° / 20 mm respectée.
- [ ] Chaque jump cut est couvert (B-roll, punch-in, morph cut ou plan d'écoute).
- [ ] Coupes en escalier de 6 à 12 images aux changements de locuteur.
- [ ] Niveau : −16 LUFS stéréo ou −19 mono, crête ≤ −1 dBFS, locuteurs équilibrés.
- [ ] Couleur et peau cohérentes d'une caméra à l'autre.
- [ ] Relecture complète à vitesse normale : pas de temps mort, de graphique oublié, de noir.
- [ ] Chapitres, titres et sous-titres relus (`ppro_extract_texts` **[prévu]**).
- [ ] Un checkpoint existe avant chaque lot destructif, `ppro_rewind` proposé à la fin.

## Comment un humain le fait dans Premiere / After Effects

### Créer le multicam (Premiere)
1. Dans le panneau Projet, sélectionner les clips (caméra de référence audio en premier).
2. Clic droit > **Create Multi-Camera Source Sequence** (ou menu Clip).
3. Réglages : **Synchronize Point = Audio** (ou Timecode / In Point / Out Point / Clip Marker selon le tournage). **Audio Sequence Settings = Camera 1** pour un son fixe, **Switch Audio** pour un son qui suit l'image. **Camera Names = Use Clip Names** (ou énumérer). **Move source clips to Processed Clips bin** coché pour ranger.
4. Clic droit sur le clip multicam > **New Sequence From Clip** (ou le glisser dans la timeline).
5. Régler le Timebase de la séquence sur la bonne cadence (ex. 29,97) si besoin.

### Basculer en direct
1. Dans le Program Monitor, **Button Editor** (icône +) > glisser **Toggle Multi-Camera View** dans la barre > OK, puis cliquer dessus. Activer les superpositions pour voir les numéros.
2. Désactiver **Linked Selection** pour ne pas couper l'audio avec la vidéo.
3. Lire et appuyer sur **1, 2, 3…** (rangée du haut du clavier, pas le pavé numérique), ou cliquer l'angle. Cmd/Ctrl + clic pour couper vers un angle (selon une source). L'ouverture de la vue multicam peut aussi se faire avec Shift+0 (selon une source).
4. Arrêter la lecture : les coupes apparaissent seulement alors.
5. Ajuster : **N** (Rolling Edit) sur la coupe, faire glisser pour allonger un plan d'écoute sans casser la synchro.
6. Changer un angle : sélectionner le clip, cliquer l'autre angle. Supprimer une coupe (Delete) ramène l'angle précédent.
7. Option « coupes à la main » : **C** (rasoir) au bon instant, **V** (sélection), puis touche du numéro d'angle.

### Synchroniser à la main
- Plusieurs clips : sélectionner, clic droit > **Synchronize** (audio ou timecode).
- Un clap ou un claquement de mains en début d'enregistrement facilite l'alignement visuel sur la forme d'onde.
- Pour corriger une dérive : clic droit sur l'audio de travail > **Edit Clip in Adobe Audition** > mode multipiste > aligner le début, aller à la fin, utiliser l'outil d'étirement (**Stretch**) jusqu'à correspondance, exporter le mixage, réimporter sous la piste d'origine (procédure issue d'une source).

### Morph Cut (Premiere)
Panneau Effets > Transitions vidéo > Dissolve > **Morph Cut**, glisser entre deux clips du même plan. Attendre la fin de l'analyse (bandeau « Analyzing in background »). Ajuster la durée ; démarrer / terminer près des pics des mots proches. Générer l'aperçu seulement après l'analyse.

### Aplatir et finir
- Clic droit sur le clip multicam > **Multi-Camera > Flatten** (repère) pour obtenir les clips d'origine, puis étalonner par clip.
- Étalonnage : calque d'ajustement + Lumetri (voir `couleur-etalonnage`).

### Son
- Panneau **Essential Sound** > Dialogue > Loudness / Auto-match, ou panneau Loudness Radar / mesure de Loudness ; cible −16 LUFS (stéréo).
- Marqueurs : touche **M** pour poser des repères de moments forts.

### After Effects
- Peu utile ici : surtout pour des habillages (titres, lower thirds) via MOGRT (`titres-texte-sous-titres`).

## Sources

Rédigées en paraphrase ; certaines pages (marquées *) sont des blogs commerciaux ou ne fournissent pas de chiffres sourcés : valeurs correspondantes notées « repère ».

1. Video Engineering in a Professional Podcast Post-Production: Cutting – When to Cut and Why — https://www.finchley.co.uk/finchley-learning/video-engineering-in-a-professional-podcast-post-production-cutting-when-to-cut-and-why — hiérarchie de plans, durées de tenue, 30°/20 mm, décalages J/L 6-12 images, punch-in 15-20 %, réglages mini/maxi, erreurs.
2. Video Engineering… Cutting: Understanding the Footage — https://www.finchley.co.uk/finchley-learning/video-engineering-in-a-professional-podcast-post-production-cutting-understanding-the-footage — dérive 9-11 images/h, recalage 30-40 min, 48 kHz, proxys, fréquence variable.
3. Video Editing Workflows: Turning a 1-Hour Shoot into a Dynamic Episode — https://www.finchley.co.uk/finchley-learning/visual-podcast/video-editing-workflows-turning-a-1-hour-shoot-into-a-dynamic-episode — workflow en 8 étapes, dossiers, extraits.
4. A Guide for Editing Your Video Podcast (B&H Explora) — https://www.bhphotovideo.com/explora/node/124651 — nombre de caméras, enregistrement ISO, split-screen, formats d'export, erreurs.
5. How to do loudness: the LUFS and LKFS FAQ for podcasters (Podnews) — https://podnews.net/article/lufs-lkfs-for-podcasters — −16 LUFS, tolérance Apple ±1, crête −1 dBFS, −14 Spotify/YouTube, mono/stéréo.
6. Should I set the loudness target for mono podcasts to −16 or −19 LUFS? (Auphonic) — https://auphonic.com/blog/2020/06/09/loudness-normalization-mono-productions/ — compensation de 3 LU en mono, limites.
7. How Do You Set Your Final Episode LUFS Level to −16 Stereo or −19 Mono? (Podcast Engineering School) — https://podcastengineeringschool.com/how-do-you-set-your-final-episode-lufs-level-to-16-stereo-or-19-mono/ — plage de mix −17 à −15,5, mesure sur 10 min, compression plutôt que gain.
8. How to Edit Multi-Camera Podcast Footage (podcastvideos.com)* — https://www.podcastvideos.com/articles/edit-multi-camera-podcast-footage-2025 — workflow en 9 étapes, marqueurs, erreurs (sync auto, coupes trop rapides, lumière).
9. Multicam Editing in Premiere Pro CC Tutorial (tutvid) — https://tutvid.com/premiere-pro/multicam-editing-premiere-pro-cc-tutorial/ — étapes, Camera 1 comme audio, Rolling Edit, coupes visibles à l'arrêt.
10. Premiere Pro Multicam Editing Explained (Motion Array) — https://blog.motionarray.com/learn/premiere-pro/premiere-pro-multicam-editing-tutorial/ — touches numériques, superpositions, Delete revient à l'angle précédent, étalonnage sur sources.
11. The Interview: Creating a Multicam Sequence (Noble Desktop) — https://nobledesktop.com/learn/premiere-pro/the-interview-creating-a-multicam-sequence — réglages précis, Linked Selection, raccourcis C/V/N, rouler une coupe.
12. Premiere Pro multi-cam sync quick tip (PremiumBeat) — https://www.premiumbeat.com/blog/premiere-pro-multi-cam-sync-quick-tip — son de travail par caméra + enregistreur séparé, claquoir.
13. Multi Camera Editing Tip In Premiere Pro (LensVid) — https://lensvid.com/post-processing/multi-camera-editing-tip-premiere-pro/ — audio sur chaque caméra, Camera 1 comme source, touches numériques.
14. How To Edit Multicam on Adobe Premiere Pro (Gling)* — https://www.gling.ai/blog/how-to-edit-multicam-on-adobe-premiere-pro — options de synchro (audio, timecode, in/out, marqueur), réglages audio Camera 1 / All Cameras / Switch Audio, erreurs de synchro.
15. Create a multi-camera source sequence (Adobe) — https://helpx.adobe.com/premiere-pro/using/create-multi-camera-source-sequence.html — page officielle (seul le sommaire a pu être lu ; détails confirmés par les sources 9 à 14).
16. Dérusher et synchroniser une interview (Elephorm) — https://www.elephorm.com/formation/maitriser-premiere-2026/derusher-et-synchroniser-une-interview — dérushage dans une séquence séparée, code couleur retenu/écarté, synchro manuelle.
17. Techniques avancées de montage multicaméra (Elephorm) — https://www.elephorm.com/formation/maitriser-final-cut-pro-12-les-fondamentaux/techniques-avancees-de-montage-multicamera-choix-du-son-selection-des-plans-et-derushage — choisir le son avant, séparer audio et vidéo, réversibilité.
18. Interview Video Editing (Edición Vídeo Pro)* — https://edicionvideopro.com/en/editing-techniques/interview-video-editing — 30-45 s de B-roll par minute, couvrir les jump cuts, structure de préparation (page commerciale, repère).
19. B-Roll and Cutaways: Hiding Edits and Adding Visual Information (Cursa) — https://cursa.app/en/page/b-roll-and-cutaways-hiding-edits-and-adding-visual-information — plan à cheval sur la coupe, retour sur frontière de phrase, erreurs.
20. Morph Cut – Tips & Tricks for Best Results (Adobe Blog) — https://blog.adobe.com/en/publish/2015/06/18/morph-cut-tips-tricks-for-best-results — conditions d'usage du morph cut, échecs, gaps courts.
21. How to Fix Audio Sync Drift… Premiere and Audition (4K Shooters) — https://www.4kshooters.net/2019/01/12/how-to-fix-audio-sync-drift-in-your-videos-using-adobe-premiere-pro-and-audition — procédure d'étirement dans Audition.
22. 6 'Rules' for Good Cutting (No Film School) — https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch — hiérarchie émotion > histoire > rythme > regard > plan > espace.
23. How and when to make Jump cuts, L-cuts, and J-cuts (Vimeo) — https://vimeo.com/blog/post/guide-to-film-cuts — usages de J/L en dialogue, précaution sur sous-titres.
24. What Is the 30-Degree Rule in Film? (Filmdaft) — https://filmdaft.com/what-is-the-30-degree-rule-in-film/ — règle des 30°, exceptions, application interview, punch-in.
25. Podcast multi-camera clip strategy (Conbersa)* — https://www.conbersa.ai/learn/podcast-multi-camera-clip-strategy — nombre de caméras, durées de plan 3-5 s, seuil 7 s (blog commercial, repères).
26. Edit a podcast in Premiere Pro (AutoCut blog)* — https://www.autocut.com/en/blogs/edit-podcast-premiere-pro/ — 48 kHz unique, locuteurs étiquetés, niveaux égaux entre voix (blog d'éditeur de plugin).

## Ce qui manque encore (pour l'auteur du dépôt)
- Outil de bascule d'angle multicam (`ppro_set_multicam_angle` ou équivalent) absent du catalogue ; à ajouter pour exécuter P5.
- Aucun chiffre sourcé pour la fréquence de rafraîchissement du plan large, ni pour le seuil précis de silence en conversation : à calibrer sur des cas réels.
- Raccourcis d'enregistrement multicam, Flatten et Synchronize à vérifier dans l'interface de la version installée.
