// Lifely original, local autonomous world: school cohorts, changing NPC bonds, and
// long-running opportunities. Uses the existing life RNG; never calls Math.random.
const clamp=x=>Math.max(0,Math.min(100,Math.round(x)));
const storyKinds={
 community:{title:'A neighborhood promise',chapters:[
  ['An invitation returns','An old connection asks you to join a practical project for local people.'],
  ['The project is tested','The neighborhood idea grows, and your earlier choices affect the next decision.'],
  ['A legacy takes shape','The community remembers who shared the work and who stayed away.']]},
 creative:{title:'The independent creative circle',chapters:[
  ['The first collaboration','Someone from your past has an idea and seeks a trustworthy creative partner.'],
  ['A difficult production','The team must balance creative ambition with people and deadlines.'],
  ['The work finds its audience','Years later, the creative effort has its own reputation and admirers.']]},
 enterprise:{title:'The venture with old friends',chapters:[
  ['An unexpected proposal','A familiar face proposes a modest new enterprise and asks for your input.'],
  ['A difficult expansion','Customer expectations and teamwork make the next decision consequential.'],
  ['What the company became','The company has a reputation that reflects past decisions and relationships.']]},
 competition:{title:'A rivalry revisited',chapters:[
  ['An old challenge resurfaces','A former classmate challenges you to revisit a competition.'],
  ['The stakes have changed','A rival has developed new skills; a fair response can earn lasting respect.'],
  ['The final rematch','Your old rivalry has become part of both people’s life stories.']]},
 reunion:{title:'The reunion that changes everything',chapters:[
  ['A surprising reunion','Someone from school asks to reconnect with the people you once knew.'],
  ['Old bonds, new questions','Relationships have changed since school. New opportunities are taking shape.'],
  ['The friends who stayed','The reunion becomes a test of which old connections can last.']]},
 mentorship:{title:'A chance to pay it forward',chapters:[
  ['Someone needs a mentor','An old friend asks you to help a younger team find their footing.'],
  ['The people you encouraged','The team is growing, and your advice is being tested.'],
  ['A lesson outlives the moment','An earlier act of mentorship returns as a surprising opportunity.']]}
};
const storyNames=Object.keys(storyKinds);
const socialDescriptors={
 strangers:'have not really met',
 friends:'have built a friendship',
 partners:'are working together as partners',
 rivals:'are locked in a rivalry',
 estranged:'have grown apart'
};
export const emptyAutonomy=()=>({version:1,alumni:[],links:[],arcs:[],completed:[],news:[],lastStartedAge:null,used:{},archive:[]});
export const autonomyState=s=>s.world?.autonomy||emptyAutonomy();
const ensure=s=>{s.world??={};return s.world.autonomy??=emptyAutonomy();};
function news(s,ctx,msg,kind='people'){
 const a=ensure(s),item={age:s.age,text:msg,kind};a.news.push(item);a.news=a.news.slice(-50);
 s.world.news??=[];s.world.news.push({age:s.age,text:msg,domain:'relationships'});s.world.news=s.world.news.slice(-32);
 if(ctx?.add)ctx.add(s,msg,'world');
}
const personFor=(s,id)=>{
 const a=autonomyState(s);
 if(id?.startsWith('alum-'))return a.alumni.find(x=>x.id===id);
 if(id?.startsWith('person-'))return s.people.find(x=>'person-'+x.id===id&&x.alive);
 const c=s.world?.characters||{};
 return [...(c.athletes||[]),...(c.politicians||[]),...(c.agents||[])].find(x=>x.id===id);
};
function rating(p){return Number.isFinite(p?.trust)?p.trust:Number.isFinite(p?.world?.trust)?p.world.trust:55;}
function pressure(p){return Number.isFinite(p?.rivalry)?p.rivalry:Number.isFinite(p?.world?.rivalry)?p.world.rivalry:20;}
function updatePerson(p,value,conflict,age,label){
 if(!p)return;
 if('trust'in p)p.trust=clamp(p.trust+value);
 if('rivalry'in p)p.rivalry=clamp(p.rivalry+conflict);
 if(p.world){if(Number.isFinite(p.world.trust))p.world.trust=clamp(p.world.trust+value);
  if(Number.isFinite(p.world.rivalry))p.world.rivalry=clamp(p.world.rivalry+conflict);}
 p.history??=[];if(Array.isArray(p.history)){p.history.push({age,kind:'autonomy',event:label});p.history=p.history.slice(-18);}
}
function alumniMigration(s){
 const a=ensure(s),school=s.everydayScenes;
 if(s.age<18||!school)return;
 const source=school.classmates?.length?school.classmates:school.classmate?[school.classmate]:[];
 for(const p of source){
  if(!p||a.alumni.some(x=>x.id===p.id))continue;
  if(a.alumni.length>=8)break;
  const id=p.id||'alum-'+a.alumni.length;
  a.alumni.push({id,name:p.name,age:s.age,trust:clamp(p.trust??50),rivalry:clamp(p.rivalry??10),preference:p.preference??0,
   connection:'former classmate',status:'friends',profession:['Designer','Teacher','Founder','Athlete','Community organizer','Researcher'][a.alumni.length%6],
   collaborations:0,contests:0,lastInteractionAge:-1,partnerId:null,history:(p.history||[]).slice(-10),schoolAge:p.joinedAge??12});
 }
}
function linkKey(a,b){return [a,b].sort().join('|');}
function relationType(link){
 if(link.trust>=74&&link.years>=2)return 'partners';
 if(link.trust>=52)return 'friends';
 if(link.trust<=26)return 'estranged';
 if(link.rivalry>=57)return 'rivals';
 return 'strangers';
}
function evolveNPCLinks(s,ctx){
 const a=ensure(s),people=a.alumni;
 if(people.length<2)return;
 const pairs=[];
 for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++)pairs.push([people[i],people[j]]);
 // Touch only a few pairs each year; companions still live while the player works elsewhere.
 for(let attempt=0;attempt<Math.min(3,pairs.length);attempt++){
  const [p,q]=pairs[Math.floor(ctx.rng(s)*pairs.length)];
  const key=linkKey(p.id,q.id);
  let link=a.links.find(x=>x.id===key);
  if(!link){link={id:key,a:p.id,b:q.id,trust:clamp((p.trust+q.trust)/2+Math.round((ctx.rng(s)-.5)*14)),
   rivalry:clamp((p.rivalry+q.rivalry)/2),status:'strangers',years:0,kind:'professional',history:[]};
   a.links.push(link);
  }
  if(link.lastEvolvedAge===s.age)continue;
  link.lastEvolvedAge=s.age;link.years++;
  const previous=link.status;
  const change=Math.round((ctx.rng(s)-.43)*17+(p.preference===q.preference?3:-2));
  link.trust=clamp(link.trust+change);
  link.rivalry=clamp(link.rivalry+(change<0?4:-3)+(ctx.rng(s)<.075?18:0));
  if(previous==='partners'&&ctx.rng(s)<.065){link.trust=clamp(link.trust-24);link.rivalry=clamp(link.rivalry+22);}
  link.status=relationType(link);
  if(link.status==='partners'&&previous!=='partners'){
   // Partnership may be romantic or professional, between consenting fictional adults.
   const romanticallyAvailable=!people.some(n=>n.partnerId===p.id||n.partnerId===q.id);
   link.kind=romanticallyAvailable&&ctx.rng(s)<.30?'romantic':'professional';
   if(link.kind==='romantic'){p.partnerId=q.id;q.partnerId=p.id;}
  }
  if(previous==='partners'&&link.status!=='partners'){
   if(p.partnerId===q.id)p.partnerId=null;if(q.partnerId===p.id)q.partnerId=null;
  }
  if(link.status!==previous&&['partners','rivals','estranged','friends'].includes(link.status)){
   const msg=p.name+' and '+q.name+' '+socialDescriptors[link.status]+'.';
   link.history.push({age:s.age,status:link.status,kind:link.kind,text:msg});link.history=link.history.slice(-8);
   updatePerson(p,link.status==='partners'?3:link.status==='rivals'?-3:1,link.status==='rivals'?4:-1,s.age,msg);
   updatePerson(q,link.status==='partners'?3:link.status==='rivals'?-3:1,link.status==='rivals'?4:-1,s.age,msg);
   news(s,ctx,msg,'network');
  }
  // Keep the preexisting relationship graph informed; no duplicate contact IDs.
  s.world.network??={version:1,edges:[],news:[],dialogues:[],histories:{},talked:{},lastEvent:null,archives:[],conversation:null};
  const n=s.world.network;n.edges??=[];
  let edge=n.edges.find(e=>e.key===key);
  if(!edge&&n.edges.length<64){edge={key,a:p.id,b:q.id,firstMetAge:s.age,trust:link.trust,loyalty:clamp(65-link.rivalry*.3),status:'acquaintances',betrayals:0,years:0,memories:[]};n.edges.push(edge);}
  if(edge){edge.trust=link.trust;edge.loyalty=clamp(65-link.rivalry*.3);edge.status=link.status==='partners'?'allies':link.status==='friends'?'friends':link.status==='rivals'?'rivals':link.status==='estranged'?'estranged':'acquaintances';
   edge.relationshipType=link.status==='partners'?link.kind+' partnership':link.status;edge.years=link.years;}
 }
}
function beginArc(s,ctx){
 const a=ensure(s);
 if(a.arcs.filter(x=>x.status==='active').length>=3||a.lastStartedAge===s.age)return;
 const candidates=[
  ...a.alumni.map(p=>({id:p.id,name:p.name,background:'classmate'})),
  ...s.people.filter(p=>p.alive&&['friend','sibling','child','partner'].includes(p.role)&&p.age>=12).slice(0,6).map(p=>({id:'person-'+p.id,name:p.name,background:p.role}))
 ];
 if(!candidates.length)return;
 const person=candidates[Math.floor(ctx.rng(s)*candidates.length)];
 const weights=person.background==='classmate'?['reunion','competition','enterprise','creative','mentorship','community']:['community','reunion','mentorship','creative','enterprise'];
 const kind=weights[Math.floor(ctx.rng(s)*weights.length)];
 const def=storyKinds[kind],startedAge=s.age;
 const arc={id:'autonomy-'+s.generation+'-'+s.age+'-'+(a.arcs.length+a.completed.length+1),
  title:def.title,kind,npcId:person.id,npcName:person.name,origin:person.background,startedAge,dueAge:startedAge+1,
  stage:0,status:'active',quality:50,relationships:50,history:[],last:null};
 a.arcs.push(arc);a.lastStartedAge=s.age;
 news(s,ctx,person.name+' has started a new chapter: '+def.title.toLowerCase()+'. The consequences may reach you in later years.','opportunity');
}
function advanceArc(s,arc,decision,ctx){
 const npc=personFor(s,arc.npcId),stage=arc.stage,accepted=decision===0||decision===1;
 const relevant=arc.kind==='creative'?s.stats.creativity:arc.kind==='enterprise'?s.stats.knowledge:
 arc.kind==='competition'?s.stats.confidence:arc.kind==='mentorship'?s.stats.kindness:s.stats.social;
 const odds=clamp(30+relevant*.40+(rating(npc)-50)*.14+(arc.quality-50)*.15+(decision===1?7:0)-(arc.kind==='competition'?9:0),15,92);
 const success=decision===2?false:decision===-1?false:ctx.rng(s)*100<odds;
 const delta=accepted?(success?7:-4):decision===2?-2:-3;
 arc.quality=clamp(arc.quality+delta);
 arc.relationships=clamp(arc.relationships+(accepted?(success?6:-3):decision===2?0:-2));
 const positive=accepted&&success;
 if(npc&&decision!==-1)updatePerson(npc,positive?4:decision===2?0:-2,positive?-2:accepted?2:0,s.age,arc.title);
 if(accepted){
  if(arc.kind==='creative'){ctx.change(s,'creativity',success?4:1);ctx.change(s,'confidence',success?2:-1);if(s.world?.entertainment)s.world.entertainment.fame=clamp(s.world.entertainment.fame+(success?2:0));}
  else if(arc.kind==='enterprise'){ctx.change(s,'knowledge',success?3:1);if(s.business)s.business.demand=clamp((s.business.demand??50)+(success?4:-2));else if(s.job&&success)ctx.change(s,'performance',3);}
  else if(arc.kind==='competition'){ctx.change(s,'confidence',success?4:-2);if(s.world?.sports)s.world.sports.form=clamp(s.world.sports.form+(success?3:0));}
  else if(arc.kind==='mentorship'){ctx.change(s,'kindness',success?4:2);ctx.change(s,'reputation',success?2:0);}
  else {ctx.change(s,'social',success?4:1);ctx.change(s,'reputation',success?2:0);}
  ctx.change(s,'stress',decision===0?3:1);
 }else if(decision===2)ctx.change(s,'stress',-2);
 const option=decision===0?'Take an active role':decision===1?'Offer thoughtful support':decision===2?'Protect your own priorities':'Let the invitation pass';
 const outcome=decision===-1?'unanswered':decision===2?'declined':success?'progress':'complicated';
 arc.last={age:s.age,stage,decision,success,option,outcome};
 arc.history.push(arc.last);arc.stage++;
 if(arc.stage>=3){arc.status='completed';arc.dueAge=null;arc.endedAge=s.age;arc.outcome=arc.history.filter(h=>h.success).length>=2?'lasting':arc.quality>=50?'mixed':'faded';
  const a=ensure(s);a.completed.push({...arc});a.completed=a.completed.slice(-24);a.arcs=a.arcs.filter(x=>x.id!==arc.id);
  news(s,ctx,arc.npcName+': '+arc.title+' concluded with a '+arc.outcome+' legacy.','opportunity');
 }else arc.dueAge=arc.startedAge+[1,3,5][arc.stage];
 if(decision>=0)news(s,ctx,'You chose to '+option.toLowerCase()+' with '+arc.npcName+' during '+arc.title.toLowerCase()+'.','opportunity');
 return arc.last;
}
export function autonomyYear(s,ctx){
 if(s.age<13)return;
 const a=ensure(s);alumniMigration(s);
 if(s.age>=18)evolveNPCLinks(s,ctx);
 for(const arc of [...a.arcs])if(arc.status==='active'&&s.age>arc.dueAge)advanceArc(s,arc,-1,ctx);
 if((s.age===18&&a.alumni.length>0)||(s.age>=15&&s.age%4===0&&a.lastStartedAge!==s.age&&ctx.rng(s)<.78)){
  beginArc(s,ctx);
 }
 // Personal alumni reputations continue evolving regardless of player interaction.
 for(const p of a.alumni){
  p.age=s.age;const change=Math.round((ctx.rng(s)-.48)*6);
  p.trust=clamp(p.trust+change);
  if(p.status==='partners'&&p.trust<40)p.status='former partner';
  else if(p.rivalry>=65)p.status='rival';
  else if(p.partnershipAge!==undefined&&p.trust>=45)p.status='partner';
  else if(p.trust>=65)p.status='ally';
  else if(p.trust<34)p.status='estranged';
  else p.status='friends';
 }
}
export function autonomyCommands(s){
 if(!s.alive||s.pending!==null||s.mini||s.world?.network?.conversation||s.careerCampaigns?.active||s.everydayScenes?.active||(s.justice?.years||0)>0)return [];
 const a=autonomyState(s),available=s.actions>0,out=[];
 for(const p of a.alumni){
  if(p.lastInteractionAge===s.age)continue;
  for(const [kind,label,detail] of [
   ['reconnect','Reconnect with ','Hear their current goals and rebuild trust'],
   ['collaborate','Collaborate with ','Build a working partnership based on trust'],
   ['compete','Challenge ','Turn an old rivalry into a fair competition']]){
   out.push({id:'autonomy:alumni:'+p.id+':'+kind,label:label+p.name,detail:detail+' · '+p.status,enabled:available&&(kind!=='collaborate'||p.trust>=40)});
  }
 }
 for(const arc of a.arcs)if(arc.status==='active'&&arc.dueAge===s.age){
  for(const [decision,label] of [[0,'Join the next chapter'],[1,'Offer careful support'],[2,'Respectfully step aside']])
   out.push({id:'autonomy:arc:'+arc.id+':'+decision,label:label+' · '+arc.npcName,detail:arc.title+' · Chapter '+(arc.stage+1)+'/3',enabled:available});
 }
 return out;
}
export function autonomyAction(s,id,ctx){
 if(!autonomyCommands({...s,actions:s.actions+1}).some(x=>x.id===id&&x.enabled))throw Error('This living-world action is not available.');
 const a=ensure(s),parts=id.split(':');
 if(parts[1]==='arc'){
  const index=Number(parts.at(-1)),arcId=parts.slice(2,-1).join(':');
  const arc=a.arcs.find(x=>x.id===arcId&&x.status==='active'&&x.dueAge===s.age);
  if(!arc||!Number.isInteger(index)||index<0||index>2)throw Error('Invalid story opportunity.');
  return advanceArc(s,arc,index,ctx);
 }
 if(parts[1]==='alumni'){
  const index=parts.at(-1),key=parts.slice(2,-1).join(':'),p=a.alumni.find(x=>x.id===key);
  if(!p||!['reconnect','collaborate','compete'].includes(index))throw Error('Unknown alumni action.');
  const odds=clamp(32+(s.stats.social-45)*.3+(p.trust-40)*.28-(p.rivalry-25)*.09+(index==='collaborate'?s.stats.knowledge*.12:0),12,91);
  const success=ctx.rng(s)*100<odds;p.lastInteractionAge=s.age;
  if(index==='reconnect'){updatePerson(p,success?12:3,success?-7:0,s.age,'Reconnected with '+s.name);ctx.change(s,'happiness',success?3:1);}
  if(index==='collaborate'){updatePerson(p,success?9:-2,success?-5:3,s.age,'Cooperated with '+s.name);p.collaborations++;
   if(success){p.partnershipAge??=s.age;p.status='partner';ctx.change(s,s.job?'performance':'knowledge',4);if(s.business)s.business.demand=clamp((s.business.demand??50)+3);}
   else ctx.change(s,'stress',2);
  }
  if(index==='compete'){updatePerson(p,success?2:-3,success?2:8,s.age,'Rivalry challenge with '+s.name);p.contests++;
   ctx.change(s,'confidence',success?5:-2);}
  a.used[key]=s.age;news(s,ctx,p.name+' '+(success?'responded positively':'had mixed feelings')+' after your attempt to '+index+'.','alumni');
  return {name:p.name,success,kind:index,trust:p.trust,rivalry:p.rivalry};
 }
 throw Error('Unknown living-world action.');
}
export function autonomyView(s){
 const a=autonomyState(s);
 return {alumni:(a.alumni||[]).map(p=>({...p,history:(p.history||[]).slice(-3)})),
  links:(a.links||[]).map(e=>({...e,nameA:a.alumni.find(p=>p.id===e.a)?.name||'Someone',
   nameB:a.alumni.find(p=>p.id===e.b)?.name||'Someone',history:(e.history||[]).slice(-3)})),
  opportunities:(a.arcs||[]).filter(x=>x.status==='active').map(arc=>{
   const def=storyKinds[arc.kind]?.chapters?.[arc.stage]||['A new chapter','An old choice changes what comes next.'];
   return {...arc,chapterTitle:def[0],chapterText:arc.npcName+': '+def[1],ready:arc.dueAge===s.age,history:arc.history.slice()};
  }).sort((x,y)=>x.dueAge-y.dueAge),
  completed:(a.completed||[]).slice(-10).reverse(),
  news:(a.news||[]).slice(-12).reverse(),archive:(a.archive||[]).slice(-10).reverse()};
}
export function autonomyInheritance(next,old){
 const oldA=old.world?.autonomy;if(!oldA)return;
 const a=ensure(next);a.archive=[...(oldA.archive||[]),...(oldA.completed||[]).map(x=>({title:x.title,outcome:x.outcome,startedAge:x.startedAge,endedAge:x.endedAge,source:old.name})),...(oldA.news||[]).slice(-5).map(x=>({...x,source:old.name}))].slice(-30);
 a.alumni=[];a.links=[];a.arcs=[];a.completed=[];a.used={};a.lastStartedAge=null;
}
