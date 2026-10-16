/* Attaques simples : armes portées et sorts mineurs qui font des dégâts.
   Fonctions pures : le contexte du personnage (modificateurs, maîtrise, styles de combat…) entre, des lignes de tableau
   sortent. Les armes viennent du catalogue (weapons-db.js), les sorts mineurs de la base des sorts. */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const {WEAPON_ROWS,fold,ABS}=NS;

/* ---------- Catalogue ---------- */
const nrm=s=>fold(s).split(' ').filter(Boolean).map(w=>w.replace(/[sx]$/,'')).join(' ');   /* sans accents ni pluriel */
const WEAPONS=WEAPON_ROWS.map(r=>{
  const[id,n,cat,dist,dice,dt,props,thrown,vers,ammo,mastery]=r;
  return{id,n,cat,ranged:dist===1,dice,dt,props,thrown,vers,ammo,mastery,key:nrm(n)};
});
const WBYID=new Map(WEAPONS.map(w=>[w.id,w]));
const BYLEN=[...WEAPONS].sort((a,b)=>b.key.length-a.key.length);   /* « lance d'arçon » avant « lance » */
const weaponById=id=>WBYID.get(id)||null;

/* Armes citées dans un texte d'équipement (« 2 dagues, épée à deux mains… »). Les focaliseurs, même en forme de bâton, ne sont pas des armes. */
function weaponsInText(text){
  let t=' '+nrm(String(text||'').replace(/focaliseur[^,]*/gi,' '))+' ';
  const out=[];
  for(const w of BYLEN){const k=' '+w.key+' ';let n=0;while(t.includes(k)){n++;t=t.replace(k,' ');}if(n)out.push(w);}
  if(t.includes(' baton '))out.push(WBYID.get('baton-de-combat'));   /* « Bâton » (historique Sage) = bâton de combat */
  return out.filter((w,i,a)=>w&&a.indexOf(w)===i);
}

/* ---------- Maîtrises d'armes ---------- */
/* ligne de maîtrises d'une classe (« Armes courantes · Armes de guerre (Finesse ou Légère) · … ») */
function weaponProf(profText){
  const r={simple:false,martial:'none'};   /* martial : none | all | light | finlight */
  String(profText||'').split(' · ').map(x=>x.trim()).forEach(p=>{
    if(/^Armes courantes et de guerre$/i.test(p)){r.simple=true;r.martial='all';}
    else if(/^Armes courantes et armes de guerre Légères$/i.test(p)){r.simple=true;if(r.martial!=='all')r.martial='light';}
    else if(/^Armes courantes$/i.test(p))r.simple=true;
    else if(/^Armes de guerre \(Finesse ou Légère\)$/i.test(p)){if(r.martial!=='all')r.martial='finlight';}
    else if(/^Armes de guerre$/i.test(p))r.martial='all';
  });
  return r;
}
const isProf=(w,pr)=>w.cat===0?pr.simple:(pr.martial==='all'||(pr.martial==='light'&&w.props.includes('Légère'))||(pr.martial==='finlight'&&(w.props.includes('Légère')||w.props.includes('Finesse'))));

/* ---------- Lignes du tableau ---------- */
const sgn=n=>n>=0?'+'+n:'−'+Math.abs(n);
const PL={contondant:'contondants',perforant:'perforants',tranchant:'tranchants'};
const SHORT={'Deux mains':'2 mains','Chargement':'Charg.'};   /* libellés courts : la colonne Notes de la fiche est étroite */
const rng=r=>{const m=/^(\d+)\/(\d+)$/.exec(r||'');return m&&+m[1]<+m[2]?m[1]+'/'+m[2]+' m':'';};   /* une portée incohérente n'est pas affichée */

/* ctx : {mod:{for,dex…}, pb, prof, styles:[noms de dons de style], monk:bool (arts martiaux actifs), martialDie} */
function weaponRow(w,ctx){
  const{mod,pb,prof,styles,monk,martialDie}=ctx;
  const melee=!w.ranged,two=w.props.includes('Deux mains');
  const monkW=monk&&melee&&!w.props.includes('Deux mains')&&!w.props.includes('Lourde')&&(w.cat===0||w.props.includes('Légère'));
  let ab=w.ranged?'dex':'for';
  if(w.props.includes('Finesse')||monkW)ab=mod.dex>mod.for?'dex':'for';
  const m=mod[ab],proficient=isProf(w,prof);
  const att=m+(proficient?pb:0)+(w.ranged&&styles.includes('Archerie')?2:0);
  /* arme Polyvalente : on affiche les deux options (une main / deux mains), pour pouvoir poser ou reprendre le bouclier en cours de partie */
  const mDie=d=>{if(monkW){const f=+(/d(\d+)/.exec(d)||[0,0])[1];if(martialDie>f)return '1d'+martialDie;}return d;};
  const fmtD=(d,b)=>/^\d+$/.test(d)?String(+d+b):d+(b?sgn(b):'');
  const duel=melee&&!two&&styles.includes('Duel')?2:0;
  const one=fmtD(mDie(w.dice),m+duel),two2=w.vers&&melee?fmtD(mDie(w.vers),m):'';
  const dmg=two2&&two2!==one?one+' / '+two2:one;
  const note=[];
  if(!proficient)note.push('non maîtrisée');
  if(ctx.wm&&ctx.wm.has(w.id)&&w.mastery)note.push('Botte : '+w.mastery);
  w.props.forEach(p=>{
    if(p==='Lancer'){const r=rng(w.thrown);note.push('Lancer'+(r?' '+r:'')+(styles.includes('Arme de lancer')?' (+2 dégâts)':''));}
    else if(p==='Munitions'){const r=rng(w.ammo);note.push('Munit.'+(r?' '+r:''));}
    else if(p!=='Polyvalente'&&p!=='Deux mains')note.push(SHORT[p]||p);
  });
  return{n:w.n,hands:w.vers&&melee?'1 ou 2 mains':two?'2 mains':'',att:sgn(att),dmg:dmg+' '+(PL[w.dt]||w.dt),note:note.join(' · ')};
}

/* Frappe à mains nues : Force + maîtrise, 1 + Force en dégâts contondants ; le moine sans armure utilise Dextérité et son dé d'Arts martiaux */
function unarmedRow(ctx){
  const{mod,pb,monk,martialDie,dance}=ctx;
  /* Collège de la Danse sans armure ni bouclier : Dextérité, dégâts contondants = dé d'Inspiration bardique + Dex (le dé n'est pas dépensé) */
  if(dance)return{n:'Frappe à mains nues',att:sgn(mod.dex+pb),dmg:'1d'+dance+(mod.dex?sgn(mod.dex):'')+' contondants',note:'Dégâts bardiques · Dex · dé non dépensé'};
  const ab=monk&&mod.dex>mod.for?'dex':'for',m=mod[ab];
  return{n:'Frappe à mains nues',att:sgn(m+pb),dmg:(monk?'1d'+martialDie+(m?sgn(m):''):String(1+m))+' contondants',note:monk?'Arts martiaux · action bonus en plus':''};
}

/* Sort mineur qui fait des dégâts : s = fiche du sort (base des sorts), ctx + ab (caractéristique d'incantation de ce sort) */
function cantripRow(s,ctx,ab){
  const{mod,pb,level:L}=ctx;
  const sm=mod[ab],atk=sm+pb,dc=8+sm+pb;
  const n=1+(L>=5?1:0)+(L>=11?1:0)+(L>=17?1:0);
  const info=s.atk||{k:'',ab:'',dice:''};
  const mt=/^(\d+)d(\d+)$/.exec(info.dice||'');
  const scaled=mt?(+mt[1]*n)+'d'+mt[2]:'';
  const types=s.dtypes.length>2?'au choix':s.dtypes.join(', ');
  let a='',dmg='',note=[s.time.raw.replace(/ ou rituel/i,''),s.range].filter(Boolean);
  if(info.k==='a')a=sgn(atk);
  else if(info.k==='s')a='DD '+dc+' '+(ABS[info.ab]||'');
  switch(s.id){
    case 'decharge-occulte':dmg=n+'×1d10 force';note.push(n>1?n+' rayons':'1 rayon');break;
    case 'glas':dmg=scaled+' ('+n+'d12 si blessée) nécrotiques';break;
    case 'eruption-ensorcelee':dmg=scaled+' (type au choix)';note.push('relancer les 8');break;
    case 'coup-au-but':a=sgn(atk);dmg='arme'+(sm?sgn(sm):'')+(L>=5?' + '+(L>=17?3:L>=11?2:1)+'d6 radiants':'');note=['avec l\'arme du lancer','caract. d\'incantation'];break;
    case 'crosse-des-druides':{const die=L>=17?'2d6':L>=11?'d12':L>=5?'d10':'d8';a=sgn(atk);dmg=die+(sm?sgn(sm):'')+' force';note=['gourdin ou bâton','corps à corps'];break;}
    default:dmg=scaled+' '+types;
  }
  return{n:s.n,att:a,dmg:dmg.trim(),note:note.join(' · ')};
}

Object.assign(NS,{WEAPONS,weaponById,weaponsInText,weaponProf,isProf,weaponRow,unarmedRow,cantripRow});
})();
