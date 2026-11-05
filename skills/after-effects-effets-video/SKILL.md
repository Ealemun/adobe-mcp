---
name: "after-effects-effets-video"
description: "Prépare et vérifie les effets sur vidéo réelle dans After Effects : suivi de mouvement, grosse tête, flou de visage, caméra 3D, Roto Brush, fond vert Keylight, stabilisation, ralenti, Content-Aware Fill, aller-retour Premiere par Dynamic Link. À utiliser dès qu'on parle de tracking qui glisse, coller un objet sur une tête, détourer, incruster un fond vert, ralentir un plan ou « remplacer par une composition After Effects ». Pas pour animer texte ou formes (after-effects-motion-design) ni pour les effets simples de Premiere (transitions-effets-premiere)."
---

# Effets sur vidéo réelle dans After Effects

L'agent connaît déjà les menus d'After Effects et le principe du tracking, du keying et du roto : ne les récite pas. Ce skill ajoute ce qui manque par défaut : **chiffrer** le plan (déplacements, décrochages, cadences, versions) avant de choisir un réglage, puis vérifier image par image au lieu de supposer qu'une analyse a réussi.

## Principes

1. **Un plan isolé par comp, un seul niveau d'imbrication** : un suivi court dérive moins. Dynamic Link exige des versions **identiques** de Premiere et d'AE (sinon option grisée ou comp vide) et un .aep qui ne bouge plus. Sinon, ou pour un plan lourd/livré : exporter la plage avec 1–2 s de poignées, traiter, rendre en ProRes 4444 (alpha), réimporter au même temps. Après Render and Replace, les modifs AE ne remontent plus avant Restore Unrendered.
2. **Choisir le type de suivi en mesurant, pas à l'œil.**

   | Mesure entre deux repères de la cible sur le plan | Suivi |
   |---|---|
   | distance stable (< 5 %) et angle stable (< 3°) | 1 point, Position |
   | distance ou angle qui varie | 2 points, Position + Scale + Rotation |
   | surface plane vue en perspective (écran, panneau) | 4 points, Corner Pin |
   | décor 3D, caméra qui bouge | Track Camera (erreur moyenne < 1 px, 0,7 = bon) |

3. **Zone de recherche dimensionnée sur le déplacement réel max entre deux images** (décrochages exclus) : `recherche ≥ forme + 2 × déplacement max`. Trop petite, le tracker saute ; trop grande, il accroche un voisin.
4. **Suivi appliqué à un nul « TRK », élément parenté au nul** : on retracke ou recadre sans écraser l'élément.
5. **Un décrochage se retracke, il ne se lisse pas** : revenir à la dernière image juste, corriger la zone, relancer de là ; lisser masque le saut mais l'élément flotte. Un point qui saute pendant que le second bouge à peine = décrochage, pas mouvement.
6. **Grosse tête** : dupliquer, masque ovale adouci 20–40 px, échelle 120–140 % avec le point d'ancrage au centre de la tête. La copie est de la vidéo : son contenu bouge déjà avec le sujet, donc **ne pas la parenter au nul** (mouvement et échelle seraient comptés deux fois) ; seuls le masque et le point d'ancrage suivent le nul (par expression `thisComp.layer("TRK").toComp([0,0])`, ou suivi du masque) ; au-delà, le bord « marche » sur le décor. Mesh Warp / Liquify ne suivent rien : plan fixe ou stabilisé seulement.
7. **Keylight dans l'ordre, en vue Screen Matte**, car chaque réglage suppose les précédents justes : masque poubelle → pipette près du sujet → Screen Gain 100 (≤ 110) / Balance ≈ 50 vert, ≈ 95 bleu → Clip Black 15–20 / Clip White 60–70 (Rollback 2–3 si les bords s'érodent) → Shrink/Grow −0,5 à −1, Softness 1, Despot 1–2 → despill. Un Gain > 110 ronge cheveux et bords fins.
8. **Ralenti : facteur propre = cadence séquence / cadence source** (50 fps dans 25 → 50 %, 100 fps → 25 %), obtenu par Interpret Footage > Conform. En dessous, Pixel Motion / Timewarp inventent des images qui bavent sur les croisements : le dire, nommer l'image à contrôler ou proposer le facteur propre.
9. **Stabiliser en premier** : Warp Stabilizer refuse un clip ralenti ou pas à la taille de la comp ; précomposer, stabiliser, puis ralentir. Zoom ≤ 150 %, sinon baisser le lissage.
10. **Compositer = faire croire** : Shutter Phase = −½ × Shutter Angle (180° → −90°), sinon le flou est décalé ; Match Grain ; ombre en Multiply 30–50 % ; bords adoucis 1–2 px. Roto Brush : trait au milieu du sujet, jamais sur le bord, Freeze à la fin.

## Méthode

1. **Mesurer** avec le script ci-dessous (clés de suivi, cadences) et lire versions et réglages actuels.
2. **Décider** chaque réglage à partir d'un chiffre mesuré (type de suivi, recherche, image de reprise, ralenti, Dynamic Link ou export).
3. **Proposer** les réglages dans l'ordre d'exécution, avec les numéros d'image concernés.
4. **Vérifier** sur des images nommées : début, mouvement le plus rapide, décrochage ou croisement, fin ; clé et roto sur fond rouge et en alpha (liseré, trou, clignotement).
5. **Appliquer** dans AE/Premiere via le skill `adobe-editing` (checkpoint, plan annoncé). Sans logiciel ouvert, livrer les réglages chiffrés et la liste d'images à contrôler.

## Vérification

```python
# check_ae.py — usage : python check_ae.py plan.json
# plan.json : {"forme":20, "recherche":60, "track":[{"f":0,"p1":[x,y],"p2":[x,y]}, ...],
#              "fps_seq":25, "clips":[{"nom":"A","fps":50,"vitesse":40}, ...]}  (clés optionnelles)
import json, math, sys, statistics as st
d = json.load(open(sys.argv[1]))
if "track" in d:
    t = d["track"]
    # Déplacement image à image du point 1
    dep = [math.dist(a["p1"], b["p1"]) for a, b in zip(t, t[1:])]
    med, sauts = st.median(dep), set()
    # Décrochage : saut > 3x la médiane alors que le point 2 bouge peu (< 1/3 du saut)
    for i, v in enumerate(dep):
        d2 = math.dist(t[i]["p2"], t[i+1]["p2"]) if "p2" in t[i] else v
        if v > 3 * med and d2 < v / 3:
            sauts.add(i)
            print(f"décrochage probable image {t[i]['f']}→{t[i+1]['f']} ({v:.0f} px, p2 {d2:.0f} px)")
    # Mouvement réel le plus rapide (sauts exclus) et zone de recherche minimale
    i_max = max((i for i in range(len(dep)) if i not in sauts), key=dep.__getitem__)
    print(f"déplacement max {dep[i_max]:.0f} px (images {t[i_max]['f']}→{t[i_max+1]['f']})")
    if "forme" in d:
        mini = d["forme"] + 2 * dep[i_max]
        print(f"recherche ≥ {mini:.0f} px (actuelle {d.get('recherche')})")
    # Variation d'échelle et de rotation entre p1 et p2 : décide 1 ou 2 points
    # (images entre un saut aller et un saut retour exclues)
    s = sorted(sauts); hors = {k for a, b in zip(s[::2], s[1::2]) for k in range(a + 1, b + 1)}
    ok = [f for k, f in enumerate(t) if k not in hors]
    if "p2" in t[0]:
        dist = [math.dist(f["p1"], f["p2"]) for f in ok]
        ang = [math.degrees(math.atan2(f["p2"][1]-f["p1"][1], f["p2"][0]-f["p1"][0])) for f in ok]
        print(f"échelle {100*(max(dist)/min(dist)-1):.0f} %, rotation {max(ang)-min(ang):.1f}°")
# Ralenti : facteur propre = fps séquence / fps source
for c in d.get("clips", []):
    propre = 100 * d["fps_seq"] / c["fps"]
    verdict = "Conform, sans interpolation" if c["vitesse"] >= propre - 0.01 else "interpolation nécessaire"
    print(f"clip {c['nom']} : voulu {c['vitesse']} %, propre ≥ {propre:.1f} % → {verdict}")
```

## Pièges observés

- **Déplacement max calculé avec le décrochage inclus** : la zone de recherche est alors dimensionnée sur l'erreur ; exclure les sauts d'abord.
- **Position seule sur une tête qui s'approche ou tourne** : l'élément garde sa taille et glisse ; mesurer distance et angle entre deux repères.
- **Décrochage lissé ou clés supprimées** au lieu de retracker depuis l'image juste précédente.
- **Ralenti sous le facteur propre annoncé comme propre** (25 fps à 50 %, 50 fps à 40 %) : annoncer l'interpolation et l'image à contrôler.
- **Dynamic Link proposé sans lire les versions** : sinon, voie export avec poignées.
- **Réglages existants conservés sans examen** (phase du flou, Screen Gain, contour du masque, échelle) : relire chaque valeur actuelle contre les seuils ci-dessus.
