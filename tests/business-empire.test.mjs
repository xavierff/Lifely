import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {empireYear,empireReview,empireInheritance} from '../src/content/business-empire.mjs';
function life(seed=136001){const s=E.createLife({seed,name:'Alex'});s.age=35;s.actions=3;s.cash=5000000;s.pending=null;return E.act(s,'business:studio');}
test('1.36: acquisition converts existing cash into distinct company equity',()=>{
 const s=life(),n=E.act(s,'empire:buy:cafe');assert.equal(E.worth(n),E.worth(s));
 assert.equal(n.empire.companies.length,1);assert.equal(s.cash-n.cash,E.empireWorth(n));assert.deepEqual(s.business,n.business);
 const q=E.act(n,'empire:sell:cafe');assert.equal(q.cash-n.cash,Math.round(E.empireWorth(n)*.85));assert.equal(E.empireWorth(q),0);assert.ok(E.validate(q));
});
test('1.36: independent annual profits are reported separately from the original business',()=>{
 const s=E.act(life(136002),'empire:buy:design'),n=E.ageUp(s);
 assert.equal(n.annual.empireIncome,n.empire.lastProfit);assert.equal(n.empire.companies[0].lastProfit,n.annual.empireIncome);assert.ok(E.validate(n));
});
test('1.36: sustained losses create distressed companies and discounted liquidation',()=>{
 const s=E.act(life(136003),'empire:buy:software');s.market=.65;
 const h=s.empire.companies[0];h.quality=0;h.demand=0;h.competition=100;
 for(let i=0;i<2;i++){s.age++;empireYear(s,{rng:()=>0,add:()=>{}},E.countries[s.country]);}
 assert.equal(h.distressed,true);assert.equal(h.lossYears,2);s.actions=3;
 const n=E.act(s,'empire:sell:software');assert.equal(n.cash-s.cash,Math.round(h.value*.6));assert.ok(E.validate(n));
});
test('1.36: crisis repayments preserve net worth and recovery never erases debt',()=>{
 const s=E.act(life(136004),'empire:buy:cafe');s.cash=10000;s.bankSavings=0;s.debt=100000;s.actions=3;
 empireReview(s,{add:()=>{}});assert.ok(s.empire.crisis);assert.ok(!E.commands(s).some(c=>c.id==='empire:buy:design'&&c.enabled));
 const n=E.act(s,'empire:crisis:repay');assert.equal(n.cash,0);assert.equal(n.debt,90000);assert.equal(E.worth(n),E.worth(s));
 n.cash=150000;empireReview(n,{add:()=>{}});assert.equal(n.empire.crisis,null);assert.equal(n.empire.comebacks,1);assert.equal(n.debt,90000);assert.ok(E.validate(n));
});
test('1.36: acquired equity is not duplicated in the next generation and old saves remain valid',()=>{
 const s=E.act(life(136005),'empire:buy:logistics'),n=life(136006);
 empireInheritance(n,s);assert.equal(E.empireWorth(n),0);assert.equal(n.empire.legacy.length,1);assert.ok(E.validate(n));
 const invalid=structuredClone(s);invalid.empire.companies[0].quality=120;assert.equal(E.validate(invalid),false);
 const old=structuredClone(s);delete old.empire;assert.ok(E.validate(old));
});
