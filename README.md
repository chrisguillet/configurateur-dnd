# configurateur-dnd

Configurateur de personnage pour **D&D 2024** (5e édition), en français, avec un grimoire de
tous les sorts du Manuel des Joueurs 2024.
Application web statique, sans build ni dépendance : ouvrez `index.html` dans un navigateur
(ça fonctionne aussi en double-cliquant le fichier, sans serveur).

Les personnages sont enregistrés dans le navigateur (`localStorage`) et peuvent être
exportés/importés en JSON, ou exportés en fiche HTML imprimable.

## Fonctionnalités

- Création pas à pas : identité, origine, classe, caractéristiques, sorts, équipement, fiche.
- **Grimoire** : les 391 sorts avec recherche (nom français ou anglais), filtres par niveau, école,
  classe, temps d'incantation, concentration et rituel. Chaque sort renvoie vers son texte complet
  sur [AideDD](https://www.aidedd.org/spell/fr/).
- Onglet Sorts d'un personnage : liste complète de sa classe, filtrable, jusqu'au niveau de ses emplacements.

## Structure

```
index.html              page unique, charge les scripts ci-dessous
css/style.css           styles (thèmes clair/sombre, impression)
js/data/base.js         tables de règles communes et petits utilitaires
js/data/classes.js      classes, sous-classes, dons de classe, métamagie
js/data/origins.js      historiques et espèces
js/data/spells-db.js    données des 391 sorts (GÉNÉRÉ, ne pas modifier à la main)
js/data/spells.js       index, listes de sorts par classe, recherche, anciens noms de sorts
js/spell-views.js       rendu HTML des lignes de sorts (fonctions pures)
js/app.js               état, calculs, rendu, actions
tools/build_spell_db.py génère js/data/spells-db.js
```

Les fichiers de données publient leurs tables dans l'espace de noms `window.DND` ;
`js/app.js` les importe en tête de fichier.

## Données des sorts et droits

`js/data/spells-db.js` ne contient que des **données de jeu** : nom, niveau, école, temps
d'incantation, portée, durée, composantes (V, S, M), concentration, rituel et classes.
Il ne contient **aucun texte de description** : ceux du Manuel des Joueurs sont protégés par le
droit d'auteur de Wizards of the Coast. Le grimoire renvoie vers AideDD pour les lire.

Pour régénérer le fichier (par exemple après une errata) : `python3 tools/build_spell_db.py`.
Le script lit le tableau public d'AideDD puis la page de chaque sort (une requête toutes les
0,5 s) et met les réponses en cache dans `tools/.cache/` (ignoré par git).

## Remarque

Outil non officiel. Les règles sont résumées avec des formulations propres : référez-vous au
Manuel des Joueurs 2024 pour le texte officiel.
