import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
function settle(s){
 for(let i=0;i<20&&s.alive;i++){
  if(E.pending(s))s=E.resolve(s,0);
  else if(s.fate?.active?.status==='playing')s=E.fateDecision(s,0);
  else if(s.workplace?.active?.status==='ready')s=E.workplaceDecision(s,0);
  else if(s.familyStories?.active?.status==='ready')s=E.familyDecision(s,0);
  else if(s.worldPulse?.active?.status==='ready')s=E.worldPulseDecision(s,0);
  else return s;
  assert.ok(E.validate(s),'decision must preserve valid state at age '+s.age);
 }
 return s;
}
test('six seeded lives advance across regional systems and round-trip their saves',()=>{
 for(let country=0;country<6;country++){
  let s=E.createLife({seed:16400+country,country});let years=0;
  for(let i=0;i<38&&s.alive;i++){
   s=settle(s);if(!s.alive)break;
   const rest=E.commands(s).find(c=>c.id==='rest'&&c.enabled);
   if(rest)s=E.act(s,rest.id);
   s=E.ageUp(s);years++;
   assert.ok(E.validate(s),'invalid life: country '+country+' age '+s.age);
   assert.ok(Number.isFinite(E.worth(s)));
   if(s.age%5===0){const copy=JSON.parse(JSON.stringify(s));assert.ok(E.validate(copy));assert.equal(E.worth(copy),E.worth(s));s=copy;}
  }
  assert.ok(years>=18,'seed should reach adulthood');
 }
});
test('successor save remains valid across JSON round trip and one further year',()=>{
 let s=E.createLife({seed:16499,country:0});s.age=40;s.cash=500000;s.actions=3;s=E.act(s,'date');s=E.act(s,'child');const child=s.people.find(p=>p.role==='child');child.age=20;s.alive=false;s.pending=null;let n=E.legacy(s,child.id);assert.ok(E.validate(n));n=JSON.parse(JSON.stringify(n));n=E.ageUp(n);assert.ok(E.validate(n));assert.equal(n.generation,2);
});
