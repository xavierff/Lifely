// Lifely 1.24.0 — the living aftermath of consequential public events.
// Grounded in actual saved NPC IDs, social circles, and intergroup links.
const cap=v=>Math.max(0,Math.min(100,Math.round(v)));
const short=(v,n=235)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,n);
const age=v=>Number.isInteger(v)&&v>=0&&v<=110;
const txt=(v,n)=>typeof v==='string'&&v.length>0&&v.length<=n;
const value=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=100;
const change=v=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=100;
const POS=new Set(['agreement','celebrated','merit','new-leader','incumbent']);
const NEG=new Set(['escalation','divided','controversy','disputed']);
const TYPES=['election-rivalry','professional-network','professional-feud',
 'community-legacy','community-divide','agreement-network','agreement-feud'];
const ENDS=['enduring-alliance','rivalry','fractured','independent','outlived','unavailable'];
const fresh=()=>({version:1,serial:0,seen:[],threads:[],archive:[],
 news:[],ancestors:[],lastOfferAge:-100});
export const publicAftermathState=s=>s.publicAftermath||fresh();
const ensure=s=>s.publicAftermath??=fresh();
function npc(s,id){
 if(typeof id!=='string'||!id)return null;
 if(id.startsWith('person-')){
  const p=(s.people||[]).find(x=>'person-'+x.id===id&&x.alive&&x.age>=18&&x.world);
  return p?{id,name:p.name,trust:cap(p.world.trust??p.bond??50),
   rivalry:cap(p.world.rivalry??0),kind:'person',raw:p}:null;
 }
 const p=(s.world?.autonomy?.alumni||[]).find(x=>x.id===id);
 return p?{id,name:p.name,trust:cap(p.trust??50),rivalry:cap(p.rivalry??0),
  kind:'alumni',raw:p}:null;
}
const group=(s,id)=>(s.socialCircles?.groups||[]).find(x=>x.id===id)||null;
const link=(s,id)=>(s.organizationNetwork?.links||[]).find(x=>x.id===id)||null;
function cast(s,e){
 const l=link(s,e.linkId),ga=group(s,l?.aId),gb=group(s,l?.bId);
 if(!l||!ga||!gb||ga.status!=='active'||gb.status!=='active')return null;
 if(e.mode==='election'){
  const loser=e.ending==='new-leader'?e.ballot?.incumbentId:
   e.ending==='incumbent'?e.ballot?.challengerId:null;
  const winner=e.ending==='new-leader'?e.ballot?.challengerId:
   e.ending==='incumbent'?e.ballot?.incumbentId:null;
  const a=npc(s,loser),b=npc(s,winner),g=group(s,e.ballot?.groupId);
  if(!g||!a||!b||a.id===b.id||!g.members.includes(a.id)||
   !g.members.includes(b.id))return null;
  return {a,b,ga:g,gb:g,l};
 }
 const a=npc(s,e.leaderA),b=npc(s,e.leaderB);
 if(!a||!b||a.id===b.id||!ga.members.includes(a.id)||
  !gb.members.includes(b.id))return null;
 return {a,b,ga,gb,l};
}
function typeOf(e){
 if(e.mode==='election')return 'election-rivalry';
 if(e.mode==='competition')return NEG.has(e.ending)?'professional-feud':'professional-network';
 if(e.mode==='festival')return NEG.has(e.ending)?'community-divide':'community-legacy';
 return NEG.has(e.ending)?'agreement-feud':'agreement-network';
}
function title(kind){
 return ({
  'election-rivalry':'The election loser remembers',
  'professional-network':'The competitors become collaborators',
  'professional-feud':'The old skills rivalry never disappeared',
  'community-legacy':'The festival that brought the community together',
  'community-divide':'A festival fractured the community',
  'agreement-network':'The agreement still shapes the city',
  'agreement-feud':'The failed negotiation caused a lasting feud'
 })[kind];
}
function report(s,ctx,message){
 const m=ensure(s),text=short(message,235);
 m.news.push({age:s.age,text});m.news=m.news.slice(-25);
 ctx?.add?.(s,text,'people');
}
function log(t,s,kind,message,detail){
 t.history.push({age:s.age,kind,text:short(message,225),detail:short(detail,120)});
 t.history=t.history.slice(-12);
}
function create(s,e,ctx){
 const c=cast(s,e),m=ensure(s);
 if(!c||m.threads.length>=5)return;
 const kind=typeOf(e),positive=POS.has(e.ending);
 const t={
  id:'afterlife-g'+s.generation+'-'+(++m.serial),sourceId:e.id,
  sourceAge:e.endedAge,sourceEnding:e.ending,mode:e.mode,
  kind,title:title(kind),aId:c.a.id,bId:c.b.id,
  aName:short(c.a.name,75),bName:short(c.b.name,75),
  groupAId:c.ga.id,groupBId:c.gb.id,linkId:c.l.id,
  startedAge:s.age,lastAge:s.age,nextAge:Math.min(110,s.age+3),
  expiryAge:Math.min(110,s.age+18),chapter:0,status:'ongoing',
  pending:false,offerAge:null,affinity:positive?62:35,friction:positive?30:65,
  partnership:'none',followups:0,decisions:[],history:[],
  endedAge:null,ending:null,finalLine:null
 };
 log(t,s,'milestone','This real public event will be remembered for years.',e.mode+' — '+e.ending);
 m.threads.push(t);
 report(s,ctx,c.a.name+' and '+c.b.name+' carry the outcome of '+e.mode+' into their future.');
}
function touch(s,id,trust,rivalry,message){
 const p=npc(s,id);
 if(!p||(!trust&&!rivalry))return {trust:0,rivalry:0};
 if(p.kind==='person'){
  p.raw.world.trust=cap((p.raw.world.trust??p.trust)+trust);
  p.raw.world.rivalry=cap((p.raw.world.rivalry??p.rivalry)+rivalry);
  if(trust)p.raw.bond=cap((p.raw.bond??50)+Math.round(trust*.5));
  p.raw.memories??=[];p.raw.memories.push({age:s.age,text:short(message,140)});
  p.raw.memories=p.raw.memories.slice(-15);
 }else{
  p.raw.trust=cap((p.raw.trust??p.trust)+trust);
  p.raw.rivalry=cap((p.raw.rivalry??p.rivalry)+rivalry);
  p.raw.history??=[];p.raw.history.push({age:s.age,kind:'afterlife',event:short(message,140)});
  p.raw.history=p.raw.history.slice(-18);
 }
 const result=npc(s,id);
 return {trust:result.trust-p.trust,rivalry:result.rivalry-p.rivalry};
}
function current(s,t){
 const a=npc(s,t.aId),b=npc(s,t.bId),
  ga=group(s,t.groupAId),gb=group(s,t.groupBId),l=link(s,t.linkId);
 if(!a||!b)return {ok:false,reason:'unavailable'};
 if(!ga||!gb||!l||ga.status!=='active'||gb.status!=='active'||
  !ga.members.includes(a.id)||!gb.members.includes(b.id)||l.status==='dormant')
  return {ok:false,reason:'outlived'};
 return {ok:true,a,b,ga,gb,l};
}
function archive(s,t,ctx,forced=null){
 const m=ensure(s),active=t.decisions.some(d=>d.tag!=='independent');
 const ending=forced||(active===false?'independent':
  t.affinity>=62&&t.friction<=48?'enduring-alliance':
  t.friction>=62||t.affinity<=30?'rivalry':'fractured');
 const words={
  'enduring-alliance':'Years of shared action turned into a lasting relationship.',
  rivalry:'The dispute kept shaping both people’s reputations.',
  fractured:'They moved forward with unresolved differences.',
  independent:'The two people followed their own paths without your direction.',
  outlived:'The organizations changed and the old partnership lost its participants.',
  unavailable:'An original participant could no longer be reached.'
 }[ending];
 t.status='completed';t.endedAge=s.age;t.ending=ending;
 t.finalLine=short(t.aName+' & '+t.bName+': '+words,230);
 t.pending=false;t.offerAge=null;
 log(t,s,'ending',t.finalLine,ending);
 m.threads=m.threads.filter(x=>x.id!==t.id);
 m.archive.push({...t});m.archive=m.archive.slice(-30);
 report(s,ctx,t.finalLine);
}
function spillover(s,t,impact){
 const a=group(s,t.groupAId),b=group(s,t.groupBId),
  seen=new Set([t.groupAId,t.groupBId]),
  memberIds=new Set([...(a?.members||[]),...(b?.members||[])]);
 const target=(s.socialCircles?.groups||[]).find(g=>g.status==='active'&&!seen.has(g.id)&&
  g.members.some(id=>memberIds.has(id)));
 if(!target)return null;
 const old=target.standing;
 target.standing=cap(target.standing+impact);
 const changed=target.standing-old;
 if(!changed)return null;
 target.history.push({age:s.age,kind:'relationship',title:'A public consequence spread',
  outcome:changed>0?'alliance':'rivalry',description:short(
   'Existing shared members brought news from '+t.title+'.',240)});
 target.history=target.history.slice(-8);
 return {id:target.id,name:target.name,delta:changed};
}
function autonomous(s,t,ctx){
 const c=current(s,t);
 if(!c.ok){archive(s,t,ctx,c.reason);return;}
 const good=!['election-rivalry','professional-feud','community-divide',
  'agreement-feud'].includes(t.kind),sign=good?1:-1;
 touch(s,t.aId,sign,-sign,t.kind+' continued over time');
 touch(s,t.bId,sign,-sign,t.kind+' continued over time');
 t.affinity=cap(t.affinity+sign*2);t.friction=cap(t.friction-sign*2);
 c.ga.standing=cap(c.ga.standing+sign);
 if(c.ga!==c.gb)c.gb.standing=cap(c.gb.standing+sign);
 c.l.trust=cap(c.l.trust+sign*2);
 c.l.competition=cap(c.l.competition-sign);
 const spill=spillover(s,t,sign);
 t.chapter=Math.min(6,t.chapter+1);t.lastAge=s.age;
 t.nextAge=Math.min(110,s.age+3);
 log(t,s,'autonomy',good?
  'Real members kept collaborating long after their original public event.':
  'The historic dispute resurfaced among real members.',
  spill?'The story also reached '+spill.name:'The original groups remembered');
 report(s,ctx,t.aName+' and '+t.bName+': '+(good?
  'their relationship developed through years of collaboration.':
  'their long-standing disagreement continued to cause tension.'));
 if(t.chapter>=6||s.age>=t.expiryAge){archive(s,t,ctx);return;}
 const m=ensure(s);
 if(!m.threads.some(x=>x.pending)&&s.age-m.lastOfferAge>=3){
  t.pending=true;t.offerAge=s.age;m.lastOfferAge=s.age;
 }
}
const options=t=>{
 const labels=t.kind==='election-rivalry'?
  ['Mediate between the election winner and loser','Support the losing candidate’s challenge',
   'Respect the organization’s independent decision']:
 t.kind.includes('professional')?
  ['Propose a joint project with both real professionals','Favor one competitor over the other',
   'Let the professionals decide without you']:
 t.kind.includes('community')?
  ['Organize an inclusive community follow-up','Give one group all the credit',
   'Leave the neighborhood to decide']:
  ['Renew the original public agreement fairly','Side with one group against the other',
   'Let both organizations set their own terms'];
 return [{index:0,tag:'repair',label:labels[0],
  detail:'Improve real NPC relationships and group cooperation'},
 {index:1,tag:'polarize',label:labels[1],
  detail:'Take a side, strengthen rivalry and weaken the other group'},
 {index:2,tag:'independent',label:labels[2],
  detail:'No change to player wealth, standing, stats or NPC traits'}];
};
const blocked=s=>!s.alive||s.pending!==null||s.mini||
 s.world?.network?.conversation||s.world?.storyDirector?.active||
 s.fate?.active?.status==='playing'||s.careerCampaigns?.active||
 s.everydayScenes?.active||s.hobbyCircuit?.active||
 s.workplace?.active?.status==='ready'||s.familyStories?.active?.status==='ready'||
 s.worldPulse?.active?.status==='ready'||(s.justice?.years||0)>0;
export function publicAftermathCommands(s){
 return publicAftermathState(s).threads.filter(t=>t.pending).flatMap(t=>
  options(t).map(o=>({id:'afterlife:'+t.id+':'+o.index,label:o.label,
   detail:o.detail+' · '+t.aName+' & '+t.bName,
   enabled:!blocked(s)&&s.actions>0&&current(s,t).ok})));
}
export function publicAftermathAct(s,id,ctx){
 const match=/^afterlife:(afterlife-g[0-9]+-[0-9]+):([012])$/.exec(id);
 if(!match||!publicAftermathCommands({...s,actions:s.actions+1})
  .some(x=>x.id===id&&x.enabled))throw Error('This historic follow-up is not available.');
 const m=ensure(s),t=m.threads.find(x=>x.id===match[1]),choice=options(t)[Number(match[2])],
  c=current(s,t),before={ga:c.ga.standing,gb:c.gb.standing,
   trust:c.l.trust,competition:c.l.competition,affinity:t.affinity,
   friction:t.friction,progressA:c.ga.project?.progress??0,
   progressB:c.gb.project?.progress??0};
 const impact={a:{trust:0,rivalry:0},b:{trust:0,rivalry:0}};
 let spill=null,statDelta=0;
 const sign=choice.index===0?1:choice.index===1?-1:0;
 if(sign){
  impact.a=touch(s,t.aId,sign>0?7:-6,sign>0?-4:7,choice.label);
  impact.b=touch(s,t.bId,sign>0?7:-6,sign>0?-4:7,choice.label);
  t.affinity=cap(t.affinity+sign*9);t.friction=cap(t.friction-sign*9);
  c.ga.standing=cap(c.ga.standing+sign*4);
  if(c.gb!==c.ga)c.gb.standing=cap(c.gb.standing+sign*4);
  c.l.trust=cap(c.l.trust+sign*7);c.l.competition=cap(c.l.competition-sign*7);
  if(sign>0){
   if(c.ga.project?.status==='active')c.ga.project.progress=cap(c.ga.project.progress+8);
   if(c.gb!==c.ga&&c.gb.project?.status==='active')c.gb.project.progress=cap(c.gb.project.progress+8);
   const stat=t.kind.includes('professional')?'performance':
    t.kind==='election-rivalry'?'kindness':'social';
   const old=s.stats[stat];ctx.change(s,stat,2);statDelta=s.stats[stat]-old;
   if(t.kind.includes('professional')&&s.business){
    // A real, opted-in local business records a named NPC collaboration.
    // The ledger has no invented cash, revenue, equity or salary.
    const partner=c.a.trust>=55?c.a:c.b.trust>=55?c.b:null;
    s.business.partners??=[];
    if(partner&&Array.isArray(s.business.partners)&&s.business.partners.length<5){
     if(!s.business.partners.some(x=>x.personId===partner.id))
      s.business.partners.push({personId:partner.id,name:short(partner.name,75),
       startedAge:s.age,kind:'joint-venture',sourceId:t.sourceId});
     t.partnership='joint-venture';
    }
   }else if(t.kind.includes('professional')&&s.job)t.partnership='joint-project';
   spill=spillover(s,t,2);
  }else{
   const old=s.stats.confidence;ctx.change(s,'confidence',2);
   statDelta=s.stats.confidence-old;t.partnership='none';
   spill=spillover(s,t,-2);
  }
 }
 t.pending=false;t.offerAge=null;t.followups=Math.min(6,t.followups+1);
 const d={age:s.age,index:choice.index,tag:choice.tag,label:choice.label,
  trustA:impact.a.trust,trustB:impact.b.trust,
  rivalryA:impact.a.rivalry,rivalryB:impact.b.rivalry,
  affinity:t.affinity-before.affinity,friction:t.friction-before.friction,
  groupA:c.ga.standing-before.ga,groupB:c.gb.standing-before.gb,
  networkTrust:c.l.trust-before.trust,competition:c.l.competition-before.competition,
  projectA:(c.ga.project?.progress??before.progressA)-before.progressA,
  projectB:(c.gb.project?.progress??before.progressB)-before.progressB,
  spillGroup:spill?.id||null,spillDelta:spill?.delta||0,
  partnership:t.partnership,statDelta};
 t.decisions.push(d);t.decisions=t.decisions.slice(-6);
 log(t,s,'player',choice.label,'Network trust '+d.networkTrust+' · competition '+d.competition);
 report(s,ctx,'You responded to '+t.aName+' and '+t.bName+': '+choice.label+'.');
 return d;
}
export function publicAftermathYear(s,ctx={}){
 if(!s.alive||s.age<18)return;
 const m=ensure(s);
 for(const e of s.playableEvents?.completed||[]){
  if(!e?.id||m.seen.includes(e.id))continue;
  m.seen.push(e.id);m.seen=m.seen.slice(-65);
  if(!age(e.endedAge)||!(POS.has(e.ending)||NEG.has(e.ending))||
   !e.decisions?.some(d=>d.option!==2))continue;
  if(m.threads.length<5)create(s,e,ctx);
 }
 for(const t of [...m.threads]){
  if(!m.threads.includes(t))continue;
  const c=current(s,t);
  if(!c.ok){archive(s,t,ctx,c.reason);continue;}
  if(t.pending&&t.offerAge!==null&&s.age-t.offerAge>=2){
   t.pending=false;t.offerAge=null;
   log(t,s,'milestone','The optional invitation expired; both real people continued independently.',
    'No player resources or stats changed');
  }
  if(s.age>=t.nextAge)autonomous(s,t,ctx);
  if(m.threads.includes(t)&&s.age>=t.expiryAge)archive(s,t,ctx);
 }
}
export function publicAftermathView(s){
 const m=publicAftermathState(s);
 return {age:s.age,threads:m.threads.map(t=>({...t,
  aAlive:!!npc(s,t.aId),bAlive:!!npc(s,t.bId),
  aTrust:npc(s,t.aId)?.trust??null,bTrust:npc(s,t.bId)?.trust??null,
  aRivalry:npc(s,t.aId)?.rivalry??null,bRivalry:npc(s,t.bId)?.rivalry??null,
  groupA:group(s,t.groupAId)?.name||'Historical organization',
  groupB:group(s,t.groupBId)?.name||'Historical organization',
  history:t.history.slice(-5).reverse(),available:options(t)
 })),
 completed:m.archive.slice(-9).reverse().map(x=>({
  id:x.id,title:x.title,ending:x.ending,finalLine:x.finalLine,
  endedAge:x.endedAge,followups:x.followups,kind:x.kind,
  aName:x.aName,bName:x.bName
 })),ancestors:m.ancestors.slice().reverse(),news:m.news.slice(-8).reverse()};
}
export function publicAftermathInheritance(next,old){
 const prev=publicAftermathState(old),m=fresh();
 const all=[...prev.archive,...prev.threads].slice(-5);
 m.ancestors=[...prev.ancestors,{generation:old.generation,name:short(old.name,32),
  note:short(all.length?all.slice(-3).map(t=>t.aName+' and '+t.bName+
   ' remembered '+t.kind+' for '+Math.max(0,old.age-t.startedAge)+' years').join('; '):
   'Earlier generations left public memories for the future.',230)
 }].slice(-10);
 // No old NPC, offer, partnership or automatic reward transfers to the heir.
 next.publicAftermath=m;
}
export function validatePublicAftermath(m){
 if(m===undefined)return true;
 const hist=h=>h&&age(h.age)&&['milestone','player','autonomy','ending'].includes(h.kind)&&
  txt(h.text,225)&&txt(h.detail,120);
 const decision=d=>d&&age(d.age)&&[0,1,2].includes(d.index)&&
  ['repair','polarize','independent'].includes(d.tag)&&txt(d.label,110)&&
  ['trustA','trustB','rivalryA','rivalryB','affinity','friction','groupA','groupB',
   'networkTrust','competition','projectA','projectB','spillDelta','statDelta']
    .every(k=>change(d[k]))&&
  (d.spillGroup===null||txt(d.spillGroup,100))&&
  ['none','joint-project','joint-venture'].includes(d.partnership);
 const thread=t=>t&&txt(t.id,100)&&txt(t.sourceId,100)&&age(t.sourceAge)&&
  ['negotiation','festival','competition','election'].includes(t.mode)&&
  txt(t.sourceEnding,40)&&TYPES.includes(t.kind)&&txt(t.title,150)&&
  txt(t.aId,100)&&txt(t.bId,100)&&t.aId!==t.bId&&txt(t.aName,75)&&
  txt(t.bName,75)&&txt(t.groupAId,100)&&txt(t.groupBId,100)&&
  txt(t.linkId,190)&&age(t.startedAge)&&age(t.lastAge)&&age(t.nextAge)&&
  age(t.expiryAge)&&Number.isInteger(t.chapter)&&t.chapter>=0&&t.chapter<=6&&
  ['ongoing','completed'].includes(t.status)&&typeof t.pending==='boolean'&&
  (t.offerAge===null||age(t.offerAge))&&
  (t.pending?(t.status==='ongoing'&&t.offerAge!==null):t.offerAge===null)&&
  value(t.affinity)&&value(t.friction)&&
  ['none','joint-project','joint-venture'].includes(t.partnership)&&
  Number.isInteger(t.followups)&&t.followups>=0&&t.followups<=6&&
  Array.isArray(t.decisions)&&t.decisions.length<=6&&t.decisions.every(decision)&&
  Array.isArray(t.history)&&t.history.length<=12&&t.history.every(hist)&&
  (t.endedAge===null||age(t.endedAge))&&
  (t.ending===null||ENDS.includes(t.ending))&&
  (t.finalLine===null||txt(t.finalLine,230))&&
  (t.status==='completed'?t.endedAge!==null&&t.ending!==null&&txt(t.finalLine,230):
   t.endedAge===null&&t.ending===null&&t.finalLine===null);
 return !!m&&m.version===1&&Number.isInteger(m.serial)&&m.serial>=0&&
  Array.isArray(m.seen)&&m.seen.length<=65&&m.seen.every(x=>txt(x,100))&&
  new Set(m.seen).size===m.seen.length&&
  Array.isArray(m.threads)&&m.threads.length<=5&&m.threads.every(t=>thread(t)&&t.status==='ongoing')&&
  m.threads.filter(t=>t.pending).length<=1&&
  Array.isArray(m.archive)&&m.archive.length<=30&&
  m.archive.every(t=>thread(t)&&t.status==='completed')&&
  new Set([...m.threads,...m.archive].map(t=>t.id)).size===m.threads.length+m.archive.length&&
  Array.isArray(m.news)&&m.news.length<=25&&m.news.every(n=>age(n.age)&&txt(n.text,235))&&
  Array.isArray(m.ancestors)&&m.ancestors.length<=10&&
  m.ancestors.every(a=>Number.isInteger(a.generation)&&a.generation>=1&&
   txt(a.name,32)&&txt(a.note,230))&&
  Number.isInteger(m.lastOfferAge)&&m.lastOfferAge>=-100;
}
