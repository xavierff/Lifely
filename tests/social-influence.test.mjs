import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {npcAmbitionYear} from '../src/content/npc-ambitions.mjs';
import {competingFuturesYear} from '../src/content/competing-futures.mjs';
import {socialInfluenceYear,socialInfluenceInheritance,socialInfluenceView,validateSocialInfluence}
 from '../src/content/social-influence.mjs';

const note=()=>{};
function fixture(seed=120001,kind='professional',negative=false){
 let s=E.createLife({seed,name:'Kai'});
 s.age=29;s.actions=3;
 const p=s.people[0];p.world.trust=65;p.world.rivalry=negative?65:0;
 p.world.cash=9000;p.world.debt=0;
 if(kind==='professional'){
  p.world.ambition='Career success';p.world.job=0;s.job={id:0,level:0,experience:0};
 }else{
  p.world.ambition='Family life';
 }
 npcAmbitionYear(s,{add:note});
 competingFuturesYear(s,{add:note});
 assert.equal(s.competingFutures.active.length,1);
 const original=s.competingFutures.active[0],index=negative?1:0;
 s=E.act(s,'clash:'+original.id+':'+index);
 s.age+=2;s.actions=3;
 competingFuturesYear(s,{add:note});
 assert.equal(s.competingFutures.active[0].status,'ready');
 s=E.act(s,'clash:'+original.id+':'+index);
 assert.equal(s.competingFutures.completed.length,1);
 socialInfluenceYear(s,{add:note});
 assert.ok(E.validate(s),'fixture must remain valid');
 return s;
}
function choose(s,index){
 const item=s.socialInfluence.active;
 assert.ok(item,'there must be an offer');
 const cmd=E.commands(s).find(x=>x.id==='influence:'+item.id+':'+index);
 assert.ok(cmd?.enabled,'expected enabled opportunity '+index);
 return E.act(s,cmd.id);
}
test('new saves start with separate, bounded influence circles; old saves remain valid',()=>{
 const s=E.createLife({seed:120002});
 assert.deepEqual(s.socialInfluence.scores,{family:50,professional:50,community:50});
 assert.equal(s.socialInfluence.active,null);
 assert.ok(E.validate(s));
 delete s.socialInfluence;
 assert.ok(E.validate(s));
 assert.equal(E.socialInfluenceView(s).standing.family.effective,50);
 assert.equal(E.socialInfluenceCommands(s).length,0);
});
test('earned career alliances from actual NPC decisions produce professional standing and a real opportunity',()=>{
 const s=fixture(120003,'professional');
 const a=s.socialInfluence.active;
 assert.equal(s.competingFutures.completed[0].ending,'alliance');
 assert.equal(s.socialInfluence.scores.professional,60);
 assert.equal(s.socialInfluence.scores.family,50);
 assert.equal(s.socialInfluence.scores.community,50);
 assert.equal(a.group,'professional');
 assert.equal(a.tone,'invitation');
 assert.equal(a.personId,'person-'+s.people[0].id);
 assert.equal(s.socialInfluence.signals[0].id,'clash:'+s.competingFutures.completed[0].id);
 assert.ok(E.validate(s));
});
test('family compromises improve family influence, without also inventing workplace success',()=>{
 const s=fixture(120004,'family');
 assert.equal(s.socialInfluence.active.group,'family');
 assert.equal(s.socialInfluence.scores.family,60);
 assert.equal(s.socialInfluence.scores.professional,50);
 assert.equal(s.socialInfluence.scores.community,50);
 assert.ok(E.validate(s));
});
test('real rivalries damage professional standing and produce accountability instead of a prize',()=>{
 const s=fixture(120005,'professional',true);
 assert.equal(s.competingFutures.completed[0].ending,'rivals');
 assert.equal(s.socialInfluence.scores.professional,38);
 assert.equal(s.socialInfluence.active.tone,'repair');
 assert.equal(s.socialInfluence.active.group,'professional');
 assert.ok(E.commands(s).some(x=>x.id.startsWith('influence:')));
 assert.ok(E.validate(s));
});
test('an earned introduction improves existing NPC trust, player performance, and standing',()=>{
 const s=fixture(120006,'professional'),base=JSON.stringify(s);
 const person=s.people[0],before=s.socialInfluence.scores.professional;
 const next=choose(s,0);
 assert.equal(next.actions,s.actions-1);
 assert.equal(next.rng,s.rng);
 assert.equal(next.cash,s.cash);
 assert.equal(next.people[0].world.trust,person.world.trust+8);
 assert.equal(next.people[0].world.rivalry,Math.max(0,person.world.rivalry-4));
 assert.equal(next.stats.performance,Math.min(100,s.stats.performance+3));
 assert.equal(next.socialInfluence.scores.professional,before+5);
 assert.equal(next.socialInfluence.completed.at(-1).ending,'earned');
 assert.equal(next.socialInfluence.completed.at(-1).choice.scoreDelta,5);
 assert.ok(E.chronicleView(next).timeline.some(x=>x.id==='social-influence-'+next.socialInfluence.completed[0].id));
 assert.equal(JSON.stringify(s),base,'original state is immutable');
 assert.ok(E.validate(next));
});
test('choosing independence is strictly neutral across actual stats, NPC profiles, cash and influence',()=>{
 const s=fixture(120007,'family'),old=JSON.stringify(s);
 const next=choose(s,2);
 assert.deepEqual(next.stats,s.stats);
 assert.deepEqual(next.people,s.people);
 assert.equal(next.cash,s.cash);
 assert.deepEqual(next.socialInfluence.scores,s.socialInfluence.scores);
 assert.equal(next.socialInfluence.completed[0].ending,'independent');
 assert.equal(next.socialInfluence.completed[0].choice.scoreDelta,0);
 assert.equal(next.actions,s.actions-1);
 assert.equal(JSON.stringify(s),old);
 assert.ok(E.validate(next));
});
test('one action remains sufficient when the player has only one activity left',()=>{
 const s=fixture(120008,'professional');s.actions=1;
 const n=choose(s,0);
 assert.equal(n.actions,0);assert.ok(E.validate(n));
});
test('an accountability choice genuinely repairs an existing rivalry, not a fictitious one',()=>{
 const s=fixture(120009,'professional',true);
 const p=s.people[0],score=s.socialInfluence.scores.professional;
 const next=choose(s,0);
 assert.ok(next.people[0].world.trust>p.world.trust);
 assert.equal(next.people[0].world.rivalry,p.world.rivalry-7);
 assert.equal(next.socialInfluence.scores.professional,score+7);
 assert.equal(next.socialInfluence.completed[0].ending,'repaired');
 assert.ok(E.validate(next));
});
test('dismissive responses have explicit negative consequences and never yield free income',()=>{
 const s=fixture(120010,'professional',true);
 const next=choose(s,1);
 assert.equal(next.socialInfluence.completed[0].ending,'dismissed');
 assert.equal(next.socialInfluence.scores.professional,s.socialInfluence.scores.professional-5);
 assert.equal(next.cash,s.cash);
 assert.ok(E.validate(next));
});
test('observation is idempotent across repeated annual ticks, snapshots and save reloads',()=>{
 const s=fixture(120011,'professional');
 const before=JSON.stringify(s.socialInfluence);
 socialInfluenceYear(s,{add:note});
 assert.equal(JSON.stringify(s.socialInfluence),before);
 const restored=JSON.parse(JSON.stringify(s));
 restored.age++;socialInfluenceYear(restored,{add:note});
 assert.equal(restored.socialInfluence.scores.professional,s.socialInfluence.scores.professional);
 assert.equal(restored.socialInfluence.signals.length,s.socialInfluence.signals.length);
 assert.ok(E.validate(restored));
});
test('unused opportunities expire naturally without forced personality, trust or financial changes',()=>{
 const s=fixture(120012,'family'),p=s.people[0];
 const prior=JSON.stringify({scores:s.socialInfluence.scores,people:s.people,cash:s.cash,stats:s.stats});
 s.age+=4;socialInfluenceYear(s,{add:note});
 assert.equal(s.socialInfluence.completed.at(-1).ending,'unanswered');
 assert.equal(s.socialInfluence.active,null);
 assert.equal(JSON.stringify({scores:s.socialInfluence.scores,people:s.people,cash:s.cash,stats:s.stats}),prior);
 assert.ok(E.validate(s));
});
test('a deceased NPC cancels the offer without restoring the person',()=>{
 const s=fixture(120013,'professional'),p=s.people[0];
 p.alive=false;s.age++;socialInfluenceYear(s,{add:note});
 assert.equal(s.socialInfluence.completed.at(-1).ending,'interrupted');
 assert.equal(p.alive,false);
 assert.ok(E.validate(s));
});
function completedCrossroad(id,ending,index=1){
 return {id,source:'alumni',sourceKey:'alumni-community|second-alumnus',
  aId:'alumni-community',bId:'second-alumnus',aName:'Maya',bName:'Noah',
  kind:'rivalry',sourceStatus:'rivals',title:'A difficult community friendship',
  introduction:'An existing social relationship has become strained.',
  startAge:30,dueAge:32,status:'completed',steps:[{
   age:31,index,tag:index===2?'observe':'side',
   label:index===2?'Let them decide':'Take a side',
   trust:index===2?0:-5,rivalry:index===2?0:11,
   statusBefore:'friends',statusAfter:'rivals',stat:index===2?null:'confidence',
   statDelta:index===2?0:3,aTrust:55,bTrust:46
  }],ending,endedAge:33,finalLine:'The friendship followed a difficult path.',
  firstTrust:60,lastTrust:32,firstRivalry:40};
}
test('negative community stories can create accountability with actual community-linked acquaintances',()=>{
 const s=E.createLife({seed:120014,name:'Ren'});s.age=34;
 s.world.autonomy={version:1,alumni:[{
  id:'alumni-community',name:'Maya',age:34,trust:55,rivalry:12,preference:2,
  connection:'former classmate',status:'friends',profession:'Community organizer',
  collaborations:0,contests:0,lastInteractionAge:-1,partnerId:null,children:0,
  careerLevel:0,location:'hometown',history:[],schoolAge:12
 }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 s.crossroads.completed.push(completedCrossroad('cross-1-30-1','rivals'));
 s.crossroads.completed.push(completedCrossroad('cross-1-31-2','estranged'));
 socialInfluenceYear(s,{add:note});
 assert.equal(s.socialInfluence.scores.community,33);
 assert.equal(s.socialInfluence.active.group,'community');
 assert.equal(s.socialInfluence.active.tone,'repair');
 assert.equal(s.socialInfluence.active.personId,'alumni-community');
 assert.ok(E.validate(s));
});
test('social outcomes only count real choices and do not credit neutral observers',()=>{
 const s=E.createLife({seed:120015});s.age=27;
 s.crossroads.completed.push({...completedCrossroad('cross-1-26-1','alliance',2),
  startAge:25,dueAge:26,endedAge:27});
 socialInfluenceYear(s,{add:note});
 assert.equal(s.socialInfluence.scores.community,50);
 assert.equal(s.socialInfluence.signals.length,0);
 assert.ok(s.socialInfluence.seen.includes('crossroads:cross-1-26-1'));
 assert.ok(E.validate(s));
});
test('reputation requires both actual earned evidence and a living relationship to offer a scene',()=>{
 const s=E.createLife({seed:120016});s.age=28;
 s.socialInfluence.scores.professional=85;
 socialInfluenceYear(s,{add:note});
 assert.equal(s.socialInfluence.active,null);
 s.socialInfluence.signals.push({
  id:'clash:historical',age:26,group:'professional',delta:10,
  label:'Previous earned trust',personId:null
 });
 socialInfluenceYear(s,{add:note});
 assert.equal(s.socialInfluence.active,null,'no matching existing career or business connection');
 assert.ok(E.validate(s));
});
test('family reputation creates bounded inherited expectations, never free money or invented ties',()=>{
 let s=fixture(120017,'family');s=choose(s,0);
 const next=E.createLife({seed:120018,name:'Aria'});
 next.generation=2;const start=next.cash,people=JSON.stringify(next.people);
 socialInfluenceInheritance(next,s);
 assert.equal(next.socialInfluence.active,null);
 assert.equal(next.socialInfluence.completed.length,0);
 assert.equal(next.socialInfluence.scores.family,50);
 assert.equal(next.socialInfluence.legacy.name,'Kai');
 assert.ok(next.socialInfluence.legacy.echoes.family>0);
 assert.equal(next.cash,start);
 assert.equal(JSON.stringify(next.people),people);
 assert.equal(E.socialInfluenceView(next).standing.family.effective,50+next.socialInfluence.legacy.echoes.family);
 assert.equal(E.socialInfluenceCommands(next).length,0);
 assert.ok(E.validate(next));
});
test('inherited negative and positive reputation echoes remain clamped across many generations',()=>{
 const s=fixture(120019,'professional');
 s.socialInfluence.scores={family:0,professional:100,community:0};
 const next=E.createLife({seed:120020});next.generation=2;
 socialInfluenceInheritance(next,s);
 assert.deepEqual(next.socialInfluence.legacy.echoes,{family:-6,professional:6,community:-6});
 assert.equal(next.socialInfluence.ancestors.length,1);
 assert.ok(E.validate(next));
});
test('malformed scores, duplicate evidence, impossible phases, and unbounded histories are rejected',()=>{
 const s=fixture(120021,'professional');
 const raw=JSON.stringify(s);
 assert.equal(validateSocialInfluence(s.socialInfluence),true);
 let bad=JSON.parse(raw);bad.socialInfluence.scores.family=105;
 assert.equal(E.validate(bad),false);
 bad=JSON.parse(raw);bad.socialInfluence.seen.push(bad.socialInfluence.seen[0]);
 assert.equal(E.validate(bad),false);
 bad=JSON.parse(raw);bad.socialInfluence.active.status='completed';
 assert.equal(E.validate(bad),false);
 bad=JSON.parse(raw);bad.socialInfluence.signals=Array.from({length:41},()=>({
  id:'x',age:30,group:'family',delta:2,label:'a',personId:null
 }));
 assert.equal(E.validate(bad),false);
 bad=JSON.parse(raw);bad.socialInfluence.legacy.echoes.professional=700;
 assert.equal(E.validate(bad),false);
 assert.ok(E.validate(JSON.parse(raw)));
});
test('normal age-up retains reputation state without RNG or cash side effects from the new module',()=>{
 const s=fixture(120022,'professional'),rng=s.rng,cash=s.cash;
 socialInfluenceYear(s,{add:note});
 assert.equal(s.rng,rng);assert.equal(s.cash,cash);
 const after=E.ageUp(s);
 assert.ok(E.validate(after));
 assert.ok(after.socialInfluence.scores.professional>=50);
});
