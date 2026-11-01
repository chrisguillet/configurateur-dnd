/* Langue de l'interface : français par défaut, anglais en option.
   Le code reste en français. En anglais, un traducteur remplace les textes affichés (et les attributs
   placeholder / title / aria-label) selon le dictionnaire EN ci-dessous. Les noms de sorts viennent du
   champ « vo » (nom anglais) de la base. */
(function(){
'use strict';
const KEY='dnd24-lang';
const EN={
  "Accueil":"Home","Bibliothèque":"Library","Outils":"Tools","Grimoire des sorts":"Spellbook","Équipement":"Equipment",
  "Lancer des dés":"Roll dice","Mes personnages":"My characters","Nouveau personnage":"New character","Nouveau dossier":"New folder",
  "Fiches types":"Template sheets","Fiches partagées":"Shared sheets","Paramètres":"Settings","Apparence":"Appearance",
  "Langue":"Language","Synchronisation Google Drive":"Google Drive sync","Importer et exporter":"Import and export",
  "Identité":"Identity","Origine":"Origin","Classes":"Classes","Scores":"Scores","Sorts":"Spells","Fiche":"Sheet","Fermer":"Close",
  "Configurateur D&D 2024":"D&D 2024 Configurator","Création de personnage":"Character creation","Grimoire":"Spellbook",
  "Classe":"Class","Espèce":"Species","Espèce :":"Species:","Historique":"Background","Classe / historique":"Class / background",
  "Origine :":"Origin:","Origine retenue :":"Origin chosen:","Niveau":"Level","Niveau 1 :":"Level 1:","Niveau total :":"Total level:",
  "Niveau total (sur 20)":"Total level (out of 20)","Nom":"Name","Nom du personnage":"Character name","Nom du sort":"Spell name",
  "Nom anglais":"English name","Non précisé":"Not specified","Notes":"Notes","Sexe (accorde les noms de classe, d'espèce et d'historique ; « - » : formes masculines)":"Gender (adjusts class, species and background names; “-”: masculine forms)",
  "Féminin":"Feminine","Masculin":"Masculine","Pour la classe":"For the class","Sous-classe":"Subclass","Passer en classe principale":"Make it the main class",
  "Retirer cette classe":"Remove this class","Ajouter une classe (multiclassage)":"Add a class (multiclass)",
  "Pas de compétence de plus avec cette classe en multiclassage.":"No extra skill with this class in multiclassing.",
  "Caractéristiques":"Ability scores","Caractéristique :":"Ability:","Caractéristique d'incantation de ce don":"Spellcasting ability of this feat",
  "Méthode":"Method","Attribution":"Assignment","Score":"Score","Valeur :":"Value:","Tableau":"Table","Modificateur :":"Modifier:","Mod.":"Mod.",
  "Terminez les 6 lancers pour attribuer tous les scores.":"Finish the 6 rolls to assign all scores.",
  "Chaque valeur du tableau doit être utilisée exactement une fois.":"Each value in the table must be used exactly once.",
  "Attribuez 15, 14, 13, 12, 10 et 8, une fois chacun.":"Assign 15, 14, 13, 12, 10 and 8, once each.",
  "Attribuez chacun des 6 résultats à une caractéristique.":"Assign each of the 6 results to an ability.",
  "Lancez 4d6 et gardez les 3 meilleurs dés, six fois. Attribuez ensuite chaque résultat à une caractéristique.":"Roll 4d6 and keep the 3 highest dice, six times. Then assign each result to an ability.",
  "Lancer 4d6":"Roll 4d6","Lancer":"Roll","Lancer les niveaux restants":"Roll remaining levels","Lancers de dés":"Dice rolls",
  "Remettre les variations à zéro":"Reset adjustments","Tout lancer":"Roll all","Vous dépassez les 27 points.":"You exceed the 27 points.",
  "27 points à répartir, valeurs de 8 à 15. Points dépensés :":"27 points to spend, values from 8 to 15. Points spent:",
  "Dépensés":"Spent","Base":"Base","Caractéristiques":"Ability scores","Calcul de base :":"Base calculation:",
  "Ce bonus s'ajoute aux sauvegardes, compétences et attaques maîtrisées.":"This bonus applies to proficient saving throws, skills and attacks.",
  "Compétences":"Skills","Compétences :":"Skills:","Maîtrise":"Proficiency","Maîtrises :":"Proficiencies:","Entraînements":"Training",
  "ENTRAÎNEMENTS & MAÎTRISES":"TRAINING & PROFICIENCIES","Langues":"Languages","Langues :":"Languages:","Langues courantes":"Common languages",
  "Langues rares":"Rare languages","LANGUES":"LANGUAGES","Outil :":"Tool:","Outils :":"Tools:","Vigilant :":"Vigilant:",
  "Dons":"Feats","DONS":"FEATS","Don :":"Feat:","Autre don":"Other feat","Autre don (saisie libre)":"Other feat (free entry)",
  "Choisir un don":"Choose a feat","Dons et améliorations":"Feats and improvements","Amélioration de caractéristiques":"Ability Score Improvement",
  "Initié à la magie":"Magic Initiate","Doué":"Gifted","Disciple martial":"Martial adept","Savoir primal":"Primal knowledge",
  "Faveur épique (niveau 19)":"Epic Boon (level 19)","Lire le don sur AideDD":"Read the feat on AideDD",
  "Lire le texte du sort sur AideDD":"Read the spell text on AideDD","Voir ce que fait chaque option":"See what each option does",
  "Évolution à chaque niveau":"Progression at each level","Traits":"Traits","TRAITS D'ESPÈCE":"SPECIES TRAITS","Traits et capacités":"Traits and features",
  "Espèce et historique : ils fixent la Vitesse, les traits, deux compétences, un don et des bonus de caractéristiques.":"Species and background set Speed, traits, two skills, a feat and ability bonuses.",
  "Un type d'outils d'artisan et une compétence de la liste du guerrier.":"One type of artisan's tools and one skill from the fighter list.",
  "Une compétence de plus, parmi celles de la liste du barbare.":"One more skill, from the barbarian list.",
  "Choisissez la caractéristique à +2 et celle à +1.":"Choose the ability for +2 and the one for +1.",
  "Choisissez la classe de départ. Vous pourrez ajouter une multiclasse plus tard.":"Choose the starting class. You can add a multiclass later.",
  "Choisissez un historique dans l'onglet Origine pour voir son équipement.":"Choose a background in the Origin tab to see its equipment.",
  "Choisissez un historique dans le tableau.":"Choose a background from the table.","Choisissez une espèce dans le tableau.":"Choose a species from the table.",
  "Choisissez la bête.":"Choose the beast.","Choisir des sorts":"Choose spells","Choisir un fichier":"Choose a file",
  "Choisir / modifier les bottes d'arme":"Choose / edit weapon bundles","Aucune botte choisie.":"No weapon bundle chosen.",
  "Choix A : l'équipement":"Option A: equipment","Choix B : 50 po":"Option B: 50 gp","Paquet de départ":"Starting pack",
  "Aucun objet de départ avec ce choix : tout passe par l'achat ci-dessous.":"No starting item with this choice: everything goes through the purchase below.",
  "Achat":"Purchase","Achats et ajouts":"Purchases and additions","Ajouter un objet":"Add an item","Ajouter cet objet":"Add this item",
  "Objet":"Item","Objet absent de la liste (magique, spécial)":"Item not in the list (magic, special)","Catégorie":"Category",
  "Quantité":"Quantity","Prix unitaire en po":"Unit price in gp","Prix plein":"Full price","Moitié du prix":"Half price",
  "Sans coût (trouvé, offert, déjà possédé)":"No cost (found, gifted, already owned)","Prix de revente des objets retirés":"Resale value of removed items",
  "Rien d'acheté pour l'instant.":"Nothing bought yet.","Aucun objet.":"No item.","Aucun objet ne correspond.":"No item matches.",
  "Aucun objet pour l'instant : ajoutez-en ci-dessous.":"No items yet: add some below.","Rechercher un objet":"Search an item",
  "Bourse":"Purse","Bourse :":"Purse:","Pièces":"Coins","PIÈCES":"COINS","Vous avez dépensé plus que vos pièces : retirez des objets ou ajustez la bourse.":"You spent more than your coins: remove items or adjust the purse.",
  "Retirer":"Remove","Restaurer":"Restore","Armes et sorts mineurs":"Weapons and cantrips","ARMES":"WEAPONS","ARMURES":"ARMOR",
  "ARMES & SORTS MINEURS":"WEAPONS & CANTRIPS","Armes, armures, outils et matériel d'aventurier du Manuel des Joueurs 2024, avec leurs prix, d'après AideDD.":"Weapons, armor, tools and adventuring gear from the 2024 Player's Handbook, with their prices, based on AideDD.",
  "Armure :":"Armor:","Bouclier :":"Shield:","Boucliers":"Shields","BOUCLIER":"SHIELD","CLASSE D'ARMURE":"ARMOR CLASS","Classe d'armure":"Armor class",
  "Att. / DD":"Atk. / DC","ATT.":"ATK.","Attaque":"Attack","Attaque de sort":"Spell attack","Attaque de sort :":"Spell attack:",
  "Dégâts":"Damage","Dégâts & Type":"Damage & Type","Portée":"Range","Durée":"Duration","Incantation":"Casting","Composantes":"Components",
  "Concentration":"Concentration","Conc.":"Conc.","Rituel":"Ritual","Réaction":"Reaction","Action":"Action","Action bonus":"Bonus action",
  "Action ou rituel":"Action or ritual","Actions":"Actions","Temps d'incantation":"Casting time","Temps d'incant.":"Cast time",
  "Temps d'incantation particuliers":"Special casting times","Toujours disponibles":"Always available","Toujours préparé":"Always prepared",
  "Toujours préparé (ne compte pas dans la limite)":"Always prepared (does not count toward the limit)","Toujours préparés":"Always prepared",
  "(toujours préparé)":"(always prepared)","Sorts mineurs":"Cantrips","SORTS MINEURS & SORTS PRÉPARÉS":"CANTRIPS & PREPARED SPELLS",
  "Sorts préparés :":"Prepared spells:","Sorts ajoutés à la main":"Manually added spells","Emplacements de sort":"Spell slots",
  "Emplacements de sorts":"Spell slots","Emplacements :":"Slots:","EMPLACEMENTS DE SORTS":"SPELL SLOTS","Rechercher un sort":"Search a spell",
  "Aucun sort ne correspond. Essayez moins de filtres ou une autre orthographe.":"No spell matches. Try fewer filters or another spelling.",
  "Réinitialiser la recherche et les filtres":"Reset search and filters","Toutes":"All","Regrouper par":"Group by",
  "Ajouter ce sort":"Add this spell","DD des sorts":"Spell save DC","DD de sauvegarde :":"Save DC:","DD DE SAUVEGARDE CONTRE LES SORTS":"SPELL SAVE DC",
  "BONUS D'ATTAQUE AVEC UN SORT":"SPELL ATTACK BONUS","BONUS DE MAÎTRISE":"PROFICIENCY BONUS","CARACTÉRISTIQUE D'INCANTATION":"SPELLCASTING ABILITY",
  "MODIFICATEUR":"MODIFIER","MODIFICATEUR D'INCANTATION":"SPELLCASTING MODIFIER","Sauvegarde":"Saving throw","Jets de sauvegarde":"Saving throws",
  "Perception passive":"Passive Perception","Initiative":"Initiative","Vitesse":"Speed","VITESSE":"SPEED","Taille":"Size",
  "Points de vie":"Hit points","POINTS DE VIE":"HIT POINTS","Dés de vie":"Hit dice","Dés de vie :":"Hit dice:","DÉS DE VIE":"HIT DICE",
  "JETS CONTRE LA MORT":"DEATH SAVES","ÉCHECS":"FAILURES","SUCCÈS":"SUCCESSES","INSPIRATION HÉROÏQUE":"HEROIC INSPIRATION",
  "Ressources":"Resources","Ressources à suivre":"Resources to track","Repos court":"Short rest","Repos long":"Long rest",
  "CAPACITÉS DE CLASSE":"CLASS FEATURES","COMPAGNON PRIMITIF":"PRIMAL COMPANION","Compagnon primitif":"Primal companion",
  "Alignement":"Alignment","ALIGNEMENT":"ALIGNMENT","Alignement :":"Alignment:","Histoire":"History","HISTOIRE & PERSONNALITÉ":"BACKSTORY & PERSONALITY",
  "Identité":"Identity","Caractéristiques":"Ability scores","APPARENCE":"APPEARANCE","Apparence":"Appearance",
  "Case à remplir":"Field to fill","Cette fiche n'a pas de nom":"This sheet has no name","Pas encore de nom.":"No name yet.",
  "Sans nom, elle ne sera pas sauvegardée si vous quittez la page. Donnez-lui un nom pour la garder.":"Unnamed, it won't be saved if you leave the page. Give it a name to keep it.",
  "Donnez un nom pour l'enregistrer.":"Give it a name to save it.","Enregistrer et continuer":"Save and continue",
  "Enregistrer l'identifiant":"Save the ID","Recommencer":"Start over","Précédent":"Previous","Suivant":"Next","Nouveau…":"New…",
  "Annuler":"Cancel","Annuler et ne pas sauvegarder":"Cancel and don't save","Créer":"Create","Supprimer":"Delete","Supprimer le dossier":"Delete folder",
  "Confirmer la suppression":"Confirm deletion","Renommer":"Rename","Renommer le dossier":"Rename folder","Dupliquer":"Duplicate",
  "Garder":"Keep","Imprimer":"Print","Télécharger la fiche (.html)":"Download the sheet (.html)","Sauvegarder ce personnage (.json)":"Save this character (.json)",
  "Tout sauvegarder (.json)":"Save everything (.json)","Importer":"Import","Importer le texte collé":"Import pasted text",
  "Collez le contenu d'une sauvegarde .json, ou choisissez le fichier.":"Paste the content of a .json backup, or choose the file.",
  "Format de la fiche":"Sheet format","Format officiel (2 pages A4)":"Official format (2 A4 pages)","Utiliser comme base":"Use as base",
  "Voir la fiche":"View sheet","Aperçu":"Preview","Aperçu d'une fiche supprimée (lecture seule).":"Preview of a deleted sheet (read only).",
  "Fiche partagée":"Shared sheet","Fiche partagée en lecture seule.":"Shared sheet, read only.","Fiche type en lecture seule.":"Template sheet, read only.",
  "Lecture seule":"Read only","Partager en lecture seule":"Share read only","Arrêter le partage":"Stop sharing",
  "Copier le lien de partage":"Copy the share link","Ajouter à mes fiches partagées":"Add to my shared sheets","Ajouter la fiche":"Add sheet",
  "+ Ajouter une fiche":"+ Add a sheet","+ Nouveau « Groupe »":"+ New “Group”","Groupe":"Group","Glissez une fiche sur un autre bloc « Groupe » pour la déplacer.":"Drag a sheet onto another “Group” block to move it.",
  "Aucune fiche. Glissez-en une ici.":"No sheets. Drag one here.","Aucune fiche partagée pour l'instant.":"No shared sheets yet.",
  "Aucune fiche supprimée.":"No deleted sheets.","Aucun personnage pour l'instant.":"No characters yet.","Aucun pour l'instant.":"None yet.",
  "(aucun)":"(none)","(fiches conservées)":"(sheets kept)","(lien indisponible)":"(link unavailable)","(non sauvegardé)":"(not saved)",
  "(personnages conservés)":"(characters kept)","(tous les autres : action Magie)":"(all others: Magic action)",
  "Déjà dans vos fiches partagées":"Already in your shared sheets","Déconnecter":"Sign out","Actualiser la liste":"Refresh list",
  "Pas encore chargée : elle se met à jour à chaque synchronisation, ou avec « Actualiser la liste ».":"Not loaded yet: it updates at each sync, or with “Refresh list”.",
  "Envoyer automatiquement sur Drive une fiche au moment de la partager (sinon, il faut d'abord synchroniser).":"Automatically send a sheet to Drive when sharing it (otherwise, sync first).",
  "Lien non valide : il doit commencer par https:// (ou http://) et tenir en 250 caractères.":"Invalid link: it must start with https:// (or http://) and be at most 250 characters.",
  "Cette fiche est introuvable : le lien n'est plus valide ou le partage a été arrêté.":"This sheet cannot be found: the link is no longer valid or sharing was stopped.",
  "Ce personnage n'existe plus dans ce navigateur. Retournez à l'accueil pour choisir ou créer un personnage.":"This character no longer exists in this browser. Go back home to choose or create a character.",
  "Personnage introuvable":"Character not found","Il a peut-être été supprimé":"It may have been deleted","Chargement de la fiche…":"Loading sheet…",
  "Retour à l'accueil":"Back to home","Revenir à la fiche":"Back to the sheet","Création de personnage":"Character creation",
  "Dossier vide.":"Empty folder.","Sortir du dossier":"Remove from folder","Changer de personnage…":"Switch character…",
  "Touchez un dé pour l'ajouter (10 dés maximum).":"Tap a die to add it (10 dice maximum).","Bonus fixe (+/−)":"Fixed bonus (+/−)",
  "Effacer les lancers":"Clear rolls","Vider":"Clear","Total":"Total","Total :":"Total:","Dés (d4 à d100) avec bonus fixe":"Dice (d4 to d100) with fixed bonus",
  "Dés / libre":"Dice / free","Détaillée":"Detailed","Moyenne (valeur fixe)":"Average (fixed value)","Méthode":"Method",
  "Point plein : maîtrise · point coloré : expertise. Survolez ou appuyez longuement pour voir le calcul.":"Solid dot: proficiency · colored dot: expertise. Hover or long-press to see the calculation.",
  "✓ maîtrise · ★ expertise":"✓ proficiency · ★ expertise","Histoire":"History","Féminin":"Feminine",
  "Sorts":"Spells","Fiche":"Sheet","Fermer":"Close","Imprimer":"Print","Sauvegarde":"Saving throw",
  "Grimoire des sorts":"Spellbook","Équipement":"Equipment","École":"School","Temps d'incantation":"Casting time",
  "Nouveau dossier":"New folder","Nouveau personnage":"New character","Mes personnages":"My characters","Lancer de dés":"Dice roller",
  "Objet":"Item","Sorts mineurs":"Cantrips","Origine":"Origin","Doué":"Gifted",
  "Abjuration":"Abjuration","Divination":"Divination","Enchantement":"Enchantment","Évocation":"Evocation","Illusion":"Illusion",
  "Invocation":"Conjuration","Nécromancie":"Necromancy","Transmutation":"Transmutation",
  "Force":"Strength","Dextérité":"Dexterity","Constitution":"Constitution","Intelligence":"Intelligence","Sagesse":"Wisdom","Charisme":"Charisma",
  "FOR":"STR","DEX":"DEX","CON":"CON","INT":"INT","SAG":"WIS","CHA":"CHA",
  "Acrobaties":"Acrobatics","Arcanes":"Arcana","Athlétisme":"Athletics","Discrétion":"Stealth","Dressage":"Animal Handling",
  "Escamotage":"Sleight of Hand","Histoire":"History","Intimidation":"Intimidation","Intuition":"Insight","Investigation":"Investigation",
  "Médecine":"Medicine","Nature":"Nature","Perception":"Perception","Persuasion":"Persuasion","Religion":"Religion",
  "Représentation":"Performance","Survie":"Survival","Tromperie":"Deception",
  "Barbare":"Barbarian","Barde":"Bard","Clerc":"Cleric","Druide":"Druid","Ensorceleur":"Sorcerer","Guerrier":"Fighter","Magicien":"Wizard",
  "Moine":"Monk","Occultiste":"Warlock","Paladin":"Paladin","Rôdeur":"Ranger","Roublard":"Rogue",
  "Nain":"Dwarf","Elfe":"Elf","Halfelin":"Halfling","Humain":"Human","Orc":"Orc","Gnome":"Gnome","Drakéide":"Dragonborn","Tieffelin":"Tiefling",
  "Haut-elfe":"High Elf","Légères":"Light","Lourdes":"Heavy","Moyennes":"Medium","Boucliers":"Shields",
  "Temps d'incantation":"Casting time","Dés de vie":"Hit dice","Attaque de sort":"Spell attack"
};
function lang(){try{return localStorage.getItem(KEY)==='en'?'en':'fr';}catch(x){return 'fr';}}
function setLang(l){try{localStorage.setItem(KEY,l==='en'?'en':'fr');}catch(x){}}
const T=s=>lang()==='en'&&EN[s]!==undefined?EN[s]:s;
const spellName=s=>lang()==='en'&&s.vo?s.vo:s.n;
/* remplace le texte français d'un nœud ou d'un attribut par sa traduction, en gardant les espaces autour */
const DMG={"perforants":"piercing","contondants":"bludgeoning","tranchants":"slashing","acide":"acid","contondant":"bludgeoning","feu":"fire","force":"force","foudre":"lightning","froid":"cold","nécrotique":"necrotic","perforant":"piercing","poison":"poison","psychique":"psychic","radiant":"radiant","tonnerre":"thunder","tranchant":"slashing","arme":"weapon","créature":"creature"};
const UNITS={"minute":"minute","minutes":"minutes","heure":"hour","heures":"hours","jour":"day","jours":"days","round":"round","rounds":"rounds"};
const PIECE_RE=[
  [/^Type : (.+)$/, m=>'Type: '+(DMG[m[1]]||m[1])],
  [/^Dégâts · (.+)$/, m=>'Damage · '+m[1].split(', ').map(x=>DMG[x]||pieceTr(x)).join(', ')],
  [/^(\d+) types$/, m=>m[1]+' types'],
  [/^Niveau (\d+)$/, m=>'Level '+m[1]],
  [/^Jusqu'à (.+)$/, m=>'Up to '+pieceTr(m[1])],
  [/^jusqu'à (.+)$/, m=>'up to '+pieceTr(m[1])],
  [/^(.+) · autre traduction : (.+)$/, m=>m[1]],
  [/^infligés par la créature invoquée$/, m=>'dealt by the summoned creature'],
  [/^Totaux \(méthode : (.+)\)$/, m=>'Totals (method: '+pieceTr(m[1])+')'],
  [/^Ajouter un d(\d+)$/, m=>'Add a d'+m[1]],
  [/^Retirer un d(\d+)$/, m=>'Remove a d'+m[1]],
  [/^Ajouter un (.+)$/, m=>'Add a '+pieceTr(m[1])],
  [/^Retirer un (.+)$/, m=>'Remove a '+pieceTr(m[1])],
  [/^Augmenter (.+)$/, m=>'Increase '+pieceTr(m[1])],
  [/^Diminuer (.+)$/, m=>'Decrease '+pieceTr(m[1])],
  [/^Taille (\w+)$/, m=>'Size '+m[1]],
  [/^Vitesse (.+)$/, m=>'Speed '+m[1]],
  [/^Vision dans le noir (.+)$/, m=>'Darkvision '+m[1]],
  [/^Dé de vie (d\d+)$/, m=>'Hit die '+m[1]],
  [/^Sauvegardes : (.+)$/, m=>'Saving throws: '+pieceTr(m[1])],
  [/^Caractéristique d'incantation : (.+)\.$/, m=>'Spellcasting ability: '+pieceTr(m[1])+'.'],
  [/^Total : (\d+) PV$/, m=>'Total: '+m[1]+' HP'],
  [/^\(dont ([+\-]?\d+) d'espèce, de sous-classe, de don ou de bonus divers\)$/, m=>'(including '+m[1]+' from species, subclass, feat or other bonuses)'],
  [/^Jet contre la mort, succès (\d)$/, m=>'Death save, success '+m[1]],
  [/^Jet contre la mort, échec (\d)$/, m=>'Death save, failure '+m[1]],
  [/^Quantité gardée de (.+)$/, m=>'Quantity kept of '+pieceTr(m[1])],
  [/^(.+) niv\. (\d+)$/, m=>pieceTr(m[1])+' lvl '+m[2]],
  [/^niv\. (\d+)$/, m=>'lvl '+m[1]],
  [/^(\d+) à choisir$/, m=>m[1]+' to choose'],
  [/^(.+) ×(\d+)$/, m=>pieceTr(m[1])+' ×'+m[2]],
  [/^Instruments : (\d+\/\d+)\.$/, m=>'Instruments: '+m[1]+'.'],
  [/^Maîtrise : (.+)$/, m=>'Proficiency: '+pieceTr(m[1])],
  [/^Munit\. (.+)$/, m=>'Ammo. '+m[1]],
  [/^Lancer (\d+\/\d+ m)$/, m=>'Thrown '+m[1]],
  [/^(\d+d\d+(?:[+\-−]\d+)?) (.+)$/, m=>m[1]+' '+pieceTr(m[2])],
  [/^DD (\d+) (\w+)$/, m=>'DC '+m[1]+' '+({FOR:'STR',DEX:'DEX',CON:'CON',INT:'INT',SAG:'WIS',CHA:'CHA'}[m[2]]||m[2])],
  [/^(.+) et (\d+) po\.$/, m=>pieceTr(m[1])+' and '+m[2]+' gp.'],
  [/^(\d+) pa pièce$/, m=>m[1]+' sp coin'],
  [/^(\d+) (minute|minutes|heure|heures|jour|jours|round|rounds)$/, m=>m[1]+' '+UNITS[m[2]]],
  [/^Force (\d+)$/, m=>'Strength '+m[1]],
  [/^CA (.+)$/, m=>'AC '+m[1]],
  [/^Compétences de classe : (\d+\/\d+)\.$/, m=>'Class skills: '+m[1]+'.'],
  [/^Sorts préparés : (\d+\/\d+)\.$/, m=>'Prepared spells: '+m[1]+'.'],
  [/^(\d+) sorts, avec recherche et filtres$/, m=>m[1]+' spells, with search and filters'],
  [/^(\d+) objets : armes, armures, outils, matériel$/, m=>m[1]+' items: weapons, armor, tools, gear'],
  [/^niveau (\d+)$/, m=>'level '+m[1]],
  [/^D&D 2024 · (\d+) objets$/, m=>'D&D 2024 · '+m[1]+' items'],
  [/^Lancer (d\d+)$/, m=>'Roll '+m[1]],
  [/^Lancers : (.+)$/, m=>'Rolls: '+m[1]],
  [/^D&D 2024 · (\d+) sorts$/, m=>'D&D 2024 · '+m[1]+' spells'],
  [/^(\d+) sorts$/, m=>m[1]+' spells'],
  [/^(\d+) sorts, avec recherche et filtres$/, m=>m[1]+' spells, with search and filters'],
  [/^(\d+) (minutes?|heures?) ou (rituel|plus)$/, m=>m[1]+' '+UNITS[m[2]]+' '+({rituel:'or ritual',plus:'or more'})[m[3]]],
  [/^Action ou (\d+) heures$/, m=>'Action or '+m[1]+' hours'],
  [/^\+(\d) et \+(\d)$/, m=>'+'+m[1]+' and +'+m[2]],
  [/^\+(\d) aux trois$/, m=>'+'+m[1]+' to all three'],
  [/^\+(\d) en$/, m=>'+'+m[1]+' to'],
  [/^\+(\d) à (une|deux)$/, m=>'+'+m[1]+' to '+({une:'one',deux:'two'})[m[2]]],
  [/^Langues : (\d+\/\d+)\.$/, m=>'Languages: '+m[1]+'.'],
  [/^Sorts mineurs : (\d+\/\d+)\.$/, m=>'Cantrips: '+m[1]+'.'],
  [/^Style de combat : (\d+\/\d+)\.$/, m=>'Fighting Style: '+m[1]+'.'],
  [/^Bottes d'arme : (\d+\/\d+)\.$/, m=>'Weapon Masteries: '+m[1]+'.'],
  [/^NIVEAU (\d)$/, m=>'LEVEL '+m[1]],
  [/^Utilisation (\d) : (.+)$/, m=>'Use '+m[1]+': '+pieceTr(m[2])],
  [/^Classe : (.+)$/, m=>'Class: '+pieceTr(m[1])],
  [/^Historique : (.+)$/, m=>'Background: '+pieceTr(m[1])],
  [/^Choix ([A-Z]) : (\d+) po$/, m=>'Choice '+m[1]+': '+m[2]+' gp'],
  [/^sur (\d+)$/, m=>'of '+m[1]],
  [/^(.+) : choisir…$/, m=>pieceTr(m[1])+': choose…'],
  [/^(\d+) feuilles$/, m=>m[1]+' sheets'],
  [/^Sous-classe (?:de|d') ?(.+)$/, m=>'Subclass: '+pieceTr(m[1])],
  [/^Sous-classe d'(.+)$/, m=>'Subclass: '+pieceTr(m[1])],
  [/^(.+) niveau (\d+)$/, m=>pieceTr(m[1])+' level '+m[2]],
  [/^Niveau total : (.+)$/, m=>'Total level: '+m[1]],
  [/^Niveau (\d+) :$/, m=>'Level '+m[1]+':'],
  [/^Total : (.+) po$/, m=>'Total: '+m[1]+' gp'],
  [/^Total : (.+)$/, m=>'Total: '+m[1]],
  [/^(.+) \((.+)\)$/, m=>pieceTr(m[1])+' ('+pieceTr(m[2])+')'],

];
function pieceTr(p){
  const k=p.trim();
  if(!k)return p;
  if(EN[k]!==undefined)return EN[k];
  if(DMG[k])return DMG[k];
  for(const [re,f] of PIECE_RE){const m=k.match(re);if(m)return f(m);}
  return p;
}
function trText(s){
  const k=s.trim();
  if(!k)return null;
  if(EN[k]!==undefined)return s.replace(k,()=>EN[k]);
  for(const [re,f] of PIECE_RE){const m=k.match(re);if(m){const r=f(m);if(r!==k)return s.replace(k,()=>r);}}
  /* textes composés (séparés par « · » ou « , ») : on traduit morceau par morceau */
  const SENT=[/* sent-fix */[/Don Robuste/g,'Tough feat'],[/deux points par niveau/g,'two points per level'],[/don Robuste/g,'Tough feat'],[/\bFermier\b/g,'Farmer'],[/: don /g,': feat '],[/ \+ historique /g,' + background '],[/ \+ don ou amélioration /g,' + feat or improvement '],[/ \+ bonus de classe ou épique /g,' + class or epic bonus '],[/\(plafonnée à 20\)/g,'(capped at 20)'],[/Compétent : compétence au choix/g,'Skilled: skill of your choice'],[/Niveau (\d+): /g,(m,a)=>'Level '+a+': '],[/Niveau (\d+) :/g,(m,a)=>'Level '+a+':'],[/dé de vie maximal/g,'maximum hit die'],[/Sorcellerie innée/g,'Innate Sorcery'],[/Choix A/g,'Option A'],[/Choix B/g,'Option B'],[/Disciple martial/g,'Martial Adept'],[/Un type d'outils d'artisan/g,"A type of artisan's tools"],[/liste (de sorts )?du (\w+)/g,(m,x,a)=>(x?'spell list of the ':'list of the ')+({'barbare':'barbarian','guerrier':'fighter','guerrière':'fighter','magicien':'wizard','magicienne':'wizard','clerc':'cleric','druide':'druid','paladin':'paladin','rôdeur':'ranger','rôdeuse':'ranger','roublard':'rogue','roublarde':'rogue','barde':'bard','moine':'monk','occultiste':'warlock','ensorceleur':'sorcerer','ensorceleuse':'sorcerer'}[a]||a)],[/Choisissez d'abord la liste de sorts/g,'Choose the spell list first'],[/Dés : aucun lancer effectué\./g,'Dice: no roll made.'],[/Dés \(d4 à d100\) avec bonus fixe/g,'Dice (d4 to d100) with fixed bonus'],[/Sens aiguisés/g,'Keen Senses'],[/type de bête à choisir/g,'beast type to choose'],[/liste de sorts à choisir/g,'spell list to choose'],[/Affinité élémentaire/g,'Elemental Affinity'],[/Faveur épique/g,'Epic Boon'],[/à préciser/g,'to specify'],[/Méthode des points de vie/g,'Hit point method'],[/achat de points/g,'point buy'],[/Points dépensés :/g,'Points spent:'],[/points à répartir/g,'points to spend'],[/valeurs de (\d+) à (\d+)/g,(m,a,b)=>'values from '+a+' to '+b],[/Vous dépassez les (\d+) points\./g,(m,a)=>'You exceed the '+a+' points.'],[/récupérés au repos court/g,'recovered on a short rest'],[/On part du paquet de départ de la classe et de l'historique/g,'Start from the class and background starting pack'],[/retirez ce dont vous ne voulez pas pour récupérer son prix, puis dépensez cet argent en achetant autre chose/g,'remove what you do not want to get its price back, then spend that gold on something else'],[/Les prix viennent des règles 2024/g,'Prices come from the 2024 rules'],[/Ce pack n'est plus celui de votre classe principale/g,"This pack is no longer your main class's pack"],[/vos modifications ont été gardées/g,'your changes were kept'],[/Choisissez la classe principale dans la liste pour repartir de son pack\./g,"Pick the main class in the list to start over from its pack."],[/Vous n'avez pas la formation aux boucliers/g,'You lack shield training'],[/mêmes pénalités qu'une armure non maîtrisée/g,'same penalties as an unproficient armor'],[/Un moine perd/g,'A monk loses'],[/Déplacement sans armure/g,'Unarmored Movement'],[/avec une armure ou un bouclier/g,'with armor or a shield'],[/Bonus de PV divers/g,'Miscellaneous HP bonus'],[/\(don, objet\)/g,'(feat, item)'],[/Caractéristique :/g,'Ability:'],[/Ce bonus s'ajoute aux sauvegardes, compétences et attaques maîtrisées\./g,'This bonus applies to proficient saving throws, skills and attacks.'],[/Point plein : maîtrise/g,'Solid dot: proficiency'],[/point coloré : expertise/g,'colored dot: expertise'],[/Survolez ou appuyez longuement pour voir le calcul\./g,'Hover or long-press to see the calculation.'],[/Télécharger la fiche/g,'Download sheet'],[/Sauvegarder ce personnage/g,'Save this character'],[/Outil non officiel\./g,'Unofficial tool.'],[/Les règles sont résumées avec des formulations propres/g,'Rules are summarized with our own wording'],[/référez-vous au Manuel des Joueurs 2024 pour les textes complets\./g,"refer to the 2024 Player's Handbook for full texts."],[/compétence à choisir/g,'skill to choose'],[/Doué maîtrises/g,'Doué proficiencies'],[/maîtrises supplémentaires/g,'extra proficiencies'],[/accorde les noms de classe, d'espèce et d'historique/g,'sets the class, species and background name forms'],[/formes masculines/g,'masculine forms'],[/Temps d'incantation particuliers/g,'Special casting times'],[/tous les autres/g,'all others'],[/Collège du Savoir/g,'College of Lore'],[/Cette fiche n'est pas encore sur votre Drive\./g,'This sheet is not on your Drive yet.'],[/Synchronisez d'abord, ou activez/g,'Sync first, or enable'],[/Envoyer automatiquement sur Drive au moment du partage/g,'Automatically send to Drive when sharing'],[/dans la synchronisation Google Drive/g,'in Google Drive sync'],[/Le partage en lecture seule n'est disponible qu'avec la synchronisation Google Drive/g,'Read-only sharing is only available with Google Drive sync'],[/connectez-vous d'abord dans/g,'sign in first in'],[/en bas de l'accueil/g,'at the bottom of the home page'],[/« Synchronisation Google Drive »/g,'"Google Drive sync"'],[/Cette fiche est vide et n'a pas de nom/g,'This sheet is empty and has no name'],[/elle ne sera pas gardée si vous quittez la page/g,'it will not be kept if you leave the page'],[/Quitter quand même \?/g,'Leave anyway?'],[/Impression indisponible ici/g,'Printing unavailable here'],[/téléchargez la fiche \.html puis imprimez-la\./g,'download the .html sheet then print it.'],[/Saisissez un nom pour/g,'Enter a name for'],[/« Groupe »/g,'"Group"'],[/existe déjà/g,'already exists'],[/Une fiche de niveau 1 par classe, avec les caractéristiques du Tableau, les compétences, les sorts et l'équipement conseillés\./g,'One level 1 sheet per class, with the standard ability scores, skills, spells and suggested equipment.'],[/Touchez une fiche pour la voir en lecture seule\./g,'Tap a sheet to view it read-only.'],[/Dans l'aperçu, « Utiliser comme base » crée votre propre copie, à modifier librement\./g,'In the preview, "Use as base" creates your own editable copy.'],[/Touchez « Utiliser comme base » pour créer votre copie modifiable \(nom à saisir ensuite\)\./g,'Tap "Use as base" to create your editable copy (name to enter next).'],[/Utiliser comme base/g,'Use as base'],[/Fiches reçues d'autres personnes, classées par/g,'Sheets received from others, sorted by'],[/Collez le lien de partage ci-dessous/g,'Paste the share link below'],[/la liste est synchronisée avec votre compte Google/g,'the list is synced with your Google account'],[/Glissez une fiche sur un autre bloc/g,'Drag a sheet onto another'],[/pour la déplacer/g,'to move it'],[/Pour retrouver vos personnages sur plusieurs appareils/g,'To get your characters on several devices'],[/collez ici l'identifiant client Google de l'application/g,'paste the app Google client ID here'],[/à saisir une fois par appareil/g,'enter once per device'],[/puis connectez-vous/g,'then sign in'],[/Enregistrer l'identifiant/g,'Save ID'],[/Diminuer le bonus/g,'Decrease bonus'],[/Augmenter le bonus/g,'Increase bonus'],[/Emplacement de pacte niveau/g,'Pact slot level'],[/Sort mineur/g,'Cantrip'],[/Sorts préparés : —/g,'Prepared spells: —'],[/Origine retenue ?: /g,'Origin chosen: '],[/Bouclier ?: /g,'Shield: '],[/ \+ Bouclier/g,' + Shield'],[/\(plafonnée à (\d+)\)/g,(m,a)=>'(capped at '+a+')'],[/ \+ Dextérité/g,' + Dexterity'],[/Armure d'écailles/g,'Scale mail'],[/ \+ bouclier/g,' + shield'],[/ : base /g,': base '],[/remplacez un sort préparé par un autre sort de votre spellbook\./g,'replace a prepared spell with another spell from your spellbook.'],[/ ou plus/g,' or more'],[/ ou dépensez/g,' or spend'],[/ PV to remove the Empoisonné/g,' HP to remove the Poisoned condition'],[/Empoisonné/g,'Poisoned'],[/ de votre spellbook, even/g,' from your spellbook, even'],[/\) et pouvez/g,') and can'],[/short rest ou long/g,'short or long rest'],[/ ou long\./g,' or long rest.'],[/Après un short rest, récupérez/g,'After a short rest, recover'],[/Après un short rest,/g,'After a short rest,'],[/des emplacements dont le niveau cumulé ne dépasse pas la moitié de votre niveau de/g,'slots whose combined level is at most half your level in'],[/sans emplacement de niveau/g,'without a slot of level'],[/récupérés au short rest/g,'recovered on a short rest'],[/une récupérée au short rest, toutes au repos long/g,'one recovered on a short rest, all on a long rest'],[/toutes au repos long/g,'all on a long rest'],[/une récupérée au short rest/g,'one recovered on a short rest'],[/pour retirer l'état/g,'to remove the'],[/l'état Empoisonné/g,'the Poisoned condition'],[/Reaction: réduisez les dégâts/g,'Reaction: reduce damage'],[/ au niveau 11\)/g,' at level 11)'],[/vos capacités/g,'your features'],[/Châtiment divin/g,'Divine Smite'],[/Appel de destrier/g,'Find Steed'],[/ each niveau/g,' each level'],[/au short rest/g,'on a short rest'],[/ ; other options come from/g,'; other options come from'],[/\(of choice\)/g,'(of your choice)'],[/repos court: (\d) · long: tout/g,(m,a)=>'short rest: '+a+' · long: all'],[/\bRepos court\b/g,'Short rest'],[/Repos court:/g,'Short rest:'],[/\brepos court\b/g,'short rest'],[/un don d'origine/g,'origin feat'],[/Compétent: compétence au choix/g,'Skilled: skill of your choice'],[/Polyvalent: don d'origine/g,'Versatile: origin feat'],[/Vous connaissez le druidique/g,'You know Druidic'],[/\(messages cachés\)/g,'(hidden messages)'],[/ est always prepared/g,' is always prepared'],[/Métamagie:/g,'Metamagic:'],[/récupérez jusqu'à la moitié de votre niveau en points de Sorcellerie/g,'recover up to half your level in Sorcery Points'],[/points de Sorcellerie/g,'Sorcery Points'],[/une fois par repos long/g,'once per long rest'],[/parmi les armes que vous maîtrisez/g,'among the weapons you are proficient with'],[/Après un repos long, vous pouvez remplacer l'un de ces types\./g,'After a long rest, you can replace one of these types.'],[/Incantation avec l'Intelligence/g,'Spellcasting with Intelligence'],[/avec un arcane focus/g,'with an arcane focus'],[/Vous préparez vos sorts parmi ceux de votre spellbook/g,'You prepare your spells from your spellbook'],[/six de niveau 1 au départ/g,'six of level 1 to start'],[/deux de plus à chaque/g,'two more at each'],[/Vous lancez en rituel tout sort à étiquette Rituel/g,'You can cast any Ritual-tagged spell as a ritual'],[/même non préparé/g,'even if unprepared'],[/\(il faut lire le book\)/g,'(you must read the book)'],[/Après un repos court, récupérez des emplacements dont le niveau cumulé ne dépasse pas la moitié de votre niveau de/g,'After a short rest, recover slots whose combined level is at most half your level in'],[/\(arrondi au supérieur\)/g,'(rounded up)'],[/Après un repos court, remplacez un sort préparé par un autre sort de votre spellbook\./g,'After a short rest, replace a prepared spell with another spell from your spellbook.'],[/Sauvegardes:/g,'Saving throws:'],[/Aucune formation aux armures/g,'No armor training'],[/outils d'artisan/g,"artisan's tools"],[/Réaction: réduisez les dégâts de chute/g,'Reaction: reduce fall damage'],[/Réaction :/g,'Reaction:'],[/ de chute de 5 × votre niveau de monk\./g,' by 5 × your monk level.'],[/et se récupèrent au/g,'and recover on a'],[/Les emplacements sont tous du même niveau/g,'All slots are the same level'],[/Rite d'une minute/g,'One-minute ritual'],[/récupérez des emplacements de Pact Magic/g,'recover Pact Magic slots'],[/jusqu'à la moitié de votre maximum/g,'up to half your maximum'],[/Une fois par repos long\./g,'Once per long rest.'],[/Réserve de soins de 5 × niveau PV, rechargée au repos long\./g,'Healing pool of 5 × level HP, restored on a long rest.'],[/Réserve de soins/g,'Healing pool'],[/touchez une créature pour la soigner depuis la réserve/g,'touch a creature to heal it from the pool'],[/ou dépensez (\d) PV pour retirer/g,(m,a)=>'or spend '+a+' HP to remove'],[/(\d) utilisations/g,(m,a)=>a+' uses'],[/utilisations \(3 au niveau 11\)/g,'uses (3 at level 11)'],[/une récupérée au repos court, toutes au repos long/g,'one recovered on a short rest, all on a long rest'],[/Vous débutez avec l'effet Perception divine/g,'You start with the Divine Sense effect'],[/Perception divine/g,'Divine Sense'],[/d'autres options viennent de/g,'other options come from'],[/Châtiment de paladin/g,'Divine Smite'],[/Fidèle destrier/g,'Find Steed'],[/Ennemi juré/g,'Favored Enemy'],[/Marque du chasseur/g,"Hunter's Mark"],[/Expertise dans une/g,'Expertise in a'],[/ et deux langues de votre choix\./g,' and two languages of your choice.'],[/Pointe, Désengagement ou Furtivité/g,'Dash, Disengage or Hide'],[/Action bonus:/g,'Bonus action:'],[/Avantage à votre prochaine attaque du tour, si vous ne vous êtes pas déplacé/g,'Advantage on your next attack this turn, if you did not move'],[/votre Vitesse tombe à 0 jusqu'à la fin du tour/g,'your Speed drops to 0 until the end of the turn'],[/divisez par deux les dégâts d'une attaque d'un attaquant visible/g,'halve the damage of an attack from a visible attacker'],[/\bdon d'origine\b/g,'origin feat'],[/liste complète des sorts de la classe \(Manuel des Joueurs 2024\), jusqu'au niveau (\d)\. /g,(m,a)=>"full class spell list (Player's Handbook 2024), up to level "+a+'. '],[/Cochez vos sorts préparés : votre (grimoire|spellbook) en contient davantage\./g,'Check your prepared spells: your spellbook holds more.'],[/Touchez « Fiche » pour lire le texte d'un sort sur AideDD\./g,'Tap "Sheet" to read the spell text on AideDD.'],[/Des fragments de savoir interdit qui donnent des pouvoirs\./g,'Fragments of forbidden knowledge that grant powers.'],[/Nombre indiqué dans l'onglet Fiche \(choix à noter à la main ; Pacte du (grimoire|spellbook) est recommandé\)\./g,'Number shown in the Sheet tab (choices to note by hand; Pact of the Tome is recommended).'],[/onglet Fiche/g,'Sheet tab'],[/Deux sorts mineurs d'warlock/g,'Two warlock cantrips'],[/deux sorts de niveau 1 préparés/g,'two level 1 prepared spells'],[/se récupèrent au short or long rest/g,'recover on a short or long rest'],[/Emplacement de pacte/g,'Pact slot'],[/emplacement\(s\) de niveau (\d)/g,(m,a)=>'slot(s) of level '+a],[/Magie de pacte/g,'Pact Magic'],[/récupérés au repos court/g,'recovered on a short rest'],[/ ; une incantation gratuite par repos long\./g,'; one free cast per long rest.'],[/(\w|\)) : /g,(m,a)=>a+': '],[/ ou « /g,' or "'],[/ »/g,'"'],[/Combattant béni/g,'Blessed Warrior'],[/Combattant druidique/g,'Druidic Warrior'],[/\(deux sorts mineurs\)/g,'(two cantrips)'],[/à chaque niveau de (\w+)\./g,(m,a)=>'at each '+({paladin:'Paladin',paladine:'Paladin',ranger:'Ranger',rôdeur:'Ranger',rôdeuse:'Ranger',druide:'Druid',barde:'Bard',clerc:'Cleric',magicien:'Wizard',magicienne:'Wizard',moine:'Monk',ensorceleur:'Sorcerer',ensorceleuse:'Sorcerer',barbare:'Barbarian',roublard:'Rogue',roublarde:'Rogue',occultiste:'Warlock',guerrier:'Fighter',guerrière:'Fighter'}[a]||a)+' level.'],[/(\d) types d'armes dont vous utilisez la botte/g,(m,a)=>a+' weapon types whose mastery you use'],[/Après un repos long, vous pouvez changer de types\./g,'After a long rest, you can change types.'],[/\(Finesse ou Légère\)/g,'(Finesse or Light)'],[/ ou Légère/g,' or Light'],[/(\d) compétences? parmi cette liste\./g,(m,a)=>a+' skill'+(a==='1'?'':'s')+' from this list.'],[/Les compétences déjà acquises sont grisées\./g,'Skills you already have are greyed out.'],[/Double bonus de maîtrise sur/g,'Double proficiency bonus on'],[/compétence maîtrisée parmi : /g,'proficient skill from: '],[/compétence maîtrisée/g,'proficient skill'],[/ parmi : /g,' from: '],[/\bArcanes\b/g,'Arcana'],[/ ou musical instrument/g,' or musical instrument'],[/ ou instrument/g,' or instrument'],[/Already gained : /g,'Already gained: '],[/\(Châtiment de paladin\)/g,'(Divine Smite)'],[/\(Fidèle destrier\)/g,'(Find Steed)'],[/\(Ennemi juré\)/g,'(Favored Enemy)'],[/seule la sous-classe Chevalier occulte/g,'only the Eldritch Knight subclass'],[/seule la sous-classe Arnaqueur arcanique/g,'only the Arcane Trickster subclass'],[/lance des sorts\./g,'casts spells.'],[/instruments de navigateur/g,"navigator's tools"],[/Boîte de jeux/g,'Gaming set'],[/Tout compte dans le total\./g,'Everything counts toward the total.'],[/Cochez ici les compétences et les outils \(listes du catalogue\) ; un champ libre sert aux outils absents de la liste\./g,'Check the skills and tools here (catalog lists); a free-text field is for tools not in the list.'],[/\(identique\)/g,'(identical)'],[/\bidentiques?\b/g,'identical'],[/\bjeu \(identique\)/g,'gaming set (identical)'],[/\btenue de voyage\b/g,'travel clothes'],[/\(prières\)/g,'(prayers)'],[/\(philosophie\)/g,'(philosophy)'],[/\(mineur · Espèce\)/g,'(minor · Species)'],[/\boutils de charpentier\b/g,"carpenter's tools"],[/\boutils de cartographe\b/g,"cartographer's tools"],[/\boutils de voleur\b/g,"thieves' tools"],[/\bboîte de jeux\b/g,'gaming set'],[/\btrousse de soins\b/g,"healer's kit"],[/\bpot en fer\b/g,'iron pot'],[/\bpelle\b/g,'shovel'],[/\bpied-de-biche\b/g,'crowbar'],[/\bsac de couchage\b/g,'bedroll'],[/\bsac d'érudit\b/g,"scholar's pack"],[/\bsac d'ecclésiastique\b/g,"priest's pack"],[/\bsac de cambrioleur\b/g,"burglar's pack"],[/\barbalète légère\b/g,'light crossbow'],[/\bcarreaux\b/g,'bolts'],[/\bcarquois\b/g,'quiver'],[/\bflèches\b/g,'arrows'],[/\bflèche\b/g,'arrow'],[/\blanterne à capote\b/g,'hooded lantern'],[/\bmenottes\b/g,'manacles'],[/\btente\b/g,'tent'],[/\bcorde\b/g,'rope'],[/\bbeaux habits\b/g,'fine clothes'],[/\bparfum\b/g,'perfume'],[/\bmiroir\b/g,'mirror'],[/\blampe\b/g,'lamp'],[/\bhuile\b/g,'oil'],[/\bflasques\b/g,'flasks'],[/\bsacoches\b/g,'pouches'],[/\bsacoche\b/g,'pouch'],[/\bcotte de mailles\b/g,'chain mail'],[/\barmure de cuir clouté\b/g,'studded leather'],[/\bcuir clouté\b/g,'studded leather'],[/\bcimeterre\b/g,'scimitar'],[/épée courte\b/g,'shortsword'],[/épée longue\b/g,'longsword'],[/\barc court\b/g,'shortbow'],[/\barc long\b/g,'longbow'],[/\bjavelines\b/g,'javelins'],[/\bfocaliseur arcanique\b/g,'arcane focus'],[/\borbe\b/g,'orb'],[/\bbranche de gui\b/g,'sprig of mistletoe'],[/\bgrimoire\b/g,'spellbook'],[/\blivre\b/g,'book'],[/\bparchemin\b/g,'parchment'],[/\bfeuilles\b/g,'sheets'],[/\bArgot des voleurs\b/g,"Thieves' cant"],[/\bvaleur non définie\b/g,'value not set'],[/\bOutil d'artisan\b/g,"Artisan's tool"],[/\boutil d'artisan\b/g,"artisan's tool"],[/\bmaîtrises\b/g,'proficiencies'],[/à choisir\b/g,'to choose'],[/Trois compétences ou outils par exemplaire du don/g,'Three skills or tools per copy of the feat'],[/Cochez ici les compétences et les outils/g,'Check the skills and tools here'],[/listes du catalogue/g,'catalog lists'],[/un champ libre sert aux outils absents de la liste/g,'a free-text field is for tools not in the list'],[/Other tools \(absents de la liste\)/g,'Other tools (not in the list)'],[/Un don de Style de [Cc]ombat/g,'A Fighting Style feat'],[/Un don de Fighting Style/g,'A Fighting Style feat'],[/à chaque niveau de guerri(ère|er)/g,'at each Fighter level'],[/Vous pouvez en changer/g,'You can change it'],[/Aucune maîtrise supplémentaire/g,'No additional proficiency'],[/Aucune maîtrise/g,'No proficiency'],[/Style de [Cc]ombat/g,'Fighting Style'],[/Ensuite, à chaque niveau : un lancer du dé de la classe \+ Constitution, avec un minimum de 1 PV gagné\./g,'Then, at each level: a roll of the class hit die + Constitution, with a minimum of 1 HP gained.'],[/Ensuite, à chaque niveau : la valeur fixe du dé de la classe \+ Constitution, avec un minimum de 1 PV gagné\./g,'Then, at each level: the fixed value of the class hit die + Constitution, with a minimum of 1 HP gained.'],[/Chaque niveau compte pour la classe où il a été pris\./g,'Each level counts toward the class it was taken in.'],[/niveaux? sans lancer : la valeur fixe est utilisée en attendant\./g,'levels without a roll: the fixed value is used for now.'],[/\bmoyenne : /g,'average: '],[/\b(barbare|barde|clerc|druide|ensorceleur|guerrière|guerrier|magicienne|magicien|moine|occultiste|paladin|rôdeuse|rôdeur|roublarde|roublard)\b(?=\) :|\) dé)/g,(m,a)=>({'barbare':'barbarian','barde':'bard','clerc':'cleric','druide':'druid','ensorceleur':'sorcerer','guerrière':'fighter','guerrier':'fighter','magicienne':'wizard','magicien':'wizard','moine':'monk','occultiste':'warlock','paladin':'paladin','rôdeuse':'ranger','rôdeur':'ranger','roublarde':'rogue','roublard':'rogue'})[a]],[/peut fixer la CA sans armure\./g,'can set the AC without armor.'],[/les emplacements de sorts se calculent avec le niveau d'incantateur cumulé/gi,'spell slots are calculated from the combined caster level'],[/ne se cumule pas entre classes/g,'does not stack between classes'],[/\b(Barbare|Barde|Clerc|Druide|Ensorceleuse|Ensorceleur|Guerrière|Guerrier|Magicienne|Magicien|Moine|Occultiste|Paladin|Rôdeuse|Rôdeur|Roublarde|Roublard)( niveau | level | )(\d+)/g,(m,a,b,c)=>({'Barbare':'Barbarian','Barde':'Bard','Clerc':'Cleric','Druide':'Druid','Ensorceleuse':'Sorcerer','Ensorceleur':'Sorcerer','Guerrier':'Fighter','Guerrière':'Fighter','Magicien':'Wizard','Magicienne':'Wizard','Moine':'Monk','Occultiste':'Warlock','Paladin':'Paladin','Rôdeur':'Ranger','Rôdeuse':'Ranger','Roublard':'Rogue','Roublarde':'Rogue'})[a]+(b.trim()?' level ':' ')+c],[/\bBotte : ([A-Za-zÀ-ÿ' ]+?)(?= · |$)/g,(m,a)=>'Mastery: '+({'Sape':'Sap','Renversement':'Topple','Coup double':'Cleave','Écorchure':'Graze','Enchaînement':'Chain','Ouverture':'Open','Poussée':'Push','Ralentissement':'Slow'}[a]||a)],[/\b(barbare|barde|clerc|druide|ensorceleuse|ensorceleur|guerrière|guerrier|magicienne|magicien|moine|occultiste|rôdeuse|rôdeur|roublarde|roublard)\b/gi,(m)=>{const en=({'barbare':'barbarian','barde':'bard','clerc':'cleric','druide':'druid','ensorceleuse':'sorcerer','ensorceleur':'sorcerer','guerrière':'fighter','guerrier':'fighter','magicienne':'wizard','magicien':'wizard','moine':'monk','occultiste':'warlock','rôdeuse':'ranger','rôdeur':'ranger','roublarde':'rogue','roublard':'rogue'})[m.toLowerCase()];return m[0]===m[0].toUpperCase()?en[0].toUpperCase()+en.slice(1):en;}],[/Métamagie :/g,'Metamagic:'],[/ ne lance pas de sorts\./g,' casts no spells.'],[/\bCommun\b(?! des)/g,'Common'],[/repos court ou long/g,'short or long rest'],[/Sort accéléré/g,'Quickened Spell'],[/Sort ample/g,'Distant Spell'],[/Sort chercheur/g,'Seeking Spell'],[/Sort étendu/g,'Extended Spell'],[/Sort intensifié/g,'Heightened Spell'],[/Sort jumeau/g,'Twinned Spell'],[/Sort prévenant/g,'Careful Spell'],[/Sort renforcé/g,'Empowered Spell'],[/Sort subtil/g,'Subtle Spell'],[/Sort transmuté/g,'Transmuted Spell'],[/\bserpe\b/g,'sickle'],[/focaliseur druidique/g,'druidic focus'],[/matériel d'herboriste/g,"herbalist's kit"],[/Connues d'office :/g,'Known by default:'],[/Choisissez (\d) langues? de plus/g,(m,a)=>'Choose '+a+' more language'+(a==='1'?'':'s')],[/Les langues courantes se choisissent librement ; les langues rares viennent normalement d'une capacité ou de l'accord du MD\./g,'Common languages can be chosen freely; rare languages normally come from a feature or the DM\'s approval.'],[/\bDruidique\b/g,'Druidic'],[/Taille ([PMGT])\b/g,'Size $1'],[/Gnome des forêts :/g,'Forest Gnome:'],[/illusion mineure/g,'minor illusion'],[/communication avec les animaux/g,'speak with animals'],[/toujours préparé/g,'always prepared'],[/réparation et prestidigitation/g,'mending and prestidigitation'],[/un petit appareil mécanique/g,'a small mechanical device'],[/Gnome des roches :/g,'Rock Gnome:'],[/Ascendance féerique :/g,'Fey Ancestry:'],[/Forte carrure :/g,'Powerful Build:'],[/Agilité halfeline :/g,'Halfling Nimbleness:'],[/Brave :/g,'Brave:'],[/Chance :/g,'Lucky:'],[/Discrétion naturelle :/g,'Naturally Stealthy:'],[/Résilience naine :/g,'Dwarven Resilience:'],[/Ténacité naine :/g,'Dwarven Toughness:'],[/Acharnement :/g,'Relentless Endurance:'],[/Présence d'Outremonde :/g,'Otherworldly Presence:'],[/Transe :/g,'Trance:'],[/\(type à choisir\)/g,'(type to choose)'],[/\(compétence à choisir\)/g,'(skill to choose)'],[/ à choisir\./g,' to choose.'],[/Polyvalent :/g,'Versatile:'],[/Poussée d'adrénaline :/g,'Adrenaline Rush:'],[/\bHalfeline\b/g,'Halfling'],[/\bNaine\b/g,'Dwarf'],[/\bTieffeline\b/g,'Tiefling'],[/\bOrque\b/g,'Orc'],[/\bPaladine\b/g,'Paladin'],[/\bDruidesse\b/g,'Druid'],[/\bFermière\b/g,'Farmer'],[/\bHaute-elfe\b/g,'High Elf'],[/\bHumaine\b/g,'Human'],[/\bCriminelle\b/g,'Criminal'],[/\bArtisane\b/g,'Artisan'],[/\bCharlatane\b/g,'Charlatan'],[/\bMarchande\b/g,'Merchant'],[/\bVoyageuse\b/g,'Wayfarer'],[/\bSoldate\b/g,'Soldier'],[/\bMarine\b/g,'Sailor'],[/\bErmite\b/g,'Hermit'],[/\bGarde\b/g,'Guard'],[/\(bientôt\)/g,'(coming soon)'],[/Outil d'artisan ou instrument de musique/g,"Artisan's tool or musical instrument"],[/outil d'artisan ou instrument de musique/g,"artisan's tool or musical instrument"],[/Outils d'artisan ou instrument de musique/g,"Artisan's tools or musical instrument"],[/outils d'artisan ou instrument de musique/g,"artisan's tools or musical instrument"],[/ or instrument de musique/g,' or musical instrument'],[/\bun instrument de musique/g,'a musical instrument'],[/instrument de musique/g,'musical instrument'],[/\bun musical instrument/g,'a musical instrument'],[/action bonus en plus/g,'extra bonus action'],[/Perception des vibrations/g,'Tremorsense'],[/\(action bonus, (\d+) fois par repos long\)/g,(m,a)=>'(bonus action, '+a+' times per long rest)'],[/Compétent : compétence au choix/g,'Skilled: skill of your choice'],[/Doué recommandé/g,'Skilled recommended'],[/Inspiration héroïque après chaque repos long\./g,'Heroic Inspiration after each long rest.'],[/une compétence supplémentaire\./g,'one extra skill.'],[/un don d'origine \(à choisir\)\./g,'one origin feat (your choice).'],[/sac d'exploration souterraine/g,"dungeoneer's pack"],[/sac d'explorateur/g,"explorer's pack"],[/(\d) dagues/g,(m,a)=>a+' daggers'],[/outils d'artisan ou instrument de musique/g,"artisan's tools or musical instrument"],[/Outil d'artisan ou instrument/g,"Artisan's tool or instrument"],[/outil d'artisan ou instrument/g,"artisan's tool or instrument"],[/Outils d'artisan ou instrument de musique/g,"Artisan's tools or musical instrument"],[/Maîtrise de la botte de trois types d'armes courantes ou de guerre, à modifier à chaque repos long\. Le nombre augmente avec le niveau\./g,'Weapon mastery with three simple or martial weapon types, changeable on each long rest. The number increases with level.'],[/Maîtrise de la botte de deux types d'armes courantes ou de guerre \(3 à 4 selon le niveau\)\./g,'Weapon mastery with two simple or martial weapon types (3 to 4 depending on level).'],[/Vous utilisez la propriété Botte de deux types d'armes maîtrisées, modifiables après un repos long\./g,'You use the Weapon Mastery property with two weapon types you are proficient with, changeable after a long rest.'],[/ Choisies : /g,' Chosen: '],[/\bBâton de combat\b/g,'Quarterstaff'],[/\bDague\b/g,'Dagger'],[/\bLance\b/g,'Spear'],[/\(Renversement\)/g,'(Topple)'],[/\(Sape\)/g,'(Sap)'],[/\(Coup double\)/g,'(Cleave)'],[/\(Écorchure\)/g,'(Graze)'],[/\(Enchaînement\)/g,'(Chain)'],[/\(Ouverture\)/g,'(Open)'],[/\(Poussée\)/g,'(Push)'],[/\(Ralentissement\)/g,'(Slow)'],[/\bNiveau (\d+) \(/g,'Level $1 ('],[/(\d) types d'armes dont vous utilisez la botte, parmi les armes que vous maîtrisez\. Après un repos long, vous pouvez remplacer l'un de ces types\./g,(m,a)=>a+' weapon types whose mastery you use, among the weapons you are proficient with. After a long rest, you can replace one of these types.'],[/Armes courantes et armes de guerre Légères/g,'Simple and martial Light weapons'],[/Aucune armure/g,'No armor'],[/1 outil d'artisan ou instrument de musique/g,"1 artisan's tool or musical instrument"],[/classe principale, /g,'main class, '],[/dé de vie au maximum/g,'maximum Hit Die'],[/\bmoine\b/g,'monk'],[/Défense sans armure ni bouclier/g,'Unarmored Defense without shield'],[/Défense sans armure/g,'Unarmored Defense'],[/sans armure ni bouclier/g,'without armor or shield'],[/sans armure lourde/g,'without heavy armor'],[/sans armure/g,'without armor'],[/Un bouclier reste permis/g,'A shield is still allowed'],[/ni bouclier/g,'or shield'],[/Points de Credo/g,'Ki points'],[/DD de Credo/g,'Ki save DC'],[/\bpoints? de Credo\b/g,'Ki points'],[/\bCredo\b/g,'Ki'],[/\bcredo\b/g,'ki'],[/(\d) pc\b/g,'$1 cp'],[/(\d) pa\b/g,'$1 sp'],[/(\d) po\b/g,'$1 gp'],[/(\d) pe\b/g,'$1 ep'],[/^(\d+ \w+) pièce$/,'$1 each'],[/^Attaque de sort : /,'Spell attack: '],[/^DD de sauvegarde : /,'Save DC: '],[/(\d+) dés? au niveau (\d+)/g,(m,a,b)=>a+' '+(a==='1'?'die':'dice')+' at level '+b],[/un dé de plus aux niveaux/g,'one more die at levels'],[/Bonus de caractéristiques \(/g,'Ability score bonuses ('],
[/repos court : (\d+) · long : tout/g,(m,n)=>'short rest: '+n+' · long: all'],
[/(?<=[a-z]) et (?=[A-Z])/g,' and '],
[/La sous-classe se choisit au niveau (\d+) de cette classe \(niveau actuel : (\d+)\)\./g,(m,a,b)=>'The subclass is chosen at level '+a+' of this class (current level: '+b+').'],
[/Un don de Style de combat\. Vous pouvez en changer à chaque niveau de (\w+)\./g,(m,c)=>'A Fighting Style feat. You can change it at each '+pieceTr(c)+' level.'],
[/\(compétence\)/g,'(skill)'],
[/Taille ([SMLT])/g,(m,x)=>'Size '+x],
[/\(historique\)/g,'(background)'],
[/\((\d+), lecture seule\)/g,(m,n)=>'('+n+', read only)'],
[/un instrument de musique \(au choix\)/g,'a musical instrument (of choice)'],
[/sac d'artiste/g,"entertainer's pack"],
[/Déjà acquis : choix de classe/g,'Already gained: class choice'],
[/Initié à la magie \((barde|clerc|druide|ensorceleur|magicien|guerrier)\)/g,(m,c)=>'Magic Initiate ('+({barde:'bard',clerc:'cleric',druide:'druid',ensorceleur:'sorcerer',magicien:'wizard',guerrier:'fighter'})[c]+')'],
[/ : don /g,': feat '],
[/Touche-à-tout/g,'Jack of All Trades'],
[/valeur fixe (\d+) \(dé d(\d+)\)/g,(m,v,d)=>'fixed value '+v+' (d'+d+')'],
[/^jet (\d+) \(dé d(\d+)\)/g,(m,v,d)=>'roll '+v+' (d'+d+')'],
[/: Historique$/,': Background'],
[/Non calculée par l'outil : à remplir à la main sur la fiche papier\./g,'Not calculated by the tool: fill in by hand on the paper sheet.'],
[/\(sans armure\)/g,'(no armor)'],
[/Sans armure/g,'Unarmored Defense'],
[/dé de vie maximal/g,'maximum hit die'],
[/Niveau (\d+) : valeur fixe (\d+) \(dé d(\d+)\)/g,(m,n,v,d)=>'Level '+n+': fixed value '+v+' (d'+d+')'],
[/Niveau (\d+) : d(\d+)/g,(m,n,d)=>'Level '+n+': d'+d],
[/Bonus = arrondi au-dessus de (\d+) ÷ (\d+), plus 1/g,'Bonus = round up $1 ÷ $2, plus 1'],
[/arrondi vers le bas/g,'rounded down'],
[/ \+ maîtrise /g,' + proficiency '],
[/^Sauvegarde /,'Saving throw '],
[/donnée par l'espèce/g,'given by the species'],
[/bonus de Perception/g,'Perception bonus'],
[/Attaque : /g,'Attack: '],
[/Dégâts : /g,'Damage: '],
[/À deux mains : /g,'Two-handed: '],
[/\(meilleure de Force et Dextérité\)/g,'(best of Strength and Dexterity)'],
[/dé d'Inspiration bardique/g,'Bardic Inspiration die'],
[/\(le dé n'est pas dépensé\)/g,"(the die is not spent)"],
[/DD de sauvegarde : /g,'Save DC: '],
[/dé de base/g,'base die'],
[/ dés au niveau (\d+)/g,(m,n)=>' dice at level '+n],
[/un dé de plus aux niveaux /g,'one more die at levels '],
[/(\d) et (\d+)/g,'$1 and $2'],
[/Niveau d'incantateur \(emplacements partagés entre les classes qui lancent des sorts\) : /g,"Caster level (slots shared between spellcasting classes): "],
[/(?<![\wÀ-ÿ])(Dextérité|Force|Constitution|Intelligence|Sagesse|Charisme)(?![\wÀ-ÿ])/g,m=>({'Dextérité':'Dexterity','Force':'Strength','Constitution':'Constitution','Intelligence':'Intelligence','Sagesse':'Wisdom','Charisme':'Charisma'})[m]],
[/(?<![\wÀ-ÿ])(contondants?|perforants?|tranchants?|psychique)(?![\wÀ-ÿ])/g,m=>pieceTr(m)],
[/Pack de départ de la classe (.+?) \((classe principale|pack choisi, différent de la classe principale)\), choix ([A-Z])/g,(m,c,t,l)=>'Starting pack of the class '+pieceTr(c)+' ('+(t==='classe principale'?'main class':'chosen pack, different from the main class')+'), choice '+l],[/Historique (.+?), choix A/g,(m,b)=>'Background '+pieceTr(b)+', choice A'],[/Acheté dans la boutique/g,'Bought in the shop'],[/Maîtrise de trois (?:compétences ou outils|outils ou compétences) au choix\./g,'Proficiency in three skills or tools of your choice.'],[/Maîtrise : ([^.]+)/g,(m,l)=>'Proficiency: '+l.split(', ').map(x=>pieceTr(x)).join(', ')],[/ : /g,': '],[/ ;/g,';'],[/Repos court/g,'Short rest'],[/Repos long/g,'Long rest'],[/repos court/g,'short rest'],[/repos long/g,'long rest'],[/à chaque niveau de/g,'at each level of'],[/à chaque niveau/g,'at each level'],[/ à choisir/g,' to choose'],[/Vitesse/g,'Speed'],];
  let kk=k.replace(/\u00a0/g,' ');SENT.forEach(([re,t])=>{kk=kk.replace(re,t);});
  const parts=kk.split(/( · |, )/);
  let changed=false;
  const out=parts.map((p,i)=>{if(i%2===1)return p;const t=pieceTr(p);if(t!==p)changed=true;return t;}).join('');
  return (changed||kk!==k)?s.replace(k,()=>out):null;
}
function translateTree(root){
  if(lang()!=='en'||!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    const p=n.parentNode;
    if(!p||/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName))return;
    const r=trText(n.nodeValue);
    if(r!==null&&r!==n.nodeValue)n.nodeValue=r;
  });
  const els=root.querySelectorAll?root.querySelectorAll('[placeholder],[title],[aria-label]'):[];
  els.forEach(el=>{
    ['placeholder','title','aria-label'].forEach(a=>{
      if(!el.hasAttribute(a))return;
      const r=trText(el.getAttribute(a));
      if(r!==null&&r!==el.getAttribute(a))el.setAttribute(a,r);
    });
  });
}
function applyStatic(){
  document.documentElement.lang=lang();
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=T(el.getAttribute('data-i18n'));});
  translateTree(document.body);
}
const langHTML=()=>`<div class="theme-sw" role="group" aria-label="${T('Langue')}">${[['fr','Français'],['en','English']].map(([k,l])=>`<button type="button" data-lang-set="${k}" aria-pressed="${lang()===k}">${l}</button>`).join('')}</div>`;
const listTr=s=>{if(lang()!=='en'||!s)return s;return String(s).split(/, (?![^(]*\))/).map(p=>{const t=p.trim();let m=/^(\d+) instruments de musique \((.+)\)$/.exec(t);if(m)return m[1]+' musical instruments ('+m[2].split(', ').map(x=>pieceTr(x)).join(', ')+')';m=/^(\d+) instruments de musique$/.exec(t);if(m)return m[1]+' musical instruments';return pieceTr(p);}).join(', ');};
const sheetTr=s=>{if(lang()!=='en'||!s)return s;return String(s).split(' · ').map(p=>pieceTr(p)).join(' · ');};
window.DNDI={lang,setLang,T,spellName,pieceTr,trText,sheetTr,listTr,applyStatic,langHTML,translateTree};
window.DNDI.extend=o=>Object.assign(EN,o);
window.DNDI.readOn=n=>lang()==='en'?'Read '+n+' on AideDD':'Lire '+n+' sur AideDD';
document.addEventListener('click',ev=>{
  const b=ev.target.closest&&ev.target.closest('[data-lang-set]');
  if(!b)return;
  const l=b.dataset.langSet;
  if(l===lang())return;
  setLang(l);location.reload();
});
/* les contenus ajoutés après coup (rendu de l'app, messages) sont traduits au fur et à mesure */
let pending=false;
function scheduleTranslate(){
  if(pending||lang()!=='en')return;
  pending=true;
  requestAnimationFrame(()=>{pending=false;translateTree(document.body);});
}
function startObserver(){
  if(lang()!=='en'||!document.body)return;
  new MutationObserver(scheduleTranslate).observe(document.body,{childList:true,subtree:true,characterData:true});
  applyStatic();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startObserver);else startObserver();
})();
