// Lifely 1.23.0 — three-step playable intergroup public events.
// Independent, offline, deterministic; every contact is an existing living NPC.
// Starting consumes one normal annual activity; three scene decisions are free.
const cap=v=>Math.max(0,Math.min(100,Math.round(v)));
const brief=(s,n=230)=>String(s??'').replace(/\s+/g,' ').trim().slice(0,n);
const text=(v,n)=>typeof v==='string'&&v.length>0&&v.length<=n;
const age=v=>Number.isInteger(v)&&v>=0&&v<=110;
const signed=v=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=100;
const score=v=>signed(v)&&v>=0;
const LIMIT_SEEN=48,LIMIT_COMPLETE=24,LIMIT_NEWS=24,LIMIT_ANCESTORS=10;
const MODES=['negotiation','festival','competition','election'];
export const publicEventModes={
 negotiation:{title:'Interactive negotiations',subtitle:'Set terms, hear objections and decide a settlement',
  icon:'⚖',label:'Public negotiation forum',type:'NEGOTIATION',
  phases:[
   {title:'Set the opening terms',prompt:'The two leaders want a credible starting point.',
    choices:['Propose a balanced framework','Demand unilateral concessions','Allow both leaders to speak without intervention']},
   {title:'The difficult concession',prompt:'A previous disagreement resurfaces before the public agreement.',
    choices:['Offer a reciprocal compromise','Press the other group into yielding','Stay out of the dispute']},
   {title:'The final public statement',prompt:'The members must decide whether this agreement deserves their trust.',
    choices:['Commit to transparent follow-through','Claim a victory for your preferred side','Let the groups publish their own decision']}
  ]},
 festival:{title:'Community festival',subtitle:'Shape the program, welcome participants and settle tensions',
  icon:'✦',label:'Neighborhood community festival',type:'FESTIVAL',
  phases:[
   {title:'Choose the festival program',prompt:'The groups disagree about which real community interests deserve space.',
    choices:['Make room for both organizations','Put your favored group in the spotlight','Let the groups create their own program']},
   {title:'Work through a public setback',prompt:'Scheduling and competing priorities threaten the shared gathering.',
    choices:['Organize a fair joint response','Use the disagreement for attention','Allow the group organizers to work independently']},
   {title:'Close the community celebration',prompt:'The organizers want to acknowledge whose contributions mattered.',
    choices:['Recognize everyone’s effort','Give one organization all the credit','Leave the closing remarks to the groups']}
  ]},
 competition:{title:'Professional competition',subtitle:'Set fair rules, face a challenge and review the outcome',
  icon:'◎',label:'Professional skills challenge',type:'COMPETITION',
  phases:[
   {title:'Agree on the rules',prompt:'Both networks want the same recognition, but must agree how success is judged.',
    choices:['Establish transparent judging criteria','Give your preferred team an advantage','Let both teams set their own rules']},
   {title:'The live skills challenge',prompt:'The participants must respond to a difficult real-world task.',
    choices:['Encourage a fair, collaborative solution','Push for a risky shortcut','Let the teams solve it without your help']},
   {title:'Publish the final results',prompt:'The leaders need an outcome that their members will accept.',
    choices:['Explain the result with evidence','Announce a winner without hearing objections','Leave the announcement to the organizers']}
  ]},
 election:{title:'Leadership election',subtitle:'A real incumbent and challenger compete to lead an existing group',
  icon:'♛',label:'Organization leadership election',type:'ELECTION',
  phases:[
   {title:'The nomination meeting',prompt:'Two existing adults have competing visions for their organization.',
    choices:['Endorse the current leader','Campaign for the challenger','Decline to endorse a candidate']},
   {title:'The leadership debate',prompt:'The candidates defend their priorities before their own members.',
    choices:['Defend the incumbent’s record','Amplify the challenger’s proposals','Let each candidate debate freely']},
   {title:'The final member ballot',prompt:'Real group members must accept the outcome, not an invented vote total.',
    choices:['Support continuity in leadership','Support a different leader','Respect the membership’s independent choice']}
  ]}
};
const fresh=()=>({version:1,serial:0,active:null,completed:[],seen:[],news:[],
 ancestors:[],lastStartAge:-100});
export const playableEventsState=s=>s.playableEvents||fresh();
const ensure=s=>s.playableEvents??=fresh();
const group=(s,id)=>(s.socialCircles?.groups||[]).find(g=>g.id===id)||null;
function person(s,id){
 if(typeof id!=='string')return null;
 if(id.startsWith('person-')){
  const p=(s.people||[]).find(x=>'person-'+x.id===id&&x.alive&&x.age>=18&&x.world);
  return p?{id,name:p.name,trust:cap(p.world.trust??p.bond??50),
   rivalry:cap(p.world.rivalry??0),kind:'person',ref:p}:null;
 }
 const p=(s.world?.autonomy?.alumni||[]).find(x=>x.id===id);
 return p?{id,name:p.name,trust:cap(p.trust??50),rivalry:cap(p.rivalry??0),
  kind:'alumni',ref:p}:null;
}
function leaders(s,link){
 const a=group(s,link.aId),b=group(s,link.bId);
 if(!a||!b||a.status!=='active'||b.status!=='active')return null;
 const pa=person(s,a.leaderId),pb=person(s,b.leaderId);
 if(!pa||!pb||!a.members.includes(pa.id)||!b.members.includes(pb.id))return null;
 if(pa.id===pb.id){
  const substitute=b.members.map(id=>person(s,id)).find(p=>p&&p.id!==pa.id);
  if(!substitute)return null;
  return {a,b,pa,pb:substitute};
 }
 return {a,b,pa,pb};
}
const canParticipate=s=>s.alive&&s.age>=18&&s.age<=104&&
 s.pending===null&&!s.mini&&!s.careerCampaigns?.active&&
 !s.everydayScenes?.active&&!s.world?.network?.conversation&&
 !s.world?.storyDirector?.active&&s.fate?.active?.status!=='playing'&&
 !s.hobbyCircuit?.active&&s.workplace?.active?.status!=='ready'&&
 s.familyStories?.active?.status!=='ready'&&
 s.worldPulse?.active?.status!=='ready'&&(s.justice?.years||0)===0;
function electionCandidates(s,a,b){
 const available=[a,b].map(g=>{
  const incumbent=person(s,g.leaderId);
  const candidates=g.members.map(id=>person(s,id)).filter(Boolean);
  const challenger=candidates.filter(p=>p.id!==g.leaderId)
   .sort((x,y)=>y.trust-x.trust||x.id.localeCompare(y.id))[0];
  return incumbent&&challenger?{groupId:g.id,groupName:g.name,
   incumbentId:incumbent.id,incumbentName:brief(incumbent.name,70),
   challengerId:challenger.id,challengerName:brief(challenger.name,70),
   tension:g.tension}:null;
 }).filter(Boolean);
 return available.sort((x,y)=>y.tension-x.tension||x.groupId.localeCompare(y.groupId))[0]||null;
}
function modes(s,link){
 const joined=leaders(s,link);
 if(!joined||link.status==='dormant'||link.event?.status!=='planned'||
   !link.event.id||s.age>link.event.dueAge)return [];
 const kinds=[joined.a.kind,joined.b.kind];
 const out=['negotiation'];
 if(kinds.includes('community')||kinds.includes('family'))out.push('festival');
 if(kinds.includes('professional')||kinds.includes('rival-family'))out.push('competition');
 if(electionCandidates(s,joined.a,joined.b))out.push('election');
 return out;
}
function offersFor(s){
 const m=playableEventsState(s);
 if(m.active||!canParticipate(s))return [];
 return (s.organizationNetwork?.links||[]).flatMap(link=>{
  if(m.seen.includes(link.event?.id))return [];
  const available=modes(s,link);
  if(!available.length)return [];
  const g=leaders(s,link);
  return [{linkId:link.id,eventId:link.event.id,groupA:g.a.name,
   groupB:g.b.name,relationship:link.status,age:s.age,
   modes:available.map(mode=>({...publicEventModes[mode],mode,
    id:'publicplay:'+link.id+':'+mode}))}];
 }).slice(0,3);
}
export function playableEventCommands(s){
 const offers=offersFor(s);
 return offers.flatMap(o=>o.modes.map(m=>({id:m.id,label:'Play: '+m.title,
  detail:m.subtitle+' · '+o.groupA+' & '+o.groupB,
  enabled:s.actions>0})));
}
function announce(s,ctx,message){
 const m=ensure(s),msg=brief(message,230);
 m.news.push({age:s.age,text:msg});m.news=m.news.slice(-LIMIT_NEWS);
 ctx?.add?.(s,msg,'people');
}
export function playableEventStart(s,id,ctx={}){
 const cmd=playableEventCommands({...s,actions:s.actions+1})
  .find(c=>c.id===id&&c.enabled);
 if(!cmd)throw Error('This public event can no longer be hosted.');
 const offer=offersFor({...s,actions:s.actions+1})
  .find(o=>o.modes.some(m=>m.id===id));
 const mode=offer?.modes.find(m=>m.id===id)?.mode;
 const m=ensure(s),link=(s.organizationNetwork?.links||[]).find(l=>l.id===offer?.linkId);
 const leadersNow=link&&leaders(s,link);
 if(!mode||!link||!leadersNow)throw Error('These organizations are not currently available.');
 const ballot=mode==='election'?electionCandidates(s,leadersNow.a,leadersNow.b):null;
 if(mode==='election'&&!ballot)throw Error('A real challenger is required for the election.');
 m.seen.push(offer.eventId);m.seen=m.seen.slice(-LIMIT_SEEN);
 m.lastStartAge=s.age;
 const session={id:'public-game-g'+s.generation+'-'+(++m.serial),
  mode,linkId:link.id,eventId:offer.eventId,startedAge:s.age,
  stage:0,status:'playing',groupA:brief(leadersNow.a.name,100),
  groupB:brief(leadersNow.b.name,100),leaderA:leadersNow.pa.id,
  leaderB:leadersNow.pb.id,
  performance:45,fairness:50,engagement:40,pressure:30,
  ballot:ballot?{groupId:ballot.groupId,groupName:brief(ballot.groupName,100),
   incumbentId:ballot.incumbentId,incumbentName:ballot.incumbentName,
   challengerId:ballot.challengerId,challengerName:ballot.challengerName}:null,
  votesInc:0,votesChall:0,decisions:[],ending:null,endedAge:null,
  finalLine:null,newLeaderId:null,impact:null};
 m.active=session;
 // This playable event is a specific program within the scheduled public
 // gathering, not a parallel fictitious organization or paid performance.
 link.event.label=publicEventModes[mode].label;
 announce(s,ctx,'You volunteered to host '+link.event.label.toLowerCase()+
  ' for '+session.groupA+' and '+session.groupB+'.');
 return session;
}
function touch(s,id,trust,rivalry,label){
 const p=person(s,id);
 if(!p||(!trust&&!rivalry))return {trust:0,rivalry:0};
 if(p.kind==='person'){
  p.ref.world.trust=cap((p.ref.world.trust??p.trust)+trust);
  p.ref.world.rivalry=cap((p.ref.world.rivalry??p.rivalry)+rivalry);
  if(trust)p.ref.bond=cap((p.ref.bond??50)+Math.round(trust*.4));
  p.ref.memories??=[];
  p.ref.memories.push({age:s.age,text:brief(label,145)});
  p.ref.memories=p.ref.memories.slice(-15);
 }else{
  p.ref.trust=cap((p.ref.trust??p.trust)+trust);
  p.ref.rivalry=cap((p.ref.rivalry??p.rivalry)+rivalry);
  p.ref.history??=[];
  p.ref.history.push({age:s.age,kind:'public-event',event:brief(label,145)});
  p.ref.history=p.ref.history.slice(-18);
 }
 const after=person(s,id);
 return {trust:after.trust-p.trust,rivalry:after.rivalry-p.rivalry};
}
function effects(session,index){
 // Every option has a consistent underlying tradeoff but unique authored
 // presentation per scene. Option two always leaves player/NPC state neutral.
 if(index===2)return {performance:0,fairness:0,engagement:0,pressure:0,
  linkTrust:0,competition:0,aStanding:0,bStanding:0,aProgress:0,bProgress:0,
  leaderATrust:0,leaderBTrust:0,rivalryA:0,rivalryB:0,stat:null,statDelta:0};
 if(session.mode==='election'){
  return index===0?{performance:7,fairness:2,engagement:5,pressure:2,
   linkTrust:2,competition:1,aStanding:1,bStanding:0,
   aProgress:4,bProgress:0,leaderATrust:2,leaderBTrust:0,
   rivalryA:0,rivalryB:0,stat:'confidence',statDelta:1}:
   {performance:6,fairness:-2,engagement:7,pressure:4,
    linkTrust:-2,competition:4,aStanding:0,bStanding:1,
    aProgress:0,bProgress:4,leaderATrust:-2,leaderBTrust:2,
    rivalryA:3,rivalryB:0,stat:'confidence',statDelta:1};
 }
 const cooperative={
  performance:12,fairness:7,engagement:6,pressure:-5,
  linkTrust:5,competition:-4,aStanding:2,bStanding:2,
  aProgress:6,bProgress:6,leaderATrust:3,leaderBTrust:3,
  rivalryA:-2,rivalryB:-2,stat:session.mode==='festival'?'creativity':
    session.mode==='competition'?'performance':'social',statDelta:2
 };
 const coercive={
  performance:7,fairness:-9,engagement:8,pressure:9,
  linkTrust:-5,competition:8,aStanding:4,bStanding:-3,
  aProgress:5,bProgress:0,leaderATrust:3,leaderBTrust:-4,
  rivalryA:0,rivalryB:6,stat:'confidence',statDelta:2
 };
 return index===0?cooperative:coercive;
}
function closing(s,o,ctx,forced=null){
 const m=ensure(s),link=(s.organizationNetwork?.links||[]).find(l=>l.id===o.linkId);
 const real=link&&leaders(s,link);
 const acted=o.decisions.filter(d=>d.option!==2);
 let ending=forced||(
  !acted.length?'independent':
  o.mode==='election'?'pending-vote':
  o.fairness>=59&&o.performance>=67&&o.pressure<=49?
   ({negotiation:'agreement',festival:'celebrated',competition:'merit'}[o.mode]):
  o.pressure>=53||o.fairness<=35?
   ({negotiation:'escalation',festival:'divided',competition:'controversy'}[o.mode]):
   ({negotiation:'stalemate',festival:'quiet',competition:'draw'}[o.mode])
 );
 let newLeaderId=null;
 if(ending==='pending-vote'){
  const ballot=o.ballot;
  const g=group(s,ballot?.groupId),
   incumbent=person(s,ballot?.incumbentId),challenger=person(s,ballot?.challengerId);
  if(!g||g.status!=='active'||!incumbent||!challenger||
    !g.members.includes(incumbent.id)||!g.members.includes(challenger.id)){
   ending='interrupted';
  }else{
   const lead=incumbent.trust+o.votesInc+Math.round(g.cohesion/6);
   const challenge=challenger.trust+o.votesChall+Math.round((100-g.tension)/6);
   const challengerWins=challenge>lead;
   if(o.fairness<34)ending='disputed';
   else if(challengerWins){
    g.leaderId=challenger.id;ending='new-leader';newLeaderId=challenger.id;
   }else{ending='incumbent';newLeaderId=incumbent.id;}
   g.history.push({age:s.age,kind:'relationship',title:'Member leadership election',
    outcome:ending,description:brief('The leadership result was based on existing members, their trust and the public debate.',240)});
   g.history=g.history.slice(-8);
  }
 }
 const messages={
  agreement:'Both organizations accepted a balanced public agreement.',
  celebrated:'The groups held a shared festival that recognized both communities.',
  merit:'The public challenge ended with a transparent skills assessment.',
  escalation:'One-sided demands deepened the public disagreement.',
  divided:'The festival highlighted divisions between the organizers.',
  controversy:'The skills competition ended amid a dispute over fairness.',
  stalemate:'The groups preserved their independence without reaching agreement.',
  quiet:'The community gathering ended without a clear joint achievement.',
  draw:'Neither team earned a decisive advantage in the challenge.',
  'new-leader':'Real members selected a different leader for the organization.',
  incumbent:'The incumbent retained the support of the known members.',
  disputed:'The leadership process became contested instead of settling the dispute.',
  independent:'You left the organizations to choose their own path.',
  interrupted:'The original gathering could not continue with the same real participants.',
  abandoned:'You stepped away from the unfinished public event.'
 };
 o.status='completed';o.ending=ending;o.endedAge=s.age;o.newLeaderId=newLeaderId;
 o.finalLine=brief(o.groupA+' and '+o.groupB+': '+messages[ending],240);
 if(link){
  // Existing intergroup records support only their own validated outcomes.
  const archival=ending==='agreement'?'negotiated':
   ['escalation','divided','controversy','disputed'].includes(ending)?'fractured':
   ['new-leader','incumbent'].includes(ending)?'transition':
   ['interrupted','abandoned'].includes(ending)?'paused':
   ['celebrated','merit'].includes(ending)?'successful':'contested';
  link.history.push({age:s.age,kind:'player-story',
   label:brief(publicEventModes[o.mode].label+' — '+ending,130),outcome:archival});
  link.history=link.history.slice(-8);
 }
 m.completed.push({...o});m.completed=m.completed.slice(-LIMIT_COMPLETE);
 m.active=null;
 announce(s,ctx,o.finalLine);
 return o;
}
export function playableEventChoose(s,index,ctx={}){
 const m=ensure(s),o=m.active;
 if(!s.alive||s.pending!==null||!o||o.status!=='playing'||
  !Number.isInteger(index)||index<0||index>2)
  throw Error('This public-event decision is not available.');
 const link=(s.organizationNetwork?.links||[]).find(l=>l.id===o.linkId),reps=link&&leaders(s,link);
 if(!reps||link.event?.id!==o.eventId||link.event?.status!=='planned')
  throw Error('This original public event is no longer active.');
 const script=publicEventModes[o.mode],phase=script.phases[o.stage];
 if(!phase)throw Error('This public event has already concluded.');
 const choice=effects(o,index),before={trust:link.trust,
  competition:link.competition,aStanding:reps.a.standing,
  bStanding:reps.b.standing,aProgress:reps.a.project?.progress??0,
  bProgress:reps.b.project?.progress??0,
  stat:choice.stat?s.stats[choice.stat]:null};
 o.performance=cap(o.performance+choice.performance);
 o.fairness=cap(o.fairness+choice.fairness);
 o.engagement=cap(o.engagement+choice.engagement);
 o.pressure=cap(o.pressure+choice.pressure);
 link.trust=cap(link.trust+choice.linkTrust);
 link.competition=cap(link.competition+choice.competition);
 link.status=link.competition>=70&&link.trust<=52?'competing':
  link.trust>=70&&link.competition<=45?'allied':
  link.trust>=56&&link.competition<60?'cooperating':
  link.competition>=56||link.trust<=35?'strained':'neutral';
 reps.a.standing=cap(reps.a.standing+choice.aStanding);
 reps.b.standing=cap(reps.b.standing+choice.bStanding);
 if(reps.a.project?.status==='active')reps.a.project.progress=cap(reps.a.project.progress+choice.aProgress);
 if(reps.b.project?.status==='active')reps.b.project.progress=cap(reps.b.project.progress+choice.bProgress);
 const a=touch(s,reps.pa.id,choice.leaderATrust,choice.rivalryA,phase.title+': '+phase.choices[index]);
 const b=touch(s,reps.pb.id,choice.leaderBTrust,choice.rivalryB,phase.title+': '+phase.choices[index]);
 if(choice.stat)ctx.change?.(s,choice.stat,choice.statDelta);
 if(o.mode==='election'&&o.ballot){
  if(index===0)o.votesInc+=12;
  if(index===1)o.votesChall+=18;
 }
 const d={stage:o.stage,option:index,age:s.age,label:brief(phase.choices[index],110),
  trustDelta:link.trust-before.trust,
  competitionDelta:link.competition-before.competition,
  standingA:reps.a.standing-before.aStanding,
  standingB:reps.b.standing-before.bStanding,
  progressA:(reps.a.project?.progress??before.aProgress)-before.aProgress,
  progressB:(reps.b.project?.progress??before.bProgress)-before.bProgress,
  npcTrustA:a.trust,npcTrustB:b.trust,npcRivalryA:a.rivalry,npcRivalryB:b.rivalry,
  stat:choice.stat,statDelta:choice.stat?s.stats[choice.stat]-before.stat:0};
 o.decisions.push(d);o.stage++;
 if(o.stage>=3)closing(s,o,ctx);
 return d;
}
export function playableEventLeave(s,ctx={}){
 const m=ensure(s);
 if(!s.alive||!m.active)throw Error('No active public event to leave.');
 return closing(s,m.active,ctx,'abandoned');
}
export function playableEventsYear(s,ctx={}){
 const m=ensure(s),o=m.active;
 if(!o)return;
 const l=(s.organizationNetwork?.links||[]).find(x=>x.id===o.linkId);
 if(!s.alive||!l||l.event?.id!==o.eventId||
   l.event?.status!=='planned'||!leaders(s,l)||s.age-o.startedAge>2)
  closing(s,o,ctx,'interrupted');
}
export function playableEventView(s){
 const m=playableEventsState(s),o=m.active;
 return {
  age:s.age,
  offers:offersFor(s),
  active:o?(()=>{
   const l=(s.organizationNetwork?.links||[]).find(x=>x.id===o.linkId),
    reps=l&&leaders(s,l);
   return {...o,
    phase:publicEventModes[o.mode].phases[o.stage],
    title:publicEventModes[o.mode].title,
    colorName:publicEventModes[o.mode].type,
    representativeA:reps?.pa.name||person(s,o.leaderA)?.name||null,
    representativeB:reps?.pb.name||person(s,o.leaderB)?.name||null,
    groupTrust:l?.trust??null,competition:l?.competition??null,
    ballot:o.ballot?{...o.ballot,
     incumbentTrust:person(s,o.ballot.incumbentId)?.trust??null,
     challengerTrust:person(s,o.ballot.challengerId)?.trust??null}:null
   };
  })():null,
  recent:m.completed.slice(-9).reverse().map(o=>({
   id:o.id,mode:o.mode,groupA:o.groupA,groupB:o.groupB,
   startedAge:o.startedAge,endedAge:o.endedAge,ending:o.ending,
   title:publicEventModes[o.mode].title,finalLine:o.finalLine,
   decisions:o.decisions.map(x=>({...x})),
   newLeaderId:o.newLeaderId,
   score:{performance:o.performance,fairness:o.fairness,engagement:o.engagement}
  })),
  ancestors:m.ancestors.slice().reverse(),
  news:m.news.slice(-8).reverse(),
  total:m.completed.length
 };
}
export function playableEventsInheritance(next,old){
 const previous=playableEventsState(old),m=fresh();
 const important=previous.completed.filter(x=>[
  'agreement','celebrated','merit','new-leader','escalation','controversy','disputed'
 ].includes(x.ending)).slice(-3);
 m.ancestors=[...previous.ancestors,{
  generation:old.generation,name:brief(old.name,32),
  note:brief(important.length?important.map(x=>x.title+': '+x.ending).join('; '):
   'Past generations held public events without automatically passing on personal power.',230)
 }].slice(-LIMIT_ANCESTORS);
 next.playableEvents=m;
}
export function validatePlayableEvents(m){
 if(m===undefined)return true;
 const endings=['agreement','celebrated','merit','escalation','divided',
  'controversy','stalemate','quiet','draw','new-leader','incumbent',
  'disputed','independent','interrupted','abandoned'];
 const ballot=b=>b===null||b&&text(b.groupId,100)&&text(b.groupName,100)&&
  text(b.incumbentId,100)&&text(b.incumbentName,70)&&text(b.challengerId,100)&&
  text(b.challengerName,70)&&b.incumbentId!==b.challengerId;
 const decision=d=>d&&[0,1,2].includes(d.stage)&&[0,1,2].includes(d.option)&&
  age(d.age)&&text(d.label,110)&&
  ['trustDelta','competitionDelta','standingA','standingB','progressA','progressB',
   'npcTrustA','npcTrustB','npcRivalryA','npcRivalryB','statDelta'].every(k=>signed(d[k]))&&
  (d.stat===null||['social','confidence','creativity','performance'].includes(d.stat));
 const record=o=>o&&text(o.id,100)&&MODES.includes(o.mode)&&
  text(o.linkId,190)&&text(o.eventId,200)&&age(o.startedAge)&&
  [0,1,2,3].includes(o.stage)&&['playing','completed'].includes(o.status)&&
  text(o.groupA,100)&&text(o.groupB,100)&&
  text(o.leaderA,100)&&text(o.leaderB,100)&&
  [o.performance,o.fairness,o.engagement,o.pressure].every(score)&&
  ballot(o.ballot)&&(o.mode==='election'?o.ballot!==null:o.ballot===null)&&
  Number.isInteger(o.votesInc)&&o.votesInc>=0&&o.votesInc<=36&&
  Number.isInteger(o.votesChall)&&o.votesChall>=0&&o.votesChall<=54&&
  Array.isArray(o.decisions)&&o.decisions.length===o.stage&&o.decisions.every(decision)&&
  o.decisions.every((d,i)=>d.stage===i)&&
  (o.ending===null||endings.includes(o.ending))&&
  (o.endedAge===null||age(o.endedAge))&&
  (o.finalLine===null||text(o.finalLine,240))&&
  (o.newLeaderId===null||text(o.newLeaderId,100))&&
  (o.impact===null||typeof o.impact==='object')&&
  (o.status==='playing'?o.stage<3&&o.ending===null&&o.endedAge===null&&o.finalLine===null:
   o.ending!==null&&o.endedAge!==null&&text(o.finalLine,240));
 return !!m&&m.version===1&&Number.isInteger(m.serial)&&m.serial>=0&&
  (m.active===null||record(m.active)&&m.active.status==='playing')&&
  Array.isArray(m.completed)&&m.completed.length<=LIMIT_COMPLETE&&
  m.completed.every(o=>record(o)&&o.status==='completed')&&
  Array.isArray(m.seen)&&m.seen.length<=LIMIT_SEEN&&
  m.seen.every(v=>text(v,200))&&new Set(m.seen).size===m.seen.length&&
  new Set([...m.completed,...(m.active?[m.active]:[])].map(o=>o.id)).size===
    m.completed.length+(m.active?1:0)&&
  Array.isArray(m.news)&&m.news.length<=LIMIT_NEWS&&
  m.news.every(n=>age(n.age)&&text(n.text,230))&&
  Array.isArray(m.ancestors)&&m.ancestors.length<=LIMIT_ANCESTORS&&
  m.ancestors.every(n=>Number.isInteger(n.generation)&&n.generation>=1&&
   text(n.name,32)&&text(n.note,230))&&
  Number.isInteger(m.lastStartAge)&&m.lastStartAge>=-100;
}
