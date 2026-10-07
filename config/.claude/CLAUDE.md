# Consignes du coffre — Kit Personnel

Ce coffre Obsidian utilise le **Kit Personnel** (https://github.com/Bwwwah/obsidian-kit-personnel).
Respecte ces conventions quand tu ranges, crées ou modifies des notes.

## Pages de dossier (le point le plus important)
- Chaque dossier a **sa page** : `Dossier/Dossier.md` (même nom que le dossier, à l'intérieur).
  Un clic sur le dossier dans l'explorateur ouvre cette page (module Folder Notes).
  Quand l'utilisateur parle de « page d'accueil d'un dossier » ou de « dossiers qui sont des pages »,
  c'est **cela** : pas un tableau de bord, pas de tuiles ni de listes de tâches ajoutées.
- **Ne rédige pas ces pages à la main.** Après avoir créé, déplacé ou importé des dossiers, lance :
  `obsidian vault="<nom du coffre>" eval code="app.commands.executeCommandById('kit-personnel:creer-pages-manquantes')"`
  Les dossiers créés depuis Obsidian reçoivent leur page automatiquement.
- Ensuite, complète seulement la ligne d'intro `> ` (une phrase qui décrit le dossier).
  Tu peux ajouter sous la liste une section `## Fichiers` (liens vers les pièces jointes) ou `## Liens`.
- Ne remplace pas le bloc ```` ```folder-overview ```` : il liste le contenu du dossier tout seul.
  N'écris donc pas de liste de liens vers les notes du dossier.
- Format généré (pour référence) : propriétés `obsidianUIMode: preview`, `cssclasses: [dossier]`,
  `tags: [dossier]`, puis l'intro, puis le bloc `folder-overview` (style `explorer`).
- Les dossiers `Pièces jointes/` et `Modèles/` n'ont pas de page.

## Rangement
- **Pièces jointes** (images, PDF, etc.) : toutes dans `Pièces jointes/`, avec un nom parlant
  (pas de `Untitled.png` ni d'identifiant Notion).
- **Modèles** : `Modèles/` (Projet, Cours, Objectif, Note).
- **Imports Notion** : retire les identifiants des noms de fichiers, convertis les liens en `[[wikilinks]]`,
  puis lance la commande des pages de dossier manquantes.
- Déplacements et renommages : toujours par Obsidian (CLI `move`, ou `app.fileManager.renameFile`)
  pour que les liens soient mis à jour.

## Propriétés, projets et tâches
- Les notes ont des `tags` dans leurs propriétés. Un projet porte le tag `projet` et un
  `statut` : `idée`, `en cours`, `en pause` ou `fini`.
- Les tâches sont des cases à cocher `- [ ]` dans la note du projet concerné.
  Elles apparaissent seules sur `Accueil.md` (section « Tâches par projet », regroupées par note).
- Dans les requêtes (vues Bases, requêtes Tasks), **exclus toujours le dossier `Modèles/`** :
  ses modèles portent des tags (`projet`, `cours`…) et apparaîtraient comme de vraies notes.
  Bases : `'!file.inFolder("Modèles")'` · Tasks : `path does not include Modèles`.
- `Accueil.md` (racine) est la page d'accueil : tuiles `> [!cards]`, projets en cours (vue Bases),
  tâches par projet (requête Tasks). Ne la transforme pas sans demande.

## Style
- Le style vient du module (`.obsidian/plugins/kit-personnel/styles.css`). **Ne le modifie pas** :
  il est remplacé à chaque mise à jour du kit (via BRAT). Pour un ajustement local, crée une
  feuille de style dans `.obsidian/snippets/`.
- Les couleurs des pages suivent automatiquement celles des dossiers dans l'explorateur.

## Vérifier un rendu
- Le bloc `folder-overview` ne s'affiche qu'en **mode Lecture** : pour vérifier une page, ouvre-la avec
  `leaf.openFile(fichier, {state: {mode: 'preview'}})` et attends 1 à 2 s.
- Dans `obsidian eval`, `require('obsidian')` n'est pas disponible : utilise `app` directement.
