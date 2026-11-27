import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {estateAllocation,estateYear} from '../src/content/estate-plans.mjs';
function family(seed=134001){
 let s=E.createLife({seed,name:'Alex'});s.age=45;s.actions=3;
 s=E.act(s,'date');s.people.find(p=>p.role==='partner').bond=90;
 s=E.act(s,'child');s=E.act(s,'child');
 for(const p of s.people.filter(p=>p.role==='child'))p.age=20;
 s.actions=3;return s;
}
test('1.34: no optional plan means original allocation remains untouched',()=>{
 const s=family();assert.equal(estateAllocation(s,1001),null);assert.ok(E.validate(s));
});
test('1.34: equal written shares preserve every dollar including rounding remainders',()=>{
 const s=E.act(family(134002),'estate:plan:equal'),children=s.people.filter(p=>p.role==='child');
 const a=estateAllocation(s,1001);assert.equal(a[children[0].id],501);assert.equal(a[children[1].id],500);
 assert.equal(s.actions,2);assert.ok(E.validate(s));assert.ok(!E.commands(s).some(c=>c.id==='estate:plan:default'&&c.enabled));
});
test('1.34: a larger share is optional and a dissatisfied adult child can challenge it',()=>{
 let s=family(134003);const [p,q]=s.people.filter(p=>p.role==='child');s=E.act(s,'estate:plan:preferred:'+p.id);
 assert.deepEqual(Object.values(estateAllocation(s,1001)).sort((a,b)=>a-b),[401,600]);
 s.age+=2;s.actions=3;s.people.find(x=>x.id===q.id).world.rivalry=75;
 estateYear(s,{add:()=>{}});assert.equal(s.estatePlan.dispute.challenger,q.id);
 const n=E.act(s,'estate:resolve:equal');assert.equal(n.estatePlan.dispute,null);assert.equal(n.estatePlan.plan.mode,'equal');assert.ok(E.validate(n));
});
test('1.34: actual inheritance transfers the allocated estate to the heir and existing sibling',()=>{
 let s=family(134004);s=E.act(s,'estate:plan:equal');const [p,q]=s.people.filter(p=>p.role==='child');
 const value=Math.max(0,E.worth(s)),alloc=estateAllocation(s,value);
 const siblingCash=q.world.cash,heirCash=p.world.cash;
 s.alive=false;s.death='Test';const n=E.legacy(s,p.id);
 assert.equal(n.cash,alloc[p.id]+heirCash);assert.equal(n.people.find(x=>x.id===q.id).world.cash,siblingCash+alloc[q.id]);
 assert.equal(n.estatePlan.plan,null);assert.ok(n.estatePlan.ancestors.some(h=>h.kind==='distributed'));assert.ok(E.validate(n));
});
test('1.34: deceased preferred child is replaced by equal living shares; invalid disputes fail validation',()=>{
 let s=family(134005);const [p,q]=s.people.filter(p=>p.role==='child');s=E.act(s,'estate:plan:preferred:'+p.id);
 s.people.find(x=>x.id===p.id).alive=false;s.age++;estateYear(s,{add:()=>{}});
 assert.equal(s.estatePlan.plan.mode,'equal');assert.deepEqual(estateAllocation(s,101),{[q.id]:101});assert.ok(E.validate(s));
 const bad=structuredClone(s);bad.estatePlan.plan.mode='invalid';assert.equal(E.validate(bad),false);
});
