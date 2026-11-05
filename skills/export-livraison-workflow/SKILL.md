---
name: "export-livraison-workflow"
description: "Fixe les réglages d'export Premiere Pro / Media Encoder et vérifie les fichiers livrés : débits YouTube par résolution et fps, niveau H.264, plafonds Shorts, TikTok et Reels, master DNxHR/ProRes, loudness, taille de fichier. À utiliser dès qu'il faut exporter, rendre, livrer, choisir un bitrate ou un preset, décliner en vertical, contrôler un export (flou, saccades, son d'un côté, fichier refusé), gérer proxys ou archivage. Pas pour monter le vertical (montage-vertical-shorts), mixer (audio-montage) ni écrire les sous-titres (titres-texte-sous-titres)."
---

# Export et livraison

L'agent connaît déjà le panneau Export, Media Encoder, les codecs et le Match Source : ne les décris pas. Ce skill apporte les chiffres qui tranchent, les **calculs avant export** et la **vérification du fichier sorti**.

## Principes

1. **Taille et fps de la séquence ne bougent pas à l'export, seul le débit se règle** : 59,94 → 29,97 saccade, 30 → 60 n'ajoute rien, 59,94 ≠ 60 (dérive audio).
2. **Débit YouTube : cible = 1,5 à 2 × le minimum, max = 1,3 à 1,5 × la cible**, car YouTube ré-encode et dégrade d'autant plus une source pauvre. Jeu vidéo : haut de fourchette. Niveau trop bas = champs taille/fps grisés.

   | Sortie | Min. 30 / 60 fps | Cible/max 30 fps | Cible/max 60 fps | Niveau 30 / 60 |
   |---|---|---|---|---|
   | 720p | 5 / 7,5 | 5 / 7 | 8 / 12 | 4.1 / 4.2 |
   | 1080p | 8 / 12 | 12 / 18 | 16-20 / 24-28 | 4.1 / 4.2 |
   | 1440p | 16 / 24 | 20 / 30 | 30 / 45 | 5.1 / 5.2 |
   | 4K | 35-45 / 53-68 | 45 / 60 | 60 / 80 | 5.1 / 5.2 |

3. **2 passes = encodage logiciel.** NVENC / Quick Sync ne font qu'une passe : demander 2 passes bascule Premiere en logiciel sans prévenir (temps ≈ ×2). Final YouTube : VBR 2 passes logiciel ; brouillons et social : VBR 1 passe matériel ; CBR seulement sur cahier des charges ou en live.
4. **Plafonds de plateforme : les calculer avant d'exporter.** Taille (Mo) = (débit vidéo + audio, en Mbit/s) × durée (s) / 8. Sous un plafond de taille : débit total max = plafond (Mo) × 8 / durée (1 Go = 1000 Mo, 3 % de marge) ; ex. un Reel de 700 s tient à 8 000 / 700 = 11,4 Mbit/s au total, pas 25.

   | Plateforme | Taille | Durée | Débit (Mbit/s) | Audio |
   |---|---|---|---|---|
   | Shorts | 9:16, 1080×1920 | ≤ 180 s | 8-12 (30 fps), 12-16 (60 fps) | AAC 320 |
   | TikTok | 1080×1920 | 3-600 s, 23-60 fps | 8-16 | AAC 256-320 |
   | Reels | 1080×1920 | 3 s-15 min | ≤ 25 et fichier ≤ 1 Go | AAC 128 |

5. **Loudness de livraison : −14 à −16 LUFS intégré, crête vraie ≤ −1 dBTP.** Gain = cible − mesure ; si crête + gain > −1 dBTP, il faut un limiteur, sinon l'AAC écrête.
6. **Le master est en codec intermédiaire** : DNxHR HQ/HQX en MXF (Windows) ou ProRes 422 HQ (4444 si alpha), audio PCM 48 kHz, taille et fps de la séquence. Un H.264 n'est pas un master : chaque ré-encodage cumule les pertes.
7. **Audio** : AAC-LC 48 kHz stéréo 320 kbit/s (Reels 128), pas de HE-AAC. H.265 : cible −25 à −40 %, lecture à maîtriser.
8. **Vertical = séquence 1080×1920 dédiée**, pas un recadrage à l'export.
9. **Nommer `Projet_v03_YT_1080p60.mp4`, jamais « FINAL »** : le correctif suivant l'écrase ou le contredit. Master : `MASTER_<projet>_vNN_<date>`.

## Méthode

1. **Mesurer** : taille, fps exact, durée des séquences ; loudness, crête vraie ; plateformes ; OS et GPU.
2. **Décider** par sortie, en tableau : `sortie | codec | taille | fps | passes | cible/max | niveau | audio | taille estimée | nom`.
3. **Contrôler les plafonds par le calcul** ; toute sortie impossible en l'état (Short trop long, Reel trop lourd) reçoit sa correction chiffrée.
4. **Appliquer** via le skill `adobe-editing` (file Media Encoder).
5. **Vérifier** chaque fichier avec le script ci-dessous, corriger, réexporter, revérifier, puis lecture humaine.

## Vérification

Relever ffprobe, loudness (`ebur128=peak=true`) et RMS par canal (`astats`) dans `exports.json`, puis `python check_export.py exports.json` :

```python
# check_export.py : exports contre séquence et plafonds de plateforme
import json, sys
d = json.load(open(sys.argv[1]))              # {"sequences": {nom: {w,h,fps,dur}}, "exports": [...]}
YT_MIN = {720: (5, 7.5), 1080: (8, 12), 1440: (16, 24), 2160: (35, 53)}  # Mbit/s ≤30 / 60 fps
for e in d["exports"]:
    s, pb = d["sequences"][e["seq"]], []
    # 1. Fidélité à la séquence : taille, fps (à 0,01 près), durée (à 1 image près)
    if (e["w"], e["h"]) != (s["w"], s["h"]): pb.append(f"taille {e['w']}x{e['h']} ≠ séquence")
    if abs(e["fps"] - s["fps"]) > 0.01: pb.append(f"fps {e['fps']} ≠ séquence {s['fps']}")
    if abs(e["dur"] - s["dur"]) > 1 / s["fps"]: pb.append("durée ≠ séquence")
    # 2. Taille attendue (Mo) = débit total × durée / 8 ; écart > 30 % = mauvais preset
    total = e["v_mbps"] + e.get("a_mbps", 0); attendu = total * e["dur"] / 8
    if "size_mo" in e and abs(e["size_mo"] - attendu) / attendu > 0.3: pb.append("taille incohérente avec le débit")
    # 3. Plafonds par plateforme
    p = e["platform"]
    # débit minimum jugé au fps de la séquence : un export tombé à 29,97 doit quand même viser le débit du 59,94
    if p == "youtube" and e["v_mbps"] < YT_MIN.get(s["h"], (0, 0))[s["fps"] > 31]: pb.append("débit < minimum YouTube")
    if p == "short" and (e["h"] <= e["w"] or e["dur"] > 180): pb.append("pas un Short (9:16 et ≤ 180 s)")
    if p == "reels" and (total > 25 or attendu > 1000 or not 3 <= e["dur"] <= 900):
        pb.append(f"Reels hors limites ; débit total max : {round(min(25, 970 * 8 / e['dur']), 1)} Mbit/s")
    if p == "tiktok" and not (23 <= e["fps"] <= 60 and 3 <= e["dur"] <= 600): pb.append("TikTok hors limites")
    if p == "master" and e["codec"] not in ("dnxhd", "dnxhr", "prores"): pb.append("master non intermédiaire")
    # 4. Audio : 48 kHz, loudness, crête vraie, canal muet (écart L/R > 20 dB = double mono)
    if e.get("a_hz", 48000) != 48000: pb.append("audio ≠ 48 kHz")
    if p != "master" and not -16.05 <= e.get("lufs", -15) <= -13.95: pb.append(f"loudness {e['lufs']} LUFS")
    if e.get("tp", -2) > -1: pb.append(f"crête vraie {e['tp']} dBTP > −1")
    if e.get("lufs", -15) < -16 and e["tp"] + (-16 - e["lufs"]) > -1: pb.append("gain seul impossible : limiteur")
    if abs(e.get("rms_l", 0) - e.get("rms_r", 0)) > 20: pb.append("un canal quasi muet")
    if "FINAL" in e["file"].upper(): pb.append("nom « FINAL » : versionner")
    print(e["file"], "OK" if not pb else "→ " + " ; ".join(pb))
```

## Pièges observés

- **fps arrondi.** `60000/1001` lu « 60 », ou export en 29,97 « plus léger » : réexporter au fps exact, avec le débit 60 fps et le niveau 4.2.
- **Mbit/s et Mo confondus.** Mo = Mbit/s × s / 8 : recalculer chaque taille et chaque plafond (1 Go, 180 s) avant de dire « ça passe ».
- **2 passes + encodage matériel.** Contradiction à signaler : final = logiciel 2 passes.
- **Loudness corrigée au gain seul.** +5 dB sur une crête à −0,6 dBTP donne +4,4 : limiteur à −1 dBTP.
- **Canal muet non vu.** Un micro « double mono » sort d'un seul côté : comparer les RMS L/R, corriger par Remplir à gauche/droite ou mono.
- **Proxy exporté.** « Utiliser les proxys » coché à l'export : sortie floue en 1024×540 ; décocher.
