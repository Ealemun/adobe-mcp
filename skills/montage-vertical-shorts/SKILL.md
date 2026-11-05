---
name: "montage-vertical-shorts"
description: "Transforme une vidéo longue ou un podcast 16:9 en short vertical 1080x1920 et audite un short avant publication : choix du point d'entrée, recadrage chiffré (Scale, Position x), zones d'interface, débit et placement des sous-titres, boucle, musique, export. À utiliser dès qu'on parle de short, TikTok, Reels, format vertical, 9:16, « sortir des clips » d'un live ou d'un podcast, même sans Premiere ouvert. Pas pour le rythme général (montage-fondamentaux), le style des titres (titres-texte-sous-titres) ni l'export détaillé (export-livraison-workflow)."
---

# Short vertical : du 16:9 au 1080x1920

L'agent connaît hook, boucle et Auto Reframe : ne pas les expliquer. Ce skill ajoute le **calcul** : recadrage et zones d'interface au pixel, débit des sous-titres, point d'entrée sans dépendance au contexte.

## Principes

1. **Entrée sur la phrase forte, pas sur ce qui l'amène.** Un renvoi (« comme je disais », « ça » sans référent, la question posée) exige la vidéo longue : in point dans le blanc avant la première phrase autonome. Image 0 = sujet visible, sans fondu au noir (c'est la miniature) ; premier mot avant 0,3 s ; accroche dite avant 2,5 s (swipe en 3 s).
2. **Sortie juste après le payoff.** Couper sur la réaction ou une demi-phrase qui reboucle ; pas d'outro ni d'appel à s'abonner, qui cassent la boucle. 1 à 2 s stables avant la fin.
3. **Durée et respiration.** 15–60 s (45–60 s pour un podcast). Pauses > 0,5 s ramenées à 0,2–0,3 s, durée **recalculée**. Plan fixe : viser 3 s, plafond 5 s (punch-in 112–115 %, B-roll).
4. **Recadrage pleine hauteur, calculé.** Pour une source L×H dans 1080×1920 : `k = 1920/H` (177,78 % en 1080p, 88,89 % en 2160p) ; `Position x = 540 + (L/2 − x_visage) × k`, bornée à `[1080 − L·k/2 ; L·k/2]` (soit −626,7 à 1706,7 en 1080p) sinon bord noir. Largeur visible de la source : `1080/k` = 607,5 px sur 1920.
5. **Position y figée.** En pleine hauteur, Position y = 960 : les yeux restent à leur hauteur source (cible 30–40 %). Les remonter exige `k' ≥ 1248 / (H − y_yeux)` ; au-delà de 200 % sur du 1080p, préférer le fond flou.
6. **Choisir la stratégie selon le cadre :**

   | Situation | Décision |
   |---|---|
   | Un visage, caméra fixe | Position x calculée par plan (ou Auto Reframe « Slower Motion ») |
   | Sujet mobile, sport | Auto Reframe « Default » / « Faster », ou keyframes seulement quand le visage sort des 60 % centraux, ≤ 2/s |
   | Deux visages écartés de plus de ~400 px dans la source (607,5 px visibles) | Split-screen 2 × 1080×960, coupe vers les gros plans ou fond flou : un centrage en coupe un |
   | Capture d'écran, titre 16:9 | Image à 56,25 % sur copie floutée à 177,8 % ; refaire les titres |

7. **Zone sûre multiplateforme : x 90–990, y 260–1450.** L'interface couvre haut (≤ 288 px), bas (≤ 670 px sur Reels) et droite (≤ 230 px). Vérifier la **boîte entière** du texte, pas son ancrage. Accroche 4–8 mots, centre vers y ≈ 420 ; sous-titres centrés entre y 1056 et 1440 (≈ 1190).
8. **Sous-titres lisibles au calcul.** ≤ 20 caractères/s (espaces compris), ≤ 25 caractères, une ligne ; karaoké 1–3 mots ; phrase 3–7 mots, 1–6 s par bloc. Largeur ≈ 0,6 × taille × caractères en sans-serif gras : à 80 px, 18 caractères remplissent les 900 px utiles. Contour noir 3–4 px.
9. **Audio : voix ≈ −16 LUFS, musique ≈ −28 LUFS.** Sous 10 LU d'écart, elle masque la voix sur un téléphone. Son tendance : dans l'application (licence).
10. **Export** : fps de la source (convertir saccade), H.264 VBR 10–12 Mbit/s, AAC 48 kHz.

## Méthode

1. **Mesurer** : transcript au mot, visages par plan, boîtes des textes, LUFS, export.
2. **Décider** in/out (principes 1–2), puis la stratégie de recadrage de chaque plan.
3. **Proposer** `plan | in | out | début short | Scale | Position x | remarque`, puis `sous-titre | début | fin | car./s | boîte`, et la durée finale.
4. **Vérifier** avec le script, corriger, revérifier ; relire chaque phrase de synthèse contre les chiffres.
5. **Appliquer** via `adobe-editing` (checkpoint, extraction dans une nouvelle séquence). Auto Reframe une seule fois, jamais sur des images fixes : relancé, il empile les keyframes.

## Vérification

Décrire le short dans `short.json` (clés facultatives) puis lancer :

```python
# check_short.py short.json — contrôle chiffré d'un short 1080x1920
import json, sys
s = json.load(open(sys.argv[1])); pb = []
L, H = s.get("source", {}).get("w", 1920), s.get("source", {}).get("h", 1080)
k = 1920 / H                                    # échelle « remplir la hauteur »
bornes = (1080 - L * k / 2, L * k / 2)          # Position x admissible sans bord noir
# 1. Recadrage : Position x bornée, hauteur des yeux, plan fixe trop long
for p in s.get("shots", []):
    if "face_x" in p:
        px = 540 + (L / 2 - p["face_x"]) * k
        px_ok = min(max(px, bornes[0]), bornes[1])
        print(f"{p['start']}–{p['end']} s : Scale {k*100:.2f} %, Position x {px_ok:.1f}" + (" (bornée)" if px_ok != px else ""))
    if "eyes_y" in p and not 0.30 <= p["eyes_y"] / H <= 0.40: pb.append(f"yeux à {p['eyes_y']/H:.0%} au plan {p['start']} s")
    if p.get("static") and p["end"] - p["start"] > 5: pb.append(f"plan fixe {p['start']}–{p['end']} s > 5 s")
# 2. Zone sûre : boîte entière [x, y, w, h] dans x 90–990, y 260–1450
for t in s.get("texts", []):
    x, y, w, h = t["bbox"]
    if x < 90 or x + w > 990 or y < 260 or y + h > 1450: pb.append(f"« {t['text']} » hors zone sûre {t['bbox']}")
    # 3. Sous-titres (textes minutés) : débit et longueur
    if "end" in t:
        cps = len(t["text"]) / (t["end"] - t["start"])
        if cps > 20 or len(t["text"]) > 25: pb.append(f"« {t['text']} » {len(t['text'])} car., {cps:.1f} car./s")
# 4. Parole : premier mot tardif, pauses > 0,5 s
m = s.get("words", [])
if m and m[0]["start"] > 0.3: pb.append(f"premier mot à {m[0]['start']} s")
pb += [f"pause {a['end']}–{b['start']} s" for a, b in zip(m, m[1:]) if b["start"] - a["end"] > 0.5]
# 5. Audio et export
a, e = s.get("loudness"), s.get("export")
if a and a["voice"] - a["music"] < 10: pb.append(f"écart voix/musique {a['voice'] - a['music']} LU")
if e and (e["fps"] != e["source_fps"] or e["mbps"] < 8): pb.append(f"export à revoir : {e}")
print("OK" if not pb else "\n".join(pb))
```

## Pièges observés

- **Démarrer au début de la réponse.** L'agent garde le préambule parce qu'il ouvre la réplique : l'in point va sur la première phrase compréhensible seule.
- **Position x au jugé.** Un visage à droite de la source donne une Position x **inférieure** à 540, et hors bornes un bord noir apparaît : calculer chaque valeur.
- **Centrer un plan large à deux.** Si l'écart des visages dépasse la largeur visible, l'un disparaît, souvent pendant la réaction qui fait le payoff.
- **Ancre au lieu de boîte.** Un sous-titre bien centré mais trop large sort de x 90–990 ; un titre « en haut » sous y 260 passe sous l'interface.
- **Débit non calculé.** Un bloc court paraît anodin, mais 15 caractères en 0,5 s font 30 car./s : allonger ou fusionner.
- **Durée annoncée avant les retraits.** La recalculer depuis les bornes finales.
