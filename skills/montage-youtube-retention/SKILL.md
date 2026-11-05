---
name: "montage-youtube-retention"
description: "Monte ou audite une vidéo YouTube longue (8 à 30 min) pour la rétention : hook, punch-ins, couverture B-roll, re-hooks et boucles ouvertes, place du sponsor, fin sans outro, chapitres, diagnostic d'une courbe de rétention. À utiliser dès qu'une vidéo YouTube décroche, que la durée moyenne ou la rétention est faible, ou qu'il faut dynamiser un talking head, un tuto ou placer chapitres et sponsor. Pas pour les Shorts (montage-vertical-shorts), le rythme de coupe général (montage-fondamentaux), le mix (audio-montage) ni les sous-titres (titres-texte-sous-titres)."
---

# Rétention YouTube long format

L'agent sait déjà qu'il faut un hook, du B-roll et des chapitres : ne le récite pas. Ce skill apporte les **seuils** qui tranchent, la **lecture causale d'une courbe** et un **audit calculé**.

## Principes

1. **Sujet énoncé avant 15 s, rien avant l'accroche** (logo, jingle, « bienvenue »), car chaque seconde sans promesse coûte des spectateurs. Sujet dit plus tard → le montage commence à cette seconde-là.
2. **Juger contre le typique de la chaîne** (10 dernières vidéos de durée proche), car son public fixe la barre. À défaut : Intro (% restant à 30 s) ≥ 60 % bon, < 50 % falaise ; visionnage moyen médian 30 % (5–15 min), 26 % (15–60 min).
3. **Une chute isolée vient des 10–15 s d'avant.** La même chute dans 3 vidéos sur 5 est une habitude de montage, pas un accident.
4. **Spike sur révélation ou démo** = rewatch (en faire plus) ; **sur instruction ou manip rapide** = manque de clarté (ralentir, texte, zoom).
5. **Les 5–20 dernières secondes chutent toujours** (écran de fin) : normal. Une chute qui démarre 30–60 s avant la fin signifie que le spectateur a senti la fin (récap, « en conclusion ») : couper l'outro, recommandation orale sous l'écran de fin.
6. **Sponsor et CTA juste après un re-hook**, pas après un point résolu : le spectateur satisfait n'a plus de raison de rester. CTA < 5 s, face caméra.

| Mesure | Seuil | Pourquoi |
|---|---|---|
| Plan face cam sans changement d'échelle ni B-roll | ≤ 40 s | au-delà, déclin lent |
| Punch-in | 110–115 % (source 1080p), ≤ 120 % (source 4K, séquence 1080p) | au-dessus, image molle |
| Écart entre deux punch-ins | ≥ 3 s, idéalement 8–15 s hors hook | plus serré = tic, fatigue |
| Couverture B-roll | 35–50 % (plans de 3–8 s) | < 30 % plat ; > 60 % présentateur absent |
| B-roll interdit sur | point clé, émotion, CTA, sponsor | le visage porte la crédibilité |
| Écart entre re-hooks | ≤ 3 min (cible 2–3 min) | chaque re-hook redonne une raison de rester |
| Boucles ouvertes | 2–3 avant 2 min, toutes fermées avant la fin | boucle non fermée = promesse trahie |
| Chapitres | 1er à 00:00, ≥ 3, chacun ≥ 10 s, ~1 toutes les 2–4 min | sinon YouTube les ignore tous |

## Méthode

1. **Mesurer** : CTR (faible avec rétention relative correcte = titre/miniature, pas montage), Intro, visionnage moyen, typique de la chaîne, horodatage des dips/spikes ; script sur la timeline.
2. **Décider** par forme : falaise d'intro → hook ; falaise isolée → les 10–15 s d'avant ; déclin lent → plans fixes, re-hooks espacés ; chute de fin anticipée → outro. Chaque correction cite un horodatage.
3. **Proposer** un plan classé intro → falaises → déclin → fin : timecode, cause, correction ; chapitres au format `00:00 Titre`.
4. **Vérifier** : timeline corrigée repassée au script jusqu'à « OK » ; chaque chiffre annoncé relu contre le calcul.
5. **Appliquer** via `adobe-editing` (checkpoint avant tout lot destructif ; images exportées à 0, 5, 15, 30 s : à 5 s, l'image ressemble à la miniature).

## Vérification

Timeline au format `{"duration":s, "source":"1080p"|"4K", "clips":[{"start","end","track":"A"|"broll","scale"}], "markers":[{"t","kind","id"}]}` avec `kind` ∈ rehook, loop-open, loop-close, cta, sponsor, chapter.

```python
# audit_retention.py — usage : python audit_retention.py timeline.json
import json, sys
tl = json.load(open(sys.argv[1])); D = tl["duration"]; pb = []
clips = sorted(tl["clips"], key=lambda c: c["start"])
A = [c for c in clips if c["track"] == "A"]; B = [c for c in clips if c["track"] == "broll"]
mk = lambda k: sorted(m["t"] for m in tl["markers"] if m["kind"] == k)
couvert = lambda t: any(c["start"] <= t < c["end"] for c in B)   # un B-roll recouvre-t-il l'instant t ?
# 1. Couverture B-roll en % de la durée, et aucun B-roll sur un CTA ou un sponsor
cov = 100 * sum(c["end"] - c["start"] for c in B) / D
if not 35 <= cov <= 50: pb.append(f"B-roll {cov:.1f} % hors 35–50 %")
pb += [f"B-roll sur CTA/sponsor à {t} s" for t in mk("cta") + mk("sponsor") if couvert(t)]
# 2. Punch-ins : échelle max selon la source, et au moins 3 s entre deux changements d'échelle
smax = 115 if tl["source"] == "1080p" else 120
pb += [f"punch-in {c['scale']} % à {c['start']} s > {smax} %" for c in A if c["scale"] > smax]
chg = [b["start"] for a, b in zip(A, A[1:]) if a["scale"] != b["scale"]]
pb += [f"deux zooms à {x} et {y} s (< 3 s)" for x, y in zip(chg, chg[1:]) if y - x < 3]
# 3. Plan fixe : intervalle entre deux changements (échelle, début/fin de B-roll) sans B-roll, > 40 s
ev = sorted({0, D, *chg, *[t for c in B for t in (c["start"], c["end"])]})
pb += [f"plan fixe {x}–{y} s > 40 s" for x, y in zip(ev, ev[1:]) if y - x > 40 and not couvert((x + y) / 2)]
# 4. Re-hooks : aucun écart > 180 s
pts = [0] + mk("rehook") + [D]
pb += [f"pas de re-hook entre {x} et {y} s ({y - x:.0f} s)" for x, y in zip(pts, pts[1:]) if y - x > 180]
# 5. Boucles : chaque loop-open a un loop-close de même id
ouv = {m["id"] for m in tl["markers"] if m["kind"] == "loop-open"}
fer = {m["id"] for m in tl["markers"] if m["kind"] == "loop-close"}
pb += [f"boucle « {i} » jamais fermée" for i in ouv - fer]
# 6. Chapitres : 00:00, au moins 3, chacun ≥ 10 s
ch = mk("chapter")
if not ch or ch[0] != 0 or len(ch) < 3: pb.append(f"chapitres invalides (départ {ch[:1]}, {len(ch)} chapitres)")
pb += [f"chapitre à {x} s dure {y - x:.0f} s (< 10 s)" for x, y in zip(ch, ch[1:] + [D]) if y - x < 10]
print(f"{D:.0f} s, B-roll {cov:.1f} %, {len(chg)} punch-ins")
print("OK" if not pb else "\n".join(pb))
```

## Pièges observés

- **« 31 %, au-dessus de la moyenne YouTube »** alors que la chaîne fait 38 % : écrire le typique de la chaîne à côté de chaque chiffre.
- **Sponsor déplacé après le point résolu suivant** : même falaise ailleurs. Le placer après un re-hook.
- **Spike sur une manip rapide salué comme un succès** : c'est de l'incompréhension ; ralentir, ajouter du texte.
- **« Corriger » la chute des 15 dernières secondes** (écran de fin) et laisser le récap qui fait chuter 60 s avant la fin.
- **Chapitres réparés à moitié** : 00:00 corrigé mais chapitre de 6 s gardé, ou timecodes non décalés après une coupe.
- **Zoom 125 % sur source 1080p** « pour l'impact » : image molle ; rester ≤ 115 % ou passer en B-roll.
