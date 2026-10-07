---
obsidianUIMode: preview
cssclasses: [accueil]
tags: [moc]
---
%%
  PERSONNALISER CETTE PAGE (ces lignes entre %% sont invisibles en mode Lecture) :
  1. Titre : remplace « mon-coffre » ci-dessous par ce que tu veux (ton prénom, le nom du coffre…).
  2. Tuiles « Espaces » : une ligne par dossier principal, au format [[Dossier/Dossier|Nom affiché]].
     Ajoute, retire ou renomme les lignes pour qu'elles pointent vers TES dossiers.
  3. Les sections « Projets en cours » et « Tâches par projet » se remplissent seules :
     - une note avec le tag #projet apparaît dans « Projets en cours » ;
     - une case à cocher - [ ] dans n'importe quelle note apparaît dans « Tâches par projet ».
  Pour modifier la page : Cmd+E (ou Ctrl+E) pour passer en mode édition.
%%
# ~/mon-coffre

> [!cards] Espaces
> - [[Projets/Projets|Projets]]
> - [[Perso/Perso|Perso]]

## Projets en cours

```base
filters:
  and:
    - file.hasTag("projet")
views:
  - type: cards
    name: Projets
    order:
      - file.name
      - tags
      - statut
```

## Tâches par projet

```tasks
not done
path does not include Modèles
path does not include Archive
group by filename
sort by priority
sort by due
hide task count
short mode
```
