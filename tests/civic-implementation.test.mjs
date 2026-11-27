import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {socialCirclesYear,socialCirclesInheritance} from '../src/content/social-circles.mjs';
import {organizationNetworkYear,organizationNetworkInheritance} from '../src/content/organization-relations.mjs';
import {publicAftermathYear,publicAftermathInheritance} from '../src/content/public-aftermath.mjs';
import {playableEventsInheritance} from '../src/content/playable-public-events.mjs';
import {civicMandatesYear,civicMandatesInheritance} from '../src/content/civic-mandates.mjs';
import {civicImplementationYear,civicImplementationState,civicImplementationView,
 civicImplementationInheritance,validateCivicImplementation
} from '../src/content/civic-implementation.mjs';
import {socialInfluenceYear} from '../src/content/social-influence.mjs';
const silent=()=>{};
function world(seed=126001,kind='community'){
 let s=E.createLife({seed,name:'Alex'});s.age=30;s.actions=3;
 for(const p of s.people){
  p.world.trust=72;p.world.rivalry=8;p.world.cash=9000;p.world.debt=0;
  p.world.ambition='Family life';
 }
 socialCirclesYear(s,{add:silent});
 s=E.act(s,'circle:'+s.socialCircles.invites[0].id+':2');
 s.age=31;s.actions=3;
 if(kind==='community')s.people[1].world.ambition='Community service';
 else if(kind==='professional'){
  s.people[1].world.job=0;s.job={id:0,level:0,experience:0};
 }
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
 const command=E.playableEventCommands(s).find(c=>c.id.endsWith(':'+mode));
 s=E.act(s,command.id);
 for(let i=0;i<3;i++)s=E.playableEventDecision(s,0);
 publicAftermathYear(s,{add:silent});civicMandatesYear(s,{add:silent});
 assert.ok(s.civicMandates.active,'authentic mandate must exist');
 for(let i=0;i<8;i++){
  s.age++;s.actions=3;socialCirclesYear(s,{add:silent});
  organizationNetworkYear(s,{add:silent});
  publicAftermathYear(s,{add:silent});
  civicMandatesYear(s,{add:silent});
  civicImplementationYear(s,{add:silent});
 }
 assert.equal(s.civicMandates.completed.length,1);
 assert.ok(s.civicImplementation.active,'completed policy should reach implementation stage');
 assert.ok(E.validate(s));
 return s;
}
function years(s,n,{existingGroups=true}={}){
 for(let i=0;i<n;i++){
  s.age++;s.actions=3;
  if(existingGroups){
   socialCirclesYear(s,{add:silent});
   organizationNetworkYear(s,{add:silent});
   publicAftermathYear(s,{add:silent});civicMandatesYear(s,{add:silent});
  }
  civicImplementationYear(s,{add:silent});
 }
 return s;
}
function answer(s,index){
 const t=s.civicImplementation.active;
 assert.ok(t?.pending,'real policy follow-up expected');
 const id='delivery:'+t.id+':'+index;
 assert.ok(E.commands(s).find(c=>c.id===id)?.enabled,'policy decision must be available');
 return E.act(s,id);
}
test('old version-2 saves without delivery records remain fully compatible',()=>{
 const s=E.createLife({seed:126002});
 assert.deepEqual(E.civicImplementationView(s).completed,[]);
 assert.ok(E.validate(s));delete s.civicImplementation;
 assert.ok(E.validate(s));assert.deepEqual(E.civicImplementationCommands(s),[]);
});
test('actual enacted family-care policy generates a grounded six-year implementation project',()=>{
 const s=world(126003),t=s.civicImplementation.active,m=s.civicMandates.completed[0];
 assert.equal(t.issue,'family-support');assert.equal(t.sourceId,m.id);
 assert.equal(t.groupAId,s.socialCircles.groups[0].id);
 assert.equal(t.groupBId,s.socialCircles.groups[1].id);
 assert.equal(t.issueName,'Family care & neighborhood support');
 assert.equal(t.dueAge,s.age+6);
 assert.equal(t.stage,0);
 assert.ok(s.people.some(p=>'person-'+p.id===t.representativeA&&p.alive));
 assert.ok(s.people.some(p=>'person-'+p.id===t.representativeB&&p.alive));
 assert.equal(s.civicImplementation.seen.length,1);
 assert.equal(E.civicImplementationCommands(s).length,0);
 assert.ok(E.validate(s));
});
test('professional training commitments are linked to real job-holding adults',()=>{
 const s=world(126004,'professional'),t=s.civicImplementation.active;
 assert.equal(t.issue,'skills-access');
 assert.equal(t.issueName,'Apprenticeship & skills access');
 assert.equal(s.job.id,0);
 assert.ok(E.validate(s));
});
test('an actual contested shared-space outcome can produce a grounded implementation attempt',()=>{
 const s=world(126005,'rival-family'),t=s.civicImplementation.active;
 assert.equal(t.issue,'shared-space');
 assert.match(t.groupBName,/Rival Household/);
 assert.ok(E.validate(s));
});
test('autonomous organizations improve progress without changing the player cash, stats or RNG',()=>{
 const s=world(126006),t=s.civicImplementation.active,
  cash=s.cash,rng=s.rng,stats=JSON.stringify(s.stats),progress=t.progress;
 years(s,2);
 assert.equal(t.stage,1);
 assert.ok(t.progress>progress);
 assert.equal(t.pending,true);
 assert.equal(E.civicImplementationCommands(s).length,4);
 assert.equal(s.cash,cash);assert.equal(s.rng,rng);
 assert.equal(JSON.stringify(s.stats),stats);
 assert.ok(E.validate(s));
});
test('a fair audit increases project quality, public trust, both leaders trust and real organizational standing',()=>{
 const start=world(126007);years(start,2);
 const cash=start.cash,rng=start.rng,old=start.civicImplementation.active,
  pa=start.people[0].world.trust,pb=start.people[1].world.trust;
 const s=answer(start,0),t=s.civicImplementation.active;
 assert.equal(s.actions,2);
 assert.equal(t.choices[0].tag,'audit');
 assert.equal(t.pending,false);
 assert.ok(t.deliveryQuality>old.deliveryQuality);
 assert.ok(t.progress>old.progress);
 assert.ok(t.publicTrust>=old.publicTrust);
 assert.ok(s.people[0].world.trust>pa);
 assert.ok(s.people[1].world.trust>pb);
 assert.equal(s.stats.knowledge,Math.min(100,start.stats.knowledge+2));
 assert.equal(s.cash,cash);assert.equal(s.rng,rng);assert.ok(E.validate(s));
});
test('favoring only one organization raises opposition and creates real NPC rivalry',()=>{
 const start=world(126008);years(start,2);
 const n=answer(start,1),d=n.civicImplementation.active.choices[0];
 assert.equal(d.tag,'prioritize');
 assert.ok(d.opposition>0);assert.ok(d.competition>0);
 assert.ok(n.people[1].world.rivalry>start.people[1].world.rivalry);
 assert.ok(n.socialCircles.groups[0].standing>start.socialCircles.groups[0].standing);
 assert.ok(n.socialCircles.groups[1].standing<start.socialCircles.groups[1].standing);
 assert.equal(n.cash,start.cash);assert.ok(E.validate(n));
});
test('a professional can volunteer with real leaders but no imaginary payment or employer',()=>{
 const start=world(126009,'professional');years(start,2);
 const n=answer(start,2),t=n.civicImplementation.active;
 assert.equal(t.choices[0].tag,'collaborate');
 assert.equal(t.partnerships.length,1);
 assert.equal(t.partnerships[0].kind,'volunteer-project');
 assert.equal(n.job.id,start.job.id);
 assert.equal(n.cash,start.cash);
 assert.equal(n.business,null);
 assert.equal(n.stats.performance,Math.min(100,start.stats.performance+2));
 assert.ok(E.validate(n));
});
test('a real company may record a named contact but not invent procurement revenue or capital',()=>{
 const s=world(126010,'professional');
 s.business={sector:'service',capital:21000,quality:60,
  employees:0,products:[],demand:50,competition:50,
  revenue:0,payroll:0,operating:0,lastProfit:0};
 assert.ok(E.validate(s));
 years(s,2);
 const money=s.cash,capital=s.business.capital,revenue=s.business.revenue;
 const n=answer(s,2),partner=n.business.partners?.[0];
 assert.ok(partner);assert.equal(partner.kind,'civic-delivery');
 assert.ok(n.people.some(p=>'person-'+p.id===partner.personId&&p.alive));
 assert.equal(partner.sourceId,n.civicImplementation.active.sourceId);
 assert.equal(n.civicImplementation.active.partnerships[0].kind,'real-business-contact');
 assert.equal(n.cash,money);assert.equal(n.business.capital,capital);
 assert.equal(n.business.revenue,revenue);
 assert.ok(E.validate(n));
});
test('the professional contribution option requires actual employment or business',()=>{
 const s=world(126011);years(s,2);
 assert.equal(s.business,null);assert.equal(s.job,null);
 const option=E.civicImplementationCommands(s).find(c=>c.id.endsWith(':2'));
 assert.ok(option);assert.equal(option.enabled,false);
 assert.throws(()=>E.act(s,option.id));
 assert.ok(E.validate(s));
});
test('independent reply consumes one activity but changes nothing else',()=>{
 const s=world(126012);years(s,2);
 const copy=JSON.stringify(s),n=answer(s,3);
 assert.equal(n.actions,s.actions-1);
 assert.equal(n.civicImplementation.active.choices[0].tag,'independent');
 assert.deepEqual(n.stats,s.stats);assert.deepEqual(n.people,s.people);
 assert.deepEqual(n.socialCircles.groups,s.socialCircles.groups);
 assert.deepEqual(n.organizationNetwork.links,s.organizationNetwork.links);
 assert.equal(n.cash,s.cash);assert.equal(n.rng,s.rng);
 assert.equal(JSON.stringify(s),copy);assert.ok(E.validate(n));
});
test('ignoring an optional audit never blocks a later year or awards player resources',()=>{
 const s=world(126013),cash=s.cash,stats=JSON.stringify(s.stats);
 years(s,2);assert.equal(s.civicImplementation.active.pending,true);
 years(s,2);assert.equal(s.civicImplementation.active.pending,false);
 assert.ok(s.civicImplementation.active.history.some(x=>x.kind==='missed'));
 assert.equal(s.cash,cash);assert.equal(JSON.stringify(s.stats),stats);
 assert.ok(E.validate(s));
});
test('sufficient verified progress leads to delivered project and chronicle entry',()=>{
 const s=world(126014),taskId=s.civicImplementation.active.id;
 // A policy with unusually high independent project readiness.
 s.civicImplementation.active.progress=77;
 s.civicImplementation.active.deliveryQuality=80;
 s.civicImplementation.active.opposition=25;
 years(s,6);
 assert.equal(s.civicImplementation.active,null);
 const r=s.civicImplementation.completed[0];
 assert.equal(r.id,taskId);assert.equal(r.result,'delivered');
 assert.ok(s.socialCircles.groups[0].history.some(x=>x.title.startsWith('Policy implementation')));
 assert.ok(E.chronicleView(s).timeline.some(x=>x.id==='implementation-'+taskId));
 assert.ok(E.validate(s));
});
test('contested implementation can fail without inventing a public procurement payout',()=>{
 const s=world(126015),initialCash=s.cash;
 s.civicImplementation.active.progress=5;
 s.civicImplementation.active.deliveryQuality=25;
 s.civicImplementation.active.opposition=95;
 years(s,6);
 assert.equal(s.civicImplementation.completed[0].result,'stalled');
 assert.equal(s.cash,initialCash);assert.ok(E.validate(s));
});
test('actual officeholder succession is recorded during the same public project',()=>{
 const s=world(126016),t=s.civicImplementation.active;
 const alternate=s.socialCircles.groups[0].members.find(id=>id!==t.ownerA);
 assert.ok(alternate);
 s.socialCircles.groups[0].leaderId=alternate;
 s.age++;civicImplementationYear(s,{add:silent});
 assert.equal(t.ownerA,alternate);
 assert.ok(t.history.some(x=>x.kind==='leadership'));
 assert.ok(s.socialCircles.groups[0].members.includes(t.representativeA));
 assert.ok(E.validate(s));
});
test('the loss of actual adult representatives pauses and later closes the delivery instead of reviving anyone',()=>{
 const s=world(126017);
 s.people[0].alive=false;
 s.age++;civicImplementationYear(s,{add:silent});
 assert.equal(s.civicImplementation.active.interruptedAge,s.age);
 s.age+=2;civicImplementationYear(s,{add:silent});
 assert.equal(s.civicImplementation.active,null);
 assert.equal(s.civicImplementation.completed[0].result,'lost-contact');
 assert.equal(s.people[0].alive,false);assert.ok(E.validate(s));
});
test('an old source cannot be replayed for another implementation without a new legitimate civic decision',()=>{
 const s=world(126018),source=s.civicImplementation.active.sourceId;
 years(s,6);
 assert.ok(s.civicImplementation.seen.includes(source));
 civicImplementationYear(s,{add:silent});
 assert.equal(s.civicImplementation.active,null);
 assert.equal(s.civicImplementation.completed.length,1);
 assert.ok(E.validate(s));
});
test('earn reputation exactly once for an actual audit, not autonomous implementation progress',()=>{
 const s=world(126019);years(s,2);
 socialInfluenceYear(s,{add:silent});
 const before=s.socialInfluence.scores.family;
 const n=answer(s,0);
 socialInfluenceYear(n,{add:silent});
 assert.equal(n.socialInfluence.scores.family,before+3);
 const snap=JSON.stringify(n.socialInfluence);
 socialInfluenceYear(n,{add:silent});
 assert.equal(JSON.stringify(n.socialInfluence),snap);
 assert.ok(E.validate(n));
});
test('implementation history passes to heirs as memories, never inherited personal contracts or wealth',()=>{
 const old=world(126020);years(old,6);
 const heir=E.createLife({seed:126021,name:'Rowan'});
 heir.generation=2;heir.age=18;const cash=heir.cash,people=JSON.stringify(heir.people);
 socialCirclesInheritance(heir,old);
 organizationNetworkInheritance(heir,old);
 playableEventsInheritance(heir,old);
 publicAftermathInheritance(heir,old);
 civicMandatesInheritance(heir,old);
 civicImplementationInheritance(heir,old);
 assert.equal(heir.civicImplementation.active,null);
 assert.deepEqual(heir.civicImplementation.completed,[]);
 assert.deepEqual(heir.civicImplementation.seen,[]);
 assert.match(heir.civicImplementation.ancestors[0].note,/Family care/);
 assert.equal(heir.cash,cash);assert.equal(JSON.stringify(heir.people),people);
 assert.ok(E.validate(heir));
});
test('strict save validation rejects fictional actors, invalid phase, broken event history and duplicate source',()=>{
 const s=world(126022),raw=JSON.stringify(s);
 assert.ok(validateCivicImplementation(s.civicImplementation));
 let x=JSON.parse(raw);x.civicImplementation.active.progress=122;
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.civicImplementation.active.representativeB=x.civicImplementation.active.representativeA;
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.civicImplementation.active.stage=4;
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.civicImplementation.seen.push(x.civicImplementation.seen[0]);
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.civicImplementation.active.partnerships=[{age:30,memberId:'fake'}];
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.civicImplementation.active.pending=true;
 assert.equal(E.validate(x),false);
 assert.ok(E.validate(JSON.parse(raw)));
});
test('normal engine age-up operates with active civic implementation state',()=>{
 const s=world(126023),n=E.ageUp(s);
 assert.ok(E.validate(n));
 assert.ok(E.civicImplementationView(n).active);
});
