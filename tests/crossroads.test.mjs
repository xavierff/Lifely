import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {ensureNetwork} from '../src/content/relationships.mjs';
import {crossroadsYear,crossroadsView,crossroadsInheritance,validateCrossroads} from '../src/content/social-crossroads.mjs';

function openCrossroad(seed=11701,status='rivals'){
 const s=E.createLife({seed,name:'Rina'});s.age=24;s.actions=3;
 const n=ensureNetwork(s);
 const key='person-1|person-2';
 n.edges.push({key,a:'person-1',b:'person-2',firstMetAge:15,trust:status==='allies'?78:status==='betrayed'?27:41,
  loyalty:status==='allies'?76:50,status,betrayals:status==='betrayed'?1:0,
  years:4,memories:[]});
 n.news.push({age:s.age,kind:status,text:'A living relationship changed.',between:['person-1','person-2']});
 const log=[];
 crossroadsYear(s,{add:(_s,message)=>log.push(message)});
 assert.equal(s.crossroads.open.length,1);
 assert.equal(log.length,1);
 assert.equal(s.crossroads.open[0].sourceStatus,status);
 assert.ok(E.validate(s),'new invitation must be loadable');
 return s;
}
const action=(s,index,stage='respond')=>E.commands(s).find(x=>x.id.startsWith('cross:'+stage+':')&&x.id.endsWith(':'+index));
const reply=(s,index,stage='respond')=>{
 const c=action(s,index,stage);assert.ok(c?.enabled,'expected available action for '+stage);
 return E.act(s,c.id);
};

test('new saves have bounded social crossroads and legacy saves remain valid',()=>{
 const s=E.createLife({seed:11702});assert.ok(E.validate(s));
 assert.equal(E.crossroadsView(s).open.length,0);
 assert.equal(s.crossroads.version,1);
 delete s.crossroads;
 assert.ok(E.validate(s));
 assert.deepEqual(E.crossroadsView(s).open,[]);
 assert.ok(E.commands(s).some(c=>c.id==='rest'&&c.enabled));
});

test('real autonomous NPC rivalry creates one optional invitation without an RNG call or free money',()=>{
 const s=openCrossroad(11703);
 assert.equal(s.crossroads.open[0].kind,'rivalry');
 assert.equal(s.crossroads.open[0].source,'network');
 assert.equal(E.crossroadsView(s).open[0].nowStatus,'rivals');
 const cash=s.cash,rng=s.rng,stats={...s.stats};
 crossroadsYear(s,{add:()=>{}});
 assert.equal(s.crossroads.open.length,1,'no duplicate invite in same year');
 assert.equal(s.rng,rng);assert.equal(s.cash,cash);assert.deepEqual(s.stats,stats);
 assert.equal(E.commands(s).filter(c=>c.id.startsWith('cross:respond:')).length,3);
});

test('mediation and taking sides change actual NPC relationships in opposite directions',()=>{
 const s=openCrossroad(11704),json=JSON.stringify(s);
 const a=reply(s,0),b=reply(JSON.parse(json),1),c=reply(JSON.parse(json),2);
 const network=x=>x.world.network.edges[0];
 assert.ok(network(a).trust>network(b).trust);
 assert.ok(network(a).rivalry<network(b).rivalry);
 assert.equal(network(c).trust,network(s).trust,'respecting independence does not create trust');
 assert.equal(network(c).rivalry,network(s).rivalry,'respecting independence does not create rivalry');
 assert.ok(a.people[1].world.trust>b.people[1].world.trust);
 assert.equal(a.actions,2);
 assert.equal(a.crossroads.open[0].status,'waiting');
 assert.equal(a.crossroads.open[0].steps.length,1);
 assert.equal(a.crossroads.open[0].steps[0].trust,10);
 assert.equal(b.crossroads.open[0].steps[0].trust,-5);
 assert.equal(JSON.stringify(s),json,'act returns a new save');
 assert.equal(a.rng,s.rng,'decision path uses no RNG');
 assert.equal(a.cash,s.cash,'NPC actions do not create money');
 for(const x of [a,b,c])assert.ok(E.validate(x));
});

test('years apart preserve autonomous changes, then playable followup leads to real ending',()=>{
 let s=openCrossroad(11705,'allies');
 s=reply(s,0);
 const due=s.crossroads.open[0].dueAge;
 // Both NPCs continue changing outside the player actions.
 s.world.network.edges[0].trust=89;
 s.age=due;s.actions=3;
 const notices=[];
 crossroadsYear(s,{add:(_s,txt)=>notices.push(txt)});
 assert.equal(s.crossroads.open[0].status,'ready');
 assert.equal(E.crossroadsView(s).open[0].nowTrust,89);
 assert.equal(notices.length,1,'one returned invitation announcement');
 const before=s.stats.social;
 s=reply(s,0,'follow');
 assert.equal(s.crossroads.open.length,0);
 assert.equal(s.crossroads.completed.length,1);
 assert.equal(s.crossroads.completed[0].ending,'alliance');
 assert.equal(s.crossroads.completed[0].steps.length,2);
 assert.equal(s.stats.social,Math.min(100,before+3));
 assert.equal(s.world.network.edges[0].trust,100);
 assert.ok(E.chronicleView(s).timeline.some(x=>x.id.startsWith('crossroads-')));
 assert.ok(E.validate(s));
});

test('not participating never blocks aging or changes stats, and unanswered stories end honestly',()=>{
 let s=openCrossroad(11706),stats={...s.stats},cash=s.cash,rng=s.rng;
 assert.equal(s.pending,null);assert.ok(E.commands(s).some(c=>c.id==='rest'));
 s.age+=4;
 crossroadsYear(s,{add:()=>{}});
 assert.equal(s.crossroads.open.length,0);
 assert.equal(s.crossroads.completed[0].ending,'unanswered');
 assert.equal(s.crossroads.completed[0].steps.length,0);
 assert.deepEqual(s.stats,stats);
 assert.equal(s.cash,cash);assert.equal(s.rng,rng);
 assert.ok(E.validate(s));
 s=openCrossroad(11707);
 s=reply(s,2);
 stats={...s.stats};const due=s.crossroads.open[0].dueAge;
 s.age=due;crossroadsYear(s,{add:()=>{}});
 assert.equal(s.crossroads.open[0].status,'ready');
 s.age=due+4;crossroadsYear(s,{add:()=>{}});
 assert.equal(s.crossroads.completed[0].ending,'unanswered');
 assert.equal(s.crossroads.completed[0].steps.length,1);
 assert.deepEqual(s.stats,stats);
 assert.ok(E.validate(s));
});

test('a disappeared participant interrupts the story instead of reviving a person',()=>{
 const s=openCrossroad(11708,'betrayed');
 s.people[1].alive=false;s.age++;
 crossroadsYear(s,{add:()=>{}});
 assert.equal(s.crossroads.open.length,0);
 assert.equal(s.crossroads.completed[0].ending,'interrupted');
 assert.equal(s.people[1].alive,false);
 assert.ok(E.validate(s));
});

test('an old betrayal can be observed without a fabricated reconciliation',()=>{
 let s=openCrossroad(11709,'betrayed');
 s=reply(s,2);
 s.age=s.crossroads.open[0].dueAge;s.actions=3;
 crossroadsYear(s,{add:()=>{}});
 s=reply(s,2,'follow');
 assert.equal(s.crossroads.completed[0].ending,'observed');
 assert.equal(s.world.network.edges[0].status,'betrayed');
 assert.equal(s.world.network.edges[0].trust,27);
 assert.ok(E.validate(s));
});

test('social opportunities are bounded and do not multiply for the same link',()=>{
 const s=openCrossroad(11710),original=s.crossroads.open[0];
 for(let n=0;n<12;n++){
  s.age=24+n;s.actions=3;
  crossroadsYear(s,{add:()=>{}});
  assert.ok(s.crossroads.open.length<=3);
  assert.ok(s.crossroads.completed.length<=24);
  assert.ok(s.crossroads.seen.length<=48);
 }
 assert.ok(s.crossroads.completed.some(x=>x.id===original.id));
 assert.ok(E.validate(s));
});

test('the next generation inherits a story recap but not old relationship IDs or invites',()=>{
 let s=openCrossroad(11711,'allies');
 s=reply(s,0);
 s.age=s.crossroads.open[0].dueAge;s.actions=3;
 crossroadsYear(s,{add:()=>{}});
 s=reply(s,0,'follow');
 const child=E.createLife({seed:11712,name:'Sasha'});
 crossroadsInheritance(child,s);
 assert.equal(child.crossroads.open.length,0);
 assert.equal(child.crossroads.completed.length,0);
 assert.equal(child.crossroads.ancestors[0].name,'Rina');
 assert.match(child.crossroads.ancestors[0].note,/alliance/);
 assert.ok(E.validate(child));
});

test('corrupt crossroads histories are rejected while valid completed records roundtrip',()=>{
 let s=openCrossroad(11713);s=reply(s,0);
 assert.ok(validateCrossroads(s.crossroads));
 assert.ok(E.validate(JSON.parse(JSON.stringify(s))));
 const forged=JSON.parse(JSON.stringify(s));
 forged.crossroads.open[0].steps[0].statusAfter='X'.repeat(500);
 assert.equal(E.validate(forged),false);
 const forged2=JSON.parse(JSON.stringify(s));
 forged2.crossroads.open[0].steps.push({...forged2.crossroads.open[0].steps[0]});
 assert.equal(E.validate(forged2),false);
 const forged3=JSON.parse(JSON.stringify(s));
 forged3.crossroads.open[0].status='completed';
 assert.equal(E.validate(forged3),false);
});

test('social crossroads hooks into the normal age-up loop without extra RNG or forced activities',()=>{
 let s=E.createLife({seed:11714});s.age=23;s.actions=3;
 const n=ensureNetwork(s),key='person-1|person-2';
 n.edges.push({key,a:'person-1',b:'person-2',trust:65,loyalty:65,status:'friends',
  firstMetAge:19,betrayals:0,years:3,memories:[]});
 s=E.ageUp(s);
 const x=E.crossroadsView(s);
 assert.ok(Array.isArray(x.open));
 assert.ok(E.validate(s));
 // The exact autonomous event selected by the older world engine remains stochastic.
 // The new system must not require a response or change the pending random-event gate.
 if(s.pending!==null)s=E.resolve(s,0);
 assert.ok(E.validate(s));
});
