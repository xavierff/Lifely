// Fictional estate agreements. Real living children, exact integer allocations.
// The default engine distribution is unchanged until the player creates a plan.
const cap=n=>Math.max(0,Math.min(100,Math.round(n)));
const kids=s=>(s.people||[]).filter(p=>p.alive&&p.role==='child').sort((a,b)=>a.id-b.id);
const empty=()=>({version:1,plan:null,dispute:null,lastAction:null,history:[],ancestors:[],serial:0});
const state=s=>s.estatePlan||empty(),ensure=s=>s.estatePlan??=empty();
const age=n=>Number.isInteger(n)&&n>=0&&n<=110;
const line=(x,n=200)=>String(x??'').slice(0,n);
const ready=s=>s.alive&&s.age>=18&&s.actions>0&&s.pending===null&&!s.mini&&!s.world?.network?.conversation&&!s.everydayScenes?.active&&!s.careerCampaigns?.active&&!s.hobbyCircuit?.active&&!s.world?.storyDirector?.active&&s.fate?.active?.status!=='playing'&&s.familyStories?.active?.status!=='ready'&&s.workplace?.active?.status!=='ready'&&s.worldPulse?.active?.status!=='ready'&&!(s.justice?.years>0);
function log(s,kind,message,ctx){
 const m=ensure(s);m.history.push({id:++m.serial,age:s.age,kind,message:line(message)});m.history=m.history.slice(-24);ctx.add(s,message,'family');
}
export function estateCommands(s){
 if(!ready(s)||kids(s).length<2)return [];
 const m=state(s),enabled=m.lastAction!==s.age,out=[],put=(id,label,detail)=>out.push({id:'estate:'+id,label,detail,enabled});
 if(m.dispute){
  put('resolve:equal','Agree to equal estate shares','Reduce the source of the inheritance disagreement');
  put('resolve:explain','Discuss the existing plan openly','Hear both children; a preferred share remains');
  put('resolve:wait','Give the family more time','Allow independent reactions without changing the plan');
 }else{
  put('plan:equal','Record equal estate shares','Divide the unearmarked estate evenly among living children');
  for(const p of kids(s))put('plan:preferred:'+p.id,'Give '+p.name+' a larger share','60% to this child, 40% shared by the others');
  if(m.plan)put('plan:default','Return to the original estate rules','Remove this optional written distribution plan');
 }
 return out;
}
export function estateAct(s,id,ctx){
 if(!estateCommands({...s,actions:s.actions+1}).some(c=>c.id===id&&c.enabled))throw Error('Estate decision unavailable.');
 const m=ensure(s),[,action,choice,key]=id.split(':');m.lastAction=s.age;
 if(action==='plan'){
  m.plan=choice==='default'?null:{mode:choice,preferredId:choice==='preferred'?Number(key):null,age:s.age};
  log(s,'plan',choice==='equal'?'Recorded equal estate shares.':choice==='preferred'?'Recorded a larger estate share for '+kids(s).find(p=>p.id===Number(key)).name+'.':'Returned to the original estate rules.',ctx);
 }else{
  const d=m.dispute,p=kids(s).find(p=>p.id===d.challenger),q=kids(s).find(p=>p.id===d.preferred);
  if(choice==='equal'){m.plan={mode:'equal',preferredId:null,age:s.age};d.pressure=0;}
  if(choice==='explain')d.pressure=cap(d.pressure-25);
  if(choice==='wait')d.pressure=cap(d.pressure+5);
  if(choice!=='wait'){
   for(const x of [p,q].filter(Boolean))ctx.bond(s,x,choice==='equal'?5:3,'Discussed the future of the family estate');
   const l=Object.values(s.familyStories?.siblingLinks||{}).find(x=>x.ids.includes(d.challenger)&&x.ids.includes(d.preferred));
   if(l){l.rivalry=cap(l.rivalry-(choice==='equal'?15:8));l.trust=cap(l.trust+6);}
  }
  if(choice==='equal'||d.pressure<35){log(s,'agreement','The family reached an estate understanding.',ctx);m.dispute=null;}
  else log(s,'discussion',choice==='wait'?'The family postponed its estate discussion.':'The family discussed the unequal shares, but disagreement remains.',ctx);
 }
}
export function estateYear(s,ctx){
 const m=s.estatePlan;if(!m?.plan||!s.alive)return;
 const children=kids(s),p=children.find(x=>x.id===m.plan.preferredId);
 if(m.plan.mode==='preferred'&&!p){m.plan={mode:'equal',preferredId:null,age:s.age};m.dispute=null;log(s,'revision','The preferred child is unavailable; the plan reverted to equal shares.',ctx);return;}
 if(m.dispute){
  const d=m.dispute;
  if(!children.some(x=>x.id===d.challenger)||!p){m.dispute=null;return;}
  if(s.age>=d.dueAge){log(s,'unresolved','The estate discussion ended without a full family agreement.',ctx);m.dispute=null;}
  else d.pressure=cap(d.pressure+2);
  return;
 }
 if(!p||s.age>108||s.age-m.plan.age<2||m.history.some(h=>['dispute','unresolved','agreement'].includes(h.kind)&&s.age-h.age<5))return;
 const challenger=children.filter(x=>x.id!==p.id&&x.age>=18).map(x=>({x,r:Math.max(x.world?.rivalry??0,Object.values(s.familyStories?.siblingLinks||{}).find(l=>l.ids.includes(x.id)&&l.ids.includes(p.id))?.rivalry??0)})).sort((a,b)=>b.r-a.r||a.x.id-b.x.id)[0];
 if(challenger&&challenger.r>=45){
  m.dispute={challenger:challenger.x.id,preferred:p.id,startedAge:s.age,dueAge:s.age+2,pressure:cap(challenger.r)};
  log(s,'dispute',challenger.x.name+' questioned the unequal share planned for '+p.name+'.',ctx);
 }
}
export function estateAllocation(s,amount){
 const m=state(s),children=kids(s);if(!m.plan||!children.length)return null;
 const total=Math.max(0,Math.round(amount)),out={},preferred=children.find(x=>x.id===m.plan.preferredId);
 function distribute(list,n){const share=Math.floor(n/list.length),remainder=n%list.length;list.forEach((p,i)=>{out[p.id]=share+(i<remainder?1:0);});}
 if(m.plan.mode==='preferred'&&preferred&&children.length>1){out[preferred.id]=Math.floor(total*.6);distribute(children.filter(p=>p.id!==preferred.id),total-out[preferred.id]);}
 else distribute(children,total);
 return out;
}
export function estateInheritance(next,old,allocation,ctx){
 const prior=old.estatePlan;if(!prior)return;
 const m=empty();
 m.ancestors=[...prior.ancestors,...prior.history.slice(-6).map(h=>({...h,ancestor:line(old.name,70),generation:old.generation}))].slice(-18);
 if(allocation){
  for(const p of next.people.filter(x=>x.role==='sibling'&&x.alive)){
   if(p.world)p.world.cash+=(allocation[p.id]||0);
   if(prior.dispute?.challenger===p.id&&p.world){p.world.rivalry=cap(p.world.rivalry+8);p.world.trust=cap(p.world.trust-5);}
  }
  m.ancestors.push({id:prior.serial+1,age:old.age,kind:'distributed',message:line('The written estate plan distributed assets among '+Object.keys(allocation).length+' living children.'),ancestor:line(old.name,70),generation:old.generation});
  m.ancestors=m.ancestors.slice(-18);
 }
 next.estatePlan=m;
}
export function estateView(s,amount){
 const m=state(s),children=kids(s),allocation=estateAllocation(s,amount);
 return {plan:m.plan,dispute:m.dispute?{...m.dispute,challengerName:children.find(p=>p.id===m.dispute.challenger)?.name||'Former family member',preferredName:children.find(p=>p.id===m.dispute.preferred)?.name||'Former family member'}:null,children:children.map(p=>({id:p.id,name:p.name,share:allocation?allocation[p.id]:null})),history:m.history.slice(-5).reverse(),ancestors:m.ancestors.slice(-4).reverse()};
}
export function validateEstate(m){
 if(m===undefined)return true;
 const hist=h=>h&&Number.isInteger(h.id)&&h.id>0&&age(h.age)&&['plan','revision','agreement','discussion','dispute','unresolved','distributed'].includes(h.kind)&&typeof h.message==='string'&&h.message.length<=200;
 const p=m?.plan,d=m?.dispute;
 return !!m&&m.version===1&&Number.isInteger(m.serial)&&m.serial>=0&&(m.lastAction===null||age(m.lastAction))&&(p===null||p&&age(p.age)&&((p.mode==='equal'&&p.preferredId===null)||(p.mode==='preferred'&&Number.isInteger(p.preferredId))))&&(d===null||d&&p?.mode==='preferred'&&d.preferred===p.preferredId&&Number.isInteger(d.challenger)&&d.challenger!==d.preferred&&age(d.startedAge)&&age(d.dueAge)&&d.dueAge===d.startedAge+2&&Number.isInteger(d.pressure)&&d.pressure>=0&&d.pressure<=100)&&Array.isArray(m.history)&&m.history.length<=24&&m.history.every(hist)&&new Set(m.history.map(x=>x.id)).size===m.history.length&&Array.isArray(m.ancestors)&&m.ancestors.length<=18&&m.ancestors.every(h=>hist(h)&&typeof h.ancestor==='string'&&Number.isInteger(h.generation)&&h.generation>=1);
}
