/* Portrait : petit buste stylisé en SVG, d'après l'espèce, le genre, la classe et l'apparence choisie.
   Fonctions pures : aucune dépendance à l'état de l'application, couleurs écrites en dur
   (le portrait doit aussi s'afficher dans la fiche HTML exportée). */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const {CLASS_PATHS}=NS;

/* ---------- Palettes (id, libellé, couleur) ---------- */
const HAIR=[['noir','Noir','#1c1917'],['brun','Brun','#4a2f1c'],['chatain','Châtain','#7b5233'],['roux','Roux','#a9461f'],
  ['blond','Blond','#d9b45f'],['platine','Platine','#ece2b8'],['gris','Gris','#9b9ca0'],['blanc','Blanc','#f1f1ee'],
  ['bleu','Bleu','#3d6cb3'],['vert','Vert','#3f8a5a']];
const EYES=[['marron','Marron','#6b4423'],['noisette','Noisette','#8d6a2c'],['vert','Vert','#4a8f4f'],['bleu','Bleu','#3f7fc4'],
  ['gris','Gris','#8a96a3'],['ambre','Ambre','#cc8a14'],['violet','Violet','#8c5bbd'],['rouge','Rouge','#b32626']];
const SKINS=[['porcelaine','Porcelaine','#f5dcc9'],['clair','Clair','#efc8a1'],['hale','Hâlé','#d6a070'],
  ['brun','Brun','#a56e47'],['fonce','Foncé','#7a4a2e'],['ebene','Ébène','#523222']];
const LENS=[['chauve','Chauve'],['court','Courts'],['mi','Mi-longs'],['long','Longs']];
const STYLES=[['soigne','Soignés'],['neglige','Négligés']];

/* Teint par défaut de chaque espèce (id de teint ou couleur) */
const SPECIES_SKIN={humain:'clair',elfe:'porcelaine',nain:'hale',halfelin:'hale',gnome:'hale',
  orc:'#7f9a63',tieffelin:'#b8493f',goliath:'#9aa7ad',drakeide:'#5f8f5a'};
const DRAGON_COLOR={Airain:'#b5893a',Argent:'#aab4bd',Blanc:'#e4ecf0',Bleu:'#3f6fb5',Bronze:'#a2662c',Cuivre:'#b8643a',
  Noir:'#3b3b44',Or:'#d4a52e',Rouge:'#b3382c',Vert:'#4f8a4a'};

/* Couleur de tenue et d'accent de chaque classe */
const CLASS_COLOR={guerrier:'#7d8a98',paladin:'#c3ccd6',barbare:'#8a5a3a',clerc:'#e6e1d0',druide:'#4f7d4a',rodeur:'#3f6b49',
  roublard:'#3d3d4d',magicien:'#2f4fa0',ensorceleur:'#a02f55',occultiste:'#43286b',barde:'#b5382e',moine:'#c77d2b'};
const CLASS_BADGE={guerrier:'#5d6b7a',paladin:'#9b7a22',barbare:'#6b4128',clerc:'#a8841f',druide:'#3b6337',rodeur:'#2e5238',
  roublard:'#2c2c38',magicien:'#223a7c',ensorceleur:'#7c2140',occultiste:'#321d52',barde:'#8a2820',moine:'#9c5c1b'};

/* ---------- Utilitaires de couleur ---------- */
const hex2=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const toHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>{const x=hex2(a),y=hex2(b);return toHex(x.map((v,i)=>v+(y[i]-v)*t));};
const shade=(h,t)=>t<0?mix(h,'#000000',-t):mix(h,'#ffffff',t);
const byId=(list,id,fb)=>(list.find(x=>x[0]===id)||list.find(x=>x[0]===fb))[2];

/* Choix par défaut quand rien n'est précisé */
function resolve(o){
  const lk=o.look||{};
  const f=o.gender==='f';
  return{hair:lk.hair||'brun',len:lk.len||(f?'long':'court'),style:lk.style||'soigne',eyes:lk.eyes||'marron',skin:lk.skin||''};
}
function skinColor(o,L){
  if(L.skin){const f=SKINS.find(x=>x[0]===L.skin);if(f&&o.species!=='drakeide')return f[2];}
  if(o.species==='drakeide')return DRAGON_COLOR[o.anc]||SPECIES_SKIN.drakeide;
  const d=SPECIES_SKIN[o.species]||'clair';
  return d[0]==='#'?d:byId(SKINS,d,'clair');
}

/* ---------- Coiffures ---------- */
function hairPaths(len,style,H){
  const n=style==='neglige';
  const front=len==='chauve'?'':(n
    ?`<path d="M35 60C31 40 42 25 60 25C78 25 90 40 85 60L82 50L78 55L74 44L68 50L63 41L57 49L51 42L46 52L42 46L38 55Z" fill="${H}"/><path d="M50 28l-4-6 8 4 4-7 4 7 8-4-4 6z" fill="${H}"/><path d="M37 40l-7-6 10 1zM83 40l7-6-10 1zM44 29l-6-8 9 4zM76 29l6-8-9 4zM33 56l-6-3 8-2zM87 56l6-3-8-2z" fill="${H}"/>`
    :`<path d="M35 60C33 36 45 27 60 27C75 27 87 36 85 60C83 49 78 42 60 41C42 42 37 49 35 60Z" fill="${H}"/><path d="M60 27C58 33 54 38 49 41" fill="none" stroke="${shade(H,-.3)}" stroke-width="1.2"/><path d="M45 36Q58 29 75 36" fill="none" stroke="${shade(H,.3)}" stroke-width="2" stroke-linecap="round" opacity=".55"/>`);
  let back='',lock='';
  if(len==='mi'||len==='long'){
    const b=len==='mi'?106:132;
    back=n
      ?`<path d="M33 56C30 82 32 ${b-8} 40 ${b}L44 ${b+6}L50 ${b-1}L56 ${b+6}L62 ${b-1}L68 ${b+6}L74 ${b-1}L80 ${b+5}C88 ${b-8} 90 82 87 56C86 34 74 24 60 24C46 24 34 34 33 56Z" fill="${H}"/>`
      :`<path d="M33 56C30 82 32 ${b-8} 40 ${b}L80 ${b}C88 ${b-8} 90 82 87 56C86 34 74 24 60 24C46 24 34 34 33 56Z" fill="${H}"/>`;
    const e=len==='mi'?104:128;
    lock=`<path d="M34 70C29 ${e-24} 31 ${e-8} 38 ${e}L${n?47:46} ${e}C42 ${e-18} 42 92 44 74Z" fill="${H}"/><path d="M86 70C91 ${e-24} 89 ${e-8} 82 ${e}L${n?73:74} ${e}C78 ${e-18} 78 92 76 74Z" fill="${H}"/>`;
  }
  return{front,back,lock};
}

/* ---------- Tenues (dessinées avant la tête) ---------- */
const TORSO='M14 140C14 114 32 100 52 98L68 98C88 100 106 114 106 140Z';
function outfit(cls,C,skin){
  const dark=shade(C,-.28),light=shade(C,.25),gold='#d8ab3a';
  const strap=(d,col,w)=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w||4}" stroke-linecap="round"/>`;
  let s=`<path d="${TORSO}" fill="${C}"/>`;
  switch(cls){
    case 'guerrier':
      s+=`<ellipse cx="25" cy="113" rx="16" ry="10" fill="${light}" stroke="${dark}" stroke-width="1.5"/><ellipse cx="95" cy="113" rx="16" ry="10" fill="${light}" stroke="${dark}" stroke-width="1.5"/>`
        +`<path d="M45 98Q60 110 75 98V106Q60 118 45 106Z" fill="${light}" stroke="${dark}" stroke-width="1.5"/>`
        +`<circle cx="52" cy="124" r="1.8" fill="${dark}"/><circle cx="68" cy="124" r="1.8" fill="${dark}"/>`+strap('M60 112V140',dark,2);break;
    case 'paladin':
      s+=`<ellipse cx="25" cy="113" rx="16" ry="10" fill="${light}" stroke="${gold}" stroke-width="2"/><ellipse cx="95" cy="113" rx="16" ry="10" fill="${light}" stroke="${gold}" stroke-width="2"/>`
        +`<path d="M45 98Q60 110 75 98V106Q60 118 45 106Z" fill="${light}" stroke="${gold}" stroke-width="1.8"/>`
        +`<path d="M53 110h14v30H53z" fill="${gold}" opacity=".9"/>`+strap('M60 116v14M54 122h12','#fff7d8',2.5);break;
    case 'barbare':
      s+=strap('M26 140L72 101','#5a3a22',6)
        +`<path d="M34 106l6-9 5 6 6-9 5 8 6-9 5 8 6-7 5 7 6-5 4 11Q60 124 32 112Z" fill="#dccaa2" stroke="#b49c6e" stroke-width="1.2"/>`;break;
    case 'clerc':
      s+=strap('M50 98L44 140M70 98L76 140',gold,4)+strap('M60 112v16M53 120h14',gold,3)
        +`<path d="M45 98Q60 108 75 98" fill="none" stroke="${gold}" stroke-width="3"/>`;break;
    case 'druide':
      s+=`<path d="M14 140C14 114 32 100 52 98L68 98C88 100 106 114 106 140L96 140C96 120 84 112 60 112C36 112 24 120 24 140Z" fill="${dark}"/>`
        +`<path d="M60 100c-9-2-13 5-10 11 9 2 13-5 10-11z" fill="#9ccc65" stroke="#5f8a3a" stroke-width="1.2"/>`
        +`<ellipse cx="28" cy="110" rx="7" ry="3.5" fill="${light}" transform="rotate(-25 28 110)"/><ellipse cx="92" cy="110" rx="7" ry="3.5" fill="${light}" transform="rotate(25 92 110)"/>`;break;
    case 'rodeur':
      s+=`<path d="M30 102Q60 90 90 102L98 114Q60 104 22 114Z" fill="${dark}"/>`+strap('M36 140L66 101','#6b4a2a',4)+strap('M84 140L56 101','#6b4a2a',3)
        +`<circle cx="62" cy="109" r="3" fill="${gold}"/>`;break;
    case 'roublard':
      s+=`<path d="M30 102Q60 90 90 102L98 114Q60 104 22 114Z" fill="${dark}"/>`+strap('M40 140L64 101','#7a5a3a',3)
        +`<path d="M90 98l7-14" stroke="#6b4a2a" stroke-width="4" stroke-linecap="round"/><path d="M97 84l3-6" stroke="#cfd3d8" stroke-width="3" stroke-linecap="round"/>`;break;
    case 'magicien':
      s+=`<path d="M45 98Q60 112 75 98L80 104Q60 122 40 104Z" fill="${gold}"/>`
        +[[30,122],[84,128],[48,134],[72,118],[96,118]].map(([x,y])=>`<path d="M${x} ${y-3}l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="#fff6c8"/>`).join('');break;
    case 'ensorceleur':
      s+=`<path d="M40 100Q60 90 80 100L86 118Q60 104 34 118Z" fill="${dark}"/><path d="M45 98Q60 110 75 98" fill="none" stroke="#ffd36a" stroke-width="2.5"/>`
        +`<path d="M60 116l2.4 6 6 2.4-6 2.4-2.4 6-2.4-6-6-2.4 6-2.4z" fill="#ffd36a"/>`;break;
    case 'occultiste':
      s+=`<path d="M26 104Q60 90 94 104L100 118Q60 106 20 118Z" fill="${dark}"/>`
        +`<path d="M46 124q14-9 28 0-14 9-28 0z" fill="none" stroke="#e0c3ff" stroke-width="1.8"/><circle cx="60" cy="124" r="3" fill="#e0c3ff"/>`;break;
    case 'barde':
      s+=`<path d="M52 98L60 140L68 98" fill="none" stroke="${gold}" stroke-width="2"/>`
        +[108,118,128].map(y=>`<circle cx="60" cy="${y}" r="2" fill="${gold}"/>`).join('')
        +`<path d="M42 100Q60 112 78 100L82 106Q60 120 38 106Z" fill="#f3e9d0"/>`;break;
    case 'moine':
      s+=`<path d="M48 98L60 124L72 98L68 98L60 112L52 98Z" fill="#f3e6cc"/><path d="M14 128h92v9H14z" fill="#7a3d12"/><path d="M58 128h4v12h-4z" fill="#7a3d12"/>`;break;
    default: break;
  }
  return s;
}

/* Couvre-chef dessiné après les cheveux */
function headwear(cls,C){
  const dark=shade(C,-.3);
  if(cls==='magicien')
    return `<path d="M36 40Q44 22 57 3Q61 0 64 5Q73 24 84 40Z" fill="${C}"/><path d="M37 39Q60 47 83 39L84 33Q60 41 36 33Z" fill="#d8ab3a"/><ellipse cx="60" cy="40" rx="38" ry="8" fill="${dark}"/><path d="M37 38Q60 47 83 38" fill="none" stroke="${shade(C,-.5)}" stroke-width="1"/>`
      +`<path d="M62 18l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3z" fill="#fff6c8"/>`;
  if(cls==='barde')
    return `<path d="M36 38C38 24 74 22 86 34C82 41 48 42 36 38Z" fill="#2f6d5a"/><path d="M82 32Q96 14 108 18Q102 28 84 38Z" fill="#e2b23a" stroke="#b58a1d" stroke-width="1"/>`;
  return '';
}

/* ---------- Spécificités d'espèce ---------- */
function ears(sp,skin){
  const sh=shade(skin,-.18);
  const pt=(a,b)=>`<path d="M37 ${a}L${b} ${a-14}L38 ${a+8}Z" fill="${skin}" stroke="${sh}" stroke-width="1"/><path d="M83 ${a}L${120-b} ${a-14}L82 ${a+8}Z" fill="${skin}" stroke="${sh}" stroke-width="1"/>`;
  switch(sp){
    case 'elfe':return pt(56,20);
    case 'gnome':case 'tieffelin':return pt(58,28);
    case 'orc':return pt(58,27);
    case 'drakeide':return '';
    default:return `<ellipse cx="36" cy="61" rx="3.6" ry="6" fill="${skin}" stroke="${sh}" stroke-width="1"/><ellipse cx="84" cy="61" rx="3.6" ry="6" fill="${skin}" stroke="${sh}" stroke-width="1"/>`;
  }
}
function horns(sp){
  if(sp==='tieffelin')return `<path d="M42 36C34 22 28 12 34 3C38 14 46 22 51 33Z" fill="#4a3535"/><path d="M78 36C86 22 92 12 86 3C82 14 74 22 69 33Z" fill="#4a3535"/>`;
  if(sp==='drakeide')return `<path d="M40 38L30 22L47 33Z" fill="${shade('#d9c9a0',-.1)}"/><path d="M80 38L90 22L73 33Z" fill="${shade('#d9c9a0',-.1)}"/>`;
  return '';
}

/* ---------- Portrait ---------- */
function portrait(o,size){
  const L=resolve(o);
  const sp=o.species||'humain', f=o.gender==='f', cls=o.cls||'';
  const skin=skinColor(o,L), sh=shade(skin,-.2), sh2=shade(skin,-.35);
  const H=byId(HAIR,L.hair,'brun'), E=byId(EYES,L.eyes,'marron');
  const outC=CLASS_COLOR[cls]||'#6b7a86', badge=CLASS_BADGE[cls]||'#445';
  const bg=mix(outC,'#ffffff',.84);
  const bald=L.len==='chauve'||sp==='drakeide';
  const hp=bald?{front:'',back:'',lock:''}:hairPaths(L.len,L.style,H);
  const browC=bald?sh2:shade(H,-.1);

  /* proportions de la tête selon l'espèce et le genre */
  const rx={elfe:22,nain:27,halfelin:24,gnome:23,orc:27,goliath:27,drakeide:25}[sp]||25;
  const ry={elfe:30,nain:27,halfelin:27,gnome:27,orc:29,goliath:31,drakeide:27}[sp]||29;
  const hrx=rx+(f?-1.5:1.2);
  const body={humain:[1,1],elfe:[.98,1.02],nain:[1.07,.93],halfelin:[.86,.86],gnome:[.84,.84],orc:[1.05,1.02],
    tieffelin:[1,1],goliath:[1.1,1.1],drakeide:[1.04,1.02]}[sp]||[1,1];

  let face='';
  /* base de la tête */
  face+=`<ellipse cx="60" cy="58" rx="${hrx}" ry="${ry}" fill="${skin}"/>`;
  face+=`<path d="M${60-hrx+3} 66Q60 ${58+ry+8} ${60+hrx-3} 66Q${60+hrx-8} ${58+ry} 60 ${58+ry} Q${60-hrx+8} ${58+ry} ${60-hrx+3} 66Z" fill="${sh}" opacity=".22"/>`;
  const drk=sp==='drakeide';
  if(drk){
    const sn=shade(skin,.14), dk=shade(skin,-.32);
    face+=`<path d="M37 50L21 43L25 56L19 64L36 67Z" fill="${sh}"/><path d="M83 50L99 43L95 56L101 64L84 67Z" fill="${sh}"/>`
      +[[48,40],[60,36],[72,40],[40,48],[80,48],[54,46],[66,46]].map(([x,y])=>`<path d="M${x-4} ${y}q4-4 8 0" fill="none" stroke="${sh}" stroke-width="1.4" opacity=".7"/>`).join('')
      +`<path d="M46 67Q46 60 60 60Q74 60 74 67L75 83Q75 96 60 96Q45 96 45 83Z" fill="${sn}" stroke="${sh}" stroke-width="1.2"/>`
      +`<ellipse cx="54" cy="69" rx="1.6" ry="2.3" fill="${dk}"/><ellipse cx="66" cy="69" rx="1.6" ry="2.3" fill="${dk}"/>`
      +`<path d="M47 84Q60 92 73 84" fill="none" stroke="${dk}" stroke-width="1.7" stroke-linecap="round"/>`
      +[[52,90],[60,92],[68,90]].map(([x,y])=>`<path d="M${x-2} ${y-4}l2 4 2-4" fill="#f4efe0" opacity=".9"/>`).join('')
      +`<path d="M37 46Q47 39 57 45M63 45Q73 39 83 46" fill="none" stroke="${dk}" stroke-width="3.2" stroke-linecap="round"/>`;
  }
  if(sp==='goliath')
    face+=`<path d="M50 36q10-4 20 0M44 52q-3 6-1 12M76 52q3 6 1 12" fill="none" stroke="${shade(skin,-.4)}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
  if(sp==='halfelin'||sp==='gnome')
    face+=`<circle cx="46" cy="70" r="4.2" fill="#e8908e" opacity=".35"/><circle cx="74" cy="70" r="4.2" fill="#e8908e" opacity=".35"/>`;

  /* barbe automatique des nains masculins */
  let beard='';
  if(sp==='nain'&&!f){
    beard=L.style==='neglige'
      ?`<path d="M35 68C33 96 42 112 50 108L54 116L60 108L66 117L70 108C80 112 87 96 85 68C80 82 72 88 60 88C48 88 40 82 35 68Z" fill="${H}"/>`
      :`<path d="M35 68C33 100 46 114 60 114C74 114 87 100 85 68C80 82 72 88 60 88C48 88 40 82 35 68Z" fill="${H}"/>`;
  }

  /* yeux, sourcils, nez, bouche */
  const eye=(cx,cy)=>`<ellipse cx="${cx}" cy="${cy}" rx="5.4" ry="4" fill="#fbfaf6" stroke="${sh2}" stroke-width=".9"/><circle cx="${cx}" cy="${cy}" r="3.2" fill="${E}"/><circle cx="${cx}" cy="${cy}" r="1.5" fill="#15110f"/><circle cx="${cx+1.2}" cy="${cy-1.1}" r=".9" fill="#fff"/>`;
  const bw=sp==='orc'?3:(f?1.7:2.5);
  let feat='';
  if(drk){
    feat+=eye(42,53)+eye(78,53);
  }else{
    feat+=eye(48.5,58)+eye(71.5,58);
    feat+=`<path d="M41.500 51.5Q48 ${f?48:48.5} 54.500 51" fill="none" stroke="${browC}" stroke-width="${bw}" stroke-linecap="round"/><path d="M65.500 51Q72 ${f?48:48.5} 78.500 51.500" fill="none" stroke="${browC}" stroke-width="${bw}" stroke-linecap="round"/>`;
    if(f)feat+=`<path d="M43 57.500l-3-2.500M77 57.500l3-2.500" stroke="${sh2}" stroke-width="1.2" stroke-linecap="round"/>`;
    if(sp==='gnome')feat+=`<circle cx="60" cy="67" r="4" fill="${shade(skin,.05)}" stroke="${sh}" stroke-width="1"/>`;
    else feat+=`<path d="M60 60q-3 7 1 9" fill="none" stroke="${sh}" stroke-width="1.4" stroke-linecap="round"/>`;
    feat+=f
      ?`<path d="M53.500 76q6.500 4.500 13 0q-6.500 2.500-13 0z" fill="#b35560" stroke="#8a3a44" stroke-width="1"/>`
      :`<path d="M53.500 76q6.500 4 13 0" fill="none" stroke="#7a3535" stroke-width="1.8" stroke-linecap="round"/>`;
    if(sp==='orc')feat+=`<path d="M54 77l-1.500-6 4 5zM66 77l1.500-6-4 5z" fill="#f4efe0" stroke="#cfc6a8" stroke-width=".6"/>`;
  }

  const hood=(cls==='rodeur'||cls==='roublard');
  const cowl=hood?`<path d="M26 100Q60 86 94 100L102 116Q60 102 18 116Z" fill="${shade(outC,-.35)}"/>`:'';

  const alt=`Portrait : ${(NS.SPN&&NS.SPN[sp]?NS.SPN[sp][f?'f':'m']:sp)}, ${(NS.CLASS_LABEL||{})[cls]||''}`;
  const badgeSvg=CLASS_PATHS&&CLASS_PATHS[cls]
    ?`<circle cx="100" cy="122" r="15" fill="${badge}" stroke="#ffffff" stroke-width="2"/><g transform="translate(88.5 110.5) scale(.96)" fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${CLASS_PATHS[cls].map(d=>`<path d="${d}"/>`).join('')}</g>`:'';

  return `<svg class="ptr" width="${size||120}" height="${Math.round((size||120)*140/120)}" viewBox="0 0 120 140" role="img" aria-label="${alt.replace(/"/g,'&quot;')}" xmlns="http://www.w3.org/2000/svg">`
    +`<rect width="120" height="140" rx="14" fill="${bg}"/>`
    +`<g transform="translate(60 140) scale(${body[0]} ${body[1]}) translate(-60 -140)">`
    +hp.back
    +outfit(cls,outC,skin)+cowl
    +`<path d="M52 82h16v20H52z" fill="${sh}"/>`
    +hp.lock
    +horns(sp)+ears(sp,skin)
    +face+beard+feat
    +hp.front+headwear(cls,outC)
    +`</g>`+badgeSvg+`</svg>`;
}

Object.assign(NS,{portrait,LOOK:{HAIR,EYES,SKINS,LENS,STYLES},lookDefaults:resolve});
})();
