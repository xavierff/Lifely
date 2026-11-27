import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {outingStats} from '../src/content/playful-life.mjs';
import {metricSnapshot} from '../src/content/progression.mjs';
import {inheritEveryday} from '../src/content/everyday-scenes.mjs';
import {emptyProfile,mergeLife} from '../src/profile.mjs';
const life=(age=30,seed=132001)=>{const s=E.createLife({seed});s.age=age;s.actions=3;s.pending=null;return s;};
function experience(s,id,choices=[0,1,0]){return choices.reduce((n,i)=>E.sceneChoice(n,i),E.act(s,'scene:start:outing:'+id));}
test('1.32: ordinary completed outings update lifetime counts and unlock genuine achievements',()=>{
 const s=life(),n=experience(s,'street-festival');
 const m=outingStats(n);
 assert.equal(m.total,1);assert.equal(m.eras.adult,1);assert.deepEqual(m.distinct,['street-festival']);
 assert.equal(metricSnapshot(n).outingTotal,1);assert.ok(n.achievements.includes('First memorable outing'));
 assert.equal(outingStats(s).total,0);assert.ok(E.validate(n));
});
test('1.32: a lifetime ledger survives recent history truncation and does not count abandonment',()=>{
 let n=experience(life(30,132002),'street-festival');
 n.everydayScenes.completed=[];n.age++;n.actions=3;
 const a=E.act(n,'scene:start:outing:career-mixer'),q=E.sceneChoice(a,'leave');
 assert.equal(outingStats(q).total,1);assert.ok(E.validate(q));
 q.age++;q.actions=3;const p=experience(q,'street-festival');
 assert.equal(outingStats(p).total,2);assert.equal(outingStats(p).distinct.length,1);assert.ok(E.validate(p));
});
test('1.32: previous saves reconstruct actual recent records and reject impossible lifetime counts',()=>{
 let s=experience(life(30,132003),'career-mixer');delete s.everydayScenes.outingLedger;
 assert.ok(E.validate(s));assert.equal(outingStats(s).total,1);
 s.age++;s.actions=3;s=experience(s,'street-festival');
 assert.equal(outingStats(s).total,2);assert.equal(outingStats(s).distinct.length,2);
 const bad=structuredClone(s);bad.everydayScenes.outingLedger.eras.adult=0;
 assert.equal(E.validate(bad),false);
});
test('1.32: one life can explore several stages while descendants inherit no completed activities',()=>{
 let s=experience(life(10,132004),'treasure');
 s.age=15;s.actions=3;s=experience(s,'dance-night');
 s.age=25;s.actions=3;s=experience(s,'street-festival');
 s.age=70;s.actions=3;s=experience(s,'later-adventure');
 assert.equal(outingStats(s).eraCount,4);assert.ok(s.achievements.includes('Across the ages'));assert.ok(E.validate(s));
 const heir=life(0,132005);inheritEveryday(heir,s);
 assert.equal(outingStats(heir).total,0);assert.equal(outingStats(heir).eraCount,0);assert.ok(E.validate(heir));
});
test('1.32: five alternative ribbons have concrete requirements and are collected once',()=>{
 let s=experience(life(10,132006),'treasure');
 s.age=15;s.actions=3;s=experience(s,'dance-night');
 s.age=25;s.actions=3;s=experience(s,'street-festival');
 s.age=70;s.actions=3;s=experience(s,'later-adventure');
 s.age=71;s.actions=3;s=experience(s,'later-adventure');
 assert.equal(E.ribbons.length,37);
 assert.equal(E.lifeEnding(s).id,'four-eras');
 s.alive=false;
 let p=mergeLife(emptyProfile(),s,E.worth(s));p=mergeLife(p,s,E.worth(s));
 assert.equal(Object.keys(p.completed).length,1);assert.ok(p.ribbons.includes('four-eras'));
 assert.equal(E.challengeProgress(s).length,68);assert.equal(E.achievementStatus(s).length,136);
});
test('1.32: hobbies count completed practice, not just opened or abandoned sessions',()=>{
 const s=life(25,132007),a=E.act(s,'hobby:start:tabletennis:practice');
 assert.equal(metricSnapshot(a).hobbyDisciplines,0);
 const q=E.hobbyDecision(a,'leave');assert.equal(metricSnapshot(q).hobbyDisciplines,0);
 const n=[0,1,2].reduce((x,i)=>E.hobbyDecision(x,i),a);
 assert.equal(metricSnapshot(n).hobbyDisciplines,1);assert.ok(E.validate(n));
});
