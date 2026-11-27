import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {celebrityYear,celebrityInheritance} from '../src/content/celebrity-careers.mjs';
function life(seed=137001,path=2){
 let s=E.createLife({seed,name:'Alex'});s.age=30;s.actions=3;s.cash=100000;s.stats.creativity=95;s.stats.confidence=95;
 s=E.act(s,'world:ent:start:'+path);s.actions=3;return s;
}
test('1.37: authored film, acting and album projects have three choices and charge the budget once',()=>{
 for(const [path,kind] of [[0,'acting'],[1,'album'],[2,'film']]){
  const s=life(137001+path,path),a=E.act(s,'celebrity:project:start:'+kind);
  assert.equal(a.actions,2);assert.ok(a.cash<s.cash);assert.equal(a.celebrity.project.stage,0);
  let n=E.act(a,'celebrity:project:choice:1');assert.equal(n.celebrity.project.stage,1);
  n=E.act(n,'celebrity:project:choice:0');n.age++;n.actions=3;
  n=E.act(n,'celebrity:project:choice:1');assert.equal(n.celebrity.project,null);assert.equal(n.celebrity.projects,1);
  assert.ok(n.celebrity.earned>0);assert.equal(n.cash,a.cash+n.celebrity.earned);assert.ok(E.validate(n));
 }
});
test('1.37: real agent commission is charged exactly once on project proceeds',()=>{
 let s=life(137005,0);s=E.act(s,'character:agent:sign:agent-0');s.actions=3;
 s=E.act(s,'celebrity:project:start:acting');const cash=s.cash,prior=s.world.characters.agency.fees;
 s=E.act(s,'celebrity:project:choice:1');s=E.act(s,'celebrity:project:choice:0');s.actions=3;s=E.act(s,'celebrity:project:choice:1');
 assert.ok(s.celebrity.fees>0);assert.equal(s.cash,cash+s.celebrity.earned);
 assert.equal(s.world.characters.agency.fees-prior,s.celebrity.fees);assert.ok(E.validate(s));
});
test('1.37: counteroffer changes compensation and requires delivery before annual payment',()=>{
 let s=life(137006);s.world.entertainment.fame=90;
 s=E.act(s,'celebrity:offer:request:creative');const base=s.celebrity.offer.fee;
 s=E.act(s,'celebrity:offer:counter');assert.equal(s.celebrity.offer.fee,Math.round(base*1.25));
 s=E.act(s,'celebrity:offer:accept');s.actions=3;
 s=E.act(s,'celebrity:sponsor:deliver');const cash=s.cash,fee=s.celebrity.sponsor.fee;
 s.age++;const pay=celebrityYear(s,{add:()=>{},inCustody:false},E.countries[s.country]);
 assert.equal(pay,fee);assert.equal(s.cash,cash);assert.equal(s.celebrity.sponsor.paid,1);
 s.age++;assert.equal(celebrityYear(s,{add:()=>{},inCustody:false},E.countries[s.country]),0);assert.equal(s.celebrity.failed,1);assert.equal(s.celebrity.sponsor,null);assert.ok(E.validate(s));
});
test('1.37: public pressure creates a controversy and transparent response restores trust',()=>{
 let s=life(137007);s.world.entertainment.fame=80;s.stats.stress=85;s=E.act(s,'celebrity:offer:request:creative');s.actions=3;
 celebrityYear(s,{add:()=>{},inCustody:false},E.countries[s.country]);assert.ok(s.celebrity.publicity);
 const n=E.act(s,'celebrity:publicity:account');assert.equal(n.celebrity.publicity,null);assert.ok(n.celebrity.trust>s.celebrity.trust);assert.ok(E.validate(n));
});
test('1.37: departure immediately ends production and sponsorship; heirs retain history only',()=>{
 let s=life(137008);s=E.act(s,'celebrity:project:start:film');s.world.entertainment.fame=90;s=E.act(s,'celebrity:offer:request:creative');s=E.act(s,'celebrity:offer:accept');s.actions=3;
 const n=E.act(s,'world:ent:leave');assert.equal(n.celebrity.project,null);assert.equal(n.celebrity.sponsor,null);assert.equal(n.celebrity.failed,1);
 const heir=life(137009);celebrityInheritance(heir,n);assert.equal(heir.celebrity.project,null);assert.equal(heir.celebrity.sponsor,null);assert.ok(E.validate(heir));
 const bad=structuredClone(s);bad.celebrity.project.stage=7;assert.equal(E.validate(bad),false);
});
