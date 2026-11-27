import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {storyOpportunities,flowSummary} from '../src/content/life-flow.mjs';
import {ambitionTypes,ambitionTrack} from '../src/content/personal-ambitions.mjs';
import {socialCirclesYear} from '../src/content/social-circles.mjs';
function life(seed=130001){
 const s=E.createLife({seed,name:'Alex'});s.age=28;s.actions=3;
 for(const p of s.people){p.world.trust=72;p.world.rivalry=7;p.world.ambition='Family life';}
 socialCirclesYear(s,{add:()=>{}});
 return s;
}
test('1.30: actual optional choices are grouped by story with real names and no mutation',()=>{
 const s=life(),o=s.socialCircles.invites[0],before=JSON.stringify(s);
 const list=storyOpportunities(s,E.commands(s)),row=list.find(x=>x.id==='circle:'+o.id);
 assert.equal(row.title,o.personName);assert.equal(row.choices.length,3);
 assert.ok(row.choices.every(c=>E.commands(s).some(x=>x.id===c.id&&x.enabled)));
 assert.equal(JSON.stringify(s),before);
 assert.equal(flowSummary(s,E.commands(s)).opportunities.length,list.length);
});
test('1.30: blocked choices, ordinary actions and duplicates do not clutter the opportunity list',()=>{
 const s=life(130002),c=E.commands(s).filter(x=>x.id.startsWith('circle:'));
 assert.equal(storyOpportunities(s,[...c,...c]).find(x=>x.id.startsWith('circle:')).choices.length,3);
 assert.deepEqual(storyOpportunities(s,[{id:'learn',enabled:true,label:'Learn'},...c.map(x=>({...x,enabled:false}))]),[]);
 s.actions=0;assert.deepEqual(storyOpportunities(s,E.commands(s)),[]);
});
test('1.30: new contextual goals require relevant current stories and track a real supportive action',()=>{
 const empty=E.createLife({seed:130003});empty.age=28;
 assert.equal(E.commands(empty).some(x=>x.id==='ambition:begin:institutional-steward'),false);
 let s=life(130004),o=s.socialCircles.invites[0];
 assert.ok(E.commands(s).some(x=>x.id==='ambition:begin:institutional-steward'&&x.enabled));
 s=E.act(s,'ambition:begin:institutional-steward');assert.equal(s.ambitions.active.counts['circle-support']||0,0);
 const n=E.act(s,'circle:'+o.id+':0');
 assert.equal(n.ambitions.active.counts['circle-support'],1);
 assert.equal(E.ambitionSummary(n).active.steps[0].achieved,true);assert.ok(E.validate(n));
});
test('1.30: neutral and rival actions do not count as constructive ambition milestones',()=>{
 let s=life(130005),o=s.socialCircles.invites[0];s=E.act(s,'ambition:begin:institutional-steward');
 for(const i of [1,2]){
  const n=E.act(s,'circle:'+o.id+':'+i);
  assert.equal(n.ambitions.active.counts['circle-support']||0,0);
  assert.ok(E.validate(n));
 }
});
test('1.30: seven new ambitions are distinct, contextual and track only specified action types',()=>{
 const ids=['npc-mentor','bridge-builder','fair-collaborator','trusted-citizen','institutional-steward','public-problem-solver','faction-mediator'];
 assert.ok(ids.every(id=>ambitionTypes.some(x=>x.id===id&&x.requires)));
 const s=life(130006);s.ambitions.active={counts:{}};
 for(const id of ['npcgoal:n:0','cross:respond:n:0','clash:n:0','influence:n:0','circle:n:0','circle:fracture:n:0','mandate:delivery:n:0','intergroup:n:0'])ambitionTrack(s,id);
 assert.deepEqual(s.ambitions.active.counts,{'npc-support':1,'cross-repair':1,'clash-cooperate':1,'influence-engage':1,'circle-support':1,'fracture-mediate':1,'public-support':2});
 ambitionTrack(s,'circle:succession:n:0');ambitionTrack(s,'mandate:reversal:n:2');assert.equal(s.ambitions.active.counts['circle-support'],1);assert.equal(s.ambitions.active.counts['public-support'],2);
});
