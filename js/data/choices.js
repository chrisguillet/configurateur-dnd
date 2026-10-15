/* Choix du personnage : catalogue de dons, langues, alignements, emplacements de style de combat, PV par niveau.
   Fonctions pures : aucune dépendance à l'état de l'application. */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const {FEAT_ROWS,fold}=NS;
const AB=['for','dex','con','int','sag','cha'];

/* ---------- Dons ---------- */
const FEAT_CATS=["Don d'origine","Don général","Style de combat","Faveur épique"];
const FEATS=FEAT_ROWS.map(r=>{
  const[id,nom,vo,cat,min,pre,rep,mask,kind]=r;const names=nom.split('|');
  return{id,n:names[0],alt:names.slice(1),vo,cat,min,pre,rep:!!rep,ab:AB.filter((_,i)=>(mask>>i)&1),kind,
    url:'https://www.aidedd.org/feat/fr/'+id,key:fold(names.join(' ')+' '+vo)};
});
const FBYNAME=new Map();
FEATS.forEach(f=>[f.n,...f.alt].forEach(x=>FBYNAME.set(fold(x),f)));
/* « Initié à la magie (magicien) » → « Initié à la magie » */
const featBase=n=>String(n||'').replace(/\s*\(.*\)\s*$/,'').trim();
const featByName=n=>n?(FBYNAME.get(fold(n))||FBYNAME.get(fold(featBase(n)))||null):null;
const FEAT_ORIGIN=FEATS.filter(f=>f.cat===0);
const FEAT_GENERAL=FEATS.filter(f=>f.cat===1&&f.kind!=='asi');
const FEAT_STYLES=FEATS.filter(f=>f.cat===2);
const FEAT_EPIC=FEATS.filter(f=>f.cat===3);

/* Caractéristiques que propose le « +1 » d'un don pour un personnage de cette classe */
function featAbOptions(f,cl){
  if(!f)return[];
  if(f.kind==='any'||f.cat===3)return AB.slice();
  if(f.kind==='nosave')return AB.filter(a=>!((cl&&cl.saves)||[]).includes(a));
  return f.ab;
}

/* ---------- Langues (table du Manuel des Joueurs 2024) ---------- */
const LANG_STD=['Draconique','Elfique','Géant','Gnome','Gobelin','Halfelin','Langue des signes','Nain','Orc'];
const LANG_RARE=['Abyssal','Argot des voleurs','Céleste','Commun des profondeurs','Druidique','Infernal','Primordial','Profond','Sylvestre'];
/* Langues acquises d'office et nombre de langues à choisir : le Commun et deux langues courantes, puis les capacités
   de classe : druidique (druide), argot des voleurs et une langue (roublard), deux langues (rôdeur, niveau 2). */
function langInfo(c){
  const fixed=['Commun'];let slots=2;
  if(c.cls==='druide')fixed.push('Druidique');
  if(c.cls==='roublard'){fixed.push('Argot des voleurs');slots+=1;}
  if(c.cls==='rodeur'&&c.level>=2)slots+=2;
  return{fixed,slots};
}

/* ---------- Alignements ---------- */
const ALIGN=[['LB','Loyal bon','Loyale bonne'],['NB','Neutre bon','Neutre bonne'],['CB','Chaotique bon','Chaotique bonne'],
  ['LN','Loyal neutre','Loyale neutre'],['N','Neutre','Neutre'],['CN','Chaotique neutre','Chaotique neutre'],
  ['LM','Loyal mauvais','Loyale mauvaise'],['NM','Neutre mauvais','Neutre mauvaise'],['CM','Chaotique mauvais','Chaotique mauvaise']];
const alignLabel=(id,gender)=>{const a=ALIGN.find(x=>x[0]===id);return a?(gender==='f'?a[2]:a[1]):'';};

/* ---------- Style de combat : nombre de dons à choisir ---------- */
function styleSlots(c){
  const L=c.level;
  if(c.cls==='guerrier')return 1+(c.sub==='champion'&&L>=7?1:0);
  if((c.cls==='paladin'||c.cls==='rodeur')&&L>=2)return 1;
  return 0;
}

/* ---------- Points de vie : valeur fixe par niveau (dé / 2 + 1) ---------- */
const hpFixed=hd=>Math.floor(hd/2)+1;

Object.assign(NS,{FEATS,FEAT_CATS,featBase,featByName,FEAT_ORIGIN,FEAT_GENERAL,FEAT_STYLES,FEAT_EPIC,featAbOptions,
  LANG_STD,LANG_RARE,langInfo,ALIGN,alignLabel,styleSlots,hpFixed});
})();
