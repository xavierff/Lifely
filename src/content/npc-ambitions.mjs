// Lifely 1.18.0 — NPC ambitions: autonomous goals with changing priorities.
// Uses actual NPC profiles and alumni records, not fabricated careers, assets or partners.
// The deterministic year loop never consumes the player RNG.
const cap=n=>Math.max(0,Math.min(100,Math.round(n)));
const clip=(v,n=240)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,n);
const ageOK=x=>Number.isInteger(x)&&x>=0&&x<=110;
const int=x=>Number.isInteger(x)&&x>=0;
const number=x=>typeof x==='number'&&Number.isFinite(x);
const bounded=(x,hi=100)=>number(x)&&x>=0&&x<=hi;
const hash=s=>{let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;}return h>>>0;};
const pick=(s,key,items)=>items[hash((s.lifeId||s.name)+':'+key)%items.length];
const MAX_ACTIVE=10,MAX_COMPLETED=32,MAX_NEWS=30,MAX_ANCESTRY=10;
export const npcGoalTypes=[
 {id:'career',title:'Build a lasting career',text:'Professional achievement matters to this person, but setbacks and changing obligations may alter the route.'},
 {id:'security',title:'Find financial breathing room',text:'They are trying to protect their future using their own limited resources, not money from the player.'},
 {id:'connection',title:'Nurture meaningful relationships',text:'They are prioritizing the people already in their life over status or competition.'},
 {id:'creative',title:'Finish something original',text:'They want to create work of their own and be remembered for completing it.'},
 {id:'service',title:'Make a difference locally',text:'They are trying to contribute to their community, even when there is little recognition.'},
 {id:'adventure',title:'Choose a different path',text:'They are wondering whether familiar surroundings still suit the life they want.'},
 {id:'repair',title:'Repair a difficult relationship',text:'The rivalry and uncertainty around them have made rebuilding trust a personal goal.'}
];
const definition=id=>npcGoalTypes.find(x=>x.id===id)||npcGoalTypes[0];
const blank=()=>({version:1,serial:0,active:[],completed:[],news:[],ancestors:[]});
export const npcAmbitionState=s=>s.npcAmbitions||blank();
const ensure=s=>s.npcAmbitions??=blank();
const familyId=p=>'person-'+p.id;
const family=s=>(s.people||[]).filter(p=>p.alive&&p.age>=18&&p.world&&
 ['parent','sibling','child','friend','partner','grandparent','ex'].includes(p.role))
 .slice(0,8).map(p=>({id:familyId(p),name:p.name,kind:'family',role:p.role,source:p,
  trust:cap(p.world.trust??p.bond),rivalry:cap(p.world.rivalry??0),personality:p.world.personality||'Supportive'}));
const alumni=s=>(s.world?.autonomy?.alumni||[]).slice(0,8).map(p=>({
 id:p.id,name:p.name,kind:'alumni',role:'alumnus',source:p,
 trust:cap(p.trust??50),rivalry:cap(p.rivalry??10),personality:p.personality||'Driven'
}));
function npc(s,id){
 const all=[...family(s),...alumni(s)];
 return all.find(p=>p.id===id)||null;
}
const trackFor=(s,p)=>{
 const raw=p.source,ambition=p.kind==='family'?raw.world?.ambition:raw.ambition;
 const profession=p.kind==='alumni'?raw.profession:'';
 if(p.rivalry>=72&&p.trust<38)return 'repair';
 if(p.kind==='family'&&(raw.world?.debt||0)>40000&&
  (raw.world?.cash||0)<(raw.world?.debt||0))return 'security';
 if(p.kind==='family'&&raw.age>=65)return p.rivalry>=40?'repair':'connection';
 const matching={
  'Financial security':'security','Career success':'career','Family life':'connection',
  'Creative expression':'creative','Community service':'service',Adventure:'adventure'
 };
 if(p.kind==='family')return matching[ambition]||'connection';
 const careers={Designer:'creative',Teacher:'service',Founder:'career',Athlete:'career',
  'Community organizer':'service',Researcher:'career'};
 return matching[ambition]||careers[profession]||pick(s,p.id+':goal',['career','creative','connection','service','adventure']);
};
const obstacles=p=>{
 const raw=p.source,w=raw.world;
 const debt=p.kind==='family'?w?.debt||0:0;
 return cap((p.rivalry||0)*.24+(100-p.trust)*.12+(debt>60000?25:debt>30000?14:0)+
  (p.kind==='family'&&w?.job===null&&raw.age<65?14:0));
};
function addNews(s,message,ctx){
 const m=ensure(s);
 m.news.push({age:s.age,text:clip(message,230)});m.news=m.news.slice(-MAX_NEWS);
 ctx?.add?.(s,message,'people');
}
const openCount=s=>npcAmbitionState(s).active.filter(x=>x.status==='open'||x.status==='ready').length;
function launch(s,p,ctx){
 const m=ensure(s),track=trackFor(s,p),type=definition(track);
 const record={id:'npc-goal-g'+s.generation+'-'+(++m.serial),personId:p.id,name:clip(p.name,70),
  kind:p.kind,role:p.role,track,goal:type.title,startedAge:s.age,dueAge:s.age+3,
  stage:0,status:'open',progress:cap(12+Math.round((p.trust-50)*.14)),
  obstacles:obstacles(p),stance:'none',decisions:[],pivots:[],
  startDebt:p.kind==='family'?Math.max(0,p.source.world?.debt||0):0,
  lastAge:s.age,lastProgressAge:s.age,lastTrust:p.trust,ending:null,endedAge:null,finalLine:null};
 m.active.push(record);
 addNews(s,p.name+' began pursuing a long-term goal: '+type.title+'.',ctx);
}
const contactUpdate=(p,trust,rivalry,why,age)=>{
 const raw=p.source;
 if(p.kind==='family'){
  raw.world.trust=cap((raw.world.trust??p.trust)+trust);
  raw.world.rivalry=cap((raw.world.rivalry??p.rivalry)+rivalry);
  raw.bond=cap((raw.bond??50)+Math.round(trust*.4));
  raw.memories??=[];
  raw.memories.push({age,text:clip(why,180)});raw.memories=raw.memories.slice(-15);
 }else{
  raw.trust=cap((raw.trust??50)+trust);
  raw.rivalry=cap((raw.rivalry??10)+rivalry);
  raw.history??=[];
  raw.history.push({age,kind:'npc-ambition',event:clip(why,180)});raw.history=raw.history.slice(-18);
 }
};
function maybePivot(s,p,a,ctx){
 if(s.age-a.startedAge<2||a.pivots.length>=2)return;
 if(a.pivots.some(pivot=>s.age-pivot.age<2))return;
 const newTrack=trackFor(s,p);
 if(newTrack===a.track)return;
 // An actual job loss, large debt or strained relationship changes what matters.
 const previous=a.track;
 a.track=newTrack;a.goal=definition(newTrack).title;
 a.obstacles=obstacles(p);
 a.progress=cap(a.progress*.68);
 a.pivots.push({age:s.age,from:previous,to:newTrack,reason:newTrack==='security'?'financial pressure':
  newTrack==='repair'?'damaged trust':'changing life circumstances'});
 if(p.kind==='family'&&newTrack==='security'){
  // Align an existing financial profile's underlying preference as well.
  p.source.world.ambition='Financial security';
 }
 addNews(s,p.name+' redirected a long-term ambition from '+definition(previous).title.toLowerCase()+
  ' to '+a.goal.toLowerCase()+'.',ctx);
}
function milestone(s,p,a,ctx,achieved){
 const raw=p.source,w=raw.world,track=a.track;
 if(!achieved)return null;
 if(track==='career'){
  if(p.kind==='family'&&w.job!==null&&raw.age<65&&w.level<5){
   w.level++;return 'Earned a new career level in their existing profession.';
  }
  if(p.kind==='alumni'&&(raw.careerLevel||0)<4){
   raw.careerLevel=Math.min(4,(raw.careerLevel||0)+1);
   return 'Advanced in their existing profession.';
  }
  return 'Completed a demanding period of professional growth.';
 }
 if(track==='security'){
  if(p.kind==='family'){
   const paid=Math.min(Math.max(0,w.cash||0),Math.max(0,w.debt||0));
   const transfer=Math.round(paid*.2);
   if(transfer>0){w.cash-=transfer;w.debt=Math.max(0,w.debt-transfer);
    return 'Paid '+transfer+' of their own debt from their existing savings.';}
   return 'Reassessed financial priorities without inventing additional income.';
  }
  return 'Made plans for a more stable professional future.';
 }
 if(track==='connection'){
  if(p.kind==='family'){raw.bond=cap((raw.bond||50)+3);w.joy=cap((w.joy??70)+4);}
  else{raw.trust=cap((raw.trust??50)+4);}
  return 'Invested care in relationships they already had.';
 }
 if(track==='creative'){
  if(p.kind==='alumni')raw.personalProjects=Math.min(20,(raw.personalProjects||0)+1);
  else w.joy=cap((w.joy??70)+4);
  return 'Finished a personal creative project of their own.';
 }
 if(track==='service'){
  if(p.kind==='alumni'){raw.communityProjects=Math.min(20,(raw.communityProjects||0)+1);raw.trust=cap((raw.trust||50)+2);}
  else{w.joy=cap((w.joy??70)+3);w.trust=cap((w.trust??50)+2);}
  return 'Contributed to their existing community in a tangible way.';
 }
 if(track==='adventure'){
  if(p.kind==='alumni'){
   raw.location=raw.location==='hometown'?'another city':'hometown';
   return 'Changed their established place of residence to '+raw.location+'.';
  }
  w.joy=cap((w.joy??70)+3);
  return 'Pursued new experiences without relocating the entire household.';
 }
 if(track==='repair'){
  contactUpdate(p,5,-12,'Made meaningful progress repairing trust.',s.age);
  return 'Reduced a real rivalry and cautiously rebuilt trust.';
 }
 return null;
}
function resolve(s,p,a,ctx){
 const m=ensure(s),real=!!p;
 const achieved=real&&a.progress>=65&&a.obstacles<65;
 const ending=!real?'interrupted':achieved?'achieved':a.pivots.length?'redirected':'complicated';
 const effect=real?milestone(s,p,a,ctx,achieved):null;
 a.status='completed';a.endedAge=s.age;a.ending=ending;
 a.finalLine=!real?a.name+' is no longer present to pursue this plan.':
  achieved?a.name+' completed '+a.goal.toLowerCase()+'. '+effect:
  a.name+' pursued '+a.goal.toLowerCase()+' but faced unresolved pressure. Their life continues.';
 m.completed.push({...a});m.completed=m.completed.slice(-MAX_COMPLETED);
 m.active=m.active.filter(x=>x.id!==a.id);
 if(real){
  const raw=p.source;
  const note=a.goal+': '+ending+'. '+(effect||'');
  if(raw.world?.news){
   raw.world.news.push({age:s.age,text:clip(note,200)});raw.world.news=raw.world.news.slice(-10);
  }else if(Array.isArray(raw.history)){
   raw.history.push({age:s.age,kind:'ambition',event:clip(note,200)});raw.history=raw.history.slice(-18);
  }
 }
 addNews(s,a.name+': '+a.goal+' ended '+ending+'. '+(effect||''),ctx);
}
const initialOptions=[
 {index:0,tag:'encourage',title:'Offer practical encouragement',detail:'Help them plan without taking control',trust:7,rivalry:-3,progress:14,stat:'kindness',delta:3},
 {index:1,tag:'challenge',title:'Challenge the plan respectfully',detail:'Push them to reconsider the risks; trust may suffer',trust:-3,rivalry:6,progress:5,stat:'knowledge',delta:3},
 {index:2,tag:'independence',title:'Let them choose their own path',detail:'Respect independence; they continue on their own',trust:0,rivalry:0,progress:0,stat:null,delta:0}
];
const futureOptions=[
 {index:0,tag:'stand-by',title:'Stand by them through the setback',detail:'Give them support even though the future is uncertain',trust:8,rivalry:-4,progress:13,stat:'social',delta:3},
 {index:1,tag:'redirection',title:'Suggest changing course',detail:'Adjust the goal after seeing what actually happened',trust:0,rivalry:-1,progress:8,stat:'knowledge',delta:3},
 {index:2,tag:'independence',title:'Respect the decision they made',detail:'Their ambition remains theirs, with no forced reward',trust:0,rivalry:0,progress:0,stat:null,delta:0}
];
export function npcAmbitionCommands(s){
 if(!s.alive||s.pending!==null||s.mini||s.world?.network?.conversation||
  s.world?.storyDirector?.active||s.fate?.active?.status==='playing'||
  s.careerCampaigns?.active||s.everydayScenes?.active||s.hobbyCircuit?.active||
  s.workplace?.active?.status==='ready'||s.familyStories?.active?.status==='ready'||
  s.worldPulse?.active?.status==='ready'||(s.justice?.years||0)>0)return [];
 return npcAmbitionState(s).active.flatMap(a=>{
  if(a.status!=='open'&&a.status!=='ready')return [];
  const opts=a.status==='open'?initialOptions:futureOptions;
  return opts.map(o=>({id:'npcgoal:'+a.id+':'+o.index,label:o.title,
   detail:o.detail+' · '+a.name,enabled:(s.actions||0)>0&&!!npc(s,a.personId)}));
 });
}
export function npcAmbitionAct(s,id,ctx){
 const m=/^npcgoal:(npc-goal-g[0-9]+-[0-9]+):([012])$/.exec(id);
 if(!m||!npcAmbitionCommands({...s,actions:s.actions+1}).some(c=>c.id===id&&c.enabled))
  throw Error('This personal goal interaction is not available.');
 const a=ensure(s).active.find(x=>x.id===m[1]),p=a&&npc(s,a.personId);
 if(!a||!p)throw Error('This person is no longer available.');
 const option=(a.status==='open'?initialOptions:futureOptions)[Number(m[2])];
 const raw=p.source,trustBefore=p.trust,rivalBefore=p.rivalry;
 const statBefore=option.stat?s.stats[option.stat]:null;
 const beforeProgress=a.progress;
 contactUpdate(p,option.trust,option.rivalry,'Discussed '+a.goal.toLowerCase()+': '+option.title,s.age);
 if(option.stat)ctx.change(s,option.stat,option.delta);
 a.progress=cap(a.progress+option.progress);
 a.stance=option.tag;
 const record={age:s.age,index:option.index,tag:option.tag,label:option.title,
  trustChange:npc(s,a.personId).trust-trustBefore,
  rivalryChange:npc(s,a.personId).rivalry-rivalBefore,
  progressChange:a.progress-beforeProgress,
  stat:option.stat,statChange:option.stat?s.stats[option.stat]-statBefore:0};
 a.decisions.push(record);
 if(a.status==='open'){a.stage=1;a.status='waiting';a.dueAge=a.startedAge+3;}
 else {a.stage=2;a.status='growing';a.dueAge=a.startedAge+5;}
 addNews(s,'You discussed '+a.goal.toLowerCase()+' with '+a.name+
  '. Their trust changed by '+record.trustChange+'; their plan continued.',ctx);
 return record;
}
export function npcAmbitionYear(s,ctx={}){
 if(!s.alive||s.age<18)return;
 const m=ensure(s);
 // Existing family and alumni must evolve first, then these ambitions respond.
 for(const a of [...m.active]){
  const p=npc(s,a.personId);
  if(!p){resolve(s,null,a,ctx);continue;}
  if(s.age<=a.lastProgressAge)continue;
  maybePivot(s,p,a,ctx);
  const growth=6+(hash(a.id+':'+s.age)%9)+
   (p.kind==='family'&&p.source.world.job!==null&&a.track==='career'?2:0)+
   (p.personality==='Driven'?2:0)-
   Math.floor(obstacles(p)/18);
  a.obstacles=obstacles(p);
  a.progress=cap(a.progress+Math.max(1,growth));
  a.lastAge=s.age;a.lastProgressAge=s.age;a.lastTrust=p.trust;
  if(a.status==='open'&&s.age>=a.startedAge+2){
   // The first optional conversation was missed, but the person carries on.
   a.stage=1;a.status='waiting';a.dueAge=a.startedAge+3;
  }
  if(a.status==='waiting'&&s.age>=a.dueAge){
   a.status='ready';
   addNews(s,a.name+' has made more progress toward '+a.goal.toLowerCase()+
    '. Their priorities may have changed while you were apart.',ctx);
  }
  if(a.status==='ready'&&s.age>=a.dueAge+2){
   a.stage=2;a.status='growing';a.dueAge=a.startedAge+5;
  }
  if(s.age>=a.startedAge+5||a.progress>=100&&s.age>=a.startedAge+4)
   resolve(s,p,a,ctx);
 }
 if(s.age>100)return;
 const existing=new Set(m.active.map(x=>x.personId));
 for(const p of [...family(s),...alumni(s)]){
  if(m.active.length>=MAX_ACTIVE)break;
  if(existing.has(p.id))continue;
  const previous=m.completed.filter(x=>x.personId===p.id).at(-1);
  if(previous&&s.age-previous.endedAge<4)continue;
  // Introduce at most two new active lives each year, so the social world
  // grows rather than dumping ten new prompts on the player at once.
  if(m.active.filter(x=>x.startedAge===s.age).length>=2)break;
  launch(s,p,ctx);existing.add(p.id);
 }
}
export function npcAmbitionView(s){
 const m=npcAmbitionState(s);
 return {active:m.active.map(a=>{
  const p=npc(s,a.personId),w=p?.kind==='family'?p.source.world:null;
  return {...a,currentTrust:p?.trust??null,currentRivalry:p?.rivalry??null,
   profession:p?.kind==='alumni'?p.source.profession:(p?.source.role||a.role),
   financialPressure:w?Math.max(0,w.debt||0):null,
   canRespond:['open','ready'].includes(a.status)};
 }).sort((a,b)=>({ready:0,open:1,waiting:2,growing:3}[a.status]??4)-
  ({ready:0,open:1,waiting:2,growing:3}[b.status]??4)||a.startedAge-b.startedAge),
  completed:m.completed.slice(-9).reverse().map(x=>({
   id:x.id,personId:x.personId,name:x.name,goal:x.goal,track:x.track,
   startedAge:x.startedAge,endedAge:x.endedAge,ending:x.ending,
   finalLine:x.finalLine,decisions:x.decisions.length,pivots:x.pivots.slice()
  })),
  recent:m.news.slice(-8).reverse(),ancestors:m.ancestors.slice().reverse(),
  total:m.completed.length};
}
export function npcAmbitionInheritance(next,old){
 const source=npcAmbitionState(old),m=blank();
 const completed=source.completed.filter(x=>['achieved','redirected'].includes(x.ending)).slice(-3);
 const summary=completed.length?completed.map(x=>x.name+': '+x.goal+' ('+x.ending+')').join('; '):
  'The people around this lifetime pursued their own goals.';
 m.ancestors=[...source.ancestors,
  {generation:old.generation,name:clip(old.name,32),note:clip(summary,240)}
 ].slice(-MAX_ANCESTRY);
 next.npcAmbitions=m;
}
export function validateNpcAmbitions(m){
 if(m===undefined)return true;
 const str=(v,n)=>typeof v==='string'&&v.length>0&&v.length<=n;
 const opt=(v,n)=>v===null||str(v,n);
 const inTracks=t=>npcGoalTypes.some(x=>x.id===t);
 const optStat=s=>s===null||['kindness','knowledge','social'].includes(s);
 const statuses=['open','waiting','ready','growing','completed'];
 const outcomes=['achieved','redirected','complicated','interrupted'];
 const decision=d=>d&&ageOK(d.age)&&[0,1,2].includes(d.index)&&
  ['encourage','challenge','independence','stand-by','redirection'].includes(d.tag)&&
  str(d.label,100)&&number(d.trustChange)&&number(d.rivalryChange)&&
  number(d.progressChange)&&optStat(d.stat)&&number(d.statChange);
 const pivot=p=>p&&ageOK(p.age)&&inTracks(p.from)&&inTracks(p.to)&&
  str(p.reason,80);
 const valid=a=>a&&str(a.id,80)&&str(a.personId,100)&&str(a.name,70)&&
  ['family','alumni'].includes(a.kind)&&str(a.role,40)&&inTracks(a.track)&&
  str(a.goal,120)&&ageOK(a.startedAge)&&ageOK(a.dueAge)&&
  [0,1,2].includes(a.stage)&&statuses.includes(a.status)&&
  bounded(a.progress)&&bounded(a.obstacles)&&
  ['none','encourage','challenge','independence','stand-by','redirection'].includes(a.stance)&&
  Array.isArray(a.decisions)&&a.decisions.length<=2&&a.decisions.every(decision)&&
  Array.isArray(a.pivots)&&a.pivots.length<=2&&a.pivots.every(pivot)&&
  number(a.startDebt)&&a.startDebt>=0&&ageOK(a.lastAge)&&ageOK(a.lastProgressAge)&&
  bounded(a.lastTrust)&&
  (a.ending===null||outcomes.includes(a.ending))&&
  (a.endedAge===null||ageOK(a.endedAge))&&
  opt(a.finalLine,240)&&
  (a.status==='open'?a.stage===0&&a.decisions.length===0:
   ['waiting','ready'].includes(a.status)?a.stage===1:
   a.status==='growing'?a.stage===2:
   a.ending!==null&&a.endedAge!==null);
 return !!m&&m.version===1&&int(m.serial)&&
  Array.isArray(m.active)&&m.active.length<=MAX_ACTIVE&&m.active.every(x=>valid(x)&&x.status!=='completed')&&
  Array.isArray(m.completed)&&m.completed.length<=MAX_COMPLETED&&m.completed.every(x=>valid(x)&&x.status==='completed')&&
  new Set([...m.active,...m.completed].map(x=>x.id)).size===m.active.length+m.completed.length&&
  new Set(m.active.map(x=>x.personId)).size===m.active.length&&
  Array.isArray(m.news)&&m.news.length<=MAX_NEWS&&
  m.news.every(x=>ageOK(x.age)&&str(x.text,230))&&
  Array.isArray(m.ancestors)&&m.ancestors.length<=MAX_ANCESTRY&&
  m.ancestors.every(x=>int(x.generation)&&x.generation>0&&str(x.name,32)&&str(x.note,240));
}
