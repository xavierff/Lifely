import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {chronicleRecordDecision,chronicleStage,chronicleView,chronicleInheritance,validateChronicle} from '../src/content/life-chronicle.mjs';

test('new life has a safe empty chronicle and birth on its visual timeline',()=>{
 const s=E.createLife({seed:91401,name:'Alex'});
 assert.ok(E.validate(s));
 assert.equal(s.chronicle.version,1);
 assert.equal(s.chronicle.entries.length,0);
 assert.equal(chronicleView(s).timeline.some(x=>x.age===0&&/Born into/.test(x.title)),true);
 assert.equal(chronicleStage(14).label,'Discovery');
 assert.equal(chronicleStage(62).label,'Legacy');
});

test('real turning point preserves exact choice, immediate effects and scheduled arc',()=>{
 let s=E.createLife({seed:91402,name:'Maya'});
 const e=E.events.find(x=>x.arcStart&&x.followId);
 assert.ok(e);
 s.age=e.min;
 s.pending=e.id;
 const original=JSON.stringify(s);
 const a=E.resolve(s,0);
 assert.equal(JSON.stringify(s),original,'engine must remain immutable');
 assert.ok(E.validate(a));
 assert.equal(a.chronicle.entries.length,1);
 const decision=a.chronicle.entries[0];
 assert.equal(decision.title,e.title);
 assert.equal(decision.choice,e.choices[0].text);
 assert.equal(decision.age,e.min);
 assert.equal(decision.turning,true);
 assert.deepEqual(Object.fromEntries(decision.changes.map(c=>[c.key,c.change])),a.scenario.last.changes);
 assert.equal(decision.netWorth,a.scenario.last.netWorth);
 assert.deepEqual(decision.bonds,a.scenario.last.bonds);
 assert.ok(decision.future.some(f=>f.age===e.min+e.delay&&f.id==='arc'));
 assert.equal(a.chronicle.spotlight.id,decision.id);
 assert.equal(chronicleView(a).highlights[0].id,decision.id);
 assert.deepEqual(E.resolve(s,0),a,'same seed and choice yield identical chronicle');
});

test('unselected branch does not claim a guaranteed follow-up',()=>{
 let s=E.createLife({seed:91403});
 const e=E.events.find(x=>x.arcStart&&x.followId);
 s.age=e.min;s.pending=e.id;
 const a=E.resolve(s,1);
 assert.ok(E.validate(a));
 assert.equal(a.story.due.some(d=>d.id===e.followId),false);
 assert.equal(a.chronicle.entries[0].future.some(f=>f.id==='arc'),false);
});

test('previous v2 saves show history without eager migration',()=>{
 const s=E.createLife({seed:91404});
 delete s.chronicle;
 assert.ok(E.validate(s));
 assert.equal(chronicleView(s).hasLegacyHistory,true);
 assert.ok(chronicleView(s).timeline.length);
 const next=E.ageUp(s);
 assert.ok(E.validate(next));
 assert.ok(chronicleView(next).timeline.length);
});

test('strict journal bounds and zero effect on currency, stats and RNG',()=>{
 const s=E.createLife({seed:91405});
 const initialCash=s.cash,initialStats={...s.stats},initialRng=s.rng;
 const e={title:'A remembered choice',prompt:'A choice about the future.',category:'personal'};
 for(let i=1;i<=90;i++){
  s.scenario.choices=i;
  chronicleRecordDecision(s,e,{text:'Try a new path'},{changes:{confidence:8},netWorth:0,bonds:[],category:'personal'});
 }
 assert.equal(s.chronicle.entries.length,72);
 assert.equal(s.chronicle.entries[0].id,'g1-choice-19');
 assert.equal(s.chronicle.spotlight.id,'g1-choice-90');
 assert.equal(s.cash,initialCash);
 assert.deepEqual(s.stats,initialStats);
 assert.equal(s.rng,initialRng);
 assert.ok(E.validate(s));
});

test('ancestral turning point is a recap, never the heir active scene',()=>{
 let s=E.createLife({seed:91406,name:'Jordan'});
 const e=E.events.find(x=>x.arcStart&&x.followId);
 s.age=e.min;s.pending=e.id;s=E.resolve(s,0);
 const heir=E.createLife({seed:91407,name:'Sam'});
 chronicleInheritance(heir,s);
 assert.ok(E.validate(heir));
 assert.equal(heir.chronicle.entries.length,0);
 assert.equal(heir.chronicle.spotlight,null);
 assert.equal(heir.chronicle.ancestors[0].name,s.name);
 assert.equal(heir.chronicle.ancestors[0].note,e.title);
});

test('malformed chronicle is rejected by save validation',()=>{
 const s=E.createLife({seed:91408});
 assert.equal(validateChronicle(s.chronicle),true);
 s.chronicle.entries=[{id:'bad',age:1,title:'broken'}];
 assert.equal(validateChronicle(s.chronicle),false);
 assert.equal(E.validate(s),false);
});
