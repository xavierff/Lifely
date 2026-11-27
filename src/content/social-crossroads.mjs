// Lifely 1.17.0 — social crossroads. Observes actual autonomous NPC links
// and offers optional player responses. No new random rolls, money, or blocking scenes.
const MAX_OPEN=3,MAX_HISTORY=24,MAX_NEWS=24,MAX_SEEN=48,MAX_ANCESTORS=8;
const clamp=x=>Math.max(0,Math.min(100,Math.round(x)));
const text=(value,n=210)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,n);
const ageOK=x=>Number.isInteger(x)&&x>=0&&x<=110;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const state=()=>({version:1,serial:0,open:[],completed:[],news:[],seen:[],ancestors:[]});
export const crossroadsState=s=>s.crossroads||state();
const ensure=s=>s.crossroads??=state();
const roles={
 partners:{kind:'alliance',title:'A partnership in the spotlight',
  prompt:(a,b)=>a+' and '+b+' have become partners. They may ask you to help protect their cooperation as their priorities shift.'},
 allies:{kind:'alliance',title:'An alliance changes the circle',
  prompt:(a,b)=>a+' and '+b+' have begun trusting each other. Their alliance could change the wider social circle.'},
 friends:{kind:'friendship',title:'A friendship with consequences',
  prompt:(a,b)=>a+' and '+b+' have grown closer. They are deciding what to do about competing commitments.'},
 rivals:{kind:'rivalry',title:'Two people, one rivalry',
  prompt:(a,b)=>a+' and '+b+' are at odds. You could mediate, choose a side or let them settle it themselves.'},
 estranged:{kind:'fallout',title:'The relationship that grew cold',
  prompt:(a,b)=>a+' and '+b+' are drifting apart. A conversation could repair some trust, but you cannot decide for either of them.'},
 betrayed:{kind:'betrayal',title:'A breach of trust',
  prompt:(a,b)=>a+' and '+b+' are dealing with a breach of trust. Their next steps could reshape years of friendship.'}
};
const initialChoices=[
 {index:0,title:'Hear both sides before taking a stand',note:'Try to repair trust without choosing a winner',tag:'mediate',trust:10,rivalry:-9,trustNpc:3,rivalryNpc:-2,stat:'kindness',delta:3},
 {index:1,title:'Back the person you know best',note:'Strengthen one connection while adding pressure to the other',tag:'side',trust:-5,rivalry:11,trustNpc:7,rivalryNpc:4,stat:'confidence',delta:3},
 {index:2,title:'Respect their independence',note:'Avoid interfering; the relationship remains theirs to decide',tag:'observe',trust:0,rivalry:0,trustNpc:0,rivalryNpc:0,stat:null,delta:0}
];
const laterChoices=[
 {index:0,title:'Help them rebuild a realistic agreement',note:'An attempt at repair can reopen a closed door',tag:'repair',trust:12,rivalry:-10,trustNpc:4,rivalryNpc:-3,stat:'social',delta:3},
 {index:1,title:'Support their separate ambitions',note:'Protect independence, even if distance persists',tag:'independence',trust:-3,rivalry:-4,trustNpc:2,rivalryNpc:0,stat:'confidence',delta:2},
 {index:2,title:'Let their decision stand',note:'Keep the ending honest; you cannot force a reconciliation',tag:'release',trust:0,rivalry:0,trustNpc:0,rivalryNpc:0,stat:null,delta:0}
];
function nameFor(s,id){
 if(String(id).startsWith('person-'))return (s.people||[]).find(p=>'person-'+p.id===id&&p.alive)||null;
 const a=s.world?.autonomy?.alumni||[],c=s.world?.characters||{};
 return [...a,...(c.athletes||[]),...(c.politicians||[]),...(c.agents||[])].find(p=>p.id===id)||null;
}
function linkFor(s,source,key){
 return source==='alumni'?(s.world?.autonomy?.links||[]).find(x=>x.id===key):
  (s.world?.network?.edges||[]).find(x=>x.key===key);
}
function persons(s,link){
 const a=nameFor(s,link.a),b=nameFor(s,link.b);
 return a?.name&&b?.name&&link.a!==link.b?{a,b}:null;
}
const statusAlumni=l=>{
 if(l.trust>=74&&l.years>=2)return 'partners';
 if(l.trust>=52)return 'friends';
 if(l.trust<=26)return 'estranged';
 if(l.rivalry>=57)return 'rivals';
 return 'strangers';
};
const statusNetwork=l=>{
 if((l.betrayals||0)>0&&l.trust<42)return 'betrayed';
 if(l.trust>=75&&l.loyalty>=65)return 'allies';
 if(l.trust>=57)return 'friends';
 if(l.trust<=24)return 'estranged';
 if(l.trust<=40)return 'rivals';
 return 'acquaintances';
};
const asNum=x=>Number.isFinite(x)?clamp(x):50;
function candidates(s){
 const autonomy=s.world?.autonomy||{},network=s.world?.network||{};
 const result=[];
 for(const link of (autonomy.links||[]).slice(-64)){
  if(!roles[link.status]||!persons(s,link))continue;
  const changed=(link.history||[]).some(h=>h.age===s.age&&h.status===link.status);
  if(!changed&&!(s.age%4===0&&link.years>=2&&link.lastEvolvedAge===s.age))continue;
  result.push({source:'alumni',link,status:link.status,priority:changed?3:1});
 }
 for(const link of (network.edges||[]).slice(-64)){
  if(!roles[link.status]||!persons(s,link))continue;
  if((autonomy.links||[]).some(x=>x.id===link.key))continue;
  const news=(network.news||[]).some(n=>n.age===s.age&&n.kind===link.status&&
   Array.isArray(n.between)&&n.between.includes(link.a)&&n.between.includes(link.b));
  if(!news&&!(s.age%4===0&&link.years>=2))continue;
  result.push({source:'network',link,status:link.status,priority:news?3:1});
 }
 const boost={betrayed:6,rivals:5,estranged:4,partners:3,allies:3,friends:2};
 return result.sort((a,b)=>b.priority-a.priority||(boost[b.status]||0)-(boost[a.status]||0)||
  String(a.link.id||a.link.key).localeCompare(String(b.link.id||b.link.key)));
}
function announcement(s,message,ctx){
 const x=ensure(s);x.news.push({age:s.age,text:text(message,230)});x.news=x.news.slice(-MAX_NEWS);
 ctx?.add?.(s,message,'people');
}
function finish(s,inv,ending,explanation,ctx){
 const x=ensure(s);
 inv.status='completed';inv.ending=ending;inv.endedAge=s.age;inv.finalLine=text(explanation,240);
 x.open=x.open.filter(y=>y.id!==inv.id);
 x.completed.push(inv);x.completed=x.completed.slice(-MAX_HISTORY);
 announcement(s,inv.aName+' and '+inv.bName+': '+explanation,ctx);
}
function offer(s,{source,link,status},ctx){
 const data=persons(s,link);if(!data)return;
 const x=ensure(s),key=link.id||link.key,description=roles[status];
 const inv={id:'cross-'+s.generation+'-'+s.age+'-'+(++x.serial),source,sourceKey:key,
  aId:link.a,bId:link.b,aName:text(data.a.name,70),bName:text(data.b.name,70),
  kind:description.kind,sourceStatus:status,title:description.title,
  introduction:description.prompt(data.a.name,data.b.name),startAge:s.age,dueAge:s.age,
  status:'open',steps:[],ending:null,endedAge:null,finalLine:null,
  firstTrust:asNum(link.trust),lastTrust:asNum(link.trust),firstRivalry:asNum(link.rivalry)};
 x.open.push(inv);
 x.seen.push({source,key,status,age:s.age});x.seen=x.seen.slice(-MAX_SEEN);
 announcement(s,data.a.name+' and '+data.b.name+' have a new crossroads: '+description.title+'.',ctx);
}
function eligibleSource(s,c){
 const key=c.link.id||c.link.key,x=crossroadsState(s);
 return !x.open.some(y=>y.source===c.source&&y.sourceKey===key)&&
  !x.seen.some(y=>y.source===c.source&&y.key===key&&s.age-y.age<5);
}
function touchNPC(s,id,dTrust,dRivalry,why){
 const p=nameFor(s,id);if(!p)return;
 if(p.world){
  if(Number.isFinite(p.world.trust))p.world.trust=clamp(p.world.trust+dTrust);
  if(Number.isFinite(p.world.rivalry))p.world.rivalry=clamp(p.world.rivalry+dRivalry);
 }else{
  if(Number.isFinite(p.trust))p.trust=clamp(p.trust+dTrust);
  if(Number.isFinite(p.rivalry))p.rivalry=clamp(p.rivalry+dRivalry);
 }
 if(Array.isArray(p.history)){
  p.history.push({age:s.age,kind:'crossroads',event:why});p.history=p.history.slice(-18);
 }
 if(Array.isArray(p.memories)){
  p.memories.push({age:s.age,text:why});p.memories=p.memories.slice(-15);
 }
}
function changeLink(s,inv,choice,ctx){
 const link=linkFor(s,inv.source,inv.sourceKey);
 if(!link||!persons(s,link))return null;
 const previous={trust:asNum(link.trust),rivalry:asNum(link.rivalry),status:link.status};
 link.trust=clamp(previous.trust+choice.trust);
 link.rivalry=clamp(previous.rivalry+choice.rivalry);
 if(inv.source==='alumni'){
  link.status=statusAlumni(link);
  if(previous.status==='partners'&&link.status!=='partners'&&link.kind==='romantic'){
   const a=nameFor(s,link.a),b=nameFor(s,link.b);
   if(a?.partnerId===link.b)a.partnerId=null;
   if(b?.partnerId===link.a)b.partnerId=null;
  }
  if(link.status==='partners'&&previous.status!=='partners')link.kind='professional';
  // NPCs share a canonical link with the ordinary dialogue graph.
  const mirror=(s.world?.network?.edges||[]).find(x=>x.key===link.id);
  if(mirror){
   mirror.trust=link.trust;
   mirror.loyalty=clamp(65-link.rivalry*.3);
   mirror.status=link.status==='partners'?'allies':link.status==='strangers'?'acquaintances':link.status;
   mirror.relationshipType=link.status==='partners'?link.kind+' partnership':link.status;
  }
  link.history??=[];
  link.history.push({age:s.age,status:link.status,kind:'crossroads',
   text:inv.aName+' and '+inv.bName+' reconsidered their relationship.'});
  link.history=link.history.slice(-8);
 }else{
  link.loyalty=clamp((link.loyalty??50)+(choice.trust>=0?2:-3));
  link.status=statusNetwork(link);
  link.memories??=[];
  link.memories.push({age:s.age,event:'A social crossroads: '+choice.tag});
  link.memories=link.memories.slice(-8);
 }
 const aBoost=choice.tag==='side'?choice.trustNpc:choice.trustNpc;
 const bBoost=choice.tag==='side'?-Math.max(2,choice.trustNpc):choice.trustNpc;
 touchNPC(s,inv.aId,aBoost,choice.rivalryNpc,inv.title);
 touchNPC(s,inv.bId,bBoost,choice.rivalryNpc,inv.title);
 const before=choice.stat?s.stats[choice.stat]:null;
 if(choice.stat)ctx.change(s,choice.stat,choice.delta);
 return {trust:link.trust-previous.trust,rivalry:link.rivalry-previous.rivalry,
  statusBefore:previous.status,statusAfter:link.status,
  stat:choice.stat,statDelta:choice.stat?s.stats[choice.stat]-before:0,
  aTrust:choice.trustNpc,bTrust:bBoost};
}
function outcome(s,inv,ctx){
 const link=linkFor(s,inv.source,inv.sourceKey);
 if(!link||!persons(s,link)){
  finish(s,inv,'interrupted','The people involved are no longer available. This story ends without forcing a reunion.',ctx);
  return;
 }
 const kind=link.status,actions=inv.steps.map(x=>x.tag);
 const ending=actions.every(x=>x==='observe'||x==='release')?'observed':
  ['partners','allies'].includes(kind)?'alliance':
  kind==='friends'?'reconciled':
  ['betrayed','estranged'].includes(kind)?'estranged':
  kind==='rivals'?'rivals':'unresolved';
 const messages={
  observed:'You respected their choices. Their relationship continued without your intervention.',
  alliance:'Their cooperation survived the pressure. Your choices became part of that shared history.',
  reconciled:'They found a workable way to reconnect. That result reflects the trust they have now.',
  estranged:'They remained apart. Your involvement could not erase the changes between them.',
  rivals:'Their rivalry remains real. A fair challenge is not the same as a repaired friendship.',
  unresolved:'They left with different priorities, neither a clear alliance nor a final break.'
 };
 finish(s,inv,ending,messages[ending],ctx);
}
export function crossroadsYear(s,ctx={}){
 if(!s.alive||s.age<13)return;
 const x=ensure(s);
 for(const inv of [...x.open]){
  const link=linkFor(s,inv.source,inv.sourceKey);
  if(!link||!persons(s,link)){
   finish(s,inv,'interrupted','One of these people is no longer present to continue the story.',ctx);
   continue;
  }
  if(inv.status==='open'&&s.age-inv.startAge>=4){
   finish(s,inv,'unanswered','An invitation passed without your involvement; their lives continued.',ctx);
  }else if(inv.status==='waiting'&&s.age>=inv.dueAge){
   inv.status='ready';inv.lastTrust=asNum(link.trust);
   announcement(s,inv.aName+' and '+inv.bName+' have reached a new chapter. The trust between them has changed since your decision.',ctx);
  }else if(inv.status==='ready'&&s.age-inv.dueAge>=4){
   finish(s,inv,'unanswered','The chance to revisit their relationship passed without another intervention.',ctx);
  }
 }
 if(x.open.length>=MAX_OPEN||s.age>=105)return;
 const candidate=candidates(s).find(y=>eligibleSource(s,y));
 if(candidate)offer(s,candidate,ctx);
}
export function crossroadsCommands(s){
 if(!s.alive||s.pending!==null||s.mini||s.world?.network?.conversation||
  s.world?.storyDirector?.active||s.fate?.active?.status==='playing'||
  s.careerCampaigns?.active||s.everydayScenes?.active||s.hobbyCircuit?.active||
  s.workplace?.active?.status==='ready'||s.familyStories?.active?.status==='ready'||
  s.worldPulse?.active?.status==='ready'||(s.justice?.years||0)>0)return [];
 const x=crossroadsState(s),allowed=(s.actions||0)>0;
 return x.open.flatMap(inv=>{
  if(!['open','ready'].includes(inv.status))return [];
  const link=linkFor(s,inv.source,inv.sourceKey);
  const valid=!!link&&!!persons(s,link);
  const choices=inv.status==='open'?initialChoices:laterChoices;
  return choices.map(choice=>({
   id:'cross:'+(inv.status==='open'?'respond':'follow')+':'+inv.id+':'+choice.index,
   label:choice.title,detail:choice.note+' · '+inv.aName+' & '+inv.bName,
   enabled:allowed&&valid
  }));
 });
}
export function crossroadsAct(s,id,ctx){
 const match=/^cross:(respond|follow):(cross-[A-Za-z0-9-]+):([012])$/.exec(id);
 if(!match||!crossroadsCommands(s).some(c=>c.id===id&&c.enabled))
  throw Error('This social crossroads choice is not available.');
 const x=ensure(s),inv=x.open.find(y=>y.id===match[2]);
 if(!inv)throw Error('Social crossroads not found.');
 const phase=match[1]==='respond'?'open':'ready';
 if(inv.status!==phase)throw Error('The social crossroads has moved on.');
 const choice=(phase==='open'?initialChoices:laterChoices)[Number(match[3])];
 const actual=changeLink(s,inv,choice,ctx);
 if(!actual)throw Error('The people involved are no longer available.');
 const record={age:s.age,index:choice.index,tag:choice.tag,label:choice.title,
  ...actual};
 inv.steps.push(record);
 if(phase==='open'){
  inv.status='waiting';inv.dueAge=Math.min(110,s.age+2);
  announcement(s,'You responded to '+inv.aName+' and '+inv.bName+'. Their trust '+(actual.trust>=0?'grew or held':'fell')+'. The consequences may return.',ctx);
 }else outcome(s,inv,ctx);
 return record;
}
export function crossroadsView(s){
 const x=crossroadsState(s);
 return {
  open:x.open.slice().reverse().map(inv=>{
   const link=linkFor(s,inv.source,inv.sourceKey);
   return {...inv,
    nowStatus:link?.status||'unavailable',nowTrust:link?asNum(link.trust):null,
    nowRivalry:link?asNum(link.rivalry):null,
    remaining:Math.max(0,inv.dueAge-s.age),changes:inv.steps.at(-1)||null};
  }),
  completed:x.completed.slice(-9).reverse().map(inv=>({
   id:inv.id,title:inv.title,aName:inv.aName,bName:inv.bName,
   startAge:inv.startAge,endedAge:inv.endedAge,
   ending:inv.ending,finalLine:inv.finalLine,steps:inv.steps.length
  })),
  news:x.news.slice(-7).reverse(),ancestors:x.ancestors.slice().reverse(),
  total:x.completed.length
 };
}
export function crossroadsInheritance(next,old){
 const src=crossroadsState(old),x=state();
 const significant=src.completed.filter(y=>['alliance','reconciled','rivals','estranged'].includes(y.ending)).slice(-2);
 x.ancestors=[...src.ancestors,{
  generation:old.generation,name:text(old.name,32),
  note:text(significant.length?significant.map(y=>y.aName+' and '+y.bName+': '+y.ending).join('; '):
   'People in the wider social world followed their own paths.',200)
 }].slice(-MAX_ANCESTORS);
 next.crossroads=x;
}
export function validateCrossroads(x){
 if(x===undefined)return true;
 const str=(v,n)=>typeof v==='string'&&v.length>0&&v.length<=n;
 const opt=(v,n)=>v===null||str(v,n);
 const source=['alumni','network'],statuses=['open','waiting','ready','completed'],
  endings=['alliance','reconciled','rivals','estranged','unresolved','observed','interrupted','unanswered'],
  kinds=['alliance','friendship','rivalry','fallout','betrayal'];
 const step=y=>y&&ageOK(y.age)&&[0,1,2].includes(y.index)&&
  ['mediate','side','observe','repair','independence','release'].includes(y.tag)&&
  str(y.label,120)&&finite(y.trust)&&finite(y.rivalry)&&
  str(y.statusBefore,30)&&str(y.statusAfter,30)&&
  (y.stat===null||str(y.stat,30))&&finite(y.statDelta)&&finite(y.aTrust)&&finite(y.bTrust);
 const inv=y=>y&&str(y.id,90)&&source.includes(y.source)&&str(y.sourceKey,150)&&
  str(y.aId,100)&&str(y.bId,100)&&y.aId!==y.bId&&
  str(y.aName,70)&&str(y.bName,70)&&kinds.includes(y.kind)&&
  str(y.sourceStatus,30)&&str(y.title,120)&&str(y.introduction,260)&&
  ageOK(y.startAge)&&ageOK(y.dueAge)&&statuses.includes(y.status)&&
  Array.isArray(y.steps)&&y.steps.length<=2&&y.steps.every(step)&&
  (y.status==='open'?y.steps.length===0:
   ['waiting','ready'].includes(y.status)?y.steps.length===1:y.steps.length<=2)&&
  (y.ending===null||endings.includes(y.ending))&&
  (y.endedAge===null||ageOK(y.endedAge))&&
  opt(y.finalLine,240)&&
  [y.firstTrust,y.lastTrust,y.firstRivalry].every(v=>finite(v)&&v>=0&&v<=100);
 return !!x&&x.version===1&&Number.isInteger(x.serial)&&x.serial>=0&&
  Array.isArray(x.open)&&x.open.length<=MAX_OPEN&&x.open.every(y=>inv(y)&&y.status!=='completed')&&
  Array.isArray(x.completed)&&x.completed.length<=MAX_HISTORY&&x.completed.every(y=>
   inv(y)&&y.status==='completed'&&y.endedAge!==null&&y.ending!==null&&str(y.finalLine,240))&&
  new Set([...x.open,...x.completed].map(y=>y.id)).size===x.open.length+x.completed.length&&
  Array.isArray(x.news)&&x.news.length<=MAX_NEWS&&x.news.every(y=>ageOK(y.age)&&str(y.text,230))&&
  Array.isArray(x.seen)&&x.seen.length<=MAX_SEEN&&x.seen.every(y=>
   source.includes(y.source)&&str(y.key,150)&&str(y.status,30)&&ageOK(y.age))&&
  Array.isArray(x.ancestors)&&x.ancestors.length<=MAX_ANCESTORS&&x.ancestors.every(y=>
   Number.isInteger(y.generation)&&y.generation>0&&str(y.name,32)&&str(y.note,200));
}
