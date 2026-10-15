/* Équipement : catalogue unifié (armes, armures, outils, matériel, paquetages) et lecture des équipements de départ.
   Fonctions pures : le catalogue sort des données (weapons-db.js, equipment-db.js), le texte d'un équipement de départ
   (« Armure de cuir, 2 dagues, sac d'érudit… ») devient une liste de lignes, avec les paquetages détaillés objet par objet. */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const {fold,WEAPONS,WEAPON_PRICE,ARMOR_ROWS,TOOL_ROWS,GEAR_ROWS,PACK_ROWS}=NS;

const norm=s=>fold(String(s||'').replace(/[’‘]/g,"'")).split(' ').filter(Boolean).map(w=>w.replace(/[sx]$/,'')).join(' ');
const slug=s=>norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

/* catégories de l'interface : [id, libellé] */
const CATS=[['wpn1','Armes courantes'],['wpn2','Armes de guerre'],['arm-l','Armures légères'],['arm-i','Armures intermédiaires'],['arm-h','Armures lourdes'],['arm-s','Boucliers'],
 ['tool-artisan',"Outils d'artisan"],['tool-musique','Instruments de musique'],['tool-jeu','Jeux'],['tool-autre','Autres outils'],['gear','Matériel d\'aventurier'],['pack','Paquetages']];

const GEAR=[];
WEAPONS.forEach(w=>GEAR.push({id:w.id,n:w.n,cat:w.cat===0?'wpn1':'wpn2',p:WEAPON_PRICE[w.id]||0,w}));
ARMOR_ROWS.forEach(([n,k,p,base,cap,str,stealth])=>GEAR.push({id:slug(n),n,cat:'arm-'+k,p,arm:{kind:k,base,cap,str,stealth:!!stealth}}));
TOOL_ROWS.forEach(([n,k,p])=>GEAR.push({id:slug(n),n,cat:'tool-'+k,p}));
GEAR_ROWS.forEach(([n,p])=>GEAR.push({id:slug(n),n,cat:'gear',p}));
const BYNAME=new Map(),BYID=new Map();
GEAR.forEach(g=>{g.key=norm(g.n);BYNAME.set(g.key,g);BYID.set(g.id,g);});
PACK_ROWS.forEach(([n,p,list])=>{const g={id:slug(n),n,cat:'pack',p,key:norm(n),pack:list};GEAR.push(g);BYNAME.set(g.key,g);BYID.set(g.id,g);});
const gearById=id=>BYID.get(id)||null;
const gearByName=n=>BYNAME.get(norm(n))||null;

/* contenu d'un paquetage : [{item, q}] ; coef = prix du paquetage / somme des prix de ses objets (revente proportionnelle) */
function packContents(g){
  const items=g.pack.map(([n,q])=>({item:gearByName(n),q}));
  const sum=items.reduce((t,x)=>t+(x.item?x.item.p*x.q:0),0);
  return{items,coef:sum?g.p/sum:1};
}

/* choix à faire sur un équipement de départ « au choix » / « identique » */
const GENERIC={artisan:{l:"Outil d'artisan",cats:['tool-artisan']},musique:{l:'Instrument de musique',cats:['tool-musique']},jeu:{l:'Jeu',cats:['tool-jeu']},
  artmus:{l:"Outil d'artisan ou instrument",cats:['tool-artisan','tool-musique']}};
const genVariants=k=>GEAR.filter(g=>GENERIC[k].cats.includes(g.cat));

const ALIAS={'baton':'Bâton de combat','focaliseur druidique (branche de gui)':'Focaliseur druidique (branche de houx)'};
const aliasOf=t=>{const k=norm(t);for(const a in ALIAS)if(norm(a)===k)return gearByName(ALIAS[a]);return null;};

function splitTop(text){
  const out=[];let d=0,cur='';
  for(const ch of String(text||'')){
    if(ch==='(')d++;else if(ch===')')d--;
    if(ch===','&&d===0){out.push(cur);cur='';}else cur+=ch;
  }
  out.push(cur);return out.map(x=>x.trim()).filter(Boolean);
}

/* texte d'équipement -> lignes [{n,q,id|null,gen|null,note,pack|null}] ; les paquetages sont détaillés (pack = nom du paquetage, coef de revente) */
function parseStart(text){
  const rows=[];
  const push=(g,q,note)=>{
    if(g.pack){const pc=packContents(g);pc.items.forEach(x=>{if(x.item)rows.push({n:x.item.n,q:x.q*q,id:x.item.id,pack:g.n,coef:pc.coef,note:''});});}
    else rows.push({n:g.n,q,id:g.id,note:note||''});
  };
  for(let tok of splitTop(text)){
    let q=1;
    const m=/^(\d+)\s+(.+)$/.exec(tok);if(m){q=+m[1];tok=m[2];}else tok=tok.replace(/^(un|une)\s+/i,'');
    let base=tok,par='';
    const pm=/^(.*?)\s*\((.*)\)\s*$/.exec(tok);if(pm){base=pm[1];par=pm[2];}
    let g=aliasOf(tok)||aliasOf(base);
    if(!g&&/^sac d/i.test(base)){g=gearByName(base.replace(/^sac d/i,'Paquetage d'));}
    if(!g&&/^sac de cambrioleur/i.test(base))g=gearByName('Paquetage de cambrioleur');
    if(!g)g=gearByName(tok);
    if(g){push(g,q);continue;}
    g=gearByName(base);
    if(g){
      const nm=/^(\d+)\s+(flasques?|feuilles?)/i.exec(par);
      if(nm){push(g,q*+nm[1]);}else push(g,q,par);
      continue;
    }
    /* munitions : « 20 flèches » = un lot « Flèches (20) » */
    const am=GEAR.find(x=>x.cat==='gear'&&x.key.startsWith(norm(base)+' ')&&/\((\d+)\)$/.test(x.n));
    if(am&&q>1){const sz=+/\((\d+)\)$/.exec(am.n)[1];push(am,Math.max(1,Math.round(q/sz)));continue;}
    /* choix à faire */
    const nb=norm(base);
    let gen=null;
    if(/^outil d artisan ou instrument/.test(nb))gen='artmus';
    else if(/^outil d artisan/.test(nb))gen='artisan';
    else if(/^instrument de musique/.test(nb))gen='musique';
    else if(/^boite de jeu|^jeu$/.test(nb))gen='jeu';
    if(gen){rows.push({n:GENERIC[gen].l,q,id:null,gen,note:''});continue;}
    rows.push({n:tok,q,id:null,note:'',custom:true});
  }
  return rows;
}

/* argent : 1 po = 100 pc */
function fmtMoney(pc){
  pc=Math.round(pc);const neg=pc<0;pc=Math.abs(pc);
  const po=Math.floor(pc/100),pa=Math.floor(pc%100/10),cu=pc%10;
  const t=[];if(po||(!pa&&!cu))t.push(po.toLocaleString('fr-FR')+' po');if(pa)t.push(pa+' pa');if(cu)t.push(cu+' pc');
  return(neg?'−':'')+t.join(' ').replace(/ /g,' ');
}

Object.assign(NS,{GEAR,GEAR_CATS:CATS,gearById,gearByName,packContents,GENERIC,genVariants,parseStart,fmtMoney});
})();
