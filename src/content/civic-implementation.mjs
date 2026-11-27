// Lifely 1.26.0 — policy implementation after real civic mandates.
// No invented voters, recipients, paid contracts, municipal treasury,
// resources or random events. Every actor is in existing saved NPC data.
const cap=x=>Math.max(0,Math.min(100,Math.round(x)));
const short=(v,n=230)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,n);
const valid=(v,n)=>typeof v==='string'&&v.length>0&&v.length<=n;
const age=n=>Number.isInteger(n)&&n>=0&&n<=110;
const score=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100;
const change=n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=100;
const issueNames={
 'family-support':'Family care & neighborhood support',
 'skills-access':'Apprenticeship & skills access',
 'shared-space':'Shared neighborhood spaces',
 'community-standards':'Community program standards'};
const outcomes=['delivered','revised','stalled','abandoned','lost-contact'];
const fresh=()=>({version:1,serial:0,seen:[],active:null,completed:[],news:[],
 ancestors:[],lastStartAge:-100,lastOfferAge:-100});
export const civicImplementationState=s=>s.civicImplementation||fresh();
const ensure=s=>s.civicImplementation??=fresh();
const group=(s,id)=>(s.socialCircles?.groups||[]).find(g=>g.id===id)||null;
const network=(s,id)=>(s.organizationNetwork?.links||[]).find(l=>l.id===id)||null;
function contact(s,id){
 if(typeof id!=='string'||!id)return null;
 if(id.startsWith('person-')){
  const p=(s.people||[]).find(x=>'person-'+x.id===id&&x.alive&&x.age>=18&&x.world);
  return p?{id,name:p.name,trust:cap(p.world.trust??p.bond??50),
   rivalry:cap(p.world.rivalry??0),kind:'family',ref:p}:null;
 }
 const p=(s.world?.autonomy?.alumni||[]).find(x=>x.id===id);
 return p?{id,name:p.name,trust:cap(p.trust??50),
  rivalry:cap(p.rivalry??0),kind:'alumni',ref:p}:null;
}
function pair(s,task){
 const a=group(s,task.groupAId),b=group(s,task.groupBId),
  link=network(s,task.linkId);
 if(!a||!b||!link||a.status!=='active'||b.status!=='active')return null;
 const aPeople=a.members.map(id=>contact(s,id)).filter(Boolean),
  bPeople=b.members.map(id=>contact(s,id)).filter(Boolean);
 let x=aPeople.find(p=>p.id===a.leaderId)||aPeople[0];
 let y=bPeople.find(p=>p.id===b.leaderId&&p.id!==x?.id)||
   bPeople.find(p=>p.id!==x?.id);
 if(x&&!y&&bPeople.length){
  // A shared officeholder does not invent an additional person.
  const other=aPeople.find(p=>p.id!==bPeople[0].id);
  if(other){x=other;y=bPeople[0];}
 }
 if(!x||!y||x.id===y.id)return null;
 return {a,b,link,x,y};
}
function notice(s,ctx,message){
 const m=ensure(s),text=short(message,235);
 m.news.push({age:s.age,text});m.news=m.news.slice(-25);
 ctx?.add?.(s,text,'people');
}
function history(t,s,kind,message){
 t.history.push({age:s.age,kind,text:short(message,220)});
 t.history=t.history.slice(-12);
}
function init(s,mandate,ctx){
 const state=ensure(s),p=pair(s,mandate);
 if(!p)return null;
 const favorable=mandate.ending==='joint-adoption';
 const limited=['a-priority','b-priority','partial-compromise'].includes(mandate.ending);
 const task={
  id:'delivery-g'+s.generation+'-'+(++state.serial),
  sourceId:mandate.id,sourceOutcome:mandate.ending,issue:mandate.issue,
  issueName:issueNames[mandate.issue],groupAId:p.a.id,groupBId:p.b.id,
  linkId:p.link.id,groupAName:short(p.a.name,100),groupBName:short(p.b.name,100),
  representativeA:p.x.id,representativeB:p.y.id,
  ownerA:p.a.leaderId,ownerB:p.b.leaderId,
  startedAge:s.age,lastAge:s.age,nextAge:Math.min(110,s.age+2),
  dueAge:Math.min(110,s.age+6),stage:0,status:'active',
  progress:favorable?22:limited?12:4,
  deliveryQuality:favorable?66:limited?52:35,
  publicTrust:cap((p.link.trust+p.a.standing+p.b.standing)/3),
  opposition:favorable?22:limited?44:68,
  partnerships:[],pending:false,offerAge:null,interruptedAge:null,
  choices:[],history:[],result:null,endedAge:null,finalLine:null
 };
 state.active=task;state.lastStartAge=s.age;
 history(task,s,'origin','Public mandate outcome '+mandate.ending+
  ' became an actual organization implementation project.');
 notice(s,ctx,task.issueName+': '+task.groupAName+' and '+task.groupBName+
  ' began following through on their prior decision.');
 return task;
}
function finish(s,t,ctx,forced=null){
 const m=ensure(s),p=pair(s,t);
 const result=forced||(
  t.progress>=72&&t.deliveryQuality>=54&&t.opposition<=55?'delivered':
  t.progress>=45&&t.publicTrust>=45?'revised':t.opposition>=68?'stalled':
  'abandoned');
 const meanings={
  delivered:'Both original organizations delivered a verifiable shared program.',
  revised:'Real members completed a smaller, revised version of their promise.',
  stalled:'Opposition and missed milestones prevented the program from advancing.',
  abandoned:'The groups ended their commitment without sufficient progress.',
  'lost-contact':'The organizations could not continue with two actual living representatives.'};
 t.status='completed';t.result=result;t.endedAge=s.age;t.pending=false;
 t.offerAge=null;
 t.finalLine=short(t.issueName+': '+meanings[result],230);
 history(t,s,'ending',t.finalLine);
 if(p&&result!=='lost-contact'){
  const good=result==='delivered',partial=result==='revised',
    impact=good?6:partial?2:result==='stalled'?-4:-2;
  for(const g of [p.a,p.b]){
   g.standing=cap(g.standing+impact);
   if(g.project?.status==='active'&&impact>0)g.project.progress=cap(g.project.progress+impact);
   g.history.push({age:s.age,kind:'relationship',title:'Policy implementation: '+t.issueName,
    outcome:result,description:short(meanings[result],240)});
   g.history=g.history.slice(-8);
  }
  p.link.trust=cap(p.link.trust+(good?5:partial?2:-3));
  p.link.competition=cap(p.link.competition+(good?-4:partial?-1:4));
  p.link.history.push({age:s.age,kind:'player-story',
   label:short('Implementation — '+t.issueName,130),
   outcome:good?'successful':result==='stalled'?'contested':'negotiated'});
  p.link.history=p.link.history.slice(-8);
 }
 m.active=null;m.completed.push({...t});m.completed=m.completed.slice(-24);
 notice(s,ctx,t.finalLine);
}
function sideEffects(s,id,trust,rivalry,message){
 const p=contact(s,id);
 if(!p||(!trust&&!rivalry))return {trust:0,rivalry:0};
 if(p.kind==='family'){
  p.ref.world.trust=cap((p.ref.world.trust??p.trust)+trust);
  p.ref.world.rivalry=cap((p.ref.world.rivalry??p.rivalry)+rivalry);
  if(trust)p.ref.bond=cap((p.ref.bond??50)+Math.round(trust*.4));
  p.ref.memories??=[];p.ref.memories.push({age:s.age,text:short(message,140)});
  p.ref.memories=p.ref.memories.slice(-15);
 }else{
  p.ref.trust=cap((p.ref.trust??p.trust)+trust);
  p.ref.rivalry=cap((p.ref.rivalry??p.rivalry)+rivalry);
  p.ref.history??=[];p.ref.history.push({age:s.age,kind:'policy-delivery',event:short(message,140)});
  p.ref.history=p.ref.history.slice(-18);
 }
 const now=contact(s,id);
 return {trust:now.trust-p.trust,rivalry:now.rivalry-p.rivalry};
}
function cycle(s,t,ctx){
 const p=pair(s,t);
 if(!p){
  if(t.interruptedAge===null){
   t.interruptedAge=s.age;t.pending=false;t.offerAge=null;
   history(t,s,'pause','The original project paused when living members were no longer available.');
  }else if(s.age-t.interruptedAge>=2)finish(s,t,ctx,'lost-contact');
  t.lastAge=s.age;
  return;
 }
 if(t.interruptedAge!==null){
  t.interruptedAge=null;history(t,s,'resume','The original living organizations resumed the project.');
 }
 if(t.ownerA!==p.a.leaderId||t.ownerB!==p.b.leaderId||
  t.representativeA!==p.x.id||t.representativeB!==p.y.id){
  t.ownerA=p.a.leaderId;t.ownerB=p.b.leaderId;
  t.representativeA=p.x.id;t.representativeB=p.y.id;
  history(t,s,'leadership','Current real organization leaders and representatives renewed the project.');
 }
 if(t.pending&&t.offerAge!==null&&s.age-t.offerAge>=2){
  t.pending=false;t.offerAge=null;
  history(t,s,'missed','The player did not intervene; the organizations kept working on their own.');
 }
 if(s.age<t.nextAge)return;
 // Transparent autonomous progress: no added RNG or player money.
 const cohesion=(p.a.cohesion+p.b.cohesion)/2,
  tension=(p.a.tension+p.b.tension)/2,
  lift=Math.max(2,Math.round(10+(cohesion-tension)/12+
   (p.link.trust-p.link.competition)/20));
 t.progress=cap(t.progress+lift);
 t.deliveryQuality=cap(t.deliveryQuality+Math.round((cohesion-tension)/20));
 t.publicTrust=cap(t.publicTrust+Math.round((p.link.trust-p.link.competition)/24));
 t.opposition=cap(t.opposition+Math.round((p.link.competition-p.link.trust)/25));
 t.lastAge=s.age;t.stage=Math.min(3,t.stage+1);
 t.nextAge=Math.min(110,s.age+2);
 history(t,s,'autonomy','Existing members continued implementing the public commitment.');
 notice(s,ctx,t.issueName+' reached year '+(s.age-t.startedAge)+' of implementation.');
 if(t.stage>=3||s.age>=t.dueAge){finish(s,t,ctx);return;}
 const m=ensure(s);
 if(s.age-m.lastOfferAge>=3){
  t.pending=true;t.offerAge=s.age;m.lastOfferAge=s.age;
 }
}
const blocked=s=>!s.alive||s.pending!==null||s.mini||
 s.world?.network?.conversation||s.world?.storyDirector?.active||
 s.fate?.active?.status==='playing'||s.careerCampaigns?.active||
 s.everydayScenes?.active||s.hobbyCircuit?.active||
 s.workplace?.active?.status==='ready'||s.familyStories?.active?.status==='ready'||
 s.worldPulse?.active?.status==='ready'||(s.justice?.years||0)>0;
function options(t){
 return [
 {index:0,tag:'audit',label:'Audit delivery with both existing organizations',
  detail:'Gather evidence, improve delivery quality and reinforce trust between members'},
 {index:1,tag:'prioritize',label:'Give '+t.groupAName+' priority on implementation',
  detail:'Push one group’s demands forward, raising opposition and resentment'},
 {index:2,tag:'collaborate',label:'Contribute your current professional skills to the project',
  detail:'Support a real group program and record a real business collaboration when eligible'},
 {index:3,tag:'independent',label:'Leave implementation to the organizations',
  detail:'No change to player stats, money, NPCs or group progress'}
 ];
}
function eligible(s,t,index){
 if(blocked(s)||s.actions<=0||!pair(s,t))return false;
 if(index===2&&!s.job&&!s.business)return false;
 return true;
}
export function civicImplementationCommands(s){
 const task=civicImplementationState(s).active;
 if(!task?.pending)return [];
 return options(task).map(o=>({
  id:'delivery:'+task.id+':'+o.index,label:o.label,detail:o.detail,
  enabled:eligible(s,task,o.index)}));
}
export function civicImplementationAct(s,id,ctx){
 const match=/^delivery:(delivery-g[0-9]+-[0-9]+):([0123])$/.exec(id);
 if(!match||!civicImplementationCommands({...s,actions:s.actions+1})
  .some(o=>o.id===id&&o.enabled))throw Error('The implementation choice is unavailable.');
 const t=ensure(s).active,p=pair(s,t),c=options(t)[Number(match[2])];
 const before={progress:t.progress,quality:t.deliveryQuality,trust:t.publicTrust,
  opposition:t.opposition,groupA:p.a.standing,groupB:p.b.standing,
  linkTrust:p.link.trust,competition:p.link.competition};
 const effects={a:{trust:0,rivalry:0},b:{trust:0,rivalry:0}};
 let stat=null,statDelta=0,partner=null;
 if(c.index===0){
  t.progress=cap(t.progress+7);
  t.deliveryQuality=cap(t.deliveryQuality+12);
  t.publicTrust=cap(t.publicTrust+6);
  t.opposition=cap(t.opposition-6);
  p.a.standing=cap(p.a.standing+2);p.b.standing=cap(p.b.standing+2);
  p.link.trust=cap(p.link.trust+4);
  effects.a=sideEffects(s,p.x.id,3,-2,c.label);
  effects.b=sideEffects(s,p.y.id,3,-2,c.label);
  stat='knowledge';
 }else if(c.index===1){
  t.progress=cap(t.progress+4);
  t.deliveryQuality=cap(t.deliveryQuality-5);
  t.publicTrust=cap(t.publicTrust-8);
  t.opposition=cap(t.opposition+11);
  p.a.standing=cap(p.a.standing+4);p.b.standing=cap(p.b.standing-3);
  p.link.competition=cap(p.link.competition+7);
  effects.a=sideEffects(s,p.x.id,4,0,c.label);
  effects.b=sideEffects(s,p.y.id,-5,6,c.label);
  stat='confidence';
 }else if(c.index===2){
  t.progress=cap(t.progress+12);
  t.deliveryQuality=cap(t.deliveryQuality+6);
  t.publicTrust=cap(t.publicTrust+3);
  p.a.standing=cap(p.a.standing+2);p.b.standing=cap(p.b.standing+2);
  effects.a=sideEffects(s,p.x.id,3,-1,c.label);
  effects.b=sideEffects(s,p.y.id,3,-1,c.label);
  stat='performance';
  if(s.business){
   // A verified existing company can log a *non-paying* proposal partner.
   // No finances, bid acceptance or procurement budgets are invented.
   const existing=[p.x,p.y].find(x=>x.trust>=55);
   if(existing){
    s.business.partners??=[];
    if(Array.isArray(s.business.partners)&&s.business.partners.length<5&&
     !s.business.partners.some(x=>x.personId===existing.id)){
     s.business.partners.push({personId:existing.id,
      name:short(existing.name,75),startedAge:s.age,
      kind:'civic-delivery',sourceId:t.sourceId});
    }
    partner=existing.id;
   }
  }
  t.partnerships.push({age:s.age,memberId:partner||p.x.id,
   name:short(partner?contact(s,partner)?.name||p.x.name:p.x.name,75),
   kind:partner?'real-business-contact':'volunteer-project'});
  t.partnerships=t.partnerships.slice(-4);
 }
 if(stat){const was=s.stats[stat];ctx.change(s,stat,2);statDelta=s.stats[stat]-was;}
 const decision={age:s.age,index:c.index,tag:c.tag,label:c.label,
  progress:t.progress-before.progress,quality:t.deliveryQuality-before.quality,
  publicTrust:t.publicTrust-before.trust,opposition:t.opposition-before.opposition,
  standingA:p.a.standing-before.groupA,standingB:p.b.standing-before.groupB,
  linkTrust:p.link.trust-before.linkTrust,
  competition:p.link.competition-before.competition,
  npcTrustA:effects.a.trust,npcTrustB:effects.b.trust,
  npcRivalryA:effects.a.rivalry,npcRivalryB:effects.b.rivalry,
  stat,statDelta,partnerId:partner};
 t.pending=false;t.offerAge=null;
 t.choices.push(decision);t.choices=t.choices.slice(-4);
 history(t,s,'choice',c.label);
 notice(s,ctx,'You chose '+c.label.toLowerCase()+' for '+t.issueName+'.');
 return decision;
}
export function civicImplementationYear(s,ctx={}){
 if(!s.alive||s.age<22)return;
 const state=ensure(s),wasActive=!!state.active;
 if(state.active)cycle(s,state.active,ctx);
 if(wasActive||state.active||s.age>102||s.age-state.lastStartAge<6)return;
 for(const t of s.civicMandates?.completed||[]){
  if(!t?.id||state.seen.includes(t.id))continue;
  state.seen.push(t.id);state.seen=state.seen.slice(-42);
  if(t.ending==='dissolved')continue;
  init(s,t,ctx);
  if(state.active)break;
 }
}
export function civicImplementationView(s){
 const m=civicImplementationState(s),t=m.active;
 const p=t?pair(s,t):null;
 return {age:s.age,
  active:t?{...t,
   nowA:p?.x?.name||contact(s,t.representativeA)?.name||null,
   nowB:p?.y?.name||contact(s,t.representativeB)?.name||null,
   history:t.history.slice(-5).reverse(),
   choices:t.choices.slice(-4).reverse(),
   options:options(t),
   canCollaborate:!!(s.job||s.business)}:null,
  completed:m.completed.slice(-9).reverse().map(t=>({
   id:t.id,issueName:t.issueName,result:t.result,
   endedAge:t.endedAge,finalLine:t.finalLine,
   groupAName:t.groupAName,groupBName:t.groupBName,
   choices:t.choices.length})),
  ancestors:m.ancestors.slice().reverse(),news:m.news.slice(-8).reverse()};
}
export function civicImplementationInheritance(next,old){
 const source=civicImplementationState(old),n=fresh();
 const memorable=[...source.completed,...(source.active?[source.active]:[])].slice(-3);
 n.ancestors=[...source.ancestors,{
  generation:old.generation,name:short(old.name,32),
  note:short(memorable.length?memorable.map(x=>x.issueName+': '+
   (x.result||'unfinished project')).join('; '):
   'An earlier generation left decisions on how community commitments were delivered.',230)
 }].slice(-10);
 // Policy memories survive. Former project owners, business partners,
 // and real contacts are never given to an unrelated heir.
 next.civicImplementation=n;
}
export function validateCivicImplementation(m){
 if(m===undefined)return true;
 const hist=x=>x&&age(x.age)&&['origin','autonomy','pause','resume',
  'leadership','missed','choice','ending'].includes(x.kind)&&valid(x.text,220);
 const partner=p=>p&&age(p.age)&&valid(p.memberId,100)&&valid(p.name,75)&&
  ['real-business-contact','volunteer-project'].includes(p.kind);
 const decision=d=>d&&age(d.age)&&[0,1,2,3].includes(d.index)&&
  ['audit','prioritize','collaborate','independent'].includes(d.tag)&&valid(d.label,115)&&
  ['progress','quality','publicTrust','opposition','standingA','standingB','linkTrust',
   'competition','npcTrustA','npcTrustB','npcRivalryA','npcRivalryB','statDelta']
   .every(k=>change(d[k]))&&
  (d.stat===null||['knowledge','confidence','performance'].includes(d.stat))&&
  (d.partnerId===null||valid(d.partnerId,100));
 const task=t=>t&&valid(t.id,100)&&valid(t.sourceId,100)&&
  ['joint-adoption','a-priority','b-priority','partial-compromise',
   'gridlock'].includes(t.sourceOutcome)&&
  Object.hasOwn(issueNames,t.issue)&&valid(t.issueName,100)&&
  valid(t.groupAId,100)&&valid(t.groupBId,100)&&t.groupAId!==t.groupBId&&
  valid(t.linkId,190)&&valid(t.groupAName,100)&&valid(t.groupBName,100)&&
  valid(t.representativeA,100)&&valid(t.representativeB,100)&&
  t.representativeA!==t.representativeB&&
  valid(t.ownerA,100)&&valid(t.ownerB,100)&&
  age(t.startedAge)&&age(t.lastAge)&&age(t.nextAge)&&age(t.dueAge)&&
  [0,1,2,3].includes(t.stage)&&['active','completed'].includes(t.status)&&
  [t.progress,t.deliveryQuality,t.publicTrust,t.opposition].every(score)&&
  typeof t.pending==='boolean'&&(t.offerAge===null||age(t.offerAge))&&
  (t.pending?t.offerAge!==null:t.offerAge===null)&&
  (t.interruptedAge===null||age(t.interruptedAge))&&
  Array.isArray(t.partnerships)&&t.partnerships.length<=4&&t.partnerships.every(partner)&&
  Array.isArray(t.choices)&&t.choices.length<=4&&t.choices.every(decision)&&
  Array.isArray(t.history)&&t.history.length<=12&&t.history.every(hist)&&
  (t.result===null||outcomes.includes(t.result))&&
  (t.endedAge===null||age(t.endedAge))&&
  (t.finalLine===null||valid(t.finalLine,230))&&
  (t.status==='completed'?t.result!==null&&t.endedAge!==null&&valid(t.finalLine,230):
   t.result===null&&t.endedAge===null&&t.finalLine===null);
 return !!m&&m.version===1&&Number.isInteger(m.serial)&&m.serial>=0&&
  Array.isArray(m.seen)&&m.seen.length<=42&&m.seen.every(x=>valid(x,100))&&
  new Set(m.seen).size===m.seen.length&&
  (m.active===null||task(m.active)&&m.active.status==='active')&&
  Array.isArray(m.completed)&&m.completed.length<=24&&
  m.completed.every(t=>task(t)&&t.status==='completed')&&
  new Set(m.completed.map(x=>x.id)).size===m.completed.length&&
  Array.isArray(m.news)&&m.news.length<=25&&m.news.every(x=>age(x.age)&&valid(x.text,235))&&
  Array.isArray(m.ancestors)&&m.ancestors.length<=10&&
  m.ancestors.every(x=>Number.isInteger(x.generation)&&x.generation>=1&&
   valid(x.name,32)&&valid(x.note,230))&&
  Number.isInteger(m.lastStartAge)&&m.lastStartAge>=-100&&
  Number.isInteger(m.lastOfferAge)&&m.lastOfferAge>=-100;
}
