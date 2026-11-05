---
name: "transitions-effets-premiere"
description: "Décide et vérifie transitions, keyframes, vitesse et effets dans Premiere Pro : poignées selon l'alignement, durées en images, easing, ralenti propre selon la cadence source, speed ramp, Warp Stabilizer, masque suivi, Morph Cut. À utiliser dès qu'on parle de fondu, transition, whip pan, keyframe, ralenti, speed ramp, stabiliser, flouter un visage ou cacher un jump cut. Pas pour le rythme des coupes (montage-fondamentaux), l'animation (after-effects-motion-design) ni le compositing After Effects (after-effects-effets-video)."
---

# Transitions, keyframes et vitesse dans Premiere Pro

L'agent connaît déjà les menus de Premiere et la grammaire des transitions (coupe par défaut, fondu = temps qui passe) : ne les récite pas. Ce skill ajoute ce qui fait échouer en pratique : les poignées calculées selon l'alignement, la limite chiffrée du ralenti propre, l'easing dans le bon sens et les refus de Premiere à anticiper.

## Principes

1. **Une transition se justifie par un changement** (lieu, temps, section). Dans une scène continue, coupe sèche : un fondu ou une plongée au noir y annonce un saut de temps qui n'existe pas.
2. **Durées en images, une seule durée par défaut par projet** (secondes = images / fps) :

   | Transition | Durée | Condition |
   |---|---|---|
   | Fondu enchaîné | 8–12 im. à 24/25 i/s (0,3–0,5 s), ≤ 1 s en intro | changement de lieu ou de moment |
   | Plongée au noir / blanc | 0,5–1,5 s | fin de section, grand saut de temps |
   | Whip pan, zoom maison | recouvrement 6–12 im. | mouvement réel des deux côtés, même sens |
   | Son sur la coupe | fondu Constant Power ou J/L-cut 6–15 im. | chaque transition image en a un |

3. **Poignées selon l'alignement**, sinon images figées (« Insufficient media »). Poignée de fin de A = durée source − point de sortie ; poignée de début de B = point d'entrée (en temps séquence, diviser par vitesse/100). Centrée : d/2 de chaque côté. Début au point de coupe : fin de A ≥ d. Fin au point de coupe : début de B ≥ d. Changer d'alignement règle souvent le problème sans raccourcir ; sinon durée centrée max = 2 × min(poignées), ou coupe.
4. **Ease Out sur la première clé, Ease In sur la dernière** : le nom décrit la clé (on la quitte en douceur, on arrive en freinant) ; inversé, le mouvement part sec et s'arrête net. Mouvement de texte ou d'interface : 0,3–0,5 s.
5. **Ralenti propre tant que vitesse ≥ fps séquence / fps source** (50 → 25 : 50 % ; 100 → 25 : 25 % ; 25 → 25 : 100 %). Au-dessus, échantillonnage d'images suffit et l'interpolation n'ajoute que des artefacts. En dessous, Premiere duplique des images : flux optique, repli fusion d'images si mains, jambes, eau ou cheveux se déforment, ou moins ralentir.
6. **Nouvelle durée = durée source / (vitesse/100).** Un clip allongé écrase le suivant : Propager (ripple), puis recalculer toutes les positions suivantes et la durée totale.
7. **Speed ramp : trois paliers, clés scindées en courbe**, ralenti calé sur le moment clé ou un temps fort musical ; non scindée, la rampe se lit comme une coupe.
8. **Stabilisation** : Lissage 50 %, Sous-espace ; lignes qui ondulent → Position-échelle-rotation. Recadrage auto > ~115 % : baisser le lissage ou synthétiser les bords, la perte de définition se voit plus que le tremblement. Ne pas stabiliser un mouvement voulu.
9. **Morph Cut** seulement sur plan fixe, un sujet, fond immobile, tête au même endroit, coupe dans une pause ; sinon cutaway ou fondu court.
10. **Masque suivi** : contour adouci, contrôle toutes les 0,5 s, car le suivi dérive aux rotations et occultations. **Composition After Effects** seulement si Premiere ne sait pas faire, puis Rendre et remplacer avant livraison.

## Méthode

1. **Mesurer** : fps séquence et source, entrée/sortie, durée source de chaque clip touché.
2. **Décider** coupe par coupe : raison de la transition, sinon coupe ; poignées et alignement ; limite de ralenti.
3. **Proposer deux tableaux** : `coupe | transition | images / s | alignement | poignées A/B | son | raison` et `clip | fps source | vitesse | interpolation | nouvelle durée | nouvelle position`.
4. **Vérifier** avec le script, corriger, revérifier ; relire chaque affirmation de synthèse contre les tableaux.
5. **Appliquer** via `adobe-editing` (checkpoint, séquence dupliquée), puis contrôler une image au milieu de chaque transition et après rendu pour stabilisation et Morph Cut.

## Vérification

```python
# check_transitions.py — usage : python check_transitions.py plan.json
# plan.json : {"fps":25, "clips":[{"id","src_in","src_out","src_dur","src_fps","speed"}...] (ordre timeline),
#              "transitions":[{"a","b","frames","align":"centre|debut|fin"}...]}  (temps source en s)
import json, sys
p = json.load(open(sys.argv[1])); fps = p["fps"]; c = {k["id"]: k for k in p["clips"]}; pb = []
f = lambda k: k.get("speed", 100) / 100              # facteur de vitesse
for t in p["transitions"]:
    d = t["frames"] / fps                           # durée de la transition en s
    A, B = c[t["a"]], c[t["b"]]
    fin_A = (A["src_dur"] - A["src_out"]) / f(A)    # matière après la sortie de A
    deb_B = B["src_in"] / f(B)                      # matière avant l'entrée de B
    besoin = {"centre": (d/2, d/2), "debut": (d, 0), "fin": (0, d)}[t["align"]]
    if fin_A < besoin[0] - 1e-6 or deb_B < besoin[1] - 1e-6:
        pb.append(f"{t['a']}→{t['b']} : poignées {fin_A:.2f}/{deb_B:.2f} s < {besoin} ; "
                  f"centrée max {2*min(fin_A, deb_B)*fps:.0f} im.")
pos = 0.0
for k in p["clips"]:                                # positions recalculées (ripple)
    duree = (k["src_out"] - k["src_in"]) / f(k)
    limite = 100 * fps / k.get("src_fps", fps)     # vitesse minimale sans interpolation
    if k.get("speed", 100) < limite - 1e-6:
        pb.append(f"{k['id']} : {k['speed']} % < {limite:.0f} % → interpolation nécessaire")
    print(f"{k['id']} : {pos:.2f}–{pos + duree:.2f} s ({duree:.2f} s)"); pos += duree
print(f"Durée totale {pos:.2f} s"); print("OK" if not pb else "\n".join(pb))
```

## Pièges observés

- **Easing inversé** (Ease In sur la première clé) : vérifier chaque paire de clés, c'est l'erreur la plus fréquente.
- **Poignée vérifiée du mauvais côté** : « Début au point de coupe » consomme la fin de A, pas le début de B ; une poignée nulle sur B se règle souvent ainsi.
- **Interpolation partout** : flux optique sur un 50 i/s ralenti à 50 % en séquence 25 crée des artefacts sans rien apporter.
- **Ripple oublié** : nouvelle durée calculée mais positions suivantes et durée totale non mises à jour.
- **Warp Stabilizer + vitesse sur le même clip** : Premiere refuse (de même si les dimensions du clip diffèrent de la séquence). Régler la vitesse, imbriquer le clip, stabiliser l'imbrication.
- **Whip pan entre deux plans fixes** : sans mouvement réel il se lit comme un glitch ; préférer coupe ou fondu. Le flou directionnel assombrit les bords : agrandir légèrement le plan.
- **Transitions partout « pour adoucir »**, durées disparates, et son coupé sec sous un fondu image.
