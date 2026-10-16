/* Rendu des sorts : fonctions pures (données → HTML), sans accès à l'état de l'application */
(function(){
'use strict';
const NS=window.DND;
const {dmgIcon}=NS;
const e=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const lvHead=l=>l===0?'Sorts mineurs':'Niveau '+l;
const compTxt=c=>c.split('').join(', ');

/* Pastille « Dégâts » : icônes des types (2 au plus) + libellé court */
function dmgText(s){
  if(!s.dmg)return '';
  if(s.dcreature&&!s.dtypes.length)return 'créature';
  if(s.dweapon&&!s.dtypes.length)return 'arme';
  if(s.dtypes.length<=2)return s.dtypes.join(', ')+(s.dcreature?' (créature)':'');
  return s.dtypes.length+' types';
}
function dmgTag(s){
  if(!s.dmg)return '';
  const ics=(s.dtypes.length?s.dtypes.slice(0,2).map(t=>dmgIcon(t,14)).join(''):dmgIcon('generic',14));
  return `<span class="tg dg">${ics}Dégâts · ${e(dmgText(s))}</span>`;
}
function dmgDetail(s){
  if(!s.dmg)return 'Aucun';
  const t=s.dtypes.length?s.dtypes.join(', '):'';
  return [t,s.dweapon?(t?'ou ':'')+"selon l'arme":'',s.dcreature?'infligés par la créature invoquée':''].filter(Boolean).join(' · ');
}

/* Ligne de résumé : dégâts, école, temps d'incantation, portée, avec pastilles Conc. / Rituel */
function meta(s){
  return e(s.school)+' · '+e(s.time.raw)+' · '+e(s.range)+dmgTag(s)+
    (s.conc?'<span class="tg">Conc.</span>':'')+(s.rit?'<span class="tg">Rituel</span>':'');
}

/* Fiche détaillée (grimoire) : ligne repliable */
function detailRow(s){
  return `<details class="sd"><summary><span class="srn">${e(s.n)}</span><span class="srm">${e(s.lv===0?'Sort mineur':'Niveau '+s.lv)} · ${meta(s)}</span></summary>
<div class="sdb"><dl>
<dt>Incantation</dt><dd>${e(s.time.raw)}</dd>
<dt>Portée</dt><dd>${e(s.range)}</dd>
<dt>Composantes</dt><dd>${e(compTxt(s.comp))}</dd>
<dt>Durée</dt><dd>${e(s.dur)}</dd>
<dt>Dégâts</dt><dd>${e(dmgDetail(s))}</dd>
<dt>Classes</dt><dd>${s.cls.map(e).join(', ')}</dd>
<dt>Nom anglais</dt><dd>${e(s.vo)}${s.alt.length?' · autre traduction : '+s.alt.map(e).join(', '):''}</dd>
</dl><a class="sdl" href="${e(s.url)}" target="_blank" rel="noopener">Lire le texte du sort sur AideDD</a></div></details>`;
}

/* Ligne de sélection (onglet Sorts d'un personnage) : bouton bascule + lien vers la fiche */
function pickRow(s,on,lock){
  const dis=lock&&!on;   /* déjà acquis autrement : grisé, sauf si le joueur l'a choisi avant (il peut alors le retirer) */
  const note=lock?(on?'Déjà acquis ('+lock+') : à retirer de vos choix · ':'Déjà acquis : '+lock+' · '):(on?'Choisi · ':'');
  return `<div class="sr${on?' on':''}${dis?' lock':''}"><button type="button" class="srb" data-a="togs" data-p="${s.lv===0?'c':'p'}" data-v="${e(s.n)}" aria-pressed="${on?'true':'false'}"${dis?' disabled':''}><span class="srn">${e(s.n)}</span><span class="srm">${e(note)}${meta(s)}</span></button><a class="sri" href="${e(s.url)}" target="_blank" rel="noopener" aria-label="Lire ${e(s.n)} sur AideDD">Fiche</a></div>`;
}

/* Regroupe par niveau (la liste est déjà triée) et n'affiche que les `limit` premières lignes */
function grouped(list,limit,rowFn,fold){
  const tot={},by={};list.forEach(s=>{tot[s.lv]=(tot[s.lv]||0)+1;});
  let n=0;
  for(const s of list){
    if(n>=limit)break;
    (by[s.lv]=by[s.lv]||[]).push(rowFn(s));n++;
  }
  let h='';
  Object.keys(by).map(Number).sort((a,b)=>a-b).forEach(lv=>{
    const k='l:'+(fold?fold.ctx:'x')+':'+lv,shut=fold&&fold.closed&&fold.closed.has(k);
    h+=`<details class="lv"${shut?'':' open'} data-gk="${k}"><summary class="gh">${lvHead(lv)}<span class="count">${tot[lv]}</span></summary><div class="srl">${by[lv].join('')}</div></details>`;
  });
  return{html:h,shown:n};
}

/* Bloc de résultats : compteur, niveaux repliables, bouton « Afficher la suite ». */
function results(list,limit,rowFn,moreAction,fold){
  if(!list.length)return'<p class="muted" role="status">Aucun sort ne correspond. Essayez moins de filtres ou une autre orthographe.</p>';
  const g=grouped(list,limit,rowFn,fold);
  let h=`<div class="lvbar"><p class="small muted" role="status">${list.length} sort${list.length>1?'s':''}${g.shown<list.length?' · '+g.shown+' affichés':''}</p>${fold?`<span><button type="button" class="btn small" data-a="sfold" data-v="1" data-c="${fold.ctx}">Tout déplier</button> <button type="button" class="btn small" data-a="sfold" data-v="0" data-c="${fold.ctx}">Tout replier</button></span>`:''}</div>`+g.html;
  if(g.shown<list.length)h+=`<div style="margin-top:12px"><button type="button" class="btn" data-a="${moreAction}">Afficher la suite (${list.length-g.shown} de plus)</button></div>`;
  return h;
}

Object.assign(NS,{V:{detailRow,pickRow,results,lvHead}});
})();
