import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {socialCirclesYear,socialCirclesInheritance} from '../src/content/social-circles.mjs';
import {organizationNetworkYear,organizationNetworkInheritance} from '../src/content/organization-relations.mjs';
import {playableEventsInheritance} from '../src/content/playable-public-events.mjs';
import {publicAftermathYear,publicAftermathInheritance} from '../src/content/public-aftermath.mjs';
import {civicMandatesYear,civicMandatesView,civicMandatesInheritance,validateCivicMandates}
 from '../src/content/civic-mandates.mjs';
import {socialInfluenceYear} from '../src/content/social-influence.mjs';
const silent=()=>{};
function world(seed=125001,kind='community'){
 let s=E.createLife({seed,name:'Alex'});s.age=30;s.actions=3;
 for(const p of s.people){
  p.world.trust=72;p.world.rivalry=8;p.world.cash=9000;p.world.debt=0;
  p.world.ambition='Family life';
 }
 socialCirclesYear(s,{add:silent});
 s=E.act(s,'circle:'+s.socialCircles.invites[0].id+':2');
 s.age=31;s.actions=3;
 if(kind==='community')s.people[1].world.ambition='Community service';
 else if(kind==='professional'){s.people[1].world.job=0;s.job={id:0,level:0,experience:0};}
 else if(kind==='rival-family'){
  s.world.autonomy={version:1,alumni:[{
   id:'alumni-household',name:'Morgan',age:31,trust:34,rivalry:82,
   preference:3,connection:'former classmate',status:'rivals',
   profession:'Founder',collaborations:0,contests:0,lastInteractionAge:-1,
   partnerId:null,children:2,careerLevel:1,location:'hometown',
   history:[],schoolAge:12
  }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 }
 socialCirclesYear(s,{add:silent});organizationNetworkYear(s,{add:silent});
 const mode=kind==='professional'?'competition':kind==='rival-family'?'negotiation':'festival';
 const command=E.playableEventCommands(s).find(x=>x.id.endsWith(':'+mode));
 s=E.act(s,command.id);
 for(let i=0;i<3;i++)s=E.playableEventDecision(s,0);
 publicAftermathYear(s,{add:silent});
 civicMandatesYear(s,{add:silent});
 assert.ok(s.civicMandates.active,'an authentic mandate should form from a public-event aftermath');
 assert.ok(E.validate(s));
 return s;
}
function years(s,count){
 for(let i=0;i<count;i++){
  s.age++;s.actions=3;
  socialCirclesYear(s,{add:silent});organizationNetworkYear(s,{add:silent});
  publicAftermathYear(s,{add:silent});civicMandatesYear(s,{add:silent});
 }
 return s;
}
function decision(s,index){
 const m=s.civicMandates.active;
 assert.ok(m?.pending,'must have a real policy decision to respond to');
 const c=E.commands(s).find(c=>c.id==='mandate:'+m.id+':'+index);
 assert.ok(c?.enabled,'policy choice must be a normal enabled activity');
 return E.act(s,c.id);
}
test('old version-2 saves without civic mandates remain valid',()=>{
 const s=E.createLife({seed:125002});
 assert.deepEqual(E.civicMandatesView(s).completed,[]);
 assert.equal(E.civicMandatesView(s).active,null);
 assert.ok(E.validate(s));
 delete s.civicMandates;
 assert.ok(E.validate(s));
 assert.deepEqual(E.civicMandateCommands(s),[]);
});
test('family and community groups start an authentic care initiative, not invented elections',()=>{
 const s=world(125003),m=s.civicMandates.active;
 assert.equal(m.issue,'family-support');
 assert.equal(m.groupAId,s.socialCircles.groups[0].id);
 assert.equal(m.groupBId,s.socialCircles.groups[1].id);
 assert.notEqual(m.groupAId,m.groupBId);
 assert.equal(m.leaderA,'person-'+s.people[0].id);
 assert.equal(m.leaderB,'person-'+s.people[1].id);
 assert.equal(m.startedAge,s.age);
 assert.equal(m.expiryAge,s.age+8);
 assert.equal(m.stage,0);
 assert.equal(s.civicMandates.used.length,1);
 assert.equal(E.civicMandateCommands(s).length,0);
 assert.ok(E.validate(s));
});
test('professional and household conflicts generate distinct, existing-organizations policy topics',()=>{
 const work=world(125004,'professional'),rival=world(125005,'rival-family');
 assert.equal(work.civicMandates.active.issue,'skills-access');
 assert.equal(rival.civicMandates.active.issue,'shared-space');
 assert.ok(work.civicMandates.active.groupAName.includes('Family Council'));
 assert.ok(rival.civicMandates.active.groupBName.includes('Rival Household'));
 assert.ok(E.validate(work));assert.ok(E.validate(rival));
});
test('real organizations advance a campaign autonomously, without granting free player stats or income',()=>{
 const s=world(125006),m=s.civicMandates.active,
  before={cash:s.cash,rng:s.rng,stats:JSON.stringify(s.stats),
   ground:m.commonGround,evidence:m.evidence};
 years(s,2);
 assert.equal(m.stage,1);
 assert.equal(m.pending,true);
 assert.ok(m.evidence>before.evidence);
 assert.equal(s.cash,before.cash);assert.equal(s.rng,before.rng);
 assert.equal(JSON.stringify(s.stats),before.stats);
 assert.equal(E.civicMandateCommands(s).length,3);
 assert.ok(E.validate(s));
});
test('shared-evidence advocacy changes existing leaders and increases support on both sides',()=>{
 let s=world(125007);years(s,2);
 const before=s,old=before.civicMandates.active,
  trustA=before.people[0].world.trust,trustB=before.people[1].world.trust;
 s=decision(s,0);
 const m=s.civicMandates.active,d=m.decisions[0];
 assert.equal(s.actions,2);
 assert.equal(m.pending,false);
 assert.equal(d.tag,'build-evidence');
 assert.ok(m.commonGround>old.commonGround);
 assert.ok(m.evidence>old.evidence);
 assert.ok(m.resistance<old.resistance);
 assert.ok(s.people[0].world.trust>trustA);
 assert.ok(s.people[1].world.trust>trustB);
 assert.equal(s.stats.knowledge,Math.min(100,before.stats.knowledge+2));
 assert.equal(s.cash,before.cash);assert.equal(s.rng,before.rng);
 assert.ok(E.validate(s));
});
test('backing the weaker real group strengthens it, but creates real leadership tension',()=>{
 let s=world(125008);years(s,2);
 s.civicMandates.active.supportB=30;
 s.civicMandates.active.supportA=75;
 const before=s,m=before.civicMandates.active;
 const c=decision(before,1),after=c.civicMandates.active;
 assert.ok(after.supportB>m.supportB);
 assert.ok(after.supportA<m.supportA);
 assert.ok(after.resistance>m.resistance);
 assert.ok(c.organizationNetwork.links[0].competition>before.organizationNetwork.links[0].competition);
 assert.ok(c.people[0].world.rivalry>before.people[0].world.rivalry);
 assert.equal(c.cash,before.cash);
 assert.ok(E.validate(c));
});
test('neutral advocacy never changes player, NPC, group, network or business resources',()=>{
 let s=world(125009);years(s,2);const bytes=JSON.stringify(s);
 const n=decision(s,2);
 assert.equal(n.actions,s.actions-1);
 assert.equal(n.civicMandates.active.decisions[0].tag,'independent');
 assert.deepEqual(n.people,s.people);
 assert.deepEqual(n.stats,s.stats);
 assert.deepEqual(n.socialCircles.groups,s.socialCircles.groups);
 assert.deepEqual(n.organizationNetwork.links,s.organizationNetwork.links);
 assert.equal(n.cash,s.cash);assert.equal(n.rng,s.rng);
 assert.equal(JSON.stringify(s),bytes);
 assert.ok(E.validate(n));
});
test('missed policy invitations expire without blocking annual aging or player income',()=>{
 const s=world(125010),money=s.cash,stats=JSON.stringify(s.stats);
 years(s,2);assert.equal(s.civicMandates.active.pending,true);
 years(s,2);assert.equal(s.civicMandates.active.pending,false);
 assert.ok(s.civicMandates.active.history.some(x=>x.kind==='missed'));
 assert.equal(s.cash,money);assert.equal(JSON.stringify(s.stats),stats);
 assert.ok(E.validate(s));
});
test('two evidence-driven decisions can produce a jointly prepared public initiative',()=>{
 let s=world(125011);years(s,2);
 s=decision(s,0);years(s,4);
 assert.equal(s.civicMandates.active.pending,true);
 s=decision(s,0);years(s,2);
 assert.equal(s.civicMandates.active,null);
 const done=s.civicMandates.completed.at(-1);
 assert.equal(done.ending,'joint-adoption');
 assert.ok(s.socialCircles.groups.every(g=>g.history.some(h=>
   h.title.startsWith('Public mandate:')||h.kind==='project')));
 assert.ok(s.organizationNetwork.links[0].history.some(h=>h.label.includes('Civic mandate')));
 assert.ok(E.chronicleView(s).timeline.some(x=>x.id==='civic-'+done.id));
 assert.ok(E.validate(s));
});
test('without player intervention, the groups can settle a proposal independently but award no player influence',()=>{
 const s=world(125012),cash=s.cash,rng=s.rng,stats=JSON.stringify(s.stats);
 socialInfluenceYear(s,{add:silent});
 const influence=JSON.stringify(s.socialInfluence.scores);
 years(s,8);
 assert.equal(s.civicMandates.active,null);
 assert.equal(s.civicMandates.completed.length,1);
 socialInfluenceYear(s,{add:silent});
 assert.equal(JSON.stringify(s.socialInfluence.scores),influence);
 assert.equal(s.cash,cash);assert.equal(s.rng,rng);
 assert.equal(JSON.stringify(s.stats),stats);
 assert.ok(E.validate(s));
});
test('policy responses earn one deduplicated social-influence adjustment per real action',()=>{
 let s=world(125013);years(s,2);
 socialInfluenceYear(s,{add:silent});
 const before=s.socialInfluence.scores.family;
 s=decision(s,0);
 socialInfluenceYear(s,{add:silent});
 assert.equal(s.socialInfluence.scores.family,before+3);
 const signals=JSON.stringify(s.socialInfluence);
 socialInfluenceYear(s,{add:silent});
 assert.equal(JSON.stringify(s.socialInfluence),signals);
 assert.ok(E.validate(s));
});
test('a real leader change updates the same campaign without phantom representatives',()=>{
 const s=world(125014),m=s.civicMandates.active,
  alternate=s.socialCircles.groups[0].members.find(x=>x!==m.leaderA);
 assert.ok(alternate);
 s.socialCircles.groups[0].leaderId=alternate;
 s.age++;
 civicMandatesYear(s,{add:silent});
 assert.equal(m.officeA,alternate,'actual group officeholder must change');
 assert.ok(s.socialCircles.groups[0].members.includes(m.leaderA),
  'the campaign representative must be a real member of that group');
 assert.notEqual(m.leaderA,m.leaderB,
  'joint organizations need two distinct actual representatives');
 assert.ok(m.history.some(x=>x.kind==='leadership'));
 assert.ok(E.validate(s));
});
test('a group losing all real participants pauses and then ends its public mandate',()=>{
 const s=world(125015);
 s.people[0].alive=false;
 years(s,1);
 assert.equal(s.civicMandates.active.unavailableSince,s.age);
 years(s,2);
 assert.equal(s.civicMandates.active,null);
 assert.equal(s.civicMandates.completed.at(-1).ending,'dissolved');
 assert.equal(s.people[0].alive,false);
 assert.ok(E.validate(s));
});
test('one campaign ends before another can start; the world remains bounded for decades',()=>{
 const s=world(125016),first=s.civicMandates.active.id;
 years(s,8);
 assert.equal(s.civicMandates.active,null);
 assert.equal(s.civicMandates.completed[0].id,first);
 years(s,1);
 assert.ok(s.civicMandates.active);
 assert.notEqual(s.civicMandates.active.id,first);
 assert.equal(s.civicMandates.used.length,2);
 assert.ok(E.validate(s));
});
test('policy archives pass between generations but no real leaders, power or personal loyalties transfer',()=>{
 let s=world(125017);years(s,2);s=decision(s,0);years(s,6);
 const heir=E.createLife({seed:125018,name:'Jordan'});heir.age=18;heir.generation=2;
 const wealth=heir.cash,people=JSON.stringify(heir.people);
 socialCirclesInheritance(heir,s);organizationNetworkInheritance(heir,s);
 playableEventsInheritance(heir,s);publicAftermathInheritance(heir,s);
 civicMandatesInheritance(heir,s);
 assert.equal(heir.civicMandates.active,null);
 assert.equal(heir.civicMandates.completed.length,0);
 assert.equal(heir.civicMandates.used.length,0);
 assert.equal(heir.civicMandates.ancestors.length,1);
 assert.match(heir.civicMandates.ancestors[0].note,/Family care/);
 assert.equal(heir.cash,wealth);
 assert.equal(JSON.stringify(heir.people),people);
 assert.ok(E.validate(heir));
});
test('corrupt campaign phases, impossible support, fake representative IDs and duplicates fail loading',()=>{
 const s=world(125019),bytes=JSON.stringify(s);
 assert.ok(validateCivicMandates(s.civicMandates));
 let x=JSON.parse(bytes);x.civicMandates.active.supportA=120;
 assert.equal(E.validate(x),false);
 x=JSON.parse(bytes);x.civicMandates.active.issue='fake-issue';
 assert.equal(E.validate(x),false);
 x=JSON.parse(bytes);x.civicMandates.active.leaderB=x.civicMandates.active.leaderA;
 assert.equal(E.validate(x),false);
 x=JSON.parse(bytes);x.civicMandates.active.pending=true;
 assert.equal(E.validate(x),false);
 x=JSON.parse(bytes);x.civicMandates.used.push(x.civicMandates.used[0]);
 assert.equal(E.validate(x),false);
 x=JSON.parse(bytes);x.civicMandates.active.history=Array.from({length:13},()=>({
  age:31,kind:'origin',text:'A legitimate group story'}));
 assert.equal(E.validate(x),false);
 assert.ok(E.validate(JSON.parse(bytes)));
});
test('the standard age-up still works with active civic mandates and old storylines',()=>{
 const s=world(125020),n=E.ageUp(s);
 assert.ok(E.validate(n));
 assert.ok(E.civicMandatesView(n).active);
});
