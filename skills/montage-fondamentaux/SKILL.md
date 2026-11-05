---
name: "montage-fondamentaux"
description: "Décide où couper et à quel rythme pour tenir l'attention du spectateur : durée et variation des plans, rythme métronomique, jump cuts sur plan unique (punch-in), hook/bascule/payoff, silences et hésitations, plans de réaction. À utiliser dès qu'il faut resserrer, dynamiser, restructurer ou diagnostiquer un montage qui décroche (vlog, short, interview, YouTube), même sans Premiere ouvert. Pas pour la couleur, le mix audio, les titres ou l'export."
---

# Rythme et attention au montage

L'agent connaît déjà la grammaire classique (180°, 30°, raccords, J/L-cuts, trois actes) : ne la récite pas à l'utilisateur. Ce skill sert à ce qui manque par défaut : traiter le **rythme** comme la variable principale, parce qu'un montage techniquement propre mais régulier perd quand même son public.

## Principes

1. **Un tempo uniforme endort.** Des plans de durée égale, même courts, se lisent comme un métronome : l'œil anticipe la coupe et décroche. Faire varier les durées d'environ ±30 % entre plans voisins, et ne jamais enchaîner plus de 2 plans de même durée (à ±0,2 s près). Couper « régulièrement toutes les 2 s » n'est pas un rythme : c'est un défaut à signaler.
2. **Un tempo dominant + une exception voulue.** Choisir le tempo selon l'intention (informer, émouvoir, exciter), puis le casser une fois, au moment clé : accélération sur la révélation, ou plan long qui laisse respirer une émotion.
3. **Plafonner la durée d'un plan fixe.** Un plan sans changement d'échelle ni de contenu ne doit pas dépasser :

   | Format | Plan fixe max | Quelque chose change tous les |
   |---|---|---|
   | Short / TikTok / Reels | 3 s | 1–2 s |
   | Vlog, YouTube parlé | 8 s | 10–20 s |
   | Interview, éducatif | 13 s | 10–30 s |

   Un plan riche en mouvement peut durer plus ; un plan statique doit être court.
4. **Plan unique face caméra = échelle alternée à chaque coupe.** Chaque jump cut change d'échelle (100 % → 110–115 % → 100 %…), jamais deux segments consécutifs à la même échelle ; garder 120 % et plus pour les phrases fortes. Si un segment dépasse le plafond, ajouter une coupe image seule (son continu) avec changement d'échelle.
5. **Structure de l'attention : hook → bascule → payoff.** Le hook (promesse ou résultat, jamais logo ni salut) arrive avant 3 s en vertical, avant 15 s en long. La bascule (rupture de rythme ou retournement) se place vers 50 % et doit être nommée et justifiée. Tout ce qui est promis paie avant la fin ; en vertical, la dernière image peut reboucler sur la première.
6. **Couper dans les silences, garder la respiration.** Bornes de coupe dans les blancs, jamais dans un mot. Garder les micro-pauses (< 0,3 s) ; raccourcir les longs silences à 0,3–0,5 s au lieu de les supprimer, sinon la parole devient hachée. Garder la dernière prise complète d'une phrase répétée.
7. **Respiration visuelle.** Dans un contenu rapide, un plan plus long (≥ 3 s) toutes les 60 à 90 s ; en interview, le plan large sert de respiration et de relance.

## Méthode

1. **Mesurer avant de juger.** À partir de la timeline (ou d'une liste de plans), calculer : durée de chaque plan, plan fixe le plus long, nombre de plans consécutifs de même durée, temps avant la première info utile, position de la bascule. Le script de la section « Vérification » le fait.
2. **Diagnostiquer** en reliant chaque chiffre à un effet sur le spectateur (ex. chute à 3 s ← logo + salut), en vérifiant chaque pourcentage calculé.
3. **Proposer le montage sous forme de tableau** : `plan | début | fin | durée | échelle/caméra | raison de la coupe`. Chaque ligne a une raison (émotion, information, rythme) ; une coupe sans raison est à retirer.
4. **Valider puis corriger.** Repasser le tableau dans le script ci-dessous : pas de trou, pas plus de 2 durées égales d'affilée, aucun plan fixe au-dessus du plafond, durée totale annoncée exacte. Corriger et revalider avant de livrer.
5. **Appliquer** : dans Premiere, passer par le skill `adobe-editing` (checkpoint avant toute coupe destructive, plan annoncé à l'utilisateur). Sans Premiere, livrer le tableau en secondes, et l'ordre d'application (couper de la fin vers le début).

## Vérification

Écrire la liste des plans proposés dans `plans.json` (`[{"start":0,"end":2.4,"cam":"A","scale":100}, …]`), puis lancer ce script avec le plafond du format (3, 8 ou 13) :

```python
# check_rythme.py — usage : python check_rythme.py plans.json 8
import json, sys
plans = sorted(json.load(open(sys.argv[1])), key=lambda p: p["start"])
plafond, pb = float(sys.argv[2]), []
# 1. Continuité : aucun trou ni chevauchement
for p, q in zip(plans, plans[1:]):
    if abs(q["start"] - p["end"]) > 1e-3: pb.append(f"discontinuité à {p['end']} s")
# 2. Rythme : pas plus de 2 plans de même durée (±0,2 s) d'affilée
d = [p["end"] - p["start"] for p in plans]; serie = 1
for i in range(1, len(d)):
    serie = serie + 1 if abs(d[i] - d[i-1]) < 0.2 else 1
    if serie == 3: pb.append(f"3 plans de même durée finissant à {plans[i]['end']} s")
# 3. Plans fixes : on fusionne les plans voisins à image identique (même caméra, même échelle)
debut = plans[0]["start"]
for p, q in zip(plans + [None], plans[1:] + [None]):
    if q is None or (q.get("cam"), q.get("scale", 100)) != (p.get("cam"), p.get("scale", 100)):
        if p["end"] - debut > plafond: pb.append(f"plan fixe {debut}–{p['end']} s > {plafond} s")
        debut = q["start"] if q else None
print(f"{len(plans)} plans, {round(plans[-1]['end'] - plans[0]['start'], 2)} s, durée max {round(max(d), 2)} s")
print("OK" if not pb else "\n".join(pb))
```

## Pièges observés

- **J-cut / L-cut inversés.** J-cut : le **son** du plan suivant arrive **avant** son image. L-cut : le son du plan précédent **continue** sous l'image suivante. Vérifier chaque étiquette.
- **Interview en ping-pong.** Les relances courtes de l'interviewer (« Vraiment ? », « Et ta famille ? ») restent hors champ, sur le visage de l'invité ou sur le plan large : couper vers l'interviewer à chaque réplique recrée le ping-pong. Les plans de réaction de l'auditeur se placent pendant les moments forts, sans mouvement de lèvres.
- **Moyennes trompeuses.** « 2 s par plan » est une bonne moyenne pour un short mais un mauvais rythme si toutes les durées sont égales.
- **Pourcentages faux.** Recalculer les parts (ex. part des pertes avant 10 s sur les pertes totales) au lieu de les estimer.
- **Musique qui maquille.** Juger le montage son coupé d'abord : s'il ne tient pas en muet, la musique ne le sauvera pas.
- **Affirmations non vérifiées.** Avant de livrer, relire chaque phrase de synthèse (« aucune coupe sur un changement de locuteur », « aucun plan au-dessus de 8 s ») contre le tableau : c'est l'erreur la plus fréquente des tests.
- **Temps calés sur le texte.** Sans horodatage au mot, les coupes au milieu d'une réponse sont des estimations : le dire et demander de les recaler sur la forme d'onde.
