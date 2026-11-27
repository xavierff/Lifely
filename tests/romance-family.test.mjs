import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {romanceYear,romanceInheritance} from '../src/content/romance-family.mjs';
const life=(seed=133001)=>{const s=E.createLife({seed});s.age=28;s.actions=3;s.pending=null;return s;};
function couple(seed){let s=E.act(life(seed),'date');const p=s.people.find(p=>p.role==='partner');return {s,p,id:p.id};}
function ready(seed){const {s,p,id}=couple(seed);p.bond=90;p.world.trust=90;s.romance.profiles[id].closeness=80;s.romance.profiles[id].alignment=80;return {s,p,id};}
const advance=s=>{s.age++;s.actions=3;return s;};
test('1.33: real relationship preferences and connection actions change actual bonds once per year',()=>{
 const {s,p,id}=couple(133002);const n=E.act(s,'romance:connect:'+id+':listen');
 assert.ok(n.people.find(x=>x.id===id).bond>p.bond);assert.equal(n.actions,s.actions-1);
 assert.equal(n.cash,s.cash);assert.ok(E.romanceView(n).partner.priority);assert.ok(E.validate(n));
 assert.ok(!E.commands(n).some(c=>c.id==='romance:connect:'+id+':plan'&&c.enabled));
});
test('1.33: mutual proposal and separate wedding consume ordinary actions and only actual cash',()=>{
 let {s,id}=ready(133003);s.cash=2000;s=E.act(s,'romance:propose:'+id);
 assert.equal(E.romanceView(s).partner.proposal.status,'engaged');assert.equal(E.romanceView(s).partner.married,false);
 advance(s);const n=E.act(s,'romance:wedding:'+id+':celebration');
 assert.equal(n.cash,s.cash-750);assert.equal(E.romanceView(n).partner.married,true);assert.equal(n.actions,2);
 assert.ok(E.validate(n));assert.ok(n.romance.history.some(h=>h.kind==='wedding'));
});
test('1.33: an unready partner can ask for time without forcing engagement',()=>{
 const {s,p,id}=couple(133004);p.bond=72;p.world.trust=50;
 const n=E.act(s,'romance:propose:'+id);
 assert.equal(E.romanceView(n).partner.proposal.status,'not-yet');assert.equal(E.romanceView(n).partner.married,false);assert.ok(E.validate(n));
});
test('1.33: tension creates autonomous conflicts and constructive responses affect actual relationships',()=>{
 const {s,p,id}=ready(133005);s.age+=2;s.stats.stress=80;p.world.rivalry=50;s.romance.profiles[id].tension=60;
 romanceYear(s,{add:()=>{}});assert.ok(E.romanceView(s).partner.conflict);
 const n=E.act(s,'romance:conflict:'+id+':listen');
 assert.equal(E.romanceView(n).partner.conflict,null);assert.ok(E.romanceView(n).partner.tension<E.romanceView(s).partner.tension);
 assert.ok(n.people.find(x=>x.id===id).bond>=p.bond);assert.ok(E.validate(n));
});
test('1.33: reunion reuses the former partner identity and never automatically remarries',()=>{
 let {s,id}=ready(133006);s=E.act(s,'breakup');const p=s.people.find(x=>x.id===id);
 p.bond=90;p.world.trust=90;p.world.rivalry=5;s.romance.profiles[id].tension=20;advance(s);
 const n=E.act(s,'romance:reunite:'+id);
 assert.equal(n.people.length,s.people.length);assert.equal(n.people.find(x=>x.id===id).role,'partner');
 assert.equal(E.romanceView(n).partner.married,false);assert.equal(n.familyTransitions.separation,null);assert.ok(E.validate(n));
});
test('1.33: parenting choices develop existing family profiles and do not fabricate children',()=>{
 let {s}=ready(133007);s=E.act(s,'child');const child=s.people.find(x=>x.role==='child');child.age=8;advance(s);
 const n=E.act(s,'romance:parent:'+child.id+':structure');
 assert.equal(n.people.length,s.people.length);assert.ok(n.people.find(x=>x.id===child.id).world.talent>=child.world.talent);
 assert.ok(n.familyStories.members[child.id].resilience>50);assert.equal(n.romance.parenting[child.id].counts.structure,1);
 assert.ok(!E.commands(n).some(c=>c.id==='romance:parent:'+child.id+':encourage'&&c.enabled));assert.ok(E.validate(n));
});
test('1.33: previous saves remain valid and no living romance or parenting commitments are inherited',()=>{
 const {s,id}=ready(133008);const n=E.act(s,'romance:propose:'+id);
 const old=structuredClone(n);delete old.romance;assert.ok(E.validate(old));
 const bad=structuredClone(n);bad.romance.profiles[id].tension=130;assert.equal(E.validate(bad),false);
 const heir=life(133009);romanceInheritance(heir,n);assert.deepEqual(heir.romance.profiles,{});assert.deepEqual(heir.romance.parenting,{});assert.ok(E.validate(heir));
});
