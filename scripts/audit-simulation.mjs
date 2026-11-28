import E from '../src/engine.mjs';
import {performance} from 'node:perf_hooks';
import assert from 'node:assert/strict';
function settle(s){
 for(let i=0;i<24&&s.alive;i++){
  if(E.pending(s))s=E.resolve(s,0);
  else if(s.arcade?.active)s=E.arcadeDecision(s,'leave');
  else if(s.fate?.active?.status==='playing')s=E.fateDecision(s,0);
  else if(s.workplace?.active?.status==='ready')s=E.workplaceDecision(s,0);
  else if(s.familyStories?.active?.status==='ready')s=E.familyDecision(s,0);
  else if(s.worldPulse?.active?.status==='ready')s=E.worldPulseDecision(s,0);
  else return s;
  assert.ok(E.validate(s),'Invalid decision state at age '+s.age);
 }
 if(s.alive&&E.pending(s))throw Error('Unresolved decision loop');
 return s;
}
export function auditSimulation({years=60,modes=['balanced','hardcore','sandbox'],countries=[0,1,2,3,4,5]}={}){
 const results=[],times=[];let totalYears=0;
 for(const mode of modes)for(const country of countries){
  const seed=169000+country;let s=E.createLife({seed,country,mode}),count=0,maxBytes=0,maxPeople=0;
  for(let i=0;i<years&&s.alive;i++){
   s=settle(s);if(!s.alive)break;
   const rest=E.commands(s).find(c=>c.id==='rest'&&c.enabled);if(rest)s=E.act(s,rest.id);
   const t=performance.now();s=E.ageUp(s);times.push(performance.now()-t);count++;
   assert.ok(E.validate(s),mode+' country '+country+' age '+s.age);
   assert.ok(Number.isFinite(E.worth(s)));
   const raw=JSON.stringify(s);maxBytes=Math.max(maxBytes,Buffer.byteLength(raw));maxPeople=Math.max(maxPeople,s.people.length);
   if(s.age%5===0){const n=JSON.parse(raw);assert.ok(E.validate(n));assert.equal(E.worth(n),E.worth(s));s=n;}
  }
  totalYears+=count;results.push({mode,country,years:count,age:s.age,alive:s.alive,netWorth:E.worth(s),cash:s.cash,debt:s.debt,health:s.stats.health,maxBytes,maxPeople});
 }
 const sorted=times.sort((a,b)=>a-b),p=q=>Math.round((sorted[Math.floor((sorted.length-1)*q)]||0)*100)/100;
 return {runs:results.length,totalYears,maxSaveBytes:Math.max(0,...results.map(r=>r.maxBytes)),maxNPCs:Math.max(0,...results.map(r=>r.maxPeople)),ageUpMs:{median:p(.5),p95:p(.95),max:p(1)},results};
}
if(process.argv[1]&&process.argv[1].endsWith('audit-simulation.mjs')){
 const years=Number(process.argv[2]||60);
 if(!Number.isInteger(years)||years<1||years>110)throw Error('Specify between 1 and 110 years.');
 console.log(JSON.stringify(auditSimulation({years}),null,2));
}
