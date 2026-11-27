// Lifely 1.19.0 — competing futures.
// Real career, business and family overlaps between the player and existing NPC goals.
// Every consequence is applied to the original player/NPC record. No RNG or phantom NPCs.
const cap=x=>Math.max(0,Math.min(100,Math.round(x)));
const clip=(x,n=230)=>String(x??'').replace(/\s+/g,' ').trim().slice(0,n);
const ageOK=x=>Number.isInteger(x)&&x>=0&&x<=110;
const num=x=>typeof x==='number'&&Number.isFinite(x);
const str=(x,n)=>typeof x==='string'&&x.length>0&&x.length<=n;
const MAX_ACTIVE=2,MAX_COMPLETE=24,MAX_NEWS=25,MAX_SEEN=45,MAX_ANCESTORS=10;
const state=()=>({version:1,serial:0,active:[],completed:[],seen:[],news:[],ancestors:[]});
export const competingFuturesState=s=>s.competingFutures||state();
const ensure=s=>s.competingFutures??=state();

const personFor=(s,id)=>{
 if(id?.startsWith('person-')){
  const p=(s.people||[]).find(p=>'person-'+p.id===id&&p.alive&&p.age>=18&&p.world);
  return p?{id,name:p.name,kind:'family',person:p,trust:p.world.trust??p.bond,
   rivalry:p.world.rivalry??0,role:p.role}:null;
 }
 const p=(s.world?.autonomy?.alumni||[]).find(p=>p.id===id);
 return p?{id,name:p.name,kind:'alumni',person:p,trust:p.trust??50,rivalry:p.rivalry??10,role:'alumnus'}:null;
};
const goalFor=(s,id)=>{
 const m=s.npcAmbitions;
 return (m?.active||[]).find(x=>x.id===id)||
  (m?.completed||[]).find(x=>x.id===id)||null;
};
const liveGoal=(s,goal)=>goalFor(s,goal.id)||goal;
const sameCareer=(s,p)=>!!s.job&&p.kind==='family'&&
  Number.isInteger(p.person.world.job)&&p.person.world.job===s.job.id;
const familyTies=p=>p.kind==='family'&&
 ['partner','parent','child','sibling','grandparent','ex'].includes(p.role);
function overlap(s,p,goal){
 if(s.age<18||!goal)return null;
 if(goal.track==='career'&&sameCareer(s,p))return {
  kind:'career',title:'Rivals for the same career path',
  contextId:String(s.job.id),
  context:'You and '+p.name+' work in the same profession. Their ambition may change your reputation, performance and relationship.',
  detail:'Existing job #'+s.job.id+' · NPC goal '+goal.progress+'/100'};
 if(s.business&&(
  p.kind==='alumni'&&p.person.profession==='Founder'&&['career','security','creative','service'].includes(goal.track)||
  p.kind==='family'&&['friend','partner','child'].includes(p.role)&&
   ['career','security','creative','service'].includes(goal.track)
  ))return {
   kind:'business',title:'A business relationship at a crossroads',
   contextId:String(s.business.sector),
   context:p.name+' wants a future that may collide with the company you actually own. Collaboration and competition carry different risks.',
   detail:'Business sector '+s.business.sector+' · NPC goal '+goal.progress+'/100'};
 if(familyTies(p)&&['security','connection','repair'].includes(goal.track))return {
  kind:'family',title:'Two futures within one family',
  contextId:p.role,
  context:p.name+' is making choices about '+goal.goal.toLowerCase()+
   '. Your shared history matters, but you cannot make the choice for them.',
  detail:'Existing '+p.role+' relationship · NPC goal '+goal.progress+'/100'};
 return null;
}
function contextStill(s,a){
 const p=personFor(s,a.personId);
 if(!p)return false;
 if(a.kind==='career')return !!s.job&&s.job.id===Number(a.contextId)&&
  p.kind==='family'&&p.person.world.job===s.job.id;
 if(a.kind==='business')return !!s.business&&s.business.sector===a.contextId;
 return familyTies(p)&&p.role===a.contextId;
}
const keyFor=(p,goal,kind)=>p.id+'|'+kind+'|'+goal.id;
function announce(s,message,ctx){
 const m=ensure(s);m.news.push({age:s.age,text:clip(message)});
 m.news=m.news.slice(-MAX_NEWS);ctx?.add?.(s,message,'people');
}
function eligible(s,person,goal,match){
 const m=competingFuturesState(s);
 const key=keyFor(person,goal,match.kind);
 if(m.active.some(x=>x.key===key||x.personId===person.id))return false;
 if(m.seen.some(x=>x.key===key&&s.age-x.age<8))return false;
 if(m.seen.some(x=>x.personId===person.id&&s.age-x.age<3))return false;
 return true;
}
function candidates(s){
 const goals=s.npcAmbitions?.active||[];
 const priority={career:4,business:3,family:2};
 return goals.flatMap(goal=>{
  const p=personFor(s,goal.personId);if(!p)return [];
  const match=overlap(s,p,goal);return match&&eligible(s,p,goal,match)?[{
   p,goal,match,priority:priority[match.kind]+(goal.status==='ready'?2:0)+
   (p.rivalry>=50?1:0)
  }]:[];
 }).sort((a,b)=>b.priority-a.priority||a.goal.startedAge-b.goal.startedAge||
  a.p.id.localeCompare(b.p.id));
}
function start(s,item,ctx){
 const {p,goal,match}=item,m=ensure(s);
 const a={id:'clash-g'+s.generation+'-'+(++m.serial),
  key:keyFor(p,goal,match.kind),personId:p.id,goalId:goal.id,
  personName:clip(p.name,70),role:clip(p.role,40),
  kind:match.kind,title:match.title,context:clip(match.context,245),
  contextId:clip(match.contextId,60),startedAge:s.age,dueAge:s.age+2,
  status:'open',stage:0,firstGoal:cap(goal.progress),latestGoal:cap(goal.progress),
  firstTrust:cap(p.trust),latestTrust:cap(p.trust),
  firstRivalry:cap(p.rivalry),latestRivalry:cap(p.rivalry),
  firstPlayerPerformance:cap(s.stats.performance),
  lastPlayerPerformance:cap(s.stats.performance),
  firstBusinessDemand:s.business?cap(s.business.demand??50):null,
  latestBusinessDemand:s.business?cap(s.business.demand??50):null,
  decisions:[],ending:null,endedAge:null,finalLine:null};
 m.active.push(a);m.seen.push({key:a.key,personId:p.id,age:s.age});m.seen=m.seen.slice(-MAX_SEEN);
 announce(s,p.name+' has an ambition that now intersects with your '+(a.kind==='career'?'career':a.kind==='business'?'business':'family life')+'.',ctx);
}
function npcChange(s,p,trust,rivalry,label){
 if(!p)return {trust:0,rivalry:0,bond:0};
 const src=p.person,beforeTrust=p.trust,beforeRivalry=p.rivalry,beforeBond=src.bond??null;
 if(p.kind==='family'){
  src.world.trust=cap((src.world.trust??p.trust)+trust);
  src.world.rivalry=cap((src.world.rivalry??p.rivalry)+rivalry);
  if(trust!==0)src.bond=cap((src.bond??50)+Math.round(trust*.6));
  if(trust!==0||rivalry!==0){
   src.memories??=[];src.memories.push({age:s.age,text:clip(label,180)});
   src.memories=src.memories.slice(-15);
  }
 }else{
  src.trust=cap((src.trust??p.trust)+trust);src.rivalry=cap((src.rivalry??p.rivalry)+rivalry);
  if(trust!==0||rivalry!==0){
   src.history??=[];src.history.push({age:s.age,kind:'competing-futures',event:clip(label,180)});
   src.history=src.history.slice(-18);
  }
 }
 const next=personFor(s,p.id);
 return {trust:next.trust-beforeTrust,rivalry:next.rivalry-beforeRivalry,
  bond:beforeBond===null?0:src.bond-beforeBond};
}
function choices(s,a){
 const p=personFor(s,a.personId),goal=goalFor(s,a.goalId);
 if(!p)return [];
 const finance=a.kind==='family'&&goal?.track==='security'&&p.kind==='family';
 const opening=a.status==='open';
 if(opening&&a.kind==='career')return [
  {index:0,tag:'cooperate',label:'Share expertise fairly',
   detail:'Build a genuine alliance · both careers can grow',trust:8,rivalry:-5,
   goal:9,stat:'performance',statDelta:2,business:0,cash:0},
  {index:1,tag:'compete',label:'Compete for the opportunity',
   detail:'Prioritize your performance; the rivalry grows',trust:-3,rivalry:9,
   goal:5,stat:'performance',statDelta:4,business:0,cash:0},
  {index:2,tag:'independent',label:'Keep professional boundaries',
   detail:'Both people pursue their careers without intervention',trust:0,rivalry:0,
   goal:0,stat:null,statDelta:0,business:0,cash:0}
 ];
 if(opening&&a.kind==='business')return [
  {index:0,tag:'partner',label:'Propose a fair collaboration',
   detail:'Invest time in a working partnership, growing real business demand',trust:7,rivalry:-3,
   goal:8,stat:'knowledge',statDelta:2,business:5,cash:0},
  {index:1,tag:'compete',label:'Defend your business independently',
   detail:'Protect market share aggressively; rivalry can damage demand',trust:-4,rivalry:9,
   goal:3,stat:'confidence',statDelta:3,business:-3,cash:0},
  {index:2,tag:'independent',label:'Respect their separate venture',
   detail:'Neither side loses money or trust for keeping distance',trust:0,rivalry:0,
   goal:0,stat:null,statDelta:0,business:0,cash:0}
 ];
 if(opening&&a.kind==='family')return [
  {index:0,tag:finance?'support-finance':'support-family',
   label:finance?'Transfer $200 from your own cash':'Listen and offer meaningful support',
   detail:finance?'A real family contribution; requires $200 available':'Strengthen an existing relationship without promising a reward',
   trust:8,rivalry:-5,goal:10,stat:'kindness',statDelta:3,business:0,cash:finance?200:0},
  {index:1,tag:'challenge',label:'Ask them to reconsider the risks',
   detail:'Protect your priorities; the disagreement may hurt trust',trust:-5,rivalry:8,
   goal:3,stat:'confidence',statDelta:3,business:0,cash:0},
  {index:2,tag:'independent',label:'Respect their decision',
   detail:'Do not force their future or alter their current bond',trust:0,rivalry:0,
   goal:0,stat:null,statDelta:0,business:0,cash:0}
 ];
 if(a.kind==='career')return [
  {index:0,tag:'renew',label:'Rebuild the professional alliance',
   detail:'Use what changed over two years to repair trust',trust:10,rivalry:-7,
   goal:8,stat:'performance',statDelta:2,business:0,cash:0},
  {index:1,tag:'challenge',label:'Accept another fair challenge',
   detail:'Keep the rivalry alive without guaranteed victory',trust:-2,rivalry:7,
   goal:4,stat:'confidence',statDelta:3,business:0,cash:0},
  {index:2,tag:'independent',label:'Let your careers diverge',
   detail:'Their next professional move remains theirs',trust:0,rivalry:0,
   goal:0,stat:null,statDelta:0,business:0,cash:0}
 ];
 if(a.kind==='business')return [
  {index:0,tag:'renew',label:'Negotiate a lasting business agreement',
   detail:'Grow customer confidence if the company still exists',trust:8,rivalry:-5,
   goal:8,stat:'social',statDelta:2,business:3,cash:0},
  {index:1,tag:'challenge',label:'Keep competing openly',
   detail:'Tough competition may shrink demand and damage trust',trust:-3,rivalry:7,
   goal:4,stat:'confidence',statDelta:2,business:-2,cash:0},
  {index:2,tag:'independent',label:'Let each business grow independently',
   detail:'An honest exit; no invented contract or market reward',trust:0,rivalry:0,
   goal:0,stat:null,statDelta:0,business:0,cash:0}
 ];
 return [
  {index:0,tag:'renew',label:'Agree on realistic family commitments',
   detail:'Repair trust while making room for separate ambitions',trust:10,rivalry:-7,
   goal:8,stat:'kindness',statDelta:2,business:0,cash:0},
  {index:1,tag:'challenge',label:'Set a firm boundary',
   detail:'Stress can fall, but the relationship may become strained',trust:-2,rivalry:5,
   goal:3,stat:'stress',statDelta:-3,business:0,cash:0},
  {index:2,tag:'independent',label:'Leave the decision with them',
   detail:'Do not force a reconciliation or interfere with their goals',trust:0,rivalry:0,
   goal:0,stat:null,statDelta:0,business:0,cash:0}
 ];
}
function optionsAvailable(s,a){
 if(!s.alive||s.pending!==null||s.mini||s.world?.network?.conversation||
  s.world?.storyDirector?.active||s.fate?.active?.status==='playing'||
  s.careerCampaigns?.active||s.everydayScenes?.active||s.hobbyCircuit?.active||
  s.workplace?.active?.status==='ready'||s.familyStories?.active?.status==='ready'||
  s.worldPulse?.active?.status==='ready'||(s.justice?.years||0)>0)return false;
 return ['open','ready'].includes(a.status)&&!!personFor(s,a.personId);
}
export function competingFuturesCommands(s){
 return competingFuturesState(s).active.flatMap(a=>{
  if(!['open','ready'].includes(a.status))return [];
  return choices(s,a).map(o=>({
   id:'clash:'+a.id+':'+o.index,label:o.label,
   detail:o.detail+' · '+a.personName,
   enabled:optionsAvailable(s,a)&&s.actions>0&&(!o.cash||s.cash>=o.cash)
  }));
 });
}
function complete(s,a,ctx,forced=null){
 const m=ensure(s),p=personFor(s,a.personId);
 const current=contextStill(s,a);
 const first=a.decisions[0],second=a.decisions[1];
 const trust=p?cap(p.trust):0,rivalry=p?cap(p.rivalry):0;
 const ending=forced||(p===null?'interrupted':
  !a.decisions.length?'unanswered':
  !current?'diverged':
  a.decisions.every(d=>d.tag==='independent')?'independent':
  trust>=70&&rivalry<55&&a.decisions.some(d=>['cooperate','partner','support-finance','support-family','renew'].includes(d.tag))?'alliance':
  rivalry>=60||trust<=35?'rivals':
  a.kind==='family'&&trust>=55?'compromise':
  a.kind==='business'&&trust>=52&&a.decisions.some(d=>d.businessDelta>0)?'partnership':
  'unresolved');
 const endings={
  interrupted:'A person in the story is no longer available. No relationship was revived.',
  unanswered:'Their future moved on without a response from you.',
  diverged:'The original professional or family circumstances changed. No obsolete deal was enforced.',
  independent:'You left their ambitions in their hands, and both paths continued separately.',
  alliance:'You found a way to respect two different ambitions while maintaining a real bond.',
  rivals:'The rivalry remains unresolved, shaped by the trust between you now.',
  compromise:'The family adjusted its expectations without erasing anyone’s independence.',
  partnership:'A fair partnership improved real business relations without inventing new capital.',
  unresolved:'Neither cooperation nor competition produced a simple resolution.'
 };
 a.status='completed';a.endedAge=s.age;a.ending=ending;
 a.finalLine=clip(a.personName+': '+endings[ending],260);
 m.active=m.active.filter(x=>x.id!==a.id);
 m.completed.push({...a});m.completed=m.completed.slice(-MAX_COMPLETE);
 announce(s,a.finalLine,ctx);
 return {ending,first:first?.tag||null,second:second?.tag||null};
}
export function competingFuturesYear(s,ctx={}){
 if(!s.alive||s.age<18)return;
 const m=ensure(s);
 for(const a of [...m.active]){
  const p=personFor(s,a.personId);
  if(!p){complete(s,a,ctx,'interrupted');continue;}
  if(s.age<=a.startedAge)continue;
  const goal=goalFor(s,a.goalId);
  if(goal)a.latestGoal=cap(goal.progress);
  a.latestTrust=cap(p.trust);a.latestRivalry=cap(p.rivalry);
  a.lastPlayerPerformance=cap(s.stats.performance);
  a.latestBusinessDemand=s.business?cap(s.business.demand??50):null;
  if(a.status==='open'&&s.age>=a.startedAge+3){
   complete(s,a,ctx,'unanswered');continue;
  }
  if(a.status==='waiting'&&s.age>=a.dueAge){
   a.status='ready';
   announce(s,a.personName+' is ready to revisit a shared ambition after two years of independent change.',ctx);
  }
  if(a.status==='ready'&&s.age>=a.dueAge+3){
   complete(s,a,ctx);continue;
  }
 }
 if(s.age>101||m.active.length>=MAX_ACTIVE)return;
 // One invitation per calendar year, even if several real lives intersect.
 // Avoid duplicate same-year launches when existing routines revisit this tick.
 if(m.active.some(x=>x.startedAge===s.age))return;
 const candidate=candidates(s)[0];
 if(candidate)start(s,candidate,ctx);
}
export function competingFuturesAct(s,id,ctx){
 const m=/^clash:(clash-g[0-9]+-[0-9]+):([012])$/.exec(id);
 if(!m||!competingFuturesCommands({...s,actions:s.actions+1}).some(c=>c.id===id&&c.enabled))
  throw Error('This competing-futures decision is unavailable.');
 const a=ensure(s).active.find(x=>x.id===m[1]),p=a&&personFor(s,a.personId);
 if(!a||!p)throw Error('This person is no longer present.');
 const o=choices(s,a).find(x=>x.index===Number(m[2]));
 if(!o)throw Error('Unknown competing-futures choice.');
 if(o.cash>s.cash)throw Error('Not enough cash to offer that family contribution.');
 const context=contextStill(s,a);
 const statBefore=o.stat?s.stats[o.stat]:0;
 const businessBefore=s.business?.demand??null;
 const playerCashBefore=s.cash,npcCashBefore=p.kind==='family'?p.person.world.cash??0:null;
 const goal=goalFor(s,a.goalId),goalBefore=goal&&goal.status!=='completed'?goal.progress:null;
 const changed=npcChange(s,p,o.trust,o.rivalry,a.title+' — '+o.label);
 if(o.cash){
  // A real, conserved transfer. No money is created by this interaction.
  s.cash-=o.cash;p.person.world.cash=(p.person.world.cash||0)+o.cash;
 }
 if(o.stat)ctx.change(s,o.stat,o.statDelta);
 if(o.business!==0&&context&&a.kind==='business'&&s.business){
  s.business.demand=cap((s.business.demand??50)+o.business);
 }
 if(goalBefore!==null)goal.progress=cap(goal.progress+o.goal);
 const nextGoal=goalBefore===null?0:goal.progress-goalBefore;
 const record={age:s.age,index:o.index,phase:a.stage===0?'opening':'followup',tag:o.tag,
  label:o.label,contextMatched:context,
  trustDelta:changed.trust,rivalryDelta:changed.rivalry,bondDelta:changed.bond,
  stat:o.stat,statDelta:o.stat?s.stats[o.stat]-statBefore:0,
  goalDelta:nextGoal,businessDelta:businessBefore===null||!s.business?0:s.business.demand-businessBefore,
  cashDelta:s.cash-playerCashBefore,npcCashDelta:npcCashBefore===null?0:p.person.world.cash-npcCashBefore};
 a.decisions.push(record);a.latestTrust=cap(personFor(s,p.id).trust);
 a.latestRivalry=cap(personFor(s,p.id).rivalry);a.latestGoal=goal?cap(goal.progress):a.latestGoal;
 a.lastPlayerPerformance=cap(s.stats.performance);
 a.latestBusinessDemand=s.business?cap(s.business.demand??50):null;
 if(a.stage===0){
  a.stage=1;a.status='waiting';a.dueAge=a.startedAge+2;
  announce(s,'You chose to '+o.label.toLowerCase()+' with '+a.personName+'. This shared future may change again.',ctx);
 }else{
  a.stage=2;complete(s,a,ctx);
 }
 return record;
}
export function competingFuturesView(s){
 const m=competingFuturesState(s);
 return {active:m.active.slice().reverse().map(a=>{
  const p=personFor(s,a.personId),goal=goalFor(s,a.goalId);
  return {...a,contextAlive:contextStill(s,a),
   nowTrust:p?cap(p.trust):null,nowRivalry:p?cap(p.rivalry):null,
   nowGoal:goal?cap(goal.progress):a.latestGoal,
   nowGoalTitle:goal?.goal||'An earlier personal goal',
   nowPlayerPerformance:cap(s.stats.performance),
   nowBusinessDemand:s.business?cap(s.business.demand??50):null,
   nowBond:p?.person.bond??null,
   changes:a.decisions.at(-1)||null,ready:['open','ready'].includes(a.status)};
 }).sort((a,b)=>({ready:0,open:1,waiting:2}[a.status]??3)-
                   ({ready:0,open:1,waiting:2}[b.status]??3)),
 completed:m.completed.slice(-9).reverse().map(a=>({
  id:a.id,kind:a.kind,title:a.title,personName:a.personName,role:a.role,
  startedAge:a.startedAge,endedAge:a.endedAge,
  ending:a.ending,finalLine:a.finalLine,decisions:a.decisions.length})),
 news:m.news.slice(-8).reverse(),ancestors:m.ancestors.slice().reverse(),count:m.completed.length,age:s.age};
}
export function competingFuturesInheritance(next,old){
 const source=competingFuturesState(old),m=state();
 const important=source.completed.filter(x=>
  ['alliance','partnership','rivals','compromise','diverged'].includes(x.ending)).slice(-3);
 m.ancestors=[...source.ancestors,{
  generation:old.generation,name:clip(old.name,32),
  note:clip(important.length?important.map(x=>x.personName+' ('+x.kind+'): '+x.ending).join('; '):
   'Family, colleagues and partners continued following ambitions of their own.',240)
 }].slice(-MAX_ANCESTORS);
 next.competingFutures=m;
}
export function validateCompetingFutures(m){
 if(m===undefined)return true;
 const kinds=['career','business','family'],statuses=['open','waiting','ready','completed'],
  endings=['interrupted','unanswered','diverged','independent','alliance','rivals','compromise','partnership','unresolved'],
  tags=['cooperate','compete','partner','independent','support-finance','support-family','challenge','renew'];
 const bound=x=>num(x)&&x>=0&&x<=100;
 const opt=(x,n)=>x===null||str(x,n);
 const decision=d=>d&&ageOK(d.age)&&[0,1,2].includes(d.index)&&
  ['opening','followup'].includes(d.phase)&&tags.includes(d.tag)&&str(d.label,110)&&
  typeof d.contextMatched==='boolean'&&
  ['trustDelta','rivalryDelta','bondDelta','statDelta','goalDelta','businessDelta','cashDelta','npcCashDelta']
   .every(key=>num(d[key])&&Math.abs(d[key])<=1000000)&&
  (d.stat===null||['performance','knowledge','confidence','kindness','social','stress'].includes(d.stat))&&
  d.cashDelta+d.npcCashDelta===0;
 const valid=a=>a&&str(a.id,80)&&str(a.key,190)&&str(a.personId,100)&&str(a.goalId,100)&&
  str(a.personName,70)&&str(a.role,40)&&kinds.includes(a.kind)&&str(a.title,120)&&
  str(a.context,245)&&str(a.contextId,60)&&ageOK(a.startedAge)&&ageOK(a.dueAge)&&
  statuses.includes(a.status)&&[0,1,2].includes(a.stage)&&
  [a.firstGoal,a.latestGoal,a.firstTrust,a.latestTrust,a.firstRivalry,a.latestRivalry,
   a.firstPlayerPerformance,a.lastPlayerPerformance].every(bound)&&
  (a.firstBusinessDemand===null||bound(a.firstBusinessDemand))&&
  (a.latestBusinessDemand===null||bound(a.latestBusinessDemand))&&
  Array.isArray(a.decisions)&&a.decisions.length<=2&&a.decisions.every(decision)&&
  (a.status==='open'?a.stage===0&&a.decisions.length===0:
   ['waiting','ready'].includes(a.status)?a.stage===1&&a.decisions.length===1:
   a.ending!==null&&a.endedAge!==null)&&
  (a.ending===null||endings.includes(a.ending))&&
  (a.endedAge===null||ageOK(a.endedAge))&&opt(a.finalLine,260);
 return !!m&&m.version===1&&Number.isInteger(m.serial)&&m.serial>=0&&
  Array.isArray(m.active)&&m.active.length<=MAX_ACTIVE&&
  m.active.every(a=>valid(a)&&a.status!=='completed')&&
  Array.isArray(m.completed)&&m.completed.length<=MAX_COMPLETE&&
  m.completed.every(a=>valid(a)&&a.status==='completed'&&str(a.finalLine,260))&&
  new Set([...m.active,...m.completed].map(a=>a.id)).size===m.active.length+m.completed.length&&
  new Set(m.active.map(a=>a.personId)).size===m.active.length&&
  Array.isArray(m.seen)&&m.seen.length<=MAX_SEEN&&m.seen.every(x=>
   str(x.key,190)&&str(x.personId,100)&&ageOK(x.age))&&
  Array.isArray(m.news)&&m.news.length<=MAX_NEWS&&m.news.every(x=>ageOK(x.age)&&str(x.text,230))&&
  Array.isArray(m.ancestors)&&m.ancestors.length<=MAX_ANCESTORS&&
  m.ancestors.every(x=>Number.isInteger(x.generation)&&x.generation>0&&str(x.name,32)&&str(x.note,240));
}
