// Persistent character responses and follow-up chapters for completed career projects.
// Fictional world systems: not political or medical instructions.
const clamp=x=>Math.max(0,Math.min(100,Math.round(x)));
const fallback={
 medical:{name:'Dr. Mina Park',role:'Care team coordinator'},
 business:{name:'Riley Chen',role:'Operations lead'},
 film:{name:'Avery Bell',role:'Production partner'},
 sports:{name:'Morgan Vale',role:'Sports rival'},
 election:{name:'Samira Noor',role:'Civic rival'}
};
export function ensureCareerSocial(s){
 const c=s.careerCampaigns??={active:null,completed:[],lastStarted:{},totals:{},news:[]};
 c.reactions??=[];c.aftermath??=[];c.contacts??={};
 return c;
}
export function careerContact(s,a){
 const ch=s.world?.characters||{};
 const group=a.type==='sports'?ch.athletes:a.type==='election'?ch.politicians:a.type==='film'?ch.agents:null;
 const match=group?.find(p=>p.id===a.stakeholderId)||group?.find(p=>a.type==='sports'?p.sport===a.theme:a.type==='film'?p.specialty===a.theme:true);
 if(match)return {id:match.id,name:match.name,role:a.type==='film'?'Talent representative':a.type==='sports'?'Sporting rival':'Civic opponent'};
 const c=ensureCareerSocial(s);const saved=c.contacts[a.type];
 if(saved)return {id:saved.id,name:saved.name,role:saved.role};
 const x=fallback[a.type];const contact={id:'career-npc-'+a.type,name:x.name,role:x.role,trust:50,history:[]};
 c.contacts[a.type]=contact;return {id:contact.id,name:contact.name,role:contact.role};
}
const lines={
 sports:{
  win:['acknowledges your tactical adjustment. The rivalry is getting sharper.','calls the match closely fought and asks for a rematch.'],
  loss:['praises the effort but is already studying your next move.','spots an opening and confidently predicts a tougher rematch.']},
 film:{
  win:['backs your creative judgment and offers to introduce another collaborator.','is impressed by the team’s patience under pressure.'],
  loss:['asks for a clearer production plan next time.','worries the crew may need more support to stay together.']},
 business:{
  win:['reports stronger customer confidence and improved team focus.','recommends reinvesting the goodwill into reliable delivery.'],
  loss:['warns that staff morale needs attention.','asks for clearer service promises before scaling further.']},
 election:{
  win:['acknowledges a fair answer and challenges you on implementation.','concedes a point, then promises a closer public debate.'],
  loss:['questions your credibility after the exchange.','raises public concerns that will not disappear after election night.']},
 medical:{
  win:['notes that the fictional team documented the handoff clearly.','welcomes the emphasis on consent and supervised coordination.'],
  loss:['requests additional oversight and a clearer documented review.','asks the team to slow down and confirm patient understanding.']}
};
export function careerReaction(s,a,{success,source='play',index=0}={}){
 const c=ensureCareerSocial(s);const contact=a.contact||careerContact(s,a);
 a.contact??=contact;
 const group=a.type==='sports'?s.world?.characters?.athletes:a.type==='election'?s.world?.characters?.politicians:a.type==='film'?s.world?.characters?.agents:null;
 const npc=group?.find(p=>p.id===contact.id)||c.contacts?.[a.type]||null;
 const effectiveSuccess=!!success;
 const delta=effectiveSuccess?3:-4;
 if(npc){
  if(typeof npc.respect==='number')npc.respect=clamp(npc.respect+(effectiveSuccess?3:1));
  if(typeof npc.rivalry==='number')npc.rivalry=clamp(npc.rivalry+(effectiveSuccess?2:4));
  if(typeof npc.trust==='number')npc.trust=clamp(npc.trust+delta);
  npc.history??=[];npc.history.push({age:s.age,kind:'career',type:a.type,source,positive:effectiveSuccess});npc.history=npc.history.slice(-18);
 }
 const options=lines[a.type][effectiveSuccess?'win':'loss'];const text=contact.name+' '+options[(a.stage+index)%options.length];
 const reaction={id:a.id+':'+source+':'+a.stage+':'+(a.reactions?.length||0),age:s.age,type:a.type,source,person:contact.name,role:contact.role,positive:effectiveSuccess,text,trustChange:delta,stage:a.stage};
 a.reactions??=[];a.reactions.push(reaction);a.reactions=a.reactions.slice(-20);
 c.reactions.push(reaction);c.reactions=c.reactions.slice(-60);
 return reaction;
}
const followups={
 sports:[
  ['Scouts remember the season','The performance is reviewed by coaches, and your rival is still watching.'],
  ['A rematch takes shape','A competitive rival returns with a revised strategy and a personal history.'],
  ['A career becomes a legacy','The season influences the next generation of competitors and coaches.']],
 film:[
  ['The film finds a second audience','An independent distributor revisits the production and asks about its collaborators.'],
  ['A creative partnership is tested','Your previous crew remembers how you treated people under pressure.'],
  ['The catalog tells its own story','The project becomes part of your lasting creative reputation.']],
 business:[
  ['The customer retention review','The launch has a reputation, and repeat customers are judging delivery.'],
  ['The team faces a new contract','Operational habits from the original launch influence negotiations.'],
  ['The brand outlasts the campaign','Decisions about reliability and fairness shape long-term demand.']],
 election:[
  ['The public asks for an update','People revisit promises made during the fictional election campaign.'],
  ['The rival returns to the conversation','Cooperation and public trust influence an important civic meeting.'],
  ['The community remembers','The long-term record matters more than the original applause.']],
 medical:[
  ['The fictional case receives follow-up','The coordinated care team checks its communication and continuity records.'],
  ['A structured quality review','Supervisors revisit the handoffs and patient feedback from the earlier case.'],
  ['The team shares what it learned','Responsible documentation becomes a training example for new colleagues.']]};
export function scheduleCareerAftermath(s,a,result){
 const c=ensureCareerSocial(s);
 const contact=a.contact||careerContact(s,a);
 const thread={id:a.id+':aftermath',type:a.type,title:a.type==='film'?'The film after the premiere':a.type==='sports'?'The season that changed things':a.type==='election'?'Promises after election night':a.type==='medical'?'The case after discharge':'The company after launch',
  startedAge:s.age,endedAge:s.age+5,nextAge:s.age+1,step:0,status:'active',result:!!result.succeeded,rating:result.rating,sourceId:a.id,contact,chapterLog:[]};
 c.aftermath.push(thread);c.aftermath=c.aftermath.slice(-24);
 return thread;
}
export function careerAftermathYear(s,ctx){
 const c=s.careerCampaigns;if(!c?.aftermath?.length)return;
 for(const t of c.aftermath){
  if(t.status!=='active'||s.age<t.nextAge)continue;
  const phase=t.step,def=followups[t.type]?.[phase];if(!def){t.status='completed';continue;}
  const strong=t.result&&t.rating>=55;
  const delta=strong?(phase===2?2:3):(phase===2?-2:-3);
  if(t.type==='sports'&&s.world?.sports){s.world.sports.form=clamp(s.world.sports.form+delta);ctx.change(s,'reputation',strong?1:-1);}
  if(t.type==='film'&&s.world?.entertainment){s.world.entertainment.fame=clamp(s.world.entertainment.fame+delta);ctx.change(s,'creativity',strong?1:0);}
  if(t.type==='business'&&s.business){s.business.demand=clamp((s.business.demand??50)+delta);s.business.quality=clamp(s.business.quality+(strong?1:0));}
  if(t.type==='election'&&s.world?.politics){s.world.politics.approval=clamp(s.world.politics.approval+delta);ctx.change(s,'reputation',strong?1:-1);}
  if(t.type==='medical'){ctx.change(s,'knowledge',strong?2:1);ctx.change(s,'reputation',strong?1:0);}
  const message=def[0]+': '+def[1]+' '+(strong?'Past preparation gives you a stronger foundation.':'Earlier tradeoffs still shape what happens next.');
  const chapter={age:s.age,phase:phase+1,title:def[0],message,delta};
  t.chapterLog.push(chapter);t.step++;t.nextAge=t.step===1?t.startedAge+3:t.step===2?t.startedAge+5:null;
  if(t.step===3)t.status='completed';
  c.news??=[];c.news.push({age:s.age,type:t.type,message});c.news=c.news.slice(-35);
  s.world??={};s.world.news??=[];s.world.news.push({age:s.age,text:message,domain:'career'});s.world.news=s.world.news.slice(-32);
  ctx.add(s,message,'career');
 }
}
export function careerSocialHistory(s){
 const c=s.careerCampaigns||{};
 return {reactions:(c.reactions||[]).slice(-12).reverse(),aftermath:(c.aftermath||[]).slice(-16).reverse().map(x=>({...x,chapterLog:x.chapterLog.slice()}))};
}
