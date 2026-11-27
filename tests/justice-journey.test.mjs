import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {justiceJourneyInheritance,justiceJourneyRelease} from '../src/content/justice-journey.mjs';
function life(seed=140001){const s=E.createLife({seed,name:'Alex'});s.age=30;s.actions=3;s.cash=100000;s.education=3;s.stats.knowledge=90;return s;}
test('1.40: three new public-service jobs and fictional deduction review',()=>{
 const s=life();const job=E.careers.find(j=>j.title==='Detective');assert.ok(job);let n=E.act(s,'job:'+job.id);
 n=E.act(n,'justicejourney:investigate:gallery');assert.equal(E.justiceJourneyView(n).investigation.clues.length,3);
 const q=E.act(n,'justicejourney:answer:1');assert.equal(q.justiceJourney.solved,1);assert.equal(q.justiceJourney.attempted,1);
 assert.equal(q.actions,0);assert.equal(q.cash,n.cash);assert.ok(E.validate(q));
});
test('1.40: courtroom preparation requires counsel and cannot repeat for the same case',()=>{
 let s=life(140002);s.justice.case={opened:30,severity:50,counsel:false};
 assert.ok(!E.commands(s).some(c=>c.id==='justicejourney:prepare'&&c.enabled));
 s=E.act(s,'justice:counsel');const n=E.act(s,'justicejourney:prepare');assert.equal(n.justiceJourney.prep.opened,30);
 assert.ok(!E.commands(n).some(c=>c.id==='justicejourney:prepare'&&c.enabled));assert.ok(E.validate(n));
 const q=E.act(n,'justice:hearing');assert.equal(q.justice.case,null);assert.equal(q.justiceJourney.prep,null);assert.ok(E.validate(q));
});
test('1.40: custody programs and family contacts use ordinary actions and existing NPCs',()=>{
 const s=life(140003);s.justice.years=2;s.record=1;const p=s.people.find(x=>x.alive&&x.role==='parent');
 const n=E.act(s,'justicejourney:program:study');assert.equal(n.justiceJourney.programs.study,1);assert.equal(n.justice.rehab,1);
 assert.ok(!E.commands(n).some(c=>c.id==='justicejourney:program:service'&&c.enabled));
 const q=E.act(n,'justicejourney:contact:'+p.id);assert.ok(q.people.find(x=>x.id===p.id).bond>=p.bond);assert.equal(q.people.length,s.people.length);assert.ok(E.validate(q));
});
test('1.40: release plan spans years and never clears convictions',()=>{
 let s=life(140004);s.record=1;justiceJourneyRelease(s,{add:()=>{}});
 for(const k of ['training','support','service']){s=E.act(s,'justicejourney:reentry:'+k);s.age++;s.actions=3;}
 assert.equal(s.justiceJourney.release.completed,true);assert.equal(s.record,1);assert.equal(s.justiceJourney.recoveries,1);assert.ok(E.validate(s));
 s.stats.reputation=100;assert.equal(E.lifeEnding(s).id,'restored-life');
 const heir=life(140005);justiceJourneyInheritance(heir,s);assert.equal(heir.justiceJourney.release,null);assert.equal(heir.justiceJourney.recoveries,0);assert.ok(E.validate(heir));
});
test('1.40: wrong investigation conclusion earns no success and malformed save is rejected',()=>{
 let s=life(140006);const job=E.careers.find(j=>j.title==='Police officer');s=E.act(s,'job:'+job.id);s=E.act(s,'justicejourney:investigate:ledger');
 const n=E.act(s,'justicejourney:answer:2');assert.equal(n.justiceJourney.solved,0);assert.equal(n.justiceJourney.attempted,1);
 const bad=structuredClone(n);bad.justiceJourney.solved=10;assert.equal(E.validate(bad),false);assert.ok(E.validate(n));
});
