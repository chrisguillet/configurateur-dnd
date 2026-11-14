/* « Passeport d'aventurier » en tête de la fiche : portrait, nom, espèce, alignement, classe(s), niveau, PV, CA, initiative, maîtrise,
   caractéristiques, et pictogrammes des armures et armes maîtrisées.
   Fonction pure (données déjà calculées → HTML) : aucune dépendance à l'état de l'application.
   Les couleurs viennent des variables des thèmes (clair, sombre, médiéval), avec une valeur de repli pour la fiche exportée. */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const T=s=>(window.DNDI&&DNDI.T)?DNDI.T(s):s;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

/* Pictogrammes : trait de 1,8 sur une grille de 24, couleur héritée */
const P={
  light:['M8 3.500L3.500 7l2.500 4 2-1V20.500h8V10l2 1 2.500-4L16 3.500c-.8 1.700-2.200 2.500-4 2.500s-3.200-.8-4-2.500z'],
  medium:['M8 3.500L3.500 7l2.500 4 2-1V20.500h8V10l2 1 2.500-4L16 3.500c-.8 1.700-2.200 2.500-4 2.500s-3.200-.8-4-2.500z','M9.500 13.500h5','M9.500 17h5'],
  heavy:['M5 12.500a7 7 0 0 1 14 0V20H5z','M5 12.500h14','M12 12.500V20','M9 16h.01','M15 16h.01'],
  shield:['M12 3l7.500 2.800v5.700c0 4.600-3.200 7.600-7.500 9.500-4.300-1.900-7.500-4.900-7.500-9.500V5.800z','M12 7.500v9'],
  simple:['M13.500 10.500L4.500 19.500','M12.500 8a3.500 3.500 0 1 0 7 0 3.500 3.500 0 1 0-7 0','M3.500 20.500h.01'],
  martial:['M4 4l9.500 9.500','M20 4l-9.500 9.500','M7.500 12.500l4 4','M16.500 12.500l-4 4','M9.500 14.500L5 19','M14.500 14.500L19 19']
};
const ico=k=>`<svg class="idc-ic" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k].map(d=>`<path d="${d}"/>`).join('')}</svg>`;

const item=(k,label,state,note)=>{
  const st=state==='on'?T('maîtrisé'):state==='part'?T('maîtrisé en partie'):T('non maîtrisé');
  return `<li class="${state}" title="${esc(label+' : '+st+(note?' ('+note+')':''))}">${ico(k)}<span class="idc-cap">${esc(label)}</span>${state==='part'?`<em>${esc(note||T('limité'))}</em>`:''}</li>`;
};

/* Données attendues :
   {name, imgHtml, iconHtml, sub (espèce), bg (historique), langs (texte), level, multi, classes:[{icon,name,level,sub}], abil:[{k,s,mod,ex}], vits:[{l,v,x}] (PV, CA, initiative…), align,
    armor:{l,i,h,s}, weapons:{simple:bool, martial:''|'full'|'part', note}}  (x : attribut d'infobulle déjà échappé) */
function idCard(m){
  const ex=m.ex||{};
  const pic=m.imgHtml?m.imgHtml:`<span class="idc-fallback">${m.iconHtml||''}</span>`;
  const fld=(label,val,cls)=>`<div class="idc-f${cls?' '+cls:''}"><small>${label}</small><div>${val}</div></div>`;
  const cls=m.classes||[];
  const clsHtml=cls.map(k=>`<div class="idc-c">${k.icon||''}<span>${esc(k.name)}</span>${m.multi?` <b>${esc(k.level)}</b>`:''}${k.sub?`<em>${esc(k.sub)}</em>`:''}</div>`).join('');
  const vit=v=>`<div class="idc-v"${v.x||''}><small><span class="lg">${esc(v.l)}</span><span class="sh">${esc(v.s||v.l)}</span></small><b>${esc(v.v)}</b></div>`;
  const abil=m.abil.map(a=>`<div class="idc-a"${a.ex||''}><small>${esc(a.k)}</small><div><b>${esc(a.s)}</b><span class="sl">/</span><i>${esc(a.mod)}</i></div></div>`).join('');
  const a=m.armor||{},w=m.weapons||{};
  const armors=[item('light',T('Légère'),a.l?'on':'off'),item('medium',T('Interm.'),a.i?'on':'off'),item('heavy',T('Lourde'),a.h?'on':'off'),item('shield',T('Bouclier'),a.s?'on':'off')].join('');
  const weapons=[item('simple',T('Courantes'),w.simple?'on':'off'),item('martial',T('De guerre'),w.martial==='full'?'on':w.martial==='part'?'part':'off',w.note)].join('');
  return `<section class="idcard${m.noprint?' noprint':''}" aria-label="${esc(T("Carte d'identité"))}">`
   +`<header class="idc-head"><span>${T("Passeport d'aventurier")}</span><span class="idc-lv">${T('Niveau')} <b>${esc(m.level)}</b></span></header>`
   +`<div class="idc-pic">${pic}</div>`
   +`<div class="idc-who">${fld(T('Nom'),`<h2 class="idc-name">${esc(m.name)}</h2>`,'idc-fn')}</div>`
   +`<div class="idc-fields">`
     +fld(cls.length>1?T('Classes'):T('Classe'),clsHtml,'idc-fc')
     +fld(T('Espèce'),esc(m.sub||'—'))
     +fld(T('Historique'),m.bg?esc(m.bg):'—')
     +fld(T('Alignement'),m.align?esc(m.align):`<span class="muted">${T('non précisé')}</span>`)
     +fld(T('Langues'),m.langs?esc(m.langs):'—')
   +`</div>`
   +`<div class="idc-vits${(m.vits||[]).length>8?' many':''}">${(m.vits||[]).map(vit).join('')}</div>`
   +`<div class="idc-abil">${abil}</div>`
   +`<div class="idc-prof"><div class="idc-pg"><h3>${T('Armures')}</h3><ul>${armors}</ul></div><div class="idc-pg"><h3>${T('Armes')}</h3><ul>${weapons}</ul></div></div>`
   +(m.fam?`<div class="idc-fam"><div class="idc-ft"><small>${esc(m.fam.title)}</small><span>${esc(m.fam.sub)}</span></div><div class="idc-vits idc-fv">${m.fam.vits.map(vit).join('')}</div></div>`:'')
   +`</section>`;
}

const CSS=`
.idcard{position:relative;display:grid;grid-template-columns:auto 1fr;grid-template-areas:"head head" "pic who" "pic fields" "vits vits" "abil abil" "prof prof" "fam fam";column-gap:20px;margin:.4rem 0 1rem;padding:0 18px 12px;border:1px solid var(--gold,#A9822B);border-radius:var(--radc,12px);background:var(--surface,#fff);box-shadow:var(--frame,none);color:var(--ink,#1B2238);overflow:hidden;break-inside:avoid}
.idc-lv{padding:1px 10px;border:1px solid rgba(255,255,255,.55);border-radius:var(--pillr,999px);background:rgba(255,255,255,.15);letter-spacing:.14em}
.idc-lv b{font-family:var(--serif,Georgia,serif);font-size:1rem;letter-spacing:0;margin-left:3px}
.idc-head{grid-area:head;display:flex;align-items:center;justify-content:space-between;margin:0 -18px 14px;padding:7px 18px;background:var(--accent,#1F6F63) repeating-linear-gradient(135deg,rgba(255,255,255,.07) 0 2px,transparent 2px 9px);color:var(--accent-ink,#fff);font-size:.72rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;font-family:var(--sans,system-ui,sans-serif)}
.idc-pic{grid-area:pic;position:relative;width:132px;min-height:150px;align-self:stretch;border-radius:6px;overflow:hidden;display:grid;place-items:center;border:2px solid var(--gold,#A9822B);box-shadow:0 0 0 3px var(--surface,#fff),0 0 0 4px var(--line,#bbb);margin:3px;background:var(--hi,#e1eeeb);color:var(--accent,#1F6F63)}
.idcard .idc-pic img,.idcard .pimg.idc-img{position:absolute;inset:0;display:block;width:100%;height:100%;margin:0;border:0;border-radius:0;object-fit:cover}
.idc-fallback .ic{width:60px;height:60px}
.idc-who{grid-area:who;min-width:0}
.idc-fields{grid-area:fields;min-width:0;display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;align-content:start;margin-top:6px}
.idc-f{min-width:0}
.idc-f>small,.idc-v>small,.idc-a>small{display:block;white-space:nowrap;font-size:.66rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#555);font-family:var(--sans,system-ui,sans-serif)}
.idc-f>div{margin-top:1px;font-size:.95rem;line-height:1.25;overflow-wrap:anywhere}
.idcard .idc-name{margin:0;padding:0;border:0;font-family:var(--display,Georgia,serif);font-variant:small-caps;font-size:1.75rem;line-height:1.1;font-weight:700}
.idc-c{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.idc-c .ic{width:18px;height:18px;color:var(--accent,#1F6F63);flex:none}
.idc-c b{font-family:var(--serif,Georgia,serif);color:var(--accent,#1F6F63)}
.idc-c em{font-style:normal;font-size:.85rem;color:var(--muted,#555)}
.idc-fc{grid-column:1/-1}
.idc-fc>div{display:flex;flex-wrap:wrap;gap:6px 8px}
.idc-fc .idc-c{padding:2px 12px 2px 8px;border:1px solid var(--gold,#A9822B);border-radius:var(--pillr,999px);background:var(--bg,#f4f4f4)}
.idc-f .muted{color:var(--muted,#555)}
.idc-vits{grid-area:vits;display:flex;flex-wrap:wrap;gap:1px;margin-top:10px;border-top:1px solid var(--line,#bbb);border-bottom:1px solid var(--line,#bbb);background:var(--line,#bbb)}
.idc-v{flex:1 1 70px;min-width:0;box-sizing:border-box;padding:6px 4px;text-align:center;background:var(--surface,#fff)}
.idc-v b{display:block;font-family:var(--serif,Georgia,serif);font-size:1.1rem;line-height:1.25;white-space:nowrap}
.idc-abil{grid-area:abil;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));padding:6px 0;border-bottom:1px solid var(--line,#bbb)}
.idc-a{text-align:center;padding:0 2px}
.idc-a>div{font-size:.85rem;color:var(--muted,#555);white-space:nowrap}
.idc-a b{font-family:var(--serif,Georgia,serif);font-size:1.1rem;color:var(--ink,#1B2238)}
.idc-a .sl{margin:0 .22em;opacity:.5}
.idc-a i{font-style:normal;position:relative;top:.14em;font-size:.9em}
.idc-prof{grid-area:prof;display:grid;grid-template-columns:1fr 1fr;margin-top:10px}
.idc-pg{display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 8px}
.idc-pg+.idc-pg{border-left:1px solid var(--line,#bbb)}
.idcard .idc-prof h3{margin:0;padding:0;font-size:.66rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#555);font-family:var(--sans,system-ui,sans-serif)}
.idcard .idc-prof h3::before{content:none}
.idc-prof ul{list-style:none;display:flex;justify-content:center;flex-wrap:wrap;gap:4px 14px;margin:0;padding:0}
.idc-prof li{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;color:var(--accent,#1F6F63);cursor:default}
.idc-prof .idc-ic{width:22px;height:22px}
.idc-cap{font-size:.62rem;letter-spacing:.04em;color:var(--muted,#555);white-space:nowrap}
.idc-prof li em{font-style:normal;font-size:.62rem;color:var(--muted,#555)}
.idc-prof li.off{opacity:.3;color:var(--muted,#555)}
.idc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.idc-fam{grid-area:fam;margin-top:10px;padding:8px 0 0;border-top:1px solid var(--line,#bbb)}
.idc-prof{border-bottom:0}
.idc-ft{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 10px;margin-bottom:6px}
.idc-ft small{font-size:.66rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#555);font-family:var(--sans,system-ui,sans-serif)}
.idc-ft span{font-family:var(--serif,Georgia,serif);font-size:1rem}
.idc-fv{margin-top:0;border:1px solid var(--line,#bbb);border-radius:8px;overflow:hidden}
.idc-v .sh{display:none}
@media (max-width:560px){
 .idcard{column-gap:12px;padding:0 12px 10px}
 .idc-head{margin:0 -12px 10px;padding:6px 12px;font-size:.66rem;letter-spacing:.16em}
 .idc-pic{width:104px;min-height:130px}
 .idcard .idc-name{font-size:1.35rem}
 .idc-who .idc-f>small,.idc-fields .idc-f>small{font-size:.58rem;letter-spacing:.1em}
 .idc-fields{gap:4px 10px;margin-top:4px}
 .idc-f>div{font-size:.84rem}
 .idc-fc>div{gap:4px 6px}
 .idc-fc .idc-c{padding:1px 9px 1px 6px;gap:4px}
 .idc-c .ic{width:15px;height:15px}
 .idc-vits{flex-wrap:nowrap;margin-top:8px}
 .idc-fv{margin-top:0}
 .idc-ft span{font-size:.9rem}
 .idc-vits.many{flex-wrap:wrap}
 .idc-vits.many .idc-v{flex:1 1 22%}
 .idc-v{flex:1 1 0;padding:5px 1px}
 .idc-v .lg{display:none}.idc-v .sh{display:inline}
 .idc-v>small{font-size:.54rem;letter-spacing:.03em}
 .idc-v b{font-size:.98rem}
 .idc-a>div{font-size:.74rem}
 .idc-a b{font-size:.98rem}
 .idc-a>small{letter-spacing:.06em}
 .idc-prof .idc-ic{width:18px;height:18px}
 .idc-pg{padding:0 3px}
 .idc-prof ul{gap:3px 6px}
 .idc-cap,.idc-prof li em{font-size:.52rem;letter-spacing:0}
 .idcard .idc-prof h3{font-size:.58rem}
}
@media print{.idcard{box-shadow:none}}
`;

/* La feuille de style est ajoutée une seule fois à la page ; la fiche exportée la reprend via NS.IDCARD_CSS */
try{const st=document.createElement('style');st.id='idcard-css';st.textContent=CSS;(document.head||document.documentElement).appendChild(st);}catch(_){}

NS.idCard=idCard;NS.IDCARD_CSS=CSS;
})();
