---
name: "montage-gaming-stream"
description: "Chiffre les décisions propres au contenu gaming et stream : facecam hors HUD, recadrage 9:16 qui suit l'action, accroche et durée des clips, effets d'impact (shake, flash, zoom, speed ramp) comptés en images, coupes sur musique, loudness, droits. À utiliser dès qu'on parle de VOD Twitch, highlights, best-of, edit hype, clip de stream, facecam, kill. Pas pour le rythme général (montage-fondamentaux), le mix détaillé (audio-montage) ou l'export (export-livraison-workflow)."
---

# Montage gaming et stream

L'agent connaît déjà les menus de Premiere et l'idée d'un hook : ne les récite pas. Ce skill ajoute les seuils oubliés, surtout les conversions secondes ↔ images et les calculs de cadre, où se concentrent les erreurs.

## Principes

1. **Payoff visible avant 3 s, un pic par clip.** Ouvrir sur 0,5–1 s du résultat (kill, réaction) puis revenir au début de l'action : le spectateur décide en 1–3 s.

   | Format | Cible |
   |---|---|
   | Vertical pur jeu / avec réaction | 7–15 s / 15–30 s (60 s max) |
   | Best-of | ≈ 5 s par clip ; garder 40–50 % du vivier |
   | Edit sur musique | 10–15 clips pour 90 s ; intro 5–10 s |
   | VOD nettoyée | 10–30 s de contexte avant un moment fort ; couper silences > 20 s (−40 dB), chargements |

2. **Facecam : 15–20 % de la largeur, coin vérifié sur une frame en pleine action**, car le coin par défaut masque souvent un élément critique (LoL : minimap en bas à droite ; Valorant, CS2 : radar en haut à gauche, kill feed en haut à droite). Au-delà de 150 % elle est floue : demander la piste caméra. Cam plein cadre : 1–3 s sur le pic vocal.
3. **Recadrage 9:16 : la tranche suit l'action.** Sur source 1920×1080 elle fait 608 px ; x = 656 suppose une action centrée. Poser x ∈ [0 ; 1312] par segment pour garder l'action à ≥ 40 px des bords, images-clés lissées.
4. **Texte mobile** : hauteur ≥ largeur/20 (54 px sur 1080), 2 lignes de 5 mots max, ≥ 0,6 s. En vertical, rien dans les 320 px du bas ni les 120 px de droite (interface de l'appli).
5. **Effets comptés en images** au fps réel (60 fps : 0,1 s = 6 images).

   | Effet | Valeur | Pourquoi |
   |---|---|---|
   | Shake | 2–3 images, 10–20 px en 1080p | plus long, il brouille l'action |
   | Zoom d'impact | +3 à +5 %, montée 2–3 images, retour 4–6 | au-delà, HUD et cible sortent |
   | Flash blanc | 1 image, une fois par edit | répété, il ne signale plus rien |
   | Ralenti | ≥ 50 % ; plus lent (rampe 0,3×) : flux optique | images dupliquées, saccades |
   | Rampe | 0,3–0,5× avant l'impact → 1× sur le beat, Bézier | les paliers se voient |
   | Coupe sèche | retirer 2 images avant l'impact | choc plus net |

   Hors drop, au plus un effet toutes les 5 s, sinon ils s'annulent.
6. **Sur la musique, couper sur les temps forts, pas sur chaque beat.** Hors drop, plans de 3–8 s ; sur le drop seulement, plans < 0,5 s. Meilleur plan sur le premier drop, deuxième meilleur en ouverture.
7. **Niveaux.** Voix 3–5 dB au-dessus du jeu, jeu sous la musique dans un edit. Export −14 LUFS, ≤ −1 dBTP : un gain monte la crête d'autant, donc gain + limiteur. SFX sur 2–3 moments, crêtes −6 à −3 dB ; whoosh 3–6 images avant la coupe.
8. **Droits.** Musique commerciale sans licence : VOD coupée, Content ID, short muet ; la musique du jeu est aussi protégée. En vertical, le son tendance s'ajoute dans l'application, pas à l'export.

## Méthode

1. **Mesurer** : fps, résolution, rectangles HUD et cam, position de l'action, minutage du payoff, LUFS/crête.
2. **Décider** avec les seuils, effets convertis en images.
3. **Proposer** un tableau plan / début / fin / contenu / cadre (x, échelle) / effet / raison.
4. **Vérifier** avec le script, corriger, revérifier ; relire chaque chiffre annoncé.
5. **Appliquer** via `adobe-editing` (checkpoint, plan validé).

## Vérification

```python
# check_gaming.py plan.json — clés facultatives ; rectangles {x,y,w,h} en px, durées en s :
# fps, canvas [W,H], facecam (+scale), hud [+name], texts, crops [{t0,t1,x}], action [{t,x}],
# effects [{type: shake|zoom|flash|speed, t, dur, pct, optical_flow, in_drop}], lufs, true_peak
import json, sys
p = json.load(open(sys.argv[1])); fps = p.get("fps", 60); W, H = p.get("canvas", [1920, 1080]); pb = []
def recouvre(a, b):  # deux rectangles se chevauchent-ils ?
    return a["x"] < b["x"] + b["w"] and b["x"] < a["x"] + a["w"] and a["y"] < b["y"] + b["h"] and b["y"] < a["y"] + a["h"]
if cam := p.get("facecam"):  # taille (16:9 seulement), netteté, HUD masqué
    if W > H and not 0.15 <= cam["w"] / W <= 0.20: pb.append(f"facecam {cam['w']/W:.0%} de la largeur")
    if cam.get("scale", 100) > 150: pb.append("facecam > 150 % : floue")
    pb += [f"facecam sur {h['name']}" for h in p.get("hud", []) if recouvre(cam, h)]
for t in p.get("texts", []):  # taille mini, puis interface mobile en vertical
    if t["h"] < W / 20: pb.append(f"texte {t['h']} px < {W/20:.0f}")
    if H > W and (t["y"] + t["h"] > H - 320 or t["x"] + t["w"] > W - 120): pb.append(f"texte y={t['y']} sous l'interface")
for c in p.get("crops", []):  # tranche 9:16 de 608 px, action à >= 40 px des bords
    pb += [f"action hors cadre à {a['t']} s" for a in p.get("action", [])
           if c["t0"] <= a["t"] < c["t1"] and not c["x"] + 40 <= a["x"] <= c["x"] + 568]
eff = sorted(p.get("effects", []), key=lambda e: e["t"])
for e in eff:  # durées converties en images au fps réel
    if e["type"] == "shake" and round(e["dur"] * fps) > 3: pb.append(f"shake {round(e['dur']*fps)} images à {e['t']} s")
    if e["type"] == "zoom" and not 3 <= e["pct"] <= 5: pb.append(f"zoom {e['pct']} % à {e['t']} s")
    if e["type"] == "speed" and e["pct"] < 50 and not e.get("optical_flow"): pb.append(f"ralenti {e['pct']} % sans flux optique")
if sum(e["type"] == "flash" for e in eff) > 1: pb.append("plus d'un flash")
hors = [e["t"] for e in eff if not e.get("in_drop") and e["type"] != "speed"]  # densité hors drop
pb += [f"effets à {a} et {b} s (< 5 s)" for a, b in zip(hors, hors[1:]) if b - a < 5]
if "lufs" in p and abs(p["lufs"] + 14) > 1: pb.append(f"{p['lufs']} LUFS au lieu de −14")
if p.get("true_peak", -9) > -1: pb.append(f"crête {p['true_peak']} dBTP > −1")
print("OK" if not pb else "\n".join(pb))
```

## Pièges observés

- **Secondes lues comme à 30 fps.** « Shake 0,1 s » fait 6 images à 60 fps : corriger dans les deux unités.
- **Recadrage centré par défaut.** x = 656 coupe une action jouée à droite : vérifier chaque segment.
- **Gain seul vers −14 LUFS.** +5,5 dB sur un mix à −19,5 LUFS et +0,4 dBTP porte la crête à +5,9 dBTP : limiteur à −1 dBTP.
- **Cam étirée pour remplir un vertical.** 384 px portés à 1080 px (281 %) : piste cam source ou bandeau plus petit.
- **Musique tendance dans l'export.** Short muet ou revendiqué : l'ajouter dans l'appli.
- **Clip qui commence par la mise en place.** 20 s de farm avant le kill : ouvrir sur le payoff.
