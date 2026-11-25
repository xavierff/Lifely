// Lifely 1.0 — authored profession simulations, deterministic offline state.
// Four distinct steps per profession; results connect to the existing simulation.
// All salaries, election processes and clinical events are fictional abstractions.

export const careerCampaignTypes=[
 {id:'film',icon:'🎬',title:'Produce a film',subtitle:'Script to premiere',entry:850,
 stages:[
  {title:'The greenlight',prompt:'Your next production has a promising idea, but your collaborators disagree over its direction.',choices:[
   {label:'Develop the script with the cast',detail:'$450 · strong ensemble, slower preparation',cost:450,quality:14,team:12,reach:2,risk:-3},
   {label:'Build a small, original independent story',detail:'No additional budget · creative control',cost:0,quality:10,team:5,reach:4,risk:1},
   {label:'Chase a commercial trend',detail:'$800 · stronger publicity, creative friction',cost:800,quality:1,team:-8,reach:17,risk:13}]},
  {title:'The casting decision',prompt:'The lead role is unsettled. An established star draws attention; a new performer offers an unexpected perspective.',choices:[
   {label:'Hold open auditions with fair pay',detail:'$650 · diverse cast and collaboration',cost:650,quality:13,team:13,reach:5,risk:-2},
   {label:'Develop your existing ensemble',detail:'Use existing resources · cohesion over attention',cost:0,quality:7,team:10,reach:1,risk:0},
   {label:'Hire a famous but demanding lead',detail:'$1,200 · high reach, higher stakes',cost:1200,quality:3,team:-13,reach:21,risk:15}]},
  {title:'A troubled shoot',prompt:'Unexpected scheduling problems threaten the last week of filming. Your team expects a decision.',choices:[
   {label:'Reschedule safely and pay the crew',detail:'$900 · protect quality and morale',cost:900,quality:15,team:12,reach:0,risk:-8},
   {label:'Reduce scope and complete essential scenes',detail:'Use the current budget · balanced compromise',cost:0,quality:5,team:5,reach:0,risk:1},
   {label:'Rush overtime without consultation',detail:'No extra upfront budget · major fatigue',cost:0,quality:-14,team:-20,reach:9,risk:25}]},
  {title:'Premiere night',prompt:'The film is finished. Distributors want a plan for audiences, costs and how collaborators receive credit.',choices:[
   {label:'Festival premiere with shared credit',detail:'$700 · reviews and long-term reputation',cost:700,quality:9,team:10,reach:13,risk:0},
   {label:'Release slowly to a loyal audience',detail:'No extra distribution spend · loyal audience',cost:0,quality:4,team:6,reach:7,risk:-3},
   {label:'Spend heavily on an aggressive launch',detail:'$1,450 · immediate reach, higher downside',cost:1450,quality:0,team:-7,reach:25,risk:15}]}]},
 {id:'sports',icon:'🏆',title:'Play a competitive season',subtitle:'Training to championship',entry:350,
 stages:[
  {title:'Training camp',prompt:'Your coaches disagree about how aggressively to prepare for the upcoming season.',choices:[
   {label:'Build a balanced conditioning plan',detail:'$400 · form and injury prevention',cost:400,quality:13,team:7,reach:2,risk:-8},
   {label:'Review opponents and practice fundamentals',detail:'$150 · tactical preparation',cost:150,quality:8,team:8,reach:5,risk:-2},
   {label:'Train to exhaustion to gain an edge',detail:'No coaching fee · form with injury risk',cost:0,quality:17,team:-8,reach:3,risk:18}]},
  {title:'The dressing room',prompt:'A talented teammate is frustrated with your role in the squad. The mood threatens your performance.',choices:[
   {label:'Discuss roles openly and share credit',detail:'No fee · boost team trust',cost:0,quality:6,team:17,reach:2,risk:-4},
   {label:'Ask a coach to facilitate a meeting',detail:'$200 · steady relations',cost:200,quality:7,team:11,reach:0,risk:0},
   {label:'Demand everyone follow your strategy',detail:'No fee · higher intensity, low trust',cost:0,quality:9,team:-13,reach:9,risk:11}]},
  {title:'The elimination match',prompt:'The fixture is tight. A strong opponent forces a decision about tempo and defensive risk.',choices:[
   {label:'Play controlled, adaptable tactics',detail:'Protect energy and reduce mistakes',cost:0,quality:12,team:8,reach:5,risk:-6},
   {label:'Trust the specialist coach and rotate',detail:'$250 · fresh team and careful tactics',cost:250,quality:9,team:12,reach:3,risk:-3},
   {label:'Commit everyone to a risky attack',detail:'Higher spectacle and upset potential',cost:0,quality:13,team:-7,reach:15,risk:19}]},
  {title:'Championship day',prompt:'You have one final opportunity to manage pressure, fatigue and your rival’s strongest move.',choices:[
   {label:'Protect the team and execute the plan',detail:'Measured final, emphasis on consistency',cost:0,quality:12,team:12,reach:5,risk:-6},
   {label:'Adapt to your opponent’s game',detail:'$180 · tactical analyst',cost:180,quality:13,team:6,reach:8,risk:0},
   {label:'Go all-in on the spectacular finish',detail:'Big headline potential, greater injury risk',cost:0,quality:6,team:-8,reach:23,risk:21}]}]},
 {id:'election',icon:'🗳️',title:'Run an election campaign',subtitle:'Organizing to election night',entry:700,
 stages:[
  {title:'The local platform',prompt:'Your fictional civic party must decide which public need to prioritize during the campaign.',choices:[
   {label:'Listen to residents and publish priorities',detail:'$250 · trust and representative policy',cost:250,quality:12,team:11,reach:5,risk:-6},
   {label:'Publish a concise, costed proposal',detail:'Use volunteers · clarity and credibility',cost:0,quality:9,team:7,reach:3,risk:-3},
   {label:'Promise everything without a budget',detail:'No fee · short-term attention',cost:0,quality:-8,team:-6,reach:18,risk:22}]},
  {title:'Building a coalition',prompt:'A civic opponent offers to cooperate on one issue, but your volunteers distrust the offer.',choices:[
   {label:'Negotiate a transparent issue agreement',detail:'$200 · bipartisan credibility',cost:200,quality:9,team:14,reach:8,risk:-4},
   {label:'Host a public panel on the proposal',detail:'Use a community venue · broader feedback',cost:0,quality:8,team:8,reach:11,risk:0},
   {label:'Attack the rival personally',detail:'No fee · polarizing coverage',cost:0,quality:-9,team:-9,reach:14,risk:23}]},
  {title:'The candidate debate',prompt:'A moderator asks a difficult question about your party’s record. The fictional political rival challenges your credibility.',choices:[
   {label:'Acknowledge gaps and explain the plan',detail:'Evidence and accountability',cost:0,quality:14,team:10,reach:8,risk:-7},
   {label:'Offer clear, verifiable comparisons',detail:'$200 · specialist briefing',cost:200,quality:11,team:5,reach:9,risk:-3},
   {label:'Spread an unverified accusation',detail:'Attention with serious reputational risk',cost:0,quality:-12,team:-11,reach:17,risk:30}]},
  {title:'Election week',prompt:'Volunteers report competing demands. The final push must stay accountable and respect the fictional vote.',choices:[
   {label:'Organize accessible, lawful outreach',detail:'$500 · trust and broad participation',cost:500,quality:12,team:13,reach:13,risk:-6},
   {label:'Prioritize a few well-planned events',detail:'Volunteer-led · efficient operations',cost:0,quality:8,team:9,reach:7,risk:-2},
   {label:'Stage a sensational media stunt',detail:'$250 · headline reach, unpredictable fallout',cost:250,quality:-4,team:-6,reach:25,risk:21}]}]},
 {id:'medical',icon:'🩺',title:'Coordinate a clinical case',subtitle:'Fictional team-based patient care',entry:250,
 stages:[
  {title:'The first assessment',prompt:'A fictional patient arrives with unclear records. Your healthcare team needs a safe and respectful plan.',choices:[
   {label:'Review records and consult appropriate specialists',detail:'$160 · accuracy and teamwork',cost:160,quality:15,team:12,reach:2,risk:-8},
   {label:'Request a structured multidisciplinary review',detail:'Use existing team · careful coordination',cost:0,quality:12,team:15,reach:2,risk:-7},
   {label:'Rely on an unverified quick assumption',detail:'No fee · unsafe shortcuts in this fictional case',cost:0,quality:-15,team:-9,reach:8,risk:24}]},
  {title:'Consent and communication',prompt:'The patient and family have different expectations. Your team must communicate options within professional boundaries.',choices:[
   {label:'Seek informed consent with clear explanations',detail:'Time-intensive, protects patient autonomy',cost:0,quality:15,team:12,reach:3,risk:-8},
   {label:'Ask a qualified patient liaison to join',detail:'$130 · improve understanding',cost:130,quality:11,team:13,reach:4,risk:-5},
   {label:'Dismiss concerns to move quickly',detail:'Fictional reputational and safety risks',cost:0,quality:-13,team:-14,reach:8,risk:23}]},
  {title:'An unexpected complication',prompt:'The fictional case becomes more complex than originally expected, and the team needs to reassess.',choices:[
   {label:'Escalate to the appropriately trained senior team',detail:'$280 · safer coordinated response',cost:280,quality:15,team:14,reach:2,risk:-8},
   {label:'Pause and review the plan collaboratively',detail:'Use existing team · careful review',cost:0,quality:12,team:9,reach:2,risk:-6},
   {label:'Avoid documenting the concern',detail:'Unsafe fictional shortcut with severe consequences',cost:0,quality:-18,team:-13,reach:11,risk:30}]},
  {title:'Follow-up and learning',prompt:'The episode is ending. Your team must arrange safe follow-up and learn from the experience.',choices:[
   {label:'Document learning and plan patient follow-up',detail:'$160 · better systems and confidence',cost:160,quality:16,team:13,reach:3,risk:-8},
   {label:'Invite a clinical peer review',detail:'$250 · independent quality feedback',cost:250,quality:13,team:12,reach:4,risk:-6},
   {label:'Skip the debrief to save time',detail:'No fee · less learning and higher risk',cost:0,quality:-13,team:-12,reach:12,risk:24}]}]},
 {id:'business',icon:'🏬',title:'Launch a company initiative',subtitle:'Operations to customer launch',entry:400,
 stages:[
  {title:'The market problem',prompt:'Your company has resources for one initiative. Customers need something reliable, while competitors chase quick growth.',choices:[
   {label:'Interview customers before committing',detail:'$320 · reliable demand evidence',cost:320,quality:13,team:7,reach:9,risk:-6},
   {label:'Test an affordable small pilot',detail:'Use existing resources · controlled experiment',cost:0,quality:11,team:6,reach:5,risk:-4},
   {label:'Copy a fashionable rival product',detail:'$100 · initial buzz, weak differentiation',cost:100,quality:-8,team:-6,reach:19,risk:19}]},
  {title:'The supplier decision',prompt:'Two suppliers offer different prices and working conditions. Your team asks what values should guide the contract.',choices:[
   {label:'Choose an audited, dependable supplier',detail:'$550 · quality and team trust',cost:550,quality:13,team:12,reach:3,risk:-9},
   {label:'Negotiate milestones and a fair fallback',detail:'Use your current team · balanced costs',cost:0,quality:9,team:8,reach:4,risk:-4},
   {label:'Use the cheapest unverified source',detail:'No fee · delivery and quality risks',cost:0,quality:-12,team:-13,reach:10,risk:22}]},
  {title:'The launch deadline',prompt:'A delivery delay threatens the launch. Staff recommend different solutions and your cash runway is limited.',choices:[
   {label:'Protect staff and communicate a revised date',detail:'$400 · team loyalty, lower launch risk',cost:400,quality:14,team:13,reach:1,risk:-7},
   {label:'Release a smaller verified product',detail:'Use existing inventory · sustainable delivery',cost:0,quality:9,team:7,reach:6,risk:-2},
   {label:'Ship before quality checks are complete',detail:'No fee · short-term sales, long-term exposure',cost:0,quality:-16,team:-14,reach:20,risk:27}]},
  {title:'The customer response',prompt:'First reviews arrive. A defect affects a small group of customers, and the business must decide how to respond.',choices:[
   {label:'Offer transparent support and resolve the defect',detail:'$620 · strong long-term reputation',cost:620,quality:15,team:13,reach:10,risk:-8},
   {label:'Prioritize affected users and publish a plan',detail:'Use existing support staff · accountability',cost:0,quality:10,team:9,reach:7,risk:-4},
   {label:'Minimize complaints and spend on advertising',detail:'$450 · higher visibility, rising backlash',cost:450,quality:-14,team:-10,reach:20,risk:25}]}]}
];
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Math.round(v)));
const stats=(s,k)=>s.stats?.[k]||0;
export const careerCampaignEligible=(s,type,jobTitle)=>{
 if(!s.alive||s.age<18||(s.justice?.years||0)>0||s.justice?.case)return false;
 const w=s.world||{},prof=s.profession?.id;
 if(type==='film')return !!['Film actor','Film director'].includes(w.entertainment?.path)||prof==='actor';
 if(type==='sports')return !!w.sports?.sport||prof==='athlete';
 if(type==='election')return s.age>=25&&(!!w.politics?.party||prof==='politics')&&!w.politics?.term;
 if(type==='medical')return prof==='doctor'||!!(s.job&&/doctor|nurs|medical|clinical|paramedic|physiother|occupational therapist|speech therapist|dental specialist/i.test(jobTitle||''));
 if(type==='business')return !!s.business;
 return false;
};
export function careerCampaignState(s){return s.careerCampaigns||{active:null,completed:[],lastStarted:{},totals:{},news:[]};}
export function ensureCareerCampaign(s){s.careerCampaigns??={active:null,completed:[],lastStarted:{},totals:{},news:[]};return s.careerCampaigns;}
export function careerCampaignCommands(s,jobTitle){
 if(!s.alive||s.pending!==null||s.mini||s.world?.network?.conversation||s.careerCampaigns?.active)return [];
 const c=careerCampaignState(s);
 return careerCampaignTypes.map(t=>({id:'campaign:start:'+t.id,label:t.icon+' '+t.title,detail:t.subtitle+' · $'+t.entry.toLocaleString('en-US')+' upfront · 4 decisions',enabled:s.actions>0&&careerCampaignEligible(s,t.id,jobTitle)&&s.cash>=t.entry&&c.lastStarted[t.id]!==s.age}));
}
export function campaignBegin(s,type,jobTitle,ctx){
 const def=careerCampaignTypes.find(t=>t.id===type),c=ensureCareerCampaign(s);
 if(!def||!careerCampaignCommands({...s,actions:s.actions+1},jobTitle).some(a=>a.id==='campaign:start:'+type&&a.enabled))throw Error('Career project cannot be started.');
 ctx.spend(s,def.entry);c.lastStarted[type]=s.age;
 const w=s.world||{};
 let rival=type==='sports'?(w.characters?.athletes||[]).find(p=>p.sport===w.sports?.sport):type==='election'?(w.characters?.politicians||[]).reduce((a,b)=>!a||b.approval>a.approval?b:a,null):null;
 const active={id:'career-'+type+'-'+s.age+'-'+(c.completed.length+Object.keys(c.lastStarted).length),type,startedAge:s.age,stage:0,quality:40,team:45,reach:20,risk:8,
  spend:def.entry,choices:[],stakeholder:rival?.name||null,stakeholderId:rival?.id||null,sector:s.business?.sector||null,
  theme:type==='film'?(w.entertainment?.path||'Film actor'):type==='sports'?(w.sports?.sport||'Athletics'):type==='election'?(w.politics?.party||'Civic campaign'):type==='medical'?(jobTitle||'Medical specialist'):(s.business?.sector||'Company')};
 c.active=active;ctx.add(s,'Started '+def.title.toLowerCase()+'.','career');return active;
}
export function campaignView(s){
 const c=careerCampaignState(s),a=c.active;if(!a)return null;
 const def=careerCampaignTypes.find(t=>t.id===a.type),stage=def?.stages[a.stage];if(!def||!stage)return null;
 return {id:a.id,type:a.type,icon:def.icon,title:def.title,theme:a.theme,subtitle:def.subtitle,round:a.stage+1,total:4,phase:stage.title,prompt:stage.prompt,
  quality:a.quality,team:a.team,reach:a.reach,risk:a.risk,cost:a.spend,stakeholder:a.stakeholder,
  choices:stage.choices.map((x,i)=>({index:i,label:x.label,detail:x.detail,cost:x.cost,enabled:s.cash>=x.cost})),history:a.choices.slice()};
}
function award(s,a,ctx){
 const def=careerCampaignTypes.find(t=>t.id===a.type),w=s.world,pro=s.profession,rival=a.stakeholderId;
 const skill=a.type==='film'?((stats(s,'creativity')+(s.skills?.art||0))/2):a.type==='sports'?((stats(s,'health')+(w.sports?.form||pro?.metric||45))/2):
   a.type==='election'?((stats(s,'reputation')+stats(s,'social'))/2):a.type==='medical'?((stats(s,'knowledge')+(s.skills?.technical||0))/2):
   ((stats(s,'knowledge')+(s.skills?.technical||0))/2);
 const opponent=a.type==='sports'?w.characters?.athletes?.find(p=>p.id===rival)?.form||50:a.type==='election'?w.characters?.politicians?.find(p=>p.id===rival)?.approval||50:50;
 const pressure=a.type==='sports'||a.type==='election'?Math.max(0,opponent-50)*.12:0;
 const rating=clamp(a.quality*.37+a.team*.21+a.reach*.22+skill*.22-a.risk*.19-pressure,0,100);
 const chance=Math.max(.08,Math.min(.95,.14+rating*.0083-a.risk*.0007));
 const succeeded=ctx.rng(s)<chance;
 const grade=succeeded?(rating>=72?'breakthrough':rating>=48?'successful':'close finish'):(rating>=66?'close loss':'setback');
 let gross=0,fee=0,message='';
 if(a.type==='film'){
  const e=w.entertainment;if(succeeded){
   e.releases++;e.catalog+=(a.theme==='Film director'?2:1);e.fame=clamp(e.fame+9+Math.round(rating/10));e.awards+=(rating>=75?1:0);
   gross=Math.round((1500+rating*62)*ctx.country(s).salary);
   const ag=w.characters?.agency,agent=ag?.agents?.find(p=>p.id===ag.agency?.agentId&&(p.specialty==='Film actor'||p.specialty==='Film director'));
   if(agent){fee=Math.round(gross*agent.commission/100);ag.agency.fees+=fee;ag.agency.earned+=gross-fee;ag.agency.deals++;agent.projects++;}
   s.cash+=gross-fee;ctx.change(s,'reputation',7);ctx.change(s,'creativity',5);
  }else{e.fame=clamp(e.fame-4);ctx.change(s,'stress',7);}
  message=succeeded?'Your film reached its audience and paid its collaborators.':'The production struggled at release; the team recorded what to improve.';
 }else if(a.type==='sports'){
  const t=w.sports;if(succeeded){t.wins++;t.form=clamp(t.form+Math.round(6+rating/12));gross=Math.round((650+rating*28)*(ctx.country(s).salary||1));
   s.cash+=gross;t.trophies+=rating>=72?1:0;ctx.change(s,'reputation',5);
  }else{t.losses++;t.form=clamp(t.form-3);ctx.change(s,'stress',5);}
  t.seasons++;if(a.risk>60&&ctx.rng(s)<.22){t.injury=Math.max(t.injury||0,1);ctx.change(s,'health',-5);}
  if(pro?.id==='athlete'){pro.attempts=(pro.attempts||0)+1;if(succeeded)pro.wins=(pro.wins||0)+1;pro.metric=clamp(pro.metric+(succeeded?8:-3));}
  const opponent=w.characters?.athletes?.find(p=>p.id===rival);if(opponent){if(succeeded)opponent.losses++;else opponent.wins++;opponent.rivalry=clamp(opponent.rivalry+5);opponent.respect=clamp(opponent.respect+(succeeded?4:2));}
  message=succeeded?'The season ended with a competition victory.':'Your rival prevailed this season, leaving a clear rematch to work toward.';
 }else if(a.type==='election'){
  const p=w.politics;p.party??='Civic Renewal';p.elections++;p.lastElectionAge=s.age;p.campaignFunds=Math.max(0,(p.campaignFunds||0)-Math.min(1500,p.campaignFunds||0));
  p.approval=clamp(p.approval+(succeeded?Math.round(7+rating/15):-7));
  if(succeeded){p.wins++;p.office=p.wins>=3?'Regional executive':p.wins===2?'Representative':'Councillor';p.term=4;
   if(s.job)s.job=null;ctx.change(s,'reputation',8);
  }else ctx.change(s,'stress',6);
  if(pro?.id==='politics'){pro.attempts=(pro.attempts||0)+1;if(succeeded)pro.wins=(pro.wins||0)+1;pro.metric=clamp(pro.metric+(succeeded?7:-6));}
  const opponent=w.characters?.politicians?.find(p=>p.id===rival);if(opponent){if(succeeded)opponent.losses++;else opponent.wins++;opponent.approval=clamp(opponent.approval+(succeeded?-5:5));}
  message=succeeded?'The fictional election returned a mandate for your campaign.':'Your fictional campaign lost; volunteers and residents now expect accountability.';
 }else if(a.type==='medical'){
  if(succeeded){ctx.change(s,'reputation',6);ctx.change(s,'knowledge',4);ctx.change(s,'kindness',3);if(pro?.id==='doctor'){pro.clients=(pro.clients||0)+1;pro.wins=(pro.wins||0)+1;pro.metric=clamp(pro.metric+7);}
  }else{ctx.change(s,'stress',7);ctx.change(s,'reputation',-4);if(pro?.id==='doctor')pro.metric=clamp(pro.metric-4);}
  if(pro?.id==='doctor')pro.attempts=(pro.attempts||0)+1;
  if(s.job){s.job.experience=clamp((s.job.experience||0)+(succeeded?9:3));ctx.change(s,'performance',succeeded?5:-3);}
  message=succeeded?'The fictional care team completed a safe, coordinated follow-up.':'The team identified a safety gap and escalated it for supervised review.';
 }else if(a.type==='business'){
  const b=s.business;if(b){b.demand??=50;b.competition??=50;b.products??=[];b.quality=clamp(b.quality+(succeeded?Math.round(7+rating/14):-6));b.demand=clamp(b.demand+(succeeded?Math.round(7+rating/11):-4));b.competition=clamp(b.competition+(succeeded?2:4));
   if(succeeded){b.products??=[];if(b.products.length<10)b.products.push('Customer-led launch '+(b.products.length+1));gross=Math.round(Math.max(0,(b.capital||0)*(.08+rating/900)));
    s.cash+=gross;
    ctx.change(s,'reputation',5);ctx.change(s,'knowledge',3);
   }else{ctx.change(s,'stress',7);ctx.change(s,'reputation',-3);}}
  if(pro?.id==='entrepreneur'){pro.attempts=(pro.attempts||0)+1;if(succeeded)pro.wins=(pro.wins||0)+1;pro.metric=clamp(pro.metric+(succeeded?7:-5));}
  message=succeeded?'Customer research and delivery translated into stronger company demand.':'The initiative stalled; customer complaints and operating constraints remain.';
 }
 return {rating,chance,grade,succeeded,gross,fee,net:gross-fee,message};
}
export function campaignReply(s,selection,ctx){
 const c=ensureCareerCampaign(s),a=c.active,def=careerCampaignTypes.find(t=>t.id===a?.type);if(!s.alive||!a||!def)throw Error('No career project is active.');
 if(selection==='abandon'){
  const record={...a,status:'abandoned',outcome:'abandoned',endedAge:s.age,result:{gross:0,fee:0,net:0,message:'Project abandoned; the initial budget remains spent.'}};
  c.completed.push(record);c.completed=c.completed.slice(-50);c.active=null;ctx.change(s,'stress',3);ctx.add(s,'Abandoned '+def.title.toLowerCase()+'.','career');return record;
 }
 if(!Number.isInteger(selection)||selection<0||selection>2)throw Error('Select an available project decision.');
 const choice=def.stages[a.stage]?.choices[selection];if(!choice||s.cash<choice.cost)throw Error('Insufficient project cash or invalid step.');
 if(choice.cost)ctx.spend(s,choice.cost);
 a.spend+=choice.cost;a.quality=clamp(a.quality+choice.quality);a.team=clamp(a.team+choice.team);a.reach=clamp(a.reach+choice.reach);a.risk=clamp(a.risk+choice.risk);
 a.choices.push({step:a.stage,index:selection,label:choice.label,cost:choice.cost,age:s.age});
 if(choice.risk>15)ctx.change(s,'stress',4);else if(choice.team>10)ctx.change(s,'social',2);
 a.stage++;
 if(a.stage===4){
  const result=award(s,a,ctx),rec={...a,status:'completed',endedAge:s.age,outcome:result.grade,result};
  c.completed.push(rec);c.completed=c.completed.slice(-50);c.active=null;c.totals[a.type]=(c.totals[a.type]||0)+1;
  c.news.push({age:s.age,type:a.type,message:result.message});c.news=c.news.slice(-25);
  s.world??={};s.world.news??=[];s.world.news.push({age:s.age,text:result.message,domain:'career'});s.world.news=s.world.news.slice(-32);
  ctx.add(s,def.title+': '+result.grade+' ('+result.rating+'/100). '+result.message,'career');
  return rec;
 }
 return a;
}
export function campaignHistory(s){
 const c=careerCampaignState(s);
 return {completed:c.completed.slice(-12).reverse(),totals:c.totals,news:c.news.slice(-6).reverse(),count:c.completed.length};
}
export function campaignInheritance(next,previous){
 const parent=previous.careerCampaigns;if(!parent)return next;
 next.careerCampaigns={active:null,lastStarted:{},totals:{},completed:(parent.completed||[]).slice(-8).map(x=>({...x,rememberedFrom:previous.name})),news:(parent.news||[]).slice(-5)};
 return next;
}
