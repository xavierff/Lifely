import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {examQuestion} from '../src/content/academic-challenges.mjs';
import {drillIds,drillRound} from '../src/content/hobby-drills.mjs';
const ready=(age=14,seed=146001)=>{let s=E.createLife({seed});s.age=age;s.actions=3;return s;};
test('1.46: exam content has unique options and deterministic answers across ages and seeds',()=>{
 for(const age of [6,12,13,18])for(const subject of ['math','science','logic','olympiad'])for(let seed=1;seed<40;seed++)for(let stage=0;stage<3;stage++){
  const a={startedAge:age,subject,examSeed:seed,stage},q=examQuestion(a);
  assert.equal(new Set(q.options).size,3);assert.ok([0,1,2].includes(q.correct));assert.deepEqual(q,examQuestion(a));
 }
});
test('1.46: academic competition grades objective answers, persists, and awards one medal',()=>{
 let s=ready(),n=E.act(s,'scene:start:exam:olympiad');assert.equal(n.actions,2);assert.ok(E.validate(n));assert.throws(()=>E.ageUp(n));
 for(let i=0;i<3;i++){const a=n.everydayScenes.active;const q=examQuestion(a);n=E.sceneChoice(n,q.correct);assert.ok(E.validate(JSON.parse(JSON.stringify(n))));}
 assert.equal(E.everydayView(n),null);const r=E.everydayHistory(n).examResults[0];assert.equal(r.score,3);assert.equal(r.medal,true);assert.equal(r.answers.length,3);assert.equal(n.actions,2);assert.ok(!E.commands(n).some(x=>x.id.startsWith('scene:start:exam:')&&x.enabled));
 assert.equal(n.cash,s.cash);
});
test('1.46: wrong answers are not randomly successful and abandonment consumes annual opportunity',()=>{
 let s=E.act(ready(),'scene:start:exam:math');let q=examQuestion(s.everydayScenes.active);s=E.sceneChoice(s,(q.correct+1)%3);assert.equal(E.everydayView(s).score,0);assert.equal(E.everydayView(s).last.success,false);
 s=E.sceneChoice(s,'leave');assert.equal(E.everydayView(s),null);assert.equal(E.everydayHistory(s).examResults.length,0);assert.ok(!E.commands(s).some(x=>x.id.startsWith('scene:start:exam:')&&x.enabled));assert.ok(E.validate(s));
 assert.ok(!E.commands(ready(5)).some(x=>x.id.startsWith('scene:start:exam:')));
 assert.ok(!E.commands(ready(19)).some(x=>x.id.startsWith('scene:start:exam:')));
});
test('1.46: four distinct objective hobby drill modes preserve rewards and annual gates',()=>{
 for(const id of drillIds){let s=ready(19),n=E.act(s,'hobby:start:'+id+':drill');
  assert.equal(n.actions,2);assert.ok(E.validate(n));
  for(let i=0;i<3;i++){const a=n.hobbyCircuit.active,q=drillRound(a);assert.ok(E.hobbyView(n).drill);n=E.hobbyDecision(n,q.ideal);assert.ok(E.validate(JSON.parse(JSON.stringify(n))));}
  const p=E.hobbySummary(n).profiles.find(p=>p.id===id);assert.equal(p.practice,1);assert.equal(p.contests,0);assert.equal(E.hobbySummary(n).history[0].score,3);assert.equal(n.cash,s.cash);assert.ok(!E.commands(n).some(c=>c.id.startsWith('hobby:start:'+id+':')&&c.enabled));
 }
});
test('1.46: old hobby sessions keep normal format and malformed drill save is rejected',()=>{
 const s=E.act(ready(19),'hobby:start:chess:practice');assert.equal(E.hobbyView(s).drill,null);assert.ok(E.validate(s));
 const n=structuredClone(s);n.hobbyCircuit.active.drill='invalid';assert.equal(E.validate(n),false);
});
