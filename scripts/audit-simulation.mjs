import E from '../src/engine.mjs';
import {performance} from 'node:perf_hooks';
import assert from 'node:assert/strict';
export function settle(s){
 for(let i=0;i<40&&s.alive;i++){
  if(E.pending(s))s=E.resolve(s,0);
  else if(s.mini)s=E.miniAction(s,s.mini.phase==='study'?'ready':0);
  else if(s.world?.network?.conversation)s=E.dialogueReply(s,0);
  else if(s.careerCampaigns?.active){const v=E.campaignView(s);if(v?.playfield){const choices=v.playfield.options||v.playfield.choices;if(choices?.length)s=E.campaignPlay(s,0);else throw Error('Interactive campaign requires an explicit audit strategy');}else s=E.campaignDecision(s,0);}
  else if(s.everydayScenes?.active)s=E.sceneChoice(s,0);
  else if(s.world?.storyDirector?.active)s=E.storyDirectorChoose(s,0);
  else if(s.fate?.active?.status==='playing')s=E.fateDecision(s,0);
  else if(s.hobbyCircuit?.active)s=E.hobbyDecision(s,0);
  else if(s.arcade?.active)s=E.arcadeDecision(s,'leave');
  else if(s.matchLeague?.active)s=E.matchDecision(s,'leave');
  else if(s.creativeProductions?.active)s=E.productionDecision(s,'cancel');
  else if(s.workplace?.active?.status==='ready')s=E.workplaceDecision(s,0);
  else if(s.familyStories?.active?.status==='ready')s=E.familyDecision(s,0);
  else if(s.worldPulse?.active?.status==='ready')s=E.worldPulseDecision(s,0);
  else return s;
  assert.ok(E.validate(s),'Invalid decision state at age '+s.age);
 }
 if(s.alive)throw Error('Unresolved decision loop after 40 decisions at age '+s.age);
 return s;
}
export function chooseWorkingAction(s,commands){
 const by=id=>commands.find(c=>c.enabled&&c.id===id);
 if(s.age>=18&&!s.job&&!s.profession&&!s.business&&!s.retired){const jobs=commands.filter(c=>c.enabled&&c.id.startsWith('job:')).sort((a,b)=>E.careers[Number(b.id.split(':')[1])].salary-E.careers[Number(a.id.split(':')[1])].salary);if(jobs.length)return jobs[0];}
 if(s.age>=18&&s.budget!=='frugal'&&s.debt>0&&by('budget:frugal'))return by('budget:frugal');
 if(s.debt>0&&s.cash>=11000&&by('repay:10000'))return by('repay:10000');
 if(s.debt>0&&s.cash>=2000&&by('repay:1000'))return by('repay:1000');
 if(s.stats.stress>=65||s.stats.health<=40)return by('rest');
 if(s.age>=8&&s.people.filter(p=>p.alive&&p.role==='friend').length<4&&by('friend'))return by('friend');
 if(s.age>=25&&s.age<=40&&!s.people.some(p=>p.alive&&p.role==='partner')&&by('date'))return by('date');
 if(s.age>=28&&s.age<=45&&!s.people.some(p=>p.alive&&p.role==='child')&&by('child'))return by('child');
 if(s.job&&s.stats.performance<75&&by('work'))return by('work');
 return by('rest');
}
export function auditSimulation({strategy='passive',years=60,modes=['balanced','hardcore','sandbox'],countries=[0,1,2,3,4,5]}={}){
 const results=[],times=[];let totalYears=0;
 for(const mode of modes)for(const country of countries){
  const seed=169000+country;let s=E.createLife({seed,country,mode}),count=0,maxBytes=0,maxPeople=0;
  for(let i=0;i<years&&s.alive;i++){
   s=settle(s);if(!s.alive)break;
   const commands=E.commands(s),action=strategy==='working'?chooseWorkingAction(s,commands):commands.find(c=>c.id==='rest'&&c.enabled);if(action)s=E.act(s,action.id);
   s=settle(s);if(!s.alive)break;const t=performance.now();try{s=E.ageUp(s);}catch(e){throw Error(mode+' country '+country+' age '+s.age+': '+e.message,{cause:e});}times.push(performance.now()-t);count++;
   assert.ok(E.validate(s),mode+' country '+country+' age '+s.age);
   assert.ok(Number.isFinite(E.worth(s)));
   const raw=JSON.stringify(s);maxBytes=Math.max(maxBytes,Buffer.byteLength(raw));maxPeople=Math.max(maxPeople,s.people.length);
   if(s.age%5===0){const n=JSON.parse(raw);assert.ok(E.validate(n));assert.equal(E.worth(n),E.worth(s));s=n;}
  }
  totalYears+=count;results.push({strategy,mode,country,years:count,age:s.age,alive:s.alive,netWorth:E.worth(s),cash:s.cash,debt:s.debt,health:s.stats.health,maxBytes,maxPeople});
 }
 const sorted=times.sort((a,b)=>a-b),p=q=>Math.round((sorted[Math.floor((sorted.length-1)*q)]||0)*100)/100;
 return {strategy,runs:results.length,totalYears,maxSaveBytes:Math.max(0,...results.map(r=>r.maxBytes)),maxNPCs:Math.max(0,...results.map(r=>r.maxPeople)),ageUpMs:{median:p(.5),p95:p(.95),max:p(1)},results};
}
if(process.argv[1]&&process.argv[1].endsWith('audit-simulation.mjs')){
 const years=Number(process.argv[2]||60);
 if(!Number.isInteger(years)||years<1||years>110)throw Error('Specify between 1 and 110 years.');
 const mode=process.argv[3];if(mode&&!['balanced','hardcore','sandbox'].includes(mode))throw Error('Invalid mode');const strategy=process.argv[4]||'passive';if(!['passive','working'].includes(strategy))throw Error('Invalid strategy');console.log(JSON.stringify(auditSimulation({years,strategy,...(mode?{modes:[mode]}:{})}),null,2));
}
