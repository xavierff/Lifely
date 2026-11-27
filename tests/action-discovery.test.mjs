import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {findActions,categoryForAction,actionReceipt} from '../src/content/action-discovery.mjs';
function life(seed=141001){const s=E.createLife({seed,name:'Alex'});s.age=30;s.actions=3;s.cash=1000000;s.stats.reputation=40;return s;}
test('1.41: finder returns only real command IDs and preserves availability',()=>{
 const s=life(),cmds=E.commands(s),matches=findActions(cmds,{query:'luxury',includeLocked:true});
 assert.ok(matches.length>0);assert.ok(matches.every(x=>cmds.some(c=>c.id===x.id&&c.enabled===x.enabled)));
 assert.ok(findActions(cmds).every(c=>c.enabled));
 assert.equal(categoryForAction('justicejourney:prepare'),'Justice');assert.equal(categoryForAction('spotlight:tour:start:regional'),'Work');assert.equal(categoryForAction('luxury:buy:yacht'),'Money');
});
test('1.41: searchable command filtering is case insensitive and can combine terms',()=>{
 const cmds=[{id:'luxury:buy:yacht',label:'Buy private yacht',detail:'Annual upkeep',enabled:false},{id:'luxury:buy:art',label:'Buy art collection',detail:'Available',enabled:true}];
 assert.equal(findActions(cmds,{query:'PRIVATE YACHT',category:'Money'}).length,0);
 assert.equal(findActions(cmds,{query:'PRIVATE YACHT',category:'Money',includeLocked:true})[0].id,'luxury:buy:yacht');
});
test('1.41: action receipt reflects authoritative state changes',()=>{
 const s=life(141002);s.stats.health=50;s.stats.stress=40;const n=E.act(s,'rest'),r=actionReceipt(s,n,'Rest');
 assert.equal(r.spent,1);assert.equal(r.actions,2);assert.equal(r.cash,0);assert.ok(r.changes.some(x=>x.key==='stress'&&x.delta===-8));assert.ok(E.validate(n));
});
test('1.41: general rehabilitation cannot be repeated within one year',()=>{
 const s=life(141003);s.record=1;let n=E.act(s,'justice:rehab');
 assert.ok(!E.commands(n).some(c=>c.id==='justice:rehab'&&c.enabled));assert.throws(()=>E.act(n,'justice:rehab'));
 n.age++;n.actions=3;assert.ok(E.commands(n).some(c=>c.id==='justice:rehab'&&c.enabled));assert.ok(E.validate(n));
});
test('1.41: repeat luxury ownership cannot farm the original reputation reward',()=>{
 let s=life(141004);const cmd=E.commands(s).find(c=>c.id.startsWith('luxury:buy:')&&c.enabled);
 assert.ok(cmd);s=E.act(s,cmd.id);const reputation=s.stats.reputation;
 const sell=cmd.id.replace(':buy:',':sell:');s=E.act(s,sell);s=E.act(s,cmd.id);
 assert.equal(s.stats.reputation,reputation);assert.ok(E.validate(s));
});
