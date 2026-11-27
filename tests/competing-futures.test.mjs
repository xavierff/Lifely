import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {npcAmbitionYear} from '../src/content/npc-ambitions.mjs';
import {competingFuturesYear,competingFuturesView,competingFuturesInheritance,validateCompetingFutures} from '../src/content/competing-futures.mjs';

const note=()=>{};
function life(seed=119001,kind='career'){
 const s=E.createLife({seed,name:'Luca'});s.age=29;s.actions=3;
 const p=s.people[0];
 p.world.trust=65;p.world.rivalry=0;
 p.world.cash=10000;p.world.debt=0;
 if(kind==='career'){
  p.world.ambition='Career success';p.world.job=0;
  s.job={id:0,level:0,experience:0};
 }else if(kind==='security'){
  p.world.ambition='Financial security';p.world.debt=17000;
  s.cash=400;
 }else if(kind==='family'){
  p.world.ambition='Family life';
 }else if(kind==='business'){
  p.world.ambition='Career success';p.world.job=0;
  s.business={sector:'shop',capital:15000,quality:60,demand:52,competition:45};
  // A real former-classmate Founder must already exist to create a business overlap.
  // Reduce the fixture's family cast so alumni goals can launch immediately.
  s.people=[];s.world.autonomy={version:1,alumni:[{
    id:'alumni-founder',name:'Morgan',age:29,trust:67,rivalry:12,preference:2,
    connection:'former classmate',status:'friends',profession:'Founder',ambition:'Career success',
    collaborations:0,contests:0,lastInteractionAge:-1,partnerId:null,children:0,
    careerLevel:1,location:'hometown',history:[],schoolAge:12
  }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 }
 npcAmbitionYear(s,{add:note});
 competingFuturesYear(s,{add:note});
 const match=s.competingFutures.active[0];
 assert.ok(match,'expected a grounded collision');
 assert.equal(match.kind,kind==='security'?'family':kind);
 assert.ok(E.validate(s),'fixture must remain loadable');
 return s;
}
const respond=(s,index)=>{
 const a=s.competingFutures.active[0];
 const c=E.commands(s).find(c=>c.id==='clash:'+a.id+':'+index);
 assert.ok(c?.enabled,'expected enabled collision choice '+index);
 return E.act(s,c.id);
};
function years(s,n,updateGoals=true){
 for(let i=0;i<n;i++){
  s.age++;s.actions=3;
  if(updateGoals)npcAmbitionYear(s,{add:note});
  competingFuturesYear(s,{add:note});
 }
 return s;
}
test('fresh and legacy saves accept optional bounded competing-futures state',()=>{
 const s=E.createLife({seed:119002});
 assert.ok(E.validate(s));
 assert.equal(s.competingFutures.version,1);
 assert.deepEqual(E.competingFuturesView(s).active,[]);
 delete s.competingFutures;
 assert.ok(E.validate(s));
 assert.deepEqual(E.competingFuturesView(s).active,[]);
});
test('a real overlapping NPC profession triggers the exact career collision',()=>{
 const s=life(119003,'career'),a=s.competingFutures.active[0];
 assert.equal(a.kind,'career');
 assert.equal(a.contextId,'0');
 assert.equal(a.personId,'person-'+s.people[0].id);
 assert.equal(a.goalId,s.npcAmbitions.active[0].id);
 assert.equal(a.firstGoal,s.npcAmbitions.active[0].progress);
 assert.ok(E.commands(s).filter(c=>c.id.startsWith('clash:')).length===3);
});
test('support and competition change real career performance and NPC trust differently',()=>{
 const s=life(119004,'career');
 const initial=JSON.stringify(s);
 const help=respond(s,0),compete=respond(JSON.parse(initial),1),neutral=respond(JSON.parse(initial),2);
 const p=x=>x.people[0];
 assert.ok(p(help).world.trust>p(compete).world.trust);
 assert.ok(p(compete).world.rivalry>p(help).world.rivalry);
 assert.equal(help.stats.performance,s.stats.performance+2);
 assert.equal(compete.stats.performance,s.stats.performance+4);
 assert.equal(neutral.stats.performance,s.stats.performance);
 assert.equal(p(neutral).world.trust,p(s).world.trust);
 assert.equal(p(neutral).world.rivalry,p(s).world.rivalry);
 assert.equal(help.npcAmbitions.active[0].progress,s.npcAmbitions.active[0].progress+9);
 assert.equal(help.competingFutures.active[0].status,'waiting');
 assert.equal(help.actions,2);
 assert.equal(help.cash,s.cash);assert.equal(help.rng,s.rng);
 assert.equal(JSON.stringify(s),initial,'E.act returns a copy, never mutates the existing save');
 for(const x of [help,compete,neutral])assert.ok(E.validate(x));
});
test('the last yearly activity can be spent on a collision with the normal action budget',()=>{
 const s=life(119005,'career');s.actions=1;
 const after=respond(s,0);
 assert.equal(after.actions,0);
 assert.equal(after.competingFutures.active[0].decisions.length,1);
 assert.ok(E.validate(after));
});
test('business collaborators affect actual demand, not invented sales or money',()=>{
 const s=life(119006,'business');
 const original=s.business.demand,rng=s.rng,cash=s.cash;
 const partnership=respond(s,0),rivalry=respond(s,1),independent=respond(s,2);
 assert.equal(partnership.business.demand,original+5);
 assert.equal(rivalry.business.demand,original-3);
 assert.equal(independent.business.demand,original);
 assert.equal(partnership.cash,cash);assert.equal(rivalry.cash,cash);
 assert.equal(partnership.rng,rng);
 assert.equal(partnership.world.autonomy.alumni[0].trust,s.world.autonomy.alumni[0].trust+7);
 assert.equal(partnership.npcAmbitions.active[0].progress,s.npcAmbitions.active[0].progress+8);
 for(const x of [partnership,rivalry,independent])assert.ok(E.validate(x));
});
test('family financial assistance is a conserved $200 transfer and can be disabled',()=>{
 const s=life(119007,'security'),p=s.people[0],cash=s.cash,owned=p.world.cash;
 assert.equal(s.competingFutures.active[0].kind,'family');
 const after=respond(s,0);
 assert.equal(after.cash,cash-200);
 assert.equal(after.people[0].world.cash,owned+200);
 assert.equal(after.cash+after.people[0].world.cash,cash+owned);
 assert.equal(after.competingFutures.active[0].decisions[0].cashDelta,-200);
 assert.equal(after.competingFutures.active[0].decisions[0].npcCashDelta,200);
 assert.ok(E.validate(after));
 const poor=life(119008,'security');poor.cash=199;
 const commands=E.commands(poor).filter(c=>c.id.startsWith('clash:'));
 assert.equal(commands[0].enabled,false);
 assert.equal(commands[1].enabled,true);
 assert.equal(commands[2].enabled,true);
 assert.throws(()=>E.act(poor,commands[0].id),/not available/i);
});
test('a neutral family response does not affect bond, NPC goals or statistics',()=>{
 const s=life(119009,'family'),serialized=JSON.stringify(s);
 const neutral=respond(s,2);
 assert.equal(neutral.people[0].bond,s.people[0].bond);
 assert.equal(neutral.people[0].world.trust,s.people[0].world.trust);
 assert.deepEqual(neutral.stats,s.stats);
 assert.equal(neutral.npcAmbitions.active[0].progress,s.npcAmbitions.active[0].progress);
 assert.equal(neutral.competingFutures.active[0].decisions[0].tag,'independent');
 assert.equal(JSON.stringify(s),serialized);
 assert.ok(E.validate(neutral));
});
test('two years later career circumstances reflect independent NPC progress and can end in an alliance',()=>{
 let s=life(119010,'career');
 s=respond(s,0);
 const id=s.competingFutures.active[0].id;
 const before=s.competingFutures.active[0].firstGoal;
 s=years(s,2,false);
 assert.equal(s.competingFutures.active.find(x=>x.id===id)?.status,'ready');
 // The real ambition can independently progress between story beats.
 s.npcAmbitions.active[0].progress=Math.min(95,before+28);
 const view=E.competingFuturesView(s).active.find(x=>x.id===id);
 assert.equal(view.nowGoal,s.npcAmbitions.active[0].progress);
 s=respond(s,0);
 const result=s.competingFutures.completed.find(x=>x.id===id);
 assert.equal(result.ending,'alliance');
 assert.equal(result.decisions.length,2);
 assert.equal(result.decisions[0].phase,'opening');
 assert.equal(result.decisions[1].phase,'followup');
 assert.equal(s.competingFutures.active.length,0);
 assert.ok(E.chronicleView(s).timeline.some(x=>x.id==='competing-futures-'+id));
 assert.ok(E.validate(s));
});
test('changing careers invalidates old overlap rather than inventing a new position',()=>{
 let s=life(119011,'career');s=respond(s,0);
 const oldJob=s.job.id,originalNpcJob=s.people[0].world.job;
 s.job={id:1,level:0,experience:0};
 s=years(s,2,false);
 assert.equal(s.competingFutures.active[0].status,'ready');
 assert.equal(E.competingFuturesView(s).active[0].contextAlive,false);
 s=respond(s,0);
 assert.equal(s.competingFutures.completed.at(-1).ending,'diverged');
 assert.equal(s.job.id,1);
 assert.equal(s.people[0].world.job,originalNpcJob);
 assert.equal(oldJob,0);
 assert.ok(E.validate(s));
});
test('selling the company never produces demand on a business that no longer exists',()=>{
 let s=life(119012,'business');s=respond(s,0);s.business=null;
 s=years(s,2,false);
 assert.equal(E.competingFuturesView(s).active[0].contextAlive,false);
 s=respond(s,0);
 assert.equal(s.business,null);
 assert.equal(s.competingFutures.completed[0].ending,'diverged');
 assert.equal(s.competingFutures.completed[0].decisions[1].businessDelta,0);
 assert.ok(E.validate(s));
});
test('unanswered collisions expire without forced player stat, bond or money changes',()=>{
 const s=life(119013,'family');
 const old=s.competingFutures.active[0],cash=s.cash,stats={...s.stats},bond=s.people[0].bond;
 years(s,3,false);
 assert.ok(s.competingFutures.completed.some(x=>x.id===old.id&&x.ending==='unanswered'));
 assert.deepEqual(s.stats,stats);
 assert.equal(s.cash,cash);assert.equal(s.people[0].bond,bond);
 assert.ok(E.validate(s));
});
test('a missing or deceased NPC interrupts rather than resurrecting a relationship',()=>{
 const s=life(119014,'family'),p=s.people[0],id=s.competingFutures.active[0].id;
 p.alive=false;s.age++;
 competingFuturesYear(s,{add:note});
 assert.equal(s.competingFutures.active.find(x=>x.id===id),undefined);
 assert.equal(s.competingFutures.completed.find(x=>x.id===id).ending,'interrupted');
 assert.equal(p.alive,false);
 assert.ok(E.validate(s));
});
test('completed collisions leave family recaps but not old contacts or pending deals',()=>{
 let s=life(119015,'career');s=respond(s,0);
 s=years(s,2,false);s=respond(s,0);
 const next=E.createLife({seed:119016,name:'Noah'});
 competingFuturesInheritance(next,s);
 assert.equal(next.competingFutures.active.length,0);
 assert.equal(next.competingFutures.completed.length,0);
 assert.equal(next.competingFutures.ancestors[0].name,'Luca');
 assert.match(next.competingFutures.ancestors[0].note,/alliance/);
 assert.ok(E.validate(next));
});
test('duplicate invitations and corrupted money conservation are rejected',()=>{
 const s=life(119017,'security'),before=JSON.stringify(s);
 competingFuturesYear(s,{add:note});
 assert.equal(s.competingFutures.active.length,1);
 assert.ok(validateCompetingFutures(s.competingFutures));
 assert.equal(JSON.stringify(s),before,'same-age duplicate collision must not mutate');
 const used=respond(s,0);
 assert.ok(E.validate(used));
 let malformed=JSON.parse(JSON.stringify(used));
 malformed.competingFutures.active[0].decisions[0].npcCashDelta=400;
 assert.equal(E.validate(malformed),false);
 malformed=JSON.parse(JSON.stringify(s));
 malformed.competingFutures.active.push({...malformed.competingFutures.active[0]});
 assert.equal(E.validate(malformed),false);
 malformed=JSON.parse(JSON.stringify(s));
 malformed.competingFutures.active[0].firstTrust=777;
 assert.equal(E.validate(malformed),false);
 malformed=JSON.parse(JSON.stringify(s));
 malformed.competingFutures.seen=Array.from({length:50},()=>({key:'a',personId:'person-1',age:29}));
 assert.equal(E.validate(malformed),false);
});
test('normal age-up integrates NPC collisions with the existing game lifecycle',()=>{
 const s=life(119018,'career');
 const next=E.ageUp(s);
 assert.ok(E.validate(next));
 assert.ok(Array.isArray(E.competingFuturesView(next).active));
 assert.ok(E.competingFuturesView(next).active.length<=2);
});
