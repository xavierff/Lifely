// A family chronicle layered over the existing cast, household ledger and union records.
import {familyClock,familyRelated,syncPlayerKinship} from './persistent-society.mjs';
import {corporatePlayerValue} from './corporate-empires.mjs';
const cap=n=>Math.max(0,Math.min(100,Math.round(n))),cash=n=>Math.max(0,Math.round(n)),int=n=>Number.isSafeInteger(n)&&n>=0;
const state=s=>s.familyLife;
const blank=()=>({version:1,lastYear:null,courtships:[],serial:0,children:{},gatherings:[],tradition:null,traditionYears:0,lastGathering:null,lastAnniversary:null,plans:{},news:[],memories:[],scenes:[],goals:{reunions:0,childrenHelped:0,firmsContinued:0}});
const at=s=>familyClock(s);
const person=(s,id)=>s.people.find(p=>p.id===id);
const living=(s,id)=>s.people.find(p=>p.id===id&&p.alive);
const minor=p=>p.alive&&p.role==='child'&&p.age>=6&&p.age<18;
const partner=s=>s.people.find(p=>p.alive&&p.role==='partner'&&p.married);
const relatives=s=>s.people.filter(p=>p.alive&&['parent','grandparent','child','sibling','partner'].includes(p.role));
const firms=s=>(s.livingEconomy?.companies||[]).filter(c=>c.status==='active'&&c.playerOwned);
const pair=p=>p.ids.slice().sort((a,b)=>a-b).join(':');
const free=(s,p)=>p?.alive&&p.age>=22&&p.age<=65&&['friend','community','sibling','child','ex'].includes(p.role)&&!s.npcFamilies?.unions.some(u=>['married','player'].includes(u.status)&&u.adults.includes(p.id));
const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const fee=(s,ctx,n)=>cash(n*ctx.country(s).cost);
function note(s,q,text,ctx){q.news.push({year:at(s),text});q.news=q.news.slice(-30);ctx.add(s,text,'family');}
function memory(s,q,text){q.memories.push({year:at(s),text});q.memories=q.memories.slice(-30);}
const childProfile=p=>({personId:p.id,temperament:({Driven:'ambitious',Independent:'independent',Supportive:'empathetic',Cautious:'thoughtful'})[p.world?.personality]||'curious',confidence:50,independence:45,lastDecision:null,issue:null,resolved:0});
const issues=[
 {id:'school',title:'A difficult school year',prompt:'They are struggling with schoolwork and feel behind their classmates.',choices:[{id:'listen',label:'Ask how they want to approach it',confidence:8,independence:6,talent:2,bond:6},{id:'coach',label:'Work through a practical study plan',confidence:6,independence:2,talent:7,bond:4},{id:'space',label:'Give them room to find their own routine',confidence:2,independence:10,talent:1,bond:1}]},
 {id:'friends',title:'A friendship disagreement',prompt:'A friend has excluded them from a group and they want to talk about it.',choices:[{id:'listen',label:'Listen and help them name their feelings',confidence:9,independence:3,talent:0,bond:7},{id:'coach',label:'Practice ways to repair the friendship',confidence:6,independence:5,talent:2,bond:5},{id:'space',label:'Let them decide what happens next',confidence:3,independence:9,talent:0,bond:2}]},
 {id:'future',title:'An unexpected dream',prompt:'They have developed an interest that differs from your expectations.',choices:[{id:'listen',label:'Ask what excites them about it',confidence:8,independence:8,talent:1,bond:7},{id:'coach',label:'Help them make a practical learning plan',confidence:5,independence:3,talent:6,bond:4},{id:'space',label:'Let them explore at their own pace',confidence:4,independence:10,talent:1,bond:2}]}
];
const issue=id=>issues.find(i=>i.id===id);
const traditions=[['meal','Annual family meal'],['service','Community service'],['stories','Family storytelling']];
function finishCourtship(s,q,d,status,ctx){d.status=status;d.ended=at(s);note(s,q,d.names.join(' and ')+(status==='married'?' chose to marry.':' ended their courtship.'),ctx);}
export function familyLifeYear(s,ctx){
 if(!s.alive||s.age<18&&!state(s))return;
 const q=s.familyLife??=blank(),year=at(s);if(q.lastYear===year)return;q.lastYear=year;
 const roll=ctx.roll||((id,t)=>hash((s.lifeId||s.name)+':family-life:'+year+':'+id+':'+t));
 const world=s.npcFamilies;
 for(const d of q.courtships.filter(d=>['dating','engaged'].includes(d.status))){
  const [a,b]=d.ids.map(id=>living(s,id));
  if(!free(s,a)||!free(s,b)||familyRelated(s,a.id,b.id)){finishCourtship(s,q,d,'ended',ctx);continue;}
  d.affinity=cap(d.affinity+(roll(d.id,'affinity')<.65?5:-7));if(d.affinity<30||roll(d.id,'end')<.04){finishCourtship(s,q,d,'ended',ctx);continue;}
  if(d.status==='dating'&&year>d.started&&d.affinity>=60&&roll(d.id,'engagement')<.7){d.status='engaged';d.engaged=year;note(s,q,d.names.join(' and ')+' announced their engagement.',ctx);continue;}
  if(d.status==='engaged'&&year>d.engaged&&world&&world.unions.length<64&&roll(d.id,'wedding')<.8){
   const u={id:++world.serial,adults:d.ids.slice(),names:d.names.slice(),children:[],status:'married',startedAge:year,endedAge:null,lastChildAge:year,bond:d.affinity,lastChildCost:0};world.unions.push(u);world.news.push({age:year,kind:'wedding',unionId:u.id,text:d.names.join(' & ')+' got married after their engagement.',guests:[]});world.news=world.news.slice(-40);finishCourtship(s,q,d,'married',ctx);syncPlayerKinship(s);
  }
 }
 if(q.courtships.length<36&&world){const busy=new Set(q.courtships.filter(d=>['dating','engaged'].includes(d.status)).flatMap(d=>d.ids));const candidates=s.people.filter(p=>free(s,p)&&!busy.has(p.id)&&roll(p.id,'courtship')<.18);
  for(const a of candidates){const b=candidates.find(b=>b.id!==a.id&&Math.abs(b.age-a.age)<=12&&!familyRelated(s,a.id,b.id)&&(['friend','community'].includes(a.role)||['friend','community'].includes(b.role)));if(!b)continue;q.courtships.push({id:++q.serial,ids:[a.id,b.id],names:[a.name,b.name],status:'dating',started:year,engaged:null,ended:null,affinity:65});note(s,q,a.name+' and '+b.name+' started dating.',ctx);break;}
 }
 for(const p of s.people.filter(minor).slice(0,12)){
  const h=q.children[p.id]??=childProfile(p);
  if(h.issue?.status==='resolved'&&h.issue.due<=year){const r=h.issue,positive=r.choice!=='space'||h.temperament==='independent';h.confidence=cap(h.confidence+(positive?5:2));if(p.world)p.world.joy=cap(p.world.joy+(positive?4:2));memory(s,q,p.name+' remembered your support through '+issue(r.type).title.toLowerCase()+'.');h.issue=null;h.resolved++;}
  if(h.issue?.status==='open'&&h.issue.year<year)h.issue=null;
  if(!h.issue&&roll(p.id,'child-issue')<.3)h.issue={type:issues[Math.floor(roll(p.id,'issue-type')*issues.length)%issues.length].id,year,status:'open',choice:null,due:null};
 }
 for(const [id,h] of Object.entries(q.children))if(!living(s,Number(id)))delete q.children[id];else if(!minor(person(s,Number(id))))h.issue=null;
 if(q.tradition&&q.lastGathering===year-1)q.traditionYears++;
 for(const g of q.gatherings.filter(g=>g.due===year)){const guests=g.guests.map(id=>living(s,id)).filter(Boolean);for(const p of guests)ctx.bond(s,p,2,'Remembered the family gathering');memory(s,q,'The family remembered last year’s '+g.type+' gathering.');}
 for(const [id,heirId] of Object.entries(q.plans))if(!firms(s).some(c=>c.id===Number(id))||!living(s,heirId)||living(s,heirId).role!=='child')delete q.plans[id];
}
export function familyLifeCommands(s,ctx){
 const q=state(s);if(!q||!s.alive||s.age<18||s.justice?.years>0||s.justice?.case)return [];
 const out=[],a=s.actions>0,year=at(s),spouse=partner(s),family=relatives(s),put=(tag,label,detail,ok)=>out.push({id:'familylife:'+tag,label,detail,enabled:!!(a&&ok)});
 if(family.length>=2)for(const [id,label,n] of [['meal','Host family reunion',250],['outing','Plan a family outing',500],['quiet','Organize a quiet gathering',60]])put('gather:'+id,label,'$'+fee(s,ctx,n)+' · improve bonds and leave lasting memories',q.lastGathering!==year&&s.cash>=fee(s,ctx,n));
 for(const [id,label] of traditions)if(q.tradition!==id)put('tradition:'+id,'Establish '+label,'Carry a family tradition across generations',family.length>=1);
 if(spouse)for(const [id,label,n] of [['quiet','Celebrate your anniversary privately',50],['event','Host an anniversary celebration',400]])put('anniversary:'+id,label,'$'+fee(s,ctx,n)+' · mutual commitment',q.lastAnniversary!==year&&s.cash>=fee(s,ctx,n));
 for(const p of s.people.filter(minor).slice(0,12)){const h=q.children[p.id];if(h?.issue?.status==='open')for(const x of issue(h.issue.type).choices)put('child:'+p.id+':'+x.id,x.label+' · '+p.name,'Parenting choice; child retains their own goals',h.lastDecision!==year);}
 for(const c of firms(s))for(const p of family.filter(p=>p.role==='child'&&p.age>=18).slice(0,4))if(q.plans[c.id]!==p.id)put('succession:'+c.id+':'+p.id,'Plan '+p.name+' to continue '+c.name,'Retain operating firm if this heir has sufficient estate allocation',corporatePlayerValue(c)>0);
 for(const [id,heir] of Object.entries(q.plans))put('cancel:'+id,'Cancel company succession plan','Return to default estate liquidation',true);
 return out;
}
export function familyLifeAct(s,id,ctx){
 if(!familyLifeCommands({...s,actions:s.actions+1},ctx).some(x=>x.id===id&&x.enabled))throw Error('Family decision unavailable.');
 const [,tag,arg,extra]=id.split(':'),q=state(s),year=at(s);
 if(tag==='gather'){const guests=relatives(s).slice(0,8),amount=fee(s,ctx,{meal:250,outing:500,quiet:60}[arg]);ctx.spend(s,amount);for(const p of guests)ctx.bond(s,p,arg==='outing'?6:4,'Shared a family gathering');q.gatherings.push({year,type:arg,guests:guests.map(p=>p.id),cost:amount,due:year+1});q.gatherings=q.gatherings.slice(-20);q.lastGathering=year;q.goals.reunions++;ctx.change(s,'happiness',5);note(s,q,'Hosted a '+arg+' family gathering.',ctx);}
 if(tag==='tradition'){q.tradition=arg;note(s,q,'Established '+traditions.find(x=>x[0]===arg)[1].toLowerCase()+' as a family tradition.',ctx);}
 if(tag==='anniversary'){const p=partner(s);ctx.spend(s,fee(s,ctx,arg==='event'?400:50));ctx.bond(s,p,arg==='event'?7:5,'Celebrated our anniversary');q.lastAnniversary=year;memory(s,q,'Celebrated another anniversary with '+p.name+'.');ctx.change(s,'happiness',4);}
 if(tag==='child'){const p=living(s,Number(arg)),h=q.children[arg],x=issue(h.issue.type).choices.find(x=>x.id===extra);h.confidence=cap(h.confidence+x.confidence);h.independence=cap(h.independence+x.independence);if(p.world)p.world.talent=cap(p.world.talent+x.talent);ctx.bond(s,p,x.bond,'Listened and supported a childhood decision');h.lastDecision=year;h.issue.status='resolved';h.issue.choice=extra;h.issue.due=year+1;q.goals.childrenHelped++;note(s,q,p.name+' received support with '+issue(h.issue.type).title.toLowerCase()+'.',ctx);}
 if(tag==='succession'){q.plans[arg]=Number(extra);note(s,q,'Planned a future company succession for '+person(s,Number(extra)).name+'.',ctx);}
 if(tag==='cancel')delete q.plans[arg];
}
export function inheritFamilyLife(next,old){if(!state(old))return;const prev=state(old),q=blank();q.lastYear=at(old);q.tradition=prev.tradition;q.traditionYears=prev.traditionYears;q.memories=prev.memories.slice(-20);q.serial=prev.serial;q.courtships=prev.courtships.filter(d=>d.ids.every(id=>person(next,id))).map(d=>JSON.parse(JSON.stringify(d)));q.goals={...prev.goals};q.goals.firmsContinued+=firms(next).filter(c=>firms(old).some(o=>o.id===c.id)).length;next.familyLife=q;}
export function familyLifeView(s){const q=state(s)||blank(),family=relatives(s),spouse=partner(s);return {year:at(s),tradition:q.tradition?traditions.find(t=>t[0]===q.tradition)[1]:null,traditionYears:q.traditionYears,goals:q.goals,tree:family.map(p=>({id:p.id,name:p.name,role:p.role,age:p.age,bond:p.bond})),spouse:spouse?.name||null,children:Object.values(q.children).filter(h=>living(s,h.personId)).map(h=>({...h,name:person(s,h.personId).name,issue:h.issue?{...h.issue,...issue(h.issue.type)}:null})),courtships:q.courtships.slice(-8).reverse(),plans:Object.entries(q.plans).map(([id,heir])=>({id:Number(id),company:firms(s).find(c=>c.id===Number(id))?.name||'Former company',heir:person(s,heir)?.name||'Former heir'})),memories:q.memories.slice(-5).reverse(),news:q.news.slice(-5).reverse()};}
export function validateFamilyLife(s){
 const q=state(s);if(q===undefined)return true;const score=n=>int(n)&&n<=100;
 if(!q||q.version!==1||!(q.lastYear===null||int(q.lastYear))||!int(q.serial)||!Array.isArray(q.courtships)||q.courtships.length>36||!q.children||Object.keys(q.children).length>64||!Array.isArray(q.gatherings)||q.gatherings.length>20||!(q.tradition===null||traditions.some(t=>t[0]===q.tradition))||!int(q.traditionYears)||![q.lastGathering,q.lastAnniversary].every(n=>n===null||int(n))||!q.plans||!Array.isArray(q.news)||q.news.length>30||!Array.isArray(q.memories)||q.memories.length>30||!Array.isArray(q.scenes)||!q.goals||!['reunions','childrenHelped','firmsContinued'].every(k=>int(q.goals[k])))return false;
 const ids=new Set(),busy=new Set();for(const d of q.courtships){if(!d||!int(d.id)||d.id===0||d.id>q.serial||ids.has(d.id)||!Array.isArray(d.ids)||d.ids.length!==2||d.ids[0]===d.ids[1]||!d.ids.every(id=>person(s,id))||!Array.isArray(d.names)||d.names.length!==2||!d.names.every(n=>typeof n==='string')||!['dating','engaged','married','ended'].includes(d.status)||!int(d.started)||!(d.engaged===null||int(d.engaged))||!(d.ended===null||int(d.ended))||!score(d.affinity))return false;ids.add(d.id);if(['dating','engaged'].includes(d.status)){for(const id of d.ids){if(busy.has(id))return false;busy.add(id);}}}
 for(const [id,h] of Object.entries(q.children)){if(!h||Number(id)!==h.personId||!person(s,h.personId)||!['ambitious','independent','empathetic','thoughtful','curious'].includes(h.temperament)||!score(h.confidence)||!score(h.independence)||!int(h.resolved)||!(h.lastDecision===null||int(h.lastDecision)))return false;const i=h.issue;if(i&&(!issue(i.type)||!int(i.year)||!['open','resolved'].includes(i.status)||!(i.status==='open'?i.choice===null&&i.due===null:issue(i.type).choices.some(x=>x.id===i.choice)&&int(i.due))))return false;}
 return Object.entries(q.plans).every(([id,heir])=>int(Number(id))&&int(heir)&&!!person(s,heir))&&q.gatherings.every(g=>g&&int(g.year)&&['meal','outing','quiet'].includes(g.type)&&Array.isArray(g.guests)&&g.guests.length<=8&&g.guests.every(id=>int(id))&&int(g.cost)&&int(g.due))&&[...q.news,...q.memories].every(n=>n&&int(n.year)&&typeof n.text==='string');
}
