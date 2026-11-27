import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {socialCirclesYear,socialCirclesInheritance} from '../src/content/social-circles.mjs';
import {socialInfluenceYear} from '../src/content/social-influence.mjs';
import {organizationNetworkYear,organizationNetworkView,organizationNetworkInheritance,validateOrganizationNetwork}
 from '../src/content/organization-relations.mjs';

const silent=()=>{};
function setup(seed=122001,second='community'){
 let s=E.createLife({seed,name:'Avery'});s.age=30;s.actions=3;
 for(const p of s.people){
  p.world.trust=72;p.world.rivalry=8;p.world.cash=9000;
  p.world.debt=0;p.world.ambition='Family life';
 }
 socialCirclesYear(s,{add:silent});
 const first=s.socialCircles.groups[0];
 assert.equal(first?.kind,'family');
 // Make the existing family-council invitation neutral. That preserves
 // normal story pacing and leaves space for an unrelated intergroup invitation.
 const firstInvitation=s.socialCircles.invites[0];
 s=E.act(s,'circle:'+firstInvitation.id+':2');
 s.age=31;s.actions=3;
 if(second==='community'){
  s.people[1].world.ambition='Community service';
 }else if(second==='professional'){
  s.people[1].world.job=0;s.job={id:0,level:0,experience:0};
 }else if(second==='rival-family'){
  s.world.autonomy={version:1,alumni:[{
   id:'alumni-household',name:'Morgan',age:31,trust:34,rivalry:82,
   preference:3,connection:'former classmate',status:'rivals',
   profession:'Founder',collaborations:0,contests:0,lastInteractionAge:-1,
   partnerId:null,children:2,careerLevel:1,location:'hometown',
   history:[],schoolAge:12
  }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 }
 socialCirclesYear(s,{add:silent});
 assert.equal(s.socialCircles.groups.length,2);
 assert.equal(s.socialCircles.groups[1].kind,second);
 organizationNetworkYear(s,{add:silent});
 assert.equal(s.organizationNetwork.links.length,1);
 assert.ok(s.organizationNetwork.active,'grounded pair should open a public decision');
 assert.ok(E.validate(s));
 return s;
}
function act(s,i){
 const o=s.organizationNetwork.active;
 assert.ok(o,'expected a current public invitation');
 const cmd=E.commands(s).find(c=>c.id==='intergroup:'+o.id+':'+i);
 assert.ok(cmd?.enabled,'the chosen public option should be enabled');
 return E.act(s,cmd.id);
}
function step(s,years,groupYear=true){
 for(let i=0;i<years;i++){
  s.age++;s.actions=3;
  if(groupYear)socialCirclesYear(s,{add:silent});
  organizationNetworkYear(s,{add:silent});
 }
 return s;
}
test('new lifetimes start without invented group relations and old version-2 saves remain valid',()=>{
 const s=E.createLife({seed:122002});
 assert.deepEqual(E.organizationNetworkView(s).links,[]);
 assert.equal(s.organizationNetwork.version,1);
 assert.ok(E.validate(s));
 delete s.organizationNetwork;
 assert.ok(E.validate(s));
 assert.equal(E.organizationNetworkView(s).active,null);
 assert.deepEqual(E.organizationNetworkCommands(s),[]);
});
test('two real organizations with distinct living representatives form one link and public gathering',()=>{
 const s=setup(122003),l=s.organizationNetwork.links[0];
 assert.equal(l.aId,s.socialCircles.groups[0].id);
 assert.equal(l.bId,s.socialCircles.groups[1].id);
 assert.equal(l.status,'cooperating');
 assert.equal(l.leaderA,'person-'+s.people[0].id);
 assert.equal(l.leaderB,'person-'+s.people[1].id);
 assert.equal(l.event.status,'planned');
 assert.equal(l.event.dueAge,34);
 assert.equal(l.publicEventsHeld,0);
 assert.equal(E.organizationNetworkCommands(s).length,3);
 assert.ok(E.validate(s));
});
test('a professional network can cooperate with the family council without fictitious jobs',()=>{
 const s=setup(122004,'professional'),v=E.organizationNetworkView(s);
 assert.equal(s.job.id,0);
 assert.equal(s.people[1].world.job,0);
 assert.equal(v.links[0].bKind,'professional');
 assert.match(v.links[0].bName,/Career Network/);
 assert.equal(v.active.bKind,'professional');
 assert.ok(E.validate(s));
});
test('rival households with an actual parent begin in competitive rather than allied standing',()=>{
 const s=setup(122005,'rival-family'),l=s.organizationNetwork.links[0];
 assert.equal(l.theme,'contest');
 assert.ok(l.competition>=50);
 assert.ok(l.trust<60);
 assert.equal(l.leaderB,'alumni-household');
 assert.ok(E.validate(s));
});
test('brokering changes both actual organizations and two real leaders, never player money or RNG',()=>{
 const s=setup(122006),serialized=JSON.stringify(s);
 const l=s.organizationNetwork.links[0],a=s.socialCircles.groups[0],b=s.socialCircles.groups[1];
 const beforeA=s.people[0].world.trust,beforeB=s.people[1].world.trust;
 const next=act(s,0),rec=next.organizationNetwork.active.decisions[0];
 assert.equal(next.actions,2);
 assert.equal(next.rng,s.rng);assert.equal(next.cash,s.cash);
 assert.equal(next.organizationNetwork.links[0].trust,Math.min(100,l.trust+12));
 assert.equal(next.organizationNetwork.links[0].competition,Math.max(0,l.competition-8));
 assert.equal(next.socialCircles.groups[0].standing,Math.min(100,a.standing+3));
 assert.equal(next.socialCircles.groups[1].standing,Math.min(100,b.standing+3));
 assert.equal(next.socialCircles.groups[0].project.progress,a.project.progress+7);
 assert.equal(next.socialCircles.groups[1].project.progress,b.project.progress+7);
 assert.equal(next.people[0].world.trust,beforeA+5);
 assert.equal(next.people[1].world.trust,beforeB+5);
 assert.equal(next.stats.social,Math.min(100,s.stats.social+3));
 assert.equal(rec.aProgressDelta,7);assert.equal(rec.bProgressDelta,7);
 assert.equal(rec.npcTrustA,5);assert.equal(rec.npcTrustB,5);
 assert.equal(JSON.stringify(s),serialized,'player action must clone instead of mutating the source');
 assert.ok(E.validate(next));
});
test('taking one side has real asymmetric costs for organizations, leaders and rivalry',()=>{
 const s=setup(122007),out=act(s,1),l=out.organizationNetwork.links[0];
 assert.ok(l.trust<s.organizationNetwork.links[0].trust);
 assert.ok(l.competition>s.organizationNetwork.links[0].competition);
 assert.equal(out.socialCircles.groups[0].standing,s.socialCircles.groups[0].standing+4);
 assert.equal(out.socialCircles.groups[1].standing,s.socialCircles.groups[1].standing-3);
 assert.equal(out.people[0].world.trust,s.people[0].world.trust+6);
 assert.equal(out.people[1].world.trust,s.people[1].world.trust-5);
 assert.equal(out.people[1].world.rivalry,s.people[1].world.rivalry+8);
 assert.equal(out.cash,s.cash);assert.ok(E.validate(out));
});
test('respecting independence has no player stat, money, group, or NPC side effects',()=>{
 const s=setup(122008),snapshot=JSON.stringify(s);
 const n=act(s,2);
 assert.deepEqual(n.stats,s.stats);
 assert.deepEqual(n.people,s.people);
 assert.equal(n.cash,s.cash);assert.equal(n.rng,s.rng);
 assert.deepEqual(n.socialCircles.groups,s.socialCircles.groups);
 assert.deepEqual(n.organizationNetwork.links,s.organizationNetwork.links);
 assert.equal(n.organizationNetwork.active.decisions[0].tag,'independent');
 assert.equal(n.actions,s.actions-1);
 assert.equal(JSON.stringify(s),snapshot);
 assert.ok(E.validate(n));
});
test('one remaining regular activity suffices to respond to the public gathering',()=>{
 const s=setup(122009);s.actions=1;
 const next=act(s,0);
 assert.equal(next.actions,0);assert.ok(E.validate(next));
});
test('the two-year follow-up uses evolving public standing and ends with a genuine coalition',()=>{
 let s=setup(122010);
 s=act(s,0);
 const id=s.organizationNetwork.active.id;
 s=step(s,2);
 assert.equal(s.organizationNetwork.active.status,'ready');
 assert.equal(s.organizationNetwork.active.id,id);
 assert.ok(E.organizationNetworkCommands(s).some(c=>/Renew the intergroup agreement/.test(c.label)));
 s=act(s,0);
 const done=s.organizationNetwork.completed.at(-1);
 assert.equal(done.id,id);
 assert.equal(done.ending,'coalition');
 assert.equal(done.decisions.length,2);
 assert.equal(s.organizationNetwork.active,null);
 assert.ok(s.organizationNetwork.links[0].history.some(h=>h.kind==='player-story'));
 assert.ok(s.socialCircles.groups.every(g=>g.history.some(h=>h.outcome==='coalition')));
 assert.ok(E.chronicleView(s).timeline.some(x=>x.id==='intergroup-'+id));
 assert.ok(E.validate(s));
});
test('favoring two opposing sides can establish an intergroup feud',()=>{
 let s=setup(122011,'rival-family');
 s=act(s,1);s=step(s,2);
 s=act(s,1);
 const result=s.organizationNetwork.completed[0];
 assert.equal(result.ending,'public-feud');
 assert.ok(s.organizationNetwork.links[0].competition>=65);
 assert.ok(E.chronicleView(s).timeline.some(x=>x.id==='intergroup-'+result.id));
 assert.ok(E.validate(s));
});
test('the social-influence layer processes a coalition once and does not credit passive public fairs',()=>{
 let s=setup(122012),before=s.socialInfluence.scores.community;
 // Even multiple autonomous public events must never award player reputation.
 step(s,3);
 socialInfluenceYear(s,{add:silent});
 assert.equal(s.socialInfluence.scores.community,before);
 // The unanswered event cannot create a reputation claim.
 assert.equal(s.organizationNetwork.completed[0]?.ending,'unanswered');
 const candidate=E.organizationNetworkView(s);
 assert.ok(candidate.links[0].publicEventsHeld>=1);
 assert.ok(E.validate(s));
 let n=setup(122013);n=act(n,0);n=step(n,2);n=act(n,0);
 const start=n.socialInfluence.scores.community,rng=n.rng,cash=n.cash;
 socialInfluenceYear(n,{add:silent});
 assert.equal(n.socialInfluence.scores.community,start+7);
 const snapshot=JSON.stringify(n.socialInfluence);
 socialInfluenceYear(n,{add:silent});
 assert.equal(JSON.stringify(n.socialInfluence),snapshot);
 assert.equal(n.cash,cash);assert.equal(n.rng,rng);
 assert.ok(E.validate(n));
});
test('public events keep advancing without player activity or additional randomness',()=>{
 const s=setup(122014),l=s.organizationNetwork.links[0],initialId=l.event.id;
 const cash=s.cash,rng=s.rng,stats=JSON.stringify(s.stats),people=JSON.stringify(s.people);
 step(s,7);
 const updated=s.organizationNetwork.links[0];
 assert.ok(updated.publicEventsHeld>=2);
 assert.ok(updated.history.some(h=>h.kind==='public-event'));
 assert.notEqual(updated.event.id,initialId);
 assert.equal(s.cash,cash);assert.equal(s.rng,rng);
 assert.equal(JSON.stringify(s.stats),stats);
 assert.equal(JSON.stringify(s.people),people);
 assert.ok(E.validate(s));
});
test('public invitation expires without forcing stats, trust or cash changes',()=>{
 const s=setup(122015),id=s.organizationNetwork.active.id;
 const cash=s.cash,people=JSON.stringify(s.people),stats=JSON.stringify(s.stats);
 step(s,2);
 assert.equal(s.organizationNetwork.active,null);
 assert.ok(s.organizationNetwork.completed.some(o=>o.id===id&&o.ending==='unanswered'));
 assert.equal(s.cash,cash);
 assert.equal(JSON.stringify(s.people),people);
 assert.equal(JSON.stringify(s.stats),stats);
 assert.ok(E.validate(s));
});
test('leadership turns over when an existing leader dies; the intergroup log retains an accurate transition',()=>{
 const s=setup(122016,'professional'),link=s.organizationNetwork.links[0];
 // A real additional adult sibling means the family council can survive a loss.
 const older=s.people[0],other=s.people[1];
 const sibling={...JSON.parse(JSON.stringify(older)),id:s.nextId++,name:'Jordan',role:'sibling',
  age:24,alive:true,bond:60,world:{...JSON.parse(JSON.stringify(older.world)),
   ambition:'Family life',trust:61,rivalry:10}};
 s.people.push(sibling);
 older.alive=false;
 step(s,1);
 assert.equal(s.socialCircles.groups[0].status,'active');
 assert.equal(s.socialCircles.groups[0].leaderId,'person-'+other.id);
 assert.equal(link.leaderA,'person-'+other.id);
 assert.ok(link.history.some(h=>h.kind==='leadership'));
 assert.equal(older.alive,false);
 assert.ok(E.validate(s));
});
test('a group losing all living members pauses its public event and dissolves outdated player demands',()=>{
 const s=setup(122017,'rival-family');
 const l=s.organizationNetwork.links[0];
 s.world.autonomy.alumni=[];
 step(s,1);
 assert.equal(l.status,'dormant');
 assert.equal(l.leaderA,null);
 assert.equal(l.leaderB,null);
 assert.equal(l.event.status,'paused');
 assert.equal(s.organizationNetwork.active,null);
 assert.equal(s.organizationNetwork.completed.at(-1).ending,'dissolved');
 assert.ok(E.validate(s));
});
test('connections between several groups develop gradually without duplicate links',()=>{
 const s=setup(122018,'community');
 // The professional group is grounded in an actual other parent's job.
 s.people[0].world.job=0;s.job={id:0,level:0,experience:0};
 step(s,3);
 assert.ok(s.socialCircles.groups.some(g=>g.kind==='professional'));
 const keys=s.organizationNetwork.links.map(x=>x.key);
 assert.ok(keys.length>=2);
 assert.equal(new Set(keys).size,keys.length);
 assert.ok(keys.length<=6);
 assert.ok(E.validate(s));
});
test('institutional alliances persist across lifetimes without fabricated members, leaders, or money',()=>{
 let old=setup(122019);
 old=act(old,0);old=step(old,2);old=act(old,0);
 const heir=E.createLife({seed:122020,name:'Noah'});heir.generation=2;heir.age=18;
 const initialMoney=heir.cash,initialPeople=JSON.stringify(heir.people);
 socialCirclesInheritance(heir,old);organizationNetworkInheritance(heir,old);
 const l=heir.organizationNetwork.links[0];
 assert.equal(l.id,old.organizationNetwork.links[0].id);
 assert.equal(l.status,'dormant');assert.equal(l.leaderA,null);
 assert.equal(l.leaderB,null);assert.equal(l.event.status,'paused');
 assert.equal(heir.organizationNetwork.active,null);
 assert.equal(heir.organizationNetwork.completed.length,0);
 assert.match(heir.organizationNetwork.ancestors[0].note,/coalition/);
 assert.equal(heir.cash,initialMoney);
 assert.equal(JSON.stringify(heir.people),initialPeople);
 assert.ok(E.validate(heir));
 // Only real, new-generation relatives may renew old organizations.
 heir.people[1].world.ambition='Community service';
 heir.age=19;
 socialCirclesYear(heir,{add:silent});
 organizationNetworkYear(heir,{add:silent});
 assert.equal(heir.organizationNetwork.links.length,1);
 assert.notEqual(heir.organizationNetwork.links[0].status,'dormant');
 assert.ok(heir.organizationNetwork.links[0].leaderA.startsWith('person-'));
 assert.ok(heir.organizationNetwork.links[0].leaderB.startsWith('person-'));
 assert.ok(E.validate(heir));
});
test('malformed links, fabricated IDs, broken phases, and excessive history cannot be loaded',()=>{
 const s=setup(122021),raw=JSON.stringify(s);
 assert.ok(validateOrganizationNetwork(s.organizationNetwork));
 let bad=JSON.parse(raw);
 bad.organizationNetwork.links[0].trust=101;
 assert.equal(E.validate(bad),false);
 bad=JSON.parse(raw);bad.organizationNetwork.links[0].key='made-up-pair';
 assert.equal(E.validate(bad),false);
 bad=JSON.parse(raw);bad.organizationNetwork.links[0].event.progress=130;
 assert.equal(E.validate(bad),false);
 bad=JSON.parse(raw);bad.organizationNetwork.links[0].status='dormant';
 assert.equal(E.validate(bad),false);
 bad=JSON.parse(raw);bad.organizationNetwork.links.push({...bad.organizationNetwork.links[0]});
 assert.equal(E.validate(bad),false);
 bad=JSON.parse(raw);bad.organizationNetwork.active.status='completed';
 assert.equal(E.validate(bad),false);
 bad=JSON.parse(raw);
 bad.organizationNetwork.links[0].history=Array.from({length:9},()=>({
  age:31,kind:'public-event',label:'A fair',outcome:'successful'}));
 assert.equal(E.validate(bad),false);
 assert.ok(E.validate(JSON.parse(raw)));
});
test('normal engine age-up runs intergroup simulation without breaking existing yearly gameplay',()=>{
 const s=setup(122022);
 const after=E.ageUp(s);
 assert.ok(E.validate(after));
 assert.ok(E.organizationNetworkView(after).links.length>=1);
 assert.ok(Array.isArray(E.organizationNetworkView(after).news));
});
