/* Application : état, calculs, rendu, actions */
(function(){
'use strict';
const NS=window.DND;
const {AB,ABN,ABS,SK,SKM,INSTR,SLOTS,OCC_SLOTS,OCC_PREP,RAGES,RAGEDMG,MANIF,PACT,cantN,e,G,mod,sg,uid,setp,clamp,roll4,metaCount,expCount,BARDDIE,CL,CFEAT,ASIFEAT,SUBS,DOMS,DRAC_SPELLS,SED_SPELLS,META,BG,ORIGIN_FEATS,SPN,DRAGONS,LIN,GEANT,HER,SPELLS,TIMES,SPELLDB,spellByName,canonName,filterSpells,fold,LONG_TIMES,V,SPELL_SCHOOLS,CAST,HALF_SLOTS,DMG_TYPES,classIcon,dmgIcon,speciesIcon,bgIcon,LOOK,lookDefaults,officialSheet,OFFICIAL_CSS,FEATS,FEAT_CATS,featBase,featByName,FEAT_ORIGIN,FEAT_GENERAL,FEAT_STYLES,FEAT_EPIC,featAbOptions,LANG_STD,LANG_RARE,langInfo,ALIGN,alignLabel,styleSlots,hpFixed,WEAPONS,weaponById,weaponsInText,weaponProf,isProf,TOOL_ROWS,weaponRow,unarmedRow,cantripRow,MARTIAL_DIE,GEAR,GEAR_CATS,gearById,gearByName,GENERIC,genVariants,parseStart,fmtMoney,TEMPLATES,buildTemplate}=NS;

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
const S={chars:[],cur:null,tab:'id',view:'edit',del:null,msg:'',sf:'',fmt:'official',g:newG(),glim:PAGE,sq:'',ecat:'wpn1',gopen:new Set(),sclosed:new Set(),sopen:new Set(),mopen:new Set(),sy:{busy:false,msg:'',err:false},gq:'',gcat:'',from:'list',spi:0,slv:'',sch:-1,sdm:'',slim:PAGE};
function load(){try{const r=localStorage.getItem(KEY);if(r){const d=JSON.parse(r);S.chars=Array.isArray(d.chars)?d.chars:[];S.cur=d.cur||null;S.fmt=d.fmt==='detail'?'detail':'official';}}catch(x){}}
/* Plusieurs onglets peuvent être ouverts : on n'écrit que les personnages modifiés ici (ids) et on retire ceux supprimés (rm), sans écraser le reste. */
function stored(){try{const d=JSON.parse(localStorage.getItem(KEY));return d&&typeof d==='object'?d:{};}catch(x){return {};}}
function persist(ids,rm,o){try{
  const d=stored(),st=Array.isArray(d.chars)?d.chars:[];
  (ids||[]).forEach(id=>{const c=S.chars.find(x=>x.id===id);if(!c)return;const i=st.findIndex(x=>x.id===id);
   /* date de dernière modification (synchronisation) : seulement si le contenu a vraiment changé */
   if(!(o&&o.keepMt)){const old=i>=0?st[i]:null;if(!old||JSON.stringify({...old,mt:0})!==JSON.stringify({...c,mt:0}))c.mt=Date.now();else c.mt=old.mt||c.mt||Date.now();}
   if(i>=0)st[i]=c;else st.push(c);});
  if(rm&&rm.length&&!(o&&o.quiet)&&NS.sync)NS.sync.tomb(rm);
  const out=(rm&&rm.length)?st.filter(x=>!rm.includes(x.id)):st;
  localStorage.setItem(KEY,JSON.stringify({chars:out,cur:S.cur,fmt:S.fmt}));
  const me=C();if(S.view==='edit'&&me)S.snap=JSON.stringify(me);
 }catch(x){}}
const go=u=>{location.href=u;};
const charUrl=(id,tab)=>'personnage.html?id='+encodeURIComponent(id)+(tab?'#'+tab:'');
function blank(){return{id:uid(),name:'',gender:'f',level:1,tl:1,mc:[],cls:'ensorceleur',sub:'',species:'',sp:{},bg:'',bgAsi:{mode:'21',p2:'',p1:''},bgTool:'',
 method:'standard',pool:[],asg:{},rr:0,bases:{standard:{for:8,dex:13,con:14,int:10,sag:12,cha:15},pointbuy:{for:8,dex:8,con:8,int:8,sag:8,cha:8}},base:{for:8,dex:13,con:14,int:10,sag:12,cha:15},cSk:[],sSk:[],exp:[],tools:[],meta:[],aff:'',feats:{},epic:'',
 spells:{c:[],p:[],x:[]},eqCls:'A',eqBg:'A',goldAdj:0,inv:'',arm:'none',shield:false,acManual:10,acBonus:0,hpBonus:0,story:'',appearance:'',portrait:'',opt:{},align:'',hpm:'auto',hpr:{},langs:[],langX:'',toolsX:'',toolsD:[],toolsV:1,eqKeep:{},eqVar:{},buy:[],eqSell:'full',eqv:2,fs:[],xs:{},skd:[],mi:[],gc:[],epicAb:''};}
function C(){return S.view==='tpl'&&S.tpl?S.tpl:(S.chars.find(c=>c.id===S.cur)||null);}
/* Portrait : simple lien vers une image en ligne, affichée sans être téléchargée par l'appli. Lien valide = http(s), 250 caractères max. */
const safeUrl=u=>{const s=String(u==null?'':u).trim();if(!(s.length<=250&&/^https?:\/\/[^\s"'<>]+$/i.test(s)))return'';const dv=s.match(/^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)/i);return dv?`https://drive.google.com/thumbnail?id=${dv[1]}&sz=w1000`:s;};
const portraitImg=(u,name,cls)=>{const s=safeUrl(u);return s?`<img class="pimg ${cls||''}" src="${e(s)}" alt="Portrait de ${e(name||'personnage')}" loading="lazy" referrerpolicy="no-referrer" decoding="async">`:'';};
const portraitBlock=(u,name)=>{const s=safeUrl(u);if(s)return portraitImg(s,name,'big');return String(u==null?'':u).trim()?'<div class="note warn">Lien non valide : il doit commencer par https:// (ou http://) et tenir en 250 caractères.</div>':'';};
/* ---------- Multiclassage ---------- */
/* La classe principale (la première prise) est portée par le personnage lui-même (c.cls, c.sub, c.level, c.opt…) ; les autres
   classes sont dans c.mc[]. eachCls(c,fn) met tour à tour chaque classe à la place de « c.cls… » : tout le code écrit pour une seule
   classe sert donc pour chacune d'elles. c.level est le niveau DANS la classe active ; c.tl est le niveau total du personnage. */
const CK=['cls','sub','level','opt','cSk','sSk','exp','meta','fs','gc','tools','xs','feats','epic','epicO','epicAb','aff','wm'];
const hid=(o,k,v)=>Object.defineProperty(o,k,{value:v,writable:true,enumerable:false,configurable:true});
const mkCls=cls=>({cls,sub:'',level:1,opt:{},cSk:[],sSk:[],exp:[],meta:[],fs:[],gc:[],tools:[],xs:{},feats:{},epic:'',epicO:0,epicAb:'',aff:'',wm:[],spells:{c:[],p:[]}});
function stash(c,o){CK.forEach(k=>{o[k]=c[k];});o.spells={c:c.spells.c,p:c.spells.p};}
function unstash(c,o){CK.forEach(k=>{c[k]=o[k];});c.spells={c:o.spells.c,p:o.spells.p,x:c.spells.x};}
function sw(c,to){
 const from=c._ai||0;if(from===to)return;
 if(!c._p)hid(c,'_p',{});
 const h=i=>i===0?c._p:c.mc[i-1];
 stash(c,h(from));unstash(c,h(to));hid(c,'_ai',to);
}
function eachCls(c,fn){const a=c._ai||0,n=1+(c.mc||[]).length,r=[];try{for(let i=0;i<n;i++){sw(c,i);r.push(fn(c,i));}}finally{sw(c,a);}return r;}
const withCls=(c,i,fn)=>{const a=c._ai||0;try{sw(c,i);return fn();}finally{sw(c,a);}};
NS.eachCls=eachCls;
const CS=c=>eachCls(c,(x,i)=>({i,cls:x.cls,sub:x.sub,level:x.level}));
const multi=c=>(c.mc||[]).length>0;
/* bottes d'arme : nombre de types d'armes selon la classe et son niveau */
const WMN={barbare:L=>L>=10?4:L>=4?3:2,guerrier:L=>L>=16?6:L>=10?5:L>=4?4:3,paladin:()=>2,rodeur:()=>2,roublard:()=>2};
const MASTERY_HELP=[['Coup double',"L'attaque supplémentaire de la propriété Légère se fait avec l'action Attaquer, sans action bonus (une fois par tour)."],
 ['Écorchure',"Sur un échec, vous infligez quand même des dégâts égaux au modificateur de l'attaque."],
 ['Enchaînement',"Après un coup au corps à corps, attaque contre une seconde créature à 1,5 m de la première, sans le modificateur aux dégâts (une fois par tour)."],
 ['Ouverture',"Après avoir blessé une créature, Avantage à votre prochaine attaque contre elle avant la fin de votre prochain tour."],
 ['Poussée',"Sur un coup, vous repoussez la cible de 3 m en ligne droite si elle est de taille G ou moins."],
 ['Ralentissement',"Sur un coup qui blesse, la Vitesse de la cible baisse de 3 m jusqu'au début de votre prochain tour (non cumulable)."],
 ['Renversement',"Sur un coup, la cible fait un jet de Constitution (DD 8 + modificateur + maîtrise) ou tombe À terre."],
 ['Sape',"Sur un coup, la cible a Désavantage à sa prochaine attaque avant le début de votre prochain tour."]];
/* outils : listes du catalogue d'équipement */
const TOOL_CATS=[['artisan',"Outils d'artisan"],['autre','Autres outils'],['jeu','Jeux'],['musique','Instruments de musique']];
const toolsOf=cat=>TOOL_ROWS.filter(t=>t[1]===cat).map(t=>t[0]);
const toolCatOf=hint=>/artisan/i.test(hint)?'artisan':/instrument/i.test(hint)?'musique':/jeu/i.test(hint)?'jeu':'';
/* maîtrises obtenues en prenant une classe en plus (Manuel des Joueurs 2024), puis compétences de classe à choisir */
const MCPROF={barbare:['Armes de guerre','Boucliers'],barde:['Armures légères'],clerc:['Armures intermédiaires','Boucliers'],druide:['Armures légères','Boucliers'],ensorceleur:[],
 guerrier:['Armes de guerre','Armures légères et intermédiaires','Boucliers'],magicien:[],moine:[],occultiste:['Armures légères'],paladin:['Armes de guerre','Armures légères et intermédiaires','Boucliers'],
 rodeur:['Armes de guerre','Armures légères et intermédiaires','Boucliers'],roublard:['Armures légères','Outils de voleur']};
const MCPICK={barde:1,rodeur:1,roublard:1};
const skPick=(c,i)=>i===0?CL[c.cls].pick:(MCPICK[c.cls]||0);
const toolPick=(c,i)=>c.cls==='barde'?(i===0?3:1):0;
/* prérequis : 13 dans la caractéristique principale de chaque classe (« ou » pour le guerrier) */
const MCPRE={barbare:[['for']],barde:[['cha']],clerc:[['sag']],druide:[['sag']],ensorceleur:[['cha']],guerrier:[['for','dex']],magicien:[['int']],moine:[['dex'],['sag']],occultiste:[['cha']],paladin:[['for'],['cha']],rodeur:[['dex'],['sag']],roublard:[['dex']]};
function mcWarn(c,D){
 const out=[];if(!multi(c))return out;
 CS(c).forEach(k=>{(MCPRE[k.cls]||[]).forEach(alt=>{if(!alt.some(a=>D.ab[a]>=13))out.push(`Multiclassage : ${G(CL[k.cls].n,c)} demande ${alt.map(a=>ABN[a]).join(' ou ')} 13 minimum (actuellement ${alt.map(a=>D.ab[a]).join(' / ')}).`);});});
 return out;
}
/* dés de vie : un par niveau, du dé de la classe où il a été gagné ; le niveau 1 compte pour la classe principale */
function hdSeq(c){const s=[];eachCls(c,(x,i)=>{for(let k=0;k<x.level;k++)s.push({hd:CL[x.cls].hd,cls:x.cls,i});});return s;}
/* « Barde · Collège de la Danse niv. 3 » ou, en multiclassage, « Barde 3 / Guerrier 2 · niv. 5 » (fonctionne aussi sur un personnage non normalisé) */
function clsLine(c,mode){
 const list=[{cls:c.cls,sub:c.sub,level:+c.level||1},...(Array.isArray(c.mc)?c.mc:[])].filter(k=>k&&CL[k.cls]);
 if(list.length>1){const t=list.reduce((n,k)=>n+(+k.level||1),0);return list.map(k=>G(CL[k.cls].n,c)+' '+(+k.level||1)).join(' / ')+(mode==='s'?' · niveau '+t:' · niv. '+t);}
 const k=list[0]||{cls:'ensorceleur',level:1},sb=(SUBS[k.cls]||{})[k.sub],nm=G(CL[k.cls].n,c);
 return mode==='l'?nm+' niveau '+k.level:mode==='s'?nm+(sb?' · '+sb.n:'')+' niveau '+k.level:nm+(sb?' · '+sb.n:'')+' niv. '+k.level;
}
/* espèce avec son lignage ou son héritage : « Elfe (Drow) », « Tieffelin (Infernal) »… */
function speciesLabel(c){
 if(!c.species)return '';const n=G(SPN[c.species],c),o=c.sp||{};let v='';
 if(c.species==='elfe'&&LIN[o.lin])v=G(LIN[o.lin].n,c);
 else if(c.species==='drakeide'&&DRAGONS[o.anc])v='dragon '+o.anc.toLowerCase();
 else if(c.species==='goliath'&&GEANT[o.geant])v=GEANT[o.geant][0];
 else if(c.species==='tieffelin'&&HER[o.her])v=HER[o.her].n;
 else if(c.species==='gnome')v=o.lin==='forets'?'des forêts':o.lin==='roches'?'des roches':'';
 return v?n+' ('+v+')':n;
}
/* icônes de toutes les classes du personnage (la principale d'abord) */
const CLS_EMO={barbare:'🪓',barde:'🎵',clerc:'🙏',druide:'🌿',ensorceleur:'✨',guerrier:'⚔️',magicien:'🔮',moine:'👊',occultiste:'👁️',paladin:'🛡️',rodeur:'🏹',roublard:'🗡️'};
const clsIcons=(c,size)=>[c.cls,...(Array.isArray(c.mc)?c.mc.map(k=>k&&k.cls):[])].filter((k,i,a)=>CL[k]&&a.indexOf(k)===i).map(k=>classIcon(k,size)).join('');
function hdText(seq){const m={};seq.forEach(s=>{m[s.hd]=(m[s.hd]||0)+1;});return Object.keys(m).map(Number).sort((a,b)=>b-a).map(h=>m[h]+'d'+h).join(' + ');}
/* ---------- Données de classe : lecture générique ---------- */
const asiOf=c=>(CL[c.cls]&&CL[c.cls].asi)||[4,8,12,16];
const subOf=c=>(SUBS[c.cls]||{})[c.sub];
const subTools=c=>[].concat(...eachCls(c,x=>{const s=subOf(x);return s&&s.tools&&x.level>=3?s.tools:[];}));   /* outils donnés par les sous-classes */
/* maîtrises de la classe x : classe principale en entier, classes en plus : seulement celles du multiclassage */
const profOf=(x,i)=>(i===0?CL[x.cls].prof:MCPROF[x.cls].join(' · '))+(CL[x.cls].profExtra?CL[x.cls].profExtra(x):'');
function profTxt(c){const seen=new Set(),out=[];
 eachCls(c,(x,i)=>{profOf(x,i).split(' · ').map(s=>s.trim()).filter(Boolean).forEach(p=>{if(!seen.has(p)){seen.add(p);out.push(p);}});});
 return(out.some(p=>/Armures|Boucliers/i.test(p))?out.filter(p=>!/^Aucune (formation|armure)/i.test(p)):out).join(' · ');}
const toolsAll=c=>[].concat(...eachCls(c,x=>[...x.tools,x.xs.tool])).filter(Boolean);
/* choix propres à la classe ou à la sous-classe (ordre primitif, environnement…) */
function optsOf(c){const cl=CL[c.cls],sub=subOf(c);return[...(cl.opts||[]),...((sub&&c.level>=3&&sub.opts)||[])];}
/* incantation : emplacements, sorts mineurs et préparés selon le type de lanceur */
function castOf(c){
 const L=c.level,cl=CL[c.cls],cs=CAST[c.cls],sub=subOf(c);
 const r={slots:[],cantN:0,prepN:0,third:false};
 if(!cs)return r;
 if(cs.t==='full'){r.slots=SLOTS[L-1];r.cantN=cl.cant(L);r.prepN=cl.prep(L);}
 else if(cs.t==='half'){r.slots=HALF_SLOTS[L-1];r.cantN=cl.cant(L);r.prepN=cl.prep(L);}
 else if(cs.t==='pact'){const pl=PACT[L-1];const pa=Array(pl[1]).fill(0);pa[pl[1]-1]=pl[0];r.slots=pa;r.pact={n:pl[0],lvl:pl[1]};r.cantN=cl.cant(L);r.prepN=cl.prep(L);}
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
 const mu=multi(c);
 eachCls(c,x=>{const sfx=mu?' ('+G(CL[x.cls].n,c)+')':'';
  (x.fs||[]).forEach(n=>out.push({n,src:'Style de combat',cls:x.cls,gc:x.gc}));
  asiOf(x).forEach(lv=>{if(lv<=x.level){const f=x.feats[lv];if(f&&f.k!=='asi'&&f.t)out.push({n:f.t,src:'Niveau '+lv+sfx,lv,a:f.a});}});
  if(x.level>=19&&x.epic)out.push({n:x.epic,src:'Niveau 19'+sfx,a:x.epicAb,epic:1});});
 return out.map(x=>({...x,base:featBase(x.n)}));
}
const hasFeat=(c,base)=>featsOf(c).some(f=>f.base===base);
const nDoue=c=>featsOf(c).filter(f=>f.base==='Doué').length;
/* Doué : trois maîtrises par exemplaire, compétences ou outils ; les outils sont saisis dans un champ libre (séparés par des virgules) */
const toolsN=c=>String(c.toolsX||'').split(/[,;\n]| et /).map(x=>x.trim()).filter(Boolean).length;
const doueUsed=c=>c.skd.length+(c.toolsD||[]).length+toolsN(c);
/* Initié à la magie : une entrée par exemplaire du don ; la classe est imposée par l'historique (« … (clerc) ») ou à choisir */
const MI_CLS=[['clerc','Clerc'],['druide','Druide'],['magicien','Magicien']];
const miInst=c=>featsOf(c).filter(f=>f.base==='Initié à la magie').map(f=>{const m=f.n.match(/\((clerc|druide|magicien)\)/i);return{src:f.src,fixed:m?m[1].toLowerCase():''};});
/* Combattant béni (paladin) et Combattant druidique (rôdeur) : au lieu d'un don de style, deux sorts mineurs */
const WARRIOR={paladin:['Combattant béni','clerc','cha'],rodeur:['Combattant druidique','druide','sag']};
/* Belluaire (rôdeur) : type de bête du Compagnon primitif. Caractéristiques du Manuel des Joueurs 2024 ; PV et dés de vie selon le niveau de rôdeur. */
const BEASTS={
 land:{n:'Bête des terres',size:'Moyenne',speed:'12 m, escalade 12 m',senses:'Vision dans le noir 18 m',hpBase:5,hpPer:5,hd:8,dice:'1d8',dmgBonus:2,dmgType:'contondants, perforants ou tranchants (à votre choix lorsque vous invoquez la bête)',abil:[14,14,15,8,14,11],
  extra:"Si la bête s'est déplacée d'au moins 6 m en ligne droite vers la cible avant de la toucher : 1d6 dégâts supplémentaires du même type, et la cible est À terre si elle est de taille G ou inférieure.",traits:'',extraN:'Charge',tn:'',tt:''},
 sea:{n:'Bête des mers',size:'Moyenne',speed:'1,5 m, nage 18 m',senses:'Vision dans le noir 27 m',hpBase:5,hpPer:5,hd:8,dice:'1d6',dmgBonus:2,dmgType:'contondants ou perforants (à votre choix lorsque vous invoquez la bête)',abil:[14,14,15,8,14,11],
  extra:"La cible est Agrippée (évasion : DD de sauvegarde de vos sorts).",traits:"Amphibie (respire sous l'eau comme à l'air libre).",extraN:'Agrippe',tn:'Amphibie',tt:"respire sous l'eau comme à l'air libre."},
 sky:{n:'Bête des cieux',size:'Petite',speed:'3 m, vol 18 m',senses:'Vision dans le noir 18 m',hpBase:4,hpPer:4,hd:6,dice:'1d4',dmgBonus:3,dmgType:'tranchant',abil:[6,16,13,8,14,11],
  extra:'',tn:'Repli aérien',tt:"la bête ne provoque pas d'attaque d'opportunité en quittant l'allonge d'un ennemi en volant.",traits:"Repli aérien : la bête ne provoque pas d'attaque d'opportunité en quittant l'allonge d'un ennemi en volant."}
};

/* normalisation d'une classe (la classe active) : sous-classe, dons de niveau, style de combat, choix propres à la classe */
function normCls(c,i){
 const cl=CL[c.cls];
 c.opt=c.opt||{};c.feats=c.feats||{};c.xs=c.xs&&typeof c.xs==='object'?c.xs:{};
 if(c.sub&&!(SUBS[c.cls]&&SUBS[c.cls][c.sub]&&SUBS[c.cls][c.sub].ok))c.sub='';
 [4,6,8,10,12,14,16].forEach(lv=>{if(!c.feats[lv])c.feats[lv]={k:'asi',m:'2',a:([6,10,14].includes(lv)?'':'cha'),b:'',t:''};});
 {const n=styleSlots(c),W=WARRIOR[c.cls];
  c.fs=(Array.isArray(c.fs)?c.fs:[]).filter((x,k,a)=>(FEAT_STYLES.some(f=>f.n===x)||(W&&x===W[0]))&&a.indexOf(x)===k).slice(0,n);
  const wc=W&&c.fs.includes(W[0])?W[1]:null;
  c.gc=wc?(Array.isArray(c.gc)?c.gc:[]).filter((s,k,a)=>(SPELLS[wc][0]||[]).includes(s)&&a.indexOf(s)===k).slice(0,2):[];}
 c.epicAb=(c.level>=19&&AB.includes(c.epicAb))?c.epicAb:'';
 asiOf(c).forEach(lv=>{const f=c.feats[lv];if(f&&f.k!=='asi'){const ft=featByName(f.t),o=ft?featAbOptions(ft,cl):[];if(!o.includes(f.a))f.a=(o.length===1)?o[0]:'';}});
 {const base0=[...(BG[c.bg]?BG[c.bg].sk:[])];if(c.species==='humain'&&c.sp.skill)base0.push(c.sp.skill);if(c.species==='elfe'&&c.sp.sense)base0.push(c.sp.sense);
  const ox=[];eachCls(c,(y,j)=>{if(j!==i)ox.push(y.xs.primal,y.xs.martial);});
  const pk=c.xs.primal;c.xs.primal=(c.cls==='barbare'&&c.level>=3&&(CL.barbare.skills||[]).includes(pk)&&!base0.includes(pk)&&!ox.includes(pk))?pk:'';
  const mk=c.xs.martial,mst=c.cls==='guerrier'&&c.sub==='maitre'&&c.level>=3;
  c.xs.martial=(mst&&(CL.guerrier.skills||[]).includes(mk)&&!base0.includes(mk)&&mk!==c.xs.primal&&!ox.includes(mk))?mk:'';
  c.xs.tool=mst?String(c.xs.tool||'').slice(0,60):'';}
 {const n=WMN[c.cls]?WMN[c.cls](c.level):0,pr=weaponProf(profTxt(c));
  c.wm=(Array.isArray(c.wm)?c.wm:[]).filter((id,k,a)=>{const w=weaponById(id);return w&&a.indexOf(id)===k&&isProf(w,pr);}).slice(0,n);}
 optsOf(c).forEach(o=>{if(!o.c.some(x=>x[0]===c.opt[o.k]))c.opt[o.k]='';});
 c.meta=(c.cls==='ensorceleur')?(Array.isArray(c.meta)?c.meta:[]).filter((m,k,a)=>META[m]&&a.indexOf(m)===k).slice(0,metaCount(c.level)):[];
 if(c.cls!=='ensorceleur'||c.sub!=='draconique'||c.level<6)c.aff=c.aff&&c.sub==='draconique'?c.aff:'';
}
/* deuxième passe, une fois les dons et maîtrises d'origine connus : compétences, expertise, instruments, sorts */
function normCls2(c,i){
 const cl=CL[c.cls],fixed=fixedSk(c);
 const oth=[];eachCls(c,(y,j)=>{if(j!==i)oth.push(...y.cSk,...y.sSk);});
 const allowed=cl.skills||SK.map(s=>s[0]);
 c.cSk=(Array.isArray(c.cSk)?c.cSk:[]).filter((s,k,a)=>allowed.includes(s)&&!fixed.includes(s)&&!oth.includes(s)&&a.indexOf(s)===k).slice(0,skPick(c,i));
 if(c.cls==='barde'&&c.sub==='savoir'&&c.level>=3){c.sSk=(Array.isArray(c.sSk)?c.sSk:[]).filter((s,k,a)=>!fixed.includes(s)&&!c.cSk.includes(s)&&!oth.includes(s)&&a.indexOf(s)===k).slice(0,3);}else c.sSk=[];
 const prof=profSk(c);
 {const eN=cl.expN?cl.expN(c.level):0;const pool=cl.expOf?prof.filter(s=>cl.expOf.includes(s)):prof;c.exp=eN?(Array.isArray(c.exp)?c.exp:[]).filter((s,k,a)=>pool.includes(s)&&a.indexOf(s)===k).slice(0,eN):[];}
 c.tools=(Array.isArray(c.tools)?c.tools:[]).slice(0,toolPick(c,i));
 const maxLv=castOf(c).slots.length;
 c.spells.p=c.spells.p.map(canonName).filter((n,k,a)=>a.indexOf(n)===k&&(()=>{for(let l=1;l<=maxLv;l++){if((SPELLS[c.cls][l]||[]).includes(n))return true;}return false;})());
 c.spells.c=c.spells.c.map(canonName).filter((n,k,a)=>a.indexOf(n)===k&&(SPELLS[c.cls][0]||[]).includes(n));
}
function norm(c){
 sw(c,0);
 if(typeof c.portrait!=='string')c.portrait='';c.portrait=c.portrait.slice(0,250);
 c.beast=c.beast&&typeof c.beast==='object'?c.beast:{};c.beast.t=BEASTS[c.beast.t]?c.beast.t:'';['name','race'].forEach(k=>{c.beast[k]=typeof c.beast[k]==='string'?c.beast[k].slice(0,40):'';});
 c.sp=c.sp||{};c.bgAsi=c.bgAsi||{mode:'21',p2:'',p1:''};c.base=c.base||{};AB.forEach(a=>{if(!c.base[a])c.base[a]=8;});
 c.feats=c.feats||{};c.spells=c.spells||{c:[],p:[],x:[]};['c','p','x'].forEach(k=>{c.spells[k]=c.spells[k]||[];});
 ['cSk','sSk','exp','tools','meta'].forEach(k=>{c[k]=c[k]||[];});c.opt=c.opt||{};c.xs=c.xs&&typeof c.xs==='object'?c.xs:{};
 if(!['m','f','-'].includes(c.gender))c.gender='f';
 /* Apparence : champ libre. Les anciens choix (cheveux, yeux, teint) sont convertis en texte une seule fois. */
 {const lk=c.look&&typeof c.look==='object'?c.look:{};
  if(typeof c.appearance!=='string')c.appearance=Object.keys(lk).length?lookText({...c,look:lk}):'';
  c.appearance=c.appearance.slice(0,2000);delete c.look;}
 if(!CL[c.cls])c.cls='ensorceleur';
 /* classes en plus de la classe principale : chacune une seule fois, niveau total de 20 au plus */
 {const seen=[c.cls];
  c.mc=(Array.isArray(c.mc)?c.mc:[]).filter(o=>o&&CL[o.cls]&&!seen.includes(o.cls)&&seen.push(o.cls)).slice(0,11);
  c.mc.forEach(o=>{const d=mkCls(o.cls);Object.keys(d).forEach(k=>{if(o[k]==null||typeof o[k]!==typeof d[k]||Array.isArray(o[k])!==Array.isArray(d[k]))o[k]=d[k];});
   o.spells={c:Array.isArray(o.spells&&o.spells.c)?o.spells.c:[],p:Array.isArray(o.spells&&o.spells.p)?o.spells.p:[]};});
  c.level=clamp(Math.floor(+c.level)||1,1,20);c.mc.forEach(o=>{o.level=clamp(Math.floor(+o.level)||1,1,20);});
  let tot=c.level+c.mc.reduce((t,o)=>t+o.level,0);
  for(let k=c.mc.length-1;k>=0&&tot>20;k--){const d=Math.min(tot-20,c.mc[k].level-1);c.mc[k].level-=d;tot-=d;}
  if(tot>20){c.level-=tot-20;tot=20;}
  c.tl=tot;}
 c.align=ALIGN.some(a=>a[0]===c.align)?c.align:'';
 c.hpm=c.hpm==='roll'?'roll':'auto';
 {const src=c.hpr&&typeof c.hpr==='object'?c.hpr:{},o={},sq=hdSeq(c);for(let lv=2;lv<=c.tl;lv++){const v=Math.floor(+src[lv]);if(v>=1&&v<=sq[lv-1].hd)o[lv]=v;}c.hpr=o;}
 c.toolsX=String(c.toolsX||'').slice(0,160);
 /* Équipement : lignes de départ gardées ou retirées, objets choisis, achats, taux de revente */
 {const okKey=k=>/^[cb]\d+$/.test(k);
  const keep={},vr={};
  if(c.eqKeep&&typeof c.eqKeep==='object')Object.keys(c.eqKeep).forEach(k=>{const v=Math.floor(+c.eqKeep[k]);if(okKey(k)&&v>=0&&v<1000)keep[k]=v;});
  if(c.eqVar&&typeof c.eqVar==='object')Object.keys(c.eqVar).forEach(k=>{if(okKey(k)&&gearById(c.eqVar[k]))vr[k]=c.eqVar[k];});
  c.eqKeep=keep;c.eqVar=vr;c.eqSell=c.eqSell==='half'?'half':'full';
  c.buy=(Array.isArray(c.buy)?c.buy:[]).map(b=>b=b||{}).map(b=>({id:gearById(b.id)?b.id:'',n:String(b.n||'').slice(0,60),q:clamp(Math.floor(+b.q)||0,0,99),p:Math.max(0,Math.round(+b.p)||0),free:!!b.free})).filter(b=>b.q>0&&(b.id||b.n));
  /* changer de classe, de choix d'équipement ou d'historique repart du nouveau paquet de départ */
  /* le paquet de départ suit la classe principale ; si des lignes avaient été modifiées avant un changement de classe, on garde l'ancien paquet (au joueur de choisir) */
  if(c.eqLast!==undefined&&c.eqLast!==c.cls){const custom=Object.keys(c.eqKeep).some(k=>k[0]==='c')||Object.keys(c.eqVar).some(k=>k[0]==='c');c.eqSrc=custom?(c.eqSrc||c.eqLast):'';}
  c.eqLast=c.cls;if(!CL[c.eqSrc]||c.eqSrc===c.cls)c.eqSrc='';
  const sc=packCls(c)+'|'+c.eqCls,sb=c.bg+'|'+c.eqBg;
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
 eachCls(c,normCls);
 {const base0=[...(BG[c.bg]?BG[c.bg].sk:[])];if(c.species==='humain'&&c.sp.skill)base0.push(c.sp.skill);if(c.species==='elfe'&&c.sp.sense)base0.push(c.sp.sense);
  const xsAll=[];eachCls(c,x=>xsAll.push(x.xs.primal,x.xs.martial));
  c.skd=(Array.isArray(c.skd)?c.skd:[]).filter((s,i,a)=>SKM[s]&&a.indexOf(s)===i&&!base0.includes(s)&&!xsAll.includes(s)).slice(0,3*nDoue(c));}
 {const known=TOOL_ROWS.map(t=>t[0]);let d=Array.isArray(c.toolsD)?c.toolsD:[];
  if(!c.toolsV){const rest=[];String(c.toolsX||'').split(/[,;\n]| et /).map(x=>x.trim()).filter(Boolean).forEach(t=>{const m=known.find(k=>fold(k)===fold(t));if(m)d=[...d,m];else rest.push(t);});c.toolsX=rest.join(', ');c.toolsV=1;}
  c.toolsD=d.filter((x,i,a)=>known.includes(x)&&a.indexOf(x)===i).slice(0,Math.max(0,3*nDoue(c)-c.skd.length));}
 {const inst=miInst(c);c.mi=inst.map((x,i)=>{const o=(Array.isArray(c.mi)&&c.mi[i])||{};const cls=x.fixed||(MI_CLS.some(m=>m[0]===o.cls)?o.cls:'');const Ls=cls?SPELLS[cls]:null;
   return{cls,fixed:!!x.fixed,src:x.src,cant:Ls?(Array.isArray(o.cant)?o.cant:[]).filter((s,j,a)=>(Ls[0]||[]).includes(s)&&a.indexOf(s)===j).slice(0,2):[],
    spl:Ls&&(Ls[1]||[]).includes(o.spl)?o.spl:'',ab:['int','sag','cha'].includes(o.ab)?o.ab:''};});}
 eachCls(c,normCls2);
 if(!c.bases){const std={for:8,dex:13,con:14,int:10,sag:12,cha:15},pbd={for:8,dex:8,con:8,int:8,sag:8,cha:8};c.bases={standard:c.method==='standard'?{...c.base}:std,pointbuy:c.method==='pointbuy'?{...c.base}:pbd};}
 ['standard','pointbuy'].forEach(k=>{c.bases[k]=c.bases[k]||{};AB.forEach(a=>{if(!c.bases[k][a])c.bases[k][a]=8;});});
 (c.spells.x||[]).forEach(q=>{if(q.t&&q.t!=='a')TIMES[q.n]=q.t;});
 c.pool=Array.isArray(c.pool)?c.pool.slice(0,6):[];c.asg=c.asg||{};c.rr=+c.rr||0;
 {const used=[];AB.forEach(a=>{const raw=c.asg[a];const i=(raw===''||raw==null)?-1:+raw;if(i>=0&&i<c.pool.length&&!used.includes(i)){used.push(i);c.asg[a]=i;}else c.asg[a]='';});}
 if(c.method==='standard')c.base={...c.bases.standard};
 else if(c.method==='pointbuy')c.base={...c.bases.pointbuy};
 else{AB.forEach(a=>{c.base[a]=c.asg[a]===''?8:c.pool[c.asg[a]].v;});}
}
function fixedSk(c){const s=[];const bg=BG[c.bg];if(bg)s.push(...bg.sk);if(c.species==='humain'&&c.sp.skill&&!s.includes(c.sp.skill))s.push(c.sp.skill);if(c.species==='elfe'&&c.sp.sense&&!s.includes(c.sp.sense))s.push(c.sp.sense);[c.xs&&c.xs.primal,c.xs&&c.xs.martial,...(c.skd||[])].forEach(x=>{if(x&&!s.includes(x))s.push(x);});return s;}
function profSk(c){const s=[...fixedSk(c),...c.cSk,...c.sSk];return s.filter((x,i)=>s.indexOf(x)===i);}

/* ================== CALCULS ================== */
function spInfo(c,m,pb){
 const o=c.sp||{};const L=c.tl;const r={size:'M',speed:9,dv:0,res:[],tr:[],cant:[],spl:[]};
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
 else if(b==='Doué'){const t=[...c.skd.map(x=>SKM[x].n),...(c.toolsD||[]),...String(c.toolsX||'').split(/[,;\n]| et /).map(x=>x.trim()).filter(Boolean)];if(t.length)s.push('Maîtrise : '+t.join(', ')+'.');}
 else if(b==='Initié à la magie'&&m&&m.cls)s.push([...m.cant,m.spl].filter(Boolean).join(', ')+'.');
 else if(f.cls&&WARRIOR[f.cls]&&b===WARRIOR[f.cls][0]&&f.gc&&f.gc.length)s.push(f.gc.join(', ')+'.');
 if(f.a&&ABN[f.a])s.push('+1 en '+ABN[f.a]+(f.epic?' (maximum 30)':'')+'.');
 if(b==='Résilient'&&f.a)s.push('Maîtrise du jet de sauvegarde.');
 return s.join(' ');
}

function derive(c){const a=c._ai||0;sw(c,0);try{return derive0(c);}finally{sw(c,a);}}
function derive0(c){
 const D={};const TL=c.tl,K=CS(c);
 D.pb=Math.ceil(TL/4)+1;
 const ab={};AB.forEach(a=>ab[a]=+c.base[a]||8);D.base={...ab};
 const bg=BG[c.bg];D.bgB={};AB.forEach(a=>D.bgB[a]=0);
 if(bg){if(c.bgAsi.mode==='111')bg.ab.forEach(a=>D.bgB[a]=1);else{if(bg.ab.includes(c.bgAsi.p2))D.bgB[c.bgAsi.p2]+=2;if(bg.ab.includes(c.bgAsi.p1)&&c.bgAsi.p1!==c.bgAsi.p2)D.bgB[c.bgAsi.p1]+=1;}}
 D.ftB={};AB.forEach(a=>D.ftB[a]=0);
 const abbs=[],epics=[];
 eachCls(c,x=>{const cl=CL[x.cls];
  asiOf(x).forEach(lv=>{if(lv<=x.level){const f=x.feats[lv];if(f&&f.k==='asi'){if(f.m==='2'){if(f.a)D.ftB[f.a]+=2;}else{if(f.a)D.ftB[f.a]+=1;if(f.b&&f.b!==f.a)D.ftB[f.b]+=1;}}else if(f&&f.a){const ft=featByName(f.t);if(ft&&featAbOptions(ft,cl).includes(f.a))D.ftB[f.a]+=1;}}});
  const b=cl.abBonus?cl.abBonus(x.level):null;if(b)abbs.push(b);
  if(x.level>=19&&x.epicAb)epics.push(x.epicAb);});
 D.ab={};D.mod={};
 AB.forEach(a=>{let v=Math.min(20,ab[a]+D.bgB[a]+D.ftB[a]);abbs.forEach(b=>{if(b.ab.includes(a))v=Math.min(b.max,v+b.n);});epics.forEach(x=>{if(x===a)v=Math.min(30,v+1);});D.ab[a]=v;D.mod[a]=mod(v);});
 D.sp=spInfo(c,D.mod,D.pb);
 D.prof=profSk(c);
 const sbn={},xpall=[];
 eachCls(c,x=>{const f=CL[x.cls].skillB;if(f)SK.forEach(([id])=>{sbn[id]=(sbn[id]||0)+f(x,id,D);});xpall.push(...x.exp);});
 const jack=K.some(k=>k.cls==='barde'&&k.level>=2);
 D.skill={};SK.forEach(([id,n,a])=>{const p=D.prof.includes(id),x=xpall.includes(id);let b=D.mod[a];if(p)b+=D.pb*(x?2:1);else if(jack)b+=Math.floor(D.pb/2);b+=sbn[id]||0;D.skill[id]={n,a,p,x,b};});
 const svx=[];
 eachCls(c,x=>{const cl=CL[x.cls],sub=subOf(x);svx.push(...(cl.saveExtra?cl.saveExtra(x.level):[]),...(sub&&sub.saveExtra?sub.saveExtra(x.level):[]));
  asiOf(x).filter(lv=>lv<=x.level).map(lv=>x.feats[lv]).filter(f=>f&&f.k!=='asi'&&featBase(f.t)==='Résilient'&&f.a).forEach(f=>svx.push(f.a));});
 D.save={};AB.forEach(a=>{const p=CL[c.cls].saves.includes(a)||svx.includes(a);D.save[a]={p,b:D.mod[a]+(p?D.pb:0)};});
 /* points de vie : un dé par niveau, celui de la classe où le niveau a été gagné */
 const seq=hdSeq(c);D.hdSeq=seq;D.hitDice=hdText(seq);D.hpAvg=hpFixed(seq[0].hd);
 D.hpL1=seq[0].hd+D.mod.con;D.hpLv={};let hp=D.hpL1;
 for(let lv=2;lv<=TL;lv++){const r=(c.hpm==='roll'&&c.hpr[lv])?c.hpr[lv]:hpFixed(seq[lv-1].hd);D.hpLv[lv]=Math.max(1,r+D.mod.con);hp+=D.hpLv[lv];}
 eachCls(c,x=>{if(x.cls==='ensorceleur'&&x.sub==='draconique'&&x.level>=3)hp+=x.level;});
 if(c.species==='nain')hp+=TL;
 if(hasFeat(c,'Robuste'))hp+=2*TL;
 hp+=(+c.hpBonus||0);D.hp=Math.max(hp,TL);
 let ac=10+D.mod.dex,note='Sans armure';
 const AR=armorOf(c);
 if(AR){const a=AR.arm;ac=a.base+(a.cap===null?D.mod.dex:a.cap===0?0:Math.min(D.mod.dex,a.cap));note=AR.n;}
 else if(c.arm==='autre'){ac=+c.acManual||10;note='Armure (valeur saisie)';}
 else{
  eachCls(c,x=>{const cl=CL[x.cls],L=x.level;
   if(x.cls==='barbare'){const v=10+D.mod.dex+D.mod.con;if(v>ac){ac=v;note='Défense sans armure (10 + Dex + Con)';}}
   if(cl.acUn&&!(cl.acUn.noShield&&c.shield)){const v=10+cl.acUn.ab.reduce((t,a)=>t+D.mod[a],0);if(v>ac){ac=v;note=cl.acUn.note;}}
   if(x.cls==='barde'&&x.sub==='danse'&&!c.shield&&L>=3){const v=10+D.mod.dex+D.mod.cha;if(v>ac){ac=v;note='Pirouettes éblouissantes (10 + Dex + Cha)';}}
   if(x.cls==='ensorceleur'&&x.sub==='draconique'&&L>=3){const v=10+D.mod.dex+D.mod.cha;if(v>ac){ac=v;note='Résistance draconique (10 + Dex + Cha)';}}
  });
 }
 if(wears(c)&&hasFeat(c,'Défense')){ac+=1;note+=' + Défense';}
 if(c.shield)ac+=2;ac+=(+c.acBonus||0);D.ac=ac;D.acNote=note+(c.shield?' + bouclier':'');
 let spUn=0,initB=0;
 eachCls(c,x=>{const cl=CL[x.cls],sub=subOf(x);if(cl.speedUn&&!wears(c)&&!c.shield)spUn+=cl.speedUn(x.level);if(sub&&sub.initB&&x.level>=3)initB+=D.mod[sub.initB];});
 D.speed=D.sp.speed+spUn-(AR&&AR.arm.str&&D.ab.for<AR.arm.str?3:0);D.init=D.mod.dex+initB+(hasFeat(c,'Vigilant')?D.pb:0);
 /* incantation : un bloc par classe qui lance des sorts ; emplacements partagés (niveau d'incantateur) et emplacements de pacte à part */
 D.cast=[];let casterLvl=0,nSlot=0,one=[];D.pact=null;
 eachCls(c,(x,i)=>{const cs=CAST[x.cls];if(!cs||cs.t==='none')return;const ci=castOf(x);if(!ci.slots.length)return;
  D.cast.push({i,cls:x.cls,name:G(CL[x.cls].n,c),a:cs.a,dc:8+D.mod[cs.a]+D.pb,atk:D.mod[cs.a]+D.pb,cantN:ci.cantN,prepN:ci.prepN,maxLv:ci.slots.length,pact:!!ci.pact,cantUsed:x.spells.c.length,prepUsed:x.spells.p.length});
  if(ci.pact)D.pact=ci.pact;
  else{nSlot++;one=ci.slots;casterLvl+=cs.t==='full'?x.level:cs.t==='half'?Math.ceil(x.level/2):Math.floor(x.level/3);}});
 D.casterLvl=casterLvl;
 D.slots=nSlot>1?SLOTS[clamp(casterLvl,1,20)-1]:nSlot===1?one:[];
 D.maxSp=Math.max(D.slots.length,D.pact?D.pact.lvl:0);
 const f0=D.cast[0];
 D.spA=f0?f0.a:(CAST[c.cls]?CAST[c.cls].a:'cha');D.dc=8+D.mod[D.spA]+D.pb;D.atk=D.mod[D.spA]+D.pb;
 D.passive=10+D.skill.perception.b;
 D.cantN=D.cast.reduce((t,z)=>t+z.cantN,0);D.prepN=D.cast.reduce((t,z)=>t+z.prepN,0);
 D.always=[];D.extraCant=[];D.cantrips=[];D.prepAll=[];
 D.sp.cant.forEach(n=>D.extraCant.push({n,src:'Espèce',a:c.sp.sa||'cha'}));
 D.sp.spl.forEach(s=>D.always.push({n:s.n,src:'Espèce'}));
 eachCls(c,x=>{const cl=CL[x.cls],L=x.level,sub=subOf(x);
  if(x.cls==='ensorceleur'&&x.sub==='draconique')DRAC_SPELLS.forEach(([lv,l])=>{if(L>=lv)l.forEach(n=>D.always.push({n,src:'Sorcellerie draconique'}));});
  if(x.cls==='barde'&&x.sub==='seduction')SED_SPELLS.forEach(([lv,l])=>{if(L>=lv)l.forEach(n=>D.always.push({n,src:'Collège de la Séduction'}));});
  if((x.cls==='clerc'||x.cls==='occultiste')&&DOMS[x.sub])DOMS[x.sub].forEach(([lv,names])=>{if(L>=lv)names.forEach(n=>D.always.push({n,src:'Sous-classe'}));});
  if(x.cls==='barde'&&L>=20)D.always.push({n:'Mot de pouvoir guérisseur',src:'Verbe de la création'},{n:'Mot de pouvoir mortel',src:'Verbe de la création'});
  (cl.always||[]).forEach(([lv,ns,src])=>{if(L>=lv)ns.forEach(n=>D.always.push({n:canonName(n),src}));});
  if(sub){
   (sub.sp||[]).forEach(([lv,ns])=>{if(L>=lv)ns.forEach(n=>D.always.push({n:canonName(n),src:sub.n}));});
   if(sub.envSp&&sub.envSp[x.opt.env])sub.envSp[x.opt.env].forEach(([lv,ns])=>{if(L>=lv)ns.forEach(n=>D.always.push({n:canonName(n),src:sub.n}));});
   (sub.cant||[]).forEach(([lv,n])=>{if(L>=lv)D.extraCant.push({n:canonName(n),src:sub.n,a:(CAST[x.cls]||{a:'cha'}).a});});
  }
  if(WARRIOR[x.cls]&&x.fs.includes(WARRIOR[x.cls][0]))x.gc.forEach(n=>D.extraCant.push({n,src:WARRIOR[x.cls][0]+' ('+ABN[WARRIOR[x.cls][2]]+')',a:WARRIOR[x.cls][2]}));
  x.spells.c.forEach(n=>D.cantrips.push({n,a:(CAST[x.cls]||{a:'cha'}).a}));x.spells.p.forEach(n=>D.prepAll.push(n));
 });
 c.mi.forEach(m=>{if(!m.cls)return;const s2='Initié à la magie'+(m.ab?' ('+ABN[m.ab]+')':'');m.cant.forEach(n=>D.extraCant.push({n,src:s2,a:m.ab||D.spA}));if(m.spl)D.always.push({n:m.spl,src:s2});});
 const xs=c.spells.x||[];
 const xc=xs.filter(s=>+s.lv===0&&!s.free).length,xp=xs.filter(s=>+s.lv>0&&!s.free).length;
 if(D.cast[0]){D.cast[0].cantUsed+=xc;D.cast[0].prepUsed+=xp;}
 D.cantUsed=D.cast.length?D.cast.reduce((t,z)=>t+z.cantUsed,0):c.spells.c.length+xc;
 D.prepUsed=D.cast.length?D.cast.reduce((t,z)=>t+z.prepUsed,0):c.spells.p.length+xp;
 D.features=[];D.res=[];D.wm=[];
 const mu=multi(c);
 eachCls(c,(x,i)=>{const cl=CL[x.cls],L=x.level,sub=subOf(x),src=G(cl.n,c),sfx=mu?' ('+src+')':'';
  x.wm.forEach(id=>{if(!D.wm.includes(id))D.wm.push(id);});
  CFEAT[x.cls].forEach(f=>{if(f.lv<=L)D.features.push({src,lv:f.lv,n:f.n,d:f.n==="Bottes d'arme"&&x.wm.length?f.d+' Choisies : '+x.wm.map(id=>{const w=weaponById(id);return w.n+' ('+w.mastery+')';}).join(', ')+'.':f.d});});
  asiOf(x).forEach(lv=>{if(lv<=L){const f=x.feats[lv];D.features.push({src:'Niveau '+lv+sfx,n:f.k==='asi'?ASIFEAT.n:(f.t||'Don (à préciser)'),d:f.k==='asi'?(f.m==='2'?`+2 en ${ABN[f.a]||'(à choisir)'}.`:`+1 en ${ABN[f.a]||'?'} et +1 en ${ABN[f.b]||'?'}.`):(f.a&&ABN[f.a]?`+1 en ${ABN[f.a]}.`:'')});}});
  if(L>=19)D.features.push({src:'Niveau 19'+sfx,n:x.epic||'Faveur épique (à préciser)',d:x.epicAb?`+1 en ${ABN[x.epicAb]} (maximum 30).`:''});
  x.fs.forEach(n=>D.features.push({src:'Style de combat',n,d:''}));
  if(sub)sub.f.forEach(f=>{if(f.lv<=L)D.features.push({src:sub.n,lv:f.lv,n:f.n,d:f.d});});
  if(x.cls==='ensorceleur'&&x.sub==='draconique'&&L>=6&&x.aff)D.features.push({src:sub.n,n:'Affinité élémentaire : '+x.aff,d:`Résistance aux dégâts ${x.aff}.`});
  x.meta.forEach(m=>D.features.push({src:'Métamagie ('+META[m][0]+' pt'+(META[m][0]>1?'s':'')+')',n:m,d:META[m][1]}));
  /* ressources */
  const k=x.cls,pl=PACT[L-1];
  if(cl.res)D.res.push(...cl.res(L,D,x));
  else if(k==='barde')D.res.push(`Inspiration bardique : d${BARDDIE(L)}, ${Math.max(1,D.mod.cha)} utilisation(s)`);
  else if(k==='guerrier'){D.res.push('Second souffle : '+(L>=10?4:L>=5?3:2)+' utilisations (une au repos court, toutes au repos long)');if(L>=2)D.res.push('Fougue : '+(L>=17?2:1)+' utilisation(s) par repos court ou long');}
  else if(k==='clerc'){if(L>=2)D.res.push('Conduit divin : '+(L>=18?4:L>=6?3:2)+' utilisations (une au repos court, toutes au repos long)');}
  else if(k==='barbare')D.res.push('Rage : '+RAGES[L-1]+' utilisations (une au repos court, toutes au repos long) · dégâts +'+RAGEDMG(L));
  else if(k==='occultiste'){D.res.push('Manifestations occultes : '+MANIF[L-1]);D.res.push('Magie de pacte : '+pl[0]+' emplacement(s) de niveau '+pl[1]+' (repos court ou long)');}
  else if(k==='ensorceleur'){D.res.push('Sorcellerie innée : 2 utilisations');if(L>=2)D.res.push(`Points de Sorcellerie : ${L}`);}
 });
 {let mi=0;D.featList=featsOf(c).map(f=>({n:f.n,src:f.src,d:[NS.featNote(f.n),featFx(c,f,f.base==='Initié à la magie'?c.mi[mi++]:null)].filter(Boolean).join(' ')}));}
 return D;
}

/* ================== RENDU : OUTILS ================== */
/* une compétence s'affiche avec sa caractéristique : « Acrobaties (Dex) » en texte, ou le nom puis la caractéristique en petit dans une pastille */
const SKL=id=>SKM[id].n+' ('+ABS[SKM[id].a]+')';
const skp=id=>[SKM[id].n,ABS[SKM[id].a]];
const pill=(on,label,attrs,dis,title)=>`<button type="button" class="pill${on?' on':''}" aria-pressed="${on?'true':'false'}" ${dis?'disabled':''} ${title?`title="${e(title)}"`:''} ${attrs}>${Array.isArray(label)?e(label[0])+' <small>'+e(label[1])+'</small>':e(label)}</button>`;
function sel(path,opts,cur,o){o=o||{};return `<select data-b="${path}" ${o.num?'data-num':''} aria-label="${e(o.label||'')}">${o.ph!==undefined?`<option value="">${e(o.ph)}</option>`:''}${opts.map(([v,l,dis])=>`<option value="${e(v)}" ${String(v)===String(cur)?'selected':''} ${dis?'disabled':''}>${e(l)}</option>`).join('')}</select>`;}
const abCell=(a,inner)=>`<label class="abc"><span class="abh">${NS.abIcon(a,18)}<span>${e(ABN[a])}</span></span>${inner}</label>`;
const field=(label,inner)=>`<label class="field"><span>${e(label)}</span>${inner}</label>`;
const count=(n,max)=>`<span class="count${n>max?' bad':''}">${n}/${max}</span>`;

/* ================== RENDU : ONGLETS ================== */
const TABS=[['id','Identité'],['origin','Origine'],['cls','Classes'],['scores','Scores'],['spells','Sorts'],['equip','Équipement'],['sheet','Fiche']];

function alignGrid(c){
 const rows=[[['LB'],['NB'],['CB']],[['LN'],['N'],['CN']],[['LM'],['NM'],['CM']]];
 const label=id=>NS.alignLabel?NS.alignLabel(id,c.gender):({LB:'Loyal bon',NB:'Neutre bon',CB:'Chaotique bon',LN:'Loyal neutre',N:'Neutre',CN:'Chaotique neutre',LM:'Loyal mauvais',NM:'Neutre mauvais',CM:'Chaotique mauvais'}[id]||id);
 const rowLabels=[c.gender==='f'?'Bonne':'Bon','Neutre',c.gender==='f'?'Mauvaise':'Mauvais'];
 const colLabels=[c.gender==='f'?'Loyale':'Loyal','Neutre','Chaotique'];
 return `<div class="align-picker"><table class="align-table" aria-label="Tableau des alignements"><thead><tr><th scope="col"></th>${colLabels.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map((items,ri)=>`<tr><th scope="row">${rowLabels[ri]}</th>${items.map(([id])=>`<td><button type="button" class="align-cell" data-a="align" data-v="${id}" aria-pressed="${c.align===id}" aria-label="${label(id)}" title="${label(id)}">${label(id)}</button></td>`).join('')}</tr>`).join('')}</tbody></table>
 <button type="button" class="align-none" data-a="align" data-v="" aria-pressed="${!c.align}">Non précisé</button></div>`;
}

function tabId(c){
 return `<h2>Identité</h2>
 ${field('Nom du personnage',`<input type="text" data-live="name" value="${e(c.name)}" placeholder="Ex. Tilla « Patatra »" autocomplete="off">`)}
 ${field('Portrait (lien vers une image en ligne)',`<input type="url" data-live="portrait" maxlength="250" value="${e(c.portrait||'')}" placeholder="https://…" autocomplete="off">`)}
 <div id="pprev" class="portrait-preview">${portraitBlock(c.portrait,c.name)}</div>
 <div class="identity-choice-layout">
  <div class="field identity-gender"><span class="lbl">Sexe (accorde les noms de classe, d'espèce et d'historique ; « - » : formes masculines)</span>
   <div class="seg" role="group" aria-label="Sexe"><button type="button" data-a="gender" data-v="m" aria-pressed="${c.gender==='m'}">Masculin</button><button type="button" data-a="gender" data-v="f" aria-pressed="${c.gender==='f'}">Féminin</button><button type="button" data-a="gender" data-v="-" aria-pressed="${c.gender==='-'}" aria-label="Non précisé (formes masculines)" title="Non précisé : le texte utilise les formes masculines">-</button></div>
  </div>
  <div class="field identity-alignment"><span class="lbl">Alignement</span>${alignGrid(c)}</div>
 </div>
 ${field('Apparence',`<textarea data-live="appearance" placeholder="Taille, corpulence, cheveux, yeux, teint, signes distinctifs, tenue…">${e(c.appearance)}</textarea>`)}
 ${field('Historique du personnage',`<textarea data-live="story" placeholder="Passé, caractère, liens, motivations…">${e(c.story)}</textarea>`)}`;
}

function tabOrigin(c,D){
 const o=c.sp;const bg=BG[c.bg];const fixed=fixedSk(c);
 let h=`<h2>Origine</h2><p class="muted">Espèce et historique : ils fixent la Vitesse, les traits, deux compétences, un don et des bonus de caractéristiques.</p>`;
 h+=`<h3>Espèce</h3><p class="small muted">Choisissez une espèce dans le tableau.</p><div class="pick-grid" role="group" aria-label="Choisir une espèce">`+Object.keys(SPN).map(k=>`<button type="button" class="pick-choice${c.species===k?' selected':''}" data-a="speciesPick" data-v="${e(k)}" aria-pressed="${c.species===k}"><span class="pick-ic">${speciesIcon(k,22)}</span><span class="pick-name">${e(G(SPN[k],c))}</span></button>`).join('')+`</div>`;
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
 h+=`<div class="sec"></div><h3>Historique</h3><p class="small muted">Choisissez un historique dans le tableau.</p><div class="pick-grid" role="group" aria-label="Choisir un historique">`+Object.keys(BG).map(k=>`<button type="button" class="pick-choice${c.bg===k?' selected':''}" data-a="bgPick" data-v="${e(k)}" aria-pressed="${c.bg===k}"><span class="pick-ic">${bgIcon(k,22)}</span><span class="pick-name">${e(G(BG[k].n,c))}</span></button>`).join('')+`</div>`;
 if(bg){
  h+=`<div class="note"><b>Don :</b> ${e(bg.feat)}<br><b>Compétences :</b> ${bg.sk.map(SKL).join(', ')}<br><b>Outil :</b> ${e(bg.tool||bg.toolHint)}</div>`;
  if(!bg.tool){const cat=toolCatOf(bg.toolHint),list=cat?toolsOf(cat):TOOL_ROWS.map(t=>t[0]),opts=list.map(n=>[n,n]);if(c.bgTool&&!list.includes(c.bgTool))opts.unshift([c.bgTool,c.bgTool]);h+=field('Outil choisi',sel('bgTool',opts,c.bgTool,{ph:bg.toolHint,label:'Outil choisi'}));}
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
 <p class="small muted">Connues d'office : ${e(li.fixed.join(', '))}. Choisissez ${li.slots} langue${li.slots>1?'s':''} de plus${CS(c).some(k=>k.cls==='rodeur'&&k.level<2)?' (deux de plus au niveau 2 de rôdeur)':''}. Les langues courantes se choisissent librement ; les langues rares viennent normalement d'une capacité ou de l'accord du MD.</p>
 <span class="lbl">Langues courantes</span><div class="pills">${pl(LANG_STD)}</div>
 <span class="lbl">Langues rares</span><div class="pills">${pl(LANG_RARE)}</div>
 ${field('Autres langues (saisie libre)',`<input type="text" data-live="langX" value="${e(c.langX)}" placeholder="Ex. Aérien (dialecte primordial)" autocomplete="off">`)}`;
}
/* choix qui découlent des dons d'origine : Doué (trois maîtrises), Initié à la magie (sorts) */
function featChoices(c){
 let h='';const prof=profSk(c);const nd=nDoue(c);
 if(nd){const max=3*nd;h+=`<div class="sec"></div><h3>Doué : maîtrises ${count(doueUsed(c),max)}</h3><p class="small muted">Trois compétences ou outils par exemplaire du don. Cochez ici les compétences et les outils (listes du catalogue) ; un champ libre sert aux outils absents de la liste. Tout compte dans le total.</p><div class="pills">`
  +SK.map(([s])=>{const on=c.skd.includes(s);return pill(on,skp(s),`data-a="tog" data-p="skd" data-v="${s}" data-max="${max}"`,(!on&&prof.includes(s))||(!on&&doueUsed(c)>=max));}).join('')+`</div>`+TOOL_CATS.map(([k,l])=>`<span class="lbl">${e(l)}</span><div class="pills">${toolsOf(k).map(n=>{const on=c.toolsD.includes(n);return pill(on,n,`data-a="tog" data-p="toolsD" data-v="${e(n)}" data-max="${max}"`,!on&&doueUsed(c)>=max);}).join('')}</div>`).join('')+field('Autres outils (absents de la liste)',`<input type="text" data-live="toolsX" value="${e(c.toolsX)}" placeholder="Ex. Outils de géomètre" autocomplete="off">`);}
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
/* Points de vie : moyenne (valeur fixe) ou lancers de dés, niveau par niveau ; le dé est celui de la classe où le niveau a été gagné */
function hpBlock(c,D){
 const TL=c.tl,sq=D.hdSeq,hd1=sq[0].hd,nm=k=>G(CL[k].n,c),mu=multi(c);
 let h=`<div class="sec"></div><h3>Points de vie</h3><div class="field"><span class="lbl">Évolution à chaque niveau</span><div class="seg" role="group" aria-label="Méthode des points de vie"><button type="button" data-a="hpm" data-v="auto" aria-pressed="${c.hpm!=='roll'}">Moyenne (valeur fixe)</button><button type="button" data-a="hpm" data-v="roll" aria-pressed="${c.hpm==='roll'}">Lancers de dés</button></div></div>`;
 h+=`<p class="small muted">Niveau 1 (classe principale, ${e(nm(c.cls).toLowerCase())}) : dé de vie au maximum (d${hd1}) + Constitution = <b>${D.hpL1}</b>. Ensuite, à chaque niveau : ${c.hpm==='roll'?'un lancer du dé de la classe':'la valeur fixe du dé de la classe'} + Constitution, avec un minimum de 1 PV gagné.${mu?' Chaque niveau compte pour la classe où il a été pris.':''}</p>`;
 h+=`<p class="small"><b>Dés de vie :</b> ${e(D.hitDice)}</p>`;
 if(c.hpm==='roll'&&TL>=2){
  h+=`<div class="hpl">`;
  for(let lv=2;lv<=TL;lv++){const s=sq[lv-1];
   h+=`<div class="hpr"><label for="hpr${lv}">Niveau ${lv}${mu?' · '+e(nm(s.cls)):''}</label><input id="hpr${lv}" type="number" inputmode="numeric" min="1" max="${s.hd}" data-b="hpr.${lv}" data-num value="${c.hpr[lv]||''}" placeholder="d${s.hd}"><button type="button" class="btn small" data-a="hproll" data-lv="${lv}" aria-label="Lancer le dé de vie du niveau ${lv}">Lancer d${s.hd}</button><span class="small muted">${c.hpr[lv]?'+'+D.hpLv[lv]+' PV':'moyenne : +'+D.hpLv[lv]}</span></div>`;
  }
  h+=`</div><div class="row" style="margin-top:8px"><button type="button" class="btn small" data-a="hprollall">Lancer les niveaux restants</button><button type="button" class="btn small" data-a="hpclear">Effacer les lancers</button></div>`;
  const miss=[];for(let lv=2;lv<=TL;lv++)if(!c.hpr[lv])miss.push(lv);
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
/* Savoir primal (barbare, niveau 3) et Disciple martial (Maître de guerre, niveau 3) ; style de combat */
function classChoices(c,D){
 let h=styleBlock(c);const prof=profSk(c);
 const skSel=(path,list,cur)=>sel(path,list.map(s=>[s,SKL(s),prof.includes(s)&&cur!==s]),cur,{ph:'Choisir',label:'Compétence'});
 if(c.cls==='barbare'&&c.level>=3)h+=`<div class="sec"></div><h3>Savoir primal</h3><p class="small muted">Une compétence de plus, parmi celles de la liste du barbare.</p>`+field('Compétence',skSel('xs.primal',CL.barbare.skills||[],c.xs.primal));
 if(c.cls==='guerrier'&&c.sub==='maitre'&&c.level>=3)h+=`<div class="sec"></div><h3>Disciple martial</h3><p class="small muted">Un type d'outils d'artisan et une compétence de la liste du guerrier.</p>`+field("Outils d'artisan",(()=>{const l=toolsOf('artisan'),o=l.map(n=>[n,n]);if(c.xs.tool&&!l.includes(c.xs.tool))o.unshift([c.xs.tool,c.xs.tool]);return sel('xs.tool',o,c.xs.tool,{ph:'Choisir',label:"Outils d'artisan"});})())+field('Compétence',skSel('xs.martial',CL.guerrier.skills||[],c.xs.martial));
 return h;
}
/* sélecteur de don dans le catalogue (dons de niveau et faveur épique) */
function featSelect(attr,cur,isOther,c){
 const L=c.tl,lab={0:"Dons d'origine",1:'Dons généraux',2:'Styles de combat',3:'Faveurs épiques'};
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

/* Une carte par classe : la classe active (c) est celle dont on affiche les choix */
function classCard(c,D,i){
 const cl=CL[c.cls],L=c.level,subs=SUBS[c.cls],fixed=fixedSk(c),mu=multi(c);
 const used=CS(c).filter(k=>k.i!==i).map(k=>k.cls),room=20-(c.tl-L);
 const nm=k=>G(CL[k].n,c),pick=skPick(c,i),tp=toolPick(c,i);
 const classes=Object.keys(CL).sort((a,b)=>nm(a).localeCompare(nm(b),'fr'));
 const ck='c:'+i;
 let h='<details class="ccard ccard-fold" data-gk="'+ck+'"'+(S.sclosed.has(ck)?'':' open')+'><summary class="chead">__CLASS_SUMMARY__</summary><div class="ccard-body">';
 h+=`<div data-ci="${i}"><div class="row">${field('Classe',sel('cls',classes.map(k=>[k,nm(k),used.includes(k)]),c.cls,{label:'Classe'}))}${field('Niveau dans cette classe',sel('level',Array.from({length:room},(_,k)=>[k+1,'Niveau '+(k+1)]),L,{num:1,label:'Niveau dans la classe'}))}</div>`;
 h+=`<div class="note">Dé de vie d${cl.hd} · ${i===0?'Sauvegardes : '+cl.saves.map(a=>ABN[a]).join(' et ')+' · ':''}${e(profOf(c,i)||'Aucune maîtrise supplémentaire')}</div>`;
 if(L<3)h+=`<p class="muted">La sous-classe se choisit au niveau 3 de cette classe (niveau actuel : ${L}).</p>`;
 else h+=field(c.cls==='clerc'?'Domaine divin':'Sous-classe',sel('sub',Object.keys(subs).map(k=>[k,subs[k].n+(subs[k].ok?'':' (bientôt)'),!subs[k].ok]),c.sub,{ph:'Choisir une sous-classe'}));
 if(c.cls==='rodeur'&&c.sub==='belluaire')h+=beastBlock(c);
 optsOf(c).forEach(o=>{h+=field(o.l,sel('opt.'+o.k,o.c,c.opt[o.k],{ph:'Choisir'}));});
 if(pick>0){
  h+=`<h3>Compétences de classe ${count(c.cSk.length,pick)}</h3><p class="small muted">${cl.skills?pick+' compétence'+(pick>1?'s':'')+' parmi cette liste.':pick+' compétence'+(pick>1?'s':'')+' au choix.'} Les compétences déjà acquises sont grisées.</p><div class="pills">`;
  const oth=[];eachCls(c,(y,j)=>{if(j!==i)oth.push(...y.cSk,...y.sSk);});
  (cl.skills||SK.map(s=>s[0])).forEach(s=>{const on=c.cSk.includes(s);h+=pill(on,skp(s),`data-a="tog" data-p="cSk" data-v="${s}" data-max="${pick}"`,fixed.includes(s)||oth.includes(s)||(!on&&c.cSk.length>=pick));});
  h+=`</div>`;
 }else if(i>0)h+=`<p class="small muted">Pas de compétence de plus avec cette classe en multiclassage.</p>`;
 if(WMN[c.cls]){
  const n=WMN[c.cls](L),pr=weaponProf(profTxt(c));
  const elig=WEAPONS.filter(w=>isProf(w,pr)),mk='m:'+i;
  h+=`<h3>Bottes d'arme ${count(c.wm.length,n)}</h3>`;
  h+=c.wm.length?`<div class="pills mst-sel">${c.wm.map(id=>weaponById(id)).filter(Boolean).map(w=>pill(true,w.n+' · '+w.mastery,`data-a="tog" data-p="wm" data-v="${w.id}" data-max="${n}"`)).join('')}</div>`:`<p class="small muted">Aucune botte choisie.</p>`;
  h+=`<details class="eqc mst-fold"${S.mopen.has(mk)?' open':''} data-gk="${mk}"><summary>Choisir / modifier les bottes d'arme</summary><p class="small muted">${n} type${n>1?'s':''} d'armes dont vous utilisez la botte, parmi les armes que vous maîtrisez. Après un repos long, ${c.cls==='guerrier'||c.cls==='barbare'?'vous pouvez remplacer l\'un de ces types':'vous pouvez changer de types'}.</p>`;
  MASTERY_HELP.forEach(([k,d])=>{const ws=elig.filter(w=>w.mastery===k);if(!ws.length)return;
   h+=`<div class="mst"><h4>${e(k)}${ws.some(w=>c.wm.includes(w.id))?' <span class="tg">choisie</span>':''}</h4><p class="small muted">${e(d)}</p><div class="pills">${ws.map(w=>{const on=c.wm.includes(w.id);return pill(on,w.n,`data-a="tog" data-p="wm" data-v="${w.id}" data-max="${n}"`,!on&&c.wm.length>=n);}).join('')}</div></div>`;});
  h+=`</details>`;
 }
 if(c.cls==='barde'){
  h+=`<h3>Instruments de musique ${count(c.tools.length,tp)}</h3><div class="pills">`;
  INSTR.forEach(s=>{const on=c.tools.includes(s);h+=pill(on,s,`data-a="tog" data-p="tools" data-v="${e(s)}" data-max="${tp}"`,!on&&c.tools.length>=tp);});
  h+=`</div>`;
  h+=expHTML(c,D);
  if(c.sub==='savoir'&&L>=3){
   const oth=[];eachCls(c,(y,j)=>{if(j!==i)oth.push(...y.cSk,...y.sSk);});
   h+=`<h3>Collège du Savoir : maîtrises supplémentaires ${count(c.sSk.length,3)}</h3><div class="pills">`;
   SK.forEach(([s])=>{const on=c.sSk.includes(s);h+=pill(on,skp(s),`data-a="tog" data-p="sSk" data-v="${s}" data-max="3"`,fixed.includes(s)||c.cSk.includes(s)||oth.includes(s)||(!on&&c.sSk.length>=3));});
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
 h+=`</div>`;
 if(mu)h+=`<div class="row">${i>0?`<button type="button" class="btn small" data-a="firstcls" data-i="${i}">Passer en classe principale</button>`:''}<button type="button" class="btn small danger" data-a="rmcls" data-i="${i}">Retirer cette classe</button></div>`;
 const summaries=[...h.matchAll(/<h3>(.*?)<span class="count(?: bad)?">([0-9]+\/[0-9]+)<\/span><\/h3>/g)].map(m=>'<span class="ccard-count">'+m[1].replace(/<[^>]*>/g,'').trim()+' <b>'+m[2]+'</b></span>').join('');
  const title='<span class="hic">'+classIcon(c.cls,26)+'</span><b>'+e(nm(c.cls))+( (SUBS[c.cls]||{})[c.sub]?' · '+e(SUBS[c.cls][c.sub].n):'')+'</b><span class="muted small">niveau '+L+(i===0&&mu?' · classe principale':'')+'</span>';
  h=h.replace('__CLASS_SUMMARY__',title+(summaries?'<span class="ccard-counts">'+summaries+'</span>':''));
  h+='</div></details>';
  return h;
}
function tabCls(c,D){
 const tl=c.tl,mu=multi(c),used=CS(c).map(k=>k.cls);
 let h=`<h2>${mu?'Classes':'Classe'}</h2><div class="stat"><div><b>${tl}</b><span>Niveau total (sur 20)</span></div><div><b>${sg(D.pb)}</b><span>Maîtrise</span></div><div><b>${e(D.hitDice)}</b><span>Dés de vie</span></div></div>`;
 h+=eachCls(c,(x,i)=>classCard(x,D,i)).join('');
 h+=`<details class="impx"><summary>Ajouter une classe (multiclassage)</summary><p class="small muted" style="margin-top:8px">${tl>=20?'Le niveau total est déjà de 20.':'Le nouveau niveau compte dans le niveau total (maximum 20), qui fixe le bonus de maîtrise. Il faut au moins 13 dans la caractéristique principale de chaque classe, la nouvelle comprise. La classe principale (la première) donne l\'équipement de départ, les sauvegardes et toutes les compétences de départ ; les autres classes donnent seulement les maîtrises du multiclassage.'}</p>`;
 h+=`<div class="clsgrid" role="group" aria-label="Ajouter une classe">${Object.keys(CL).filter(k=>!used.includes(k)).sort((a,b)=>G(CL[a].n,c).localeCompare(G(CL[b].n,c),'fr')).map(k=>`<button type="button" class="clsb" data-a="addcls" data-v="${k}" ${tl>=20?'disabled':''}>${classIcon(k,26)}<span>${e(G(CL[k].n,c))}</span></button>`).join('')}</div></details>`;
 mcWarn(c,D).forEach(w=>{h+=`<div class="note warn">${e(w)}</div>`;});
 h+=`<div class="note">Les 12 classes du Manuel des Joueurs 2024 sont disponibles. Certaines sous-classes ne sont pas encore proposées.${mu?' Les emplacements de sorts se calculent avec le niveau d\'incantateur cumulé ; l\'Attaque supplémentaire ne se cumule pas entre classes et une seule capacité peut fixer la CA sans armure.':''}</div>`;
 return h+hpBlock(c,D);
}
function tabScores(c,D){
 let h=`<h2>Caractéristiques</h2>`;
 h+=`<div class="field"><span class="lbl">Méthode</span><div class="seg" role="group"><button type="button" data-a="method" data-v="standard" aria-pressed="${c.method==='standard'}">Tableau</button><button type="button" data-a="method" data-v="pointbuy" aria-pressed="${c.method==='pointbuy'}">Achat</button><button type="button" data-a="method" data-v="free" aria-pressed="${c.method==='free'}">Dés / libre</button></div></div>`;
 h+=`<p class="small muted">Chaque méthode garde ses propres valeurs : changer de méthode ne les efface pas. Seule la méthode sélectionnée compte pour le personnage.</p>`;
 if(c.method==='standard'){
  const vals=[15,14,13,12,10,8];const used=AB.map(a=>c.bases.standard[a]);const ok=[...used].sort((x,y)=>y-x).join()===vals.join();
  h+=`<p class="muted small">Attribuez 15, 14, 13, 12, 10 et 8, une fois chacun.</p>`;
  h+=`<div class="abpick">`;AB.forEach(a=>{h+=abCell(a,sel('bases.standard.'+a,vals.map(v=>[v,v]),c.bases.standard[a],{num:1,label:ABN[a]}));});h+=`</div>`;
  if(!ok)h+=`<div class="note warn">Chaque valeur du tableau doit être utilisée exactement une fois.</div>`;
 }else if(c.method==='pointbuy'){
  const cost={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};const tot=AB.reduce((s,a)=>s+(cost[c.bases.pointbuy[a]]??99),0);
  h+=`<p class="muted small">27 points à répartir, valeurs de 8 à 15. Points dépensés : <b>${tot}</b>/27.</p>`;
  h+=`<div class="abpick">`;AB.forEach(a=>{h+=`<div class="abc"><span class="abh">${NS.abIcon(a,18)}<span>${e(ABN[a])}</span></span><div class="pbc"><button class="btn small" data-a="pb" data-ab="${a}" data-d="-1" aria-label="Diminuer ${ABN[a]}">−</button><b>${c.bases.pointbuy[a]}</b><button class="btn small" data-a="pb" data-ab="${a}" data-d="1" aria-label="Augmenter ${ABN[a]}">+</button></div></div>`;});h+=`</div>`;
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
   h+=`<div class="abpick">`;AB.forEach(a=>{const used=AB.filter(x=>x!==a).map(x=>c.asg[x]).filter(v=>v!==''&&v!=null).map(Number);h+=abCell(a,sel('asg.'+a,c.pool.map((q,k)=>[k,q.v+' (lancer '+(k+1)+')',used.includes(k)]),c.asg[a],{ph:'Choisir…',label:ABN[a]}));});h+=`</div>`;
   if(n<6)h+=`<div class="note warn">Terminez les 6 lancers pour attribuer tous les scores.</div>`;
   else if(AB.some(a=>c.asg[a]===''||c.asg[a]==null))h+=`<div class="note warn">Attribuez chacun des 6 résultats à une caractéristique.</div>`;}
 }
 h+=`<h3>Totaux (méthode : ${({standard:'tableau',pointbuy:'achat de points',free:'dés'})[c.method]})</h3><table class="t"><tr><th>Score</th><th>Base</th><th>Origine</th><th>Dons</th><th>Total</th><th>Mod.</th></tr>`;
 AB.forEach(a=>{h+=`<tr><td><span class="abh">${NS.abIcon(a,16)}<span>${ABN[a]}</span></span></td><td>${D.base[a]}</td><td>${D.bgB[a]?'+'+D.bgB[a]:'–'}</td><td>${D.ftB[a]?'+'+D.ftB[a]:'–'}</td><td><b>${D.ab[a]}</b></td><td><b>${sg(D.mod[a])}</b></td></tr>`;});
 h+=`</table>`;
 if(D.cast.length||(CAST[c.cls]&&CAST[c.cls].t!=='third'&&CAST[c.cls].t!=='none'))h+=`<p class="small muted">Caractéristique d'incantation : ${D.cast.length?D.cast.map(z=>(D.cast.length>1?z.name+' : ':'')+ABN[z.a]).join(' · '):ABN[D.spA]}.</p>`;
 return h;
}

const TIME_OPTS=[['','Tous'],['a','Action'],['b','Action bonus'],['r','Réaction'],['rit','Rituel'],['long','1 minute ou plus']];
const optList=(opts,cur)=>opts.map(([v,l])=>`<option value="${e(v)}"${String(v)===String(cur)?' selected':''}>${e(l)}</option>`).join('');
const DMG_OPTS=()=>[['','Tous'],['oui','Fait des dégâts'],['non','Sans dégâts'],...DMG_TYPES.map(t=>[t,'Type : '+t])];
const schoolOpts=()=>[[-1,'Toutes'],...SPELL_SCHOOLS.map((n,i)=>[i,n])];

/* Sorts proposés à la classe active : sa liste, jusqu'au niveau qu'elle peut préparer */
function pickPool(c){
 const lists=SPELLS[c.cls],maxLv=castOf(c).slots.length,names=new Set();
 for(let l=0;l<=maxLv;l++)(lists[l]||[]).forEach(n=>names.add(n));
 return SPELLDB.filter(s=>names.has(s.n));
}
/* sorts déjà acquis sans compter dans les choix (toujours préparés, sorts mineurs d'espèce ou de don) : nom -> source */
function lockedSpells(D){const m=new Map();D.extraCant.forEach(x=>m.set(x.n,x.src));D.always.forEach(x=>m.set(x.n,x.src));return m;}
function pickResults(c,D){
 const list=filterSpells({q:S.sq,lv:S.slv===''?[]:[+S.slv],school:S.sch,cls:'',time:S.sf,conc:false,rit:false,dmg:S.sdm},pickPool(c));
 const sel=new Set([...c.spells.c,...c.spells.p]);
 const lock=lockedSpells(D);
 return V.results(list,S.slim,s=>V.pickRow(s,sel.has(s.n),lock.get(s.n)||''),'smore',{ctx:'p',open:S.sopen,force:!!(S.sq||S.slv!==''||S.sch>=0||S.sf||S.sdm)});
}
const spiOf=D=>D.cast.some(z=>z.i===S.spi)?S.spi:(D.cast[0]?D.cast[0].i:0);
function fillPick(){const c=C();if(!c)return;const r=document.getElementById('sres');if(!r)return;const D=derive(c);r.innerHTML=withCls(c,spiOf(D),()=>pickResults(c,D));}
const chip=(n,p)=>`<button type="button" class="pill on" data-a="togs" data-p="${p}" data-v="${e(n)}" aria-label="Retirer ${e(n)}">${e(n)} ×</button>`;

const alwaysHTML=D=>(D.extraCant.length||D.always.length)?`<h3>Toujours disponibles</h3><ul class="skl">${[...D.extraCant.map(x=>({n:x.n,s:'mineur · '+x.src})),...D.always.map(x=>({n:x.n,s:x.src}))].map(x=>`<li><span class="spn" data-v="${e(x.n)}">${e(x.n)} <small class="muted">(${e(x.s)})</small></span><span class="muted">${e(ttsh(x.n))}</span></li>`).join('')}</ul>`:'';

function tabSpells(c,D){
 if(!D.cast.length){
  const notes=CS(c).map(k=>{const th=Object.values(SUBS[k.cls]||{}).find(x=>x.third)||(k.cls==='guerrier'?SUBS.guerrier.occulte:null);return th&&CAST[k.cls]&&CAST[k.cls].t==='third'?`${G(CL[k.cls].n,c)} : seule la sous-classe ${th.n} lance des sorts.`:`${G(CL[k.cls].n,c)} ne lance pas de sorts.`;});
  return `<h2>Sorts</h2><div class="note">${notes.map(e).join('<br>')}</div>`+alwaysHTML(D);
 }
 const mu=D.cast.length>1,pi=spiOf(D),kp=D.cast.find(z=>z.i===pi),maxLv=kp.maxLv;
 if(S.slv!==''&&+S.slv>maxLv)S.slv='';
 let h=`<h2>Sorts</h2><div class="stat">${D.cast.map(z=>`<div><b>${z.dc}</b><span>DD${mu?' · '+e(z.name):' de sauvegarde'}</span></div><div><b>${sg(z.atk)}</b><span>Attaque${mu?' · '+e(z.name):' de sort'}</span></div>`).join('')}</div>`;
 h+=`<div class="note">${D.cast.map(z=>{const x=z.cls;return (mu?z.name+' : ':'')+(x==='guerrier'?'Chevalier occulte, liste de sorts du magicien (certains choix sont limités à des écoles précises : vérifiez votre sous-classe).':x==='roublard'?'Arnaqueur arcanique, liste de sorts du magicien (certains choix peuvent être limités à des écoles précises : vérifiez votre sous-classe).':'liste complète des sorts de la classe (Manuel des Joueurs 2024), jusqu\'au niveau '+z.maxLv+'.'+(x==='magicien'?' Cochez vos sorts préparés : votre grimoire en contient davantage.':''));}).join('<br>')} Touchez « Fiche » pour lire le texte d'un sort sur AideDD.${mu?' Chaque classe prépare ses propres sorts avec sa caractéristique d\'incantation ; les emplacements sont partagés.':''}</div>`;
 h+=`<h3>Emplacements de sort</h3>`;
 if(D.slots.length)h+=`${mu?`<p class="small muted">Niveau d'incantateur cumulé : ${D.casterLvl}.</p>`:''}<table class="t"><tr>${D.slots.map((_,i)=>`<th>Niv. ${i+1}</th>`).join('')}</tr><tr>${D.slots.map(n=>`<td><b>${n}</b></td>`).join('')}</tr></table>`;
 if(D.pact)h+=`<p class="small">${D.pact.n} emplacement(s) de niveau ${D.pact.lvl} (Magie de pacte, récupérés au repos court).</p>`;
 h+=alwaysHTML(D);
 eachCls(c,(x,i)=>{const z=D.cast.find(q=>q.i===i);if(!z)return;
  h+=`<div data-ci="${i}"><div class="sec"></div>${mu?`<h3>${e(z.name)}</h3>`:''}`;
  if(z.cantN>0||x.spells.c.length>0){h+=`<h3>Sorts mineurs ${count(z.cantUsed,z.cantN)}</h3>`;h+=x.spells.c.length?`<div class="chips">${x.spells.c.map(n=>chip(n,'c')).join('')}</div>`:`<p class="muted small">Aucun pour l'instant.</p>`;}
  h+=`<h3>Sorts préparés ${count(z.prepUsed,z.prepN)}</h3>`;
  h+=x.spells.p.length?`<div class="chips">${x.spells.p.map(n=>chip(n,'p')).join('')}</div>`:`<p class="muted small">Aucun pour l'instant.</p>`;
  h+=`</div>`;});
 const hasCant=kp.cantN>0||withCls(c,pi,()=>c.spells.c.length>0);
 h+=`<div class="sec"></div><h3>Choisir des sorts</h3>`;
 if(mu)h+=`<label class="field"><span>Pour la classe</span><select data-ui="spi">${D.cast.map(z=>`<option value="${z.i}"${z.i===pi?' selected':''}>${e(z.name)}</option>`).join('')}</select></label>`;
 const spc=(lbl,n,max)=>`<span class="spc ${n>max?'over':n===max?'full':''}">${lbl} <b>${n}/${max}</b>${n===max?' ✓':''}</span>`;
 h+=`<div class="spbar" role="status" aria-live="polite">${mu?`<span class="spw">${e(kp.name)}</span>`:''}${kp.cantN>0||kp.cantUsed>0?spc('Mineurs',kp.cantUsed,kp.cantN):''}${spc('Préparés',kp.prepUsed,kp.prepN)}</div>`;
 h+=`<label class="field"><span>Rechercher un sort</span><input type="search" id="sq" data-ui="sq" value="${e(S.sq)}" placeholder="Nom en français ou en anglais" autocomplete="off"></label>`;
 h+=`<details class="sfilt"${S.fopen?' open':''}><summary>Filtres${(S.slv!==''?1:0)+(S.sch>=0?1:0)+(S.sf?1:0)+(S.sdm?1:0)?` <span class="tg">${(S.slv!==''?1:0)+(S.sch>=0?1:0)+(S.sf?1:0)+(S.sdm?1:0)} actif${(S.slv!==''?1:0)+(S.sch>=0?1:0)+(S.sf?1:0)+(S.sdm?1:0)>1?'s':''}</span>`:''}</summary><div class="row"><label class="field"><span>Niveau</span><select data-ui="slv">${optList([['','Tous'],...(hasCant?[['0','Sorts mineurs']]:[]),...Array.from({length:maxLv},(_,i)=>[String(i+1),'Niveau '+(i+1)])],S.slv)}</select></label><label class="field"><span>École</span><select data-ui="sch">${optList(schoolOpts(),S.sch)}</select></label><label class="field"><span>Temps d'incantation</span><select data-ui="sf">${optList(TIME_OPTS,S.sf)}</select></label><label class="field"><span>Dégâts</span><select data-ui="sdm">${optList(DMG_OPTS(),S.sdm)}</select></label></div></details>`;
 h+=`<p class="small muted">« Rituel » : le sort peut aussi se lancer en 10 minutes de plus, sans emplacement, s'il est préparé.</p>`;
 h+=`<div id="sres" data-ci="${pi}">${withCls(c,pi,()=>pickResults(c,D))}</div>`;
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
 const cl=CL[packCls(c)],bg=BG[c.bg],out=[];
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
 startEntries(c).forEach(r=>{const q=keepOf(c,r);if(q>0){const it=entryItem(c,r);out.push({key:r.key,src:r.src,item:it,n:it?it.n:r.n,q,gen:r.gen});}});
 c.buy.forEach((b,i)=>{const it=b.id?gearById(b.id):null;out.push({key:'a'+i,src:'Achat',item:it,n:it?it.n:b.n,q:b.q});});
 return out;
}
/* bourse en pièces de cuivre : or de départ + revente des objets retirés − achats + ajustement manuel */
function purse(c){
 const cl=CL[packCls(c)],bg=BG[c.bg],rate=c.eqSell==='half'?0.5:1;
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
 const K=CS(c),mk=K.find(k=>k.cls==='moine'),bd=K.find(k=>k.cls==='barde'&&k.sub==='danse'&&k.level>=3);
 return{mod:D.mod,pb:D.pb,wm:new Set(D.wm),prof:weaponProf(profTxt(c)),styles:featsOf(c).map(f=>f.base).filter(n=>FEAT_STYLES.some(f=>f.n===n)),
  monk:!!mk&&!wears(c)&&!c.shield,dance:bd&&!wears(c)&&!c.shield?BARDDIE(bd.level):0,martialDie:mk?MARTIAL_DIE(mk.level):6,level:c.tl};
}
/* lignes du tableau « Armes & sorts mineurs » : armes portées, frappe à mains nues, puis uniquement les sorts mineurs qui font des dégâts */
function attackRows(c,D){
 const ctx=atkCtx(c,D),rows=weaponsOf(c).map(x=>weaponRow(x.w,ctx));
 if(ctx.monk||ctx.dance||1+ctx.mod.for>0)rows.push(unarmedRow(ctx));   /* frappe à mains nues : seulement si elle fait des dégâts */
 const abOf={};D.extraCant.forEach(x=>{if(x.a)abOf[x.n]=x.a;});D.cantrips.forEach(x=>{abOf[x.n]=x.a;});
 const seen=new Set();
 [...D.extraCant.map(x=>x.n),...D.cantrips.map(x=>x.n),...(c.spells.x||[]).filter(q=>+q.lv===0).map(q=>q.n)].forEach(n=>{
  const s=spellByName(n);if(!s||s.lv!==0||!s.dmg||seen.has(s.id))return;seen.add(s.id);
  rows.push(cantripRow(s,ctx,abOf[s.n]||abOf[n]||D.spA));
 });
 return rows;
}
const armorProf=c=>{const pt=profTxt(c),all=/toutes les armures/i.test(pt);return{l:all||/légères/i.test(pt),i:all||/intermédiaires/i.test(pt),h:all,s:/boucliers?/i.test(pt)};};
function eqBuyRow(b,i,tag){
 const it=b.id?gearById(b.id):null,unit=it?it.p:b.p;
 return `<li><span class="n">${e(it?it.n:b.n)}${tag?` <small class="tg">${e(tag)}</small>`:''}</span><span class="muted small">${b.free?'sans coût':fmtMoney(unit)+(b.q>1?' pièce':'')}</span><label class="small">Quantité <input type="number" inputmode="numeric" min="0" max="99" data-bq="${i}" value="${b.q}" aria-label="Quantité de ${e(it?it.n:b.n)}"></label>${b.free?'':`<b class="minus">−${fmtMoney(unit*b.q)}</b>`}<button type="button" class="btn small danger" data-a="buydel" data-i="${i}" aria-label="Retirer ${e(it?it.n:b.n)}">Retirer</button></li>`;
}
function eqStartRow(c,r,rate,tag){
 const it=entryItem(c,r),keep=keepOf(c,r),gone=r.q-keep,unit=it?it.p*(r.coef||1)*rate:0;
 let nm=e(r.n);
 if(r.gen){nm=`<select data-ev="${r.key}" aria-label="${e(GENERIC[r.gen].l)}"><option value="">${e(GENERIC[r.gen].l)} : choisir…</option>${genVariants(r.gen).map(x=>`<option value="${e(x.id)}"${it&&it.id===x.id?' selected':''}>${e(x.n)} (${fmtMoney(x.p)})</option>`).join('')}</select>`;}
 else if(r.note)nm+=` <small class="muted">(${e(r.note)})</small>`;
 if(tag)nm+=` <small class="tg">${e(tag)}</small>`;
 const unitTxt=r.custom?'valeur non définie':it?fmtMoney(unit)+(r.q>1?' pièce':''):'';
 const ctl=r.q>1?`<label class="small">Garder <input type="number" inputmode="numeric" min="0" max="${r.q}" data-ek="${r.key}" value="${keep}" aria-label="Quantité gardée de ${e(r.n)}"> sur ${r.q}</label>`
  :`<button type="button" class="btn small${keep?' danger':''}" data-a="eqtog" data-k="${r.key}">${keep?'Retirer':'Remettre'}</button>`;
 return `<li class="${keep===0?'gone':''}"><span class="n">${nm}${r.q>1&&!r.gen?' ×'+r.q:''}${r.gen&&r.q>1?' ×'+r.q:''}</span><span class="muted small">${unitTxt}</span>${ctl}${gone>0&&unit?`<b class="plus">+${fmtMoney(gone*unit)}</b>`:''}</li>`;
}
function tabEquip(c,D){
 const cl=CL[packCls(c)],bg=BG[c.bg],rate=c.eqSell==='half'?0.5:1,P=purse(c);
 let h=`<h2>Équipement</h2><p class="muted small">On part du paquet de départ de la classe et de l'historique : retirez ce dont vous ne voulez pas pour récupérer son prix, puis dépensez cet argent en achetant autre chose. Les prix viennent des règles 2024 (AideDD).</p>`;
 const ch=chc(c,cl);const opts=[['A',"Choix A : l'équipement"],['B',cl.eqB.items?"Choix B : l'équipement":`Choix B : ${cl.eqB.gold} po`]];if(cl.eqC)opts.push(['C',`Choix C : ${cl.eqC.gold} po`]);
 {const cls=Object.keys(CL).sort((a,b)=>G(CL[a].n,c).localeCompare(G(CL[b].n,c),'fr'));h+=field('Pack de départ de la classe',sel('eqSrc',cls.map(k=>[k,G(CL[k].n,c)+(k===c.cls?' (classe principale)':'')]),packCls(c),{label:'Pack de départ'}))+(c.eqSrc?`<p class="small muted">Ce pack n'est plus celui de votre classe principale : vos modifications ont été gardées. Choisissez la classe principale dans la liste pour repartir de son pack.</p>`:'');}
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
 const st=startEntries(c),byCat=S.eqv!=='src';
 const viewSel=`<div class="field"><span class="lbl">Regrouper par</span><div class="seg" role="group"><button type="button" data-a="eqview" data-v="cat" aria-pressed="${byCat}">Catégorie</button><button type="button" data-a="eqview" data-v="src" aria-pressed="${!byCat}">Classe / historique</button></div></div>`;
 if(byCat){
  h+=`<h3>Équipement</h3>`+viewSel;
  const GR=['Armes','Armures et boucliers','Outils','Équipement'],grpIt=(it,gen)=>{const k=it?it.cat:'';return gen||k.startsWith('tool')?'Outils':k[0]==='w'?'Armes':k.startsWith('arm')?'Armures et boucliers':'Équipement';};
  const rows=[...st.map(r=>({g:grpIt(entryItem(c,r),r.gen),html:eqStartRow(c,r,rate,r.src)})),...c.buy.map((b,i)=>({g:grpIt(b.id?gearById(b.id):null,false),html:eqBuyRow(b,i,'Achat')}))];
  if(!rows.length)h+=`<p class="muted small">Aucun objet pour l'instant : ajoutez-en ci-dessous.</p>`;
  GR.forEach(g=>{const rs=rows.filter(x=>x.g===g);if(!rs.length)return;
   const k='e:'+g;
   h+=`<details class="eqc"${S.sclosed.has(k)?'':' open'} data-gk="${k}"><summary class="eqh">${e(g)} <small class="muted">(${rs.length})</small></summary><ul class="eql">${rs.map(x=>x.html).join('')}</ul></details>`;});
  h+=`<h3>Ajouter un objet</h3>`;
 }else{
  h+=`<h3>Paquet de départ</h3>`+viewSel;
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
  h+=`<h3>Achats et ajouts</h3>`;
  if(c.buy.length)h+=`<ul class="eql">${c.buy.map((b,i)=>eqBuyRow(b,i)).join('')}</ul>`;
  else h+=`<p class="muted small">Rien d'acheté pour l'instant.</p>`;
 }
 const cat=GEAR_CATS.some(x=>x[0]===S.ecat)?S.ecat:'wpn1';
 const label=g=>{let x=g.n+' · '+fmtMoney(g.p);if(g.arm)x+=g.arm.kind==='s'?' · CA +2':' · CA '+g.arm.base+(g.arm.kind==='h'?'':' + Dex'+(g.arm.cap?' (max '+g.arm.cap+')':''));if(g.w)x+=' · '+g.w.dice+' '+g.w.dt;return x;};
 h+=`<div class="row" style="align-items:end"><label class="field"><span>Catégorie</span><select data-ui="ecat" aria-label="Catégorie d'objet">${catOpts(cat,false)}</select></label>
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
 if(CS(c).some(k=>k.cls==='moine')&&(wears(c)||c.shield))warn.push('Un moine perd Défense sans armure, Arts martiaux et Déplacement sans armure avec une armure ou un bouclier.');
 h+=`<div class="note">CA actuelle : <b>${D.ac}</b> · ${e(D.acNote)}.${warn.map(w=>' '+e(w)).join('')}</div>`;
 h+=field('Bonus de PV divers (don, objet)',`<input type="number" inputmode="numeric" data-b="hpBonus" data-num value="${+c.hpBonus||0}">`);
 return h;
}
const packCls=c=>CL[c.eqSrc]?c.eqSrc:c.cls;
const chc=(c,cl)=>c.eqCls==='C'&&cl.eqC?cl.eqC:c.eqCls==='B'?cl.eqB:cl.eqA;
const goldTotal=c=>purse(c).total;   /* en pièces de cuivre */
const slotsTxt=(c,D)=>[D.slots.length?D.slots.map((n,i)=>`niv. ${i+1} : ${n}`).join(' · '):'',D.pact?`${D.pact.n} emplacement(s) de niveau ${D.pact.lvl} (Magie de pacte)`:''].filter(Boolean).join(' · ');

/* ---------- Fiche détaillée : explications au survol (souris) ou à l'appui long (tactile), via data-ex ---------- */
let EX={};
const xa=html=>{const id='x'+(Object.keys(EX).length+1);EX[id]=html;return ` data-ex="${id}"`;};
/* Textes d'explication (fiche détaillée et fiche officielle) */
function explainer(c,D){
 const TL=c.tl,AR=armorOf(c),jackOn=CS(c).some(k=>k.cls==='barde'&&k.level>=2);
 const mx=a=>sg(D.mod[a]);
 /* origine de chaque sort : espèce, classe, sous-classe, toujours préparé ou choisi */
 const ORIG={};const addO=(n,t)=>{(ORIG[n]=ORIG[n]||[]).push(t);};
 D.extraCant.forEach(x=>addO(x.n,x.src||'Espèce'));
 D.cantrips.forEach(x=>addO(x.n,'Sort mineur de la classe'));
 D.always.forEach(x=>addO(x.n,x.src||'Classe'));
 D.prepAll.forEach(n=>addO(n,'Sort préparé de la classe'));
 c.spells.x.forEach(q=>addO(q.n,(+q.lv===0?'Sort mineur':'Sort')+(q.free?', toujours préparé':', choisi')));
 const spX=n=>{const s=spellByName(n),o=[...new Set(ORIG[n]||[])];const org=o.length?`<p class="xl"><b>Origine :</b> ${e(o.join(' · '))}</p>`:'';return s?`<p class="xt"><b>${e(s.n)}</b> <span class="muted">${e(s.lv===0?'Sort mineur':'Niveau '+s.lv)} · ${V.meta(s)}</span></p>${org}${V.spellInfo(s)}`:`<p class="xt"><b>${e(n)}</b></p>${org}`;};
 /* explications des chiffres */
 const acH=AR?`${e(AR.n)} : base ${AR.arm.base}${AR.arm.cap===null?' + Dextérité '+mx('dex'):AR.arm.cap===0?'':' + Dextérité '+sg(Math.min(D.mod.dex,AR.arm.cap))+' (plafonnée à '+AR.arm.cap+')'}`:c.arm==='autre'?`Valeur saisie : ${+c.acManual||10}`:`10 + Dextérité ${mx('dex')} (sans armure)`;
 const acEx=`<p class="xt"><b>Classe d'armure</b></p><p class="xl"><b>Calcul de base :</b> ${acH}</p>${c.shield?'<p class="xl"><b>Bouclier :</b> +2</p>':''}<p class="xl"><b>Origine retenue :</b> ${e(D.acNote)}</p><p class="xl"><b>Total :</b> ${D.ac}</p>`;
 const hpSum=D.hpL1+Object.values(D.hpLv).reduce((t,v)=>t+v,0),hpRes=D.hp-hpSum;

 const hpSrc=[];let hpKnown=0;eachCls(c,x=>{if(x.cls==='ensorceleur'&&x.sub==='draconique'&&x.level>=3){hpKnown+=x.level;hpSrc.push(`Sorcellerie draconique : +${x.level} (un point par niveau de sorcier, dès le niveau 3)`);}});
 if(c.species==='nain'){hpKnown+=TL;hpSrc.push(`Espèce nain : +${TL} (un point par niveau)`);}
 if(hasFeat(c,'Robuste')){hpKnown+=2*TL;hpSrc.push(`Don Robuste : +${2*TL} (deux points par niveau)`);}
 if(+c.hpBonus){hpKnown+=+c.hpBonus;hpSrc.push(`Bonus manuel : ${sg(+c.hpBonus)}`);}
 const hpLines=[];for(let lv=1;lv<=TL;lv++){const hd=D.hdSeq[lv-1].hd;if(lv===1){hpLines.push(`<p class="xl"><b>Niveau 1 :</b> dé de vie maximal d${hd} ${sg(D.mod.con)} Constitution = ${D.hpL1}</p>`);}else{const rolled=c.hpm==='roll'&&c.hpr&&c.hpr[lv];const val=rolled?c.hpr[lv]:hpFixed(hd);hpLines.push(`<p class="xl"><b>Niveau ${lv} :</b> ${rolled?'jet':'valeur fixe'} ${val} (dé d${hd}) ${sg(D.mod.con)} Constitution = ${D.hpLv[lv]}</p>`);}}
 const hpEx=`<p class="xt"><b>Points de vie</b></p>${hpLines.join('')}${hpSrc.map(x=>`<p class="xl">${x}</p>`).join('')}${hpRes!==hpKnown?`<p class="xl">Autre bonus non détaillé : ${sg(hpRes-hpKnown)}</p>`:''}<p class="xl"><b>Total :</b> ${D.hp}</p>`;
 const spPen=AR&&AR.arm.str&&D.ab.for<AR.arm.str?3:0,spCls=D.speed-D.sp.speed+spPen;
 const spSrc=[];eachCls(c,x=>{const cl=CL[x.cls];if(cl.speedUn&&!wears(c)&&!c.shield)spSrc.push(`${e(G(cl.n,c))} niveau ${x.level} : +${cl.speedUn(x.level)} m (sans armure ni bouclier)`);});
 const spEx=`<p class="xt"><b>Vitesse</b></p><p class="xl"><b>Espèce :</b> ${D.sp.speed} m</p>${spSrc.map(x=>`<p class="xl">${x}</p>`).join('')}${spPen?'<p class="xl"><b>Armure :</b> −3 m (Force insuffisante)</p>':''}<p class="xl"><b>Total :</b> ${String(D.speed).replace('.',',')} m</p>`;
 const iniOth=D.init-D.mod.dex-(hasFeat(c,'Vigilant')?D.pb:0);
 const iniSrc=[];eachCls(c,x=>{const sb=subOf(x);if(sb&&sb.initB&&x.level>=3)iniSrc.push(`${e(sb.n)} niveau ${x.level} : ${sg(D.mod[sb.initB])}`);});
 const iniEx=`<p class="xt"><b>Initiative</b></p><p class="xl"><b>Dextérité :</b> ${mx('dex')}</p>${hasFeat(c,'Vigilant')?`<p class="xl"><b>Vigilant :</b> maîtrise ${sg(D.pb)}</p>`:''}${iniSrc.map(x=>`<p class="xl">Sous-classe : ${x}</p>`).join('')}<p class="xl"><b>Total :</b> ${sg(D.init)}</p>`;
 const pbEx=`<p class="xt"><b>Maîtrise</b></p><p class="xl"><b>Niveau total :</b> ${TL}${CS(c).length>1?' ('+CS(c).map(k=>G(CL[k.cls].n,c)+' '+k.level).join(' + ')+')':''}</p><p class="xl">Bonus = arrondi au-dessus de ${TL} ÷ 4, plus 1 = ${D.pb}</p><p class="xl muted">Ce bonus s'ajoute aux sauvegardes, compétences et attaques maîtrisées.</p>`;
 const castEx=(a,dc,atk,name)=>`<p class="xt"><b>${e(name||'Sorts')}</b></p><p class="xl"><b>Caractéristique :</b> ${ABN[a]} ${mx(a)}</p><p class="xl"><b>DD de sauvegarde :</b> 8 + ${mx(a)} + maîtrise ${sg(D.pb)} = ${dc}</p><p class="xl"><b>Attaque de sort :</b> ${mx(a)} + maîtrise ${sg(D.pb)} = ${sg(atk)}</p>`;
 const abSrc=a=>{const out=[];eachCls(c,x=>{const cl=CL[x.cls],b=cl.abBonus?cl.abBonus(x.level):null;if(b&&b.ab.includes(a))out.push(`${e(G(cl.n,c))} niveau ${x.level} : +${b.n} (maximum ${b.max})`);if(x.level>=19&&x.epicAb===a)out.push('Faveur épique : +1');});return out;};
 const abEx=a=>{const b=D.base[a],bgv=D.bgB[a],ft=D.ftB[a],t=D.ab[a],res=t-(b+bgv+ft);
  return `<p class="xt"><b>${ABN[a]}</b></p><p class="xl"><b>Valeur :</b> base ${b}${bgv?' + historique '+sg(bgv):''}${ft?' + don ou amélioration '+sg(ft):''}${res>0?' + bonus de classe ou épique '+sg(res):res<0?' (plafonnée à 20)':''} = ${t}</p><p class="xl"><b>Modificateur :</b> (${t} − 10) ÷ 2, arrondi vers le bas = ${sg(D.mod[a])}</p>${abSrc(a).map(x=>`<p class="xl">${x}</p>`).join('')}`;};
 const saveEx=a=>`<p class="xt"><b>Sauvegarde ${ABN[a]}</b></p><p class="xl">Modificateur ${mx(a)}${D.save[a].p?' + maîtrise '+sg(D.pb)+' (maîtrisée par la classe ou un don)':' (non maîtrisée)'} = ${sg(D.save[a].b)}</p>`;
 const skSrc=id=>{const out=[];eachCls(c,x=>{const f=CL[x.cls].skillB;if(f){const v=f(x,id,D);if(v)out.push(`${e(G(CL[x.cls].n,c))} niveau ${x.level} : ${sg(v)}`);}});return out;};
 const skEx=id=>{const s=D.skill[id],base=D.mod[s.a],pbP=s.p?D.pb*(s.x?2:1):(jackOn?Math.floor(D.pb/2):0),oth=s.b-base-pbP;
  const pt=s.p?(s.x?' + expertise (maîtrise ×2) '+sg(D.pb*2):' + maîtrise '+sg(D.pb)):(jackOn?' + Touche-à-tout '+sg(Math.floor(D.pb/2)):' (sans maîtrise)');
  return `<p class="xt"><b>${e(s.n)}</b> <span class="muted">${ABN[s.a]}</span></p><p class="xl">Modificateur ${sg(base)}${pt}${oth?' + autres bonus '+sg(oth):''} = ${sg(s.b)}</p>${skSrc(id).map(x=>`<p class="xl">Bonus de classe : ${x}</p>`).join('')}`;};
 const pasEx=`<p class="xt"><b>Perception passive</b></p><p class="xl">10 + bonus de Perception = ${D.passive}</p>${skEx('perception')}`;
 const owned=ownedItems(c);
 const chLetter=c.eqCls==='B'?'B':c.eqCls==='C'?'C':'A';
 const srcShort=o=>o.src==='Classe'?`Pack ${e(G(CL[packCls(c)].n,c))}${packCls(c)!==c.cls?' (pack choisi)':''}, choix ${chLetter}`:o.src==='Historique'?`Historique ${e(BG[c.bg]?G(BG[c.bg].n,c):'')}`:o.src==='Achat'?'Achat':e(o.src||'');
 const srcFull=o=>o.src==='Classe'?`Pack de départ de la classe ${e(G(CL[packCls(c)].n,c))}${packCls(c)!==c.cls?' (pack choisi, différent de la classe principale)':' (classe principale)'}, choix ${chLetter}`:o.src==='Historique'?`Historique ${e(BG[c.bg]?G(BG[c.bg].n,c):'')}, choix A`:o.src==='Achat'?'Acheté dans la boutique':e(o.src||'');
 const eqHTML=GEAR_GROUPS.map(g=>{const items=owned.filter(o=>gearGroup(o)===g);return items.length?`<h4 class="eqgh">${e(g)}</h4><ul class="eqcols">${items.map(o=>{const nm=o.n+(o.q>1?' ×'+o.q:'');return `<li${xa(`<p class="xt"><b>${e(nm)}</b></p><p class="xl"><b>Origine :</b> ${srcFull(o)}</p>`)}><span>${e(nm)}</span> <small class="muted">${srcShort(o)}</small></li>`;}).join('')}</ul>`:'';}).join('');
 
 return {TL,AR,mx,spX,acEx,hpEx,spEx,iniEx,pbEx,pasEx,castEx,abEx,saveEx,skEx,srcFull,srcShort,eqHTML,ORIG,jackOn};
}
function sheetHTML(c,D){
 EX={};
 const cl=CL[c.cls],sub=(SUBS[c.cls]||{})[c.sub],bg=BG[c.bg];
 const title=c.name||'Personnage sans nom';
 const {TL,AR,mx,spX,acEx,hpEx,spEx,iniEx,pbEx,pasEx,castEx,abEx,saveEx,skEx,srcFull,srcShort,eqHTML}=explainer(c,D);
 /* statistiques */
 let h=`<div class="shead">${portraitImg(c.portrait,c.name,'big')}<div><h2>${e(title)}</h2><p class="muted">${e(clsLine(c,'s'))}${c.species?' · '+e(speciesLabel(c)):''}${bg?' · '+e(G(bg.n,c)):''}</p></div></div>`;
 h+=`<div class="stat"><div${xa(acEx)}><b>${D.ac}</b><span>Classe d'armure</span></div><div${xa(hpEx)}><b>${D.hp}</b><span>Points de vie</span></div><div${xa(spEx)}><b>${String(D.speed).replace('.',',')} m</b><span>Vitesse</span></div><div${xa(iniEx)}><b>${sg(D.init)}</b><span>Initiative</span></div><div${xa(pbEx)}><b>${sg(D.pb)}</b><span>Maîtrise</span></div><div${xa(pasEx)}><b>${D.passive}</b><span>Perception passive</span></div>${D.cast.length>1?D.cast.map(z=>`<div${xa(castEx(z.a,z.dc,z.atk,z.name))}><b>${z.dc}</b><span>DD · ${e(z.name)}</span></div><div${xa(castEx(z.a,z.dc,z.atk,z.name))}><b>${sg(z.atk)}</b><span>Attaque · ${e(z.name)}</span></div>`).join(''):(D.slots.length||D.pact||D.extraCant.length||D.always.length)?`<div${xa(castEx(D.spA,D.dc,D.atk,''))}><b>${D.dc}</b><span>DD des sorts</span></div><div${xa(castEx(D.spA,D.dc,D.atk,''))}><b>${sg(D.atk)}</b><span>Attaque de sort</span></div>`:''}</div>`;
 {const li=langInfo(c);h+=`<p class="small"><b>Langues :</b> ${e([...li.fixed,...c.langs,...(c.langX?[c.langX]:[])].join(', '))}${c.align?` · <b>Alignement :</b> ${e(alignLabel(c.align,c.gender))}`:''}</p>`;}
 h+=`<p class="small muted">Dé de vie : ${D.hitDice} · Taille ${D.sp.size}${D.sp.dv?' · Vision dans le noir '+D.sp.dv+' m':''}${D.sp.res.length?' · Résistance : '+D.sp.res.join(', '):''}</p>`;
 h+=`<h3>Caractéristiques</h3><div class="abil">${AB.map(a=>`<div${xa(abEx(a))}><small>${ABN[a]}</small><b>${sg(D.mod[a])}</b><span>${D.ab[a]}</span></div>`).join('')}</div>`;
 h+=`<h3>Jets de sauvegarde</h3><ul class="skl">${AB.map(a=>`<li${xa(saveEx(a))}><span><span class="dot${D.save[a].p?' f':''}"></span>${ABN[a]}</span><b>${sg(D.save[a].b)}</b></li>`).join('')}</ul>`;
 h+=`<h3>Compétences</h3><ul class="skl">${SK.map(([id])=>{const s=D.skill[id];return `<li${xa(skEx(id))}><span><span class="dot${s.x?' x':s.p?' f':''}"></span>${e(s.n)} <small class="muted">${ABS[s.a]}</small></span><b>${sg(s.b)}</b></li>`;}).join('')}</ul><p class="small muted">Point plein : maîtrise · point coloré : expertise. Survolez ou appuyez longuement pour voir le calcul.</p>`;
 {const wRows=attackRows(c,D);if(wRows.length)h+=`<h3>Armes et sorts mineurs</h3><ul class="skl">${wRows.map(r=>`<li${xa(`<p class="xt"><b>${e(r.n)}</b></p><p class="xl">${r.ex||''}</p>`)}><span>${e(r.n)}${r.hands?` <small class="muted">${e(r.hands)}</small>`:''}</span><span><b>${e(r.att)}</b> · ${e(r.dmg)}</span></li>`).join('')}</ul>`;}
 {const tl=[...(bg?[bg.tool||c.bgTool]:[]),...subTools(c),...toolsAll(c),...c.toolsD,c.toolsX].filter(Boolean);if(tl.length)h+=`<p class="small"><b>Outils :</b> ${tl.map(e).join(', ')}</p>`;}
 h+=`<p class="small"><b>Maîtrises :</b> ${e(profTxt(c))}</p>`;
 h+=`<h3>Ressources</h3><p class="small">${D.res.map(e).join('<br>')}</p>`;
 if(D.slots.length||D.pact)h+=`<h3>Sorts</h3><p class="small"><b>Emplacements :</b> ${slotsTxt(c,D)}</p>`;
 const li=n=>`<li${xa(spX(n))}><span>${e(n)}</span><span class="muted">${e(ttsh(n))}</span></li>`;
 const cants=[...D.extraCant.map(x=>x.n),...D.cantrips.map(x=>x.n),...c.spells.x.filter(q=>+q.lv===0).map(q=>q.n)];
 h+=`<p class="small"><b>Sorts mineurs</b></p>${cants.length?`<ul class="skl">${cants.map(li).join('')}</ul>`:'<p class="small">—</p>'}`;
 let anyP=false;for(let l=1;l<=9;l++){const arr=[...D.prepAll.filter(n=>{const sp=spellByName(n);return sp&&sp.lv===l;}),...c.spells.x.filter(q=>+q.lv===l).map(q=>q.n)];if(arr.length){anyP=true;h+=`<p class="small"><b>Niveau ${l}</b></p><ul class="skl">${arr.map(li).join('')}</ul>`;}}
 if(!anyP)h+=`<p class="small"><b>Sorts préparés :</b> —</p>`;
 if(D.always.length)h+=`<p class="small"><b>Toujours préparés</b></p><ul class="skl">${D.always.map(x=>li(x.n)).join('')}</ul>`;
 {const bm=beastModel(c,D);if(bm){h+=`<h3>Compagnon primitif</h3><div class="fam-card"><p><b>${e(bm.n)}</b>${bm.name?' · « '+e(bm.name)+' »':''}${bm.race?' · '+e(bm.race):''}</p><p class="small muted">${e(bm.size)} · Bête · ${e(bm.hd)} · ${e(bm.senses)}</p><p class="small"><b>CA</b> ${e(bm.ac)} · <b>PV</b> ${e(bm.hp)} · <b>Attaque</b> ${e(bm.atk)} · <b>Vitesse</b> ${e(bm.speed)}</p><p class="small">${bm.abil.map(a=>`${e(a.lb)} ${e(a.v)} (${e(a.m)})`).join(' · ')}</p><div class="bcat">Actions</div><dl class="bl">${bm.acts.map(x=>`<dt>${e(x.n)}</dt><dd>${e(x.t)}</dd>`).join('')}</dl><div class="bcat">Traits</div><dl class="bl">${bm.traitList.map(x=>`<dt>${e(x.n)}</dt><dd>${e(x.t)}</dd>`).join('')}</dl></div>`;}}
 h+=`<h3>Traits et capacités</h3><dl class="feat">`;
 if(c.species)h+=`<dt${xa(`<p class="xt"><b>${e(speciesLabel(c))}</b></p><p class="xl"><b>Origine :</b> Espèce</p>`)}>${e(speciesLabel(c))} <span class="src">Espèce</span></dt><dd>${D.sp.tr.map(e).join('<br>')}</dd>`;
 if(bg){const fd=D.featList.find(f=>f.src==='Historique'&&f.n===bg.feat);h+=`<dt${xa(`<p class="xt"><b>${e(bg.feat)}</b></p><p class="xl"><b>Origine :</b> historique ${e(G(bg.n,c))}</p>`)}>${e(bg.feat)} <span class="src">Don d'historique (${e(G(bg.n,c))})</span></dt>${fd&&fd.d?`<dd>${e(fd.d)}</dd>`:''}`;}
 D.features.forEach(f=>{const fd=D.featList.find(x=>x.n===f.n&&x.src===f.src);const desc=fd&&fd.d?fd.d:f.d;h+=`<dt${xa(`<p class="xt"><b>${e(f.n)}</b></p><p class="xl"><b>Origine :</b> ${e(f.src)}${f.lv?' · niveau '+f.lv:''}</p>`)}>${e(f.n)} <span class="src">${e(f.src)}${f.lv?' · niveau '+f.lv:''}</span></dt>${desc?`<dd>${e(desc)}</dd>`:''}`;});
 h+=`</dl>`;
{const own=equipNames(c);h+=`<h3>Équipement</h3>${own.length?`${eqHTML}`:'<p class="small">Aucun objet.</p>'}<p class="small"><b>Bourse :</b> ${fmtMoney(goldTotal(c))}</p>`;}
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
function beastModel(c,D){
 const rz=CS(c).find(k=>k.cls==='rodeur'&&k.sub==='belluaire');
 if(!rz||!c.beast||!BEASTS[c.beast.t])return null;
 const B=BEASTS[c.beast.t],L=rz.level||0,w=D.mod.sag,zr=D.cast.find(z=>z.cls==='rodeur');
 return {n:B.n,size:B.size,speed:B.speed,senses:B.senses,name:c.beast.name||'',race:c.beast.race||'',
  hp:B.hpBase+B.hpPer*L,hd:L+'d'+B.hd,ac:13+w,atk:sg(zr?zr.atk:D.pb+w),dice:B.dice,dmg:B.dice+' '+sg(B.dmgBonus+w),dmgType:B.dmgType,extra:B.extra,traits:B.traits,
  acts:[{n:'Frappe de la Bête',t:`${B.dice} ${sg(B.dmgBonus+w)} ${B.dmgType}.`},...(B.extra?[{n:B.extraN,t:B.extra}]:[])],
  traitList:[{n:'Lien primal',t:'ajoutez votre bonus de maîtrise à tout jet de caractéristique ou de sauvegarde effectué par la bête.'},...(B.tn?[{n:B.tn,t:B.tt}]:[])],
  abil:['for','dex','con','int','sag','cha'].map((a,i)=>({lb:ABS[a]||a.toUpperCase(),v:B.abil[i],m:sg(Math.floor((B.abil[i]-10)/2))}))};
}
const beastBlock=c=>{const b=c.beast||{};return `<h3>Compagnon primitif ${count(b.t?1:0,1)}</h3><p class="small muted">Choisissez la bête.</p><div class="pills">${Object.keys(BEASTS).map(k=>pill(b.t===k,BEASTS[k].n,`data-a="beast" data-v="${k}"`)).join('')}</div><div class="row">${field('Nom de la bête',`<input type="text" data-live="beast.name" maxlength="40" value="${e(b.name||'')}" placeholder="Ex. Griffe" autocomplete="off">`)}${field('Race de la bête',`<input type="text" data-live="beast.race" maxlength="40" value="${e(b.race||'')}" placeholder="Ex. faucon, loup, dauphin" autocomplete="off">`)}</div>`;};
function sheetModel(c,D){
 const cl=CL[packCls(c)],sub=(SUBS[c.cls]||{})[c.sub],bg=BG[c.bg];
 const EXP=explainer(c,D);const pl=t=>`<p class="xl">${t}</p>`;
 const ORDER=['for','dex','con','int','sag','cha'];
 const abil=ORDER.map(id=>({id,name:ABN[id],mod:sg(D.mod[id]),val:D.ab[id],save:{p:D.save[id].p,b:sg(D.save[id].b)},ax:xa(EXP.abEx(id)),svx:xa(EXP.saveEx(id)),
  skills:SK.filter(([,,a])=>a===id).map(([sid])=>{const s=D.skill[sid];return{n:s.n,p:s.p,x:s.x,b:sg(s.b),ex:xa(EXP.skEx(sid))};})}));
 /* entraînements : on relit la ligne de maîtrises de la classe */
 const pt=profTxt(c),parts=pt.split(' · ').map(x=>x.trim()).filter(Boolean),all=/toutes les armures/i.test(pt);
 let tools=[...parts.filter(x=>!/^Armes|Armures|armures|Boucliers|Aucune formation|Aucune armure|Toutes les armures/i.test(x)),...(bg?[bg.tool||c.bgTool]:[]),...subTools(c),...toolsAll(c),...c.toolsD,c.toolsX].filter(Boolean);
 /* « 3 instruments de musique » : on regroupe les instruments choisis entre parenthèses, avec ce qui reste à choisir */
 {const mus=toolsOf('musique'),ix=tools.findIndex(x=>/^\d+ instruments? de musique/i.test(x));
  if(ix>=0){const m=tools[ix].match(/^(\d+)/),n=+m[1],ch=tools.filter(x=>mus.includes(x)),lab=tools[ix].replace(/^\d+ instruments?/,n>1?n+' instruments':'1 instrument');
   const rest=Math.max(0,n-ch.length);
   tools[ix]=lab+(ch.length||rest?' ('+[...ch,...(rest?[rest+' à choisir']:[])].join(', ')+')':'');
   for(let i=tools.length-1;i>=0;i--)if(i!==ix&&mus.includes(tools[i]))tools.splice(i,1);}}
 const training={armor:{l:all||/légères/i.test(pt),i:all||/intermédiaires/i.test(pt),h:all,s:/boucliers?/i.test(pt)},
  weapons:parts.filter(x=>/^Armes/i.test(x)).join(', '),tools:tools.join(', ')};
 /* sorts */
 const seen=new Set(),sp=[];
 const add=(n,lv,note,x)=>{if(!n||seen.has(n))return;seen.add(n);const s=spellByName(n);const ti=tinfo(n);
  const dn=s&&s.dmg&&s.dtypes.length?'Dégâts : '+s.dtypes.join(', '):'';
  sp.push({n,lv:s?s.lv:(+lv||0),time:shortTime(s?s.time.raw:ti.raw),range:s?s.range:'',c:s?s.conc:false,r:s?s.rit:ti.rit,m:s?s.comp.includes('M'):false,note:[dn,note].filter(Boolean).join(' · ')});};
 D.extraCant.forEach(x=>add(x.n,0,x.src));
 D.cantrips.forEach(x=>add(x.n,0));
 D.prepAll.forEach(n=>add(n));
 D.always.forEach(x=>add(x.n,null,'Toujours préparé'));
 c.spells.x.forEach(q=>add(q.n,q.lv,q.free?'Toujours préparé':''));
 sp.sort((a,b)=>a.lv-b.lv||a.n.localeCompare(b.n,'fr'));
 sp.forEach(r=>{r.x=xa(EXP.spX(r.n));});
 const casting=D.slots.length||D.pact||D.cast.length||sp.length>0;
 const KS=CS(c),casters=D.cast.length>1?D.cast:null;
 const slotsM=D.slots.slice();if(D.pact){while(slotsM.length<D.pact.lvl)slotsM.push(0);slotsM[D.pact.lvl-1]+=D.pact.n;}
 const weapons=attackRows(c,D).map(r=>({...r,x:xa(`<p class="xt"><b>${e(r.n)}</b></p><p class="xl">${r.ex||''}</p>`)}));
 /* capacités et dons */
 const isLvl=f=>/^Niveau \d+/.test(f.src);
 const feats=D.featList.map(f=>({n:f.n+' ('+f.src.toLowerCase()+')',d:f.d||'',x:xa(`<p class="xt"><b>${e(f.n)}</b></p><p class="xl"><b>Origine :</b> ${e(f.src)}</p>`)}));
 const eq=[];const ch=chc(c,cl);
 if(c.inv)eq.push(c.inv);
 const li=langInfo(c);const langs=[...li.fixed,...c.langs,...(c.langX?[c.langX]:[])];
 const hdEx=`<p class="xt"><b>Dés de vie</b></p>${D.hdSeq.map((s,i)=>pl('Niveau '+(i+1)+' : d'+s.hd)).join('')}${pl('Total : '+e(D.hitDice))}`;
 const bgObj=BG[c.bg];
 const castAll=D.cast.length>1?D.cast.map(z=>EXP.castEx(z.a,z.dc,z.atk,z.name)).join(''):EXP.castEx(D.spA,D.dc,D.atk,'');
 const bmX=beastModel(c,D);
 const equipOf=GEAR_GROUPS.map(g=>({g,items:ownedItems(c).filter(o=>gearGroup(o)===g).map(o=>({t:o.n+(o.q>1?' ×'+o.q:''),x:xa(`<p class="xt"><b>${e(o.n)}</b></p><p class="xl"><b>Origine :</b> ${EXP.srcFull(o)}</p>`)}))})).filter(x=>x.items.length);
 const X={
  ac:xa(EXP.acEx),hp:xa(EXP.hpEx),hd:xa(hdEx),pb:xa(EXP.pbEx),init:xa(EXP.iniEx),speed:xa(EXP.spEx),passive:xa(EXP.pasEx),
  size:xa(`<p class="xt"><b>Taille</b></p>${pl(e(D.sp.size)+' : donnée par l\'espèce')}`),
  level:xa(`<p class="xt"><b>Niveau</b></p>${pl('Niveau total : '+c.tl)}${CS(c).length>1?CS(c).map(k=>pl(e(G(CL[k.cls].n,c))+' : niveau '+k.level)).join(''):''}`),
  cls:xa(`<p class="xt"><b>Classe</b></p>${CS(c).map(k=>pl(e(G(CL[k.cls].n,c))+' niveau '+k.level)).join('')}`),
  sub:xa(`<p class="xt"><b>Sous-classe</b></p>${CS(c).map(k=>{const sb=(SUBS[k.cls]||{})[k.sub];return pl(sb?e(sb.n)+' ('+e(G(CL[k.cls].n,c))+')':'Pas encore choisie');}).join('')}`),
  bg:xa(`<p class="xt"><b>Historique</b></p>${pl(bgObj?e(G(bgObj.n,c))+' : don '+e(bgObj.feat||'—')+'.':'Aucun historique choisi.')}`),
  species:xa(`<p class="xt"><b>Espèce</b></p>${pl(e(speciesLabel(c)))}${D.sp.tr.map(t=>pl(e(t))).join('')}`),
  lang:xa(`<p class="xt"><b>Langues</b></p>${pl('Espèce, classe et historique, plus les choix saisis.')}${pl(e(langs.join(', ')))}`),
  dons:xa(`<p class="xt"><b>Dons</b></p>${D.featList.map(f=>pl(e(f.n)+' : '+e(f.src))).join('')||pl('Aucun don')}`),
  train:xa(`<p class="xt"><b>Entraînements</b></p>${pl('Maîtrises de la classe, de l\'historique et de l\'espèce : '+e(profTxt(c)))}`),
  slots:xa(`<p class="xt"><b>Emplacements de sorts</b></p>${pl('Niveau d\'incantateur (emplacements partagés entre les classes qui lancent des sorts) : '+D.casterLvl)}${D.pact?pl('Emplacements de pacte : '+D.pact.n+' de niveau '+D.pact.lvl):''}`),
  cast:xa(castAll),
  coin:xa(`<p class="xt"><b>Pièces</b></p>${pl('Total : '+e(fmtMoney(goldTotal(c))))}${pl('Or de départ et revente des objets retirés, moins les achats, plus l\'ajustement manuel.')}`),
  beast:bmX?xa(`<p class="xt"><b>Compagnon primitif</b></p>${pl('Type : '+e(bmX.n))}${pl('PV '+e(bmX.hp)+' · CA '+e(bmX.ac)+' · attaque '+e(bmX.atk))}${pl('Valeurs selon le niveau de rôdeur (belluaire) et les caractéristiques de la bête.')}`):'',
  manual:xa(`<p class="xt"><b>Case à remplir</b></p>${pl('Non calculée par l\'outil : à remplir à la main sur la fiche papier.')}`),
  equip:xa(`<p class="xt"><b>Équipement</b></p>${pl('Objets groupés par catégorie ; chaque ligne indique son origine (pack, historique ou achat).')}`)
 };
 X.castmod=X.castdc=X.castatk=X.cast;
 return{name:c.name||'',bg:bg?G(bg.n,c):'',cls:KS.map(k=>G(CL[k.cls].n,c)+(KS.length>1?' '+k.level:'')).join(' / '),sub:KS.map(k=>{const sb=(SUBS[k.cls]||{})[k.sub];return sb?(KS.length>1?G(CL[k.cls].n,c)+' : ':'')+sb.n:'';}).filter(Boolean).join(' / '),species:speciesLabel(c),level:c.tl,multi:KS.length>1,
  ac:D.ac,shield:!!c.shield,hpMax:D.hp,hitDice:D.hitDice,pb:sg(D.pb),init:sg(D.init),speed:String(D.speed).replace('.',',')+' m',size:D.sp.size,passive:D.passive,
  abil,training,weapons,classFeat:D.features.filter(f=>!isLvl(f)&&f.src!=='Style de combat'&&!/^Voir (la sous-classe|le domaine|la voie|le protecteur|le don) choisi/i.test(f.d||'')).map(f=>({n:f.n,d:f.d||'',x:xa(`<p class="xt"><b>${e(f.n)}</b></p><p class="xl"><b>Origine :</b> ${e(f.src)}${f.lv?' · niveau '+f.lv:''}</p>`)})),speciesFeat:D.sp.tr,feats,
  cast:{ability:casting?(casters?casters.map(z=>ABN[z.a]).join(' / '):ABN[D.spA]):'',mod:casting?(casters?casters.map(z=>sg(D.mod[z.a])).join(' / '):sg(D.mod[D.spA])):'',dc:casting?(casters?casters.map(z=>z.dc).join(' / '):D.dc):'',atk:casting?(casters?casters.map(z=>sg(z.atk)).join(' / '):sg(D.atk)):'',slots:slotsM},spells:sp,
  lookText:c.appearance||'',story:c.story||'',align:alignLabel(c.align,c.gender),languages:langs.join(', '),equip:eq.join('\n'),equipItems:equipNames(c),equipGroups:equipOf,X,gold:coin(goldTotal(c),'po'),silver:coin(goldTotal(c),'pa'),copper:coin(goldTotal(c),'pc'),portrait:safeUrl(c.portrait),beast:beastModel(c,D)};
}
const coin=(pc,u)=>{const n=Math.abs(Math.round(pc)),neg=pc<0?'−':'';const v=u==='po'?Math.floor(n/100):u==='pa'?Math.floor(n%100/10):n%10;return v||u==='po'?neg+v:'';};
const equipNames=c=>ownedItems(c).map(o=>o.n+(o.q>1?' ×'+o.q:''));
/* sur-catégories : Armes, Armures et boucliers, Outils, Équipement (même découpage que l'onglet Équipement) */
const GEAR_GROUPS=['Armes','Armures et boucliers','Outils','Équipement'];
const gearGroup=o=>{const k=o.item?o.item.cat:'';return o.gen||k.startsWith('tool')?'Outils':k[0]==='w'?'Armes':k.startsWith('arm')?'Armures et boucliers':'Équipement';};
function equipGroups(c){const m=new Map(GEAR_GROUPS.map(g=>[g,[]]));ownedItems(c).forEach(o=>m.get(gearGroup(o)).push(o.n+(o.q>1?' ×'+o.q:'')));return GEAR_GROUPS.map(g=>({g,items:m.get(g)})).filter(x=>x.items.length);}
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
 el.textContent=((S.view==='edit'&&S.tab==='sheet'||S.view==='tpl')&&S.fmt==='official')?'@page{size:A4 portrait;margin:6mm}':'';
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
 const r=[];const mu=multi(c);
 if(!c.name)r.push('Le personnage n\'a pas de nom.');
 if(!c.species)r.push('Espèce non choisie.');else{const o=c.sp;
  if(c.species==='drakeide'&&!o.anc)r.push('Ancêtre draconique à choisir.');
  if(c.species==='elfe'&&(!o.lin||!o.sense))r.push('Lignage et sens aiguisés de l\'elfe à choisir.');
  if(c.species==='gnome'&&!o.lin)r.push('Lignage gnome à choisir.');
  if(c.species==='goliath'&&!o.geant)r.push('Ascendance gigante à choisir.');
  if(c.species==='humain'&&(!o.skill||!o.feat))r.push('Compétence et don de l\'humain à choisir.');
  if(c.species==='tieffelin'&&!o.her)r.push('Héritage fiélon à choisir.');}
 if(CS(c).some(k=>k.cls==='rodeur'&&k.sub==='belluaire')&&!(c.beast&&c.beast.t))r.push('Compagnon primitif : type de bête à choisir.');
 if(!c.bg)r.push('Historique non choisi.');else if(c.bgAsi.mode!=='111'&&(!c.bgAsi.p2||!c.bgAsi.p1))r.push('Bonus de caractéristiques de l\'historique à répartir.');
 r.push(...mcWarn(c,D));
 eachCls(c,(x,i)=>{const cl=CL[x.cls],pre=mu?G(cl.n,c)+' : ':'',L=x.level,pick=skPick(x,i),tp=toolPick(x,i);
  if(x.cSk.length<pick)r.push(`${pre}Compétences de classe : ${x.cSk.length}/${pick}.`);
  if(L>=3&&!x.sub)r.push(`${pre}Sous-classe à choisir.`);
  if(x.cls==='barde'&&x.tools.length<tp)r.push(`${pre}Instruments : ${x.tools.length}/${tp}.`);
  {const eN=cl.expN?cl.expN(L):0;if(eN&&x.exp.length<eN)r.push(`${pre}Expertise : ${x.exp.length}/${eN}.`);}
  optsOf(x).forEach(o=>{if(!x.opt[o.k])r.push(pre+o.l+' à choisir.');});
  if(x.cls==='barde'&&x.sub==='savoir'&&L>=3&&x.sSk.length<3)r.push(`${pre}Maîtrises du Collège du Savoir : ${x.sSk.length}/3.`);
  {const n=styleSlots(x);if(x.fs.length<n)r.push(`${pre}Style de combat : ${x.fs.length}/${n}.`);const W=WARRIOR[x.cls];if(W&&x.fs.includes(W[0])&&x.gc.length<2)r.push(`${pre}${W[0]} : sorts mineurs ${x.gc.length}/2.`);}
  if(x.cls==='barbare'&&L>=3&&!x.xs.primal)r.push(`${pre}Savoir primal : compétence à choisir.`);
  if(x.cls==='guerrier'&&x.sub==='maitre'&&L>=3){if(!x.xs.martial)r.push(`${pre}Disciple martial : compétence à choisir.`);if(!x.xs.tool)r.push(`${pre}Disciple martial : outils d'artisan à choisir.`);}
  asiOf(x).forEach(lv=>{if(lv<=L){const f=x.feats[lv];if(f&&f.k!=='asi'){if(!f.t)r.push(`${pre}Don du niveau ${lv} à choisir.`);else{const ft=featByName(f.t);if(ft&&featAbOptions(ft,cl).length&&!f.a)r.push(`${pre}Don du niveau ${lv} : caractéristique du +1 à choisir.`);}}
   if(f.k==='asi'&&(!f.a||(f.m!=='2'&&!f.b)))r.push(`${pre}Niveau ${lv} : amélioration de caractéristiques à compléter.`);if(f.k!=='asi'&&!f.t&&f.o)r.push(`${pre}Niveau ${lv} : don à nommer.`);}});
  if(L>=19&&!x.epic)r.push(`${pre}Faveur épique à choisir.`);
  {const n=WMN[x.cls]?WMN[x.cls](L):0;if(x.wm.length<n)r.push(`${pre}Bottes d'arme : ${x.wm.length}/${n}.`);}
  if(x.cls==='ensorceleur'&&x.meta.length<metaCount(L))r.push(`${pre}Métamagie : ${x.meta.length}/${metaCount(L)}.`);
  if(x.cls==='ensorceleur'&&x.sub==='draconique'&&L>=6&&!x.aff)r.push(`${pre}Affinité élémentaire à choisir.`);
 });
 {const li=langInfo(c);if(c.langs.length<li.slots)r.push(`Langues : ${c.langs.length}/${li.slots}.`);}
 if(c.hpm==='roll'){let m=0;for(let lv=2;lv<=c.tl;lv++)if(!c.hpr[lv])m++;if(m)r.push(`PV : ${m} niveau${m>1?'x':''} à lancer.`);}
 {const nd=nDoue(c);if(nd&&doueUsed(c)<3*nd)r.push(`Doué : maîtrises ${doueUsed(c)}/${3*nd} (compétences et outils).`);}
 c.mi.forEach(m=>{if(!m.cls)r.push('Initié à la magie : liste de sorts à choisir.');else if(m.cant.length<2||!m.spl||!m.ab)r.push(`Initié à la magie : sorts mineurs ${m.cant.length}/2, sort de niveau 1 ${m.spl?1:0}/1, caractéristique ${m.ab?1:0}/1.`);});
 {const seen={};featsOf(c).forEach(f=>{const ft=featByName(f.n),k=ft?ft.id:f.base;if(seen[k]&&!(ft&&ft.rep))r.push(`Le don « ${f.base} » est pris plusieurs fois alors qu'il n'est pas répétable.`);seen[k]=1;});}
 if(D.cast.length){D.cast.forEach(z=>{const pre=D.cast.length>1?z.name+' : ':'';if(z.cantUsed!==z.cantN)r.push(`${pre}Sorts mineurs : ${z.cantUsed}/${z.cantN}.`);if(z.prepUsed!==z.prepN)r.push(`${pre}Sorts préparés : ${z.prepUsed}/${z.prepN}.`);});}
 else{if(D.cantUsed)r.push(`Sorts mineurs : ${D.cantUsed}/0.`);if(D.prepUsed)r.push(`Sorts préparés : ${D.prepUsed}/0.`);}
 if(c.method==='standard'&&[...AB.map(a=>c.base[a])].sort((x,y)=>y-x).join()!=='15,14,13,12,10,8')r.push('Tableau standard incomplet ou en double.');
 if(c.method==='free'&&(c.pool.length<6||AB.some(a=>c.asg[a]===''||c.asg[a]==null)))r.push(c.pool.length?'Dés : lancers ou attribution des scores à terminer.':'Dés : aucun lancer effectué.');
 return r;
}

/* ================== LISTE DES PERSONNAGES ================== */
/* Doublons probables : personnages au contenu identique (hors identifiant et date), par exemple un export réimporté avant la synchronisation */
const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==='object'?Object.keys(v).sort().reduce((o,k)=>(o[k]=canon(v[k]),o),{}):v;
function dupGroups(){const m=new Map();
 S.chars.forEach(c=>{let x;try{x={...blank(),...JSON.parse(JSON.stringify(c))};norm(x);}catch(err){x=c;}const k=JSON.stringify(canon({...x,id:0,mt:0}));if(!m.has(k))m.set(k,[]);m.get(k).push(c);});
 const known=NS.sync?NS.sync.state().known:{};
 return[...m.values()].filter(g=>g.length>1).map(g=>{const keep=g.find(c=>known[c.id]!==undefined)||g[0];return{keep,drop:g.filter(c=>c!==keep)};});}
function viewPick(){
 const ks=Object.keys(CL).sort((a,b)=>CL[a].n.m.localeCompare(CL[b].n.m,'fr'));
 return `<h2>Nouveau personnage</h2><p class="muted">Choisissez la classe de départ. Vous pourrez ajouter une multiclasse plus tard.</p><div class="clsgrid" role="group" aria-label="Choisir la classe de départ">${ks.map(k=>`<button type="button" class="clsb" data-a="newcls" data-v="${k}">${classIcon(k,26)}<span>${e(CL[k].n.m)}</span></button>`).join('')}</div><div class="row" style="margin-top:1rem"><button class="btn" data-a="pickcancel">Annuler</button></div>`;
}
function viewList(){
 if(S.pick)return viewPick();
 let h=`<h2>Mes personnages</h2>`;
 if(!S.chars.length)h+=`<p class="muted">Aucun personnage pour l'instant.</p>`;
h+=`<div class="charlist">`;S.chars.forEach(c=>{h+=`<div class="list-item${S.opt===c.id?' menu-open':''}"><div class="t"><b><span class="hic">${clsIcons(CL[c.cls]?c:{cls:'ensorceleur'},18)}</span><a class="char-link" href="${e(charUrl(c.id))}">${e(c.name||'Sans nom')}</a></b><span class="muted small">${e(clsLine(c,'l'))}${c.species?' · '+e(speciesLabel(c)):''}</span></div>${portraitImg(c.portrait,c.name,'sm')}<div class="acts"><div class="optwrap"><button type="button" class="btn small optbtn" data-a="opt" data-id="${c.id}" aria-haspopup="menu" aria-expanded="${S.opt===c.id}" aria-label="Options" title="Options"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>${S.opt===c.id?`<div class="optmenu" role="menu"><button type="button" class="optitem" role="menuitem" data-a="dup" data-id="${c.id}">Dupliquer</button>${S.del===c.id?`<button type="button" class="optitem danger" role="menuitem" data-a="del" data-id="${c.id}">Confirmer la suppression</button>`:`<button type="button" class="optitem danger" role="menuitem" data-a="askdel" data-id="${c.id}">Supprimer</button>`}</div>`:''}</div></div></div>`;}); h+=`</div>`; {const dg=dupGroups();if(dg.length){const nd=dg.reduce((t,g)=>t+g.drop.length,0);
  h+=`<div class="note warn" role="status" style="margin-top:1rem"><b>${nd} doublon${nd>1?'s':''} probable${nd>1?'s':''}</b> : ${dg.map(g=>e(g.keep.name||'Sans nom')+' ×'+(g.drop.length+1)).join(', ')} (contenu identique). On garde un exemplaire de chaque.<div class="row" style="margin-top:8px"><button class="btn ${S.dupc?'danger':''}" data-a="rmdup">${S.dupc?'Confirmer : supprimer '+nd+' copie'+(nd>1?'s':''):'Supprimer les doublons'}</button>${S.dupc?'<button class="btn" data-a="rmdupno">Annuler</button>':''}</div></div>`;}}
 h+=`<div class="row" style="margin-top:1rem"><button class="btn primary" data-a="newc">Nouveau personnage</button></div>`;
 h+=`<details class="tpls"><summary>Fiches types <span class="muted small">(${TEMPLATES.length}, lecture seule)</span></summary><p class="small muted">Une fiche de niveau 1 par classe, avec les caractéristiques du Tableau, les compétences, les sorts et l'équipement conseillés. Aperçu en lecture seule ; « Utiliser comme base » crée votre propre copie, à modifier librement.</p>${TEMPLATES.map(t=>`<div class="list-item"><div class="t"><b><span class="hic">${classIcon(t.cls,18)}</span>${e(CL[t.cls].n.m)}</b><span class="muted small">${e(SPN[t.species].m)} · ${e(BG[t.bg].n.m)} · niveau 1</span></div><div class="acts"><a class="btn small" href="personnage.html?tpl=${t.cls}">Aperçu</a><button class="btn small primary" data-a="usetpl" data-k="${t.cls}">Utiliser comme base</button></div></div>`).join('')}</details>`;
 h+=`<h3>Bibliothèque</h3><div class="libs"><a class="lib" href="grimoire.html"><b>Grimoire des sorts</b><span>${SPELLDB.length} sorts, avec recherche et filtres</span></a><a class="lib" href="equipement.html"><b>Équipement</b><span>${GEAR.length} objets : armes, armures, outils, matériel</span></a></div>`;
 h+=`<div class="apparence"><h3>Apparence</h3><p class="small muted">Clair, sombre ou médiéval. Votre choix est gardé pour vos prochaines visites. « Automatique » suit le réglage de votre appareil.</p>${themeHTML()}</div>`;
 {const Y=NS.sync,ys=Y.state(),cid=Y.clientId();
  h+=`<details class="impx"${S.sy.busy||S.sy.msg?' open':''}><summary>Synchronisation Google Drive</summary>`;
  if(!cid)h+=`<p class="small muted">Pour retrouver vos personnages sur plusieurs appareils : collez ici l'identifiant client Google de l'application (à saisir une fois par appareil), puis connectez-vous.</p><input type="text" id="sycid" placeholder="123456-abc.apps.googleusercontent.com" autocomplete="off" aria-label="Identifiant client Google"><div class="row" style="margin-top:8px"><button class="btn" data-a="sycid">Enregistrer l'identifiant</button></div>`;
  else{
   h+=`<p class="small muted">Un dossier « Configurateur DnD » de votre Drive contient un fichier par personnage. La synchronisation fusionne les deux côtés : le plus récent gagne, personnage par personnage, et une suppression est répercutée.${ys.last?' Dernière synchronisation : '+e(new Date(ys.last).toLocaleString('fr-FR'))+'.':''}</p>`;
   h+=`<div class="row"><button class="btn primary" data-a="sync"${S.sy.busy?' disabled':''}>${S.sy.busy?'Synchronisation…':ys.last?'Synchroniser maintenant':'Se connecter et synchroniser'}</button>${ys.last||ys.fid?`<button class="btn" data-a="syforget"${S.sy.busy?' disabled':''}>Déconnecter</button>`:''}</div>`;
  }
  if(S.sy.msg)h+=`<div class="note${S.sy.err?' warn':''}" role="status" style="margin-top:8px">${e(S.sy.msg)}</div>`;
  h+=`</details>`;}
 h+=`<details class="impx"><summary>Importer et exporter</summary>${S.chars.length?`<div class="row" style="margin-top:8px"><button class="btn" data-a="expAll">Tout sauvegarder (.json)</button></div>`:''}<h3>Importer</h3><p class="small muted">Collez le contenu d'une sauvegarde .json, ou choisissez le fichier.</p><textarea id="impt" placeholder="Contenu JSON"></textarea><div class="row" style="margin-top:8px"><button class="btn" data-a="imp">Importer le texte collé</button><label class="btn" style="text-align:center">Choisir un fichier<input type="file" id="impf" accept=".json,application/json" hidden></label></div></details>
 <p class="small muted">Vos personnages sont enregistrés dans ce navigateur, sur cet appareil uniquement. Pensez à sauvegarder un fichier .json pour les garder ou les transférer.</p>`;
 return h;
}
/* ================== CATALOGUE D'ÉQUIPEMENT ================== */
const GEAR_SUR=[['Armes',['wpn1','wpn2']],['Armures',['arm-l','arm-i','arm-h','arm-s']],['Outils',['tool-artisan','tool-musique','tool-jeu','tool-autre']],['Équipements',['gear','pack']]];
/* options de catégorie d'objet, regroupées par surcatégorie */
function catOpts(cur,all){
 return (all?`<option value=""${cur?'':' selected'}>Toutes</option>`:'')+GEAR_SUR.map(([sn,keys])=>`<optgroup label="${e(sn)}">${keys.map(k=>{const l=(GEAR_CATS.find(x=>x[0]===k)||[])[1]||k;return `<option value="${k}"${k===cur?' selected':''}>${e(l)}</option>`;}).join('')}</optgroup>`).join('');
}
function gearResults(){
 const q=fold(S.gq||''),cat=GEAR_CATS.some(x=>x[0]===S.gcat)?S.gcat:'',force=!!(q||cat);
 const info=g=>{const x=[];if(g.arm)x.push(g.arm.kind==='s'?'CA +2':'CA '+g.arm.base+(g.arm.kind==='h'?'':' + Dex'+(g.arm.cap?' (max '+g.arm.cap+')':''))+(g.arm.str?' · Force '+g.arm.str:'')+(g.arm.stealth?' · désavantage en Discrétion':''));if(g.w)x.push(g.w.dice+' '+g.w.dt);return x.join(' · ');};
 const op=k=>force||S.gopen.has(k)?' open':'';
 let h='',n=0;
 GEAR_SUR.forEach(([sn,keys])=>{
  let inner='',cnt=0;
  keys.forEach(k=>{if(cat&&cat!==k)return;const label=(GEAR_CATS.find(x=>x[0]===k)||[])[1]||k;const list=GEAR.filter(g=>g.cat===k&&(!q||fold(g.n).includes(q)));if(!list.length)return;cnt+=list.length;
   inner+=`<details class="gc"${op('c:'+k)} data-gk="c:${k}"><summary>${e(label)} <span class="muted small">(${list.length})</span></summary>${list.map(g=>`<div class="list-item"><div class="t"><b>${e(g.n)}</b><span class="muted small">${e(info(g))}</span></div><b>${e(fmtMoney(g.p))}</b></div>`).join('')}</details>`;});
  if(!cnt)return;n+=cnt;
  h+=`<details class="gs"${op('s:'+sn)} data-gk="s:${sn}"><summary>${e(sn)} <span class="muted small">(${cnt})</span></summary>${inner}</details>`;});
 return n?h:`<p class="muted">Aucun objet ne correspond.</p>`;
}
function fillGear(){const r=document.getElementById('gearres');if(r)r.innerHTML=gearResults();}
function viewGear(){
 let h=`<h2>Équipement</h2><p class="muted">Armes, armures, outils et matériel d'aventurier du Manuel des Joueurs 2024, avec leurs prix, d'après AideDD.</p>`;
 h+=`<div class="row" style="align-items:end"><label class="field"><span>Rechercher un objet</span><input type="search" id="gearq" data-ui="gq" value="${e(S.gq)}" placeholder="Nom" autocomplete="off"></label><label class="field"><span>Catégorie</span><select data-ui="gcat">${catOpts(S.gcat,true)}</select></label></div>`;
 h+=`<div class="gbtns"><button type="button" class="btn small" data-a="gall" data-v="1">Tout déplier</button><button type="button" class="btn small" data-a="gall" data-v="0">Tout replier</button></div>`;
 return h+`<div id="gearres">${gearResults()}</div>`;
}

/* ================== GRIMOIRE ================== */
function grimResults(){
 const g=S.g;
 const list=filterSpells({q:g.q,lv:g.lv,school:g.sch,cls:g.cls,time:g.time,conc:g.conc,rit:g.rit,dmg:g.dmg},SPELLDB);
 return V.results(list,S.glim,V.detailRow,'gmore',{ctx:'g',open:S.sopen,force:!!(g.q||g.lv.length||filtCount(g))});
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
 if(S.view==='gear'){
  hdr.innerHTML=`<div class="top-row"><div class="who"><b>Équipement</b><span>D&amp;D 2024 · ${GEAR.length} objets</span></div><button class="btn small" data-a="gback">Retour</button></div><div style="height:10px"></div>`;
  app.innerHTML=viewGear();bind();window.scrollTo(0,keepScroll?y:0);return;
 }
 if(S.view==='tpl'&&S.tpl){
  const tc=S.tpl,t=TEMPLATES.find(x=>x.cls===tc.cls);norm(tc);const D=derive(tc);
  hdr.innerHTML=`<div class="top-row"><div class="whorow"><span class="hic">${clsIcons(tc,26)}</span><div class="who"><b>${e(tc.name)}</b><span>Lecture seule · ${e(clsLine(tc,'h'))} · ${e(speciesLabel(tc))}</span></div></div><div class="hbtns"><a class="btn small" href="index.html">Accueil</a><button class="btn small primary" data-a="usetpl" data-k="${tc.cls}">Utiliser comme base</button></div></div><div style="height:10px"></div>`;
  app.innerHTML=`<div class="note noprint"><b>Fiche type en lecture seule.</b> ${e(t?t.note:'')} Touchez « Utiliser comme base » pour créer votre copie modifiable (nom à saisir ensuite).</div>`+tabSheet(tc,D);
  bind();window.scrollTo(0,keepScroll?y:0);return;
 }
 if(PAGE_ID==='char'&&!c){
  hdr.innerHTML=`<div class="top-row"><div class="who"><b>Personnage introuvable</b><span>Il a peut-être été supprimé</span></div><a class="btn small" href="index.html">Accueil</a></div><div style="height:10px"></div>`;
  app.innerHTML=`<p class="muted">Ce personnage n'existe plus dans ce navigateur. Retournez à l'accueil pour choisir ou créer un personnage.</p><p><a class="btn primary" href="index.html">Retour à l'accueil</a></p>`;bind();return;
 }
 if(S.view==='list'||!c){
  hdr.innerHTML=`<div class="top-row"><div class="who"><b>Configurateur D&amp;D 2024</b><span>Création de personnage</span></div></div><div style="height:10px"></div>`;
  app.innerHTML=viewList();bind();window.scrollTo(0,keepScroll?y:0);return;
 }
 norm(c);const D=derive(c);const cl=CL[c.cls],sub=(SUBS[c.cls]||{})[c.sub];
 hdr.innerHTML=`<div class="top-row"><div class="whorow${S.chars.length>1?' sw':''}"><span class="hic">${clsIcons(c,26)}</span><div class="who"><b id="hn">${e(c.name||'Personnage sans nom')}</b><span>${e(clsLine(c,'h'))}${c.species?' · '+e(speciesLabel(c)):''}</span></div>${S.chars.length>1?`<i class="swchev" aria-hidden="true"></i><select class="swsel" data-sw aria-label="Changer de personnage">${S.chars.map(x=>`<option value="${e(x.id)}"${x.id===c.id?' selected':''}>${CLS_EMO[x.cls]||'🎲'} ${e(x.name||'Sans nom')} · ${e(clsLine(CL[x.cls]?x:{cls:'ensorceleur'},'l'))}</option>`).join('')}</select>`:''}</div><div class="hbtns"><a class="btn small" href="grimoire.html">Grimoire</a><a class="btn small" href="equipement.html">Équipement</a><a class="btn small" href="index.html">Accueil</a></div></div>
 <nav class="tabs" aria-label="Étapes">${TABS.map(([k,l])=>`<button class="tab" data-a="tab" data-v="${k}" ${S.tab===k?'aria-current="true"':''}>${l}</button>`).join('')}</nav>`;
 let h='';
 switch(S.tab){case 'id':h=tabId(c);break;case 'origin':h=tabOrigin(c,D);break;case 'cls':h=tabCls(c,D);break;case 'scores':h=tabScores(c,D);break;case 'spells':h=tabSpells(c,D);break;case 'equip':h=tabEquip(c,D);break;default:h=tabSheet(c,D);}
 const i=TABS.findIndex(t=>t[0]===S.tab);
 h+=`<div class="nav noprint">${i>0?`<button class="btn" data-a="tab" data-v="${TABS[i-1][0]}">Précédent</button>`:'<span></span>'}${i<TABS.length-1?`<button class="btn primary" data-a="tab" data-v="${TABS[i+1][0]}">Suivant</button>`:'<span></span>'}</div>`;
 app.innerHTML=h;bind();window.scrollTo(0,keepScroll?y:0);
}
const topH=()=>{const h=document.querySelector('header.top');document.documentElement.style.setProperty('--hh',(h?Math.ceil(h.getBoundingClientRect().height):0)+'px');};
if(typeof ResizeObserver!=='undefined'){const h=document.querySelector('header.top');if(h)new ResizeObserver(topH).observe(h);}
window.addEventListener('resize',topH);
(()=>{const b=document.getElementById('totop');if(!b)return;
 const upd=()=>{b.hidden=window.scrollY<(window.innerHeight*0.8);};
 window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);
 b.addEventListener('click',()=>{const r=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;window.scrollTo({top:0,behavior:r?'auto':'smooth'});});
 upd();})();
function bind(){topH();pageStyle();fitOfficial();const t=document.getElementById('impf');if(t)t.onchange=ev=>{const f=ev.target.files&&ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>importText(String(r.result));r.readAsText(f);};}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>{t.hidden=true;},3500);}

/* ================== ACTIONS ================== */
function touch(){const c=C();if(c)norm(c);persist(S.view==='edit'&&c?[c.id]:[]);}   /* on nettoie avant d'enregistrer : la sauvegarde ne garde pas de valeurs invalides */
const A={
 beast(d){const c=C();if(!c||!BEASTS[d.v])return;c.beast=Object.assign({t:'',name:'',race:''},c.beast||{},{t:d.v});touch();render(true);},
 bgPick(d){const c=C();if(!c||!BG[d.v])return;if(c.bg===d.v)return;setp(c,'bg',d.v);touch();render(true);},
 speciesPick(d){const c=C();if(!c||!SPN[d.v])return;if(c.species===d.v)return;c.species=d.v;c.sp={};touch();render(true);},
 tab(d){S.tab=d.v;try{history.replaceState(null,'','#'+d.v);}catch(x){}render(false);},
 list(){go('index.html');},
 tpl(d){if(TEMPLATES.some(x=>x.cls===d.k))go('personnage.html?tpl='+encodeURIComponent(d.k));},
 usetpl(d){const t=TEMPLATES.find(x=>x.cls===d.k);if(!t)return;const c=buildTemplate(t,blank,'');S.chars.push(c);S.cur=c.id;persist([c.id]);go(charUrl(c.id,'id'));},
 grim(){go('grimoire.html');},
 gear(){go('equipement.html');},
 gback(){let same=false;try{same=!!document.referrer&&new URL(document.referrer).origin===location.origin;}catch(x){}if(same&&history.length>1)history.back();else go('index.html');},
 glv(d,el){const l=+d.v,a=S.g.lv,i=a.indexOf(l);if(i>=0)a.splice(i,1);else a.push(l);const on=i<0;el.classList.toggle('on',on);el.setAttribute('aria-pressed',on?'true':'false');S.glim=PAGE;fillGrim();},
 gmore(){const n=document.querySelectorAll('#gres .sd').length;S.glim+=PAGE;fillGrim();const f=document.querySelectorAll('#gres .sd summary')[n];if(f)f.focus();},
 greset(){S.g=newG();S.glim=PAGE;render(false);},
 smore(){const n=document.querySelectorAll('#sres .srb').length;S.slim+=PAGE;fillPick();const f=document.querySelectorAll('#sres .srb')[n];if(f)f.focus();},
 open(d){go(charUrl(d.id));},   /* un personnage nommé s'ouvre sur sa fiche, un personnage sans nom sur l'identité */
 newc(){S.pick=true;render(true);},
 newcls(d){if(!CL[d.v])return;const c=blank();c.cls=d.v;S.pick=false;S.chars.push(c);S.cur=c.id;persist([c.id]);go(charUrl(c.id,'id'));},
 pickcancel(){S.pick=false;render(true);},
 opt(d){S.opt=S.opt===d.id?null:d.id;S.del=null;render(true);},
 dup(d){const o=S.chars.find(x=>x.id===d.id);if(!o)return;S.opt=null;const n=JSON.parse(JSON.stringify(o));n.id=uid();n.name=(o.name||'Sans nom')+' (copie)';S.chars.push(n);touch();render(true);},
 rmdup(){if(!S.dupc){S.dupc=true;render(true);return;}const ids=dupGroups().flatMap(g=>g.drop.map(c=>c.id));S.dupc=false;if(ids.length){S.chars=S.chars.filter(x=>!ids.includes(x.id));persist([],ids);toast(ids.length+' doublon(s) supprimé(s).');}render(true);},
 rmdupno(){S.dupc=false;render(true);},
 askdel(d){S.opt=d.id;S.del=d.id;render(true);},
 del(d){S.chars=S.chars.filter(x=>x.id!==d.id);if(S.cur===d.id)S.cur=S.chars[0]?S.chars[0].id:null;S.del=null;persist([],[d.id]);render(true);},
 gender(d){const c=C();c.gender=d.v;touch();render(true);},
 align(d){const c=C();if(!c)return;c.align=d.v||'';touch();render(true);},
 fmt(d){S.fmt=d.v==='official'?'official':'detail';persist();render(true);},
 addcls(d){const c=C();if(!c||c.tl>=20||!CL[d.v]||CS(c).some(k=>k.cls===d.v))return;c.mc.push(mkCls(d.v));touch();render(true);},
 rmcls(d){const c=C(),i=+d.i;if(!c||!multi(c))return;if(i===0)unstash(c,c.mc.shift());else c.mc.splice(i-1,1);touch();render(true);},
 firstcls(d){const c=C(),i=+d.i;if(!c||i<1||!c.mc[i-1])return;const o=c.mc[i-1],p={};stash(c,p);unstash(c,o);c.mc[i-1]=p;touch();render(true);},
 asimode(d){const c=C();c.bgAsi.mode=d.v;touch();render(true);},
 method(d){const c=C();c.method=d.v;touch();render(true);},
 togMan(){S.manOpen=!S.manOpen;render(true);},
 pb(d){const c=C();const cost={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};const a=d.ab;const b=c.bases.pointbuy;const nv=b[a]+(+d.d);if(nv<8||nv>15)return;const t=AB.reduce((s,x)=>s+cost[x===a?nv:b[x]],0);if(t>27){toast('Pas assez de points.');return;}b[a]=nv;touch();render(true);},
 rollOne(){const c=C();if(c.pool.length>=6)return;c.pool.push(roll4());touch();render(true);},
 rollAll(){const c=C();while(c.pool.length<6)c.pool.push(roll4());touch();render(true);},
 rollReset(){const c=C();c.pool=[];c.asg={};c.rr=(+c.rr||0)+1;touch();render(true);},
 addPool(){const c=C();const inp=document.getElementById('mv');const v=Math.round(+(inp&&inp.value));if(!(v>=3&&v<=18)){toast('Entrez un résultat entre 3 et 18.');return;}c.pool.push({v,d:null});touch();render(true);const mv=document.getElementById('mv');if(mv)mv.focus();},
 tog(d){const c=C();const arr=c[d.p];const i=arr.indexOf(d.v);if(i>=0)arr.splice(i,1);else if(arr.length<+d.max)arr.push(d.v);touch();render(true);},
 togs(d){const c=C();const arr=c.spells[d.p];const i=arr.indexOf(d.v);if(i>=0)arr.splice(i,1);else if(lockedSpells(derive(c)).has(d.v))return;else arr.push(d.v);touch();render(true);},
 featk(d){const c=C();c.feats[d.lv].k=d.v;touch();render(true);},
 featm(d){const c=C();c.feats[d.lv].m=d.v;if(d.v==='2')c.feats[d.lv].b='';touch();render(true);},
 hpm(d){const c=C();c.hpm=d.v==='roll'?'roll':'auto';touch();render(true);},
 hproll(d){const c=C(),q=hdSeq(c)[+d.lv-1];if(!q)return;c.hpr[d.lv]=1+Math.floor(Math.random()*q.hd);touch();render(true);},
 hprollall(){const c=C();hdSeq(c).forEach((q,k)=>{if(k>=1&&!c.hpr[k+1])c.hpr[k+1]=1+Math.floor(Math.random()*q.hd);});touch();render(true);},
 hpclear(){const c=C();c.hpr={};touch();render(true);},
 togmi(d){const c=C();const m=c.mi[+d.i];if(!m)return;const arr=m[d.k],j=arr.indexOf(d.v);if(j>=0)arr.splice(j,1);else if(arr.length<2)arr.push(d.v);touch();render(true);},
 eq(d){const c=C();c[d.w]=d.v;touch();render(true);},
 sfold(d){const root=document.getElementById(d.c==='g'?'gres':'sres');if(!root)return;root.querySelectorAll('details.lv').forEach(x=>{x.open=d.v==='1';});},
 gall(d){if(d.v==='1'){GEAR_SUR.forEach(([sn,keys])=>{S.gopen.add('s:'+sn);keys.forEach(k=>S.gopen.add('c:'+k));});}else S.gopen.clear();fillGear();},
 eqview(d){S.eqv=d.v==='src'?'src':'cat';render(true);},
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
async sync(){
  if(S.sy.busy)return;S.sy={busy:true,msg:'',err:false};render(true);
  try{const o=await NS.sync.syncGoogle(S.chars);
   if(o.down.length){o.down.forEach(c=>{const n={...blank(),...c};const i=S.chars.findIndex(x=>x.id===n.id);if(i>=0)S.chars[i]=n;else S.chars.push(n);});persist(o.down.map(c=>c.id),null,{keepMt:true});}
   if(o.delLocal.length){S.chars=S.chars.filter(x=>!o.delLocal.includes(x.id));if(o.delLocal.includes(S.cur))S.cur=null;persist([],o.delLocal,{quiet:true});}
   persist(S.chars.map(c=>c.id),null,{keepMt:true});
   const t=o.stats;S.sy={busy:false,err:false,msg:t.up+t.down+t.del?`Synchronisé : ${t.up} envoyé(s), ${t.down} reçu(s), ${t.del} supprimé(s).`:'Tout est déjà à jour.'};
  }catch(x){S.sy={busy:false,err:true,msg:String(x&&x.message||x)};}
  render(true);},
 sycid(){const v=(document.getElementById('sycid')||{}).value||'';if(!/\.apps\.googleusercontent\.com$/.test(v.trim())){toast('Identifiant invalide (il finit par .apps.googleusercontent.com).');return;}NS.sync.setClientId(v);render(true);},
 syforget(){NS.sync.forget();S.sy={busy:false,err:false,msg:'Déconnecté. Les personnages restent sur cet appareil et sur le Drive.'};render(true);},
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
  const ids=[];arr.forEach(c=>{const keep=typeof c.id==='string'&&c.id&&!S.chars.some(x=>x.id===c.id);const n={...blank(),...c,id:keep?c.id:uid()};if(!keep)delete n.mt;S.chars.push(n);ids.push(n.id);});persist(ids);toast(arr.length+' personnage(s) importé(s).');render(false);
 }catch(x){toast('Fichier illisible.');}
}

/* ================== ÉVÉNEMENTS ================== */
const ciOf=t=>{const w=t.closest&&t.closest('[data-ci]');return w?+w.dataset.ci||0:0;};
const inCls=(t,fn)=>{const c=C();if(!c)return fn();try{sw(c,ciOf(t));return fn();}finally{sw(c,0);}};
document.addEventListener('click',ev=>{const t=ev.target.closest('[data-a]');if(!t||!A[t.dataset.a])return;ev.preventDefault();inCls(t,()=>A[t.dataset.a](t.dataset,t));});
document.addEventListener('click',ev=>{if(S.opt==null)return;if(ev.target.closest&&ev.target.closest('.optwrap'))return;S.opt=null;S.del=null;render(true);});
document.addEventListener('change',ev=>{const t=ev.target;if(t&&t.dataset&&t.dataset.sw!==undefined){if(t.value&&t.value!==S.cur)go(charUrl(t.value,S.tab));return;}if(!t.dataset||t.dataset.b===undefined)return;const c=C();if(!c)return;let v=t.type==='checkbox'?t.checked:t.value;if(t.dataset.num!==undefined)v=+v;inCls(t,()=>{setp(c,t.dataset.b,v);if(t.dataset.b==='species'){c.sp={};}touch();render(true);});});
document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target&&ev.target.id==='mv'){ev.preventDefault();A.addPool();}});
document.addEventListener('input',ev=>{const t=ev.target;if(!t.dataset||t.dataset.live===undefined)return;const c=C();if(!c)return;inCls(t,()=>{setp(c,t.dataset.live,t.value);touch();});if(t.dataset.live==='name'){const hn=document.getElementById('hn');if(hn)hn.textContent=t.value||'Personnage sans nom';}if(t.dataset.live==='portrait'){const pv=document.getElementById('pprev');if(pv)pv.innerHTML=portraitBlock(t.value,c.name);}});

document.addEventListener('input',ev=>{const t=ev.target,d=t.dataset||{};
 if(d.g==='q'){S.g.q=t.value;S.glim=PAGE;fillGrim();}
 else if(d.ui==='sq'){S.sq=t.value;S.slim=PAGE;fillPick();}
 else if(d.ui==='gq'){S.gq=t.value;fillGear();}
});
document.addEventListener('toggle',ev=>{const t=ev.target,k=t&&t.dataset&&t.dataset.gk;if(!k)return;if(k[0]==='m'){if(t.open)S.mopen.add(k);else S.mopen.delete(k);return;}if(k[0]==='e'){if(t.open)S.sclosed.delete(k);else S.sclosed.add(k);return;}if(k[0]==='c'){if(t.open)S.sclosed.delete(k);else S.sclosed.add(k);return;}if(k[0]==='l'){if(t.closest('#sres')?(S.sq||S.slv!==''||S.sch>=0||S.sf||S.sdm):(S.g.q||S.g.lv.length||filtCount(S.g)))return;if(t.open)S.sopen.add(k);else S.sopen.delete(k);return;}if(S.gq||S.gcat)return;if(t.open)S.gopen.add(k);else S.gopen.delete(k);},true);
document.addEventListener('change',ev=>{const t=ev.target,d=t.dataset||{};
 /* Les champs de recherche sont déjà traités par « input » : les relancer ici au moment où
    le champ perd le focus remplacerait la liste entre l'appui et le relâchement du clic. */
 if(d.g==='q'||d.ui==='sq'||d.ui==='gq')return;
 if(d.g){S.g[d.g]=d.g==='sch'?+t.value:t.type==='checkbox'?t.checked:t.value;S.glim=PAGE;fillGrim();}
 else if(d.ui){S[d.ui]=(d.ui==='sch'||d.ui==='spi')?+t.value:t.value;S.slim=PAGE;render(true);}
 else if(d.ek!==undefined){const c=C();if(!c)return;c.eqKeep[d.ek]=Math.max(0,Math.floor(+t.value)||0);touch();render(true);}
 else if(d.bq!==undefined){const c=C();if(!c||!c.buy[+d.bq])return;c.buy[+d.bq].q=Math.floor(+t.value)||0;touch();render(true);}
 else if(d.ev!==undefined){const c=C();if(!c)return;if(t.value)c.eqVar[d.ev]=t.value;else delete c.eqVar[d.ev];touch();render(true);}
 else if(d.feat){const c=C();if(!c)return;const v=t.value;
  inCls(t,()=>{if(d.feat==='epic'){if(v==='__other'){c.epicO=1;c.epic='';}else{c.epicO=0;c.epic=v;}}
  else{const f=c.feats[d.feat];if(f){if(v==='__other'){f.o=1;f.t='';}else{f.o=0;f.t=v;}}}
  touch();render(true);});}
});

/* ================== APPARENCE ================== */
const THEME_KEY='dnd24-theme',THEMES=[['auto','Automatique'],['light','Clair'],['dark','Sombre'],['medieval','Médiéval']];
const DEFAULT_THEME='medieval';   /* thème proposé à la première visite ; « Automatique » est enregistré explicitement */
const getTheme=()=>{try{const t=localStorage.getItem(THEME_KEY);return THEMES.some(x=>x[0]===t)?t:DEFAULT_THEME;}catch(x){return DEFAULT_THEME;}};
function applyTheme(t){
 const r=document.documentElement;
 if(t==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',t);
 if(t==='medieval'&&!document.getElementById('fmed')){const l=document.createElement('link');l.id='fmed';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap';document.head.appendChild(l);}
 document.querySelectorAll('.theme-sw button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeSet===t)));
}
const themeHTML=()=>`<div class="theme-sw" role="group" aria-label="Apparence">${THEMES.map(([k,l])=>`<button type="button" data-theme-set="${k}" aria-pressed="${getTheme()===k}">${l}</button>`).join('')}</div>`;
function setTheme(t){try{localStorage.setItem(THEME_KEY,t);}catch(x){}applyTheme(t);}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-theme-set]');if(b)setTheme(b.dataset.themeSet);});
window.addEventListener('storage',ev=>{if(ev.key===THEME_KEY)applyTheme(getTheme());});
{const f=document.getElementById('themes');if(f)f.innerHTML=themeHTML();}
applyTheme(getTheme());

/* ================== DÉMARRAGE ================== */
const PAGE_ID=document.body.dataset.page||'home';
load();
{const st=document.createElement('style');st.id='ocss';st.textContent=OFFICIAL_CSS;document.head.appendChild(st);}
window.addEventListener('resize',fitOfficial);
{
 const qp=new URLSearchParams(location.search);
 if(PAGE_ID==='grim')S.view='grim';
 else if(PAGE_ID==='gear')S.view='gear';
 else if(PAGE_ID==='char'){
  const tk=qp.get('tpl'),t=tk&&TEMPLATES.find(x=>x.cls===tk);
  if(t){S.tpl=buildTemplate(t,blank,CL[t.cls].n.m+' (fiche type)');S.tpl.tid=t.cls;S.view='tpl';}
  else{
   S.cur=qp.get('id')||null;S.view='edit';
   const c=C(),h=location.hash.slice(1);
   S.tab=TABS.some(x=>x[0]===h)?h:(c&&String(c.name||'').trim()?'sheet':'id');   /* un personnage nommé s'ouvre sur sa fiche, un personnage sans nom sur l'identité */
   if(c){norm(c);S.snap=JSON.stringify(c);}
  }
 }
 else S.view='list';
}
/* Revenir sur l'onglet (ou changer de page avec « précédent ») : on relit la sauvegarde, au cas où un personnage a changé dans un autre onglet */
function refresh(){
 if(S.sy&&S.sy.busy)return;
 if(PAGE_ID==='home'){
  const a=document.activeElement;if(a&&/^(TEXTAREA|INPUT)$/.test(a.tagName)&&a.value)return;
  load();render(true);
 }else if(PAGE_ID==='char'&&S.view==='edit'){
  const d=stored(),sc=(d.chars||[]).find(x=>x.id===S.cur);
  if(!sc||JSON.stringify(sc)===S.snap)return;
  const keep=S.tab,cur=S.cur;load();S.tab=keep;S.cur=cur;S.snap=JSON.stringify(sc);render(true);
 }
}
window.addEventListener('hashchange',()=>{if(PAGE_ID!=='char'||S.view!=='edit')return;const h=location.hash.slice(1);if(TABS.some(x=>x[0]===h)&&h!==S.tab){S.tab=h;render(false);}});
window.addEventListener('focus',refresh);
window.addEventListener('pageshow',ev=>{if(ev.persisted)refresh();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
window.addEventListener('storage',ev=>{if(ev.key===KEY)refresh();});
/* ---- Aperçu d'un sort : appui long sur un sort des choix (même contenu que la fiche du grimoire) ---- */
let spPop=null,spTimer=null,spFired=false,spDown=null;
const SP_SEL='.srb[data-v],.pill[data-v],.spn[data-v]';
const spClose=()=>{if(spPop){spPop.remove();spPop=null;}};
function spShow(btn){
  const s=spellByName(btn.dataset.v);if(!s)return;
  spClose();
  const el=document.createElement('div');el.className='spop';el.setAttribute('role','dialog');
  el.innerHTML=`<div class="spop-h"><b>${e(s.n)}</b><span class="muted small">${e(s.lv===0?'Sort mineur':'Niveau '+s.lv)} · ${V.meta(s)}</span></div>${V.spellInfo(s)}`;
  document.body.appendChild(el);spPop=el;
  const r=btn.getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight,vw=window.innerWidth,vh=window.innerHeight;
  let left=Math.min(Math.max(8,r.left),vw-w-8);
  let top=r.bottom+6;if(top+h>vh-8)top=Math.max(8,r.top-h-6);
  el.style.left=left+'px';el.style.top=top+'px';
}
document.addEventListener('pointerdown',ev=>{
  const b=ev.target.closest&&ev.target.closest(SP_SEL);
  clearTimeout(spTimer);spFired=false;if(!b||ev.button>0)return;
  spDown={x:ev.clientX,y:ev.clientY};
  spTimer=setTimeout(()=>{spFired=true;spShow(b);},500);
});
document.addEventListener('pointermove',ev=>{if(spDown&&!spFired&&Math.hypot(ev.clientX-spDown.x,ev.clientY-spDown.y)>8){clearTimeout(spTimer);spDown=null;}});
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,()=>{clearTimeout(spTimer);spDown=null;}));
document.addEventListener('contextmenu',ev=>{
  const b=ev.target.closest&&ev.target.closest(SP_SEL);
  if(spFired){ev.preventDefault();return;}
  if(b&&spellByName(b.dataset.v)){ev.preventDefault();clearTimeout(spTimer);spShow(b);}else spClose();
});
window.addEventListener('click',ev=>{
  if(spFired){spFired=false;ev.preventDefault();ev.stopImmediatePropagation();return;}
  if(spPop&&!spPop.contains(ev.target))spClose();
},true);
document.addEventListener('toggle',ev=>{const t=ev.target;if(t&&t.classList&&t.classList.contains('sfilt'))S.fopen=t.open;},true);
window.addEventListener('scroll',spClose,true);
window.addEventListener('resize',spClose);

/* ---- Explications (fiche détaillée et officielle) : survol (souris) ou appui long (tactile).
   Le popup reste ouvert tant que la souris est dessus ou qu'on clique dedans (liens) ; un clic ailleurs le ferme. ---- */
let xPop=null,xCur=null,xTimer=null,xFired=false,xDown=null,xHideT=null;
const xCancelHide=()=>{clearTimeout(xHideT);xHideT=null;};
const xScheduleHide=()=>{xCancelHide();xHideT=setTimeout(()=>xClose(),250);};
const xClose=()=>{xCancelHide();if(xPop){xPop.remove();xPop=null;}xCur=null;};
function xShow(el){
  const html=EX[el.dataset.ex];if(!html)return;
  if(xPop)xPop.remove();
  const p=document.createElement('div');p.className='spop xpop';p.setAttribute('role','tooltip');p.innerHTML=html;
  document.body.appendChild(p);xPop=p;
  const r=el.getBoundingClientRect(),w=p.offsetWidth,h=p.offsetHeight,vw=window.innerWidth,vh=window.innerHeight;
  const left=Math.min(Math.max(8,r.left),vw-w-8);let top=r.bottom+6;if(top+h>vh-8)top=Math.max(8,r.top-h-6);
  p.style.left=left+'px';p.style.top=top+'px';
}
document.addEventListener('pointerover',ev=>{
  if(ev.pointerType!=='mouse'||!ev.target.closest)return;
  if(xPop&&xPop.contains(ev.target)){xCancelHide();return;}
  const t=ev.target.closest('[data-ex]');
  if(t){xCancelHide();if(t!==xCur){xCur=t;xShow(t);}}
});
document.addEventListener('pointerout',ev=>{
  if(ev.pointerType!=='mouse'||!ev.target.closest)return;
  const t=ev.target.closest('[data-ex]');
  if(t&&t===xCur&&!t.contains(ev.relatedTarget))xScheduleHide();
  if(xPop&&xPop.contains(ev.target)&&!xPop.contains(ev.relatedTarget))xScheduleHide();
});
document.addEventListener('pointerdown',ev=>{
  clearTimeout(xTimer);xFired=false;if(ev.pointerType==='mouse'||ev.button>0)return;
  const t=ev.target.closest&&ev.target.closest('[data-ex]');if(!t)return;
  xDown={x:ev.clientX,y:ev.clientY};
  xTimer=setTimeout(()=>{xFired=true;xCur=t;xShow(t);},500);
});
document.addEventListener('pointermove',ev=>{if(xDown&&!xFired&&Math.hypot(ev.clientX-xDown.x,ev.clientY-xDown.y)>8){clearTimeout(xTimer);xDown=null;}});
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,()=>{clearTimeout(xTimer);xDown=null;if(xFired)setTimeout(()=>{xFired=false;},400);}));
document.addEventListener('contextmenu',ev=>{
  const t=ev.target.closest&&ev.target.closest('[data-ex]');
  if(xFired){ev.preventDefault();return;}
  if(t){ev.preventDefault();xCur=t;xShow(t);}
});
/* clic dans le popup (liens) : il reste ; clic ailleurs : il se ferme */
window.addEventListener('click',ev=>{
  if(xFired){xFired=false;ev.preventDefault();ev.stopImmediatePropagation();return;}
  if(xPop&&!xPop.contains(ev.target))xClose();
},true);
/* défilement dans le popup (texte long) : il reste ; défilement de la page : il se ferme */
window.addEventListener('scroll',ev=>{if(xPop&&ev.target&&ev.target.nodeType===1&&xPop.contains(ev.target))return;xClose();},true);
window.addEventListener('resize',xClose);

render(false);

})();
