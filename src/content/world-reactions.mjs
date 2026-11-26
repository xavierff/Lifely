// Lifely 1.12 — regional economy, causal world projects, and intergenerational rival houses.
// Purely fictional markets and institutions. No network, external data, or real-world advice.
const clamp=n=>Math.max(0,Math.min(100,Math.round(n||0)));
const within=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
const money=n=>Math.max(0,Math.round(n||0));
export const pulseSectors=[
 {id:'technology',name:'Innovation & research',focus:'technical',industries:['Technology & data','Science & engineering']},
 {id:'care',name:'Education & care',focus:'communication',industries:['Healthcare & care','Education & society','Public & legal']},
 {id:'trade',name:'Infrastructure & resources',focus:'technical',industries:['Trades & construction','Transport & logistics','Nature & agriculture']},
 {id:'culture',name:'Culture & hospitality',focus:'art',industries:['Creative & media','Service & hospitality']},
 {id:'commerce',name:'Commerce & finance',focus:'communication',industries:['Retail & administration','Finance & enterprise']}
];
export const pulseCountries=['United States','Indonesia','Japan','Canada','United Kingdom','Australia'];
const houses=[
 {id:'aster',name:'Aster House',field:'technology',motto:'Progress at any price',style:'ambitious'},
 {id:'marrow',name:'Marrow Circle',field:'commerce',motto:'Every deal leaves a legacy',style:'calculating'},
 {id:'cedar',name:'Cedar Union',field:'trade',motto:'Build something people can rely on',style:'principled'}
];
export const pulseHouses=houses.map(x=>({...x}));
const stories={
 technology:{title:'The prototype that could reshape the district',story:'A regional technology initiative needs people who will defend both accuracy and access.',
 chapters:[
  {title:'A promise before the proof',body:'A promising prototype could create jobs, but a rival house wants a launch announcement before anyone checks how it works.',choices:['Invite independent testing and listen to users','Prototype a careful rollout with measurable safeguards','Rush the launch and claim credit before your rivals']},
  {title:'A public failure',body:'Two years later a crucial test fails. Engineers and families disagree about whether to stop or keep going.',choices:['Listen to the people affected and share the setback','Rebuild the design and publish a realistic deadline','Blame the technicians to protect your reputation']},
  {title:'Who benefits from the breakthrough?',body:'The regional project is ready. The people who built it worry that only famous sponsors will benefit.',choices:['Make the benefits available to the wider community','Present a documented, scalable access plan','Give your own circle the first benefits and hide the tradeoffs']}]},
 care:{title:'The district that needed its public services',story:'A community must decide what matters when the promise of care exceeds the available staff.',
 chapters:[
  {title:'The overstretched center',body:'People are waiting for education and care support, while a powerful rival wants one showcase project.',choices:['Talk with staff and residents about what is missing','Map actual capacity and design a fair service schedule','Promise the largest new center with no funding plan']},
  {title:'A difficult allocation',body:'Two years later the program must serve several neighborhoods with different needs.',choices:['Bring families and service workers into the decision','Compare access, staffing and travel times carefully','Favor the neighborhood that gives you the most publicity']},
  {title:'The review meeting',body:'A community hearing asks whether the project improved everyday life and how the next team can maintain it.',choices:['Give credit to everyone who contributed','Show the verified outcomes and the remaining gaps','Dismiss criticism and demand public recognition']}]},
 trade:{title:'The infrastructure project that tested a town',story:'A complicated regional investment creates jobs, risks, and a lasting obligation to future residents.',
 chapters:[
  {title:'The ambitious contract',body:'An old bridge and transit network need work. A rival offers to skip checks to get started first.',choices:['Hear the crews and neighbors before choosing a route','Inspect the project plan and schedule quality controls','Approve the shortcut and advertise your speed']},
  {title:'The unexpected shortage',body:'Two years later a supply delay threatens construction, safe working hours and the region’s confidence.',choices:['Coordinate suppliers and offer transparent updates','Revise the technical schedule and record the risks','Force the workers to hide delays from the public']},
  {title:'A project for the next generation',body:'The work is complete, but maintenance and equal access will determine whether it lasts.',choices:['Include the whole community in its future use','Create a practical maintenance and training plan','Claim the credit and ignore future repair costs']}]},
 culture:{title:'A city looking for its own voice',story:'Local creators and small venues want a future that respects their work rather than only attention.',
 chapters:[
  {title:'The festival proposal',body:'A citywide cultural project is proposed. A rival house wants the most famous performers and nothing else.',choices:['Invite overlooked artists and neighborhood groups','Build a viable calendar with shared production costs','Make the event a personal publicity campaign']},
  {title:'The venue under pressure',body:'Two years later several independent venues struggle with cost and competition.',choices:['Listen to the smaller operators and their audiences','Redesign promotion and find a sustainable mix','Take over their programming without agreement']},
  {title:'The culture that remains',body:'The festival succeeds or fails based on whether its people still have opportunities next year.',choices:['Share the platform and acknowledge collaborators','Publish transparent outcomes and maintain a fair program','Close the doors to newcomers and reward your allies']}]},
 commerce:{title:'The market street nobody could agree on',story:'Independent businesses and workers confront a changing local economy and conflicting priorities.',
 chapters:[
  {title:'The empty storefronts',body:'A market street is losing businesses, while a rival proposes large incentives for a few powerful firms.',choices:['Listen to shop owners and local workers','Test a careful plan for pricing, rents and demand','Promise a boom by hiding the likely costs']},
  {title:'A sudden price shock',body:'Two years later supply costs rise and smaller businesses cannot keep pace.',choices:['Bring customers, suppliers and workers together','Revise budgets and coordinate reliable delivery','Shift all the risk onto the smallest operators']},
  {title:'Who gets to prosper?',body:'The local market is finally recovering. Your rival wants to decide which businesses deserve the new opportunities.',choices:['Support fair participation and shared learning','Publish objective criteria and an accountable plan','Reserve the opportunities for your own contacts']}]}
};
const headlineTemplates=[
 {sector:'technology',direction:1,title:'Community research labs expand their training',description:'A wave of practical research partnerships is improving access to skilled work.'},
 {sector:'technology',direction:-1,title:'Regional prototype funding stalls',description:'Several laboratories are delaying projects after a difficult review.'},
 {sector:'technology',direction:1,title:'Small software teams win new contracts',description:'Independent technical teams are finding a larger market for careful work.'},
 {sector:'technology',direction:-1,title:'Data infrastructure needs urgent repair',description:'A system outage is weighing on firms that depend on reliable technology.'},
 {sector:'care',direction:1,title:'Neighborhood learning networks expand',description:'Educators and care workers have opened more collaborative services.'},
 {sector:'care',direction:-1,title:'Staff shortages strain community services',description:'Demand is rising faster than available education and care staffing.'},
 {sector:'care',direction:1,title:'Local clinics and schools share new resources',description:'Cooperation is improving capacity and accessibility across the district.'},
 {sector:'care',direction:-1,title:'Public service budgets come under pressure',description:'Several planned services are being postponed while funding is reviewed.'},
 {sector:'trade',direction:1,title:'Infrastructure upgrades support new work',description:'Trade and transport teams are finding demand for skilled work.'},
 {sector:'trade',direction:-1,title:'A supply disruption slows building projects',description:'Construction, logistics and regional suppliers face renewed delays.'},
 {sector:'trade',direction:1,title:'Regional harvest and transport networks recover',description:'Improved coordination is helping small producers and delivery crews.'},
 {sector:'trade',direction:-1,title:'Maintenance delays burden essential routes',description:'Unresolved repairs are reducing the reliability of regional infrastructure.'},
 {sector:'culture',direction:1,title:'Independent arts venues attract new visitors',description:'A lively series of community events is supporting creative work.'},
 {sector:'culture',direction:-1,title:'Smaller venues face a difficult season',description:'Rising operating costs are forcing local organizers to rethink plans.'},
 {sector:'culture',direction:1,title:'Cultural festivals open more local stages',description:'Emerging creators are finding opportunities alongside established acts.'},
 {sector:'culture',direction:-1,title:'Tourism uncertainty challenges hospitality businesses',description:'Visitor patterns are changing faster than some venues can adapt.'},
 {sector:'commerce',direction:1,title:'New local marketplaces increase opportunity',description:'Retail teams and independent financial services see improving demand.'},
 {sector:'commerce',direction:-1,title:'Consumer demand weakens across the region',description:'Small shops and business services are adjusting to a slower market.'},
 {sector:'commerce',direction:1,title:'Local cooperatives find a more reliable supply chain',description:'Smaller operators are keeping more of their customers and workers.'},
 {sector:'commerce',direction:-1,title:'Rising costs weigh on market streets',description:'Businesses are revisiting prices, supplies and staffing as costs increase.'}
];
const sectorsForIndustry=industry=>pulseSectors.find(x=>x.industries.includes(industry))?.id||'commerce';
function hash(...values){
 let h=2166136261;
 const input=values.map(v=>String(v)).join('|');
 for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619);}
 h^=h>>>16;h=Math.imul(h,2246822507);h^=h>>>13;
 return h>>>0;
}
const variance=(min,max,...key)=>min+(hash(...key)%(max-min+1));
const initialRegions=(seed=1)=>pulseCountries.map((name,id)=>({id,name,
 sectors:Object.fromEntries(pulseSectors.map((x,i)=>[x.id,clamp(48+variance(-8,8,seed,id,i,'start'))])),
 lastHeadline:null,history:[]}));
export const emptyWorldPulse=seed=>({version:1,regions:initialRegions(seed),reputation:{community:50,integrity:50,influence:45},
 rivals:houses.map((h,i)=>({...h,standing:clamp(43+variance(-10,10,seed,i,'rival')),
  trust:40,rivalry:35,wins:0,history:[],lastInteractionAge:null})),
 active:null,finished:[],unfulfilled:[],news:[],journal:[],ancestry:[],lastStartAge:null,
 started:0,completed:0,lastYear:null,annual:[]});
export const worldPulseState=s=>s.worldPulse||emptyWorldPulse(s.rng);
const ensure=s=>(s.worldPulse??=emptyWorldPulse(s.rng));
const regionOf=(s,w)=>w.regions[s.country]||w.regions[0];
const measure=(s,sector)=>worldPulseState(s).regions[s.country]?.sectors[sector]??50;
export function worldPulseEconomyMultiplier(s,industry){
 if(!s.worldPulse)return 1;
 const sector=pulseSectors.find(x=>x.id===industry)?industry:sectorsForIndustry(industry);
 return Math.round((.87+measure(s,sector)*.0026)*1000)/1000; // 0.87..1.13
}
export function worldPulseReputationMultiplier(s){
 if(!s.worldPulse)return 1;
 const {community,integrity,influence}=s.worldPulse.reputation;
 return Math.round(within(1+((community+integrity+influence)/3-50)*.0015,.93,1.075)*1000)/1000;
}
const rivalFor=(w,id)=>w.rivals.find(r=>r.id===id);
const sceneFor=arc=>stories[arc.sector]?.chapters[arc.stage];
const blocked=s=>!s.alive||s.age<15||s.pending!==null||!!s.mini||!!s.world?.network?.conversation||
 !!s.careerCampaigns?.active||!!s.everydayScenes?.active||!!s.world?.storyDirector?.active||
 !!s.hobbyCircuit?.active||s.workplace?.active?.status==='ready'||s.familyStories?.active?.status==='ready'||
 (s.justice?.years||0)>0;
function record(s,ctx,text,kind='world',details={}){
 const w=ensure(s);const entry={age:s.age,text,kind,...details};
 w.news.push(entry);w.news=w.news.slice(-30);
 w.journal.push(entry);w.journal=w.journal.slice(-48);
 ctx.add?.(s,text,'world');
}
export function worldPulseCommands(s,careers){
 if(blocked(s))return [];
 const w=worldPulseState(s),out=[],can=s.actions>0;
 const put=(id,label,detail,enabled)=>out.push({id,label,detail,enabled:!!enabled});
 const active=w.active;
 if(active){
  if(active.status==='waiting'&&s.age>=active.nextAge){
   put('pulse:continue','Return to '+stories[active.sector].title,'Chapter '+(active.stage+1)+' of 3 · the region remembers',can);
  }
  if(active.status==='waiting')put('pulse:leave','Step away from '+stories[active.sector].title,
   'End this public commitment and retain the outcome',can);
  return out;
 }
 if(s.age>=18){
  for(const sector of pulseSectors){
   const okay=can&&w.lastStartAge!==s.age;
   put('pulse:begin:'+sector.id,'Start '+stories[sector.id].title,
    'A multi-year regional project · three lasting decisions · '+sector.name,okay);
  }
  for(const rival of w.rivals){
   const canAct=can&&rival.lastInteractionAge!==s.age;
   put('pulse:collaborate:'+rival.id,'Collaborate with '+rival.name,
    'Spend $350 on a shared regional project · improve trust and the '+rival.field+' sector',canAct&&s.cash>=350);
   put('pulse:challenge:'+rival.id,'Challenge '+rival.name,
    'Spend $250 on a public competition · your actual skills and reputation determine the result',canAct&&s.cash>=250);
   if(rival.rivalry>=50)put('pulse:repair:'+rival.id,'Repair relations with '+rival.name,
    'Spend time rebuilding an intergenerational rivalry',canAct);
  }
  put('pulse:community','Serve a local community initiative',
   'Spend $300 · increase civic trust and support the local care sector',can&&s.cash>=300&&w.reputation.community<100);
 }
 return out;
}
export function worldPulseAct(s,id,ctx){
 const options=worldPulseCommands({...s,actions:s.actions+1},ctx.careers);
 if(!options.some(x=>x.id===id&&x.enabled))throw Error('World response is unavailable.');
 const [,verb,arg]=id.split(':'),w=ensure(s),region=regionOf(s,w);
 if(verb==='begin'){
  const sector=pulseSectors.find(x=>x.id===arg);
  if(!sector||w.active)throw Error('Regional project is unavailable.');
  w.started++;w.lastStartAge=s.age;
  const rival=w.rivals.find(r=>r.field===arg)||w.rivals[hash(s.lifeId,arg)%w.rivals.length];
  w.active={id:'regional-'+w.started,sector:arg,region:s.country,startedAge:s.age,
   stage:0,nextAge:s.age,status:'ready',impact:0,choices:[],rivalId:rival.id,rivalName:rival.name};
  record(s,ctx,'Regional project: '+stories[arg].title+'. '+stories[arg].story,'project',
   {sector:arg,region:s.country});
  return;
 }
 if(verb==='continue'){
  if(!w.active||w.active.status!=='waiting'||s.age<w.active.nextAge)throw Error('Chapter not ready.');
  w.active.status='ready';record(s,ctx,'Your regional partners are ready for the next chapter.','project',
    {sector:w.active.sector});return;
 }
 if(verb==='leave'){
  const a=w.active;if(!a||a.status!=='waiting')throw Error('You cannot leave an unresolved decision.');
  closeProject(s,a,'interrupted',ctx);return;
 }
 if(verb==='community'){
  s.cash-=300;w.reputation.community=clamp(w.reputation.community+7);
  w.reputation.integrity=clamp(w.reputation.integrity+3);
  region.sectors.care=clamp(region.sectors.care+2);
  ctx.change(s,'kindness',2);
  record(s,ctx,'You helped a local initiative and built a reputation for dependable civic service.','civic');
  return;
 }
 const rival=rivalFor(w,arg);
 if(!rival)throw Error('Unknown competing house.');
 rival.lastInteractionAge=s.age;
 if(verb==='collaborate'){
  s.cash-=350;rival.trust=clamp(rival.trust+12);rival.rivalry=clamp(rival.rivalry-8);
  rival.standing=clamp(rival.standing+3);
  w.reputation.community=clamp(w.reputation.community+3);
  w.reputation.integrity=clamp(w.reputation.integrity+2);
  region.sectors[rival.field]=clamp(region.sectors[rival.field]+3);
  const item={age:s.age,action:'collaboration',result:'shared-benefit'};
  rival.history.push(item);rival.history=rival.history.slice(-10);
  record(s,ctx,'You collaborated with '+rival.name+'. Their trust improved as both groups invested in the region.','rival',
   {rivalId:rival.id,result:item.result});return;
 }
 if(verb==='challenge'){
  s.cash-=250;
  const skill=s.stats.knowledge*.30+s.stats.confidence*.25+s.stats.reputation*.20+
   (w.reputation.influence+w.reputation.integrity)*.125;
  const threshold=rival.standing*.68+rival.rivalry*.22+12;
  const win=skill>=threshold;
  rival.wins+=win?0:1;
  rival.rivalry=clamp(rival.rivalry+(win?7:11));
  rival.trust=clamp(rival.trust-(win?2:5));
  w.reputation.influence=clamp(w.reputation.influence+(win?7:-4));
  ctx.change(s,'confidence',win?3:-2);
  if(win)region.sectors[rival.field]=clamp(region.sectors[rival.field]+2);
  const result=win?'won':'lost';
  rival.history.push({age:s.age,action:'challenge',result});rival.history=rival.history.slice(-10);
  record(s,ctx,'You '+result+' a public challenge against '+rival.name+'. The result changed how people judge both houses.','rival',
    {rivalId:rival.id,result});return;
 }
 if(verb==='repair'){
  rival.rivalry=clamp(rival.rivalry-16);rival.trust=clamp(rival.trust+12);
  w.reputation.integrity=clamp(w.reputation.integrity+4);
  rival.history.push({age:s.age,action:'reconciliation',result:'truce'});
  rival.history=rival.history.slice(-10);
  record(s,ctx,'You made a serious attempt to reconcile with '+rival.name+'. Old conflicts no longer carry the same weight.','rival',
    {rivalId:rival.id,result:'truce'});return;
 }
 throw Error('Unknown world response.');
}
export function worldPulseView(s){
 const a=s.worldPulse?.active;
 if(!a||a.status!=='ready')return null;
 const theme=stories[a.sector],scene=sceneFor(a);
 if(!theme||!scene)return null;
 const w=s.worldPulse,local=w.regions[a.region],rival=rivalFor(w,a.rivalId);
 return {id:a.id,title:theme.title,story:theme.story,chapterTitle:scene.title,
  chapter:a.stage+1,total:3,body:scene.body,sector:a.sector,industry:pulseSectors.find(x=>x.id===a.sector)?.name,
  region:local?.name||'',rival:rival?.name||a.rivalName,standing:rival?.standing??50,impact:a.impact,
  choices:scene.choices.map((label,index)=>({index,label,detail:[
   'Include the community · protect long-term trust','Prove the plan works · develop your professional skills',
   'Chase fast recognition · risk lasting distrust'][index]})),
  previous:a.choices.at(-1)||null};
}
function closeProject(s,a,status,ctx){
 const w=ensure(s),region=w.regions[a.region],rival=rivalFor(w,a.rivalId);
 const result=status!=='completed'?status:
  a.impact>=64?'transformative':a.impact>=35?'constructive':'controversial';
 const entry={id:a.id,title:stories[a.sector].title,sector:a.sector,region:a.region,age:a.startedAge,
  completedAge:s.age,status,result,impact:a.impact,rivalId:a.rivalId,rivalName:a.rivalName,
  choices:a.choices.slice(),sourceLife:s.name};
 if(status==='completed'){
  w.completed++;
  w.finished.push(entry);w.finished=w.finished.slice(-25);
  if(result==='transformative'){region.sectors[a.sector]=clamp(region.sectors[a.sector]+5);
   w.reputation.community=clamp(w.reputation.community+5);
   w.reputation.integrity=clamp(w.reputation.integrity+5);
   ctx.change(s,'reputation',4);
  }else if(result==='constructive'){region.sectors[a.sector]=clamp(region.sectors[a.sector]+3);
   w.reputation.community=clamp(w.reputation.community+3);ctx.change(s,'reputation',2);
  }else{w.reputation.integrity=clamp(w.reputation.integrity-6);
   rival.rivalry=clamp(rival.rivalry+6);ctx.change(s,'reputation',-2);
  }
  const currentJob=ctx.careers[s.job?.id];
  if(currentJob&&sectorsForIndustry(currentJob.industry)===a.sector)
   s.job.experience=clamp((s.job.experience||0)+(result==='transformative'?12:5));
  ctx.change(s,'confidence',result==='transformative'?5:result==='constructive'?2:-3);
 }else{
  w.unfulfilled.push(entry);w.unfulfilled=w.unfulfilled.slice(-16);
  if(status==='neglected'){w.reputation.integrity=clamp(w.reputation.integrity-5);
   ctx.change(s,'reputation',-2);}
 }
 record(s,ctx,'Regional project '+stories[a.sector].title+' ended as '+result+'. The region and competing houses remember the choices.',
   'project',{result,sector:a.sector,rivalId:a.rivalId});
 w.active=null;return entry;
}
export function worldPulseDecision(s,index,ctx){
 const w=ensure(s),a=w.active;
 if(!s.alive||!a||a.status!=='ready')throw Error('No regional decision is ready.');
 if(!Number.isInteger(index)||index<0||index>2)throw Error('Invalid regional decision.');
 const scene=sceneFor(a),region=w.regions[a.region],rival=rivalFor(w,a.rivalId);
 if(!scene||!region||!rival)throw Error('Regional project is unavailable.');
 const delta=[24,20,-3][index];
 const influenced=index===0?'community':index===1?'integrity':'influence';
 a.impact+=delta+(index===1&&s.stats.knowledge>=70?4:0)+(index===0&&s.stats.kindness>=75?3:0);
 w.reputation[influenced]=clamp(w.reputation[influenced]+[7,7,9][index]);
 if(index===2){w.reputation.integrity=clamp(w.reputation.integrity-12);
  w.reputation.community=clamp(w.reputation.community-8);
  region.sectors[a.sector]=clamp(region.sectors[a.sector]-5);
  rival.rivalry=clamp(rival.rivalry+10);rival.trust=clamp(rival.trust-8);
  ctx.change(s,'stress',5);ctx.change(s,'reputation',-3);
 }else{
  region.sectors[a.sector]=clamp(region.sectors[a.sector]+(index===0?3:5));
  rival.rivalry=clamp(rival.rivalry-(index===0?5:1));
  rival.trust=clamp(rival.trust+(index===0?6:2));
  ctx.change(s,'reputation',index===0?2:3);
  ctx.change(s,index===0?'kindness':'knowledge',2);
 }
 const reaction=index===0?'People noticed you made room for those most affected.':
  index===1?'Your careful work made the plan more credible and durable.':
  'You gained attention, but the short-term maneuver weakened trust.';
 const choice={chapter:a.stage+1,age:s.age,title:scene.title,label:scene.choices[index],
  index,reaction,impact:delta};
 a.choices.push(choice);a.stage++;
 record(s,ctx,stories[a.sector].title+' · '+scene.title+': '+reaction,'project',
  {sector:a.sector,chapter:a.stage,index});
 if(a.stage===3)return closeProject(s,a,'completed',ctx);
 a.status='waiting';a.nextAge=s.age+2;return choice;
}
export function worldPulseObserve(s,id,ctx){
 if(!s.alive||s.age<15||id.startsWith('pulse:'))return;
 const effect={
  volunteer:{community:3,integrity:1,sector:'care',delta:1,description:'A community effort strengthened your local reputation.'},
  work:{integrity:1,influence:1,description:'A year of reliable work strengthened your professional standing.'},
  careertrain:{integrity:1,influence:2,description:'Investing in your professional skills improved your credibility.'},
  create:{influence:2,sector:'culture',delta:1,description:'Your creative work helped the local cultural scene.'},
  'business:improve':{integrity:2,sector:'commerce',delta:1,description:'You improved the reliability of your business.'}
 }[id]||(id.startsWith('support:')?{community:2,integrity:1,description:'Supporting another person strengthened your social ties.'}:
    id.startsWith('reconcile:')?{integrity:2,community:1,description:'Reconciling a rivalry strengthened your local reputation.'}:null);
 if(!effect)return;
 const w=ensure(s),region=regionOf(s,w);
 for(const metric of ['community','integrity','influence'])if(effect[metric])
  w.reputation[metric]=clamp(w.reputation[metric]+effect[metric]);
 if(effect.sector)region.sectors[effect.sector]=clamp(region.sectors[effect.sector]+effect.delta);
 // Keep ordinary-life callbacks visible without flooding the journal or creating fake income.
 record(s,ctx,effect.description,'reputation',{source:id});
}
export function worldPulseYear(s,ctx){
 if(!s.alive||s.age<15)return;
 const w=ensure(s);
 if(w.lastYear===s.age)return;
 for(const region of w.regions){
  for(let i=0;i<pulseSectors.length;i++){
   const sector=pulseSectors[i].id,old=region.sectors[sector];
   const change=variance(-4,4,s.lifeId,'world',s.age,region.id,i);
   region.sectors[sector]=clamp(within(old+change+Math.round((50-old)*.08),15,90));
  }
  if(s.age>=18&&s.age%3===0){
   const event=headlineTemplates[hash(s.lifeId,'headline',s.age,region.id)%headlineTemplates.length];
   const impact=event.direction*variance(5,10,s.lifeId,s.age,region.id,event.title);
   region.sectors[event.sector]=clamp(within(region.sectors[event.sector]+impact,15,92));
   const item={age:s.age,sector:event.sector,title:event.title,description:event.description,
    impact,region:region.id};
   region.lastHeadline=item;region.history.push(item);region.history=region.history.slice(-10);
   if(region.id===s.country)record(s,ctx,region.name+': '+event.title+'. '+event.description,'headline',
    {sector:event.sector,impact});
  }
 }
 for(const rival of w.rivals){
  const change=variance(-4,6,s.lifeId,'rival',rival.id,s.age);
  rival.standing=clamp(within(rival.standing+change+Math.round((55-rival.standing)*.07),15,95));
  if(s.age>=18&&s.age%3===0&&rival.standing>=65){
   rival.wins++;rival.rivalry=clamp(rival.rivalry+2);
   rival.history.push({age:s.age,action:'independent project',result:'regional win'});
   rival.history=rival.history.slice(-10);
   if(rival.rivalry>=60&&w.reputation.influence>=55){
    w.reputation.influence=clamp(w.reputation.influence-1);
    record(s,ctx,rival.name+' claimed credit for an influential local initiative. Your households remain competitors.',
      'rival',{rivalId:rival.id});
   }
  }
  if(rival.rivalry>50&&s.age%5===0)rival.rivalry=clamp(rival.rivalry-1);
 }
 const a=w.active;
 if(a?.status==='waiting'){
  if(s.age>a.nextAge+2)closeProject(s,a,'neglected',ctx);
  else if(s.age===a.nextAge)record(s,ctx,a.rivalName+
   ' is preparing for the next chapter of '+stories[a.sector].title+'.','project',
   {sector:a.sector,chapter:a.stage+1});
 }
 w.annual.push({age:s.age,region:s.country,ratings:{...regionOf(s,w).sectors},
  reputation:{...w.reputation},rivalWins:w.rivals.reduce((a,r)=>a+r.wins,0)});
 w.annual=w.annual.slice(-18);
 w.lastYear=s.age;
}
export function worldPulseSummary(s,careers){
 const w=worldPulseState(s),local=regionOf(s,w),job=s.job?careers[s.job.id]:null,sector=job?sectorsForIndustry(job.industry):null;
 const a=w.active;
 return {countries:w.regions.map(r=>({id:r.id,name:r.name,sectors:{...r.sectors},
   average:Math.round(Object.values(r.sectors).reduce((a,n)=>a+n,0)/pulseSectors.length),
   lastHeadline:r.lastHeadline})),
  country:s.country,region:local.name,sectors:pulseSectors.map(x=>({...x,index:local.sectors[x.id],
   multiplier:Math.round((.87+local.sectors[x.id]*.0026)*1000)/1000})),
  career:job?{title:job.title,industry:job.industry,sector,multiplier:worldPulseEconomyMultiplier(s,job.industry)}:null,
  reputation:{...w.reputation},rivals:w.rivals.map(x=>({...x,history:x.history.slice(-3).reverse()})),
  active:a?{...a,chapterTitle:sceneFor(a)?.title||null,yearsUntil:Math.max(0,a.nextAge-s.age),
   due:a.status==='waiting'&&s.age>=a.nextAge}:null,
  finished:w.finished.slice(-5).reverse(),unfulfilled:w.unfulfilled.slice(-3).reverse(),
  news:w.news.slice(-6).reverse(),ancestry:w.ancestry.slice(-6).reverse(),
  annual:w.annual.slice(-4).reverse(),started:w.started,completed:w.completed,
  reputationMultiplier:worldPulseReputationMultiplier(s)};
}
export function worldPulseInheritance(next,old,child){
 const prev=old.worldPulse;if(!prev)return;
 const w=ensure(next);
 w.regions=prev.regions.map(r=>({...r,sectors:{...r.sectors},
  history:r.history.slice(-8),lastHeadline:r.lastHeadline?{...r.lastHeadline}:null}));
 w.reputation=Object.fromEntries(Object.entries(prev.reputation).map(([k,v])=>[k,clamp(50+(v-50)*.6)]));
 w.rivals=prev.rivals.map(r=>({...r,standing:clamp(50+(r.standing-50)*.85),
  rivalry:clamp(25+(r.rivalry-25)*.85),trust:clamp(45+(r.trust-45)*.85),
  history:r.history.slice(-8),lastInteractionAge:null}));
 w.ancestry=[...(prev.ancestry||[]),...prev.finished.slice(-6).map(x=>({...x,sourceLife:old.name})),
  ...prev.journal.filter(x=>x.kind==='rival').slice(-5).map(x=>({...x,sourceLife:old.name}))].slice(-24);
 w.active=null;w.news=[];w.journal=[];w.annual=[];w.unfulfilled=[];w.finished=[];
 w.started=0;w.completed=0;w.lastStartAge=null;w.lastYear=null;
}
