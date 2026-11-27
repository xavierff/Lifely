// Lifely 1.20.0 — social influence: earned reputation and real-world callbacks.
// Process actual completed stories once. No extra RNG, money, imaginary NPCs or forced encounters.
const cap=x=>Math.max(0,Math.min(100,Math.round(x)));
const clip=(x,n=240)=>String(x??'').replace(/\s+/g,' ').trim().slice(0,n);
const str=(x,n)=>typeof x==='string'&&x.length>0&&x.length<=n;
const ageOK=x=>Number.isInteger(x)&&x>=0&&x<=110;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const num=x=>finite(x)&&x>=0&&x<=100;
const groups=['family','professional','community'];
const MAX_SEEN=190,MAX_SIGNALS=40,MAX_COMPLETED=24,MAX_NEWS=26,MAX_ANCESTRY=10;
const defaultScores=()=>({family:50,professional:50,community:50});
const empty=()=>({
 version:1,serial:0,scores:defaultScores(),seen:[],signals:[],
 active:null,completed:[],news:[],ancestors:[],lastOfferAge:-100,
 legacy:{name:'',generation:0,echoes:{family:0,professional:0,community:0}}
});
export const socialInfluenceState=s=>s.socialInfluence||empty();
const ensure=s=>s.socialInfluence??=empty();
const person=(s,id)=>{
 if(id?.startsWith('person-')){
  const p=(s.people||[]).find(p=>('person-'+p.id)===id&&p.alive&&p.world&&p.age>=18);
  return p?{id,name:p.name,kind:'person',ref:p,trust:cap(p.world.trust??p.bond),rivalry:cap(p.world.rivalry??0)}:null;
 }
 const p=(s.world?.autonomy?.alumni||[]).find(x=>x.id===id);
 return p?{id,name:p.name,kind:'alumni',ref:p,trust:cap(p.trust??50),rivalry:cap(p.rivalry??0)}:null;
};
function impact(s,source,key,label,group,value,personId=null){
 const m=ensure(s),id=source+':'+key;
 if(m.seen.includes(id))return false;
 m.seen.push(id);m.seen=m.seen.slice(-MAX_SEEN);
 if(value===0)return false;
 const before=m.scores[group];
 m.scores[group]=cap(before+value);
 const actual=m.scores[group]-before;
 if(actual===0)return false;
 m.signals.push({id,age:s.age,group,delta:actual,label:clip(label,180),personId});
 m.signals=m.signals.slice(-MAX_SIGNALS);
 return true;
}
function observe(s){
 const m=ensure(s);
 const competing=s.competingFutures?.completed||[];
 for(const c of competing){
  if(!c.id||c.endedAge===null||c.endedAge===undefined)continue;
  const group=c.kind==='career'||c.kind==='business'?'professional':'family';
  const table={alliance:10,partnership:9,compromise:8,rivals:-12,unresolved:-3,
   diverged:0,independent:0,unanswered:0,interrupted:0};
  impact(s,'clash',c.id,
   c.personName+' — '+c.title+' ended '+c.ending,group,table[c.ending]??0,c.personId);
  // Business and work cooperation are visible in the wider community, but only
  // if genuine characters were involved.
  if(['alliance','partnership'].includes(c.ending)&&c.kind==='business')
   impact(s,'clash-community',c.id,'Business cooperation with '+c.personName,
    'community',3,c.personId);
 }
 for(const x of s.npcAmbitions?.completed||[]){
  if(!x.id||x.endedAge===null||x.endedAge===undefined)continue;
  const helpful=(x.decisions||[]).filter(d=>['encourage','stand-by','renew'].includes(d.tag)).length;
  const harmful=(x.decisions||[]).filter(d=>['challenge'].includes(d.tag)).length;
  const group=x.track==='career'||x.track==='security'?'professional':
   x.track==='service'?'community':'family';
  const delta=helpful?Math.min(8,helpful*4+(x.ending==='achieved'?2:0)):
   harmful?-Math.min(7,harmful*4):0;
  impact(s,'ambition',x.id,
   'Your involvement in '+x.name+'’s '+x.goal.toLowerCase()+' ended '+x.ending,
   group,delta,x.personId);
 }
 for(const x of s.crossroads?.completed||[]){
  if(!x.id||x.endedAge===null||x.endedAge===undefined)continue;
  const engaged=(x.steps||[]).some(d=>d&&d.index!==2);
  const rewards={alliance:8,reconciled:9,rivals:-9,estranged:-8,unresolved:0,
   unanswered:0,observed:0,interrupted:0};
  impact(s,'crossroads',x.id,
   x.aName+' and '+x.bName+' — '+x.ending,
   'community',engaged?(rewards[x.ending]??0):0,null);
 }
 for(const x of s.world?.storyDirector?.completed||[]){
  if(!x.id||x.endedAge===null||x.endedAge===undefined)continue;
  const result=x.outcome;
  const value={reconciled:9,clarified:7,betrayed:-10,escalated:-10,
   fractured:-8,walked_away:0,'walked away':0,unanswered:0}[result]??0;
  impact(s,'story',x.id,clip(x.title||'A social story')+' — '+result,
   'community',value,x.firstId||null);
 }
 // Long-term choices affect earned social standing, but autonomous NPC
 // development and unanswered invitations create no free player rewards.
 for(const t of [...(s.publicAftermath?.threads||[]),...(s.publicAftermath?.archive||[])]){
  for(let i=0;i<(t.decisions||[]).length;i++){
   const d=t.decisions[i],group=t.kind.includes('professional')?
    'professional':t.kind.includes('community')?'community':'family';
   impact(s,'afterlife',t.id+':'+i,
    t.aName+' and '+t.bName+' — '+d.label,
    group,d.tag==='repair'?3:d.tag==='polarize'?-3:0,t.aId);
  }
 }
 // Completing an interactive public event is evidence only when the player
 // meaningfully participated; watching one unfold is never a free reward.
 for(const x of s.playableEvents?.completed||[]){
  if(!x.id||x.endedAge===null||x.endedAge===undefined)continue;
  const played=(x.decisions||[]).some(d=>d.option!==2);
  const kind=x.mode==='festival'?'community':
   x.mode==='competition'?'professional':
   x.mode==='election'?'family':'community';
  const gain={
   agreement:6,celebrated:6,merit:6,'new-leader':5,incumbent:3,
   stalemate:0,quiet:0,draw:0,independent:0,abandoned:0,interrupted:0,
   escalation:-6,divided:-6,controversy:-7,disputed:-8
  }[x.ending]??0;
  impact(s,'public-event',x.id,
   'Hosted '+x.mode+' for '+x.groupA+' and '+x.groupB+' — '+x.ending,
   kind,played?gain:0,x.leaderA);
 }
 // Public intergroup choices influence the player only when the player acted.
 // Autonomous fair results alone never create reputation for an observer.
 for(const x of s.organizationNetwork?.completed||[]){
  if(!x.id||x.endedAge===null||x.endedAge===undefined)continue;
  const participated=(x.decisions||[]).some(d=>d.tag!=='independent');
  const kinds=[x.aId,x.bId].map(id=>
   (s.socialCircles?.groups||[]).find(g=>g.id===id)?.kind);
  const group=kinds.includes('community')?'community':
   kinds.includes('professional')?'professional':'family';
  const delta={coalition:7,negotiated:4,'public-feud':-9,fractured:-5,
   independent:0,unanswered:0,dissolved:0}[x.ending]??0;
  impact(s,'intergroup',x.id,
   x.aName+' and '+x.bName+' — '+x.ending,group,participated?delta:0,x.initialA);
 }
 // Institutions earn social influence only when the player made a meaningful
 // decision. Their autonomous projects do not grant free reputation.
 for(const x of s.socialCircles?.completed||[]){
  if(!x.id||x.endedAge===null||x.endedAge===undefined)continue;
  const participated=(x.decisions||[]).some(d=>d.tag==='collaborate'||d.tag==='challenge');
  const group=x.kind==='community'?'community':
   x.kind==='professional'?'professional':'family';
  const value={alliance:7,negotiated:4,rivalry:-8,unresolved:-3,
   independent:0,dissolved:0,interrupted:0,unanswered:0}[x.ending]??0;
  impact(s,'circle',x.id,
   x.personName+' and '+x.kind+' circle — '+x.ending,
   group,participated?value:0,x.personId);
 }
  for(const a of s.world?.autonomy?.completed||[]){
  if(!a.id||a.endedAge===null||a.endedAge===undefined)continue;
  const h=(a.history||[]).filter(x=>x.success).length;
  const value=a.outcome==='lasting'?Math.min(8,3+h*2):a.outcome==='faded'?-4:0;
  impact(s,'autonomy',a.id,(a.npcName||'A classmate')+' — '+a.title+' finished '+a.outcome,
   'professional',value,a.npcId||null);
 }
}
function signal(s,message,ctx){
 const m=ensure(s);m.news.push({age:s.age,text:clip(message,230)});
 m.news=m.news.slice(-MAX_NEWS);ctx?.add?.(s,message,'people');
}
const legacyEcho=(s,group)=>socialInfluenceState(s).legacy?.echoes?.[group]||0;
const effective=(s,group)=>cap(socialInfluenceState(s).scores[group]+legacyEcho(s,group)+
 (group==='professional'?Math.round((s.stats.reputation-50)*.14):0));
const relevant=(s,group)=>{
 const alumni=(s.world?.autonomy?.alumni||[]);
 const close=(s.people||[]).filter(p=>p.alive&&p.age>=18&&p.world);
 if(group==='professional'){
  if(s.job){
   const p=close.find(p=>p.world.job===s.job.id&&p.world.trust>=40);
   if(p)return {id:'person-'+p.id,name:p.name,role:p.role};
  }
  if(s.business){
   const p=alumni.find(p=>['Founder','Designer','Researcher','Community organizer'].includes(p.profession)&&p.trust>=40);
   if(p)return {id:p.id,name:p.name,role:'former classmate'};
   const q=close.find(p=>p.world.ambition==='Career success'&&p.world.trust>=40);
   if(q)return {id:'person-'+q.id,name:q.name,role:q.role};
  }
  return null;
 }
 if(group==='community'){
  const p=alumni.find(p=>['Community organizer','Teacher'].includes(p.profession)&&p.trust>=40);
  if(p)return {id:p.id,name:p.name,role:'former classmate'};
  const q=close.find(p=>p.world.ambition==='Community service'&&p.world.trust>=40);
  return q?{id:'person-'+q.id,name:q.name,role:q.role}:null;
 }
 const p=close.find(p=>['partner','parent','child','sibling','grandparent','ex'].includes(p.role)&&p.world.trust>=40);
 return p?{id:'person-'+p.id,name:p.name,role:p.role}:null;
};
const choicesFor=(o)=>o.tone==='repair'?[
 {index:0,tag:'account',label:'Acknowledge your past choices',
  detail:'Take responsibility with the person involved',trust:10,rivalry:-7,
  score:7,stat:'kindness',statDelta:3},
 {index:1,tag:'dismiss',label:'Dismiss the criticism',
  detail:'Defend your standing but risk worsening the relationship',trust:-7,rivalry:8,
  score:-5,stat:'confidence',statDelta:2},
 {index:2,tag:'decline',label:'Leave this conversation alone',
  detail:'No direct effect; the NPC continues independently',trust:0,rivalry:0,
  score:0,stat:null,statDelta:0}
]:[
 {index:0,tag:'engage',label:o.group==='professional'?'Build a trusted professional introduction':
  o.group==='community'?'Collaborate on a community initiative':'Strengthen a family connection',
  detail:'Use earned trust and spend time working with someone who actually exists',
  trust:8,rivalry:-4,score:5,stat:o.group==='professional'?'performance':'social',statDelta:3},
 {index:1,tag:'self',label:'Use your standing for personal leverage',
  detail:'Improve confidence, but put hard-earned trust at risk',
  trust:-6,rivalry:7,score:-4,stat:'confidence',statDelta:3},
 {index:2,tag:'decline',label:'Respect their independent plans',
  detail:'No direct change; their life continues without your involvement',
  trust:0,rivalry:0,score:0,stat:null,statDelta:0}
];
function offer(s,ctx){
 const m=ensure(s);
 if(m.active||s.age<18||s.age>101||s.age-m.lastOfferAge<4)return;
 // A social connection and at least one *earned* influence signal are required.
 if(m.signals.length===0)return;
 const options=groups.map(group=>{
  const person=relevant(s,group),score=effective(s,group),earned=m.scores[group];
  if(!person)return null;
  const tone=score<=38?'repair':score>=57&&earned>=55?'invitation':null;
  if(!tone)return null;
  const recent=m.completed.some(x=>x.personId===person.id&&s.age-x.endedAge<6);
  if(recent)return null;
  return {group,person,score,tone};
 }).filter(Boolean);
 if(!options.length)return;
 // Prefer a real area with the strongest departure from average, not RNG.
 options.sort((a,b)=>Math.abs(b.score-50)-Math.abs(a.score-50)||
  groups.indexOf(a.group)-groups.indexOf(b.group));
 const selected=options[0],p=selected.person;
 m.lastOfferAge=s.age;
 m.active={id:'influence-g'+s.generation+'-'+(++m.serial),
  personId:p.id,name:clip(p.name,70),role:clip(p.role,40),
  group:selected.group,tone:selected.tone,
  title:selected.tone==='repair'?'Your reputation needs repairing':
    selected.group==='professional'?'A professional connection opens a door':
    selected.group==='community'?'Community trust becomes an opportunity':
    'A family relationship needs your attention',
  context:selected.tone==='repair'?p.name+' remembers how past conflicts affected the people around you.':
   p.name+' has seen your prior decisions in '+selected.group+' life, and is willing to talk about the next step.',
  startedAge:s.age,dueAge:s.age+3,scoreAtOffer:selected.score,
  priorTrust:person(s,p.id)?.trust??50,priorRivalry:person(s,p.id)?.rivalry??0,
  status:'open',choice:null,ending:null,endedAge:null,finalLine:null};
 signal(s,p.name+' has responded to your long-term '+selected.group+' reputation.',ctx);
}
function resolve(s,o,ending,ctx){
 const m=ensure(s);
 o.status='completed';o.endedAge=s.age;o.ending=ending;
 o.finalLine=clip(o.name+': '+({
  earned:'Your relationship grew through actions grounded in earlier choices.',
  strained:'A self-serving choice made your influence less dependable.',
  repaired:'The earlier damage was acknowledged; restoring trust remains gradual.',
  dismissed:'The damage to your standing grew harder to repair.',
  independent:'Both lives continued without an imposed outcome.',
  unanswered:'The invitation passed without intervention.',
  interrupted:'The person is no longer available to continue the conversation.'
 }[ending]||'Your choices have a lasting effect.'),240);
 m.completed.push({...o});m.completed=m.completed.slice(-MAX_COMPLETED);
 m.active=null;signal(s,o.finalLine,ctx);
}
export function socialInfluenceYear(s,ctx={}){
 if(!s.alive||s.age<18)return;
 const m=ensure(s);
 observe(s);
 if(m.active){
  const p=person(s,m.active.personId);
  if(!p)resolve(s,m.active,'interrupted',ctx);
  else if(s.age>m.active.dueAge)resolve(s,m.active,'unanswered',ctx);
 }
 offer(s,ctx);
}
const blocked=s=>!s.alive||s.pending!==null||s.mini||
 s.world?.network?.conversation||s.world?.storyDirector?.active||
 s.fate?.active?.status==='playing'||s.careerCampaigns?.active||
 s.everydayScenes?.active||s.hobbyCircuit?.active||
 s.workplace?.active?.status==='ready'||s.familyStories?.active?.status==='ready'||
 s.worldPulse?.active?.status==='ready'||(s.justice?.years||0)>0;
export function socialInfluenceCommands(s){
 const a=socialInfluenceState(s).active;
 if(!a||a.status!=='open')return [];
 return choicesFor(a).map(x=>({
  id:'influence:'+a.id+':'+x.index,label:x.label,
  detail:x.detail+' · '+a.name,
  enabled:!blocked(s)&&s.actions>0&&!!person(s,a.personId)
 }));
}
export function socialInfluenceAct(s,id,ctx){
 const parsed=/^influence:(influence-g[0-9]+-[0-9]+):([012])$/.exec(id);
 if(!parsed||!socialInfluenceCommands({...s,actions:s.actions+1}).some(x=>x.id===id&&x.enabled))
  throw Error('This social-influence decision is not available.');
 const m=ensure(s),a=m.active,x=choicesFor(a)[Number(parsed[2])];
 if(!a||a.id!==parsed[1]||!x)throw Error('This invitation is no longer open.');
 const p=person(s,a.personId),beforeTrust=p.trust,beforeRivalry=p.rivalry;
 const beforeStat=x.stat?s.stats[x.stat]:null,prior=m.scores[a.group];
 if(p.kind==='person'){
  p.ref.world.trust=cap((p.ref.world.trust??p.trust)+x.trust);
  p.ref.world.rivalry=cap((p.ref.world.rivalry??p.rivalry)+x.rivalry);
  if(x.trust!==0)p.ref.bond=cap(p.ref.bond+Math.round(x.trust*.45));
  if(x.trust||x.rivalry){
   p.ref.memories??=[];
   p.ref.memories.push({age:s.age,text:'Reputation discussion: '+x.label});
   p.ref.memories=p.ref.memories.slice(-15);
  }
 }else{
  p.ref.trust=cap(p.ref.trust+x.trust);p.ref.rivalry=cap(p.ref.rivalry+x.rivalry);
  if(x.trust||x.rivalry){
   p.ref.history??=[];p.ref.history.push({age:s.age,kind:'reputation',event:x.label});
   p.ref.history=p.ref.history.slice(-18);
  }
 }
 if(x.stat)ctx.change(s,x.stat,x.statDelta);
 impact(s,'influence',a.id,'Chose '+x.label+' with '+a.name,a.group,x.score,a.personId);
 const current=person(s,a.personId);
 a.choice={age:s.age,tag:x.tag,label:x.label,
  trustDelta:current.trust-beforeTrust,rivalryDelta:current.rivalry-beforeRivalry,
  scoreDelta:m.scores[a.group]-prior,stat:x.stat,
  statDelta:x.stat?s.stats[x.stat]-beforeStat:0};
 resolve(s,a,x.tag==='engage'?'earned':x.tag==='self'?'strained':
  x.tag==='account'?'repaired':x.tag==='dismiss'?'dismissed':'independent',ctx);
 return a.choice;
}
export function socialInfluenceView(s){
 const m=socialInfluenceState(s);
 const standing=Object.fromEntries(groups.map(k=>[k,{
  earned:m.scores[k],inherited:legacyEcho(s,k),effective:effective(s,k)
 }]));
 return {age:s.age,standing,active:m.active?{
  ...m.active,contactAvailable:!!person(s,m.active.personId),
  currentTrust:person(s,m.active.personId)?.trust??null,
  currentRivalry:person(s,m.active.personId)?.rivalry??null
 }:null,
  recent:m.signals.slice(-12).reverse(),
  completed:m.completed.slice(-8).reverse().map(a=>({
   id:a.id,title:a.title,name:a.name,group:a.group,
   ending:a.ending,endedAge:a.endedAge,finalLine:a.finalLine,
   choice:a.choice
  })),
  news:m.news.slice(-6).reverse(),ancestors:m.ancestors.slice().reverse(),
  legacy:m.legacy,total:m.completed.length};
}
export function socialInfluenceInheritance(next,old){
 const source=socialInfluenceState(old),n=empty();
 const echoes=Object.fromEntries(groups.map(k=>[
  k,Math.max(-6,Math.min(6,Math.round((source.scores[k]-50)*.16)))
 ]));
 const largest=groups.slice().sort((a,b)=>Math.abs(echoes[b])-Math.abs(echoes[a]))[0];
 n.legacy={name:clip(old.name,32),generation:old.generation,echoes};
 n.ancestors=[...source.ancestors,{
  generation:old.generation,name:clip(old.name,32),
  note:clip('A remembered '+largest+' reputation '+(echoes[largest]>0?'opened doors':
   echoes[largest]<0?'created expectations to repair':'left room to shape a new story')+
   '. Earned family '+source.scores.family+', professional '+source.scores.professional+
   ', community '+source.scores.community+'.',240)
 }].slice(-MAX_ANCESTRY);
 next.socialInfluence=n;
}
export function validateSocialInfluence(m){
 if(m===undefined)return true;
 const scores=x=>!!x&&groups.every(g=>num(x[g]));
 const prior=x=>!!x&&groups.every(g=>Number.isInteger(x[g])&&x[g]>=-6&&x[g]<=6);
 const choice=x=>x===null||(x&&ageOK(x.age)&&
  ['engage','self','account','dismiss','decline'].includes(x.tag)&&str(x.label,100)&&
  ['trustDelta','rivalryDelta','scoreDelta','statDelta'].every(k=>finite(x[k])&&Math.abs(x[k])<=100)&&
  (x.stat===null||['performance','social','confidence','kindness'].includes(x.stat)));
 const record=x=>x&&str(x.id,90)&&str(x.personId,100)&&str(x.name,70)&&str(x.role,40)&&
  groups.includes(x.group)&&['repair','invitation'].includes(x.tone)&&str(x.title,130)&&
  str(x.context,245)&&ageOK(x.startedAge)&&ageOK(x.dueAge)&&num(x.scoreAtOffer)&&
  num(x.priorTrust)&&num(x.priorRivalry)&&['open','completed'].includes(x.status)&&
  choice(x.choice)&&
  (x.ending===null||['earned','strained','repaired','dismissed','independent','unanswered','interrupted'].includes(x.ending))&&
  (x.endedAge===null||ageOK(x.endedAge))&&
  (x.finalLine===null||str(x.finalLine,240))&&
  (x.status==='open'?x.choice===null&&x.ending===null&&x.endedAge===null:
   x.ending!==null&&x.endedAge!==null&&str(x.finalLine,240));
 return !!m&&m.version===1&&Number.isInteger(m.serial)&&m.serial>=0&&
  scores(m.scores)&&Array.isArray(m.seen)&&m.seen.length<=MAX_SEEN&&
  m.seen.every(x=>str(x,150))&&new Set(m.seen).size===m.seen.length&&
  Array.isArray(m.signals)&&m.signals.length<=MAX_SIGNALS&&
  m.signals.every(x=>str(x.id,150)&&ageOK(x.age)&&groups.includes(x.group)&&
   finite(x.delta)&&Math.abs(x.delta)<=100&&str(x.label,180)&&
   (x.personId===null||str(x.personId,100)))&&
  (m.active===null||record(m.active)&&m.active.status==='open')&&
  Array.isArray(m.completed)&&m.completed.length<=MAX_COMPLETED&&
  m.completed.every(x=>record(x)&&x.status==='completed')&&
  new Set([...m.completed,...(m.active?[m.active]:[])].map(x=>x.id)).size===
   m.completed.length+(m.active?1:0)&&
  Array.isArray(m.news)&&m.news.length<=MAX_NEWS&&
  m.news.every(x=>ageOK(x.age)&&str(x.text,230))&&
  Array.isArray(m.ancestors)&&m.ancestors.length<=MAX_ANCESTRY&&
  m.ancestors.every(x=>Number.isInteger(x.generation)&&x.generation>0&&
   str(x.name,32)&&str(x.note,240))&&
  Number.isInteger(m.lastOfferAge)&&m.lastOfferAge>=-100&&ageOK(Math.max(0,m.lastOfferAge))&&
  m.legacy&&typeof m.legacy.name==='string'&&m.legacy.name.length<=32&&
  Number.isInteger(m.legacy.generation)&&m.legacy.generation>=0&&
  prior(m.legacy.echoes);
}
