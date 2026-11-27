import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {socialCirclesYear,socialCirclesInheritance} from '../src/content/social-circles.mjs';
import {organizationNetworkYear,organizationNetworkInheritance} from '../src/content/organization-relations.mjs';
import {playableEventsInheritance} from '../src/content/playable-public-events.mjs';
import {publicAftermathYear,publicAftermathView,publicAftermathInheritance,
 validatePublicAftermath} from '../src/content/public-aftermath.mjs';
import {socialInfluenceYear} from '../src/content/social-influence.mjs';
const silent=()=>{};
function world(seed=124001,kind='community'){
 let s=E.createLife({seed,name:'Alex'});s.age=30;s.actions=3;
 for(const p of s.people){
  p.world.trust=72;p.world.rivalry=8;p.world.cash=9000;p.world.debt=0;
  p.world.ambition='Family life';
 }
 socialCirclesYear(s,{add:silent});
 assert.equal(s.socialCircles.groups[0].kind,'family');
 s=E.act(s,'circle:'+s.socialCircles.invites[0].id+':2');
 s.age=31;s.actions=3;
 if(kind==='community')s.people[1].world.ambition='Community service';
 else if(kind==='professional'){s.people[1].world.job=0;s.job={id:0,level:0,experience:0};}
 else if(kind==='rival-family'){
  s.world.autonomy={version:1,alumni:[{
   id:'alumni-rival-house',name:'Morgan',age:31,trust:34,rivalry:82,preference:3,
   connection:'former classmate',status:'rivals',profession:'Founder',
   collaborations:0,contests:0,lastInteractionAge:-1,partnerId:null,
   children:2,careerLevel:1,location:'hometown',history:[],schoolAge:12
  }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 }
 socialCirclesYear(s,{add:silent});
 organizationNetworkYear(s,{add:silent});
 assert.ok(E.validate(s));return s;
}
function outcome(seed,mode='festival',choices=[0,0,0],kind='community'){
 let s=world(seed,kind);
 const command=E.playableEventCommands(s).find(x=>x.id.endsWith(':'+mode));
 assert.ok(command?.enabled,mode+' should have an available event');
 s=E.act(s,command.id);
 for(const index of choices)s=E.playableEventDecision(s,index);
 assert.equal(s.playableEvents.active,null);
 publicAftermathYear(s,{add:silent});
 assert.ok(E.validate(s));
 return s;
}
function annual(s,count,{groups=true}={}){
 for(let i=0;i<count;i++){
  s.age++;s.actions=3;
  if(groups)socialCirclesYear(s,{add:silent});
  organizationNetworkYear(s,{add:silent});
  publicAftermathYear(s,{add:silent});
 }
 return s;
}
function choose(s,i){
 const t=s.publicAftermath.threads.find(x=>x.pending);
 assert.ok(t,'expected eligible long-term followup');
 const id='afterlife:'+t.id+':'+i;
 assert.ok(E.commands(s).find(x=>x.id===id)?.enabled,'follow-up option not available');
 return E.act(s,id);
}

test('version-2 historical saves without publicAftermath remain loadable',()=>{
 const s=E.createLife({seed:124002});
 assert.ok(E.validate(s));assert.deepEqual(E.publicAftermathView(s).threads,[]);
 delete s.publicAftermath;assert.ok(E.validate(s));
 assert.deepEqual(E.publicAftermathCommands(s),[]);
});
test('public festivals start a real community saga anchored to actual people and organizations',()=>{
 const s=outcome(124003),t=s.publicAftermath.threads[0],event=s.playableEvents.completed[0];
 assert.equal(t.sourceId,event.id);assert.equal(t.sourceEnding,'celebrated');
 assert.equal(t.kind,'community-legacy');
 assert.equal(t.aId,'person-'+s.people[0].id);
 assert.equal(t.bId,'person-'+s.people[1].id);
 assert.equal(t.groupAId,s.socialCircles.groups[0].id);
 assert.equal(t.groupBId,s.socialCircles.groups[1].id);
 assert.equal(t.startedAge,s.age);
 assert.equal(t.nextAge,s.age+3);
 assert.ok(t.history.some(x=>x.kind==='milestone'));
 assert.ok(s.publicAftermath.seen.includes(event.id));
 assert.ok(E.validate(s));
});
test('positive negotiations start a lasting agreement, negative ones a public feud',()=>{
 const positive=outcome(124004,'negotiation');
 const negative=outcome(124005,'negotiation',[1,1,1]);
 assert.equal(positive.publicAftermath.threads[0].kind,'agreement-network');
 assert.equal(negative.publicAftermath.threads[0].kind,'agreement-feud');
 assert.equal(negative.playableEvents.completed[0].ending,'escalation');
 assert.ok(positive.publicAftermath.threads[0].affinity>negative.publicAftermath.threads[0].affinity);
 assert.ok(E.validate(positive));assert.ok(E.validate(negative));
});
test('losing an actual leadership election yields a rival story between real winner and loser',()=>{
 const s=outcome(124006,'election',[1,1,1]),e=s.playableEvents.completed[0],
  t=s.publicAftermath.threads[0];
 assert.equal(e.ending,'new-leader');
 assert.equal(t.kind,'election-rivalry');
 assert.equal(t.aId,e.ballot.incumbentId);
 assert.equal(t.bId,e.ballot.challengerId);
 assert.ok(s.socialCircles.groups[0].members.includes(t.aId));
 assert.ok(s.socialCircles.groups[0].members.includes(t.bId));
 assert.ok(E.validate(s));
});
test('professional challenge outcomes become real collaborations or professional feuds',()=>{
 const work=outcome(124007,'competition',[0,0,0],'professional');
 const bitter=outcome(124008,'competition',[1,1,1],'professional');
 assert.equal(work.publicAftermath.threads[0].kind,'professional-network');
 assert.equal(bitter.publicAftermath.threads[0].kind,'professional-feud');
 assert.ok(E.validate(work));assert.ok(E.validate(bitter));
});
test('independent, abandoned, interrupted, and non-consequential endings create no false saga',()=>{
 let s=world(124009);const id=E.playableEventCommands(s)
  .find(x=>x.id.endsWith(':festival')).id;
 s=E.act(s,id);
 for(let i=0;i<3;i++)s=E.playableEventDecision(s,2);
 assert.equal(s.playableEvents.completed[0].ending,'independent');
 publicAftermathYear(s,{add:silent});
 assert.deepEqual(s.publicAftermath.threads,[]);
 assert.equal(s.publicAftermath.seen.length,1);
 const replay=JSON.stringify(s.publicAftermath);
 publicAftermathYear(s,{add:silent});
 assert.equal(JSON.stringify(s.publicAftermath),replay);
 assert.ok(E.validate(s));
});
test('three-year autonomous echo changes only real NPCs and groups, not player money or RNG',()=>{
 const s=outcome(124010),cash=s.cash,rng=s.rng,stats=JSON.stringify(s.stats);
 const t=s.publicAftermath.threads[0],trust=s.people[0].world.trust;
 annual(s,3);
 assert.equal(t.chapter,1);
 assert.equal(t.pending,true);
 assert.ok(s.people[0].world.trust>trust);
 assert.ok(t.history.some(x=>x.kind==='autonomy'));
 assert.equal(s.cash,cash);assert.equal(s.rng,rng);
 assert.equal(JSON.stringify(s.stats),stats);
 assert.equal(E.publicAftermathCommands(s).length,3);
 assert.ok(E.validate(s));
});
test('election losers independently become more competitive over the years',()=>{
 const s=outcome(124011,'election',[1,1,1]),t=s.publicAftermath.threads[0],
  rivalry=s.people[0].world.rivalry;
 annual(s,3);
 assert.equal(t.kind,'election-rivalry');
 assert.ok(t.friction>t.affinity);
 assert.ok(s.people[0].world.rivalry>rivalry);
 assert.equal(t.pending,true);
 assert.ok(E.validate(s));
});
test('repairing a rift has real changes in trust, group projects and earned reputation',()=>{
 let s=outcome(124012),old=JSON.stringify(s);annual(s,3);
 // First record the original festival's influence, so this assertion
 // isolates only the new follow-up's earned reputation.
 socialInfluenceYear(s,{add:silent});
 const before=s,contact=before.publicAftermath.threads[0],
  previous=before.socialInfluence.scores.community;
 s=choose(before,0);
 const active=s.publicAftermath.threads[0];
 assert.equal(s.actions,2);
 assert.equal(active.pending,false);
 assert.ok(s.people[0].world.trust>before.people[0].world.trust);
 assert.equal(active.decisions.length,1);
 assert.equal(active.decisions[0].tag,'repair');
 assert.ok(active.decisions[0].networkTrust>=0);
 assert.equal(s.cash,before.cash);assert.equal(s.rng,before.rng);
 socialInfluenceYear(s,{add:silent});
 assert.equal(s.socialInfluence.scores.community,previous+3);
 const copy=JSON.stringify(s.socialInfluence);
 socialInfluenceYear(s,{add:silent});
 assert.equal(JSON.stringify(s.socialInfluence),copy);
 assert.ok(E.chronicleView(s).timeline.some(x=>x.id.startsWith('aftermath-'+contact.id)));
 assert.ok(E.validate(s));assert.notEqual(JSON.stringify(s),old);
});
test('supporting an old feud can actively polarize both real people',()=>{
 let s=outcome(124013,'negotiation',[1,1,1]);
 annual(s,3);
 const former=s,oldTrust=former.organizationNetwork.links[0].trust;
 s=choose(former,1);
 assert.ok(s.organizationNetwork.links[0].trust<oldTrust);
 assert.ok(s.people[0].world.rivalry>former.people[0].world.rivalry);
 assert.ok(s.publicAftermath.threads[0].friction>former.publicAftermath.threads[0].friction);
 assert.equal(s.cash,former.cash);
 assert.ok(E.validate(s));
});
test('neutral response costs one normal activity but changes no player, group, or NPC attributes',()=>{
 let s=outcome(124014);annual(s,3);
 const before=JSON.stringify(s);
 const next=choose(s,2);
 assert.equal(next.actions,s.actions-1);
 assert.deepEqual(next.people,s.people);
 assert.deepEqual(next.stats,s.stats);
 assert.deepEqual(next.socialCircles.groups,s.socialCircles.groups);
 assert.deepEqual(next.organizationNetwork.links,s.organizationNetwork.links);
 assert.equal(next.publicAftermath.threads[0].decisions[0].tag,'independent');
 assert.equal(next.cash,s.cash);
 assert.equal(next.rng,s.rng);
 assert.equal(JSON.stringify(s),before);
 assert.ok(E.validate(next));
});
test('an existing business can record a real named joint venture without minting revenue or capital',()=>{
 let s=outcome(124015,'competition',[0,0,0],'professional');
 s.business={sector:'service',capital:20000,quality:60,
  employees:0,products:[],demand:50,competition:50,
  revenue:0,payroll:0,operating:0,lastProfit:0};
 assert.ok(E.validate(s));
 annual(s,3);
 const cash=s.cash,capital=s.business.capital,revenue=s.business.revenue;
 const next=choose(s,0);
 const t=next.publicAftermath.threads[0];
 assert.equal(t.partnership,'joint-venture');
 assert.equal(next.business.partners.length,1);
 const partner=next.business.partners[0];
 assert.ok(next.people.some(p=>'person-'+p.id===partner.personId&&p.alive));
 assert.equal(partner.sourceId,t.sourceId);
 assert.equal(next.cash,cash);assert.equal(next.business.capital,capital);
 assert.equal(next.business.revenue,revenue);
 assert.ok(E.validate(next));
});
test('without an actual business a professional partnership is recorded only as collaboration',()=>{
 let s=outcome(124016,'competition',[0,0,0],'professional');
 annual(s,3);
 const next=choose(s,0);
 assert.equal(next.publicAftermath.threads[0].partnership,'joint-project');
 assert.equal(next.business,null);
 assert.ok(E.validate(next));
});
test('optional missed invitations never trap aging or give the player penalties',()=>{
 const s=outcome(124017),before=JSON.stringify(s.stats),cash=s.cash;
 annual(s,3);
 assert.equal(s.publicAftermath.threads[0].pending,true);
 annual(s,2);
 assert.equal(s.publicAftermath.threads[0].pending,false);
 assert.ok(s.publicAftermath.threads[0].history.some(x=>x.text.includes('expired')));
 assert.equal(JSON.stringify(s.stats),before);
 assert.equal(s.cash,cash);assert.ok(E.validate(s));
});
test('old public stories reach other organizations only when a real member links them',()=>{
 let s=outcome(124018,'competition',[0,0,0],'professional');
 s.people[0].world.ambition='Community service';
 annual(s,3);
 const t=s.publicAftermath.threads[0],third=s.socialCircles.groups.find(g=>
  g.id!==t.groupAId&&g.id!==t.groupBId&&g.members.includes(t.aId));
 if(third){
  const before=third.standing;
  const n=choose(s,0);
  const real=n.socialCircles.groups.find(x=>x.id===third.id);
  assert.equal(real.standing,Math.min(100,before+2));
  assert.equal(n.publicAftermath.threads[0].decisions[0].spillGroup,third.id);
  assert.ok(E.validate(n));
 }
});
test('a real death ends a saga without resurrecting a lost participant',()=>{
 const s=outcome(124019),t=s.publicAftermath.threads[0],person=s.people[0];
 person.alive=false;s.age++;
 publicAftermathYear(s,{add:silent});
 assert.equal(s.publicAftermath.threads.length,0);
 assert.equal(s.publicAftermath.archive[0].ending,'unavailable');
 assert.equal(person.alive,false);
 assert.ok(E.validate(s));
});
test('long-running sagas archive automatically after eighteen years with bounded history',()=>{
 let s=outcome(124020);
 const id=s.publicAftermath.threads[0].id;
 annual(s,18);
 assert.equal(s.publicAftermath.threads.some(t=>t.id===id),false);
 assert.ok(s.publicAftermath.archive.some(t=>t.id===id));
 assert.ok(s.publicAftermath.archive[0].history.length<=12);
 assert.ok(E.validate(s));
});
test('multi-generation memory transfers only records, not real people or personal partnerships',()=>{
 let s=outcome(124021);
 annual(s,3);s=choose(s,0);
 const heir=E.createLife({seed:124022,name:'Rowan'});heir.generation=2;heir.age=18;
 const money=heir.cash,people=JSON.stringify(heir.people);
 socialCirclesInheritance(heir,s);
 organizationNetworkInheritance(heir,s);
 playableEventsInheritance(heir,s);
 publicAftermathInheritance(heir,s);
 assert.equal(heir.publicAftermath.threads.length,0);
 assert.equal(heir.publicAftermath.archive.length,0);
 assert.equal(heir.publicAftermath.seen.length,0);
 assert.match(heir.publicAftermath.ancestors[0].note,/community-legacy/);
 assert.equal(heir.cash,money);
 assert.equal(JSON.stringify(heir.people),people);
 assert.ok(E.validate(heir));
});
test('strict save validation rejects impossible saga phases, invented historical choices, and duplicate identities',()=>{
 const s=outcome(124023),json=JSON.stringify(s);
 assert.ok(validatePublicAftermath(s.publicAftermath));
 let x=JSON.parse(json);x.publicAftermath.threads[0].affinity=111;
 assert.equal(E.validate(x),false);
 x=JSON.parse(json);x.publicAftermath.threads[0].pending=true;
 assert.equal(E.validate(x),false);
 x=JSON.parse(json);x.publicAftermath.threads[0].aId=x.publicAftermath.threads[0].bId;
 assert.equal(E.validate(x),false);
 x=JSON.parse(json);x.publicAftermath.seen.push(x.publicAftermath.seen[0]);
 assert.equal(E.validate(x),false);
 x=JSON.parse(json);x.publicAftermath.threads.push({...x.publicAftermath.threads[0]});
 assert.equal(E.validate(x),false);
 x=JSON.parse(json);x.publicAftermath.threads[0].history=Array.from({length:13},()=>({
  age:32,kind:'milestone',text:'A real news story',detail:'An event'}));
 assert.equal(E.validate(x),false);
 assert.ok(E.validate(JSON.parse(json)));
});
test('normal engine age-up continues autonomous events and existing game systems',()=>{
 const s=outcome(124024),aged=E.ageUp(s);
 assert.ok(E.validate(aged));
 assert.ok(E.publicAftermathView(aged).threads.length>=1);
});
