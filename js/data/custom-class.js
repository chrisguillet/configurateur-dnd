/* Classe personnalisée (par exemple l'Artificier, absent du Manuel des Joueurs de base).
   La définition est stockée dans le personnage lui-même (c.cdefs[clé]) : elle voyage avec l'export JSON et la
   synchronisation, et deux personnages ne partagent jamais la même classe personnalisée.
   Avant d'être utilisée, chaque définition est « enregistrée » dans les tables des classes officielles (CL, CAST,
   CFEAT…) sous une clé « perso-xxxxxx » : le reste de l'application la traite alors comme n'importe quelle classe. */
(function(){
'use strict';
const NS=window.DND=window.DND||{};

const AB=['for','dex','con','int','sag','cha'];
const ASI_LEVELS=[4,6,8,10,12,14,16];   /* niveaux où l'application sait gérer un don ou une amélioration */
const KEY_RE=/^perso-[a-z0-9]{6}$/;
const isKey=k=>typeof k==='string'&&KEY_RE.test(k);
const mkKey=()=>'perso-'+(Math.random().toString(36)+'000000').slice(2,8);

const num=(v,lo,hi,d)=>{v=Math.floor(+v);return isFinite(v)?Math.min(hi,Math.max(lo,v)):d;};
const txt=(v,n)=>typeof v==='string'?v.slice(0,n):'';

const blankDef=()=>({
  n:'Classe personnalisée',sub:'',hd:8,s0:'con',s1:'int',pick:2,
  ar:'l',wp:'s',prof:'',tpk:0,wmN:0,wmUp:'',eqA:'',eqAg:10,eqBg:100,
  cast:'none',ca:'int',c1:2,c2:3,c3:4,p1:2,p20:15,
  asi:'4,8,12,16',
  acOn:false,a0:'dex',a1:'con',spV:0,spL:2,exN:0,exL:2,
  ft:'',from:'',ic:''
});

/* Nettoyage : ce qui vient d'un import ou d'une synchronisation n'est jamais pris tel quel */
const uniq=(s,order)=>order.split('').filter(ch=>String(s).includes(ch)).join('');
/* Maîtrises d'armures (l légères, i intermédiaires, h lourdes, s boucliers) et d'armes (s courantes, m de guerre).
   Les anciennes définitions n'avaient qu'un texte libre : on en tire les cases cochées, le reste du texte devient « autres maîtrises ». */
function profOf(d){
  if('ar' in d||'wp' in d)return{ar:uniq(txt(d.ar,8),'lihs'),wp:uniq(txt(d.wp,4),'sm'),extra:txt(d.prof,200)};
  const t=txt(d.prof,200),all=/toutes les armures/i.test(t);
  return{ar:(all||/légères/i.test(t)?'l':'')+(all||/intermédiaires/i.test(t)?'i':'')+(all||/lourdes/i.test(t)?'h':'')+(/boucliers?/i.test(t)?'s':''),
    wp:(/armes courantes/i.test(t)?'s':'')+(/guerre/i.test(t)?'m':''),
    extra:t.split('·').map(s=>s.trim()).filter(s=>s&&!/armes|armures|boucliers?/i.test(s)).join(' · ')};
}
function cleanDef(d){
  d=d&&typeof d==='object'?d:{};
  const ab=(v,f)=>AB.includes(v)?v:f;
  const pf=profOf(d);
  return{
    n:txt(d.n,40).trim()||blankDef().n,
    sub:txt(d.sub,40).trim(),
    hd:[6,8,10,12].includes(+d.hd)?+d.hd:8,
    s0:ab(d.s0,'con'),s1:ab(d.s1,'int'),
    pick:num(d.pick,0,6,2),
    ar:pf.ar,wp:pf.wp,prof:pf.extra,tpk:num(d.tpk,0,6,0),wmN:num(d.wmN,0,6,0),wmUp:txt(d.wmUp,40),eqA:txt(d.eqA,600),eqAg:num(d.eqAg,0,500,10),eqBg:num(d.eqBg,0,1000,100),
    cast:['none','full','half','pact'].includes(d.cast)?d.cast:'none',
    ca:ab(d.ca,'int'),c1:num(d.c1,0,9,2),c2:num(d.c2,0,9,3),c3:num(d.c3,0,9,4),
    p1:num(d.p1,0,30,2),p20:num(d.p20,0,40,15),
    asi:txt(d.asi,40),
    acOn:!!d.acOn,a0:ab(d.a0,'dex'),a1:ab(d.a1,'con'),
    spV:Math.min(9,Math.max(0,Math.round((+d.spV||0)*2)/2)),spL:num(d.spL,1,20,2),
    exN:num(d.exN,0,4,0),exL:num(d.exL,1,20,2),
    ft:txt(d.ft,6000),
    from:txt(d.from,24),ic:txt(d.ic,12)   /* v2 : entrée du catalogue d'origine et icône */
  };
}

/* Capacités : une ligne par capacité, « 3 · Nom : description » (le niveau est facultatif, 1 par défaut) */
function parseFeats(ft){
  const out=[];
  String(ft||'').split(/\r?\n/).forEach(line=>{
    const s=line.trim();if(!s)return;
    let lv=1,r=s;
    const m=s.match(/^(\d{1,2})\s*[·:.)\-–—]\s*(.+)$/);
    if(m){lv=Math.min(20,Math.max(1,+m[1]));r=m[2];}
    const i=r.indexOf(':');
    const n=(i>0?r.slice(0,i):r).trim().slice(0,80),d=(i>0?r.slice(i+1):'').trim();
    if(n)out.push({lv,n,d});
  });
  return out.map((f,i)=>({f,i})).sort((a,b)=>a.f.lv-b.f.lv||a.i-b.i).map(x=>x.f);
}

/* Texte des maîtrises, au même format que les classes officielles (l'application en tire les icônes du passeport et les avertissements d'armure) */
function profText(d){
  const out=[];
  if(d.wp.includes('s'))out.push('Armes courantes');
  if(d.wp.includes('m'))out.push('Armes de guerre');
  const a=['l','i','h'].filter(k=>d.ar.includes(k));
  if(a.length===3)out.push('Toutes les armures');
  else if(a.length){const n=a.map(k=>({l:'légères',i:'intermédiaires',h:'lourdes'})[k]);out.push('Armures '+(n.length>1?n.slice(0,-1).join(', ')+' et '+n[n.length-1]:n[0]));}
  if(d.ar.includes('s'))out.push('Boucliers');
  if(d.prof)out.push(d.prof);
  return out.join(' · ');
}
function build(raw,T){
  const d=cleanDef(raw),caster=d.cast!=='none';
  const prep=L=>Math.round(d.p1+(d.p20-d.p1)*(L-1)/19);
  const abn=a=>(T.ABN[a]||a).slice(0,3);
  const asi=[...new Set(d.asi.split(/[^\d]+/).map(Number).filter(n=>ASI_LEVELS.includes(n)))].sort((a,b)=>a-b);
  const cl={
    n:{m:d.n,f:d.n},hd:d.hd,saves:d.s0===d.s1?[d.s0]:[d.s0,d.s1],pick:d.pick,skills:null,
    cant:caster?L=>T.cantN(L,d.c1,d.c2,d.c3):()=>0,
    prep:caster?prep:()=>0,
    eqA:{items:d.eqA,gold:d.eqAg},eqB:{items:'',gold:d.eqBg},
    prof:profText(d),asi
  };
  if(d.acOn){const ab2=d.a0===d.a1?[d.a0]:[d.a0,d.a1];cl.acUn={ab:ab2,note:'CA sans armure (10 + '+ab2.map(abn).join(' + ')+')',noShield:false};}
  if(d.spV>0)cl.speedUn=L=>L>=d.spL?d.spV:0;
  if(d.exN>0)cl.expN=L=>L>=d.exL?d.exN:0;
  /* bottes d'arme : nombre de types d'armes maîtrisées, +1 à chacun des niveaux listés ; outils / instruments à choisir */
  const wmUp=[...new Set(d.wmUp.split(/[^\d]+/).map(Number).filter(n=>n>=2&&n<=20))];
  const feats=parseFeats(d.ft);
  if(d.wmN>0)feats.unshift({lv:1,n:"Bottes d'arme",d:"Vous utilisez la propriété Botte de types d'armes maîtrisées, modifiables après un repos long."});
  return{
    cl,
    cast:caster?{a:d.ca,t:d.cast}:null,
    wmn:d.wmN>0?L=>d.wmN+wmUp.filter(n=>n<=L).length:null,
    tpk:d.tpk,
    feats,
    mcpre:d.s0===d.s1?[[d.s0]]:[[d.s0],[d.s1]]
  };
}

let ALL=null,NONE=null;
const allSpells=db=>{if(!ALL){ALL={};for(let l=0;l<=9;l++)ALL[l]=[];(db||[]).forEach(s=>{if(ALL[s.lv])ALL[s.lv].push(s.n);});}return ALL;};
const noSpells=()=>{if(!NONE){NONE={};for(let l=0;l<=9;l++)NONE[l]=[];}return NONE;};

/* T : les tables de l'application (CL, CAST, CFEAT, SUBS, SPELLS, MCPROF, MCPRE, MCPICK) et quelques utilitaires */
function register(c,T){
  if(!c||!c.cdefs||typeof c.cdefs!=='object'||Array.isArray(c.cdefs))return;
  Object.keys(c.cdefs).forEach(k=>{
    if(!isKey(k))return;
    const b=build(c.cdefs[k],T),sb=cleanDef(c.cdefs[k]).sub;
    T.CL[k]=b.cl;
    if(b.cast)T.CAST[k]=b.cast;else delete T.CAST[k];
    if(b.wmn)T.WMN[k]=b.wmn;else delete T.WMN[k];
    if(b.tpk>0)T.TPK[k]=b.tpk;else delete T.TPK[k];
    T.CFEAT[k]=b.feats;T.SUBS[k]=sb?{libre:{n:sb,ok:true,f:[]}}:{};T.MCPROF[k]=[];T.MCPRE[k]=b.mcpre;T.MCPICK[k]=0;
    T.SPELLS[k]=b.cast?allSpells(T.SPELLDB):noSpells();
  });
}

/* Espèce personnalisée : stockée dans le personnage (c.sdef), choisie avec c.species==='perso' */
const SIZES=['TP','P','M','G','TG','Gig'];
const spBlank=()=>({n:'',sub:'',dv:0,speed:9,size:'M',feat:'',tr:''});
function spClean(d){
  d=d&&typeof d==='object'&&!Array.isArray(d)?d:{};
  const sp=+d.speed;
  return{n:txt(d.n,40).trim(),sub:txt(d.sub,40).trim(),dv:num(d.dv,0,120,0),
    speed:isFinite(sp)?Math.min(30,Math.max(0,Math.round(sp*2)/2)):9,
    size:SIZES.includes(d.size)?d.size:'M',feat:txt(d.feat,80),tr:txt(d.tr,4000),from:txt(d.from,24),ic:txt(d.ic,12)};
}
/* Traits : une ligne par trait, « Nom : description » (affichés comme ceux des espèces officielles) */
const spTraits=tr=>String(tr||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean).slice(0,40).map(s=>s.replace(/^([^:]{1,48}?)\s*:\s*/,'$1 : '));


/* Historique personnalisé : stocké dans le personnage (c.bdef), choisi avec c.bg==='perso'.
   Même forme qu'un historique officiel : trois caractéristiques, deux compétences, un don d'origine, un outil, l'équipement et l'or. */
const SKILL_IDS=['acrobaties','arcanes','athletisme','discretion','dressage','escamotage','histoire','intimidation','intuition','investigation','medecine','nature','perception','persuasion','religion','representation','survie','tromperie'];
const BG_TOOL_HINT={'@artisan':"Un outil d'artisan au choix",'@musique':'Un instrument de musique au choix','@jeu':'Une boîte de jeux au choix','@any':'Un outil au choix'};
const bgBlank=()=>({n:'',a0:'for',a1:'dex',a2:'con',s0:'athletisme',s1:'perception',feat:'',tl:'@any',eq:'',gold:10});
function bgClean(d){
  d=d&&typeof d==='object'&&!Array.isArray(d)?d:{};
  const pick=(v,list,f)=>list.includes(v)?v:f,b=bgBlank();
  return{n:txt(d.n,40).trim(),a0:pick(d.a0,AB,b.a0),a1:pick(d.a1,AB,b.a1),a2:pick(d.a2,AB,b.a2),
    s0:pick(d.s0,SKILL_IDS,b.s0),s1:pick(d.s1,SKILL_IDS,b.s1),feat:txt(d.feat,80),tl:txt(d.tl,80)||'@any',eq:txt(d.eq,600),gold:num(d.gold,0,1000,10),from:txt(d.from,24),ic:txt(d.ic,12)};
}
/* Entrée de la table des historiques (BG) */
function bgBuild(d,deflt){
  d=bgClean(d);
  const ab=[...new Set([d.a0,d.a1,d.a2])],sk=[...new Set([d.s0,d.s1])],fixed=!d.tl.startsWith('@');
  return{n:{m:d.n||deflt,f:d.n||deflt},ab,feat:d.feat,sk,tool:fixed?d.tl:'',toolHint:fixed?'':(BG_TOOL_HINT[d.tl]||BG_TOOL_HINT['@any']),eq:d.eq,gold:d.gold};
}

NS.CUSTOM={build,BG_TOOL_HINT,bgBlank,bgClean,bgBuild,SKILL_IDS,AB,isKey,mkKey,blankDef,cleanDef,parseFeats,register,SIZES,spBlank,spClean,spTraits};
})();
