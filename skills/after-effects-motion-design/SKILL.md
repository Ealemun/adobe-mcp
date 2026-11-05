---
name: "after-effects-motion-design"
description: "Règle le timing et l'easing des animations After Effects en valeurs exactes (images selon la cadence, vitesse et influence des clés, décalages) et les vérifie par calcul : titres, lower thirds, typo cinétique, compteurs, boucles, expressions, MOGRT. À utiliser dès qu'une animation « fait raide » ou « cheap », ou qu'on demande un titre animé, un compteur, un wiggle, une boucle ou un modèle pour Premiere. Pas pour tracking, roto ou fond vert (after-effects-effets-video), ni pour la mise en page des textes et sous-titres (titres-texte-sous-titres)."
---

# After Effects : timing, easing et expressions

L'agent connaît déjà les principes de l'animation, l'interface d'After Effects et les expressions courantes : ne les récite pas. Ce skill ajoute des durées pensées **en ms puis converties à la cadence**, le bon côté de chaque easing, les limites d'After Effects qui cassent un projet sans prévenir, et un contrôle chiffré avant de livrer.

## Principes

1. **Raisonner en ms, livrer en images** (images = ms × fps / 1000), car les seuils sont perceptifs : « 12 images » à 30 i/s devient deux fois trop rapide à 60 i/s. Sous 200 ms, un mouvement se lit comme une coupe.

   | Mouvement | Durée | 25 i/s | 30 i/s | 60 i/s |
   |---|---|---|---|---|
   | Petit élément (icône, puce) | 200–300 ms | 5–8 | 6–9 | 12–18 |
   | Entrée de titre, grand déplacement, rebond | 400–500 ms | 10–13 | 12–15 | 24–30 |
   | Sortie | 270–330 ms | 7–8 | 8–10 | 16–20 |
   | Décalage entre éléments voisins | 70–130 ms | 2–3 | 2–4 | 4–8 |
2. **Entrée plus lente que la sortie** : on lit ce qui arrive, pas ce qui part.
3. **L'easing se met du côté où l'objet est à l'arrêt.** Entrée (« ease-out » en CSS) : clé d'arrivée à vitesse 0 et influence entrante 75–90 %, départ linéaire pour démarrer vite ; sortie : l'inverse ; déplacement A → B : les deux côtés, F9 (vitesse 0, influence 33,3 %) au minimum. `cubic-bezier(x1,0,x2,1)` = influences 100·x1 (départ) et 100·(1−x2) (arrivée) : `(0.4,0,0.2,1)` → 40 % / 80 %.
4. **Linéaire seulement pour le mouvement continu** (rotation infinie, défilement) : ailleurs, une clé linéaire est un oubli.
5. **Départs décalés** entre éléments voisins (tableau), sinon le bloc bouge comme une seule image.
6. **Dépassement de 5 à 15 % de la course** (poignée d'arrivée dans le graphe de valeur, dimensions séparées) : au-delà, ça fait cartoon.
7. **Flou de mouvement** dès que Position, Échelle ou Rotation change en moins de 500 ms : interrupteur du calque **et** de la comp, car un seul ne produit aucun flou.
8. **Interface en ligne droite** : interpolation spatiale linéaire, car Bézier auto courbe le chemin dès 3 clés.
9. **Tenue lisible** : 3 à 6 s immobile entre fin d'entrée et début de sortie pour un lower third.

## Expressions utiles

```js
// Wiggle bouclé (période dur en s), axe X seul
freq = 4; amp = 30; dur = 2; t = time % dur;
w = linear(t, 0, dur, wiggle(freq, amp, 1, 0.5, t), wiggle(freq, amp, 1, 0.5, t - dur));
[w[0], value[1]];
// Compteur sur Texte source, cible en milliers (curseur plafonné à 1 000 000)
n = Math.round(ease(time, 0, 2, 0, effect("Cible (milliers)")(1) * 1000));
n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");   // 1250000 -> "1 250 000"
```

## Méthode

1. **Mesurer** : cadence, interrupteurs de flou, et pour chaque segment son rôle, ses clés en images, vitesse et influence aux deux bouts → `anim.json`.
2. **Décider** durée cible (ms) et côté de l'easing de chaque segment.
3. **Proposer clé par clé**, en images **et** en ms, avec la raison de chaque changement.
4. **Vérifier** avec le script ci-dessous (phrases de synthèse comprises), corriger, revérifier.
5. **Appliquer** via `adobe-editing` (outils `aeft_*`) ; en script, F9 = `KeyframeEase(0, 33.33)` des deux côtés. Sinon, livrer valeurs et ordre de saisie.

## Vérification

```python
# check_anim.py — usage : python check_anim.py anim.json
# {"fps":60,"comp_blur":true,"layers":[{"name":"Titre","blur":true,"texte":true,"segments":[{"role":"entree",
#  "prop":"Position","t0":0,"t1":27,"interp":"bezier","out_speed":2000,"out_infl":0,"in_speed":0,"in_infl":85}]}]}
import json, sys
a = json.load(open(sys.argv[1])); fps = a["fps"]; pb = []; debuts = []
ms = lambda f: round(f * 1000 / fps)                       # images -> millisecondes
for c in a["layers"]:
    n, segs = c["name"], c["segments"]
    for s in segs:
        r, d, p = s["role"], ms(s["t1"] - s["t0"]), f"{n}/{s['prop']}"
        if r != "continu":                                 # le continu échappe aux règles de durée
            if d < 200: pb.append(f"{p} : {d} ms < 200 ms, lu comme une coupe")
            if r in ("entree", "sortie") and d > 500: pb.append(f"{p} : {r} de {d} ms > 500 ms")
            if s["interp"] == "linear": pb.append(f"{p} : interpolation linéaire hors mouvement continu")
        # easing du côté où l'objet est à l'arrêt : arrivée d'une entrée, départ d'une sortie
        if r == "entree" and (s["in_speed"] != 0 or s["in_infl"] < 60): pb.append(f"{p} : arrivée pas amortie")
        if r == "sortie" and (s["out_speed"] != 0 or s["out_infl"] < 60): pb.append(f"{p} : départ pas amorti")
        if s["prop"] in ("Position", "Echelle", "Rotation") and d < 500 and not (c["blur"] and a["comp_blur"]): pb.append(f"{p} : sans flou")
    ent = [s for s in segs if s["role"] == "entree"]; sor = [s for s in segs if s["role"] == "sortie"]
    if ent and sor:                                        # entrée plus longue que la sortie, tenue lisible
        if max(ms(s["t1"] - s["t0"]) for s in sor) >= max(ms(s["t1"] - s["t0"]) for s in ent):
            pb.append(f"{n} : sortie pas plus courte que l'entrée")
        tenue = (min(s["t0"] for s in sor) - max(s["t1"] for s in ent)) / fps
        if c.get("texte") and not 3 <= tenue <= 6: pb.append(f"{n} : tenue de {tenue:.2f} s hors 3–6 s")
    if ent: debuts.append((min(s["t0"] for s in ent), n))
debuts.sort()                                              # décalage minimal entre départs voisins
for (f1, n1), (f2, n2) in zip(debuts, debuts[1:]):
    if ms(f2 - f1) < 70: pb.append(f"{n1} → {n2} : départs à {ms(f2 - f1)} ms d'écart (< 70 ms)")
print("OK" if not pb else "\n".join(pb))
```

## Pièges observés

- **Recette en images copiée d'une autre cadence.** Repartir des ms du tableau ; annoncer les deux unités.
- **Easing du mauvais côté.** « Easy Ease Out » (Ctrl+Maj+F9) sur la clé de départ d'une entrée la fait démarrer lentement et arriver sèchement : *In* désigne le côté entrant de la clé sélectionnée, donc Maj+F9 sur la clé d'arrivée.
- **Sélecteur de plage à l'envers.** Les caractères *sélectionnés* reçoivent les valeurs de l'animateur (Opacité 0, Y +60) : une apparition anime le Décalage de 0 → 100 % (la sélection quitte le texte) ; −100 → 0 % fait disparaître le texte. Forme Rampe plutôt que Carré, adoucissement 50/50 et non 100/100.
- **Boucle rendue avec une image de trop.** Clés identiques à 0 et N : la comp dure N images (0 à N−1), sinon l'image 0 est doublée et la boucle saccade. Un `wiggle()` brut ne boucle pas et agit sur tous les axes : formule ci-dessus.
- **Curseur plafonné en silence.** Un Contrôle Curseur plafonne à ±1 000 000 avec 2 décimales : saisir en milliers et `Math.round`, sinon le compteur s'arrête faux ou affiche des décimales.
- **MOGRT surchargé ou figé.** 3 à 5 contrôles (texte, couleur, une valeur) ; durée variable dans Premiere = régions protégées d'intro et d'outro (Conception réactive – Temps), sinon la sortie est coupée ; police hors Adobe Fonts = police manquante chez le monteur.
