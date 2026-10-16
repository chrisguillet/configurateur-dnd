/* Fiches types : une par classe, niveau 1. Caractéristiques du Tableau standard (15, 14, 13, 12, 10, 8) réparties selon la
   caractéristique principale de la classe, bonus d'historique +2/+1, compétences, sorts et équipement du choix A.
   Ce sont des suggestions de départ cohérentes, pas des règles : la copie est entièrement modifiable. */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const T=(cls,o)=>({cls,...o});
const TEMPLATES=[
 T('barbare',{species:'orc',bg:'fermier',ab:{for:15,dex:13,con:14,int:8,sag:12,cha:10},asi:['for','con'],
  cSk:['athletisme','perception'],wm:['hache-a-deux-mains','hachette'],langs:['Orc','Géant'],
  note:'Corps à corps : Force et Constitution. La Rage rend la hache à deux mains redoutable.'}),
 T('barde',{species:'halfelin',bg:'artiste',ab:{cha:15,dex:14,con:13,sag:12,int:10,for:8},asi:['cha','dex'],
  cSk:['persuasion','intuition','tromperie'],tools:['Luth','Flûte','Lyre'],bgTool:'Luth',arm:'armure-de-cuir',langs:['Elfique','Gnome'],
  spells:{c:['Moquerie cruelle','Lumières dansantes'],p:['Soins','Sommeil','Héroïsme','Mot de guérison']},
  note:'Charisme avant tout, Dextérité pour la CA. Moquerie cruelle et soins pour soutenir le groupe.'}),
 T('clerc',{species:'nain',bg:'garde',ab:{sag:15,con:14,for:13,cha:12,dex:10,int:8},asi:['sag','for'],
  cSk:['intuition','religion'],opt:{order:'protecteur'},bgTool:'Jeu des dragons',arm:'chemise-de-maille',shield:true,langs:['Nain','Gobelin'],
  spells:{c:['Flamme sacrée','Assistance','Lumière'],p:['Bénédiction','Soins','Bouclier de la foi','Mot de guérison']},
  note:'Ordre divin protecteur : armures intermédiaires, bouclier et armes de guerre au corps à corps.'}),
 T('druide',{species:'gnome',sp:{lin:'forets',sa:'sag'},bg:'ermite',ab:{sag:15,con:14,dex:13,int:12,for:10,cha:8},asi:['sag','con'],
  cSk:['nature','perception'],opt:{order:'gardien'},arm:'armure-de-cuir',shield:true,langs:['Elfique','Halfelin'],
  spells:{c:['Druidisme','Assistance'],p:['Soins','Enchevêtrement','Baies nourricières','Mot de guérison']},
  note:'Ordre primitif gardien : armes de guerre et armures intermédiaires. Sagesse en priorité.'}),
 T('ensorceleur',{species:'drakeide',sp:{anc:'Rouge'},bg:'voyageur',ab:{cha:15,con:14,dex:13,sag:12,int:10,for:8},asi:['cha','dex'],
  cSk:['persuasion','arcanes'],langs:['Elfique','Nain'],
  spells:{c:['Trait de feu','Rayon de givre','Prestidigitation','Illusion mineure'],p:['Projectile magique','Bouclier']},
  note:'Beaucoup de sorts mineurs, peu de sorts préparés : Charisme pour la puissance, Constitution pour tenir.'}),
 T('guerrier',{species:'goliath',sp:{geant:'collines'},bg:'soldat',ab:{for:15,con:14,dex:13,sag:12,cha:10,int:8},asi:['for','con'],
  cSk:['perception','survie'],fs:['Arme à deux mains'],wm:['epee-a-deux-mains','fleau-d-armes','javeline'],bgTool:'Dés',arm:'cotte-de-maille',langs:['Géant','Nain'],
  note:'Cotte de mailles et épée à deux mains, avec les javelines pour le tir. Trois bottes d\'arme.'}),
 T('magicien',{species:'elfe',sp:{lin:'haut',sense:'perception',sa:'int'},bg:'criminel',ab:{int:15,con:14,dex:13,sag:12,cha:10,for:8},asi:['int','con'],
  cSk:['arcanes','investigation'],langs:['Draconique','Nain'],
  spells:{c:['Trait de feu','Main de mage','Prestidigitation'],p:['Projectile magique','Bouclier','Sommeil','Armure de mage']},
  note:'Intelligence en tête, Constitution pour les PV. Votre grimoire en contient davantage que vos sorts préparés.'}),
 T('moine',{species:'humain',sp:{size:'M',skill:'intuition',feat:'Vigilant'},bg:'marin',ab:{dex:15,sag:14,con:13,for:12,int:10,cha:8},asi:['dex','sag'],
  cSk:['athletisme','discretion'],langs:['Elfique','Halfelin'],
  note:'Dextérité et Sagesse : Arts martiaux, CA sans armure. Pas d\'armure ni de bouclier.'}),
 T('occultiste',{species:'tieffelin',sp:{her:'infernal',sa:'cha'},bg:'marchand',ab:{cha:15,con:14,dex:13,sag:12,int:10,for:8},asi:['cha','con'],
  cSk:['arcanes','intimidation'],arm:'armure-de-cuir',langs:['Draconique','Gobelin'],
  spells:{c:['Décharge occulte','Main de mage'],p:['Maléfice','Armure d\'Agathys']},
  note:'Décharge occulte comme attaque principale, emplacements de pacte qui reviennent au repos court.'}),
 T('paladin',{species:'humain',sp:{size:'M',skill:'perception',feat:'Robuste'},bg:'artiste',ab:{for:15,cha:14,con:13,sag:12,dex:10,int:8},asi:['for','cha'],
  cSk:['athletisme','persuasion'],wm:['epee-longue','javeline'],bgTool:'Flûte',arm:'cotte-de-maille',shield:true,langs:['Elfique','Nain'],
  spells:{c:[],p:['Soins','Châtiment divin']},
  note:'Cotte de mailles, bouclier et épée longue. Force pour frapper, Charisme pour les sorts et l\'aura.'}),
 T('rodeur',{species:'elfe',sp:{lin:'bois',sense:'survie',sa:'sag'},bg:'voyageur',ab:{dex:15,sag:14,con:13,for:12,int:10,cha:8},asi:['dex','sag'],
  cSk:['nature','perception','athletisme'],wm:['arc-long','cimeterre'],arm:'armure-de-cuir-cloute',langs:['Gnome','Nain'],
  spells:{c:[],p:['Marque du chasseur','Soins']},
  note:'Arc long en tir principal, Dextérité et Sagesse. Marque du chasseur pour les dégâts supplémentaires.'}),
 T('roublard',{species:'halfelin',bg:'criminel',ab:{dex:15,con:14,int:13,cha:12,sag:10,for:8},asi:['dex','con'],
  cSk:['acrobaties','investigation','perception','persuasion'],exp:['discretion','escamotage'],wm:['epee-courte','dague'],arm:'armure-de-cuir',langs:['Elfique','Nain','Gnome'],
  note:'Dextérité avant tout. Expertise en Discrétion et Escamotage, Attaque sournoise dès le niveau 1.'})
];
/* personnage complet à partir d'une fiche type : `make` est la fonction blank() de l'application */
function build(t,make,name){
 const c=make();
 c.name=name||'';c.cls=t.cls;c.level=1;c.tl=1;c.species=t.species;c.sp=JSON.parse(JSON.stringify(t.sp||{}));c.bg=t.bg;
 c.base={...t.ab};c.bases.standard={...t.ab};c.method='standard';
 c.bgAsi={mode:'21',p2:t.asi[0],p1:t.asi[1]};
 c.cSk=[...(t.cSk||[])];c.exp=[...(t.exp||[])];c.wm=[...(t.wm||[])];c.fs=[...(t.fs||[])];c.tools=[...(t.tools||[])];
 c.opt={...(t.opt||{})};c.langs=[...(t.langs||[])];c.bgTool=t.bgTool||'';
 c.spells={c:[...((t.spells||{}).c||[])],p:[...((t.spells||{}).p||[])],x:[]};
 if(t.arm)c.arm=t.arm;if(t.shield)c.shield=true;
 return c;
}
NS.TEMPLATES=TEMPLATES;NS.buildTemplate=build;
})();
