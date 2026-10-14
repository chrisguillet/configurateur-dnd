/* Magicien, druide, paladin, rôdeur, moine, roublard + table d'incantation de toutes les classes.
   Descriptions résumées avec des formulations propres ; « Voir le Manuel des Joueurs » quand le texte
   source n'était pas disponible. */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const {PREP_CLERC,cantN,expCount,CL,CFEAT,SUBS}=NS;

/* ---------- Tables numériques (niveau 1 → 20) ---------- */
const PREP_MAG=[4,5,6,7,9,10,11,12,14,15,16,16,17,18,19,21,22,23,24,25];
const PREP_DEMI=[2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15];            /* paladin et rôdeur */
const HALF_SLOTS=[[2],[2],[3],[3],[4,2],[4,2],[4,3],[4,3],[4,3,2],[4,3,2],[4,3,3],[4,3,3],[4,3,3,1],[4,3,3,1],[4,3,3,2],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2]];
const WILD_USES=L=>L>=17?4:L>=6?3:2;
const RANGER_MARK=[2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];
const MARTIAL_DIE=L=>L>=17?12:L>=11?10:L>=5?8:6;
const MONK_SPEED=[0,3,3,3,3,4.5,4.5,4.5,4.5,6,6,6,6,7.5,7.5,7.5,7.5,9,9,9];
const mtr=n=>String(n).replace('.',',')+' m';

/* ---------- Incantation de chaque classe : caractéristique et type ---------- */
/* t : full (lanceur complet) · half (demi-lanceur) · pact (magie de pacte) · third (tiers-lanceur, selon la sous-classe) */
const CAST={
  barde:{a:'cha',t:'full'},ensorceleur:{a:'cha',t:'full'},clerc:{a:'sag',t:'full'},occultiste:{a:'cha',t:'pact'},
  guerrier:{a:'int',t:'third'},barbare:null,
  magicien:{a:'int',t:'full'},druide:{a:'sag',t:'full'},paladin:{a:'cha',t:'half'},rodeur:{a:'sag',t:'half'},
  moine:{a:'sag',t:'none'},roublard:{a:'int',t:'third'}
};

/* ---------- Classes ---------- */
Object.assign(CL,{
 magicien:{n:{m:'Magicien',f:'Magicienne'},hd:6,saves:['int','sag'],pick:2,
  skills:['arcanes','histoire','intuition','investigation','medecine','nature','religion'],
  cant:L=>cantN(L,3,4,5),prep:L=>PREP_MAG[L-1],
  expN:L=>L>=2?1:0,expOf:['arcanes','histoire','investigation','medecine','nature','religion'],
  eqA:{items:"2 dagues, focaliseur arcanique (bâton), robe, grimoire, sac d'érudit",gold:5},eqB:{items:'',gold:55},
  prof:'Armes courantes · Aucune formation aux armures',
  res:(L)=>[`Restauration magique : après un repos court, récupérez des emplacements dont le niveau cumulé ne dépasse pas ${Math.ceil(L/2)} (aucun de niveau 6 ou plus), une fois par repos long`]},

 druide:{n:{m:'Druide',f:'Druidesse'},hd:8,saves:['int','sag'],pick:2,
  skills:['dressage','arcanes','intuition','medecine','nature','perception','religion','survie'],
  cant:L=>cantN(L,2,3,4),prep:L=>PREP_CLERC[L-1],
  always:[[1,['Communication avec les animaux'],'Druidique']],
  opts:[{k:'order',l:'Ordre primitif',c:[['mage','Mage'],['gardien','Gardien']]}],
  cantBonus:c=>c.opt&&c.opt.order==='mage'?1:0,
  skillB:(c,id,D)=>(c.opt&&c.opt.order==='mage'&&(id==='arcanes'||id==='nature'))?Math.max(1,D.mod.sag):0,
  profExtra:c=>c.opt&&c.opt.order==='gardien'?' · Armes de guerre · Armures intermédiaires (Ordre du Gardien)':'',
  eqA:{items:"Armure de cuir, bouclier, serpe, focaliseur druidique (bâton), sac d'explorateur, matériel d'herboriste",gold:9},eqB:{items:'',gold:50},
  prof:"Armes courantes · Armures légères · Boucliers · Matériel d'herboriste",
  res:(L)=>{
   const r=[];
   if(L>=2){const f=L>=8?[8,'1',' ; vol possible']:L>=4?[6,'1/2','']:[4,'1/4',''];
    r.push(`Forme sauvage : ${WILD_USES(L)} utilisations (une récupérée au repos court, toutes au repos long) · ${f[0]} formes connues, FP max ${f[1]}${f[2]} · durée ${Math.floor(L/2)} h · ${L} PV temporaires`);}
   return r;}},

 paladin:{n:{m:'Paladin',f:'Paladine'},hd:10,saves:['sag','cha'],pick:2,
  skills:['athletisme','intuition','intimidation','medecine','persuasion','religion'],
  cant:()=>0,prep:L=>PREP_DEMI[L-1],
  always:[[2,['Châtiment divin'],'Châtiment de paladin'],[5,['Appel de destrier'],'Fidèle destrier']],
  eqA:{items:"Cotte de mailles, bouclier, épée longue, 6 javelines, symbole sacré, sac d'ecclésiastique",gold:9},eqB:{items:'',gold:150},
  prof:'Armes courantes et de guerre · Toutes les armures · Boucliers',
  res:(L)=>{
   const r=[`Imposition des mains : réserve de ${5*L} PV (repos long)`];
   if(L>=2)r.push('Châtiment divin : une incantation gratuite par repos long');
   if(L>=3)r.push(`Conduit divin : ${L>=11?3:2} utilisations (une récupérée au repos court, toutes au repos long)`);
   if(L>=5)r.push('Appel de destrier : une incantation gratuite par repos long');
   return r;}},

 rodeur:{n:{m:'Rôdeur',f:'Rôdeuse'},hd:10,saves:['for','dex'],pick:3,
  skills:['dressage','athletisme','intuition','investigation','nature','perception','discretion','survie'],
  cant:()=>0,prep:L=>PREP_DEMI[L-1],
  expN:L=>L>=9?3:L>=2?1:0,
  always:[[1,['Marque du chasseur'],'Ennemi juré']],
  eqA:{items:"Armure de cuir clouté, cimeterre, épée courte, arc long, 20 flèches, carquois, focaliseur druidique (branche de gui), sac d'explorateur",gold:7},eqB:{items:'',gold:150},
  prof:'Armes courantes et de guerre · Armures légères et intermédiaires · Boucliers',
  res:(L,D)=>{
   const r=[`Ennemi juré : marque du chasseur sans emplacement, ${RANGER_MARK[L-1]} fois par repos long · dé de dégâts d${L>=20?10:6}`];
   if(L>=10)r.push(`Infatigable : ${Math.max(1,D.mod.sag)} utilisation(s) (1d8 + Sagesse PV temporaires, repos long)`);
   if(L>=14)r.push(`Voile de la nature : ${Math.max(1,D.mod.sag)} utilisation(s) par repos long`);
   return r;}},

 moine:{n:{m:'Moine',f:'Moine'},hd:8,saves:['for','dex'],pick:2,
  skills:['acrobaties','athletisme','histoire','intuition','religion','discretion'],
  cant:()=>0,prep:()=>0,
  acUn:{ab:['dex','sag'],noShield:true,note:'Défense sans armure (10 + Dex + Sag)'},
  speedUn:L=>MONK_SPEED[L-1],
  saveExtra:L=>L>=14?['for','dex','con','int','sag','cha']:[],
  abBonus:L=>L>=20?{ab:['dex','sag'],n:4,max:25}:null,
  eqA:{items:"Lance, 5 dagues, outils d'artisan ou instrument de musique, sac d'explorateur",gold:11},eqB:{items:'',gold:50},
  prof:"Armes courantes et armes de guerre Légères · Aucune armure · 1 outil d'artisan ou instrument de musique",
  res:(L,D)=>{
   const r=[`Dé d'Arts martiaux : d${MARTIAL_DIE(L)}`];
   if(L>=2)r.push(`Points de Credo : ${L} (repos court ou long) · DD de Credo ${8+D.mod.sag+D.pb}`);
   if(L>=2)r.push(`Déplacement sans armure : +${mtr(MONK_SPEED[L-1])} (sans armure ni bouclier)`);
   return r;}},

 roublard:{n:{m:'Roublard',f:'Roublarde'},hd:8,saves:['dex','int'],pick:4,
  skills:['acrobaties','athletisme','tromperie','intuition','intimidation','investigation','perception','persuasion','escamotage','discretion'],
  cant:()=>0,prep:()=>0,asi:[4,8,10,12,16],
  expN:L=>L>=6?4:2,
  saveExtra:L=>L>=15?['sag','cha']:[],
  eqA:{items:"Armure de cuir, 2 dagues, épée courte, arc court, 20 flèches, carquois, outils de voleur, sac de cambrioleur",gold:8},eqB:{items:'',gold:100},
  prof:'Armes courantes · Armes de guerre (Finesse ou Légère) · Armures légères · Outils de voleur',
  res:(L)=>[`Attaque sournoise : ${Math.ceil(L/2)}d6`]}
});
CL.barde.expN=expCount;   /* l'expertise du barde passe par la même mécanique que les autres classes */
/* Le guerrier gagne des améliorations de caractéristique aux niveaux 4, 6, 8, 12, 14 et 16. */
CL.guerrier.asi=[4,6,8,12,14,16];

/* ---------- Capacités de classe ---------- */
Object.assign(CFEAT,{
 magicien:[
  {lv:1,n:'Sorts',d:"Incantation avec l'Intelligence, avec un focaliseur arcanique. Vous préparez vos sorts parmi ceux de votre grimoire (six de niveau 1 au départ, deux de plus à chaque niveau) et pouvez changer cette liste après un repos long."},
  {lv:1,n:'Savoir rituel',d:"Vous lancez en rituel tout sort à étiquette Rituel de votre grimoire, même non préparé (il faut lire le livre)."},
  {lv:1,n:'Restauration magique',d:"Après un repos court, récupérez des emplacements dont le niveau cumulé ne dépasse pas la moitié de votre niveau de magicien (arrondi au supérieur), sans emplacement de niveau 6 ou plus. Une fois par repos long."},
  {lv:2,n:'Érudition',d:"Expertise dans une compétence maîtrisée parmi Arcanes, Histoire, Investigation, Médecine, Nature ou Religion."},
  {lv:3,n:'Sous-classe de magicien',d:"Voir la sous-classe choisie."},
  {lv:5,n:'Mémorisation de sort',d:"Après un repos court, remplacez un sort préparé par un autre sort de votre grimoire."},
  {lv:18,n:'Maîtrise des sorts',d:"Un sort de niveau 1 et un de niveau 2 de votre grimoire (temps d'incantation : une action) sont toujours préparés et se lancent à leur niveau de base sans emplacement. Changeables après un repos long."},
  {lv:20,n:'Sorts de prédilection',d:"Deux sorts de niveau 3 de votre grimoire sont toujours préparés ; chacun se lance une fois au niveau 3 sans emplacement, puis après un repos court ou long."}
 ],
 druide:[
  {lv:1,n:'Sorts',d:"Incantation avec la Sagesse, avec un focaliseur druidique. Vous préparez vos sorts dans la liste de druide et pouvez changer cette liste après un repos long."},
  {lv:1,n:'Druidique',d:"Vous connaissez le druidique (messages cachés) ; communication avec les animaux est toujours préparé."},
  {lv:1,n:'Ordre primitif',d:"Choix : Mage (un sort mineur de druide en plus ; bonus de Sagesse, minimum +1, aux jets d'Arcanes et de Nature) ou Gardien (maîtrise des armes de guerre et des armures intermédiaires)."},
  {lv:2,n:'Forme sauvage',d:"Action bonus : vous prenez la forme d'une Bête connue pendant la moitié de votre niveau en heures, avec des PV temporaires égaux à votre niveau. Formes connues : 4 (FP 1/4 max, sans vol), 6 au niveau 4 (FP 1/2), 8 au niveau 8 (FP 1, vol possible). Une utilisation revient au repos court, toutes au repos long. Pas d'incantation sous cette forme."},
  {lv:2,n:'Compagnon sauvage',d:"Vous pouvez lancer Appel de familier sans composante matérielle, en dépensant un emplacement de sort ou une utilisation de Forme sauvage (action Magie). Le familier prend alors l'apparence d'une Fée et disparaît à la fin de votre prochain repos long."},
  {lv:3,n:'Sous-classe de druide',d:"Voir la sous-classe choisie."},
  {lv:5,n:'Regain sauvage',d:"Une fois par tour, sans utilisation de Forme sauvage, vous en regagnez une en dépensant un emplacement (sans action). Vous pouvez aussi dépenser une utilisation pour obtenir un emplacement de niveau 1, une fois par repos long."},
  {lv:7,n:'Fureur élémentaire',d:"Choix : Incantation puissante (ajoutez votre Sagesse aux dégâts de vos sorts mineurs de druide) ou Frappes primitives (une fois par tour, +1d8 dégâts de froid, de feu, de foudre ou de tonnerre sur un coup d'arme ou d'attaque de Bête)."},
  {lv:15,n:'Fureur élémentaire améliorée',d:"Incantation puissante : la portée de vos sorts mineurs (3 m ou plus) augmente de 90 m. Frappes primitives : les dégâts supplémentaires passent à 2d8."},
  {lv:18,n:'Incantation animale',d:"Sous Forme sauvage, vous pouvez lancer des sorts, sauf ceux dont la composante matérielle est coûteuse ou consommée."},
  {lv:20,n:'Archidruide',d:"À l'Initiative, regagnez une utilisation de Forme sauvage si vous n'en avez plus. Convertissez des utilisations en un emplacement (2 niveaux par utilisation), une fois par repos long. Longévité : vous vieillissez d'un an par décennie."}
 ],
 paladin:[
  {lv:1,n:'Imposition des mains',d:"Réserve de soins de 5 × niveau PV, rechargée au repos long. Action bonus : touchez une créature pour la soigner depuis la réserve, ou dépensez 5 PV pour retirer l'état Empoisonné."},
  {lv:1,n:'Sorts',d:"Incantation avec le Charisme, avec un symbole sacré. Vous préparez vos sorts dans la liste de paladin et pouvez en changer un après un repos long."},
  {lv:1,n:"Bottes d'arme",d:"Vous utilisez la propriété Botte de deux types d'armes maîtrisées, modifiables après un repos long."},
  {lv:2,n:'Style de combat',d:"Un don de Style de Combat, ou Combattant béni : deux sorts mineurs de clerc (Charisme), remplaçables à chaque niveau."},
  {lv:2,n:'Châtiment de paladin',d:"Châtiment divin toujours préparé ; une incantation gratuite par repos long."},
  {lv:3,n:'Conduit divin',d:"2 utilisations (3 au niveau 11) : une récupérée au repos court, toutes au repos long. Vous débutez avec l'effet Perception divine ; d'autres options viennent de vos capacités."},
  {lv:3,n:'Sous-classe de paladin',d:"Voir la sous-classe choisie."},
  {lv:5,n:'Attaque supplémentaire',d:"Deux attaques, au lieu d'une, avec l'action Attaque."},
  {lv:5,n:'Fidèle destrier',d:"Appel de destrier toujours préparé ; une incantation gratuite par repos long."},
  {lv:6,n:'Aura de protection',d:"Émanation de 3 m : vous et vos alliés ajoutez votre modificateur de Charisme (minimum +1) aux jets de sauvegarde. Inactive si vous êtes Incapable d'agir."},
  {lv:9,n:"Abjuration d'ennemis",d:"Action Magie + Conduit divin : jusqu'à Cha créatures à 18 m font un jet de Sagesse ou sont Effrayées 1 minute (ou jusqu'à ce qu'elles subissent des dégâts)."},
  {lv:10,n:'Aura de courage',d:"Vous et vos alliés dans l'aura êtes immunisés contre l'état Effrayé."},
  {lv:11,n:'Frappes radiantes',d:"+1d8 dégâts radiants sur chaque coup au corps à corps ou à mains nues."},
  {lv:14,n:'Toucher réparateur',d:"Imposition des mains peut aussi retirer Assourdi, Aveuglé, Charmé, Effrayé, Étourdi ou Paralysé (5 PV de la réserve par état)."},
  {lv:18,n:'Aura étendue',d:"Votre Aura de protection devient une Émanation de 9 m."}
 ],
 rodeur:[
  {lv:1,n:'Sorts',d:"Incantation avec la Sagesse, avec un focaliseur druidique. Vous préparez vos sorts dans la liste de rôdeur et pouvez en changer un après un repos long."},
  {lv:1,n:'Ennemi juré',d:"Marque du chasseur toujours préparé ; lancers gratuits par repos long selon le niveau (2 au départ, jusqu'à 6)."},
  {lv:1,n:"Bottes d'arme",d:"Vous utilisez la propriété Botte de deux types d'armes maîtrisées, modifiables après un repos long."},
  {lv:2,n:'Fin explorateur',d:"Expertise dans une compétence maîtrisée et deux langues de votre choix."},
  {lv:2,n:'Style de combat',d:"Un don de Style de Combat, ou Combattant druidique : deux sorts mineurs de druide (Sagesse), remplaçables à chaque niveau."},
  {lv:3,n:'Sous-classe de rôdeur',d:"Voir la sous-classe choisie."},
  {lv:5,n:'Attaque supplémentaire',d:"Deux attaques, au lieu d'une, avec l'action Attaque."},
  {lv:6,n:'Arpenteur',d:"Vitesse +3 m sans armure lourde ; Vitesse d'escalade et de nage égales à votre Vitesse."},
  {lv:9,n:'Expertise',d:"Expertise dans deux autres compétences maîtrisées."},
  {lv:10,n:'Infatigable',d:"Action : PV temporaires égaux à 1d8 + Sagesse (minimum 1), Sagesse fois par repos long. Un repos court réduit votre Épuisement de 1."},
  {lv:13,n:'Chasseur implacable',d:"Subir des dégâts ne brise pas votre Concentration sur marque du chasseur."},
  {lv:14,n:'Voile de la nature',d:"Action bonus : vous devenez Invisible jusqu'à la fin de votre prochain tour. Utilisable un nombre de fois égal à votre modificateur de Sagesse (minimum 1) par repos long."},
  {lv:17,n:'Chasseur précis',d:"Vos attaques contre la créature actuellement marquée par votre Marque du chasseur ont l'Avantage."},
  {lv:18,n:'Sens sauvages',d:"Vision aveugle sur 9 m."},
  {lv:20,n:'Tueur implacable',d:"Le dé de dégâts de marque du chasseur passe de d6 à d10."}
 ],
 moine:[
  {lv:1,n:'Arts martiaux',d:"Sans armure ni bouclier, avec Frappes à mains nues ou armes de moine : une Frappe à mains nues en action bonus, dé d'Arts martiaux (d6 qui progresse), Dextérité possible pour l'attaque et les dégâts."},
  {lv:1,n:'Défense sans armure',d:"Sans armure ni bouclier : CA = 10 + Dextérité + Sagesse."},
  {lv:2,n:'Credo du moine',d:"Points de Credo égaux à votre niveau, récupérés au repos court ou long. Vous connaissez Déluge de coups (1 point : deux Frappes à mains nues), Patience défensive et Porté par le vent (détails dans le Manuel des Joueurs). DD = 8 + Sagesse + maîtrise."},
  {lv:2,n:'Déplacement sans armure',d:"Vitesse +3 m sans armure ni bouclier, bonus croissant avec le niveau (jusqu'à +9 m au niveau 18)."},
  {lv:2,n:'Métabolisme surnaturel',d:"À l'Initiative : récupérez tous vos points de Credo et regagnez des PV égaux à votre niveau + un dé d'Arts martiaux. Une fois par repos long."},
  {lv:3,n:"Déviation d'assaut",d:"Réaction : réduisez de 1d10 + Dextérité + niveau de moine les dégâts d'une attaque qui vous touche (contondants, perforants ou tranchants)."},
  {lv:3,n:'Sous-classe de moine',d:"Voir la sous-classe choisie."},
  {lv:4,n:'Chute ralentie',d:"Réaction : réduisez les dégâts de chute de 5 × votre niveau de moine."},
  {lv:5,n:'Attaque supplémentaire',d:"Deux attaques, au lieu d'une, avec l'action Attaque."},
  {lv:5,n:'Frappe étourdissante',d:"Une fois par tour, sur un coup, 1 point de Credo : jet de Constitution de la cible, qui échoue en étant Étourdie jusqu'au début de votre prochain tour."},
  {lv:6,n:'Frappes renforcées',d:"Vos Frappes à mains nues peuvent infliger des dégâts de Force."},
  {lv:7,n:'Esquive totale',d:"Jet de Dextérité pour moitié de dégâts : aucun dégât en cas de réussite, la moitié en cas d'échec (sauf Incapable d'agir)."},
  {lv:9,n:'Déplacement acrobatique',d:"Sans armure ni bouclier, vous vous déplacez le long de surfaces verticales et sur des liquides sans tomber."},
  {lv:10,n:'Credo accru',d:"Déluge de coups donne trois Frappes au lieu de deux ; Patience défensive et Porté par le vent sont améliorés."},
  {lv:10,n:'Autosubsistance',d:"À la fin de chaque tour, libérez-vous de Charmé, Effrayé ou Empoisonné. Plus d'Épuisement dû à la faim ou à la soif."},
  {lv:13,n:'Parade énergétique',d:"Déviation d'assaut s'applique à tous les types de dégâts."},
  {lv:14,n:'Survivant discipliné',d:"Maîtrise de tous les jets de sauvegarde ; 1 point de Credo pour relancer un jet de sauvegarde raté."},
  {lv:15,n:'Credo parachevé',d:"À l'Initiative, si vous avez moins de 4 points de Credo (et n'utilisez pas Métabolisme surnaturel), vous remontez à 4."},
  {lv:18,n:'Défense supérieure',d:"Début de tour, 3 points de Credo : Résistance à tous les dégâts sauf Force pendant 1 minute."},
  {lv:20,n:'Esprit et corps',d:"Dextérité et Sagesse +4 (maximum 25)."}
 ],
 roublard:[
  {lv:1,n:'Expertise',d:"Expertise dans deux compétences maîtrisées (deux autres au niveau 6)."},
  {lv:1,n:'Attaque sournoise',d:"Une fois par tour, dégâts supplémentaires (1d6, +1d6 tous les deux niveaux) sur un coup d'arme Finesse ou à distance, si vous avez l'Avantage ou si un allié non neutralisé est à 1,50 m de la cible (sans Désavantage). Même type de dégâts que l'arme."},
  {lv:1,n:'Argot des voleurs',d:"Vous maîtrisez l'argot des voleurs, plus une langue supplémentaire de votre choix."},
  {lv:1,n:"Bottes d'arme",d:"Vous utilisez la propriété Botte de deux types d'armes maîtrisées, modifiables après un repos long."},
  {lv:2,n:'Ruse',d:"Action bonus : Pointe, Désengagement ou Furtivité."},
  {lv:3,n:'Sous-classe de roublard',d:"Voir la sous-classe choisie."},
  {lv:3,n:'Visée appliquée',d:"Action bonus : Avantage à votre prochaine attaque du tour, si vous ne vous êtes pas déplacé ; votre Vitesse tombe à 0 jusqu'à la fin du tour."},
  {lv:5,n:'Frappe malicieuse',d:"En sacrifiant des dés d'Attaque sournoise, ajoutez un effet (par exemple Poison, coût 1d6 : jet de Constitution de la cible). DD = 8 + Dextérité + maîtrise."},
  {lv:5,n:'Esquive instinctive',d:"Réaction : divisez par deux les dégâts d'une attaque d'un attaquant visible."},
  {lv:7,n:'Esquive totale',d:"Jet de Dextérité pour moitié de dégâts : aucun dégât en cas de réussite, la moitié en cas d'échec (sauf Incapable d'agir)."},
  {lv:7,n:'Savoir-faire',d:"Sur un jet de caractéristique avec une compétence ou un outil maîtrisé, un d20 de 9 ou moins compte pour 10."},
  {lv:11,n:'Frappe malicieuse améliorée',d:"Jusqu'à deux effets de Frappe malicieuse par Attaque sournoise (coûts cumulés)."},
  {lv:14,n:'Coups vicieux',d:"Nouvelles options de Frappe malicieuse, par exemple Assommer (coût 6d6) : jet de Constitution, sinon Inconscient 1 minute."},
  {lv:15,n:'Esprit fuyant',d:"Maîtrise des jets de sauvegarde de Sagesse et de Charisme."},
  {lv:18,n:'Insaisissable',d:"Aucun jet d'attaque n'a l'Avantage contre vous, sauf si vous êtes Incapable d'agir."},
  {lv:20,n:'Coup de chance',d:"Sur un jet de d20 raté, transformez le résultat en 20. Une fois par repos court ou long."}
 ]
});

/* ---------- Sous-classes ---------- */
const MDJ="Voir le Manuel des Joueurs.";
Object.assign(SUBS,{
 magicien:{
  abjurateur:{n:'Abjurateur',ok:true,sp:[[10,['Contresort','Dissipation de la magie']]],f:[
   {lv:3,n:'Abjurateur érudit',d:"Deux sorts d'Abjuration (niveau 2 max) ajoutés gratuitement à votre grimoire, puis un de plus à chaque nouveau niveau d'emplacements."},
   {lv:3,n:'Égide arcanique',d:"Un sort d'Abjuration lancé avec un emplacement crée une égide jusqu'au repos long : PV = 2 × niveau de magicien + Intelligence, elle absorbe vos dégâts. Elle regagne 2 × le niveau de l'emplacement après chaque sort d'Abjuration, ou par action bonus avec un emplacement."},
   {lv:6,n:'Égide projetée',d:"Réaction : votre égide absorbe les dégâts subis par une créature visible à 9 m."},
   {lv:10,n:'Briseur de sorts',d:"Contresort et Dissipation de la magie sont toujours préparés. Vous lancez Dissipation de la magie en action bonus, en ajoutant votre bonus de maîtrise à son jet. Si l'un de ces deux sorts échoue à contrecarrer un sort, l'emplacement utilisé n'est pas dépensé."},
   {lv:14,n:'Résistance aux sorts',d:MDJ}]},
  devin:{n:'Devin',ok:true,f:[
   {lv:3,n:'Devin érudit',d:"Deux sorts de Divination (niveau 2 max) ajoutés gratuitement à votre grimoire, puis un de plus à chaque nouveau niveau d'emplacements."},
   {lv:3,n:'Présage',d:"Après un repos long, lancez deux d20 et notez-les. Vous pouvez remplacer un jet de d20 de votre choix (vous ou une créature visible) par l'un d'eux, avant le jet, une fois par tour ; chaque jet ne sert qu'une fois."},
   {lv:6,n:'Divination experte',d:"Un sort de Divination lancé avec un emplacement de niveau 2 ou plus vous rend un emplacement dépensé de niveau inférieur (5 max)."},
   {lv:10,n:'Troisième Œil',d:"Action bonus, jusqu'au prochain repos : Vision dans le noir 36 m, ou lecture de toute langue, ou détection de l'invisibilité sans emplacement. Une fois par repos court ou long."},
   {lv:14,n:'Présage renforcé',d:MDJ}]},
  evocateur:{n:'Évocateur',ok:true,f:[
   {lv:3,n:'Évocateur érudit',d:"Deux sorts d'Évocation (niveau 2 max) ajoutés gratuitement à votre grimoire, puis un de plus à chaque nouveau niveau d'emplacements."},
   {lv:3,n:'Sort mineur appuyé',d:"Si votre attaque de sort mineur rate ou si la cible réussit son jet, elle subit quand même la moitié des dégâts (sans autre effet)."},
   {lv:6,n:'Façonneur de sorts',d:"Pour un sort d'Évocation, choisissez 1 + niveau du sort créatures visibles : elles réussissent automatiquement leur jet de sauvegarde et ne subissent aucun dégât quand elles en subiraient la moitié."},
   {lv:10,n:'Évocation améliorée',d:"Ajoutez votre modificateur d'Intelligence aux dégâts de vos sorts de magicien d'Évocation."},
   {lv:14,n:'Surcharge magique',d:"Un sort de magicien de niveau 1 à 5 qui inflige des dégâts peut faire le maximum de dégâts. La première fois sans effet néfaste, ensuite 2d12 dégâts nécrotiques par niveau d'emplacement (en augmentation) jusqu'au repos long."}]},
  illusionniste:{n:'Illusionniste',ok:true,sp:[[6,['Convocation de bête','Convocation de fée']]],f:[
   {lv:3,n:'Illusionniste érudit',d:"Deux sorts d'Illusion (niveau 2 max) ajoutés gratuitement à votre grimoire, puis un de plus à chaque nouveau niveau d'emplacements."},
   {lv:3,n:'Illusions améliorées',d:"Vos sorts d'Illusion se lancent sans composante verbale et gagnent 18 m de portée (s'ils font 3 m ou plus). Vous connaissez illusion mineure sans l'inclure dans vos sorts mineurs ; son son et son image se combinent, en action bonus."},
   {lv:6,n:'Créatures fantasmagoriques',d:"Convocation de bête et convocation de fée toujours préparés ; vous pouvez en faire des sorts d'Illusion lancés sans emplacement (créature à moitié de PV). Une fois par repos long pour chacun."},
   {lv:10,n:'Calque illusoire',d:"Réaction quand une attaque vous touche : un double illusoire la fait rater. Une fois par repos court ou long, ou en dépensant un emplacement de niveau 2 ou plus."},
   {lv:14,n:'Réalité chimérique',d:MDJ}]}
 },
 druide:{
  terre:{n:'Cercle de la Terre',ok:true,
   opts:[{k:'env',l:'Environnement (choisi à chaque repos long)',c:[['aride','Aride'],['polaire','Polaire'],['tempere','Tempéré'],['tropical','Tropical']]}],
   envSp:{
    aride:[[3,['flou','mains brûlantes','trait de feu']],[5,['boule de feu']],[7,['flétrissement']],[9,['mur de pierre']]],
    polaire:[[3,['nappe de brouillard','immobilisation de personne','rayon de givre']],[5,['tempête de neige']],[7,['tempête de grêle']],[9,['cône de froid']]],
    tempere:[[3,['foulée brumeuse','poigne électrique','sommeil']],[5,['éclair']],[7,['liberté de mouvement']],[9,['passage par les arbres']]],
    tropical:[[3,["aspersion d'acide",'rayon empoisonné',"toile d'araignée"]],[5,['nuage nauséabond']],[7,['métamorphose']],[9,["fléau d'insectes"]]]},
   f:[
   {lv:3,n:'Sorts du Cercle de la Terre',d:"Après un repos long, choisissez un environnement (aride, polaire, tempéré ou tropical) : les sorts correspondant à votre niveau sont toujours préparés (voir l'onglet Sorts)."},
   {lv:3,n:'Aval de la terre',d:"Action Magie + Forme sauvage : sphère de 3 m à 18 m. Jet de Constitution (DD de sort) : 2d6 dégâts nécrotiques (moitié si réussi) ; une créature de votre choix récupère 2d6 PV. 3d6 au niveau 10, 4d6 au niveau 14."},
   {lv:6,n:'Ressourcement',d:"Lancez gratuitement un sort préparé de niveau 1+ de votre Cercle, une fois par repos long. Après un repos court, récupérez des emplacements (niveau cumulé ≤ moitié de votre niveau de druide arrondie au supérieur, aucun de niveau 6+)."},
   {lv:10,n:'Protégé de dame nature',d:"Immunité à l'état Empoisonné ; Résistance selon l'environnement : aride = feu, polaire = froid, tempéré = foudre, tropical = poison."},
   {lv:14,n:'Sanctuaire de dame Nature',d:"Action Magie + Forme sauvage : Cube de 4,50 m à 36 m, 1 minute. Abri partiel pour vous et vos alliés, qui gagnent la Résistance de Protégé de dame nature."}]},
  lune:{n:'Cercle de la Lune',ok:true,sp:[[3,['soins','rayon de lune',"poussière d'étoile"]],[5,["invocation d'animaux"]],[7,['fontaine de lune']],[9,['soins de groupe']]],f:[
   {lv:3,n:'Formes du cercle',d:"Sous Forme sauvage : FP max = niveau ÷ 3 (arrondi inférieur) ; CA = 13 + Sagesse si supérieure à celle de la Bête ; PV temporaires = 3 × niveau de druide."},
   {lv:3,n:'Sorts du Cercle de la Lune',d:"Soins, rayon de lune et poussière d'étoile toujours préparés (puis d'autres aux niveaux 5, 7 et 9) ; lançables sous Forme sauvage."},
   {lv:6,n:'Formes du cercle améliorées',d:"Sous Forme sauvage : dégâts normaux ou radiants au choix, et Sagesse ajoutée à vos jets de sauvegarde de Constitution."},
   {lv:10,n:'Foulée sélène',d:"Action bonus : téléportation jusqu'à 9 m et Avantage à la prochaine attaque. Sagesse fois par repos long (récupérable avec un emplacement de niveau 2+)."},
   {lv:14,n:'Forme lunaire',d:MDJ}]},
  mers:{n:'Cercle des Mers',ok:true,sp:[[3,['nappe de brouillard','bourrasque','rayon de givre','vague tonnante']],[5,['éclair','respiration aquatique']],[7,["contrôle de l'eau",'tempête de grêle']],[9,["invocation d'élémentaire",'immobilisation de monstre']]],f:[
   {lv:3,n:'Sorts du Cercle des Mers',d:"Sorts toujours préparés selon votre niveau (voir l'onglet Sorts)."},
   {lv:3,n:'Courroux des mers',d:"Action bonus + Forme sauvage : Émanation de 1,50 m pendant 10 minutes. Chaque tour, en action bonus, une créature de l'Émanation fait un jet de Constitution ou subit des dégâts de froid (Sagesse d6) et est repoussée jusqu'à 4,50 m."},
   {lv:6,n:'Affinité aquatique',d:"L'Émanation du Courroux des mers passe à 3 m ; votre Vitesse de nage égale votre Vitesse."},
   {lv:10,n:'Enfant des tempêtes',d:"Pendant le Courroux des mers : Vitesse de vol égale à votre Vitesse, Résistance au froid, à la foudre et au tonnerre."},
   {lv:14,n:'Offrance océanique',d:MDJ}]}
 },
 paladin:{
  anciens:{n:'Serment des Anciens',ok:true,sp:[[3,['frappe piégeuse','communication avec les animaux']],[5,['foulée brumeuse','rayon de lune']],[9,['croissance végétale',"protection contre l'énergie"]],[13,['tempête de grêle','peau de pierre']],[17,['communion avec la nature','passage par les arbres']]],f:[
   {lv:3,n:'Courroux de la nature',d:"Action Magie + Conduit divin : créatures de votre choix à 4,50 m, jet de Force ou Entravées 1 minute (nouveau jet à chaque fin de tour)."},
   {lv:3,n:'Sorts du Serment des Anciens',d:"Sorts toujours préparés selon votre niveau (voir l'onglet Sorts)."},
   {lv:7,n:'Aura de garde',d:"Vous et vos alliés dans votre aura avez la Résistance aux dégâts nécrotiques, psychiques et radiants."},
   {lv:15,n:'Sentinelle impérissable',d:MDJ},{lv:20,n:'Champion des Anciens',d:MDJ}]},
  devotion:{n:'Serment de Dévotion',ok:true,sp:[[3,['protection contre le mal et le bien','bouclier de la foi']],[5,['aide','zone de vérité']],[9,["lueur d'espoir",'dissipation de la magie']],[13,['liberté de mouvement','gardien de la foi']],[17,['communion','colonne de flamme']]],f:[
   {lv:3,n:'Arme sacrée',d:"Action Attaque + Conduit divin : 10 minutes, ajoutez votre Charisme (minimum +1) aux attaques avec l'arme ; dégâts normaux ou radiants ; lumière vive 6 m puis faible 6 m."},
   {lv:3,n:'Sorts du Serment de Dévotion',d:"Sorts toujours préparés selon votre niveau (voir l'onglet Sorts)."},
   {lv:7,n:'Aura de dévotion',d:"Vous et vos alliés dans votre aura êtes immunisés contre l'état Charmé."},
   {lv:15,n:'Châtiment de protection',d:"Quand vous lancez châtiment divin, vous et vos alliés dans l'aura avez un Abri partiel jusqu'au début de votre tour suivant."},
   {lv:20,n:'Nimbe sacré',d:"Action bonus, 10 minutes, une fois par repos long (ou avec un emplacement de niveau 5) : les ennemis qui débutent leur tour dans l'aura subissent Charisme + maîtrise dégâts radiants. Autres effets : voir le Manuel des Joueurs."}]},
  gloire:{n:'Serment de Gloire',ok:true,sp:[[3,['rayon traçant','héroïsme']],[5,['amélioration de caractéristique','arme magique']],[9,['hâte',"protection contre l'énergie"]],[13,['compulsion','liberté de mouvement']],[17,['mythes et légendes','présence royale de Yolane']]],f:[
   {lv:3,n:"Athlète d'exception",d:"Action bonus + Conduit divin, 1 heure : Avantage en Athlétisme et Acrobaties, sauts allongés de 3 m."},
   {lv:3,n:"Châtiment d'exaltation",d:"Après châtiment divin, Conduit divin : distribuez 2d8 + niveau de paladin PV temporaires entre des créatures à 9 m (vous compris)."},
   {lv:3,n:'Sorts du Serment de Gloire',d:"Sorts toujours préparés selon votre niveau (voir l'onglet Sorts)."},
   {lv:7,n:"Aura d'entrain",d:"Votre Vitesse augmente de 3 m ; un allié qui entre dans l'aura ou y débute son tour gagne +3 m de Vitesse jusqu'à la fin de son prochain tour."},
   {lv:15,n:'Défense glorieuse',d:MDJ},{lv:20,n:'Légende vivante',d:MDJ}]},
  vengeance:{n:'Serment de Vengeance',ok:true,sp:[[3,['imprécation','marque du chasseur']],[5,['immobilisation de personne','foulée brumeuse']],[9,['hâte',"protection contre l'énergie"]],[13,['bannissement','porte dimensionnelle']],[17,['immobilisation de monstre','scrutation']]],f:[
   {lv:3,n:"Vœu d'hostilité",d:"Action Attaque + Conduit divin : vœu contre une créature à 9 m, Avantage à vos attaques contre elle 1 minute ; il passe à une autre créature proche si elle tombe à 0 PV."},
   {lv:3,n:'Sorts du Serment de Vengeance',d:"Sorts toujours préparés selon votre niveau (voir l'onglet Sorts)."},
   {lv:7,n:'Vengeur implacable',d:"Après un coup par attaque d'Opportunité, la Vitesse de la cible tombe à 0 jusqu'à la fin du tour ; vous vous déplacez ensuite de la moitié de votre Vitesse dans la même Réaction."},
   {lv:15,n:'Esprit de la vengeance',d:MDJ},{lv:20,n:'Ange vengeur',d:MDJ}]}
 },
 rodeur:{
  belluaire:{n:'Belluaire',ok:true,f:[
   {lv:3,n:'Compagnon primitif',d:"Vous invoquez une bête primitive (des terres, des mers ou des cieux), alliée qui obéit à vos ordres. Elle agit à votre tour et ne prend que l'action Esquive sauf si vous lui donnez un ordre."},
   {lv:7,n:'Coordination facilitée',d:"Quand vous ordonnez une action à votre compagnon, il peut aussi prendre Pointe, Désengagement, Esquive ou Soutien avec son action bonus. Autres effets : voir le Manuel des Joueurs."},
   {lv:11,n:'Fureur bestiale',d:MDJ},{lv:15,n:'Partage des sorts',d:MDJ}]},
  chasseur:{n:'Chasseur',ok:true,f:[
   {lv:3,n:'Savoir du chasseur',d:"Une créature marquée par votre marque du chasseur : vous connaissez ses Immunités, Résistances et Vulnérabilités."},
   {lv:3,n:'Proie du chasseur',d:"Choix (changeable après un repos court ou long) : Goût du sang (+1d8 dégâts, une fois par tour, si la cible a perdu des PV) ou Briseur de hordes (une fois par tour, une attaque supplémentaire avec la même arme contre une autre créature proche de la cible)."},
   {lv:7,n:'Tactiques défensives',d:"Choix (changeable après un repos court ou long) : Cauchemar de la horde (Désavantage aux attaques d'Opportunité contre vous) ou Défense contre les attaques multiples (voir le Manuel des Joueurs)."},
   {lv:11,n:'Proie du chasseur supérieure',d:"Une fois par tour, les dégâts supplémentaires de marque du chasseur s'appliquent aussi à une autre créature à 9 m de la première."},
   {lv:15,n:'Défense de chasseur supérieure',d:"Réaction quand vous subissez des dégâts : Résistance aux autres dégâts du même type jusqu'à la fin du tour."}]},
  traqueur:{n:'Traqueur des ténèbres',ok:true,initB:'sag',saveExtra:L=>L>=7?['sag']:[],sp:[[3,['déguisement']],[5,['corde enchantée']],[9,['peur']],[13,['invisibilité suprême']],[17,['apparence trompeuse']]],f:[
   {lv:3,n:'Embuscade effrayante',d:"Premier tour de chaque combat : Vitesse +3 m. Une fois par tour (Sagesse fois par repos long), +2d6 dégâts psychiques sur un coup d'arme. Ajoutez votre Sagesse à l'Initiative."},
   {lv:3,n:'Sorts de Traqueur des ténèbres',d:"Sorts toujours préparés selon votre niveau (voir l'onglet Sorts)."},
   {lv:3,n:'Vision ombreuse',d:"Vision dans le noir 18 m (ou +18 m si vous l'aviez) ; vous échappez aux créatures qui utilisent la Vision dans le noir quand vous êtes dans les Ténèbres."},
   {lv:7,n:"Mental d'acier",d:"Maîtrise des jets de sauvegarde de Sagesse (ou d'Intelligence ou de Charisme si vous l'aviez déjà)."},
   {lv:11,n:'Rafale du traqueur',d:MDJ},{lv:15,n:'Esquive des ombres',d:MDJ}]}
 },
 moine:{
  elements:{n:'Credo des Éléments',ok:true,cant:[[3,'Élémentalisme']],f:[
   {lv:3,n:'Lien élémentaire',d:"Début de tour, 1 point de Credo : 10 minutes, allonge +3 m aux Frappes à mains nues ; dégâts d'acide, froid, feu, foudre ou tonnerre au choix, avec un jet de Force pour attirer ou repousser de 3 m."},
   {lv:3,n:'Manipulation des éléments',d:"Vous connaissez le sort mineur élémentalisme (Sagesse)."},
   {lv:6,n:'Décharge élémentaire',d:"Action Magie, 2 points de Credo : sphère de 6 m à 36 m, type de dégâts élémentaire au choix, jet de sauvegarde (détails dans le Manuel des Joueurs)."},
   {lv:11,n:'Excursion élémentaire',d:MDJ},{lv:17,n:'Incarnation élémentaire',d:MDJ}]},
  ombre:{n:"Credo de l'Ombre",ok:true,cant:[[3,'Illusion mineure']],f:[
   {lv:3,n:'Artiste des ombres',d:"1 point de Credo : ténèbres sans composante (vous y voyez, zone déplaçable à 18 m). Vision dans le noir 18 m (ou +18 m). Vous connaissez illusion mineure (Sagesse)."},
   {lv:6,n:"Foulée d'ombre",d:"Dans la Lumière faible ou les Ténèbres : action bonus, téléportation jusqu'à 18 m vers un autre espace sombre, Avantage à votre prochaine attaque au corps à corps."},
   {lv:11,n:"Foulée d'ombre améliorée",d:MDJ},{lv:17,n:"Linceul d'ombre",d:MDJ}]},
  paume:{n:'Credo de la Paume',ok:true,f:[
   {lv:3,n:'Technique de la Paume',d:"Sur un coup de Déluge de coups, un effet au choix : Hésitation (pas d'attaque d'Opportunité), Bourrade (jet de Force ou repoussé de 4,50 m) ou Renversement (jet de Dextérité ou À terre)."},
   {lv:6,n:'Plénitude physique',d:"Action bonus : regagnez un dé d'Arts martiaux + Sagesse (minimum 1) PV, Sagesse fois par repos long."},
   {lv:11,n:'Foulée preste',d:"Vous pouvez enchaîner Porté par le vent juste après avoir utilisé une autre action bonus."},
   {lv:17,n:'Paume vibratoire',d:"Sur une attaque à mains nues, 4 points de Credo : vibrations qui durent autant de jours que votre niveau de moine (détails dans le Manuel des Joueurs)."}]}
 },
 roublard:{
  arnaqueur:{n:'Arnaqueur arcanique',ok:true,third:true,cantN:L=>L>=10?4:3,f:[
   {lv:3,n:'Sorts',d:"Incantation avec l'Intelligence (focaliseur arcanique), liste de magicien : 3 sorts mineurs dont main de mage (4 au niveau 10) et des sorts préparés selon la table de l'onglet Sorts."},
   {lv:3,n:'Passe-passe à distance',d:"Main de mage en action bonus, main invisible, qui peut faire des jets de Dextérité (Escamotage) en action bonus."},
   {lv:9,n:'Embuscade magique',d:"Si vous êtes Invisible quand vous lancez un sort sur une créature, elle a un Désavantage à ses jets de sauvegarde contre ce sort ce tour-là."},
   {lv:13,n:'Omniprésence',d:MDJ},{lv:17,n:'Voleur de sorts',d:MDJ}]},
  assassin:{n:'Assassin',ok:true,f:[
   {lv:3,n:'Assassinat',d:"Avantage à l'Initiative. Premier round : Avantage contre toute créature qui n'a pas joué ; si votre Attaque sournoise touche, dégâts supplémentaires égaux à votre niveau de roublard."},
   {lv:3,n:"Outils d'assassin",d:"Kit de déguisement et kit d'empoisonneur, avec maîtrise."},
   {lv:9,n:'Expertise en infiltration',d:"Imitation parfaite de la voix et de l'écriture après une heure d'étude ; Visée appliquée ne réduit plus votre Vitesse à 0."},
   {lv:13,n:'Armes envenimées',d:MDJ},{lv:17,n:'Coup meurtrier',d:MDJ}]},
  voleur:{n:'Voleur',ok:true,f:[
   {lv:3,n:'Mains lestes',d:"Action bonus : jet d'Escamotage (crocheter, désamorcer un piège avec des outils de voleur, faire les poches) ou action Utilisation/Magie pour un objet."},
   {lv:3,n:"Monte-en-l'air",d:"Vitesse d'escalade égale à votre Vitesse ; distance de saut calculée avec la Dextérité."},
   {lv:9,n:'Furtivité suprême',d:"Option de Frappe malicieuse Attaque furtive (coût 1d6) : l'attaque ne met pas fin à l'état Invisible acquis par Furtivité si vous finissez le tour derrière un Abri important ou total."},
   {lv:13,n:"Utilisation d'objets magiques",d:"Pour une propriété qui dépense des charges, 1d6 : sur 6, aucune charge dépensée. Autres avantages : voir le Manuel des Joueurs."},
   {lv:17,n:'Réflexes de voleur',d:"Deux tours au premier round de chaque combat : à votre Initiative et à Initiative − 10."}]}
 }
});

/* Sous-classes du Manuel des Joueurs dont le détail n'est pas encore saisi : affichées « bientôt » */
Object.assign(SUBS.druide,{astres:{n:'Cercle des Astres',ok:false,f:[]}});
Object.assign(SUBS.rodeur,{feerique:{n:'Vagabond féerique',ok:false,f:[]}});
Object.assign(SUBS.moine,{misericorde:{n:'Credo de la Miséricorde',ok:false,f:[]}});
Object.assign(SUBS.roublard,{ame:{n:'Âme acérée',ok:false,f:[]}});

Object.assign(NS,{CAST,HALF_SLOTS,PREP_MAG,PREP_DEMI,MARTIAL_DIE,MONK_SPEED,mtr});
})();
