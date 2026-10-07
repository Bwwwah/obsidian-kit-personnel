# Kit Personnel pour Obsidian

Un coffre Obsidian au look **vert terminal pastel** (thème AnuPpuccin), avec :

- **Des pages de dossier façon Notion** : clic sur un dossier → sa page, avec la
  liste repliable de son contenu. Chaque nouveau dossier reçoit **automatiquement**
  sa page.
- **Les couleurs des dossiers sur les pages** : chaque page reprend la couleur de
  son dossier dans l'explorateur, sous-dossiers compris.
- **Les tâches par projet** sur la page d'accueil, repliables au clic.
- **Une page d'accueil** façon tableau de bord, qui s'ouvre au démarrage.
- **Des mises à jour automatiques** : quand le kit évolue, les coffres qui l'utilisent
  récupèrent la nouvelle version au démarrage, grâce à BRAT.

---

## Installation dans un nouveau coffre (≈ 5 min)

> **L'ordre compte.** On copie d'abord la configuration, *puis* on installe les modules.
> Dans le Finder, copier un dossier par-dessus un autre le **remplace** au lieu de le
> fusionner, ce qui effacerait des modules déjà installés.

### 1. Copier la configuration (Obsidian fermé)
1. Télécharge ce dépôt : bouton vert **Code → Download ZIP**, puis décompresse-le.
2. Crée ton coffre dans Obsidian, puis **quitte Obsidian** (Cmd+Q).
3. Dans le Finder, ouvre le dossier du coffre et affiche les fichiers masqués
   (**Cmd+Maj+.**) pour voir `.obsidian`.
4. Copie **le contenu** de `config/obsidian/` dans `.obsidian`.
5. Copie `config/Modèles/` et `config/Accueil.md` à la racine du coffre.

Si le coffre a déjà des modules installés, utilise plutôt le Terminal, qui fusionne :
```bash
ditto "chemin/vers/config/obsidian" "chemin/vers/le/coffre/.obsidian"
```
(Glisse les dossiers dans la fenêtre du Terminal pour écrire les chemins.)

### 2. Installer le thème et les modules (Obsidian ouvert)
Rouvre Obsidian et accepte de **désactiver le mode restreint**.

- Réglages → Apparence → Thèmes → Gérer → **AnuPpuccin**
- Réglages → Modules complémentaires → Parcourir → installer :
  **BRAT**, **Folder Notes**, **Homepage**, **Iconize**, **Style Settings**,
  **Force note view mode**, **Tasks**

Les réglages copiés à l'étape 1 sont **conservés** : chaque module démarre déjà configuré.

### 3. Installer le Kit Personnel via BRAT
Palette de commandes (Cmd+P) → **BRAT: Plugins: Add a beta plugin for testing**
→ colle `Bwwwah/obsidian-kit-personnel` → **Add plugin**.

Vérifie dans Réglages → Modules complémentaires que **Kit Personnel** est activé.
C'est prêt : crée un dossier, sa page stylée apparaît toute seule.

---

## Mises à jour

**Côté coffres : rien à faire.** BRAT vérifie le dépôt à chaque démarrage d'Obsidian
et installe la dernière version du kit. Pour forcer une vérification :
Cmd+P → **BRAT: Plugins: Check for updates to all beta plugins**.

Le thème et les autres modules se mettent à jour normalement depuis le magasin d'Obsidian.

> Les mises à jour concernent le **module** (fonctionnalités + style). La configuration
> de départ (`config/`) n'est copiée qu'une fois, à l'installation, pour ne jamais écraser
> les réglages que tu as personnalisés.

**Côté auteur : publier une nouvelle version**
```bash
./publier.sh 1.1.0 "Ce qui change"
```
Le script met à jour la version, crée le commit et le tag, envoie le tout sur GitHub
et publie la *release* que BRAT distribue. Il faut `git` et `gh` (GitHub CLI) connectés.

---

## Personnaliser

- **Page d'accueil** : `Accueil.md` est une note normale. En mode édition (Cmd+E),
  un bloc de consignes en haut (invisible en lecture) explique comment changer le
  titre `~/mon-coffre` et les tuiles « Espaces ».
- **Couleurs** : Réglages → Style Settings → AnuPpuccin (accent, variantes clair/sombre).
- **Icônes de dossier** : clic droit sur un dossier → *Change icon* (Iconize).

## Contenu du dépôt

| Fichier | Rôle |
|---|---|
| `main.js`, `manifest.json`, `styles.css` | Le module **Kit Personnel** (distribué par BRAT) |
| `config/obsidian/` | Configuration de départ : thème, réglages des modules, BRAT pré-réglé |
| `config/Modèles/`, `config/Accueil.md` | Modèles de notes et page d'accueil de départ |
| `publier.sh` | Publier une nouvelle version (commit, tag, release) |

## Licence

MIT — libre d'utilisation, de modification et de partage.
