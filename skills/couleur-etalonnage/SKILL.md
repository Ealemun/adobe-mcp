---
name: "couleur-etalonnage"
description: "Diagnostique et règle la couleur dans Premiere Pro (Lumetri) à partir de mesures : niveaux en IRE, dominante sur les neutres, angle de la peau au vectorscope, conversion LOG, LUT et look, match entre caméras. À utiliser dès qu'une image est terne, sombre, orange, bleutée, brûlée, qu'il faut appliquer une LUT, convertir du S-Log/V-Log/D-Log, matcher deux caméras ou donner un look ciné, même sans Premiere ouvert. Pas pour les effets, transitions ou keyframes (transitions-effets-premiere), ni pour l'export (export-livraison-workflow)."
---

# Couleur : correction et étalonnage mesurés

L'agent connaît déjà Lumetri, l'ordre correction → étalonnage et le rôle des scopes : ne le récite pas. Ce skill ajoute ce qui manque à un agent qui ne voit pas les scopes : **mesurer l'image en chiffres**, décider avec des seuils, et repérer les erreurs de chaîne (double conversion, LUT mal placée) qui ruinent tout le reste.

## Principes

1. **Une seule transformation technique par clip.** Si Lumetri > Réglages a la gestion des couleurs en détection auto du LOG (Premiere 25+), aucune LUT LOG → Rec.709 en plus : sinon double conversion (noirs à 0, blancs à 100, saturation criarde). Garder la gestion des couleurs, retirer la LUT.
2. **Un profil plat n'est pas du LOG.** D-Cinelike, Cine-D, profils « flat » de drones ou téléphones : contraste + saturation à la main, ou la LUT de *ce* profil. Une LUT S-Log3 sur autre chose que du S-Log3 donne une image fausse, parce que les courbes n'ont rien à voir.
3. **La LUT d'entrée (Correction de base) passe avant les curseurs** : ce qu'elle écrête est perdu. Une LUT créative va dans Créatif > Look ou sur un calque d'effets au-dessus des clips, à 40–70 % d'intensité, jamais sur du LOG non converti.
4. **Seuils de décision** (luma Rec.709, 0–100 IRE) :

   | Mesure | Cible | Agir si |
   |---|---|---|
   | Noirs (centile 1) | 2–5 IRE | < 1 avec > 2 % de pixels à 0, ou > 10 en scène de jour |
   | Blancs (centile 99) | 90–95 IRE | > 99 avec > 0,5 % de pixels à 100 |
   | Neutre (mur, papier) : écart max entre R, G, B | ≤ 3 % | > 3 % : dominante |
   | Peau : angle vectorscope | 123° ± 5° | hors plage : teinte fausse |
   | Peau claire / peau foncée : luma | 50–70 / 15–35 IRE | hors de *sa* plage |

   Les carnations diffèrent en luminance, pas en teinte : une peau foncée à 28 IRE est juste, la monter à 60 la délave.
5. **Sens des curseurs Lumetri.** Température + = plus chaud (corrige un bleu dominant) ; Teinte + = magenta (corrige un vert). Angle peau < 118° = trop rouge/magenta ; > 128° = trop jaune/vert.
6. **Amplitudes raisonnables** (au-delà, chercher la vraie cause : mauvaise LUT, mauvais profil) : Température/Teinte ±30, Exposition ±1, Contraste +5 à +25, Hautes lumières −40 à +20, Ombres −20 à +30, Saturation 90–120, Vibrance +10 à +25. Visages : vibrance plutôt que saturation, elle épargne les tons chair.
7. **Match entre caméras** : choisir le plan héros (le mieux exposé, peau dans la cible), corriger les autres dessus dans l'ordre noirs → blancs → gamma → peau. Color Match n'est qu'un départ, faussé par un grand ciel.

## Méthode

1. **Lire la chaîne** : gestion des couleurs, profil caméra, LUT et leur emplacement, calques d'effets. Corriger la chaîne avant tout curseur.
2. **Mesurer** une image par clip (export d'image ou valeurs fournies) avec le script ci-dessous : niveaux, neutre, peau.
3. **Décider** clip par clip avec le tableau du principe 4, en citant chaque mesure.
4. **Proposer** un tableau `clip | problème mesuré | réglage Lumetri (section, curseur, valeur) | valeur attendue après`, puis le look global (calque d'effets, intensité, protection de la peau par HSL secondaire).
5. **Vérifier** : après application, réexporter l'image au même instant et remesurer ; recommencer tant qu'une valeur sort de sa cible. Sans Premiere, livrer les valeurs cibles à contrôler.
6. **Appliquer** via `adobe-editing` (checkpoint avant modification, plan annoncé).

## Vérification

```python
# mesure_couleur.py — usage :
#   python mesure_couleur.py image.png [--zone mur=x,y,l,h] [--peau x,y,l,h]
#   python mesure_couleur.py --rgb 180,140,120      (angle et luma d'une couleur moyenne)
import sys, math
import numpy as np

def luma(r, g, b):            # luma Rec.709 en IRE (pleine échelle 0–255 → 0–100)
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 2.55

def angle(r, g, b):           # angle au vectorscope : atan2(Cr, Cb) en degrés, peau ≈ 123°
    cb = -0.1146 * r - 0.3854 * g + 0.5 * b
    cr = 0.5 * r - 0.4542 * g - 0.0458 * b
    return math.degrees(math.atan2(cr, cb)) % 360

args = sys.argv[1:]
if args[0] == "--rgb":        # mode valeur moyenne fournie
    r, g, b = map(float, args[1].split(","))
    print(f"luma {luma(r, g, b):.1f} IRE, angle {angle(r, g, b):.1f}°"); sys.exit()

from PIL import Image
img = np.asarray(Image.open(args[0]).convert("RGB"), dtype=float)
y = luma(img[..., 0], img[..., 1], img[..., 2])
print(f"noirs p1 {np.percentile(y, 1):.1f} IRE, blancs p99 {np.percentile(y, 99):.1f} IRE")
print(f"pixels ≤ 0,5 IRE : {100 * (y <= 0.5).mean():.2f} %, ≥ 99,5 IRE : {100 * (y >= 99.5).mean():.2f} %")
for i in range(1, len(args), 2):               # zones : --zone nom=x,y,l,h ou --peau x,y,l,h
    nom, box = (args[i + 1].split("=") if "=" in args[i + 1] else ("peau", args[i + 1]))
    x, y0, l, h = map(int, box.split(","))
    r, g, b = img[y0:y0 + h, x:x + l].reshape(-1, 3).mean(0)
    ecart = (max(r, g, b) - min(r, g, b)) / 2.55   # écart R/G/B en % de la pleine échelle
    print(f"{nom} : RGB {r:.0f},{g:.0f},{b:.0f} | luma {luma(r, g, b):.1f} IRE | "
          f"angle {angle(r, g, b):.1f}° | écart RGB {ecart:.1f} %")
```

## Pièges observés

- **Double conversion LOG** : LUT technique ajoutée alors que la gestion des couleurs convertit déjà. Lire Lumetri > Réglages avant toute LUT.
- **Peau foncée « corrigée » vers 60 IRE** parce que la demande dit « trop sombre » : mesurer d'abord ; si elle est dans 15–35, ajuster l'éclairage perçu autour (ombres, fond), pas la peau.
- **LUT créative à 100 % en LUT d'entrée** : peau orange et blancs brûlés irrécupérables. La déplacer en Créatif > Look à 50 %.
- **Signe inversé** : baisser la température pour corriger une image bleue, ou Teinte − contre un vert. Relire le principe 5 avant d'écrire une valeur.
- **Écrêtage corrigé à l'exposition** : on remonte tout pour « éclaircir » et les blancs passent à 100. Corriger noirs et blancs séparément (Noirs, Blancs, Hautes lumières).
- **Diagnostic à l'œil** : décrire « un peu froid » sans chiffre. Chaque problème cite sa mesure (écart RGB, angle, IRE) et la valeur visée.
- **Saturation globale montée pour un look** : elle pousse la peau hors de 123° ± 5°. Vibrance, ou masque HSL inversé sur la peau.
