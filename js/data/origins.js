/* Historiques, espèces et leurs variantes */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const {G}=NS;

const BG={
 acolyte:{n:{m:'Acolyte',f:'Acolyte'},ab:['int','sag','cha'],feat:'Initié à la magie (clerc)',sk:['intuition','religion'],tool:'Matériel de calligraphe',eq:"Matériel de calligraphe, livre (prières), symbole sacré, parchemin (10 feuilles), robe",gold:8},
 artisan:{n:{m:'Artisan',f:'Artisane'},ab:['for','dex','int'],feat:'Façonneur',sk:['investigation','persuasion'],tool:'',toolHint:"Un outil d'artisan au choix",eq:"Outils d'artisan (identiques), 2 sacoches, tenue de voyage",gold:32},
 artiste:{n:{m:'Artiste',f:'Artiste'},ab:['for','dex','cha'],feat:'Musicien',sk:['acrobaties','representation'],tool:'',toolHint:'Un instrument de musique au choix',eq:"Instrument de musique (identique), 2 costumes, miroir, parfum, tenue de voyage",gold:11},
 charlatan:{n:{m:'Charlatan',f:'Charlatane'},ab:['dex','con','cha'],feat:'Doué',sk:['escamotage','tromperie'],tool:'Matériel de contrefaçon',eq:"Matériel de contrefaçon, costume, beaux habits",gold:15},
 criminel:{n:{m:'Criminel',f:'Criminelle'},ab:['dex','con','int'],feat:'Vigilant',sk:['escamotage','discretion'],tool:'Outils de voleur',eq:"2 dagues, outils de voleur, pied-de-biche, 2 sacoches, tenue de voyage",gold:16},
 ermite:{n:{m:'Ermite',f:'Ermite'},ab:['con','sag','cha'],feat:'Guérisseur',sk:['medecine','religion'],tool:"Matériel d'herboriste",eq:"Bâton de combat, matériel d'herboriste, sac de couchage, livre (philosophie), lampe, huile (3 flasques), tenue de voyage",gold:16},
 fermier:{n:{m:'Fermier',f:'Fermière'},ab:['for','con','sag'],feat:'Robuste',sk:['dressage','nature'],tool:'Outils de charpentier',eq:"Serpe, outils de charpentier, trousse de soins, pot en fer, pelle, tenue de voyage",gold:30},
 garde:{n:{m:'Garde',f:'Garde'},ab:['for','int','sag'],feat:'Vigilant',sk:['athletisme','perception'],tool:'',toolHint:'Une boîte de jeux au choix',eq:"Lance, arbalète légère, 20 carreaux, boîte de jeux (identique), lanterne à capote, menottes, carquois, tenue de voyage",gold:12},
 guide:{n:{m:'Guide',f:'Guide'},ab:['dex','con','sag'],feat:'Initié à la magie (druide)',sk:['discretion','survie'],tool:'Outils de cartographe',eq:"Arc court, 20 flèches, outils de cartographe, sac de couchage, carquois, tente, tenue de voyage",gold:3},
 marchand:{n:{m:'Marchand',f:'Marchande'},ab:['con','int','cha'],feat:'Chanceux',sk:['dressage','persuasion'],tool:'Instruments de navigateur',eq:"Instruments de navigateur, 2 sacoches, tenue de voyage",gold:22},
 marin:{n:{m:'Marin',f:'Marine'},ab:['for','dex','sag'],feat:'Bagarreur de tavernes',sk:['acrobaties','perception'],tool:'Instruments de navigateur',eq:"Dague, instruments de navigateur, corde, tenue de voyage",gold:20},
 noble:{n:{m:'Noble',f:'Noble'},ab:['for','int','cha'],feat:'Doué',sk:['histoire','persuasion'],tool:'',toolHint:'Une boîte de jeux au choix',eq:"Boîte de jeux (identique), beaux habits, parfum",gold:29},
 sage:{n:{m:'Sage',f:'Sage'},ab:['con','int','sag'],feat:'Initié à la magie (magicien)',sk:['arcanes','histoire'],tool:'Matériel de calligraphe',eq:"Bâton, matériel de calligraphe, livre (histoire), parchemin (8 feuilles), robe",gold:8},
 scribe:{n:{m:'Scribe',f:'Scribe'},ab:['dex','int','sag'],feat:'Doué',sk:['investigation','perception'],tool:'Matériel de calligraphe',eq:"Matériel de calligraphe, beaux habits, lampe, huile (3 flasques), parchemin (12 feuilles)",gold:23},
 soldat:{n:{m:'Soldat',f:'Soldate'},ab:['for','dex','con'],feat:'Sauvagerie martiale',sk:['athletisme','intimidation'],tool:'',toolHint:'Un jeu au choix',eq:"Lance, arc court, 20 flèches, jeu (identique), trousse de soins, carquois, tenue de voyage",gold:14},
 voyageur:{n:{m:'Voyageur',f:'Voyageuse'},ab:['dex','sag','cha'],feat:'Chanceux',sk:['discretion','intuition'],tool:'Outils de voleur',eq:"2 dagues, outils de voleur, boîte de jeux (au choix), sac de couchage, 2 sacoches, tenue de voyage",gold:16}
};
const ORIGIN_FEATS=['Bagarreur de tavernes','Chanceux','Doué','Façonneur','Guérisseur','Initié à la magie (clerc)','Initié à la magie (druide)','Initié à la magie (magicien)','Musicien','Robuste','Sauvagerie martiale','Vigilant'];

const SPN={
 drakeide:{m:'Drakéide',f:'Drakéide'},elfe:{m:'Elfe',f:'Elfe'},gnome:{m:'Gnome',f:'Gnome'},goliath:{m:'Goliath',f:'Goliath'},
 halfelin:{m:'Halfelin',f:'Halfeline'},humain:{m:'Humain',f:'Humaine'},nain:{m:'Nain',f:'Naine'},orc:{m:'Orc',f:'Orque'},tieffelin:{m:'Tieffelin',f:'Tieffeline'}
};
const DRAGONS={Airain:'feu',Argent:'froid',Blanc:'froid',Bleu:'foudre',Bronze:'foudre',Cuivre:'acide',Noir:'acide',Or:'feu',Rouge:'feu',Vert:'poison'};
const LIN={
 drow:{n:{m:'Drow',f:'Drow'},cant:'Lumières dansantes',l3:'Lueurs féeriques',l5:'Ténèbres',dv:36,t:"Vision dans le noir portée à 36 m ; sort mineur lumières dansantes."},
 haut:{n:{m:'Haut-elfe',f:'Haute-elfe'},cant:'Prestidigitation',l3:'Détection de la magie',l5:'Foulée brumeuse',t:"Sort mineur prestidigitation (remplaçable par un sort mineur de magicien après chaque repos long)."},
 bois:{n:{m:'Elfe des bois',f:'Elfe des bois'},cant:'Druidisme',l3:'Grande foulée',l5:'Passage sans trace',speed:10.5,t:"Vitesse 10,5 m ; sort mineur druidisme."}
};
const GEANT={
 nuages:['Géant des nuages','Saut des nuées : action bonus, téléportation jusqu\'à 9 m.'],
 feu:['Géant du feu','Brûlure ignée : +1d10 dégâts de feu sur une attaque qui touche.'],
 givre:['Géant du givre','Froid mordant : +1d6 dégâts de froid et Vitesse de la cible −3 m.'],
 collines:['Géant des collines','Renversement des coteaux : cible de taille G ou moins À terre.'],
 pierres:['Géant des pierres','Endurance de la pierre : Réaction, réduit les dégâts reçus de 1d12 + Con.'],
 tempetes:['Géant des tempêtes','Tonnerre des cieux : Réaction, 1d8 dégâts de tonnerre à qui vous blesse à 18 m.']
};
const HER={
 abyssal:{n:'Abyssal',res:'poison',cant:'Bouffée de poison',l3:'Rayon empoisonné',l5:'Immobilisation de personne'},
 chtonien:{n:'Chtonien',res:'nécrotique',cant:'Contact glacial',l3:'Simulacre de vie',l5:'Rayon affaiblissant'},
 infernal:{n:'Infernal',res:'feu',cant:'Trait de feu',l3:'Représailles infernales',l5:'Ténèbres'}
};


Object.assign(NS,{BG,ORIGIN_FEATS,SPN,DRAGONS,LIN,GEANT,HER});
})();
