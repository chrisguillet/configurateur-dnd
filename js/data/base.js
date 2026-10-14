/* Tables de règles communes et petits utilitaires */
(function(){
'use strict';
const NS=window.DND=window.DND||{};

const AB=['for','dex','con','int','sag','cha'];
const ABN={for:'Force',dex:'Dextérité',con:'Constitution',int:'Intelligence',sag:'Sagesse',cha:'Charisme'};
const ABS={for:'FOR',dex:'DEX',con:'CON',int:'INT',sag:'SAG',cha:'CHA'};
const SK=[['acrobaties','Acrobaties','dex'],['arcanes','Arcanes','int'],['athletisme','Athlétisme','for'],['discretion','Discrétion','dex'],['dressage','Dressage','sag'],['escamotage','Escamotage','dex'],['histoire','Histoire','int'],['intimidation','Intimidation','cha'],['intuition','Intuition','sag'],['investigation','Investigation','int'],['medecine','Médecine','sag'],['nature','Nature','int'],['perception','Perception','sag'],['persuasion','Persuasion','cha'],['religion','Religion','int'],['representation','Représentation','cha'],['survie','Survie','sag'],['tromperie','Tromperie','cha']];
const SKM={};SK.forEach(s=>SKM[s[0]]={n:s[1],a:s[2]});
const INSTR=['Chalemie','Cor','Cornemuse','Flûte','Flûte de pan','Luth','Lyre','Tambour','Tympanon','Viole'];

const SLOTS=[[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]];
const PREP_BARDE=[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];
const OCC_SLOTS=[[],[],[2],[3],[3],[3],[4,2],[4,2],[4,2],[4,3],[4,3],[4,3],[4,3,2],[4,3,2],[4,3,2],[4,3,3],[4,3,3],[4,3,3],[4,3,3,1],[4,3,3,1]];
const OCC_PREP=[0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13];
const RAGES=[2,2,3,3,3,4,4,4,4,4,4,4,5,5,5,5,5,6,6,6];
const RAGEDMG=L=>L<9?2:L<16?3:4;
const MANIF=[1,3,3,3,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10];
const PACT=[[1,1],[2,1],[2,2],[2,2],[2,3],[2,3],[2,4],[2,4],[2,5],[2,5],[3,5],[3,5],[3,5],[3,5],[3,5],[3,5],[4,5],[4,5],[4,5],[4,5]];
const PREP_OCC=[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15];
const CANT_OCC=L=>L<4?2:L<10?3:4;
const PREP_CLERC=[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];
const PREP_ENS=[2,4,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];
const cantN=(L,a,b,c)=>L<4?a:L<10?b:c;
const e=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const G=(o,c)=>typeof o==='string'?o:(o[c.gender]||o.m);
const mod=v=>Math.floor((v-10)/2);
const sg=n=>(n>=0?'+':'−')+Math.abs(n);
const uid=()=>Math.random().toString(36).slice(2,9);
const get=(o,p)=>p.split('.').reduce((a,k)=>a==null?a:a[k],o);
const setp=(o,p,v)=>{const ks=p.split('.');let a=o;for(let i=0;i<ks.length-1;i++){if(a[ks[i]]==null)a[ks[i]]={};a=a[ks[i]];}a[ks[ks.length-1]]=v;};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const roll4=()=>{const d=[0,0,0,0].map(()=>1+Math.floor(Math.random()*6)).sort((x,y)=>y-x);return{v:d[0]+d[1]+d[2],d};};
const metaCount=L=>L<2?0:L<10?2:L<17?4:6;
const expCount=L=>L<2?0:L<9?2:4;
const BARDDIE=L=>L<5?6:L<10?8:L<15?10:12;

Object.assign(NS,{AB,ABN,ABS,SK,SKM,INSTR,SLOTS,PREP_BARDE,OCC_SLOTS,OCC_PREP,RAGES,RAGEDMG,MANIF,PACT,PREP_OCC,CANT_OCC,PREP_CLERC,PREP_ENS,cantN,e,G,mod,sg,uid,get,setp,clamp,roll4,metaCount,expCount,BARDDIE});
})();
