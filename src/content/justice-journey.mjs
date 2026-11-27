// Fictional justice, restorative programs and deduction puzzles. No legal advice.
const cap=n=>Math.max(0,Math.min(100,Math.round(n)));
const age=n=>Number.isInteger(n)&&n>=0&&n<=110, count=n=>Number.isSafeInteger(n)&&n>=0;
const puzzles=[
 {id:'gallery',title:'The missing gallery exhibit',clues:['The inventory lists the exhibit in storage.','A witness recalls seeing an empty display.','The inventory entry was independently confirmed.'],answers:['The empty display proves theft','The confirmed record supports a storage explanation','Accuse the nearest visitor'],correct:1},
 {id:'ledger',title:'The disputed charity ledger',clues:['Two summaries show different totals.','An independently verified correction explains the difference.','A rumor claims an unrelated volunteer was responsible.'],answers:['Evaluate the verified correction before drawing conclusions','Assume the rumor is true','Treat every discrepancy as deliberate wrongdoing'],correct:0},
 {id:'library',title:'The library collection mystery',clues:['A book is marked returned in the verified catalog.','A shelf label is outdated.','No independent evidence connects a named reader to its absence.'],answers:['Blame the last named reader','Declare the matter solved by rumor','Record uncertainty and check the catalog discrepancy'],correct:2},
 {id:'festival',title:'The disputed festival report',clues:['Two witnesses disagree about a public incident.','A separate report confirms only part of each account.','The remaining claims are unverified.'],answers:['Choose the most dramatic account','Report the corroborated facts and mark the rest uncertain','Assert that both witnesses lied'],correct:1}
];
const puzzle=id=>puzzles.find(x=>x.id===id);
const empty=()=>({version:1,prep:null,programs:{study:0,wellbeing:0,service:0},lastProgram:null,lastContact:null,release:null,recoveries:0,investigation:null,lastInvestigation:null,solved:0,attempted:0,history:[],legacy:[],serial:0});
const state=s=>s.justiceJourney||empty(),ensure=s=>s.justiceJourney??=empty();
const eligible=s=>s.alive&&s.age>=18&&s.pending===null&&!s.mini&&!s.world?.network?.conversation&&!s.everydayScenes?.active&&!s.careerCampaigns?.active&&!s.hobbyCircuit?.active&&!s.world?.storyDirector?.active&&s.fate?.active?.status!=='playing'&&s.familyStories?.active?.status!=='ready'&&s.workplace?.active?.status!=='ready'&&s.worldPulse?.active?.status!=='ready';
const family=s=>s.people.filter(p=>p.alive&&['parent','partner','child','sibling','friend'].includes(p.role)).sort((a,b)=>b.bond-a.bond||a.id-b.id);
function log(s,kind,message,ctx){const m=ensure(s);m.history.push({id:++m.serial,age:s.age,kind,message:message.slice(0,200)});m.history=m.history.slice(-35);ctx.add(s,message,'justice');}
export function justiceJourneyCommands(s,careerTitle=''){
 if(!eligible(s))return [];
 const m=state(s),j=s.justice||{},out=[],put=(id,label,detail,ok=true)=>out.push({id:'justicejourney:'+id,label,detail,enabled:!!(s.actions>0&&ok)});
 if(j.years>0){
  for(const [id,label,detail] of [['study','Attend prison education','Knowledge and readiness'],['wellbeing','Join a wellbeing group','Manage stress and develop resilience'],['service','Participate in a restorative program','Build empathy and community readiness']])put('program:'+id,label,detail,m.lastProgram!==s.age);
  for(const p of family(s).slice(0,4))put('contact:'+p.id,'Keep in touch with '+p.name,'Strengthen an existing relationship',m.lastContact!==s.age);
  return out;
 }
 if(j.case){
  const p=m.prep?.opened===j.case.opened?m.prep:null;
  put('prepare','Review the fictional case with counsel','One preparation session per case; modest courtroom benefit',j.case.counsel&&!p);
  return out;
 }
 if((s.record||0)>0&&m.release&&!m.release.completed){
  const r=m.release,ok=r.lastAction!==s.age;
  put('reentry:training','Build an employment plan','Improve readiness and skills',ok&&!r.training);
  put('reentry:support',family(s).length?'Reconnect with a trusted person':'Attend a community support session','Build a sustainable support network',ok&&!r.support);
  put('reentry:service','Complete community service','Restore trust through constructive activity',ok&&!r.service);
 }
 const professional=/police|detective|investigat|lawyer|attorney|forensic/i.test(careerTitle);
 if(professional){
  if(!m.investigation){for(const d of puzzles)put('investigate:'+d.id,'Review: '+d.title,'Fictional case reasoning puzzle',m.lastInvestigation!==s.age);}
  else for(let i=0;i<3;i++)put('answer:'+i,puzzle(m.investigation.kind).answers[i],'Draw a conclusion from the case file');
 }
 return out;
}
export function justiceJourneyAct(s,id,ctx,careerTitle){
 if(!justiceJourneyCommands({...s,actions:s.actions+1},careerTitle).some(c=>c.id===id&&c.enabled))throw Error('Justice activity unavailable.');
 const m=ensure(s),j=s.justice,[,verb,key]=id.split(':');
 if(verb==='prepare'){m.prep={opened:j.case.opened,age:s.age};ctx.change(s,'knowledge',2);log(s,'preparation','Reviewed the fictional case with counsel.',ctx);}
 if(verb==='program'){
  m.lastProgram=s.age;m.programs[key]++;j.rehab++;
  if(key==='study'){ctx.change(s,'knowledge',6);s.skills.technical=cap(s.skills.technical+3);}
  if(key==='wellbeing'){ctx.change(s,'stress',-10);ctx.change(s,'health',3);}
  if(key==='service'){ctx.change(s,'kindness',5);ctx.change(s,'reputation',3);}
  log(s,'program','Completed a custody '+key+' program.',ctx);
 }
 if(verb==='contact'){const p=family(s).find(p=>p.id===Number(key));m.lastContact=s.age;ctx.bond(s,p,5,'Maintained contact during custody');ctx.change(s,'happiness',3);log(s,'contact','Kept in touch with '+p.name+' during custody.',ctx);}
 if(verb==='reentry'){
  const r=m.release;r.lastAction=s.age;r[key]=true;
  if(key==='training'){ctx.change(s,'knowledge',5);ctx.change(s,'performance',5);}
  if(key==='support'){const p=family(s)[0];if(p)ctx.bond(s,p,6,'Rebuilt contact after a difficult chapter');else ctx.change(s,'social',4);ctx.change(s,'stress',-5);}
  if(key==='service'){ctx.change(s,'kindness',5);ctx.change(s,'reputation',6);}
  log(s,'reentry','Completed the '+key+' reintegration milestone.',ctx);
  if(r.training&&r.support&&r.service&&s.age>r.age){r.completed=true;m.recoveries++;log(s,'recovery','Completed a multi-year reintegration plan. The conviction record remains.',ctx);}
 }
 if(verb==='investigate'){m.investigation={kind:key,startedAge:s.age};m.lastInvestigation=s.age;log(s,'investigation','Opened a fictional review: '+puzzle(key).title+'.',ctx);}
 if(verb==='answer'){
  const d=puzzle(m.investigation.kind),correct=Number(key)===d.correct;m.attempted++;
  if(correct){m.solved++;ctx.change(s,'knowledge',4);ctx.change(s,'performance',5);ctx.change(s,'reputation',3);}
  else ctx.change(s,'stress',3);
  m.investigation=null;log(s,'case-result',d.title+' — '+(correct?'supported conclusion':'review found the conclusion insufficiently supported')+'.',ctx);
 }
}
export function justiceJourneyVerdict(s,verdict,ctx){
 if(!s.justiceJourney&&verdict==='Dismissed')return;
 const m=ensure(s);m.prep=null;m.investigation=null;
 if(verdict==='Custodial sentence'){m.release=null;}
 if(verdict==='Fine and probation')m.release={age:s.age,training:false,support:false,service:false,completed:false,lastAction:null};
 log(s,'verdict','Court outcome: '+verdict+'.',ctx);
}
export function justiceJourneyRelease(s,ctx){
 const m=ensure(s);m.release={age:s.age,training:false,support:false,service:false,completed:false,lastAction:null};log(s,'released','Started the reintegration chapter.',ctx);
}
export function justiceJourneyYear(s,ctx){
 const m=s.justiceJourney;if(!m)return;
 if(m.investigation&&s.age>m.investigation.startedAge+1)m.investigation=null;
 if(m.prep&&m.prep.opened!==s.justice?.case?.opened)m.prep=null;
 if(m.release&&!m.release.completed&&s.justice?.years===0&&m.release.training&&m.release.support&&m.release.service&&s.age>m.release.age){m.release.completed=true;m.recoveries++;log(s,'recovery','Completed a multi-year reintegration plan. The conviction record remains.',ctx);}
}
export function justiceJourneyView(s){const m=state(s),i=m.investigation,d=i?puzzle(i.kind):null;return {...m,custody:s.justice?.years||0,case:s.justice?.case||null,record:s.record||0,investigation:i?{...i,title:d.title,clues:d.clues}:null,history:m.history.slice(-5).reverse(),legacy:m.legacy.slice(-4).reverse()};}
export function justiceJourneyInheritance(next,old){if(!old.justiceJourney)return;next.justiceJourney={...empty(),legacy:[...old.justiceJourney.legacy,...old.justiceJourney.history.filter(x=>['verdict','recovery','case-result'].includes(x.kind)).slice(-6).map(x=>({...x,ancestor:old.name,generation:old.generation}))].slice(-18)};}
export function validateJusticeJourney(m){
 if(m===undefined)return true;
 const hist=h=>h&&Number.isInteger(h.id)&&h.id>0&&age(h.age)&&typeof h.kind==='string'&&typeof h.message==='string'&&h.message.length<=200;
 const r=m?.release,p=m?.prep,i=m?.investigation;
 return !!m&&m.version===1&&['serial','recoveries','solved','attempted'].every(k=>count(m[k]))&&m.solved<=m.attempted&&m.programs&&['study','wellbeing','service'].every(k=>count(m.programs[k]))&&['lastProgram','lastContact','lastInvestigation'].every(k=>m[k]===null||age(m[k]))&&(!p||age(p.opened)&&age(p.age)&&p.age>=p.opened)&&(!r||age(r.age)&&['training','support','service','completed'].every(k=>typeof r[k]==='boolean')&&(!r.completed||r.training&&r.support&&r.service)&&(r.lastAction===null||age(r.lastAction)))&&(!i||!!puzzle(i.kind)&&age(i.startedAge))&&Array.isArray(m.history)&&m.history.length<=35&&m.history.every(hist)&&Array.isArray(m.legacy)&&m.legacy.length<=18&&m.legacy.every(h=>hist(h)&&typeof h.ancestor==='string'&&Number.isInteger(h.generation)&&h.generation>=1);
}
