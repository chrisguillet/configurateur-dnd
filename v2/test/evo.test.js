const assert=require('assert'),E=require('../js/evo.js');
const base=()=>({id:'a1',name:'Tilla',cls:'barde',level:1,tl:1,mc:[],sub:'',feats:{},spells:{c:['Message'],p:['Sommeil']},cSk:['arcanes'],opt:{},buy:[],goldAdj:0});
// init
let c=E.init(base());assert(E.isEvo(c));assert.deepEqual(E.levels(c),[1]);assert(!('name' in c.evo.niv[1].snap)&&!('id' in c.evo.niv[1].snap));
// niveaux préparés
E.addLevel(c,(x)=>{x.level=2;x.tl=2;x.spells.p.push('Soin');});
E.addLevel(c,(x)=>{x.level=3;x.tl=3;x.sub='danse';});
assert.deepEqual(E.levels(c),[1,2,3]);assert.equal(c.level,3);assert.equal(c.sub,'danse');
// consulter le niveau 1 : l'état est celui du niveau 1
E.project(c,1);assert.equal(c.level,1);assert.deepEqual(c.spells.p,['Sommeil']);assert.equal(c.sub,'');
// modifier le niveau 1 (nouveau sort) : répercuté aux niveaux suivants
c.spells.c.push('Lumière');assert.deepEqual(E.commit(c),[]);
E.project(c,3);assert.deepEqual(c.spells.c,['Message','Lumière']);assert.deepEqual(c.spells.p,['Sommeil','Soin']);assert.equal(c.sub,'danse');
// retirer un sort au niveau 2 (échange) puis conflit : un scalaire changé plus loin n'est pas écrasé mais signalé
E.project(c,3);c.cSk=['arcanes','histoire'];E.commit(c);
E.project(c,1);c.cSk=['athletisme'];const conf=E.commit(c);
assert(conf.includes('cSk')===false);   // tableau de primitifs : ajout/retrait, pas de conflit
E.project(c,3);assert(c.cSk.includes('histoire')&&c.cSk.includes('athletisme')&&!c.cSk.includes('arcanes'));
E.project(c,3);c.opt={x:'a'};E.commit(c);E.project(c,1);c.opt={x:'b'};
const c2=E.commit(c);assert(c2.length>0,'conflit signalé');E.project(c,3);assert.equal(c.opt.x,'a');assert(c.evo.niv[3].warn.length>0);
// niveau en cours + stockage lisible par la V1
E.setCur(c,2);E.project(c,3);const st=E.forStorage(c);assert.equal(st.level,2);assert(!('sub' in st)||st.sub==='');assert.equal(st.mode,'evo');assert.equal(c.level,3,'la fiche en mémoire reste sur le niveau affiché');
assert.equal(st.name,'Tilla');
// transactions
E.txOf(c,1).amt=-50;E.txOf(c,1).add.push({n:'Dague',q:2});E.txOf(c,2).amt=120;E.txOf(c,2).rem.push({n:'Dague',q:1});E.txOf(c,3).add.push({n:'Corde',q:1});
assert.equal(E.gold(c,1),-50);assert.equal(E.gold(c,2),70);assert.equal(E.gold(c,3),70);
assert.deepEqual(E.items(c,2),[{n:'Dague',q:1}]);assert.deepEqual(E.items(c,3),[{n:'Dague',q:1},{n:'Corde',q:1}]);
// reset à partir d'un niveau
assert.equal(E.resetFrom(c,1),false);assert.equal(E.resetFrom(c,2),true);
assert.deepEqual(E.levels(c),[1]);assert.equal(c.evo.max,1);assert.equal(c.evo.cur,1);assert.equal(c.level,1);assert.equal(E.gold(c,5),-50);
// une fiche figée (V1) n'est pas touchée
const f=base();assert(!E.isEvo(f));assert.strictEqual(E.forStorage(f),f);assert.equal(E.commit(f).length,0);assert.equal(E.addLevel(f),0);
// reset avec niveau affiché au-delà : on revient sur le dernier niveau conservé
c=E.init(base());E.addLevel(c,x=>{x.level=2;});E.addLevel(c,x=>{x.level=3;});E.setCur(c,3);E.project(c,3);E.resetFrom(c,2);assert.equal(c.evo.view,1);assert.equal(c.evo.cur,1);

/* plusieurs transactions par niveau + ancien format (une seule transaction) */
{const c2=E.init({cls:'guerrier',level:1,tl:1,spells:{c:[]},name:'x'},1);
 E.txOf(c2,1,0).amt=1;E.txOf(c2,1,0).rem.push({n:'Dague',q:1});E.txOf(c2,1,1).amt=-10;E.txOf(c2,1,1).add.push({n:'Dague',q:1});
 assert.strictEqual(E.txList(c2,1).length,2);assert.strictEqual(E.gold(c2,1),-9);assert.deepStrictEqual(E.items(c2,1),[]);
 const c3=E.init({cls:'guerrier',level:1,tl:1,spells:{c:[]},name:'y'},1);
 c3.evo.niv[1].tx={amt:5,desc:'vieux',add:[{n:'Corde',q:1}],rem:[]};delete c3.evo.niv[1].txs;
 assert.strictEqual(E.txList(c3,1).length,1);assert.strictEqual(E.gold(c3,1),5);assert.ok(!c3.evo.niv[1].tx);}
console.log('evo: tous les tests passent');
