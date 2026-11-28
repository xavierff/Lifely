import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {catalogAudit} from '../scripts/audit-catalog.mjs';
import {auditSimulation} from '../scripts/audit-simulation.mjs';
import {randomLifeOptions} from '../src/content/replayability.mjs';
test('runtime content audit reports distinct IDs and meets the original breadth targets',()=>{
 const report=catalogAudit();console.log('LIFELY CATALOG AUDIT',JSON.stringify(report));
 assert.ok(report.counts.scenarioCards>=1000);
 assert.ok(report.counts.regularCareers>=150);
 assert.ok(report.counts.achievements>=100);
 assert.ok(report.counts.challenges>=50);
 assert.equal(report.counts.generatedPremises,173);
 assert.equal(report.counts.generatedVariants,692);
 assert.ok(Object.values(report.duplicateIds).every(x=>x.length===0),JSON.stringify(report.duplicateIds));
 assert.deepEqual(report.invalidScenarios,[]);
});
test('consecutive random starting seeds cover every country and background combination',()=>{
 const pairs=new Set();const goals=new Set();
 for(let i=0;i<1000;i++){const x=randomLifeOptions(169000+i);pairs.add(x.country+':'+x.background);goals.add(x.goal);}
 assert.equal(pairs.size,24);assert.equal(goals.size,3);
});
test('short benchmark exercises three modes and records real save sizes and elapsed times',()=>{
 const r=auditSimulation({years:18,countries:[0]});console.log('LIFELY SIMULATION SMOKE',JSON.stringify(r));
 assert.equal(r.runs,3);assert.ok(r.totalYears>=18);assert.ok(r.maxSaveBytes>0);
 assert.ok(Number.isFinite(r.ageUpMs.p95));assert.ok(r.results.every(x=>Number.isFinite(x.netWorth)));
});
test('repeated save serialization preserves mode, RNG and financial state',()=>{
 for(const mode of ['balanced','hardcore','sandbox']){
  const s=E.createLife({seed:169004,country:1,mode});
  const n=JSON.parse(JSON.stringify(s));assert.ok(E.validate(n));assert.deepEqual(n,s);assert.equal(E.worth(n),E.worth(s));
 }
});
