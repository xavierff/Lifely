import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {spotlightYear,spotlightInheritance} from '../src/content/spotlight-world.mjs';
function musician(seed=139001){
 let s=E.createLife({seed,name:'Alex'});s.age=30;s.actions=3;s.cash=100000;s.stats.creativity=95;s.skills.art=90;s=E.act(s,'world:ent:start:1');s.actions=3;
 Object.assign(s.world.entertainment,{fame:85,releases:2,awards:1});return s;
}
test('1.39: international tour has three unique stops and real net receipts',()=>{
 let s=musician(),a=E.act(s,'spotlight:tour:start:international'),cash=a.cash;
 assert.equal(a.actions,2);assert.ok(cash<s.cash);assert.equal(E.spotlightView(a).tour.next,'Tokyo showcase');
 let n=E.act(a,'spotlight:tour:play:polish');assert.equal(n.spotlight.tour.stage,1);assert.equal(E.spotlightView(n).tour.next,'London arena');
 n=E.act(n,'spotlight:tour:play:connect');n.age++;n.actions=3;n=E.act(n,'spotlight:tour:play:bold');
 assert.equal(n.spotlight.tour,null);assert.equal(n.spotlight.tours,1);assert.equal(n.cash,cash+n.spotlight.net);assert.equal(n.spotlight.gross,n.spotlight.fees+n.spotlight.net);assert.ok(E.validate(n));
});
test('1.39: professional peers evolve autonomously and retain individual relationships',()=>{
 let s=musician(139002);assert.equal(E.spotlightView(s).peers.length,2);
 s=E.act(s,'spotlight:peer:collaborate:music-a');const p=s.spotlight.peers.find(x=>x.id==='music-a');
 assert.equal(p.respect,64);assert.ok(!E.commands(s).some(c=>c.id==='spotlight:peer:compete:music-a'&&c.enabled));
 s.age++;s.actions=3;spotlightYear(s,{rng:()=>0,add:()=>{}});
 assert.equal(p.projects,1);assert.equal(s.spotlight.peers.length,6);
 const n=E.act(s,'spotlight:peer:compete:music-a');assert.ok(n.spotlight.peers.find(x=>x.id===p.id).rivalry>p.rivalry);assert.ok(E.validate(n));
});
test('1.39: attending a ceremony consumes no duplicate award and is available once per award count',()=>{
 const s=musician(139003),n=E.act(s,'spotlight:award:attend');assert.equal(n.world.entertainment.awards,1);assert.equal(n.spotlight.awardSeen,1);
 assert.ok(!E.commands(n).some(c=>c.id==='spotlight:award:attend'));assert.ok(E.validate(n));
});
test('1.39: leaving entertainment cancels the tour immediately, heir receives no live tour',()=>{
 let s=E.act(musician(139004),'spotlight:tour:start:regional');s=E.act(s,'spotlight:tour:play:polish');
 const n=E.act(s,'world:ent:leave');assert.equal(n.spotlight.tour,null);assert.equal(n.spotlight.net,s.spotlight.net);
 const heir=musician(139005);spotlightInheritance(heir,n);assert.equal(heir.spotlight.tour,null);assert.equal(heir.spotlight.net,0);assert.ok(E.validate(heir));
 const bad=structuredClone(s);bad.spotlight.tour.stage=4;assert.equal(E.validate(bad),false);
});
