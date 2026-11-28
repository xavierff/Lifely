import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {dramas,dramaYear,dramaView,validateDrama} from '../src/content/dramatic-stories.mjs';
import {branchingDramas,branchingScene} from '../src/content/branching-dramas.mjs';
import {lifeEnding,mergeLife,emptyProfile} from '../src/profile.mjs';
function fixture(id='unopened-box'){
 const d=branchingDramas.find(x=>x.id===id),s=E.createLife({seed:172001,country:0});s.age=d.min;s.actions=3;s.people[0].role=d.roles[0];
 const available=[...dramas,...branchingDramas].filter(x=>s.age>=x.min&&s.age<=x.max&&s.people.some(p=>p.alive&&p.age>=8&&x.roles.includes(p.role)));
 const i=available.findIndex(x=>x.id===id);assert.ok(i>=0);
 dramaYear(s,{add:()=>{},roll:key=>key==='type'?(i+.5)/available.length:0});
 assert.equal(s.dramaticStories.active.type,id);return s;
}
const decide=(s,i)=>E.act(s,'drama:choose:'+i);
function advance(s){s.age=s.dramaticStories.active.due;s.actions=3;dramaYear(s,{add:()=>{},roll:()=>0});return s;}
function play(id,a,b,c){let s=fixture(id);s=advance(decide(s,a));s=advance(decide(s,b));return decide(s,c);}
test('five original graphs contain 35 distinct scenes and 105 choices; every path terminates in three scenes',()=>{
 assert.equal(branchingDramas.length,5);assert.equal(branchingDramas.reduce((n,d)=>n+Object.keys(d.nodes).length,0),35);
 assert.equal(branchingDramas.reduce((n,d)=>n+Object.values(d.nodes).reduce((m,x)=>m+x.choices.length,0),0),105);
 for(const d of branchingDramas){assert.equal(new Set(Object.values(d.nodes).map(x=>x.prompt)).size,7);for(let a=0;a<3;a++)for(let b=0;b<3;b++){assert.equal(branchingScene(d,[]),d.nodes.start);assert.equal(branchingScene(d,[{index:a}]),d.nodes['second'+a]);assert.equal(branchingScene(d,[{index:a},{index:b}]),d.nodes['final'+b]);}}
});
test('each opening choice changes the real next scene and options',()=>{
 const states=[0,1,2].map(i=>advance(decide(fixture(),i))),views=states.map(s=>dramaView(s).active);
 assert.equal(new Set(views.map(v=>v.sceneTitle)).size,3);
 assert.equal(new Set(states.map(s=>E.commands(s).filter(c=>c.id.startsWith('drama:choose:')).map(c=>c.label).join('|'))).size,3);
 assert.ok(states.every(E.validate));
});
test('second decision changes the actual finale, not only the response score',()=>{
 const states=[0,1,2].map(i=>advance(decide(advance(decide(fixture(),0)),i)));
 assert.deepEqual(states.map(s=>dramaView(s).active.sceneTitle),['The first audience','The private archive','A new decision']);
 assert.ok(states.every(E.validate));
});
test('all 135 possible three-choice playthroughs complete with valid state and saved scene titles',()=>{
 for(const d of branchingDramas)for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++){
  const s=play(d.id,a,b,c),r=s.dramaticStories.completed[0];
  assert.equal(r.type,d.id);assert.equal(r.stage,3);assert.equal(s.dramaticStories.active,null);
  assert.deepEqual(r.choices.map(x=>x.scene),[d.nodes.start.title,d.nodes['second'+a].title,d.nodes['final'+b].title]);
  assert.ok(E.validate(s),d.id+':'+a+b+c);
 }
});
test('branching decisions survive JSON roundtrip and malformed remembered scenes are rejected',()=>{
 let s=advance(decide(fixture(),2));const n=JSON.parse(JSON.stringify(s));assert.deepEqual(dramaView(n),dramaView(s));assert.deepEqual(decide(n,1),decide(s,1));n.dramaticStories.active.choices[0].scene='A scene that never happened';assert.equal(validateDrama(n),false);
});
test('original linear story remains available and uses unchanged labels and save schema',()=>{
 const s=E.createLife({seed:172002});s.age=12;dramaYear(s,{add:()=>{},roll:()=>0});assert.equal(s.dramaticStories.active.type,'notebook');const n=decide(s,0);assert.equal(n.dramaticStories.active.choices[0].scene,undefined);assert.ok(E.validate(n));
});
test('successor can discover the actual ancestral branch ending once',()=>{
 let s=play('unopened-box',0,0,0);s.age=50;s.alive=false;const child=s.people.find(p=>p.alive);child.role='child';child.age=25;let n=E.legacy(s,child.id);const r=n.dramaticStories.archive.at(-1);assert.equal(r.branchEnding,'The first audience');assert.equal(n.dramaticStories.active,null);n.actions=3;n=E.act(n,'drama:discover:'+r.key);assert.ok(E.dramaView(n).archive[0].read);assert.ok(E.validate(n));
});
test('rare story ribbons are distinct and previously recorded endings remain stable',()=>{
 const s=E.createLife({seed:172003});s.age=50;s.alive=false;s.dramaticStories={discovered:['a','b','c'],completed:[{stage:3,choices:[{scene:'start'},{scene:'second'},{scene:'final'}],type:'unopened-box',outcome:'reconnected'}]};assert.equal(lifeEnding(s,0).id,'unwritten-story');
 s.ending='ordinary';assert.equal(lifeEnding(s,0).id,'ordinary');const p=mergeLife(emptyProfile(),s,0);delete s.ending;const next=mergeLife(p,s,0);assert.deepEqual(next.ribbons,['ordinary']);assert.equal(next.completed[s.lifeId].ribbon,'ordinary');
});
