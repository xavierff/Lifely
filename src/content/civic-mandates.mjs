// Lifely 1.26.0 — civic campaigns and accountable post-agreement delivery.
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
 news:[],ancestors:[],deliveries:[],reversals:[],lastStartAge:-100,lastOfferAge:-100});
export const civicMandatesState=s=>s.civicMandates||fresh();
const ensure=s=>{const m=s.civicMandates??=fresh();m.deliveries??=[];m.reversals??=[];return m;};
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
 if(pa&&pb&&pa.id===pb.id){
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
 if(!['gridlock','dissolved'].includes(ending))beginDelivery(s,m);
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

// Promising a policy is not the same as delivering it. Delivery records
// reference only the two original organizations, their existing projects,
// and the current living representatives. They never create money or office.
const deliveryResults=['delivered','partial','stalled','disbanded'];
function deliveryNote(d,s,kind,text){
 d.history.push({age:s.age,kind,text:short(text,220)});
 d.history=d.history.slice(-10);
}
function beginDelivery(s,mandate){
 const state=ensure(s);
 const d={id:'delivery-'+mandate.id,mandateId:mandate.id,
  linkId:mandate.linkId,issue:mandate.issue,
  groupAId:mandate.groupAId,groupBId:mandate.groupBId,
  groupAName:mandate.groupAName,groupBName:mandate.groupBName,
  promisedOutcome:mandate.ending,startedAge:s.age,lastAge:s.age,
  nextAge:Math.min(110,s.age+2),dueAge:Math.min(110,s.age+6),
  progress:10,verification:cap(mandate.evidence),
  coordination:cap(mandate.commonGround),
  status:'active',pending:false,offerAge:null,unavailableSince:null,
  ending:null,endedAge:null,history:[],decisions:[]};
 deliveryNote(d,s,'promise','The organizations must now show what their '+issues[d.issue].name.toLowerCase()+' agreement actually achieves.');
 state.deliveries.push(d);state.deliveries=state.deliveries.slice(-12);
}
function finishDelivery(s,d,ctx,forced=null){
 const state=ensure(s),r=reps(s,link(s,d.linkId));
 const ending=forced||(d.progress>=65&&d.verification>=57&&d.coordination>=45?
  'delivered':d.progress>=38&&d.coordination>=28?'partial':'stalled');
 d.status='completed';d.ending=ending;d.endedAge=s.age;d.pending=false;
 d.offerAge=null;d.lastAge=s.age;
 const explanation={
  delivered:'The existing organizations followed through with verifiable work.',
  partial:'Some commitments were fulfilled, but the overall agreement remained incomplete.',
  stalled:'The promise remained largely undelivered despite the original agreement.',
  disbanded:'The original organizations could no longer continue the work.'
 }[ending];
 deliveryNote(d,s,'result',explanation);
 if(r&&ending!=='disbanded'){
  const standing=ending==='delivered'?3:ending==='stalled'?-3:0;
  for(const g of [r.a,r.b]){
   g.standing=cap(g.standing+standing);
   g.history.push({age:s.age,kind:'relationship',
    title:'Mandate delivery review',outcome:ending,
    description:short(issues[d.issue].name+': '+explanation,240)});
   g.history=g.history.slice(-8);
  }
  r.l.trust=cap(r.l.trust+(ending==='delivered'?3:ending==='stalled'?-3:0));
 }
 report(s,ctx,issues[d.issue].name+': '+explanation);
}
function deliveryOptions(d){
 return [
  {index:0,tag:'review',label:'Review the evidence with both organizations',
   detail:'Improve verification and rebuild trust with real representatives'},
  {index:1,tag:'push',label:'Press both organizations to meet their commitments',
   detail:'Accelerate work but risk tension between the existing leaders'},
  {index:2,tag:'observe',label:'Leave the work to the organizations',
   detail:'Use one activity; no changes to money, stats, contacts or organizations'}
 ];
}
function deliveryCommands(s){
 return (civicMandatesState(s).deliveries||[]).filter(d=>d.status==='active'&&d.pending)
  .flatMap(d=>deliveryOptions(d).map(o=>({
   id:'mandate:delivery:'+d.id+':'+o.index,
   label:o.label,detail:o.detail+' · '+issues[d.issue].name,
   enabled:!blocked(s)&&s.actions>0&&!!reps(s,link(s,d.linkId))
  })));
}
function actDelivery(s,id,ctx){
 const match=/^mandate:delivery:(delivery-mandate-g[0-9]+-[0-9]+):([012])$/.exec(id);
 const d=ensure(s).deliveries.find(x=>x.id===match?.[1]);
 const r=d&&reps(s,link(s,d.linkId));
 if(!match||!d||d.status!=='active'||!d.pending||!r||blocked(s))
  throw Error('This follow-through review is unavailable.');
 const choice=deliveryOptions(d)[Number(match[2])];
 const prev={progress:d.progress,verification:d.verification,coordination:d.coordination};
 if(choice.index===0){
  d.verification=cap(d.verification+12);
  d.coordination=cap(d.coordination+5);
  r.l.trust=cap(r.l.trust+3);
  r.a.cohesion=cap(r.a.cohesion+2);r.b.cohesion=cap(r.b.cohesion+2);
  touch(s,r.pa.id,3,-1,choice.label);touch(s,r.pb.id,3,-1,choice.label);
  ctx.change?.(s,'knowledge',1);
 }else if(choice.index===1){
  d.progress=cap(d.progress+7);
  d.coordination=cap(d.coordination-7);
  r.l.competition=cap(r.l.competition+5);
  r.a.tension=cap(r.a.tension+3);r.b.tension=cap(r.b.tension+3);
  touch(s,r.pa.id,-2,4,choice.label);touch(s,r.pb.id,-2,4,choice.label);
  ctx.change?.(s,'confidence',1);
 }
 d.decisions.push({age:s.age,index:choice.index,tag:choice.tag,
  label:choice.label,progress:d.progress-prev.progress,
  verification:d.verification-prev.verification,
  coordination:d.coordination-prev.coordination});
 d.decisions=d.decisions.slice(-4);
 d.pending=false;d.offerAge=null;
 deliveryNote(d,s,'decision',choice.label);
 report(s,ctx,'Implementation review: '+choice.label+'.');
 return d;
}
function tickDeliveries(s,ctx){
 for(const d of ensure(s).deliveries.filter(x=>x.status==='active')){
  const r=reps(s,link(s,d.linkId));
  if(!r||r.a.id!==d.groupAId||r.b.id!==d.groupBId){
   if(d.unavailableSince===null){
    d.unavailableSince=s.age;d.pending=false;d.offerAge=null;
    deliveryNote(d,s,'pause','The original organizations became unavailable; delivery is paused.');
   }else if(s.age-d.unavailableSince>=2)finishDelivery(s,d,ctx,'disbanded');
   continue;
  }
  if(d.unavailableSince!==null){
   d.unavailableSince=null;
   deliveryNote(d,s,'resume','Living representatives of both original organizations resumed delivery.');
  }
  if(d.pending&&d.offerAge!==null&&s.age-d.offerAge>=2){
   d.pending=false;d.offerAge=null;
   deliveryNote(d,s,'missed','The player did not intervene; the organizations carried on independently.');
  }
  if(s.age<d.nextAge)continue;
  const projects=[r.a.project,r.b.project].filter(p=>p&&p.status==='active');
  const actualWork=projects.length?
   Math.round(projects.reduce((n,p)=>n+(Number.isFinite(p.progress)?p.progress:0),0)/projects.length):0;
  const capacity=Math.round((r.a.cohesion+r.b.cohesion-r.a.tension-r.b.tension)/30);
  const alignment=Math.round((r.l.trust-r.l.competition)/25);
  const delta=Math.max(-3,Math.min(24,10+capacity+alignment+Math.round(actualWork/20)));
  d.progress=cap(d.progress+delta);
  d.coordination=cap(d.coordination+Math.round((r.l.trust-r.l.competition)/22));
  if(projects.length)d.verification=cap(d.verification+Math.round(actualWork/25));
  d.lastAge=s.age;d.nextAge=Math.min(110,s.age+2);
  deliveryNote(d,s,'checkpoint','Actual organizations reviewed delivery. Recorded progress '+d.progress+'/100; evidence '+d.verification+'/100.');
  if(s.age>=d.dueAge){finishDelivery(s,d,ctx);continue;}
  d.pending=true;d.offerAge=s.age;
 }
}

// A failed delivery is remembered, not erased by a later reform.
const reversalEndings=['reform-agreed','reconciled','alliance-withdrawn','unresolved','unavailable'];
function reversalReps(s,x){
 const r=reps(s,link(s,x.linkId));
 return r&&r.a.id===x.groupAId&&r.b.id===x.groupBId?r:null;
}
function reversalOptions(x){
 return [
  {label:'Mediate a renewed agreement',detail:'Reduce hostility and rebuild trust',tag:'mediate'},
  {label:'Support the challenger’s reform demands',detail:'Increase reform pressure but strain the opposing relationship',tag:'reform'},
  {label:'Respect both organizations’ independence',detail:'Record a neutral response without changing resources',tag:'neutral'}
 ];
}
function reversalNote(x,s,text){
 x.history.push({age:s.age,text:short(text,220)});x.history=x.history.slice(-8);
}
function tickReversals(s,ctx){
 const m=ensure(s);
 for(const x of m.reversals.filter(x=>x.ending===null)){
  if(s.age<=x.lastAge)continue;
  const r=reversalReps(s,x);
  if(!r){
   x.ending='unavailable';x.endedAge=s.age;x.pending=false;
   reversalNote(x,s,'The original organizations no longer have two available representatives.');
   continue;
  }
  x.lastAge=s.age;
  const challenger=x.side==='a'?r.a:r.b,opponent=x.side==='a'?r.b:r.a;
  x.pressure=cap(x.pressure+Math.round((challenger.tension+opponent.tension)/20)+2);
  x.trust=cap(x.trust+Math.round((r.l.trust-r.l.competition)/15));
  if(s.age>=x.dueAge){
   x.ending=x.trust>=65&&x.pressure<65?'reconciled':
    x.trust>=40&&x.pressure>=55?'reform-agreed':
    x.trust<35&&x.pressure>=65?'alliance-withdrawn':'unresolved';
   x.pending=false;x.endedAge=s.age;
   const delta=x.ending==='reconciled'?8:x.ending==='reform-agreed'?3:x.ending==='alliance-withdrawn'?-12:0;
   r.l.trust=cap(r.l.trust+delta);
   r.l.competition=cap(r.l.competition-delta);
   challenger.history.push({age:s.age,kind:'relationship',title:'Public accountability',outcome:x.ending,description:short('Response to the failed public commitment: '+x.ending,240)});
   challenger.history=challenger.history.slice(-8);
   if(x.ending==='alliance-withdrawn')r.l.trust=Math.min(r.l.trust,25);
   reversalNote(x,s,'The dispute concluded: '+x.ending.replaceAll('-',' ')+'.');
   report(s,ctx,issues[x.issue].name+': '+x.ending.replaceAll('-',' ')+'.');
  }else{
   x.pending=true;
   reversalNote(x,s,'The organizations reconsidered their positions.');
  }
 }
 // Only real, recently concluded failures can trigger a dispute; one per delivery.
 if(m.reversals.some(x=>x.ending===null))return;
 const d=m.deliveries.find(d=>d.status==='completed'&&['partial','stalled'].includes(d.ending)&&
  s.age>d.endedAge&&s.age-d.endedAge<=3&&s.age<=106&&
  !m.reversals.some(x=>x.deliveryId===d.id)&&reversalReps(s,d));
 if(!d)return;
 const r=reversalReps(s,d),side=r.a.tension-r.a.cohesion>=r.b.tension-r.b.cohesion?'a':'b';
 const x={id:'reversal-'+d.id,deliveryId:d.id,linkId:d.linkId,issue:d.issue,
  groupAId:d.groupAId,groupBId:d.groupBId,side,
  startedAge:s.age,lastAge:s.age,dueAge:s.age+3,endedAge:null,ending:null,
  pressure:cap(55+(100-d.progress)/4),trust:cap(r.l.trust),pending:true,history:[],decisions:[]};
 m.reversals.push(x);m.reversals=m.reversals.slice(-12);
 reversalNote(x,s,(side==='a'?r.pa.name:r.pb.name)+' challenged the incomplete commitment.');
 report(s,ctx,'Public accountability dispute: '+issues[x.issue].name+'.');
}
function reversalCommands(s){
 return (civicMandatesState(s).reversals||[]).filter(x=>x.ending===null&&x.pending)
 .flatMap(x=>reversalOptions(x).map((o,i)=>({id:'mandate:reversal:'+x.id+':'+i,
 label:o.label,detail:o.detail,enabled:!blocked(s)&&s.actions>0&&!!reversalReps(s,x)})));
}
function actReversal(s,id,ctx){
 const match=/^mandate:reversal:(reversal-delivery-mandate-g[0-9]+-[0-9]+):([012])$/.exec(id);
 const x=ensure(s).reversals.find(x=>x.id===match?.[1]),r=x&&reversalReps(s,x);
 if(!match||!x||x.ending!==null||!x.pending||!r||blocked(s))throw Error('This accountability dispute is unavailable.');
 const i=Number(match[2]),o=reversalOptions(x)[i],challenger=x.side==='a'?r.pa:r.pb,opponent=x.side==='a'?r.pb:r.pa;
 if(i===0){
  x.trust=cap(x.trust+15);x.pressure=cap(x.pressure-12);
  r.l.trust=cap(r.l.trust+5);r.l.competition=cap(r.l.competition-4);
  touch(s,challenger.id,3,-2,o.label);touch(s,opponent.id,3,-2,o.label);
 }else if(i===1){
  x.pressure=cap(x.pressure+15);x.trust=cap(x.trust-5);
  r.l.competition=cap(r.l.competition+5);
  touch(s,challenger.id,5,-1,o.label);touch(s,opponent.id,-4,5,o.label);
 }
 x.pending=false;x.decisions.push({age:s.age,tag:o.tag});x.decisions=x.decisions.slice(-3);
 reversalNote(x,s,o.label);report(s,ctx,'Accountability response: '+o.label+'.');
 return x;
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
 const m=civicMandatesState(s),o=m.active,choices=[...deliveryCommands(s),...reversalCommands(s)];
 if(!o?.pending)return choices;
 const r=reps(s,link(s,o.linkId));
 return [...options(o).map(x=>({id:'mandate:'+o.id+':'+x.index,
  label:x.label,detail:x.detail+' · '+issues[o.issue].name,
  enabled:!blocked(s)&&s.actions>0&&!!r})),...choices];
}
export function civicMandateAct(s,id,ctx){
 if(id.startsWith('mandate:reversal:'))return actReversal(s,id,ctx);
 if(id.startsWith('mandate:delivery:'))return actDelivery(s,id,ctx);
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
 tickDeliveries(s,ctx);
 tickReversals(s,ctx);
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
  deliveries:(m.deliveries||[]).slice(-7).reverse().map(d=>({...d,
   issueName:issues[d.issue].name,
   representativeA:reps(s,link(s,d.linkId))?.pa.name||null,
   representativeB:reps(s,link(s,d.linkId))?.pb.name||null,
   options:d.status==='active'?deliveryOptions(d):[]})),
  reversals:(m.reversals||[]).slice(-6).reverse().map(x=>{const r=reversalReps(s,x);return {...x,issueName:issues[x.issue].name,challenger:r?(x.side==='a'?r.pa.name:r.pb.name):null,opponent:r?(x.side==='a'?r.pb.name:r.pa.name):null};}),
  ancestors:m.ancestors.slice().reverse(),news:m.news.slice(-8).reverse()
 };
}
export function civicMandatesInheritance(next,old){
 const m=civicMandatesState(old),newState=fresh(),
  seen=[...m.completed,...(m.active?[m.active]:[])].slice(-3);
 newState.ancestors=[...m.ancestors,{generation:old.generation,
  name:short(old.name,32),note:short(seen.length?seen.map(t=>
   issues[t.issue].name+': '+(t.ending||'unfinished public debate')).join('; '):
   'Earlier generations debated community priorities without passing on personal loyalties.',185)+
   ((m.deliveries||[]).length?' Delivery reviews: '+(m.deliveries||[]).slice(-2).map(d=>
    d.ending||'unfinished').join(', ')+'.':'')
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

 const delivery=x=>x&&str(x.id,110)&&x.id==='delivery-'+x.mandateId&&
  str(x.mandateId,100)&&str(x.linkId,190)&&Object.hasOwn(issues,x.issue)&&
  str(x.groupAId,100)&&str(x.groupBId,100)&&x.groupAId!==x.groupBId&&
  str(x.groupAName,100)&&str(x.groupBName,100)&&
  ['joint-adoption','a-priority','b-priority','partial-compromise'].includes(x.promisedOutcome)&&
  age(x.startedAge)&&age(x.lastAge)&&age(x.nextAge)&&age(x.dueAge)&&
  [x.progress,x.verification,x.coordination].every(score)&&
  ['active','completed'].includes(x.status)&&typeof x.pending==='boolean'&&
  (x.offerAge===null||age(x.offerAge))&&(!x.pending||x.offerAge!==null)&&
  (x.unavailableSince===null||age(x.unavailableSince))&&
  (x.ending===null||deliveryResults.includes(x.ending))&&
  (x.endedAge===null||age(x.endedAge))&&
  Array.isArray(x.history)&&x.history.length<=10&&x.history.every(y=>
   age(y.age)&&['promise','checkpoint','result','decision','missed','pause','resume'].includes(y.kind)&&str(y.text,220))&&
  Array.isArray(x.decisions)&&x.decisions.length<=4&&x.decisions.every(y=>
   age(y.age)&&[0,1,2].includes(y.index)&&['review','push','observe'].includes(y.tag)&&
   str(y.label,120)&&['progress','verification','coordination'].every(k=>signed(y[k])))&&
  (x.status==='completed'?x.endedAge!==null&&x.ending!==null&&!x.pending:
   x.endedAge===null&&x.ending===null);
 return !!m&&m.version===1&&Number.isInteger(m.serial)&&m.serial>=0&&
  (m.active===null||t(m.active)&&m.active.status==='active')&&
  Array.isArray(m.completed)&&m.completed.length<=24&&
  m.completed.every(x=>t(x)&&x.status==='completed')&&
  (m.deliveries===undefined||(Array.isArray(m.deliveries)&&m.deliveries.length<=12&&
   m.deliveries.every(delivery)&&new Set(m.deliveries.map(d=>d.id)).size===m.deliveries.length))&&
  (m.reversals===undefined||(Array.isArray(m.reversals)&&m.reversals.length<=12&&new Set(m.reversals.map(x=>x.id)).size===m.reversals.length&&m.reversals.every(x=>x&&str(x.deliveryId,110)&&x.id==='reversal-'+x.deliveryId&&str(x.linkId,190)&&Object.hasOwn(issues,x.issue)&&str(x.groupAId,100)&&str(x.groupBId,100)&&x.groupAId!==x.groupBId&&['a','b'].includes(x.side)&&age(x.startedAge)&&age(x.lastAge)&&age(x.dueAge)&&x.dueAge===x.startedAge+3&&score(x.pressure)&&score(x.trust)&&typeof x.pending==='boolean'&&(x.ending===null?x.endedAge===null:reversalEndings.includes(x.ending)&&age(x.endedAge)&&!x.pending)&&Array.isArray(x.history)&&x.history.length<=8&&x.history.every(h=>h&&age(h.age)&&str(h.text,220))&&Array.isArray(x.decisions)&&x.decisions.length<=3&&x.decisions.every(d=>d&&age(d.age)&&['mediate','reform','neutral'].includes(d.tag)))))&&
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
