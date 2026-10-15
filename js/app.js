/* Application : état, calculs, rendu, actions */
(function(){
'use strict';
const NS=window.DND;
const {AB,ABN,ABS,SK,SKM,INSTR,SLOTS,OCC_SLOTS,OCC_PREP,RAGES,RAGEDMG,MANIF,PACT,cantN,e,G,mod,sg,uid,setp,clamp,roll4,metaCount,expCount,BARDDIE,CL,CFEAT,ASIFEAT,SUBS,DOMS,DRAC_SPELLS,SED_SPELLS,META,BG,ORIGIN_FEATS,SPN,DRAGONS,LIN,GEANT,HER,SPELLS,TIMES,SPELLDB,spellByName,canonName,filterSpells,fold,LONG_TIMES,V,SPELL_SCHOOLS,CAST,HALF_SLOTS,DMG_TYPES,classIcon,dmgIcon,LOOK,lookDefaults,officialSheet,OFFICIAL_CSS,FEATS,FEAT_CATS,featBase,featByName,FEAT_ORIGIN,FEAT_GENERAL,FEAT_STYLES,FEAT_EPIC,featAbOptions,LANG_STD,LANG_RARE,langInfo,ALIGN,alignLabel,styleSlots,hpFixed,WEAPONS,weaponById,weaponsInText,weaponProf,weaponRow,unarmedRow,cantripRow,MARTIAL_DIE,GEAR,GEAR_CATS,gearById,gearByName,GENERIC,genVariants,parseStart,fmtMoney}=NS;

/* Temps d'incantation : lus dans la base des sorts, ou saisis à la main pour un sort hors base */
const TNAME={a:'Action',b:'Action bonus',r:'Réaction','1m':'1 minute','10m':'10 minutes','1h':'1 heure','8h':'8 heures','12h':'12 heures','24h':'24 heures'};
const TSHORT={b:'bonus',r:'réaction','1m':'1 min','10m':'10 min','1h':'1 h','8h':'8 h','12h':'12 h','24h':'24 h'};
function tinfo(n){
 const s=spellByName(n);if(s)return s.time;
 const k=TIMES[n]||'a';const rit=k==='rit'||k==='1mr';const t=k==='rit'?'a':k==='1mr'?'1m':k;
 return{t,rit,raw:(TNAME[t]||'Action')+(rit?' ou rituel':'')};
}
const tkey=n=>tinfo(n).t;
const ttag=n=>{const i=tinfo(n);return[TSHORT[i.t]||'',i.rit?'rituel':''].filter(Boolean).join(' · ');};
const isLong=n=>LONG_TIMES.includes(tinfo(n).t);
const isRit=n=>tinfo(n).rit;
const ttsh=n=>tinfo(n).raw;
const sfOk=n=>{const f=S.sf;if(!f)return true;if(f==='long')return isLong(n);if(f==='rit')return isRit(n);return tkey(n)===f;};
function timesSummary(c,D){
 const all=[...D.extraCant.map(x=>x.n),...c.spells.c,...c.spells.x.map(s=>s.n),...c.spells.p,...D.always.map(x=>x.n)].filter((n,i,a)=>a.indexOf(n)===i);
 const g=[['Action bonus',n=>tkey(n)==='b'],['Réaction',n=>tkey(n)==='r'],['Rituel possible',isRit],['Incantation longue',isLong]];
 const lines=g.map(([t,f])=>{const l=all.filter(f);return l.length?`<b>${t} :</b> ${l.map(e).join(', ')}`:'';}).filter(Boolean);
 return lines.length?`<p class="small"><b>Temps d'incantation particuliers</b> (tous les autres : action Magie)<br>${lines.join('<br>')}</p>`:'';
}

/* ================== ÉTAT ================== */
const KEY='dnd24-configurateur-v1';
const PAGE=60;
const newG=()=>({q:'',lv:[],sch:-1,cls:'',time:'',conc:false,rit:false,dmg:''});
const S={chars:[],cur:null,tab:'id',view:'edit',del:null,msg:'',sf:'',fmt:'official',g:newG(),glim:PAGE,sq:'',ecat:'wpn1',slv:'',sch:-1,sdm:'',slim:PAGE};
function load(){try{const r=localStorage.getItem(KEY);if(r){const d=JSON.parse(r);S.chars=Array.isArray(d.chars)?d.chars:[];S.cur=d.cur||null;S.fmt=d.fmt==='detail'?'detail':'official';}}catch(x){}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({chars:S.chars,cur:S.cur,fmt:S.fmt}));}catch(x){}}
function blank(){return{id:uid(),name:'',gender:'f',level:1,cls:'ensorceleur',sub:'',species:'',sp:{},bg:'',bgAsi:{mode:'21',p2:'',p1:''},bgTool:'',
 method:'standard',pool:[],asg:{},rr:0,bases:{standard:{for:8,dex:13,con:14,int:10,sag:12,cha:15},pointbuy:{for:8,dex:8,con:8,int:8,sag:8,cha:8}},base:{for:8,dex:13,con:14,int:10,sag:12,cha:15},cSk:[],sSk:[],exp:[],tools:[],meta:[],aff:'',feats:{},epic:'',
 spells:{c:[],p:[],x:[]},eqCls:'A',eqBg:'A',goldAdj:0,inv:'',arm:'none',shield:false,acManual:10,acBonus:0,hpBonus:0,story:'',appearance:'',opt:{},align:'',hpm:'auto',hpr:{},langs:[],langX:'',toolsX:'',eqKeep:{},eqVar:{},buy:[],eqSell:'full',eqv:2,fs:[],xs:{},skd:[],mi:[],gc:[],epicAb:''};}
function C(){return S.chars.find(c=>c.id===S.cur)||null;}
/* ---------- Données de classe : lecture générique ---------- */
const asiOf=c=>(CL[c.cls]&&CL[c.cls].asi)||[4,8,12,16];
const subOf=c=>(SUBS[c.cls]||{})[c.sub];
const profTxt=c=>CL[c.cls].prof+(CL[c.cls].profExtra?CL[c.cls].profExtra(c):'');
/* choix propres à la classe ou à la sous-classe (ordre primitif, environnement…) */
function optsOf(c){const cl=CL[c.cls],sub=subOf(c);return[...(cl.opts||[]),...((sub&&c.level>=3&&sub.opts)||[])];}
/* incantation : emplacements, sorts mineurs et préparés selon le type de lanceur */
function castOf(c){
 const L=c.level,cl=CL[c.cls],cs=CAST[c.cls],sub=subOf(c);
 const r={slots:[],cantN:0,prepN:0,third:false};
 if(!cs)return r;
 if(cs.t==='full'){r.slots=SLOTS[L-1];r.cantN=cl.cant(L);r.prepN=cl.prep(L);}
 else if(cs.t==='half'){r.slots=HALF_SLOTS[L-1];r.cantN=cl.cant(L);r.prepN=cl.prep(L);}
 else if(cs.t==='pact'){const pl=PACT[L-1];const pa=Array(pl[1]).fill(0);pa[pl[1]-1]=pl[0];r.slots=pa;r.cantN=cl.cant(L);r.prepN=cl.prep(L);}
 else if(cs.t==='third'){
  if(L>=3&&((c.cls==='guerrier'&&c.sub==='occulte')||(sub&&sub.third))){r.third=true;r.slots=OCC_SLOTS[L-1];r.prepN=OCC_PREP[L-1];r.cantN=sub&&sub.cantN?sub.cantN(L):(L>=10?3:2);}
 }
 if(cl.cantBonus)r.cantN+=cl.cantBonus(c);
 return r;
}
function expHTML(c,D){
 const cl=CL[c.cls],n=cl.expN?cl.expN(c.level):0;if(!n)return '';
 const list=cl.expOf?D.prof.filter(s=>cl.expOf.includes(s)):D.prof;
 let h=`<h3>Expertise ${count(c.exp.length,n)}</h3><p class="small muted">Double bonus de maîtrise sur ${n} compétence${n>1?'s':''} maîtrisée${n>1?'s':''}${cl.expOf?' parmi : '+cl.expOf.map(SKL).join(', '):''}.</p><div class="pills">`;
 list.forEach(s=>{const on=c.exp.includes(s);h+=pill(on,skp(s),`data-a="tog" data-p="exp" data-v="${s}" data-max="${n}"`,!on&&c.exp.length>=n);});
 return h+`</div>`;
}

/* Dons du personnage : historique, espèce, style de combat, dons de niveau, faveur épique */
function featsOf(c){
 const bg=BG[c.bg],out=[];
 if(bg&&bg.feat)out.push({n:bg.feat,src:'Historique'});
 if(c.species==='humain'&&c.sp&&c.sp.feat)out.push({n:c.sp.feat,src:'Espèce'});
 (c.fs||[]).forEach(n=>out.push({n,src:'Style de combat'}));
 asiOf(c).forEach(lv=>{if(lv<=c.level){const f=c.feats[lv];if(f&&f.k!=='asi'&&f.t)out.push({n:f.t,src:'Niveau '+lv,lv,a:f.a});}});
 if(c.level>=19&&c.epic)out.push({n:c.epic,src:'Niveau 19',a:c.epicAb});
 return out.map(x=>({...x,base:featBase(x.n)}));
}
const hasFeat=(c,base)=>featsOf(c).some(f=>f.base===base);
const nDoue=c=>featsOf(c).filter(f=>f.base==='Doué').length;
/* Initié à la magie : une entrée par exemplaire du don ; la classe est imposée par l'historique (« … (clerc) ») ou à choisir */
const MI_CLS=[['clerc','Clerc'],['druide','Druide'],['magicien','Magicien']];
const miInst=c=>featsOf(c).filter(f=>f.base==='Initié à la magie').map(f=>{const m=f.n.match(/\((clerc|druide|magicien)\)/i);return{src:f.src,fixed:m?m[1].toLowerCase():''};});
/* Combattant béni (paladin) et Combattant druidique (rôdeur) : au lieu d'un don de style, deux sorts mineurs */
const WARRIOR={paladin:['Combattant béni','clerc','cha'],rodeur:['Combattant druidique','druide','sag']};

function norm(c){
 c.sp=c.sp||{};c.bgAsi=c.bgAsi||{mode:'21',p2:'',p1:''};c.base=c.base||{};AB.forEach(a=>{if(!c.base[a])c.base[a]=8;});
 c.feats=c.feats||{};c.spells=c.spells||{c:[],p:[],x:[]};['c','p','x'].forEach(k=>{c.spells[k]=c.spells[k]||[];});
 ['cSk','sSk','exp','tools','meta'].forEach(k=>{c[k]=c[k]||[];});c.opt=c.opt||{};
 if(!['m','f','-'].includes(c.gender))c.gender='f';
 /* Apparence : champ libre. Les anciens choix (cheveux, yeux, teint) sont convertis en texte une seule fois. */
 {const lk=c.look&&typeof c.look==='object'?c.look:{};
  if(typeof c.appearance!=='string')c.appearance=Object.keys(lk).length?lookText({...c,look:lk}):'';
  c.appearance=c.appearance.slice(0,2000);delete c.look;}
 if(!CL[c.cls])c.cls='ensorceleur';
 c.level=clamp(+c.level||1,1,20);
 if(c.sub&&!(SUBS[c.cls]&&SUBS[c.cls][c.sub]&&SUBS[c.cls][c.sub].ok))c.sub='';
 [4,6,8,10,12,14,16].forEach(lv=>{if(!c.feats[lv])c.feats[lv]={k:'asi',m:'2',a:([6,10,14].includes(lv)?'':'cha'),b:'',t:''};});
 const cl=CL[c.cls];
 c.align=ALIGN.some(a=>a[0]===c.align)?c.align:'';
 c.hpm=c.hpm==='roll'?'roll':'auto';
 {const src=c.hpr&&typeof c.hpr==='object'?c.hpr:{},o={};for(let lv=2;lv<=c.level;lv++){const v=Math.floor(+src[lv]);if(v>=1&&v<=cl.hd)o[lv]=v;}c.hpr=o;}
 c.toolsX=String(c.toolsX||'').slice(0,160);
 /* Équipement : lignes de départ gardées ou retirées, objets choisis, achats, taux de revente */
 {const okKey=k=>/^[cb]\d+$/.test(k);
  const keep={},vr={};
  if(c.eqKeep&&typeof c.eqKeep==='object')Object.keys(c.eqKeep).forEach(k=>{const v=Math.floor(+c.eqKeep[k]);if(okKey(k)&&v>=0&&v<1000)keep[k]=v;});
  if(c.eqVar&&typeof c.eqVar==='object')Object.keys(c.eqVar).forEach(k=>{if(okKey(k)&&gearById(c.eqVar[k]))vr[k]=c.eqVar[k];});
  c.eqKeep=keep;c.eqVar=vr;c.eqSell=c.eqSell==='half'?'half':'full';
  c.buy=(Array.isArray(c.buy)?c.buy:[]).map(b=>b=b||{}).map(b=>({id:gearById(b.id)?b.id:'',n:String(b.n||'').slice(0,60),q:clamp(Math.floor(+b.q)||0,0,99),p:Math.max(0,Math.round(+b.p)||0),free:!!b.free})).filter(b=>b.q>0&&(b.id||b.n));
  /* changer de classe, de choix d'équipement ou d'historique repart du nouveau paquet de départ */
  const sc=c.cls+'|'+c.eqCls,sb=c.bg+'|'+c.eqBg;
  const wipe=ch=>{Object.keys(c.eqKeep).forEach(k=>{if(k[0]===ch)delete c.eqKeep[k];});Object.keys(c.eqVar).forEach(k=>{if(k[0]===ch)delete c.eqVar[k];});};
  if(c.eqSigC!==undefined&&c.eqSigC!==sc)wipe('c');
  if(c.eqSigB!==undefined&&c.eqSigB!==sb)wipe('b');
  c.eqSigC=sc;c.eqSigB=sb;
  /* anciens personnages : armes, armure de cuir et bouclier cochés à la main deviennent des objets sans prix */
  if(!c.eqv){
   const give=id=>c.buy.push({id,n:'',q:1,p:0,free:true});
   (Array.isArray(c.wpn)?c.wpn:[]).forEach(id=>{if(weaponById(id)&&!ownedItems(c).some(o=>o.item&&o.item.id===id))give(id);});
   if(c.arm==='cuir'){const L=gearByName('Armure de cuir');c.arm=L.id;if(!ownedItems(c).some(o=>o.item===L))give(L.id);}
   if(c.shield&&!shieldOwned(c))give(gearByName('Bouclier').id);
   c.eqv=2;
  }
  delete c.wpn;delete c.wpnX;
  if(c.arm!=='none'&&c.arm!=='autre'&&!armorOwned(c).some(o=>o.item.id===c.arm))c.arm='none';
  if(c.shield&&!shieldOwned(c))c.shield=false;
 }
 {const li=langInfo(c),all=[...LANG_STD,...LANG_RARE];c.langs=(Array.isArray(c.langs)?c.langs:[]).filter((x,i,a)=>all.includes(x)&&!li.fixed.includes(x)&&a.indexOf(x)===i).slice(0,li.slots);c.langX=String(c.langX||'').slice(0,120);}
 {const n=styleSlots(c),W=WARRIOR[c.cls];
  c.fs=(Array.isArray(c.fs)?c.fs:[]).filter((x,i,a)=>(FEAT_STYLES.some(f=>f.n===x)||(W&&x===W[0]))&&a.indexOf(x)===i).slice(0,n);
  const wc=W&&c.fs.includes(W[0])?W[1]:null;
  c.gc=wc?(Array.isArray(c.gc)?c.gc:[]).filter((s,i,a)=>(SPELLS[wc][0]||[]).includes(s)&&a.indexOf(s)===i).slice(0,2):[];}
 c.epicAb=(c.level>=19&&AB.includes(c.epicAb))?c.epicAb:'';
 asiOf(c).forEach(lv=>{const f=c.feats[lv];if(f&&f.k!=='asi'){const ft=featByName(f.t),o=ft?featAbOptions(ft,cl):[];if(!o.includes(f.a))f.a=(o.length===1)?o[0]:'';}});
 {const base0=[...(BG[c.bg]?BG[c.bg].sk:[])];if(c.species==='humain'&&c.sp.skill)base0.push(c.sp.skill);if(c.species==='elfe'&&c.sp.sense)base0.push(c.sp.sense);
  c.xs=c.xs&&typeof c.xs==='object'?c.xs:{};
  const pk=c.xs.primal;c.xs.primal=(c.cls==='barbare'&&c.level>=3&&(CL.barbare.skills||[]).includes(pk)&&!base0.includes(pk))?pk:'';
  const mk=c.xs.martial,mst=c.cls==='guerrier'&&c.sub==='maitre'&&c.level>=3;
  c.xs.martial=(mst&&(CL.guerrier.skills||[]).includes(mk)&&!base0.includes(mk)&&mk!==c.xs.primal)?mk:'';
  c.xs.tool=mst?String(c.xs.tool||'').slice(0,60):'';
  c.skd=(Array.isArray(c.skd)?c.skd:[]).filter((s,i,a)=>SKM[s]&&a.indexOf(s)===i&&!base0.includes(s)&&s!==c.xs.primal&&s!==c.xs.martial).slice(0,3*nDoue(c));}
 {const inst=miInst(c);c.mi=inst.map((x,i)=>{const o=(Array.isArray(c.mi)&&c.mi[i])||{};const cls=x.fixed||(MI_CLS.some(m=>m[0]===o.cls)?o.cls:'');const Ls=cls?SPELLS[cls]:null;
   return{cls,fixed:!!x.fixed,src:x.src,cant:Ls?(Array.isArray(o.cant)?o.cant:[]).filter((s,j,a)=>(Ls[0]||[]).includes(s)&&a.indexOf(s)===j).slice(0,2):[],
    spl:Ls&&(Ls[1]||[]).includes(o.spl)?o.spl:'',ab:['int','sag','cha'].includes(o.ab)?o.ab:''};});}
 const fixed=fixedSk(c);
 const allowed=cl.skills||SK.map(s=>s[0]);
 c.cSk=c.cSk.filter((s,i,a)=>allowed.includes(s)&&!fixed.includes(s)&&a.indexOf(s)===i).slice(0,cl.pick);
 if(c.cls==='barde'&&c.sub==='savoir'&&c.level>=3){c.sSk=c.sSk.filter((s,i,a)=>!fixed.includes(s)&&!c.cSk.includes(s)&&a.indexOf(s)===i).slice(0,3);}else c.sSk=[];
 const prof=profSk(c);
 {const eN=cl.expN?cl.expN(c.level):0;const pool=cl.expOf?prof.filter(s=>cl.expOf.includes(s)):prof;c.exp=eN?c.exp.filter((s,i,a)=>pool.includes(s)&&a.indexOf(s)===i).slice(0,eN):[];}
 optsOf(c).forEach(o=>{if(!o.c.some(x=>x[0]===c.opt[o.k]))c.opt[o.k]='';});
 c.meta=(c.cls==='ensorceleur')?c.meta.filter((m,i,a)=>META[m]&&a.indexOf(m)===i).slice(0,metaCount(c.level)):[];
 if(!c.bases){const std={for:8,dex:13,con:14,int:10,sag:12,cha:15},pbd={for:8,dex:8,con:8,int:8,sag:8,cha:8};c.bases={standard:c.method==='standard'?{...c.base}:std,pointbuy:c.method==='pointbuy'?{...c.base}:pbd};}
 ['standard','pointbuy'].forEach(k=>{c.bases[k]=c.bases[k]||{};AB.forEach(a=>{if(!c.bases[k][a])c.bases[k][a]=8;});});
 ['c','p'].forEach(k=>{c.spells[k]=c.spells[k].map(canonName).filter((n,i,a)=>a.indexOf(n)===i);});
 (c.spells.x||[]).forEach(q=>{if(q.t&&q.t!=='a')TIMES[q.n]=q.t;});
 c.pool=Array.isArray(c.pool)?c.pool.slice(0,6):[];c.asg=c.asg||{};c.rr=+c.rr||0;
 {const used=[];AB.forEach(a=>{const raw=c.asg[a];const i=(raw===''||raw==null)?-1:+raw;if(i>=0&&i<c.pool.length&&!used.includes(i)){used.push(i);c.asg[a]=i;}else c.asg[a]='';});}
 if(c.method==='standard')c.base={...c.bases.standard};
 else if(c.method==='pointbuy')c.base={...c.bases.pointbuy};
 else{AB.forEach(a=>{c.base[a]=c.asg[a]===''?8:c.pool[c.asg[a]].v;});}
 c.tools=(c.cls==='barde')?c.tools.slice(0,3):[];
 const maxLv=castOf(c).slots.length;
 c.spells.p=c.spells.p.filter(n=>{for(let l=1;l<=maxLv;l++){if((SPELLS[c.cls][l]||[]).includes(n))return true;}return false;});
 c.spells.c=c.spells.c.filter(n=>(SPELLS[c.cls][0]||[]).includes(n));
 if(c.cls!=='ensorceleur'||c.sub!=='draconique'||c.level<6)c.aff=c.aff&&c.sub==='draconique'?c.aff:'';
}
function fixedSk(c){const s=[];const bg=BG[c.bg];if(bg)s.push(...bg.sk);if(c.species==='humain'&&c.sp.skill&&!s.includes(c.sp.skill))s.push(c.sp.skill);if(c.species==='elfe'&&c.sp.sense&&!s.includes(c.sp.sense))s.push(c.sp.sense);[c.xs&&c.xs.primal,c.xs&&c.xs.martial,...(c.skd||[])].forEach(x=>{if(x&&!s.includes(x))s.push(x);});return s;}
function profSk(c){const s=[...fixedSk(c),...c.cSk,...c.sSk];return s.filter((x,i)=>s.indexOf(x)===i);}

/* ================== CALCULS ================== */
function spInfo(c,m,pb){
 const o=c.sp||{};const L=c.level;const r={size:'M',speed:9,dv:0,res:[],tr:[],cant:[],spl:[]};
 switch(c.species){
 case 'drakeide':{const t=DRAGONS[o.anc];r.dv=18;if(t)r.res.push(t);
  const dice=L>=17?4:L>=11?3:L>=5?2:1;
  r.tr.push(`Ascendance draconique : ${o.anc?'dragon '+o.anc.toLowerCase()+' ('+t+')':'dragon à choisir'}.`);
  r.tr.push(`Souffle : remplace une attaque, cône de 4,5 m ou ligne de 9 m, JS de Dex DD ${8+m.con+pb}, ${dice}d10 dégâts ${t||'(type à choisir)'}, ${pb} utilisations par repos long.`);
  r.tr.push(`Résistance aux dégâts ${t||'(type à choisir)'}. Vision dans le noir 18 m.`);
  if(L>=5)r.tr.push("Vol draconique : ailes spectrales 10 min, Vitesse de vol égale à votre Vitesse, une fois par repos long.");break;}
 case 'elfe':{const l=LIN[o.lin];r.dv=18;
  r.tr.push("Ascendance féerique : Avantage aux JS contre l'état Charmé.");
  r.tr.push("Transe : 4 h de méditation consciente suffisent pour un repos long.");
  r.tr.push("Sens aiguisés : maîtrise de "+(o.sense?SKM[o.sense].n:'(compétence à choisir)')+".");
  r.tr.push("Vision dans le noir 18 m.");
  if(l){if(l.dv)r.dv=l.dv;if(l.speed)r.speed=l.speed;r.tr.push("Lignage "+G(l.n,c)+" : "+l.t);r.cant.push(l.cant);
   if(L>=3)r.spl.push({n:l.l3,at:3});if(L>=5)r.spl.push({n:l.l5,at:5});
   r.tr.push("Sorts de lignage (niv. 3 et 5) : toujours préparés, une fois gratuite par repos long ; caractéristique : "+ABN[o.sa||'cha']+".");}
  else r.tr.push("Lignage elfique à choisir.");break;}
 case 'gnome':{r.size='P';r.dv=18;r.tr.push("Ruse gnome : Avantage aux JS d'Intelligence, de Sagesse et de Charisme.");r.tr.push("Vision dans le noir 18 m.");
  if(o.lin==='forets'){r.cant.push('Illusion mineure');r.spl.push({n:'Communication avec les animaux',at:1});r.tr.push("Gnome des forêts : illusion mineure ; communication avec les animaux toujours préparé, "+pb+" fois gratuites par repos long.");}
  else if(o.lin==='roches'){r.cant.push('Réparation','Prestidigitation');r.tr.push("Gnome des roches : réparation et prestidigitation ; 10 min pour créer un petit appareil mécanique (3 maximum).");}
  else r.tr.push("Lignage gnome à choisir.");
  r.tr.push("Caractéristique d'incantation du lignage : "+ABN[o.sa||'cha']+".");break;}
 case 'goliath':{r.speed=10.5;const g=GEANT[o.geant];
  r.tr.push(g?`Ascendance gigante (${g[0]}) : ${g[1]} ${pb} utilisations par repos long.`:"Ascendance gigante à choisir.");
  r.tr.push("Forte carrure : Avantage pour se libérer d'un Agrippement ; compte comme une taille de plus pour la charge.");
  if(L>=5)r.tr.push("Forme de géant : taille G pendant 10 min, Avantage en Force, Vitesse +3 m, une fois par repos long.");break;}
 case 'halfelin':{r.size='P';r.tr.push("Brave : Avantage aux JS contre l'état Effrayé.","Agilité halfeline : traverse la case d'une créature plus grande.","Chance : relance un 1 naturel au d20.","Discrétion naturelle : se cache derrière une créature plus grande.");break;}
 case 'humain':{r.size=o.size==='P'?'P':'M';r.tr.push("Ingénieux : Inspiration héroïque après chaque repos long.","Compétent : une compétence supplémentaire.","Polyvalent : un don d'origine ("+(o.feat||'à choisir')+").");break;}
 case 'nain':{r.dv=36;r.res.push('poison');r.tr.push("Résilience naine : Résistance au poison, Avantage aux JS contre Empoisonné.","Ténacité naine : +1 PV par niveau.","Connaissance de la pierre : Perception des vibrations 18 m (action bonus, "+pb+" fois par repos long).","Vision dans le noir 36 m.");break;}
 case 'orc':{r.dv=36;r.tr.push("Poussée d'adrénaline : action Pointe en action bonus + "+pb+" PV temporaires ("+pb+" fois par repos court ou long).","Acharnement : une fois par repos long, vous remontez à 1 PV au lieu de tomber à 0.","Vision dans le noir 36 m.");break;}
 case 'tieffelin':{r.size=o.size==='P'?'P':'M';r.dv=18;const h=HER[o.her];r.cant.push('Thaumaturgie');
  r.tr.push("Présence d'Outremonde : thaumaturgie. Vision dans le noir 18 m.");
  if(h){r.res.push(h.res);r.cant.push(h.cant);if(L>=3)r.spl.push({n:h.l3,at:3});if(L>=5)r.spl.push({n:h.l5,at:5});
   r.tr.push(`Héritage ${h.n.toLowerCase()} : Résistance ${h.res}, sort mineur ${h.cant.toLowerCase()}, sorts aux niveaux 3 et 5 (toujours préparés, une fois gratuite par repos long). Caractéristique : ${ABN[o.sa||'cha']}.`);}
  else r.tr.push("Héritage fiélon à choisir.");break;}
 }
 return r;
}
/* Effet chiffré ou choix d'un don, en une phrase (ce que l'application applique ou a enregistré) */
function featFx(c,f,m){
 const b=f.base,s=[];
 if(b==='Robuste')s.push('+2 PV par niveau.');
 else if(b==='Vigilant')s.push("Bonus de maîtrise ajouté à l'initiative.");
 else if(b==='Défense')s.push('+1 à la CA en armure.');
 else if(b==='Doué'&&c.skd.length)s.push('Maîtrise : '+c.skd.map(x=>SKM[x].n).join(', ')+'.');
 else if(b==='Initié à la magie'&&m&&m.cls)s.push([...m.cant,m.spl].filter(Boolean).join(', ')+'.');
 else if(WARRIOR[c.cls]&&b===WARRIOR[c.cls][0]&&c.gc.length)s.push(c.gc.join(', ')+'.');
 if(f.a&&ABN[f.a])s.push('+1 en '+ABN[f.a]+(f.src==='Niveau 19'?' (maximum 30)':'')+'.');
 if(b==='Résilient'&&f.a)s.push('Maîtrise du jet de sauvegarde.');
 return s.join(' ');
}

function derive(c){
 const D={};const L=c.level,cl=CL[c.cls],sub=(SUBS[c.cls]||{})[c.sub];
 D.pb=Math.ceil(L/4)+1;
 const ab={};AB.forEach(a=>ab[a]=+c.base[a]||8);D.base={...ab};
 const bg=BG[c.bg];D.bgB={};AB.forEach(a=>D.bgB[a]=0);
 if(bg){if(c.bgAsi.mode==='111')bg.ab.forEach(a=>D.bgB[a]=1);else{if(bg.ab.includes(c.bgAsi.p2))D.bgB[c.bgAsi.p2]+=2;if(bg.ab.includes(c.bgAsi.p1)&&c.bgAsi.p1!==c.bgAsi.p2)D.bgB[c.bgAsi.p1]+=1;}}
 D.ftB={};AB.forEach(a=>D.ftB[a]=0);
 asiOf(c).forEach(lv=>{if(lv<=L){const f=c.feats[lv];if(f&&f.k==='asi'){if(f.m==='2'){if(f.a)D.ftB[f.a]+=2;}else{if(f.a)D.ftB[f.a]+=1;if(f.b&&f.b!==f.a)D.ftB[f.b]+=1;}}else if(f&&f.a){const ft=featByName(f.t);if(ft&&featAbOptions(ft,cl).includes(f.a))D.ftB[f.a]+=1;}}});
 D.ab={};D.mod={};const abb=cl.abBonus?cl.abBonus(L):null;
 AB.forEach(a=>{D.ab[a]=Math.min(20,ab[a]+D.bgB[a]+D.ftB[a]);if(abb&&abb.ab.includes(a))D.ab[a]=Math.min(abb.max,D.ab[a]+abb.n);if(c.epicAb===a)D.ab[a]=Math.min(30,D.ab[a]+1);D.mod[a]=mod(D.ab[a]);});
 D.sp=spInfo(c,D.mod,D.pb);
 D.prof=profSk(c);
 D.skill={};SK.forEach(([id,n,a])=>{const p=D.prof.includes(id),x=c.exp.includes(id);let b=D.mod[a];if(p)b+=D.pb*(x?2:1);else if(c.cls==='barde'&&L>=2)b+=Math.floor(D.pb/2);if(cl.skillB)b+=cl.skillB(c,id,D);D.skill[id]={n,a,p,x,b};});
 const svx=[...(cl.saveExtra?cl.saveExtra(L):[]),...(sub&&sub.saveExtra?sub.saveExtra(L):[]),...asiOf(c).filter(lv=>lv<=L).map(lv=>c.feats[lv]).filter(f=>f&&f.k!=='asi'&&featBase(f.t)==='Résilient'&&f.a).map(f=>f.a)];
 D.save={};AB.forEach(a=>{const p=cl.saves.includes(a)||svx.includes(a);D.save[a]={p,b:D.mod[a]+(p?D.pb:0)};});
 const avg=hpFixed(cl.hd);D.hpAvg=avg;
 D.hpL1=cl.hd+D.mod.con;D.hpLv={};let hp=D.hpL1;
 for(let lv=2;lv<=L;lv++){const r=(c.hpm==='roll'&&c.hpr[lv])?c.hpr[lv]:avg;D.hpLv[lv]=Math.max(1,r+D.mod.con);hp+=D.hpLv[lv];}
 if(c.cls==='ensorceleur'&&c.sub==='draconique'&&L>=3)hp+=L;
 if(c.species==='nain')hp+=L;
 if(hasFeat(c,'Robuste'))hp+=2*L;
 hp+=(+c.hpBonus||0);D.hp=Math.max(hp,L);
 let ac=10+D.mod.dex,note='Sans armure';
 const AR=armorOf(c);
 if(AR){const a=AR.arm;ac=a.base+(a.cap===null?D.mod.dex:a.cap===0?0:Math.min(D.mod.dex,a.cap));note=AR.n;}
 else if(c.arm==='autre'){ac=+c.acManual||10;note='Armure (valeur saisie)';}
 else{
  if(c.cls==='barbare'){const v=10+D.mod.dex+D.mod.con;if(v>ac){ac=v;note='Défense sans armure (10 + Dex + Con)';}}
  if(cl.acUn&&!(cl.acUn.noShield&&c.shield)){const v=10+cl.acUn.ab.reduce((t,a)=>t+D.mod[a],0);if(v>ac){ac=v;note=cl.acUn.note;}}
  if(c.cls==='barde'&&c.sub==='danse'&&!c.shield&&L>=3){const v=10+D.mod.dex+D.mod.cha;if(v>ac){ac=v;note='Pirouettes éblouissantes (10 + Dex + Cha)';}}
  if(c.cls==='ensorceleur'&&c.sub==='draconique'&&L>=3){const v=10+D.mod.dex+D.mod.cha;if(v>ac){ac=v;note='Résistance draconique (10 + Dex + Cha)';}}
 }
 if(wears(c)&&hasFeat(c,'Défense')){ac+=1;note+=' + Défense';}
 if(c.shield)ac+=2;ac+=(+c.acBonus||0);D.ac=ac;D.acNote=note+(c.shield?' + bouclier':'');
 D.speed=D.sp.speed+(cl.speedUn&&!wears(c)&&!c.shield?cl.speedUn(L):0)-(AR&&AR.arm.str&&D.ab.for<AR.arm.str?3:0);D.init=D.mod.dex+(sub&&sub.initB&&L>=3?D.mod[sub.initB]:0)+(hasFeat(c,'Vigilant')?D.pb:0);
 const spA=CAST[c.cls]?CAST[c.cls].a:'cha';D.spA=spA;D.dc=8+D.mod[spA]+D.pb;D.atk=D.mod[spA]+D.pb;
 D.passive=10+D.skill.perception.b;
 const pl=PACT[L-1];const ci=castOf(c);
 D.slots=ci.slots;D.cantN=ci.cantN;D.prepN=ci.prepN;
 D.always=[];D.extraCant=[];
 D.sp.cant.forEach(n=>D.extraCant.push({n,src:'Espèce'}));
 D.sp.spl.forEach(s=>D.always.push({n:s.n,src:'Espèce'}));
 if(c.cls==='ensorceleur'&&c.sub==='draconique')DRAC_SPELLS.forEach(([lv,l])=>{if(L>=lv)l.forEach(n=>D.always.push({n,src:'Sorcellerie draconique'}));});
 if(c.cls==='barde'&&c.sub==='seduction')SED_SPELLS.forEach(([lv,l])=>{if(L>=lv)l.forEach(n=>D.always.push({n,src:'Collège de la Séduction'}));});
 if((c.cls==='clerc'||c.cls==='occultiste')&&DOMS[c.sub])DOMS[c.sub].forEach(([lv,names])=>{if(L>=lv)names.forEach(n=>D.always.push({n,src:'Sous-classe'}));});
 if(c.cls==='barde'&&L>=20)D.always.push({n:'Mot de pouvoir guérisseur',src:'Verbe de la création'},{n:'Mot de pouvoir mortel',src:'Verbe de la création'});
 (cl.always||[]).forEach(([lv,ns,src])=>{if(L>=lv)ns.forEach(n=>D.always.push({n:canonName(n),src}));});
 if(sub){
  (sub.sp||[]).forEach(([lv,ns])=>{if(L>=lv)ns.forEach(n=>D.always.push({n:canonName(n),src:sub.n}));});
  if(sub.envSp&&sub.envSp[c.opt.env])sub.envSp[c.opt.env].forEach(([lv,ns])=>{if(L>=lv)ns.forEach(n=>D.always.push({n:canonName(n),src:sub.n}));});
  (sub.cant||[]).forEach(([lv,n])=>{if(L>=lv)D.extraCant.push({n:canonName(n),src:sub.n});});
 }
 c.mi.forEach(m=>{if(!m.cls)return;const s2='Initié à la magie'+(m.ab?' ('+ABN[m.ab]+')':'');m.cant.forEach(n=>D.extraCant.push({n,src:s2}));if(m.spl)D.always.push({n:m.spl,src:s2});});
 if(WARRIOR[c.cls]&&c.fs.includes(WARRIOR[c.cls][0]))c.gc.forEach(n=>D.extraCant.push({n,src:WARRIOR[c.cls][0]+' ('+ABN[WARRIOR[c.cls][2]]+')'}));
 const xs=c.spells.x||[];
 D.cantUsed=c.spells.c.length+xs.filter(s=>+s.lv===0&&!s.free).length;
 D.prepUsed=c.spells.p.length+xs.filter(s=>+s.lv>0&&!s.free).length;
 D.features=[];
 CFEAT[c.cls].forEach(f=>{if(f.lv<=L)D.features.push({src:G(cl.n,c),n:f.n,d:f.d});if(f.lv===2&&c.cls==='ensorceleur'&&false){}});
 asiOf(c).forEach(lv=>{if(lv<=L){const f=c.feats[lv];D.features.push({src:'Niveau '+lv,n:f.k==='asi'?ASIFEAT.n:(f.t||'Don (à préciser)'),d:f.k==='asi'?(f.m==='2'?`+2 en ${ABN[f.a]||'(à choisir)'}.`:`+1 en ${ABN[f.a]||'?'} et +1 en ${ABN[f.b]||'?'}.`):(f.a&&ABN[f.a]?`+1 en ${ABN[f.a]}.`:'')});}});
 if(L>=19)D.features.push({src:'Niveau 19',n:c.epic||'Faveur épique (à préciser)',d:c.epicAb?`+1 en ${ABN[c.epicAb]} (maximum 30).`:''});
 c.fs.forEach(n=>D.features.push({src:'Style de combat',n,d:''}));
 {let mi=0;D.featList=featsOf(c).map(f=>({n:f.n,src:f.src,d:featFx(c,f,f.base==='Initié à la magie'?c.mi[mi++]:null)}));}
 if(sub)sub.f.forEach(f=>{if(f.lv<=L)D.features.push({src:sub.n,n:f.n,d:f.d});});
 if(c.cls==='ensorceleur'&&c.sub==='draconique'&&L>=6&&c.aff)D.features.push({src:sub.n,n:'Affinité élémentaire : '+c.aff,d:`Résistance aux dégâts ${c.aff}.`});
 c.meta.forEach(m=>D.features.push({src:'Métamagie ('+META[m][0]+' pt'+(META[m][0]>1?'s':'')+')',n:m,d:META[m][1]}));
 D.res=[];
 if(cl.res){D.res.push(...cl.res(L,D,c));}
 else if(c.cls==='barde'){D.res.push(`Inspiration bardique : d${BARDDIE(L)}, ${Math.max(1,D.mod.cha)} utilisation(s)`);}
 else if(c.cls==='guerrier'){D.res.push('Second souffle : '+(L>=10?4:L>=5?3:2)+' utilisations (une au repos court, toutes au repos long)');if(L>=2)D.res.push('Fougue : '+(L>=17?2:1)+' utilisation(s) par repos court ou long');}
 else if(c.cls==='clerc'){if(L>=2)D.res.push('Conduit divin : '+(L>=18?4:L>=6?3:2)+' utilisations (une au repos court, toutes au repos long)');}
 else if(c.cls==='barbare'){D.res.push('Rage : '+RAGES[L-1]+' utilisations (une au repos court, toutes au repos long) · dégâts +'+RAGEDMG(L));}
 else if(c.cls==='occultiste'){D.res.push('Manifestations occultes : '+MANIF[L-1]);D.res.push('Magie de pacte : '+pl[0]+' emplacement(s) de niveau '+pl[1]+' (repos court ou long)');}
 else{D.res.push('Sorcellerie innée : 2 utilisations');if(L>=2)D.res.push(`Points de Sorcellerie : ${L}`);}
 return D;
}

/* ================== RENDU : OUTILS ================== */
/* une compétence s'affiche avec sa caractéristique : « Acrobaties (Dex) » en texte, ou le nom puis la caractéristique en petit dans une pastille */
const SKL=id=>SKM[id].n+' ('+ABS[SKM[id].a]+')';
const skp=id=>[SKM[id].n,ABS[SKM[id].a]];
const pill=(on,label,attrs,dis,title)=>`<button type="button" class="pill${on?' on':''}" aria-pressed="${on?'true':'false'}" ${dis?'disabled':''} ${title?`title="${e(title)}"`:''} ${attrs}>${Array.isArray(label)?e(label[0])+' <small>'+e(label[1])+'</small>':e(label)}</button>`;
function sel(path,opts,cur,o){o=o||{};return `<select data-b="${path}" ${o.num?'data-num':''} aria-label="${e(o.label||'')}">${o.ph!==undefined?`<option value="">${e(o.ph)}</option>`:''}${opts.map(([v,l,dis])=>`<option value="${e(v)}" ${String(v)===String(cur)?'selected':''} ${dis?'disabled':''}>${e(l)}</option>`).join('')}</select>`;}
const field=(label,inner)=>`<label class="field"><span>${e(label)}</span>${inner}</label>`;
const count=(n,max)=>`<span class="count${n>max?' bad':''}">${n}/${max}</span>`;

/* ================== RENDU : ONGLETS ================== */
const TABS=[['id','Identité'],['origin','Origine'],['cls','Classe'],['scores','Scores'],['spells','Sorts'],['equip','Équipement'],['sheet','Fiche']];

function tabId(c){
 return `<h2>Identité</h2>
 ${field('Nom du personnage',`<input type="text" data-live="name" value="${e(c.name)}" placeholder="Ex. Tilla « Patatra »" autocomplete="off">`)}
 <div class="field"><span class="lbl">Sexe (accorde les noms de classe, d'espèce et d'historique ; « - » : formes masculines)</span>
  <div class="seg" role="group" aria-label="Sexe"><button type="button" data-a="gender" data-v="m" aria-pressed="${c.gender==='m'}">Masculin</button><button type="button" data-a="gender" data-v="f" aria-pressed="${c.gender==='f'}">Féminin</button><button type="button" data-a="gender" data-v="-" aria-pressed="${c.gender==='-'}" aria-label="Non précisé (formes masculines)" title="Non précisé : le texte utilise les formes masculines">-</button></div></div>
 ${field('Niveau',sel('level',Array.from({length:20},(_,i)=>[i+1,'Niveau '+(i+1)]),c.level,{num:1,label:'Niveau'}))}
 ${field('Alignement',sel('align',ALIGN.map(a=>[a[0],alignLabel(a[0],c.gender)+' ('+a[0]+')']),c.align,{ph:'Non précisé',label:'Alignement'}))}
 ${field('Apparence',`<textarea data-live="appearance" placeholder="Taille, corpulence, cheveux, yeux, teint, signes distinctifs, tenue…">${e(c.appearance)}</textarea>`)}
 ${field('Historique du personnage',`<textarea data-live="story" placeholder="Passé, caractère, liens, motivations…">${e(c.story)}</textarea>`)}`;
}

function tabOrigin(c,D){
 const o=c.sp;const bg=BG[c.bg];const fixed=fixedSk(c);
 let h=`<h2>Origine</h2><p class="muted">Espèce et historique : ils fixent la Vitesse, les traits, deux compétences, un don et des bonus de caractéristiques.</p>`;
 h+=`<h3>Espèce</h3>`+field('Espèce',sel('species',Object.keys(SPN).map(k=>[k,G(SPN[k],c)]),c.species,{ph:'Choisir une espèce',label:'Espèce'}));
 const sa=()=>field("Caractéristique d'incantation des sorts de l'espèce",sel('sp.sa',[['int','Intelligence'],['sag','Sagesse'],['cha','Charisme']],o.sa||'cha'));
 switch(c.species){
  case 'drakeide':h+=field('Ancêtre draconique',sel('sp.anc',Object.keys(DRAGONS).map(k=>[k,k+' ('+DRAGONS[k]+')']),o.anc,{ph:'Choisir'}));break;
  case 'elfe':h+=field('Lignage elfique',sel('sp.lin',Object.keys(LIN).map(k=>[k,G(LIN[k].n,c)]),o.lin,{ph:'Choisir'}))
     +field('Sens aiguisés (compétence)',sel('sp.sense',['intuition','perception','survie'].map(s=>[s,SKL(s),BG[c.bg]&&BG[c.bg].sk.includes(s)]),o.sense,{ph:'Choisir'}))+sa();break;
  case 'gnome':h+=field('Lignage gnome',sel('sp.lin',[['forets','Gnome des forêts'],['roches','Gnome des roches']],o.lin,{ph:'Choisir'}))+sa();break;
  case 'goliath':h+=field('Ascendance gigante',sel('sp.geant',Object.keys(GEANT).map(k=>[k,GEANT[k][0]]),o.geant,{ph:'Choisir'}));break;
  case 'humain':h+=field('Taille',sel('sp.size',[['M','Moyenne'],['P','Petite']],o.size||'M'))
     +field('Compétent : compétence au choix',sel('sp.skill',SK.map(s=>[s[0],SKL(s[0]),BG[c.bg]&&BG[c.bg].sk.includes(s[0])]),o.skill,{ph:'Choisir'}))
     +field("Polyvalent : don d'origine",sel('sp.feat',ORIGIN_FEATS.map(f=>[f,f]),o.feat,{ph:'Choisir (Doué recommandé)'}));break;
  case 'tieffelin':h+=field('Héritage fiélon',sel('sp.her',Object.keys(HER).map(k=>[k,HER[k].n]),o.her,{ph:'Choisir'}))
     +field('Taille',sel('sp.size',[['M','Moyenne'],['P','Petite']],o.size||'M'))+sa();break;
 }
 if(c.species){h+=`<div class="note"><b>${e(G(SPN[c.species],c))}</b> · Taille ${D.sp.size} · Vitesse ${String(D.sp.speed).replace('.',',')} m${D.sp.dv?` · Vision dans le noir ${D.sp.dv} m`:''}<br>${D.sp.tr.map(e).join('<br>')}</div>`;}
 h+=`<div class="sec"></div><h3>Historique</h3>`+field('Historique',sel('bg',Object.keys(BG).map(k=>[k,G(BG[k].n,c)]),c.bg,{ph:'Choisir un historique',label:'Historique'}));
 if(bg){
  h+=`<div class="note"><b>Don :</b> ${e(bg.feat)}<br><b>Compétences :</b> ${bg.sk.map(SKL).join(', ')}<br><b>Outil :</b> ${e(bg.tool||bg.toolHint)}</div>`;
  if(!bg.tool)h+=field('Outil choisi',`<input type="text" data-live="bgTool" value="${e(c.bgTool)}" placeholder="${e(bg.toolHint)}">`);
  h+=`<div class="field"><span class="lbl">Bonus de caractéristiques (${bg.ab.map(a=>ABN[a]).join(', ')})</span>
   <div class="seg" role="group"><button type="button" data-a="asimode" data-v="21" aria-pressed="${c.bgAsi.mode!=='111'}">+2 et +1</button><button type="button" data-a="asimode" data-v="111" aria-pressed="${c.bgAsi.mode==='111'}">+1 aux trois</button></div></div>`;
  if(c.bgAsi.mode!=='111'){
   h+=`<div class="row">${field('+2 en',sel('bgAsi.p2',bg.ab.map(a=>[a,ABN[a],a===c.bgAsi.p1]),c.bgAsi.p2,{ph:'Choisir'}))}${field('+1 en',sel('bgAsi.p1',bg.ab.map(a=>[a,ABN[a],a===c.bgAsi.p2]),c.bgAsi.p1,{ph:'Choisir'}))}</div>`;
   if(!c.bgAsi.p2||!c.bgAsi.p1)h+=`<div class="note warn">Choisissez la caractéristique à +2 et celle à +1.</div>`;
  }
 }
 return h+featChoices(c)+langBlock(c);
}

/* ---------- Choix : langues, dons, points de vie ---------- */
function langBlock(c){
 const li=langInfo(c);
 const pl=list=>list.map(n=>{const on=c.langs.includes(n);return pill(on,n,`data-a="tog" data-p="langs" data-v="${e(n)}" data-max="${li.slots}"`,li.fixed.includes(n)||(!on&&c.langs.length>=li.slots));}).join('');
 return `<div class="sec"></div><h3>Langues ${count(c.langs.length,li.slots)}</h3>
 <p class="small muted">Connues d'office : ${e(li.fixed.join(', '))}. Choisissez ${li.slots} langue${li.slots>1?'s':''} de plus${c.cls==='rodeur'&&c.level<2?' (deux de plus au niveau 2)':''}. Les langues courantes se choisissent librement ; les langues rares viennent normalement d'une capacité ou de l'accord du MD.</p>
 <span class="lbl">Langues courantes</span><div class="pills">${pl(LANG_STD)}</div>
 <span class="lbl">Langues rares</span><div class="pills">${pl(LANG_RARE)}</div>
 ${field('Autres langues (saisie libre)',`<input type="text" data-live="langX" value="${e(c.langX)}" placeholder="Ex. Aérien (dialecte primordial)" autocomplete="off">`)}`;
}
/* choix qui découlent des dons d'origine : Doué (trois maîtrises), Initié à la magie (sorts) */
function featChoices(c){
 let h='';const prof=profSk(c);const nd=nDoue(c);
 if(nd){const max=3*nd;h+=`<div class="sec"></div><h3>Doué : maîtrises ${count(c.skd.length,max)}</h3><p class="small muted">Trois compétences ou outils par exemplaire du don. Cochez ici les compétences ; les outils se notent dans le champ en dessous.</p><div class="pills">`
  +SK.map(([s])=>{const on=c.skd.includes(s);return pill(on,skp(s),`data-a="tog" data-p="skd" data-v="${s}" data-max="${max}"`,(!on&&prof.includes(s))||(!on&&c.skd.length>=max));}).join('')+`</div>`+field('Outils choisis (le cas échéant)',`<input type="text" data-live="toolsX" value="${e(c.toolsX)}" placeholder="Ex. Outils de voleur" autocomplete="off">`);}
 c.mi.forEach((m,i)=>{
  h+=`<div class="sec"></div><h3>Initié à la magie (${e(m.src.toLowerCase())})</h3>`;
  if(!m.fixed)h+=field('Liste de sorts',sel(`mi.${i}.cls`,MI_CLS,m.cls,{ph:'Choisir'}));
  if(m.cls){const Ls=SPELLS[m.cls];
   h+=`<span class="lbl">Deux sorts mineurs ${count(m.cant.length,2)}</span><div class="pills">${(Ls[0]||[]).map(n=>pill(m.cant.includes(n),n,`data-a="togmi" data-i="${i}" data-k="cant" data-v="${e(n)}"`,!m.cant.includes(n)&&m.cant.length>=2)).join('')}</div>`;
   h+=field('Sort de niveau 1 (toujours préparé)',sel(`mi.${i}.spl`,(Ls[1]||[]).map(n=>[n,n]),m.spl,{ph:'Choisir'}));
   h+=field("Caractéristique d'incantation de ce don",sel(`mi.${i}.ab`,['int','sag','cha'].map(a=>[a,ABN[a]]),m.ab,{ph:'Choisir'}));}
  else h+=`<p class="small muted">Choisissez d'abord la liste de sorts (clerc, druide ou magicien).</p>`;
 });
 return h;
}
/* Points de vie : moyenne (valeur fixe) ou lancers de dés, niveau par niveau */
function hpBlock(c,D){
 const cl=CL[c.cls],L=c.level,hd=cl.hd;
 let h=`<div class="sec"></div><h3>Points de vie</h3><div class="field"><span class="lbl">Évolution à chaque niveau</span><div class="seg" role="group" aria-label="Méthode des points de vie"><button type="button" data-a="hpm" data-v="auto" aria-pressed="${c.hpm!=='roll'}">Moyenne (valeur fixe)</button><button type="button" data-a="hpm" data-v="roll" aria-pressed="${c.hpm==='roll'}">Lancers de dés</button></div></div>`;
 h+=`<p class="small muted">Niveau 1 : dé de vie au maximum (d${hd}) + Constitution = <b>${D.hpL1}</b>. Ensuite, à chaque niveau : ${c.hpm==='roll'?`un d${hd}`:`la valeur fixe de ${D.hpAvg}`} + Constitution, avec un minimum de 1 PV gagné.</p>`;
 if(c.hpm==='roll'&&L>=2){
  h+=`<div class="hpl">`;
  for(let lv=2;lv<=L;lv++){
   h+=`<div class="hpr"><label for="hpr${lv}">Niveau ${lv}</label><input id="hpr${lv}" type="number" inputmode="numeric" min="1" max="${hd}" data-b="hpr.${lv}" data-num value="${c.hpr[lv]||''}" placeholder="d${hd}"><button type="button" class="btn small" data-a="hproll" data-lv="${lv}" aria-label="Lancer le dé de vie du niveau ${lv}">Lancer d${hd}</button><span class="small muted">${c.hpr[lv]?'+'+D.hpLv[lv]+' PV':'moyenne : +'+D.hpLv[lv]}</span></div>`;
  }
  h+=`</div><div class="row" style="margin-top:8px"><button type="button" class="btn small" data-a="hprollall">Lancer les niveaux restants</button><button type="button" class="btn small" data-a="hpclear">Effacer les lancers</button></div>`;
  const miss=[];for(let lv=2;lv<=L;lv++)if(!c.hpr[lv])miss.push(lv);
  if(miss.length)h+=`<div class="note warn">${miss.length} niveau${miss.length>1?'x':''} sans lancer : la valeur fixe est utilisée en attendant.</div>`;
 }
 const base=D.hpL1+Object.values(D.hpLv).reduce((t,x)=>t+x,0),extra=D.hp-base;
 h+=`<p style="margin-top:.6rem"><b>Total : ${D.hp} PV</b>${extra?` <span class="small muted">(dont ${extra>0?'+':''}${extra} d'espèce, de sous-classe, de don ou de bonus divers)</span>`:''}</p>`;
 return h;
}
/* Style de combat (guerrier, paladin, rôdeur) */
function styleBlock(c){
 const n=styleSlots(c);if(!n)return '';
 const W=WARRIOR[c.cls];
 let h=`<div class="sec"></div><h3>Style de combat ${count(c.fs.length,n)}</h3><p class="small muted">Un don de Style de combat${W?`, ou « ${e(W[0])} » (deux sorts mineurs)`:''}. Vous pouvez en changer à chaque niveau de ${e(G(CL[c.cls].n,c).toLowerCase())}.</p>`;
 for(let i=0;i<n;i++){
  const opts=[...FEAT_STYLES.map(f=>[f.n,f.n,c.fs.includes(f.n)&&c.fs[i]!==f.n]),...(W?[[W[0],W[0],c.fs.includes(W[0])&&c.fs[i]!==W[0]]]:[])];
  h+=field(n>1?'Don de Style de combat '+(i+1):'Don de Style de combat',sel('fs.'+i,opts,c.fs[i]||'',{ph:'Choisir',label:'Don de Style de combat'}));
  const ft=featByName(c.fs[i]);if(ft)h+=`<p class="small muted">${e(FEAT_CATS[ft.cat])} · <a href="${e(ft.url)}" target="_blank" rel="noopener">Lire le don sur AideDD</a></p>`;
 }
 if(W&&c.fs.includes(W[0])){
  h+=`<span class="lbl">${e(W[0])} : deux sorts mineurs de ${W[1]} ${count(c.gc.length,2)}</span><div class="pills">${(SPELLS[W[1]][0]||[]).map(s=>pill(c.gc.includes(s),s,`data-a="tog" data-p="gc" data-v="${e(s)}" data-max="2"`,!c.gc.includes(s)&&c.gc.length>=2)).join('')}</div>`;
 }
 return h;
}
/* Savoir primal (barbare, niveau 3) et Disciple martial (Maître de guerre, niveau 3) */
function classChoices(c,D){
 let h=hpBlock(c,D)+styleBlock(c);const prof=profSk(c);
 const skSel=(path,list,cur)=>sel(path,list.map(s=>[s,SKL(s),prof.includes(s)&&cur!==s]),cur,{ph:'Choisir',label:'Compétence'});
 if(c.cls==='barbare'&&c.level>=3)h+=`<div class="sec"></div><h3>Savoir primal</h3><p class="small muted">Une compétence de plus, parmi celles de la liste du barbare.</p>`+field('Compétence',skSel('xs.primal',CL.barbare.skills||[],c.xs.primal));
 if(c.cls==='guerrier'&&c.sub==='maitre'&&c.level>=3)h+=`<div class="sec"></div><h3>Disciple martial</h3><p class="small muted">Un type d'outils d'artisan et une compétence de la liste du guerrier.</p>`+field("Outils d'artisan",`<input type="text" data-live="xs.tool" value="${e(c.xs.tool)}" placeholder="Ex. Outils de forgeron" autocomplete="off">`)+field('Compétence',skSel('xs.martial',CL.guerrier.skills||[],c.xs.martial));
 return h;
}
/* sélecteur de don dans le catalogue (dons de niveau et faveur épique) */
function featSelect(attr,cur,isOther,c){
 const L=c.level,lab={0:"Dons d'origine",1:'Dons généraux',2:'Styles de combat',3:'Faveurs épiques'};
 let o=`<option value="">Choisir un don</option>`;
 [1,0,2,3].forEach(cat=>{o+=`<optgroup label="${lab[cat]}">`+FEATS.filter(f=>f.cat===cat&&f.kind!=='asi').map(f=>{const dis=(f.min>L)||(f.cat===2&&styleSlots(c)===0);return `<option value="${e(f.n)}"${f.n===cur&&!isOther?' selected':''}${dis?' disabled':''}>${e(f.n)}${f.min>L?' (niveau '+f.min+')':''}</option>`;}).join('')+`</optgroup>`;});
 o+=`<option value="__other"${isOther?' selected':''}>Autre don (saisie libre)</option>`;
 return `<select ${attr} aria-label="Don">${o}</select>`;
}
function featDetail(c,name,abPath,abCur,max30){
 const ft=featByName(name);if(!ft)return '';
 const opts=featAbOptions(ft,CL[c.cls]);
 let h='';
 if(opts.length)h+=field(max30?'+1 à une caractéristique (maximum 30)':'+1 en',sel(abPath,opts.map(a=>[a,ABN[a]]),abCur,{ph:max30?'Aucune':'Choisir'}));
 h+=`<p class="small muted">${e(FEAT_CATS[ft.cat])}${ft.pre?' · Prérequis : '+e(ft.pre):''}${ft.rep?' · Répétable':''} · <a href="${e(ft.url)}" target="_blank" rel="noopener">Lire le don sur AideDD</a></p>`;
 return h;
}

function tabCls(c,D){
 const cl=CL[c.cls];const L=c.level;const subs=SUBS[c.cls];const fixed=fixedSk(c);
 let h=`<h2>Classe</h2>`;
 h+=`<span class="lbl">Classe</span><div class="clsgrid" role="group" aria-label="Classe">${Object.keys(CL).sort((a,b)=>G(CL[a].n,c).localeCompare(G(CL[b].n,c),'fr')).map(k=>`<button type="button" class="clsb${c.cls===k?' on':''}" data-a="setcls" data-v="${k}" aria-pressed="${c.cls===k}">${classIcon(k,26)}<span>${e(G(CL[k].n,c))}</span></button>`).join('')}</div>`;
 h+=`<div class="note">Dé de vie d${cl.hd} · Sauvegardes : ${cl.saves.map(a=>ABN[a]).join(' et ')} · ${profTxt(c)}</div>`;
 h+=`<div class="note">Les 12 classes du Manuel des Joueurs 2024 sont disponibles. Certaines sous-classes ne sont pas encore proposées.</div>`;
 if(L<3)h+=`<p class="muted">La sous-classe se choisit au niveau 3 (niveau actuel : ${L}).</p>`;
 else h+=field(c.cls==='clerc'?'Domaine divin':'Sous-classe',sel('sub',Object.keys(subs).map(k=>[k,subs[k].n+(subs[k].ok?'':' (bientôt)'),!subs[k].ok]),c.sub,{ph:'Choisir une sous-classe'}));
 optsOf(c).forEach(o=>{h+=field(o.l,sel('opt.'+o.k,o.c,c.opt[o.k],{ph:'Choisir'}));});
 h+=`<h3>Compétences de classe ${count(c.cSk.length,cl.pick)}</h3><p class="small muted">${cl.skills?cl.pick+' compétences parmi cette liste.':cl.pick+' compétences au choix.'} Les compétences déjà données par l'origine sont grisées.</p><div class="pills">`;
 (cl.skills||SK.map(s=>s[0])).forEach(s=>{const on=c.cSk.includes(s);h+=pill(on,skp(s),`data-a="tog" data-p="cSk" data-v="${s}" data-max="${cl.pick}"`,fixed.includes(s)||(!on&&c.cSk.length>=cl.pick));});
 h+=`</div>`;
 if(c.cls==='barde'){
  h+=`<h3>Instruments de musique ${count(c.tools.length,3)}</h3><div class="pills">`;
  INSTR.forEach(s=>{const on=c.tools.includes(s);h+=pill(on,s,`data-a="tog" data-p="tools" data-v="${e(s)}" data-max="3"`,!on&&c.tools.length>=3);});
  h+=`</div>`;
  h+=expHTML(c,D);
  if(c.sub==='savoir'&&L>=3){
   h+=`<h3>Collège du Savoir : maîtrises supplémentaires ${count(c.sSk.length,3)}</h3><div class="pills">`;
   SK.forEach(([s])=>{const on=c.sSk.includes(s);h+=pill(on,skp(s),`data-a="tog" data-p="sSk" data-v="${s}" data-max="3"`,fixed.includes(s)||c.cSk.includes(s)||(!on&&c.sSk.length>=3));});
   h+=`</div>`;}
 }
 if(c.cls!=='barde')h+=expHTML(c,D);
 if(c.cls==='ensorceleur'){
  const n=metaCount(L);
  if(n){h+=`<h3>Métamagie ${count(c.meta.length,n)}</h3><div class="pills">`;
   Object.keys(META).forEach(m=>{const on=c.meta.includes(m);h+=pill(on,`${m} (${META[m][0]})`,`data-a="tog" data-p="meta" data-v="${e(m)}" data-max="${n}"`,!on&&c.meta.length>=n,META[m][1]);});
   h+=`</div><details><summary>Voir ce que fait chaque option</summary><dl class="feat">${Object.keys(META).map(m=>`<dt>${e(m)} <span class="src">${META[m][0]} point${META[m][0]>1?'s':''}</span></dt><dd>${e(META[m][1])}</dd>`).join('')}</dl></details>`;}
  if(c.sub==='draconique'&&L>=6)h+=field('Affinité élémentaire',sel('aff',['acide','froid','feu','foudre','poison'].map(t=>[t,t]),c.aff,{ph:'Choisir un type de dégâts'}));
 }
 h+=classChoices(c,D);
 const asiLv=asiOf(c).filter(l=>l<=L);
 if(asiLv.length){h+=`<h3>Dons et améliorations</h3>`;
  asiLv.forEach(lv=>{const f=c.feats[lv];
   h+=`<div class="sec"><span class="lbl">Niveau ${lv}</span>
   <div class="seg" role="group"><button type="button" data-a="featk" data-lv="${lv}" data-v="asi" aria-pressed="${f.k==='asi'}">Amélioration de caractéristiques</button><button type="button" data-a="featk" data-lv="${lv}" data-v="other" aria-pressed="${f.k!=='asi'}">Autre don</button></div>`;
   if(f.k==='asi'){
    h+=`<div class="seg" style="margin-top:8px"><button type="button" data-a="featm" data-lv="${lv}" data-v="2" aria-pressed="${f.m==='2'}">+2 à une</button><button type="button" data-a="featm" data-lv="${lv}" data-v="11" aria-pressed="${f.m!=='2'}">+1 à deux</button></div>
    <div class="row">${field(f.m==='2'?'+2 en':'+1 en',sel(`feats.${lv}.a`,AB.map(a=>[a,ABN[a]]),f.a,{ph:'Choisir'}))}${f.m!=='2'?field('+1 en',sel(`feats.${lv}.b`,AB.map(a=>[a,ABN[a],a===f.a]),f.b,{ph:'Choisir'})):''}</div>`;
   }else{
    const other=!!f.o||(f.t&&!featByName(f.t));
    h+=field('Don',featSelect(`data-feat="${lv}"`,f.t,other,c));
    if(other)h+=field('Nom du don',`<input type="text" data-live="feats.${lv}.t" value="${e(f.t)}" placeholder="Nom du don" autocomplete="off">`);
    else h+=featDetail(c,f.t,`feats.${lv}.a`,f.a,false);
   }
   h+=`</div>`;});
 }
 if(L>=19){const other=!!c.epicO||(c.epic&&!featByName(c.epic));h+=`<h3>Faveur épique (niveau 19)</h3>`+field('Don choisi',featSelect('data-feat="epic"',c.epic,other,c));
  if(other)h+=field('Nom du don',`<input type="text" data-live="epic" value="${e(c.epic)}" placeholder="Nom du don" autocomplete="off">`);else h+=featDetail(c,c.epic,'epicAb',c.epicAb,true);}
 return h;
}

function tabScores(c,D){
 let h=`<h2>Caractéristiques</h2>`;
 h+=`<div class="field"><span class="lbl">Méthode</span><div class="seg" role="group"><button type="button" data-a="method" data-v="standard" aria-pressed="${c.method==='standard'}">Tableau</button><button type="button" data-a="method" data-v="pointbuy" aria-pressed="${c.method==='pointbuy'}">Achat</button><button type="button" data-a="method" data-v="free" aria-pressed="${c.method==='free'}">Dés / libre</button></div></div>`;
 h+=`<p class="small muted">Chaque méthode garde ses propres valeurs : changer de méthode ne les efface pas. Seule la méthode sélectionnée compte pour le personnage.</p>`;
 if(c.method==='standard'){
  const vals=[15,14,13,12,10,8];const used=AB.map(a=>c.bases.standard[a]);const ok=[...used].sort((x,y)=>y-x).join()===vals.join();
  h+=`<p class="muted small">Attribuez 15, 14, 13, 12, 10 et 8, une fois chacun.</p>`;
  AB.forEach(a=>{h+=field(ABN[a],sel('bases.standard.'+a,vals.map(v=>[v,v]),c.bases.standard[a],{num:1}));});
  if(!ok)h+=`<div class="note warn">Chaque valeur du tableau doit être utilisée exactement une fois.</div>`;
 }else if(c.method==='pointbuy'){
  const cost={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};const tot=AB.reduce((s,a)=>s+(cost[c.bases.pointbuy[a]]??99),0);
  h+=`<p class="muted small">27 points à répartir, valeurs de 8 à 15. Points dépensés : <b>${tot}</b>/27.</p>`;
  AB.forEach(a=>{h+=`<div class="list-item"><div class="t"><b>${ABN[a]}</b></div><div class="acts"><button class="btn small" data-a="pb" data-ab="${a}" data-d="-1" aria-label="Diminuer ${ABN[a]}">−</button><b style="min-width:2ch;text-align:center">${c.bases.pointbuy[a]}</b><button class="btn small" data-a="pb" data-ab="${a}" data-d="1" aria-label="Augmenter ${ABN[a]}">+</button></div></div>`;});
  if(tot>27)h+=`<div class="note warn">Vous dépassez les 27 points.</div>`;
 }else{
  const n=c.pool.length;
  h+=`<p class="muted small">Lancez 4d6 et gardez les 3 meilleurs dés, six fois. Attribuez ensuite chaque résultat à une caractéristique.</p>`;
  h+=`<div class="row"><button class="btn primary" data-a="rollOne" ${n>=6?'disabled':''}>Lancer 4d6</button><button class="btn" data-a="rollAll" ${n>=6?'disabled':''}>Tout lancer</button><button class="btn" data-a="rollReset" ${n?'':'disabled'}>Recommencer</button></div>`;
  h+=`<p><b>Lancers : ${n}/6</b>${c.rr?` <span class="muted small">· tirage recommencé ${c.rr} fois</span>`:''}</p>`;
  h+=`<div class="dice" aria-label="Résultats des lancers">${Array.from({length:6},(_,k)=>{const q=c.pool[k];return q?`<div><b>${q.v}</b><small>${q.d?q.d.slice(0,3).join(' ')+' <s>'+q.d[3]+'</s>':'saisi'}</small></div>`:`<div class="empty"><b>–</b><small>&nbsp;</small></div>`;}).join('')}</div>`;
  if(n<6){h+=`<div style="margin:.6rem 0"><button type="button" class="btn small" data-a="togMan" aria-expanded="${!!S.manOpen}">${S.manOpen?'Masquer la saisie manuelle':'Saisir un résultat à la main'}</button></div>`;
   if(S.manOpen)h+=`<div class="inline"><input type="number" inputmode="numeric" min="3" max="18" id="mv" placeholder="Résultat de 3 à 18" aria-label="Résultat obtenu avec de vrais dés"><button class="btn primary" data-a="addPool">Ajouter</button></div>`;}
  if(n){h+=`<h3>Attribution</h3>`;
   AB.forEach(a=>{const used=AB.filter(x=>x!==a).map(x=>c.asg[x]).filter(v=>v!==''&&v!=null).map(Number);h+=field(ABN[a],sel('asg.'+a,c.pool.map((q,k)=>[k,q.v+' (lancer '+(k+1)+')',used.includes(k)]),c.asg[a],{ph:'Choisir un résultat'}));});
   if(n<6)h+=`<div class="note warn">Terminez les 6 lancers pour attribuer tous les scores.</div>`;
   else if(AB.some(a=>c.asg[a]===''||c.asg[a]==null))h+=`<div class="note warn">Attribuez chacun des 6 résultats à une caractéristique.</div>`;}
 }
 h+=`<h3>Totaux (méthode : ${({standard:'tableau',pointbuy:'achat de points',free:'dés'})[c.method]})</h3><table class="t"><tr><th>Score</th><th>Base</th><th>Origine</th><th>Dons</th><th>Total</th><th>Mod.</th></tr>`;
 AB.forEach(a=>{h+=`<tr><td>${ABN[a]}</td><td>${D.base[a]}</td><td>${D.bgB[a]?'+'+D.bgB[a]:'–'}</td><td>${D.ftB[a]?'+'+D.ftB[a]:'–'}</td><td><b>${D.ab[a]}</b></td><td><b>${sg(D.mod[a])}</b></td></tr>`;});
 h+=`</table>`;
 if(D.slots.length||(CAST[c.cls]&&CAST[c.cls].t!=='third'&&CAST[c.cls].t!=='none'))h+=`<p class="small muted">Caractéristique d'incantation : ${ABN[D.spA]}.</p>`;
 return h;
}

const TIME_OPTS=[['','Tous'],['a','Action'],['b','Action bonus'],['r','Réaction'],['rit','Rituel'],['long','1 minute ou plus']];
const optList=(opts,cur)=>opts.map(([v,l])=>`<option value="${e(v)}"${String(v)===String(cur)?' selected':''}>${e(l)}</option>`).join('');
const DMG_OPTS=()=>[['','Tous'],['oui','Fait des dégâts'],['non','Sans dégâts'],...DMG_TYPES.map(t=>[t,'Type : '+t])];
const schoolOpts=()=>[[-1,'Toutes'],...SPELL_SCHOOLS.map((n,i)=>[i,n])];

/* Sorts proposés à un personnage : liste de sa classe, jusqu'au niveau de ses emplacements */
function pickPool(c,D){
 const lists=SPELLS[c.cls];const names=new Set();
 for(let l=0;l<=D.slots.length;l++)(lists[l]||[]).forEach(n=>names.add(n));
 return SPELLDB.filter(s=>names.has(s.n));
}
function pickResults(c,D){
 const list=filterSpells({q:S.sq,lv:S.slv===''?[]:[+S.slv],school:S.sch,cls:'',time:S.sf,conc:false,rit:false,dmg:S.sdm},pickPool(c,D));
 const sel=new Set([...c.spells.c,...c.spells.p]);
 return V.results(list,S.slim,s=>V.pickRow(s,sel.has(s.n)),'smore');
}
function fillPick(){const c=C();if(!c)return;const r=document.getElementById('sres');if(r)r.innerHTML=pickResults(c,derive(c));}
const chip=(n,p)=>`<button type="button" class="pill on" data-a="togs" data-p="${p}" data-v="${e(n)}" aria-label="Retirer ${e(n)}">${e(n)} ×</button>`;

const alwaysHTML=D=>(D.extraCant.length||D.always.length)?`<h3>Toujours disponibles</h3><ul class="skl">${[...D.extraCant.map(x=>({n:x.n,s:'mineur · '+x.src})),...D.always.map(x=>({n:x.n,s:x.src}))].map(x=>`<li><span>${e(x.n)} <small class="muted">(${e(x.s)})</small></span><span class="muted">${e(ttsh(x.n))}</span></li>`).join('')}</ul>`:'';

function tabSpells(c,D){
 const cl=CL[c.cls];const maxLv=D.slots.length;
 if(!maxLv){
  const th=Object.values(SUBS[c.cls]||{}).find(x=>x.third)||(c.cls==='guerrier'?SUBS.guerrier.occulte:null);
  return `<h2>Sorts</h2><div class="note">${e(G(cl.n,c))} ne lance pas de sorts${c.cls==='guerrier'?'. Seul le Chevalier occulte en a.':th?'. Seule la sous-classe '+e(th.n)+' en a.':'.'}</div>`+alwaysHTML(D);
 }
 if(S.slv!==''&&+S.slv>maxLv)S.slv='';
 let h=`<h2>Sorts</h2><div class="stat"><div><b>${D.dc}</b><span>DD de sauvegarde</span></div><div><b>${sg(D.atk)}</b><span>Attaque de sort</span></div></div>`;
 h+=`<div class="note">${c.cls==='guerrier'?'Chevalier occulte : vous puisez dans la liste de sorts du magicien. Certains choix sont limités à des écoles précises : vérifiez la description de votre sous-classe.':c.cls==='roublard'?'Arnaqueur arcanique : vous puisez dans la liste de sorts du magicien. Certains choix peuvent être limités à des écoles précises : vérifiez la description de votre sous-classe.':'Liste complète des sorts de votre classe (Manuel des Joueurs 2024), jusqu\'au niveau '+maxLv+'.'+(c.cls==='magicien'?' Cochez ici vos sorts préparés : votre grimoire en contient davantage (six de niveau 1 au départ, deux de plus à chaque niveau).':'')} Touchez « Fiche » pour lire le texte d'un sort sur AideDD.</div>`;
 h+=`<h3>Emplacements de sort</h3>${c.cls==='occultiste'?`<p class="small">${slotsTxt(c,D)}</p>`:''}<table class="t" style="${c.cls==='occultiste'?'display:none':''}"><tr>${D.slots.map((_,i)=>`<th>Niv. ${i+1}</th>`).join('')}</tr><tr>${D.slots.map(n=>`<td><b>${n}</b></td>`).join('')}</tr></table>`;
 h+=alwaysHTML(D);
 const hasCant=D.cantN>0||c.spells.c.length>0;
 if(hasCant){
  h+=`<h3>Sorts mineurs ${count(D.cantUsed,D.cantN)}</h3>`;
  h+=c.spells.c.length?`<div class="chips">${c.spells.c.map(n=>chip(n,'c')).join('')}</div>`:`<p class="muted small">Aucun pour l'instant.</p>`;
 }
 h+=`<h3>Sorts préparés ${count(D.prepUsed,D.prepN)}</h3>`;
 h+=c.spells.p.length?`<div class="chips">${c.spells.p.map(n=>chip(n,'p')).join('')}</div>`:`<p class="muted small">Aucun pour l'instant.</p>`;
 h+=`<div class="sec"></div><h3>Choisir des sorts</h3>`;
 h+=`<label class="field"><span>Rechercher un sort</span><input type="search" id="sq" data-ui="sq" value="${e(S.sq)}" placeholder="Nom en français ou en anglais" autocomplete="off"></label>`;
 h+=`<div class="row"><label class="field"><span>Niveau</span><select data-ui="slv">${optList([['','Tous'],...(hasCant?[['0','Sorts mineurs']]:[]),...Array.from({length:maxLv},(_,i)=>[String(i+1),'Niveau '+(i+1)])],S.slv)}</select></label><label class="field"><span>École</span><select data-ui="sch">${optList(schoolOpts(),S.sch)}</select></label><label class="field"><span>Temps d'incantation</span><select data-ui="sf">${optList(TIME_OPTS,S.sf)}</select></label><label class="field"><span>Dégâts</span><select data-ui="sdm">${optList(DMG_OPTS(),S.sdm)}</select></label></div>`;
 h+=`<p class="small muted">« Rituel » : le sort peut aussi se lancer en 10 minutes de plus, sans emplacement, s'il est préparé.</p>`;
 h+=`<div id="sres">${pickResults(c,D)}</div>`;
 const xs=c.spells.x;
 h+=`<div class="sec"></div><h3>Sorts ajoutés à la main</h3>`;
 if(xs.length){h+=xs.map((s,i)=>`<div class="list-item"><div class="t"><b>${e(s.n)}</b><span class="muted small">${+s.lv===0?'Sort mineur':'Niveau '+s.lv} · ${e(ttsh(s.n))}${s.free?' · toujours préparé (ne compte pas)':''}</span></div><div class="acts"><button class="btn small danger" data-a="delx" data-i="${i}">Retirer</button></div></div>`).join('');}
 else h+=`<p class="muted small">Aucun. Utile pour les sorts de niveau 6 à 9 (Arcanum occulte), les sorts d'autres classes (Secrets magiques, Collège du Savoir, dons d'Initié à la magie) ou un sort particulier.</p>`;
 h+=`<div class="row" style="align-items:end"><label class="field"><span>Nom du sort</span><input type="text" id="xn" autocomplete="off"></label><label class="field"><span>Temps d'incantation</span><select id="xt"><option value="a">Action</option><option value="b">Action bonus</option><option value="r">Réaction</option><option value="rit">Action ou rituel</option><option value="1m">1 minute</option><option value="10m">10 minutes</option><option value="1h">1 heure</option><option value="8h">8 heures</option></select></label><label class="field"><span>Niveau</span><select id="xl">${Array.from({length:10},(_,i)=>`<option value="${i}">${i===0?'Mineur':'Niveau '+i}</option>`).join('')}</select></label></div>
  <label class="small"><input type="checkbox" id="xf"> Toujours préparé (ne compte pas dans la limite)</label><div style="margin-top:8px"><button class="btn" data-a="addx">Ajouter ce sort</button></div>`;
 return h;
}

/* ---------- Armes et attaques ---------- */
/* ---------- Équipement : paquet de départ, revente, achats ---------- */
/* lignes du paquet de départ (classe puis historique), paquetages détaillés objet par objet ; clé stable « c0 », « b3 »… */
function startEntries(c){
 const cl=CL[c.cls],bg=BG[c.bg],out=[];
 const add=(src,pre,text)=>parseStart(text||'').forEach((r,i)=>out.push({...r,src,key:pre+i}));
 if(cl)add('Classe','c',chc(c,cl).items);
 if(bg&&c.eqBg!=='B')add('Historique','b',bg.eq);
 return out;
}
const keepOf=(c,r)=>{const k=c.eqKeep[r.key];return k===undefined?r.q:clamp(k,0,r.q);};
/* objet du catalogue d'une ligne de départ ; pour un choix « au choix / identique » : le choix fait, sinon l'outil de l'historique */
function entryItem(c,r){
 if(r.id)return gearById(r.id);
 if(!r.gen)return null;
 const v=genVariants(r.gen);let it=v.find(x=>x.id===c.eqVar[r.key]);
 if(!it){const bg=BG[c.bg],nm=bg&&(bg.tool||c.bgTool),f=nm&&gearByName(nm);it=f&&v.includes(f)?f:null;}
 return it||null;
}
/* objets possédés : paquet de départ moins ce qui est retiré, plus les achats */
function ownedItems(c){
 const out=[];
 startEntries(c).forEach(r=>{const q=keepOf(c,r);if(q>0){const it=entryItem(c,r);out.push({key:r.key,src:r.src,item:it,n:it?it.n:r.n,q});}});
 c.buy.forEach((b,i)=>{const it=b.id?gearById(b.id):null;out.push({key:'a'+i,src:'Achat',item:it,n:it?it.n:b.n,q:b.q});});
 return out;
}
/* bourse en pièces de cuivre : or de départ + revente des objets retirés − achats + ajustement manuel */
function purse(c){
 const cl=CL[c.cls],bg=BG[c.bg],rate=c.eqSell==='half'?0.5:1;
 const start=((cl?chc(c,cl).gold:0)+(bg?(c.eqBg==='B'?50:bg.gold):0))*100;
 let sales=0,spent=0;
 startEntries(c).forEach(r=>{const it=entryItem(c,r),gone=r.q-keepOf(c,r);if(gone>0&&it)sales+=gone*it.p*(r.coef||1)*rate;});
 c.buy.forEach(b=>{if(!b.free){const it=b.id?gearById(b.id):null;spent+=b.q*(it?it.p:b.p);}});
 sales=Math.round(sales);spent=Math.round(spent);const adj=Math.round((+c.goldAdj||0)*100);
 return{start,sales,spent,adj,total:start+sales-spent+adj};
}
const armorOwned=c=>ownedItems(c).filter(o=>o.item&&o.item.arm&&o.item.arm.kind!=='s');
const shieldOwned=c=>ownedItems(c).some(o=>o.item&&o.item.arm&&o.item.arm.kind==='s');
const armorOf=c=>{const g=c.arm&&c.arm!=='none'&&c.arm!=='autre'?gearById(c.arm):null;return g&&g.arm?g:null;};
const wears=c=>!!c.arm&&c.arm!=='none';
/* armes possédées (équipement, achats) plus celles que le joueur a citées dans ses notes */
function weaponsOf(c){
 const out=[];
 const add=(w,src)=>{if(w&&!out.some(x=>x.w===w))out.push({w,src});};
 ownedItems(c).forEach(o=>{if(o.item&&o.item.w)add(o.item.w,o.src==='Achat'?'acheté':o.src.toLowerCase());});
 weaponsInText(c.inv).forEach(w=>add(w,'notes'));
 return out;
}
function atkCtx(c,D){
 return{mod:D.mod,pb:D.pb,prof:weaponProf(profTxt(c)),styles:featsOf(c).map(f=>f.base).filter(n=>FEAT_STYLES.some(f=>f.n===n)),
  monk:c.cls==='moine'&&!wears(c)&&!c.shield,martialDie:c.cls==='moine'?MARTIAL_DIE(c.level):6,level:c.level};
}
/* lignes du tableau « Armes & sorts mineurs » : armes portées, frappe à mains nues, puis uniquement les sorts mineurs qui font des dégâts */
function attackRows(c,D){
 const ctx=atkCtx(c,D),rows=weaponsOf(c).map(x=>weaponRow(x.w,ctx));
 if(ctx.monk||1+ctx.mod.for>0)rows.push(unarmedRow(ctx));   /* frappe à mains nues : seulement si elle fait des dégâts */
 const abOf={};D.sp.cant.forEach(n=>{abOf[n]=c.sp.sa||'cha';});
 c.mi.forEach(m=>{if(m.cls)m.cant.forEach(n=>{abOf[n]=m.ab||D.spA;});});
 const W=WARRIOR[c.cls];if(W&&c.fs.includes(W[0]))c.gc.forEach(n=>{abOf[n]=W[2];});
 const seen=new Set();
 [...D.extraCant.map(x=>x.n),...c.spells.c,...(c.spells.x||[]).filter(q=>+q.lv===0).map(q=>q.n)].forEach(n=>{
  const s=spellByName(n);if(!s||s.lv!==0||!s.dmg||seen.has(s.id))return;seen.add(s.id);
  rows.push(cantripRow(s,ctx,abOf[s.n]||abOf[n]||D.spA));
 });
 return rows;
}
const armorProf=c=>{const pt=profTxt(c),all=/toutes les armures/i.test(pt);return{l:all||/légères/i.test(pt),i:all||/intermédiaires/i.test(pt),h:all,s:/boucliers?/i.test(pt)};};
function eqStartRow(c,r,rate){
 const it=entryItem(c,r),keep=keepOf(c,r),gone=r.q-keep,unit=it?it.p*(r.coef||1)*rate:0;
 let nm=e(r.n);
 if(r.gen){nm=`<select data-ev="${r.key}" aria-label="${e(GENERIC[r.gen].l)}"><option value="">${e(GENERIC[r.gen].l)} : choisir…</option>${genVariants(r.gen).map(x=>`<option value="${e(x.id)}"${it&&it.id===x.id?' selected':''}>${e(x.n)} (${fmtMoney(x.p)})</option>`).join('')}</select>`;}
 else if(r.note)nm+=` <small class="muted">(${e(r.note)})</small>`;
 const unitTxt=r.custom?'valeur non définie':it?fmtMoney(unit)+(r.q>1?' pièce':''):'';
 const ctl=r.q>1?`<label class="small">Garder <input type="number" inputmode="numeric" min="0" max="${r.q}" data-ek="${r.key}" value="${keep}" aria-label="Quantité gardée de ${e(r.n)}"> sur ${r.q}</label>`
  :`<button type="button" class="btn small${keep?' danger':''}" data-a="eqtog" data-k="${r.key}">${keep?'Retirer':'Remettre'}</button>`;
 return `<li class="${keep===0?'gone':''}"><span class="n">${nm}${r.q>1&&!r.gen?' ×'+r.q:''}${r.gen&&r.q>1?' ×'+r.q:''}</span><span class="muted small">${unitTxt}</span>${ctl}${gone>0&&unit?`<b class="plus">+${fmtMoney(gone*unit)}</b>`:''}</li>`;
}
function tabEquip(c,D){
 const cl=CL[c.cls],bg=BG[c.bg],rate=c.eqSell==='half'?0.5:1,P=purse(c);
 let h=`<h2>Équipement</h2><p class="muted small">On part du paquet de départ de la classe et de l'historique : retirez ce dont vous ne voulez pas pour récupérer son prix, puis dépensez cet argent en achetant autre chose. Les prix viennent des règles 2024 (AideDD).</p>`;
 const ch=chc(c,cl);const opts=[['A',"Choix A : l'équipement"],['B',cl.eqB.items?"Choix B : l'équipement":`Choix B : ${cl.eqB.gold} po`]];if(cl.eqC)opts.push(['C',`Choix C : ${cl.eqC.gold} po`]);
 h+=`<h3>Classe : ${e(G(cl.n,c))}</h3><div class="seg" role="group">${opts.map(([v,l])=>`<button type="button" data-a="eq" data-w="eqCls" data-v="${v}" aria-pressed="${c.eqCls===v||(v==='A'&&c.eqCls!=='B'&&c.eqCls!=='C')}">${l}</button>`).join('')}</div>`;
 h+=`<p class="small">${ch.items?e(ch.items)+' et '+ch.gold+' po.':ch.gold+' po.'}</p>`;
 if(bg){h+=`<h3>Historique : ${e(G(bg.n,c))}</h3><div class="seg" role="group"><button type="button" data-a="eq" data-w="eqBg" data-v="A" aria-pressed="${c.eqBg!=='B'}">Choix A : l'équipement</button><button type="button" data-a="eq" data-w="eqBg" data-v="B" aria-pressed="${c.eqBg==='B'}">Choix B : 50 po</button></div>
  <p class="small">${c.eqBg==='B'?'50 po.':e(bg.eq)+' et '+bg.gold+' po.'}</p>`;}
 else h+=`<p class="muted">Choisissez un historique dans l'onglet Origine pour voir son équipement.</p>`;
 /* bourse */
 h+=`<h3>Bourse</h3><div class="stat"><div><b>${fmtMoney(P.start)}</b><span>de départ</span></div><div><b>${P.sales?'+':''}${fmtMoney(P.sales)}</b><span>objets retirés</span></div><div><b>${P.spent?'−':''}${fmtMoney(P.spent)}</b><span>achats</span></div><div><b>${fmtMoney(P.total)}</b><span>en bourse</span></div></div>`;
 if(P.total<0)h+=`<div class="note">Vous avez dépensé plus que vos pièces : retirez des objets ou ajustez la bourse.</div>`;
 h+=`<div class="field"><span class="lbl">Prix de revente des objets retirés</span><div class="seg" role="group"><button type="button" data-a="eqsell" data-v="full" aria-pressed="${c.eqSell!=='half'}">Prix plein</button><button type="button" data-a="eqsell" data-v="half" aria-pressed="${c.eqSell==='half'}">Moitié du prix</button></div></div>`;
 h+=field("Ajustement d'or (gains, dépenses hors liste) en po",`<input type="number" inputmode="decimal" step="any" data-b="goldAdj" data-num value="${+c.goldAdj||0}">`);
 /* paquet de départ */
 const st=startEntries(c);
 h+=`<h3>Paquet de départ</h3>`;
 if(!st.length)h+=`<p class="muted small">Aucun objet de départ avec ce choix : tout passe par l'achat ci-dessous.</p>`;
 else{
  let lastSrc='',lastPack='';h+=`<ul class="eql">`;
  st.forEach(r=>{
   if(r.src!==lastSrc){h+=`<li class="eqh">${e(r.src)}</li>`;lastSrc=r.src;lastPack='';}
   if((r.pack||'')!==lastPack){lastPack=r.pack||'';if(lastPack)h+=`<li class="eqp"><b>${e(lastPack)}</b> <small class="muted">contenu détaillé, revendu au prorata du prix du paquetage</small></li>`;}
   h+=eqStartRow(c,r,rate);
  });
  h+=`</ul>`;
 }
 /* achats */
 h+=`<h3>Achats et ajouts</h3>`;
 if(c.buy.length)h+=`<ul class="eql">${c.buy.map((b,i)=>{const it=b.id?gearById(b.id):null,unit=it?it.p:b.p;
  return `<li><span class="n">${e(it?it.n:b.n)}</span><span class="muted small">${b.free?'sans coût':fmtMoney(unit)+(b.q>1?' pièce':'')}</span><label class="small">Quantité <input type="number" inputmode="numeric" min="0" max="99" data-bq="${i}" value="${b.q}" aria-label="Quantité de ${e(it?it.n:b.n)}"></label>${b.free?'':`<b class="minus">−${fmtMoney(unit*b.q)}</b>`}<button type="button" class="btn small danger" data-a="buydel" data-i="${i}" aria-label="Retirer ${e(it?it.n:b.n)}">Retirer</button></li>`;}).join('')}</ul>`;
 else h+=`<p class="muted small">Rien d'acheté pour l'instant.</p>`;
 const cat=GEAR_CATS.some(x=>x[0]===S.ecat)?S.ecat:'wpn1';
 const label=g=>{let x=g.n+' · '+fmtMoney(g.p);if(g.arm)x+=g.arm.kind==='s'?' · CA +2':' · CA '+g.arm.base+(g.arm.kind==='h'?'':' + Dex'+(g.arm.cap?' (max '+g.arm.cap+')':''));if(g.w)x+=' · '+g.w.dice+' '+g.w.dt;return x;};
 h+=`<div class="row" style="align-items:end"><label class="field"><span>Catégorie</span><select data-ui="ecat" aria-label="Catégorie d'objet">${GEAR_CATS.map(([k,l])=>`<option value="${k}"${k===cat?' selected':''}>${e(l)}</option>`).join('')}</select></label>
  <label class="field"><span>Objet</span><select id="bitem" aria-label="Objet à ajouter">${GEAR.filter(g=>g.cat===cat).map(g=>`<option value="${e(g.id)}">${e(label(g))}</option>`).join('')}</select></label>
  <label class="field"><span>Quantité</span><input type="number" inputmode="numeric" min="1" max="99" id="bq" value="1"></label></div>
  <label class="small"><input type="checkbox" id="bfree"> Sans coût (trouvé, offert, déjà possédé)</label><div style="margin-top:8px"><button type="button" class="btn" data-a="buyadd">Ajouter cet objet</button></div>`;
 h+=`<details style="margin-top:1rem"><summary>Objet absent de la liste (magique, spécial)</summary><div class="row" style="align-items:end"><label class="field"><span>Nom</span><input type="text" id="cn" autocomplete="off" maxlength="60"></label><label class="field"><span>Prix unitaire en po</span><input type="number" inputmode="decimal" step="any" min="0" id="cp" value="0"></label><label class="field"><span>Quantité</span><input type="number" inputmode="numeric" min="1" max="99" id="cq" value="1"></label></div><div style="margin-top:8px"><button type="button" class="btn" data-a="buycust">Ajouter cet objet</button></div></details>`;
 h+=field('Autres objets et notes',`<textarea data-live="inv" placeholder="Objets trouvés, notes de charge, objets magiques…">${e(c.inv)}</textarea>`);
 /* armure portée */
 const arms=[];armorOwned(c).forEach(o=>{if(!arms.some(x=>x.id===o.item.id))arms.push(o.item);});
 const ap=armorProf(c),AR=armorOf(c);
 h+=`<h3>Classe d'armure</h3>`+field('Armure portée',sel('arm',[['none','Aucune'],...arms.map(g=>[g.id,g.n+' (CA '+g.arm.base+(g.arm.kind==='h'?'':' + Dex'+(g.arm.cap?', max '+g.arm.cap:''))+')']),['autre','Autre (saisir la CA)']],c.arm));
 if(c.arm==='autre')h+=field("CA de l'armure (Dextérité incluse)",`<input type="number" inputmode="numeric" data-b="acManual" data-num value="${+c.acManual||10}">`);
 const hasSh=shieldOwned(c);
 h+=`<label class="small"><input type="checkbox" data-b="shield" ${c.shield?'checked':''} ${hasSh?'':'disabled'}> Bouclier (+2 CA${hasSh?'':' : ajoutez un bouclier à votre équipement'})</label>`;
 h+=field('Autres bonus de CA',`<input type="number" inputmode="numeric" data-b="acBonus" data-num value="${+c.acBonus||0}">`);
 const warn=[];
 if(AR){const k=AR.arm.kind;if(!ap[k])warn.push(`Vous n'avez pas la formation aux armures ${k==='l'?'légères':k==='i'?'intermédiaires':'lourdes'} : désavantage aux jets de Force et de Dextérité et aux attaques, et incantation impossible.`);
  if(AR.arm.str&&D.ab.for<AR.arm.str)warn.push(`Force ${AR.arm.str} requise (vous avez ${D.ab.for}) : Vitesse réduite de 3 m.`);
  if(AR.arm.stealth)warn.push('Désavantage aux jets de Discrétion.');}
 if(c.shield&&!ap.s)warn.push("Vous n'avez pas la formation aux boucliers : mêmes pénalités qu'une armure non maîtrisée.");
 if(c.cls==='moine'&&(wears(c)||c.shield))warn.push('Un moine perd Défense sans armure, Arts martiaux et Déplacement sans armure avec une armure ou un bouclier.');
 h+=`<div class="note">CA actuelle : <b>${D.ac}</b> · ${e(D.acNote)}.${warn.map(w=>' '+e(w)).join('')}</div>`;
 h+=field('Bonus de PV divers (don, objet)',`<input type="number" inputmode="numeric" data-b="hpBonus" data-num value="${+c.hpBonus||0}">`);
 return h;
}
const chc=(c,cl)=>c.eqCls==='C'&&cl.eqC?cl.eqC:c.eqCls==='B'?cl.eqB:cl.eqA;
const goldTotal=c=>purse(c).total;   /* en pièces de cuivre */
const slotsTxt=(c,D)=>c.cls==='occultiste'?`${D.slots[D.slots.length-1]} emplacement(s) de niveau ${D.slots.length} (Magie de pacte)`:D.slots.map((n,i)=>`niv. ${i+1} : ${n}`).join(' · ');

function sheetHTML(c,D){
 const cl=CL[c.cls],sub=(SUBS[c.cls]||{})[c.sub],bg=BG[c.bg];
 const title=c.name||'Personnage sans nom';
 let h=`<h2>${e(title)}</h2><p class="muted">${e(G(cl.n,c))}${sub?' · '+e(sub.n):''} niveau ${c.level}${c.species?' · '+e(G(SPN[c.species],c)):''}${bg?' · '+e(G(bg.n,c)):''}</p>`;
 h+=`<div class="stat"><div><b>${D.ac}</b><span>Classe d'armure</span></div><div><b>${D.hp}</b><span>Points de vie</span></div><div><b>${String(D.speed).replace('.',',')} m</b><span>Vitesse</span></div><div><b>${sg(D.init)}</b><span>Initiative</span></div><div><b>${sg(D.pb)}</b><span>Maîtrise</span></div><div><b>${D.passive}</b><span>Perception passive</span></div>${(D.slots.length||D.extraCant.length||D.always.length)?`<div><b>${D.dc}</b><span>DD des sorts</span></div><div><b>${sg(D.atk)}</b><span>Attaque de sort</span></div>`:''}</div>`;
 {const li=langInfo(c);h+=`<p class="small"><b>Langues :</b> ${e([...li.fixed,...c.langs,...(c.langX?[c.langX]:[])].join(', '))}${c.align?` · <b>Alignement :</b> ${e(alignLabel(c.align,c.gender))}`:''}</p>`;}
 h+=`<p class="small muted">Dé de vie : ${c.level}d${cl.hd} · Taille ${D.sp.size}${D.sp.dv?' · Vision dans le noir '+D.sp.dv+' m':''}${D.sp.res.length?' · Résistance : '+D.sp.res.join(', '):''}</p>`;
 h+=`<h3>Caractéristiques</h3><div class="abil">${AB.map(a=>`<div><small>${ABN[a]}</small><b>${sg(D.mod[a])}</b><span>${D.ab[a]}</span></div>`).join('')}</div>`;
 h+=`<h3>Jets de sauvegarde</h3><ul class="skl">${AB.map(a=>`<li><span><span class="dot${D.save[a].p?' f':''}"></span>${ABN[a]}</span><b>${sg(D.save[a].b)}</b></li>`).join('')}</ul>`;
 h+=`<h3>Compétences</h3><ul class="skl">${SK.map(([id])=>{const s=D.skill[id];return `<li><span><span class="dot${s.x?' x':s.p?' f':''}"></span>${e(s.n)} <small class="muted">${ABS[s.a]}</small></span><b>${sg(s.b)}</b></li>`;}).join('')}</ul><p class="small muted">Point plein : maîtrise · point coloré : expertise.</p>`;
 {const tl=[...(bg?[bg.tool||c.bgTool]:[]),...c.tools,c.xs.tool,c.toolsX].filter(Boolean);if(tl.length)h+=`<p class="small"><b>Outils :</b> ${tl.map(e).join(', ')}</p>`;}
 h+=`<p class="small"><b>Maîtrises :</b> ${e(profTxt(c))}</p>`;
 h+=`<h3>Ressources</h3><p class="small">${D.res.map(e).join('<br>')}</p>`;
 if(D.slots.length)h+=`<h3>Sorts</h3><p class="small"><b>Emplacements :</b> ${slotsTxt(c,D)}</p>`;
 const li=n=>`<li><span>${e(n)}</span><span class="muted">${e(ttsh(n))}</span></li>`;
 const cants=[...D.extraCant.map(x=>x.n),...c.spells.c,...c.spells.x.filter(q=>+q.lv===0).map(q=>q.n)];
 h+=`<p class="small"><b>Sorts mineurs</b></p>${cants.length?`<ul class="skl">${cants.map(li).join('')}</ul>`:'<p class="small">—</p>'}`;
 let anyP=false;for(let l=1;l<=9;l++){const arr=[...c.spells.p.filter(n=>(SPELLS[c.cls][l]||[]).includes(n)),...c.spells.x.filter(q=>+q.lv===l).map(q=>q.n)];if(arr.length){anyP=true;h+=`<p class="small"><b>Niveau ${l}</b></p><ul class="skl">${arr.map(li).join('')}</ul>`;}}
 if(!anyP)h+=`<p class="small"><b>Sorts préparés :</b> —</p>`;
 if(D.always.length)h+=`<p class="small"><b>Toujours préparés</b></p><ul class="skl">${D.always.map(x=>li(x.n)).join('')}</ul>`;
 h+=`<h3>Traits et capacités</h3><dl class="feat">`;
 if(c.species)h+=`<dt>${e(G(SPN[c.species],c))} <span class="src">Espèce</span></dt><dd>${D.sp.tr.map(e).join('<br>')}</dd>`;
 if(bg)h+=`<dt>${e(bg.feat)} <span class="src">Don d'historique (${e(G(bg.n,c))})</span></dt>`;
 D.features.forEach(f=>{h+=`<dt>${e(f.n)} <span class="src">${e(f.src)}</span></dt>${f.d?`<dd>${e(f.d)}</dd>`:''}`;});
 h+=`</dl>`;
 {const own=equipNames(c);h+=`<h3>Équipement</h3><p class="small">${own.length?e(own.join(', '))+'.':'Aucun objet.'}<br><b>Bourse :</b> ${fmtMoney(goldTotal(c))}</p>`;}
 if(c.inv)h+=`<p class="small" style="white-space:pre-wrap">${e(c.inv)}</p>`;
 if(c.appearance)h+=`<h3>Apparence</h3><p style="white-space:pre-wrap">${e(c.appearance)}</p>`;
 if(c.story)h+=`<h3>Histoire</h3><p style="white-space:pre-wrap">${e(c.story)}</p>`;
 return h;
}
/* ---------- Fiche au format officiel : modèle de données ---------- */
const lowFirst=t=>t.charAt(0).toLowerCase()+t.slice(1);
function lookText(c){
 const L=lookDefaults({gender:c.gender,look:c.look});const nm=(list,id)=>{const f=list.find(x=>x[0]===id);return f?f[1]:id;};
 const p=[];
 if(c.species!=='drakeide'){p.push(L.len==='chauve'?'Chauve':'Cheveux '+lowFirst(nm(LOOK.LENS,L.len))+' '+lowFirst(nm(LOOK.HAIR,L.hair))+' ('+lowFirst(nm(LOOK.STYLES,L.style))+')');}
 p.push('yeux '+lowFirst(nm(LOOK.EYES,L.eyes)));
 if(c.look&&c.look.skin)p.push('teint '+lowFirst(nm(LOOK.SKINS,c.look.skin)));
 const t=p.join(', ');return t.charAt(0).toUpperCase()+t.slice(1)+'.';
}
const shortTime=r=>String(r).replace(/ ou rituel/i,'').replace('Action bonus','Bonus').replace(/minutes?/,'min').replace(/heures?/,'h');
function sheetModel(c,D){
 const cl=CL[c.cls],sub=(SUBS[c.cls]||{})[c.sub],bg=BG[c.bg];
 const ORDER=['for','dex','con','int','sag','cha'];
 const abil=ORDER.map(id=>({id,name:ABN[id],mod:sg(D.mod[id]),val:D.ab[id],save:{p:D.save[id].p,b:sg(D.save[id].b)},
  skills:SK.filter(([,,a])=>a===id).map(([sid])=>{const s=D.skill[sid];return{n:s.n,p:s.p,x:s.x,b:sg(s.b)};})}));
 /* entraînements : on relit la ligne de maîtrises de la classe */
 const pt=profTxt(c),parts=pt.split(' · ').map(x=>x.trim()).filter(Boolean),all=/toutes les armures/i.test(pt);
 const tools=[...parts.filter(x=>!/^Armes|Armures|armures|Boucliers|Aucune formation|Aucune armure|Toutes les armures/i.test(x)),...(bg?[bg.tool||c.bgTool]:[]),...c.tools,c.xs.tool,c.toolsX].filter(Boolean);
 const training={armor:{l:all||/légères/i.test(pt),i:all||/intermédiaires/i.test(pt),h:all,s:/boucliers?/i.test(pt)},
  weapons:parts.filter(x=>/^Armes/i.test(x)).join(', '),tools:tools.join(', ')};
 /* sorts */
 const seen=new Set(),sp=[];
 const add=(n,lv,note,x)=>{if(!n||seen.has(n))return;seen.add(n);const s=spellByName(n);const ti=tinfo(n);
  const dn=s&&s.dmg&&s.dtypes.length?'Dégâts : '+s.dtypes.join(', '):'';
  sp.push({n,lv:s?s.lv:(+lv||0),time:shortTime(s?s.time.raw:ti.raw),range:s?s.range:'',c:s?s.conc:false,r:s?s.rit:ti.rit,m:s?s.comp.includes('M'):false,note:[dn,note].filter(Boolean).join(' · ')});};
 D.extraCant.forEach(x=>add(x.n,0,x.src));
 c.spells.c.forEach(n=>add(n,0));
 c.spells.p.forEach(n=>add(n));
 D.always.forEach(x=>add(x.n,null,'Toujours préparé'));
 c.spells.x.forEach(q=>add(q.n,q.lv,q.free?'Toujours préparé':''));
 sp.sort((a,b)=>a.lv-b.lv||a.n.localeCompare(b.n,'fr'));
 const casting=D.slots.length||sp.length>0;
 const weapons=attackRows(c,D);
 /* capacités et dons */
 const isLvl=f=>/^Niveau \d+/.test(f.src);
 const feats=D.featList.map(f=>({n:f.n+' ('+f.src.toLowerCase()+')',d:f.d||''}));
 const eq=[];const ch=chc(c,cl);
 {const own=equipNames(c);if(own.length)eq.push(own.join(', ')+'.');}
 if(c.inv)eq.push(c.inv);
 const li=langInfo(c);const langs=[...li.fixed,...c.langs,...(c.langX?[c.langX]:[])];
 return{name:c.name||'',bg:bg?G(bg.n,c):'',cls:G(cl.n,c),sub:sub?sub.n:'',species:c.species?G(SPN[c.species],c):'',level:c.level,
  ac:D.ac,shield:!!c.shield,hpMax:D.hp,hitDice:c.level+'d'+cl.hd,pb:sg(D.pb),init:sg(D.init),speed:String(D.speed).replace('.',',')+' m',size:D.sp.size,passive:D.passive,
  abil,training,weapons,classFeat:D.features.filter(f=>!isLvl(f)&&f.src!=='Style de combat'&&!/^Voir (la sous-classe|le domaine|la voie|le protecteur|le don) choisi/i.test(f.d||'')).map(f=>({n:f.n,d:f.d||''})),speciesFeat:D.sp.tr,feats,
  cast:{ability:casting?ABN[D.spA]:'',mod:casting?sg(D.mod[D.spA]):'',dc:casting?D.dc:'',atk:casting?sg(D.atk):'',slots:D.slots},spells:sp,
  lookText:c.appearance||'',story:c.story||'',align:alignLabel(c.align,c.gender),languages:langs.join(', '),equip:eq.join('\n'),gold:coin(goldTotal(c),'po'),silver:coin(goldTotal(c),'pa'),copper:coin(goldTotal(c),'pc')};
}
const coin=(pc,u)=>{const n=Math.abs(Math.round(pc)),neg=pc<0?'−':'';const v=u==='po'?Math.floor(n/100):u==='pa'?Math.floor(n%100/10):n%10;return v||u==='po'?neg+v:'';};
const equipNames=c=>ownedItems(c).map(o=>o.n+(o.q>1?' ×'+o.q:''));
const officialOf=(c,D)=>officialSheet(sheetModel(c,D));

/* aperçu à l'écran : la fiche fait 198 mm de large, on la réduit pour tenir dans la fenêtre */
function fitOfficial(){
 const w=document.getElementById('ofit'),sh=w&&w.querySelector('.osheet');if(!sh)return;
 sh.style.transform='none';w.style.height='auto';
 const k=Math.min(1,(w.clientWidth||sh.offsetWidth)/sh.offsetWidth);
 sh.style.transformOrigin='0 0';sh.style.transform=k<1?`scale(${k})`:'none';w.style.height=Math.ceil(sh.offsetHeight*k)+'px';
}
function pageStyle(){
 let el=document.getElementById('pgs');if(!el){el=document.createElement('style');el.id='pgs';document.head.appendChild(el);}
 el.textContent=(S.view==='edit'&&S.tab==='sheet'&&S.fmt==='official')?'@page{size:A4 portrait;margin:6mm}':'';
}

function tabSheet(c,D){
 const issues=checks(c,D);
 let h='';
 if(issues.length)h+=`<div class="note warn noprint"><b>À compléter ou vérifier</b><br>${issues.map(e).join('<br>')}</div>`;
 h+=`<div class="field noprint"><span class="lbl">Format de la fiche</span><div class="seg" role="group" aria-label="Format de la fiche"><button type="button" data-a="fmt" data-v="detail" aria-pressed="${S.fmt!=='official'}">Détaillée</button><button type="button" data-a="fmt" data-v="official" aria-pressed="${S.fmt==='official'}">Format officiel (2 pages A4)</button></div></div>`;
 if(S.fmt==='official')h+=`<p class="small muted noprint">Même organisation que les fiches de personnage habituelles, à imprimer en A4 (2 pages). Aperçu réduit : l'impression est à taille réelle. Les cases à remplir en jeu (PV actuels, emplacements dépensés…) restent vides.</p><div id="ofit" class="ofit">${officialOf(c,D)}</div>`;
 else h+=sheetHTML(c,D);
 h+=`<div class="sec noprint"></div><div class="row noprint" style="margin-top:1rem"><button class="btn primary" data-a="expHtml">Télécharger la fiche (.html)</button><button class="btn" data-a="expJson">Sauvegarder ce personnage (.json)</button><button class="btn" data-a="print">Imprimer</button></div>
 <p class="small muted noprint">Outil non officiel. Les règles sont résumées avec des formulations propres : référez-vous au Manuel des Joueurs 2024 pour les textes complets.</p>`;
 return h;
}
function checks(c,D){
 const r=[];const cl=CL[c.cls];
 if(!c.name)r.push('Le personnage n\'a pas de nom.');
 if(!c.species)r.push('Espèce non choisie.');else{const o=c.sp;
  if(c.species==='drakeide'&&!o.anc)r.push('Ancêtre draconique à choisir.');
  if(c.species==='elfe'&&(!o.lin||!o.sense))r.push('Lignage et sens aiguisés de l\'elfe à choisir.');
  if(c.species==='gnome'&&!o.lin)r.push('Lignage gnome à choisir.');
  if(c.species==='goliath'&&!o.geant)r.push('Ascendance gigante à choisir.');
  if(c.species==='humain'&&(!o.skill||!o.feat))r.push('Compétence et don de l\'humain à choisir.');
  if(c.species==='tieffelin'&&!o.her)r.push('Héritage fiélon à choisir.');}
 if(!c.bg)r.push('Historique non choisi.');else if(c.bgAsi.mode!=='111'&&(!c.bgAsi.p2||!c.bgAsi.p1))r.push('Bonus de caractéristiques de l\'historique à répartir.');
 if(c.cSk.length<cl.pick)r.push(`Compétences de classe : ${c.cSk.length}/${cl.pick}.`);
 if(c.level>=3&&!c.sub)r.push('Sous-classe à choisir.');
 if(c.cls==='barde'&&c.tools.length<3)r.push(`Instruments : ${c.tools.length}/3.`);
 {const eN=cl.expN?cl.expN(c.level):0;if(eN&&c.exp.length<eN)r.push(`Expertise : ${c.exp.length}/${eN}.`);}
 optsOf(c).forEach(o=>{if(!c.opt[o.k])r.push(o.l+' à choisir.');});
 if(c.cls==='barde'&&c.sub==='savoir'&&c.level>=3&&c.sSk.length<3)r.push(`Maîtrises du Collège du Savoir : ${c.sSk.length}/3.`);
 {const li=langInfo(c);if(c.langs.length<li.slots)r.push(`Langues : ${c.langs.length}/${li.slots}.`);}
 if(c.hpm==='roll'){let m=0;for(let lv=2;lv<=c.level;lv++)if(!c.hpr[lv])m++;if(m)r.push(`PV : ${m} niveau${m>1?'x':''} à lancer.`);}
 {const n=styleSlots(c);if(c.fs.length<n)r.push(`Style de combat : ${c.fs.length}/${n}.`);const W=WARRIOR[c.cls];if(W&&c.fs.includes(W[0])&&c.gc.length<2)r.push(`${W[0]} : sorts mineurs ${c.gc.length}/2.`);}
 if(c.cls==='barbare'&&c.level>=3&&!c.xs.primal)r.push('Savoir primal : compétence à choisir.');
 if(c.cls==='guerrier'&&c.sub==='maitre'&&c.level>=3){if(!c.xs.martial)r.push('Disciple martial : compétence à choisir.');if(!c.xs.tool)r.push("Disciple martial : outils d'artisan à noter.");}
 {const nd=nDoue(c);if(nd&&c.skd.length<3*nd)r.push(`Doué : maîtrises ${c.skd.length}/${3*nd} (les outils se notent à part).`);}
 c.mi.forEach(m=>{if(!m.cls)r.push('Initié à la magie : liste de sorts à choisir.');else if(m.cant.length<2||!m.spl||!m.ab)r.push(`Initié à la magie : sorts mineurs ${m.cant.length}/2, sort de niveau 1 ${m.spl?1:0}/1, caractéristique ${m.ab?1:0}/1.`);});
 asiOf(c).forEach(lv=>{if(lv<=c.level){const f=c.feats[lv];if(f&&f.k!=='asi'){if(!f.t)r.push(`Don du niveau ${lv} à choisir.`);else{const ft=featByName(f.t);if(ft&&featAbOptions(ft,cl).length&&!f.a)r.push(`Don du niveau ${lv} : caractéristique du +1 à choisir.`);}}}});
 if(c.level>=19&&!c.epic)r.push('Faveur épique à choisir.');
 {const seen={};featsOf(c).forEach(f=>{const ft=featByName(f.n),k=ft?ft.id:f.base;if(seen[k]&&!(ft&&ft.rep))r.push(`Le don « ${f.base} » est pris plusieurs fois alors qu'il n'est pas répétable.`);seen[k]=1;});}
 if(c.cls==='ensorceleur'&&c.meta.length<metaCount(c.level))r.push(`Métamagie : ${c.meta.length}/${metaCount(c.level)}.`);
 if(c.cls==='ensorceleur'&&c.sub==='draconique'&&c.level>=6&&!c.aff)r.push('Affinité élémentaire à choisir.');
 if(D.cantUsed!==D.cantN)r.push(`Sorts mineurs : ${D.cantUsed}/${D.cantN}.`);
 if(D.prepUsed!==D.prepN)r.push(`Sorts préparés : ${D.prepUsed}/${D.prepN}.`);
 if(c.method==='standard'&&[...AB.map(a=>c.base[a])].sort((x,y)=>y-x).join()!=='15,14,13,12,10,8')r.push('Tableau standard incomplet ou en double.');
 if(c.method==='free'&&(c.pool.length<6||AB.some(a=>c.asg[a]===''||c.asg[a]==null)))r.push(c.pool.length?'Dés : lancers ou attribution des scores à terminer.':'Dés : aucun lancer effectué.');
 asiOf(c).forEach(lv=>{if(lv<=c.level){const f=c.feats[lv];if(f.k==='asi'&&(!f.a||(f.m!=='2'&&!f.b)))r.push(`Niveau ${lv} : amélioration de caractéristiques à compléter.`);if(f.k!=='asi'&&!f.t)r.push(`Niveau ${lv} : don à nommer.`);}});
 return r;
}

/* ================== LISTE DES PERSONNAGES ================== */
function viewList(){
 let h=`<h2>Mes personnages</h2>`;
 if(!S.chars.length)h+=`<p class="muted">Aucun personnage pour l'instant.</p>`;
 S.chars.forEach(c=>{const cl=CL[c.cls]||CL.ensorceleur;h+=`<div class="list-item"><div class="t"><b><span class="hic">${classIcon(c.cls,18)}</span>${e(c.name||'Sans nom')}</b><span class="muted small">${e(G(cl.n,c))} niveau ${c.level}${c.species?' · '+e(G(SPN[c.species],c)):''}</span></div><div class="acts"><button class="btn small primary" data-a="open" data-id="${c.id}">Ouvrir</button><button class="btn small" data-a="dup" data-id="${c.id}">Dupliquer</button>${S.del===c.id?`<button class="btn small danger" data-a="del" data-id="${c.id}">Confirmer</button>`:`<button class="btn small danger" data-a="askdel" data-id="${c.id}">Supprimer</button>`}</div></div>`;});
 h+=`<div class="row" style="margin-top:1.2rem"><button class="btn primary" data-a="newc">Nouveau personnage</button>${S.chars.length?`<button class="btn" data-a="expAll">Tout sauvegarder (.json)</button>`:''}</div>`;
 h+=`<h3>Importer</h3><p class="small muted">Collez le contenu d'une sauvegarde .json, ou choisissez le fichier.</p><textarea id="impt" placeholder="Contenu JSON"></textarea><div class="row" style="margin-top:8px"><button class="btn" data-a="imp">Importer le texte collé</button><label class="btn" style="text-align:center">Choisir un fichier<input type="file" id="impf" accept=".json,application/json" hidden></label></div>
 <p class="small muted">Vos personnages sont enregistrés dans ce navigateur, sur cet appareil uniquement. Pensez à sauvegarder un fichier .json pour les garder ou les transférer.</p>`;
 return h;
}

/* ================== GRIMOIRE ================== */
function grimResults(){
 const g=S.g;
 const list=filterSpells({q:g.q,lv:g.lv,school:g.sch,cls:g.cls,time:g.time,conc:g.conc,rit:g.rit,dmg:g.dmg},SPELLDB);
 return V.results(list,S.glim,V.detailRow,'gmore');
}
const filtCount=g=>(g.sch>=0)+(g.cls!=='')+(g.time!=='')+(g.dmg!=='')+(g.conc?1:0)+(g.rit?1:0);
const filtLabel=g=>'Plus de filtres'+(filtCount(g)?' ('+filtCount(g)+' actif'+(filtCount(g)>1?'s':'')+')':'');
function fillGrim(){
 const r=document.getElementById('gres');if(r)r.innerHTML=grimResults();
 const f=document.getElementById('gfs');if(f)f.textContent=filtLabel(S.g);
}
function viewGrim(){
 const g=S.g;
 let h=`<h2>Grimoire</h2><p class="muted">${SPELLDB.length} sorts du Manuel des Joueurs 2024. Touchez un sort pour voir ses caractéristiques ; son texte complet se lit sur AideDD.</p>`;
 h+=`<label class="field"><span>Rechercher un sort</span><input type="search" id="gq" data-g="q" value="${e(g.q)}" placeholder="Nom en français ou en anglais" autocomplete="off"></label>`;
 h+=`<span class="lbl">Niveau</span><div class="pills">${Array.from({length:10},(_,l)=>pill(g.lv.includes(l),l===0?'Mineurs':String(l),`data-a="glv" data-v="${l}"`)).join('')}</div>`;
 h+=`<details class="filt"${filtCount(g)?' open':''}><summary id="gfs">${filtLabel(g)}</summary><div class="filtb"><div class="row"><label class="field"><span>École</span><select data-g="sch">${optList(schoolOpts(),g.sch)}</select></label><label class="field"><span>Classe</span><select data-g="cls">${optList([['','Toutes'],...NS.SPELL_CLASSES.map(n=>[n,n])],g.cls)}</select></label><label class="field"><span>Temps d'incantation</span><select data-g="time">${optList(TIME_OPTS,g.time)}</select></label><label class="field"><span>Dégâts</span><select data-g="dmg">${optList(DMG_OPTS(),g.dmg)}</select></label></div>
 <div><label class="chk"><input type="checkbox" data-g="conc"${g.conc?' checked':''}> Concentration</label><label class="chk"><input type="checkbox" data-g="rit"${g.rit?' checked':''}> Rituel</label></div></div></details>`;
 h+=`<div style="margin:.5rem 0"><button type="button" class="btn small" data-a="greset">Réinitialiser la recherche et les filtres</button></div>`;
 h+=`<div id="gres" style="margin-top:.8rem">${grimResults()}</div>`;
 return h;
}

/* ================== RENDU GLOBAL ================== */
const app=document.getElementById('app'),hdr=document.getElementById('hdr');
function render(keepScroll){
 const y=window.scrollY;const c=C();
 if(S.view==='grim'){
  hdr.innerHTML=`<div class="top-row"><div class="who"><b>Grimoire des sorts</b><span>D&amp;D 2024 · ${SPELLDB.length} sorts</span></div><button class="btn small" data-a="gback">Retour</button></div><div style="height:10px"></div>`;
  app.innerHTML=viewGrim();bind();window.scrollTo(0,keepScroll?y:0);return;
 }
 if(S.view==='list'||!c){
  hdr.innerHTML=`<div class="top-row"><div class="who"><b>Configurateur D&amp;D 2024</b><span>Création de personnage</span></div><button class="btn small" data-a="grim">Grimoire</button></div><div style="height:10px"></div>`;
  app.innerHTML=viewList();bind();window.scrollTo(0,keepScroll?y:0);return;
 }
 norm(c);const D=derive(c);const cl=CL[c.cls],sub=(SUBS[c.cls]||{})[c.sub];
 hdr.innerHTML=`<div class="top-row"><div class="whorow"><span class="hic">${classIcon(c.cls,26)}</span><div class="who"><b id="hn">${e(c.name||'Personnage sans nom')}</b><span>${e(G(cl.n,c))}${sub?' · '+e(sub.n):''} niv. ${c.level}${c.species?' · '+e(G(SPN[c.species],c)):''}</span></div></div><div class="hbtns"><button class="btn small" data-a="grim">Grimoire</button><button class="btn small" data-a="list">Mes persos</button></div></div>
 <nav class="tabs" aria-label="Étapes">${TABS.map(([k,l])=>`<button class="tab" data-a="tab" data-v="${k}" ${S.tab===k?'aria-current="true"':''}>${l}</button>`).join('')}</nav>`;
 let h='';
 switch(S.tab){case 'id':h=tabId(c);break;case 'origin':h=tabOrigin(c,D);break;case 'cls':h=tabCls(c,D);break;case 'scores':h=tabScores(c,D);break;case 'spells':h=tabSpells(c,D);break;case 'equip':h=tabEquip(c,D);break;default:h=tabSheet(c,D);}
 const i=TABS.findIndex(t=>t[0]===S.tab);
 h+=`<div class="nav noprint">${i>0?`<button class="btn" data-a="tab" data-v="${TABS[i-1][0]}">Précédent</button>`:'<span></span>'}${i<TABS.length-1?`<button class="btn primary" data-a="tab" data-v="${TABS[i+1][0]}">Suivant</button>`:'<span></span>'}</div>`;
 app.innerHTML=h;bind();window.scrollTo(0,keepScroll?y:0);
}
function bind(){pageStyle();fitOfficial();const t=document.getElementById('impf');if(t)t.onchange=ev=>{const f=ev.target.files&&ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>importText(String(r.result));r.readAsText(f);};}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>{t.hidden=true;},3500);}

/* ================== ACTIONS ================== */
function touch(){const c=C();if(c)norm(c);persist();}   /* on nettoie avant d'enregistrer : la sauvegarde ne garde pas de valeurs invalides */
const A={
 tab(d){S.tab=d.v;render(false);},
 list(){S.view='list';S.del=null;render(false);},
 grim(){S.view='grim';render(false);},
 gback(){S.view=C()?'edit':'list';render(false);},
 glv(d,el){const l=+d.v,a=S.g.lv,i=a.indexOf(l);if(i>=0)a.splice(i,1);else a.push(l);const on=i<0;el.classList.toggle('on',on);el.setAttribute('aria-pressed',on?'true':'false');S.glim=PAGE;fillGrim();},
 gmore(){const n=document.querySelectorAll('#gres .sd').length;S.glim+=PAGE;fillGrim();const f=document.querySelectorAll('#gres .sd summary')[n];if(f)f.focus();},
 greset(){S.g=newG();S.glim=PAGE;render(false);},
 smore(){const n=document.querySelectorAll('#sres .srb').length;S.slim+=PAGE;fillPick();const f=document.querySelectorAll('#sres .srb')[n];if(f)f.focus();},
 open(d){S.cur=d.id;S.view='edit';S.tab='id';touch();render(false);},
 newc(){const c=blank();S.chars.push(c);S.cur=c.id;S.view='edit';S.tab='id';touch();render(false);},
 dup(d){const o=S.chars.find(x=>x.id===d.id);if(!o)return;const n=JSON.parse(JSON.stringify(o));n.id=uid();n.name=(o.name||'Sans nom')+' (copie)';S.chars.push(n);touch();render(true);},
 askdel(d){S.del=d.id;render(true);},
 del(d){S.chars=S.chars.filter(x=>x.id!==d.id);if(S.cur===d.id)S.cur=S.chars[0]?S.chars[0].id:null;S.del=null;touch();render(true);},
 gender(d){const c=C();c.gender=d.v;touch();render(true);},
 fmt(d){S.fmt=d.v==='official'?'official':'detail';persist();render(true);},
 setcls(d){const c=C();if(!c||c.cls===d.v)return;c.cls=d.v;touch();render(true);},
 asimode(d){const c=C();c.bgAsi.mode=d.v;touch();render(true);},
 method(d){const c=C();c.method=d.v;touch();render(true);},
 togMan(){S.manOpen=!S.manOpen;render(true);},
 pb(d){const c=C();const cost={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};const a=d.ab;const b=c.bases.pointbuy;const nv=b[a]+(+d.d);if(nv<8||nv>15)return;const t=AB.reduce((s,x)=>s+cost[x===a?nv:b[x]],0);if(t>27){toast('Pas assez de points.');return;}b[a]=nv;touch();render(true);},
 rollOne(){const c=C();if(c.pool.length>=6)return;c.pool.push(roll4());touch();render(true);},
 rollAll(){const c=C();while(c.pool.length<6)c.pool.push(roll4());touch();render(true);},
 rollReset(){const c=C();c.pool=[];c.asg={};c.rr=(+c.rr||0)+1;touch();render(true);},
 addPool(){const c=C();const inp=document.getElementById('mv');const v=Math.round(+(inp&&inp.value));if(!(v>=3&&v<=18)){toast('Entrez un résultat entre 3 et 18.');return;}c.pool.push({v,d:null});touch();render(true);const mv=document.getElementById('mv');if(mv)mv.focus();},
 tog(d){const c=C();const arr=c[d.p];const i=arr.indexOf(d.v);if(i>=0)arr.splice(i,1);else if(arr.length<+d.max)arr.push(d.v);touch();render(true);},
 togs(d){const c=C();const arr=c.spells[d.p];const i=arr.indexOf(d.v);if(i>=0)arr.splice(i,1);else arr.push(d.v);touch();render(true);},
 featk(d){const c=C();c.feats[d.lv].k=d.v;touch();render(true);},
 featm(d){const c=C();c.feats[d.lv].m=d.v;if(d.v==='2')c.feats[d.lv].b='';touch();render(true);},
 hpm(d){const c=C();c.hpm=d.v==='roll'?'roll':'auto';touch();render(true);},
 hproll(d){const c=C();c.hpr[d.lv]=1+Math.floor(Math.random()*CL[c.cls].hd);touch();render(true);},
 hprollall(){const c=C();const hd=CL[c.cls].hd;for(let lv=2;lv<=c.level;lv++)if(!c.hpr[lv])c.hpr[lv]=1+Math.floor(Math.random()*hd);touch();render(true);},
 hpclear(){const c=C();c.hpr={};touch();render(true);},
 togmi(d){const c=C();const m=c.mi[+d.i];if(!m)return;const arr=m[d.k],j=arr.indexOf(d.v);if(j>=0)arr.splice(j,1);else if(arr.length<2)arr.push(d.v);touch();render(true);},
 eq(d){const c=C();c[d.w]=d.v;touch();render(true);},
 eqsell(d){const c=C();c.eqSell=d.v==='half'?'half':'full';touch();render(true);},
 eqtog(d){const c=C();const r=startEntries(c).find(x=>x.key===d.k);if(!r)return;c.eqKeep[d.k]=keepOf(c,r)>0?0:r.q;touch();render(true);},
 buydel(d){const c=C();c.buy.splice(+d.i,1);touch();render(true);},
 buyadd(){const c=C();const id=(document.getElementById('bitem')||{}).value,q=clamp(Math.floor(+(document.getElementById('bq')||{}).value)||1,1,99),free=!!(document.getElementById('bfree')||{}).checked;
  if(!gearById(id))return;const b=c.buy.find(x=>x.id===id&&x.free===free);if(b)b.q=Math.min(99,b.q+q);else c.buy.push({id,n:'',q,p:0,free});touch();render(true);},
 buycust(){const c=C();const n=((document.getElementById('cn')||{}).value||'').trim().slice(0,60),p=Math.round((+String((document.getElementById('cp')||{}).value).replace(',','.')||0)*100),q=clamp(Math.floor(+(document.getElementById('cq')||{}).value)||1,1,99);
  if(!n){toast("Donnez un nom à l'objet.");return;}c.buy.push({id:'',n,q,p:Math.max(0,p),free:false});touch();render(true);},
 addx(){const c=C();const n=document.getElementById('xn').value.trim();if(!n){toast('Indiquez le nom du sort.');return;}c.spells.x.push({n,lv:+document.getElementById('xl').value,free:document.getElementById('xf').checked,t:document.getElementById('xt').value});touch();render(true);},
 delx(d){const c=C();c.spells.x.splice(+d.i,1);touch();render(true);},
 print(){try{window.print();}catch(x){toast('Impression indisponible ici : téléchargez la fiche .html puis imprimez-la.');}},
 async expHtml(){const c=C();norm(c);const D=derive(c);const css='body{font-family:Georgia,serif;max-width:720px;margin:20px auto;padding:0 14px;color:#1B2238}h2,h3{margin:1rem 0 .3rem}.stat{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.stat div{border:1px solid #bbb;padding:6px;border-radius:6px}.stat b{display:block;font-size:1.3rem}.stat span,.muted,.small,.src{color:#555;font-size:.85rem}.abil{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.abil div{border:1px solid #bbb;padding:6px;text-align:center;border-radius:6px}.abil b{display:block;font-size:1.3rem}.abil small{display:block;font-size:.7rem}.skl{columns:2;list-style:none;padding:0}.skl li{display:flex;justify-content:space-between;border-bottom:1px dotted #bbb}.dot{display:inline-block;width:.7em;height:.7em;border-radius:50%;border:1.5px solid #000;margin-right:6px}.dot.f{background:#000}.dot.x{background:#1F6F63;border-color:#1F6F63}dt{font-weight:bold;margin-top:.5rem}dd{margin:0}';const off=S.fmt==='official';const html=off?`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${e(c.name||'Personnage')}</title><style>@page{size:A4 portrait;margin:6mm}body{margin:0;background:#eee}.osheet{margin:8px auto}@media print{body{background:#fff}.osheet{margin:0}}${OFFICIAL_CSS}</style></head><body>${officialOf(c,D)}</body></html>`:`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${e(c.name||'Personnage')}</title><style>${css}</style></head><body>${sheetHTML(c,D)}</body></html>`;await saveFile((c.name||'personnage').replace(/[^\w\-]+/g,'_')+'.html',html);},
 async expJson(){const c=C();await saveFile((c.name||'personnage').replace(/[^\w\-]+/g,'_')+'.json',JSON.stringify({chars:[c]},null,1));},
 async expAll(){await saveFile('personnages-dnd2024.json',JSON.stringify({chars:S.chars},null,1));},
 imp(){const t=document.getElementById('impt').value.trim();if(!t){toast('Collez d\'abord le contenu JSON.');return;}importText(t);}
};
/* Téléchargement : interface de l'aperçu Claude si elle existe, sinon téléchargement standard du navigateur */
async function saveFile(name,data){
 try{
  if(window.claude&&window.claude.use){
   const d=await window.claude.use('downloads');
   if(d){await d.save({filename:name,data});toast('Fichier prêt.');return;}
  }
  const blob=new Blob([data],{type:(/\.html$/.test(name)?'text/html':'application/json')+';charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Fichier téléchargé.');
 }catch(x){if(x&&x.code==='declined')return;toast('Impossible d\'enregistrer le fichier.');}
}
function importText(t){
 try{const d=JSON.parse(t);const arr=Array.isArray(d)?d:(d.chars||(d.id?[d]:[]));if(!arr.length){toast('Aucun personnage trouvé.');return;}
  arr.forEach(c=>{const n={...blank(),...c,id:uid()};S.chars.push(n);});touch();toast(arr.length+' personnage(s) importé(s).');render(false);
 }catch(x){toast('Fichier illisible.');}
}

/* ================== ÉVÉNEMENTS ================== */
document.addEventListener('click',ev=>{const t=ev.target.closest('[data-a]');if(!t||!A[t.dataset.a])return;ev.preventDefault();A[t.dataset.a](t.dataset,t);});
document.addEventListener('change',ev=>{const t=ev.target;if(!t.dataset||t.dataset.b===undefined)return;const c=C();if(!c)return;let v=t.type==='checkbox'?t.checked:t.value;if(t.dataset.num!==undefined)v=+v;setp(c,t.dataset.b,v);if(t.dataset.b==='species'){c.sp={};}touch();render(true);});
document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target&&ev.target.id==='mv'){ev.preventDefault();A.addPool();}});
document.addEventListener('input',ev=>{const t=ev.target;if(!t.dataset||t.dataset.live===undefined)return;const c=C();if(!c)return;setp(c,t.dataset.live,t.value);touch();if(t.dataset.live==='name'){const hn=document.getElementById('hn');if(hn)hn.textContent=t.value||'Personnage sans nom';}});

document.addEventListener('input',ev=>{const t=ev.target,d=t.dataset||{};
 if(d.g==='q'){S.g.q=t.value;S.glim=PAGE;fillGrim();}
 else if(d.ui==='sq'){S.sq=t.value;S.slim=PAGE;fillPick();}
});
document.addEventListener('change',ev=>{const t=ev.target,d=t.dataset||{};
 /* Les champs de recherche sont déjà traités par « input » : les relancer ici au moment où
    le champ perd le focus remplacerait la liste entre l'appui et le relâchement du clic. */
 if(d.g==='q'||d.ui==='sq')return;
 if(d.g){S.g[d.g]=d.g==='sch'?+t.value:t.type==='checkbox'?t.checked:t.value;S.glim=PAGE;fillGrim();}
 else if(d.ui){S[d.ui]=d.ui==='sch'?+t.value:t.value;S.slim=PAGE;render(true);}
 else if(d.ek!==undefined){const c=C();if(!c)return;c.eqKeep[d.ek]=Math.max(0,Math.floor(+t.value)||0);touch();render(true);}
 else if(d.bq!==undefined){const c=C();if(!c||!c.buy[+d.bq])return;c.buy[+d.bq].q=Math.floor(+t.value)||0;touch();render(true);}
 else if(d.ev!==undefined){const c=C();if(!c)return;if(t.value)c.eqVar[d.ev]=t.value;else delete c.eqVar[d.ev];touch();render(true);}
 else if(d.feat){const c=C();if(!c)return;const v=t.value;
  if(d.feat==='epic'){if(v==='__other'){c.epicO=1;c.epic='';}else{c.epicO=0;c.epic=v;}}
  else{const f=c.feats[d.feat];if(f){if(v==='__other'){f.o=1;f.t='';}else{f.o=0;f.t=v;}}}
  touch();render(true);}
});

/* ================== DÉMARRAGE ================== */
load();
{const st=document.createElement('style');st.id='ocss';st.textContent=OFFICIAL_CSS;document.head.appendChild(st);}
window.addEventListener('resize',fitOfficial);
if(S.chars.length){if(!C())S.cur=S.chars[0].id;S.view='edit';}
else{const c=blank();S.chars.push(c);S.cur=c.id;S.view='edit';persist();}
render(false);

})();
