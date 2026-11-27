import test from 'node:test';
import assert from 'node:assert/strict';
import E from '../src/engine.mjs';
import {careerActionChance,careerPlayfieldAct,careerPlayfieldView,initialCareerPlayfield} from '../src/content/career-playfields.mjs';
function setup(type){const s=E.createLife({seed:144001});s.age=32;s.cash=100000;s.stats.creativity=90;s.stats.health=90;s.skills.art=80;
 if(type==='sports'){s.world.sports.sport='Football';s.world.sports.form=80;}
 if(type==='film')s.world.entertainment.path='Film director';
 if(type==='business')s.business={sector:'shop',capital:12000,quality:62,demand:51};
 if(type==='election'){s.world.politics.party='Civic Renewal';s.stats.reputation=90;s.stats.social=90;}
 if(type==='medical'){s.job={id:15,level:1,experience:10};s.stats.knowledge=90;s.skills.technical=90;}
 return s;
}
test('1.44: displayed exact chance agrees with resolution on each side of threshold',()=>{
 for(const type of ['sports','film','business'])for(let index=0;index<3;index++){
  const s=setup(type),a={type,stage:0,stakeholder:'Rival',risk:20,quality:55,team:60,reach:40,playfield:initialCareerPlayfield(type)};
  const chance=careerPlayfieldView(s,a).options[index].chance;
  assert.equal(chance,careerActionChance(s,a,a.playfield,index));assert.ok(chance>=12&&chance<=94);
  for(const [offset,success] of [[-.001,true],[.001,false]]){const x=structuredClone(a);let first=true;
   const result=careerPlayfieldAct(s,x,index,{rng:()=>{if(first){first=false;return chance/100+offset;}return .99;}});
   assert.equal(result.success,success);assert.equal(x.playfield.plays.length,1);
  }
 }
});
test('1.44: sports scouting chances adapt after a play and track the original action',()=>{
 const s=setup('sports'),a={type:'sports',stage:0,stakeholder:'Rival',risk:20,quality:55,team:60,reach:40,playfield:initialCareerPlayfield('sports')};
 const v=careerPlayfieldView(s,a);assert.ok(v.options[v.weakLane].chance>v.options[(v.weakLane+1)%3].chance);
 careerPlayfieldAct(s,a,v.weakLane,{rng:()=>0});
 const next=careerPlayfieldView(s,a);assert.notEqual(next.weakLane,v.weakLane);assert.equal(next.remaining,1);assert.deepEqual(next.playHistory,[{stage:0,index:v.weakLane,success:true}]);
});
test('1.44: five career playfield histories survive save roundtrip and enforce phase limits',()=>{
 for(const type of ['sports','film','business','election','medical']){
  let s=setup(type);s=E.act(s,'campaign:start:'+type);
  const cash=s.cash,actions=s.actions;let n=E.campaignPlay(s,0);n=E.campaignPlay(n,1);
  const v=E.campaignView(n).playfield;assert.equal(v.remaining,0);assert.equal(v.playHistory.length,2);
  assert.equal(n.cash,cash);assert.equal(n.actions,actions);assert.ok(E.validate(n));
  assert.throws(()=>E.campaignPlay(n,2));assert.deepEqual(E.campaignView(JSON.parse(JSON.stringify(n))).playfield.playHistory,v.playHistory);
 }
});
