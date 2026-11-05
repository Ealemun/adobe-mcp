---
name: "titres-texte-sous-titres"
description: "Chiffre et contrôle le texte à l'écran dans Premiere/After Effects : tailles, zones de sécurité 16:9 et 9:16, temps de lecture, lower thirds, sous-titres (car./ligne, CPS, durées, écarts, calage sur les coupes, SDH), MOGRT. À utiliser dès qu'il est question de titre, carton, lower third, texte incrusté, sous-titres, SRT/VTT, légendes ou captions, même sans Premiere ouvert. Pas pour l'animation avancée (after-effects-motion-design), le short vertical complet (montage-vertical-shorts) ni l'export (export-livraison-workflow)."
---

# Texte à l'écran et sous-titres

L'agent connaît déjà les menus de Premiere et la typographie générale : ne les récite pas. Ce skill apporte les seuils à mesurer, car un défaut de texte est presque toujours un dépassement chiffrable.

## Principes

1. **Corps de police à 1080 px de haut** (×H/1080 sinon ; en 9:16, largeur 1080). Plancher 40 px (≈ 28 px de capitale), sauf la fonction d'un lower third : en dessous, la compression le rend illisible sur téléphone.

   | Usage | Corps | Graisse | Durée à l'écran |
   |---|---|---|---|
   | Titre plein cadre | 100–140 | 700–800 | 1,5–3 s |
   | Titre de chapitre | 56–72 | 700 | 1,5–3 s |
   | Call-out, statistique | 40–56 | 600–700 | 2–4 s |
   | Lower third nom / fonction | 44–65 / 26–32 | 600–700 / 400 | 3–6 s |
   | Sous-titre incrusté 16:9 | 40–60 | 500–700 | voir 7 |
   | Caption 9:16 phrase / mot à mot | 60–75 / 70–90 (max 100) | 700–900 | carte ≥ 0,3 s |

2. **Temps de lecture** : partie stable (animations exclues) ≥ mots × 0,3 s, confortable mots × 0,6 s : un texte qui bouge ne se lit pas.
3. **Zones, sur la boîte englobante et non sur le point d'ancrage.** 16:9 1920×1080 : texte dans x 192–1728, y 108–972 (title safe 80 %). 9:16 : boîte 900×1400 centrée (x 90–990, y 260–1660), captions entre 370 et 720 px du bas, rien à droite de x ≈ 920 : l'interface des plateformes les recouvre.
4. **Blanc sur image = renfort** (contour 2 px, ombre ou boîte noire 70–80 %), graisse ≥ 600 : l'image change sous le texte. Deux familles de polices au plus.
5. **Lower third** : début = parole + 1–2 s, durée 3–6 s, à la première apparition, entre deux coupes ; même position et durée pour tous.
6. **Animation** : entrée ease-out 0,4–0,6 s, sortie ease-in 0,3–0,4 s (0,2–0,4 s en court), en nombre entier d'images (à 25 i/s, 0,5 s = 12,5 images : prendre 0,48 ou 0,52), sans rebond sur un texte informatif.
7. **Sous-titres** (CPS = caractères, espaces et ponctuation compris, hors saut de ligne, ÷ durée) :

   | Profil | Car./ligne | CPS max (cible) | Durée | Écart mini |
   |---|---|---|---|---|
   | Français web/streaming | 42 (viser 36–40) | 17 (15) | 1–6 s | 2 images |
   | Normes TV France | 36–40 | 15 (14) | 16 images–5 s | 4 images |
   | Anglais streaming | 42 | 20 (17) | 1–7 s | 2 images |
   | Format court mot à mot | 32 | — | carte ≥ 0,3 s | — |

   Deux lignes maximum ; coupure sur le sens (aucune ligne finie par un article, une préposition, un déterminant) ; bord à ≤ 7 images d'une coupe : début sur la coupe, fin 2 images avant, sinon il flashe sur l'autre plan. Synchro à ±3 images, pas avant la parole.
8. **Fichiers** : SRT/VTT en UTF-8, texte brut sans balises de style ; l'incrustation porte un style explicite. SDH : [sons, locuteur hors champ] en minuscules, musique ♪, pas de capitales d'emphase.
9. **MOGRT** : n'exposer que ce qui change ; une propriété animée exposée perd ses images-clés (piloter par expression) ; protéger intro/outro (Conception réactive – Temps).
10. **Noms propres** : signaler une graphie incohérente et demander, ne jamais l'« harmoniser » seul.

## Méthode

1. **Mesurer** : fps, coupes, début de parole ; par texte, boîte, corps, durée stable ; sous-titres : script.
2. **Décider** : chaque défaut cite sa valeur et la limite dépassée.
3. **Proposer** un tableau (`texte | début | fin | x, y, l, h | corps | renfort`) ; trop rapide : allonger dans les blancs, sinon condenser (le français est 15–20 % plus long que l'anglais).
4. **Revérifier** le livrable final avec le script jusqu'à « OK ».
5. **Appliquer** via `adobe-editing`, sinon livrer fichier + tableau.

## Vérification des sous-titres

```python
# usage : python check_srt.py fichier.srt 25 fr [sequence.json contenant "cuts": [s, ...]]
import json, re, sys
img = 1 / float(sys.argv[2])                                   # durée d'une image (s)
cps_max, dmax = (17, 6) if sys.argv[3] == "fr" else (20, 7)    # normes TV FR : dmax 5, écart 4 images
coupes = json.load(open(sys.argv[4]))["cuts"] if len(sys.argv) > 4 else []
mauvaise_fin = set("le la les un une des du de au aux à en et sur pour par avec dans mon ma ses ce".split())
def sec(t):                                                    # "HH:MM:SS,mmm" -> secondes
    h, m, s = t.strip().replace(",", ".").split(":"); return int(h) * 3600 + int(m) * 60 + float(s)
subs, pb = [], []
for bloc in re.split(r"\n\s*\n", open(sys.argv[1], encoding="utf-8").read().strip()):
    l = bloc.splitlines(); a, b = map(sec, l[1].split("-->"))
    if "<" in bloc: pb.append(f"#{l[0]} : balise de style")
    subs.append((l[0], a, b, [re.sub(r"<[^>]+>", "", x) for x in l[2:]]))
for k, (n, a, b, lignes) in enumerate(subs):
    car = len(" ".join(lignes))                                # espaces et ponctuation compris
    if len(lignes) > 2: pb.append(f"#{n} : {len(lignes)} lignes")
    pb += [f"#{n} : ligne de {len(x)} car." for x in lignes if len(x) > 42]
    pb += [f"#{n} : ligne finie par « {x.split()[-1]} »" for x in lignes[:-1] if x.split()[-1].lower() in mauvaise_fin]
    if car / (b - a) > cps_max: pb.append(f"#{n} : {car / (b - a):.1f} car./s")
    if not 1 - 1e-3 <= b - a <= dmax: pb.append(f"#{n} : durée {b - a:.2f} s")
    if k + 1 < len(subs) and subs[k + 1][1] - b < 2 * img - 1e-3: pb.append(f"#{n} : écart {subs[k + 1][1] - b:.2f} s")
    for c in coupes:                                           # calage : début sur la coupe, fin 0 à 2 images avant
        if 1e-3 < abs(a - c) <= 7 * img: pb.append(f"#{n} : début à {a - c:+.2f} s de la coupe {c}")
        if abs(b - c) <= 7 * img and not c - 2.5 * img <= b <= c + 1e-3: pb.append(f"#{n} : fin à {b - c:+.2f} s de la coupe {c}")
print(f"{len(subs)} sous-titres"); print("OK" if not pb else "\n".join(pb))
```

## Pièges observés

- **Ancre prise pour un bord.** La position d'un calque est souvent son centre : tester x ± l/2 et y ± h/2.
- **CPS sous-estimé.** Compter sans espaces fait passer 19 car./s pour 16 ; le seuil anglais (20) laisse passer du français à 17–20.
- **Vitesse corrigée en mangeant l'écart.** Allonger jusqu'à toucher le suivant ; garder 2 images, sinon condenser.
- **Bords près d'une coupe.** Une fin 3 images après la coupe flashe sur le plan suivant.
- **Lower third posé sur la coupe** au lieu de parole + 1–2 s, ou débordant sur le plan suivant.
- **Nom propre « corrigé ».** Choisir une graphie sans le dire ; lister la variante et demander.
- **« Tout est conforme » non vérifié.** Relancer le script sur le fichier livré.
