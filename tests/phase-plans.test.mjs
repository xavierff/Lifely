import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {careerPlayfieldAct,careerPlayfieldView,initialCareerPlayfield} from '../src/content/career-playfields.mjs';
import {choosePhasePlan,validPhasePlans} from '../src/content/phase-plans.mjs';
function setup(type,seed=145001){
 let s=E.createLife({seed});s.age=32;s.cash=100000;s.stats.creativity=90;s.stats.health=90;s.skills.art=80;
 if(type==='sports'){s.world.sports.sport='Football';s.world.sports.form=80;}
 if(type==='film')s.world.entertainment.path='Film director';
 if(type==='business')s.business={sector:'shop',capital:12000,quality:62,demand:51};
 return s;
}
test('1.45: nine plans have explicit costs, one commitment per phase and exact cash accounting',()=>{
 for(const [type,id,cost] of [['sports','press',0],['film','technical',320],['business','people',150]]){
  let s=E.act(setup(type),'campaign:start:'+type);const before=E.campaignView(s),cash=s.cash,actions=s.actions;
  assert.equal(before.playfield.plan.options.length,3);
  const n=E.campaignPlan(s,id),v=E.campaignView(n);
  assert.equal(n.cash,cash-cost);assert.equal(v.cost,before.cost+cost);assert.equal(n.actions,actions);assert.equal(n.rng,s.rng);
  assert.equal(v.playfield.plan.chosen,id);assert.equal(v.playfield.plan.locked,true);
  assert.ok(v.playfield.plan.options.every(x=>!x.enabled));assert.throws(()=>E.campaignPlan(n,id));assert.ok(E.validate(n));
  assert.deepEqual(E.campaignView(JSON.parse(JSON.stringify(n))).playfield.plan,v.playfield.plan);
  const q=E.campaignDecision(n,1);assert.equal(E.campaignView(q).playfield.plan.locked,false);
 }
});
test('1.45: cannot plan after playing, cannot buy an unaffordable crew, and rejects invalid saved plans',()=>{
 let s=E.act(setup('film'),'campaign:start:film');s.cash=0;
 assert.throws(()=>E.campaignPlan(s,'technical'));assert.equal(E.campaignView(s).playfield.plan.options.find(x=>x.id==='technical').enabled,false);
 const n=E.campaignPlay(s,0);assert.throws(()=>E.campaignPlan(n,'lean'));assert.equal(E.campaignView(n).playfield.plan.locked,true);
 let bad=structuredClone(n);bad.careerCampaigns.active.phasePlans=[{stage:0,id:'press',cost:0}];assert.equal(E.validate(bad),false);
});
test('1.45: formations change attack odds and fatigue without granting additional plays',()=>{
 const s=setup('sports'),base={type:'sports',stage:2,stakeholder:'Rival',risk:20,quality:55,team:60,reach:40,spend:0,playfield:initialCareerPlayfield('sports')};
 const compact=structuredClone(base),press=structuredClone(base);
 choosePhasePlan(s,compact,'compact',{});choosePhasePlan(s,press,'press',{});
 assert.ok(careerPlayfieldView(s,press).options[0].chance>careerPlayfieldView(s,compact).options[0].chance);
 careerPlayfieldAct(s,compact,0,{rng:()=>0});careerPlayfieldAct(s,press,0,{rng:()=>0});
 assert.ok(press.playfield.fatigue>compact.playfield.fatigue);assert.equal(press.playfield.plays.length,1);assert.equal(compact.playfield.plays.length,1);
});
test('1.45: specialist film crew and business staffing alter actual results',()=>{
 const film=setup('film'),a={type:'film',stage:0,risk:20,quality:55,team:60,reach:40,spend:0,playfield:initialCareerPlayfield('film')};
 const b=structuredClone(a);choosePhasePlan(film,b,'technical',{spend:(s,c)=>{s.cash-=c;}});
 assert.ok(careerPlayfieldView(film,b).options[2].chance>careerPlayfieldView(film,a).options[2].chance);
 careerPlayfieldAct(film,a,2,{rng:()=>0});careerPlayfieldAct(film,b,2,{rng:()=>0});assert.equal(b.quality,a.quality+2);
 const company=setup('business'),c={type:'business',stage:0,risk:20,quality:55,team:60,reach:40,spend:0,playfield:initialCareerPlayfield('business')};
 const d=structuredClone(c);choosePhasePlan(company,d,'people',{spend:(s,c)=>{s.cash-=c;}});
 careerPlayfieldAct(company,c,1,{rng:()=>0});careerPlayfieldAct(company,d,1,{rng:()=>0});assert.equal(d.playfield.loyalty,c.playfield.loyalty+3);
 assert.ok(validPhasePlans(d));
});
