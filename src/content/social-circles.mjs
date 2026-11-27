// Lifely 1.21.0 — living social circles across decades and generations.
// Every named participant is an existing adult NPC, family member or alumnus.
// Only groups are fictional institutions; no new people, wealth or random rolls.
const cap=x=>Math.max(0,Math.min(100,Math.round(x)));
const line=(x,n=220)=>String(x??'').replace(/\s+/g,' ').trim().slice(0,n);
const num=x=>typeof x==='number'&&Number.isFinite(x);
const age=x=>Number.isInteger(x)&&x>=0&&x<=110;
const str=(x,n)=>typeof x==='string'&&x.length>0&&x.length<=n;
const hash=x=>{let h=2166136261;for(const c of String(x)){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;}return h;};
const kinds=['professional','family','community','rival-family'];
const missions={
 professional:['Exchange expertise','Mentor new professionals','Build an enduring reputation'],
 family:['Protect family relationships','Support future generations','Repair old family disputes'],
 community:['Improve local services','Build trust across neighbors','Protect a shared local space'],
 'rival-family':['Defend competing family interests','Reconsider an old feud','Establish safe boundaries']
};
const MAX_GROUPS=8,MAX_INVITES=1,MAX_COMPLETED=28,MAX_NEWS=24,MAX_ANCESTORS=10;
const fresh=()=>({version:1,serial:0,groups:[],invites:[],completed:[],
 news:[],ancestors:[],lastGroupAge:-100,lastOfferAge:-100});
export const socialCirclesState=s=>s.socialCircles||fresh();
const ensure=s=>s.socialCircles??=fresh();
function actor(s,id){
 const text=String(id??'');
 if(text.startsWith('person-')){
  const p=(s.people||[]).find(p=>text==='person-'+p.id&&p.alive&&p.age>=18&&p.world);
  return p?{id:text,name:p.name,role:p.role,kind:'family',raw:p,
   trust:cap(p.world.trust??p.bond),rivalry:cap(p.world.rivalry??0)}:null;
 }
 const p=(s.world?.autonomy?.alumni||[]).find(p=>p.id===id);
 return p?{id:text,name:p.name,role:'classmate',kind:'alumni',raw:p,
  trust:cap(p.trust??50),rivalry:cap(p.rivalry??10)}:null;
}
function actors(s){
 const family=(s.people||[]).filter(p=>p.alive&&p.age>=18&&p.world)
  .slice(0,10).map(p=>actor(s,'person-'+p.id)).filter(Boolean);
 const alumni=(s.world?.autonomy?.alumni||[]).slice(0,8)
  .map(p=>actor(s,p.id)).filter(Boolean);
 return [...family,...alumni];
}
function belongs(s,type,p,anchorId){
 if(!p)return false;
 if(type==='family')return p.kind==='family'&&
   ['parent','partner','child','sibling','grandparent','ex'].includes(p.role);
 if(type==='professional')return !!(
  s.job&&p.kind==='family'&&p.raw.world.job===s.job.id&&
  p.raw.age<65||
  s.business&&p.kind==='alumni'&&
   ['Founder','Designer','Researcher','Community organizer'].includes(p.raw.profession)||
  s.business&&p.kind==='family'&&p.raw.world.ambition==='Career success');
 if(type==='community')return p.kind==='alumni'&&
   ['Community organizer','Teacher'].includes(p.raw.profession)||
   p.kind==='family'&&p.raw.world.ambition==='Community service';
 if(type==='rival-family')return p.id===anchorId&&p.kind==='alumni'&&
  (p.raw.children||0)>0&&p.rivalry>=42;
 return false;
}
function candidate(s,type,anchorId,excluded=new Set()){
 const found=actors(s).filter(p=>!excluded.has(p.id)&&belongs(s,type,p,anchorId));
 if(type==='rival-family'){
  const chosen=found.sort((a,b)=>b.rivalry-a.rivalry);
  return chosen.slice(0,1);
 }
 const ordered=found.sort((a,b)=>b.trust-a.trust||a.id.localeCompare(b.id));
 if(type==='family'&&ordered.length<2)return [];
 return ordered.slice(0,5);
}
function name(s,type,p,ctx){
 if(type==='family')return 'Family Council of '+line(s.name,32);
 if(type==='professional')return s.job?'Career Network · '+line(ctx?.careerTitle||'Profession '+s.job.id,50):
  'Enterprise Guild · '+line(s.business?.sector||'Local enterprise',50);
 if(type==='community')return 'Neighborhood Service Assembly';
 return 'The Rival Household of '+line(p?.name||'an old rival',45);
}
function reputation(s,type){
 const scores=s.socialInfluence?.scores;
 if(type==='family'||type==='rival-family')return scores?.family??50;
 if(type==='community')return scores?.community??50;
 return scores?.professional??50;
}
function socialLinks(s,ids){
 const links=s.world?.autonomy?.links||[];
 const allowed=new Set(ids);
 return links.filter(x=>allowed.has(x.a)&&allowed.has(x.b))
  .slice(0,12).map(x=>({trust:cap(x.trust??50),rivalry:cap(x.rivalry??20)}));
}
function groupScores(s,g){
 const existing=g.members.map(id=>actor(s,id)).filter(Boolean);
 if(!existing.length)return {cohesion:g.cohesion,tension:g.tension};
 const mean=(field)=>existing.reduce((sum,p)=>sum+p[field],0)/existing.length;
 const links=socialLinks(s,g.members);
 const linkTrust=links.length?links.reduce((sum,l)=>sum+l.trust,0)/links.length:mean('trust');
 const linkRivalry=links.length?links.reduce((sum,l)=>sum+l.rivalry,0)/links.length:mean('rivalry');
 return {
  cohesion:cap(mean('trust')*.55+linkTrust*.35+(g.standing||50)*.1),
  tension:cap(mean('rivalry')*.65+linkRivalry*.25+(100-(g.cohesion||50))*.1)
 };
}
function projectFor(s,g,sequence=1){
 const index=(hash(g.id+':'+sequence)%3);
 return {id:g.id+'-project-'+sequence,mission:missions[g.kind][index],
  startedAge:s.age,dueAge:Math.min(110,s.age+4),progress:12,status:'active'};
}
function news(s,ctx,text){
 const state=ensure(s),msg=line(text,225);
 state.news.push({age:s.age,text:msg});
 state.news=state.news.slice(-MAX_NEWS);
 ctx?.add?.(s,msg,'people');
}
function createGroup(s,type,people,ctx){
 const m=ensure(s),representative=people[0],id='circle-g'+s.generation+'-'+(++m.serial);
 const g={id,kind:type,name:name(s,type,representative,ctx),
   originGeneration:s.generation,originAge:s.age,anchorId:type==='rival-family'?representative.id:null,
   members:people.map(p=>p.id),leaderId:representative.id,status:'active',
   standing:cap(48+Math.round((reputation(s,type)-50)*.2)),
   cohesion:50,tension:30,years:0,lastAge:s.age,projectNumber:1,
   project:null,completedProjects:0,history:[]};
 const scores=groupScores(s,g);g.cohesion=scores.cohesion;g.tension=scores.tension;
 g.project=projectFor(s,g,1);
 m.groups.push(g);m.lastGroupAge=s.age;
 news(s,ctx,g.name+' organized around '+g.project.mission.toLowerCase()+'.');
 return g;
}
function selectGroup(s){
 const m=ensure(s);
 if(m.groups.length>=MAX_GROUPS||s.age-m.lastGroupAge<1||s.age>=103)return null;
 // Rival households require an actual rival *with children*. Other people
 // cannot be invented to fill out a fictitious family.
 const rival=actors(s).filter(p=>p.kind==='alumni'&&(p.raw.children||0)>0&&p.rivalry>=55)
  .sort((a,b)=>b.rivalry-a.rivalry)[0]||null;
 const prospects=[
  ['rival-family',rival?[rival]:[]],['professional',candidate(s,'professional')],
  ['community',candidate(s,'community')],['family',candidate(s,'family')]
 ];
 for(const [kind,people] of prospects){
  if(!people.length)continue;
  if(m.groups.some(g=>g.kind===kind&&!g.institution?.parentId))continue;
  return {kind,people};
 }
 return null;
}
function renewGroup(s,g){
 const old=g.members||[];
 // A rival household may not silently be replaced by an unrelated household.
 const inst=g.institution;
 const reserved=new Set((socialCirclesState(s).groups||[]).filter(x=>x.institution?.parentId===g.id&&!x.institution.mergedInto).flatMap(x=>x.members));
 const available=inst?.mergedInto?[]:inst?.parentId?
  old.map(id=>actor(s,id)).filter(p=>p&&belongs(s,g.kind,p,g.anchorId)):
  candidate(s,g.kind,g.anchorId,reserved);
 if(inst?.parentId||inst?.mergedInto){
  g.members=available.map(p=>p.id);
  if(g.members.length<2){g.leaderId=null;g.members=[];g.status='dormant';return;}
  if(!g.members.includes(g.leaderId))g.leaderId=available.sort((a,b)=>b.trust-a.trust||a.id.localeCompare(b.id))[0].id;
  g.status='active';return;
 }
 if(g.kind==='rival-family'&&!actor(s,g.anchorId)){
  g.members=[];g.leaderId=null;g.status='dormant';return;
 }
 if(g.kind==='family'&&available.length<2){
  g.members=[];g.leaderId=null;g.status='dormant';return;
 }
 if(!available.length){g.members=[];g.leaderId=null;g.status='dormant';return;}
 const known=new Set(available.map(p=>p.id));
 g.members=old.filter(id=>known.has(id));
 for(const p of available)if(g.members.length<5&&!g.members.includes(p.id))g.members.push(p.id);
 if(!g.members.includes(g.leaderId)){
  g.leaderId=g.members.slice().sort((a,b)=>{
   const pa=actor(s,a),pb=actor(s,b);
   return (pb?.trust||0)-(pa?.trust||0)||a.localeCompare(b);
  })[0]||null;
 }
 g.status=g.members.length?'active':'dormant';
}
function tickProject(s,g,ctx){
 if(!g.project||g.project.status!=='active')g.project=projectFor(s,g,g.projectNumber);
 const project=g.project;
 const swing=(hash(g.id+':'+s.age)%7)-3;
 const progress=cap(9+Math.floor(g.cohesion/14)-Math.floor(g.tension/17)+swing);
 project.progress=cap(project.progress+Math.max(1,progress));
 if(s.age<project.dueAge)return;
 const success=project.progress>=62&&g.cohesion>=g.tension;
 const result=success?'progress':'setback';
 g.standing=cap(g.standing+(success?5:-3));
 g.history.push({age:s.age,kind:'project',title:project.mission,
  outcome:result,description:success?
   'Members achieved a shared milestone through their own continuing work.':
   'Conflicting priorities left this initiative unfinished.'});
 g.history=g.history.slice(-8);
 g.completedProjects=Math.min(99,g.completedProjects+1);
 news(s,ctx,g.name+': '+project.mission+' ended in '+result+'.');
 g.projectNumber=Math.min(120,g.projectNumber+1);
 g.project=projectFor(s,g,g.projectNumber);
}
// Institutional elections are internal to real member lists. No invented voters.
const electionTags=['incumbent','challenger','neutral'];
function governance(g){return g.governance??={lastReview:g.lastAge,termStart:g.lastAge,election:null,results:[],policy:'continuity'};}
function candidateScore(p){return cap((p.trust+(100-p.rivalry))/2);}
function eligibleElection(s,g,e){
 return g.status==='active'&&g.leaderId===e.incumbent&&
 [e.incumbent,e.challenger].every(id=>g.members.includes(id)&&actor(s,id));
}
function electionOptions(s,e){
 return [
 {label:'Endorse '+(actor(s,e.incumbent)?.name||'the incumbent'),detail:'Support continuity; the real members still decide'},
 {label:'Endorse '+(actor(s,e.challenger)?.name||'the challenger'),detail:'Support a new direction; expect a contested transition'},
 {label:'Stay out of the leadership contest',detail:'Record neutrality; no resources or relationships change'}
 ];
}
function closeElection(s,g,e,ctx,reason=null){
 const gov=governance(g);
 const ballots=[];
 if(!reason){
  const incumbent=actor(s,e.incumbent),challenger=actor(s,e.challenger);
  for(const id of g.members){
   const member=actor(s,id);if(!member)continue;
   let pick=id===e.incumbent?e.incumbent:id===e.challenger?e.challenger:
    candidateScore(incumbent)+e.incumbentSupport+((hash(id+e.id)%13)-6)>=
    candidateScore(challenger)+e.challengerSupport?e.incumbent:e.challenger;
   ballots.push({voter:id,candidate:pick});
  }
 }
 const votes=ballots.filter(b=>b.candidate===e.challenger).length;
 const winner=reason?null:votes>ballots.length-votes?e.challenger:e.incumbent;
 const outcome=reason|| (winner===e.challenger?'new-leadership':'retained');
 if(winner){
  g.leaderId=winner;gov.termStart=s.age;
  gov.policy=winner===e.challenger?'renewal':'continuity';
  // Change real project priorities, never create cash or a new project.
  if(winner===e.challenger&&g.project?.status==='active'){
   const alternatives=missions[g.kind].filter(x=>x!==g.project.mission);
   g.project.mission=alternatives[hash(e.id)%alternatives.length];
   g.project.progress=cap(g.project.progress-10);
   g.tension=cap(g.tension+4);
  }
 }
 gov.results.push({age:s.age,id:e.id,outcome,winnerName:winner?line(actor(s,winner)?.name||'Former leader',70):null,
  votesForChallenger:votes,totalVotes:ballots.length});
 gov.results=gov.results.slice(-6);gov.election=null;gov.lastReview=s.age;
 g.history.push({age:s.age,kind:'relationship',title:'Leadership succession',outcome,
  description:winner?line(actor(s,winner).name+' won the internal member ballot.',240):'Leadership contest ended because the original candidates became unavailable.'});
 g.history=g.history.slice(-8);
 news(s,ctx,g.name+': '+(winner?actor(s,winner).name+' became the elected representative.':'the leadership contest ended without a vote.'));
}
function tickGovernance(s,g,ctx){
 const gov=governance(g);
 if(gov.election){
  const e=gov.election;
  if(!eligibleElection(s,g,e)){closeElection(s,g,e,ctx,'interrupted');return;}
  if(s.age>=e.dueAge){closeElection(s,g,e,ctx);return;}
  return;
 }
 if(g.status!=='active'||g.members.length<2||s.age>107||
  s.age-gov.lastReview<5||s.age-gov.termStart<5)return;
 const incumbent=actor(s,g.leaderId);
 const challenger=g.members.filter(id=>id!==g.leaderId).map(id=>actor(s,id)).filter(Boolean)
  .sort((a,b)=>candidateScore(b)-candidateScore(a)||a.id.localeCompare(b.id))[0];
 if(!incumbent||!challenger)return;
 // An independent succession challenge requires meaningful relative ambition
 // or existing institutional tension, not a periodic compulsory player task.
 if(candidateScore(challenger)+10<candidateScore(incumbent)&&g.tension<45){gov.lastReview=s.age;return;}
 gov.election={id:'succession-'+g.id+'-'+s.age,incumbent:incumbent.id,challenger:challenger.id,
  startedAge:s.age,dueAge:s.age+2,incumbentSupport:0,challengerSupport:0,response:null};
 news(s,ctx,challenger.name+' challenged '+incumbent.name+' for leadership of '+g.name+'.');
}
function successionCommands(s){
 return socialCirclesState(s).groups.flatMap(g=>{
  const e=g.governance?.election;
  if(!e||e.response!==null||!eligibleElection(s,g,e))return [];
  return electionOptions(s,e).map((o,i)=>({id:'circle:succession:'+e.id+':'+i,
   label:o.label,detail:o.detail,enabled:!blocked(s)&&s.actions>0}));
 });
}
function successionAct(s,id,ctx){
 const g=ensure(s).groups.find(g=>g.governance?.election&&id.startsWith('circle:succession:'+g.governance.election.id+':'));
 const e=g?.governance?.election,i=Number(id.split(':').at(-1));
 if(!e||![0,1,2].includes(i)||!successionCommands({...s,actions:s.actions+1}).some(c=>c.id===id&&c.enabled))throw Error('Leadership contest is unavailable.');
 if(i===0)e.incumbentSupport=8;
 if(i===1)e.challengerSupport=8;
 e.response=electionTags[i];
 if(i<2){
  const favored=i===0?e.incumbent:e.challenger,other=i===0?e.challenger:e.incumbent;
  touch(s,favored,3,-1,'Leadership endorsement');touch(s,other,-2,3,'Leadership endorsement');
 }
 news(s,ctx,'You responded to the leadership contest in '+g.name+'.');
 return e;
}
// A primary institution may found a separate, real-member breakaway. The
// original identity and all historical references remain intact after merger.
const institution=g=>g.institution??={parentId:null,mergedInto:null,condition:'stable',strain:0,lastReview:g.lastAge,crisis:null,history:[]};
function institutionalRecord(s,g,kind,description,ctx){
 const i=institution(g),text=line(description,200);
 i.history.push({age:s.age,kind,text});i.history=i.history.slice(-10);
 g.history.push({age:s.age,kind:'relationship',title:'Institutional '+kind,outcome:kind,description:text});g.history=g.history.slice(-8);
 news(s,ctx,g.name+': '+text);
}
function splitInstitution(s,g,ctx){
 const m=ensure(s),i=institution(g);
 if(g.members.length<4||i.parentId||m.groups.length>=MAX_GROUPS||m.groups.some(x=>x.institution?.parentId===g.id&&!x.institution.mergedInto))return false;
 const dissatisfied=g.members.filter(id=>id!==g.leaderId).map(id=>actor(s,id)).filter(Boolean)
  .sort((a,b)=>b.rivalry-a.rivalry||a.trust-b.trust||a.id.localeCompare(b.id)).slice(0,2);
 if(dissatisfied.length!==2)return false;
 const ids=dissatisfied.map(p=>p.id),child=createGroup(s,g.kind,dissatisfied,ctx);
 child.name=line(g.name+' · Reform Circle',100);child.institution={parentId:g.id,mergedInto:null,condition:'stable',strain:20,lastReview:s.age,crisis:null,history:[]};
 g.members=g.members.filter(id=>!ids.includes(id));g.standing=cap(g.standing-12);
 g.tension=cap(g.tension-10);i.strain=cap(i.strain-25);i.condition='strained';
 child.standing=cap(g.standing-8);child.tension=cap(g.tension+8);
 institutionalRecord(s,g,'split',dissatisfied.map(p=>p.name).join(' and ')+' formed a separate reform organization.',ctx);
 institutionalRecord(s,child,'founded','A breakaway from '+g.name+' with existing members only.',ctx);
 return true;
}
function tickInstitutions(s,ctx){
 const m=ensure(s);
 for(const g of [...m.groups]){
  if(g.status!=='active'||g.institution?.mergedInto||g.kind==='rival-family')continue;
  const i=institution(g);if(s.age<=i.lastReview)continue;
  i.lastReview=s.age;
  i.strain=cap(i.strain+Math.round((g.tension-g.cohesion)/9)+(g.standing<35?3:-2));
  const prior=i.condition;
  i.condition=i.strain>=75?'declining':i.strain>=45?'strained':'stable';
  if(i.condition!==prior)institutionalRecord(s,g,i.condition==='stable'?'recovered':i.condition,
   i.condition==='stable'?'The institution recovered through stronger cohesion.':'Internal pressure left the institution '+i.condition+'.',ctx);
  if(i.condition==='declining')g.standing=cap(g.standing-2);
  if(i.crisis&&s.age>=i.crisis.dueAge){
   const c=i.crisis;i.crisis=null;
   if(i.strain>=65&&splitInstitution(s,g,ctx))continue;
   institutionalRecord(s,g,'reform',i.strain>=65?'The faction challenge ended without enough members for a split.':'The faction accepted a renewed internal agreement.',ctx);
   i.strain=cap(i.strain-12);continue;
  }
  if(!i.crisis&&!i.parentId&&g.members.length>=4&&i.strain>=65&&s.age<=104&&
   !m.groups.some(x=>x.institution?.parentId===g.id&&!x.institution.mergedInto)&&
   !i.history.some(h=>['split','reform'].includes(h.kind)&&s.age-h.age<5)){
   i.crisis={id:'fracture-'+g.id+'-'+s.age,startedAge:s.age,dueAge:s.age+2,response:null};
   institutionalRecord(s,g,'faction','Dissatisfied members organized a two-year reform challenge.',ctx);
  }
 }
 // Defection and reunion are limited to a parent and its actual breakaway.
 // No unrelated NPC is moved across an incompatible organization.
 for(const child of m.groups.filter(g=>g.institution?.parentId&&!g.institution.mergedInto)){
  const i=child.institution,parent=m.groups.find(g=>g.id===i.parentId);
  if(!parent||parent.status!=='active'||child.status!=='active'||s.age-child.originAge<3)continue;
  const pi=institution(parent);
  if(child.governance?.election||parent.governance?.election||pi.crisis)continue;
  const last=i.history.at(-1)?.age??child.originAge;
  if(s.age-last<3)continue;
  if(parent.cohesion>=65&&child.cohesion>=65&&parent.tension<=30&&child.tension<=30&&
   new Set([...parent.members,...child.members]).size<=5){
   parent.members=[...new Set([...parent.members,...child.members])];
   child.members=[];child.leaderId=null;child.status='dormant';child.project.status='paused';i.mergedInto=parent.id;
   institutionalRecord(s,parent,'merger','The reform circle rejoined after years of cooperation.',ctx);
   institutionalRecord(s,child,'merged','The institution joined '+parent.name+'; its own history remains.',ctx);
   continue;
  }
  const from=parent.tension>child.tension+15?parent:child.tension>parent.tension+15?child:null;
  const to=from===parent?child:parent;
  if(!from||from.members.length<=2||to.members.length>=5)continue;
  const member=from.members.filter(id=>id!==from.leaderId).map(id=>actor(s,id)).filter(Boolean)
   .sort((a,b)=>b.rivalry-a.rivalry||a.id.localeCompare(b.id))[0];
  if(!member||member.rivalry<45)continue;
  from.members=from.members.filter(id=>id!==member.id);to.members.push(member.id);
  institutionalRecord(s,from,'defection',member.name+' left for '+to.name+'.',ctx);
  institutionalRecord(s,to,'defection',member.name+' joined from '+from.name+'.',ctx);
 }
}
function fractureCommands(s){
 return socialCirclesState(s).groups.flatMap(g=>{
  const c=g.institution?.crisis;if(!c||c.response!==null||g.status!=='active')return [];
  return [{label:'Mediate between institutional factions',detail:'Reduce fracture pressure and help members find common ground'},
   {label:'Support the reform faction',detail:'Raise pressure for a new organization'},
   {label:'Allow members to decide independently',detail:'Neutral response; no relationship or resource effects'}].map((o,i)=>({
    ...o,id:'circle:fracture:'+c.id+':'+i,enabled:!blocked(s)&&s.actions>0}));
 });
}
function fractureAct(s,id,ctx){
 const g=ensure(s).groups.find(g=>g.institution?.crisis&&id.startsWith('circle:fracture:'+g.institution.crisis.id+':'));
 if(!g||!fractureCommands({...s,actions:s.actions+1}).some(c=>c.id===id&&c.enabled))throw Error('Institutional crisis unavailable.');
 const i=g.institution,n=Number(id.split(':').at(-1));
 i.crisis.response=['mediate','reform','neutral'][n];
 if(n===0){i.strain=cap(i.strain-20);g.tension=cap(g.tension-8);}
 if(n===1){i.strain=cap(i.strain+15);g.tension=cap(g.tension+5);}
 news(s,ctx,'You responded to the reform challenge in '+g.name+'.');
 return i.crisis;
}
function evolveGroup(s,g,ctx){
 if(s.age<=g.lastAge)return;
 renewGroup(s,g);
 if(g.status==='dormant'){
  if(g.institution?.crisis){g.institution.crisis=null;institutionalRecord(s,g,'reform','The faction challenge ended because its living membership was no longer available.',ctx);}
  if(g.governance?.election)tickGovernance(s,g,ctx);
  g.standing=cap(g.standing-1);
  if(g.project)g.project.status='paused';
  g.lastAge=s.age;
  return;
 }
 if(g.project?.status==='paused'){
  // A historical institution returns with current, living members.
  g.projectNumber=Math.min(120,g.projectNumber+1);
  g.project=projectFor(s,g,g.projectNumber);
  news(s,ctx,g.name+' resumed its work with living members.');
 }
 const scores=groupScores(s,g);
 g.cohesion=cap(g.cohesion*.6+scores.cohesion*.4);
 g.tension=cap(g.tension*.6+scores.tension*.4);
 g.years=Math.min(110,g.years+1);g.lastAge=s.age;
 tickProject(s,g,ctx);
 tickGovernance(s,g,ctx);
}
function contact(s,g){
 const candidates=(g.members||[]).map(id=>actor(s,id)).filter(Boolean);
 return candidates.sort((a,b)=>
  (g.leaderId===b.id?1:0)-(g.leaderId===a.id?1:0)||
  b.trust-a.trust||a.id.localeCompare(b.id))[0]||null;
}
function options(offer){
 const family=offer.kind==='family',rival=offer.kind==='rival-family',
  second=offer.status==='ready';
 const type=offer.kind;
 return [
  {index:0,tag:'collaborate',
   label:second?'Build on the relationship after several years':
     rival?'Negotiate boundaries with the rival household':
     family?'Help the family council find common ground':
     type==='professional'?'Share expertise with the professional network':
     'Contribute to the community initiative',
   detail:'Support real members and the ongoing group project',
   trust:7,rivalry:rival?-8:-4,standing:5,progress:14,tension:rival?-8:-3,
   stat:family||rival?'kindness':type==='professional'?'performance':'social',statDelta:3},
  {index:1,tag:'challenge',
   label:second?'Reassert your own priorities':
     rival?'Escalate the family competition':
     family?'Challenge the council’s decisions':
     type==='professional'?'Compete with the professional network':'Push the group toward your preferred outcome',
   detail:'A stronger personal stance may increase rivalry and weaken trust',
   trust:-5,rivalry:9,standing:-3,progress:3,tension:9,
   stat:'confidence',statDelta:3},
  {index:2,tag:'independent',label:'Respect the group’s independence',
   detail:'Let existing NPCs decide; no trust, money or stat change',
   trust:0,rivalry:0,standing:0,progress:0,tension:0,stat:null,statDelta:0}
 ];
}
function blocked(s){
 return !s.alive||s.pending!==null||s.mini||
 s.world?.network?.conversation||s.world?.storyDirector?.active||
 s.fate?.active?.status==='playing'||s.careerCampaigns?.active||
 s.everydayScenes?.active||s.hobbyCircuit?.active||
 s.workplace?.active?.status==='ready'||s.familyStories?.active?.status==='ready'||
 s.worldPulse?.active?.status==='ready'||(s.justice?.years||0)>0;
}
function invitedGroup(s){
 const m=ensure(s);
 if(m.invites.length>=MAX_INVITES||s.age-m.lastOfferAge<4)return null;
 // Offers require actual NPC members and a real organization with a project.
 return m.groups.filter(g=>g.status==='active'&&contact(s,g)&&g.project&&g.years>=0)
  .sort((a,b)=>b.tension-a.tension||b.standing-a.standing||a.id.localeCompare(b.id))
  .find(g=>!m.completed.some(o=>o.groupId===g.id&&s.age-o.endedAge<5))||null;
}
function makeOffer(s,g,ctx){
 const m=ensure(s),p=contact(s,g);
 if(!p)return;
 const o={id:'circle-offer-g'+s.generation+'-'+(++m.serial),
  groupId:g.id,kind:g.kind,personId:p.id,personName:line(p.name,70),
  title:line(g.name+': a shared future',120),startedAge:s.age,
  dueAge:Math.min(110,s.age+2),status:'open',stage:0,
  decisions:[],ending:null,endedAge:null,finalLine:null};
 m.invites.push(o);m.lastOfferAge=s.age;
 news(s,ctx,p.name+' invited you to consider the future of '+g.name+'.');
}
function touch(s,id,trust,rivalry,label){
 const p=actor(s,id);
 if(!p)return {trust:0,rivalry:0};
 if(trust===0&&rivalry===0)return {trust:0,rivalry:0};
 if(p.kind==='family'){
  p.raw.world.trust=cap((p.raw.world.trust??p.trust)+trust);
  p.raw.world.rivalry=cap((p.raw.world.rivalry??p.rivalry)+rivalry);
  if(trust)p.raw.bond=cap(p.raw.bond+Math.round(trust*.5));
  p.raw.memories??=[];
  p.raw.memories.push({age:s.age,text:line(label,140)});
  p.raw.memories=p.raw.memories.slice(-15);
 }else{
  p.raw.trust=cap(p.raw.trust+trust);p.raw.rivalry=cap(p.raw.rivalry+rivalry);
  p.raw.history??=[];
  p.raw.history.push({age:s.age,kind:'circle',event:line(label,140)});
  p.raw.history=p.raw.history.slice(-18);
 }
 const now=actor(s,id);
 return {trust:now.trust-p.trust,rivalry:now.rivalry-p.rivalry};
}
function finish(s,o,ctx,reason=null){
 const m=ensure(s),g=m.groups.find(x=>x.id===o.groupId),p=actor(s,o.personId);
 const active=o.decisions.filter(x=>x.tag!=='independent');
 const ending=reason||(active.length===0?'independent':
  !p?'interrupted':!g||g.status!=='active'?'dissolved':
  active.every(x=>x.tag==='challenge')||g.tension>=72?'rivalry':
  active.some(x=>x.tag==='collaborate')&&p.trust>=56&&g.cohesion>=42?'alliance':
  g.cohesion>=g.tension?'negotiated':'unresolved');
 const messages={
  alliance:'The organization developed an enduring working connection.',
  rivalry:'The opposing interests became part of an ongoing rivalry.',
  negotiated:'Members reached a compromise without surrendering independence.',
  unresolved:'Neither side could fully reconcile their priorities.',
  independent:'The group continued on its own without your intervention.',
  dissolved:'The organization changed as its real members moved away.',
  interrupted:'The contact was no longer available to continue this story.',
  unanswered:'The invitation passed; the organization continued independently.'
 };
 o.status='completed';o.ending=ending;o.endedAge=s.age;
 o.finalLine=line(o.personName+' and '+(g?.name||'the organization')+': '+messages[ending],240);
 m.invites=m.invites.filter(x=>x.id!==o.id);
 m.completed.push({...o});m.completed=m.completed.slice(-MAX_COMPLETED);
 if(g){
  g.history.push({age:s.age,kind:'relationship',title:'A shared future with '+o.personName,
   outcome:ending,description:messages[ending]});
  g.history=g.history.slice(-8);
 }
 news(s,ctx,o.finalLine);
 return ending;
}
export function socialCirclesYear(s,ctx={}){
 if(!s.alive||s.age<18)return;
 const m=ensure(s);
 for(const g of m.groups)evolveGroup(s,g,ctx);
 tickInstitutions(s,ctx);
 for(const o of [...m.invites]){
  if(!actor(s,o.personId)){
   finish(s,o,ctx,'interrupted');continue;
  }
  if(o.status==='open'&&s.age>=o.startedAge+2){
   finish(s,o,ctx,'unanswered');continue;
  }
  if(o.status==='waiting'&&s.age>=o.dueAge){
   o.status='ready';
   news(s,ctx,o.personName+' wants to revisit '+(m.groups.find(x=>x.id===o.groupId)?.name||'the group')+
    ' after two years of independent change.');
  }
  if(o.status==='ready'&&s.age>=o.dueAge+2)finish(s,o,ctx);
 }
 const next=selectGroup(s);
 if(next)createGroup(s,next.kind,next.people,ctx);
 const g=invitedGroup(s);
 if(g)makeOffer(s,g,ctx);
}
export function socialCirclesCommands(s){
 const m=socialCirclesState(s);
 return [...fractureCommands(s),...successionCommands(s),...m.invites.flatMap(o=>{
  if(!['open','ready'].includes(o.status))return [];
  const group=m.groups.find(g=>g.id===o.groupId),p=actor(s,o.personId);
  return options(o).map(x=>({
   id:'circle:'+o.id+':'+x.index,label:x.label,
   detail:x.detail+' · '+o.personName,
   enabled:!blocked(s)&&s.actions>0&&!!group&&!!p&&group.status==='active'
  }));
 })];
}
export function socialCirclesAct(s,id,ctx){
 if(id.startsWith('circle:fracture:'))return fractureAct(s,id,ctx);
 if(id.startsWith('circle:succession:'))return successionAct(s,id,ctx);
 const parsed=/^circle:(circle-offer-g[0-9]+-[0-9]+):([012])$/.exec(id);
 if(!parsed||!socialCirclesCommands({...s,actions:s.actions+1})
  .some(x=>x.id===id&&x.enabled))
  throw Error('This group opportunity is not available.');
 const m=ensure(s),o=m.invites.find(x=>x.id===parsed[1]);
 if(!o)throw Error('The group invitation is no longer present.');
 const g=m.groups.find(x=>x.id===o.groupId),choice=options(o)[Number(parsed[2])];
 const p=actor(s,o.personId),prevStat=choice.stat?s.stats[choice.stat]:null,
  prevStanding=g.standing,prevTension=g.tension,prevProgress=g.project?.progress??0;
 const impact=touch(s,p.id,choice.trust,choice.rivalry,choice.label);
 if(choice.stat)ctx.change(s,choice.stat,choice.statDelta);
 g.standing=cap(g.standing+choice.standing);
 g.tension=cap(g.tension+choice.tension);
 if(g.project?.status==='active')g.project.progress=cap(g.project.progress+choice.progress);
 const actual={age:s.age,tag:choice.tag,label:choice.label,
  trustDelta:impact.trust,rivalryDelta:impact.rivalry,
  standingDelta:g.standing-prevStanding,tensionDelta:g.tension-prevTension,
  progressDelta:(g.project?.progress??prevProgress)-prevProgress,
  stat:choice.stat,statDelta:choice.stat?s.stats[choice.stat]-prevStat:0};
 o.decisions.push(actual);
 if(o.status==='open'){
  o.stage=1;o.status='waiting';o.dueAge=Math.min(110,s.age+2);
  news(s,ctx,'You spoke with '+o.personName+' about '+g.name+'. The members continue their own plans.');
 }else{ o.stage=2;finish(s,o,ctx); }
 return actual;
}
export function socialCirclesView(s){
 const m=socialCirclesState(s);
 return {age:s.age,
  groups:m.groups.map(g=>({...g,
   representative:g.leaderId?actor(s,g.leaderId)?.name||null:null,
   memberNames:g.members.map(id=>actor(s,id)?.name).filter(Boolean),
   project:g.project?{...g.project}:null,
   succession:g.governance?.election?{...g.governance.election,incumbentName:actor(s,g.governance.election.incumbent)?.name||null,challengerName:actor(s,g.governance.election.challenger)?.name||null}:null,
   history:g.history.slice(-5).reverse()
  })),
  invites:m.invites.map(o=>({
   ...o,contactAlive:!!actor(s,o.personId),
   trust:actor(s,o.personId)?.trust??null,
   rivalry:actor(s,o.personId)?.rivalry??null,
   groupName:m.groups.find(g=>g.id===o.groupId)?.name||o.title,
   lastDecision:o.decisions.at(-1)||null
  })).sort((a,b)=>(a.status==='ready'?0:a.status==='open'?1:2)-
    (b.status==='ready'?0:b.status==='open'?1:2)),
  completed:m.completed.slice(-8).reverse().map(o=>({
   id:o.id,title:o.title,personName:o.personName,kind:o.kind,
   ending:o.ending,endedAge:o.endedAge,finalLine:o.finalLine,
   decisions:o.decisions.length
  })),
  news:m.news.slice(-8).reverse(),ancestors:m.ancestors.slice().reverse(),count:m.completed.length};
}
export function socialCirclesInheritance(next,old){
 const source=socialCirclesState(old),m=fresh();
 // Institutions and projects have a continuing history, but no NPC from an
 // earlier generation is automatically present or allied to the new heir.
 m.serial=source.serial;
 m.groups=source.groups.map(g=>({
  ...g,members:[],leaderId:null,status:'dormant',lastAge:next.age,
  institution:g.institution?{...g.institution,crisis:null,strain:0,condition:'stable',lastReview:next.age,history:g.institution.history.slice(-10)}:undefined,
  governance:g.governance?{lastReview:next.age,termStart:next.age,election:null,results:g.governance.results.slice(-6),policy:'continuity'}:undefined,
  project:{id:g.id+'-project-heir-'+next.generation,mission:
   missions[g.kind][hash(g.id+':heir')%3],startedAge:next.age,
   dueAge:Math.min(110,next.age+4),progress:0,status:'paused'},
  history:g.history.slice(-8)
 }));
 const headline=source.completed.filter(x=>['alliance','rivalry','negotiated'].includes(x.ending)).slice(-3);
 m.ancestors=[...source.ancestors,{generation:old.generation,name:line(old.name,32),
  note:line(headline.length?headline.map(x=>x.personName+' · '+x.ending+
   ' with '+x.kind+' group').join('; '):
   source.groups.map(g=>g.name+' remained a part of the community').slice(-2).join('; ')||
    'Earlier generations built relationships that others could remember.',240)
 }].slice(-MAX_ANCESTORS);
 next.socialCircles=m;
}
export function validateSocialCircles(m){
 if(m===undefined)return true;
 const groupStatus=['active','dormant'],projectStatus=['active','paused'],
  phase=['open','waiting','ready','completed'],tags=['collaborate','challenge','independent'],
  endings=['alliance','rivalry','negotiated','unresolved','independent','dissolved','interrupted','unanswered'];
 const note=x=>x&&age(x.age)&&['project','relationship'].includes(x.kind)&&
  str(x.title,120)&&str(x.outcome,35)&&str(x.description,240);
 const project=p=>p&&str(p.id,120)&&str(p.mission,80)&&age(p.startedAge)&&
  age(p.dueAge)&&num(p.progress)&&p.progress>=0&&p.progress<=100&&
  projectStatus.includes(p.status);
 const validGovernance=g=>{const v=g.governance;if(v===undefined)return true;const e=v?.election;return !!v&&age(v.lastReview)&&age(v.termStart)&&['continuity','renewal'].includes(v.policy)&&Array.isArray(v.results)&&v.results.length<=6&&v.results.every(r=>r&&age(r.age)&&str(r.id,120)&&['retained','new-leadership','interrupted'].includes(r.outcome)&&(r.winnerName===null||str(r.winnerName,70))&&Number.isInteger(r.totalVotes)&&r.totalVotes>=0&&r.totalVotes<=5&&Number.isInteger(r.votesForChallenger)&&r.votesForChallenger>=0&&r.votesForChallenger<=r.totalVotes)&&(e===null||!!e&&str(e.id,120)&&str(e.incumbent,100)&&str(e.challenger,100)&&e.incumbent!==e.challenger&&age(e.startedAge)&&age(e.dueAge)&&e.dueAge===e.startedAge+2&&[0,8].includes(e.incumbentSupport)&&[0,8].includes(e.challengerSupport)&&(e.response===null||electionTags.includes(e.response)));};
 const validInstitution=g=>{const i=g.institution;if(i===undefined)return true;const c=i?.crisis;return !!i&&(i.parentId===null||str(i.parentId,90))&&(i.mergedInto===null||i.mergedInto===i.parentId)&&(!i.mergedInto||g.status==='dormant')&&['stable','strained','declining'].includes(i.condition)&&num(i.strain)&&i.strain>=0&&i.strain<=100&&age(i.lastReview)&&Array.isArray(i.history)&&i.history.length<=10&&i.history.every(h=>h&&age(h.age)&&['faction','split','founded','reform','declining','strained','recovered','merger','merged','defection'].includes(h.kind)&&str(h.text,200))&&(c===null||!!c&&str(c.id,120)&&age(c.startedAge)&&age(c.dueAge)&&c.dueAge===c.startedAge+2&&(c.response===null||['mediate','reform','neutral'].includes(c.response)));};
 const group=g=>g&&str(g.id,90)&&kinds.includes(g.kind)&&str(g.name,100)&&
  Number.isInteger(g.originGeneration)&&g.originGeneration>=1&&age(g.originAge)&&
  (g.anchorId===null||str(g.anchorId,100))&&
  Array.isArray(g.members)&&g.members.length<=5&&g.members.every(x=>str(x,100))&&
  new Set(g.members).size===g.members.length&&
  (g.leaderId===null||g.members.includes(g.leaderId))&&groupStatus.includes(g.status)&&
  (g.status==='active'?g.members.length>0:g.members.length===0)&&
  [g.standing,g.cohesion,g.tension].every(x=>num(x)&&x>=0&&x<=100)&&
  Number.isInteger(g.years)&&g.years>=0&&g.years<=110&&age(g.lastAge)&&
  Number.isInteger(g.projectNumber)&&g.projectNumber>=1&&g.projectNumber<=120&&
  project(g.project)&&Number.isInteger(g.completedProjects)&&
  g.completedProjects>=0&&g.completedProjects<=99&&
  Array.isArray(g.history)&&g.history.length<=8&&g.history.every(note)&&validGovernance(g)&&validInstitution(g);
 const decision=x=>x&&age(x.age)&&tags.includes(x.tag)&&str(x.label,110)&&
  ['trustDelta','rivalryDelta','standingDelta','tensionDelta','progressDelta','statDelta']
  .every(k=>num(x[k])&&Math.abs(x[k])<=100)&&
  (x.stat===null||['kindness','performance','social','confidence'].includes(x.stat));
 const offer=o=>o&&str(o.id,100)&&str(o.groupId,90)&&kinds.includes(o.kind)&&
  str(o.personId,100)&&str(o.personName,70)&&str(o.title,120)&&
  age(o.startedAge)&&age(o.dueAge)&&phase.includes(o.status)&&
  [0,1,2].includes(o.stage)&&Array.isArray(o.decisions)&&
  o.decisions.length<=2&&o.decisions.every(decision)&&
  (o.ending===null||endings.includes(o.ending))&&
  (o.endedAge===null||age(o.endedAge))&&
  (o.finalLine===null||str(o.finalLine,240))&&
  (o.status==='open'?o.stage===0&&o.decisions.length===0:
   ['waiting','ready'].includes(o.status)?o.stage===1&&o.decisions.length===1:
   o.ending!==null&&o.endedAge!==null&&str(o.finalLine,240));
 return !!m&&m.version===1&&Number.isInteger(m.serial)&&m.serial>=0&&
  Array.isArray(m.groups)&&m.groups.length<=MAX_GROUPS&&m.groups.every(group)&&
  new Set(m.groups.map(g=>g.id)).size===m.groups.length&&
  new Set(m.groups.filter(g=>!g.institution?.parentId).map(g=>g.kind)).size===m.groups.filter(g=>!g.institution?.parentId).length&&
  m.groups.every(g=>!g.institution?.parentId||m.groups.some(p=>p.id===g.institution.parentId&&p.id!==g.id&&p.kind===g.kind&&!p.institution?.parentId&&g.members.every(id=>!p.members.includes(id))))&&
  new Set(m.groups.filter(g=>g.institution?.parentId&&!g.institution.mergedInto).map(g=>g.institution.parentId)).size===m.groups.filter(g=>g.institution?.parentId&&!g.institution.mergedInto).length&&
  Array.isArray(m.invites)&&m.invites.length<=MAX_INVITES&&
  m.invites.every(o=>offer(o)&&o.status!=='completed'&&m.groups.some(g=>g.id===o.groupId))&&
  Array.isArray(m.completed)&&m.completed.length<=MAX_COMPLETED&&
  m.completed.every(o=>offer(o)&&o.status==='completed')&&
  new Set([...m.invites,...m.completed].map(o=>o.id)).size===m.invites.length+m.completed.length&&
  Array.isArray(m.news)&&m.news.length<=MAX_NEWS&&
  m.news.every(x=>age(x.age)&&str(x.text,225))&&
  Array.isArray(m.ancestors)&&m.ancestors.length<=MAX_ANCESTORS&&
  m.ancestors.every(x=>Number.isInteger(x.generation)&&x.generation>=1&&
   str(x.name,32)&&str(x.note,240))&&
  Number.isInteger(m.lastGroupAge)&&m.lastGroupAge>=-100&&
  Number.isInteger(m.lastOfferAge)&&m.lastOfferAge>=-100;
}
