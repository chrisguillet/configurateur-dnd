/* Classes, sous-classes, dons de classe, métamagie */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const {PREP_BARDE,PREP_OCC,CANT_OCC,PREP_CLERC,PREP_ENS,cantN,mod}=NS;

const CL={
 barde:{n:{m:'Barde',f:'Barde'},hd:8,saves:['dex','cha'],pick:3,skills:null,
   cant:L=>cantN(L,2,3,4),prep:L=>PREP_BARDE[L-1],
   eqA:{items:"Armure de cuir, 2 dagues, un instrument de musique (au choix), sac d'artiste",gold:19},eqB:{items:'',gold:90},
   prof:'Armes courantes · Armures légères · 3 instruments de musique',
   profExtra:c=>c.sub==='vaillance'&&c.level>=3?' · Armes de guerre · Armures intermédiaires · Boucliers (Formation martiale)':''},
 ensorceleur:{n:{m:'Ensorceleur',f:'Ensorceleuse'},hd:6,saves:['con','cha'],pick:2,skills:['arcanes','tromperie','intuition','intimidation','persuasion','religion'],
   cant:L=>cantN(L,4,5,6),prep:L=>PREP_ENS[L-1],
   eqA:{items:"Lance, 2 dagues, focaliseur arcanique (cristal), sac d'exploration souterraine",gold:28},eqB:{items:'',gold:50},
   prof:'Armes courantes · Aucune armure'},
 guerrier:{n:{m:'Guerrier',f:'Guerrière'},hd:10,saves:['for','con'],pick:2,skills:['acrobaties','athletisme','dressage','histoire','intimidation','intuition','perception','persuasion','survie'],
   cant:()=>0,prep:()=>0,
   eqA:{items:"Cotte de mailles, épée à deux mains, fléau d'armes, 8 javelines, sac d'exploration souterraine",gold:4},eqB:{items:"Armure de cuir clouté, cimeterre, épée courte, arc long, 20 flèches, carquois, sac d'exploration souterraine",gold:11},eqC:{items:'',gold:155},
   prof:'Armes courantes et de guerre · Toutes les armures · Boucliers'},
 clerc:{n:{m:'Clerc',f:'Clerc'},hd:8,saves:['sag','cha'],pick:2,skills:['histoire','intuition','medecine','persuasion','religion'],
   cant:L=>L<4?3:L<10?4:5,prep:L=>PREP_CLERC[L-1],
   eqA:{items:"Chemise de mailles, bouclier, masse d'armes, symbole sacré, sac d'ecclésiastique",gold:7},eqB:{items:'',gold:110},
   prof:'Armes courantes · Armures légères et intermédiaires · Boucliers'}
,
 barbare:{n:{m:'Barbare',f:'Barbare'},hd:12,saves:['for','con'],pick:2,skills:['dressage','athletisme','intimidation','nature','perception','survie'],
   cant:()=>0,prep:()=>0,
   eqA:{items:"Hache à deux mains, 4 hachettes, sac d'explorateur",gold:15},eqB:{items:'',gold:75},
   prof:'Armes courantes et de guerre · Armures légères et intermédiaires · Boucliers'},
 occultiste:{n:{m:'Occultiste',f:'Occultiste'},hd:8,saves:['sag','cha'],pick:2,skills:['arcanes','tromperie','histoire','intimidation','investigation','nature','religion'],
   cant:CANT_OCC,prep:L=>PREP_OCC[L-1],
   eqA:{items:"Armure de cuir, serpe, 2 dagues, focaliseur arcanique (orbe), livre (savoir occulte), sac d'érudit",gold:15},eqB:{items:'',gold:100},
   prof:'Armes courantes · Armures légères'}
};

const CFEAT={
 barde:[
  {lv:1,n:'Inspiration bardique',d:"Action bonus : un allié à 18 m gagne un dé d'inspiration à ajouter à un jet de d20 raté dans l'heure. Utilisations = mod. de Charisme (min. 1), récupérées au repos long. Le dé grandit aux niveaux 5, 10 et 15."},
  {lv:1,n:'Sorts',d:"Incantation avec le Charisme. Un instrument de musique sert de focaliseur. À chaque niveau, vous pouvez remplacer un sort préparé."},
  {lv:2,n:'Expertise',d:"Expertise dans 2 compétences maîtrisées (2 de plus au niveau 9)."},
  {lv:2,n:'Touche-à-tout',d:"Ajoutez la moitié de votre bonus de maîtrise aux jets de compétence que vous ne maîtrisez pas."},
  {lv:3,n:'Sous-classe de barde',d:"Voir la sous-classe choisie."},
  {lv:5,n:"Source d'inspiration",d:"Inspiration bardique aussi récupérée au repos court ; un emplacement de sort peut rendre une utilisation."},
  {lv:7,n:'Contre-charme',d:"Réaction : vous ou un allié à 9 m relancez avec Avantage un jet contre l'état Charmé ou Effrayé."},
  {lv:10,n:'Secrets magiques',d:"Vos nouveaux sorts préparés peuvent venir des listes de barde, clerc, druide ou magicien."},
  {lv:18,n:'Inspiration supérieure',d:"À l'initiative, vous revenez à 2 utilisations d'Inspiration bardique si vous en aviez 1 ou moins."},
  {lv:20,n:'Verbe de la création',d:"Mot de pouvoir guérisseur et mot de pouvoir mortel toujours préparés ; ils peuvent viser une seconde créature à 3 m de la première."}
 ],
 ensorceleur:[
  {lv:1,n:'Sorts',d:"Incantation avec le Charisme. Un focaliseur arcanique sert de focaliseur. À chaque niveau, vous pouvez remplacer un sort préparé."},
  {lv:1,n:'Sorcellerie innée',d:"Action bonus, 1 minute : DD de vos sorts +1 et Avantage à vos jets d'attaque de sort. 2 utilisations par repos long."},
  {lv:2,n:'Réserve arcanique',d:"Points de Sorcellerie égaux à votre niveau. Convertissez emplacements et points dans les deux sens ; créez des emplacements jusqu'au niveau 5."},
  {lv:2,n:'Métamagie',d:"Vous modifiez vos sorts avec vos points de Sorcellerie (2 options, puis 2 de plus aux niveaux 10 et 17)."},
  {lv:3,n:"Sous-classe d'ensorceleur",d:"Voir la sous-classe choisie."},
  {lv:5,n:'Restauration ensorcelée',d:"Repos court : récupérez jusqu'à la moitié de votre niveau en points de Sorcellerie, une fois par repos long."},
  {lv:7,n:'Sorcellerie incarnée',d:"Réactivez la Sorcellerie innée pour 2 points ; tant qu'elle est active, 2 options de Métamagie par sort."},
  {lv:20,n:'Apothéose arcanique',d:"Sorcellerie innée active : une option de Métamagie par tour sans dépenser de points."}
  ],
 guerrier:[
  {lv:1,n:'Style de combat',d:"Un don de Style de combat au choix. Défense est recommandé. Vous pouvez le remplacer à chaque niveau de guerrier."},
  {lv:1,n:'Second souffle',d:"Action bonus : récupérez 1d10 + votre niveau en PV. Deux utilisations (une au repos court, toutes au repos long), plus à mesure de la progression."},
  {lv:1,n:"Bottes d'arme",d:"Maîtrise de la botte de trois types d'armes courantes ou de guerre, à modifier à chaque repos long. Le nombre augmente avec le niveau."},
  {lv:2,n:'Fougue',d:"Une action supplémentaire à votre tour, sauf l'action Magie. Une fois par repos court ou long, deux fois à partir du niveau 17 (une fois par tour)."},
  {lv:2,n:'Sens tactique',d:"En cas d'échec à un jet de caractéristique, dépensez une utilisation de Second souffle : ajoutez 1d10 au jet."},
  {lv:3,n:'Sous-classe de guerrier',d:"Voir la sous-classe choisie."},
  {lv:5,n:'Attaque supplémentaire',d:"Deux attaques par action Attaque."},
  {lv:5,n:'Décalage tactique',d:"Quand vous utilisez Second souffle comme action bonus, vous pouvez vous déplacer de la moitié de votre Vitesse sans attaque d'opportunité."},
  {lv:9,n:'Inflexible',d:"Relancez un jet de sauvegarde raté avec un bonus égal à votre niveau. Une fois par repos long, deux fois à partir du niveau 13, trois fois à partir du niveau 17."},
  {lv:9,n:'Botte tactique',d:"Remplacez la botte d'une attaque par Poussée, Sape ou Ralentissement."},
  {lv:11,n:'Double attaque supplémentaire',d:"Trois attaques par action Attaque."},
  {lv:13,n:'Attaques avisées',d:"Après un jet d'attaque raté contre une créature, vous avez un Avantage à votre prochain jet d'attaque contre elle avant la fin de votre tour suivant."},
  {lv:19,n:'Faveur épique',d:"Voir le don choisi (Faveur de prouesse martiale recommandée)."},
  {lv:20,n:'Triple attaque supplémentaire',d:"Quatre attaques par action Attaque."}
 ],
 clerc:[
  {lv:1,n:'Sorts',d:"Incantation avec la Sagesse. Un symbole sacré sert de focaliseur. Vous préparez un nombre de sorts indiqué par la table de classe. Trois sorts mineurs au niveau 1, recommandés : Assistance, Flamme sacrée, Thaumaturgie."},
  {lv:1,n:'Ordre divin',d:"Protecteur (armes de guerre et armures lourdes) ou Thaumaturge (un sort mineur de clerc de plus, et un bonus d'Intelligence (Arcanes ou Religion) égal à votre modificateur de Sagesse, minimum +1)."},
  {lv:2,n:'Conduit divin',d:"Deux utilisations (une au repos court, toutes au repos long), puis 3 au niveau 6 et 4 au niveau 18. Effets de base : Étincelle divine (soins ou dégâts radiants/nécrotiques) et Renvoi des morts-vivants (effrayés et incapables d'agir 1 minute)."},
  {lv:3,n:'Sous-classe de clerc',d:"Voir le domaine choisi."},
  {lv:4,n:'Amélioration de caractéristique',d:"Un don ou Amélioration de caractéristiques. Aussi aux niveaux 8, 12 et 16."},
  {lv:5,n:'Calcination de mort-vivant',d:"Avec Renvoi des morts-vivants, lancez des d8 (un par point de Sagesse, minimum 1) : les morts-vivants qui ratent leur jet subissent des dégâts radiants."},
  {lv:7,n:'Frappes bénies',d:"Une fois par tour, Frappe divine (1d8 nécrotique ou radiant supplémentaire) ou Incantation puissante (Sagesse ajoutée aux dégâts des sorts mineurs)."},
  {lv:10,n:'Intervention divine',d:"Une fois par repos long, lancez un sort de clerc de niveau 5 ou moins (sans Réaction) sans emplacement ni composantes matérielles."},
  {lv:14,n:'Impacts bénis améliorés',d:"Impact divin à 2d8, et des PV temporaires égaux au double de votre modificateur de Sagesse à une créature (ou à vous) quand un sort mineur inflige des dégâts."},
  {lv:19,n:'Faveur épique',d:"Voir le don choisi (Faveur du destin recommandée)."},
  {lv:20,n:'Intervention divine suprême',d:"Vous pouvez choisir souhait avec Intervention divine, puis devez terminer 2d4 repos longs avant de la réutiliser."}
 ],
 barbare:[
  {lv:1,n:'Rage',d:"Action bonus (sans armure lourde) : Résistance aux dégâts contondants, perforants et tranchants, Avantage aux jets de Force, dégâts de Rage sur les attaques de Force. Dure jusqu'à la fin de votre prochain tour, prolongeable (10 minutes maximum). Pas de sorts pendant la Rage."},
  {lv:1,n:'Défense sans armure',d:"Sans armure, CA = 10 + Dextérité + Constitution. Un bouclier reste permis."},
  {lv:1,n:"Bottes d'arme",d:"Maîtrise de la botte de deux types d'armes courantes ou de guerre (3 à 4 selon le niveau)."},
  {lv:2,n:'Sens du danger',d:"Avantage aux jets de sauvegarde de Dextérité, sauf si vous êtes Incapable d'agir."},
  {lv:2,n:'Témérité',d:"Au premier jet d'attaque de votre tour : Avantage aux attaques de Force, mais les attaques contre vous ont aussi l'Avantage jusqu'au début de votre tour suivant."},
  {lv:3,n:'Sous-classe de barbare',d:"Voir la voie choisie."},
  {lv:3,n:'Savoir primal',d:"Une compétence supplémentaire. Pendant la Rage, certains tests (Acrobaties, Intimidation, Perception, Discrétion, Survie) utilisent la Force."},
  {lv:4,n:'Amélioration de caractéristique',d:"Un don ou Amélioration de caractéristiques. Aussi aux niveaux 8, 12 et 16."},
  {lv:5,n:'Attaque supplémentaire',d:"Deux attaques par action Attaque."},
  {lv:5,n:'Déplacement rapide',d:"Vitesse +3 m sans armure lourde."},
  {lv:7,n:'Instinct sauvage',d:"Avantage aux jets d'initiative."},
  {lv:7,n:'Bond agressif',d:"Vous pouvez vous déplacer de la moitié de votre Vitesse en prenant l'action bonus de Rage."},
  {lv:9,n:'Coup brutal',d:"Avec Témérité, renoncez à l'Avantage pour un coup de +1d10 (puis un effet : Coup appuyé ou Coup au jarret)."},
  {lv:11,n:'Rage implacable',d:"À 0 PV pendant la Rage (sans mourir sur le coup) : jet de Constitution DD 10, en cas de réussite vous revenez à 2 × niveau de barbare PV. Le DD augmente de 5 à chaque utilisation."},
  {lv:13,n:'Coup brutal amélioré',d:"Coup stupéfiant et Coup déchirant rejoignent les options de Coup brutal."},
  {lv:15,n:'Rage persistante',d:"À l'initiative, récupérez toutes vos Rages (une fois par repos long). La Rage dure 10 minutes sans prolongation."},
  {lv:17,n:'Coup brutal amélioré',d:"Coup brutal inflige 2d10 de dégâts supplémentaires et peut appliquer deux effets."},
  {lv:18,n:'Puissance indomptable',d:"Un jet de Force ou de sauvegarde de Force inférieur à votre score de Force peut être remplacé par votre score."},
  {lv:19,n:'Faveur épique',d:"Voir le don choisi (Faveur d'attaque irrésistible recommandée)."},
  {lv:20,n:'Champion primitif',d:"Force et Constitution +4 (maximum 25)."}
 ],
 occultiste:[
  {lv:1,n:'Manifestations occultes',d:"Des fragments de savoir interdit qui donnent des pouvoirs. Nombre indiqué dans l'onglet Fiche (choix à noter à la main ; Pacte du grimoire est recommandé)."},
  {lv:1,n:'Magie de pacte',d:"Deux sorts mineurs d'occultiste, deux sorts de niveau 1 préparés. Les emplacements sont tous du même niveau et se récupèrent au repos court ou long."},
  {lv:2,n:'Rouerie magique',d:"Rite d'une minute : récupérez des emplacements de Magie de pacte (jusqu'à la moitié de votre maximum). Une fois par repos long."},
  {lv:3,n:"Sous-classe d'occultiste",d:"Voir le protecteur choisi."},
  {lv:4,n:'Amélioration de caractéristique',d:"Un don ou Amélioration de caractéristiques. Aussi aux niveaux 8, 12 et 16."},
  {lv:9,n:'Communication avec le protecteur',d:"Contact avec les plans toujours préparé ; une fois par repos long, sans emplacement et sans jet de sauvegarde."},
  {lv:11,n:'Arcanum mystique',d:"Un sort d'occultiste de niveau 6 lancé une fois par repos long sans emplacement (un autre aux niveaux 13, 15 et 17)."},
  {lv:19,n:'Faveur épique',d:"Voir le don choisi (Faveur du destin recommandée)."},
  {lv:20,n:"Maître de l'occulte",d:"Rouerie magique récupère tous les emplacements dépensés."}
 ]
};
const ASIFEAT={n:'Amélioration de caractéristique',d:"Don Amélioration de caractéristiques ou autre don (niveaux 4, 8, 12 et 16)."};

const SUBS={
 barde:{
  danse:{n:'Collège de la Danse',ok:true,f:[
   {lv:3,n:'Pirouettes éblouissantes',d:"Sans armure ni bouclier. Défense sans armure : CA = 10 + Dex + Cha. Dégâts bardiques : vos frappes à mains nues utilisent Dex et infligent (dé d'Inspiration bardique + Dex) dégâts contondants, sans dépenser le dé."},
   {lv:3,n:'Étoile du ballet',d:"Avantage aux jets de Représentation dansés."},
   {lv:3,n:'Frappes agiles',d:"Quand vous dépensez une Inspiration bardique pour une action, une action bonus ou une réaction, vous pouvez y ajouter une frappe à mains nues."},
   {lv:6,n:'Déplacement exaltant',d:"Quand un ennemi visible finit son tour à 1,50 m : réaction + 1 Inspiration, vous vous déplacez jusqu'à la moitié de votre Vitesse, puis un allié à 9 m peut faire de même en réaction. Sans attaque d'opportunité."},
   {lv:6,n:'Pirouettes coordonnées',d:"À l'initiative, dépensez une Inspiration (si vous n'êtes pas Incapable d'agir) : vous et les alliés visibles ou audibles à 9 m ajoutez le dé à l'initiative."},
   {lv:14,n:'Esquive cavalière',d:"Voir le Manuel des Joueurs."}]},
  savoir:{n:'Collège du Savoir',ok:true,f:[
   {lv:3,n:'Maîtrises supplémentaires',d:"Maîtrise de 3 compétences au choix."},
   {lv:3,n:'Mots cinglants',d:"Réaction + 1 Inspiration, quand une créature visible à 18 m inflige des dégâts ou réussit un jet de caractéristique ou d'attaque : soustrayez le dé à son jet (dégâts réduits, ou réussite pouvant devenir un échec)."},
   {lv:6,n:'Découvertes magiques',d:"Deux sorts de clerc, druide ou magicien (mineurs ou de niveau accessible), toujours préparés et remplaçables à chaque niveau de barde : ajoutez-les à la main dans l'onglet Sorts en cochant « toujours préparé »."},
   {lv:14,n:'Compétence hors pair',d:"Dépensez une Inspiration pour ajouter le dé à un jet de caractéristique ou d'attaque raté ; elle n'est pas perdue en cas d'échec."}]},
  seduction:{n:'Collège de la Séduction',ok:true,f:[
   {lv:3,n:'Magie envoûtante',d:"Charme-personne et image miroir toujours préparés. Juste après un sort d'Enchantement ou d'Illusion lancé avec un emplacement : une créature visible à 18 m réussit un JS de Sagesse (DD de sorts) ou est Charmée ou Effrayée 1 min (relance à la fin de ses tours). Une fois par repos long, ou en dépensant une Inspiration."},
   {lv:3,n:"Mante d'inspiration",d:"Action bonus + 1 Inspiration : jusqu'à (mod. de Cha, minimum 1) créatures à 18 m gagnent 2 × le dé en PV temporaires et peuvent, en réaction, se déplacer de leur Vitesse sans attaque d'opportunité."},
   {lv:6,n:'Mante de majesté',d:"Injonction toujours préparé. Action bonus : lancez injonction sans emplacement et prenez une apparence surnaturelle 1 min (concentration) ; vous relancez injonction en action bonus, et vos créatures Charmées échouent automatiquement. Une fois par repos long, ou avec un emplacement de niveau 3 ou plus."},
   {lv:14,n:'Majesté souveraine',d:"Voir le Manuel des Joueurs."}]},
  vaillance:{n:'Collège de la Vaillance',ok:true,f:[
   {lv:3,n:'Inspiration martiale',d:"Une créature qui a reçu votre dé peut l'utiliser : Défense (réaction quand elle est touchée : ajoutez le dé à sa CA contre cette attaque) ou Attaque (juste après avoir touché : ajoutez le dé aux dégâts)."},
   {lv:3,n:'Formation martiale',d:"Maîtrise des armes de guerre, formation aux armures intermédiaires et aux boucliers ; une arme courante ou de guerre sert de focaliseur pour vos sorts de barde."},
   {lv:6,n:'Attaque supplémentaire',d:"Deux attaques par action Attaque ; l'une peut être remplacée par un sort mineur d'une action."},
   {lv:14,n:'Magie de guerre',d:"Voir le Manuel des Joueurs."}]}
 },
 ensorceleur:{
  aberrante:{n:'Sorcellerie aberrante',ok:false,f:[]},
  draconique:{n:'Sorcellerie draconique',ok:true,f:[
   {lv:3,n:'Résistance draconique',d:"PV max +3 au niveau 3 puis +1 par niveau. Sans armure, CA = 10 + Dex + Cha."},
   {lv:3,n:'Sorts draconiques',d:"Sorts toujours préparés à certains niveaux (voir l'onglet Sorts)."},
   {lv:6,n:'Affinité élémentaire',d:"Résistance à un type de dégâts choisi ; ajoutez votre mod. de Cha aux dégâts d'un sort de ce type."},
   {lv:14,n:'Ailes draconiques',d:"Action bonus : ailes et Vitesse de vol 18 m pendant 1 h. Une fois par repos long, ou pour 3 points de Sorcellerie."},
   {lv:18,n:'Compagnon draconique',d:"Convocation de dragon sans composante matérielle, une fois gratuite par repos long, lançable sans Concentration."}]},
  mecanique:{n:'Sorcellerie mécanique',ok:false,f:[]},
  sauvage:{n:'Sorcellerie sauvage',ok:true,f:[
   {lv:3,n:'Bouffée de Sorcellerie sauvage',d:"Une fois par tour, après un sort d'ensorceleur à emplacement : 1d20, sur un 20 un effet de la table de magie sauvage."},
   {lv:3,n:'Marée du chaos',d:"Avantage à un jet de d20. Réutilisable après un sort à emplacement (qui déclenche un jet sur la table) ou un repos long."},
   {lv:6,n:'Comme par hasard',d:"Réaction + 1 point de Sorcellerie : 1d4 en bonus ou malus au d20 d'une autre créature."},
   {lv:14,n:'Chaos contrôlé',d:"Voir le Manuel des Joueurs."},
   {lv:18,n:'Bouffée domptée',d:"Voir le Manuel des Joueurs."}]} },
 guerrier:{
  champion:{n:'Champion',ok:true,f:[
   {lv:3,n:'Critique amélioré',d:"Un coup critique sur un 19 ou 20 au d20 (attaques d'arme et frappes à mains nues)."},
   {lv:3,n:'Athlète accompli',d:"Avantage aux jets d'Initiative et de Force (Athlétisme). Après un coup critique, déplacement de la moitié de votre Vitesse sans attaque d'opportunité."},
   {lv:7,n:'Style de combat supplémentaire',d:"Un autre don de Style de combat."},
   {lv:10,n:"Héros du champ d'honneur",d:"Vous pouvez vous accorder une Inspiration héroïque au début de votre tour, si vous n'en avez pas."},
   {lv:15,n:'Critique supérieur',d:"Coup critique sur un 18, 19 ou 20."},
   {lv:18,n:'Survivant',d:"Trompe-la-mort : Avantage aux jets de sauvegarde contre la mort, et un 18 ou 19 compte comme un 20. Résilience héroïque : au début de votre tour, si vous êtes En péril avec au moins 1 PV, vous récupérez 5 + modificateur de Constitution PV."}]},
  maitre:{n:'Maître de guerre',ok:true,f:[
   {lv:3,n:'Disciple martial',d:"Maîtrise d'un type d'outils d'artisan et d'une compétence de guerrier de niveau 1."},
   {lv:3,n:'Supériorité martiale',d:"Trois manœuvres au choix parmi la liste de la sous-classe (une seule par attaque). Quatre dés de Supériorité (d8), récupérés au repos court ou long. DD des manœuvres : 8 + bonus de maîtrise + Force ou Dextérité. Manœuvres supplémentaires aux niveaux 7, 10 et 15 ; dés en plus aux niveaux 7 (cinq) et 15 (six)."},
   {lv:7,n:"Observation de l'ennemi",d:"Action bonus : connaissez les Immunités, Résistances et Vulnérabilités d'une créature à 9 m. Une utilisation par repos long, ou un dé de Supériorité."},
   {lv:10,n:'Supériorité martiale améliorée',d:"Les dés de Supériorité deviennent des d10."},
   {lv:15,n:'Implacable',d:"Voir le Manuel des Joueurs."},
   {lv:18,n:'Supériorité martiale ultime',d:"Voir le Manuel des Joueurs."}]},
  psi:{n:'Soldat psi',ok:false,f:[]},
  occulte:{n:'Chevalier occulte',ok:true,f:[
   {lv:3,n:'Sorts du chevalier occulte',d:"Sorts de magicien (Intelligence), choisis à la main dans l'onglet Sorts : deux sorts mineurs (trois au niveau 10), puis le nombre de sorts préparés de la table. Emplacements selon la table de la sous-classe."},
   {lv:3,n:'Arme occulte',d:"Rituel d'une heure (pendant un repos court) qui lie une arme à vous. Jusqu'à deux armes liées (une troisième impose d'en rompre une) : vous en invoquez une par action bonus, elle vient dans votre main (même plan). Vous ne pouvez être désarmé que si vous êtes Incapable d'agir."},
   {lv:7,n:'Magie de guerre',d:"Quand vous prenez l'action Attaque, remplacez une attaque par un sort mineur de magicien dont le temps d'incantation est une action."},
   {lv:10,n:'Fragilisation occulte',d:"Une créature touchée par une attaque d'arme a un Désavantage à son prochain jet de sauvegarde contre un de vos sorts, avant la fin de votre prochain tour."},
   {lv:15,n:'Charge arcanique',d:"Voir le Manuel des Joueurs."},
   {lv:18,n:'Magie de guerre améliorée',d:"Voir le Manuel des Joueurs."}]}
 },
 clerc:{
  guerre:{n:'Domaine de la Guerre',ok:true,f:[
   {lv:3,n:'Frappe guidée',d:"Dépensez une utilisation de Conduit divin pour ajouter +10 à un jet d'attaque raté (le vôtre ou celui d'une créature à 9 m)."},
   {lv:3,n:'Sorts du domaine',d:"Sorts toujours préparés, ajoutés automatiquement (voir l'onglet Sorts)."},
   {lv:3,n:'Prêtre de guerre',d:"Action bonus : une attaque d'arme ou à mains nues, un nombre de fois égal au modificateur de Sagesse (minimum 1)."},
   {lv:6,n:'Bénédiction du dieu de la guerre',d:"Dépensez un Conduit divin pour lancer bouclier de la foi ou arme spirituelle sans emplacement (durée 1 minute, sans Concentration)."},
   {lv:17,n:'Avatar de la bataille',d:"Voir le Manuel des Joueurs."}]},
  lumiere:{n:'Domaine de la Lumière',ok:true,f:[
   {lv:3,n:"Radiance de l'Aube",d:"Dépensez un Conduit divin : une émanation de 9 m dissipe les ténèbres magiques et inflige 2d10 + niveau de clerc de dégâts radiants (moitié si réussite au jet de Constitution)."},
   {lv:3,n:'Éclat protecteur',d:"Réaction : impose un Désavantage à l'attaque d'une créature à 9 m. Utilisations égales au modificateur de Sagesse."},
   {lv:3,n:'Sorts du domaine',d:"Sorts toujours préparés, ajoutés automatiquement (voir l'onglet Sorts)."},
   {lv:6,n:'Éclat protecteur amélioré',d:"Utilisations récupérées au repos court ou long. La cible reçoit des PV temporaires égaux à 2d6 + modificateur de Sagesse."},
   {lv:17,n:'Auréole',d:"Voir le Manuel des Joueurs."}]},
  ruse:{n:'Domaine de la Ruse',ok:true,f:[
   {lv:3,n:'Faveur du filou',d:"Action : vous ou une créature consentante à 9 m avez un Avantage aux jets de Dextérité (Discrétion) jusqu'au repos long ou jusqu'à la prochaine utilisation."},
   {lv:3,n:'Invocation de réplique',d:"Action bonus, Conduit divin : une illusion de vous-même pendant 1 minute, avec laquelle vous pouvez lancer des sorts et qui vous donne des Avantages (distraction, déplacement)."},
   {lv:3,n:'Sorts du domaine',d:"Sorts toujours préparés, ajoutés automatiquement (voir l'onglet Sorts)."},
   {lv:6,n:'Troc du filou',d:"Avec une action bonus pour créer ou déplacer l'illusion, vous pouvez échanger votre place avec elle."},
   {lv:17,n:'Réplique améliorée',d:"Voir le Manuel des Joueurs."}]},
  vie:{n:'Domaine de la Vie',ok:true,f:[
   {lv:3,n:'Disciple de la vie',d:"Un sort avec emplacement qui rend des PV à une créature lui en rend davantage : 2 + niveau de l'emplacement."},
   {lv:3,n:'Sorts du domaine',d:"Sorts toujours préparés, ajoutés automatiquement (voir l'onglet Sorts)."},
   {lv:3,n:'Survivance',d:"Action, Conduit divin : restaure 5 fois votre niveau de clerc en PV, répartis entre des créatures En péril à 9 m (vous compris), jusqu'à la moitié de leur maximum."},
   {lv:6,n:'Guérisseur béni',d:"Chaque sort avec emplacement qui soigne une autre créature vous soigne aussi de 2 + niveau de l'emplacement."},
   {lv:17,n:'Guérison suprême',d:"Les dés de soins sont remplacés par leur valeur maximale."}]}
 },
 barbare:{
  arbre:{n:"Voie de l'Arbre-Monde",ok:true,f:[
   {lv:3,n:"Vitalité de l'Arbre",d:"Activer la Rage donne des PV temporaires égaux à votre niveau. Chaque tour en Rage, soignez une créature à 3 m (d6 × bonus de dégâts de Rage)."},
   {lv:6,n:"Branches de l'Arbre",d:"Réaction : une créature à 9 m qui commence son tour dans la zone est téléportée près de vous (JS de Force) et sa Vitesse peut tomber à 0."},
   {lv:10,n:'Rosée de racines',d:"Allonge +3 m avec les armes Lourdes ou Polyvalentes ; Poussée ou Renversement en plus d'une autre botte."},
   {lv:14,n:"Voyage au gré de l'Arbre",d:"Voir le Manuel des Joueurs."}]},
  berserker:{n:'Voie du Berserker',ok:true,f:[
   {lv:3,n:'Frénésie',d:"Témérité pendant la Rage : dégâts supplémentaires (d6 × bonus de dégâts de Rage) à la première cible du tour."},
   {lv:6,n:'Rage aveugle',d:"Immunité aux états Charmé et Effrayé pendant la Rage."},
   {lv:10,n:'Représailles',d:"Réaction : quand une créature à 1,50 m vous blesse, attaque de mêlée contre elle."},
   {lv:14,n:'Présence intimidante',d:"Action bonus : Effrayé pour les créatures à 9 m (JS de Sagesse). Une fois par repos long ou avec une Rage."}]},
  coeur:{n:'Voie du Cœur sauvage',ok:true,f:[
   {lv:3,n:'Orateur animal',d:"Perception bestiale et communication avec les animaux, en rituel seulement (Sagesse)."},
   {lv:3,n:'Rage du prédateur',d:"Au début de la Rage, choisissez Ours (Résistances), Aigle (Désengagement et Pointe) ou Loup (alliés avec Avantage)."},
   {lv:6,n:'Aspect de faune',d:"Chouette (Vision dans le noir 18 m), Panthère (escalade) ou Saumon (nage). Modifiable au repos long."},
   {lv:10,n:'Orateur de la nature',d:"Communion avec la nature, en rituel seulement (Sagesse)."},
   {lv:14,n:'Puissance de la faune',d:"Voir le Manuel des Joueurs."}]},
  zelateur:{n:'Voie du Zélateur',ok:false,f:[]}
 },
 occultiste:{
  archifee:{n:'Protecteur Archifée',ok:true,f:[
   {lv:3,n:"Sorts de l'Archifée",d:"Sorts toujours préparés, ajoutés automatiquement (voir l'onglet Sorts)."},
   {lv:3,n:'Foulée des fées',d:"Foulée brumeuse sans emplacement, un nombre de fois égal au modificateur de Charisme. Options : foulée revigorante et foulée provocatrice."},
   {lv:6,n:'Échappatoire brumeuse',d:"Foulée brumeuse en Réaction aux dégâts. Options supplémentaires : foulée de disparition et foulée effroyable."},
   {lv:10,n:'Charmantes défenses',d:"Immunité à l'état Charmé ; Réaction pour réduire de moitié les dégâts subis et renvoyer des dégâts psychiques."},
   {lv:14,n:'Magie envoûtante',d:"Voir le Manuel des Joueurs."}]},
  celeste:{n:'Protecteur Céleste',ok:true,f:[
   {lv:3,n:'Sorts du Céleste',d:"Sorts toujours préparés, ajoutés automatiquement (voir l'onglet Sorts)."},
   {lv:3,n:'Lumière guérisseuse',d:"Réserve de d6 (1 + niveau d'occultiste), à dépenser en action bonus pour soigner (dépense maximale = modificateur de Charisme). Rechargée au repos long."},
   {lv:6,n:'Âme radiante',d:"Résistance aux dégâts radiants ; une fois par tour, ajoutez le Charisme aux dégâts radiants ou de feu d'un sort."},
   {lv:10,n:'Résilience céleste',d:"PV temporaires à chaque Rouerie magique ou repos court ou long, aussi pour jusqu'à cinq alliés."},
   {lv:14,n:'Vengeance aveuglante',d:"Voir le Manuel des Joueurs."}]},
  fielon:{n:'Protecteur Fiélon',ok:true,f:[
   {lv:3,n:'Bénédiction du Ténébreux',d:"Réduire un ennemi à 0 PV donne des PV temporaires (Charisme + niveau, minimum 1)."},
   {lv:3,n:'Sorts du Fiélon',d:"Sorts toujours préparés, ajoutés automatiquement (voir l'onglet Sorts)."},
   {lv:6,n:'Chance du Ténébreux',d:"Ajoutez 1d10 à un jet de caractéristique ou de sauvegarde (après l'avoir vu). Charisme fois par repos long."},
   {lv:10,n:'Résistance fiélonne',d:"Une Résistance à un type de dégâts (autre que Force), choisie à chaque repos."},
   {lv:14,n:'Traversée des enfers',d:"Une fois par tour, projette une cible dans les Plans Inférieurs (8d10 psychiques si elle n'est pas fiélon)."}]},
  grandancien:{n:'Protecteur Grand Ancien',ok:true,f:[
   {lv:3,n:'Esprit éveillé',d:"Communication télépathique avec une créature à 9 m, pendant un nombre de minutes égal à votre niveau d'occultiste."},
   {lv:3,n:'Sorts du Grand Ancien',d:"Sorts toujours préparés, ajoutés automatiquement (voir l'onglet Sorts)."},
   {lv:3,n:'Sorts psychiques',d:"Vos sorts d'occultiste qui infligent des dégâts peuvent infliger des dégâts psychiques. Vos sorts d'Enchantement et d'Illusion peuvent être lancés sans composante verbale ni somatique."},
   {lv:6,n:'Combattant clairvoyant',d:"Avec Esprit éveillé : désavantage aux attaques contre vous et avantage aux vôtres, sous JS de Sagesse."},
   {lv:10,n:'Maléfice occulte',d:"Maléfice toujours préparé ; la cible a un Désavantage à la caractéristique choisie."},
   {lv:10,n:'Bouclier mental',d:"Résistance aux dégâts psychiques ; l'attaquant reçoit les mêmes dégâts."},
   {lv:14,n:'Asservissement',d:"Voir le Manuel des Joueurs."}]}
 }
};
const DOMS={
 guerre:[[3,["Rayon traçant","Arme magique","Bouclier de la foi","Arme spirituelle"]],[5,["Aura du croisé","Esprits gardiens"]],[7,["Bouclier de feu","Liberté de mouvement"]],[9,["Immobilisation de monstre","Frappe du vent d'acier"]]],
 lumiere:[[3,["Mains brûlantes","Lueurs féeriques","Rayon ardent","Détection de l'invisibilité"]],[5,["Lumière du jour","Boule de feu"]],[7,["Œil du mage","Mur de feu"]],[9,["Colonne de flamme","Scrutation"]]],
 ruse:[[3,["Charme-personne","Déguisement","Invisibilité","Passage sans trace"]],[5,["Motif hypnotique","Antidétection"]],[7,["Confusion","Porte dimensionnelle"]],[9,["Domination de personne","Modification de mémoire"]]],
 vie:[[3,["Aide","Bénédiction","Soins","Restauration partielle"]],[5,["Mot de guérison de groupe","Retour à la vie"]],[7,["Aura de vie","Protection contre la mort"]],[9,["Restauration suprême","Soins de groupe"]]],
 archifee:[[3,["Apaisement des émotions","Lueurs féeriques","Foulée brumeuse","Force fantasmagorique","Sommeil"]],[5,["Clignotement","Croissance végétale"]],[7,["Domination de bête","Invisibilité suprême"]],[9,["Domination de personne","Apparence trompeuse"]]],
 celeste:[[3,["Aide","Soins","Rayon traçant","Restauration partielle","Lumière","Flamme sacrée"]],[5,["Lumière du jour","Retour à la vie"]],[7,["Gardien de la foi","Mur de feu"]],[9,["Restauration suprême","Convocation de céleste"]]],
 fielon:[[3,["Mains brûlantes","Injonction","Rayon ardent","Suggestion"]],[5,["Boule de feu","Nuage nauséabond"]],[7,["Bouclier de feu","Mur de feu"]],[9,["Quête","Fléau d'insectes"]]],
 grandancien:[[3,["Détection des pensées","Murmures dissonants","Force fantasmagorique","Fou rire de Tasha"]],[5,["Clairvoyance","Voracité de Hadar"]],[7,["Confusion","Convocation d'aberration"]],[9,["Modification de mémoire","Télékinésie"]]]
};
const DRAC_SPELLS=[[3,['Modification d\'apparence','Orbe chromatique','Injonction','Souffle du dragon']],[5,['Peur','Vol']],[7,['Œil du mage','Charme-monstre']],[9,['Mythes et légendes','Convocation de dragon']]];
const SED_SPELLS=[[3,['Charme-personne','Image miroir']],[6,['Injonction']]];

const META={
 'Sort accéléré':[2,"Sort d'une action lancé en action bonus (restrictions sur les emplacements du tour)."],
 'Sort ample':[1,"Portée doublée, ou 9 m pour un sort de contact."],
 'Sort chercheur':[1,"Relancer un jet d'attaque de sort raté."],
 'Sort étendu':[1,"Durée doublée (24 h max) ; Avantage aux JS de Concentration."],
 'Sort intensifié':[2,"Une cible subit un Désavantage à son jet de sauvegarde."],
 'Sort jumeau':[1,"Niveau effectif +1 pour cibler une créature de plus."],
 'Sort prévenant':[1,"Des créatures (jusqu'au mod. de Cha) réussissent automatiquement leur JS."],
 'Sort renforcé':[1,"Relancer des dés de dégâts (jusqu'au mod. de Cha)."],
 'Sort subtil':[1,"Sans composantes verbales, somatiques ni matérielles (hors composantes coûteuses)."],
 'Sort transmuté':[1,"Changer le type de dégâts (acide, feu, foudre, froid, poison, tonnerre)."]
};


Object.assign(NS,{CL,CFEAT,ASIFEAT,SUBS,DOMS,DRAC_SPELLS,SED_SPELLS,META});
})();
