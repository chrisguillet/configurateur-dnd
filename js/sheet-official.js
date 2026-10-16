/* Fiche « format officiel » : deux pages A4 qui reprennent l'organisation des fiches de personnage habituelles
   (identité et jets en page 1, sorts, apparence et équipement en page 2).
   Seule l'organisation des rubriques est reprise : l'habillage (cadres, titres, typographie) est propre à cette
   application, sans logo ni illustration.
   Fonctions pures : le modèle (voir sheetModel dans app.js) entre, du HTML sort. Couleurs écrites en dur pour que la
   fiche reste identique dans le thème sombre et dans la fiche HTML exportée. */
(function(){
'use strict';
const NS=window.DND=window.DND||{};

const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ck=(on,mark)=>`<i class="ck">${on?(mark||'✓'):''}</i>`;
const fld=(label,val,cls)=>`<div class="fl${cls?' '+cls:''}${String(val==null?'':val).length>18?' sm':''}"><span class="v">${esc(val)}</span><span class="lb">${esc(label)}</span></div>`;
/* taille du texte selon la quantité à faire tenir dans une rubrique */
const tier=(n,a,b,c)=>n<=a?'t1':n<=b?'t2':n<=c?'t3':'t4';
const len=(arr)=>arr.reduce((t,x)=>t+(x.n||x||'').length+((x.d||'').length),0);
/* Choix de la taille de texte d'une rubrique : on estime le nombre de lignes à chaque taille et on prend la plus
   grande qui tient. cols = colonnes de texte, h = hauteur utile (mm), w = largeur d'une colonne (mm). */
const CPL={t1:46,t2:52,t3:58,t4:63},LH={t1:3.35,t2:3.0,t3:2.65,t4:2.45};
function featFit(list,cols,h,w){
  const txt=list.map(x=>typeof x==='string'?x:(x.n||'')+(x.d?'. '+x.d:''));
  const fits=(t,k)=>txt.reduce((s,x)=>s+Math.ceil(x.length/(CPL[t]*w/62))+.4,0)<=cols*h/LH[t]*k;
  for(const t of ['t1','t2','t3'])if(fits(t,.88))return{t,cut:0};
  return{t:'t4',cut:fits('t4',1)?0:95};   /* on n'abrège (« … ») qu'en dernier recours */
}
const featTier=(list,cols,h,w)=>featFit(list,cols,h,w).t;
const shorten=(d,max)=>d.length<=max?d:d.slice(0,max).replace(/\s+\S*$/,'')+'…';

/* ---------- Page 1 ---------- */
function abilityBox(a){
  const skills=a.skills.map(s=>`<div class="sk">${ck(s.p||s.x,s.x?'★':'✓')}<span class="num">${esc(s.b)}</span><span>${esc(s.n)}</span></div>`).join('');
  return `<div class="ob oab" style="flex:${a.skills.length+5.5} 1 0"><span class="ttl">${esc(a.name)}</span>
<div class="amv"><div class="mod"><b>${esc(a.mod)}</b><span class="lb">MODIFICATEUR</span></div><div class="val"><b>${esc(a.val)}</b><span class="lb">VALEUR</span></div></div>
<div class="sv">${ck(a.save.p)}<span class="num">${esc(a.save.b)}</span><b>Sauvegarde</b></div>
${skills?`<div class="skls">${skills}</div>`:''}</div>`;
}

function featHTML(list,cls,max){
  return `<div class="ftx ${cls}">${list.map(f=>`<p><b>${esc(f.n)}${f.d?'.':''}</b>${f.d?' '+esc(max?shorten(f.d,max):f.d):''}</p>`).join('')}</div>`;
}

function page1(m){
  const head=`<div class="oh">
<div class="ob oname">${fld('NOM DU PERSONNAGE',m.name,'wide')}<div class="two">${fld('HISTORIQUE',m.bg)}${fld('CLASSE',m.cls)}</div><div class="two">${fld('ESPÈCE',m.species)}${fld('SOUS-CLASSE',m.sub)}</div></div>
<div class="ob olevel">${fld(m.multi?'NIVEAU TOTAL':'NIVEAU',m.level)}${fld('PX','')}</div>
<div class="ob oac"><span class="ttl">CLASSE D'ARMURE</span><b class="big">${esc(m.ac)}</b><div class="shd">${ck(m.shield)}<span class="lb">BOUCLIER</span></div></div>
<div class="ob ohp"><span class="ttl">POINTS DE VIE</span><div class="hpg">${fld('ACTUEL','')}${fld('TEMP','')}${fld('MAX',m.hpMax)}</div></div>
<div class="ob ohd"><span class="ttl">DÉS DE VIE</span>${fld('DÉPENSÉS','')}${fld('MAX',m.hitDice)}</div>
<div class="ob ods"><span class="ttl">JETS CONTRE LA MORT</span><div class="dsr"><span class="lb">SUCCÈS</span>${ck()}${ck()}${ck()}</div><div class="dsr"><span class="lb">ÉCHECS</span>${ck()}${ck()}${ck()}</div></div>
</div>`;

  const ab=Object.fromEntries(m.abil.map(a=>[a.id,a]));
  const colA=`<div class="ocol">
<div class="ob opb"><span class="ttl">BONUS DE MAÎTRISE</span><b class="big">${esc(m.pb)}</b></div>
${abilityBox(ab.for)}${abilityBox(ab.dex)}${abilityBox(ab.con)}
<div class="ob oin"><span class="ttl">INSPIRATION HÉROÏQUE</span><div class="ckbig">${ck()}</div></div></div>`;
  const colB=`<div class="ocol">${abilityBox(ab.int)}${abilityBox(ab.sag)}${abilityBox(ab.cha)}</div>`;
  const tr=m.training;
  const train=`<div class="ob otrain"><span class="ttl">ENTRAÎNEMENTS &amp; MAÎTRISES</span>
<div class="ar"><span class="lb">ARMURES</span>${ck(tr.armor.l)}<span>Légères</span>${ck(tr.armor.i)}<span>Interm.</span>${ck(tr.armor.h)}<span>Lourdes</span>${ck(tr.armor.s)}<span>Boucliers</span></div>
<div class="tl"><span class="lb">ARMES</span><div>${esc(tr.weapons)}</div></div>
<div class="tl"><span class="lb">OUTILS</span><div>${esc(tr.tools)}</div></div>
<div class="leg">✓ maîtrise · ★ expertise</div></div>`;

  const stat4=`<div class="o4">${[['INITIATIVE',m.init],['VITESSE',m.speed],['TAILLE',m.size],['PERCEPTION PASSIVE',m.passive]].map(([t,v])=>`<div class="ob"><span class="ttl">${t}</span><b class="big">${esc(v)}</b></div>`).join('')}</div>`;
  /* jusqu'à 10 lignes : au-delà de 6, la hauteur des lignes diminue pour rester dans l'encadré */
  const list=m.weapons.length>10?[...m.weapons.slice(0,9),{n:'… et '+(m.weapons.length-9)+' autres',att:'',dmg:'',note:''}]:m.weapons;
  const N=Math.max(6,list.length),rows=Array.from({length:N},(_,i)=>list[i]||{});
  const weap=`<div class="ob owp" style="--wr:${Math.min(5.6,40/N).toFixed(2)}mm;--wf:${N>7?'6.2':'7'}pt"><span class="ttl">ARMES &amp; SORTS MINEURS</span><table><thead><tr><th>Nom</th><th>Att. / DD</th><th>Dégâts &amp; Type</th><th>Notes</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.n)}${r.hands?` <small class="wh">${esc(r.hands)}</small>`:''}</td><td>${esc(r.att)}</td><td>${esc(r.dmg)}</td><td>${esc(r.note)}</td></tr>`).join('')}</tbody></table></div>`;
  const fc=featFit(m.classFeat,2,98,62),tCls=fc.t;
  const cf=`<div class="ob ocf"><span class="ttl">CAPACITÉS DE CLASSE</span>${featHTML(m.classFeat,tCls,fc.cut)}</div>`;
  const sp=`<div class="ob osp"><span class="ttl">TRAITS D'ESPÈCE</span><div class="ftx ${featTier(m.speciesFeat,1,46,60)}">${m.speciesFeat.map(t=>`<p>${esc(t)}</p>`).join('')}</div></div>`;
  const fe=`<div class="ob ofe"><span class="ttl">DONS</span>${featHTML(m.feats,featTier(m.feats,1,46,60),0)}</div>`;
  const bottom=`<div class="o2">${sp}${fe}</div>`;
  return `<section class="opage p1">${head}<div class="omain"><div class="oleft">${colA}${colB}${train}</div><div class="oright">${stat4}${weap}${cf}${bottom}</div></div></section>`;
}

/* ---------- Page 2 ---------- */
function page2(m){
  const c=m.cast;
  const left=`<div class="ocast"><div class="ob ocs"><div class="cab"><span class="lb">CARACTÉRISTIQUE D'INCANTATION</span><b>${esc(c.ability)}</b></div>
<div class="crow"><b>${esc(c.mod)}</b><span>MODIFICATEUR D'INCANTATION</span></div><div class="crow"><b>${esc(c.dc)}</b><span>DD DE SAUVEGARDE CONTRE LES SORTS</span></div><div class="crow"><b>${esc(c.atk)}</b><span>BONUS D'ATTAQUE AVEC UN SORT</span></div></div>
<div class="ob osl"><span class="ttl">EMPLACEMENTS DE SORTS</span><div class="slg">${[4,3,3,3,3,2,2,1,1].map((n,i)=>`<div class="slc"><span class="lb">NIVEAU ${i+1}</span><span class="tot">${c.slots[i]||''}</span>${Array.from({length:n},()=>ck()).join('')}</div>`).join('')}</div><div class="slh"><span>Total</span><span>Dépensés</span></div></div></div>`;
  const N=Math.max(31,m.spells.length);
  const rows=Array.from({length:N},(_,i)=>m.spells[i]||{});
  const tbl=`<div class="ob ospl" style="--rh:${(212/N).toFixed(2)}mm"><span class="ttl">SORTS MINEURS &amp; SORTS PRÉPARÉS</span><table><thead><tr><th class="w1">Niveau</th><th>Nom</th><th class="w3">Temps d'incant.</th><th class="w4">Portée</th><th class="w5">C · R · M</th><th class="w6">Notes</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="c">${r.n?(r.lv===0?'0':esc(r.lv)):''}</td><td>${esc(r.n)}</td><td>${esc(r.time)}</td><td>${esc(r.range)}</td><td class="cmr">${r.n?`<span>${ck(r.c)}<em>C</em></span><span>${ck(r.r)}<em>R</em></span><span>${ck(r.m)}<em>M</em></span>`:`<span>${ck()}<em>C</em></span><span>${ck()}<em>R</em></span><span>${ck()}<em>M</em></span>`}</td><td class="nt">${esc(r.note)}</td></tr>`).join('')}</tbody></table></div>`;
  const right=`<div class="oside">
<div class="ob oapp"><span class="ttl">APPARENCE</span><div class="apx"><div class="tx">${esc(m.lookText)}</div></div></div>
<div class="ob ohist"><span class="ttl">HISTOIRE &amp; PERSONNALITÉ</span><div class="stx">${esc(m.story)}</div><div class="al"><span class="lb">ALIGNEMENT</span><div>${esc(m.align)}</div></div></div>
<div class="ob olang"><span class="ttl">LANGUES</span><div class="stx">${esc(m.languages)}</div></div>
<div class="ob oeq"><span class="ttl">ÉQUIPEMENT</span><div class="stx eq ${tier((m.equipItems||[]).reduce((t,i)=>t+Math.max(i.length,24),0)+(m.equipGroups||[]).length*24+m.equip.length,700,1100,1600)}">${(m.equipGroups||[]).map(x=>`<div class="eqg">${esc(x.g)}</div><ul class="eqli">${x.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`).join('')}${m.equip?`<p class="eqn">${esc(m.equip)}</p>`:''}</div><div class="mg"><span class="lb">LIEN AVEC DES OBJETS MAGIQUES</span>${[0,1,2].map(()=>`<div class="mgl">${ck()}</div>`).join('')}</div></div>
<div class="ob ocoin"><span class="ttl">PIÈCES</span><div class="cg">${[['PC',m.copper],['PA',m.silver],['PE',''],['PO',m.gold],['PP','']].map(([k,v])=>`<div class="cn"><span class="lb">${k}</span><b>${esc(v)}</b></div>`).join('')}</div></div>
</div>`;
  return `<section class="opage p2"><div class="o2l">${left}${tbl}</div>${right}</section>`;
}

function officialSheet(m){return `<div class="osheet">${page1(m)}${page2(m)}</div>`;}

/* ---------- Feuille de style (aussi incluse dans la fiche HTML exportée) ---------- */
const OFFICIAL_CSS=`
.osheet{font:7.6pt/1.25 Arial,Helvetica,sans-serif;color:#111;width:198mm;color-scheme:light;text-align:left}
.osheet *{box-sizing:border-box}
.osheet b,.osheet p{margin:0}
.opage{width:198mm;height:254mm;position:relative;overflow:hidden;background:#fff;border:.2mm solid #bbb;margin:0 0 6mm;display:flex;flex-direction:column;gap:2.2mm;break-after:page;page-break-after:always}
.opage:last-child{break-after:auto;page-break-after:auto;margin-bottom:0}
.p2{flex-direction:row}
.ob{border:.35mm solid #222;border-radius:1.8mm;background:#fff;min-width:0;display:flex;flex-direction:column;overflow:hidden}
.ttl{display:block;text-align:center;font-weight:700;font-size:6.6pt;letter-spacing:.05em;padding:1mm 1mm .5mm;margin:0 2mm;border-bottom:.25mm solid #222;text-transform:uppercase;flex:0 0 auto}
.lb{font-size:4.9pt;letter-spacing:.06em;color:#444;text-transform:uppercase}
.big{display:block;text-align:center;font-size:15pt;line-height:1.1;margin:auto 0}
.fl{display:flex;flex-direction:column-reverse;border-bottom:.2mm solid #555;margin:0 2mm;min-height:6.4mm;justify-content:flex-start}
.fl.sm .v{font-size:7pt}
.fl .v{font-size:9pt;font-weight:700;line-height:1.15;padding:0 .5mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fl .lb{padding:0 .5mm}
.ck{display:inline-block;width:3.3mm;height:3.3mm;border:.3mm solid #222;border-radius:.5mm;background:#fff;font-style:normal;font-size:6pt;line-height:2.8mm;text-align:center;font-weight:700;vertical-align:middle;flex:0 0 auto}
/* page 1 */
.oh{display:flex;gap:2.2mm;height:27mm;flex:0 0 auto}
.oname{flex:1 1 auto;justify-content:space-evenly;padding:.5mm 0}
.oname .two{display:flex}.oname .two .fl{flex:1}
.olevel{width:19mm;justify-content:space-evenly;border-radius:50%/42%}
.olevel .fl{text-align:center}
.oac{width:22mm}.oac .big{font-size:19pt}.shd{display:flex;align-items:center;justify-content:center;gap:1mm;padding:0 0 1mm}
.ohp{width:37mm}.hpg{display:flex;flex:1;flex-direction:column;justify-content:space-evenly}
.ohd{width:25mm;justify-content:space-evenly}
.ods{width:24mm}.dsr{display:flex;align-items:center;gap:.8mm;flex:1;padding:0 1.5mm}.dsr .lb{width:8mm}
.omain{display:grid;grid-template-columns:64mm minmax(0,1fr);gap:2.2mm;flex:1 1 auto;min-height:0}
.oleft{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr) 62mm;gap:2.2mm;min-height:0;min-width:0}
.ocol{display:flex;flex-direction:column;gap:2.2mm;min-height:0;min-width:0}
.opb{flex:0 0 15mm}.oin{flex:0 0 20mm}.ckbig{flex:1;display:flex;align-items:center;justify-content:center}.ckbig .ck{width:7mm;height:7mm;line-height:6.4mm;font-size:10pt}
.oab{flex:1 1 0;min-height:0}
.amv{display:flex;align-items:center;justify-content:space-around;padding:1.2mm 1mm;flex:0 0 auto}
.amv .mod{display:flex;flex-direction:column;align-items:center}
.amv .mod b{display:flex;align-items:center;justify-content:center;width:12.5mm;height:12.5mm;border:.35mm solid #222;border-radius:50%;font-size:12pt}
.amv .val{display:flex;flex-direction:column;align-items:center;border:.3mm solid #222;border-radius:1mm;padding:.4mm 2mm;min-width:9mm}
.amv .val b{font-size:9pt}
.sv,.sk{display:flex;align-items:center;gap:1.2mm;padding:.5mm 1.6mm;border-top:.15mm solid #bbb;font-size:7pt;white-space:nowrap}
.sv{border-top:.25mm solid #222}
.sv b{font-weight:700}.num{display:inline-block;min-width:5mm;text-align:center;border-bottom:.2mm solid #555;font-weight:700}
.skls{display:flex;flex-direction:column;justify-content:space-evenly;flex:1}
.skls .sk{flex:1;border-top:.1mm solid #ddd}
.otrain{grid-column:1/3;padding-bottom:1mm}
.otrain .ar{display:flex;align-items:center;gap:.7mm;padding:1mm 1.6mm;border-bottom:.2mm solid #555;font-size:6.4pt;white-space:nowrap}
.otrain .ar .ck{width:2.8mm;height:2.8mm;line-height:2.4mm;font-size:5pt}
.otrain .ar span:not(.lb){margin-right:.6mm}
.otrain .tl{padding:.8mm 2mm 0;flex:1;border-bottom:.2mm solid #555}.otrain .tl:last-of-type{border-bottom:0}
.leg{font-size:5.2pt;color:#555;padding:0 2mm;text-align:right}
.oright{display:flex;flex-direction:column;gap:2.2mm;min-height:0}
.o4{display:grid;grid-template-columns:repeat(4,1fr);gap:2.2mm;height:15mm;flex:0 0 auto}
.o4 .big{font-size:12pt}
.owp{flex:0 0 50mm}
table{border-collapse:collapse;width:100%;table-layout:fixed}
.owp table{flex:1}
.owp th,.ospl th{font-weight:400;font-size:5.4pt;color:#444;text-align:left;text-decoration:underline;padding:.8mm 1.4mm}
.ospl td{vertical-align:bottom}
.owp td{border-bottom:.15mm solid #888;padding:0 1.4mm;font-size:var(--wf,7pt);height:var(--wr,5.2mm);overflow:hidden;white-space:normal;line-height:1.05;vertical-align:middle}
.owp th:nth-child(1){width:32%}.owp th:nth-child(2){width:9%}.owp th:nth-child(3){width:31%}.owp th:nth-child(4){width:28%}.owp .wh{font-size:.78em;color:#555}
.owp td:nth-child(4){font-size:calc(var(--wf,7pt) - .9pt);color:#333}
.ocf{flex:1 1 auto;min-height:0}
.o2{display:grid;grid-template-columns:1fr 1fr;gap:2.2mm;height:55mm;flex:0 0 auto}
.ftx{padding:1.2mm 2mm;overflow:hidden;flex:1}
.ocf .ftx{columns:2;column-gap:3mm}
.ftx p{margin:0 0 .9mm;break-inside:avoid-column}
.t1{font-size:7.6pt}.t2{font-size:6.8pt}.t3{font-size:6.1pt;line-height:1.18}.t4{font-size:5.7pt;line-height:1.15}
/* page 2 */
.o2l{display:flex;flex-direction:column;gap:2.2mm;flex:1 1 auto;min-width:0}
.oside{width:64mm;display:flex;flex-direction:column;gap:2.2mm;flex:0 0 auto}
.ocast{display:flex;gap:2.2mm;height:28mm;flex:0 0 auto}
.ocs{width:50mm;flex:0 0 auto}
.cab{padding:1mm 2mm;border-bottom:.25mm solid #222}.cab b{display:block;font-size:9pt}
.crow{display:flex;align-items:center;gap:2mm;flex:1;padding:0 2mm;border-bottom:.15mm solid #bbb}
.crow:last-child{border-bottom:0}
.crow b{min-width:9mm;text-align:center;border:.3mm solid #222;border-radius:1mm;font-size:9pt;padding:.2mm 0}
.crow span{font-size:5.4pt;font-weight:700;letter-spacing:.03em;line-height:1.1}
.osl{flex:1;position:relative}
.slg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.4mm 1.4mm;padding:1.4mm 1.6mm}
.slc{display:flex;align-items:center;gap:.5mm;flex-wrap:nowrap;min-width:0}
.slc .lb{width:8.2mm;font-size:4.4pt;flex:0 0 auto}.slc .tot{min-width:3.4mm;text-align:center;border-bottom:.2mm solid #555;font-weight:700;font-size:7.5pt;flex:0 0 auto}
.slc .ck{width:2.3mm;height:2.3mm;line-height:2mm;font-size:4.6pt;border-radius:.4mm}
.slh{display:none}
.ospl{flex:1 1 auto;min-height:0}
.ospl table{flex:1}
.ospl td{border-bottom:.15mm solid #888;font-size:6.8pt;padding:0 1.2mm;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.ospl tbody tr{height:var(--rh)}
.ospl .w1{width:11mm}.ospl .w3{width:19mm}.ospl .w4{width:17mm}.ospl .w5{width:22mm}.ospl .w6{width:23mm}
.ospl td.c{text-align:center}
.cmr{overflow:visible!important}
.cmr span{display:inline-flex;align-items:center;gap:.4mm;margin-right:.8mm}
.cmr em{font-style:normal;font-size:5pt;color:#444}
.cmr .ck{width:2.8mm;height:2.8mm;line-height:2.4mm;font-size:5.4pt}
.nt{font-size:6pt!important;color:#333}
.oapp{flex:0 0 28mm}.apx{padding:1.5mm 2mm;flex:1;overflow:hidden}
.apx .tx{font-size:8pt}
.ohist{flex:0 0 62mm}.stx{padding:1.2mm 2mm;white-space:pre-wrap;flex:1;overflow:hidden;font-size:7pt}
.al{padding:0 2mm 1mm}.al div{border-bottom:.2mm solid #555;min-height:4.5mm;font-size:8pt;font-weight:700}
.olang{flex:0 0 20mm}
.oeq{flex:1 1 auto;min-height:0}.stx.eq{flex:1;white-space:normal}.eqli{margin:0;padding:0;list-style:none;column-count:2;column-gap:3mm}.eqli li{break-inside:avoid;padding-left:2.4mm;text-indent:-2.4mm;margin:0 0 .2mm}.eqg{font-weight:700;font-size:.92em;letter-spacing:.02em;text-transform:uppercase;margin:2.2mm 0 .4mm}.eqg:first-child{margin-top:0}.eqli li::before{content:"\\2022\\00a0"}.osheet .stx .eqn{margin:3.5mm 0 0;white-space:pre-wrap;border-top:.2mm solid #777;padding-top:2mm}
.mg{padding:0 2mm 1mm}.mgl{display:flex;align-items:center;border-bottom:.2mm solid #555;height:5mm}
.ocoin{flex:0 0 17mm}
.cg{display:grid;grid-template-columns:repeat(5,1fr);gap:1mm;padding:1mm 2mm;flex:1}
.cn{display:flex;flex-direction:column;align-items:center}.cn b{display:block;width:100%;min-height:7mm;border:.3mm solid #222;border-radius:1mm;text-align:center;font-size:9pt;line-height:7mm}
@media print{
 .opage{border:0;margin:0}
}
`;

Object.assign(NS,{officialSheet,OFFICIAL_CSS});
})();
