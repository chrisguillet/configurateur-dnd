# configurateur-dnd

Configurateur de personnage pour **D&D 2024** (5e édition), en français, avec un grimoire de
tous les sorts du Manuel des Joueurs 2024.
Application web statique, sans build ni dépendance : ouvrez `index.html` dans un navigateur
(ça fonctionne aussi en double-cliquant le fichier, sans serveur).

Les personnages sont enregistrés dans le navigateur (`localStorage`) et peuvent être
exportés/importés en JSON, ou exportés en fiche HTML imprimable.

## Fonctionnalités

- Création pas à pas : identité, origine, classe, caractéristiques, sorts, équipement, fiche.
- Les **12 classes** du Manuel des Joueurs 2024 (niveaux 1 à 20), avec leurs sous-classes : barbare, barde, clerc, druide, ensorceleur, guerrier, magicien, moine, occultiste, paladin, rôdeur, roublard.
- **Grimoire** : les 391 sorts avec recherche (nom français ou anglais), filtres par niveau, école,
  classe, temps d'incantation, concentration et rituel. Chaque sort renvoie vers son texte complet
  sur [AideDD](https://www.aidedd.org/spell/fr/).
- Onglet Sorts d'un personnage : liste complète de sa classe, filtrable, jusqu'au niveau de ses emplacements.
- **Dégâts des sorts** : une pastille « Dégâts · feu » signale les sorts qui infligent des dégâts, avec leurs types,
  et un filtre permet de ne voir que ceux-là (ou un type précis, ou les sorts sans dégâts).
- **Icônes** de classe et de types de dégâts, dessinées pour l'application (SVG, thème clair et sombre).
- **Portrait** du personnage (espèce, genre, classe) sur la fiche et dans la fiche HTML exportée, avec réglages de
  l'apparence : teint, longueur, style et couleur des cheveux, couleur des yeux.

## Structure

```
index.html              page unique, charge les scripts ci-dessous
css/style.css           styles (thèmes clair/sombre, impression)
js/data/base.js         tables de règles communes et petits utilitaires
js/data/classes.js      barbare, barde, clerc, ensorceleur, guerrier, occultiste : capacités, sous-classes, métamagie
js/data/classes-ext.js  druide, magicien, moine, paladin, rôdeur, roublard + table d'incantation de toutes les classes
js/data/origins.js      historiques et espèces
js/data/spells-db.js    données des 391 sorts (GÉNÉRÉ, ne pas modifier à la main)
js/data/spells.js       index, listes de sorts par classe, recherche, anciens noms de sorts
js/icons.js             icônes SVG : classes et types de dégâts
js/portrait.js          portrait SVG (fonction pure : espèce, genre, classe, apparence → SVG)
js/spell-views.js       rendu HTML des lignes de sorts (fonctions pures)
js/app.js               état, calculs, rendu, actions
tools/build_spell_db.py génère js/data/spells-db.js
tools/spell_damage.py   déduit les dégâts d'un sort à partir de son texte (corrections manuelles justifiées)
```

Les fichiers de données publient leurs tables dans l'espace de noms `window.DND` ;
`js/app.js` les importe en tête de fichier.

## Données des sorts et droits

`js/data/spells-db.js` ne contient que des **données de jeu** : nom, niveau, école, temps
d'incantation, portée, durée, composantes (V, S, M), concentration, rituel et classes.
Il ne contient **aucun texte de description** : ceux du Manuel des Joueurs sont protégés par le
droit d'auteur de Wizards of the Coast. Le grimoire renvoie vers AideDD pour les lire.

### Les dégâts : méthode et limites

Le champ « dégâts » est **déduit du texte** de chaque sort, qui est lu en mémoire puis oublié : seul le résultat
(types de dégâts) est écrit. Un sort est marqué quand son effet inflige des dégâts, ou en ajoute à vos attaques
(Marque du chasseur, Agrandissement). Les sorts qui invoquent une créature qui attaque sont marqués « créature ».
Ne comptent pas : résistances et immunités, bonus ou malus aux jets de dégâts, dégâts accidentels ou subis par le
lanceur (Téléportation en cas d'incident, Souhait…). La règle est automatique (un dé ou un montant fixe à côté du mot
« dégâts ») ; les exceptions relues à la main sont listées, avec leur justification, dans `tools/spell_damage.py`.
C'est une aide à la lecture, pas une référence : en cas de doute, lisez le sort.

Pour régénérer le fichier (par exemple après une errata) : `python3 tools/build_spell_db.py`.
Le script lit le tableau public d'AideDD puis la page de chaque sort (une requête toutes les
0,5 s) et met les réponses en cache dans `tools/.cache/` (ignoré par git).

## Sous-classes non encore disponibles

Ces sous-classes du Manuel des Joueurs apparaissent dans la liste, grisées et marquées « bientôt », faute de détail saisi :
Cercle des Astres (druide), Vagabond féerique (rôdeur), Credo de la Miséricorde (moine), Âme acérée (roublard),
Voie du Zélateur (barbare), Sorcellerie aberrante et Sorcellerie mécanique (ensorceleur).
Quand le texte d'une capacité n'est pas saisi, l'application renvoie au Manuel des Joueurs.

## Remarque

Outil non officiel. Les règles sont résumées avec des formulations propres : référez-vous au
Manuel des Joueurs 2024 pour le texte officiel.
