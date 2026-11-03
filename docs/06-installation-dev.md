# 06 — Installation (développement) et packaging

## 1. Prérequis
- Node.js ≥ 20, npm ; Python ≥ 3.10 (workers) ; ffmpeg dans le PATH.
- Premiere Pro et/ou After Effects installés (toute version ≥ 2018).
- Un client MCP (assistant IA en ligne de commande ou application de bureau compatible MCP).

## 2. Panneau CEP non signé : mode debug

Un panneau CEP non signé ne se charge que si `PlayerDebugMode` est activé pour la version de CEP utilisée par l'application. Activer toutes les versions courantes pour couvrir « n'importe quelle version » :

**Windows** (PowerShell, utilisateur courant, sans admin) :
```powershell
foreach ($v in 9..12) {
  New-Item -Path "HKCU:\Software\Adobe\CSXS.$v" -Force | Out-Null
  Set-ItemProperty -Path "HKCU:\Software\Adobe\CSXS.$v" -Name PlayerDebugMode -Value "1" -Type String
}
```
**macOS** :
```bash
for v in 9 10 11 12; do defaults write com.adobe.CSXS.$v PlayerDebugMode 1; done
```
Correspondance indicative : CEP 9 → 2019, CEP 10 → 2020, CEP 11 → 2021-2023, CEP 12 → 2024 et suivants.

## 3. Emplacement du panneau

| OS | Utilisateur (sans admin, recommandé) | Système |
|---|---|---|
| Windows | `%APPDATA%\Adobe\CEP\extensions\` | `C:\Program Files\Common Files\Adobe\CEP\extensions\` (et `Program Files (x86)`) |
| macOS | `~/Library/Application Support/Adobe/CEP/extensions/` | `/Library/Application Support/Adobe/CEP/extensions/` |

En développement, `scripts/install-dev` crée un **lien symbolique** `…/extensions/com.adobe-mcp.panel → packages/host-cep/dist/cep` (Bolt CEP le fait aussi via `npm run symlink`). Relancer l'application après chaque changement de `manifest.xml` ; les changements JS/JSX sont rechargés par le panneau (hot reload Bolt).

Débogage : un fichier `.debug` à la racine du panneau expose un port Chrome DevTools (`http://localhost:8860` par exemple) pour inspecter le JS du panneau ; les erreurs ExtendScript sont renvoyées dans le résultat (`error.detail`) et dans le journal `~/.adobe-mcp/logs/`.

## 4. Manifeste (extrait)

```xml
<ExtensionManifest Version="7.0" ExtensionBundleId="com.adobe-mcp" ExtensionBundleVersion="0.1.0">
  <ExtensionList><Extension Id="com.adobe-mcp.panel" Version="0.1.0"/></ExtensionList>
  <ExecutionEnvironment>
    <HostList>
      <Host Name="PPRO" Version="[12.0,99.9]"/>
      <Host Name="AEFT" Version="[15.0,99.9]"/>
    </HostList>
    <LocaleList><Locale Code="All"/></LocaleList>
    <RequiredRuntimeList><RequiredRuntime Name="CSXS" Version="9.0"/></RequiredRuntimeList>
  </ExecutionEnvironment>
  <DispatchInfoList>
    <Extension Id="com.adobe-mcp.panel">
      <DispatchInfo>
        <Resources>
          <MainPath>./index.html</MainPath>
          <ScriptPath>./jsx/index.jsx</ScriptPath>
          <CEFCommandLine><Parameter>--enable-nodejs</Parameter></CEFCommandLine>
        </Resources>
        <Lifecycle><AutoVisible>true</AutoVisible></Lifecycle>
        <UI><Type>Panel</Type><Menu>Adobe MCP</Menu>
            <Geometry><Size><Height>240</Height><Width>320</Width></Size></Geometry></UI>
      </DispatchInfo>
    </Extension>
  </DispatchInfoList>
</ExtensionManifest>
```
Le `ScriptPath` est chargé automatiquement par l'hôte ; pour After Effects et Premiere on charge la bonne lib selon `csInterface.hostEnvironment.appName` (`PPRO` / `AEFT`).

## 5. After Effects : préférences et mode sans panneau
- Préférences > Scripts et expressions > **Autoriser les scripts à écrire des fichiers et à accéder au réseau** : nécessaire pour les exports de JSON et le mode `-r`.
- Exécution directe : `"C:\Program Files\Adobe\Adobe After Effects <année>\Support Files\AfterFX.exe" -r C:\chemin\script.jsx` (instance en cours) ; `-s "alert(1)"` pour une chaîne. Rendu : `aerender -project x.aep -comp "Main" -output out.mov`.

## 6. Serveur MCP côté client

`.mcp.json` à la racine du projet vidéo (ou configuration globale du client MCP) :
```json
{
  "mcpServers": {
    "adobe": {
      "command": "node",
      "args": ["C:/dev/adobe-mcp/packages/mcp-server/dist/index.js"],
      "env": { "ADOBE_MCP_CONFIG": "C:/Users/<user>/.adobe-mcp/config.json" }
    }
  }
}
```
Le skill `skills/adobe-editing` se copie dans le dossier de skills de votre client MCP (ou s'installe via le dépôt).

## 7. Workers Python
```bash
cd packages/workers
python -m venv .venv && .venv/Scripts/activate   # ou source .venv/bin/activate
pip install -r requirements.txt                   # faster-whisper, demucs, librosa, scenedetect, numpy
adobe-mcp-worker probe --json fichier.mp4         # test
```
Les modèles sont téléchargés au premier usage dans `packages/workers/models/` (ignoré par git).

## 8. Packaging (distribution)
1. Certificat auto-signé : `ZXPSignCmd -selfSignedCert FR IDF "<pseudonyme>" "adobe-mcp" <motdepasse> cert.p12`
2. Signature : `ZXPSignCmd -sign packages/host-cep/dist/cep adobe-mcp-panel.zxp cert.p12 <motdepasse> -tsa http://timestamp.digicert.com`
3. Installation chez l'utilisateur : ZXP via Anastasiy's Extension Manager / ExManCmd, ou copie du dossier avec `PlayerDebugMode` (script fourni).
4. Le serveur MCP est distribué comme paquet npm (`npx adobe-mcp`) ; les workers comme paquet Python ou binaire (PyInstaller) selon la phase.

## 9. Vérification rapide
1. Ouvrir Premiere → Window > Extensions > Adobe MCP → le panneau affiche « Connecté à mcp-server (port 8765) ».
2. Dans le client MCP : « quelles sont tes capacités Premiere ? » → `ppro_get_capabilities` renvoie la version et la liste des fonctions.
3. « Exporte l'image à 10 s » → PNG affiché.
