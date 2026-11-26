// Lifely original multi-year Personal Ambitions. Deterministic, bounded, offline and save-compatible.
// Concrete actions from the existing simulation advance ambitions; no arbitrary button-mashing points.
const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
const specs=[
 {id:'wellness',name:'Build a healthier life',icon:'♥',category:'wellbeing',minAge:8,story:'Small habits become the kind of strength nobody notices until it matters.',conclusion:'Your persistence changed how you care for yourself.',stat:'health',
  steps:[['actions','exercise',3,'Exercise three times'],['stat','health',80,'Raise your health to 80'],['lowStat','stress',50,'Keep stress at 50 or below']]},
 {id:'scholar',name:'Become a lifelong learner',icon:'✦',category:'learning',minAge:10,story:'Prove that curiosity can grow into knowledge you will carry into adulthood.',conclusion:'The things you learned have begun to open new doors.',stat:'knowledge',
  steps:[['actions','learn',3,'Study independently three times'],['stat','knowledge',75,'Reach 75 knowledge'],['skill','technical',16,'Develop technical skill to 16']]},
 {id:'friendships',name:'Build a circle you can trust',icon:'♡',category:'relationships',minAge:10,story:'Friendships need more than invitations; they need years of deliberate care.',conclusion:'You now have people who know you will show up.',stat:'social',
  steps:[['actions','visit',4,'Make four personal visits'],['bonds',75,2,'Maintain two bonds of at least 75'],['stat','social',60,'Reach 60 social confidence']]},
 {id:'community',name:'Make your neighborhood better',icon:'✳',category:'relationships',minAge:12,story:'You want to become someone who makes ordinary places feel safer and kinder.',conclusion:'The community notices the difference you made.',stat:'reputation',
  steps:[['actions','volunteer',4,'Volunteer on four occasions'],['stat','kindness',75,'Reach 75 kindness'],['stat','reputation',60,'Build 60 reputation']]},
 {id:'hobby-explorer',name:'Find your unexpected talent',icon:'♟',category:'hobbies',minAge:12,story:'Try doing something for the simple pleasure of getting better at it.',conclusion:'What began as practice became part of your identity.',stat:'confidence',
  steps:[['delta','hobbySessions',3,'Finish three playable hobby sessions'],['hobbyMastery',45,1,'Reach 45 mastery in one hobby'],['delta','hobbyWins',1,'Win a hobby competition']]},
 {id:'creator',name:'Create something remembered',icon:'♫',category:'creativity',minAge:16,story:'Turn small creative experiments into something others may remember.',conclusion:'Your work has finally become more than an unfinished idea.',stat:'creativity',
  steps:[['actions','create',3,'Make time for creative work three times'],['stat','creativity',70,'Reach 70 creativity'],['delta','projects',1,'Publish a completed creative project']]},
 {id:'career',name:'Become a trusted professional',icon:'▤',category:'work',minAge:18,requires:'job',story:'You want colleagues to depend on the work you do, not merely your title.',conclusion:'The work you put in is visible to the people around you.',stat:'performance',
  steps:[['actions','work',4,'Train or work seriously four times'],['stat','performance',70,'Achieve 70 performance'],['delta','jobLevel',1,'Advance one job level']]},
 {id:'financial',name:'Build real financial breathing room',icon:'◇',category:'money',minAge:18,story:'A steady plan matters more than a single fortunate year.',conclusion:'You earned more room to make your own decisions.',stat:'confidence',
  steps:[['actions','save',2,'Make two deposits into savings'],['delta','netWorth',15000,'Grow net worth by $15,000'],['cash',3000,1,'Keep at least $3,000 in cash']]},
 {id:'enterprise',name:'Grow a business worth trusting',icon:'▥',category:'money',minAge:18,requires:'business',story:'A company can grow without losing the quality that made it worth creating.',conclusion:'Your company has become more capable and dependable.',stat:'reputation',
  steps:[['actions','company',3,'Make three company management decisions'],['business','employees',2,'Build a team of at least two'],['business','quality',75,'Bring product quality to 75']]},
 {id:'explorer',name:'Give the world a chance',icon:'✧',category:'travel',minAge:18,story:'Travel begins as unfamiliar places and becomes a different way of seeing life.',conclusion:'New places changed what you think home can mean.',stat:'social',
  steps:[['delta','stamps',2,'Explore two new destinations'],['delta','relocations',1,'Experience a relocation'],['stat','social',60,'Develop 60 social confidence']]},
 {id:'family',name:'Become someone family can rely on',icon:'⌂',category:'relationships',minAge:18,story:'Family history is built out of the times people chose to be present.',conclusion:'Your family remembers how consistently you showed up.',stat:'kindness',
  steps:[['actions','visit',4,'Spend time with relatives or friends four times'],['bonds',80,2,'Build two close bonds of at least 80'],['family',1,1,'Have an active partner or living child']]},
 {id:'mediator',name:'Learn how to resolve conflict',icon:'⚖',category:'relationships',minAge:16,story:'It takes patience to hear a difficult story from more than one perspective.',conclusion:'You earned the trust to handle uncomfortable conversations.',stat:'reputation',
  steps:[['delta','storyEpisodes',1,'Finish an original character conflict'],['actions','dialogue',2,'Begin two personal conversations'],['stat','kindness',65,'Reach 65 kindness']]},
 {id:'resilience',name:'Find calm in a noisy world',icon:'☼',category:'wellbeing',minAge:14,story:'Strength is not having no problems; it is learning what you can recover from.',conclusion:'You now know how to find your balance when life changes.',stat:'happiness',
  steps:[['actions','rest',3,'Make recovery a priority three times'],['stat','happiness',75,'Reach 75 happiness'],['lowStat','stress',35,'Lower stress to 35 or below']]},
 {id:'mentor',name:'Become a source of guidance',icon:'✺',category:'relationships',minAge:30,story:'People who helped you once are becoming people you can help in return.',conclusion:'Others have begun to find courage in your example.',stat:'kindness',
  steps:[['actions','volunteer',2,'Give back to your community twice'],['stat','social',75,'Reach 75 social'],['stat','kindness',80,'Reach 80 kindness']]},
 {id:'champion',name:'Chase a genuine championship',icon:'★',category:'hobbies',minAge:12,story:'Rivals are becoming better. So must you.',conclusion:'You earned this title through preparation and good decisions.',stat:'confidence',
  steps:[['delta','hobbyWins',2,'Win two hobby competitions'],['delta','hobbyTrophies',1,'Collect a new hobby trophy'],['hobbyMastery',65,1,'Reach 65 mastery in a hobby']]},
 {id:'spotlight',name:'Make your creative voice heard',icon:'✿',category:'creativity',minAge:18,story:'An audience grows when you keep making something worth sharing.',conclusion:'People are coming back because your work means something to them.',stat:'creativity',
  steps:[['delta','projects',2,'Publish two creative projects'],['audience',1000,1,'Grow an audience to 1,000'],['stat','creativity',80,'Reach 80 creativity']]}
];
export const ambitionTypes=specs.map(({id,name,icon,category,minAge,requires,story})=>({id,name,icon,category,minAge,requires,story}));
export const emptyAmbitions=()=>({version:1,active:null,completed:[],unfulfilled:[],ancestral:[],announcements:[],lastStartAge:null,started:0});
export const ambitionState=s=>s.ambitions||emptyAmbitions();
const ensure=s=>(s.ambitions??=emptyAmbitions());
function metrics(s,worth){
 const profiles=Object.values(s.hobbyCircuit?.disciplines||{});
 return {hobbySessions:profiles.reduce((sum,p)=>sum+(p.practice||0)+(p.contests||0),0),
  hobbyWins:profiles.reduce((sum,p)=>sum+(p.wins||0),0),hobbyTrophies:profiles.reduce((sum,p)=>sum+(p.trophies||0),0),
  projects:s.projects||0,relocations:s.relocations||0,stamps:s.world?.travel?.stamps?.length||0,
  storyEpisodes:(s.world?.storyDirector?.completed||[]).length,jobLevel:s.job?.level||0,
  netWorth:worth(s),audience:s.audience||0};
}
function eligible(s,def){return s.age>=def.minAge&&s.age<=96&&(def.requires!=='job'||!!s.job)&&(def.requires!=='business'||!!s.business);}
function actorFor(s){
 const close=(s.people||[]).filter(p=>p.alive&&p.age>=7&&p.bond>=40);
 return close.sort((a,b)=>b.bond-a.bond)[0]||null;
}
function snapshotStep(s,goal,step,worth){
 const [kind,key,target,label]=step,initial=goal.baseline||{},live=metrics(s,worth);let current=0,need=target,out='';
 if(kind==='actions')current=goal.counts?.[key]||0;
 if(kind==='stat')current=s.stats[key]||0;
 if(kind==='skill')current=s.skills?.[key]||0;
 if(kind==='lowStat'){current=s.stats[key]||0;need=0;}
 if(kind==='delta')current=Math.max(0,(live[key]||0)-(initial[key]||0));
 if(kind==='hobbyMastery')current=Math.max(0,...Object.values(s.hobbyCircuit?.disciplines||{}).map(p=>p.mastery||0));
 if(kind==='bonds'){current=(s.people||[]).filter(p=>p.alive&&p.bond>=key).length;need=target;}
 if(kind==='cash')current=s.cash||0;
 if(kind==='audience')current=s.audience||0;
 if(kind==='business')current=s.business?.[key]||0;
 if(kind==='family')current=(s.people||[]).filter(p=>p.alive&&(p.role==='partner'||p.role==='child')).length;
 if(kind==='hobbyMastery'||kind==='cash'||kind==='audience')need=key;
 const achieved=kind==='lowStat'?current<=target:current>=need;
 const progress=kind==='lowStat'?clamp((100-current)/Math.max(1,100-target)*100):clamp(current/Math.max(1,need)*100);
 out=kind==='lowStat'?'Current '+current+' · target ≤'+target:
  kind==='delta'&&key==='netWorth'?'Gained $'+Math.round(current).toLocaleString('en-US')+' of $'+Math.round(need).toLocaleString('en-US'):
  Math.round(current).toLocaleString('en-US')+' / '+Math.round(need).toLocaleString('en-US');
 return {label,kind,achieved,progress,detail:out,actual:current,target:kind==='lowStat'?target:need};
}
function resolveSteps(s,a,ctx){
 const def=specs.find(x=>x.id===a.id);if(!def)return [];
 const steps=def.steps.map(step=>snapshotStep(s,a,step,ctx.worth));
 for(let i=0;i<steps.length;i++){
  if(steps[i].achieved&&!a.milestones.includes(i)){
   a.milestones.push(i);
   ctx.add(s,'Personal ambition: '+steps[i].label+' achieved.','milestone');
  }
 }
 return steps;
}
function archive(s,a,status,ctx){
 const book=ensure(s),def=specs.find(x=>x.id===a.id);
 const snapshot={id:a.id,name:def.name,icon:def.icon,startedAge:a.startedAge,endedAge:s.age,deadline:a.dueAge,
  status,chapter:a.path,mentor:a.mentor,steps:a.milestones.slice(),bonus:a.bonus||0,history:a.history.slice(),sourceLife:s.name};
 if(status==='completed'){
  const payout=(s.age>=18?500:100)+(a.bonus||0);
  s.cash+=payout;
  ctx.change(s,def.stat,5);ctx.change(s,'happiness',4);
  if(a.path==='support'&&a.mentorId){
   const p=(s.people||[]).find(p=>'person-'+p.id===a.mentorId&&p.alive);
   if(p)ctx.bond(s,p,4,'A shared long-term dream came true');
  }
  snapshot.reward=payout;
  book.completed.push(snapshot);book.completed=book.completed.slice(-24);
  const notice=def.conclusion+' '+(a.mentor?'You shared the journey with '+a.mentor+'. ':'')+'Reward: $'+payout.toLocaleString('en-US')+'.';
  book.announcements.push({age:s.age,text:notice,status:'completed'});
  ctx.add(s,'Ambition completed: '+def.name+'. '+notice,'milestone');
 }else{
  book.unfulfilled.push(snapshot);book.unfulfilled=book.unfulfilled.slice(-24);
  const reason=status==='expired'?'The years passed before you met all three milestones.':'You decided that another future mattered more.';
  const text=def.name+': '+reason;
  book.announcements.push({age:s.age,text,status});
  ctx.add(s,'Ambition ended: '+text,'milestone');
 }
 book.active=null;book.announcements=book.announcements.slice(-25);
 return snapshot;
}
export function ambitionRefresh(s,ctx){
 const a=s.ambitions?.active;if(!a||!s.alive)return null;
 const steps=resolveSteps(s,a,ctx);
 if(steps.every(x=>x.achieved))return archive(s,a,'completed',ctx);
 return null;
}
export function ambitionYear(s,ctx){
 const a=s.ambitions?.active;if(!a||!s.alive)return;
 const completed=ambitionRefresh(s,ctx);if(completed)return;
 if(s.age>=a.dueAge){archive(s,a,'expired',ctx);return;}
 const elapsed=s.age-a.startedAge;
 if(elapsed===3){
  const remaining=3-a.milestones.length;
  const text=(a.mentor||'You')+' reflected on '+specs.find(x=>x.id===a.id).name.toLowerCase()+
   '. '+remaining+' milestone'+(remaining===1?' remains.':'s remain.');
  a.history.push({age:s.age,text});a.history=a.history.slice(-6);
  ensure(s).announcements.push({age:s.age,text,status:'midpoint'});
  ensure(s).announcements=ensure(s).announcements.slice(-25);
  ctx.add(s,text,'milestone');
 }
}
const actionKind=id=>{
 const [cmd,detail]=id.split(':');
 if(cmd==='exercise'||cmd==='rest'||cmd==='learn'||cmd==='create'||cmd==='volunteer'||cmd==='visit'||cmd==='publish'||cmd==='save')return cmd;
 if(cmd==='work'||cmd==='careertrain')return 'work';
 if(cmd==='company'||(cmd==='business'&&detail==='improve'))return 'company';
 if(cmd==='dialogue'&&detail==='open')return 'dialogue';
 return null;
};
export function ambitionTrack(s,id){
 const active=s.ambitions?.active;if(!active)return;
 const kind=actionKind(id);if(!kind)return;
 active.counts[kind]=(active.counts[kind]||0)+1;
}
export function ambitionCommands(s){
 if(!s.alive||s.pending!==null||s.mini||s.careerCampaigns?.active||s.everydayScenes?.active||s.world?.network?.conversation||s.world?.storyDirector?.active||s.hobbyCircuit?.active||(s.justice?.years||0)>0)return [];
 const book=ambitionState(s),available=s.actions>0;
 if(!book.active){
  return specs.filter(def=>eligible(s,def)).map(def=>({id:'ambition:begin:'+def.id,label:'Commit to '+def.name,
   detail:'A personal six-year story · three real milestones',enabled:available}));
 }
 const a=book.active;
 const out=[];
 if(!a.path&&s.age>=a.startedAge+2&&s.age<a.dueAge){
  out.push({id:'ambition:turn:steady',label:'Build a sustainable plan',detail:'Stay steady · reduce stress by 5',enabled:available});
  out.push({id:'ambition:turn:bold',label:'Take an ambitious leap',detail:'Invest $1,000 for a larger completion reward · +3 stress',enabled:available&&s.age>=18&&s.cash>=1000});
  if(a.mentorId)out.push({id:'ambition:turn:support',label:'Ask '+a.mentor+' to join you',detail:'Build a shared bond and +3 kindness',enabled:available});
 }
 out.push({id:'ambition:retire',label:'Release this ambition',detail:'End the current story without erasing its history',enabled:available});
 return out;
}
export function ambitionAct(s,id,ctx){
 const command=ambitionCommands({...s,actions:s.actions+1}).find(x=>x.id===id&&x.enabled);
 if(!command)throw Error('Ambition action is unavailable.');
 const [,operation,arg]=id.split(':'),book=ensure(s);
 if(operation==='begin'){
  const def=specs.find(x=>x.id===arg);if(!def||book.active)throw Error('Invalid personal ambition.');
  const mentor=actorFor(s);
  const baseline=metrics(s,ctx.worth);
  book.active={id:def.id,startedAge:s.age,dueAge:s.age+6,baseline,counts:{},milestones:[],path:null,bonus:0,
   mentorId:mentor?'person-'+mentor.id:null,mentor:mentor?.name||null,history:[]};
  book.started=(book.started||0)+1;book.lastStartAge=s.age;
  ctx.add(s,'New ambition: '+def.name+'. '+def.story,'milestone');
  ambitionRefresh(s,ctx);
  return;
 }
 const a=book.active;if(!a)throw Error('No active ambition.');
 if(operation==='retire'){archive(s,a,'abandoned',ctx);return;}
 if(operation!=='turn'||a.path||!['steady','bold','support'].includes(arg))throw Error('Invalid ambition turning point.');
 a.path=arg;
 let text='';
 if(arg==='steady'){ctx.change(s,'stress',-5);text='You chose the sustainable path, making space to grow without burning out.';}
 if(arg==='bold'){s.cash-=1000;ctx.change(s,'stress',3);a.bonus=1700;text='You invested $1,000 in the goal and accepted the pressure of an uncertain leap.';}
 if(arg==='support'){
  const p=(s.people||[]).find(p=>'person-'+p.id===a.mentorId&&p.alive);
  if(p)ctx.bond(s,p,8,'Worked together on a personal ambition');
  ctx.change(s,'kindness',3);a.bonus=250;
  text='You invited '+a.mentor+' into your plan; your relationship will shape how this story ends.';
 }
 a.history.push({age:s.age,text});ctx.add(s,text,'milestone');
 ambitionRefresh(s,ctx);
}
export function ambitionSummary(s,worth){
 const book=ambitionState(s),a=book.active;const available=specs.filter(d=>eligible(s,d));
 const recommended=available.slice().sort((x,y)=>{
  const points=d=>(s.goal==='family'&&d.category==='relationships'?5:0)+
   (s.goal==='wealth'&&d.category==='money'?5:0)+
   (s.goal==='balance'&&d.category==='wellbeing'?5:0)+
   (d.category==='work'&&s.job?3:0)+
   (d.category==='hobbies'&&Object.keys(s.hobbyCircuit?.disciplines||{}).length?3:0)+
   (d.category==='creativity'&&s.stats.creativity>=65?3:0);
  return points(y)-points(x)||x.minAge-y.minAge||x.name.localeCompare(y.name);
 });
 const def=a?specs.find(d=>d.id===a.id):null;
 const ctx={worth};
 const steps=a?def.steps.map(x=>snapshotStep(s,a,x,worth)):[];
 return {active:a?{...a,name:def.name,icon:def.icon,story:def.story,category:def.category,steps,progress:Math.round(steps.filter(x=>x.achieved).length/3*100),
  yearsLeft:Math.max(0,a.dueAge-s.age)}:null,
  available:recommended.map(d=>({id:d.id,name:d.name,icon:d.icon,category:d.category,story:d.story,minAge:d.minAge})),
  completed:(book.completed||[]).slice(-8).reverse(),unfulfilled:(book.unfulfilled||[]).slice(-5).reverse(),
  ancestral:(book.ancestral||[]).slice(-8).reverse(),news:(book.announcements||[]).slice(-3).reverse(),
  totals:{started:book.started||0,completed:(book.completed||[]).length,unfulfilled:(book.unfulfilled||[]).length}};
}
export function ambitionInheritance(next,old){
 const p=old.ambitions;if(!p)return;
 const book=ensure(next);
 book.ancestral=[...(p.ancestral||[]),...(p.completed||[]).map(x=>({...x,sourceLife:old.name}))].slice(-16);
 book.completed=[];book.unfulfilled=[];book.active=null;book.announcements=[];book.started=0;book.lastStartAge=null;
}
