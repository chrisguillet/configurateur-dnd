/* Sorts : structures dérivées de la base (spells-db.js), listes par classe, recherche */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const {SPELL_ROWS,SPELL_CLASSES,SPELL_SCHOOLS}=NS;

/* Types de dégâts : même ordre que les bits de spells-db.js (bit 13 = selon l'arme, bit 14 = via une créature) */
const DMG_TYPES=['acide','contondant','feu','force','foudre','froid','nécrotique','perforant','poison','psychique','radiant','tonnerre','tranchant'];

/* Normalisation pour comparer/rechercher : minuscules, sans accents ni ponctuation */
const fold=s=>String(s||'').toLowerCase().replace(/œ/g,'oe').replace(/æ/g,'ae').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

/* Temps d'incantation : code de base + possibilité de rituel */
const TBASE={'action':'a','action bonus':'b','réaction':'r','1 minute':'1m','10 minutes':'10m','1 heure':'1h','8 heures':'8h','12 heures':'12h','24 heures':'24h'};
function parseTime(raw){
  const rit=/rituel/i.test(raw);
  const first=raw.split(/ ou /i)[0].trim().toLowerCase();
  return{t:TBASE[first]||'a',rit,raw:raw.replace('Rituel','rituel')};
}
const fmtRange=r=>r==='Perso'?'Personnelle':r;
function fmtDur(d,conc){
  if(d==='Dissipation')d="Jusqu'à dissipation";
  else if(d==='Dissipation/Déclenchement')d="Jusqu'à dissipation ou déclenchement";
  if(!conc)return d;
  return 'Concentration, '+(/^jusqu/i.test(d)?d.charAt(0).toLowerCase()+d.slice(1):"jusqu'à "+d);
}

const SPELLDB=SPELL_ROWS.map(r=>{
  const[id,nom,vo,lv,sc,inc,rg,du,co,conc,rit,mask,dm]=r;
  const names=nom.split('|');
  return{
    id,n:names[0],alt:names.slice(1),vo,lv,sc,school:SPELL_SCHOOLS[sc],
    time:parseTime(inc),range:fmtRange(rg),dur:fmtDur(du,!!conc),
    comp:co,conc:!!conc,rit:!!rit,mask,
    dmg:dm||0,dtypes:DMG_TYPES.filter((_,i)=>((dm||0)>>i)&1),dweapon:!!((dm||0)&8192),dcreature:!!((dm||0)&16384),
    cls:SPELL_CLASSES.filter((_,i)=>(mask>>i)&1),
    url:'https://www.aidedd.org/spell/fr/'+id,
    key:fold(names.join(' ')+' '+vo)
  };
}).sort((a,b)=>a.lv-b.lv||a.n.localeCompare(b.n,'fr'));

/* Recherche par nom (français, variante ou anglais) */
const BYNAME=new Map();
SPELLDB.forEach(s=>{[s.n,...s.alt].forEach(x=>BYNAME.set(fold(x),s));});

/* Anciens noms utilisés par les premières versions du configurateur → nom actuel.
   Sert à conserver les sorts déjà choisis dans les personnages sauvegardés. */
const ALIASES={};
[['Main du mage','Main de mage'],['Fléau','Imprécation'],['Parler avec les animaux','Communication avec les animaux'],
 ['Rire hideux de Tasha','Fou rire de Tasha'],['Couronne de folie','Couronne du dément'],['Mort simulée','État cadavérique'],
 ['Invisibilité supérieure','Invisibilité suprême'],['Lien planaire','Entrave planaire'],['Restauration supérieure','Restauration suprême'],
 ['Rêve','Songe'],['Savoir légendaire','Mythes et légendes'],['Aspersion acide','Aspersion d\'acide'],['Armure du mage','Armure de mage'],
 ['Retraite rapide','Repli expéditif'],['Protection contre une énergie','Protection contre l\'énergie'],['Nuage mortel','Brume mortelle'],
 ['Glas funèbre','Glas'],['Commande','Injonction'],['Revitalisation','Retour à la vie'],['Guérison de masse','Soins de groupe']
].forEach(([o,n])=>{ALIASES[fold(o)]=n;});

function spellByName(n){
  if(!n)return null;
  const k=fold(n);
  return BYNAME.get(k)||BYNAME.get(fold(ALIASES[k]||''))||null;
}
const canonName=n=>{const s=spellByName(n);return s?s.n:n;};

/* Listes par classe : SPELLS[clé de classe][niveau] = [noms] */
const CLS_KEY={Barde:'barde',Clerc:'clerc',Druide:'druide',Ensorceleur:'ensorceleur',Magicien:'magicien',Occultiste:'occultiste',Paladin:'paladin','Rôdeur':'rodeur'};
const SPELLS={};
Object.values(CLS_KEY).forEach(k=>{SPELLS[k]={};for(let l=0;l<=9;l++)SPELLS[k][l]=[];});
SPELLDB.forEach(s=>s.cls.forEach(c=>SPELLS[CLS_KEY[c]][s.lv].push(s.n)));
/* Le Chevalier occulte (guerrier) puise dans la liste du magicien ; le barbare n'incante pas. */
SPELLS.guerrier=SPELLS.magicien;
SPELLS.roublard=SPELLS.magicien;   /* Arnaqueur arcanique */
SPELLS.barbare={0:[]};
SPELLS.moine={0:[]};

/* Temps d'incantation saisis à la main pour des sorts hors base (code : a, b, r, rit, 1m, 10m, 1h, 8h) */
const TIMES={};

/* Filtre commun au grimoire et à l'onglet Sorts.
   f = {q, lv:[niveaux], school:index|-1, cls:'Magicien'|'', time:''|a|b|r|rit|long, conc:bool, rit:bool,
        dmg:''|'oui'|'non'|<type de dégâts>} */
const LONG=['1m','10m','1h','8h','12h','24h'];
function filterSpells(f,pool){
  const toks=fold(f.q).split(' ').filter(Boolean);
  return(pool||SPELLDB).filter(s=>{
    if(f.lv&&f.lv.length&&!f.lv.includes(s.lv))return false;
    if(f.school>=0&&s.sc!==f.school)return false;
    if(f.cls&&!s.cls.includes(f.cls))return false;
    if(f.conc&&!s.conc)return false;
    if(f.rit&&!s.rit)return false;
    if(f.dmg){
      if(f.dmg==='oui'){if(!s.dmg)return false;}
      else if(f.dmg==='non'){if(s.dmg)return false;}
      else if(!s.dtypes.includes(f.dmg))return false;
    }
    if(f.time){
      if(f.time==='long'){if(!LONG.includes(s.time.t))return false;}
      else if(f.time==='rit'){if(!s.rit)return false;}
      else if(s.time.t!==f.time)return false;
    }
    for(const t of toks)if(!s.key.includes(t))return false;
    return true;
  });
}

Object.assign(NS,{SPELLDB,SPELLS,TIMES,spellByName,canonName,filterSpells,fold,LONG_TIMES:LONG,DMG_TYPES});
})();
