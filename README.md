# adobe-mcp

Piloter **Adobe Premiere Pro** et **After Effects** en langage naturel depuis un assistant IA compatible MCP. Tout tourne sur votre machine : pas de serveur distant, pas d'abonnement, pas de code téléchargé au démarrage.

> Statut : **phase 1** — fonctionne sur Premiere Pro 2020 (testé), lecture du projet et de la timeline, coupes avec sauvegarde automatique, import, export d'image, retour arrière ; socle After Effects. Suite : `docs/05-roadmap.md`.

---

## Comment ça marche (à lire une fois)

Trois morceaux, et **vous n'en lancez aucun à la main** :

```
 Vous ──▶ Client MCP ──lance automatiquement──▶ Serveur adobe-mcp ◀──se connecte tout seul── Panneau « Adobe MCP »
          (assistant IA en                       (programme Node,                           (dans Premiere ou
           ligne de commande                      invisible, tourne tant                      After Effects)
           ou appli de bureau)                    que le client est ouvert)
```

| Morceau | Qui le démarre | Quand |
|---|---|---|
| **Client MCP** | vous | quand vous voulez travailler |
| **Serveur adobe-mcp** | le client MCP, automatiquement | à l'ouverture du client ; il s'arrête quand vous fermez le client |
| **Panneau Adobe MCP** | vous, une seule fois dans Premiere (Fenêtre > Extensions > Adobe MCP) | ensuite Premiere le rouvre tout seul à chaque lancement s'il est ancré dans l'espace de travail |

Le panneau réessaie de se connecter toutes les 3 secondes : **l'ordre d'ouverture n'a pas d'importance**. Point vert = prêt.

---

## Installation (une seule fois)

Prérequis : Windows 10/11, [Node.js](https://nodejs.org) 18 ou plus, Premiere Pro et/ou After Effects 2018 ou plus récent, un client MCP installé.

```powershell
cd D:\Documents                      # ou n'importe quel dossier où garder le projet
git clone https://github.com/Ealemun/adobe-mcp
cd adobe-mcp
.\scripts\install.cmd
```

L'installeur (sans droits administrateur) :
1. autorise Premiere/After Effects à charger un panneau non signé ;
2. installe le panneau « Adobe MCP » (lien vers ce dossier : **ne déplacez plus le dossier** après l'installation) ;
3. déclare le serveur `adobe` dans les clients MCP qu'il trouve (configuration utilisateur : valable quel que soit le dossier d'où le client est lancé) ;
4. lance un test automatique.

Chaque ligne du résumé final doit commencer par `OK`. Une ligne `!!` explique ce qu'il reste à faire.

---

## Utilisation au quotidien

1. **Ouvrez Premiere Pro** et votre projet. Double-cliquez la séquence à travailler pour qu'elle soit active dans la timeline.
2. **Ouvrez votre client MCP**, depuis n'importe quel dossier.
   - client en ligne de commande : ouvrez un terminal et lancez-le ;
   - application de bureau : ouvrez-la (si elle était déjà ouverte avant l'installation, quittez-la complètement puis relancez-la une fois).
3. **Vérifiez le panneau** (Fenêtre > Extensions > Adobe MCP) : point vert, « Connecté au serveur MCP ».
4. **Parlez à l'assistant**, par exemple :
   - « Quelles sont tes capacités Premiere ? »
   - « Décris ma séquence. »
   - « Montre-moi l'image à 1 min 30. »
   - « Coupe à 12 s et à 18 s. »  → une copie de sauvegarde est créée d'abord dans le chutier `_adobe-mcp`
   - « Reviens à la version d'avant. »

Un seul client MCP à la fois : si deux clients sont ouverts, chacun lance son serveur et le panneau ne parle qu'à l'un des deux.

### Ce que l'assistant sait faire aujourd'hui

| Premiere Pro | After Effects |
|---|---|
| lire le projet, les séquences, la timeline (clips, durées, marqueurs) | lire le projet et les compositions |
| activer une séquence, déplacer la tête de lecture | créer une composition |
| couper à des instants donnés (sauvegarde automatique avant) | exporter une image |
| importer des fichiers | |
| exporter une image et la regarder | |
| créer / lister / restaurer des sauvegardes de séquence | |

Le reste (suppression de silences, sous-titres, zooms, export vidéo, animations…) est planifié : voir `docs/03-catalogue-tools.md` et `docs/05-roadmap.md`.

---

## Mettre à jour

```powershell
cd D:\Documents\adobe-mcp
git pull
```

Puis, selon ce qui a changé (le message du commit le dit) :

| Fichiers modifiés | À faire |
|---|---|
| `packages/mcp-server/…` | fermer et rouvrir le client MCP |
| `packages/host-cep/jsx/…` | quitter et relancer Premiere / After Effects |
| `packages/host-cep/js/…`, `index.html` | fermer et rouvrir le panneau |
| `scripts/…` | relancer `.\scripts\install.cmd` |

Dans le doute : fermer le client MCP et Premiere, puis tout rouvrir.

---

## Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| Le panneau n'est pas dans Fenêtre > Extensions | installation non faite ou Premiere pas relancé | lancer `.\scripts\install.cmd`, puis relancer Premiere |
| Point rouge « Aucun serveur sur le port 8765 » | le client MCP n'est pas ouvert | ouvrir le client MCP ; le panneau se connecte dans les 3 s |
| Point rouge alors que le client est ouvert | serveur non déclaré dans ce client | dans le client, lister les serveurs MCP : `adobe` doit apparaître ; sinon relancer l'installeur |
| L'assistant dit « Premiere Pro n'est pas connecté » | panneau fermé | ouvrir le panneau |
| « Aucune séquence active » | aucune séquence ouverte dans la timeline | double-cliquer une séquence |
| Une action échoue | voir le journal | journal du panneau (lignes ✗) et `%USERPROFILE%\.adobe-mcp\logs\` |

**Test sans Premiere** : `node packages\mcp-server\test\smoke.js` vérifie le serveur avec un faux Premiere.
**Test du serveur seul** : `node packages\mcp-server\src\index.js` le lance à la main (le panneau doit passer au vert) ; Ctrl+C pour l'arrêter. À n'utiliser que pour diagnostiquer.

---

## Désinstaller

```powershell
.\scripts\uninstall.cmd
```
Retire le panneau et les déclarations dans les clients MCP. Les sauvegardes de séquences restent dans vos projets (chutier `_adobe-mcp`, à supprimer à la main si besoin).

---

## Pour aller plus loin

| Fichier | Contenu |
|---|---|
| `docs/00-guide-utilisateur.md` | guide détaillé, sécurité, tout ce qu'on pourra demander |
| `docs/01-architecture.md` | composants, choix techniques |
| `docs/02-protocole-bridge.md` | protocole entre le serveur et le panneau |
| `docs/03-catalogue-tools.md` | catalogue complet des outils (actuels et prévus) |
| `docs/04-fonctionnalites-recettes.md` | fonctionnalités de montage (jump cut, sous-titres, B-roll…) |
| `docs/05-roadmap.md` | étapes du projet |
| `docs/06-installation-dev.md` | détails d'installation, macOS, développement |
| `skills/adobe-editing/SKILL.md` | instructions données à l'assistant pour enchaîner les outils |

```
adobe-mcp/
├── packages/
│   ├── mcp-server/   # serveur MCP en Node.js pur (aucune dépendance) + pont WebSocket
│   ├── host-cep/     # panneau Premiere / After Effects + bibliothèque ExtendScript (jsx/)
│   ├── host-uxp/     # (à venir) panneau UXP pour les versions récentes de Premiere
│   └── workers/      # (à venir) analyse audio/vidéo : transcription, silences…
├── scripts/          # install.cmd, uninstall.cmd, clients.json
├── skills/           # instructions pour l'assistant
└── docs/
```
