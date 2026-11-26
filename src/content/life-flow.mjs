// Lifely 1.13 — pacing, character-aware event selection, and focused navigation.
// The director never changes explicit player-choice effects or silently gives currency.
const cap=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const integer=n=>Math.round(n||0);
export const flowThemes=[
 {id:'balanced',label:'Surprise me',hint:'A varied life, without repeating the same kind of scene'},
 {id:'relationships',label:'People & family',hint:'More stories about trust, friendships and family'},
 {id:'career',label:'Ambition & work',hint:'More career, skill and professional turning points'},
 {id:'security',label:'Money & stability',hint:'More choices about financial resilience and independence'},
 {id:'discovery',label:'Adventure & discovery',hint:'More creative, cultural and exploratory events'},
 {id:'wellbeing',label:'Health & balance',hint:'More recovery, wellbeing and everyday-life decisions'}
];
export const emptyFlow=()=>({version:1,focus:'balanced',recent:[],chapters:[],archive:[],
  yearsSeen:0,choices:0,quietWins:0,lastDecisionAge:null});
export const flowState=s=>s.flow||emptyFlow();
const flow=s=>(s.flow??=emptyFlow());
const stage=age=>age<6?'Early childhood':age<13?'Growing up':age<18?'Teen years':
 age<26?'Finding your way':age<40?'Building a life':age<60?'Midlife choices':
 age<76?'Legacy years':'Later chapters';
const themeFor=category=>{
 if(['relationship','family','story','saga','people','parenting'].includes(category))return 'relationships';
 if(['career','business','politics','fame','work','performance'].includes(category))return 'career';
 if(['money','finance','property','investing'].includes(category))return 'security';
 if(['travel','creative','cultural','discovery','adventure','journey','world'].includes(category))return 'discovery';
 if(['health','personal','childhood','legacy','pets'].includes(category))return 'wellbeing';
 return 'balanced';
};
const finiteCash=s=>Math.max(0,Math.round(s.cash||0));
const hardship=s=>s.age>=18&&((s.annual?.balance??0)<-1800||(s.debt||0)>Math.max(14000,(s.annual?.salary||0)*.7));
const latest=s=>(flowState(s).recent||[]).at(-1)||null;
export function flowEventWeight(s,e,category){
 const f=flowState(s),now=s.age,recent=f.recent||[],mapped=themeFor(category);
 let multiplier=1;
 const lastSame=recent.slice().reverse().find(x=>x.category===category);
 if(lastSame){
  const ago=now-lastSame.age;
  multiplier*=ago<=1?.34:ago<=3?.65:ago<=6?.86:1;
 }
 if(recent.some(x=>x.id===e.id&&now-x.age<=12))multiplier*=.15;
 if(recent.slice(-4).filter(x=>x.theme===mapped).length>=3&&mapped!=='balanced')multiplier*=.55;
 if(f.focus!=='balanced')multiplier*=f.focus===mapped?1.85:.88;
 if(s.goal==='family'&&mapped==='relationships')multiplier*=1.28;
 if(s.goal==='wealth'&&(mapped==='security'||mapped==='career'))multiplier*=1.26;
 if(s.job&&mapped==='career')multiplier*=1.13;
 if(s.people?.some(p=>p.alive&&p.role==='child')&&mapped==='relationships')multiplier*=1.12;
 if((s.stats?.stress||0)>=75){
  if(['wellbeing','relationships'].includes(mapped))multiplier*=1.6;
  if((e.trial||['saga','journey'].includes(e.category))&&mapped!=='wellbeing')multiplier*=.72;
 }
 if((s.stats?.health??100)<=30&&mapped==='wellbeing')multiplier*=1.45;
 if(hardship(s)&&mapped==='security')multiplier*=1.5;
 if(s.age<18&&e.origin==='dramatic')multiplier*=.84;
 const options=e.choices||[];
 const harsh=options.length>0&&options.every(c=>{
  const v=c.effects||{},cash=v.cash||0,debt=v.debt||0,stress=v.stress||0,health=v.health||0;
  return stress>=7||health<=-7||cash<=-900||debt>=1000;
 });
 // Reduce unavoidable stacked hardship without removing player agency or rewriting event effects.
 if(harsh&&((s.stats?.stress||0)>=70||(s.stats?.health??100)<=30||hardship(s)))multiplier*=.32;
 return cap(multiplier,.08,3.2);
}
export function flowRecordChoice(s,e,category,choice){
 const f=flow(s),theme=themeFor(category),record={
  id:e.id,age:s.age,category,theme,title:e.title,choice:choice.text
 };
 f.recent.push(record);f.recent=f.recent.slice(-14);f.choices++;
 f.lastDecisionAge=s.age;
 const previous=f.chapters.at(-1);
 if(previous&&previous.theme===theme&&previous.endAge>=s.age-3){
  previous.endAge=s.age;previous.count++;previous.lastTitle=e.title;
  previous.lastChoice=choice.text;
 }else{
  f.chapters.push({id:'beat-'+s.generation+'-'+f.choices,theme,firstTitle:e.title,
   lastTitle:e.title,firstAge:s.age,endAge:s.age,count:1,lastChoice:choice.text});
  f.chapters=f.chapters.slice(-20);
 }
 return record;
}
export function flowYear(s){
 const f=s.flow;
 if(!f)return;
 f.yearsSeen++;
 if(s.age>=18&&(s.stats?.stress||0)<=28&&(s.stats?.health||0)>=78&&(s.debt||0)<=2000)f.quietWins++;
}
export function flowSetFocus(s,id){
 if(!flowThemes.some(x=>x.id===id))throw Error('Unknown story focus.');
 const copy=JSON.parse(JSON.stringify(s));
 if(!copy.alive)throw Error('This life has ended.');
 flow(copy).focus=id;return copy;
}
function bestFamily(s){
 return (s.people||[]).filter(p=>p.alive).sort((a,b)=>{
  const priority=p=>p.role==='partner'?0:p.role==='child'?1:p.role==='parent'?2:p.role==='friend'?3:4;
  return priority(a)-priority(b)||a.bond-b.bond||a.id-b.id;
 })[0]||null;
}
export function flowPrompt(s,e,category,text,jobTitle=null){
 if(!s.flow&&s.age<6)return text;
 const theme=themeFor(category),human=bestFamily(s);
 let detail='';
 if(theme==='relationships'&&human){
  const role=human.role==='child'?'child':human.role==='partner'?'partner':human.role==='parent'?'parent':'person close to you';
  detail='At home, '+human.name+' ('+role+') is part of what you stand to protect.';
 }else if(theme==='career'&&s.job){
  detail='You currently work as '+(jobTitle||'a professional')+
   ' at career level '+(s.job.level+1)+'.';
 }else if(theme==='security'&&s.age>=18){
  detail='Your current spendable cash is $'+finiteCash(s).toLocaleString('en-US')+
   (s.annual?.balance<0?' after a difficult financial year.':'.');
 }else if(theme==='wellbeing'&&(s.stats?.stress||0)>=60){
  detail='Your stress is currently '+s.stats.stress+'/100, so your next choices carry extra weight.';
 }else if(theme==='discovery'&&s.world?.travel?.stamps?.length){
  detail='Your previous journeys still shape what you want to explore next.';
 }
 const previous=(flowState(s).recent||[]).slice().reverse().find(x=>x.category===category&&x.age<s.age);
 if(!detail&&previous&&s.age-previous.age<=10)
  detail='You remember choosing "'+previous.choice+'" during '+previous.title+'.';
 return detail?text+'\n\n'+detail:text;
}
const score=(c)=>c?.enabled?1:0;
export function flowGuidance(s,commands){
 const enabled=(commands||[]).filter(c=>c.enabled),find=id=>enabled.find(c=>c.id===id),
  prefix=p=>enabled.find(c=>c.id.startsWith(p));
 const pool=[],used=new Set();
 function offer(c,reason,rank){
  if(!score(c)||used.has(c.id))return;
  pool.push({id:c.id,label:c.label,reason,rank});used.add(c.id);
 }
 if(s.age<18){
  offer(find('learn'),'Build knowledge that will matter as an adult',80);
  offer(find('exercise'),'Protect your health early',65);
  const school=prefix('scene:start:school');
  offer(school,'A school story can create lasting memories',75);
 }else{
  if((s.stats?.stress||0)>=60)offer(find('rest'),'Your stress is high; give yourself time to recover',95);
  if((s.stats?.health||100)<=55)offer(find('exercise'),'Your health needs attention',90);
  if(s.annual?.balance<0)offer(find('budget:frugal'),'Last year cost more than you earned; review expenses',92);
  if((s.debt||0)>5000)offer(prefix('repay:'),'Reduce your debt and future interest',83);
  if(s.job){
   offer(find('work'),'Make progress in your current career',s.flow?.focus==='career'?88:64);
   offer(find('careertrain'),'Build skills for long-term career growth',s.flow?.focus==='career'?90:70);
  }else{
   const work=enabled.filter(c=>c.id.startsWith('job:')).sort((a,b)=>{
    const p=Number(a.id.split(':')[1]),q=Number(b.id.split(':')[1]);
    return p-q;
   })[0];
   offer(work,'A stable job opens new stories and income',87);
  }
  offer(find('volunteer'),'Build community trust and stronger relationships',s.flow?.focus==='relationships'?82:58);
  offer(prefix('pulse:continue'),'Return to a regional story already in progress',98);
  offer(prefix('family:continue'),'A family commitment is ready for its next chapter',99);
  offer(prefix('workplace:continue'),'A professional promise is ready to continue',98);
  offer(prefix('episode:start:'),'A relationship storyline is available now',94);
  offer(prefix('ripple:continue'),'An earlier decision is ready to return',96);
 }
 const p=bestFamily(s);
 if(p)offer(find('visit:'+p.id),'Spend meaningful time with '+p.name,75);
 if((s.stats?.stress||0)>=50)offer(find('rest'),'A small recovery helps you keep moving',68);
 if(s.flow?.focus==='discovery')offer(prefix('world:travel:'),'Explore another place and culture',84);
 const ranked=pool.sort((a,b)=>b.rank-a.rank||a.id.localeCompare(b.id));
 const chosen=[],groups=new Set();
 for(const option of ranked){
  const kind=option.id.split(':')[0],group=kind==='careertrain'||kind==='work'?'work':
   kind==='rest'||kind==='exercise'?'wellbeing':
   kind==='visit'||kind==='volunteer'?'people':
   kind==='budget'||kind==='repay'?'security':kind;
  if(groups.has(group))continue;
  chosen.push({...option,rank:undefined});groups.add(group);
  if(chosen.length===3)break;
 }
 return chosen;
}
export function flowSummary(s,commands=[]){
 const f=flowState(s),stress=s.stats?.stress||0,pressure=stress>=78?'High':stress>=50?'Elevated':'Steady',
  moneyRisk=hardship(s),age=s.age,focus=flowThemes.find(x=>x.id===f.focus)||flowThemes[0];
 const last=latest(s),active=s.worldPulse?.active||s.familyStories?.active||s.workplace?.active||null,
  unread=(s.worldPulse?.active?.status==='waiting'&&s.worldPulse.active.nextAge<=age)
  ||(s.familyStories?.active?.status==='waiting'&&s.familyStories.active.nextAge<=age);
 const latestChapters=f.chapters.slice(-4).reverse();
 return {focus:f.focus,focusLabel:focus.label,stage:stage(age),pressure,moneyRisk,
  latest:last?{...last}:null,recent:f.recent.slice(-5).reverse(),
  chapters:latestChapters,summary:{choices:f.choices,years:f.yearsSeen,quietYears:f.quietWins},
  suggested:flowGuidance(s,commands),headline:active?.status==='ready'?'Complete your active story before advancing':
   unread?'A past story is ready for a new chapter':
   moneyRisk?'Stability matters this year':
   stress>=75?'Make room for recovery':
   f.focus==='relationships'?'The people in your life matter':
   f.focus==='career'?'Your career can open new possibilities':
   f.focus==='security'?'Small choices protect your future':
   f.focus==='discovery'?'The world can still surprise you':'Choose what matters this year',
  note:moneyRisk?'Your last annual balance or outstanding debt suggests reviewing finances.':
   stress>=75?'Your next event is chosen with less unavoidable hardship, but your decisions still matter.':
   'The story director favors new events, remembers earlier choices and respects your preferred focus.'};
}
export function flowInheritance(next,old){
 const previous=old.flow;if(!previous)return;
 const f=flow(next);
 f.archive=[...(previous.archive||[]),
  ...previous.chapters.slice(-6).map(x=>({...x,sourceLife:old.name}))].slice(-30);
 f.recent=[];f.chapters=[];f.yearsSeen=0;f.choices=0;f.quietWins=0;f.lastDecisionAge=null;
 f.focus='balanced';
}
