# Configurateur D&D 2024 · V2 (en construction)

Sous-dossier `v2/` : mêmes pages que la V1, qui continue de vivre à la racine. La V2 **réutilise le code de données de la V1**
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

## À faire
Interface des niveaux (onglets verticaux sous la base), choix « figée / évolutive » à la création, transactions dans l'équipement,
avertissements par niveau, puis le catalogue personnalisé du grimoire (classes, espèces, historiques).
