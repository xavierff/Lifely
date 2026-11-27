// Luxury ownership and lifestyle are fictional, offline game systems.
const cap=n=>Math.max(0,Math.min(100,Math.round(n)));
const money=n=>Math.max(0,Math.round(n));
export const luxuryTypes=[
 {id:'mansion',name:'Private mansion',kind:'Residence',cost:2500000,rate:.025,upkeep:.016,joy:4,status:8},
 {id:'villa',name:'Coastal villa',kind:'Residence',cost:850000,rate:.018,upkeep:.022,joy:4,status:5},
 {id:'penthouse',name:'City penthouse',kind:'Residence',cost:1500000,rate:.02,upkeep:.018,joy:3,status:7},
 {id:'supercar',name:'Collector supercar',kind:'Transport',cost:220000,rate:-.09,upkeep:.04,joy:3,status:6},
 {id:'yacht',name:'Private yacht',kind:'Transport',cost:1800000,rate:-.07,upkeep:.08,joy:5,status:8},
 {id:'jet',name:'Private jet',kind:'Transport',cost:8500000,rate:-.08,upkeep:.09,joy:4,status:10},
 {id:'art',name:'Fine art collection',kind:'Collection',cost:140000,rate:.015,upkeep:.008,joy:2,status:5},
 {id:'watch',name:'Rare watch collection',kind:'Collection',cost:65000,rate:.01,upkeep:.006,joy:2,status:3},
 {id:'classic',name:'Classic car collection',kind:'Collection',cost:350000,rate:.012,upkeep:.025,joy:3,status:5}
];
const find=id=>luxuryTypes.find(x=>x.id===id);
const empty=()=>({version:1,holdings:[],renovations:[],club:null,lastEvent:null,history:[],legacy:[],serial:0,events:0,ownedEver:[],lastUpkeep:0});
const state=s=>s.luxury||empty(),ensure=s=>s.luxury??=empty();
const age=x=>Number.isInteger(x)&&x>=0&&x<=110,amount=x=>Number.isSafeInteger(x)&&x>=0;
const fmt=n=>'$'+Math.round(n).toLocaleString('en-US');
const price=(d,c)=>money(d.cost*c.cost);
export const luxuryWorth=s=>(s.luxury?.holdings||[]).reduce((n,x)=>n+x.value,0);
const ready=s=>s.alive&&s.age>=18&&s.pending===null&&!s.mini&&!s.world?.network?.conversation&&!s.everydayScenes?.active&&!s.careerCampaigns?.active&&!s.hobbyCircuit?.active&&!s.world?.storyDirector?.active&&s.fate?.active?.status!=='playing'&&s.familyStories?.active?.status!=='ready'&&s.workplace?.active?.status!=='ready'&&s.worldPulse?.active?.status!=='ready'&&!(s.justice?.years>0);
const homeIds=['apartment','house','rental','duplex','commercial'];
const events=[
 {id:'gallery',name:'Attend a private art auction',cost:2500,joy:4,rep:2},
 {id:'gala',name:'Host a private celebration',cost:12000,joy:6,rep:3},
 {id:'retreat',name:'Take a luxury retreat',cost:18000,joy:7,rep:1},
 {id:'benefit',name:'Attend a charitable benefit',cost:10000,joy:4,rep:5}
];
function log(s,kind,message,ctx){const m=ensure(s);m.history.push({id:++m.serial,age:s.age,kind,message:message.slice(0,200)});m.history=m.history.slice(-30);ctx.add(s,message,'finance');}
export function luxuryCommands(s,c){
 if(!ready(s))return [];
 const m=state(s),out=[],put=(id,label,detail,enabled=true)=>out.push({id:'luxury:'+id,label,detail,enabled:s.actions>0&&enabled});
 for(const d of luxuryTypes){
  const h=m.holdings.find(x=>x.id===d.id),cost=price(d,c);
  if(!h)put('buy:'+d.id,'Buy '+d.name,fmt(cost)+' · annual upkeep about '+fmt(cost*d.upkeep),s.cash>=cost);
  else{
   put('sell:'+d.id,'Sell '+d.name,'Net 92% of current value',true);
   put('service:'+d.id,'Maintain '+d.name,fmt(Math.max(500,money(cost*.015)))+' · restore condition',h.condition<95&&s.cash>=Math.max(500,money(cost*.015))&&h.lastService!==s.age);
  }
 }
 for(const p of s.properties.filter(p=>homeIds.includes(p.id)&&s.familyTransitions?.propertyCase?.propertyId!==p.id)){
  const r=m.renovations.find(x=>x.id===p.id),cost=Math.max(3000,money(p.value*.08));
  put('renovate:'+p.id,'Renovate '+p.id,fmt(cost)+' · improve property value and condition',s.cash>=cost&&r?.lastAge!==s.age);
 }
 if(!m.club)put('club:join','Join the private members club',fmt(25000)+' entry · $8,000 annual dues',s.cash>=25000&&s.stats.reputation>=65&&luxuryWorth(s)+s.cash>=250000);
 else put('club:leave','Leave the members club','Stop future membership dues');
 for(const e of events)put('event:'+e.id,e.name,fmt(e.cost)+' · one premium experience per year',s.cash>=e.cost&&m.lastEvent!==s.age&&(e.id==='retreat'||m.club!==null));
 return out;
}
export function luxuryAct(s,id,ctx,c){
 if(!luxuryCommands({...s,actions:s.actions+1},c).some(x=>x.id===id&&x.enabled))throw Error('Luxury activity unavailable.');
 const m=ensure(s),[,action,key]=id.split(':'),d=find(key),h=m.holdings.find(x=>x.id===key);
 if(action==='buy'){const cost=price(d,c);ctx.spend(s,cost);m.holdings.push({id:key,value:cost,condition:100,boughtAge:s.age,lastService:null});const first=!m.ownedEver.includes(key);if(first)m.ownedEver.push(key);ctx.change(s,'happiness',first?d.joy:1);if(first)ctx.change(s,'reputation',d.status);log(s,'purchase','Bought '+d.name+'.',ctx);}
 if(action==='sell'){const proceeds=money(h.value*.92);s.cash+=proceeds;m.holdings=m.holdings.filter(x=>x.id!==key);log(s,'sale','Sold '+d.name+' for '+fmt(proceeds)+'.',ctx);}
 if(action==='service'){ctx.spend(s,Math.max(500,money(price(d,c)*.015)));h.condition=cap(h.condition+25);h.lastService=s.age;log(s,'service','Maintained '+d.name+'.',ctx);}
 if(action==='renovate'){
  const p=s.properties.find(p=>p.id===key),cost=Math.max(3000,money(p.value*.08));ctx.spend(s,cost);p.value+=money(cost*.72);if(p.rental)p.rental.condition=cap(p.rental.condition+18);
  let r=m.renovations.find(x=>x.id===key);if(!r){r={id:key,lastAge:s.age,count:0,spent:0};m.renovations.push(r);}r.lastAge=s.age;r.count++;r.spent+=cost;
  ctx.change(s,'happiness',2);log(s,'renovation','Renovated '+key+'; the improvement added value without recovering the full cost.',ctx);
 }
 if(action==='club'){if(key==='join'){ctx.spend(s,25000);m.club={joinedAge:s.age};log(s,'club','Joined the private members club.',ctx);}else{m.club=null;log(s,'club','Left the private members club.',ctx);}}
 if(action==='event'){
  const e=events.find(x=>x.id===key);ctx.spend(s,e.cost);m.lastEvent=s.age;m.events++;ctx.change(s,'happiness',e.joy);ctx.change(s,'reputation',e.rep);ctx.change(s,'social',3);
  const p=(s.people||[]).filter(p=>p.alive&&p.age>=18&&['partner','friend','sibling'].includes(p.role)).sort((a,b)=>b.bond-a.bond||a.id-b.id)[0];
  if(p)ctx.bond(s,p,3,'Shared a memorable lifestyle experience');
  log(s,'event',e.name+(p?' with '+p.name:'')+'.',ctx);
 }
}
export function luxuryYear(s,ctx,c){
 const m=s.luxury;if(!m)return 0;
 let upkeep=m.club?8000:0;
 for(const h of m.holdings){
  const d=find(h.id);h.condition=cap(h.condition-5);const market=Math.max(.65,Math.min(1.35,s.market||1));
  h.value=money(h.value*(1+d.rate+(market-1)*.10-(h.condition<55?.04:0)));upkeep+=money(price(d,c)*d.upkeep);
 }
 m.lastUpkeep=upkeep;
 if(m.holdings.length&&s.cash<upkeep&&s.debt>0)ctx.change(s,'stress',3);
 return upkeep;
}
export function luxuryView(s,c){
 const m=state(s);return {value:luxuryWorth(s),upkeep:m.holdings.reduce((n,h)=>n+money(price(find(h.id),c)*find(h.id).upkeep),m.club?8000:0),
 holdings:m.holdings.map(h=>({...h,name:find(h.id).name,kind:find(h.id).kind})),club:m.club,events:m.events,ownedEver:m.ownedEver.length,renovations:m.renovations.slice(),history:m.history.slice(-5).reverse(),legacy:m.legacy.slice(-4).reverse()};
}
export function luxuryInheritance(next,old){
 if(!old.luxury)return;next.luxury={...empty(),legacy:[...old.luxury.legacy,...old.luxury.history.filter(x=>['purchase','event','renovation'].includes(x.kind)).slice(-6).map(x=>({...x,ancestor:old.name,generation:old.generation}))].slice(-18)};
}
export function validateLuxury(m){
 if(m===undefined)return true;
 const hist=x=>x&&Number.isInteger(x.id)&&x.id>0&&age(x.age)&&['purchase','sale','service','renovation','club','event'].includes(x.kind)&&typeof x.message==='string'&&x.message.length<=200;
 return !!m&&m.version===1&&amount(m.serial)&&amount(m.events)&&amount(m.lastUpkeep)&&(m.lastEvent===null||age(m.lastEvent))&&(m.club===null||m.club&&age(m.club.joinedAge))&&Array.isArray(m.holdings)&&m.holdings.length<=luxuryTypes.length&&m.holdings.every(h=>h&&!!find(h.id)&&amount(h.value)&&Number.isInteger(h.condition)&&h.condition>=0&&h.condition<=100&&age(h.boughtAge)&&(h.lastService===null||age(h.lastService)))&&new Set(m.holdings.map(h=>h.id)).size===m.holdings.length&&Array.isArray(m.ownedEver)&&m.ownedEver.every(id=>!!find(id))&&new Set(m.ownedEver).size===m.ownedEver.length&&Array.isArray(m.renovations)&&m.renovations.length<=homeIds.length&&m.renovations.every(r=>r&&homeIds.includes(r.id)&&age(r.lastAge)&&amount(r.count)&&amount(r.spent))&&new Set(m.renovations.map(r=>r.id)).size===m.renovations.length&&Array.isArray(m.history)&&m.history.length<=30&&m.history.every(hist)&&Array.isArray(m.legacy)&&m.legacy.length<=18&&m.legacy.every(x=>hist(x)&&typeof x.ancestor==='string'&&Number.isInteger(x.generation)&&x.generation>=1);
}
