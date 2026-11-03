# 00 — Guide d'utilisation

Ce guide s'adresse au monteur, pas au développeur. Il décrit l'expérience visée ; les étapes marquées *(phase N)* ne sont disponibles qu'une fois cette phase de la roadmap livrée.

## 1. Ce que fait adobe-mcp

Vous ouvrez Premiere Pro (ou After Effects), vous ouvrez votre assistant IA compatible MCP, et vous lui parlez de votre montage :

> « Enlève les silences de plus d'une demi-seconde sur la piste voix. »
> « Mets des sous-titres mot à mot, police grasse, en bas de l'image. »
> « Fais-moi une version verticale des 45 meilleures secondes. »
> « Crée une animation de titre qui glisse depuis la gauche, 1,5 s, et place-la à 12 s. »

L'assistant lit votre timeline, vous annonce ce qu'il va faire, le fait, puis vous montre le résultat. Tout se passe sur votre machine : aucun envoi de vos rushes à un serveur, aucun abonnement, aucun crédit.

## 2. Installation en 5 minutes *(phase 1)*

Prérequis : Windows 10/11 ou macOS, Premiere Pro et/ou After Effects (2018 ou plus récent), Node.js 20+, et un client MCP (assistant IA en ligne de commande ou application de bureau compatible MCP).

1. Récupérer le dépôt (`git clone https://github.com/Ealemun/adobe-mcp`, ou le zip décompressé) où vous voulez, par exemple `Documents\adobe-mcp`. Ne le déplacez plus ensuite : le panneau pointe dessus.
2. Lancer l'installeur :
   - Windows : double-clic sur `scripts\install.cmd`.
   - macOS : `./scripts/install.sh` dans le Terminal *(à venir, phase 6 ; étapes manuelles dans `docs/06-installation-dev.md`)*.

   L'installeur fait trois choses, et les affiche : il autorise Adobe à charger le panneau, il installe le panneau « Adobe MCP » dans vos extensions, et il enregistre le serveur `adobe` dans la configuration de votre client MCP. Aucune étape ne demande de droits administrateur.
3. Ouvrir Premiere Pro → menu **Fenêtre > Extensions > Adobe MCP**. Le panneau affiche « Connecté ». Vous pouvez le réduire ou l'ancrer n'importe où ; il doit juste rester ouvert.
4. Ouvrir votre client MCP et taper : « Quelles sont tes capacités Premiere ? » S'il répond avec la version de Premiere et une liste de fonctions, tout est en place. Le serveur est lancé par le client MCP ; le panneau se reconnecte tout seul toutes les 3 s.

Pour l'analyse audio (transcription, silences, séparation de pistes) *(phase 3)* : relancer l'installeur avec l'option `--workers`, qui installe Python et les modèles nécessaires (environ 2 Go, une seule fois).

## 3. Premier montage guidé *(phase 1 → 3)*

1. Ouvrez un projet et activez une séquence dans la timeline.
2. Demandez : « Décris-moi ma séquence. » L'assistant liste les pistes, les clips, la durée, les marqueurs.
3. Demandez une action simple : « Coupe à 10 s et à 20 s sur toutes les pistes. » Vérifiez dans la timeline.
4. Demandez une action réversible : « Enlève les silences de plus de 0,6 s. » L'assistant annonce le nombre de coupes et la durée gagnée, crée une sauvegarde de la séquence, puis coupe.
5. Pas satisfait ? « Reviens en arrière. » La séquence d'avant est restaurée.

## 4. Ce que vous pouvez demander

| Vous voulez… | Exemple de demande | Dispo |
|---|---|---|
| Comprendre une timeline | « Explique la structure de ma séquence, où sont les parties sans voix ? » | phase 1 |
| Couper, déplacer, supprimer | « Supprime tous les clips désactivés », « Décale tout ce qui est après 1 min 30 de 2 s » | phase 2 |
| Nettoyer la parole | « Enlève les silences », « Retire les “euh” et les répétitions » | phase 3 |
| Sous-titres | « Sous-titre en français », « Convertis les sous-titres en texte animé mot à mot » | phase 3 |
| Chapitres | « Mets des marqueurs de chapitre et donne-moi le texte pour YouTube » | phase 3 |
| Rythme | « Ajoute des zooms légers sur les moments forts », « Cale les coupes sur les temps de la musique » | phase 3 |
| Formats | « Fais une version 9:16 des 60 meilleures secondes » | phase 3 |
| Couleur | « Harmonise la couleur entre les deux caméras » | phase 3 |
| Audio | « Baisse la musique sous la voix », « Normalise à −14 LUFS » | phase 3 |
| B-roll | « Illustre chaque phrase avec un plan de mon chutier B-roll » | phase 3 |
| After Effects | « Crée un lower third animé avec ce texte », « Écris une expression qui fait rebondir ce calque » | phase 4 |
| Export | « Exporte chaque marqueur rouge en fichier séparé » | phase 2 |

## 5. Sécurité : ce que l'assistant ne fera jamais sans vous

- Avant toute suppression ou coupe en série, il **annonce le plan** (combien, où, durée avant/après) et attend votre accord, sauf si vous lui avez dit de ne plus demander.
- Il **sauvegarde la séquence** (copie horodatée dans un chutier `_adobe-mcp`) avant chaque opération destructive. « Reviens en arrière » restaure la copie.
- Il **n'exécute aucun code arbitraire** dans Premiere ; seules les fonctions du dépôt, lisibles par tous, sont disponibles.
- Il **ne fait aucun appel réseau** sauf si vous configurez vous-même un service de génération (images, voix) avec votre propre clé.

Réglages dans `~/.adobe-mcp/config.json` : demander confirmation toujours / par lot / jamais ; sauvegarde automatique oui/non ; modèle de transcription ; dossier des sauvegardes.

## 6. Problèmes courants

| Symptôme | Cause probable | Solution |
|---|---|---|
| Le panneau n'apparaît pas dans Fenêtre > Extensions | Mode debug non activé ou extension mal copiée | Relancer l'installeur, redémarrer Premiere |
| Le panneau affiche « Déconnecté » | Le serveur MCP n'est pas lancé | Ouvrir le client MCP (il lance le serveur) ou cliquer « Reconnecter » |
| L'assistant dit « hôte non connecté » | Panneau fermé | Ouvrir le panneau dans Premiere |
| « Aucune séquence active » | Aucune séquence ouverte dans la timeline | Double-cliquer une séquence |
| La transcription est lente | Modèle trop grand pour la machine | `whisperModel: "small"` dans la config, ou activer le GPU |
| Une coupe est tombée au mauvais endroit | Fréquence d'images inhabituelle | Vérifier la fréquence de la séquence ; signaler le cas (issue) avec la fréquence et l'horodatage |

## 7. Désinstallation

`scripts\uninstall.cmd` (ou `install.ps1 -Remove`, `-Purge` pour supprimer aussi `~/.adobe-mcp`) : retire le panneau, l'entrée du client MCP et, sur demande, le dossier `~/.adobe-mcp`. Les sauvegardes de séquences restent dans vos projets Premiere ; supprimez le chutier `_adobe-mcp` si vous n'en voulez plus.
