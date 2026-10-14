/* Application : état, calculs, rendu, actions */
(function(){
'use strict';
const NS=window.DND;
const {AB,ABN,ABS,SK,SKM,INSTR,SLOTS,OCC_SLOTS,OCC_PREP,RAGES,RAGEDMG,MANIF,PACT,cantN,e,G,mod,sg,uid,setp,clamp,roll4,metaCount,expCount,BARDDIE,CL,CFEAT,ASIFEAT,SUBS,DOMS,DRAC_SPELLS,SED_SPELLS,META,BG,ORIGIN_FEATS,SPN,DRAGONS,LIN,GEANT,HER,SPELLS,TIMES,SPELLDB,spellByName,canonName,filterSpells,fold,LONG_TIMES,V,SPELL_SCHOOLS,CAST,HALF_SLOTS}=NS;

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
const newG=()=>({q:'',lv:[],sch:-1,cls:'',time:'',conc:false,rit:false});
const S={chars:[],cur:null,tab:'id',view:'edit',del:null,msg:'',sf:'',g:newG(),glim:PAGE,sq:'',slv:'',sch:-1,slim:PAGE};
function load(){try{const r=localStorage.getItem(KEY);if(r){const d=JSON.parse(r);S.chars=Array.isArray(d.chars)?d.chars:[];S.cur=d.cur||null;}}catch(x){}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({chars:S.chars,cur:S.cur}));}catch(x){}}
function blank(){return{id:uid(),name:'',gender:'f',level:1,cls:'ensorceleur',sub:'',species:'',sp:{},bg:'',bgAsi:{mode:'21',p2:'',p1:''},bgTool:'',
 method:'standard',pool:[],asg:{},rr:0,bases:{standard:{for:8,dex:13,con:14,int:10,sag:12,cha:15},pointbuy:{for:8,dex:8,con:8,int:8,sag:8,cha:8}},base:{for:8,dex:13,con:14,int:10,sag:12,cha:15},cSk:[],sSk:[],exp:[],tools:[],meta:[],aff:'',feats:{},epic:'',
 spells:{c:[],p:[],x:[]},eqCls:'A',eqBg:'A',goldAdj:0,inv:'',arm:'none',shield:false,acManual:10,acBonus:0,hpBonus:0,story:'',opt:{}};}
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
 let h=`<h3>Expertise ${count(c.exp.length,n)}</h3><p class="small muted">Double bonus de maîtrise sur ${n} compétence${n>1?'s':''} maîtrisée${n>1?'s':''}${cl.expOf?' parmi : '+cl.expOf.map(x=>SKM[x].n).join(', '):''}.</p><div class="pills">`;
 list.forEach(s=>{const on=c.exp.includes(s);h+=pill(on,SKM[s].n,`data-a="tog" data-p="exp" data-v="${s}" data-max="${n}"`,!on&&c.exp.length>=n);});
 return h+`</div>`;
}

function norm(c){
 c.sp=c.sp||{};c.bgAsi=c.bgAsi||{mode:'21',p2:'',p1:''};c.base=c.base||{};AB.forEach(a=>{if(!c.base[a])c.base[a]=8;});
 c.feats=c.feats||{};c.spells=c.spells||{c:[],p:[],x:[]};['c','p','x'].forEach(k=>{c.spells[k]=c.spells[k]||[];});
 ['cSk','sSk','exp','tools','meta'].forEach(k=>{c[k]=c[k]||[];});c.opt=c.opt||{};
 if(!CL[c.cls])c.cls='ensorceleur';
 c.level=clamp(+c.level||1,1,20);
 if(c.sub&&!(SUBS[c.cls]&&SUBS[c.cls][c.sub]&&SUBS[c.cls][c.sub].ok))c.sub='';
 [4,6,8,10,12,14,16].forEach(lv=>{if(!c.feats[lv])c.feats[lv]={k:'asi',m:'2',a:([6,10,14].includes(lv)?'':'cha'),b:'',t:''};});
 const cl=CL[c.cls];
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
function fixedSk(c){const s=[];const bg=BG[c.bg];if(bg)s.push(...bg.sk);if(c.species==='humain'&&c.sp.skill&&!s.includes(c.sp.skill))s.push(c.sp.skill);if(c.species==='elfe'&&c.sp.sense&&!s.includes(c.sp.sense))s.push(c.sp.sense);return s;}
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
function derive(c){
 const D={};const L=c.level,cl=CL[c.cls],sub=(SUBS[c.cls]||{})[c.sub];
 D.pb=Math.ceil(L/4)+1;
 const ab={};AB.forEach(a=>ab[a]=+c.base[a]||8);D.base={...ab};
 const bg=BG[c.bg];D.bgB={};AB.forEach(a=>D.bgB[a]=0);
 if(bg){if(c.bgAsi.mode==='111')bg.ab.forEach(a=>D.bgB[a]=1);else{if(bg.ab.includes(c.bgAsi.p2))D.bgB[c.bgAsi.p2]+=2;if(bg.ab.includes(c.bgAsi.p1)&&c.bgAsi.p1!==c.bgAsi.p2)D.bgB[c.bgAsi.p1]+=1;}}
 D.ftB={};AB.forEach(a=>D.ftB[a]=0);
 asiOf(c).forEach(lv=>{if(lv<=L){const f=c.feats[lv];if(f&&f.k==='asi'){if(f.m==='2'){if(f.a)D.ftB[f.a]+=2;}else{if(f.a)D.ftB[f.a]+=1;if(f.b&&f.b!==f.a)D.ftB[f.b]+=1;}}}});
 D.ab={};D.mod={};const abb=cl.abBonus?cl.abBonus(L):null;
 AB.forEach(a=>{D.ab[a]=Math.min(20,ab[a]+D.bgB[a]+D.ftB[a]);if(abb&&abb.ab.includes(a))D.ab[a]=Math.min(abb.max,D.ab[a]+abb.n);D.mod[a]=mod(D.ab[a]);});
 D.sp=spInfo(c,D.mod,D.pb);
 D.prof=profSk(c);
 D.skill={};SK.forEach(([id,n,a])=>{const p=D.prof.includes(id),x=c.exp.includes(id);let b=D.mod[a];if(p)b+=D.pb*(x?2:1);else if(c.cls==='barde'&&L>=2)b+=Math.floor(D.pb/2);if(cl.skillB)b+=cl.skillB(c,id,D);D.skill[id]={n,a,p,x,b};});
 const svx=[...(cl.saveExtra?cl.saveExtra(L):[]),...(sub&&sub.saveExtra?sub.saveExtra(L):[])];
 D.save={};AB.forEach(a=>{const p=cl.saves.includes(a)||svx.includes(a);D.save[a]={p,b:D.mod[a]+(p?D.pb:0)};});
 const avg=Math.floor(cl.hd/2)+1;
 let hp=cl.hd+D.mod.con+(L-1)*(avg+D.mod.con);
 if(c.cls==='ensorceleur'&&c.sub==='draconique'&&L>=3)hp+=L;
 if(c.species==='nain')hp+=L;
 hp+=(+c.hpBonus||0);D.hp=Math.max(hp,L);
 let ac=10+D.mod.dex,note='Sans armure';
 if(c.arm==='cuir'){ac=11+D.mod.dex;note='Armure de cuir';}
 else if(c.arm==='autre'){ac=+c.acManual||10;note='Armure (valeur saisie)';}
 else{
  if(c.cls==='barbare'){const v=10+D.mod.dex+D.mod.con;if(v>ac){ac=v;note='Défense sans armure (10 + Dex + Con)';}}
  if(cl.acUn&&!(cl.acUn.noShield&&c.shield)){const v=10+cl.acUn.ab.reduce((t,a)=>t+D.mod[a],0);if(v>ac){ac=v;note=cl.acUn.note;}}
  if(c.cls==='barde'&&c.sub==='danse'&&!c.shield&&L>=3){const v=10+D.mod.dex+D.mod.cha;if(v>ac){ac=v;note='Pirouettes éblouissantes (10 + Dex + Cha)';}}
  if(c.cls==='ensorceleur'&&c.sub==='draconique'&&L>=3){const v=10+D.mod.dex+D.mod.cha;if(v>ac){ac=v;note='Résistance draconique (10 + Dex + Cha)';}}
 }
 if(c.shield)ac+=2;ac+=(+c.acBonus||0);D.ac=ac;D.acNote=note+(c.shield?' + bouclier':'');
 D.speed=D.sp.speed+(cl.speedUn&&c.arm!=='cuir'&&c.arm!=='autre'&&!c.shield?cl.speedUn(L):0);D.init=D.mod.dex+(sub&&sub.initB&&L>=3?D.mod[sub.initB]:0);
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
 const xs=c.spells.x||[];
 D.cantUsed=c.spells.c.length+xs.filter(s=>+s.lv===0&&!s.free).length;
 D.prepUsed=c.spells.p.length+xs.filter(s=>+s.lv>0&&!s.free).length;
 D.features=[];
 CFEAT[c.cls].forEach(f=>{if(f.lv<=L)D.features.push({src:G(cl.n,c),n:f.n,d:f.d});if(f.lv===2&&c.cls==='ensorceleur'&&false){}});
 asiOf(c).forEach(lv=>{if(lv<=L){const f=c.feats[lv];D.features.push({src:'Niveau '+lv,n:f.k==='asi'?ASIFEAT.n:(f.t||'Don (à préciser)'),d:f.k==='asi'?(f.m==='2'?`+2 en ${ABN[f.a]||'(à choisir)'}.`:`+1 en ${ABN[f.a]||'?'} et +1 en ${ABN[f.b]||'?'}.`):''});}});
 if(L>=19)D.features.push({src:'Niveau 19',n:c.epic||'Faveur épique (à préciser)',d:''});
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
const pill=(on,label,attrs,dis,title)=>`<button type="button" class="pill${on?' on':''}" aria-pressed="${on?'true':'false'}" ${dis?'disabled':''} ${title?`title="${e(title)}"`:''} ${attrs}>${e(label)}</button>`;
function sel(path,opts,cur,o){o=o||{};return `<select data-b="${path}" ${o.num?'data-num':''} aria-label="${e(o.label||'')}">${o.ph!==undefined?`<option value="">${e(o.ph)}</option>`:''}${opts.map(([v,l,dis])=>`<option value="${e(v)}" ${String(v)===String(cur)?'selected':''} ${dis?'disabled':''}>${e(l)}</option>`).join('')}</select>`;}
const field=(label,inner)=>`<label class="field"><span>${e(label)}</span>${inner}</label>`;
const count=(n,max)=>`<span class="count${n>max?' bad':''}">${n}/${max}</span>`;

/* ================== RENDU : ONGLETS ================== */
const TABS=[['id','Identité'],['origin','Origine'],['cls','Classe'],['scores','Scores'],['spells','Sorts'],['equip','Équipement'],['sheet','Fiche']];

function tabId(c){
 return `<h2>Identité</h2>
 ${field('Nom du personnage',`<input type="text" data-live="name" value="${e(c.name)}" placeholder="Ex. Tilla « Patatra »" autocomplete="off">`)}
 <div class="field"><span class="lbl">Genre (accorde les noms de classe, d'espèce et d'historique)</span>
  <div class="seg" role="group" aria-label="Genre"><button type="button" data-a="gender" data-v="m" aria-pressed="${c.gender==='m'}">Masculin</button><button type="button" data-a="gender" data-v="f" aria-pressed="${c.gender==='f'}">Féminin</button></div></div>
 ${field('Niveau',sel('level',Array.from({length:20},(_,i)=>[i+1,'Niveau '+(i+1)]),c.level,{num:1,label:'Niveau'}))}
 ${field('Apparence, caractère, histoire',`<textarea data-live="story" placeholder="Quelques lignes pour le jeu de rôle">${e(c.story)}</textarea>`)}`;
}

function tabOrigin(c,D){
 const o=c.sp;const bg=BG[c.bg];const fixed=fixedSk(c);
 let h=`<h2>Origine</h2><p class="muted">Espèce et historique : ils fixent la Vitesse, les traits, deux compétences, un don et des bonus de caractéristiques.</p>`;
 h+=`<h3>Espèce</h3>`+field('Espèce',sel('species',Object.keys(SPN).map(k=>[k,G(SPN[k],c)]),c.species,{ph:'Choisir une espèce',label:'Espèce'}));
 const sa=()=>field("Caractéristique d'incantation des sorts de l'espèce",sel('sp.sa',[['int','Intelligence'],['sag','Sagesse'],['cha','Charisme']],o.sa||'cha'));
 switch(c.species){
  case 'drakeide':h+=field('Ancêtre draconique',sel('sp.anc',Object.keys(DRAGONS).map(k=>[k,k+' ('+DRAGONS[k]+')']),o.anc,{ph:'Choisir'}));break;
  case 'elfe':h+=field('Lignage elfique',sel('sp.lin',Object.keys(LIN).map(k=>[k,G(LIN[k].n,c)]),o.lin,{ph:'Choisir'}))
     +field('Sens aiguisés (compétence)',sel('sp.sense',['intuition','perception','survie'].map(s=>[s,SKM[s].n,BG[c.bg]&&BG[c.bg].sk.includes(s)]),o.sense,{ph:'Choisir'}))+sa();break;
  case 'gnome':h+=field('Lignage gnome',sel('sp.lin',[['forets','Gnome des forêts'],['roches','Gnome des roches']],o.lin,{ph:'Choisir'}))+sa();break;
  case 'goliath':h+=field('Ascendance gigante',sel('sp.geant',Object.keys(GEANT).map(k=>[k,GEANT[k][0]]),o.geant,{ph:'Choisir'}));break;
  case 'humain':h+=field('Taille',sel('sp.size',[['M','Moyenne'],['P','Petite']],o.size||'M'))
     +field('Compétent : compétence au choix',sel('sp.skill',SK.map(s=>[s[0],s[1],BG[c.bg]&&BG[c.bg].sk.includes(s[0])]),o.skill,{ph:'Choisir'}))
     +field("Polyvalent : don d'origine",sel('sp.feat',ORIGIN_FEATS.map(f=>[f,f]),o.feat,{ph:'Choisir (Doué recommandé)'}));break;
  case 'tieffelin':h+=field('Héritage fiélon',sel('sp.her',Object.keys(HER).map(k=>[k,HER[k].n]),o.her,{ph:'Choisir'}))
     +field('Taille',sel('sp.size',[['M','Moyenne'],['P','Petite']],o.size||'M'))+sa();break;
 }
 if(c.species){h+=`<div class="note"><b>${e(G(SPN[c.species],c))}</b> · Taille ${D.sp.size} · Vitesse ${String(D.sp.speed).replace('.',',')} m${D.sp.dv?` · Vision dans le noir ${D.sp.dv} m`:''}<br>${D.sp.tr.map(e).join('<br>')}</div>`;}
 h+=`<div class="sec"></div><h3>Historique</h3>`+field('Historique',sel('bg',Object.keys(BG).map(k=>[k,G(BG[k].n,c)]),c.bg,{ph:'Choisir un historique',label:'Historique'}));
 if(bg){
  h+=`<div class="note"><b>Don :</b> ${e(bg.feat)}<br><b>Compétences :</b> ${bg.sk.map(s=>SKM[s].n).join(', ')}<br><b>Outil :</b> ${e(bg.tool||bg.toolHint)}</div>`;
  if(!bg.tool)h+=field('Outil choisi',`<input type="text" data-live="bgTool" value="${e(c.bgTool)}" placeholder="${e(bg.toolHint)}">`);
  h+=`<div class="field"><span class="lbl">Bonus de caractéristiques (${bg.ab.map(a=>ABN[a]).join(', ')})</span>
   <div class="seg" role="group"><button type="button" data-a="asimode" data-v="21" aria-pressed="${c.bgAsi.mode!=='111'}">+2 et +1</button><button type="button" data-a="asimode" data-v="111" aria-pressed="${c.bgAsi.mode==='111'}">+1 aux trois</button></div></div>`;
  if(c.bgAsi.mode!=='111'){
   h+=`<div class="row">${field('+2 en',sel('bgAsi.p2',bg.ab.map(a=>[a,ABN[a],a===c.bgAsi.p1]),c.bgAsi.p2,{ph:'Choisir'}))}${field('+1 en',sel('bgAsi.p1',bg.ab.map(a=>[a,ABN[a],a===c.bgAsi.p2]),c.bgAsi.p1,{ph:'Choisir'}))}</div>`;
   if(!c.bgAsi.p2||!c.bgAsi.p1)h+=`<div class="note warn">Choisissez la caractéristique à +2 et celle à +1.</div>`;
  }
 }
 return h;
}

function tabCls(c,D){
 const cl=CL[c.cls];const L=c.level;const subs=SUBS[c.cls];const fixed=fixedSk(c);
 let h=`<h2>Classe</h2>`;
 h+=field('Classe',sel('cls',Object.keys(CL).map(k=>[k,G(CL[k].n,c)]),c.cls,{label:'Classe'}));
 h+=`<div class="note">Dé de vie d${cl.hd} · Sauvegardes : ${cl.saves.map(a=>ABN[a]).join(' et ')} · ${profTxt(c)}</div>`;
 h+=`<div class="note">Les 12 classes du Manuel des Joueurs 2024 sont disponibles. Certaines sous-classes ne sont pas encore proposées.</div>`;
 if(L<3)h+=`<p class="muted">La sous-classe se choisit au niveau 3 (niveau actuel : ${L}).</p>`;
 else h+=field(c.cls==='clerc'?'Domaine divin':'Sous-classe',sel('sub',Object.keys(subs).map(k=>[k,subs[k].n+(subs[k].ok?'':' (bientôt)'),!subs[k].ok]),c.sub,{ph:'Choisir une sous-classe'}));
 optsOf(c).forEach(o=>{h+=field(o.l,sel('opt.'+o.k,o.c,c.opt[o.k],{ph:'Choisir'}));});
 h+=`<h3>Compétences de classe ${count(c.cSk.length,cl.pick)}</h3><p class="small muted">${cl.skills?cl.pick+' compétences parmi cette liste.':cl.pick+' compétences au choix.'} Les compétences déjà données par l'origine sont grisées.</p><div class="pills">`;
 (cl.skills||SK.map(s=>s[0])).forEach(s=>{const on=c.cSk.includes(s);h+=pill(on,SKM[s].n,`data-a="tog" data-p="cSk" data-v="${s}" data-max="${cl.pick}"`,fixed.includes(s)||(!on&&c.cSk.length>=cl.pick));});
 h+=`</div>`;
 if(c.cls==='barde'){
  h+=`<h3>Instruments de musique ${count(c.tools.length,3)}</h3><div class="pills">`;
  INSTR.forEach(s=>{const on=c.tools.includes(s);h+=pill(on,s,`data-a="tog" data-p="tools" data-v="${e(s)}" data-max="3"`,!on&&c.tools.length>=3);});
  h+=`</div>`;
  h+=expHTML(c,D);
  if(c.sub==='savoir'&&L>=3){
   h+=`<h3>Collège du Savoir : maîtrises supplémentaires ${count(c.sSk.length,3)}</h3><div class="pills">`;
   SK.forEach(([s,n])=>{const on=c.sSk.includes(s);h+=pill(on,n,`data-a="tog" data-p="sSk" data-v="${s}" data-max="3"`,fixed.includes(s)||c.cSk.includes(s)||(!on&&c.sSk.length>=3));});
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
 const asiLv=asiOf(c).filter(l=>l<=L);
 if(asiLv.length){h+=`<h3>Dons et améliorations</h3>`;
  asiLv.forEach(lv=>{const f=c.feats[lv];
   h+=`<div class="sec"><span class="lbl">Niveau ${lv}</span>
   <div class="seg" role="group"><button type="button" data-a="featk" data-lv="${lv}" data-v="asi" aria-pressed="${f.k==='asi'}">Amélioration de caractéristiques</button><button type="button" data-a="featk" data-lv="${lv}" data-v="other" aria-pressed="${f.k!=='asi'}">Autre don</button></div>`;
   if(f.k==='asi'){
    h+=`<div class="seg" style="margin-top:8px"><button type="button" data-a="featm" data-lv="${lv}" data-v="2" aria-pressed="${f.m==='2'}">+2 à une</button><button type="button" data-a="featm" data-lv="${lv}" data-v="11" aria-pressed="${f.m!=='2'}">+1 à deux</button></div>
    <div class="row">${field(f.m==='2'?'+2 en':'+1 en',sel(`feats.${lv}.a`,AB.map(a=>[a,ABN[a]]),f.a,{ph:'Choisir'}))}${f.m!=='2'?field('+1 en',sel(`feats.${lv}.b`,AB.map(a=>[a,ABN[a],a===f.a]),f.b,{ph:'Choisir'})):''}</div>`;
   }else h+=field('Nom du don',`<input type="text" data-live="feats.${lv}.t" value="${e(f.t)}" placeholder="Ex. Résilient (Constitution)">`);
   h+=`</div>`;});
 }
 if(L>=19)h+=`<h3>Faveur épique (niveau 19)</h3>`+field('Don choisi',`<input type="text" data-live="epic" value="${e(c.epic)}" placeholder="${c.cls==='barde'?'Faveur de mémoire magique (recommandé)':'Faveur de Déplacement dimensionnel (recommandé)'}">`);
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
const schoolOpts=()=>[[-1,'Toutes'],...SPELL_SCHOOLS.map((n,i)=>[i,n])];

/* Sorts proposés à un personnage : liste de sa classe, jusqu'au niveau de ses emplacements */
function pickPool(c,D){
 const lists=SPELLS[c.cls];const names=new Set();
 for(let l=0;l<=D.slots.length;l++)(lists[l]||[]).forEach(n=>names.add(n));
 return SPELLDB.filter(s=>names.has(s.n));
}
function pickResults(c,D){
 const list=filterSpells({q:S.sq,lv:S.slv===''?[]:[+S.slv],school:S.sch,cls:'',time:S.sf,conc:false,rit:false},pickPool(c,D));
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
 h+=`<div class="row"><label class="field"><span>Niveau</span><select data-ui="slv">${optList([['','Tous'],...(hasCant?[['0','Sorts mineurs']]:[]),...Array.from({length:maxLv},(_,i)=>[String(i+1),'Niveau '+(i+1)])],S.slv)}</select></label><label class="field"><span>École</span><select data-ui="sch">${optList(schoolOpts(),S.sch)}</select></label><label class="field"><span>Temps d'incantation</span><select data-ui="sf">${optList(TIME_OPTS,S.sf)}</select></label></div>`;
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

function tabEquip(c,D){
 const cl=CL[c.cls],bg=BG[c.bg];
 let h=`<h2>Équipement</h2>`;
 const ch=chc(c,cl);const opts=[['A',"Choix A : l'équipement"],['B',cl.eqB.items?"Choix B : l'équipement":`Choix B : ${cl.eqB.gold} po`]];if(cl.eqC)opts.push(['C',`Choix C : ${cl.eqC.gold} po`]);
 h+=`<h3>Classe : ${e(G(cl.n,c))}</h3><div class="seg" role="group">${opts.map(([v,l])=>`<button type="button" data-a="eq" data-w="eqCls" data-v="${v}" aria-pressed="${c.eqCls===v||(v==='A'&&c.eqCls!=='B'&&c.eqCls!=='C')}">${l}</button>`).join('')}</div>`;
 h+=`<p class="small">${ch.items?e(ch.items)+' et '+ch.gold+' po.':ch.gold+' po.'}</p>`;
 if(bg){h+=`<h3>Historique : ${e(G(bg.n,c))}</h3><div class="seg" role="group"><button type="button" data-a="eq" data-w="eqBg" data-v="A" aria-pressed="${c.eqBg!=='B'}">Choix A : l'équipement</button><button type="button" data-a="eq" data-w="eqBg" data-v="B" aria-pressed="${c.eqBg==='B'}">Choix B : 50 po</button></div>
  <p class="small">${c.eqBg==='B'?'50 po.':e(bg.eq)+' et '+bg.gold+' po.'}</p>`;}
 else h+=`<p class="muted">Choisissez un historique dans l'onglet Origine pour voir son équipement.</p>`;
 const g=goldTotal(c);
 h+=`<div class="stat"><div><b>${g}</b><span>po au total</span></div></div>`;
 h+=field("Ajustement d'or (achats, gains) en po",`<input type="number" inputmode="numeric" data-b="goldAdj" data-num value="${+c.goldAdj||0}">`);
 h+=field('Autres objets et notes',`<textarea data-live="inv" placeholder="Objets achetés, trouvés, notes de charge…">${e(c.inv)}</textarea>`);
 h+=`<h3>Classe d'armure</h3>`+field('Armure portée',sel('arm',[['none','Aucune'],['cuir','Armure de cuir'],['autre','Autre (saisir la CA)']],c.arm));
 if(c.arm==='autre')h+=field("CA de l'armure (Dextérité incluse)",`<input type="number" inputmode="numeric" data-b="acManual" data-num value="${+c.acManual||10}">`);
 h+=`<label class="small"><input type="checkbox" data-b="shield" ${c.shield?'checked':''}> Bouclier (+2 CA, nécessite la formation)</label>`;
 h+=field('Autres bonus de CA',`<input type="number" inputmode="numeric" data-b="acBonus" data-num value="${+c.acBonus||0}">`);
 h+=`<div class="note">CA actuelle : <b>${D.ac}</b> · ${e(D.acNote)}.${(c.cls==='ensorceleur'||c.cls==='magicien')&&c.arm!=='none'?' Un '+(c.cls==='magicien'?'magicien':'ensorceleur')+' n\'a pas de formation aux armures : l\'incantation est impossible avec.':c.cls==='moine'&&(c.arm!=='none'||c.shield)?' Un moine perd Défense sans armure, Arts martiaux et Déplacement sans armure avec une armure ou un bouclier.':''}</div>`;
 h+=field('Bonus de PV divers (don, objet)',`<input type="number" inputmode="numeric" data-b="hpBonus" data-num value="${+c.hpBonus||0}">`);
 return h;
}
const slotsTxt=(c,D)=>c.cls==='occultiste'?`${D.slots[D.slots.length-1]} emplacement(s) de niveau ${D.slots.length} (Magie de pacte)`:D.slots.map((n,i)=>`niv. ${i+1} : ${n}`).join(' · ');
const chc=(c,cl)=>c.eqCls==='C'&&cl.eqC?cl.eqC:c.eqCls==='B'?cl.eqB:cl.eqA;
function goldTotal(c){const cl=CL[c.cls],bg=BG[c.bg];let g=chc(c,cl).gold;if(bg)g+=(c.eqBg==='B'?50:bg.gold);return g+(+c.goldAdj||0);}

function sheetHTML(c,D){
 const cl=CL[c.cls],sub=(SUBS[c.cls]||{})[c.sub],bg=BG[c.bg];
 const title=c.name||'Personnage sans nom';
 let h=`<h2>${e(title)}</h2><p class="muted">${e(G(cl.n,c))}${sub?' · '+e(sub.n):''} niveau ${c.level}${c.species?' · '+e(G(SPN[c.species],c)):''}${bg?' · '+e(G(bg.n,c)):''}</p>`;
 h+=`<div class="stat"><div><b>${D.ac}</b><span>Classe d'armure</span></div><div><b>${D.hp}</b><span>Points de vie</span></div><div><b>${String(D.speed).replace('.',',')} m</b><span>Vitesse</span></div><div><b>${sg(D.init)}</b><span>Initiative</span></div><div><b>${sg(D.pb)}</b><span>Maîtrise</span></div><div><b>${D.passive}</b><span>Perception passive</span></div>${(D.slots.length||D.extraCant.length||D.always.length)?`<div><b>${D.dc}</b><span>DD des sorts</span></div><div><b>${sg(D.atk)}</b><span>Attaque de sort</span></div>`:''}</div>`;
 h+=`<p class="small muted">Dé de vie : ${c.level}d${cl.hd} · Taille ${D.sp.size}${D.sp.dv?' · Vision dans le noir '+D.sp.dv+' m':''}${D.sp.res.length?' · Résistance : '+D.sp.res.join(', '):''}</p>`;
 h+=`<h3>Caractéristiques</h3><div class="abil">${AB.map(a=>`<div><small>${ABN[a]}</small><b>${sg(D.mod[a])}</b><span>${D.ab[a]}</span></div>`).join('')}</div>`;
 h+=`<h3>Jets de sauvegarde</h3><ul class="skl">${AB.map(a=>`<li><span><span class="dot${D.save[a].p?' f':''}"></span>${ABN[a]}</span><b>${sg(D.save[a].b)}</b></li>`).join('')}</ul>`;
 h+=`<h3>Compétences</h3><ul class="skl">${SK.map(([id])=>{const s=D.skill[id];return `<li><span><span class="dot${s.x?' x':s.p?' f':''}"></span>${e(s.n)} <small class="muted">${ABS[s.a]}</small></span><b>${sg(s.b)}</b></li>`;}).join('')}</ul><p class="small muted">Point plein : maîtrise · point coloré : expertise.</p>`;
 if(c.tools.length||(bg&&(bg.tool||c.bgTool)))h+=`<p class="small"><b>Outils :</b> ${[...(bg?[bg.tool||c.bgTool]:[]),...c.tools].filter(Boolean).map(e).join(', ')}</p>`;
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
 h+=`<h3>Équipement</h3><p class="small">${'Classe : '+(chc(c,cl).items?e(chc(c,cl).items)+' et '+chc(c,cl).gold+' po':chc(c,cl).gold+' po')}${bg?'<br>'+(c.eqBg==='B'?'Historique : 50 po':'Historique : '+e(bg.eq)):''}<br><b>Or :</b> ${goldTotal(c)} po</p>`;
 if(c.inv)h+=`<p class="small" style="white-space:pre-wrap">${e(c.inv)}</p>`;
 if(c.story)h+=`<h3>Histoire</h3><p style="white-space:pre-wrap">${e(c.story)}</p>`;
 return h;
}
function tabSheet(c,D){
 const issues=checks(c,D);
 let h='';
 if(issues.length)h+=`<div class="note warn noprint"><b>À compléter ou vérifier</b><br>${issues.map(e).join('<br>')}</div>`;
 h+=sheetHTML(c,D);
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
 S.chars.forEach(c=>{const cl=CL[c.cls]||CL.ensorceleur;h+=`<div class="list-item"><div class="t"><b>${e(c.name||'Sans nom')}</b><span class="muted small">${e(G(cl.n,c))} niveau ${c.level}${c.species?' · '+e(G(SPN[c.species],c)):''}</span></div><div class="acts"><button class="btn small primary" data-a="open" data-id="${c.id}">Ouvrir</button><button class="btn small" data-a="dup" data-id="${c.id}">Dupliquer</button>${S.del===c.id?`<button class="btn small danger" data-a="del" data-id="${c.id}">Confirmer</button>`:`<button class="btn small danger" data-a="askdel" data-id="${c.id}">Supprimer</button>`}</div></div>`;});
 h+=`<div class="row" style="margin-top:1.2rem"><button class="btn primary" data-a="newc">Nouveau personnage</button>${S.chars.length?`<button class="btn" data-a="expAll">Tout sauvegarder (.json)</button>`:''}</div>`;
 h+=`<h3>Importer</h3><p class="small muted">Collez le contenu d'une sauvegarde .json, ou choisissez le fichier.</p><textarea id="impt" placeholder="Contenu JSON"></textarea><div class="row" style="margin-top:8px"><button class="btn" data-a="imp">Importer le texte collé</button><label class="btn" style="text-align:center">Choisir un fichier<input type="file" id="impf" accept=".json,application/json" hidden></label></div>
 <p class="small muted">Vos personnages sont enregistrés dans ce navigateur, sur cet appareil uniquement. Pensez à sauvegarder un fichier .json pour les garder ou les transférer.</p>`;
 return h;
}

/* ================== GRIMOIRE ================== */
function grimResults(){
 const g=S.g;
 const list=filterSpells({q:g.q,lv:g.lv,school:g.sch,cls:g.cls,time:g.time,conc:g.conc,rit:g.rit},SPELLDB);
 return V.results(list,S.glim,V.detailRow,'gmore');
}
const filtCount=g=>(g.sch>=0)+(g.cls!=='')+(g.time!=='')+(g.conc?1:0)+(g.rit?1:0);
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
 h+=`<details class="filt"${filtCount(g)?' open':''}><summary id="gfs">${filtLabel(g)}</summary><div class="filtb"><div class="row"><label class="field"><span>École</span><select data-g="sch">${optList(schoolOpts(),g.sch)}</select></label><label class="field"><span>Classe</span><select data-g="cls">${optList([['','Toutes'],...NS.SPELL_CLASSES.map(n=>[n,n])],g.cls)}</select></label><label class="field"><span>Temps d'incantation</span><select data-g="time">${optList(TIME_OPTS,g.time)}</select></label></div>
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
 hdr.innerHTML=`<div class="top-row"><div class="who"><b id="hn">${e(c.name||'Personnage sans nom')}</b><span>${e(G(cl.n,c))}${sub?' · '+e(sub.n):''} niv. ${c.level}${c.species?' · '+e(G(SPN[c.species],c)):''}</span></div><div class="hbtns"><button class="btn small" data-a="grim">Grimoire</button><button class="btn small" data-a="list">Mes persos</button></div></div>
 <nav class="tabs" aria-label="Étapes">${TABS.map(([k,l])=>`<button class="tab" data-a="tab" data-v="${k}" ${S.tab===k?'aria-current="true"':''}>${l}</button>`).join('')}</nav>`;
 let h='';
 switch(S.tab){case 'id':h=tabId(c);break;case 'origin':h=tabOrigin(c,D);break;case 'cls':h=tabCls(c,D);break;case 'scores':h=tabScores(c,D);break;case 'spells':h=tabSpells(c,D);break;case 'equip':h=tabEquip(c,D);break;default:h=tabSheet(c,D);}
 const i=TABS.findIndex(t=>t[0]===S.tab);
 h+=`<div class="nav noprint">${i>0?`<button class="btn" data-a="tab" data-v="${TABS[i-1][0]}">Précédent</button>`:'<span></span>'}${i<TABS.length-1?`<button class="btn primary" data-a="tab" data-v="${TABS[i+1][0]}">Suivant</button>`:'<span></span>'}</div>`;
 app.innerHTML=h;bind();window.scrollTo(0,keepScroll?y:0);
}
function bind(){const t=document.getElementById('impf');if(t)t.onchange=ev=>{const f=ev.target.files&&ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>importText(String(r.result));r.readAsText(f);};}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>{t.hidden=true;},3500);}

/* ================== ACTIONS ================== */
function touch(){persist();}
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
 eq(d){const c=C();c[d.w]=d.v;touch();render(true);},
 addx(){const c=C();const n=document.getElementById('xn').value.trim();if(!n){toast('Indiquez le nom du sort.');return;}c.spells.x.push({n,lv:+document.getElementById('xl').value,free:document.getElementById('xf').checked,t:document.getElementById('xt').value});touch();render(true);},
 delx(d){const c=C();c.spells.x.splice(+d.i,1);touch();render(true);},
 print(){try{window.print();}catch(x){toast('Impression indisponible ici : téléchargez la fiche .html puis imprimez-la.');}},
 async expHtml(){const c=C();norm(c);const D=derive(c);const css='body{font-family:Georgia,serif;max-width:720px;margin:20px auto;padding:0 14px;color:#1B2238}h2,h3{margin:1rem 0 .3rem}.stat{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.stat div{border:1px solid #bbb;padding:6px;border-radius:6px}.stat b{display:block;font-size:1.3rem}.stat span,.muted,.small,.src{color:#555;font-size:.85rem}.abil{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.abil div{border:1px solid #bbb;padding:6px;text-align:center;border-radius:6px}.abil b{display:block;font-size:1.3rem}.abil small{display:block;font-size:.7rem}.skl{columns:2;list-style:none;padding:0}.skl li{display:flex;justify-content:space-between;border-bottom:1px dotted #bbb}.dot{display:inline-block;width:.7em;height:.7em;border-radius:50%;border:1.5px solid #000;margin-right:6px}.dot.f{background:#000}.dot.x{background:#1F6F63;border-color:#1F6F63}dt{font-weight:bold;margin-top:.5rem}dd{margin:0}';const html=`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${e(c.name||'Personnage')}</title><style>${css}</style></head><body>${sheetHTML(c,D)}</body></html>`;await saveFile((c.name||'personnage').replace(/[^\w\-]+/g,'_')+'.html',html);},
 async expJson(){const c=C();await saveFile((c.name||'personnage').replace(/[^\w\-]+/g,'_')+'.json',JSON.stringify({chars:[c]},null,1));},
 async expAll(){await saveFile('personnages-dnd2024.json',JSON.stringify({chars:S.chars},null,1));},
 imp(){const t=document.getElementById('impt').value.trim();if(!t){toast('Collez d\'abord le contenu JSON.');return;}importText(t);}
};
async function saveFile(name,data){
 try{
  if(!window.claude||!window.claude.use){toast('Téléchargement indisponible ici.');return;}
  const d=await window.claude.use('downloads');
  if(!d){toast('Téléchargement indisponible dans cette vue.');return;}
  await d.save({filename:name,data});toast('Fichier prêt.');
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
});

/* ================== DÉMARRAGE ================== */
load();
if(S.chars.length){if(!C())S.cur=S.chars[0].id;S.view='edit';}
else{const c=blank();S.chars.push(c);S.cur=c.id;S.view='edit';persist();}
render(false);

})();
