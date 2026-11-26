// Lifely 1.16.0 — character fate threads.
// Multi-year, optional, replay-deterministic stories grounded in existing NPCs.
// All outcomes change actual NPC/world state; no invented real-world contacts or online calls.
const MAX_COMPLETE=24,MAX_NEWS=32,MAX_ANCESTRY=12;
const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
const clip=(text,max=180)=>String(text??'').replace(/\s+/g,' ').trim().slice(0,max);
const hash=text=>{let h=2166136261;for(const c of String(text))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
const picks=(s,key,n)=>hash((s.lifeId||s.name)+':'+key)%n;
const inAge=n=>Number.isInteger(n)&&n>=0&&n<=110;
const validNumber=n=>typeof n==='number'&&Number.isFinite(n);
const TWISTS=[
 {id:'unexpected-offer',title:'An offer changes the stakes',
  text:'An unexpected opportunity appears. Sharing it might build trust, but neither of you can be certain who will benefit.'},
 {id:'old-grudge',title:'The old question returns',
  text:'An earlier disagreement becomes relevant again. Both of you must decide whether being right matters more than moving forward.'},
 {id:'competing-loyalties',title:'Two loyalties, one choice',
  text:'Other commitments pull you in different directions. Keeping this relationship may require an uncomfortable compromise.'},
 {id:'quiet-reversal',title:'A change of heart',
  text:'The person you thought you understood has reconsidered what matters. An old promise no longer has the same meaning.'}
];
export const fateTypes=[
 {id:'friendship',title:'The Friendship We Might Lose',eligible:p=>['friend','partner','alumni','Former classmate'].includes(p.kind),
  opener:'A small disagreement makes {person} wonder whether you are still on the same side. They want to speak before silence turns into distance.',
  middle:'An old promise between you and {person} has become harder to keep. What was easy in the beginning now demands a real choice.',
  ending:'Years after your first conversation, {person} asks whether the relationship still deserves a place in your future.'},
 {id:'rivalry',title:'The Rival Who Knows You Best',eligible:p=>p.rivalry>=20||p.personality==='Competitive'||['athlete','politician'].includes(p.kind),
  opener:'{person} challenges the way you define success. You can compete, cooperate, or refuse to let a rivalry define either of you.',
  middle:'Your paths cross again when something you both care about is at stake. {person} is no longer the same competitor you remember.',
  ending:'At the final crossroads, {person} wants to know what your competition has taught you about each other.'},
 {id:'ambition',title:'The Opportunity We Shared',eligible:p=>p.kind==='alumni'||p.kind==='agent'||p.kind==='friend'||p.kind==='partner',
  opener:'{person} proposes a project that could benefit both of you. It sounds promising, but the arrangement will test your priorities.',
  middle:'The original plan no longer fits the present. {person} has a different idea about how to honor the work you started.',
  ending:'You and {person} face the choice of sharing credit, remaining competitors, or pursuing different futures.'},
 {id:'family',title:'A Promise at Home',eligible:p=>['parent','sibling','child','grandparent','partner'].includes(p.kind),
  opener:'Something important to your family has brought {person} to you. You do not agree on what loyalty should mean.',
  middle:'With more years behind you, {person} sees the promise differently. The question is not simply who was right.',
  ending:'You and {person} return to the same conversation with years of memories. What will you carry forward?'}
];
const CHOICES=[
 [
  {label:'Listen and stand beside them',detail:'Protect the bond, even if you must surrender some control',path:'care',bond:8,trust:5,rivalry:-4,score:13,stat:'kindness',statDelta:2},
  {label:'Compete openly, but keep it fair',detail:'Gain confidence while risking a sharper rivalry',path:'compete',bond:1,trust:1,rivalry:9,score:3,stat:'confidence',statDelta:3},
  {label:'Set a boundary and ask for honesty',detail:'Protect your peace; trust may develop more slowly',path:'boundary',bond:-2,trust:2,rivalry:-3,score:5,stat:'stress',statDelta:-3}
 ],
 [
  {label:'Give them a genuine second chance',detail:'Kindness can rebuild trust, but requires vulnerability',path:'care',bond:9,trust:7,rivalry:-5,score:15,stat:'social',statDelta:3},
  {label:'Test the partnership through friendly competition',detail:'Pressure can reveal mutual respect or expose resentment',path:'compete',bond:0,trust:0,rivalry:12,score:1,stat:'confidence',statDelta:4},
  {label:'Ask what changed before promising anything',detail:'Protect clarity; short-term closeness may be sacrificed',path:'boundary',bond:-1,trust:3,rivalry:-2,score:7,stat:'knowledge',statDelta:2}
 ],
 [
  {label:'Choose to build a future together',detail:'Commit to connection, without knowing how they will respond',path:'care',bond:10,trust:8,rivalry:-8,score:16,stat:'happiness',statDelta:3},
  {label:'Respect the rivalry and keep your independence',detail:'Preserve ambition and accept a different kind of bond',path:'compete',bond:-2,trust:0,rivalry:8,score:2,stat:'confidence',statDelta:4},
  {label:'Part carefully and leave room for change',detail:'A quiet ending may be healthier than a false reconciliation',path:'boundary',bond:-4,trust:2,rivalry:-6,score:5,stat:'stress',statDelta:-4}
 ]
];
const startState=()=>({version:1,serial:0,active:null,completed:[],news:[],ancestry:[],lastStartedAge:-100});
export const fateState=s=>s.fate||startState();
const ensure=s=>s.fate??=startState();
const isPresent=(s,id)=>{
 if(String(id).startsWith('person-'))return (s.people||[]).some(p=>'person-'+p.id===id&&p.alive);
 return [...(s.world?.autonomy?.alumni||[]),...(s.world?.characters?.athletes||[]),
  ...(s.world?.characters?.politicians||[]),...(s.world?.characters?.agents||[])].some(p=>p.id===id);
};
function getPerson(s,id){
 if(String(id).startsWith('person-')){
  const p=(s.people||[]).find(x=>'person-'+x.id===id&&x.alive);
  return p?{id,name:p.name,kind:p.role||'friend',personality:p.world?.personality||'Thoughtful',
   trust:p.world?.trust??p.bond??50,rivalry:p.world?.rivalry??0,source:p,relation:'person'}:null;
 }
 for(const [key,kind] of [['alumni','alumni'],['athletes','athlete'],['politicians','politician'],['agents','agent']]){
  const arr=key==='alumni'?s.world?.autonomy?.alumni:s.world?.characters?.[key];
  const p=(arr||[]).find(x=>x.id===id);
  if(p)return {id,name:p.name,kind,personality:p.personality||'Driven',
   trust:p.trust??p.respect??50,rivalry:p.rivalry??0,source:p,relation:'world'};
 }
 return null;
}
function availablePeople(s){
 const p=(s.people||[]).filter(x=>x.alive&&x.age>=8)
  .map(x=>getPerson(s,'person-'+x.id)).filter(Boolean);
 const external=s.age>=18?[
  ...(s.world?.autonomy?.alumni||[]).slice(0,8),
  ...(s.world?.characters?.athletes||[]).slice(0,4),
  ...(s.world?.characters?.politicians||[]).slice(0,3),
  ...(s.world?.characters?.agents||[]).slice(0,3)
 ].map(x=>getPerson(s,x.id)).filter(Boolean):[];
 const last=fateState(s).completed||[];
 return [...p,...external].filter(x=>
  !last.some(y=>y.personId===x.id&&s.age-y.endedAge<5))
  .sort((a,b)=>{
   const score=x=>(['friend','partner','alumni'].includes(x.kind)?15:0)+
    (x.rivalry>=30?14:0)+
    ((s.emotional?.threads||[]).some(m=>m.personId===x.id)?12:0)+
    (x.trust>=70?5:0);
   return score(b)-score(a)||String(a.id).localeCompare(String(b.id));
  }).slice(0,5);
}
const typeFor=(s,p)=>{
 const eligible=fateTypes.filter(t=>t.eligible(p));
 const recent=fateState(s).completed.slice(-4).map(x=>x.type);
 const pool=eligible.filter(t=>!recent.includes(t.id));
 const pick=pool.length?pool:eligible;
 return pick[picks(s,p.id+':'+s.age,pick.length)]||fateTypes[0];
};
const report=(s,text,ctx)=>{
 const f=ensure(s);f.news.push({age:s.age,text:clip(text,230)});f.news=f.news.slice(-MAX_NEWS);
 ctx.add(s,text,'people');
};
export function fateCommands(s){
 if(!s.alive||s.age<12||(s.justice?.years||0)>0)return [];
 const f=fateState(s),active=f.active,can=!!(s.actions>0);
 if(active){
  if(active.status==='ready')return [{
   id:'fate:continue',label:'Return to '+active.personName+"'s story",
   detail:active.title+' · chapter '+(active.stage+1)+'/3',enabled:can&&isPresent(s,active.personId)
  }];
  return [];
 }
 if(s.age-f.lastStartedAge<2)return [];
 return availablePeople(s).slice(0,4).map(p=>{
  const type=typeFor(s,p);
  return {id:'fate:start:'+p.id,label:'Explore a story with '+p.name,
   detail:type.title+' · an original three-part life arc',enabled:can};
 });
}
export function fateAct(s,id,ctx){
 const f=ensure(s),command=fateCommands({...s,actions:s.actions+1}).find(x=>x.id===id);
 if(!command?.enabled)throw Error('Character story is not available.');
 if(id==='fate:continue'){
  if(!f.active||f.active.status!=='ready')throw Error('The next chapter is not ready.');
  f.active.status='playing';
  report(s,'Returned to '+f.active.personName+"'s unfinished story.",ctx);
  return s;
 }
 const personId=id.slice('fate:start:'.length),p=getPerson(s,personId);
 if(!p)throw Error('This person is no longer available.');
 const type=typeFor(s,p),serial=++f.serial;
 const twist=TWISTS[picks(s,p.id+':'+serial+':'+type.id,TWISTS.length)];
 f.active={id:'fate-g'+s.generation+'-'+serial,personId:p.id,personName:clip(p.name,70),
  kind:p.kind,type:type.id,title:type.title,twist:twist.id,
  startedAge:s.age,endedAge:null,stage:0,dueAge:s.age,
  status:'playing',score:clamp(43+Math.round((p.trust-50)*.18)-Math.round(p.rivalry*.12)),
  trust:clamp(p.trust),rivalry:clamp(p.rivalry),lastTrust:clamp(p.trust),
  npcShift:0,decisions:[],last:null,ending:null,finalLine:null};
 f.lastStartedAge=s.age;
 report(s,p.name+' invited you into a new story: '+type.title+'.',ctx);
 return s;
}
const actualOutcome=(s,arc)=>{
 const p=getPerson(s,arc.personId);
 if(!p)return {title:'An unfinished conversation',ending:'interrupted',
  line:arc.personName+' is no longer available. This story ends without a forced reconciliation.'};
 const shared=arc.decisions.filter(x=>x.path==='care').length;
 const competitive=arc.decisions.filter(x=>x.path==='compete').length;
 if(arc.score>=75&&p.trust>=56&&shared>=2)return {title:'Lifelong allies',ending:'allies',
  line:arc.personName+' chooses to stay in your corner. Your shared history has grown stronger than one disagreement.'};
 if(competitive>=2&&p.rivalry>=35)return {title:'Respected rivals',ending:'rivals',
  line:arc.personName+' still wants to win. But you have learned to compete without treating each other as enemies.'};
 if(arc.score<40||p.trust<25)return {title:'A friendship left behind',ending:'estranged',
  line:'You and '+arc.personName+' follow different paths. What happened still matters, even without a happy ending.'};
 if(shared>=1&&p.trust>=50)return {title:'A second chance',ending:'reconciled',
  line:arc.personName+' returns with more understanding than before. The relationship remains imperfect but alive.'};
 return {title:'An honest distance',ending:'distance',
  line:'You and '+arc.personName+' respect what you shared, even if you no longer want the same future.'};
};
function close(s,arc,ctx,override=null){
 const f=ensure(s);
 const ending=override||actualOutcome(s,arc);
 arc.status='completed';arc.endedAge=s.age;arc.ending=ending.ending;arc.finalLine=ending.line;
 arc.last={...(arc.last||{}),label:arc.last?.label||'The chapter ended',feedback:ending.line,endingTitle:ending.title};
 f.completed.push({...arc});f.completed=f.completed.slice(-MAX_COMPLETE);
 f.active=null;
 report(s,arc.personName+': '+ending.title+'. '+ending.line,ctx);
}
function choiceImpact(s,arc,choice,ctx){
 const p=getPerson(s,arc.personId);
 if(!p)return null;
 const raw=p.source,oldTrust=p.trust,oldRivalry=p.rivalry;
 const first=raw.bond!==undefined?raw.bond:null;
 const beforeStat=s.stats[choice.stat];
 if(p.relation==='person'){
  ctx.bond(s,raw,choice.bond,'An important decision in '+arc.title);
  if(raw.world){
   raw.world.trust=clamp((raw.world.trust??p.trust)+choice.trust);
   raw.world.rivalry=clamp((raw.world.rivalry??p.rivalry)+choice.rivalry);
  }
 }else{
  if(Number.isFinite(raw.trust))raw.trust=clamp(raw.trust+choice.bond+choice.trust);
  else if(Number.isFinite(raw.respect))raw.respect=clamp(raw.respect+choice.bond+choice.trust);
  if(Number.isFinite(raw.rivalry))raw.rivalry=clamp(raw.rivalry+choice.rivalry);
  if(Array.isArray(raw.history)){
   raw.history.push({age:s.age,kind:'fate',event:choice.label});
   raw.history=raw.history.slice(-18);
  }
 }
 ctx.change(s,choice.stat,choice.statDelta);
 const updated=getPerson(s,arc.personId);
 let scoreChange=choice.score;
 // Other people evolve independently; some paths become harder to preserve.
 if(arc.stage>0&&arc.npcShift<=-8)scoreChange-=7;
 if(arc.stage>0&&arc.npcShift>=8)scoreChange+=5;
 if(arc.twist==='old-grudge'&&choice.path==='compete')scoreChange-=7;
 if(arc.twist==='quiet-reversal'&&choice.path==='boundary')scoreChange+=4;
 if(p.personality==='Cautious'&&choice.path==='compete')scoreChange-=5;
 if(p.personality==='Competitive'&&choice.path==='compete')scoreChange+=4;
 arc.score=clamp(arc.score+scoreChange);
 arc.trust=clamp(updated.trust);
 arc.rivalry=clamp(updated.rivalry);
 arc.lastTrust=arc.trust;
 const bondChange=first===null?null:raw.bond-first;
 const trustChange=arc.trust-oldTrust,rivalryChange=arc.rivalry-oldRivalry;
 const statChange=s.stats[choice.stat]-beforeStat;
 const mood=choice.path==='care'?'You reached toward them.':
  choice.path==='compete'?'You chose the challenge, and they noticed.':
  'You held a difficult boundary without pretending nothing mattered.';
 return {path:choice.path,label:choice.label,age:s.age,
  bondChange,trustChange,rivalryChange,stat:choice.stat,statChange,scoreChange,
  feedback:mood+' '+(trustChange>0?'Their trust grew.':rivalryChange>0?'Your rivalry sharpened.':
   trustChange<0?'A little trust was lost.':'The future remains uncertain.')};
}
export function fateChoose(s,index,ctx){
 const f=ensure(s),a=f.active;
 if(!s.alive||!a||a.status!=='playing'||s.pending!==null)throw Error('No active character scene.');
 if(!Number.isInteger(index)||index<0||index>2)throw Error('Choose one of the three responses.');
 const p=getPerson(s,a.personId);
 if(!p){close(s,a,ctx,{title:'An interrupted story',ending:'interrupted',
  line:a.personName+' is no longer available to finish this story.'});return s;}
 const choice=CHOICES[a.stage][index];
 const result=choiceImpact(s,a,choice,ctx);
 a.decisions.push({age:s.age,index,path:choice.path,...result});
 a.last=result;
 report(s,a.personName+': '+choice.label+'. '+result.feedback,ctx);
 a.stage++;
 if(a.stage===3){
  close(s,a,ctx);
 }else{
  const spacing=2+picks(s,a.id+':stage:'+a.stage,3);
  a.dueAge=Math.min(110,s.age+spacing);a.status='waiting';
  a.npcShift=0;
 }
 return s;
}
export function fateYear(s,ctx){
 const f=s.fate,a=f?.active;
 if(!a||a.status==='playing')return;
 const person=getPerson(s,a.personId);
 if(!person){
  close(s,a,ctx,{title:'A story interrupted',ending:'interrupted',
   line:a.personName+' is no longer part of your life, so this chapter cannot continue.'});
  return;
 }
 if(a.status==='waiting'&&s.age>=a.dueAge){
  a.npcShift=clamp(person.trust)-a.lastTrust;
  a.trust=clamp(person.trust);a.rivalry=clamp(person.rivalry);
  a.status='ready';
  const tone=a.npcShift<=-8?'Their trust has changed while you were apart. ':
   a.npcShift>=8?'Time has softened the distance between you. ':
   'Time passed and each of you followed your own path. ';
  report(s,a.personName+' has returned to the crossroads. '+tone+
    'A new chapter of '+a.title+' is available.',ctx);
 }
 // A missed story never blocks the next year and never silently spends actions.
 if(a.status==='ready'&&s.age-a.dueAge>=5){
  close(s,a,ctx,{title:'A conversation left unanswered',ending:'unanswered',
   line:'You and '+a.personName+' continued your separate lives. The chance to revisit this chapter passed.'});
 }
}
const slot=(text,p)=>text.replaceAll('{person}',p);
export function fateView(s){
 const a=fateState(s).active;
 if(!a||a.status!=='playing')return null;
 const type=fateTypes.find(t=>t.id===a.type);
 if(!type)return null;
 const twist=TWISTS.find(t=>t.id===a.twist);
 const prompt=a.stage===0?type.opener:a.stage===1?type.middle:type.ending;
 const surprise=a.stage>=1?twist?.text||'A new complication changes what you both want.':'';
 return {id:a.id,person:a.personName,title:a.title,stage:a.stage,round:a.stage+1,total:3,
  age:s.age,startedAge:a.startedAge,headline:a.stage===0?'A relationship at a crossroads':
   a.stage===1?twist.title:'The moment that decides what remains',
  scene:slot(prompt,a.personName),surprise,
  independent:a.stage>=1?(a.npcShift<=-8?'They have become more guarded since you last spoke.':
   a.npcShift>=8?'Their trust grew during the years apart.':
   'Their life kept changing while you were apart.'):'',
  meters:{connection:a.trust,rivalry:a.rivalry,hope:a.score},last:a.last,
  choices:CHOICES[a.stage].map((x,index)=>({index,label:x.label,detail:x.detail,path:x.path}))};
}
export function fateSummary(s){
 const f=fateState(s),a=f.active;
 return {active:a?{id:a.id,person:a.personName,title:a.title,status:a.status,stage:a.stage,
   dueAge:a.dueAge,startedAge:a.startedAge,yearsToGo:Math.max(0,a.dueAge-s.age),
   last:a.last}:null,
  recent:f.completed.slice(-8).reverse().map(x=>({id:x.id,person:x.personName,
   title:x.title,ending:x.ending,endingTitle:x.last?.endingTitle||x.ending,endedAge:x.endedAge,startedAge:x.startedAge,
   finalLine:x.finalLine,decisions:x.decisions.length})),
  news:f.news.slice(-5).reverse(),ancestry:f.ancestry.slice(-6).reverse(),
  total:f.completed.length};
}
export function fateInheritance(next,old){
 const src=fateState(old),out=startState();
 out.ancestry=[...(src.ancestry||[]),
  {name:clip(old.name,32),generation:old.generation,
   note:clip(src.completed.at(-1)?.finalLine||'Relationships shaped a lifetime.',220)}].slice(-MAX_ANCESTRY);
 next.fate=out;
}
export function validateFate(f){
 if(f===undefined)return true;
 const str=(x,n)=>typeof x==='string'&&x.length<=n;
 const outcome=['allies','rivals','estranged','reconciled','distance','interrupted','unanswered'];
 const statuses=['playing','waiting','ready','completed'];
 const choice=x=>x&&inAge(x.age)&&Number.isInteger(x.index)&&x.index>=0&&x.index<=2&&
  ['care','compete','boundary'].includes(x.path)&&str(x.label,180)&&
  (x.bondChange===null||validNumber(x.bondChange))&&validNumber(x.trustChange)&&
  validNumber(x.rivalryChange)&&str(x.stat,40)&&validNumber(x.statChange)&&
  validNumber(x.scoreChange)&&str(x.feedback,250);
 const last=x=>x===null||(x&&str(x.label,180)&&str(x.feedback,250)&&
  (x.endingTitle===undefined||str(x.endingTitle,180)));
 const arc=x=>x&&str(x.id,80)&&str(x.personId,100)&&str(x.personName,70)&&
  str(x.kind,35)&&fateTypes.some(t=>t.id===x.type)&&str(x.title,140)&&
  TWISTS.some(t=>t.id===x.twist)&&inAge(x.startedAge)&&inAge(x.dueAge)&&
  (x.endedAge===null||inAge(x.endedAge))&&Number.isInteger(x.stage)&&x.stage>=0&&x.stage<=3&&
  statuses.includes(x.status)&&[x.score,x.trust,x.rivalry,x.lastTrust].every(n=>validNumber(n)&&n>=0&&n<=100)&&
  Number.isInteger(x.npcShift)&&x.npcShift>=-100&&x.npcShift<=100&&
  Array.isArray(x.decisions)&&x.decisions.length<=3&&x.decisions.every(choice)&&
  x.decisions.length===x.stage&&last(x.last)&&
  (x.ending===null||outcome.includes(x.ending))&&
  (x.finalLine===null||str(x.finalLine,250));
 return !!f&&f.version===1&&Number.isInteger(f.serial)&&f.serial>=0&&
  Number.isInteger(f.lastStartedAge)&&f.lastStartedAge>=-100&&f.lastStartedAge<=110&&
  (f.active===null||(arc(f.active)&&f.active.stage<=2&&f.active.status!=='completed'))&&
  Array.isArray(f.completed)&&f.completed.length<=MAX_COMPLETE&&
  f.completed.every(x=>arc(x)&&x.status==='completed'&&x.ending!==null&&x.endedAge!==null&&
   (x.stage===3||(['interrupted','unanswered'].includes(x.ending)&&x.stage<=2)))&&
  Array.isArray(f.news)&&f.news.length<=MAX_NEWS&&f.news.every(x=>inAge(x.age)&&str(x.text,230))&&
  Array.isArray(f.ancestry)&&f.ancestry.length<=MAX_ANCESTRY&&
  f.ancestry.every(x=>str(x.name,32)&&Number.isInteger(x.generation)&&x.generation>0&&str(x.note,220));
}
