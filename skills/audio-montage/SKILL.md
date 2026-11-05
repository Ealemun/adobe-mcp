---
name: "audio-montage"
description: "Fixe des niveaux audio chiffrés et vérifiables pour un montage : écarts voix/musique/SFX en LU, cible LUFS et crête vraie par plateforme, chaîne voix dans le bon ordre et à dose limitée, ducking ou baisse fixe, room tone. À utiliser dès qu'on parle de mixer, normaliser, LUFS, voix inaudible, musique trop forte, souffle, sifflantes, saturation, ducking ou audio avant export, même sans Premiere ouvert. Pas pour le rythme des coupes (montage-fondamentaux) ni les réglages d'encodage (export-livraison-workflow)."
---

# Mix et nettoyage audio

L'agent connaît déjà les outils (Essential Sound, loudness meter, EQ, compresseur) : ne les décris pas. Ce skill ajoute ce qu'il oublie : des **écarts relatifs chiffrés**, l'**arithmétique des niveaux** (on additionne des puissances, pas des dB) et des **doses maximales** de traitement.

## Principes

1. **La voix d'abord, le reste en écart relatif.** On règle la voix, puis chaque famille par son écart en LU sous la voix, : un niveau de musique n'a de sens que rapporté à la voix.

   | Élément (mesuré pendant la parole) | Écart sous la voix |
   |---|---|
   | Musique sous parole | 12 à 20 LU (signaler tout écart < 10 LU) |
   | Musique seule (intro, transitions) | 0 à 4 LU sous le niveau de la voix |
   | SFX (whoosh, pop) | 0 à 6 LU ; un impact voulu peut égaler la voix, jamais la dépasser |
   | Ambiance, room tone | ≈ 18 LU |

2. **Cible de sortie** (intégrée sur tout le programme, crête vraie) :

   | Destination | Intégrée | Crête vraie |
   |---|---|---|
   | YouTube, Spotify, TikTok/Reels | −14 LUFS ±1 | ≤ −1 dBTP |
   | Podcast (Apple) | −16 LUFS ±1 stéréo, −19 mono | ≤ −1 dBTP |
   | TV Europe (EBU R128) | −23 LUFS ±0,5 | ≤ −1 dBTP |
   | TV US / Netflix | −24 LKFS / −27 (dialogue) | ≤ −2 dBTP |

   YouTube **baisse** un fichier trop fort mais **ne remonte pas** un fichier faible (Spotify ne remonte qu'en laissant ses crêtes à −1 dB, donc pas de quoi compter dessus) : livrer à la cible, sans compter sur la plateforme. Les cibles Auto-Match d'Essential Sound (Dialogue −23, Musique −25, SFX −21, Ambiance −30) sont du broadcast : trop bas pour le web.
3. **Les niveaux s'additionnent en puissance.** Mix ≈ 10·log10(Σ 10^(L/10)) : deux stems au même niveau donnent +3 LU, une musique 12 LU sous la voix ajoute ≈ +0,3 LU. Une voix réglée seule à −14 donne donc un mix trop fort. Cela vaut pour des sons simultanés : deux voix qui alternent au même niveau donnent ce niveau, pas +3.
4. **Gain avant compression.** Aligner d'abord les clips de voix au gain de clip à ±1 LU près (prises, jours, micros différents) ; le compresseur ne lisse que ce qui reste, parce qu'au-delà il pompe et fait monter le souffle.
5. **Ordre et doses de la chaîne voix** : DeHum (50 Hz en Europe, + harmoniques) → DeNoise → coupe-bas 80–100 Hz + EQ → de-esser → compresseur → limiteur. Tout boost d'aigu après le de-esser.

   | Traitement | Dose max | Au-delà |
   |---|---|---|
   | Réduction de bruit | 6–12 dB (Essential Sound ≤ 2–3) | voix « sous l'eau » |
   | De-esser | 3–6 dB | zézaiement |
   | Compresseur (ratio 2–4:1) | 3–6 dB de réduction | pompage, souffle |
   | Limiteur final | ≤ 3 dB de réduction | écrasement : revoir gain et compression |

6. **Ducking seulement s'il y a des trous.** Auto-ducking −12 à −18 dB, fondus 300–800 ms, là où la parole laisse des pauses ≥ 1 s. Sur une parole continue (pauses < 1 s), il pompe : baisser la musique de façon fixe sur toute la plage.
7. **Jamais de silence numérique.** Entre deux phrases ou deux locuteurs, room tone (5–15 s prélevés, bouclés) avec fondus de 20–100 ms ; le vide absolu s'entend comme une coupure.
8. **Voix en mono centré.** Une voix sur un seul canal se lit ≈ 3 LU trop bas et sonne dans une seule oreille : la dupliquer sur les deux canaux (Fill Right with Left) **avant** de mesurer et d'aligner.

## Méthode

1. **Mesurer** chaque famille (voix, musique, SFX, ambiance) et le mix : intégrée, crête vraie, LRA ; les clips de voix un par un. Repérer pistes muettes et clips oubliés. L'intégrée ne vaut qu'après lecture complète ; la LRA est peu fiable sous 1 min.
2. **Décider** : cible de la plateforme, écarts du tableau, plages avec ou sans ducking, corrections de clips (en dB, signées).
3. **Proposer** un tableau `élément | mesuré | cible | action (dB) | pourquoi`, puis la chaîne voix avec ses doses.
4. **Vérifier** avec le script ci-dessous : écarts, niveau prévu du mix, gain à appliquer, réduction du limiteur. Corriger et relancer.
5. **Appliquer** via le skill `adobe-editing` (checkpoint avant modification) ; après rendu, remesurer le fichier : ±1 LU de la cible, crête vraie conforme.

## Vérification

```python
# check_mix.py — usage : python check_mix.py niveaux.json
# niveaux.json : {"cible": -14, "tp_max": -1,
#   "stems": {"voix": {"lufs": -16, "tp": -4}, "musique": {"lufs": -31, "tp": -9}, ...}}
# Les lufs des stems sont mesurés (ou prévus) pendant la parole, après corrections.
import json, math, sys
d = json.load(open(sys.argv[1]))
st, pb = d["stems"], []
# 1. Somme en puissance : niveau prévu du mix (approximation, à remesurer après rendu)
mix = 10 * math.log10(sum(10 ** (s["lufs"] / 10) for s in st.values()))
gain = d["cible"] - mix                                  # gain à appliquer sur la piste Mix
tp = max(s.get("tp", -99) for s in st.values()) + gain   # crête prévue (borne basse)
red = max(0.0, tp - d["tp_max"])                         # réduction demandée au limiteur
# 2. Écarts relatifs à la voix (bornes du tableau des principes)
v = st["voix"]["lufs"]
bornes = {"musique": (12, 20), "sfx": (0, 6), "ambiance": (14, 22)}
for nom, (lo, hi) in bornes.items():
    if nom in st:
        e = v - st[nom]["lufs"]
        if not lo <= e <= hi: pb.append(f"{nom} : {e:.1f} LU sous la voix (attendu {lo}–{hi})")
if red > 3: pb.append(f"limiteur à {red:.1f} dB de réduction : baisser les crêtes en amont")
print(f"mix prévu {mix:.1f} LUFS, gain Mix {gain:+.1f} dB, crête prévue {tp:.1f} dBTP, limiteur {red:.1f} dB")
print("OK" if not pb else "\n".join(pb))
```

## Pièges observés

- **« La plateforme normalisera. »** Faux pour un fichier trop faible : un mix à −23 (Auto-Match) reste à −23 sur YouTube, 9 LU sous les autres vidéos. Livrer à la cible.
- **Additionner des dB.** Annoncer « voix −14, musique −28, SFX −20, donc mix −14 » : la somme en puissance donne ≈ −12,9.
- **Compresseur en guise de gain de clip.** 10 dB de réduction pour rattraper une prise faible : pompage et souffle. Corriger la prise au gain (écart chiffré), puis comprimer 3–6 dB.
- **Ducking automatique partout.** Sur une explication continue, la musique respire à chaque micro-pause. Baisse fixe sur cette plage ; ducking ailleurs, régénéré après tout changement de montage.
- **Plafond de limiteur à −0,1 ou 0 dB.** Les crêtes inter-échantillons saturent après encodage : plafond −1 dBTP (−2 pour TV US et Netflix). Le Hard Limiter de Premiere mesure en crête échantillon, pas en crête vraie : le régler à −1,5 dB pour tenir −1 dBTP, puis vérifier au Loudness Meter.
- **Canal unique et silence numérique.** Vérifier la répartition des canaux et la présence d'une piste room tone (souvent muette par erreur) avant de régler quoi que ce soit.
- **Chiffres non recalculés.** Chaque correction annoncée doit sortir de la soustraction cible − mesuré, pas d'une estimation.
