// Real adult partners and ex-partners; ordinary actions, no forced romance.
import {parentingPractice} from './family-dynasty.mjs';
const cap=n=>Math.max(0,Math.min(100,Math.round(n)));
const age=n=>Number.isInteger(n)&&n>=0&&n<=110;
const bounded=n=>Number.isInteger(n)&&n>=0&&n<=100;
const text=(v,n=180)=>String(v??'').slice(0,n);
const alive=s=>(s.people||[]).filter(p=>p.alive);
const partner=s=>alive(s).find(p=>p.role==='partner'&&p.age>=18);
const values={'Financial security':'stability','Career success':'ambition','Family life':'connection','Creative expression':'creativity','Community service':'connection','Adventure':'freedom'};
const preference=p=>values[p.world?.ambition]||'connection';
const empty=()=>({version:1,profiles:{},parenting:{},history:[],legacy:[],serial:0});
const state=s=>s.romance||empty(),ensure=s=>s.romance??=empty();
function compatibility(s,p){
 const v=preference(p),stats=s.stats||{};
 const fit=v==='stability'?(s.goal==='wealth'?85:stats.knowledge):v==='ambition'?stats.performance:v==='connection'?(s.goal==='family'?85:stats.kindness):v==='creativity'?stats.creativity:stats.confidence;
 return cap((fit??50)*.45+(p.bond??65)*.3+(p.world?.trust??65)*.25);
}
function initial(s,p){return {personId:p.id,startedAge:s.age,lastYear:s.age,lastAction:null,lastKind:null,closeness:cap(p.bond),tension:cap(p.world?.rivalry??0),alignment:compatibility(s,p),proposal:null,conflict:null,meetings:0,weddings:0,reunions:0};}
function profile(s,p){const m=ensure(s),key=String(p.id);if(!m.profiles[key]){
  if(Object.keys(m.profiles).length>=24){const keyToRemove=Object.keys(m.profiles).find(k=>!alive(s).some(x=>String(x.id)===k&&x.role==='partner'));if(keyToRemove)delete m.profiles[keyToRemove];else throw Error('Relationship capacity reached.');}
  m.profiles[key]=initial(s,p);
 }return m.profiles[key];}
function record(s,p,kind,description,ctx){
 const m=ensure(s);const h={id:++m.serial,age:s.age,personId:p.id,name:text(p.name,70),kind,description:text(description,200)};
 m.history.push(h);m.history=m.history.slice(-40);ctx.add(s,p.name+': '+description,'family');return h;
}
function eligible(s){return s.alive&&s.age>=18&&s.pending===null&&!s.mini&&!s.world?.network?.conversation&&!s.everydayScenes?.active&&!s.careerCampaigns?.active&&!s.world?.storyDirector?.active&&!s.hobbyCircuit?.active&&s.fate?.active?.status!=='playing'&&s.familyStories?.active?.status!=='ready'&&s.workplace?.active?.status!=='ready'&&s.worldPulse?.active?.status!=='ready'&&!(s.justice?.years>0);}
const steps=[
 {id:'listen',label:'Talk about what matters to each of you',detail:'Connection, trust and shared understanding',close:10,tension:-9,bond:6},
 {id:'adventure',label:'Plan a shared adventure',detail:'Build closeness; different priorities affect the result',close:8,tension:-3,bond:4},
 {id:'plan',label:'Make a realistic plan for your future',detail:'Balance independent ambitions and shared commitments',close:5,tension:-12,bond:4}
];
const conflictTypes=[
 {id:'time',title:'Different demands on your time',prompt:'Your partner wants more room for their own plans, while you feel that shared time is disappearing.'},
 {id:'jealousy',title:'A friendship causes uncertainty',prompt:'A new friendship has brought up insecurity. Neither person owes control of their social life to the other.'},
 {id:'future',title:'Two different visions of the future',prompt:'Your ambitions no longer fit neatly together. Both people need a say in the next chapter.'},
 {id:'secret',title:'A difficult family disclosure',prompt:'Your partner shares a family worry they had been keeping private. What happens next depends on how you respond.'}
];
const conflictSpec=id=>conflictTypes.find(x=>x.id===id);
const styles=['encourage','structure','independence'];
function reconciliationEligible(s,p){
 return !partner(s)&&p.alive&&p.role==='ex'&&p.age>=18&&p.bond>=60&&(p.world?.trust??0)>=60&&(p.world?.rivalry??100)<=35&&!s.familyTransitions?.propertyCase;
}
function usableParent(s,p){return p.role==='child'&&p.age>=3&&p.age<=17&&(s.familyStories?.members?.[String(p.id)]||Object.keys(s.familyStories?.members||{}).length<30);}
export function romanceCommands(s){
 if(!eligible(s))return [];
 const m=state(s),a=s.actions>0,out=[],p=partner(s),push=(id,label,detail,enabled=true)=>out.push({id:'romance:'+id,label,detail,enabled:a&&enabled});
 if(p){
  const q=m.profiles[p.id]||initial(s,p),ready=q.lastAction!==s.age;
  if(q.conflict){
   for(const [id,label,detail] of [['listen','Listen to their concerns','Reduce tension and rebuild trust'],['plan','Agree on a practical boundary','Find a realistic shared agreement'],['space','Give each other room','Lower pressure without promising reconciliation']])push('conflict:'+p.id+':'+id,label,detail,ready);
  }else if(q.proposal?.status==='engaged'&&!p.married){
   push('wedding:'+p.id+':simple','Hold a small wedding','No cost; focus on the commitment',ready);
   push('wedding:'+p.id+':celebration','Celebrate with loved ones','$750 from existing cash · a shared celebration',ready&&s.cash>=750);
   push('wedding:'+p.id+':postpone','Postpone the wedding','Keep the engagement without a forced decision',ready);
  }else{
   for(const x of steps)push('connect:'+p.id+':'+x.id,x.label,x.detail,ready);
   if(!p.married&&p.bond>=70)push('propose:'+p.id,'Ask about marriage','Your partner can accept or ask for more time',ready);
  }
 }else{
  for(const x of alive(s).filter(p=>reconciliationEligible(s,p)).slice(0,4)){
   const q=m.profiles[x.id]||initial(s,x);
   push('reunite:'+x.id,'Ask '+x.name+' about starting again','Mutual trust and readiness determine their answer',q.lastAction!==s.age);
  }
 }
 for(const x of alive(s).filter(p=>usableParent(s,p)).slice(0,5)){
  const h=m.parenting[x.id];const ready=h?.lastAge!==s.age;
  for(const [id,label,detail] of [['encourage','Encourage '+x.name+' through a setback','Develop care and emotional resilience'],['structure','Practice a skill with '+x.name,'Build knowledge, talent and resilience'],['independence','Let '+x.name+' choose a project','Develop independence and self-confidence']])push('parent:'+x.id+':'+id,label,detail,ready);
 }
 return out;
}
function resolveConflict(s,p,q,choice,ctx){
 const map={listen:[12,-23,8],plan:[7,-17,5],space:[1,-12,1]},[close,tension,bond]=map[choice];
 q.closeness=cap(q.closeness+close);q.tension=cap(q.tension+tension);
 ctx.bond(s,p,bond,'A relationship conflict was handled with respect');
 q.conflict=null;record(s,p,'repair',choice==='space'?'You made space for separate priorities.':'You discussed the disagreement and made a new agreement.',ctx);
}
export function romanceAct(s,id,ctx){
 if(!romanceCommands({...s,actions:s.actions+1}).some(c=>c.id===id&&c.enabled))throw Error('Relationship decision is unavailable.');
 const [,action,key,choice]=id.split(':'),p=alive(s).find(p=>p.id===Number(key));
 if(action==='parent'){
  const m=ensure(s),h=m.parenting[key]??={lastAge:null,counts:{encourage:0,structure:0,independence:0}};
  parentingPractice(s,p,choice,ctx);h.lastAge=s.age;h.counts[choice]++;
  record(s,p,'parenting','You chose '+choice+' as a way to support their development.',ctx);return;
 }
 const q=profile(s,p);q.lastAction=s.age;q.lastKind=action;
 if(action==='connect'){
  const x=steps.find(x=>x.id===choice),fit=choice==='listen'&&preference(p)==='connection'||choice==='adventure'&&['freedom','creativity'].includes(preference(p))||choice==='plan'&&['stability','ambition'].includes(preference(p));
  q.closeness=cap(q.closeness+x.close+(fit?4:0));q.tension=cap(q.tension+x.tension);q.alignment=cap(q.alignment+(fit?5:2));q.meetings++;
  ctx.bond(s,p,x.bond+(fit?2:0),'A thoughtful relationship decision');ctx.change(s,'happiness',2);
  record(s,p,'connection',fit?'Your partner appreciated how the choice matched their priorities.':'You shared time while learning more about each other.',ctx);
 }else if(action==='conflict')resolveConflict(s,p,q,choice,ctx);
 else if(action==='propose'){
  const accepted=p.bond>=75&&(p.world?.trust??0)>=68&&q.tension<=40&&q.closeness>=65&&q.alignment>=45;
  q.proposal={status:accepted?'engaged':'not-yet',age:s.age};
  if(accepted)ctx.bond(s,p,4,'A mutual engagement');record(s,p,accepted?'engaged':'not-yet',accepted?'You both agreed to a future wedding.':'They asked for more time. No commitment was forced.',ctx);
 }else if(action==='wedding'){
  if(choice==='postpone'){record(s,p,'postponed','You agreed to take more time before the wedding.',ctx);return;}
  if(choice==='celebration')ctx.spend(s,750);
  p.married=true;q.proposal=null;q.weddings++;q.closeness=cap(q.closeness+12);q.tension=cap(q.tension-8);
  ctx.bond(s,p,8,'A mutual wedding commitment');ctx.change(s,'happiness',choice==='celebration'?5:3);
  record(s,p,'wedding',choice==='celebration'?'You celebrated your wedding with loved ones.':'You chose a small wedding focused on each other.',ctx);
 }else if(action==='reunite'){
  const accepted=p.bond>=75&&(p.world?.trust??0)>=72&&q.tension<=45;
  if(accepted){
   p.role='partner';p.married=false;q.reunions++;q.proposal=null;q.conflict=null;q.closeness=cap(p.bond);
   if(s.familyTransitions?.separation?.exId===p.id)s.familyTransitions.separation=null;
   ctx.bond(s,p,4,'Mutually agreed to try again');
  }
  record(s,p,accepted?'reunited':'not-yet',accepted?'You both agreed to start again without an automatic marriage.':'They chose to keep the relationship separate for now.',ctx);
 }
}
export function romanceObserve(s,p,kind,ctx){
 if(!p||s.age<18)return;
 const q=profile(s,p);
 if(kind==='met'){q.startedAge=s.age;q.lastYear=s.age;}
 if(kind==='married'){q.proposal=null;q.weddings++;q.closeness=cap(p.bond);}
 if(kind==='separated'){q.proposal=null;q.conflict=null;q.tension=cap(q.tension+20);}
 record(s,p,kind,kind==='met'?'A new relationship began.':kind==='married'?'You entered a marriage.':'The relationship ended; the memories remain.',ctx);
}
export function romanceYear(s,ctx){
 const m=s.romance;if(!m||!s.alive)return;
 const p=partner(s);
 for(const q of Object.values(m.profiles)){
  if(!p||q.personId!==p.id){q.proposal=null;q.conflict=null;continue;}
  if(q.lastYear>=s.age)continue;q.lastYear=s.age;
  q.closeness=cap(Math.round((q.closeness*3+p.bond)/4)-(s.age-(q.lastAction??q.startedAge)>=3?2:0));
  q.alignment=cap(Math.round((q.alignment*3+compatibility(s,p))/4));
  q.tension=cap(q.tension+(s.stats.stress>=70?5:-2)+(p.world?.rivalry>=40?4:0)+(q.alignment<45?3:0));
  if(q.conflict&&s.age>=q.conflict.dueAge){q.conflict=null;q.tension=cap(q.tension+4);record(s,p,'unresolved','An unresolved disagreement faded into the background, but tension remains.',ctx);}
  if(!q.conflict&&q.tension>=45&&s.age<=108&&s.age-(q.lastAction??q.startedAge)>=2&&
   !m.history.some(h=>h.personId===p.id&&h.kind==='conflict'&&s.age-h.age<4)){
   const k=q.alignment<45?'future':p.world?.rivalry>=40?'jealousy':s.stats.stress>=70?'time':'secret';
   q.conflict={kind:k,startedAge:s.age,dueAge:s.age+2};record(s,p,'conflict',conflictSpec(k).title+'.',ctx);
  }
 }
}
export function romanceView(s){
 const m=state(s),p=partner(s),q=p?(m.profiles[p.id]||initial(s,p)):null;
 return {partner:p?{id:p.id,name:p.name,age:p.age,married:!!p.married,bond:p.bond,trust:p.world?.trust??65,priority:preference(p),personality:p.world?.personality||'Unknown',...q,conflict:q.conflict?{...q.conflict,...conflictSpec(q.conflict.kind)}:null}:null,
  children:alive(s).filter(p=>p.role==='child'&&p.age>=3&&p.age<=17).map(p=>({id:p.id,name:p.name,age:p.age,personality:p.world?.personality||'Unknown',bond:p.bond,profile:s.familyStories?.members?.[p.id]||null,practice:m.parenting[p.id]||null})),
  history:m.history.slice(-8).reverse(),legacy:m.legacy.slice(-6).reverse()};
}
export function romanceInheritance(next,old){
 const prior=old.romance;if(!prior)return;
 next.romance={...empty(),legacy:[...prior.legacy,...prior.history.filter(x=>['wedding','married','reunited','parenting','repair'].includes(x.kind)).slice(-8).map(x=>({...x,ancestor:text(old.name,70),generation:old.generation}))].slice(-20)};
}
export function validateRomance(m){
 if(m===undefined)return true;
 const kinds=['met','married','separated','connection','engaged','not-yet','wedding','postponed','reunited','repair','conflict','unresolved','parenting'];
 const validHistory=h=>h&&Number.isInteger(h.id)&&h.id>0&&age(h.age)&&Number.isInteger(h.personId)&&typeof h.name==='string'&&h.name.length<=70&&kinds.includes(h.kind)&&typeof h.description==='string'&&h.description.length<=200;
 const count=n=>Number.isInteger(n)&&n>=0&&n<=110;
 const q=(p,k)=>p&&String(p.personId)===k&&Number.isInteger(p.personId)&&age(p.startedAge)&&age(p.lastYear)&&(p.lastAction===null||age(p.lastAction))&&[p.closeness,p.tension,p.alignment].every(bounded)&&[p.meetings,p.weddings,p.reunions].every(count)&&(p.proposal===null||p.proposal&&['engaged','not-yet'].includes(p.proposal.status)&&age(p.proposal.age))&&(p.conflict===null||p.conflict&&!!conflictSpec(p.conflict.kind)&&age(p.conflict.startedAge)&&age(p.conflict.dueAge)&&p.conflict.dueAge===p.conflict.startedAge+2);
 return !!m&&m.version===1&&Number.isInteger(m.serial)&&m.serial>=0&&m.profiles&&Object.keys(m.profiles).length<=24&&Object.entries(m.profiles).every(([k,p])=>q(p,k))&&m.parenting&&Object.keys(m.parenting).length<=30&&Object.entries(m.parenting).every(([k,h])=>Number.isInteger(Number(k))&&h&&age(h.lastAge)&&h.counts&&styles.every(x=>count(h.counts[x])))&&Array.isArray(m.history)&&m.history.length<=40&&m.history.every(validHistory)&&new Set(m.history.map(x=>x.id)).size===m.history.length&&m.history.every(x=>x.id<=m.serial)&&Array.isArray(m.legacy)&&m.legacy.length<=20&&m.legacy.every(x=>validHistory(x)&&typeof x.ancestor==='string'&&Number.isInteger(x.generation)&&x.generation>=1);
}
