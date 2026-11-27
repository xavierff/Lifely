import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {sportContractYear,sportContractInheritance,professionalTeams} from '../src/content/sport-contracts.mjs';
function athlete(seed=138001,index=0){
 let s=E.createLife({seed,name:'Alex'});s.age=25;s.actions=3;s.cash=100000;s.stats.health=90;s=E.act(s,'world:sport:start:'+index);s.actions=3;
 Object.assign(s.world.sports,{form:95,rank:2,wins:6,injury:0});return s;
}
function sign(s,team='harbor'){s=E.act(s,'sportdeal:request:'+team);return E.act(s,'sportdeal:accept');}
test('1.38: all four sports have two eligible professional paths',()=>{
 assert.equal(professionalTeams.length,8);
 for(let i=0;i<4;i++){const s=athlete(138001+i,i);assert.equal(E.commands(s).filter(c=>c.id.startsWith('sportdeal:request:')&&c.enabled).length,2);}
});
test('1.38: negotiated pay replaces the generic sports salary, not adds to it',()=>{
 let s=athlete(138006);s=E.act(s,'sportdeal:request:harbor');const base=s.sportContracts.offer.salary;
 s=E.act(s,'sportdeal:counter');assert.equal(s.sportContracts.offer.salary,Math.round(base*1.2));
 s=E.act(s,'sportdeal:accept');const salary=s.sportContracts.active.salary;
 assert.equal(s.world.sports.contractYears,3);assert.ok(!E.commands(s).some(c=>c.id==='world:sport:contract'&&c.enabled));
 const n=E.ageUp(s);assert.equal(n.sportContracts.earned,salary);assert.equal(n.annual.worldIncome,salary);
 assert.equal(n.world.sports.contractYears,2);assert.ok(E.validate(n));
});
test('1.38: transfer replaces an agreement and charges the exact release fee',()=>{
 let s=sign(athlete(138007));s.age++;s.actions=3;const before=s.cash,fee=Math.round(s.sportContracts.active.salary*.2);
 s=E.act(s,'sportdeal:request:atlas');s=E.act(s,'sportdeal:accept');
 assert.equal(s.sportContracts.active.team,'atlas');assert.equal(s.cash,before-fee);assert.equal(s.sportContracts.transfers,1);assert.ok(E.validate(s));
});
test('1.38: weak seasons release the player after guaranteed service and no extra future pay',()=>{
 const s=sign(athlete(138008));s.world.sports.form=10;const salary=s.sportContracts.active.salary;
 for(let i=0;i<2;i++){s.age++;assert.equal(sportContractYear(s,{add:()=>{},inCustody:false}),salary);}
 assert.equal(s.sportContracts.active,null);assert.equal(s.world.sports.contractYears,0);assert.equal(s.sportContracts.released,1);assert.equal(sportContractYear(s,{add:()=>{},inCustody:false}),0);assert.ok(E.validate(s));
});
test('1.38: expiry, retirement and inheritance preserve only genuine earnings and memories',()=>{
 let s=sign(athlete(138009));const salary=s.sportContracts.active.salary;
 for(let i=0;i<3;i++){s.age++;sportContractYear(s,{add:()=>{},inCustody:false});}
 assert.equal(s.sportContracts.completed,1);assert.equal(s.sportContracts.earned,salary*3);assert.equal(s.world.sports.contractYears,0);
 const heir=athlete(138010);sportContractInheritance(heir,s);assert.equal(heir.sportContracts.active,null);assert.equal(heir.sportContracts.earned,0);assert.ok(heir.sportContracts.legacy.length>0);assert.ok(E.validate(heir));
 s=sign(athlete(138011));s.actions=3;const n=E.act(s,'world:sport:retire');assert.equal(n.sportContracts.active,null);assert.equal(n.world.sports.contractYears,0);assert.ok(E.validate(n));
 const bad=structuredClone(s);bad.sportContracts.active.salary=-10;assert.equal(E.validate(bad),false);
});
