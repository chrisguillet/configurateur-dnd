/* Portrait de personnage : buste en SVG, style illustration de fantasy héroïque.
   Fonction pure (espèce, sexe, classe, apparence → SVG) : aucune dépendance à l'état de l'application.
   Couleurs et dégradés écrits en dur et identifiants uniques par portrait : le SVG reste identique dans le thème
   sombre, dans la fiche HTML exportée et à l'impression. Repère : 200 × 240, lumière venant d'en haut à gauche. */
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

const SPECIES_SKIN={humain:'clair',elfe:'porcelaine',nain:'hale',halfelin:'hale',gnome:'hale',
  orc:'#7f9a63',tieffelin:'#b8493f',goliath:'#9aa7ad',drakeide:'#5f8f5a'};
const DRAGON_COLOR={Airain:'#b5893a',Argent:'#aab4bd',Blanc:'#e4ecf0',Bleu:'#3f6fb5',Bronze:'#a2662c',Cuivre:'#b8643a',
  Noir:'#3b3b44',Or:'#d4a52e',Rouge:'#b3382c',Vert:'#4f8a4a'};

/* Décor et tenue de chaque classe : g = lueur, d = fond sombre, c = couleur du tissu, m = motif du décor */
const THEME={
  guerrier:{g:'#6f8bb3',d:'#0e131b',c:'#9aa7b6',m:'mount'},paladin:{g:'#e0c068',d:'#121828',c:'#d7dde6',m:'halo'},
  barbare:{g:'#d0602e',d:'#1a0d0a',c:'#8a5a3a',m:'embers'},clerc:{g:'#efdfa0',d:'#191b26',c:'#e9e3d3',m:'halo'},
  druide:{g:'#79b35f',d:'#0c1a0f',c:'#4f7d4a',m:'forest'},rodeur:{g:'#58a06c',d:'#0a1710',c:'#3f6b49',m:'forest'},
  roublard:{g:'#7378b8',d:'#0b0d19',c:'#3d3d4d',m:'moon'},magicien:{g:'#5a85ee',d:'#0a0f2e',c:'#2f4fa0',m:'arcane'},
  ensorceleur:{g:'#e5547f',d:'#1a0914',c:'#a02f55',m:'arcane'},occultiste:{g:'#9556e0',d:'#110921',c:'#43286b',m:'arcane'},
  barde:{g:'#e8aa58',d:'#1b1110',c:'#b5382e',m:'bokeh'},moine:{g:'#ee9a50',d:'#1b130e',c:'#c77d2b',m:'mount'}
};
const BADGE={guerrier:'#5d6b7a',paladin:'#9b7a22',barbare:'#6b4128',clerc:'#a8841f',druide:'#3b6337',rodeur:'#2e5238',
  roublard:'#2c2c38',magicien:'#223a7c',ensorceleur:'#7c2140',occultiste:'#321d52',barde:'#8a2820',moine:'#9c5c1b'};

/* ---------- Utilitaires ---------- */
const hex2=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const toHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>{const x=hex2(a),y=hex2(b);return toHex(x.map((v,i)=>v+(y[i]-v)*t));};
const shade=(h,t)=>t<0?mix(h,'#000000',-t):mix(h,'#ffffff',t);
const byId=(list,id,fb)=>(list.find(x=>x[0]===id)||list.find(x=>x[0]===fb))[2];
const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36);};
const sym=s=>`<g transform="matrix(-1 0 0 1 200 0)">${s}</g>`;   /* miroir autour de l'axe x = 100 */
const n1=v=>Math.round(v*10)/10;

function resolve(o){
  const lk=o.look||{};const f=o.gender==='f',m=o.gender==='m';
  return{hair:lk.hair||'brun',len:lk.len||(f?'long':m?'court':'mi'),style:lk.style||'soigne',eyes:lk.eyes||'marron',skin:lk.skin||''};
}
function skinColor(o,L){
  if(L.skin){const f=SKINS.find(x=>x[0]===L.skin);if(f&&o.species!=='drakeide')return f[2];}
  if(o.species==='drakeide')return DRAGON_COLOR[o.anc]||SPECIES_SKIN.drakeide;
  const d=SPECIES_SKIN[o.species]||'clair';
  return d[0]==='#'?d:byId(SKINS,d,'clair');
}

/* Proportions du visage : w = demi-largeur aux tempes, jw = demi-largeur de la mâchoire, T = haut du crâne,
   C = menton, nose, brow = épaisseur des sourcils, tilt = inclinaison des yeux (négatif = coin externe relevé) */
const FM={
  humain:{w:36,jw:22,T:42,C:150,nose:1,brow:1,tilt:0,eye:1},
  elfe:{w:33,jw:19,T:40,C:152,nose:.9,brow:.8,tilt:-2.4,eye:1.05},
  nain:{w:40,jw:31,T:47,C:148,nose:1.3,brow:1.5,tilt:0,eye:.95},
  halfelin:{w:34,jw:22,T:48,C:146,nose:.8,brow:.85,tilt:-.4,eye:1.12},
  gnome:{w:33,jw:21,T:48,C:146,nose:1.35,brow:.9,tilt:0,eye:1.12},
  orc:{w:40,jw:32,T:44,C:152,nose:1.15,brow:1.7,tilt:1,eye:.95},
  tieffelin:{w:36,jw:22,T:42,C:151,nose:1,brow:1.1,tilt:-1,eye:1},
  goliath:{w:41,jw:31,T:40,C:154,nose:1.1,brow:1.45,tilt:0,eye:.95},
  drakeide:{w:34,jw:20,T:44,C:148,nose:1,brow:1,tilt:0,eye:1}
};

/* Contour de la tête (symétrique autour de x = 100) */
function headPath(w,jw,T,C){
  const R=[[100+w*.8,T],[100+w,T+18],[100+w,92],[100+w,114],[100+jw+10,132],[100+jw,142],[100+jw*.55,C-1],[100+jw*.25,C],[100,C]];
  const Lf=[[100-jw*.25,C],[100-jw*.55,C-1],[100-jw,142],[100-jw-10,132],[100-w,114],[100-w,92],[100-w,T+18],[100-w*.8,T],[100,T]];
  const p=a=>a.map(v=>v.map(n1).join(' ')).join(' ');
  return `M100 ${T} C${p(R.slice(0,3))} C${p(R.slice(3,6))} C${p(R.slice(6,9))} C${p(Lf.slice(0,3))} C${p(Lf.slice(3,6))} C${p(Lf.slice(6,9))}Z`;
}

/* ---------- Portrait ---------- */
function portrait(o,size,opt){
  opt=opt||{};
  const L=resolve(o),sp=o.species||'humain',f=o.gender==='f',mal=o.gender==='m',cls=o.cls||'';
  const skin=skinColor(o,L),H=byId(HAIR,L.hair,'brun'),E=byId(EYES,L.eyes,'marron');
  const drk=sp==='drakeide';
  const th=THEME[cls]||{g:'#8aa0b8',d:'#10141a',c:'#6b7a86',m:'mount'};
  const P='p'+hash(JSON.stringify([sp,o.gender,cls,o.anc||'',L,size||0,opt.crop||'']));
  const defs=[];
  const stopsOf=st=>st.map(s=>`<stop offset="${s[0]}" stop-color="${s[1]}"${s[2]!=null?` stop-opacity="${s[2]}"`:''}/>`).join('');
  const lg=(id,stops,x1,y1,x2,y2)=>{defs.push(`<linearGradient id="${P}${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopsOf(stops)}</linearGradient>`);return `url(#${P}${id})`;};
  const rg=(id,stops,cx,cy,r)=>{defs.push(`<radialGradient id="${P}${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}">${stopsOf(stops)}</radialGradient>`);return `url(#${P}${id})`;};
  const bl=(id,sd)=>{defs.push(`<filter id="${P}${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${sd}"/></filter>`);return `url(#${P}${id})`;};

  /* tons de la peau, des cheveux */
  const sk0=shade(skin,.18),sk2=shade(skin,-.26),skD=shade(skin,-.52);
  const h0=shade(H,.24),h2=shade(H,-.3),h3=shade(H,-.5);
  const fm=FM[sp]||FM.humain;
  const w=fm.w+(f?-2.5:mal?1:0),jw=fm.jw+(f?-3.5:mal?2.5:0),T=fm.T,C=fm.C;
  const brow=fm.brow*(f?.75:mal?1.15:.95);
  const HP=headPath(w,jw,T,C);

  /* ============ DÉCOR ============ */
  const bgG=rg('bg',[[0,th.g,.62],[.55,mix(th.g,th.d,.65),.9],[1,th.d,1]],100,96,170);
  let bg=`<rect width="200" height="240" fill="${th.d}"/><rect width="200" height="240" fill="${bgG}"/>`;
  const spark=(x,y,r,c,a)=>`<path d="M${x} ${y-r}L${x+r*.28} ${y-r*.28}L${x+r} ${y}L${x+r*.28} ${y+r*.28}L${x} ${y+r}L${x-r*.28} ${y+r*.28}L${x-r} ${y}L${x-r*.28} ${y-r*.28}Z" fill="${c}" opacity="${a}"/>`;
  switch(th.m){
    case 'arcane':
      bg+=`<circle cx="100" cy="96" r="84" fill="none" stroke="${th.g}" stroke-opacity=".5" stroke-width="1.2" stroke-dasharray="1.5 4"/>`
        +`<circle cx="100" cy="96" r="74" fill="none" stroke="${th.g}" stroke-opacity=".6" stroke-width="1.6" stroke-dasharray="14 6 3 6"/>`
        +`<circle cx="100" cy="96" r="94" fill="none" stroke="${th.g}" stroke-opacity=".28" stroke-width=".8"/>`
        +[[28,40,5],[170,52,4],[40,150,3.2],[168,140,5],[150,24,3],[22,98,3.5],[182,96,3],[64,24,2.4],[132,16,2.6]].map(([x,y,r])=>spark(x,y,r,mix(th.g,'#ffffff',.55),.85)).join('');break;
    case 'halo':
      bg+=Array.from({length:14},(_,i)=>{const a=i*Math.PI/7,b=a+.1;return `<path d="M100 96L${n1(100+210*Math.cos(a))} ${n1(96+210*Math.sin(a))}L${n1(100+210*Math.cos(b))} ${n1(96+210*Math.sin(b))}Z" fill="${mix(th.g,'#ffffff',.4)}" opacity=".13"/>`;}).join('')
        +`<circle cx="100" cy="94" r="66" fill="none" stroke="${mix(th.g,'#ffffff',.3)}" stroke-opacity=".55" stroke-width="2"/>`;break;
    case 'mount':{
      const far=mix(th.d,th.g,.28),near=mix(th.d,th.g,.1);
      bg+=`<circle cx="152" cy="64" r="26" fill="${mix(th.g,'#ffffff',.5)}" opacity=".5" filter="${bl('mb',7)}"/><circle cx="152" cy="64" r="13" fill="${mix(th.g,'#ffffff',.7)}" opacity=".75"/>`
        +`<path d="M0 176L26 134L50 160L88 108L124 158L152 126L200 172V240H0Z" fill="${far}"/><path d="M0 200L34 164L70 190L112 150L156 188L200 160V240H0Z" fill="${near}"/>`;break;}
    case 'forest':{
      const tr=(x,y,s,c)=>`<path d="M${x} ${y}L${x+13*s} ${y+34*s}H${x+6*s}L${x+17*s} ${y+66*s}H${x+4*s}V${y+82*s}H${x-4*s}V${y+66*s}H${x-17*s}L${x-6*s} ${y+34*s}H${x-13*s}Z" fill="${c}"/>`;
      bg+=[[14,70,1],[48,96,.9],[160,84,1.05],[186,110,.9],[34,118,.8],[136,120,.85]].map(([x,y,s],i)=>tr(x,y,s,mix(th.d,th.g,i%2?.12:.2))).join('')
        +`<rect y="150" width="200" height="90" fill="${rg('fog',[[0,th.g,.28],[1,th.d,0]],100,200,110)}"/>`;break;}
    case 'embers':
      bg+=[[30,60,3],[56,30,2],[150,40,3.5],[176,84,2.4],[24,130,2.6],[170,150,3],[120,22,2],[84,16,1.6]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#ffb255" opacity=".8"/><circle cx="${x}" cy="${y}" r="${r*2.6}" fill="#ff7a2a" opacity=".22"/>`).join('')
        +`<ellipse cx="100" cy="196" rx="120" ry="30" fill="#000" opacity=".4" filter="${bl('sm',10)}"/>`;break;
    case 'moon':
      bg+=`<circle cx="152" cy="58" r="30" fill="#c8cbe8" opacity=".25" filter="${bl('mn',8)}"/><circle cx="152" cy="58" r="18" fill="#eceffc"/><circle cx="146" cy="53" r="4" fill="#c4c8e4" opacity=".7"/><circle cx="158" cy="64" r="3" fill="#c4c8e4" opacity=".6"/>`
        +`<ellipse cx="60" cy="40" rx="48" ry="9" fill="#2b2f58" opacity=".6" filter="${bl('cl',5)}"/><ellipse cx="150" cy="128" rx="56" ry="9" fill="#2b2f58" opacity=".55" filter="${bl('cl2',5)}"/>`;break;
    case 'bokeh':
      bg+=[[34,52,16,.55],[164,44,12,.5],[24,128,12,.45],[176,120,18,.5],[132,18,9,.5],[70,22,8,.4],[184,170,10,.4],[16,176,9,.4]].map(([x,y,r,a])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${th.g}" opacity="${a}" filter="${bl('bk'+x,2)}"/>`).join('');break;
    default:break;
  }

  /* ============ CHEVEUX ============ */
  const bald=L.len==='chauve'||drk;
  const hw=w+4,ragged=L.style==='neglige';
  const hairG=lg('hg',[[0,h0],[.45,H],[1,h2]],0,0,1,1);
  const strand=(d,c,wd,op)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${wd||1}" stroke-opacity="${op||.5}" stroke-linecap="round"/>`;
  let hairBack='',hairLocks='',hairCap='';
  if(!bald){
    const l=100-hw,r=100+hw;
    const capSoft=`M${l} 98C${l-5} 60 ${l+8} 33 100 31C${r-8} 33 ${r+5} 60 ${r} 98C${r-2} 80 ${r-9} 66 ${r-22} 61C${r-40} 72 ${l+38} 74 ${l+26} 62C${l+12} 68 ${l+4} 82 ${l} 98Z`;
    const capRag=`M${l} 98C${l-8} 58 ${l+6} 30 100 28C${r-6} 30 ${r+8} 58 ${r} 98L${r-3} 84L${r-9} 92L${r-12} 74L${r-20} 84L${r-26} 66L${r-34} 78L${r-42} 64L${r-52} 76L${l+44} 62L${l+36} 76L${l+28} 62L${l+20} 78L${l+12} 70L${l+10} 88L${l+4} 80Z`;
    hairCap=`<path d="${ragged?capRag:capSoft}" fill="${hairG}"/>`
      +[0,1,2,3,4,5,6].map(i=>{const x=l+10+i*((r-l-20)/6);return strand(`M${x} ${40+Math.abs(i-3)*3}C${x+4} 52 ${x+8} 62 ${x+12} ${70+Math.abs(i-3)*2}`,i%2?h0:h3,1,.55);}).join('')
      +strand(`M${l+16} 54C${l+30} 40 ${r-30} 38 ${r-14} 54`,mix(H,'#ffffff',.4),1.6,.4);
    if(ragged)hairCap+=[[l+6,52,-9,-8],[r-6,52,9,-8],[100,30,0,-9],[l+24,38,-7,-8],[r-24,38,7,-8]].map(([x,y,dx,dy])=>strand(`M${x} ${y}q${dx*.4} ${dy*.8} ${dx} ${dy}`,H,2.2,.9)).join('');
    if(L.len==='mi'||L.len==='long'){
      const b=L.len==='mi'?182:218,e=L.len==='mi'?176:212;
      const bk=ragged
        ?`M${l-2} 84C${l-10} 124 ${l-8} ${b-30} ${l+4} ${b}L${l+14} ${b-6}L${l+24} ${b+4}L${l+36} ${b-6}L100 ${b+2}L${r-36} ${b-6}L${r-24} ${b+4}L${r-14} ${b-6}L${r-4} ${b}C${r+8} ${b-30} ${r+10} 124 ${r+2} 84C${r} 40 ${r-14} 28 100 28C${l+14} 28 ${l} 40 ${l-2} 84Z`
        :`M${l-2} 84C${l-10} 124 ${l-8} ${b-30} ${l+4} ${b}L${r-4} ${b}C${r+8} ${b-30} ${r+10} 124 ${r+2} 84C${r} 40 ${r-14} 28 100 28C${l+14} 28 ${l} 40 ${l-2} 84Z`;
      hairBack=`<path d="${bk}" fill="${lg('hb',[[0,H],[1,h3]],0,0,0,1)}"/>`;
      const lk=`M${l+4} 96C${l-6} 130 ${l-4} ${e-26} ${l+6} ${e}${ragged?`L${l+14} ${e-8}L${l+20} ${e+2}L${l+26} ${e-10}`:`L${l+24} ${e-4}`}C${l+22} ${e-30} ${l+22} 124 ${l+20} 100Z`;
      const side=`<path d="${lk}" fill="${hairG}"/>${strand(`M${l+10} 110C${l+4} 140 ${l+6} ${e-30} ${l+10} ${e-6}`,h0,1,.6)}${strand(`M${l+16} 108C${l+14} 140 ${l+14} ${e-30} ${l+16} ${e-10}`,h3,1,.5)}`;
      hairLocks=side+sym(side);
    }
  }

  /* ============ TENUE ============ */
  const steel=lg('st',[[0,'#e4eaf1'],[.35,'#a9b6c6'],[.7,'#6b7889'],[1,'#3d4756']],0,0,1,1);
  const steelV=lg('sv',[[0,'#c9d3de'],[.5,'#8793a3'],[1,'#454f5e']],0,0,0,1);
  const gold=lg('gd',[[0,'#fff1b0'],[.4,'#e0b84c'],[1,'#8a6a1c']],0,0,1,1);
  const leather=lg('lt',[[0,'#8a6240'],[1,'#3f2a1a']],0,0,0,1);
  const cloth=(id,c)=>lg(id,[[0,shade(c,.2)],[.55,c],[1,shade(c,-.45)]],0,0,0,1);
  const torsoPath='M16 240C16 212 30 194 58 186C72 182 82 179 86 174L114 174C118 179 128 182 142 186C170 194 184 212 184 240Z';
  const rivet=(x,y)=>`<circle cx="${x}" cy="${y}" r="1.7" fill="${gold}"/>`;
  const fold=(d,c,a)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-opacity="${a||.35}" stroke-linecap="round"/>`;
  let behind='',torso='',collar='';
  const robeFill=cloth('rb',th.c);
  switch(cls){
    case 'guerrier':{
      const cape=cloth('cp','#8a1f2a');
      behind=`<path d="M4 240C4 194 34 170 70 166L130 166C166 170 196 194 196 240Z" fill="${cape}"/>${fold('M38 240C42 210 52 186 66 172','#000',.3)}${fold('M162 240C158 210 148 186 134 172','#000',.35)}`
        +`<g transform="translate(160 150) rotate(24)"><rect x="-3" y="-10" width="6" height="30" rx="2" fill="${leather}"/><rect x="-12" y="-14" width="24" height="5" rx="2" fill="${gold}"/><circle cx="0" cy="22" r="4" fill="${gold}"/></g>`;
      const pauld=`<path d="M16 216C14 190 38 174 68 184C64 202 50 216 34 222C26 222 20 220 16 216Z" fill="${steel}" stroke="#2f3846" stroke-width="1"/><path d="M20 206C38 204 54 196 64 186" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1.6"/>`;
      torso=`<path d="${torsoPath}" fill="${steelV}"/>`
        +`<path d="M68 190C80 183 120 183 132 190C134 216 126 234 100 240C74 234 66 216 68 190Z" fill="${steel}"/><path d="M100 184V240" stroke="#2c3440" stroke-width="1.6" opacity=".55"/><path d="M76 194C74 214 80 230 92 238" fill="none" stroke="#fff" stroke-width="2" opacity=".4"/>`
        +pauld+sym(pauld)+rivet(30,202)+rivet(170,202)+rivet(80,200)+rivet(120,200);
      collar=`<path d="M78 170C90 184 110 184 122 170L126 180C112 194 88 194 74 180Z" fill="${steel}" stroke="#2f3846" stroke-width="1"/><path d="M82 176C92 186 108 186 118 176" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.4"/>`;break;}
    case 'paladin':{
      const cape=cloth('cp','#24428c');
      behind=`<path d="M4 240C4 194 34 170 70 166L130 166C166 170 196 194 196 240Z" fill="${cape}"/>${fold('M40 240C44 210 54 186 66 172','#fff',.18)}${fold('M160 240C156 210 146 186 134 172','#000',.3)}`;
      const plate=lg('pl',[[0,'#ffffff'],[.4,'#d5dce6'],[1,'#8b97a8']],0,0,1,1);
      const pauld=`<path d="M14 216C12 190 38 174 68 184C64 202 50 216 34 222C24 222 18 220 14 216Z" fill="${plate}" stroke="${gold}" stroke-width="2"/><path d="M18 206C38 204 54 196 64 186" fill="none" stroke="${gold}" stroke-width="1.6"/>`;
      torso=`<path d="${torsoPath}" fill="${plate}"/>`
        +`<path d="M70 190C82 184 118 184 130 190C132 214 124 232 100 240C76 232 68 214 70 190Z" fill="${plate}" stroke="${gold}" stroke-width="1.6"/>`
        +`<path d="M100 196V232M88 210H112" stroke="${gold}" stroke-width="3.4" stroke-linecap="round"/>`+pauld+sym(pauld);
      collar=`<path d="M78 170C90 184 110 184 122 170L126 180C112 194 88 194 74 180Z" fill="${plate}" stroke="${gold}" stroke-width="1.6"/>`;break;}
    case 'barbare':
      behind=`<g transform="translate(158 140) rotate(26)"><rect x="-2.6" y="-26" width="5.2" height="74" rx="2" fill="${leather}"/><path d="M2 -24C22 -30 34 -16 30 -2C22 4 10 2 2 -4Z" fill="${steel}" stroke="#2c3440" stroke-width="1"/><path d="M6 -20C18 -22 26 -16 26 -8" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.4"/></g>`;
      torso=`<path d="${torsoPath}" fill="${leather}"/><path d="M34 240L112 176" stroke="#2b1b10" stroke-width="9" stroke-linecap="round"/><path d="M36 238L112 178" stroke="#6b4a2a" stroke-width="3" stroke-linecap="round" stroke-opacity=".6"/>`
        +`<path d="M24 206C32 196 44 192 56 192L60 204C46 206 34 212 24 222Z" fill="#5a3a22"/>`;
      collar=`<path d="M30 200C40 184 62 176 84 172L100 186L116 172C138 176 160 184 170 200C160 212 140 214 124 206C112 214 88 214 76 206C60 214 40 212 30 200Z" fill="${lg('fur',[[0,'#e8dcc0'],[1,'#8e7c58']],0,0,0,1)}" stroke="#6b5a3c" stroke-width="1"/>`
        +[[40,196],[56,186],[76,180],[124,180],[144,186],[160,196],[48,204],[152,204]].map(([x,y])=>`<path d="M${x} ${y}l-3 8" stroke="#6b5a3c" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`).join('');break;
    case 'clerc':{
      const ring=[...Array(9)].map((_,i)=>`<path d="M${24+i*5} ${212+(i%2)*3}q3 3 6 0" stroke="#fff" stroke-opacity=".25" fill="none"/>`).join('');
      torso=`<path d="${torsoPath}" fill="${lg('ml',[[0,'#bfc7d2'],[1,'#58626f']],0,0,0,1)}"/>`
        +`<path d="M68 190C80 184 120 184 132 190L136 240H64Z" fill="${cloth('tb','#ece6d6')}"/><path d="M88 186L84 240M112 186L116 240" stroke="${gold}" stroke-width="3.4"/>`
        +`<path d="M100 202V224M92 210H108" stroke="${gold}" stroke-width="3.4" stroke-linecap="round"/>`+ring+sym(ring);
      collar=`<path d="M80 172C90 186 110 186 120 172L124 182C110 194 90 194 76 182Z" fill="${cloth('cl','#ece6d6')}" stroke="${gold}" stroke-width="1.4"/>`;break;}
    case 'druide':
      behind=`<g transform="translate(40 120) rotate(-14)"><path d="M0 -50C-4 -20 4 20 0 120" stroke="#5a3b22" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M0 -50C-12 -66 6 -78 0 -88M0 -52C14 -64 22 -52 12 -44" stroke="#5a3b22" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="2" cy="-60" r="7" fill="${th.g}" opacity=".85"/><circle cx="2" cy="-60" r="14" fill="${th.g}" opacity=".25"/></g>`;
      torso=`<path d="${torsoPath}" fill="${cloth('dr','#5b4630')}"/>`
        +`<path d="M16 240C16 212 30 194 58 186C72 182 82 179 86 174L114 174C118 179 128 182 142 186C170 194 184 212 184 240L168 240C166 220 150 206 100 206C50 206 34 220 32 240Z" fill="${cloth('dm','#4f7d4a')}"/>`;
      collar=[[40,196,-30],[58,186,-12],[142,186,12],[160,196,30],[30,206,-40],[170,206,40]].map(([x,y,a])=>`<path d="M0 0C6 -6 16 -6 22 0C16 6 6 6 0 0Z" transform="translate(${x} ${y}) rotate(${a})" fill="${th.g}" stroke="#2f5a2c" stroke-width=".8"/>`).join('')
        +`<path d="M100 188l5 7-5 9-5-9z" fill="${gold}"/>`;break;
    case 'rodeur':
      behind=`<path d="M10 240C10 190 40 166 70 162L130 162C160 166 190 190 190 240Z" fill="${cloth('cp','#2e5a3c')}"/>`
        +`<g transform="translate(158 150) rotate(16)"><path d="M0 -60C26 -34 26 40 0 70" stroke="#6a4727" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M0 -60V70" stroke="#d8d2b8" stroke-width=".8" opacity=".7"/></g>`
        +`<g transform="translate(46 150) rotate(-10)"><rect x="-6" y="-10" width="12" height="46" rx="3" fill="${leather}"/>${[-4,0,4].map(x=>`<path d="M${x} -10V-26" stroke="#d9d2b6" stroke-width="1.4"/><path d="M${x} -26l-2.4 5h4.8z" fill="#9b3a2a"/>`).join('')}</g>`;
      torso=`<path d="${torsoPath}" fill="${cloth('lr','#4f5a3a')}"/><path d="M40 240L114 178" stroke="#3a2616" stroke-width="7" stroke-linecap="round"/><path d="M160 240L88 180" stroke="#4a3220" stroke-width="5" stroke-linecap="round"/>`
        +`<circle cx="100" cy="196" r="5" fill="${gold}" stroke="#6a4a14" stroke-width="1"/>`
        +`<path d="M22 214C36 204 54 198 70 194L74 206C54 210 38 218 24 228Z" fill="${leather}"/>`;break;
    case 'roublard':
      behind=`<path d="M10 240C10 190 40 166 70 162L130 162C160 166 190 190 190 240Z" fill="${cloth('cp','#2b2b38')}"/>`
        +`<g transform="translate(150 160) rotate(30)"><rect x="-2.5" y="-6" width="5" height="22" rx="2" fill="${leather}"/><rect x="-9" y="-10" width="18" height="4" rx="2" fill="#aeb4be"/></g>`
        +`<g transform="translate(50 160) rotate(-30)"><rect x="-2.5" y="-6" width="5" height="22" rx="2" fill="${leather}"/><rect x="-9" y="-10" width="18" height="4" rx="2" fill="#aeb4be"/></g>`;
      torso=`<path d="${torsoPath}" fill="${cloth('lr','#34343f')}"/><path d="M44 240L112 180" stroke="#7a5a3a" stroke-width="5" stroke-linecap="round"/><path d="M156 240L88 180" stroke="#6a4a2a" stroke-width="4" stroke-linecap="round"/>`
        +rivet(100,200)+rivet(100,216);break;
    case 'magicien':
      behind=`<g transform="translate(166 120) rotate(10)"><path d="M0 -40V150" stroke="#6a4727" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="-48" r="14" fill="${th.g}" opacity=".35" filter="${bl('orb',5)}"/><circle cx="0" cy="-48" r="9" fill="${lg('ob',[[0,'#ffffff'],[.5,th.g],[1,mix(th.g,'#000000',.4)]],0,0,1,1)}"/><path d="M-8 -36l8 8 8-8" stroke="#c9a84a" stroke-width="2.4" fill="none"/></g>`;
      torso=`<path d="${torsoPath}" fill="${robeFill}"/>`+fold('M44 240C46 220 56 200 70 190','#000',.28)+fold('M156 240C154 220 144 200 130 190','#000',.34)
        +`<path d="M64 188C82 182 118 182 136 188L132 240H68Z" fill="${cloth('rb2',shade(th.c,.12))}"/>`
        +`<path d="M82 186L100 232L118 186" fill="none" stroke="${gold}" stroke-width="3"/>`
        +[[58,214],[142,216],[78,226],[122,230]].map(([x,y])=>spark(x,y,4,'#fff3b0',.85)).join('')
        +`<circle cx="100" cy="206" r="5" fill="${gold}"/><circle cx="100" cy="206" r="2.6" fill="${th.g}"/>`;
      collar=`<path d="M76 172C88 188 112 188 124 172L132 184C114 200 86 200 68 184Z" fill="${cloth('cl',shade(th.c,.1))}" stroke="${gold}" stroke-width="1.8"/>`;break;
    case 'ensorceleur':
      behind=`<g transform="translate(40 130) rotate(-8)"><path d="M0 -36V140" stroke="#4a2a22" stroke-width="5" stroke-linecap="round"/><path d="M0 -62L9 -44L0 -26L-9 -44Z" fill="${lg('cr',[[0,'#ffd1de'],[.5,th.g],[1,mix(th.g,'#000000',.5)]],0,0,1,1)}"/><path d="M0 -62L9 -44L0 -26L-9 -44Z" fill="${th.g}" opacity=".35" filter="${bl('crf',5)}"/></g>`;
      torso=`<path d="${torsoPath}" fill="${robeFill}"/>`+fold('M44 240C46 220 56 200 70 190','#000',.28)+fold('M156 240C154 220 144 200 130 190','#000',.34)
        +`<path d="M66 188C84 182 116 182 134 188L128 240H72Z" fill="${cloth('rb2',shade(th.c,-.2))}"/>`
        +`<path d="M100 198l4.5 10 10 4.500-10 4.500-4.500 10-4.500-10-10-4.500 10-4.500z" fill="#ffd36a"/>`
        +`<path d="M86 188C90 204 110 204 114 188" fill="none" stroke="#ffd36a" stroke-width="2"/>`;
      collar=`<path d="M70 168C86 190 114 190 130 168L142 186C120 204 80 204 58 186Z" fill="${cloth('cl',shade(th.c,-.1))}" stroke="#ffd36a" stroke-width="1.6"/>`;break;
    case 'occultiste':
      behind=`<g transform="translate(38 92)"><circle r="20" fill="none" stroke="${th.g}" stroke-width="1.6" opacity=".8"/><circle r="26" fill="none" stroke="${th.g}" stroke-width="1" stroke-dasharray="2 4" opacity=".7"/><path d="M-12 0Q0 -9 12 0Q0 9 -12 0Z" fill="none" stroke="${mix(th.g,'#ffffff',.4)}" stroke-width="1.8"/><circle r="3.6" fill="${mix(th.g,'#ffffff',.5)}"/></g>`;
      torso=`<path d="${torsoPath}" fill="${robeFill}"/>`+fold('M44 240C46 220 56 200 70 190','#fff',.1)+fold('M156 240C154 220 144 200 130 190','#000',.4)
        +`<path d="M64 190C82 184 118 184 136 190L130 240H70Z" fill="${cloth('rb2',shade(th.c,-.35))}"/>`
        +`<path d="M86 214Q100 202 114 214Q100 226 86 214Z" fill="none" stroke="${mix(th.g,'#ffffff',.4)}" stroke-width="1.8"/><circle cx="100" cy="214" r="3.4" fill="${mix(th.g,'#ffffff',.5)}"/>`;
      collar=`<path d="M26 206C36 184 62 172 86 170L100 190L114 170C138 172 164 184 174 206C150 196 126 194 100 198C74 194 50 196 26 206Z" fill="${cloth('cw',shade(th.c,-.25))}"/>`;break;
    case 'barde':
      behind=`<g transform="translate(160 140) rotate(24)"><rect x="-3" y="-40" width="6" height="70" rx="2" fill="#7a4b24"/><rect x="-6" y="-52" width="12" height="14" rx="3" fill="#5a3518"/>${[-5,5].map(x=>`<circle cx="${x}" cy="-46" r="2" fill="${gold}"/>`).join('')}<ellipse cx="0" cy="48" rx="20" ry="26" fill="${lg('lu',[[0,'#d29a52'],[1,'#7a4b24']],0,0,1,1)}"/><circle cx="0" cy="46" r="6" fill="#2a1608"/></g>`;
      torso=`<path d="${torsoPath}" fill="${cloth('db',th.c)}"/>`+fold('M60 240C62 222 70 204 82 192','#000',.25)
        +`<path d="M82 188L100 240L118 188" fill="none" stroke="${gold}" stroke-width="2.4"/>`+[200,212,224].map(y=>`<circle cx="100" cy="${y}" r="2.4" fill="${gold}"/>`).join('')
        +`<path d="M16 216C30 206 50 198 66 194L70 206C50 210 34 218 20 230Z" fill="${cloth('sl','#2f6d5a')}"/>`;
      collar=`<path d="M76 172C88 186 112 186 124 172L130 182C112 196 88 196 70 182Z" fill="#f3e9d0" stroke="${gold}" stroke-width="1.2"/>`;break;
    case 'moine':
      torso=`<path d="${torsoPath}" fill="${cloth('mo',th.c)}"/>`+fold('M48 240C50 220 60 204 74 192','#000',.25)+fold('M152 240C150 220 140 204 126 192','#000',.32)
        +`<path d="M70 186L100 232L130 186L124 184L100 218L76 184Z" fill="#f1e4c8"/>`
        +`<path d="M18 226C60 216 140 216 182 226V240H18Z" fill="#7a3d12"/><path d="M94 218h12l-3 22h-6z" fill="#5a2b0c"/>`
        +[...Array(8)].map((_,i)=>`<circle cx="${76+i*7}" cy="${190+Math.sin(i/7*Math.PI)*14}" r="2.6" fill="#6b3e1c" stroke="#3a210f" stroke-width=".6"/>`).join('');
      break;
    default:
      torso=`<path d="${torsoPath}" fill="${cloth('df','#556070')}"/>`;
  }

  /* ============ TÊTE ============ */
  const skinG=lg('sk',[[0,sk0],[.5,skin],[1,sk2]],0,0,1,.55);
  const neckG=lg('nk',[[0,shade(skin,-.12)],[1,shade(skin,-.45)]],0,0,0,1);
  defs.push(`<clipPath id="${P}hc"><path d="${HP}"/></clipPath>`);
  /* cou */
  const nw=drk?20:(sp==='nain'||sp==='orc'||sp==='goliath'?27:f?20:24);
  const neck=`<path d="M${100-nw} 136L${100-nw-2} 182H${100+nw+2}L${100+nw} 136Z" fill="${neckG}"/>`
    +`<ellipse cx="100" cy="150" rx="${nw+4}" ry="9" fill="#000" opacity=".38" filter="${bl('ns',4)}"/>`;

  /* oreilles */
  const earSk=shade(skin,-.08);
  const earRound=`<path d="M${100-w+4} 86C${100-w-9} 82 ${100-w-9} 108 ${100-w+3} 116C${100-w} 104 ${100-w} 94 ${100-w+4} 86Z" fill="${earSk}"/><path d="M${100-w-1} 94C${100-w-4} 98 ${100-w-3} 106 ${100-w+1} 110" fill="none" stroke="${skD}" stroke-width="1" opacity=".5"/>`;
  const earPoint=(len,up)=>`<path d="M${100-w+4} 90L${100-w-len} ${90-up}C${100-w-len+8} ${100-up/3} ${100-w-8} 114 ${100-w+3} 118C${100-w} 104 ${100-w} 96 ${100-w+4} 90Z" fill="${earSk}"/><path d="M${100-w-1} 96L${100-w-len+7} ${92-up}" fill="none" stroke="${skD}" stroke-width="1" opacity=".45"/>`;
  let ears='';
  if(!drk){
    const one=sp==='elfe'?earPoint(30,30):(sp==='gnome'||sp==='tieffelin'||sp==='halfelin')?earPoint(14,12):sp==='orc'?earPoint(20,18):earRound;
    ears=one+sym(one);
  }

  /* cornes et crêtes */
  let horns='';
  if(sp==='tieffelin'){
    const hg=lg('hn',[[0,'#2b1f22'],[.6,'#5a4348'],[1,'#c9b9a6']],0,0,0,1);
    const hn=`<path d="M${100-w+10} ${T+16}C${100-w-8} ${T-6} ${100-w-18} ${T-28} ${100-w-4} ${T-40}C${100-w-2} ${T-22} ${100-w+16} ${T-6} ${100-w+26} ${T+8}Z" fill="${hg}"/>${[0,1,2].map(i=>`<path d="M${100-w-6+i*3} ${T-4-i*9}l8 1" stroke="#1d1417" stroke-width="1" opacity=".5"/>`).join('')}`;
    horns=hn+sym(hn);
  }
  if(drk){
    const hg=lg('hn',[[0,shade(skin,-.5)],[.5,shade(skin,-.15)],[1,'#e4d9bd']],0,0,0,1);
    const hn=`<path d="M${100-w+8} ${T+14}C${100-w-6} ${T-2} ${100-w-20} ${T-8} ${100-w-30} ${T-26}C${100-w-12} ${T-18} ${100-w+10} ${T-4} ${100-w+24} ${T+6}Z" fill="${hg}"/>`;
    const fr=`<path d="M${100-w+2} 96L${100-w-18} 82L${100-w-12} 100L${100-w-22} 112L${100-w+2} 112Z" fill="${shade(skin,-.2)}"/>`;
    horns=hn+sym(hn)+fr+sym(fr);
  }

  /* visage : base, ombres */
  let face=`<path d="${HP}" fill="${skinG}"/>`;
  face+=`<g clip-path="url(#${P}hc)">`
    +`<ellipse cx="100" cy="${T+12}" rx="${w+4}" ry="22" fill="${bald?skD:h3}" opacity="${bald?.12:.5}" filter="${bl('fs',6)}"/>`
    +`<ellipse cx="${100-18.5}" cy="92" rx="15" ry="8" fill="${skD}" opacity=".32" filter="${bl('es',3.2)}"/><ellipse cx="${100+18.5}" cy="92" rx="15" ry="8" fill="${skD}" opacity=".36" filter="${bl('es2',3.2)}"/>`
    +`<ellipse cx="${100+w-6}" cy="112" rx="14" ry="30" fill="${skD}" opacity=".3" filter="${bl('rs',8)}"/>`
    +`<ellipse cx="${100-w+14}" cy="104" rx="10" ry="16" fill="#fff" opacity=".1" filter="${bl('cb',6)}"/>`
    +`<ellipse cx="100" cy="${C-3}" rx="${jw}" ry="9" fill="${skD}" opacity=".3" filter="${bl('js',5)}"/>`
    +`<ellipse cx="100" cy="${T+20}" rx="${w-12}" ry="12" fill="#fff" opacity=".1" filter="${bl('fh',6)}"/>`
    +`<ellipse cx="100" cy="124" rx="12" ry="3.4" fill="${skD}" opacity=".18" filter="${bl('ns2',2)}"/>`
    +`</g>`;

  /* particularités d'espèce sur la peau */
  if(sp==='goliath'){
    const mk=`<g clip-path="url(#${P}hc)" fill="none" stroke="${shade(skin,-.5)}" stroke-width="2.6" stroke-linecap="round" opacity=".55"><path d="M${100-w+8} 78q8 4 16 0M${100-w+8} 90q10 4 20 2M${100-w+10} 104q8 6 16 4"/></g>`;
    face+=mk+sym(mk)+`<g clip-path="url(#${P}hc)" fill="none" stroke="${shade(skin,-.5)}" stroke-width="2.6" stroke-linecap="round" opacity=".5"><path d="M82 52q18-6 36 0M90 62q10-3 20 0"/></g>`
      +`<g clip-path="url(#${P}hc)">${[[78,70],[90,82],[112,76],[122,100],[76,112],[104,60],[96,100]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.1" fill="${shade(skin,-.4)}" opacity=".35"/>`).join('')}</g>`;
  }
  if(sp==='orc')face+=`<path d="M${100-w+10} 100L${100-w+30} 124" stroke="${shade(skin,.45)}" stroke-width="1.8" opacity=".55" clip-path="url(#${P}hc)"/>`;
  if(cls==='barbare'&&!drk){
    const paint=`<path d="M${100-w+6} 100L${100-w+30} 106M${100-w+6} 110L${100-w+30} 116" fill="none" stroke="#b02a1a" stroke-width="3.4" stroke-linecap="round" opacity=".85"/>`;
    face+=`<g clip-path="url(#${P}hc)">${paint}${sym(paint)}</g>`;
  }

  /* yeux */
  defs.push(`<clipPath id="${P}ec"><path d="M-9.5 ${fm.tilt}C-5 -6.5 4 -7 9.5 1C5 5.5 -5 5.5 -9.5 ${fm.tilt}Z"/></clipPath>`);
  defs.push(`<radialGradient id="${P}ir" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="${shade(E,.38)}"/><stop offset=".45" stop-color="${E}"/><stop offset="1" stop-color="${shade(E,-.55)}"/></radialGradient>`);
  const slit=drk,solid=sp==='tieffelin';
  const eye=`<g transform="scale(${n1(fm.eye*1.14)})">`
    +`<path d="M-9.5 ${fm.tilt}C-5 -6.5 4 -7 9.5 1C5 5.5 -5 5.5 -9.5 ${fm.tilt}Z" fill="${solid?'#14101a':slit?'#e8d27a':'#f3efe6'}"/>`
    +`<g clip-path="url(#${P}ec)"><circle cx=".5" cy="-.2" r="${solid?5.4:slit?4.8:4.9}" fill="url(#${P}ir)"/>`
    +(slit?`<ellipse cx=".5" cy="-.2" rx="1.1" ry="4.8" fill="#15110f"/>`:solid?'':`<circle cx=".5" cy="-.2" r="2.1" fill="#15110f"/>`)
    +`<ellipse cx="0" cy="-5" rx="11" ry="3.4" fill="#000" opacity=".22"/><circle cx="-1.3" cy="-2.1" r="1.2" fill="#fff" opacity=".92"/><circle cx="2.2" cy="1.4" r=".6" fill="#fff" opacity=".6"/></g>`
    +`<path d="M-10 ${fm.tilt+.4}C-5 -7.6 4 -8 10 1" fill="none" stroke="${skD}" stroke-width="1.7" stroke-linecap="round"/>`
    +(f?`<path d="M-9.8 ${fm.tilt}C-11 ${fm.tilt-1} -12.4 ${fm.tilt-1.6} -13.6 ${fm.tilt-3}" fill="none" stroke="${skD}" stroke-width="1.3" stroke-linecap="round"/>`:'')
    +`<path d="M-8 -8.4C-4 -11.4 4 -11.8 9 -8" fill="none" stroke="${sk2}" stroke-width=".9" opacity=".55"/>`
    +`<path d="M-8 4.4C-4 6.2 4 6.2 8 3.6" fill="none" stroke="${sk2}" stroke-width=".7" opacity=".45"/></g>`;
  const eyes=`<g transform="translate(${100-18.5} 92)">${eye}</g><g transform="translate(${100+18.5} 92) scale(-1 1)">${eye}</g>`;

  /* sourcils */
  const bc=bald?shade(skin,-.55):h3;
  const bw=2.6*brow;
  const bp=`<path d="M-11.5 -9.5C-6 ${-15-brow} 3 ${-16-brow} 10.5 -11" fill="none" stroke="${bc}" stroke-width="${n1(bw)}" stroke-linecap="round"/><path d="M-11.5 -9.5C-6 ${-15-brow} 3 ${-16-brow} 10.5 -11" fill="none" stroke="${bc}" stroke-width="${n1(bw*.45)}" stroke-linecap="round" transform="translate(-1.5 1.2)" opacity=".7"/>`;
  const brows=drk
    ?`<path d="M${100-w+4} 80C${100-w+18} 70 ${100-12} 74 ${100-10} 84M${100+w-4} 80C${100+w-18} 70 ${100+12} 74 ${100+10} 84" fill="none" stroke="${shade(skin,-.35)}" stroke-width="5" stroke-linecap="round"/>`
    :`<g transform="translate(${100-18.5} 92)">${bp}</g><g transform="translate(${100+18.5} 92) scale(-1 1)">${bp}</g>`;

  /* nez et bouche */
  const nz=fm.nose;
  const lipC=f?mix(skin,'#b04058',.5):mix(skin,'#9a4a4a',.32);
  const nose=drk?'':`<g transform="translate(100 112) scale(${nz}) translate(-100 -112)">`
    +`<path d="M94.5 90C93.5 100 91.5 108 88 113" fill="none" stroke="${skD}" stroke-width="2.4" opacity=".28" stroke-linecap="round" filter="${bl('nb',1.2)}"/>`
    +`<path d="M105.5 90C106.5 100 108.5 108 112 113" fill="none" stroke="${skD}" stroke-width="2.6" opacity=".48" stroke-linecap="round" filter="${bl('nb2',1.2)}"/>`
    +`<path d="M99 92C98.6 100 99 106 99.8 111" fill="none" stroke="${sk0}" stroke-width="2" opacity=".45" stroke-linecap="round" filter="${bl('nh',1)}"/>`
    +`<ellipse cx="100" cy="113" rx="6.2" ry="4.4" fill="${sk0}" opacity=".3" filter="${bl('nt',1.6)}"/>`
    +`<path d="M90.5 114C88.5 117.5 91.5 121 95.5 120M109.5 114C111.5 117.5 108.5 121 104.5 120" fill="none" stroke="${skD}" stroke-width="1.1" stroke-linecap="round" opacity=".38"/>`
    +`<path d="M95 120.5C98 122.5 102 122.5 105 120.5" fill="none" stroke="${skD}" stroke-width="1.1" stroke-linecap="round" opacity=".38"/></g>`;
  const mouth=drk?'':`<path d="M89 133C94 129.5 97 129.8 100 131C103 129.8 106 129.5 111 133C106 135.2 94 135.2 89 133Z" fill="${shade(lipC,-.12)}"/>`
    +`<path d="M91 134C96 140.5 104 140.5 109 134C105 136.2 95 136.2 91 134Z" fill="${lipC}"/>`
    +`<path d="M89 133C95 135 105 135 111 133" fill="none" stroke="${skD}" stroke-width="1.1" stroke-linecap="round" opacity=".85"/>`
    +`<ellipse cx="100" cy="137.5" rx="4.4" ry="1" fill="#fff" opacity=".25"/><ellipse cx="100" cy="143" rx="7.5" ry="2.2" fill="${skD}" opacity=".16" filter="${bl('ch',1.5)}"/>`;
  /* museau du drakéide */
  let snout='';
  if(drk){
    const sn=lg('sn',[[0,shade(skin,.28)],[1,shade(skin,-.12)]],0,0,0,1);
    snout=`<path d="M${100-17} 104C${100-17} 96 ${100-9} 92 100 92C${100+9} 92 ${100+17} 96 ${100+17} 104L${100+19} 130C${100+19} 146 ${100+9} 152 100 152C${100-9} 152 ${100-19} 146 ${100-19} 130Z" fill="${sn}" stroke="${shade(skin,-.35)}" stroke-width="1"/>`
      +`<ellipse cx="${100-6}" cy="108" rx="2.2" ry="3.2" fill="${shade(skin,-.6)}"/><ellipse cx="${100+6}" cy="108" rx="2.2" ry="3.2" fill="${shade(skin,-.6)}"/>`
      +`<path d="M${100-17} 132C${100-8} 138 ${100+8} 138 ${100+17} 132" fill="none" stroke="${shade(skin,-.6)}" stroke-width="1.8" stroke-linecap="round"/>`
      +[-9,0,9].map(x=>`<path d="M${100+x-2} 135l2 5 2-5z" fill="#f4efe0"/>`).join('')
      +[[100-26,60],[100-8,52],[100+8,52],[100+26,60],[100-30,76],[100+30,76],[100-14,66],[100+14,66]].map(([x,y])=>`<path d="M${x-5} ${y}q5-5 10 0" fill="none" stroke="${shade(skin,-.3)}" stroke-width="1.4" opacity=".55"/>`).join('');
  }
  /* défenses de l'orc, barbe et moustache du nain */
  let tusks='';
  if(sp==='orc')tusks=`<path d="M93 133L90.5 119L97 131Z" fill="#f4efe0" stroke="#bdb391" stroke-width=".8"/><path d="M107 133L109.5 119L103 131Z" fill="#f4efe0" stroke="#bdb391" stroke-width=".8"/>`;
  let beard='',stache='';
  if(sp==='nain'&&mal){
    const bg2=lg('bd',[[0,h0],[.5,H],[1,h3]],0,0,0,1);
    beard=`<path d="M${100-w+2} 104C${100-w-6} 150 ${100-22} 200 100 206C${100+22} 200 ${100+w+6} 150 ${100+w-2} 104C${100+w-10} 130 ${100+24} 142 100 144C${100-24} 142 ${100-w+10} 130 ${100-w+2} 104Z" fill="${bg2}"/>`
      +[-16,-8,0,8,16].map(x=>strand(`M${100+x} 140C${100+x*1.2} 164 ${100+x*1.3} 184 ${100+x*.9} 200`,h0,1.2,.5)).join('')
      +`<circle cx="${100-10}" cy="196" r="2.4" fill="${gold}"/><circle cx="${100+10}" cy="196" r="2.4" fill="${gold}"/>`;
    stache=`<path d="M${100-22} 128C${100-14} 122 ${100-4} 126 100 128C${100+4} 126 ${100+14} 122 ${100+22} 128C${100+16} 138 ${100+6} 136 100 133C${100-6} 136 ${100-16} 138 ${100-22} 128Z" fill="${bg2}"/>`;
  }

  /* ============ COUVRE-CHEF ============ */
  let hat='',hoodBack='';
  if(cls==='rodeur'||cls==='roublard'||cls==='occultiste'){
    const hc=cloth('hd',cls==='rodeur'?'#2e5a3c':cls==='roublard'?'#2b2b38':shade(th.c,-.2));
    hoodBack=`<path d="M${100-w-22} 188C${100-w-30} 120 ${100-w-14} 36 100 28C${100+w+14} 36 ${100+w+30} 120 ${100+w+22} 188Z" fill="${hc}"/>`;
    hat=`<path d="M${100-w-22} 188C${100-w-30} 120 ${100-w-14} 36 100 26C${100+w+14} 36 ${100+w+30} 120 ${100+w+22} 188L${100+w+8} 172C${100+w+14} 116 ${100+w+2} 56 100 46C${100-w-2} 56 ${100-w-14} 116 ${100-w-8} 172Z" fill="${hc}"/>`
      +`<path d="M${100-w-8} 172C${100-w-14} 116 ${100-w-2} 56 100 46C${100+w+2} 56 ${100+w+14} 116 ${100+w+8} 172" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="3" filter="${bl('hs',2)}"/>`;
  }
  if(cls==='magicien'){
    const hg=lg('wh',[[0,shade(th.c,.2)],[1,shade(th.c,-.4)]],0,0,1,1);
    hat=`<ellipse cx="100" cy="${T+6}" rx="${w+36}" ry="11" fill="${shade(th.c,-.35)}"/>`
      +`<path d="M${100-w-8} ${T+4}C${100-w+2} ${T-14} 98 ${T-30} 112 ${T-36}C126 ${T-28} ${100+w-6} ${T-14} ${100+w+8} ${T+4}C${100+w-8} ${T+12} ${100-w+8} ${T+12} ${100-w-8} ${T+4}Z" fill="${hg}"/>`
      +`<path d="M${100-w-8} ${T+2}C${100-w+10} ${T+12} ${100+w-10} ${T+12} ${100+w+8} ${T+2}L${100+w+8} ${T-6}C${100+w-10} ${T+4} ${100-w+10} ${T+4} ${100-w-8} ${T-6}Z" fill="${gold}"/>`
      +`<path d="M108 ${T-14}l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z" fill="#fff6c8"/>`
      +`<ellipse cx="100" cy="${T+8}" rx="${w-2}" ry="5" fill="#000" opacity=".4" filter="${bl('hb2',3)}"/>`;
  }
  if(cls==='barde')
    hat=`<path d="M${100-w-6} ${T+10}C${100-w} ${T-14} ${100+w} ${T-18} ${100+w+8} ${T+8}C${100+w-4} ${T+18} ${100-w+4} ${T+16} ${100-w-6} ${T+10}Z" fill="${cloth('cap','#2f6d5a')}"/>`
      +`<path d="M${100+w-4} ${T+2}C${100+w+20} ${T-26} ${100+w+36} ${T-24} ${100+w+40} ${T-34}C${100+w+30} ${T-8} ${100+w+14} ${T+6} ${100+w+2} ${T+12}Z" fill="${lg('fe',[[0,'#f3d27a'],[1,'#b8892a']],0,0,1,1)}"/>`;
  if(cls==='druide')
    hat=[[-32,6,-70],[-20,-4,-40],[-6,-8,-10],[8,-8,10],[22,-4,40],[34,6,70]].map(([dx,dy,a])=>`<path d="M0 0C5 -6 15 -6 21 0C15 6 5 6 0 0Z" transform="translate(${100+dx*1.1} ${T+8+dy}) rotate(${a})" fill="${th.g}" stroke="#2f5a2c" stroke-width=".8"/>`).join('')+`<path d="M${100-w-2} ${T+14}C${100-w+10} ${T+2} ${100+w-10} ${T+2} ${100+w+2} ${T+14}" fill="none" stroke="#5a4326" stroke-width="2.4"/>`;
  if(cls==='clerc'||cls==='paladin')
    hat=`<path d="M${100-w+2} ${T+22}C${100-w+16} ${T+14} ${100+w-16} ${T+14} ${100+w-2} ${T+22}" fill="none" stroke="${gold}" stroke-width="3"/><circle cx="100" cy="${T+19}" r="4" fill="${cls==='paladin'?'#5aa0ff':'#e04a4a'}" stroke="${gold}" stroke-width="1"/>`;

  /* ============ ÉCLAIRAGE ET CADRE ============ */
  defs.push(`<clipPath id="${P}rim"><rect x="100" y="150" width="100" height="90"/></clipPath>`);
  const rim=`<path d="${torsoPath}" fill="none" stroke="${th.g}" stroke-width="3" stroke-opacity=".55" filter="${bl('rm',2.5)}" clip-path="url(#${P}rim)"/>`;
  const shadeR=`<rect width="200" height="240" fill="${lg('sr',[[0,'#000',0],[.5,'#000',0],[1,'#000',.42]],0,0,1,0)}"/>`;
  const vign=`<rect width="200" height="240" fill="${rg('vg',[[0,'#000',0],[.7,'#000',0],[1,'#000',.55]],100,110,150)}"/>`;
  const bloom=`<rect width="200" height="240" fill="${rg('bm',[[0,'#fff',.2],[1,'#fff',0]],30,20,120)}"/>`;
  const frame=`<rect x="3" y="3" width="194" height="234" rx="11" fill="none" stroke="#e2c46a" stroke-opacity=".65" stroke-width="1.6"/><rect x="7" y="7" width="186" height="226" rx="8" fill="none" stroke="#e2c46a" stroke-opacity=".28" stroke-width=".8"/>`
    +[[10,10,1,1],[190,10,-1,1],[10,230,1,-1],[190,230,-1,-1]].map(([x,y,sx,sy])=>`<path d="M${x} ${y+16*sy}V${y}H${x+16*sx}" fill="none" stroke="#e2c46a" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round"/>`).join('');
  const badge=!opt.crop&&CLASS_PATHS&&CLASS_PATHS[cls]
    ?`<circle cx="170" cy="210" r="19" fill="${BADGE[cls]||'#334'}" stroke="#e2c46a" stroke-width="2"/><g transform="translate(155 195) scale(1.25)" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${CLASS_PATHS[cls].map(d=>`<path d="${d}"/>`).join('')}</g>`:'';

  const alt=`Portrait : ${(NS.SPN&&NS.SPN[sp]?NS.SPN[sp][f?'f':'m']:sp)}, ${(NS.CLASS_LABEL||{})[cls]||''}`;
  const vb=opt.crop?'26 10 148 148':'0 0 200 240';
  const sz=size||120,hh=opt.crop?sz:Math.round(sz*1.2);
  return `<svg class="ptr" width="${sz}" height="${hh}" viewBox="${vb}" role="img" aria-label="${alt.replace(/"/g,'&quot;')}" xmlns="http://www.w3.org/2000/svg">`
    +`<defs>${defs.join('')}<clipPath id="${P}fr"><rect width="200" height="240" rx="14"/></clipPath></defs>`
    +`<g clip-path="url(#${P}fr)">${bg}<g transform="translate(0 8)">${hoodBack}</g>${behind}<g transform="translate(0 8)">${hairBack}</g>${torso}${rim}<g transform="translate(0 8)">${neck}</g>${collar}<g transform="translate(0 8)">${hairLocks}${horns}${ears}${face}${snout}${beard}${eyes}${brows}${nose}${mouth}${tusks}${stache}${hairCap}${hat}</g>${bloom}${shadeR}${vign}</g>`
    +(opt.crop?'':frame)+badge+`</svg>`;
}

Object.assign(NS,{portrait,LOOK:{HAIR,EYES,SKINS,LENS,STYLES},lookDefaults:resolve});
})();
