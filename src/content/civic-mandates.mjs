// Lifely 1.25.0 — multi-year civic and professional proposals.
// Existing organizations advocate for their own interests without inventing
// voters, anonymous committee members, money or employment positions.
const cap=v=>Math.max(0,Math.min(100,Math.round(v)));
const short=(v,n=235)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,n);
const str=(v,n)=>typeof v==='string'&&v.length>0&&v.length<=n;
const age=v=>Number.isInteger(v)&&v>=0&&v<=110;
const score=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=100;
const signed=v=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=100;
const issues={
 'family-support':{name:'Family care & neighborhood support',
  question:'Can both organizations agree to a lasting family-support initiative?'},
 'skills-access':{name:'Apprenticeship & skills access',
  question:'Can the organizations make training opportunities accessible without favoritism?'},
 'shared-space':{name:'Shared neighborhood spaces',
  question:'Can rival organizations agree on how the local space should be used?'},
 'community-standards':{name:'Standards for a public community program',
  question:'What shared commitments should organizations make to their members?'}
};
const RESULTS=['joint-adoption','a-priority','b-priority','partial-compromise',
 'gridlock','dissolved'];
const fresh=()=>({version:1,serial:0,active:null,completed:[],used:[],
 news:[],ancestors:[],lastStartAge:-100,lastOfferAge:-100});
export const civicMandatesState=s=>s.civicMandates||fresh();
const ensure=s=>s.civicMandates??=fresh();
const group=(s,id)=>(s.socialCircles?.groups||[]).find(g=>g.id===id)||null;
const link=(s,id)=>(s.organizationNetwork?.links||[]).find(l=>l.id===id)||null;
function contact(s,id){
 if(!id||typeof id!=='string')return null;
 if(id.startsWith('person-')){
  const p=(s.people||[]).find(x=>'person-'+x.id===id&&x.alive&&x.age>=18&&x.world);
  return p?{id,name:p.name,trust:cap(p.world.trust??p.bond??50),
   rivalry:cap(p.world.rivalry??0),raw:p,kind:'family'}:null;
 }
 const p=(s.world?.autonomy?.alumni||[]).find(x=>x.id===id);
 return p?{id,name:p.name,trust:cap(p.trust??50),
  rivalry:cap(p.rivalry??0),raw:p,kind:'alumni'}:null;
}
function reps(s,l){
 const a=group(s,l?.aId),b=group(s,l?.bId);
 if(!a||!b||a.id===b.id||a.status!=='active'||b.status!=='active')return null;
 let pa=contact(s,a.leaderId);
 let pb=contact(s,b.leaderId);
 if(pa?.id===pb?.id){
  // Two real organizations can share an officeholder. In that case a
  // different living actual member represents one side of the debate.
  const otherB=b.members.map(id=>contact(s,id)).find(x=>x&&x.id!==pa.id);
  if(otherB)pb=otherB;
  else pa=a.members.map(id=>contact(s,id)).find(x=>x&&x.id!==pb.id)||null;
 }
 return pa&&pb&&a.members.includes(pa.id)&&b.members.includes(pb.id)?
  {a,b,pa,pb,l}:null;
}
function source(s){
 const m=civicMandatesState(s),candidates=[];
 for(const t of s.publicAftermath?.threads||[]){
  const l=link(s,t.linkId),r=reps(s,l);
  if(!r||m.used.includes('afterlife:'+t.id))continue;
  candidates.push({l,r,key:'afterlife:'+t.id,
   positive:t.affinity>=t.friction,priority:100+t.chapter*3,
   kind:t.kind});
 }
 for(const l of s.organizationNetwork?.links||[]){
  const r=reps(s,l);
  if(!r||l.publicEventsHeld<1)continue;
  const key='public-link:'+l.id+':'+l.publicEventsHeld;
  if(m.used.includes(key))continue;
  candidates.push({l,r,key,positive:l.trust>=l.competition,
   priority:20+l.publicEventsHeld,kind:null});
 }
 return candidates.sort((a,b)=>b.priority-a.priority||a.key.localeCompare(b.key))[0]||null;
}
function issueFor(c){
 const kinds=[c.r.a.kind,c.r.b.kind];
 if(kinds.includes('rival-family'))return 'shared-space';
 if(kinds.includes('professional'))return 'skills-access';
 if(kinds.includes('family')&&kinds.includes('community'))return 'family-support';
 return 'community-standards';
}
function report(s,ctx,message){
 const m=ensure(s),text=short(message,235);
 m.news.push({age:s.age,text});m.news=m.news.slice(-25);
 ctx?.add?.(s,text,'people');
}
function note(m,s,kind,message){
 m.history.push({age:s.age,kind,text:short(message,225)});
 m.history=m.history.slice(-12);
}
function launch(s,c,ctx){
 const m=ensure(s),issue=issueFor(c),r=c.r,l=c.l;
 const active={
  id:'mandate-g'+s.generation+'-'+(++m.serial),sourceKey:c.key,linkId:l.id,
  issue,groupAId:r.a.id,groupBId:r.b.id,
  groupAName:short(r.a.name,100),groupBName:short(r.b.name,100),
  leaderA:r.pa.id,leaderB:r.pb.id,
  officeA:r.a.leaderId,officeB:r.b.leaderId,
  leaderAName:short(r.pa.name,75),
  leaderBName:short(r.pb.name,75),
  startedAge:s.age,lastAge:s.age,nextAge:Math.min(110,s.age+2),
  expiryAge:Math.min(110,s.age+8),stage:0,status:'active',pending:false,
  offerAge:null,unavailableSince:null,
  supportA:cap((r.a.standing+r.a.cohesion)/2),
  supportB:cap((r.b.standing+r.b.cohesion)/2),
  commonGround:cap((l.trust+(c.positive?55:30))/2),
  resistance:cap((l.competition+(c.positive?25:60))/2),
  evidence:cap(((r.a.project?.progress??10)+(r.b.project?.progress??10))/2),
  decisions:[],history:[],endedAge:null,ending:null,finalLine:null
 };
 m.active=active;m.used.push(c.key);m.used=m.used.slice(-36);
 m.lastStartAge=s.age;
 note(active,s,'origin','Two actual organizations proposed a multi-year '+issues[issue].name.toLowerCase()+'.');
 report(s,ctx,r.a.name+' and '+r.b.name+' began a public mandate: '+issues[issue].name+'.');
 return active;
}
function close(s,m,ctx,reason=null){
 const mm=ensure(s),l=link(s,m.linkId),r=reps(s,l);
 let ending=reason||(
  m.commonGround>=65&&m.resistance<=48&&m.evidence>=53&&
   Math.min(m.supportA,m.supportB)>=58?'joint-adoption':
  m.resistance>=68?'gridlock':
  m.supportA-m.supportB>=13?'a-priority':
  m.supportB-m.supportA>=13?'b-priority':'partial-compromise');
 const description={
  'joint-adoption':'Both groups accepted a jointly prepared policy initiative.',
  'a-priority':'The first organization’s preferred priorities won greater support.',
  'b-priority':'The second organization’s priorities took precedence.',
  'partial-compromise':'The groups achieved a limited agreement without resolving every conflict.',
  gridlock:'Years of competing priorities ended without a workable agreement.',
  dissolved:'The original real organizations were no longer available to finish the proposal.'
 }[ending];
 m.status='completed';m.endedAge=s.age;m.ending=ending;
 m.finalLine=short(issues[m.issue].name+': '+description,230);
 m.pending=false;m.offerAge=null;
 note(m,s,'ending',m.finalLine);
 if(l&&r&&ending!=='dissolved'){
  const joint=ending==='joint-adoption',winner=ending==='a-priority'?r.a:
   ending==='b-priority'?r.b:null;
  const impact=joint?5:ending==='gridlock'?-3:2;
  for(const g of [r.a,r.b]){
   g.standing=cap(g.standing+(joint?impact:winner===g?impact:
    ending==='gridlock'?-2:0));
   if(joint&&g.project?.status==='active')g.project.progress=cap(g.project.progress+10);
   g.history.push({age:s.age,kind:'relationship',
    title:'Public mandate: '+issues[m.issue].name,outcome:ending,
    description:short(description,240)});
   g.history=g.history.slice(-8);
  }
  l.trust=cap(l.trust+(joint?5:ending==='gridlock'?-4:0));
  l.competition=cap(l.competition+(joint?-4:ending==='gridlock'?5:1));
  l.history.push({age:s.age,kind:'player-story',label:short('Civic mandate — '+issues[m.issue].name,130),
   outcome:joint?'successful':ending==='gridlock'?'contested':'negotiated'});
  l.history=l.history.slice(-8);
 }
 mm.active=null;mm.completed.push({...m});mm.completed=mm.completed.slice(-24);
 report(s,ctx,m.finalLine);
}
function touch(s,id,trust,rivalry,message){
 const p=contact(s,id);
 if(!p||(!trust&&!rivalry))return {trust:0,rivalry:0};
 if(p.kind==='family'){
  p.raw.world.trust=cap((p.raw.world.trust??p.trust)+trust);
  p.raw.world.rivalry=cap((p.raw.world.rivalry??p.rivalry)+rivalry);
  if(trust)p.raw.bond=cap((p.raw.bond??50)+Math.round(trust*.4));
  p.raw.memories??=[];
  p.raw.memories.push({age:s.age,text:short(message,140)});
  p.raw.memories=p.raw.memories.slice(-15);
 }else{
  p.raw.trust=cap((p.raw.trust??p.trust)+trust);
  p.raw.rivalry=cap((p.raw.rivalry??p.rivalry)+rivalry);
  p.raw.history??=[];
  p.raw.history.push({age:s.age,kind:'civic-mandate',event:short(message,140)});
  p.raw.history=p.raw.history.slice(-18);
 }
 const updated=contact(s,id);
 return {trust:updated.trust-p.trust,rivalry:updated.rivalry-p.rivalry};
}
function ongoing(s,m,ctx){
 const l=link(s,m.linkId),r=reps(s,l);
 if(!r){
  if(m.unavailableSince===null){
   m.unavailableSince=s.age;
   m.pending=false;m.offerAge=null;
   note(m,s,'pause','The proposal paused when its real organizations or leaders became unavailable.');
  }else if(s.age-m.unavailableSince>=2)close(s,m,ctx,'dissolved');
  m.lastAge=s.age;
  return;
 }
 if(m.unavailableSince!==null){
  note(m,s,'resume','Current living representatives resumed the public proposal.');
  m.unavailableSince=null;
 }
 if(m.leaderA!==r.pa.id||m.leaderB!==r.pb.id||
   m.officeA!==r.a.leaderId||m.officeB!==r.b.leaderId){
  m.officeA=r.a.leaderId;m.officeB=r.b.leaderId;
  m.leaderA=r.pa.id;m.leaderB=r.pb.id;
  m.leaderAName=short(r.pa.name,75);m.leaderBName=short(r.pb.name,75);
  note(m,s,'leadership','Actual organizational leadership changed during the campaign.');
 }
 if(m.pending&&m.offerAge!==null&&s.age-m.offerAge>=2){
  m.pending=false;m.offerAge=null;
  note(m,s,'missed','You declined to intervene. Both organizations continued independently.');
 }
 if(s.age<m.nextAge)return;
 // Autonomous organizations use their actual standing, projects and trust.
 // They do not generate player stats, fake public votes, revenue or RNG.
 const a=Math.round((r.a.cohesion-r.a.tension)/24),
  b=Math.round((r.b.cohesion-r.b.tension)/24);
 m.supportA=cap(m.supportA+a+2);
 m.supportB=cap(m.supportB+b+2);
 m.commonGround=cap(m.commonGround+Math.round((l.trust-l.competition)/25));
 m.resistance=cap(m.resistance+Math.round((l.competition-l.trust)/27));
 m.evidence=cap(m.evidence+Math.round((r.a.project?.progress??0)/35+
  (r.b.project?.progress??0)/35+5));
 m.lastAge=s.age;m.stage=Math.min(4,m.stage+1);m.nextAge=Math.min(110,s.age+2);
 note(m,s,'autonomy','The organizations advanced their positions using real members and ongoing projects.');
 report(s,ctx,'The public mandate "'+issues[m.issue].name+'" reached year '+(s.age-m.startedAge)+'.');
 if(m.stage>=4||s.age>=m.expiryAge){close(s,m,ctx);return;}
 const state=ensure(s);
 if(s.age-state.lastOfferAge>=3){
  m.pending=true;m.offerAge=s.age;state.lastOfferAge=s.age;
 }
}
const blocked=s=>!s.alive||s.pending!==null||s.mini||
 s.world?.network?.conversation||s.world?.storyDirector?.active||
 s.fate?.active?.status==='playing'||s.careerCampaigns?.active||
 s.everydayScenes?.active||s.hobbyCircuit?.active||
 s.workplace?.active?.status==='ready'||s.familyStories?.active?.status==='ready'||
 s.worldPulse?.active?.status==='ready'||(s.justice?.years||0)>0;
function options(m){
 const underdog=m.supportA<=m.supportB?'A':'B',
  name=underdog==='A'?m.groupAName:m.groupBName;
 return [
  {index:0,tag:'build-evidence',label:'Present evidence and negotiate shared terms',
   detail:'Support both real groups, reduce opposition and improve public confidence'},
  {index:1,tag:'advocate',label:'Champion '+name+' in the policy debate',
   detail:'Help the less-supported group, but risk upsetting the other leader'},
  {index:2,tag:'independent',label:'Let the organizations settle the proposal without you',
   detail:'Spend a normal activity with no change to group, NPC or player resources'}
 ];
}
export function civicMandateCommands(s){
 const m=civicMandatesState(s),o=m.active;
 if(!o?.pending)return [];
 const r=reps(s,link(s,o.linkId));
 return options(o).map(x=>({id:'mandate:'+o.id+':'+x.index,
  label:x.label,detail:x.detail+' · '+issues[o.issue].name,
  enabled:!blocked(s)&&s.actions>0&&!!r}));
}
export function civicMandateAct(s,id,ctx){
 const match=/^mandate:(mandate-g[0-9]+-[0-9]+):([012])$/.exec(id);
 if(!match||!civicMandateCommands({...s,actions:s.actions+1})
  .some(x=>x.id===id&&x.enabled))throw Error('This civic proposal is unavailable.');
 const m=ensure(s),o=m.active,r=reps(s,link(s,o.linkId)),
  choice=options(o)[Number(match[2])];
 const prev={supportA:o.supportA,supportB:o.supportB,
  common:o.commonGround,resistance:o.resistance,evidence:o.evidence,
  trust:r.l.trust,competition:r.l.competition,ga:r.a.standing,gb:r.b.standing};
 const touches={a:{trust:0,rivalry:0},b:{trust:0,rivalry:0}};
 let stat=null,statDelta=0;
 if(choice.index===0){
  o.supportA=cap(o.supportA+5);o.supportB=cap(o.supportB+5);
  o.commonGround=cap(o.commonGround+10);o.resistance=cap(o.resistance-8);
  o.evidence=cap(o.evidence+12);
  r.l.trust=cap(r.l.trust+5);r.l.competition=cap(r.l.competition-4);
  r.a.standing=cap(r.a.standing+2);r.b.standing=cap(r.b.standing+2);
  touches.a=touch(s,r.pa.id,4,-2,choice.label);
  touches.b=touch(s,r.pb.id,4,-2,choice.label);
  stat='knowledge';
 }else if(choice.index===1){
  const favorA=o.supportA<=o.supportB;
  o.supportA=cap(o.supportA+(favorA?13:-6));
  o.supportB=cap(o.supportB+(favorA?-6:13));
  o.commonGround=cap(o.commonGround-5);o.resistance=cap(o.resistance+10);
  r.l.trust=cap(r.l.trust-4);r.l.competition=cap(r.l.competition+7);
  r.a.standing=cap(r.a.standing+(favorA?4:-3));
  r.b.standing=cap(r.b.standing+(favorA?-3:4));
  touches.a=touch(s,r.pa.id,favorA?5:-4,favorA?0:5,choice.label);
  touches.b=touch(s,r.pb.id,favorA?-4:5,favorA?5:0,choice.label);
  stat='confidence';
 }
 if(stat){const before=s.stats[stat];ctx.change(s,stat,2);statDelta=s.stats[stat]-before;}
 o.pending=false;o.offerAge=null;
 const d={age:s.age,index:choice.index,tag:choice.tag,label:choice.label,
  supportA:o.supportA-prev.supportA,supportB:o.supportB-prev.supportB,
  commonGround:o.commonGround-prev.common,resistance:o.resistance-prev.resistance,
  evidence:o.evidence-prev.evidence,linkTrust:r.l.trust-prev.trust,
  competition:r.l.competition-prev.competition,
  groupA:r.a.standing-prev.ga,groupB:r.b.standing-prev.gb,
  npcTrustA:touches.a.trust,npcTrustB:touches.b.trust,
  npcRivalryA:touches.a.rivalry,npcRivalryB:touches.b.rivalry,
  stat,statDelta};
 o.decisions.push(d);o.decisions=o.decisions.slice(-4);
 note(o,s,'player',choice.label);
 report(s,ctx,'Your position on '+issues[o.issue].name+': '+choice.label+'.');
 return d;
}
export function civicMandatesYear(s,ctx={}){
 if(!s.alive||s.age<22)return;
 const m=ensure(s),hadActive=!!m.active;
 if(m.active)ongoing(s,m.active,ctx);
 if(!hadActive&&!m.active&&s.age-m.lastStartAge>=7&&s.age<=101){
  const c=source(s);
  if(c)launch(s,c,ctx);
 }
}
export function civicMandatesView(s){
 const m=civicMandatesState(s),t=m.active;
 return {
  age:s.age,
  active:t?{...t,issueName:issues[t.issue].name,
   question:issues[t.issue].question,
   aRepresentative:contact(s,t.leaderA)?.name||null,
   bRepresentative:contact(s,t.leaderB)?.name||null,
   history:t.history.slice(-5).reverse(),options:options(t)}:null,
  completed:m.completed.slice(-9).reverse().map(t=>({
   id:t.id,issue:t.issue,issueName:issues[t.issue].name,
   groupAName:t.groupAName,groupBName:t.groupBName,
   ending:t.ending,finalLine:t.finalLine,
   endedAge:t.endedAge,decisions:t.decisions.length
  })),
  ancestors:m.ancestors.slice().reverse(),news:m.news.slice(-8).reverse()
 };
}
export function civicMandatesInheritance(next,old){
 const m=civicMandatesState(old),newState=fresh(),
  seen=[...m.completed,...(m.active?[m.active]:[])].slice(-3);
 newState.ancestors=[...m.ancestors,{generation:old.generation,
  name:short(old.name,32),note:short(seen.length?seen.map(t=>
   issues[t.issue].name+': '+(t.ending||'unfinished public debate')).join('; '):
   'Earlier generations debated community priorities without passing on personal loyalties.',230)
 }].slice(-10);
 // No old officeholder, policy authority or campaign is automatically
 // assigned to a descendant who did not participate.
 next.civicMandates=newState;
}
export function validateCivicMandates(m){
 if(m===undefined)return true;
 const h=x=>x&&age(x.age)&&['origin','autonomy','leadership','pause','resume',
  'missed','player','ending'].includes(x.kind)&&str(x.text,225);
 const d=x=>x&&age(x.age)&&[0,1,2].includes(x.index)&&
  ['build-evidence','advocate','independent'].includes(x.tag)&&
  str(x.label,120)&&
  ['supportA','supportB','commonGround','resistance','evidence',
   'linkTrust','competition','groupA','groupB','npcTrustA',
   'npcTrustB','npcRivalryA','npcRivalryB','statDelta'].every(k=>signed(x[k]))&&
  (x.stat===null||['knowledge','confidence'].includes(x.stat));
 const t=x=>x&&str(x.id,100)&&str(x.sourceKey,230)&&str(x.linkId,190)&&
  Object.hasOwn(issues,x.issue)&&str(x.groupAId,100)&&str(x.groupBId,100)&&
  x.groupAId!==x.groupBId&&str(x.groupAName,100)&&str(x.groupBName,100)&&
  str(x.leaderA,100)&&str(x.leaderB,100)&&x.leaderA!==x.leaderB&&
  str(x.officeA,100)&&str(x.officeB,100)&&
  str(x.leaderAName,75)&&str(x.leaderBName,75)&&
  age(x.startedAge)&&age(x.lastAge)&&age(x.nextAge)&&age(x.expiryAge)&&
  [0,1,2,3,4].includes(x.stage)&&['active','completed'].includes(x.status)&&
  typeof x.pending==='boolean'&&
  (x.offerAge===null||age(x.offerAge))&&
  (!x.pending||x.offerAge!==null)&&
  (x.unavailableSince===null||age(x.unavailableSince))&&
  [x.supportA,x.supportB,x.commonGround,x.resistance,x.evidence].every(score)&&
  Array.isArray(x.decisions)&&x.decisions.length<=4&&x.decisions.every(d)&&
  Array.isArray(x.history)&&x.history.length<=12&&x.history.every(h)&&
  (x.endedAge===null||age(x.endedAge))&&
  (x.ending===null||RESULTS.includes(x.ending))&&
  (x.finalLine===null||str(x.finalLine,230))&&
  (x.status==='completed'?x.ending!==null&&x.endedAge!==null&&str(x.finalLine,230):
   x.ending===null&&x.endedAge===null&&x.finalLine===null);
 return !!m&&m.version===1&&Number.isInteger(m.serial)&&m.serial>=0&&
  (m.active===null||t(m.active)&&m.active.status==='active')&&
  Array.isArray(m.completed)&&m.completed.length<=24&&
  m.completed.every(x=>t(x)&&x.status==='completed')&&
  Array.isArray(m.used)&&m.used.length<=36&&m.used.every(x=>str(x,230))&&
  new Set(m.used).size===m.used.length&&
  Array.isArray(m.news)&&m.news.length<=25&&
  m.news.every(n=>age(n.age)&&str(n.text,235))&&
  Array.isArray(m.ancestors)&&m.ancestors.length<=10&&
  m.ancestors.every(x=>Number.isInteger(x.generation)&&x.generation>=1&&
   str(x.name,32)&&str(x.note,230))&&
  Number.isInteger(m.lastStartAge)&&m.lastStartAge>=-100&&
  Number.isInteger(m.lastOfferAge)&&m.lastOfferAge>=-100;
}
