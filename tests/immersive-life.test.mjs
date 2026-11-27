import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {portraitView,validateYearRecap} from '../src/content/immersive-life.mjs';
const fresh=(seed=142001)=>E.createLife({seed,name:'Alex'});
test('1.42: character portrait is deterministic, ages and reacts to real wellbeing',()=>{
 const s=fresh(),p=portraitView(s);assert.equal(p.stage,'baby');assert.deepEqual(p,portraitView(structuredClone(s)));
 s.age=25;s.stats.health=85;s.stats.stress=10;s.stats.happiness=90;const adult=portraitView(s);
 assert.equal(adult.stage,'adult');assert.equal(adult.mood,'happy');assert.equal(adult.skin,p.skin);
 s.stats.stress=90;assert.equal(portraitView(s).mood,'worried');s.age=80;
 assert.equal(portraitView(s).stage,'elder');assert.notEqual(portraitView(s).hair,adult.hair);
});
test('1.42: annual recap records exact deltas before the scenario choice',()=>{
 const s=fresh(142002),n=E.ageUp(s),r=E.yearRecapView(n).years[0];
 assert.equal(r.from,s.age);assert.equal(r.age,n.age);assert.equal(r.worth,E.worth(n));assert.equal(r.worthDelta,E.worth(n)-E.worth(s));assert.equal(r.cashDelta,Math.round(n.cash-s.cash));
 for(const c of r.changes)assert.equal(c.delta,n.stats[c.key]-s.stats[c.key]);
 assert.ok(!s.yearRecap);assert.ok(E.validate(n));assert.deepEqual(E.yearRecapView(JSON.parse(JSON.stringify(n))),E.yearRecapView(n));
 if(n.pending!==null){const q=E.resolve(n,0);assert.deepEqual(q.yearRecap,n.yearRecap);}
});
test('1.42: annual recaps remain bounded and valid over 24 simulated years',()=>{
 for(const seed of [142003,142004,142005]){
  let s=fresh(seed);for(let i=0;i<24&&s.alive;i++){
   if(s.pending!==null)s=E.resolve(s,0);
   if(!s.alive)break;
   s=E.ageUp(s);assert.ok(E.validate(s));assert.equal(s.yearRecap.years.at(-1).age,s.age);assert.ok(s.yearRecap.years.length<=12);
  }
  assert.equal(s.yearRecap.years.length,Math.min(12,s.age));
  assert.equal(validateYearRecap(s.yearRecap),true);
 }
});
test('1.42: custody and final years are recorded through alternate annual return paths',()=>{
 let s=fresh(142006);s.age=30;s.justice.years=2;s.record=1;
 let n=E.ageUp(s);assert.equal(n.yearRecap.years[0].age,31);assert.ok(E.validate(n));
 s=fresh(142007);s.age=109;n=E.ageUp(s);assert.equal(n.alive,false);assert.equal(n.yearRecap.years[0].alive,false);assert.equal(n.yearRecap.years[0].age,110);assert.ok(E.validate(n));
});
test('1.42: older saves have no invented history and malformed recap is rejected',()=>{
 const s=fresh(142008);assert.ok(E.validate(s));assert.deepEqual(E.yearRecapView(s).years,[]);
 const n=E.ageUp(s);n.yearRecap.years[0].from=-1;assert.equal(E.validate(n),false);
});
