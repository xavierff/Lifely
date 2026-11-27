import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {appearanceDefaults,appearanceOptions,portraitView,npcPortraitView,milestoneBetween} from '../src/content/immersive-life.mjs';
const fresh=(seed=143001)=>E.createLife({seed,name:'Alex'});
test('1.43: cosmetic changes preserve every simulation field and consume no activity',()=>{
 const s=fresh(),look={version:1,skin:2,hair:3,clothes:4,style:1},n=E.customizeAppearance(s,look);
 assert.deepEqual(n.appearance,look);assert.equal(n.actions,s.actions);assert.equal(n.rng,s.rng);assert.equal(E.worth(n),E.worth(s));
 const stripped=structuredClone(n);delete stripped.appearance;assert.deepEqual(stripped,s);
 assert.equal(portraitView(n).skin,appearanceOptions.skin[2]);assert.equal(portraitView(n).clothes,appearanceOptions.clothes[4]);assert.ok(E.validate(n));
 assert.deepEqual(portraitView(JSON.parse(JSON.stringify(n))),portraitView(n));
});
test('1.43: onboarding appearance is valid, old saves retain deterministic defaults',()=>{
 const s=fresh(143002),look=appearanceDefaults(s),n=E.createLife({seed:143002,name:'Alex',appearance:look});
 assert.deepEqual(portraitView(n),portraitView(s));assert.ok(E.validate(s));
 assert.throws(()=>E.customizeAppearance(s,{...look,skin:99}));assert.throws(()=>E.createLife({appearance:{...look,hair:-1}}));
 const bad=structuredClone(n);bad.appearance.style=9;assert.equal(E.validate(bad),false);
});
test('1.43: NPC portrait identity persists as relationships and ages change',()=>{
 const s=fresh(143003),p=s.people[0],v=npcPortraitView(p);
 const next={...p,role:'grandparent',age:80,world:{...p.world,joy:90}};
 const w=npcPortraitView(next);assert.equal(v.skin,w.skin);assert.equal(v.clothes,w.clothes);assert.equal(w.stage,'elder');assert.equal(w.mood,'happy');
 assert.equal(npcPortraitView({...p,alive:false}).mood,'remembered');
});
test('1.43: continuation as a child preserves their NPC cosmetic identity',()=>{
 let s=fresh(143007);s.age=30;s.cash=50000;s=E.act(s,'date');s=E.act(s,'child');
 const child=s.people.find(p=>p.role==='child');child.age=25;s.alive=false;s.pending=null;
 const heir=E.legacy(s,child.id),before=npcPortraitView(child),after=portraitView(heir);
 for(const key of ['skin','hair','clothes','style'])assert.equal(after[key],before[key]);
 assert.ok(E.validate(heir));
});
test('1.43: milestones report only new events in the same life',()=>{
 const s=fresh(143004),n=structuredClone(s);n.age=18;n.achievements.push('New achievement');n.education=1;
 const m=milestoneBetween(s,n);assert.ok(m.titles.includes('Reached age 18'));assert.ok(m.titles.includes('Achievement: New achievement'));assert.ok(m.titles.includes('Education milestone'));
 assert.equal(milestoneBetween(n,structuredClone(n)),null);assert.equal(milestoneBetween(n,fresh(143005)),null);
 assert.equal(milestoneBetween(n,{...n,alive:false}),null);
});
test('1.43: appearance does not change seeded annual simulation outcomes',()=>{
 const s=fresh(143006),n=E.customizeAppearance(s,{version:1,skin:1,hair:1,clothes:1,style:1});
 const a=E.ageUp(s),b=E.ageUp(n);delete b.appearance;assert.deepEqual(b,a);
});
