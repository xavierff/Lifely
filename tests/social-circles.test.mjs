import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {
 socialCirclesYear,socialCirclesState,socialCirclesView,socialCirclesInheritance,
 validateSocialCircles
} from '../src/content/social-circles.mjs';
import {socialInfluenceYear} from '../src/content/social-influence.mjs';

const noop=()=>{};
function base(seed=121001,type='family'){
 const s=E.createLife({seed,name:'Alex'});s.age=28;s.actions=3;
 for(const p of s.people){
  p.world.trust=72;p.world.rivalry=7;p.world.cash=13000;p.world.debt=0;p.world.ambition='Family life';
 }
 if(type==='professional'){
  s.job={id:0,level:0,experience:0};
  s.people[0].world.job=0;
 }else if(type==='community'){
  s.people[0].world.ambition='Community service';
 }else if(type==='rival-family'){
  s.world.autonomy={version:1,alumni:[{
   id:'alumni-rival',name:'Ren',age:28,trust:34,rivalry:78,
   preference:3,connection:'former classmate',status:'rivals',
   profession:'Founder',collaborations:0,contests:0,lastInteractionAge:-1,
   partnerId:null,children:2,careerLevel:1,location:'hometown',
   history:[],schoolAge:12
  }],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]};
 }
 socialCirclesYear(s,{add:noop,careerTitle:'Technical specialist'});
 assert.ok(s.socialCircles.groups.length>0,'expected a grounded group');
 assert.equal(s.socialCircles.groups[0].kind,type);
 assert.equal(s.socialCircles.invites.length,1);
 assert.ok(E.validate(s),'test life must validate');
 return s;
}
const choose=(s,index)=>{
 const o=s.socialCircles.invites[0];
 assert.ok(o,'missing active group invitation');
 const id='circle:'+o.id+':'+index;
 const cmd=E.commands(s).find(c=>c.id===id);
 assert.ok(cmd?.enabled,'missing or disabled choice '+id);
 return E.act(s,id);
};
const years=(s,count)=>{
 for(let k=0;k<count;k++){s.age++;s.actions=3;socialCirclesYear(s,{add:noop});}
 return s;
};
test('old version-2 saves remain compatible; fresh lives start without phantom institutions',()=>{
 const s=E.createLife({seed:121002});
 assert.deepEqual(E.socialCirclesView(s).groups,[]);
 assert.ok(E.validate(s));
 delete s.socialCircles;
 assert.ok(E.validate(s));
 assert.equal(E.socialCirclesView(s).invites.length,0);
 assert.deepEqual(E.socialCirclesCommands(s),[]);
});
test('a family council forms only from real adult relatives and gets an independent project',()=>{
 const s=base(121003,'family'),g=s.socialCircles.groups[0];
 assert.equal(g.kind,'family');
 assert.equal(g.members.length,2);
 assert.ok(g.members.every(id=>s.people.some(p=>'person-'+p.id===id)));
 assert.ok(g.leaderId);
 assert.equal(g.project.status,'active');
 assert.equal(g.project.startedAge,28);
 assert.equal(g.completedProjects,0);
 assert.equal(s.socialCircles.invites[0].personId,g.leaderId);
 assert.equal(E.socialCirclesCommands(s).length,3);
 assert.ok(E.validate(s));
});
test('professional groups reference actual shared careers rather than imaginary employers',()=>{
 const s=base(121004,'professional'),g=s.socialCircles.groups[0];
 assert.equal(g.kind,'professional');
 assert.equal(g.members[0],'person-'+s.people[0].id);
 assert.match(g.name,/Technical specialist/);
 assert.equal(g.project.status,'active');
 assert.ok(E.validate(s));
});
test('community groups require actual service-minded acquaintances',()=>{
 const s=base(121005,'community'),g=s.socialCircles.groups[0];
 assert.equal(g.kind,'community');
 assert.deepEqual(g.members,['person-'+s.people[0].id]);
 assert.equal(g.name,'Neighborhood Service Assembly');
 assert.ok(E.validate(s));
});
test('a rival household requires an actual alumnus with children and documented rivalry',()=>{
 const s=base(121006,'rival-family'),g=s.socialCircles.groups[0];
 assert.equal(g.kind,'rival-family');
 assert.equal(g.anchorId,'alumni-rival');
 assert.deepEqual(g.members,['alumni-rival']);
 assert.match(g.name,/Ren/);
 assert.ok(E.validate(s));
 const without=E.createLife({seed:121007});without.age=28;
 without.world.autonomy={...s.world.autonomy,
  alumni:s.world.autonomy.alumni.map(p=>({...p,children:0}))};
 socialCirclesYear(without,{add:noop});
 assert.equal(without.socialCircles.groups.some(x=>x.kind==='rival-family'),false);
 assert.ok(E.validate(without));
});
test('helping a group changes only real NPC trust, skills and the project itself',()=>{
 const s=base(121008),original=JSON.stringify(s);
 const p=s.people[0],g=s.socialCircles.groups[0];
 const next=choose(s,0);
 assert.equal(next.actions,2);
 assert.equal(next.rng,s.rng);
 assert.equal(next.cash,s.cash);
 const actual=next.people.find(x=>'person-'+x.id===next.socialCircles.invites[0].personId);
 assert.equal(actual.world.trust,p.world.trust+7);
 assert.equal(actual.world.rivalry,Math.max(0,p.world.rivalry-4));
 assert.equal(next.socialCircles.groups[0].standing,g.standing+5);
 assert.equal(next.socialCircles.groups[0].project.progress,g.project.progress+14);
 assert.equal(next.stats.kindness,Math.min(100,s.stats.kindness+3));
 assert.equal(next.socialCircles.invites[0].status,'waiting');
 assert.equal(next.socialCircles.invites[0].decisions[0].progressDelta,14);
 assert.equal(JSON.stringify(s),original);
 assert.ok(E.validate(next));
});
test('a rival family can be negotiated with or escalated, with different real consequences',()=>{
 const s=base(121009,'rival-family'),snapshot=JSON.stringify(s);
 const calm=choose(s,0),fight=choose(JSON.parse(snapshot),1);
 assert.ok(calm.world.autonomy.alumni[0].rivalry<s.world.autonomy.alumni[0].rivalry);
 assert.ok(fight.world.autonomy.alumni[0].rivalry>s.world.autonomy.alumni[0].rivalry);
 assert.ok(calm.socialCircles.groups[0].tension<fight.socialCircles.groups[0].tension);
 assert.equal(calm.cash,s.cash);
 assert.equal(fight.cash,s.cash);
 assert.ok(E.validate(calm));assert.ok(E.validate(fight));
});
test('respecting NPC autonomy is neutral for resources, trust, reputation and stats',()=>{
 const s=base(121010),serialized=JSON.stringify(s);
 const neutral=choose(s,2);
 assert.equal(neutral.cash,s.cash);
 assert.deepEqual(neutral.stats,s.stats);
 assert.deepEqual(neutral.people,s.people);
 assert.deepEqual(neutral.socialInfluence.scores,s.socialInfluence.scores);
 assert.deepEqual(neutral.socialCircles.groups,s.socialCircles.groups);
 assert.equal(neutral.socialCircles.invites[0].status,'waiting');
 assert.equal(neutral.socialCircles.invites[0].decisions[0].standingDelta,0);
 assert.equal(JSON.stringify(s),serialized);
 assert.ok(E.validate(neutral));
});
test('players can use their final normal activity on a network invitation',()=>{
 const s=base(121011);s.actions=1;
 const next=choose(s,0);
 assert.equal(next.actions,0);assert.ok(E.validate(next));
});
test('groups independently make multi-year progress without consuming the player RNG or cash',()=>{
 const s=base(121012),initial=s.socialCircles.groups[0],first=initial.project.id;
 const rng=s.rng,cash=s.cash,stats=JSON.stringify(s.stats),people=JSON.stringify(s.people);
 years(s,6);
 const updated=s.socialCircles.groups.find(g=>g.id===initial.id);
 assert.equal(updated.completedProjects>=1,true);
 assert.ok(updated.history.some(h=>h.kind==='project'));
 assert.notEqual(updated.project.id,first);
 assert.equal(s.rng,rng);assert.equal(s.cash,cash);
 assert.equal(JSON.stringify(s.stats),stats);
 assert.equal(JSON.stringify(s.people),people);
 assert.ok(s.socialCircles.completed.some(o=>o.ending==='unanswered'));
 assert.ok(E.validate(s));
});
test('a two-year callback creates a real alliance and reaches the Life Chronicle',()=>{
 let s=base(121013),offer=s.socialCircles.invites[0],groupId=s.socialCircles.groups[0].id;
 s=choose(s,0);
 s=years(s,2);
 assert.equal(s.socialCircles.invites[0].id,offer.id);
 assert.equal(s.socialCircles.invites[0].status,'ready');
 s=choose(s,0);
 assert.equal(s.socialCircles.invites.length,0);
 const ended=s.socialCircles.completed.find(x=>x.id===offer.id);
 assert.equal(ended.ending,'alliance');
 assert.equal(ended.decisions.length,2);
 assert.ok(s.socialCircles.groups.find(g=>g.id===groupId).history.some(x=>x.kind==='relationship'));
 assert.ok(E.chronicleView(s).timeline.some(x=>x.id==='social-circle-'+offer.id));
 assert.ok(E.validate(s));
});
test('a meaningful group alliance increases the right social circle exactly once',()=>{
 let s=base(121014);
 s=choose(s,0);s=years(s,2);s=choose(s,0);
 const before=s.socialInfluence.scores.family,rng=s.rng,cash=s.cash;
 socialInfluenceYear(s,{add:noop});
 assert.equal(s.socialInfluence.scores.family,before+7);
 assert.equal(s.socialInfluence.scores.professional,50);
 const saved=JSON.stringify(s.socialInfluence);
 socialInfluenceYear(s,{add:noop});
 assert.equal(JSON.stringify(s.socialInfluence),saved);
 assert.equal(s.cash,cash);assert.equal(s.rng,rng);
 assert.ok(E.validate(s));
});
test('an unanswered group invitation never changes actual player or NPC data',()=>{
 const s=base(121015),original=s.socialCircles.invites[0],oldStats=JSON.stringify(s.stats),
  cash=s.cash,oldPeople=JSON.stringify(s.people);
 years(s,2);
 assert.equal(s.socialCircles.completed.find(x=>x.id===original.id)?.ending,'unanswered');
 assert.equal(JSON.stringify(s.stats),oldStats);
 assert.equal(JSON.stringify(s.people),oldPeople);
 assert.equal(s.cash,cash);
 assert.ok(E.validate(s));
});
test('groups become dormant when no member survives and never revive a deceased person',()=>{
 const s=base(121016),g=s.socialCircles.groups[0];
 for(const p of s.people)p.alive=false;
 years(s,1);
 assert.equal(s.socialCircles.groups[0].status,'dormant');
 assert.deepEqual(s.socialCircles.groups[0].members,[]);
 assert.equal(s.socialCircles.groups[0].leaderId,null);
 assert.equal(s.socialCircles.groups[0].project.status,'paused');
 assert.equal(s.socialCircles.completed[0].ending,'interrupted');
 assert.ok(s.people.every(p=>!p.alive));
 assert.ok(E.validate(s));
});
test('an old rival household does not automatically enroll an unrelated rival',()=>{
 const s=base(121017,'rival-family'),g=s.socialCircles.groups[0];
 s.world.autonomy.alumni[0].children=0;
 s.world.autonomy.alumni.push({...s.world.autonomy.alumni[0],
  id:'unrelated-rival',name:'Morgan',children:2,rivalry:90});
 years(s,1);
 assert.equal(g.status,'dormant');
 assert.deepEqual(g.members,[]);
 assert.ok(E.validate(s));
});
test('a family organization and its projects survive generational transition without inherited personal allegiance',()=>{
 let s=base(121018),g=s.socialCircles.groups[0];
 s=choose(s,0);s=years(s,2);s=choose(s,0);
 const heir=E.createLife({seed:121019,name:'Rowan'});heir.generation=2;heir.age=18;
 const money=heir.cash,people=JSON.stringify(heir.people);
 socialCirclesInheritance(heir,s);
 assert.equal(heir.socialCircles.groups.length,1);
 const inherited=heir.socialCircles.groups[0];
 assert.equal(inherited.id,g.id);
 assert.equal(inherited.status,'dormant');
 assert.deepEqual(inherited.members,[]);
 assert.equal(inherited.leaderId,null);
 assert.equal(inherited.project.status,'paused');
 assert.equal(heir.socialCircles.invites.length,0);
 assert.equal(heir.socialCircles.completed.length,0);
 assert.match(heir.socialCircles.ancestors[0].note,/alliance/);
 assert.equal(heir.cash,money);
 assert.equal(JSON.stringify(heir.people),people);
 assert.ok(E.validate(heir));
 heir.age=19;socialCirclesYear(heir,{add:noop});
 assert.equal(heir.socialCircles.groups[0].id,g.id);
 assert.equal(heir.socialCircles.groups[0].status,'active');
 assert.ok(heir.socialCircles.groups[0].members.every(id=>
  heir.people.some(p=>'person-'+p.id===id&&p.alive)));
 assert.ok(E.validate(heir));
});
test('multiple grounded groups form gradually; there are never more than four',()=>{
 const s=base(121020,'rival-family');
 s.job={id:0,level:0,experience:0};
 s.people[0].world.job=0;
 s.people[1].world.ambition='Community service';
 years(s,3);
 assert.deepEqual(s.socialCircles.groups.map(x=>x.kind),
  ['rival-family','professional','community','family']);
 assert.equal(new Set(s.socialCircles.groups.map(x=>x.id)).size,4);
 assert.ok(E.validate(s));
});
test('corrupted identities, fake membership, unbounded histories and impossible progress fail validation',()=>{
 const s=base(121021),raw=JSON.stringify(s);
 assert.ok(validateSocialCircles(s.socialCircles));
 let x=JSON.parse(raw);x.socialCircles.groups[0].members.push(x.socialCircles.groups[0].members[0]);
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.socialCircles.groups[0].project.progress=130;
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.socialCircles.groups[0].leaderId='person-999';
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.socialCircles.groups[0].history=Array.from({length:9},()=>({
  age:28,kind:'project',title:'foo',outcome:'progress',description:'bar'}));
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.socialCircles.invites[0].status='completed';
 assert.equal(E.validate(x),false);
 x=JSON.parse(raw);x.socialCircles.groups.push({...x.socialCircles.groups[0]});
 assert.equal(E.validate(x),false);
 assert.ok(E.validate(JSON.parse(raw)));
});
test('normal engine age-up drives the same autonomous group world',()=>{
 const s=base(121022),rng=s.rng;
 const after=E.ageUp(s);
 assert.ok(E.validate(after));
 assert.ok(after.socialCircles.groups.length>=1);
 assert.ok(after.rng!==rng,'the rest of the game still runs its regular random events');
 const view=E.socialCirclesView(after);
 assert.ok(view.groups.some(x=>x.completedProjects>=0));
});
