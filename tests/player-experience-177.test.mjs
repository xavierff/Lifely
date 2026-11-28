import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {auditPlayer,auditLineage,profiles} from '../scripts/audit-player-experience.mjs';
import {dashboardModel} from '../src/content/premium-ux.mjs';
test('all nine distinct adult profiles advance and validate their saves',()=>{assert.equal(profiles.length,9);for(const profile of profiles){const r=auditPlayer(profile,{years:3,country:0});assert.ok(r.years>=1,profile);assert.ok(Number.isFinite(r.endWorth));assert.ok(r.maxBytes>0);assert.ok(r.distinctActions<=r.actions);}});
test('interactive production and match audits play actual sessions rather than merely advance time',()=>{const film=auditPlayer('film',{years:3,country:0}),football=auditPlayer('football',{years:3,country:0});assert.ok(film.productionsCompleted>=1);assert.ok(football.matchesCompleted>=1);assert.ok(film.successfulReleases<=film.productionsCompleted);});
test('three generations of adult successor fixtures preserve valid prior and new saves',()=>{const history=auditLineage();assert.deepEqual(history.map(x=>x.generation),[1,2,3]);assert.ok(history.every(x=>Number.isFinite(x.worth)&&x.bytes>0));});
test('dashboard prioritizes the larger affordable debt repayment without exhausting cash',()=>{const s=E.createLife({seed:17711});s.age=30;s.cash=12000;s.debt=15000;s.actions=3;const a=dashboardModel(s,E.commands(s)).suggestions.find(c=>c.category==='Money');assert.equal(a?.id,'repay:10000');s.cash=3000;assert.equal(dashboardModel(s,E.commands(s)).suggestions.find(c=>c.category==='Money')?.id,'repay:1000');});
