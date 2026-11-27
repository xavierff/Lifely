import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {socialCirclesYear,socialCirclesInheritance} from '../src/content/social-circles.mjs';
import {organizationNetworkYear,organizationNetworkInheritance} from '../src/content/organization-relations.mjs';
import {socialInfluenceYear} from '../src/content/social-influence.mjs';
import {publicEventModes,playableEventCommands,playableEventView,
  playableEventsYear,playableEventsInheritance,validatePlayableEvents
} from '../src/content/playable-public-events.mjs';
const add=()=>{};
function fixture(seed=123001,kind='community'){
 let s=E.createLife({seed,name:'Avery'});s.age=30;s.actions=3;
 for(const p of s.people){
  p.world.trust=72;p.world.rivalry=8;p.world.cash=9000;
  p.world.debt=0;p.world.ambition='Family life';
 }
 socialCirclesYear(s,{add});
 assert.equal(s.socialCircles.groups[0].kind,'family');
 const invited=s.socialCircles.invites[0];
 s=E.act(s,'circle:'+invited.id+':2');
 s.age=31;s.actions=3;
 if(kind==='community')s.people[1].world.ambition='Community service';
 else if(kind==='professional'){
  s.people[1].world.job=0;s.job={id:0,level:0,experience:0};
 }else if(kind==='rival-family'){
  s.world.autonomy={version:1,alumni:[{
   id:'alumni-household',name:'Morgan',age:31,trust:34,rivalry:82,
   preference:3,connection:'former classmate',status:'rivals',
   profession:'Founder',collaborations:0,contests:0,lastInteractionAge:-1,
   partnerId:null,children:2,careerLevel:1,location:'hometown',
   history:[],schoolAge:12
  }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 }
 socialCirclesYear(s,{add});
 organizationNetworkYear(s,{add});
 assert.equal(s.socialCircles.groups.length,2);
 assert.equal(s.organizationNetwork.links.length,1);
 assert.ok(E.validate(s));
 return s;
}
function start(s,mode){
 const cmd=playableEventCommands(s).find(c=>c.id.endsWith(':'+mode));
 assert.ok(cmd?.enabled,'expected mode '+mode+' to be available');
 return E.act(s,cmd.id);
}
const choose=(s,index)=>E.playableEventDecision(s,index);
const complete=(s,mode,indices=[0,0,0])=>{
 s=start(s,mode);
 for(const n of indices)s=choose(s,n);
 return s;
};
const yearly=(s,count)=>{for(let i=0;i<count;i++){
 s.age++;s.actions=3;
 socialCirclesYear(s,{add});organizationNetworkYear(s,{add});
 playableEventsYear(s,{add});
}return s;};

test('new lives have safe optional public event state and historical saves keep loading',()=>{
 const s=E.createLife({seed:123002});
 assert.equal(s.playableEvents.version,1);
 assert.deepEqual(E.playableEventView(s).offers,[]);
 assert.equal(E.playableEventView(s).active,null);
 assert.ok(E.validate(s));
 delete s.playableEvents;
 assert.ok(E.validate(s));
 assert.deepEqual(E.playableEventView(s).offers,[]);
});
test('public-event modes derive from existing organizations and never fabricate participants',()=>{
 const family=fixture(123003),offer=playableEventView(family).offers[0];
 assert.equal(offer.groupA,family.socialCircles.groups[0].name);
 assert.equal(offer.groupB,family.socialCircles.groups[1].name);
 assert.deepEqual(offer.modes.map(x=>x.mode),['negotiation','festival','election']);
 const work=fixture(123004,'professional');
 assert.deepEqual(playableEventView(work).offers[0].modes.map(x=>x.mode),
  ['negotiation','competition','election']);
 const rivalry=fixture(123005,'rival-family');
 assert.deepEqual(playableEventView(rivalry).offers[0].modes.map(x=>x.mode),
  ['negotiation','festival','competition','election']);
 assert.ok(E.validate(family));assert.ok(E.validate(work));assert.ok(E.validate(rivalry));
});
test('interactive negotiation begins with one normal activity and then needs no more annual activities',()=>{
 const original=fixture(123006),bytes=JSON.stringify(original);
 let s=start(original,'negotiation'),session=s.playableEvents.active,link=s.organizationNetwork.links[0];
 assert.equal(s.actions,2);
 assert.equal(s.rng,original.rng);assert.equal(s.cash,original.cash);
 assert.equal(session.mode,'negotiation');
 assert.equal(session.stage,0);
 assert.equal(session.status,'playing');
 assert.equal(link.event.label,'Public negotiation forum');
 assert.ok(session.leaderA&&session.leaderB);
 assert.equal(s.playableEvents.seen[0],link.event.id);
 s.actions=0;
 for(let i=0;i<3;i++){
  s=choose(s,0);
  assert.equal(s.actions,0,'free scene decisions cannot consume normal activities');
  assert.ok(E.validate(s));
 }
 assert.equal(s.playableEvents.active,null);
 assert.equal(s.playableEvents.completed[0].ending,'agreement');
 assert.equal(s.cash,original.cash);assert.equal(s.rng,original.rng);
 assert.equal(JSON.stringify(original),bytes);
});
test('fair negotiations improve trust and actual NPC relationships, never cash, jobs or random seed',()=>{
 const s=fixture(123007),a=s.people[0],b=s.people[1],
  link=s.organizationNetwork.links[0],groupA=s.socialCircles.groups[0],groupB=s.socialCircles.groups[1];
 const n=complete(s,'negotiation');
 assert.equal(n.organizationNetwork.links[0].trust,Math.min(100,link.trust+15));
 assert.equal(n.organizationNetwork.links[0].competition,Math.max(0,link.competition-12));
 assert.equal(n.people[0].world.trust,a.world.trust+9);
 assert.equal(n.people[1].world.trust,b.world.trust+9);
 assert.equal(n.socialCircles.groups[0].standing,Math.min(100,groupA.standing+6));
 assert.equal(n.socialCircles.groups[1].standing,Math.min(100,groupB.standing+6));
 assert.equal(n.socialCircles.groups[0].project.progress,groupA.project.progress+18);
 assert.equal(n.socialCircles.groups[1].project.progress,groupB.project.progress+18);
 assert.equal(n.stats.social,Math.min(100,s.stats.social+6));
 assert.equal(n.cash,s.cash);assert.equal(n.rng,s.rng);
 assert.ok(E.validate(n));
});
test('community festival has authored three-step format and a genuinely celebratory outcome',()=>{
 let s=fixture(123008);
 s=start(s,'festival');
 assert.deepEqual(publicEventModes.festival.phases.map(p=>p.title),
  ['Choose the festival program','Work through a public setback','Close the community celebration']);
 const startCash=s.cash;
 for(let i=0;i<3;i++){
  const phase=E.playableEventView(s).active.phase;
  assert.equal(phase.choices.length,3);
  s=choose(s,0);
 }
 assert.equal(s.playableEvents.completed[0].ending,'celebrated');
 assert.ok(s.organizationNetwork.links[0].history.some(x=>x.label.includes('Neighborhood community festival')));
 assert.equal(s.cash,startCash);
 assert.ok(E.chronicleView(s).timeline.some(x=>x.id==='played-event-'+s.playableEvents.completed[0].id));
 assert.ok(E.validate(s));
});
test('professional competition uses actual career groups and can finish with merit or controversy',()=>{
 const original=fixture(123009,'professional');
 const merit=complete(original,'competition');
 assert.equal(merit.playableEvents.completed[0].ending,'merit');
 assert.equal(merit.stats.performance,Math.min(100,original.stats.performance+6));
 assert.equal(merit.job.id,original.job.id);
 const controversial=complete(original,'competition',[1,1,1]);
 assert.equal(controversial.playableEvents.completed[0].ending,'controversy');
 assert.ok(controversial.organizationNetwork.links[0].competition>original.organizationNetwork.links[0].competition);
 assert.equal(controversial.cash,original.cash);
 assert.ok(E.validate(controversial));
});
test('leadership election requires real incumbent and living challenger and can change the actual leader',()=>{
 const s=fixture(123010),group=s.socialCircles.groups[0];
 const incumbent=group.leaderId;
 assert.equal(group.members.length,2);
 let n=start(s,'election'),ballot=n.playableEvents.active.ballot;
 assert.equal(ballot.groupId,group.id);
 assert.equal(ballot.incumbentId,incumbent);
 assert.ok(group.members.includes(ballot.challengerId));
 assert.notEqual(ballot.challengerId,incumbent);
 assert.ok(n.playableEvents.active.performance>=0);
 n=choose(n,1);n=choose(n,1);n=choose(n,1);
 assert.equal(n.playableEvents.completed[0].ending,'new-leader');
 assert.equal(n.socialCircles.groups[0].leaderId,ballot.challengerId);
 assert.equal(n.playableEvents.completed[0].newLeaderId,ballot.challengerId);
 assert.ok(n.socialCircles.groups[0].history.some(x=>x.outcome==='new-leader'));
 assert.ok(n.people.some(p=>'person-'+p.id===ballot.challengerId&&p.alive));
 assert.equal(n.cash,s.cash);
 assert.ok(E.validate(n));
});
test('supporting the incumbent can preserve original leadership; neutral participation cannot invent an election',()=>{
 const s=fixture(123011),initial=s.socialCircles.groups[0].leaderId;
 const supported=complete(s,'election',[0,0,0]);
 assert.equal(supported.playableEvents.completed[0].ending,'incumbent');
 assert.equal(supported.socialCircles.groups[0].leaderId,initial);
 const neutral=complete(s,'election',[2,2,2]);
 assert.equal(neutral.playableEvents.completed[0].ending,'independent');
 assert.equal(neutral.socialCircles.groups[0].leaderId,initial);
 assert.deepEqual(neutral.people,s.people);
 assert.deepEqual(neutral.stats,s.stats);
 assert.deepEqual(neutral.socialCircles.groups,s.socialCircles.groups);
 assert.equal(neutral.organizationNetwork.links[0].trust,s.organizationNetwork.links[0].trust);
 assert.equal(neutral.cash,s.cash);
 assert.ok(E.validate(neutral));
});
test('taking sides changes rival group standings and player reputation only after real completion',()=>{
 let s=fixture(123012,'rival-family');
 const before=JSON.stringify(s),cash=s.cash;
 s=complete(s,'negotiation',[1,1,1]);
 assert.equal(s.playableEvents.completed[0].ending,'escalation');
 assert.ok(s.organizationNetwork.links[0].competition>JSON.parse(before).organizationNetwork.links[0].competition);
 assert.equal(s.cash,cash);
 const reputation=s.socialInfluence.scores.community;
 socialInfluenceYear(s,{add});
 assert.equal(s.socialInfluence.scores.community,reputation-6);
 const snapshot=JSON.stringify(s.socialInfluence);
 socialInfluenceYear(s,{add});
 assert.equal(JSON.stringify(s.socialInfluence),snapshot,'same completed event should count only once');
 assert.equal(s.cash,cash);
 assert.ok(E.validate(s));
});
test('positive publicly hosted outcomes award only appropriate earned reputation once',()=>{
 let n=fixture(123013,'professional');
 n=complete(n,'competition');
 const start=n.socialInfluence.scores.professional;
 socialInfluenceYear(n,{add});
 assert.equal(n.socialInfluence.scores.professional,start+6);
 const exact=JSON.stringify(n.socialInfluence);
 socialInfluenceYear(n,{add});
 assert.equal(JSON.stringify(n.socialInfluence),exact);
 assert.ok(E.validate(n));
});
test('declining every phase is strictly neutral to all player, NPC and group resources',()=>{
 const s=fixture(123014),original=JSON.stringify(s);
 const n=complete(s,'festival',[2,2,2]);
 assert.equal(n.playableEvents.completed[0].ending,'independent');
 assert.deepEqual(n.people,s.people);
 assert.deepEqual(n.stats,s.stats);
 assert.deepEqual(n.socialCircles.groups,s.socialCircles.groups);
 assert.equal(n.organizationNetwork.links[0].trust,s.organizationNetwork.links[0].trust);
 assert.equal(n.organizationNetwork.links[0].competition,s.organizationNetwork.links[0].competition);
 assert.equal(n.cash,s.cash);assert.equal(n.rng,s.rng);
 assert.equal(JSON.stringify(s),original);
 assert.ok(E.validate(n));
});
test('the event cannot be replayed twice; a future actual gathering is a fresh opportunity',()=>{
 let s=fixture(123015),eventId=s.organizationNetwork.links[0].event.id;
 s=complete(s,'festival');
 assert.ok(s.playableEvents.seen.includes(eventId));
 assert.equal(playableEventCommands(s).length,0);
 s=yearly(s,4);
 assert.notEqual(s.organizationNetwork.links[0].event.id,eventId);
 assert.ok(playableEventCommands(s).length>=1);
 assert.ok(E.validate(s));
});
test('players can quit an unfinished event without fake profits or forced completion',()=>{
 let s=fixture(123016),cash=s.cash,rng=s.rng;
 s=start(s,'negotiation');
 s=E.playableEventExit(s);
 assert.equal(s.playableEvents.active,null);
 assert.equal(s.playableEvents.completed[0].ending,'abandoned');
 assert.equal(s.playableEvents.completed[0].decisions.length,0);
 assert.equal(s.cash,cash);assert.equal(s.rng,rng);
 assert.ok(E.validate(s));
});
test('autonomous public events expire an unfinished playable session without a softlock',()=>{
 let s=fixture(123017),source=s.organizationNetwork.links[0].event.id;
 s=start(s,'festival');
 s=yearly(s,3);
 assert.notEqual(s.organizationNetwork.links[0].event.id,source);
 assert.equal(s.playableEvents.active,null);
 assert.equal(s.playableEvents.completed[0].ending,'interrupted');
 assert.ok(E.validate(s));
});
test('losing a real participating NPC interrupts the event instead of resurrecting them',()=>{
 let s=fixture(123018);
 s=start(s,'negotiation');
 s.people[0].alive=false;s.age++;
 playableEventsYear(s,{add});
 assert.equal(s.playableEvents.active,null);
 assert.equal(s.playableEvents.completed[0].ending,'interrupted');
 assert.equal(s.people[0].alive,false);
 assert.ok(E.validate(s));
});
test('elections do not offer an imaginary challenger when only one member remains',()=>{
 const s=fixture(123019);
 const g=s.socialCircles.groups[0],other=g.members.find(id=>id!==g.leaderId);
 s.people.find(p=>'person-'+p.id===other).alive=false;
 s.age++;
 socialCirclesYear(s,{add});organizationNetworkYear(s,{add});
 const modes=E.playableEventView(s).offers.flatMap(o=>o.modes.map(m=>m.mode));
 assert.ok(!modes.includes('election'));
 assert.ok(E.validate(s));
});
test('a public election result becomes visible in the next autonomous leadership transition',()=>{
 let s=fixture(123020);
 s=complete(s,'election',[1,1,1]);
 const name=s.playableEvents.completed[0].newLeaderId;
 s=yearly(s,1);
 assert.equal(s.organizationNetwork.links[0].leaderA,name);
 assert.ok(s.organizationNetwork.links[0].history.some(h=>h.kind==='leadership'));
 assert.ok(E.validate(s));
});
test('public-event memories can cross generations but cannot mint heirs or transfer a leader',()=>{
 let old=fixture(123021);
 old=complete(old,'election',[1,1,1]);
 const next=E.createLife({seed:123022,name:'Rowan'});next.generation=2;next.age=18;
 const wealth=next.cash,people=JSON.stringify(next.people);
 socialCirclesInheritance(next,old);
 organizationNetworkInheritance(next,old);
 playableEventsInheritance(next,old);
 assert.equal(next.playableEvents.active,null);
 assert.equal(next.playableEvents.completed.length,0);
 assert.equal(next.playableEvents.seen.length,0);
 assert.match(next.playableEvents.ancestors[0].note,/leadership election: new-leader/);
 assert.equal(next.cash,wealth);
 assert.equal(JSON.stringify(next.people),people);
 assert.equal(next.organizationNetwork.links[0].leaderA,null);
 assert.ok(E.validate(next));
});
test('corrupted stages, invented ballot data, duplicate event IDs and excessive histories are rejected',()=>{
 const s=start(fixture(123023),'election'),raw=JSON.stringify(s);
 assert.ok(validatePlayableEvents(s.playableEvents));
 let x=JSON.parse(raw);x.playableEvents.active.stage=3;
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.playableEvents.active.fairness=103;
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.playableEvents.active.ballot.challengerId=
  x.playableEvents.active.ballot.incumbentId;
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.playableEvents.seen.push(x.playableEvents.seen[0]);
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.playableEvents.seen=Array.from({length:49},(_,i)=>'test-'+i);
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.playableEvents.active.decisions=[{stage:0,option:2}];
 assert.equal(E.validate(x),false);
 assert.ok(E.validate(JSON.parse(raw)));
});
test('normal E.ageUp still advances the original world with new event state present',()=>{
 const s=fixture(123024);
 const aged=E.ageUp(s);
 assert.ok(E.validate(aged));
 assert.ok(Array.isArray(E.playableEventView(aged).offers));
 assert.equal(aged.playableEvents.version,1);
});
