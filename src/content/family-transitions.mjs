// Lifely 1.11 — authored family transitions using the existing NPC economy.
// This is fictional gameplay, not financial, legal, parenting, or care guidance.
// No background services and no invented transfers between living characters.
const clamp=n=>Math.max(0,Math.min(100,Math.round(n||0)));
const cash=n=>Math.max(0,Math.round(Number(n)||0));
export const emptyTransitions=()=>({
 version:1,separation:null,propertyCase:null,care:{},youth:{},
 records:[],ancestry:[],news:[],annual:[],lastCare:{},lastGuide:{},lastPlanAge:null,
 decisions:0
});
export const transitionState=s=>s.familyTransitions||emptyTransitions();
const ensure=s=>(s.familyTransitions??=emptyTransitions());
const minorChildren=s=>(s.people||[]).filter(p=>p.alive&&p.role==='child'&&p.age<18);
const childOf=(s,id)=>(s.people||[]).find(p=>p.id===id&&p.alive&&p.role==='child');
const older=(s,id)=>(s.people||[]).find(p=>p.id===id&&p.alive&&['parent','grandparent'].includes(p.role)&&p.age>=60);
const exPartner=s=>(s.people||[]).find(p=>p.id===s.familyTransitions?.separation?.exId&&p.alive&&p.role==='ex')||null;
const eligible=s=>!!s.alive&&s.age>=18&&s.pending===null&&!s.mini&&!s.world?.network?.conversation&&!s.careerCampaigns?.active&&!s.everydayScenes?.active&&!s.world?.storyDirector?.active&&!s.hobbyCircuit?.active&&s.workplace?.active?.status!=='ready'&&s.familyStories?.active?.status!=='ready'&&(s.justice?.years||0)===0;
function history(s,kind,message,ctx,detail={}){
 const t=ensure(s),item={kind,age:s.age,message,...detail};
 t.records.push(item);t.records=t.records.slice(-36);
 if(kind!=='youth'||detail.mode!=='self-chosen')t.decisions++;
 t.news.push({age:s.age,text:message});t.news=t.news.slice(-28);
 ctx.add(s,message,'family');
}
export function transitionSeparation(s,p,ctx){
 if(!p||!p.alive||p.role!=='partner')return;
 const t=ensure(s),children=minorChildren(s);
 if(t.propertyCase) {
  // Existing property remains in the player's ownership; keep a record, not a claim.
  t.propertyCase=null;
 }
 t.separation={exId:p.id,exName:p.name,wasMarried:!!p.married,
  beganAge:s.age,plan:children.length?'shared':'none',cooperation:clamp(p.bond),disagreements:0,
  supportReceived:0,supportPaid:0,lastPlanAge:s.age};
 if(s.household){s.household.agreement='independent';s.household.responsibility='shared';}
 history(s,'separation','Separated from '+p.name+'. '+(children.length?'Co-parenting arrangements can evolve with the children.':'Both adults retain their separate finances.'),ctx,{exId:p.id});
}
export function transitionCommands(s){
 if(!eligible(s))return [];
 const t=transitionState(s),out=[],a=s.actions>0,children=minorChildren(s),ex=exPartner(s);
 const add=(id,label,detail,enabled=true)=>out.push({id,label,detail,enabled:!!enabled});
 if(ex&&children.length){
  for(const [id,label,detail] of [
   ['shared','Agree on shared co-parenting','Both parents share care decisions; contributions use the other parent’s actual savings'],
   ['resident','Offer a stable main home','More daily care falls to you, with a larger possible contribution from your former partner'],
   ['other','Support the other parent’s household','You pay what you can from existing cash; children gain stability with the other parent']
  ])if(t.separation.plan!==id)add('transition:coparent:'+id,label,detail,a);
  if(t.separation.disagreements>=40)add('transition:reconcile','Make space for a co-parenting conversation',
    'Spend one annual action on rebuilding cooperation',a&&t.lastPlanAge!==s.age);
 }
 if(t.separation&&!t.propertyCase&&ex){
  for(const p of s.properties.slice(0,5)){
   add('transition:property:open:'+p.id,'Discuss the family '+p.id+' property',
     'Open a fictional property settlement; sale is temporarily unavailable during discussion',a);
  }
 }
 if(t.propertyCase){
  const prop=s.properties.find(p=>p.id===t.propertyCase.propertyId);
  if(prop){
   const value=cash(prop.value),buyout=cash(value*.4);
   add('transition:property:split','Sell and divide the disputed property',
     'Sell at 95% of value and divide net proceeds equally between you and your former partner',a);
   add('transition:property:compromise','Seek a negotiated 70/30 settlement',
     'Sell at 95% of value, pay a $300 mediation cost, then divide proceeds 70/30',a&&value*.95>=300);
   add('transition:property:buyout','Buy out the other person’s share',
     'Keep the property; transfer '+buyout.toLocaleString('en-US')+' from your cash to their savings',a&&s.cash>=buyout);
   add('transition:property:withdraw','End the property discussion for now',
     'Keep your asset; leave the disagreement recorded but unresolved',a);
  }
 }
 for(const p of (s.people||[]).filter(p=>p.alive&&['parent','grandparent'].includes(p.role)&&p.age>=60).slice(0,6)){
  const current=t.care[String(p.id)]?.mode||'independent';
  for(const [mode,label,detail] of [
   ['independent','Respect independence','Keep an open relationship while allowing your older relative to decide'],
   ['shared','Coordinate family support','Annual transport and coordination costs; improve practical support and trust'],
   ['home','Provide direct care','Higher annual costs and additional stress; maintain personal contact']
  ])if(current!==mode)add('transition:care:'+p.id+':'+mode,
    label+' · '+p.name,detail,a);
  if(t.lastCare[p.id]!==s.age)add('transition:checkin:'+p.id,'Check in with '+p.name,
    'One personal visit this year; strengthens the relationship',a);
 }
 for(const p of (s.people||[]).filter(p=>p.alive&&p.role==='child'&&p.age>=14&&p.age<=24).slice(0,8)){
  const y=t.youth[String(p.id)];
  if(t.lastGuide[p.id]===s.age)continue;
  const opts=[['listen','Hear their own goals','Build trust and autonomy without choosing for them'],
   ['study','Offer practical education support','Improve preparation, but your child still makes their own choice'],
   ['work','Encourage a real-world work trial','Improve resilience and professional readiness without guaranteed success']];
  for(const [mode,label,detail] of opts)add('transition:guide:'+p.id+':'+mode,
    label+' · '+p.name,detail,a);
 }
 return out;
}
export function transitionAct(s,id,ctx){
 if(!transitionCommands({...s,actions:s.actions+1}).some(x=>x.id===id&&x.enabled))throw Error('Family transition is unavailable.');
 const t=ensure(s),parts=id.split(':'),kind=parts[1],ex=exPartner(s);
 if(kind==='coparent'){
  const mode=parts[2];if(!ex||!minorChildren(s).length||!['shared','resident','other'].includes(mode))throw Error('Co-parenting is unavailable.');
  t.separation.plan=mode;t.separation.lastPlanAge=s.age;
  const delta=mode==='shared'?7:mode==='resident'?2:-3;
  t.separation.cooperation=clamp(t.separation.cooperation+delta);
  t.separation.disagreements=clamp(t.separation.disagreements+(mode==='other'?4:-5));
  ctx.bond(s,ex,delta,'Agreed on how to share care responsibilities');
  for(const p of minorChildren(s)){
   if(p.world)p.world.joy=clamp(p.world.joy+(mode==='shared'?4:mode==='resident'?1:0));
  }
  history(s,'coparent','Updated the parenting plan with '+ex.name+' to '+mode+' care.',ctx,{exId:ex.id,mode});return;
 }
 if(kind==='reconcile'){
  if(!ex||t.lastPlanAge===s.age)throw Error('Conversation unavailable.');
  t.lastPlanAge=s.age;t.separation.cooperation=clamp(t.separation.cooperation+10);
  t.separation.disagreements=clamp(t.separation.disagreements-15);
  ctx.bond(s,ex,8,'Resolved a co-parenting disagreement');
  history(s,'coparent','Discussed child care with '+ex.name+' and made a clearer plan.',ctx);return;
 }
 if(kind==='property'){
  const operation=parts[2],propertyId=parts[3];
  if(operation==='open'){
   const property=s.properties.find(p=>p.id===propertyId);
   if(!ex||t.propertyCase||!property)throw Error('Property discussion unavailable.');
   t.propertyCase={propertyId:property.id,exId:ex.id,beganAge:s.age,originalValue:cash(property.value)};
   history(s,'property','Opened a family property discussion over '+property.id+'.',ctx,{propertyId:property.id});return;
  }
  const c=t.propertyCase,asset=s.properties.find(p=>p.id===c?.propertyId);
  const recipient=(s.people||[]).find(p=>p.id===c?.exId&&p.alive);
  if(!c||!asset||!recipient||!recipient.world)throw Error('Property arrangement unavailable.');
  const value=cash(asset.value);
  if(operation==='withdraw'){
   t.propertyCase=null;c.outcome='unresolved';
   history(s,'property','Left the '+asset.id+' property discussion unresolved.',ctx,{propertyId:asset.id,form:'withdraw'});return;
  }
  if(operation==='buyout'){
   const payment=cash(value*.4);if(s.cash<payment)throw Error('Insufficient cash for property settlement.');
   s.cash-=payment;recipient.world.cash+=payment;t.propertyCase=null;
   ctx.bond(s,recipient,1,'Settled a property dispute through a buyout');
   history(s,'property','Kept the '+asset.id+' and transferred $'+payment.toLocaleString('en-US')+' from cash to '+recipient.name+'.',ctx,
    {propertyId:asset.id,form:'buyout',payment});return;
  }
  if(!['split','compromise'].includes(operation))throw Error('Invalid property arrangement.');
  const net=cash(value*.95),fee=operation==='compromise'?300:0;
  if(net<fee)throw Error('Property proceeds cannot cover the mediation cost.');
  const distributable=net-fee,player=operation==='compromise'?cash(distributable*.7):cash(distributable*.5);
  const other=distributable-player;
  s.properties=s.properties.filter(p=>p.id!==asset.id);
  s.cash+=player;recipient.world.cash+=other;t.propertyCase=null;
  const bondChange=operation==='compromise'?4:2;
  ctx.bond(s,recipient,bondChange,'Closed a property disagreement');
  history(s,'property','Settled '+asset.id+' through a '+operation+' sale: $'+player.toLocaleString('en-US')+
    ' to you and $'+other.toLocaleString('en-US')+' to '+recipient.name+
    (fee?' after a $300 mediation fee.':'.'),ctx,{propertyId:asset.id,form:operation,player,other,fee});
  return;
 }
 if(kind==='care'||kind==='checkin'){
  const idNumber=Number(parts[2]),p=older(s,idNumber);
  if(!p)throw Error('Relative is unavailable.');
  if(kind==='checkin'){
   t.lastCare[p.id]=s.age;ctx.bond(s,p,9,'Visited and listened');
   ctx.change(s,'stress',-1);
   history(s,'care','Spent meaningful time with '+p.name+'.',ctx,{personId:p.id});return;
  }
  const mode=parts[3];if(!['independent','shared','home'].includes(mode))throw Error('Invalid care arrangement.');
  t.care[p.id]={personId:p.id,personName:p.name,mode,sinceAge:s.age};
  ctx.bond(s,p,mode==='shared'?5:mode==='home'?4:2,'Discussed care and autonomy');
  ctx.change(s,'stress',mode==='home'?3:mode==='shared'?1:-1);
  history(s,'care','Care plan for '+p.name+' changed to '+mode+'.',ctx,{personId:p.id,mode});return;
 }
 if(kind==='guide'){
  const p=childOf(s,Number(parts[2])),mode=parts[3];
  if(!p||p.age<14||p.age>24||!['listen','study','work'].includes(mode))throw Error('Child guidance is unavailable.');
  t.lastGuide[p.id]=s.age;
  const y=t.youth[String(p.id)]??={personId:p.id,name:p.name,path:null,agency:50,support:0,decisions:[],lastAutonomyAge:null};
  y.agency=clamp(y.agency+(mode==='listen'?9:mode==='study'?4:6));
  y.support=clamp(y.support+(mode==='listen'?7:mode==='study'?8:5));
  y.decisions.push({age:s.age,mode,kind:'guidance'});y.decisions=y.decisions.slice(-8);
  ctx.bond(s,p,mode==='listen'?8:mode==='study'?5:4,'Supported independent growth');
  if(p.world){
   p.world.talent=clamp(p.world.talent+(mode==='study'?4:mode==='work'?2:1));
   p.world.trust=clamp(p.world.trust+2);
  }
  const m=s.familyStories?.members?.[String(p.id)];if(m){
   m.independence=clamp(m.independence+(mode==='listen'?7:3));
   m.resilience=clamp(m.resilience+(mode==='work'?5:2));
  }
  history(s,'youth','Talked with '+p.name+' about '+(mode==='listen'?'their own goals':mode==='study'?'learning options':'a work opportunity')+'.',ctx,
   {personId:p.id,mode});return;
 }
 throw Error('Invalid family transition.');
}
const youthPath=(p)=>{
 const w=p.world||{};
 if(w.personality==='Creative')return 'creative';
 if(w.personality==='Independent')return 'independent';
 if(w.personality==='Driven'||w.personality==='Competitive')return 'career';
 if(w.personality==='Cautious')return 'study';
 return w.talent>=72?'study':'career';
};
export function transitionYear(s,ctx){
 const t=s.familyTransitions||((s.people||[]).some(p=>p.alive&&p.role==='child'&&p.age===18)?ensure(s):null);
 const empty={expenseChange:0,supportIn:0,supportOut:0,careCosts:0,independentChoices:0};
 if(!t||!s.alive||s.age<18)return empty;
 if(t.propertyCase){
  const ex=(s.people||[]).find(p=>p.id===t.propertyCase.exId&&p.alive);
  const property=s.properties.find(p=>p.id===t.propertyCase.propertyId);
  if(!ex||!property){const name=t.propertyCase.propertyId;t.propertyCase=null;
   history(s,'property','The pending '+name+' property discussion ended when the people or property changed.',ctx);}
 }
 const costs=ctx.country(s).cost,flow={...empty};
 const minor=minorChildren(s),ex=exPartner(s);
 if(ex&&minor.length&&t.separation&&t.separation.plan!=='none'){
  const plan=t.separation.plan;
  if(plan==='shared'||plan==='resident'){
   const target=cash((plan==='resident'?850:500)*minor.length*costs);
   flow.supportIn=Math.min(target,Math.max(0,cash(ex.world?.cash)-800));
   if(ex.world)ex.world.cash-=flow.supportIn;
   t.separation.supportReceived+=flow.supportIn;
   ctx.change(s,'stress',plan==='resident'?2:-1);
  }else if(plan==='other'){
   flow.supportOut=Math.min(cash(s.cash),cash(650*minor.length*costs));
   if(ex.world)ex.world.cash+=flow.supportOut;
   t.separation.supportPaid+=flow.supportOut;
   flow.expenseChange-=cash(850*minor.length*costs);
   ctx.change(s,'stress',-1);
  }
  if(plan==='shared'&&t.separation.cooperation>=60&&s.age%2===0){
   for(const p of minor)ctx.bond(s,p,1,'Shared time across both parents');
  }
  if(t.separation.disagreements>=60)ctx.change(s,'stress',2);
 }
 for(const item of Object.values(t.care||{})){
  const p=older(s,item.personId);if(!p)continue;
  let cost=0;
  if(item.mode==='shared'){cost=cash(800*costs);ctx.bond(s,p,2,'Kept a coordinated care arrangement');}
  if(item.mode==='home'){cost=cash(2200*costs);ctx.bond(s,p,3,'Maintained direct caregiving');ctx.change(s,'stress',2);}
  if(item.mode==='independent'&&s.age%3===0)ctx.bond(s,p,1,'Respected their ongoing independence');
  if(p.world&&item.mode!=='independent'){p.world.joy=clamp(p.world.joy+1);p.world.health=clamp(p.world.health+1);}
  flow.careCosts+=cost;
 }
 flow.expenseChange+=flow.careCosts;
 for(const p of (s.people||[]).filter(p=>p.alive&&p.role==='child'&&p.age>=18&&p.age<=25)){
  const y=t.youth[String(p.id)]??={personId:p.id,name:p.name,path:null,agency:50,support:0,decisions:[],lastAutonomyAge:null};
  if(p.age===18&&!y.path){
   y.path=youthPath(p);y.agency=clamp(y.agency+8);y.lastAutonomyAge=s.age;
   const w=p.world;
   if(y.path==='study'){
    const tuition=cash(1000*costs);
    const paid=Math.min(cash(w.cash),tuition);w.cash-=paid;w.debt+=tuition-paid;
    w.education=Math.min(3,Math.max(w.education,2));w.talent=clamp(w.talent+4);
   }else if(y.path==='career'){w.talent=clamp(w.talent+2);w.joy=clamp(w.joy+2);}
   else if(y.path==='creative'){
    const spend=Math.min(cash(w.cash),cash(600*costs));w.cash-=spend;w.talent=clamp(w.talent+3);
   }else{w.trust=clamp(w.trust+2);w.joy=clamp(w.joy+3);}
   y.decisions.push({age:s.age,kind:'self-chosen',mode:y.path});y.decisions=y.decisions.slice(-8);
   flow.independentChoices++;
   history(s,'youth',p.name+' chose '+y.path+' as an independent next step at age 18.',ctx,
    {personId:p.id,mode:y.path});
  }else if(p.age===21&&y.path&&y.lastAutonomyAge!==s.age){
   y.lastAutonomyAge=s.age;
   const w=p.world,investment=Math.min(cash(w.cash),cash(450*costs));
   if(['study','creative'].includes(y.path)){w.cash-=investment;w.talent=clamp(w.talent+(investment>0?2:0));}
   else{w.trust=clamp(w.trust+1);}
   y.decisions.push({age:s.age,kind:'self-chosen',mode:y.path+' follow-through'});y.decisions=y.decisions.slice(-8);
   flow.independentChoices++;
   history(s,'youth',p.name+' made another independent decision about their '+y.path+' future.',ctx,{personId:p.id});
  }
 }
 const annual={age:s.age,...flow,carePlans:Object.values(t.care||{}).filter(x=>!!older(s,x.personId)).length,
  exId:ex?.id||null,plan:t.separation?.plan||'none'};
 t.annual.push(annual);t.annual=t.annual.slice(-20);
 return flow;
}
export function transitionSummary(s){
 const t=transitionState(s),ex=exPartner(s),separation=t.separation;
 const plans=Object.values(t.care||{}).map(v=>({...v,active:!!older(s,v.personId)})).slice(-8);
 const youths=Object.values(t.youth||{}).map(y=>{
  const p=childOf(s,y.personId);
  return {...y,age:p?.age||null,personality:p?.world?.personality||'Supportive',
   cash:cash(p?.world?.cash),debt:cash(p?.world?.debt),talent:p?.world?.talent||0};
 }).slice(-8);
 return {separation:separation?{...separation,active:!!ex,exCash:cash(ex?.world?.cash),
  minorChildren:minorChildren(s).map(p=>({id:p.id,name:p.name,age:p.age}))}:null,
  propertyCase:t.propertyCase?{...t.propertyCase,currentValue:cash(s.properties.find(p=>p.id===t.propertyCase.propertyId)?.value)}:null,
  care:plans,youth:youths,annual:t.annual.slice(-5).reverse(),
  records:t.records.slice(-8).reverse(),ancestry:t.ancestry.slice(-7).reverse(),
  news:t.news.slice(-5).reverse(),decisionCount:t.decisions||0};
}
export function transitionInheritance(next,old){
 const prior=old.familyTransitions;if(!prior)return;
 const t=ensure(next);
 t.ancestry=[...(prior.ancestry||[]),...(prior.records||[]).filter(x=>['property','separation','youth','care'].includes(x.kind))
  .map(x=>({...x,sourceLife:old.name}))].slice(-16);
 const liveIds=new Set(next.people.map(p=>p.id));
 t.youth=Object.fromEntries(Object.entries(prior.youth||{}).filter(([id])=>liveIds.has(Number(id)))
  .map(([id,y])=>[id,{...y,decisions:y.decisions.slice(-6)}]));
 t.care={};t.separation=null;t.propertyCase=null;t.annual=[];t.records=[];t.news=[];t.lastGuide={};t.lastCare={};
 t.lastPlanAge=null;t.decisions=0;
}
