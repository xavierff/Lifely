import {corporateEquity,corporatePlayerValue,corporateRevenueFactor,corporateOverhead,corporatePrepare,corporatePayout,corporateClose,corporateSale,corporateView,corporateCleanup,validateCorporate} from './corporate-empires.mjs';
// Independent companies in the same cast. Family enterprises from 1.54 are distinct assets.
const MAX=20,MAX_STAFF=6;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const money=n=>Math.max(0,Math.round(n));
const id=n=>Number.isSafeInteger(n)&&n>0;
const copy=x=>JSON.parse(JSON.stringify(x));
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const sectors=[
 {id:'shop',name:'Commerce',industries:['Retail & administration','Service & hospitality'],capital:18000},
 {id:'studio',name:'Creative',industries:['Creative & media'],capital:12000},
 {id:'service',name:'Services',industries:['Trades & construction','Transport & logistics','Science & engineering'],capital:22000},
 {id:'technology',name:'Technology',industries:['Technology & data'],capital:40000},
 {id:'finance',name:'Finance',industries:['Finance & enterprise'],capital:30000}
];
const sectorOf=id=>sectors.find(s=>s.id===id);
const state=s=>s.livingEconomy;
const fresh=()=>({version:1,offset:0,lastYear:null,serial:0,companies:[],news:[],cycle:'stable',job:null});
const person=(s,id)=>s.people.find(p=>p.id===id);
const active=c=>c.status==='active';
const quote=corporateEquity;
const clock=s=>s.age+(state(s)?.offset||0);
const company=(s,id)=>state(s)?.companies.find(c=>c.id===id);
const vacancy=c=>Math.max(0,c.capacity-c.staff.length);
const roles=(c,careers)=>careers.filter(j=>sectorOf(c.sector).industries.includes(j.industry));
function news(s,q,year,c,text,ctx){q.news.push({year,companyId:c.id,text});q.news=q.news.slice(-40);if(c.playerOwned||q.job?.companyId===c.id||(person(s,c.ownerId)?.bond||0)>=65)ctx.add(s,text,'career');}
function employee(s,c,pid){return c.staff.find(x=>x.personId===pid);}
function occupied(q,pid){return q.companies.some(c=>active(c)&&employee(null,c,pid));}
function removeJob(s,q,c,ctx,reason){
 if(q.job?.companyId!==c.id)return;
 if(s.job?.companyId===c.id){s.job=null;ctx.add(s,reason,'career');}q.job=null;
}
function close(s,q,c,year,ctx,reason){for(const e of c.staff){const p=person(s,e.personId);if(p?.world?.job===e.jobId){p.world.job=null;p.world.level=0;}}c.status='closed';c.staff=[];c.cash=0;c.capital=0;c.lastProfit=0;corporateClose(c);removeJob(s,q,c,ctx,c.name+' closed; your position ended.');news(s,q,year,c,c.name+' '+reason+'.',ctx);}
function founder(s,q,ctx,roll,year){
 if(q.companies.length>=MAX)return;
 const cost=ctx.country(s).cost;
 const p=s.people.filter(p=>p.alive&&p.age>=25&&p.age<65&&p.world&&p.world.cash>=money(28000*cost)&&!q.companies.some(c=>active(c)&&c.ownerId===p.id)&&roll(p.id,'found')<.09).sort((a,b)=>a.id-b.id)[0];
 if(!p)return;
 const candidates=sectors.filter(k=>p.world.cash>=money(k.capital*cost*1.5));if(!candidates.length)return;
 const k=candidates.find(k=>k.industries.includes(ctx.careers[p.world.job]?.industry))||candidates[Math.floor(roll(p.id,'sector')*candidates.length)];
 const capital=money(k.capital*cost),cash=money(capital*.5);p.world.cash-=capital+cash;
 const c={id:++q.serial,name:p.name+' '+k.name+' Co.',sector:k.id,ownerId:p.id,playerOwned:false,status:'active',startedYear:year,capital,cash,capacity:2,staff:[],demand:60,reputation:55,lastProfit:0,lastPayroll:0,transfers:0,partnershipYear:null};
 q.companies.push(c);news(s,q,year,c,p.name+' founded '+c.name+'.',ctx);
}
export function economyYear(s,ctx){
 if(!s.alive||(s.age<18&&!state(s)))return;
 const q=s.livingEconomy??=fresh(),year=clock(s);if(q.lastYear===year)return;q.lastYear=year;
 const roll=ctx.roll||((i,t)=>hash((s.lifeId||s.name)+':economy:'+year+':'+i+':'+t));
 const cost=ctx.country(s).cost,salary=ctx.country(s).salary;
 q.cycle=s.market<.85?'recession':s.market>1.15?'expansion':'stable';
 if(q.job&&(!s.job||s.job.companyId!==q.job.companyId||!active(company(s,q.job.companyId)||{})))q.job=null;
 for(const c of q.companies){
  if(!active(c))continue;
  let owner=person(s,c.ownerId);
  if(!c.playerOwned&&!owner?.alive){
   const family=s.npcFamilies?.unions||[];
   const heirs=[...new Set(family.filter(u=>u.adults.includes(c.ownerId)).flatMap(u=>[...u.children,...(['married','player'].includes(u.status)?u.adults:[])]))].map(i=>person(s,i)).filter(p=>p?.alive&&p.age>=18&&p.id!==c.ownerId);
   if(heirs.length){owner=heirs.sort((a,b)=>b.age-a.age||a.id-b.id)[0];c.ownerId=owner.id;c.transfers++;news(s,q,year,c,owner.name+' inherited '+c.name+'.',ctx);}
   else{const buyer=s.people.filter(p=>p.alive&&p.age>=25&&p.world?.cash>=quote(c)&&p.id!==c.ownerId).sort((a,b)=>b.world.cash-a.world.cash)[0];if(buyer){buyer.world.cash-=quote(c);c.ownerId=buyer.id;owner=buyer;c.transfers++;news(s,q,year,c,buyer.name+' acquired '+c.name+' from its estate.',ctx);}else{close(s,q,c,year,ctx,'ceased trading after its owner died');continue;}}
  }
  c.staff=c.staff.filter(e=>{const p=person(s,e.personId);return p?.alive&&p.age<65&&p.world?.job===e.jobId;});
  corporatePrepare(s,c,roll);
  const competition=q.companies.filter(o=>o!==c&&active(o)&&o.sector===c.sector).length;
  c.demand=clamp(c.demand+Math.round((s.market-1)*18+(roll(c.id,'demand')-.46)*14-competition*.7),15,100);
  const playerHere=q.job?.companyId===c.id&&s.job?.companyId===c.id&&!ctx.inCustody;
  const playerPay=playerHere?money(ctx.careers[s.job.id].salary*salary*(1+s.job.level*.18)):0;
  const payroll=c.staff.reduce((n,e)=>{const w=person(s,e.personId).world;return n+money(ctx.careers[e.jobId].salary*salary*(1+w.level*.17));},playerPay);
  const revenue=money((c.capital*.75+(c.staff.length+(playerHere?1:0))*56000*salary)*(c.demand/65)*s.market*(.9+c.reputation/500)*corporateRevenueFactor(c));
  const overhead=money(c.capital*.12+3500*cost)+corporateOverhead(c)+(c.corporate?.interest||0),profit=revenue-payroll-overhead;
  c.lastPayroll=payroll;c.lastProfit=profit;
  c.cash+=profit;
  if(c.cash<0){const used=Math.min(c.capital,-c.cash);c.capital-=used;c.cash+=used;if(c.cash<0||c.capital<500){close(s,q,c,year,ctx,'went bankrupt');continue;}}
  if(profit<0){c.reputation=clamp(c.reputation-4,0,100);if(c.staff.length&&roll(c.id,'layoff')<.5){const e=c.staff.pop(),p=person(s,e.personId);if(p.world.job===e.jobId){p.world.job=null;p.world.level=0;}news(s,q,year,c,c.name+' laid off '+p.name+'.',ctx);}if(playerHere&&roll(c.id,'player-layoff')<.18)removeJob(s,q,c,ctx,c.name+' eliminated your position.');}
  else{c.reputation=clamp(c.reputation+2,0,100);const reserve=money(c.capital*.5);const payout=money(Math.max(0,c.cash-reserve)*.18);c.cash-=payout;corporatePayout(s,c,owner,payout);
   if(c.capacity<MAX_STAFF&&c.cash>c.capital&&roll(c.id,'expand')<.4){const invest=money(c.capital*.12);c.cash-=invest;c.capital+=invest;c.capacity++;}
   const candidates=s.people.filter(p=>p.alive&&p.age>=18&&p.age<65&&p.world&&p.world.job===null&&p.id!==c.ownerId&&!occupied(q,p.id)).sort((a,b)=>a.id-b.id);
   if(vacancy(c)>(playerHere?1:0)&&c.cash>=money(5000*cost)&&roll(c.id,'hire')<.6){for(const p of candidates){const j=roles(c,ctx.careers).find(j=>j.education<=p.world.education&&j.knowledge<=p.world.talent);if(!j)continue;p.world.job=j.id;p.world.level=0;c.staff.push({personId:p.id,jobId:j.id});news(s,q,year,c,c.name+' hired '+p.name+' as '+j.title+'.',ctx);break;}}
  }
 }
 founder(s,q,ctx,roll,year);corporateCleanup(s);
}
export function syncEconomyJob(s){const q=state(s);if(q?.job&&s.job?.companyId!==q.job.companyId)q.job=null;}
export function economyCompetition(s,sector){return (state(s)?.companies||[]).filter(c=>active(c)&&c.sector===sector&&!c.playerOwned).length;}
export function companySalary(s,careers,country){const q=state(s),c=company(s,q?.job?.companyId);return q?.job&&active(c||{})&&s.job?.companyId===c.id?money(careers[s.job.id].salary*country(s).salary*(1+s.job.level*.18)):null;}
export function economyWorth(s){return (state(s)?.companies||[]).filter(active).reduce((n,c)=>n+corporatePlayerValue(c),0);}
export function economyCommands(s,ctx){
 if(!s.alive||s.age<18||s.justice?.years>0||s.justice?.case)return [];
 const q=state(s);if(!q)return [];const out=[],a=s.actions>0;
 for(const c of q.companies.filter(active)){
  const owner=person(s,c.ownerId),canJob=!s.retired&&!s.business&&!s.profession&&!c.playerOwned&&vacancy(c)>0&&q.job?.companyId!==c.id;
  const choices=roles(c,ctx.careers).filter(j=>j.education<=s.education&&j.knowledge<=s.stats.knowledge).slice(0,3);
  for(const j of choices)out.push({id:'economy:apply:'+c.id+':'+j.id,label:'Join '+c.name+' · '+j.title,detail:'Real NPC employer · '+money(j.salary*ctx.country(s).salary).toLocaleString('en-US')+' annual base salary',enabled:a&&canJob});
  if(!c.playerOwned){out.push({id:'economy:buy:'+c.id,label:'Acquire '+c.name,detail:'Full ownership · $'+quote(c).toLocaleString('en-US'),enabled:a&&!!owner?.alive&&s.cash>=quote(c)&&quote(c)>0&&!c.corporate?.listed&&q.job?.companyId!==c.id});
   out.push({id:'economy:partner:'+c.id,label:'Propose business partnership',detail:'$'+money(1000*ctx.country(s).cost)+' · strengthen both businesses',enabled:a&&!!s.business&&!!owner?.alive&&c.partnershipYear!==clock(s)&&s.cash>=money(1000*ctx.country(s).cost)});
  }else out.push({id:'economy:sell:'+c.id,label:'Sell '+c.name,detail:'Sell to a qualified NPC buyer at current value',enabled:a&&!c.corporate?.listed&&s.people.some(p=>p.alive&&p.age>=25&&p.world?.cash>=quote(c))});
 }
 return out;
}
export function economyAct(s,command,ctx){
 const [_,action,cid,jid]=command.split(':'),q=state(s),c=company(s,Number(cid));
 if(!economyCommands({...s,actions:s.actions+1},ctx).some(x=>x.id===command&&x.enabled))throw Error('Company action unavailable.');
 if(action==='apply'){s.job={id:Number(jid),level:0,experience:0,companyId:c.id};q.job={companyId:c.id};s.stats.performance=55;ctx.add(s,'Joined '+c.name+'.','career');}
 if(action==='buy'){const price=quote(c);ctx.spend(s,price);person(s,c.ownerId).world.cash+=price;c.playerOwned=true;c.ownerId=null;c.transfers++;news(s,q,clock(s),c,'You acquired '+c.name+'.',ctx);}
 if(action==='sell'){const buyer=s.people.filter(p=>p.alive&&p.age>=25&&p.world?.cash>=quote(c)).sort((a,b)=>b.world.cash-a.world.cash||a.id-b.id)[0],price=quote(c);buyer.world.cash-=price;s.cash+=price;c.ownerId=buyer.id;c.playerOwned=false;c.transfers++;corporateSale(c);ctx.add(s,'Sold '+c.name+' to '+buyer.name+'.','finance');}
 if(action==='partner'){const fee=money(1000*ctx.country(s).cost);ctx.spend(s,fee);c.cash+=fee;c.demand=clamp(c.demand+5,15,100);s.business.demand=clamp((s.business.demand??60)+5,0,100);c.partnershipYear=clock(s);ctx.add(s,'Formed a commercial partnership with '+c.name+'.','finance');}
}
export function inheritEconomy(next,old,heir){
 if(!state(old))return;next.livingEconomy=copy(state(old));const q=state(next);q.offset=clock(old)-next.age;q.lastYear=clock(old);q.job=null;
 // Existing player estate already includes the company value. Convert inherited player firms to closed historical records.
 for(const c of q.companies){if(c.playerOwned){c.playerOwned=false;c.status='closed';c.capital=0;c.cash=0;c.staff=[];corporateClose(c);}if(c.corporate)c.corporate.stake=0;if(c.ownerId===heir.id&&active(c)){c.ownerId=null;c.playerOwned=true;}}
 const refs=new Set(q.companies.flatMap(c=>[c.ownerId,...c.staff.map(e=>e.personId)]).filter(x=>x!==null));
 const kept=new Map(next.people.map(p=>[p.id,p]));
 for(const p of old.people)if(refs.has(p.id)&&p.id!==heir.id&&!kept.has(p.id)&&!next.npcFamilies?.society?.identities.some(i=>i.id===p.id))kept.set(p.id,{...copy(p),role:'community',married:false});
 next.people=[...kept.values()];next.nextId=Math.max(old.nextId,next.nextId,...next.people.map(p=>p.id+1));
 for(const c of q.companies)c.staff=c.staff.filter(e=>e.personId!==heir.id&&kept.has(e.personId));corporateCleanup(next);
}
export function economyView(s,ctx){
 const q=state(s)||fresh();return {year:clock(s),cycle:q.cycle,worth:economyWorth(s),employer:company(s,q.job?.companyId)?.name||null,companies:q.companies.map(c=>({...c,corporate:corporateView(c),owner:c.playerOwned?'You':person(s,c.ownerId)?.name||'Former owner',value:quote(c),vacancies:Math.max(0,vacancy(c)-(q.job?.companyId===c.id?1:0)),staff:c.staff.map(e=>({...e,name:person(s,e.personId)?.name||'Former employee',title:ctx.careers[e.jobId]?.title||'Employee'}))})),news:q.news.slice(-8).reverse()};
}
export function validateEconomy(s,careers){
 const q=state(s);if(q===undefined)return true;
 const finite=n=>Number.isFinite(n)&&n>=0,integer=n=>Number.isSafeInteger(n)&&n>=0;
 if(!q||q.version!==1||!Number.isSafeInteger(q.offset)||clock(s)<0||!(q.lastYear===null||integer(q.lastYear))||!integer(q.serial)||!['stable','recession','expansion'].includes(q.cycle)||!Array.isArray(q.companies)||q.companies.length>MAX||!Array.isArray(q.news)||q.news.length>40)return false;
 const ids=new Set(),staff=new Set();for(const c of q.companies){if(!c||!id(c.id)||c.id>q.serial||ids.has(c.id)||typeof c.name!=='string'||!sectorOf(c.sector)||!['active','closed'].includes(c.status)||typeof c.playerOwned!=='boolean'||(c.playerOwned&&c.ownerId!==null)||(!c.playerOwned&&active(c)&&(!id(c.ownerId)||!person(s,c.ownerId)))||![c.cash,c.capital,c.lastPayroll].every(finite)||!Number.isFinite(c.lastProfit)||!integer(c.startedYear)||!integer(c.transfers)||!integer(c.capacity)||c.capacity<2||c.capacity>MAX_STAFF||!finite(c.demand)||c.demand>100||!finite(c.reputation)||c.reputation>100||!(c.partnershipYear===null||integer(c.partnershipYear))||!Array.isArray(c.staff)||c.staff.length>c.capacity||!validateCorporate(s,c))return false;ids.add(c.id);for(const e of c.staff){if(!e||!id(e.personId)||!person(s,e.personId)||staff.has(e.personId)||!careers[e.jobId])return false;staff.add(e.personId);}}
 return (q.job===null||q.job&&q.companies.some(c=>active(c)&&c.id===q.job.companyId)&&s.job?.companyId===q.job.companyId)&&q.news.every(n=>n&&integer(n.year)&&ids.has(n.companyId)&&typeof n.text==='string');
}
