// Lifely 2.0 - accountable household decisions with real money flows.
// Offline deterministic state: transfers between NPC and household never create money.
// No financial, legal, parenting or medical advice; game values are fictional.
const clamp=x=>Math.max(0,Math.min(100,Math.round(x)));
const asMoney=n=>Math.max(0,Math.round(Number(n)||0));
export const emptyHousehold=()=>({version:1,priority:'balanced',responsibility:'shared',agreement:'independent',
  emergency:0,education:{},ledger:[],annual:[],lastSchool:{},lastMediation:{},history:[],generationNotes:[]});
export const householdState=s=>s.household||emptyHousehold();
const ensure=s=>(s.household??=emptyHousehold());
const livingChildren=s=>(s.people||[]).filter(p=>p.alive&&p.role==='child');
const partner=s=>(s.people||[]).find(p=>p.alive&&p.role==='partner'&&p.age>=18)||null;
const totalEducation=h=>Object.values(h.education||{}).reduce((n,v)=>n+asMoney(v),0);
export const householdAssets=s=>{const h=s.household;return h?asMoney(h.emergency)+totalEducation(h):0;};
const note=(s,text,ctx,kind='household')=>{
 const h=ensure(s),entry={age:s.age,text,kind};h.ledger.push(entry);h.ledger=h.ledger.slice(-32);
 ctx.add(s,text,'family');
};
function eligible(s){
 return !!s.alive&&s.age>=18&&s.pending===null&&!s.mini&&!s.world?.network?.conversation&&!s.careerCampaigns?.active&&!s.everydayScenes?.active&&!s.world?.storyDirector?.active&&!s.hobbyCircuit?.active&&s.workplace?.active?.status!=='ready'&&s.familyStories?.active?.status!=='ready'&&(s.justice?.years||0)===0;
}
export function householdCommands(s){
 if(!eligible(s))return [];
 const h=householdState(s),family=livingChildren(s),spouse=partner(s),a=s.actions>0,opts=[];
 const add=(id,label,detail,enabled)=>opts.push({id,label,detail,enabled:!!enabled});
 for(const [id,label,detail] of [
  ['balanced','Balance work and family','No plan surcharge · protect time for one another'],
  ['saving','Build financial breathing room','Reduce basic household costs by 7% · some extra stress'],
  ['learning','Invest in the next generation','Extra education costs for school-age children · learning growth'],
  ['care','Prioritize family care','Higher annual household costs · less stress, stronger family ties']
 ])if(h.priority!==id)add('household:priority:'+id,label,detail,a);
 if(spouse){
  for(const [id,label,detail] of [
   ['shared','Share care responsibilities','Coordinate with your partner · trust matters'],
   ['solo','Carry household duties yourself','Less pressure on your partner · more stress for you'],
   ['outsource','Pay for outside help','Higher annual cost · reduces household strain']
  ])if(h.responsibility!==id)add('household:duties:'+id,label,detail,a);
  if(h.agreement!=='shared')add('household:agreement:shared','Discuss shared family finances','Ask your partner to contribute from their actual savings each year',a&&(spouse.world?.trust??0)>=45);
  else add('household:agreement:independent','Keep finances independent','Stop future partner contributions without taking their savings',a);
 }
 for(const amount of [500,1500]){
  add('household:reserve:deposit:'+amount,'Set aside $'+amount.toLocaleString('en-US')+' for emergencies',
    'Moves existing personal cash into a protected household reserve',a&&s.cash>=amount);
  add('household:reserve:withdraw:'+amount,'Use $'+amount.toLocaleString('en-US')+' from your emergency reserve',
    'Moves protected household money back into spendable cash',a&&h.emergency>=amount);
 }
 for(const p of family.slice(0,12)){
  if(p.age<=25){
   for(const amount of [500,1500])add('household:education:deposit:'+p.id+':'+amount,
      'Save $'+amount.toLocaleString('en-US')+' for '+p.name,'Earmark existing money for this child, including inheritance',a&&s.cash>=amount);
   const held=asMoney(h.education[p.id]);
   if(p.age>=6&&p.age<=22)add('household:education:use:'+p.id+':1000','Support '+p.name+"'s education",
     'Spend $1,000 from their education fund; improves knowledge and resilience once per year',
      a&&held>=1000&&h.lastSchool[p.id]!==s.age);
  }
 }
 for(const l of Object.values(s.familyStories?.siblingLinks||{}).slice(0,12)){
  if(l.rivalry>=45&&l.ids.every(id=>family.some(p=>p.id===id))&&h.lastMediation[l.ids.join('-')]!==s.age){
   const names=l.ids.map(id=>family.find(p=>p.id===id).name).join(' and ');
   add('household:mediate:'+l.ids.join('-'),'Help '+names+' rebuild trust',
     'One family meeting this year · lower sibling rivalry, strengthen cooperation',a);
  }
 }
 return opts;
}
export function householdAction(s,id,ctx){
 if(!householdCommands({...s,actions:s.actions+1}).some(x=>x.id===id&&x.enabled))throw Error('Household decision is unavailable.');
 const h=ensure(s),parts=id.split(':'),[,kind,op,...rest]=parts,spouse=partner(s);
 if(kind==='priority'){
  h.priority=op;
  if(spouse){const likes=(spouse.world?.personality==='Supportive'&&op==='care')||(spouse.world?.personality==='Cautious'&&op==='saving');
   ctx.bond(s,spouse,likes?4:op==='saving'?-2:2,'Agreed on a shared household priority');}
  note(s,'Household priority changed to '+op+'.',ctx);return;
 }
 if(kind==='duties'){
  h.responsibility=op;
  ctx.bond(s,spouse,op==='shared'?5:op==='solo'?3:-1,'Discussed care and household responsibilities');
  ctx.change(s,'stress',op==='solo'?4:op==='shared'?-2:-3);
  note(s,'Household responsibilities changed to '+op+'.',ctx);return;
 }
 if(kind==='agreement'){
  h.agreement=op;
  ctx.bond(s,spouse,op==='shared'?5:1,'Discussed the terms of a shared household budget');
  note(s,op==='shared'?'Agreed on an optional contribution from actual partner savings.':'Household finances will remain independent.',ctx);
  return;
 }
 if(kind==='reserve'){
  const amount=Number(rest[0]);if(![500,1500].includes(amount))throw Error('Invalid reserve amount.');
  if(op==='deposit'){if(s.cash<amount)throw Error('Insufficient cash.');s.cash-=amount;h.emergency+=amount;}
  else if(op==='withdraw'){if(h.emergency<amount)throw Error('Insufficient reserve.');h.emergency-=amount;s.cash+=amount;}
  else throw Error('Invalid reserve transfer.');
  note(s,(op==='deposit'?'Set aside ':'Released ')+'$'+amount.toLocaleString('en-US')+(op==='deposit'?' for household emergencies.':' from protected reserves.'),ctx,'transfer');return;
 }
 if(kind==='education'){
  const personId=Number(rest[0]),amount=Number(rest[1]),child=livingChildren(s).find(p=>p.id===personId);
  if(!child||![500,1000,1500].includes(amount))throw Error('Invalid education fund.');
  h.education[personId]??=0;
  if(op==='deposit'){if(![500,1500].includes(amount)||s.cash<amount)throw Error('Insufficient education deposit.');s.cash-=amount;h.education[personId]+=amount;
    note(s,'Reserved $'+amount.toLocaleString('en-US')+" for "+child.name+"'s future education.",ctx,'transfer');}
  else if(op==='use'){if(amount!==1000||h.education[personId]<amount||h.lastSchool[personId]===s.age)throw Error('Education expense is unavailable.');
    h.education[personId]-=amount;h.lastSchool[personId]=s.age;const w=child.world;
    if(w){w.talent=clamp(w.talent+5);w.joy=clamp(w.joy+3);}
    ctx.bond(s,child,6,'Invested carefully in their education');
    const profile=s.familyStories?.members?.[String(child.id)];if(profile)profile.resilience=clamp(profile.resilience+4);
    note(s,'Spent $1,000 from '+child.name+"'s reserved education money on learning support.",ctx,'education');}
  else throw Error('Invalid education decision.');
  return;
 }
 if(kind==='mediate'){
  const ids=op.split('-').map(Number),key=ids.join('-');
  if(ids.length!==2||ids.some(id=>!Number.isInteger(id)))throw Error('Invalid sibling pair.');
  const link=s.familyStories?.siblingLinks?.[key];if(!link||link.rivalry<45)throw Error('No sibling dispute to mediate.');
  link.rivalry=clamp(link.rivalry-12);link.cooperation=clamp(link.cooperation+9);
  link.trust=clamp(link.trust+6);h.lastMediation[key]=s.age;
  const kids=ids.map(id=>livingChildren(s).find(p=>p.id===id));
  for(const child of kids){ctx.bond(s,child,4,'Worked through a sibling disagreement');if(child.world)child.world.rivalry=clamp(child.world.rivalry-4);}
  link.history.push({age:s.age,choice:'Family mediation',impact:8});link.history=link.history.slice(-8);
  note(s,'Mediated a family disagreement between '+kids.map(x=>x.name).join(' and ')+'.',ctx);return;
 }
 throw Error('Invalid household action.');
}
export function householdYear(s,ctx,baseExpenses){
 const h=s.household;if(!h||!s.alive||s.age<18)return {contribution:0,expenseChange:0,educationBoosts:0};
 let contribution=0,expenseChange=0,educationBoosts=0;
 const spouse=partner(s),children=livingChildren(s).filter(p=>p.age>=5&&p.age<=22);
 if(spouse&&h.agreement==='shared'&&spouse.world){
  // Transfer, not revenue: partner funds fall by exactly this amount.
  const w=spouse.world;contribution=Math.min(1600,Math.max(0,asMoney(w.cash)-1000));
  w.cash-=contribution;
  if(contribution>=400)ctx.bond(s,spouse,1,'Met the shared household budget promise');
 }
 if(h.priority==='saving'){
  expenseChange-=Math.round(baseExpenses*.07);ctx.change(s,'stress',1);
  if(spouse&&spouse.world?.personality==='Supportive'&&s.age%3===0)ctx.bond(s,spouse,-1,'A very tight budget cost some shared time');
 }else if(h.priority==='learning'&&children.length){
  const spend=Math.round(950*ctx.country(s).cost);
  for(const p of children){
   expenseChange+=spend;
   if(p.world){p.world.talent=clamp(p.world.talent+2);p.world.joy=clamp(p.world.joy+1);}
   const profile=s.familyStories?.members?.[String(p.id)];if(profile)profile.resilience=clamp(profile.resilience+1);
   educationBoosts++;
  }
 }else if(h.priority==='care'){
  expenseChange+=Math.round(650*ctx.country(s).cost);
  ctx.change(s,'stress',-2);
  if(spouse)ctx.bond(s,spouse,1,'Made more time and resources available for family care');
 }else if(h.priority==='balanced'&&spouse&&s.stats.stress<=55&&s.age%2===0){
  ctx.bond(s,spouse,1,'Protected time together in a balanced household');
 }
 if(spouse&&h.responsibility==='solo'){ctx.change(s,'stress',3);ctx.bond(s,spouse,1,'Handled household chores independently');}
 if(spouse&&h.responsibility==='outsource'){
  expenseChange+=Math.round(1100*ctx.country(s).cost);ctx.change(s,'stress',-3);
 }
 const statement={age:s.age,priority:h.priority,responsibility:h.responsibility,agreement:h.agreement,contribution,
  expenseChange,educationBoosts,emergency:h.emergency,educationFunds:totalEducation(h)};
 h.annual.push(statement);h.annual=h.annual.slice(-24);
 return statement;
}
export function householdSummary(s){
 const h=householdState(s),spouse=partner(s),children=livingChildren(s),funds=children.map(p=>({
  id:p.id,name:p.name,age:p.age,amount:asMoney(h.education[p.id]),talent:p.world?.talent||0,
  role:p.role
 }));
 const last=h.annual.at(-1)||null;
 return {priority:h.priority,responsibility:h.responsibility,agreement:h.agreement,
  emergency:h.emergency,educationTotal:totalEducation(h),protectedAssets:householdAssets(s),
  partner:spouse?{id:spouse.id,name:spouse.name,age:spouse.age,personality:spouse.world?.personality||'Supportive',
   trust:spouse.world?.trust||0,cash:asMoney(spouse.world?.cash)}:null,
  children:funds,last,annual:h.annual.slice(-6).reverse(),ledger:h.ledger.slice(-6).reverse(),
  history:h.history.slice(-6).reverse(),generationNotes:h.generationNotes.slice(-6).reverse()};
}
export function householdInheritance(next,old,child){
 const h=old.household;if(!h)return;
 const out=ensure(next);
 out.generationNotes=[...(h.generationNotes||[]),{from:old.name,age:old.age,priority:h.priority,
  responsibilities:h.responsibility,emergency:h.emergency,educationTotal:totalEducation(h),
  note:'A family budget shaped the opportunities and responsibilities passed to the next generation.'}].slice(-12);
 // The entire estate, including the parent's emergency reserve, has already been allocated in legacy().
 // Child-designated education funds are allocated separately by that same function.
 out.emergency=0;out.education={};out.ledger=[];out.annual=[];out.history=[];out.lastSchool={};out.lastMediation={};
 out.priority='balanced';out.responsibility='shared';out.agreement='independent';
}
export function householdInheritanceFunds(old,heirId){
 const h=old.household;if(!h)return {livingChildFunds:0,heirFund:0,siblings:{}};
 const valid=(old.people||[]).filter(p=>p.alive&&p.role==='child');
 const siblings=Object.fromEntries(valid.filter(p=>p.id!==heirId).map(p=>[p.id,asMoney(h.education?.[p.id])]));
 return {livingChildFunds:valid.reduce((sum,p)=>sum+asMoney(h.education?.[p.id]),0),
  heirFund:asMoney(h.education?.[heirId]),siblings};
}
