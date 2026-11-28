import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import E from '../src/engine.mjs';
import {settle,chooseWorkingAction} from './audit-simulation.mjs';
export const profiles=['employed','distressed','unemployed','wealthy','business','film','football','basketball','family'];
const available=(s,id)=>E.commands(s).find(c=>c.enabled&&c.id===id);
const act=(s,id)=>{assert.ok(available(s,id),'Unavailable action '+id+' age '+s.age);const n=E.act(s,id);assert.ok(E.validate(n),'Invalid '+id);return n;};
function snapshot(s){const n=JSON.parse(JSON.stringify(s));assert.ok(E.validate(n));assert.equal(E.worth(n),E.worth(s));return n;}
function create(profile,country){
 let s=E.createLife({seed:177000+country+profiles.indexOf(profile)*100,country});s.age=25;s.actions=3;s.stats.knowledge=75;s.stats.creativity=85;s.stats.health=95;s.skills.art=75;
 // Explicit synthetic starting circumstances, not earned progression.
 s.cash=profile==='distressed'?0:profile==='wealthy'?500000:profile==='unemployed'?1000:100000;s.debt=profile==='distressed'?40000:0;
 assert.ok(E.validate(s),'Invalid starting fixture '+profile);
 if(profile==='business'){const c=E.commands(s).find(c=>c.enabled&&c.id.startsWith('business:'));assert.ok(c);s=act(s,c.id);}
 if(profile==='film')s=act(s,'world:ent:start:2');
 if(profile==='football'||profile==='basketball')s=act(s,'world:sport:start:'+(profile==='football'?0:1));
 return s;
}
function careerAction(s,profile,i){
 const by=id=>available(s,id);
 if(profile==='unemployed')return by('rest');
 if(profile==='business'&&s.business){return by(s.business.quality<90?'business:improve':i%3===0?'company:product':'company:marketing')||by('rest');}
 if(profile==='film'&&s.world.entertainment.path)return by('production:start:lean')||by('rest');
 if((profile==='football'||profile==='basketball')&&s.world.sports.sport)return by('matchleague:start')||by('world:sport:recover')||by('rest');
 if(profile==='wealthy')return by(i%2?'save:10000':'invest:10000')||by('rest');
 if(profile==='family'){const alive=s.people.filter(p=>p.alive);if(!alive.some(p=>p.role==='partner'))return by('date')||by('rest');if(alive.filter(p=>p.role==='child').length<4&&s.age<=45)return by('child')||by('rest');if(alive.filter(p=>p.role==='friend').length<6)return by('friend')||by('rest');return by('rest');}
 return chooseWorkingAction(s,E.commands(s));
}
function play(s,id){
 s=act(s,id);
 if(s.creativeProductions?.active){for(let i=0;i<4;i++){const a=E.productionView(s).active;assert.ok(a);const o=a.options.filter(x=>x.enabled).sort((x,y)=>(y.craft+y.team)-(x.craft+x.team))[0];assert.ok(o);s=E.productionDecision(s,o.id);assert.ok(E.validate(s));}}
 if(s.matchLeague?.active){for(let i=0;i<12;i++){const a=E.matchView(s).active;assert.ok(a);const choice=a.possession==='home'?(a.build>=1?'shoot':'pass:'+a.situation.open):'mark:'+a.situation.attack;s=E.matchDecision(s,choice);assert.ok(E.validate(s));}}
 return settle(s);
}
export function auditPlayer(profile,{years=25,country=0}={}){
 assert.ok(profiles.includes(profile));let s=create(profile,country),maxBytes=0,maxPeople=0;const count={},times=[],startWorth=E.worth(s);let releases=0,matches=0;
 for(let i=0;i<years&&s.alive;i++){
  s=settle(s);if(!s.alive)break;
  const c=careerAction(s,profile,i);if(c){count[c.id]=(count[c.id]||0)+1;s=play(s,c.id);if(c.id.startsWith('production:start:'))releases++;if(c.id==='matchleague:start')matches++;}
  if(!s.alive)break;const start=performance.now();s=E.ageUp(s);times.push(performance.now()-start);assert.ok(E.validate(s),profile+' age '+s.age);
  maxBytes=Math.max(maxBytes,Buffer.byteLength(JSON.stringify(s)));maxPeople=Math.max(maxPeople,s.people.length);if(i%3===0)s=snapshot(s);
 }
 const actions=Object.values(count).reduce((a,b)=>a+b,0),top=Object.entries(count).sort((a,b)=>b[1]-a[1])[0];
 return {profile,country,years:times.length,age:s.age,alive:s.alive,startWorth,endWorth:E.worth(s),cash:s.cash,debt:s.debt,health:s.stats.health,happiness:s.stats.happiness,stress:s.stats.stress,job:s.job?.id??null,business:!!s.business,releases,matches,children:s.people.filter(p=>p.role==='child').length,maxPeople,maxBytes,actions,distinctActions:Object.keys(count).length,mostRepeated:top?{id:top[0],count:top[1],share:top[1]/actions}:null};
}
export function auditLineage(){
 let s=E.createLife({seed:177999,mode:'balanced'});s.age=30;s.cash=250000;const history=[];
 for(let generation=1;generation<=3;generation++){
  assert.equal(s.generation,generation);s=settle(s);
  // Deliberately construct an adult succession fixture, then use real family commands.
  s.age=30;s.actions=3;
  if(!s.people.some(p=>p.role==='partner'&&p.alive))s=act(s,'date');
  if(!s.people.some(p=>p.role==='child'&&p.alive))s=act(s,'child');
  const child=s.people.find(p=>p.role==='child'&&p.alive);assert.ok(child);
  for(let i=0;i<5&&s.alive;i++){s=settle(s);if(s.alive)s=E.ageUp(s);assert.ok(E.validate(s));}
  s=snapshot(s);history.push({generation,age:s.age,people:s.people.length,worth:E.worth(s),bytes:Buffer.byteLength(JSON.stringify(s))});
  if(generation<3){const heir=s.people.find(p=>p.id===child.id&&p.alive);assert.ok(heir);s.age=60;heir.age=30;s.alive=false;s.pending=null;const previous=JSON.stringify(s);s=E.legacy(s,heir.id);assert.equal(s.generation,generation+1);assert.equal(JSON.parse(previous).generation,generation);assert.ok(E.validate(s));s=snapshot(s);}
 }
 return history;
}
if(process.argv[1]?.endsWith('audit-player-experience.mjs')){const years=Number(process.argv[2]||25);assert.ok(Number.isInteger(years)&&years>=1&&years<=40);console.log(JSON.stringify({profiles:profiles.flatMap(profile=>[0,1].map(country=>auditPlayer(profile,{years,country}))),lineage:auditLineage()},null,2));}
