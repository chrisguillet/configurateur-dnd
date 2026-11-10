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
  n:'Classe personnalisée',hd:8,s0:'con',s1:'int',pick:2,
  prof:'Armes courantes · Armures légères',eqA:'',eqAg:10,eqBg:100,
  cast:'none',ca:'int',c1:2,c2:3,c3:4,p1:2,p20:15,
  asi:'4,8,12,16',
  acOn:false,a0:'dex',a1:'con',spV:0,spL:2,exN:0,exL:2,
  ft:''
});

/* Nettoyage : ce qui vient d'un import ou d'une synchronisation n'est jamais pris tel quel */
function cleanDef(d){
  d=d&&typeof d==='object'?d:{};
  const ab=(v,f)=>AB.includes(v)?v:f;
  return{
    n:txt(d.n,40).trim()||blankDef().n,
    hd:[6,8,10,12].includes(+d.hd)?+d.hd:8,
    s0:ab(d.s0,'con'),s1:ab(d.s1,'int'),
    pick:num(d.pick,0,6,2),
    prof:txt(d.prof,200),eqA:txt(d.eqA,300),eqAg:num(d.eqAg,0,500,10),eqBg:num(d.eqBg,0,1000,100),
    cast:['none','full','half','pact'].includes(d.cast)?d.cast:'none',
    ca:ab(d.ca,'int'),c1:num(d.c1,0,9,2),c2:num(d.c2,0,9,3),c3:num(d.c3,0,9,4),
    p1:num(d.p1,0,30,2),p20:num(d.p20,0,40,15),
    asi:txt(d.asi,40),
    acOn:!!d.acOn,a0:ab(d.a0,'dex'),a1:ab(d.a1,'con'),
    spV:Math.min(9,Math.max(0,Math.round((+d.spV||0)*2)/2)),spL:num(d.spL,1,20,2),
    exN:num(d.exN,0,4,0),exL:num(d.exL,1,20,2),
    ft:txt(d.ft,6000)
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
    prof:d.prof,asi
  };
  if(d.acOn){const ab2=d.a0===d.a1?[d.a0]:[d.a0,d.a1];cl.acUn={ab:ab2,note:'CA sans armure (10 + '+ab2.map(abn).join(' + ')+')',noShield:false};}
  if(d.spV>0)cl.speedUn=L=>L>=d.spL?d.spV:0;
  if(d.exN>0)cl.expN=L=>L>=d.exL?d.exN:0;
  return{
    cl,
    cast:caster?{a:d.ca,t:d.cast}:null,
    feats:parseFeats(d.ft),
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
    const b=build(c.cdefs[k],T);
    T.CL[k]=b.cl;
    if(b.cast)T.CAST[k]=b.cast;else delete T.CAST[k];
    T.CFEAT[k]=b.feats;T.SUBS[k]={};T.MCPROF[k]=[];T.MCPRE[k]=b.mcpre;T.MCPICK[k]=0;
    T.SPELLS[k]=b.cast?allSpells(T.SPELLDB):noSpells();
  });
}

NS.CUSTOM={AB,isKey,mkKey,blankDef,cleanDef,parseFeats,register};
})();
