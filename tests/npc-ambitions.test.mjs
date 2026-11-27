import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {npcGoalTypes,npcAmbitionYear,npcAmbitionState,npcAmbitionView,npcAmbitionInheritance,validateNpcAmbitions} from '../src/content/npc-ambitions.mjs';

const update=(s,toAge)=>{
 while(s.age<toAge){
  s.age++;s.actions=3;
  npcAmbitionYear(s,{add:()=>{}});
 }
 return s;
};
function familyLife(seed=118001,ambition='Career success'){
 const s=E.createLife({seed,name:'Alex'});
 s.age=28;s.actions=3;
 const person=s.people[0];
 person.world.ambition=ambition;person.world.trust=65;person.world.rivalry=0;
 person.world.debt=0;person.world.cash=20000;
 npcAmbitionYear(s,{add:()=>{}});
 assert.equal(s.npcAmbitions.active.length,2);
 assert.equal(s.npcAmbitions.active[0].personId,'person-'+person.id);
 assert.ok(E.validate(s));
 return s;
}
const byId=(s,id)=>s.npcAmbitions.active.find(x=>x.personId===id);
const choose=(s,id,index)=>{const command=E.commands(s).find(c=>c.id==='npcgoal:'+id+':'+index);assert.ok(command?.enabled,'missing enabled action '+id);return E.act(s,command.id);};

test('goal catalog covers seven character-led ambitions and old saves remain valid',()=>{
 assert.equal(npcGoalTypes.length,7);
 assert.equal(new Set(npcGoalTypes.map(x=>x.id)).size,7);
 const s=E.createLife({seed:118002});
 assert.equal(s.npcAmbitions.version,1);
 assert.ok(E.validate(s));
 delete s.npcAmbitions;
 assert.ok(E.validate(s));
 assert.deepEqual(E.npcAmbitionView(s).active,[]);
 assert.ok(E.commands(s).some(x=>x.id==='rest'));
});

test('independent relatives begin personalized goals without player RNG or fabricated resources',()=>{
 const s=E.createLife({seed:118003});s.age=28;
 const rng=s.rng,cash=s.cash,stats={...s.stats};
 npcAmbitionYear(s,{add:()=>{}});
 assert.equal(s.rng,rng);
 assert.equal(s.cash,cash);
 assert.deepEqual(s.stats,stats);
 assert.equal(s.npcAmbitions.active.length,2,'at most two NPC introductions in a year');
 assert.ok(s.npcAmbitions.active.every(x=>x.kind==='family'&&x.status==='open'));
 assert.ok(s.npcAmbitions.active.every(x=>x.startedAge===28));
 assert.ok(E.validate(s));
});

test('offering support changes the actual character profile, while independence is truly neutral',()=>{
 const original=familyLife(118004);
 const id=original.npcAmbitions.active[0].id,personId=original.npcAmbitions.active[0].personId;
 const before=JSON.stringify(original);
 const help=choose(original,id,0),challenge=choose(JSON.parse(before),id,1),leave=choose(JSON.parse(before),id,2);
 const p=x=>x.people.find(y=>'person-'+y.id===personId);
 assert.ok(p(help).world.trust>p(challenge).world.trust);
 assert.ok(p(help).bond>p(challenge).bond);
 assert.ok(p(challenge).world.rivalry>p(help).world.rivalry);
 assert.equal(p(leave).world.trust,p(original).world.trust);
 assert.equal(p(leave).world.rivalry,p(original).world.rivalry);
 assert.equal(byId(leave,personId).progress,byId(original,personId).progress);
 assert.equal(byId(help,personId).status,'waiting');
 assert.equal(byId(help,personId).decisions.length,1);
 assert.equal(help.actions,2,'one ordinary activity is consumed');
 assert.equal(help.cash,original.cash);
 assert.equal(help.rng,original.rng);
 assert.equal(JSON.stringify(original),before,'engine actions are immutable');
 for(const s of [help,challenge,leave])assert.ok(E.validate(s));
});

test('the final activity of a year can be spent on a personal goal',()=>{
 const s=familyLife(118005);s.actions=1;
 const id=s.npcAmbitions.active[0].id;
 const result=choose(s,id,0);
 assert.equal(result.actions,0);
 assert.equal(result.npcAmbitions.active[0].decisions.length,1);
 assert.ok(E.validate(result));
});

test('a real financial setback redirects an NPC and permanently changes their economic preferences',()=>{
 const s=familyLife(118006);
 const p=s.people[0],id='person-'+p.id,record=byId(s,id);
 assert.equal(record.track,'career');
 const rng=s.rng;
 p.world.debt=76000;p.world.cash=100;
 update(s,31);
 assert.equal(record.track,'security');
 assert.equal(record.pivots.length,1);
 assert.equal(record.pivots[0].from,'career');
 assert.equal(p.world.ambition,'Financial security');
 assert.ok(record.progress>=0&&record.progress<=100);
 assert.equal(s.rng,rng);
 assert.ok(E.validate(s));
});

test('lost trust redirects ambitious rivals into trying to repair real relationships',()=>{
 const s=familyLife(118007);
 const p=s.people[0],a=s.npcAmbitions.active[0];
 p.world.trust=20;p.world.rivalry=86;
 update(s,30);
 assert.equal(a.track,'repair');
 assert.equal(a.pivots[0].reason,'damaged trust');
 assert.ok(E.validate(s));
});

test('NPCs progress alone for years; missing the invitation never blocks life progression',()=>{
 const s=familyLife(118008),initial=s.npcAmbitions.active[0];
 const prior=s.stats;
 update(s,34);
 assert.ok(s.npcAmbitions.completed.some(x=>x.id===initial.id));
 assert.equal(s.npcAmbitions.completed.find(x=>x.id===initial.id).decisions.length,0);
 assert.deepEqual(s.stats,prior,'NPC ambitions do not silently charge player stats');
 assert.equal(s.npcAmbitions.active.some(x=>x.id===initial.id),false);
 assert.ok(E.commands(s).some(c=>c.id==='rest'));
 assert.ok(E.validate(s));
});

test('NPCs can respond twice over years; no callback or future goal locks the player',()=>{
 let s=familyLife(118009);
 const original=s.npcAmbitions.active[0],id=original.id;
 s=choose(s,id,0);
 assert.equal(s.npcAmbitions.active[0].status,'waiting');
 update(s,original.startedAge+3);
 const arc=s.npcAmbitions.active.find(x=>x.id===id);
 assert.ok(arc?.status==='ready');
 assert.equal(arc.stage,1);
 s=choose(s,id,1);
 assert.equal(s.npcAmbitions.active.find(x=>x.id===id).status,'growing');
 assert.equal(s.npcAmbitions.active.find(x=>x.id===id).decisions.length,2);
 update(s,original.startedAge+5);
 assert.ok(s.npcAmbitions.completed.some(x=>x.id===id));
 assert.equal(s.npcAmbitions.completed.find(x=>x.id===id).decisions.length,2);
 assert.ok(E.validate(s));
});

test('achieved career goals modify the existing NPC career level, not a new imaginary job',()=>{
 const s=familyLife(118010);
 const parent=s.people[0],arc=s.npcAmbitions.active[0];
 parent.world.job=0;parent.world.level=1;parent.world.debt=0;
 arc.progress=95;arc.obstacles=0;
 update(s,arc.startedAge+4);
 assert.equal(s.npcAmbitions.completed.find(x=>x.id===arc.id).ending,'achieved');
 assert.equal(parent.world.job,0);
 assert.equal(parent.world.level,2);
 assert.ok(E.chronicleView(s).timeline.some(x=>x.id==='npc-ambition-'+arc.id));
 assert.ok(E.validate(s));
});

test('financial goals only reduce real debts using money the NPC actually owns',()=>{
 const s=familyLife(118011,'Financial security');
 const p=s.people[0],arc=s.npcAmbitions.active[0];
 p.world.job=0;p.world.cash=10000;p.world.debt=20000;
 arc.progress=97;arc.obstacles=0;
 update(s,arc.startedAge+4);
 assert.equal(arc.track,'security');
 assert.equal(p.world.cash,8000);
 assert.equal(p.world.debt,18000);
 assert.equal(s.npcAmbitions.completed.find(x=>x.id===arc.id).ending,'achieved');
 assert.ok(E.validate(s));
});

test('alumni ambition changes an actual location and remains visible to other story systems',()=>{
 const s=E.createLife({seed:118012,name:'Nina'});s.age=29;
 s.world.autonomy={version:1,alumni:[{id:'alumni-special',name:'Ren',age:29,trust:60,rivalry:10,preference:2,
  connection:'former classmate',status:'friends',profession:'Designer',ambition:'Adventure',
  collaborations:0,contests:0,lastInteractionAge:-1,partnerId:null,children:0,careerLevel:0,
  location:'hometown',history:[],schoolAge:12}],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 npcAmbitionYear(s,{add:()=>{}});
 // Two family goals launch in the first year. The alumni goal is introduced in
 // the following year, preserving the intentional two-introductions/year cap.
 s.age=30;npcAmbitionYear(s,{add:()=>{}});
 const a=s.npcAmbitions.active.find(x=>x.personId==='alumni-special');
 assert.ok(a);assert.equal(a.track,'adventure');
 a.progress=98;a.obstacles=0;
 update(s,34);
 assert.equal(s.world.autonomy.alumni[0].location,'another city');
 assert.equal(s.npcAmbitions.completed.find(x=>x.id===a.id).ending,'achieved');
 assert.ok(s.world.autonomy.alumni[0].history.some(x=>x.kind==='ambition'));
 assert.ok(E.validate(s));
});

test('removed or deceased contacts interrupt unfulfilled ambitions without resurrecting them',()=>{
 const s=familyLife(118013),p=s.people[0],id=s.npcAmbitions.active[0].id;
 p.alive=false;s.age++;
 npcAmbitionYear(s,{add:()=>{}});
 assert.ok(s.npcAmbitions.completed.some(x=>x.id===id&&x.ending==='interrupted'));
 assert.equal(p.alive,false);
 assert.ok(E.validate(s));
});

test('inheritance retains concise NPC stories but not unfinished current-generation actors',()=>{
 const s=familyLife(118014);
 s.npcAmbitions.active[0].progress=98;
 update(s,32);
 const child=E.createLife({seed:118015,name:'Rowan'});
 npcAmbitionInheritance(child,s);
 assert.equal(child.npcAmbitions.active.length,0);
 assert.equal(child.npcAmbitions.completed.length,0);
 assert.equal(child.npcAmbitions.ancestors[0].name,'Alex');
 assert.ok(child.npcAmbitions.ancestors[0].note.includes(s.people[0].name));
 assert.ok(E.validate(child));
});

test('history stays bounded and old saves cannot smuggle invalid stages, identities or outcomes',()=>{
 const s=familyLife(118016),good=JSON.stringify(s);
 assert.ok(validateNpcAmbitions(s.npcAmbitions));
 let broken=JSON.parse(good);broken.npcAmbitions.active[0].progress=-50;
 assert.equal(E.validate(broken),false);
 broken=JSON.parse(good);broken.npcAmbitions.active[0].status='completed';
 assert.equal(E.validate(broken),false);
 broken=JSON.parse(good);broken.npcAmbitions.active.push({...broken.npcAmbitions.active[0]});
 assert.equal(E.validate(broken),false);
 broken=JSON.parse(good);broken.npcAmbitions.news=Array.from({length:31},()=>({age:20,text:'foo'}));
 assert.equal(E.validate(broken),false);
 assert.ok(E.validate(JSON.parse(good)));
});

test('advancing a normal game year initiates goals in the same offline engine',()=>{
 let s=E.createLife({seed:118017,name:'Eli'});s.age=24;
 const beforeRng=s.rng;
 s=E.ageUp(s);
 assert.ok(E.npcAmbitionView(s).active.length>0);
 assert.ok(E.validate(s));
 assert.ok(s.rng!==beforeRng,'the existing world engine still uses its own RNG');
 const next=E.npcAmbitionView(s);
 assert.ok(next.active[0].goal.length>0);
});
