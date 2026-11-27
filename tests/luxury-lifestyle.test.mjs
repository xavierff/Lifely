import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {luxuryTypes,luxuryYear,luxuryInheritance} from '../src/content/luxury-lifestyle.mjs';
function life(seed=135001){const s=E.createLife({seed,name:'Alex'});s.age=35;s.actions=3;s.cash=20000000;s.pending=null;return s;}
test('1.35: purchase is an actual asset conversion and resale loses transaction costs',()=>{
 const s=life(),v=E.worth(s),n=E.act(s,'luxury:buy:yacht'),h=n.luxury.holdings[0];
 assert.equal(luxuryTypes.length,9);assert.equal(s.cash-n.cash,h.value);assert.equal(E.worth(n),v);
 assert.ok(!E.commands(n).some(c=>c.id==='luxury:buy:yacht'));const q=E.act(n,'luxury:sell:yacht');
 assert.equal(q.cash-n.cash,Math.round(h.value*.92));assert.equal(E.luxuryWorth(q),0);assert.ok(E.worth(q)<v);assert.ok(E.validate(q));
});
test('1.35: luxury upkeep and condition are meaningful, even with no liquid cash',()=>{
 const s=E.act(life(135002),'luxury:buy:jet'),expected=E.luxuryView(s).upkeep;
 const n=E.ageUp(s);assert.equal(n.annual.luxuryUpkeep,expected);assert.equal(n.luxury.holdings[0].condition,95);
 assert.ok(n.luxury.holdings[0].value<s.luxury.holdings[0].value);assert.ok(E.validate(n));
});
test('1.35: renovation changes the actual property value and spends more than it adds',()=>{
 let s=E.act(life(135003),'buy:house'),p=s.properties.find(x=>x.id==='house'),before=E.worth(s);
 const n=E.act(s,'luxury:renovate:house');
 assert.ok(n.properties.find(x=>x.id==='house').value>p.value);assert.ok(E.worth(n)<before);
 assert.equal(n.luxury.renovations[0].count,1);assert.ok(!E.commands(n).some(c=>c.id==='luxury:renovate:house'&&c.enabled));assert.ok(E.validate(n));
});
test('1.35: private club membership and premium events enforce eligibility and charge actual cash',()=>{
 let s=life(135004);s.stats.reputation=70;const n=E.act(s,'luxury:club:join');
 assert.equal(n.cash,s.cash-25000);assert.equal(E.luxuryView(n).upkeep,8000);
 const q=E.act(n,'luxury:event:gala');assert.equal(q.cash,n.cash-12000);assert.equal(q.luxury.events,1);
 assert.ok(!E.commands(q).some(c=>c.id==='luxury:event:retreat'&&c.enabled));assert.ok(E.validate(q));
});
test('1.35: luxury is liquidated into inheritance exactly once, with historical records only',()=>{
 const s=E.act(life(135005),'luxury:buy:art');const heir=life(135006);luxuryInheritance(heir,s);
 assert.equal(E.luxuryWorth(heir),0);assert.equal(heir.luxury.legacy.length,1);assert.ok(E.validate(heir));
 const bad=structuredClone(s);bad.luxury.holdings.push({...bad.luxury.holdings[0]});assert.equal(E.validate(bad),false);
 const old=structuredClone(s);delete old.luxury;assert.ok(E.validate(old));
});
