# configurateur-dnd

Configurateur de personnage pour **D&D 2024** (5e édition), en français, avec un grimoire de
tous les sorts du Manuel des Joueurs 2024.
Application web statique, sans build ni dépendance : ouvrez `index.html` dans un navigateur
(ça fonctionne aussi en double-cliquant le fichier, sans serveur).

Les personnages sont enregistrés dans le navigateur (`localStorage`) et peuvent être
exportés/importés en JSON, ou exportés en fiche HTML imprimable.

## Fonctionnalités

- **Accueil** : l'application s'ouvre sur un menu (liste des personnages avec ouvrir, dupliquer, supprimer ; nouveau personnage ; bibliothèque : grimoire des sorts et catalogue d'équipement avec recherche et prix ; importer et exporter, replié par défaut).
- Création pas à pas : identité, origine, classe(s), caractéristiques, sorts, équipement, fiche.
- Les **12 classes** du Manuel des Joueurs 2024 (niveaux 1 à 20), avec leurs sous-classes : barbare, barde, clerc, druide, ensorceleur, guerrier, magicien, moine, occultiste, paladin, rôdeur, roublard.
- Onglet Scores : les six caractéristiques sont réparties sur deux lignes de trois, chacune avec une petite icône (haltère, flèche, cœur, livre, œil, étoile), pour les trois méthodes et le tableau des totaux.
- **Synchronisation Google Drive** (page d'accueil) : un dossier « Configurateur DnD » de votre Drive reçoit un fichier .json par personnage ; un clic fusionne les deux côtés (le plus récent gagne, les suppressions sont répercutées). Accès limité aux fichiers créés par l'application. Mise en place : voir « Synchronisation Drive » plus bas.
- Armes Polyvalentes : le tableau d'attaques affiche les deux dégâts, à une main puis à deux mains (ex. « 1d8+2 / 1d10+2 »), pour pouvoir poser ou reprendre le bouclier en cours de partie.
- Bottes d'arme repliées par défaut dans chaque classe, avec les bottes choisies toujours visibles au-dessus (cliquer dessus pour les retirer).
- **Apparence** : thème clair, sombre ou médiéval (parchemin, rouge sombre et or, titres en MedievalSharp chargée seulement dans ce thème), ou « Automatique » qui suit l'appareil. Le choix se fait sur l'accueil ou dans le pied de page, est mémorisé dans ce navigateur (`dnd24-theme`) et s'applique à toutes les pages ; la fiche officielle imprimable reste blanche dans tous les thèmes.
- **Plusieurs pages** : `index.html` (accueil : personnages, fiches types, import/export), `personnage.html?id=…` (édition, l'onglet est gardé dans l'adresse), `grimoire.html` et `equipement.html`. Le bouton « précédent » du navigateur fonctionne, chaque page peut s'ouvrir dans son propre onglet, et seul le personnage modifié est réécrit dans la sauvegarde : deux onglets ne s'écrasent pas. L'accueil et la fiche se rafraîchissent au retour sur l'onglet si un personnage a changé ailleurs.
- **Fiches types** (Accueil, groupe repliable) : une fiche de niveau 1 par classe (caractéristiques du Tableau réparties selon la classe, espèce et historique cohérents, compétences, sorts et équipement conseillés), en lecture seule ; « Aperçu » l'affiche, « Utiliser comme base » crée une copie modifiable. Données dans `js/data/templates.js` (suggestions de départ, pas des règles).
- **Sections repliables** : dans le grimoire et la liste « Choisir des sorts » d'un personnage, les sorts sont rangés par niveau, repliés par défaut (plus de bouton « Afficher la suite »), avec « Tout déplier / Tout replier » et dépliés automatiquement pendant une recherche ou un filtre et le paquet de départ par catégorie ; l'état replié est gardé tant que la page reste ouverte.
- **Catalogue d'équipement** (Accueil) : objets rangés en quatre surcatégories (Armes, Armures, Outils, Équipements) puis en catégories, toutes repliables, avec « Tout déplier / Tout replier » ; la recherche et le filtre de catégorie déplient automatiquement ce qui correspond.
- **Équipement regroupé** : le paquet de départ s'affiche par catégorie (armes, armures et boucliers, outils, équipement), chaque ligne gardant une pastille « Classe », « Historique » ou « Achat » (les objets ajoutés rejoignent leur catégorie) ; un bouton permet de revenir au regroupement par classe / historique.
- **Bouton « haut de page »** : une flèche ronde apparaît en bas à droite dès qu'on a défilé, et ramène en haut en douceur (masquée à l'impression).
- **Compteur de sorts collant** : dans « Choisir des sorts », une barre reste visible en haut pendant le défilement et indique sorts mineurs et préparés (X/Y) ; elle passe en couleur d'accent quand la limite est atteinte (✓) et en alerte si elle est dépassée.
- **Bottes d'arme** (barbare, guerrier, paladin, rôdeur, roublard ; le moine n'en a pas en 2024) : choix des types d'armes parmi celles que la classe maîtrise, présentés botte par botte (description, puis armes concernées),
  avec le nombre qui suit le niveau (barbare 2/3/4, guerrier 3 à 6, les autres 2) et un rappel de l'effet de chaque botte. La botte apparaît dans la capacité
  de classe et dans la colonne Notes du tableau des armes pour les armes possédées.
- **Outils** : l'outil de l'historique, le Disciple martial et les maîtrises du don Doué se choisissent dans les listes du catalogue d'outils
  (outils d'artisan, autres outils, jeux, instruments) ; un champ libre reste pour un outil absent de la liste.
- **Multiclassage** (onglet Classes) : on ajoute autant de classes que l'on veut, chacune avec son niveau (niveau total limité à 20) ; le
  niveau n'est plus dans l'onglet Identité. La première classe est la classe principale (équipement de départ, jets de sauvegarde,
  compétences de départ) et peut être changée. Appliqué : bonus de maîtrise et capacités d'espèce selon le niveau total, dés de vie
  regroupés (« 3d10 + 2d8 ») et PV niveau par niveau avec le dé de la classe où le niveau a été gagné, maîtrises limitées des classes en plus
  (armures, armes, une compétence pour barde, rôdeur et roublard, instrument du barde, outils de voleur), sous-classe, choix, dons et
  améliorations de caractéristiques propres à chaque classe, emplacements de sorts selon le niveau d'incantateur cumulé (pleins lanceurs,
  moitié arrondie au supérieur, tiers arrondi à l'inférieur) avec la Magie de pacte à part, sorts mineurs et préparés par classe avec la
  caractéristique, le DD et l'attaque de chacune, CA sans armure (la meilleure seule), vitesse, initiative, ressources, langues. Les
  prérequis (13 dans les caractéristiques principales) sont signalés dans « À compléter ou vérifier » sans bloquer. Non gérés : le
  non-cumul de l'Attaque supplémentaire et la règle des Styles de combat identiques entre classes (simples rappels dans l'onglet).
- **Grimoire** : les 391 sorts avec recherche (nom français ou anglais), filtres par niveau, école,
  classe, temps d'incantation, concentration et rituel. Chaque sort renvoie vers son texte complet
  sur [AideDD](https://www.aidedd.org/spell/fr/).
- Onglet Sorts d'un personnage : liste complète de chaque classe lançant des sorts, filtrable, jusqu'au niveau qu'elle peut préparer.
- **Dégâts des sorts** : une pastille « Dégâts · feu » signale les sorts qui infligent des dégâts, avec leurs types,
  et un filtre permet de ne voir que ceux-là (ou un type précis, ou les sorts sans dégâts).
- **Icônes** de classe et de types de dégâts, dessinées pour l'application (SVG, thème clair et sombre).
- **Fiche au format officiel** : en plus de la fiche détaillée, l'onglet Fiche propose une mise en page en 2 pages A4
  qui reprend l'organisation des fiches de personnage habituelles (identité, jets et compétences, capacités, liste de
  sorts, apparence, équipement, pièces), remplie avec les données du personnage. Elle s'imprime ou se télécharge en
  .html. Les cases qui servent en jeu (PV actuels, emplacements dépensés, jets contre la mort…) restent vides.
  Le tableau « Armes & sorts mineurs » liste les attaques simples du personnage : ses armes (reconnues dans l'équipement
  de départ, l'historique et l'inventaire, ou ajoutées à la main, et toutes retirables depuis l'onglet Équipement) avec bonus d'attaque, maîtrise comprise, et dégâts ;
  la frappe à mains nues (seulement si elle fait des dégâts) ; et **uniquement les sorts mineurs qui font des dégâts**, avec leur dé au niveau du personnage.
- **Équipement** : catalogue complet des règles 2024 (armes, armures et boucliers, outils, matériel d'aventurier, paquetages, prix compris,
  d'après AideDD). On part du paquet de départ de la classe et de l'historique, avec les paquetages détaillés objet par objet : chaque ligne
  peut être retirée (ou gardée en partie) pour récupérer son prix, au prix plein ou à moitié prix. L'argent récupéré, plus les pièces de départ,
  sert à acheter autre chose dans le catalogue (ou à ajouter un objet sans coût, ou un objet personnalisé). La bourse est suivie en po, pa et pc
  et reprise dans les cases Pièces de la fiche. L'armure portée se choisit parmi les armures possédées : la CA est calculée avec sa base,
  son plafond de Dextérité et le bouclier, avec rappels (formation manquante, Force requise, désavantage en Discrétion). Les armes de la
  fiche viennent des objets possédés. Le choix « argent seul » (B ou C) reste possible. Grimoire : sans prix sur AideDD, donc non revendable.
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
- **Identité** : deux champs libres, **Apparence** (reprise dans l'encadré « Apparence » de la fiche au format officiel) et **Historique du personnage**.
- Langues, alignements et points de vie par niveau suivent les règles du Manuel des Joueurs 2024 telles que publiées par
  AideDD (table des langues courantes et rares, neuf alignements, valeurs fixes de PV par classe, minimum d'1 PV par niveau).
- Le catalogue des dons ne contient que des données de jeu (nom, catégorie, prérequis, caractéristiques du +1) ; les textes
  restent sur AideDD. Les prérequis sont affichés, mais seuls le niveau et la présence de la capacité Style de combat
  grisent un don : les seuils de caractéristiques ne sont pas vérifiés.
- **Faveurs épiques** : AideDD n'en publie pas le texte. L'application propose le catalogue et laisse le joueur
  choisir lui-même le +1 de caractéristique (maximum 30) ; aucun autre effet n'est appliqué.
- Non gérés : le remplacement de sorts d'Initié à la magie à chaque niveau, les effets chiffrés des bottes d'arme, les
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
- Non gérés : bonus d'armes magiques, munitions, armes improvisées, armes à deux mains tenues
  à une main, et les styles de combat autres que ceux ci-dessus.

## Fiche au format officiel : ce qui est repris

Seule l'**organisation** des rubriques est reprise des fiches habituelles. L'habillage (cadres, typographie, titres) est
propre à cette application : aucun logo, aucune illustration et aucun élément graphique des fiches éditées par Wizards
of the Coast ne sont reproduits. Le texte des capacités reste celui, résumé, de l'application.

## Remarque

Outil non officiel. Les règles sont résumées avec des formulations propres : référez-vous au
Manuel des Joueurs 2024 pour le texte officiel.

## Synchronisation Drive : mise en place (une seule fois)

L'application est statique, la connexion à Google se fait donc dans le navigateur avec un identifiant client OAuth (public, sans secret).

1. Sur <https://console.cloud.google.com> (n'importe quel compte Google), créer un projet, par exemple « Configurateur DnD ». Aucune facturation n'est nécessaire.
2. *API et services > Bibliothèque* : activer **Google Drive API**.
3. *Google Auth Platform* (écran de consentement OAuth) : type d'utilisateur **Externe**, nom de l'application, adresse e-mail de contact. Dans *Accès aux données*, ajouter le scope `https://www.googleapis.com/auth/drive.file` (non sensible : aucune validation Google). Dans *Audience*, soit passer en **production**, soit ajouter le compte Drive utilisé comme utilisateur test.
4. *Clients > Créer un client* : type **Application Web**, origines JavaScript autorisées `https://chrisguillet.github.io` (et `http://localhost:8000` pour tester en local). Pas d'URI de redirection.
5. Copier l'identifiant client (`…apps.googleusercontent.com`) dans `js/sync-config.js` (`googleClientId`) puis pousser, ou le coller dans le champ de la page d'accueil (à refaire sur chaque appareil dans ce cas).
6. Sur la page d'accueil, « Se connecter et synchroniser » et choisir le compte Drive. Sur les autres appareils, même compte, même bouton : le dossier est retrouvé tout seul.
