/* Fiche évolutive (V2) : un personnage se construit niveau par niveau.
   Une fiche V1 n'a pas de champ « mode » : elle reste « figée » et se comporte comme avant.
   Une fiche évolutive (c.mode==='evo') garde en plus c.evo :
     c.evo = { v:1, cur:3, view:3, max:5, niv:{ 1:{snap,tx,note,warn}, 2:{…}, … } }
   - snap : l'état complet du personnage à la fin du niveau (tous les champs sauf EXCLUDE) ;
   - tx   : la « transaction » du niveau (montant en po, description, objets qui arrivent / partent) ;
   - cur  : le niveau en cours (tag) ; view : le niveau affiché et modifié ; max : dernier niveau préparé.
   Les champs du personnage (c.level, c.spells…) reflètent toujours le niveau affiché (view) : tout le code de la V1
   (onglets, calculs, validations) continue donc de fonctionner. Quand on modifie un niveau, le différentiel est
   répercuté sur les niveaux suivants (commit) ; un choix déjà changé plus loin n'est pas écrasé mais signalé (warn).
   À l'enregistrement, les champs du haut de la fiche sont ceux du niveau en cours (forStorage) : la V1 lit donc la
   fiche comme une fiche figée de ce niveau. */
(function(root){
'use strict';

/* champs qui ne dépendent pas du niveau ou qui appartiennent à la fiche elle-même */
const EXCLUDE=['id','mt','dir','mode','evo','name','gender','portrait','appearance','story','cdefs','sbdefs','sdef','bdef'];
const clone=o=>o===undefined?undefined:JSON.parse(JSON.stringify(o));
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const prim=v=>v===null||typeof v!=='object';
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

const isEvo=c=>!!(c&&c.mode==='evo'&&c.evo&&c.evo.niv);
const blankTx=()=>({amt:0,desc:'',add:[],rem:[]});
const pick=c=>{const o={};Object.keys(c).forEach(k=>{if(!EXCLUDE.includes(k))o[k]=clone(c[k]);});return o;};

/* ---------- différentiel entre deux états ---------- */
function diff(a,b,path,out){
  out=out||[];path=path||[];
  if(isObj(a)&&isObj(b)){
    new Set([...Object.keys(a),...Object.keys(b)]).forEach(k=>diff(a[k],b[k],path.concat(k),out));
  }else if(Array.isArray(a)&&Array.isArray(b)&&a.every(prim)&&b.every(prim)){
    b.filter(x=>!a.includes(x)).forEach(x=>out.push({t:'add',p:path,val:x}));
    a.filter(x=>!b.includes(x)).forEach(x=>out.push({t:'rem',p:path,val:x}));
  }else if(Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.length&&a.every(isObj)&&b.every(isObj)){
    /* tableaux d'objets de même taille (ex. classes de multiclassage) : comparés entrée par entrée, pour qu'un niveau plus loin qui en compte davantage ne soit pas signalé à tort */
    a.forEach((x,i)=>diff(x,b[i],path.concat(i),out));
  }else if(!eq(a,b))out.push({t:'set',p:path,old:clone(a),val:clone(b)});
  return out;
}
const getAt=(o,p)=>p.reduce((a,k)=>a==null?undefined:a[k],o);
function parentOf(o,p){let a=o;for(let i=0;i<p.length-1;i++){if(!isObj(a[p[i]])&&!Array.isArray(a[p[i]]))a[p[i]]={};a=a[p[i]];}return a;}
/* applique le différentiel à un état ; renvoie les chemins en conflit (déjà modifiés autrement) */
function apply(ops,state){
  const bad=[];
  ops.forEach(op=>{
    const cur=getAt(state,op.p),par=parentOf(state,op.p),k=op.p[op.p.length-1];
    if(op.t==='add'){const arr=Array.isArray(cur)?cur:(par[k]=[]);if(!arr.includes(op.val))arr.push(clone(op.val));}
    else if(op.t==='rem'){if(Array.isArray(cur)){const i=cur.indexOf(op.val);if(i>=0)cur.splice(i,1);}}
    else{
      if(eq(cur,op.old)||cur===undefined&&op.old===undefined){if(op.val===undefined)delete par[k];else par[k]=clone(op.val);}
      else if(!eq(cur,op.val))bad.push(op.p.join('.'));
    }
  });
  return bad;
}

/* ---------- cycle de vie d'une fiche évolutive ---------- */
/* convertit la fiche en fiche évolutive : son état actuel devient le niveau « n » (1 par défaut) */
function init(c,n){
  n=Math.max(1,Math.floor(+n)||1);
  c.mode='evo';
  c.evo={v:1,cur:n,view:n,max:n,niv:{}};
  c.evo.niv[n]={snap:pick(c),txs:[],note:'',warn:[]};
  return c;
}
const levels=c=>isEvo(c)?Array.from({length:c.evo.max},(_,i)=>i+1).filter(n=>c.evo.niv[n]):[];

/* affiche le niveau n : les champs de la fiche prennent l'état de ce niveau */
function project(c,n){
  if(!isEvo(c))return c;
  const L=c.evo.niv[n];if(!L)return c;
  Object.keys(c).forEach(k=>{if(!EXCLUDE.includes(k))delete c[k];});
  Object.assign(c,clone(L.snap));
  c.evo.view=n;
  return c;
}

/* enregistre ce qui a été modifié dans le niveau affiché et le répercute sur les niveaux suivants */
function commit(c){
  if(!isEvo(c))return [];
  const V=c.evo.view,L=c.evo.niv[V];if(!L)return [];
  const next=pick(c),ops=diff(L.snap,next),conflicts=[];
  if(!ops.length)return conflicts;
  L.snap=next;
  /* modifier une valeur dans ce niveau la confirme : l'avertissement correspondant disparaît */
  if((L.warn||[]).length)L.warn=L.warn.filter(w=>!ops.some(op=>{const q=op.p.join('.');return q===w||q.startsWith(w+'.')||w.startsWith(q+'.');}));
  for(let m=V+1;m<=c.evo.max;m++){
    const M=c.evo.niv[m];if(!M)continue;
    const bad=apply(ops,M.snap);
    M.warn=(M.warn||[]).filter(w=>!bad.includes(w)).concat(bad);
    bad.forEach(w=>{if(!conflicts.includes(w))conflicts.push(w);});
  }
  return conflicts;
}

/* prépare le niveau suivant : copie de l'état du dernier niveau, que l'appelant fait progresser (classe choisie…) */
function addLevel(c,advance){
  if(!isEvo(c))return 0;
  commit(c);
  const n=c.evo.max+1,prev=c.evo.niv[c.evo.max];
  c.evo.niv[n]={snap:clone(prev.snap),txs:[],note:'',warn:[]};
  c.evo.max=n;
  if(typeof advance==='function'){project(c,n);advance(c,n);commit(c);}
  return n;
}

/* niveau en cours (tag) */
function setCur(c,n){if(isEvo(c)&&c.evo.niv[n])c.evo.cur=n;return c;}

/* « reset à partir de ce niveau » : supprime la configuration du niveau n et de tous les suivants (n ≥ 2) */
function resetFrom(c,n){
  if(!isEvo(c)||n<2||!c.evo.niv[n])return false;
  for(let m=n;m<=c.evo.max;m++)delete c.evo.niv[m];
  c.evo.max=n-1;
  c.evo.cur=Math.min(c.evo.cur,n-1);
  project(c,Math.min(c.evo.view,n-1));
  return true;
}

/* ---------- transactions d'équipement ---------- */
/* un niveau peut avoir plusieurs transactions ; chacune est un « paquet » : une description, un montant (po)
   et des objets qui arrivent (add) ou partent (rem), ex. vendre une dague 1 po puis en racheter une 10 po */
const txList=(c,n)=>{const L=isEvo(c)&&c.evo.niv[n];if(!L)return null;
  if(!Array.isArray(L.txs))L.txs=[];
  if(L.tx){const t=L.tx;delete L.tx;if(+t.amt||t.desc||(t.add||[]).length||(t.rem||[]).length)L.txs.unshift({amt:+t.amt||0,desc:t.desc||'',add:t.add||[],rem:t.rem||[]});}   /* ancien format : une seule transaction */
  return L.txs;};
const txOf=(c,n,i)=>{const l=txList(c,n);if(!l)return null;i=i||0;while(l.length<=i)l.push(blankTx());return l[i];};
const allTx=c=>levels(c).reduce((o,n)=>o.concat(txList(c,n).map(t=>({n,t}))),[]);
/* ajustements de scores d'un niveau (objet magique, récompense du MJ…) : à part de la transaction, non répercutés par diff */
const adjOf=(c,n)=>{const L=isEvo(c)&&c.evo.niv[n];if(!L)return null;if(!L.adj)L.adj={};return L.adj;};
const adjTotal=(c,n)=>{const t={};if(!isEvo(c))return t;levels(c).filter(m=>m<=n).forEach(m=>{const a=c.evo.niv[m].adj||{};Object.keys(a).forEach(k=>{t[k]=(t[k]||0)+(+a[k]||0);});});return t;};
const hasAdj=(c,n)=>{const a=isEvo(c)&&c.evo.niv[n]&&c.evo.niv[n].adj;return !!a&&Object.values(a).some(v=>+v);};
/* total des montants (po) des transactions des niveaux 1..n */
const gold=(c,n)=>allTx(c).filter(x=>x.n<=n).reduce((t,x)=>t+(+x.t.amt||0),0);
/* objets ajoutés (+) / retirés (−) par les transactions des niveaux 1..n, regroupés par nom */
function items(c,n){
  const m=new Map();
  allTx(c).filter(x=>x.n<=n).forEach(({t})=>{
    (t.add||[]).forEach(x=>m.set(x.n,(m.get(x.n)||0)+(+x.q||1)));
    (t.rem||[]).forEach(x=>m.set(x.n,(m.get(x.n)||0)-(+x.q||1)));});
  return [...m].filter(([,q])=>q!==0).map(([n,q])=>({n,q}));
}

/* version enregistrée : le haut de la fiche est l'état du niveau en cours (lisible par la V1) */
function forStorage(c){
  if(!isEvo(c))return c;
  commit(c);
  const o=clone(c),L=o.evo.niv[o.evo.cur];
  if(L&&o.evo.view!==o.evo.cur){Object.keys(o).forEach(k=>{if(!EXCLUDE.includes(k))delete o[k];});Object.assign(o,clone(L.snap));}
  return o;
}

const API={EXCLUDE,isEvo,init,levels,project,commit,addLevel,setCur,resetFrom,txList,txOf,blankTx,adjOf,adjTotal,hasAdj,gold,items,forStorage,diff,apply,pick};
if(typeof module==='object'&&module.exports)module.exports=API;
else{const NS=root.DND=root.DND||{};NS.EVO=API;}
})(typeof window!=='undefined'?window:globalThis);
