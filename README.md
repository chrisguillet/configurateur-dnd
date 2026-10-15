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
- **Fiche au format officiel** : en plus de la fiche détaillée, l'onglet Fiche propose une mise en page en 2 pages A4
  qui reprend l'organisation des fiches de personnage habituelles (identité, jets et compétences, capacités, liste de
  sorts, apparence, équipement, pièces), remplie avec les données du personnage. Elle s'imprime ou se télécharge en
  .html. Les cases qui servent en jeu (PV actuels, emplacements dépensés, jets contre la mort…) restent vides.
  Le tableau « Armes & sorts mineurs » liste les attaques simples du personnage : ses armes (reconnues dans l'équipement
  de départ, l'historique et l'inventaire, ou ajoutées à la main) avec bonus d'attaque, maîtrise comprise, et dégâts ;
  la frappe à mains nues ; et **uniquement les sorts mineurs qui font des dégâts**, avec leur dé au niveau du personnage.
- **Points de vie** : à chaque niveau, au choix la valeur fixe (moyenne) ou un lancer de dé saisi ou tiré dans
  l'application, avec le minimum d'1 PV gagné par niveau prévu par les règles.
- **Langues** : le Commun, deux langues courantes à choisir, puis ce qu'ajoutent les capacités de classe (druidique,
  argot des voleurs et une langue pour le roublard, deux langues pour le rôdeur au niveau 2).
- **Alignement** : les neuf alignements, accordés au sexe du personnage.
- **Dons** : catalogue des 75 dons 2024 (origine, généraux, styles de combat, faveurs épiques) avec leurs prérequis et un
  lien vers leur texte. Appliqués par l'application : le +1 de caractéristique des dons de niveau et de la faveur épique,
  et les effets de Robuste, Vigilant, Défense, Résilient, Doué, Initié à la magie, Combattant béni et Combattant druidique.
  Les autres dons sont enregistrés et affichés sur la fiche, sans effet automatique.
- **Choix de classe** : style de combat (guerrier, paladin, rôdeur), savoir primal (barbare), disciple martial (Maître de
  guerre), ordre divin (clerc).
- **Sexe** : masculin, féminin ou « - » (non précisé : les noms de classe, d'espèce et d'historique sont alors au masculin).
- **Apparence** : teint, longueur, style et couleur des cheveux, couleur des yeux, à choisir en quelques clics ; ils
  décrivent le personnage dans l'encadré « Apparence » de la fiche au format officiel.
- Langues, alignements et points de vie par niveau suivent les règles du Manuel des Joueurs 2024 telles que publiées par
  AideDD (table des langues courantes et rares, neuf alignements, valeurs fixes de PV par classe, minimum d'1 PV par niveau).
- Le catalogue des dons ne contient que des données de jeu (nom, catégorie, prérequis, caractéristiques du +1) ; les textes
  restent sur AideDD. Les prérequis sont affichés, mais seuls le niveau et la présence de la capacité Style de combat
  grisent un don : les seuils de caractéristiques ne sont pas vérifiés.
- **Faveurs épiques** : AideDD n'en publie pas le texte. L'application propose le catalogue et laisse le joueur
  choisir lui-même le +1 de caractéristique (maximum 30) ; aucun autre effet n'est appliqué.
- Non gérés : le remplacement de sorts d'Initié à la magie à chaque niveau, les maîtrises d'armes (Botte d'arme), les
  choix d'Expert, les manœuvres du Maître de guerre, et la plupart des effets propres aux dons généraux.

## Attaques : règles appliquées et limites

- Bonus d'attaque d'une arme : modificateur de Force (arme de corps à corps) ou de Dextérité (arme à distance) ou le meilleur
  des deux (Finesse), plus la maîtrise si la classe maîtrise l'arme (restrictions du moine et du roublard comprises). Dégâts :
  dé de l'arme plus le même modificateur. Une arme non maîtrisée est signalée et n'ajoute pas la maîtrise.
- Styles de combat appliqués : Archerie (+2 à l'attaque à distance), Duel (+2 aux dégâts d'une arme à une main), Arme de
  lancer (mention du +2 en lancer). Le moine sans armure ni bouclier utilise Dextérité et son dé d'Arts martiaux.
- Sorts mineurs : seuls ceux marqués « Dégâts » sont listés. Jet d'attaque (« +7 ») ou sauvegarde de la cible (« DD 14 SAG »),
  dé selon le niveau (niveaux 5, 11 et 17), nombre de rayons de Décharge occulte. Les sorts mineurs viennent de la caractéristique
  de leur source (Initié à la magie, Combattant béni ou druidique, espèce), sinon de celle de la classe.
- Non gérés : bonus d'armes magiques, bottes d'arme (choix et effets), munitions, armes improvisées, armes à deux mains tenues
  à une main, et les styles de combat autres que ceux ci-dessus.

## Fiche au format officiel : ce qui est repris

Seule l'**organisation** des rubriques est reprise des fiches habituelles. L'habillage (cadres, typographie, titres) est
propre à cette application : aucun logo, aucune illustration et aucun élément graphique des fiches éditées par Wizards
of the Coast ne sont reproduits. Le texte des capacités reste celui, résumé, de l'application.

## Remarque

Outil non officiel. Les règles sont résumées avec des formulations propres : référez-vous au
Manuel des Joueurs 2024 pour le texte officiel.
