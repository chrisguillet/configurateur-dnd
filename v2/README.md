# Configurateur D&D 2024 · V2 (en construction)

Sous-dossier `v2/` : bac à sable pour la suite. Les fiches évolutives ont été portées à la racine (mêmes `js/app.js`, `js/evo.js`, `js/i18n-v2.js`, `css/v2.css`) ; ce dossier garde sa propre copie pour les prochains chantiers. La V2 **réutilise le code de données de la V1**
(`../js/data/*`, `../css/style.css`, grimoire, équipement, synchronisation…) et ne garde en propre que `js/app.js` (copie de départ
de celui de la V1) et ce qui est nouveau. **Même clé de stockage** (`dnd24-configurateur-v1`) : une fiche créée en V1 s'ouvre en V2 et inversement.

## Deux types de fiches
- **Figée** (V1, par défaut) : aucun champ `mode`, rien ne change.
- **Évolutive** (`mode:'evo'`) : un état par niveau, `c.evo = { cur, view, max, niv:{ 1:{snap,tx,note,warn}, … } }`. Le haut de la fiche
  reflète toujours le niveau affiché, et à l'enregistrement le niveau en cours : la V1 lit donc la fiche comme une fiche figée de ce niveau.

## Moteur : `js/evo.js` (tests : `node v2/test/evo.test.js`)
`init`, `project` (afficher un niveau), `commit` (répercuter une modification sur les niveaux suivants ; un choix déjà changé plus loin
n'est pas écrasé mais signalé dans `warn`), `addLevel`, `setCur` (niveau en cours), `resetFrom` (supprime un niveau et les suivants),
transactions d'équipement (`txOf`, `gold`, `items`), `forStorage`.

## Déjà en place dans l'interface
- Création : choix « Évolutive » (par défaut en V2) ou « Figée » avant de choisir la classe.
- Onglet **Niveaux** (fiches évolutives) : niveaux en colonne verticale (★ = niveau en cours, ! = avertissement, pointillés = préparé),
  « + Niveau » (classe qui progresse, multiclasse possible), ce que le niveau apporte (capacités, sorts, don), transaction
  (montant, description, objets ajoutés / retirés, pris en compte dans la bourse et les objets possédés), notes, tag du niveau en cours,
  « Réinitialiser à partir de ce niveau ».
- Les autres onglets (Classes, Sorts, Équipement…) modifient le niveau affiché ; une barre rappelle le niveau affiché et le niveau en cours.
- Traductions : `js/i18n-v2.js`.

## Catalogue personnel (page `catalogue.html`)
La bibliothèque a trois pages : Grimoire des sorts, Équipement et **Catalogue** (menu et accueil). Le catalogue a trois rubriques : **Classes**, **Espèces**, **Historiques** (`catalogue.html#classes`, `#especes`, `#historiques`).
Chaque entrée officielle détaille ses bonus (bases, incantation, bonus de classe, équipement, capacités par niveau…) et peut servir de
point de départ (« Créer une variante personnalisée »). Les entrées personnelles sont gardées dans le navigateur (clé `dnd24-v2-catalog`),
avec une icône au choix dans un cadre en losange ; export / import JSON du catalogue ; il est aussi **synchronisé avec Google Drive** (fichier `catalogue.json`, le plus récent gagne ; première synchro d'un appareil : fusion, rien n'est perdu). `v2/js/sync.js` est la copie V2 du module de synchro.
Une fiche qui utilise une entrée **en garde une copie** (`cdefs`, `sdef`, `bdef` + `from` = identifiant du catalogue) : elle reste lisible
sans le catalogue (export, synchronisation). Bouton « Mettre à jour depuis le catalogue » ou « Rendre modifiable ici » sur la fiche.
`v2/js/data/custom-class.js` est la copie V2 du module des définitions (champs `from` et `ic` en plus).

## À faire
Base (identité, origine, scores, équipement de départ) clairement séparée des niveaux, avertissements plus lisibles (noms de champs),
sorts et dons directement dans le panneau du niveau, puis le catalogue personnalisé du grimoire (classes, espèces, historiques).
