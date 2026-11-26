// Original cross-industry workplace sagas for Lifely. No real employers or institutions.
// Three authored chapters per industry, two persistent colleagues, age-gated callbacks.
// All simulations are deterministic and offline; older version 2 saves may omit this state.
const clamp=x=>Math.max(0,Math.min(100,Math.round(x)));
const firms=[
 {id:'service',industry:'Service & hospitality',title:'The night the lobby changed',story:'A busy service team must choose between appearances, dependable care and personal ambition.',chapters:[
  ['A lost reservation','An exhausted guest arrives. The reservation system has failed, and your ambitious colleague wants to blame the night shift.','Work with the night shift to secure a room','Rebuild the booking trail and find the technical fault','Publicly challenge your colleague for control','team'],
  ['A holiday rush','Two years later a holiday crowd arrives. The new process is under pressure and employees are stretched thin.','Share the queue and redistribute breaks','Redesign check-in and measure the wait','Promise an impossible turnaround to impress leadership','craft'],
  ['The promotion meeting','Guest satisfaction improved, but a colleague wants sole credit in front of management.','Present the team and recognize quiet work','Show a documented service record','Demand recognition and force a public vote','team']]},
 {id:'trades',industry:'Trades & construction',title:'The project behind the safety fence',story:'A complex job site asks whether a crew can stay safe, finish well and keep its word.',chapters:[
  ['The missing inspection','A subcontractor asks to start without the agreed safety check because the schedule is slipping.','Gather the crew and schedule a proper inspection','Review the drawings and resolve the actual hold-up','Push the crew ahead to beat another contractor','craft'],
  ['The expensive defect','A delivery contains a batch of material that may fail later; rework threatens the contract.','Tell the team and agree a safe repair plan','Document and replace the defective batch','Hide the defect to protect your personal performance','craft'],
  ['Who finished the job?','The project is finally ready and senior staff want a quick story about who made it happen.','Credit the crews whose work kept it safe','Present inspection evidence and the measured results','Claim you alone rescued the schedule','team']]},
 {id:'technology',industry:'Technology & data',title:'The system nobody wants to own',story:'An important product needs maintainers, trusted evidence and decisions that survive a deadline.',chapters:[
  ['A quiet production bug','Customers are reporting strange failures. Your rival wants to ship a flashy new feature first.','Coordinate a careful incident review','Reproduce the fault and publish the root cause','Ship immediately and try to outrun the complaints','craft'],
  ['The disputed model','A data model appears accurate overall but fails badly for a small group of users.','Ask users and the team to inspect the impact','Re-test the data and adjust the validation','Announce success before the adverse cases are reviewed','team'],
  ['A launch everyone remembers','A product is nearly ready. A colleague proposes cutting monitoring to make the launch more dramatic.','Create a shared launch and support rota','Run readiness checks and keep the rollback plan','Go live without safeguards for a headline','craft']]},
 {id:'healthcare',industry:'Healthcare & care',title:'A promise to the care team',story:'A fictional care team learns that professional trust is built on listening and careful handovers.',chapters:[
  ['The rushed handover','A tired team member has missed an important detail during a fictional shift handover.','Listen, clarify and support the handover','Check the care notes and correct the record','Blame the colleague publicly before confirming the facts','team'],
  ['The difficult schedule','Two years later the team is short-staffed. Someone suggests skipping the agreed handoff process.','Coordinate safe coverage and rest breaks','Review capacity and document a workable rota','Take unilateral control and overpromise coverage','craft'],
  ['Who speaks for the team?','A new coordinator asks for one practical change that will improve the fictional workplace.','Represent staff feedback and patient dignity','Share evidence from the improved handoff process','Demand authority without making a plan','team']]},
 {id:'science',industry:'Science & engineering',title:'The experiment that challenged the lab',story:'A research team is under pressure to publish before its methods are ready.',chapters:[
  ['The surprising result','The results seem extraordinary, but repeat measurements do not agree. A rival wants the press release now.','Invite skeptical colleagues to inspect the method','Repeat the experiment and trace the discrepancy','Publish a definitive claim to win attention','craft'],
  ['The shared invention','A promising prototype combines several colleagues’ contributions and the credit is disputed.','Negotiate fair authorship with the team','Document each contribution and rerun validation','Claim the design before the review is finished','team'],
  ['The funding hearing','A fictional grant panel asks whether the team can reproduce its work without hiding setbacks.','Let collaborators explain their contributions','Present reproducible data and unresolved limits','Promote a bold promise with no supporting tests','craft']]},
 {id:'finance',industry:'Finance & enterprise',title:'The account that tested your judgment',story:'A fictional finance firm faces decisions where accurate reporting competes with short-term attention.',chapters:[
  ['The impressive projection','A forecast looks excellent, but a teammate has noticed assumptions that may not survive scrutiny.','Ask the team for alternative scenarios','Reconcile the inputs and publish the uncertainty','Present only the optimistic case to get promoted','craft'],
  ['The client promise','A client wants a fast result and a colleague has promised more than the team can responsibly deliver.','Reset expectations through a transparent conversation','Build a verified delivery plan with measurable risks','Double down on the guarantee to outshine the rival','team'],
  ['The year-end review','Management wants an account of strong results and the setbacks the team corrected.','Recognize the people who caught problems early','Present the audit trail and accurate outcomes','Hide the setbacks and claim exceptional returns','craft']]},
 {id:'creative',industry:'Creative & media',title:'A production with two visions',story:'A creative team fights to keep its identity while deadlines and reputations change.',chapters:[
  ['The rejected concept','A client dislikes the first concept. Your rival wants to replace the whole team instead of listening.','Hold an honest feedback workshop','Prototype a smaller concept and test the message','Steal the spotlight with an unapproved campaign','team'],
  ['The late-night edit','Two years later your best scene is too long for the format, and the lead editor feels overlooked.','Share the edit room and honor the editor’s ideas','Find a tighter version that preserves the story','Cut everyone else’s work without consultation','craft'],
  ['The festival invitation','A small festival offers an opportunity, but only one team member may accept an award on stage.','Give the platform to the contributors','Present how the finished work improved','Insist the award belong to you alone','team']]},
 {id:'education',industry:'Education & society',title:'The project that changed a classroom',story:'A learning community asks how fairness, patient teaching and evidence can coexist.',chapters:[
  ['A student falls behind','A student struggles with the standard assignment. A colleague says the whole class must move on.','Ask the student and family what support helps','Adapt the activity and assess understanding fairly','Use the student’s results to win an argument with a colleague','team'],
  ['The crowded program','An after-school program grows faster than its volunteers can support.','Invite families and colleagues to share the planning','Measure where the program needs extra resources','Expand recklessly to claim the biggest program','craft'],
  ['A shared achievement','Students improve, but the credit has become a source of friction among the adults.','Celebrate learners and support staff together','Show what the evidence says worked','Claim the entire program as your invention','team']]},
 {id:'public',industry:'Public & legal',title:'The case for public trust',story:'A fictional civic service confronts complicated records, fairness and public accountability.',chapters:[
  ['A disputed record','A colleague asks you to close a fictional administrative file before all relevant accounts are heard.','Invite the affected people to explain their concerns','Check the record and document the uncertainties','Close the file and use speed to impress superiors','craft'],
  ['The public meeting','People have questions about delays and another officer wants a defensive statement.','Listen and answer questions respectfully','Publish a clear timeline with checked facts','Use the meeting to attack a professional rival','team'],
  ['The independent review','An oversight group asks what the office learned, including mistakes that were corrected.','Give teammates credit for speaking up','Show the decisions and improvements transparently','Turn the review into a personal victory speech','craft']]},
 {id:'transport',industry:'Transport & logistics',title:'The route that nearly broke the team',story:'An operations crew must balance delivery promises, maintenance and human limits.',chapters:[
  ['The urgent shipment','An urgent delivery is late and the crew reports that a key vehicle needs maintenance.','Coordinate an honest revised delivery plan','Find a safe alternative route and check capacity','Ignore the maintenance warning to beat your rival','craft'],
  ['The network bottleneck','Two years later a new routing system creates longer delays for a remote district.','Ask local teams what has changed','Analyze the route data and fix the bottleneck','Blame the drivers and demand impossible targets','team'],
  ['A winter disruption','Severe weather threatens the schedule, while leadership asks who will own the response.','Share the decision with the drivers and dispatchers','Recalculate routes with safety margins','Promise on-time delivery regardless of conditions','craft']]},
 {id:'nature',industry:'Nature & agriculture',title:'The land you agreed to protect',story:'A farming or nature team must manage long seasons, ecosystems and cooperation.',chapters:[
  ['An uncertain harvest','A dry season threatens the crop. Your colleague wants to use all the available water immediately.','Agree a shared water and crop care plan','Check soil conditions and adjust irrigation carefully','Take water from a neighboring plot without asking','craft'],
  ['The pollinator problem','A new land-management proposal could reduce the habitat supporting local plants and insects.','Bring neighbors and workers into the discussion','Compare land-use results and protect the habitat','Dismiss concerns to win an early award','team'],
  ['The next generation','The season improves, and young workers ask what practices are worth carrying forward.','Make the lessons available to the whole team','Document what worked and what failed','Keep the method secret to protect your status','team']]},
 {id:'retail',industry:'Retail & administration',title:'The store that remembered its people',story:'A workplace learns whether growth can preserve dependable service and trusted colleagues.',chapters:[
  ['The missing inventory','A popular item disappears from inventory and a rival points to a junior employee without evidence.','Support the junior worker while checking facts','Reconcile the records and identify the real cause','Blame the employee to win favor with management','craft'],
  ['The busiest week','A promotion boosts traffic. Workers are exhausted and the stockroom becomes disorganized.','Agree fair shifts and share the workload','Fix inventory flow and measure customer waiting','Overpromise sales targets and take the credit','team'],
  ['The new branch','Leadership offers a chance to shape a new branch, but the team disagrees about staffing.','Train colleagues for shared leadership','Prepare a careful staffing and demand plan','Demand the role without accepting responsibility','team']]}
];
export const workplaceTypes=firms.map(({id,industry,title,story})=>({id,industry,title,story}));
const people=['Maya Torres','Jordan Lin','Avery Brooks','Kai Mercado','Samira Park','Morgan Reed','Elena Noor','Rafael Chen','Jules Rivera','Nadia Vale','Taylor Hart','Robin Tan','Casey Stone','Alexandra Moss','Drew Bennett','Mina Clarke','Emery Santos','Sofia Hale','Noah Patel','Quinn Lewis','Riley Kim','Amir Cole','Leila Grant','Max Chen'];
export const emptyWorkplace=()=>({version:1,standing:50,currentJob:null,contacts:{},active:null,completed:[],unfulfilled:[],ancestry:[],news:[],lastStartAge:null,started:0});
export const workplaceState=s=>s.workplace||emptyWorkplace();
const ensure=s=>(s.workplace??=emptyWorkplace());
function trackFor(s,careers){return firms.find(x=>x.industry===careers[s.job?.id]?.industry)||null;}
function personnel(s,firm,ctx){
 const w=ensure(s);if(w.contacts[firm.id])return w.contacts[firm.id];
 const seed=Math.floor(ctx.rng(s)*people.length);
 const names=[people[seed],people[(seed+11)%people.length]];
 const contacts=[
  {id:firm.id+'-lead',name:names[0],role:'Team lead',trust:52,rivalry:10,skill:48,wins:0,history:[],age:s.age+4},
  {id:firm.id+'-rival',name:names[1],role:'Competitive colleague',trust:43,rivalry:33,skill:51,wins:0,history:[],age:s.age+2}
 ];
 w.contacts[firm.id]=contacts;return contacts;
}
function archive(s,a,status,ctx){
 const w=ensure(s),firm=firms.find(x=>x.id===a.track),contacts=w.contacts[a.track]||[];
 const result=a.impact>=54?'breakthrough':a.impact>=29?'progress':'mixed';
 const record={id:a.id,track:a.track,jobTitle:a.jobTitle,firmTitle:firm.title,age:a.startedAge,endedAge:s.age,
  status,result,impact:a.impact,choices:a.choices.map(x=>({...x})),lead:a.lead,rival:a.rival,careerId:a.jobId,owner:s.name,
  standing:w.standing};
 if(status==='completed'){
  const bonus=ctx.money((result==='breakthrough'?1600:result==='progress'?700:200)*ctx.country(s).salary);
  s.cash+=bonus;record.reward=bonus;
  ctx.change(s,'confidence',result==='breakthrough'?6:2);
  ctx.change(s,'performance',result==='breakthrough'?9:result==='progress'?5:2);
  if(result==='breakthrough')ctx.change(s,'reputation',3);
  if(s.job?.id===a.jobId)s.job.experience=clamp((s.job.experience||0)+(result==='breakthrough'?12:6));
  const message=firm.title+' concluded as '+result+'. Bonus: $'+bonus.toLocaleString('en-US')+'.';
  w.completed.push(record);w.completed=w.completed.slice(-24);
  ctx.add(s,message,'career');w.news.push({age:s.age,text:message});
 }else{
  w.unfulfilled.push(record);w.unfulfilled=w.unfulfilled.slice(-18);
  if(status==='neglected'){w.standing=clamp(w.standing-6);ctx.change(s,'reputation',-2);}
  const message=firm.title+' '+(status==='neglected'?'moved forward without your contribution.':'ended when you moved on.') ;
  w.news.push({age:s.age,text:message});ctx.add(s,message,'career');
 }
 for(const p of contacts){p.history.push({age:s.age,event:firm.title+' · '+status+' · '+result});p.history=p.history.slice(-8);}
 w.news=w.news.slice(-30);w.active=null;return record;
}
function blocked(s){return !s.alive||s.pending!==null||!!s.mini||!!s.world?.network?.conversation||!!s.careerCampaigns?.active||!!s.everydayScenes?.active||!!s.world?.storyDirector?.active||!!s.hobbyCircuit?.active||(s.justice?.years||0)>0;}
export function workplaceCommands(s,careers){
 if(blocked(s)||!s.job)return [];
 const w=workplaceState(s),a=w.active,hasAction=s.actions>0;
 if(a){
  if(a.status==='waiting'&&s.age>=a.nextAge)return [
   {id:'workplace:continue',label:'Return to '+a.jobTitle+' story',detail:'Chapter '+(a.stage+1)+' of 3 · the colleagues remember',enabled:hasAction},
   {id:'workplace:leave',label:'Leave this professional storyline',detail:'Close the story and retain its history',enabled:hasAction}];
  if(a.status==='waiting')return [{id:'workplace:leave',label:'Step away from '+a.jobTitle+' story',detail:'End this long-running professional commitment',enabled:hasAction}];
  return [];
 }
 const firm=trackFor(s,careers);if(!firm)return [];
 const ready=hasAction&&w.lastStartAge!==s.age;
 return [{id:'workplace:begin',label:'Begin '+firm.title,detail:'Three chapters across five years · two recurring colleagues · meaningful work consequences',enabled:ready}];
}
export function workplaceStart(s,id,ctx){
 const options=workplaceCommands({...s,actions:s.actions+1},ctx.careers);
 if(!options.some(x=>x.id===id&&x.enabled))throw Error('Workplace project is unavailable.');
 const w=ensure(s),firm=trackFor(s,ctx.careers);
 if(id==='workplace:begin'){
  const [lead,rival]=personnel(s,firm,ctx);
  const counter=(w.started||0)+1;w.started=counter;w.lastStartAge=s.age;w.currentJob=s.job.id;
  w.active={id:'workplace-'+firm.id+'-'+counter,track:firm.id,jobId:s.job.id,jobTitle:ctx.careers[s.job.id].title,
   startedAge:s.age,stage:0,status:'ready',nextAge:s.age,impact:0,choices:[],lead:lead.name,rival:rival.name};
  ctx.add(s,'Career storyline: '+firm.title+'. '+firm.story,'career');return;
 }
 if(id==='workplace:leave'){archive(s,w.active,'interrupted',ctx);return;}
 if(id==='workplace:continue'){
  if(w.active?.status!=='waiting'||w.active.nextAge>s.age||w.active.jobId!==s.job.id)throw Error('Story chapter is not yet available.');
  w.active.status='ready';ctx.add(s,w.active.jobTitle+' colleagues are ready for the next chapter.','career');return;
 }
 throw Error('Invalid workplace action.');
}
export function workplaceView(s){
 const w=workplaceState(s),a=w.active;if(!a||a.status!=='ready')return null;
 const firm=firms.find(x=>x.id===a.track);if(!firm)return null;
 const [title,prompt,c1,c2,c3,best]=firm.chapters[a.stage];
 const lead=w.contacts[a.track]?.[0],rival=w.contacts[a.track]?.[1];
 return {id:a.id,title:firm.title,story:firm.story,jobTitle:a.jobTitle,industry:firm.industry,
  chapter:a.stage+1,total:3,chapterTitle:title,prompt,lead:a.lead,rival:a.rival,impact:a.impact,
  standing:w.standing,trust:lead?.trust??50,rivalry:rival?.rivalry??30,rivalSkill:rival?.skill??50,
  choices:[{index:0,label:c1,detail:'Collaboration · protect relationships',kind:'team'},
           {index:1,label:c2,detail:'Evidence and craft · improve professional credibility',kind:'craft'},
           {index:2,label:c3,detail:'High-pressure rivalry · greater volatility',kind:'bold'}],
  previous:a.choices.at(-1)||null,focus:best};
}
export function workplaceChoose(s,index,ctx){
 const w=ensure(s),a=w.active;if(!s.alive||!a||a.status!=='ready'||s.job?.id!==a.jobId)throw Error('No active workplace chapter.');
 if(!Number.isInteger(index)||index<0||index>2)throw Error('Invalid workplace decision.');
 const firm=firms.find(x=>x.id===a.track),[title,prompt,, , ,best]=firm.chapters[a.stage],mode=['team','craft','bold'][index];
 const colleagues=w.contacts[a.track],lead=colleagues[0],rival=colleagues[1];
 const values={team:{standing:3,trust:9,rivalry:-4,impact:7,performance:2,stress:-2},
  craft:{standing:6,trust:3,rivalry:1,impact:10,performance:4,stress:2},
  bold:{standing:2,trust:-7,rivalry:10,impact:3,performance:5,stress:6}}[mode];
 const right=mode===best;const skilled=(s.skills?.[ctx.careers[a.jobId].skill]||0)>=30||s.stats.knowledge>=80;
 const advantage=right?8:mode==='bold'?(skilled?2:-5):0;
 a.impact+=values.impact+advantage;
 w.standing=clamp(w.standing+values.standing+(right?5:mode==='bold'?-4:0));
 lead.trust=clamp(lead.trust+values.trust);
 rival.rivalry=clamp(rival.rivalry+values.rivalry);
 rival.trust=clamp(rival.trust+(mode==='team'?3:mode==='bold'?-4:1));
 if(mode==='team')lead.skill=clamp(lead.skill+2);
 if(mode==='craft')rival.skill=clamp(rival.skill+1);
 ctx.change(s,'performance',values.performance);
 ctx.change(s,'stress',values.stress);
 if(right)ctx.change(s,'reputation',2);else if(mode==='bold')ctx.change(s,'reputation',-1);
 const reaction=right?'The plan addressed the underlying problem, and the team noticed.':
   mode==='team'?'Your colleagues appreciated the effort, although the practical problem still needs work.':
   mode==='craft'?'Your careful approach improved the record, but there is more to learn.':
   'Your rival seized the opening. The conflict may return when people remember the risk.';
 const record={chapter:a.stage+1,age:s.age,title,choice:[firm.chapters[a.stage][2],firm.chapters[a.stage][3],firm.chapters[a.stage][4]][index],
  kind:mode,impact:values.impact+advantage,reaction,leadTrust:lead.trust,rivalry:rival.rivalry};
 a.choices.push(record);a.stage++;
 lead.history.push({age:s.age,event:title+': '+record.choice});lead.history=lead.history.slice(-8);
 rival.history.push({age:s.age,event:title+': '+record.choice});rival.history=rival.history.slice(-8);
 ctx.add(s,firm.title+' · '+title+': '+reaction,'career');
 if(a.stage>=3)return archive(s,a,'completed',ctx);
 a.status='waiting';a.nextAge=s.age+2;return record;
}
export function workplaceCareerChanged(s,oldJob,ctx){
 const w=s.workplace;if(!w)return;
 if(w.active&&w.active.jobId!==s.job?.id)archive(s,w.active,'interrupted',ctx);
 if(oldJob?.id!==s.job?.id){
  const newIndustry=s.job&&ctx.careers[s.job.id]?.industry;
  const priorIndustry=oldJob&&ctx.careers[oldJob.id]?.industry;
  if(newIndustry!==priorIndustry)w.standing=clamp(50+(w.standing-50)*.3);
  w.currentJob=s.job?.id??null;
 }
}
export function workplaceYear(s,ctx){
 const w=s.workplace;if(!w||!s.alive)return;
 for(const contacts of Object.values(w.contacts||{})){
  for(const p of contacts){
   p.age++;p.skill=clamp(p.skill+1+Math.floor(ctx.rng(s)*3));
   if(p.role==='Competitive colleague'&&s.age%3===0){p.wins++;p.rivalry=clamp(p.rivalry+2);}
   if(s.age%4===0)p.trust=clamp(p.trust+(p.rivalry>75?-1:1));
  }
 }
 if(w.active&&s.job?.id!==w.active.jobId){archive(s,w.active,'interrupted',ctx);return;}
 const a=w.active;if(a?.status==='waiting'){
  if(s.age>a.nextAge+2){archive(s,a,'neglected',ctx);return;}
  if(s.age===a.nextAge){
   const message=a.rival+' has advanced while you were away. Chapter '+(a.stage+1)+' of '+firms.find(x=>x.id===a.track).title+' is ready.';
   w.news.push({age:s.age,text:message});w.news=w.news.slice(-30);ctx.add(s,message,'career');
  }
 }
}
export function workplaceSummary(s,careers){
 const w=workplaceState(s),firm=s.job?trackFor(s,careers):null,a=w.active;
 const contacts=firm?(w.contacts?.[firm.id]||[]):[];
 return {active:a?{...a,yearsUntil:Math.max(0,a.nextAge-s.age),due:a.status==='waiting'&&s.age>=a.nextAge,
  chapterTitle:firms.find(x=>x.id===a.track)?.chapters[a.stage]?.[0]||null}:null,
  firm:firm?{id:firm.id,title:firm.title,industry:firm.industry,story:firm.story}:null,standing:w.standing,
  contacts:contacts.map(x=>({...x,history:(x.history||[]).slice(-2).reverse()})),
  completed:w.completed.slice(-7).reverse(),unfulfilled:w.unfulfilled.slice(-5).reverse(),
  ancestry:w.ancestry.slice(-7).reverse(),news:w.news.slice(-5).reverse(),total:w.started||0};
}
export function workplaceInheritance(next,old){
 const w=old.workplace;if(!w)return;
 const out=ensure(next);
 out.ancestry=[...(w.ancestry||[]),...(w.completed||[]).map(x=>({...x,sourceLife:old.name}))].slice(-12);
 out.completed=[];out.unfulfilled=[];out.contacts={};out.active=null;out.currentJob=null;out.standing=50;
 out.started=0;out.lastStartAge=null;out.news=[];
}
