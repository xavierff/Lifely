// Lifely 1.22.0 — autonomous inter-organization relationships.
// Every group and representative is a live record in socialCircles/people/alumni.
// Deterministic public initiatives, optional player choices; no extra RNG or money.
const cap=x=>Math.max(0,Math.min(100,Math.round(x)));
const trim=(v,n=235)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,n);
const validText=(v,n)=>typeof v==='string'&&v.length>0&&v.length<=n;
const ageOK=x=>Number.isInteger(x)&&x>=0&&x<=110;
const numeric=x=>typeof x==='number'&&Number.isFinite(x);
const score=x=>numeric(x)&&x>=0&&x<=100;
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
const LIMIT_LINKS=12,LIMIT_DONE=24,LIMIT_NEWS=25,LIMIT_ANCESTORS=10,LIMIT_HISTORY=8;
const endStates=['coalition','negotiated','public-feud','fractured','independent','unanswered','dissolved'];
const empty=()=>({version:1,serial:0,links:[],active:null,completed:[],news:[],
 ancestors:[],lastLinkAge:-100,lastOfferAge:-100});
export const organizationNetworkState=s=>s.organizationNetwork||empty();
const ensure=s=>s.organizationNetwork??=empty();

function person(s,id){
 if(!id)return null;
 if(id.startsWith('person-')){
  const p=(s.people||[]).find(x=>'person-'+x.id===id&&x.alive&&x.age>=18&&x.world);
  return p?{id,name:p.name,trust:cap(p.world.trust??p.bond??50),
    rivalry:cap(p.world.rivalry??0),kind:'family',ref:p}:null;
 }
 const p=(s.world?.autonomy?.alumni||[]).find(x=>x.id===id);
 return p?{id,name:p.name,trust:cap(p.trust??50),
   rivalry:cap(p.rivalry??10),kind:'alumni',ref:p}:null;
}
function liveGroup(s,id){
 const g=(s.socialCircles?.groups||[]).find(x=>x.id===id);
 return g?.status==='active'&&g.members?.length&&g.leaderId&&
  g.members.includes(g.leaderId)&&person(s,g.leaderId)?g:null;
}
const pairKey=(a,b)=>[a,b].sort().join('|');
const sharedMembers=(a,b)=>a.members.filter(id=>b.members.includes(id)).length;
const fracturePair=(a,b)=>a.institution?.parentId===b.id||b.institution?.parentId===a.id;
const overlapType=(a,b)=>{
 if(fracturePair(a,b))return 'contest';
 if(a.kind==='rival-family'||b.kind==='rival-family')return 'contest';
 if(a.kind==='professional'&&b.kind==='community'||a.kind==='community'&&b.kind==='professional')return 'joint-service';
 if(a.kind==='family'&&b.kind==='community'||a.kind==='community'&&b.kind==='family')return 'shared-neighborhood';
 return 'exchange';
};
const eventLabel=kind=>({
 'contest':'Public dialogue between competing households',
 'joint-service':'Open skills and community fair',
 'shared-neighborhood':'Intergenerational neighborhood forum',
 'exchange':'Cross-organization public assembly'
}[kind]);
function publicEvent(s,link,n){
 return {id:link.id+'-event-'+n,label:eventLabel(link.theme),startedAge:s.age,
  dueAge:Math.min(110,s.age+3),progress:10,status:'planned'};
}
function history(link,s,kind,label,outcome){
 link.history.push({age:s.age,kind,label:trim(label,130),outcome:trim(outcome,35)});
 link.history=link.history.slice(-LIMIT_HISTORY);
}
function announce(s,ctx,message){
 const m=ensure(s),line=trim(message,235);
 m.news.push({age:s.age,text:line});m.news=m.news.slice(-LIMIT_NEWS);
 ctx?.add?.(s,line,'people');
}
function startLink(s,a,b,ctx){
 const m=ensure(s),id='org-link-'+a.id+'-'+b.id;
 const paired=sharedMembers(a,b)>0,contest=a.kind==='rival-family'||b.kind==='rival-family'||fracturePair(a,b);
 const link={id,key:pairKey(a.id,b.id),aId:a.id,bId:b.id,
  aName:trim(a.name,100),bName:trim(b.name,100),
  theme:overlapType(a,b),status:'neutral',trust:cap(
   50+(paired?12:0)+(contest?-15:8)+Math.round((a.cohesion+b.cohesion-110)/15)),
  competition:cap(25+(contest?28:0)+
   Math.round((a.tension+b.tension-65)/13)),
  leaderA:a.leaderId,leaderB:b.leaderId,years:0,lastAge:s.age,
  publicEventsHeld:0,event:null,history:[]};
 link.status=interpret(link);
 link.event=publicEvent(s,link,1);
 m.links.push(link);m.lastLinkAge=s.age;
 announce(s,ctx,a.name+' and '+b.name+' began a '+(contest?'competitive':'cooperative')+' dialogue.');
 return link;
}
function interpret(l){
 if(l.competition>=70&&l.trust<=52)return 'competing';
 if(l.trust>=70&&l.competition<=45)return 'allied';
 if(l.trust>=56&&l.competition<60)return 'cooperating';
 if(l.competition>=56||l.trust<=35)return 'strained';
 return 'neutral';
}
function pairs(s){
 const groups=(s.socialCircles?.groups||[]).filter(g=>liveGroup(s,g.id));
 const options=[];
 for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++){
  const a=groups[i],b=groups[j],key=pairKey(a.id,b.id);
  if((s.organizationNetwork?.links||[]).some(l=>l.key===key))continue;
  options.push({a,b,key,priority:sharedMembers(a,b)*8+(fracturePair(a,b)?30:0)+
   (a.kind==='rival-family'||b.kind==='rival-family'?8:0)+
   (a.kind!==b.kind?4:0)+(a.standing+b.standing)/20});
 }
 return options.sort((x,y)=>y.priority-x.priority||x.key.localeCompare(y.key));
}
function refreshLeaders(s,l,a,b){
 const lastA=l.leaderA,lastB=l.leaderB;
 if(lastA===a.leaderId&&lastB===b.leaderId)return;
 l.leaderA=a.leaderId;l.leaderB=b.leaderId;
 const changed=lastA!==l.leaderA?person(s,l.leaderA)?.name:null;
 const changed2=lastB!==l.leaderB?person(s,l.leaderB)?.name:null;
 history(l,s,'leadership',
  'New leadership: '+[changed&&a.name+' — '+changed,changed2&&b.name+' — '+changed2]
   .filter(Boolean).join('; '),
  'transition');
 l.trust=cap(l.trust-2);
 l.competition=cap(l.competition+2);
}
function activeEventTick(s,l,a,b,ctx){
 if(l.event?.status==='paused'){
  l.event=publicEvent(s,l,Math.min(110,l.publicEventsHeld+1));
  history(l,s,'public-event','An earlier cross-group gathering resumed','resumed');
 }
 if(!l.event||l.event.status!=='planned')l.event=publicEvent(s,l,Math.min(110,l.publicEventsHeld+1));
 const ev=l.event;
 const swing=(hash(l.key+'|'+s.age)%5)-2;
 const avgCohesion=(a.cohesion+b.cohesion)/2;
 const avgTension=(a.tension+b.tension)/2;
 ev.progress=cap(ev.progress+Math.max(1,
  Math.round(10+(avgCohesion-avgTension)/13+swing)));
 if(s.age<ev.dueAge)return;
 const success=ev.progress>=52&&l.trust>=l.competition;
 const outcome=success?'successful':'contested';
 // These are group-only outcomes. The player never receives free cash,
 // relationships, achievement points, or reputation for watching.
 a.standing=cap(a.standing+(success?2:-1));
 b.standing=cap(b.standing+(success?2:-1));
 l.trust=cap(l.trust+(success?3:-2));
 l.competition=cap(l.competition+(success?-2:3));
 history(l,s,'public-event',ev.label,outcome);
 l.publicEventsHeld=Math.min(99,l.publicEventsHeld+1);
 announce(s,ctx,ev.label+' hosted by '+a.name+' and '+b.name+' was '+outcome+'.');
 l.event=publicEvent(s,l,Math.min(110,l.publicEventsHeld+1));
}
function evolve(s,l,ctx){
 if(s.age<=l.lastAge)return;
 const a=liveGroup(s,l.aId),b=liveGroup(s,l.bId);
 if(!a||!b){
  if(l.status!=='dormant'){
   history(l,s,'status','Group relationship paused because a real member or organization was unavailable','paused');
  }
  l.status='dormant';l.leaderA=null;l.leaderB=null;
  if(l.event)l.event.status='paused';
  l.lastAge=s.age;
  return;
 }
 const resumed=l.status==='dormant';
 refreshLeaders(s,l,a,b);
 if(resumed){
  l.status='neutral';
  history(l,s,'status','The groups reconnected through current living members','resumed');
 }
 const overlap=sharedMembers(a,b);
 const compatible=l.theme==='contest'?-2:2;
 const trustDelta=Math.max(-4,Math.min(4,
  Math.round((a.cohesion+b.cohesion-110)/26)+
  Math.round((l.competition-50)/-30)+(overlap?1:0)+compatible));
 const rivalryDelta=Math.max(-4,Math.min(4,
  Math.round((a.tension+b.tension-75)/24)+(l.theme==='contest'?2:-1)-
   (overlap?1:0)));
 l.trust=cap(l.trust+trustDelta);l.competition=cap(l.competition+rivalryDelta);
 l.lastAge=s.age;l.years=Math.min(110,l.years+1);
 activeEventTick(s,l,a,b,ctx);
 const status=interpret(l);
 if(l.status!==status){
  history(l,s,'status','Intergroup relationship changed from '+l.status+' to '+status,status);
  l.status=status;
 }
}
function representatives(s,l){
 const a=liveGroup(s,l.aId),b=liveGroup(s,l.bId);
 if(!a||!b)return null;
 const one=person(s,a.leaderId);
 let two=person(s,b.leaderId);
 if(one?.id===two?.id){
  const alternate=b.members.map(id=>person(s,id)).find(x=>x&&x.id!==one.id);
  two=alternate||null;
 }
 return one&&two?{a,b,one,two}:null;
}
function offerCandidate(s){
 const m=ensure(s);
 if(m.active||s.age-m.lastOfferAge<4||s.age<20||s.age>103)return null;
 // Do not add another scene while an existing group scene requires a choice.
 if((s.socialCircles?.invites||[]).some(x=>x.status==='open'||x.status==='ready'))return null;
 return m.links.filter(l=>l.status!=='dormant'&&representatives(s,l))
  .sort((x,y)=>(
   (y.competition+y.trust)/2-(x.competition+x.trust)/2
  )||x.id.localeCompare(y.id))
  .find(l=>!m.completed.some(c=>c.linkId===l.id&&s.age-c.endedAge<6))||null;
}
function openEvent(s,l,ctx){
 const m=ensure(s),reps=representatives(s,l);
 if(!reps)return;
 const scene={id:'org-scene-g'+s.generation+'-'+(++m.serial),
  linkId:l.id,aId:l.aId,bId:l.bId,
  aName:trim(reps.a.name,100),bName:trim(reps.b.name,100),
  startedAge:s.age,dueAge:Math.min(110,s.age+2),
  stage:0,status:'open',decisions:[],ending:null,endedAge:null,finalLine:null,
  firstTrust:l.trust,firstCompetition:l.competition,
  initialA:reps.one.id,initialB:reps.two.id};
 m.active=scene;m.lastOfferAge=s.age;
 announce(s,ctx,reps.a.name+' and '+reps.b.name+' are preparing a shared public gathering. Your involvement is optional.');
}
const choices=(s,scene)=>{
 const a=scene.aName,b=scene.bName,followup=scene.stage===1;
 if(!followup)return [
  {index:0,tag:'broker',label:'Broker a public pact between both groups',
   detail:'Build trust, ease competition and support both groups’ actual projects',
   linkTrust:12,linkCompetition:-8,aStanding:3,bStanding:3,
   aProgress:7,bProgress:7,leaderA:5,leaderB:5,leaderRivalryA:-3,leaderRivalryB:-3,
   stat:'social',statDelta:3},
  {index:1,tag:'favor-a',label:'Back '+trim(a,45)+' over '+trim(b,45),
   detail:'Gain favor with one leader while deepening the opposing group’s rivalry',
   linkTrust:-8,linkCompetition:12,aStanding:4,bStanding:-3,
   aProgress:4,bProgress:0,leaderA:6,leaderB:-5,leaderRivalryA:0,leaderRivalryB:8,
   stat:'confidence',statDelta:3},
  {index:2,tag:'independent',label:'Let the organizations decide independently',
   detail:'Do not change anyone’s standing, trust or resources',
   linkTrust:0,linkCompetition:0,aStanding:0,bStanding:0,
   aProgress:0,bProgress:0,leaderA:0,leaderB:0,leaderRivalryA:0,leaderRivalryB:0,
   stat:null,statDelta:0}
 ];
 return [
  {index:0,tag:'mediate',label:'Renew the intergroup agreement',
   detail:'Revisit the promises made two years earlier and try to preserve cooperation',
   linkTrust:10,linkCompetition:-7,aStanding:3,bStanding:3,
   aProgress:6,bProgress:6,leaderA:4,leaderB:4,leaderRivalryA:-3,leaderRivalryB:-3,
   stat:'social',statDelta:2},
  {index:1,tag:'favor-b',label:'Support '+trim(b,45)+' in the follow-up',
   detail:'Change sides; the other leader may respond with resentment',
   linkTrust:-7,linkCompetition:11,aStanding:-3,bStanding:5,
   aProgress:0,bProgress:5,leaderA:-5,leaderB:6,leaderRivalryA:8,leaderRivalryB:0,
   stat:'confidence',statDelta:3},
  {index:2,tag:'independent',label:'Leave the future to the two organizations',
   detail:'Neither group receives a guaranteed favor or penalty',
   linkTrust:0,linkCompetition:0,aStanding:0,bStanding:0,
   aProgress:0,bProgress:0,leaderA:0,leaderB:0,leaderRivalryA:0,leaderRivalryB:0,
   stat:null,statDelta:0}
 ];
};
function npcDelta(s,id,trust,rivalry,label){
 const npc=person(s,id);
 if(!npc||(!trust&&!rivalry))return {trust:0,rivalry:0};
 if(npc.kind==='family'){
  npc.ref.world.trust=cap((npc.ref.world.trust??npc.trust)+trust);
  npc.ref.world.rivalry=cap((npc.ref.world.rivalry??npc.rivalry)+rivalry);
  if(trust!==0)npc.ref.bond=cap((npc.ref.bond??50)+Math.round(trust*.5));
  npc.ref.memories??=[];npc.ref.memories.push({age:s.age,text:trim(label,150)});
  npc.ref.memories=npc.ref.memories.slice(-15);
 }else{
  npc.ref.trust=cap((npc.ref.trust??npc.trust)+trust);
  npc.ref.rivalry=cap((npc.ref.rivalry??npc.rivalry)+rivalry);
  npc.ref.history??=[];
  npc.ref.history.push({age:s.age,kind:'intergroup',event:trim(label,150)});
  npc.ref.history=npc.ref.history.slice(-18);
 }
 const result=person(s,id);
 return {trust:result.trust-npc.trust,rivalry:result.rivalry-npc.rivalry};
}
const blocked=s=>!s.alive||s.pending!==null||s.mini||
 s.world?.network?.conversation||s.world?.storyDirector?.active||
 s.fate?.active?.status==='playing'||s.careerCampaigns?.active||
 s.everydayScenes?.active||s.hobbyCircuit?.active||
 s.workplace?.active?.status==='ready'||s.familyStories?.active?.status==='ready'||
 s.worldPulse?.active?.status==='ready'||(s.justice?.years||0)>0;
export function organizationNetworkCommands(s){
 const m=organizationNetworkState(s),scene=m.active;
 if(!scene||!['open','ready'].includes(scene.status))return [];
 const link=m.links.find(l=>l.id===scene.linkId),reps=link&&representatives(s,link);
 return choices(s,scene).map(c=>({
  id:'intergroup:'+scene.id+':'+c.index,label:c.label,
  detail:c.detail+' · '+scene.aName+' & '+scene.bName,
  enabled:!blocked(s)&&s.actions>0&&!!reps
 }));
}
function closeEvent(s,scene,ctx,reason=null){
 const m=ensure(s),l=m.links.find(x=>x.id===scene.linkId),
  reps=l&&representatives(s,l);
 const played=scene.decisions.filter(x=>x.tag!=='independent');
 let ending=reason||(played.length===0?'independent':
  !reps?'dissolved':
  l.trust>=67&&l.competition<=51&&played.some(x=>['broker','mediate'].includes(x.tag))?'coalition':
  l.competition>=65||l.trust<=36?'public-feud':
  played.some(x=>['broker','mediate'].includes(x.tag))&&l.trust>=52?'negotiated':
  played.some(x=>['favor-a','favor-b'].includes(x.tag))?'fractured':'independent');
 const endings={
  coalition:'Both organizations kept a genuine working partnership.',
  negotiated:'Their leaders compromised while retaining separate priorities.',
  'public-feud':'Competition became a persistent intergroup feud.',
  fractured:'A disagreement created divisions rather than a unified front.',
  independent:'The two groups continued without the player directing them.',
  unanswered:'The public invitation passed without a player response.',
  dissolved:'The original living group partnership is not currently viable.'
 };
 scene.status='completed';scene.endedAge=s.age;scene.ending=ending;
 scene.finalLine=trim(scene.aName+' and '+scene.bName+': '+endings[ending],245);
 m.active=null;m.completed.push({...scene});m.completed=m.completed.slice(-LIMIT_DONE);
 if(l){
  history(l,s,'player-story','A public intergroup decision ended '+ending,ending);
  for(const id of [l.aId,l.bId]){
   const g=(s.socialCircles?.groups||[]).find(x=>x.id===id);
   if(g){
    g.history.push({age:s.age,kind:'relationship',title:'A public intergroup decision',
     outcome:ending,description:trim(endings[ending],240)});
    g.history=g.history.slice(-8);
   }
  }
 }
 announce(s,ctx,scene.finalLine);
 return ending;
}
export function organizationNetworkAct(s,id,ctx){
 const parsed=/^intergroup:(org-scene-g[0-9]+-[0-9]+):([012])$/.exec(id);
 if(!parsed||!organizationNetworkCommands({...s,actions:s.actions+1})
  .some(c=>c.id===id&&c.enabled))throw Error('This intergroup decision is unavailable.');
 const m=ensure(s),o=m.active;
 if(!o||o.id!==parsed[1])throw Error('This public gathering is no longer active.');
 const l=m.links.find(x=>x.id===o.linkId),reps=representatives(s,l);
 if(!reps)throw Error('The group representatives are no longer available.');
 const selected=choices(s,o)[Number(parsed[2])];
 const old={
  trust:l.trust,competition:l.competition,aStanding:reps.a.standing,bStanding:reps.b.standing,
  aProgress:reps.a.project?.progress??0,bProgress:reps.b.project?.progress??0,
  stat:selected.stat?s.stats[selected.stat]:null
 };
 l.trust=cap(l.trust+selected.linkTrust);
 l.competition=cap(l.competition+selected.linkCompetition);
 reps.a.standing=cap(reps.a.standing+selected.aStanding);
 reps.b.standing=cap(reps.b.standing+selected.bStanding);
 if(reps.a.project?.status==='active')reps.a.project.progress=cap(reps.a.project.progress+selected.aProgress);
 if(reps.b.project?.status==='active')reps.b.project.progress=cap(reps.b.project.progress+selected.bProgress);
 const effectA=npcDelta(s,reps.one.id,selected.leaderA,selected.leaderRivalryA,
  'Intergroup gathering: '+selected.label);
 const effectB=npcDelta(s,reps.two.id,selected.leaderB,selected.leaderRivalryB,
  'Intergroup gathering: '+selected.label);
 if(selected.stat)ctx.change(s,selected.stat,selected.statDelta);
 l.status=interpret(l);
 const record={age:s.age,tag:selected.tag,label:selected.label,
  representativeA:reps.one.id,representativeB:reps.two.id,
  trustDelta:l.trust-old.trust,competitionDelta:l.competition-old.competition,
  aStandingDelta:reps.a.standing-old.aStanding,bStandingDelta:reps.b.standing-old.bStanding,
  aProgressDelta:(reps.a.project?.progress??old.aProgress)-old.aProgress,
  bProgressDelta:(reps.b.project?.progress??old.bProgress)-old.bProgress,
  npcTrustA:effectA.trust,npcTrustB:effectB.trust,
  npcRivalryA:effectA.rivalry,npcRivalryB:effectB.rivalry,
  stat:selected.stat,statDelta:selected.stat?s.stats[selected.stat]-old.stat:0};
 o.decisions.push(record);
 if(o.stage===0){
  o.stage=1;o.status='waiting';o.dueAge=Math.min(110,s.age+2);
  announce(s,ctx,'You chose to '+selected.label.toLowerCase()+
   '. The organizations continue working toward their public event.');
 }else{
  o.stage=2;closeEvent(s,o,ctx);
 }
 return record;
}
export function organizationNetworkYear(s,ctx={}){
 if(!s.alive||s.age<18)return;
 const m=ensure(s);
 for(const l of m.links)evolve(s,l,ctx);
 if(m.active){
  const o=m.active,l=m.links.find(x=>x.id===o.linkId);
  if(!l||!representatives(s,l))closeEvent(s,o,ctx,'dissolved');
  else if(o.status==='open'&&s.age>=o.startedAge+2)closeEvent(s,o,ctx,'unanswered');
  else if(o.status==='waiting'&&s.age>=o.dueAge){
   o.status='ready';
   announce(s,ctx,'Two years passed. Leaders of '+o.aName+
    ' and '+o.bName+' are ready to reconsider the public agreement.');
  }else if(o.status==='ready'&&s.age>=o.dueAge+2)closeEvent(s,o,ctx);
 }
 if(s.age<=103&&m.links.length<LIMIT_LINKS&&s.age-m.lastLinkAge>=1){
  const next=pairs(s)[0];
  if(next)startLink(s,next.a,next.b,ctx);
 }
 const offer=offerCandidate(s);
 if(offer)openEvent(s,offer,ctx);
}
export function organizationNetworkView(s){
 const m=organizationNetworkState(s);
 return {
  age:s.age,
  links:m.links.map(l=>{
   const groups=(s.socialCircles?.groups||[]);
   const a=groups.find(g=>g.id===l.aId),b=groups.find(g=>g.id===l.bId);
   const reps=representatives(s,l);
   return {...l,
    aName:a?.name||l.aName,bName:b?.name||l.bName,
    aKind:a?.kind||null,bKind:b?.kind||null,
    membersA:a?.members?.length??0,membersB:b?.members?.length??0,
    representativeA:reps?.one?.name||person(s,l.leaderA)?.name||null,
    representativeB:reps?.two?.name||person(s,l.leaderB)?.name||null,
    memberOverlap:a&&b?sharedMembers(a,b):0,
    history:l.history.slice(-5).reverse(),
    event:l.event?{...l.event}:null};
  }),
  active:m.active?(()=>{
   const o=m.active,l=m.links.find(x=>x.id===o.linkId),r=l&&representatives(s,l);
   return {...o,aKind:(s.socialCircles?.groups||[]).find(g=>g.id===o.aId)?.kind||null,
    bKind:(s.socialCircles?.groups||[]).find(g=>g.id===o.bId)?.kind||null,
    nowTrust:l?.trust??null,nowCompetition:l?.competition??null,
    relation:l?.status??'unknown',representativeA:r?.one?.name||null,
    representativeB:r?.two?.name||null,
    leaderChanged:!!r&&(r.one.id!==o.initialA||r.two.id!==o.initialB),
    publicEvent:l?.event?.label||null,lastDecision:o.decisions.at(-1)||null};
  })():null,
  completed:m.completed.slice(-9).reverse().map(o=>({
   id:o.id,aName:o.aName,bName:o.bName,ending:o.ending,
   aKind:(s.socialCircles?.groups||[]).find(g=>g.id===o.aId)?.kind||null,
   bKind:(s.socialCircles?.groups||[]).find(g=>g.id===o.bId)?.kind||null,
   finalLine:o.finalLine,endedAge:o.endedAge,decisions:o.decisions.length,
   linkId:o.linkId,played:o.decisions.some(d=>d.tag!=='independent')
  })),
  news:m.news.slice(-8).reverse(),
  ancestors:m.ancestors.slice().reverse(),count:m.completed.length
 };
}
export function organizationNetworkInheritance(next,old){
 const from=organizationNetworkState(old),m=empty();
 m.serial=from.serial;
 m.links=from.links.map(l=>({...l,
  status:'dormant',leaderA:null,leaderB:null,lastAge:next.age,
  event:l.event?{...l.event,status:'paused'}:null,
  history:l.history.slice(-LIMIT_HISTORY)}));
 const stories=from.completed.filter(x=>['coalition','public-feud','negotiated'].includes(x.ending)).slice(-3);
 const memory=stories.length?stories.map(x=>x.aName+' & '+x.bName+': '+x.ending).join('; '):
  from.links.slice(-2).map(x=>x.aName+' and '+x.bName+' had a history').join('; ')||
   'The family had no established intergroup ties.';
 m.ancestors=[...from.ancestors,{
  generation:old.generation,name:trim(old.name,32),note:trim(memory,230)
 }].slice(-LIMIT_ANCESTORS);
 next.organizationNetwork=m;
}
export function validateOrganizationNetwork(m){
 if(m===undefined)return true;
 const types=['contest','joint-service','shared-neighborhood','exchange'],
  statuses=['allied','cooperating','competing','strained','neutral','dormant'],
  eventStatuses=['planned','paused'],
  histTypes=['public-event','status','leadership','player-story'],
  outcomeNames=['successful','contested','paused','resumed','transition',...statuses,...endStates],
  stages=['open','waiting','ready','completed'],
  tags=['broker','favor-a','independent','mediate','favor-b'];
 const event=e=>e&&validText(e.id,200)&&validText(e.label,90)&&
  ageOK(e.startedAge)&&ageOK(e.dueAge)&&score(e.progress)&&eventStatuses.includes(e.status);
 const history=h=>h&&ageOK(h.age)&&histTypes.includes(h.kind)&&
  validText(h.label,130)&&outcomeNames.includes(h.outcome);
 const link=l=>l&&validText(l.id,190)&&validText(l.key,190)&&
  validText(l.aId,90)&&validText(l.bId,90)&&l.aId!==l.bId&&
  l.key===[l.aId,l.bId].sort().join('|')&&validText(l.aName,100)&&validText(l.bName,100)&&
  types.includes(l.theme)&&statuses.includes(l.status)&&score(l.trust)&&score(l.competition)&&
  (l.leaderA===null||validText(l.leaderA,100))&&
  (l.leaderB===null||validText(l.leaderB,100))&&
  (l.status!=='dormant'||l.leaderA===null&&l.leaderB===null)&&
  Number.isInteger(l.years)&&l.years>=0&&l.years<=110&&ageOK(l.lastAge)&&
  Number.isInteger(l.publicEventsHeld)&&l.publicEventsHeld>=0&&l.publicEventsHeld<=99&&
  (l.event===null||event(l.event))&&
  Array.isArray(l.history)&&l.history.length<=LIMIT_HISTORY&&l.history.every(history);
 const decision=d=>d&&ageOK(d.age)&&tags.includes(d.tag)&&validText(d.label,130)&&
  validText(d.representativeA,100)&&validText(d.representativeB,100)&&
  ['trustDelta','competitionDelta','aStandingDelta','bStandingDelta','aProgressDelta',
   'bProgressDelta','npcTrustA','npcTrustB','npcRivalryA','npcRivalryB','statDelta']
    .every(k=>numeric(d[k])&&Math.abs(d[k])<=100)&&
  (d.stat===null||['social','confidence'].includes(d.stat));
 const scene=o=>o&&validText(o.id,100)&&validText(o.linkId,190)&&
  validText(o.aId,90)&&validText(o.bId,90)&&o.aId!==o.bId&&
  validText(o.aName,100)&&validText(o.bName,100)&&
  ageOK(o.startedAge)&&ageOK(o.dueAge)&&[0,1,2].includes(o.stage)&&
  stages.includes(o.status)&&
  Array.isArray(o.decisions)&&o.decisions.length<=2&&o.decisions.every(decision)&&
  score(o.firstTrust)&&score(o.firstCompetition)&&
  validText(o.initialA,100)&&validText(o.initialB,100)&&
  (o.ending===null||endStates.includes(o.ending))&&
  (o.endedAge===null||ageOK(o.endedAge))&&
  (o.finalLine===null||validText(o.finalLine,245))&&
  (o.status==='open'?o.stage===0&&o.decisions.length===0&&o.ending===null:
   ['waiting','ready'].includes(o.status)?o.stage===1&&o.decisions.length===1&&o.ending===null:
   o.ending!==null&&o.endedAge!==null&&validText(o.finalLine,245));
 return !!m&&m.version===1&&Number.isInteger(m.serial)&&m.serial>=0&&
  Array.isArray(m.links)&&m.links.length<=LIMIT_LINKS&&m.links.every(link)&&
  new Set(m.links.map(x=>x.id)).size===m.links.length&&
  new Set(m.links.map(x=>x.key)).size===m.links.length&&
  (m.active===null||scene(m.active)&&m.active.status!=='completed'&&
   m.links.some(l=>l.id===m.active.linkId))&&
  Array.isArray(m.completed)&&m.completed.length<=LIMIT_DONE&&
  m.completed.every(o=>scene(o)&&o.status==='completed')&&
  new Set([...m.completed,...(m.active?[m.active]:[])].map(x=>x.id)).size===
   m.completed.length+(m.active?1:0)&&
  Array.isArray(m.news)&&m.news.length<=LIMIT_NEWS&&
  m.news.every(n=>ageOK(n.age)&&validText(n.text,235))&&
  Array.isArray(m.ancestors)&&m.ancestors.length<=LIMIT_ANCESTORS&&
  m.ancestors.every(a=>Number.isInteger(a.generation)&&a.generation>=1&&
   validText(a.name,32)&&validText(a.note,230))&&
  Number.isInteger(m.lastLinkAge)&&m.lastLinkAge>=-100&&
  Number.isInteger(m.lastOfferAge)&&m.lastOfferAge>=-100;
}
