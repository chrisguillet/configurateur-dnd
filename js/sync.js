/* Synchronisation des personnages avec un dossier Google Drive (« Configurateur DnD », un fichier .json par personnage).
   Accès limité aux fichiers créés par l'application (scope drive.file) : le même compte retrouve le même dossier sur tous les appareils.
   Fusion par personnage, le plus récent gagne (champ c.mt, en ms). La logique (plan/run) ne connaît pas Google : elle parle à un « adaptateur »
   {list():[{fileId,cid,mt}], get(fileId):texte, put(char,fileId|null):{fileId}, trash(fileId)}, ce qui permet de la tester avec un faux Drive. */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const SKEY='dnd24-sync-v1',FOLDER='Configurateur DnD',SCOPE='https://www.googleapis.com/auth/drive.file';

const fresh=()=>({cid:'',fid:'',known:{},tomb:{},last:0,acct:''});
function state(){try{const s=JSON.parse(localStorage.getItem(SKEY));return Object.assign(fresh(),s&&typeof s==='object'?s:{});}catch(x){return fresh();}}
function save(s){try{localStorage.setItem(SKEY,JSON.stringify(s));}catch(x){}}
const clientId=()=>String((window.DND_SYNC&&window.DND_SYNC.googleClientId)||state().cid||'').trim();
const fromConfig=()=>!!String((window.DND_SYNC&&window.DND_SYNC.googleClientId)||'').trim();
function setClientId(v){const s=state();s.cid=String(v||'').trim();save(s);}
/* personnages supprimés ici : on s'en souvient pour supprimer aussi le fichier du Drive à la prochaine synchro */
function tomb(ids){if(!ids||!ids.length)return;const s=state(),t=Date.now();ids.forEach(id=>{s.tomb[id]=t;});save(s);}
function forget(){const s=state();save(Object.assign(fresh(),{cid:s.cid}));}

/* ---------- Plan de fusion (pur) ---------- */
/* local : Map id→mt ; remote : Map id→{mt} ; st : {known,tomb}. Renvoie [{op:'up'|'down'|'delLocal'|'delRemote'|'clear',id}] */
function plan(local,remote,st){
  const ops=[],ids=new Set([...local.keys(),...remote.keys(),...Object.keys(st.tomb||{})]);
  ids.forEach(id=>{
    const L=local.get(id),R=remote.get(id),T=(st.tomb||{})[id],K=(st.known||{})[id];
    if(T!==undefined&&L===undefined){                       /* supprimé ici */
      if(R){ops.push({op:R.mt>T?'down':'delRemote',id});}else ops.push({op:'clear',id});
      return;
    }
    if(L!==undefined&&!R){ops.push({op:K!==undefined&&L<=K?'delLocal':'up',id});return;}   /* supprimé ailleurs si déjà synchronisé et non modifié depuis */
    if(L===undefined&&R){ops.push({op:'down',id});return;}
    if(L!==undefined&&R){if(R.mt>L)ops.push({op:'down',id});else if(L>R.mt)ops.push({op:'up',id});}
  });
  return ops;
}

/* Exécute la synchro. chars : personnages locaux. Renvoie {down:[chars à écrire ici], delLocal:[ids], stats:{up,down,del}} ; l'appelant applique le local. */
async function run(chars,adapter){
  const st=state(),now=Date.now();
  chars.forEach(c=>{if(!c.mt)c.mt=now;});
  const local=new Map(chars.map(c=>[c.id,c.mt])),byId=new Map(chars.map(c=>[c.id,c]));
  const remote=new Map();(await adapter.list()).forEach(f=>{if(f.cid)remote.set(f.cid,{fileId:f.fileId,mt:+f.mt||0});});
  const ops=plan(local,remote,st),out={down:[],delLocal:[],stats:{up:0,down:0,del:0}};
  for(const o of ops){
    const R=remote.get(o.id);
    if(o.op==='up'){const c=byId.get(o.id);const r=await adapter.put(c,R?R.fileId:null);st.known[o.id]=c.mt;out.stats.up++;}
    else if(o.op==='down'){const c=JSON.parse(await adapter.get(R.fileId));if(!c||typeof c!=='object'||c.id!==o.id)continue;c.mt=R.mt;out.down.push(c);st.known[o.id]=R.mt;delete st.tomb[o.id];out.stats.down++;}
    else if(o.op==='delRemote'){await adapter.trash(R.fileId);delete st.tomb[o.id];delete st.known[o.id];out.stats.del++;}
    else if(o.op==='delLocal'){out.delLocal.push(o.id);delete st.known[o.id];out.stats.del++;}
    else if(o.op==='clear'){delete st.tomb[o.id];delete st.known[o.id];}
  }
  st.last=Date.now();save(st);
  return out;
}

/* ---------- Google Drive ---------- */
const API='https://www.googleapis.com/drive/v3',UP='https://www.googleapis.com/upload/drive/v3';
function loadGis(){return new Promise((ok,ko)=>{
  if(window.google&&google.accounts&&google.accounts.oauth2)return ok();
  const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.onload=()=>ok();
  s.onerror=()=>ko(new Error('Google est injoignable (hors ligne ?).'));document.head.appendChild(s);});}
/* hint : adresse du compte déjà utilisé, pour que Google ne réaffiche pas le choix de compte à chaque synchro */
function token(cid,hint){return new Promise((ok,ko)=>{
  const tc=google.accounts.oauth2.initTokenClient({client_id:cid,scope:SCOPE,
    callback:r=>r.error?ko(new Error(r.error_description||r.error)):ok(r.access_token),
    error_callback:e=>ko(new Error(e&&e.type==='popup_closed'?'Connexion annulée.':'Connexion Google impossible ('+((e&&e.type)||'popup')+').'))});
  tc.requestAccessToken(hint?{prompt:'',hint:hint}:{prompt:''});});}
/* adresse du compte connecté (Drive « about », autorisé avec le scope drive.file) */
async function accountOf(tok){const r=await fetch(API+'/about?fields=user(emailAddress)',{headers:{Authorization:'Bearer '+tok}});if(!r.ok)return'';const j=await r.json();return String((j.user&&j.user.emailAddress)||'');}
const slug=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,40);
function googleAdapter(tok){
  const H=h=>Object.assign({Authorization:'Bearer '+tok},h||{});
  async function api(url,opt){const r=await fetch(url,Object.assign({},opt,{headers:H(opt&&opt.headers)}));
    if(!r.ok){const t=await r.text().catch(()=>'');throw new Error('Drive '+r.status+(t?' : '+t.replace(/\s+/g,' ').slice(0,140):''));}return r;}
  let fid=state().fid;
  async function folder(){
    if(fid){try{const r=await(await api(API+'/files/'+fid+'?fields=id,trashed')).json();if(r&&!r.trashed)return fid;}catch(x){if(!/Drive 404/.test(String(x.message)))throw x;}fid='';}
    const q=encodeURIComponent("name='"+FOLDER+"' and mimeType='application/vnd.google-apps.folder' and trashed=false");
    const l=await(await api(API+'/files?q='+q+'&orderBy=createdTime&fields=files(id)&pageSize=5')).json();
    fid=l.files&&l.files[0]?l.files[0].id:(await(await api(API+'/files?fields=id',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:FOLDER,mimeType:'application/vnd.google-apps.folder'})})).json()).id;
    const s=state();s.fid=fid;save(s);return fid;
  }
  const multipart=(meta,content)=>{const b='dnd'+Math.random().toString(36).slice(2);return{type:'multipart/related; boundary='+b,body:'--'+b+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+b+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+content+'\r\n--'+b+'--'};};
  return{
    async list(){const f=await folder(),out=[];let pt='';
      do{const q=encodeURIComponent("'"+f+"' in parents and trashed=false");
        const r=await(await api(API+'/files?q='+q+'&fields=nextPageToken,files(id,appProperties)&pageSize=200'+(pt?'&pageToken='+pt:''))).json();
        (r.files||[]).forEach(x=>{const p=x.appProperties||{};if(p.cid)out.push({fileId:x.id,cid:p.cid,mt:+p.mt||0});});pt=r.nextPageToken||'';}while(pt);
      return out;},
    async get(id){return(await api(API+'/files/'+id+'?alt=media')).text();},
    async put(c,fileId){const f=await folder(),meta={name:(slug(c.name)||'personnage')+'-'+c.id+'.json',appProperties:{cid:c.id,mt:String(c.mt||0)}};
      if(!fileId)meta.parents=[f];const m=multipart(meta,JSON.stringify(c,null,1));
      const r=await api(UP+'/files'+(fileId?'/'+fileId:'')+'?uploadType=multipart&fields=id',{method:fileId?'PATCH':'POST',headers:{'Content-Type':m.type},body:m.body});
      return{fileId:(await r.json()).id};},
    async trash(id){await api(API+'/files/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({trashed:true})});}
  };
}
/* Connexion (fenêtre Google au besoin) + synchro. À appeler depuis un clic. */
async function syncGoogle(chars){
  const cid=clientId();if(!cid)throw new Error('Identifiant client Google manquant.');
  await loadGis();const tok=await token(cid,state().acct);
  const a=await accountOf(tok).catch(()=>'');
  if(a&&a!==state().acct){const s=state();s.acct=a;save(s);}
  return run(chars,googleAdapter(tok));
}

NS.sync={state,save,clientId,fromConfig,setClientId,tomb,forget,plan,run,syncGoogle,googleAdapter,SKEY};
})();
